'use client';

import { useState } from 'react';

type Result = {
  type: 'success' | 'error';
  msg: string;
};

export default function ArtistNewPage() {
  const [nameZh, setNameZh] = useState('黄亮');
  const [nameEn, setNameEn] = useState('Huang Liang');
  const [location, setLocation] = useState('北京');
  const [style, setStyle] = useState('手绘, 油画, 水彩');
  const [bioZh, setBioZh] = useState(
    '中国当代艺术家，专注于手绘创作，作品涵盖油画、水彩、素描等多种媒介。'
  );
  const [bioEn, setBioEn] = useState(
    'Contemporary Chinese artist specializing in hand-drawn works across oil painting, watercolor, and sketching.'
  );
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setResult({
          type: 'success',
          msg: `Artist "${nameZh}" was created. Slug: ${data.slug}`,
        });
        setPassword('');
      } else {
        setResult({ type: 'error', msg: data.error || 'Unable to create artist.' });
      }
    } catch (err) {
      setResult({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Network error. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Artist Admin</h1>
      <p style={{ margin: '0 0 20px', color: '#4b5563', fontSize: 14 }}>
        Create an artist profile in Sanity. The admin password is configured privately in Vercel as
        <code style={{ marginLeft: 4 }}>ADMIN_PASSWORD</code>.
      </p>

      <section style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Chinese name">
              <input value={nameZh} onChange={(e) => setNameZh(e.target.value)} required style={inputStyle} />
            </Field>
            <Field label="English name">
              <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <Field label="Location">
              <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Styles, separated by commas">
              <input value={style} onChange={(e) => setStyle(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Chinese bio">
            <textarea value={bioZh} onChange={(e) => setBioZh(e.target.value)} rows={3} style={textareaStyle} />
          </Field>

          <Field label="English bio">
            <textarea value={bioEn} onChange={(e) => setBioEn(e.target.value)} rows={3} style={textareaStyle} />
          </Field>

          <Field label="Admin password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={inputStyle}
            />
          </Field>

          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? 'Creating...' : 'Create artist'}
          </button>
        </form>

        {result && <div style={resultStyle(result.type)}>{result.msg}</div>}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
      <span style={{ display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
};

function buttonStyle(loading: boolean): React.CSSProperties {
  return {
    background: loading ? '#d1d5db' : '#111827',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: 15,
    fontWeight: 600,
    width: '100%',
  };
}

function resultStyle(type: Result['type']): React.CSSProperties {
  const success = type === 'success';
  return {
    marginTop: 16,
    padding: '12px 16px',
    borderRadius: 8,
    background: success ? '#f0fdf4' : '#fef2f2',
    color: success ? '#166534' : '#991b1b',
    border: `1px solid ${success ? '#bbf7d0' : '#fecaca'}`,
  };
}
