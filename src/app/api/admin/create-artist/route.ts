import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'zlh03v8i',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nameZh, nameEn, location, style, bioZh, bioEn, password } = body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || !process.env.SANITY_WRITE_TOKEN) {
      return NextResponse.json(
        { success: false, error: 'Admin publishing is not configured.' },
        { status: 503 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Invalid admin password.' }, { status: 401 });
    }

    if (!nameZh || typeof nameZh !== 'string') {
      return NextResponse.json({ success: false, error: 'Chinese artist name is required.' }, { status: 400 });
    }

    const slug = createSlug(nameEn || nameZh);
    const artistDoc = {
      _type: 'artist',
      _id: `artist-${slug}-${Date.now()}`,
      name: { zh: nameZh, en: nameEn || '' },
      slug: { _type: 'slug', current: slug },
      location: location || '',
      bio: { zh: bioZh || '', en: bioEn || '' },
      style: style
        ? String(style)
            .replace(/\uFF0C/g, ',')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      featured: false,
    };

    const result = await client.create(artistDoc);

    return NextResponse.json({
      success: true,
      id: result._id,
      slug,
      message: 'Artist created successfully.',
    });
  } catch (err: any) {
    console.error('Create artist error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Create failed.' },
      { status: 500 }
    );
  }
}

function createSlug(value: string) {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `artist-${Date.now()}`;
}
