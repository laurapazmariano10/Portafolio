import type { Metadata } from 'next';
import BlogSection from '@/components/BlogSection';
import { Navbar } from '@/components/navbar';
import { FooterOnly } from '@/components/ContactAndFooter';

export const metadata: Metadata = {
  title: 'Blog | Mariano Laura',
  description: 'Ideas, perspectivas y recursos sobre tecnología, diseño digital, inteligencia artificial y desarrollo web.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-8 md:pt-12 lg:pt-20">
        <BlogSection />
      </div>
      <FooterOnly />
    </main>
  );
}
