'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import StreamThumbnail from './StreamThumbnail';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  streamUrl?: string; // Optional stream URL to capture thumbnail from
}

export default function ImageWithFallback({
  src,
  alt,
  width = 100,
  height = 100,
  className = '',
  streamUrl = '',
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [streamThumbnail, setStreamThumbnail] = useState<string | null>(null);
  const [loadingThumbnail, setLoadingThumbnail] = useState(false);
  
  const fallbackSrc = '/placeholder-logo.svg';
  
  // Handle empty src values by treating them as errors
  const shouldUseFallback = error || !src || src.trim() === '';
  
  // Try to load stream thumbnail if we have a stream URL and need a fallback
  useEffect(() => {
    if (shouldUseFallback && streamUrl && !streamThumbnail && !loadingThumbnail) {
      setLoadingThumbnail(true);
    }
  }, [shouldUseFallback, streamUrl, streamThumbnail, loadingThumbnail]);
  
  // Handle thumbnail capture
  const handleThumbnailCaptured = (thumbnailUrl: string) => {
    setStreamThumbnail(thumbnailUrl);
    setLoadingThumbnail(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* Show stream thumbnail if available, otherwise use fallback or original src */}
      <Image
        src={shouldUseFallback ? (streamThumbnail || fallbackSrc) : src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        onError={() => setError(true)}
      />
      
      {/* Show channel name on fallback */}
      {shouldUseFallback && !streamThumbnail && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-center p-1">
          {alt}
        </div>
      )}
      
      {/* Hidden stream thumbnail generator */}
      {shouldUseFallback && streamUrl && loadingThumbnail && (
        <StreamThumbnail 
          url={streamUrl} 
          onThumbnailCaptured={handleThumbnailCaptured} 
        />
      )}
    </div>
  );
}
