import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
          color: 'white',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 300, marginBottom: 20 }}>YiiArt</div>
        <div style={{ fontSize: 28, color: '#9ca3af', marginBottom: 30 }}>
          Original Art for Your Home
        </div>
        <div style={{ width: 200, height: 1, backgroundColor: '#4b5563', marginBottom: 30 }} />
        <div style={{ fontSize: 18, color: '#6b7280' }}>
          Hand-painted artworks shipped worldwide
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
