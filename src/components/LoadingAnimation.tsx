/**
 * Netflix-style loading animation component
 * Only shown on first visit to the site
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LoadingAnimation() {
  const [showLoader, setShowLoader] = useState(true);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedIPTV');
    
    if (hasVisited) {
      setShowLoader(false);
      return;
    }
    
    // Set a timeout to hide the loader after 3.5 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
      localStorage.setItem('hasVisitedIPTV', 'true');
    }, 3500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!showLoader) return null;
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: showLoader ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative w-32 h-32"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Netflix-style N logo animation */}
        <motion.div 
          className="absolute left-0 w-4 h-32 bg-red-600"
          initial={{ height: 0 }}
          animate={{ height: 128 }}
          transition={{ duration: 0.7 }}
        />
        
        <motion.div 
          className="absolute w-32 h-4 bg-red-600 transform rotate-[20deg] origin-left"
          style={{ top: '30%', left: '0%' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        />
        
        <motion.div 
          className="absolute right-0 w-4 h-32 bg-red-600"
          initial={{ height: 0 }}
          animate={{ height: 128 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        />
        
        <motion.div
          className="absolute bottom-0 left-0 text-white text-2xl font-bold mt-4 w-full text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          IPTV
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
