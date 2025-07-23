'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  width = 100,
  height = 100,
  className = '',
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  
  const fallbackSrc = '/placeholder-logo.svg';
  
  // Handle empty src values by treating them as errors
  const shouldUseFallback = error || !src || src.trim() === '';
  
  return (
    <div className={`relative ${className}`}>
      <Image
        src={shouldUseFallback ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        onError={() => setError(true)}
      />
      {shouldUseFallback && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-center p-1">
          {alt}
        </div>
      )}
    </div>
  );
}
