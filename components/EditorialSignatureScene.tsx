'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SIGNATURE_D = "m 107.81415,188.32025 c 0,0 13.79118,-31.04538 17.89751,-47.44032 2.50467,-10.00015 2.7943,-20.42892 4.01152,-30.66585 3.67015,-21.187068 5.95909,-84.525882 -4.34456,-76.533559 -1.59885,34.583768 -2.76486,89.570679 1.25878,101.695279 0.59913,5.86902 6.90868,18.63388 9.87449,7.86304 4.23782,-13.08834 8.77155,-26.03211 12.34313,-39.31518 0.023,9.26962 0.31749,18.40008 1.85146,27.52063 1.25844,-6.08074 2.77853,-12.01655 4.93725,-17.82289 -0.12303,6.56134 -0.5439,13.10797 -0.92573,19.65759 4.0483,-10.75652 1.98313,-9.61396 7.09728,-23.32701 l 0.71266,8.32397 c 0.63847,6.89568 -0.57179,-5.43449 1.13881,23.39028 l 0.91917,-6.9683 2.5695,-12.44525 0.83142,-4.17556 1.99353,17.66925 c 4.13875,-9.87551 6.91513,-20.11971 9.70915,-30.43088 l 1.53513,10.14966 c 0.97048,7.58171 2.72927,14.99809 4.4144,22.4413 1.62146,-6.32372 3.53662,-12.55541 5.49113,-18.78093 12.92758,-30.716812 -0.89881,-21.807349 -0.59885,-4.02098 1.17753,17.01349 5.52972,33.27183 8.90509,49.87606 15.96187,42.35701 -165.35982,7.72904 -60.45593,9.97248 19.5616,-0.0902 39.08566,1.44117 58.62981,1.83471 76.87349,12.61277 117.94487,-16.11383 138.533,-84.911529 0.017,44.187869 9.23957,66.082069 20.49749,91.681009 -18.23639,-10.15127 -32.27958,-25.82205 -48.65086,-38.50217 -7.0419,-5.4542 -23.3803,-16.22356 -23.3803,-16.22356 0,0 16.13483,3.59405 24.59491,4.47398 20.56543,3.52737 41.46413,2.34604 62.19546,1.57317 7.38047,-0.27515 24.2929,-1.72595 24.2929,-1.72595 0,0 -6.96183,4.08496 -9.97417,5.51335 -10.76067,5.02593 -38.96681,20.4943 -53.93906,27.42974 -8.71751,4.03812 -11.84304,4.45367 -22.57036,7.7906 -10.72732,3.33693 -11.62421,4.29109 -20.90332,8.42316 -9.2791,4.13208 -19.07639,5.68547 -29.23015,5.3141";

const PHRASE_LINES = [
  'Lo común',
  'se olvida, pero',
  'una presencia bien hecha',
  'deja una huella',
  'silenciosa que distingue.',
];

const LINE_LAYOUT = [
  'ml-[1vw] rotate-[-1.4deg] text-[clamp(4.4rem,11vw,12.8rem)] tracking-[-0.085em]',
  'ml-[13vw] rotate-[0.7deg] text-[clamp(3.55rem,8.6vw,9.8rem)] tracking-[-0.06em]',
  'ml-[2vw] rotate-[-0.4deg] text-[clamp(3.05rem,6.85vw,8rem)] tracking-[-0.07em]',
  'ml-[22vw] rotate-[1.1deg] text-[clamp(3.75rem,8.7vw,9.9rem)] tracking-[-0.08em]',
  'ml-[5vw] rotate-[-0.8deg] text-[clamp(3.15rem,6.7vw,7.8rem)] tracking-[-0.065em]',
];

