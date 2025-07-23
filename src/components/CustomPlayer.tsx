'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomPlayerProps {
  url: string;
  onReady?: () => void;
  onError?: () => void;
}

export default function CustomPlayer({ url, onReady, onError }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      const handleCanPlay = () => {
        if (onReady) onReady();
      };
      
      const handleError = () => {
        if (onError) onError();
      };
      
      videoElement.addEventListener('canplay', handleCanPlay);
      videoElement.addEventListener('error', handleError);
      
      return () => {
        videoElement.removeEventListener('canplay', handleCanPlay);
        videoElement.removeEventListener('error', handleError);
      };
    }
  }, [onReady, onError]);
  
  // Don't render the video element if URL is empty
  if (!url || url.trim() === '') {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white">
        <p>No video source available</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <video 
        ref={videoRef}
        src={url}
        className="w-full h-full" 
        controls 
        autoPlay
        playsInline
      />
    </div>
  );
}
