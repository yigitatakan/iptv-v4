'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Channel } from '@/utils/m3uParser';
import CustomPlayer from './CustomPlayer';

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
}

export default function VideoPlayer({ channel, onClose }: VideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (channel) {
      setIsLoading(true);
    }
  }, [channel]);
  
  if (!channel) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-5xl bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-black border-b-4 border-black p-3 flex justify-between items-center">
            <h3 className="text-white font-bold text-xl">{channel.name}</h3>
            <button 
              onClick={onClose}
              className="bg-red-500 text-white w-8 h-8 flex items-center justify-center font-bold border-2 border-black hover:bg-red-600"
            >
              X
            </button>
          </div>
          
          <div className="relative aspect-video bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-black rounded-full animate-spin"></div>
              </div>
            )}
            
            <CustomPlayer 
              url={channel.url}
              onReady={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
          
          <div className="p-4 bg-gray-100 border-t-4 border-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">{channel.name}</p>
                <p className="text-sm bg-yellow-100 inline-block px-2 border border-black mt-1">
                  {channel.group}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
