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

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>创建艺术家 - Admin</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; }
  h1 { color: #1f2937; font-size: 24px; }
  .card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 16px 0; }
  .form-group { margin-bottom: 16px; }
  label { display: block; font-weight: 600; font-size: 14px; color: #374151; margin-bottom: 6px; }
  input, textarea { width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
  input:focus, textarea:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249,115,22,0.1); }
  textarea { resize: vertical; min-height: 80px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .btn { background: #f97316; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; width: 100%; }
  .btn:disabled { background: #d1d5db; cursor: not-allowed; }
  .msg { padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-size: 14px; }
  .msg.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
  .msg.success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
</style>
</head>
<body>
<div class="container">
  <h1>🎨 艺术家管理</h1>
  <div class="info">
    <b>提示：</b>这个页面用于在 Sanity 中创建艺术家黄亮的档案。
  </div>

  <div class="card">
    <h3 style="margin-top:0">创建艺术家：黄亮</h3>
    <form id="form">
      <div class="row">
        <div class="form-group">
          <label>艺术家名称（中文）*</label>
          <input type="text" id="nameZh" value="黄亮" required>
        </div>
        <div class="form-group">
          <label>艺术家名称（英文）</label>
          <input type="text" id="nameEn" value="Huang Liang">
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>所在地</label>
          <input type="text" id="location" value="北京">
        </div>
        <div class="form-group">
          <label>风格（逗号分隔）</label>
          <input type="text" id="style" value="手绘, 油画, 水彩">
        </div>
      </div>
      <div class="form-group">
        <label>简介（中文）</label>
        <textarea id="bioZh">中国当代艺术家，专注于手绘创作，作品涵盖油画、水彩、素描等多种媒介。</textarea>
      </div>
      <div class="form-group">
        <label>简介（英文）</label>
        <textarea id="bioEn">Contemporary Chinese artist specializing in hand-drawn works across oil painting, watercolor, and sketching.</textarea>
      </div>
      <div class="form-group">
        <label>管理员密码</label>
        <input type="password" id="password" placeholder="请输入管理员密码" required>
      </div>
      <button type="submit" class="btn" id="submitBtn">创建艺术家</button>
    </form>
    <div id="result"></div>
  </div>
</div>

<script>
document.getElementById('form').onsubmit = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('submitBtn');
  const result = document.getElementById('result');
  result.innerHTML = '';
  btn.disabled = true;
  btn.textContent = '创建中...';

  const payload = {
    nameZh: document.getElementById('nameZh').value.trim(),
    nameEn: document.getElementById('nameEn').value.trim(),
    location: document.getElementById('location').value.trim(),
    style: document.getElementById('style').value.trim(),
    bioZh: document.getElementById('bioZh').value.trim(),
    bioEn: document.getElementById('bioEn').value.trim(),
    password: document.getElementById('password').value,
  };

  if (!payload.nameZh) {
    showError('请输入艺术家名称（中文）');
    return;
  }

  try {
    const res = await fetch('/api/admin/create-artist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showSuccess('✅ 艺术家「' + payload.nameZh + '」创建成功！<br>Slug: <code>' + data.slug + '</code><br>ID: <code>' + data.id + '</code>');
    } else {
      showError('错误：' + (data.error || '未知错误'));
    }
  } catch(err) {
    showError('网络错误：' + err.message);
  }

  btn.disabled = false;
  btn.textContent = '创建艺术家';
};

function showError(msg) {
  var r = document.getElementById('result');
  r.innerHTML = '<div class=\"msg error\">' + msg + '</div>';
  var b = document.getElementById('submitBtn');
  b.disabled = false;
  b.textContent = '创建艺术家';
}
function showSuccess(msg) {
  document.getElementById('result').innerHTML = '<div class=\"msg success\">' + msg + '</div>';
}
</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

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
