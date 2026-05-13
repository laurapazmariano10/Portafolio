import BlogSection from '@/components/BlogSection';
import { Navbar } from '@/components/navbar';
import { FooterOnly } from '@/components/ContactAndFooter';

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <BlogSection />
      </div>
      <FooterOnly />
    </main>
  );
}
