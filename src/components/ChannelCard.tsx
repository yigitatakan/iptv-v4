'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ImageWithFallback from './ImageWithFallback';
import HoverPreviewPlayer from './HoverPreviewPlayer';
import { Channel } from '@/utils/m3uParser';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  onToggleWatchlist: (channel: Channel) => void;
  isInWatchlist: boolean;
}

export default function ChannelCard({
  channel,
  onPlay,
  onToggleWatchlist,
  isInWatchlist,
}: ChannelCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle mouse enter with minimal delay for preview
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // Set a timer to show the preview with minimal delay (100ms)
    previewTimerRef.current = setTimeout(() => {
      setShowPreview(true);
    }, 100);
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPreview(false);
    
    // Clear the timer if it exists
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
  };
  
  return (
    <motion.div
      className="relative bg-white p-4 rounded-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
      whileHover={{ 
        y: -5,
        boxShadow: '12px 12px 0px 0px rgba(0,0,0,1)',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        <div className="relative w-full h-32 mb-3 bg-gray-100 border-2 border-black overflow-hidden">
          {/* Show preview player when hovering */}
          <HoverPreviewPlayer 
            url={channel.url} 
            isVisible={showPreview} 
          />
          
          {/* Always show logo, will be hidden by preview when active */}
          <ImageWithFallback
            src={channel.logo}
            alt={channel.name}
            width={120}
            height={120}
            className="w-full h-full"
            streamUrl={channel.url} // Pass the stream URL for thumbnail generation
          />
        </div>
        
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{channel.name}</h3>
        <p className="text-sm mb-3 text-gray-600 bg-yellow-100 inline-block px-2 border border-black">
          {channel.group}
        </p>
        
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onPlay(channel)}
            className="flex-1 bg-blue-500 text-white py-2 px-4 border-3 border-black font-bold hover:bg-blue-600 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Play
          </button>
          
          <button
            onClick={() => onToggleWatchlist(channel)}
            className={`w-12 border-3 border-black font-bold active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
              isInWatchlist 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isInWatchlist ? '−' : '+'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
