import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#000',
          color: '#fff',
          display: 'flex',
          fontSize: 17,
          fontWeight: 900,
          height: '100%',
          justifyContent: 'center',
          letterSpacing: '-0.14em',
          paddingRight: 2,
          width: '100%',
        }}
      >
        ML
      </div>
    ),
    size,
  );
}
