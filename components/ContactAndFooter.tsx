'use client';

import { type FormEvent } from 'react';
import Image from 'next/image';
import { Hand } from 'lucide-react';
import SignatureSVG from '@/components/SignatureSVG';

const WHATSAPP_NUMBER = '51925685323';
const SERVICE_OPTIONS = [
  'Diseño web',
  'UI / UX',
  'Branding',
  'Software a medida',
  'Contenido digital',
];

function buildWhatsAppMessage(form: HTMLFormElement) {
  const formData = new FormData(form);
  const name = String(formData.get('name') ?? '').trim();
  const service = String(formData.get('service') ?? '').trim();
  const message = String(formData.get('message') ?? '').trim();

  return encodeURIComponent(
    [
      `Hola Mariano, quiero consultar sobre ${service || 'un proyecto'}.`,
      '',
      `Nombres: ${name || 'No especificado'}`,
      `Servicio que necesito: ${service || 'No especificado'}`,
      `Mensaje: ${message || 'No especificado'}`,
    ].join('\n'),
  );
}

export function ContactAndFooter() {
  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const whatsappMessage = buildWhatsAppMessage(event.currentTarget);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <section id="contact" className="mx-auto grid max-w-[1120px] gap-14 bg-white px-6 py-24 md:px-10 md:py-28 lg:grid-cols-[360px_560px] lg:items-center lg:justify-between lg:px-0">
        <div className="relative aspect-[320/448] w-full max-w-[320px] justify-self-center overflow-visible rounded-[28px] bg-[#ededed] shadow-[0_24px_70px_rgba(48,48,48,0.12)] lg:justify-self-start">
          <div className="h-full w-full overflow-hidden rounded-[28px]">
            <Image src="/Persona.webp" alt="Mariano Laura" width={320} height={448} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-7 left-4 grid h-20 w-20 place-items-center rounded-full bg-[#6872F2] text-white shadow-[0_22px_58px_rgba(104,114,242,0.24)] md:-bottom-9 md:-left-9 md:h-28 md:w-28">
            <Hand className="h-9 w-9 animate-wave-hand md:h-12 md:w-12" strokeWidth={2.2} />
          </div>
        </div>

        <div className="w-full max-w-[560px]">
          <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3rem,5vw,3.75rem)] font-bold uppercase leading-[1.3] tracking-normal text-[#303030]">
            Cuéntame tu idea
          </h2>
          <p className="body-medium mt-7 max-w-[520px] text-[#303030]/64">
            Escríbeme qué necesitas y te responderé con una ruta clara para convertirlo en una experiencia digital bien ejecutada.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleContactSubmit}>
            <label className="block">
              <span className="body-small-bold mb-3 block text-[#6872F2]">Nombres</span>
              <input name="name" className="body-medium h-14 w-full rounded-full bg-[#f3f3f4] px-6 text-[#303030] outline-none placeholder:text-[#303030]/28 focus:ring-2 focus:ring-[#6872F2]/35" />
            </label>

            <label className="block">
              <span className="body-small-bold mb-3 block text-[#6872F2]">¿Qué servicios necesitas?</span>
              <input name="service" list="contact-service-options" className="body-medium h-14 w-full rounded-full bg-[#f3f3f4] px-6 text-[#303030] outline-none placeholder:text-[#303030]/28 focus:ring-2 focus:ring-[#6872F2]/35" />
              <datalist id="contact-service-options">
                {SERVICE_OPTIONS.map((service) => (
                  <option key={service} value={service} />
                ))}
              </datalist>
            </label>

            <label className="block">
              <span className="body-small-bold mb-3 block text-[#6872F2]">¿En qué puedo ayudarte?</span>
              <textarea name="message" className="body-medium min-h-[150px] w-full resize-y rounded-[24px] bg-[#f3f3f4] px-6 py-5 text-[#303030] outline-none placeholder:text-[#303030]/28 focus:ring-2 focus:ring-[#6872F2]/35" />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#6872F2] px-6 py-3 text-center text-base font-bold uppercase leading-tight tracking-normal text-white transition-all duration-300 hover:bg-[#5963e8] sm:w-auto sm:px-9 sm:text-lg">
                Enviar mensaje
              </button>
            </div>
          </form>
        </div>
      </section>

      <FooterShell ctaHref="#contact" />
    </>
  );
}

function FooterShell({ ctaHref }: { ctaHref: string }) {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#8f95ff_0%,#7780fb_34%,#6872F2_72%,#5058d9_100%)] px-6 py-11 text-white md:px-14 lg:px-20" suppressHydrationWarning>
      <div className="footer-living-lines pointer-events-none absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_34%)]" />
      <div className="relative mx-auto max-w-[1120px]" suppressHydrationWarning>
        <div className="grid gap-10 md:grid-cols-3 md:items-center" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <p className="body-small text-white/76">Correo electrónico:</p>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=laurapazmariano652@gmail.com" target="_blank" rel="noreferrer" className="body-medium-bold mt-2 block break-all text-white">
              laurapazmariano652@gmail.com
            </a>
          </div>

          <div className="text-center" suppressHydrationWarning>
            <h2 className="text-[clamp(2rem,3vw,3.2rem)] font-bold uppercase leading-[1.3] tracking-normal">
              ¿Tienes una idea en mente?
            </h2>
            <a href={ctaHref} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/90 px-7 py-2 text-center text-base font-bold uppercase leading-tight tracking-normal text-white transition-all duration-300 hover:bg-white hover:text-[#6872F2]">
              Enviar mensaje
            </a>
          </div>

          <div className="flex justify-center md:justify-end" suppressHydrationWarning>
            <SignatureSVG color="#FFFFFF" className="h-auto w-[220px] md:w-[270px]" />
          </div>
        </div>

        <div className="body-small mt-10 border-t border-white/24 pt-6 text-white/78 md:flex md:items-center md:justify-between" suppressHydrationWarning>
          <p>© Copyright 2026. Todos los derechos reservados por Mariano Laura.</p>
          <p className="mt-3 md:mt-0">Creado por: Mariano Laura</p>
        </div>
      </div>
    </footer>
  );
}

export function FooterOnly() {
  return <FooterShell ctaHref="/contacto" />;
}
