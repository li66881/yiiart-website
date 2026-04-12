import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';
import { sampleArtists, sampleArtworks } from '@/lib/sanity-seed-data';

// Seed API - creates sample artists and artworks in Sanity CMS
// Protected by a simple secret token

const SEED_SECRET = process.env.SEED_SECRET || 'yiiart-seed-secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Simple token auth
    if (body.token !== SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zlh03v8i',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    });

    // Create artists first, get their IDs
    const artistIds: string[] = [];
    const artistResults: { slug: string; id: string }[] = [];

    for (const artist of sampleArtists) {
      try {
        const result = await client.create({
          ...artist,
        });
        artistIds.push(result._id);
        artistResults.push({ slug: (artist.slug as any).current, id: result._id });
        console.log('Created artist:', (artist.name as any).zh, result._id);
      } catch (err: any) {
        // If artist already exists (slug conflict), fetch existing
        if (err?.message?.includes('duplicate') || err?.statusCode === 409) {
          const existing = await client.fetch(
            `*[_type == "artist" && slug.current == $slug][0]{_id}`,
            { slug: (artist.slug as any).current }
          );
          if (existing) {
            artistIds.push(existing._id);
            artistResults.push({ slug: (artist.slug as any).current, id: existing._id });
          }
        } else {
          console.error('Artist create error:', err?.message);
        }
      }
    }

    // Create artworks with correct artist references
    const artworkResults: string[] = [];

    // Map artist IDs to the artworks (in order)
    const artworksWithRefs = sampleArtworks.map((artwork, i) => ({
      ...artwork,
      artist: artistIds[i % artistIds.length]
        ? { _type: 'reference', _ref: artistIds[i % artistIds.length] }
        : undefined,
    }));

    for (const artwork of artworksWithRefs) {
      try {
        const result = await client.create({
          ...artwork,
        });
        artworkResults.push(result._id);
        console.log('Created artwork:', (artwork.title as any).zh, result._id);
      } catch (err: any) {
        if (err?.message?.includes('duplicate') || err?.statusCode === 409) {
          console.log('Artwork already exists, skipping:', (artwork.title as any).zh);
        } else {
          console.error('Artwork create error:', err?.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${artistIds.length} artists and ${artworkResults.length} artworks`,
      artists: artistResults,
      artworks: artworkResults.length,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seed failed', details: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check if Sanity is accessible
  try {
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zlh03v8i',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: true,
    });
    const artists = await client.fetch(`count(*[_type == "artist"])`);
    const artworks = await client.fetch(`count(*[_type == "artwork"])`);
    return NextResponse.json({
      sanity: 'connected',
      artists,
      artworks,
      seedSecret: SEED_SECRET,
    });
  } catch (error: any) {
    return NextResponse.json({
      sanity: 'error',
      error: error?.message,
    });
  }
}
