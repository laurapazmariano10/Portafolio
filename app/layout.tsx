import type { Metadata } from 'next';
import { Antonio, Bricolage_Grotesque, Inter, Playfair_Display } from 'next/font/google';
import { CustomScrollbar } from '@/components/CustomScrollbar';
import { NavigationWarmup } from '@/components/NavigationWarmup';
import { PageTransitionLoader } from '@/components/PageTransitionLoader';
import { ProjectRouteTransitionOverlay } from '@/components/projects/ProjectRouteTransitionOverlay';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-editorial',
  display: 'swap',
});

const antonio = Antonio({
  subsets: ['latin'],
  variable: '--font-antonio',
  display: 'swap',
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
        <NavigationWarmup />
        <PageTransitionLoader />
        <ProjectRouteTransitionOverlay />
        <CustomScrollbar />
      </body>
    </html>
  );
}
