"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// ─── Path data extraído de FirmaA.svg (trazos) ───
const SIGNATURE_D = "m 107.81415,188.32025 c 0,0 13.79118,-31.04538 17.89751,-47.44032 2.50467,-10.00015 2.7943,-20.42892 4.01152,-30.66585 3.67015,-21.187068 5.95909,-84.525882 -4.34456,-76.533559 -1.59885,34.583768 -2.76486,89.570679 1.25878,101.695279 0.59913,5.86902 6.90868,18.63388 9.87449,7.86304 4.23782,-13.08834 8.77155,-26.03211 12.34313,-39.31518 0.023,9.26962 0.31749,18.40008 1.85146,27.52063 1.25844,-6.08074 2.77853,-12.01655 4.93725,-17.82289 -0.12303,6.56134 -0.5439,13.10797 -0.92573,19.65759 4.0483,-10.75652 1.98313,-9.61396 7.09728,-23.32701 l 0.71266,8.32397 c 0.63847,6.89568 -0.57179,-5.43449 1.13881,23.39028 l 0.91917,-6.9683 2.5695,-12.44525 0.83142,-4.17556 1.99353,17.66925 c 4.13875,-9.87551 6.91513,-20.11971 9.70915,-30.43088 l 1.53513,10.14966 c 0.97048,7.58171 2.72927,14.99809 4.4144,22.4413 1.62146,-6.32372 3.53662,-12.55541 5.49113,-18.78093 12.92758,-30.716812 -0.89881,-21.807349 -0.59885,-4.02098 1.17753,17.01349 5.52972,33.27183 8.90509,49.87606 15.96187,42.35701 -165.35982,7.72904 -60.45593,9.97248 19.5616,-0.0902 39.08566,1.44117 58.62981,1.83471 76.87349,12.61277 117.94487,-16.11383 138.533,-84.911529 0.017,44.187869 9.23957,66.082069 20.49749,91.681009 -18.23639,-10.15127 -32.27958,-25.82205 -48.65086,-38.50217 -7.0419,-5.4542 -23.3803,-16.22356 -23.3803,-16.22356 0,0 16.13483,3.59405 24.59491,4.47398 20.56543,3.52737 41.46413,2.34604 62.19546,1.57317 7.38047,-0.27515 24.2929,-1.72595 24.2929,-1.72595 0,0 -6.96183,4.08496 -9.97417,5.51335 -10.76067,5.02593 -38.96681,20.4943 -53.93906,27.42974 -8.71751,4.03812 -11.84304,4.45367 -22.57036,7.7906 -10.72732,3.33693 -11.62421,4.29109 -20.90332,8.42316 -9.2791,4.13208 -19.07639,5.68547 -29.23015,5.3141";

// ─── Configuración de la animación ───
const DRAW_DURATION = 3.2;     // Un poco más lento para más elegancia
const ERASE_DURATION = 2.0;
const PAUSE_VISIBLE = 1.5;
const PAUSE_HIDDEN = 0.3;      // 0.3 segundos de espera antes de volver a dibujar
const STROKE_WIDTH = 1.5;      // Ligeramente más grueso para mayor presencia

export default function SignatureSVG({ className, color = "#1D1D1B" }: { className?: string, color?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shadowPathRef = useRef<SVGPathElement>(null);

  useGSAP(
    () => {
      const path = pathRef.current;
      const shadowPath = shadowPathRef.current;
      if (!path || !shadowPath) return;

      const length = path.getTotalLength();
      const paths = [shadowPath, path];

      // ─── Estado inicial ───
      gsap.set(paths, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      // ─── Timeline infinita ───
      const tl = gsap.timeline({ repeat: -1 });

      // 1. Dibujar (Velocidad continua/lineal)
      tl.to(paths, {
        strokeDashoffset: 0,
        duration: DRAW_DURATION,
        ease: "none", // Velocidad constante
        stagger: 0.05,
      });

      // 2. Pausa visible
      tl.to(paths, { duration: PAUSE_VISIBLE });

      // 3. Borrar
      tl.to(paths, {
        strokeDashoffset: -length,
        duration: ERASE_DURATION,
        ease: "none", // Borrado continuo
        stagger: 0.02,
      });

      // 4. Micro-pausa
      tl.to(paths, { duration: PAUSE_HIDDEN });

      // 5. Reset
      tl.set(paths, { strokeDashoffset: length });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="95 25 340 210"
        className={className}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.05))" }}
      >
        {/* EFECTO TINTA HÚMEDA (Ink Bleed) */}
        <path
          ref={shadowPathRef}
          d={SIGNATURE_D}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH * 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-15 blur-[2px]"
        />
        
        {/* TRAZO PRINCIPAL NÍTIDO */}
        <path
          ref={pathRef}
          d={SIGNATURE_D}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"

        />
      </svg>
    </div>
  );
}
