'use client';

import { useState } from 'react';

const ADMIN_PASSWORD = 'yiiart-admin-2026';

export default function ArtistNewPage() {
  const [nameZh, setNameZh] = useState('黄亮');
  const [nameEn, setNameEn] = useState('Huang Liang');
  const [location, setLocation] = useState('北京');
  const [style, setStyle] = useState('手绘, 油画, 水彩');
  const [bioZh, setBioZh] = useState('中国当代艺术家，专注于手绘创作，作品涵盖油画、水彩、素描等多种媒介。');
  const [bioEn, setBioEn] = useState('Contemporary Chinese artist specializing in hand-drawn works across oil painting, watercolor, and sketching.');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      setResult({ type: 'error', msg: '密码错误' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/create-artist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameZh, nameEn, location, style, bioZh, bioEn, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ type: 'success', msg: `✅ 艺术家「${nameZh}」创建成功！Slug: ${data.slug} | ID: ${data.id}` });
      } else {
        setResult({ type: 'error', msg: '错误：' + (data.error || '未知错误') });
      }
    } catch (err: any) {
      setResult({ type: 'error', msg: '网络错误：' + err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>🎨 艺术家管理</h1>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
        在 Sanity 中创建艺术家档案。密码：<code>yiiart-admin-2026</code>
      </div>
      <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>创建艺术家：黄亮</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>艺术家名称（中文）*</label>
              <input type="text" value={nameZh} onChange={e => setNameZh(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>艺术家名称（英文）</label>
              <input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>所在地</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>风格（逗号分隔）</label>
              <input type="text" value={style} onChange={e => setStyle(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>简介（中文）</label>
            <textarea value={bioZh} onChange={e => setBioZh(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>简介（英文）</label>
            <textarea value={bioEn} onChange={e => setBioEn(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>管理员密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入管理员密码" required style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: loading ? '#d1d5db' : '#f97316', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 600, width: '100%' }}>
            {loading ? '创建中...' : '创建艺术家'}
          </button>
        </form>
        {result && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 8, background: result.type === 'success' ? '#f0fdf4' : '#fef2f2', color: result.type === 'success' ? '#166534' : '#991b1b', border: '1px solid ' + (result.type === 'success' ? '#bbf7d0' : '#fecaca') }}>
            {result.msg}
          </div>
        )}
      </div>
    </div>
  );
}
