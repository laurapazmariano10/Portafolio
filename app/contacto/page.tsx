import { ContactAndFooter } from '@/components/ContactAndFooter';
import { Navbar } from '@/components/navbar';

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-white pt-24 md:pt-32">
      <Navbar />
      <ContactAndFooter />
    </main>
  );
}
