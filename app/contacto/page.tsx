import type { Metadata } from 'next';
import { ContactAndFooter } from '@/components/ContactAndFooter';
import { Navbar } from '@/components/navbar';

export const metadata: Metadata = {
  title: 'Contacto | Mariano Laura',
  description: 'Contacta con Mariano Laura para diseñar y desarrollar experiencias digitales, sitios web, UI/UX y software a medida.',
};

export default function ContactoPage() {
  return (
    <main className="min-h-screen bg-white pt-24 md:pt-32">
      <Navbar />
      <ContactAndFooter />
    </main>
  );
}
