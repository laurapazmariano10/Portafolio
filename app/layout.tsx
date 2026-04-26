import type { Metadata } from 'next';
import { Inter, Oswald, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-display',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Mariano Laura | Digital Designer',
  description: 'US-based digital designer and Framer developer portfolio.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-[#FFFFFF]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
