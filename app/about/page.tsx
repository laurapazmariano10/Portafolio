'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { Hand } from 'lucide-react';
import { Navbar } from '@/components/navbar';

export default function AboutSection() {
  return (
    <main className="min-h-screen w-full relative flex flex-col items-center justify-center bg-[#FFFFFF] overflow-hidden">
      <Navbar />

      {/* Central Composition Layout using exact flex grids to ensure flawless overlapping */}
      <div className="relative w-full h-[100dvh] min-h-[600px] flex items-center justify-center">
        
        {/* Background Text Overlay */}
        <div className="absolute inset-0 flex flex-row items-center justify-center pointer-events-none select-none z-0">
          
          {/* Left Text Block */}
          <motion.div 
            initial={{ x: '10vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-1/2 h-full flex flex-col justify-center items-end pr-[130px] sm:pr-[160px] md:pr-[190px] lg:pr-[200px] xl:pr-[220px] pb-[3vh] md:pb-[6vh]"
          >
            <div className="flex flex-col items-end">
              <span className="font-[family-name:var(--font-display)] text-[18px] md:text-[28px] lg:text-[32px] tracking-[0.05em] font-normal text-[#222] uppercase mb-1">
                MARIANO LAURA
              </span>
              <h1 className="font-[family-name:var(--font-display)] font-semibold text-[#292929] leading-[0.8] tracking-[-0.01em] text-[12vw] sm:text-[80px] md:text-[100px] lg:text-[110px] xl:text-[120px]">
                DIGITAL
              </h1>
            </div>
          </motion.div>

          {/* Right Text Block */}
          <motion.div 
            initial={{ x: '-10vw', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="w-1/2 h-full flex flex-col justify-center items-start pl-[130px] sm:pl-[160px] md:pl-[190px] lg:pl-[200px] xl:pl-[220px] pt-[3vh] md:pt-[6vh]"
          >
            <div className="flex flex-col items-start max-w-max">
              <h1 className="font-[family-name:var(--font-display)] font-semibold text-[#292929] leading-[0.8] tracking-[-0.01em] text-[12vw] sm:text-[80px] md:text-[100px] lg:text-[110px] xl:text-[120px]">
                DESIGNER
              </h1>
              <div className="w-full flex justify-end mt-2 md:mt-4">
                 <p className="font-sans text-[14px] md:text-[16px] leading-[1.6] text-[#666] font-light text-right max-w-[280px]">
                   Soy diseñador digital y desarrollador - Ing en sistemas e informatica
                 </p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Foreground Central Image wrapper */}
        <div className="relative z-10 w-[240px] h-[336px] sm:w-[280px] sm:h-[392px] md:w-[320px] md:h-[448px] lg:w-[340px] lg:h-[476px]">
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 80, delay: 0.05 }}
            className="w-full h-full rounded-[24px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-[#E8E8E8] relative border border-black/5"
          >
            <Image
              src="https://picsum.photos/seed/duncanportrait2/720/1000"
              alt="Duncan Robert Portrait"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              priority
            />
          </motion.div>

          {/* Floating 'Hi' Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 14, stiffness: 120, delay: 0.6 }}
            className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 w-[72px] h-[72px] md:w-[104px] md:h-[104px] bg-[#6872F2] rounded-full flex items-center justify-center shadow-[0_12px_24px_rgba(104,114,242,0.3)] z-20 cursor-default hover:scale-105 transition-transform"
          >
            <Hand className="w-8 h-8 md:w-11 md:h-11 text-white fill-current -rotate-12 translate-y-[2px]" strokeWidth={1} />
          </motion.div>
        </div>

      </div>

      {/* Bottom Toggle Control Pill */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      >
        <button 
          title="Toggle Theme"
          className="flex items-center w-[46px] h-[22px] md:w-[50px] md:h-[24px] rounded-full border-[1.5px] border-[#6872F2] bg-transparent p-[3px] transition-colors group cursor-pointer"
        >
          <div className="w-[14px] h-[14px] md:w-[15px] md:h-[15px] rounded-full bg-[#6872F2] group-hover:scale-90 transition-transform" />
        </button>
      </motion.div>

    </main>
  );
}
