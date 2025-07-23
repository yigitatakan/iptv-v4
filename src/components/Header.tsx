'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface HeaderProps {
  groups?: string[];
  selectedGroup?: string;
  searchTerm?: string;
  onGroupChange?: (group: string) => void;
  onSearch?: (term: string) => void;
}

export default function Header({
  groups = [],
  selectedGroup = 'All',
  searchTerm = '',
  onGroupChange,
  onSearch
}: HeaderProps) {
  const pathname = usePathname();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Update local search term when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };
  
  // Handle group selection change
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onGroupChange) {
      onGroupChange(e.target.value);
    }
  };
  
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
      
      {/* Search and Filter Controls - Only show if we have groups and handlers */}
      {(groups.length > 0 && (onSearch || onGroupChange)) && (
        <div className="container mx-auto mt-4">
          <div className="flex flex-col md:flex-row gap-4">
            {onSearch && (
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={localSearchTerm}
                  onChange={handleSearchChange}
                  className="w-full p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
            )}
            
            {onGroupChange && groups.length > 0 && (
              <div className="w-full md:w-64">
                <div className="relative">
                  <select
                    value={selectedGroup}
                    onChange={handleGroupChange}
                    className="w-full p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none pr-8"
                  >
                    {groups.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
