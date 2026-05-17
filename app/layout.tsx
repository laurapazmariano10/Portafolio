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
  metadataBase: new URL('https://marianolaura.engineer'),
  title: {
    default: 'Mariano Laura | Diseñador y Desarrollador Digital',
    template: '%s | Mariano Laura',
  },
  description: 'Portafolio de Mariano Laura. Diseño y desarrollo de experiencias digitales, sitios web, UI/UX, 3D interactivo y software a medida.',
  keywords: ['Mariano Laura', 'portafolio', 'diseñador digital', 'desarrollador web', 'UI/UX', 'Next.js', 'WebGL', 'Three.js'],
  authors: [{ name: 'Mariano Laura' }],
  creator: 'Mariano Laura',
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    title: 'Mariano Laura | Diseñador y Desarrollador Digital',
    description: 'Diseño y desarrollo de experiencias digitales, sitios web, UI/UX, 3D interactivo y software a medida.',
    siteName: 'Mariano Laura',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mariano Laura | Diseñador y Desarrollador Digital',
    description: 'Diseño y desarrollo de experiencias digitales, sitios web, UI/UX, 3D interactivo y software a medida.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${bricolage.variable} ${antonio.variable}`} suppressHydrationWarning>
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
