'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function BlogSection() {
  return (
    <section id="blog" className="relative w-full bg-white px-6 py-32 md:px-10 lg:px-20 text-[#303030]">
      <div className="mx-auto max-w-[1120px]">
        
        {/* Header */}
        <div className="mb-20 max-w-[900px]">
          <h2 className="font-[family-name:var(--font-antonio)] text-[clamp(3.5rem,7vw,6.5rem)] font-bold uppercase leading-[1.15] tracking-[-0.04em] text-[#303030]">
            IDEAS Y PERSPECTIVAS DE<br />TECNOLOGÍA
          </h2>
          <p className="body-medium mt-6 max-w-[580px] text-[#303030]/66">
            Desde las tendencias de diseño hasta los procesos creativos, estos artículos ofrecen ideas que te ayudarán a perfeccionar tu oficio, resolver desafíos y generar nuevas ideas para tus proyectos.
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-24 group cursor-pointer">
          <Link href="/blog/el-futuro-de-la-ia" className="block">
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-[30px] bg-[#f0f0f0] mb-8">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <Image src="/imgBlogsWebp/EL FUTURO DE LA INTELIGENCIA ARTIFICIAL/portada.webp" alt="El futuro de la IA" fill className="object-cover" />
              </div>
              
              <div className="absolute top-6 left-6 z-10">
                <span className="inline-flex h-11 items-center justify-center rounded-full bg-[#6872F2] px-6 text-sm font-bold uppercase tracking-wide text-white">
                  MÁS VISTOS
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                Tutoriales
              </span>
              <span className="body-small text-[#303030]/48">
                27 de abril de 2025
              </span>
            </div>
            
            <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(2rem,3vw,2.5rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
              EL FUTURO DE LA INTELIGENCIA ARTIFICIAL EN EL DESARROLLO DE SOFTWARE
            </h3>
            
            <p className="body-medium mt-5 text-[#303030]/62 max-w-[800px]">
              La era de escribir código de forma manual está llegando a su fin. Descubre cómo los agentes autónomos no solo están acelerando la producción, sino redefiniendo lo que significa ser ingeniero.
            </p>
          </Link>
        </div>

        {/* Grid Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-20">
          
          {/* Post 1 */}
          <Link href="/blog/computacion-cuantica" className="group block outline-none">
            <article className="w-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#ececec]">
                <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                  <Image src="/imgBlogsWebp/ComputacionCuantica/portada.webp" alt="Computación Cuántica" fill className="object-cover" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                  Perspectivas
                </span>
                <span className="body-small text-[#303030]/48">30 de abril de 2025</span>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
                COMPUTACIÓN CUÁNTICA: ¿ESTAMOS CERCA DE LA SUPREMACÍA?
              </h3>
              <p className="body-small mt-5 text-[#303030]/62">
                Olvida todo lo que sabes sobre unos y ceros. La revolución cuántica no es solo una actualización de hardware, es un salto hacia una nueva dimensión de posibilidades físicas y matemáticas.
              </p>
            </article>
          </Link>

          {/* Post 2 */}
          <Link href="/blog/realidad-mixta" className="group block outline-none">
            <article className="w-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#ececec]">
                <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                  <Image src="/imgBlogsWebp/larevoluciondelarealidad/portada.webp" alt="Realidad Mixta" fill className="object-cover" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                  Perspectivas
                </span>
                <span className="body-small text-[#303030]/48">2 de mayo de 2025</span>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
                LA REVOLUCIÓN DE LA REALIDAD MIXTA Y EL CÓMPUTO ESPACIAL
              </h3>
              <p className="body-small mt-5 text-[#303030]/62">
                El cómputo espacial no es usar unas gafas para ver pantallas flotantes; es disolver por completo la barrera entre el mundo físico y nuestra imaginación. El software acaba de romper la pantalla bidimensional.
              </p>
            </article>
          </Link>

          {/* Post 3 */}
          <Link href="/blog/arquitecturas-serverless" className="group block outline-none">
            <article className="w-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#ececec]">
                <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                  <Image src="/imgBlogsWebp/ARQUITECTURAS SERVERLESS/portada.webp" alt="Arquitecturas Serverless" fill className="object-cover" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                  Perspectivas
                </span>
                <span className="body-small text-[#303030]/48">22 de abril de 2025</span>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
                ARQUITECTURAS SERVERLESS: ESCALABILIDAD SIN LÍMITES
              </h3>
              <p className="body-small mt-5 text-[#303030]/62">
                El mito de mantener servidores ha colapsado. La nube moderna escala tu código desde cero hasta millones de peticiones por segundo sin inmutarse, cobrándote solo por el milisegundo exacto de cálculo bruto.
              </p>
            </article>
          </Link>

          {/* Post 4 */}
          <Link href="/blog/ciberseguridad-iot" className="group block outline-none">
            <article className="w-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#ececec]">
                <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                  <Image src="/imgBlogsWebp/CIBERSEGURIDAD/portada.webp" alt="Ciberseguridad IOT" fill className="object-cover" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                  Recursos
                </span>
                <span className="body-small text-[#303030]/48">30 de marzo de 2025</span>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
                CIBERSEGURIDAD EN LA ERA DEL INTERNET DE LAS COSAS (IOT)
              </h3>
              <p className="body-small mt-5 text-[#303030]/62">
                Cada dispositivo conectado es un soldado potencial en un ejército botnet global. La seguridad moderna no es proteger un servidor central, es blindar millones de terminales expuestas a la intemperie digital.
              </p>
            </article>
          </Link>

          {/* Post 5 */}
          <Link href="/blog/impacto-web3" className="group block outline-none">
            <article className="w-full">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#ececec]">
                <div className="h-full w-full transition-transform duration-700 group-hover:scale-105">
                  <Image src="/imgBlogsWebp/WEB3 y blockchain/portada.webp" alt="Impacto Web3" fill className="object-cover" />
                </div>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="body-small-bold rounded-full border border-[#6872F2]/55 px-4 py-1 text-[#6872F2]">
                  Perspectivas
                </span>
                <span className="body-small text-[#303030]/48">5 de abril de 2025</span>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-antonio)] text-[clamp(1.7rem,2.5vw,2rem)] font-bold uppercase leading-[1.2] tracking-[0.02em] text-[#303030] transition-colors duration-300">
                EL IMPACTO DE WEB3 Y BLOCKCHAIN EN LA DESCENTRALIZACIÓN
              </h3>
              <p className="body-small mt-5 text-[#303030]/62">
                Más allá de la especulación febril y las criptomonedas, yace una revolución arquitectónica pura: código inmutable, contratos auto-ejecutables y una web donde la confianza no es humana, es rigurosamente matemática.
              </p>
            </article>
          </Link>

        </div>
      </div>
    </section>
  );
}
