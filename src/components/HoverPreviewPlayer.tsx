'use client';

import { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface HoverPreviewPlayerProps {
  url: string;
  isVisible: boolean;
}

export default function HoverPreviewPlayer({ url, isVisible }: HoverPreviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Pre-initialize HLS when component mounts
  useEffect(() => {
    return () => {
      // Clean up HLS instance on unmount
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);
  
  // Handle video playback when visibility changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !url) return;
    
    // Check if the URL is an HLS stream (.m3u8)
    const isHlsStream = url.toLowerCase().includes('.m3u8');
    
    if (isVisible) {
      // Use HLS.js if it's an HLS stream and HLS.js is supported
      if (isHlsStream && Hls.isSupported()) {
        // Reuse existing HLS instance or create a new one
        if (!hlsRef.current) {
          hlsRef.current = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            startLevel: 0, // Start with lowest quality for faster initial load
            abrEwmaDefaultEstimate: 500000, // Lower initial bandwidth estimate
            maxBufferLength: 15, // Smaller buffer for quicker start
            maxMaxBufferLength: 30,
            manifestLoadingTimeOut: 5000, // Shorter timeout
            manifestLoadingMaxRetry: 2, // Fewer retries for faster failure
            levelLoadingTimeOut: 5000, // Shorter timeout
            fragLoadingTimeOut: 5000 // Shorter timeout
          });
        }
        
        // Bind HLS to the video element if not already attached to this URL
        if (hlsRef.current.url !== url) {
          hlsRef.current.loadSource(url);
          hlsRef.current.attachMedia(videoElement);
          
          // Add HLS event listeners
          hlsRef.current.on(Hls.Events.MANIFEST_PARSED, () => {
            // Set video to low quality settings for preview
            videoElement.volume = 0;
            videoElement.playbackRate = 1.0;
            videoElement.play().catch(e => {
              console.warn('Auto-play prevented:', e);
            });
          });
        } else {
          // If already loaded with this URL, just play
          videoElement.play().catch(e => {
            console.warn('Auto-play prevented:', e);
          });
        }
      } 
      // For non-HLS streams or if HLS.js is not supported, use native video
      else {
        videoElement.src = url;
        videoElement.load();
        videoElement.play().catch(e => {
          console.warn('Auto-play prevented:', e);
        });
      }
    } else {
      // When not visible, pause but don't unload to keep it ready
      videoElement.pause();
    }
    
    // Clean up only when URL changes
    return () => {
      if (!isVisible) {
        videoElement.pause();
      }
    };
  }, [url, isVisible]);
  
  // Don't unmount the component when invisible, just hide it
  if (!url) return null;
  
  return (
    <div className={`absolute inset-0 bg-black z-20 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <video 
        ref={videoRef}
        className="w-full h-full object-contain" 
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
        Preview
      </div>
    </div>
  );
}
