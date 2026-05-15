'use client';

import { type FormEvent } from 'react';
import Image from 'next/image';
import { Hand } from 'lucide-react';
import SignatureSVG from '@/components/SignatureSVG';

export function ContactAndFooter() {
  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '');
    const phone = String(formData.get('phone') ?? '');
    const service = String(formData.get('service') ?? '');
    const message = String(formData.get('message') ?? '');

    const subject = encodeURIComponent(service || 'Nueva consulta desde el portfolio');
    const body = encodeURIComponent(
      `Nombre: ${name}\nNúmero de contacto: ${phone}\nServicio: ${service}\n\nMensaje:\n${message}`
    );

    window.location.href = `mailto:laurapazmariano652@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.form;
    if (!form) return;

    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '');
    const phone = String(formData.get('phone') ?? '');
    const service = String(formData.get('service') ?? '');
    const message = String(formData.get('message') ?? '');
    const whatsappMessage = encodeURIComponent(
      `Hola Mariano, quisiera consultar sobre ${service || 'un proyecto'}.\n\nNombre: ${name}\nNúmero de contacto: ${phone}\nMensaje: ${message}`
    );

    window.open(`https://wa.me/51925685323?text=${whatsappMessage}`, '_blank', 'noopener,noreferrer');
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
            Trabajemos juntos
          </h2>
          <p className="body-medium mt-7 max-w-[520px] text-[#303030]/64">
            Construyamos juntos algo impactante, ya sea tu marca, tu sitio web o tu próxima gran idea.
          </p>

          <form className="mt-10 space-y-6" onSubmit={handleContactSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="body-small-bold mb-3 block text-[#6872F2]">Nombre</span>
                <input name="name" className="body-medium h-14 w-full rounded-full bg-[#f3f3f4] px-6 text-[#303030] outline-none placeholder:text-[#303030]/28 focus:ring-2 focus:ring-[#6872F2]/35" placeholder="Juan Smith" />
              </label>
              <label className="block">
                <span className="body-small-bold mb-3 block text-[#6872F2]">Número de contacto</span>
                <input name="phone" type="tel" className="body-medium h-14 w-full rounded-full bg-[#f3f3f4] px-6 text-[#303030] outline-none placeholder:text-[#303030]/28 focus:ring-2 focus:ring-[#6872F2]/35" placeholder="+51 999 999 999" />
              </label>
            </div>

            <label className="block">
              <span className="body-small-bold mb-3 block text-[#6872F2]">¿Necesita servicio?</span>
              <select name="service" className="body-medium h-14 w-full rounded-full bg-[#f3f3f4] px-6 text-[#303030]/48 outline-none focus:ring-2 focus:ring-[#6872F2]/35" defaultValue="">
                <option value="" disabled>Seleccionar...</option>
                <option>Diseño web</option>
                <option>UI / UX</option>
                <option>Branding</option>
                <option>Software a medida</option>
              </select>
            </label>

            <label className="block">
              <span className="body-small-bold mb-3 block text-[#6872F2]">¿En qué puedo ayudarle...?</span>
              <textarea name="message" className="body-medium min-h-[150px] w-full resize-y rounded-[24px] bg-[#f3f3f4] px-6 py-5 text-[#303030] outline-none placeholder:text-[#303030]/28 focus:ring-2 focus:ring-[#6872F2]/35" placeholder="Hola, quisiera consultar sobre..." />
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#6872F2] px-6 py-3 text-center text-base font-bold uppercase leading-tight tracking-normal text-[#6872F2] transition-all duration-300 hover:bg-[#6872F2] hover:text-white sm:w-auto sm:px-9 sm:text-lg">
                Enviar correo
              </button>
              <button type="button" onClick={handleWhatsAppSubmit} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#6872F2] px-6 py-3 text-center text-base font-bold uppercase leading-tight tracking-normal text-white transition-all duration-300 hover:bg-[#5963e8] sm:w-auto sm:px-9 sm:text-lg">
                Prefiero enviar por WhatsApp
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#8f95ff_0%,#7780fb_34%,#6872F2_72%,#5058d9_100%)] px-6 py-11 text-white md:px-14 lg:px-20" suppressHydrationWarning>
        <div className="footer-living-lines pointer-events-none absolute inset-0 opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_34%)]" />
        <div className="relative mx-auto max-w-[1120px]" suppressHydrationWarning>
          <div className="grid gap-10 md:grid-cols-3 md:items-center" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <p className="body-small text-white/76">Correo electrónico:</p>
              <a href="mailto:laurapazmariano652@gmail.com" className="body-medium-bold mt-2 block break-all text-white">
                laurapazmariano652@gmail.com
              </a>
            </div>

            <div className="text-center" suppressHydrationWarning>
              <h2 className="text-[clamp(2rem,3vw,3.2rem)] font-bold uppercase leading-[1.3] tracking-normal">
                ¿Listo para trabajar juntos?
              </h2>
              <a href="#contact" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/90 px-7 py-2 text-center text-base font-bold uppercase leading-tight tracking-normal text-white transition-all duration-300 hover:bg-white hover:text-[#6872F2]">
                ¡Contáctame ya!
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
    </>
  );
}

export function FooterOnly() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#8f95ff_0%,#7780fb_34%,#6872F2_72%,#5058d9_100%)] px-6 py-11 text-white md:px-14 lg:px-20" suppressHydrationWarning>
      <div className="footer-living-lines pointer-events-none absolute inset-0 opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_34%)]" />
      <div className="relative mx-auto max-w-[1120px]" suppressHydrationWarning>
        <div className="grid gap-10 md:grid-cols-3 md:items-center" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <p className="body-small text-white/76">Correo electrónico:</p>
            <a href="mailto:laurapazmariano652@gmail.com" className="body-medium-bold mt-2 block break-all text-white">
              laurapazmariano652@gmail.com
            </a>
          </div>

          <div className="text-center" suppressHydrationWarning>
            <h2 className="text-[clamp(2rem,3vw,3.2rem)] font-bold uppercase leading-[1.3] tracking-normal">
              ¿Listo para trabajar juntos?
            </h2>
            <a href="#contact" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/90 px-7 py-2 text-center text-base font-bold uppercase leading-tight tracking-normal text-white transition-all duration-300 hover:bg-white hover:text-[#6872F2]">
              ¡Contáctame ya!
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
