'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 rounded-full bg-white/95 backdrop-blur-md border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] h-[56px] w-[508px] px-[8px] flex flex-row items-center justify-between z-50 max-w-[95vw]"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#EAEAEA] ml-1">
        <Image 
          src="https://picsum.photos/seed/duncansmile/100/100" 
          alt="Avatar" 
          width={40} 
          height={40} 
          className="object-cover w-full h-full"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="hidden sm:flex flex-row items-center justify-center flex-1 gap-8">
        {[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: 'Projects', path: '#' },
          { name: 'Blogs', path: '#' }
        ].map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`font-sans text-[15px] ${isActive ? 'font-medium text-[#000]' : 'font-normal text-[#555]'} hover:text-[#000] transition-colors`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      <Link href="#" className="rounded-full bg-[#222] text-[#FFF] text-[15px] font-medium h-[40px] px-6 mr-[2px] flex items-center justify-center hover:bg-black transition-colors shrink-0">
        Contact
      </Link>
    </motion.nav>
  );
}
