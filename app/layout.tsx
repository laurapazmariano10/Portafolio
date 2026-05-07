import type { Metadata } from 'next';
import { Antonio, Bricolage_Grotesque, Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-editorial',
});

const antonio = Antonio({
  subsets: ['latin'],
  variable: '--font-antonio',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${bricolage.variable} ${antonio.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#FFFFFF]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
