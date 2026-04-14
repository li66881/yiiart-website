import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const ADMIN_PASSWORD = 'yiiart-admin-2026';

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

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    if (!nameZh) {
      return NextResponse.json({ success: false, error: '艺术家名称（中文）不能为空' }, { status: 400 });
    }

    const slug = 'huang-liang-' + Date.now();

    const artistDoc = {
      _type: 'artist',
      _id: 'artist-huang-liang-' + Date.now(),
      name: { zh: nameZh, en: nameEn || '' },
      slug: { _type: 'slug', current: slug },
      location: location || '',
      bio: { zh: bioZh || '', en: bioEn || '' },
      style: style ? style.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      featured: false,
    };

    const result = await client.create(artistDoc);

    return NextResponse.json({
      success: true,
      id: result._id,
      slug: slug,
      message: '艺术家创建成功',
    });
  } catch (err: any) {
    console.error('Create artist error:', err);
    return NextResponse.json({
      success: false,
      error: err?.message || '创建失败',
    }, { status: 500 });
  }
}
