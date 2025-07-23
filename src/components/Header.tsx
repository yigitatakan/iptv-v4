'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="bg-white border-b-4 border-black py-4 px-6 mb-8">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <Link href="/" className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-black tracking-tighter">
            <span className="bg-red-500 text-white px-2 py-1 mr-1">IPTV</span>
            <span className="text-black">Stream</span>
          </h1>
        </Link>
        
        <nav className="flex gap-2">
          <NavLink href="/" active={pathname === '/'}>
            Channels
          </NavLink>
          <NavLink href="/watchlist" active={pathname === '/watchlist'}>
            Watchlist
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  children: React.ReactNode;
}

function NavLink({ href, active, children }: NavLinkProps) {
  return (
    <Link href={href} className="relative">
      <motion.div
        className={`px-4 py-2 font-bold border-3 border-black ${
          active 
            ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
            : 'bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
        }`}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0, boxShadow: '0px 0px 0px 0px rgba(0,0,0,1)' }}
      >
        {children}
      </motion.div>
    </Link>
  );
}