export default function EditorialSignatureScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const phraseRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const signatureRef = useRef<SVGPathElement>(null);
  const signatureGlowRef = useRef<SVGPathElement>(null);
  const signatureWrapRef = useRef<HTMLDivElement>(null);
  let charIndex = 0;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const signature = signatureRef.current;
      const signatureGlow = signatureGlowRef.current;
      const phrase = phraseRef.current;
      if (!section || !signature || !signatureGlow || !phrase) return;

      const length = signature.getTotalLength();
      gsap.set([signature, signatureGlow], {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
      const lines = lineRefs.current.filter(Boolean);
      const chars = charRefs.current.filter(Boolean);
      const lineCharCounts = PHRASE_LINES.map((line) => line.replace(/\s/g, '').length);

      gsap.set(phrase, { autoAlpha: 0, y: 0, filter: 'blur(0px)' });
      gsap.set(signatureWrapRef.current, { autoAlpha: 0, scale: 0.84 });
      gsap.set(lines, {
        autoAlpha: 1,
        x: 0,
        filter: 'blur(0px)',
      });
      gsap.set(chars, {
        autoAlpha: 1,
        color: 'rgba(255,255,255,0.13)',
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        transformOrigin: '50% 50%',
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=560%',
          scrub: 0.9,
        },
        defaults: { ease: 'none' },
      });

      tl.to(phrase, {
        autoAlpha: 1,
        duration: 0.22,
        ease: 'none',
      }, 1.02);

      let lineStart = 0;
      let paintAt = 1.48;
      const charPaintDuration = 0.022;
      const charPaintGap = 0.027;
      lineCharCounts.forEach((count, lineIndex) => {
        const lineChars = chars.slice(lineStart, lineStart + count);
        tl.to(lineChars, {
          color: 'rgba(255,255,255,1)',
          stagger: { each: charPaintGap, from: 'start' },
          duration: charPaintDuration,
          ease: 'none',
        }, paintAt);
        paintAt += Math.max(0, count - 1) * charPaintGap + charPaintDuration + 0.16 + lineIndex * 0.02;
        lineStart += count;
      });

      const explodeAt = paintAt + 0.28;
      const clearTextAt = explodeAt + 0.74;
      const signatureRevealAt = clearTextAt + 0.24;
      const signatureDrawAt = signatureRevealAt + 0.18;

      tl.to(chars, {
        autoAlpha: 0,
        x: (index) => {
          const direction = index % 2 === 0 ? 1 : -1;
          return direction * (90 + (index % 7) * 28);
        },
        y: (index) => -120 + (index % 9) * 34,
        rotate: (index) => (index % 2 === 0 ? 1 : -1) * (16 + (index % 6) * 11),
        scale: (index) => 0.72 + (index % 5) * 0.08,
        stagger: { each: 0.006, from: 'random' },
        duration: 0.44,
        ease: 'power3.in',
      }, explodeAt);

      tl.to(lines, {
        autoAlpha: 0,
        duration: 0.08,
        ease: 'none',
      }, clearTextAt);

      tl.to(signatureWrapRef.current, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.18,
        ease: 'power2.out',
      }, signatureRevealAt);

      tl.to([signatureGlow, signature], {
        strokeDashoffset: 0,
        duration: 1.7,
      }, signatureDrawAt);

      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative z-30 -mt-[100vh] h-[820vh] w-full pointer-events-none">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0 flex items-center px-2 py-10 md:px-6">
          <h2
            ref={phraseRef}
            className="w-full select-none font-[family-name:var(--font-editorial)] font-black uppercase leading-[0.82]"
            aria-label="Lo común se olvida, pero una presencia bien hecha deja una huella silenciosa que distingue."
          >
            {PHRASE_LINES.map((line, lineIndex) => (
              <span
                key={line}
                ref={(node) => {
                  lineRefs.current[lineIndex] = node;
                }}
                className={`block whitespace-nowrap ${LINE_LAYOUT[lineIndex]}`}
              >
                {line.split('').map((char) => {
                  if (char === ' ') {
                    return <span key={`space-${charIndex++}`} className="inline-block w-[0.24em]" aria-hidden="true" />;
                  }

                  const currentIndex = charIndex++;
                  return (
                    <span
                      key={`${char}-${currentIndex}`}
                      ref={(node) => {
                        charRefs.current[currentIndex] = node;
                      }}
                      className="inline-block will-change-transform"
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </h2>
        </div>

        <div ref={signatureWrapRef} className="absolute inset-0 flex items-center justify-center px-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="95 25 340 210"
            className="h-auto w-[min(132vw,92rem)]"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <path
              ref={signatureGlowRef}
              d={SIGNATURE_D}
              fill="none"
              stroke="#ff0033"
              strokeWidth={8}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.22}
              className="blur-[8px]"
            />
            <path
              ref={signatureRef}
              d={SIGNATURE_D}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={4.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
