'use client';

import { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface StreamThumbnailProps {
  url: string;
  onThumbnailCaptured: (thumbnailUrl: string) => void;
}

export default function StreamThumbnail({ url, onThumbnailCaptured }: StreamThumbnailProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false); // Used in error handling
  
  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    
    if (!videoElement || !canvasElement || !url) return;
    
    // Initialize HLS instance reference
    let hlsInstance: Hls | null = null;
    
    // Function to capture a frame from the video
    const captureFrame = () => {
      try {
        const context = canvasElement.getContext('2d');
        if (!context) return;
        
        // Draw the current video frame to the canvas
        context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        // Convert the canvas to a data URL
        const thumbnailUrl = canvasElement.toDataURL('image/jpeg');
        
        // Call the callback with the thumbnail URL
        onThumbnailCaptured(thumbnailUrl);
        
        // Clean up
        setIsLoading(false);
      } catch (error) {
        console.error('Error capturing thumbnail:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };
    
    // Check if the URL is an HLS stream (.m3u8)
    const isHlsStream = url.toLowerCase().includes('.m3u8');
    
    // Use HLS.js if it's an HLS stream and HLS.js is supported
    if (isHlsStream && Hls.isSupported()) {
      // Create a new HLS instance
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        startLevel: 0, // Start with lowest quality for faster initial load
        maxBufferLength: 5, // Very small buffer for quick start
      });
      
      // Bind HLS to the video element
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(videoElement);
      
      // Add HLS event listeners
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        // Play the video
        videoElement.play().catch(e => {
          console.warn('Auto-play prevented:', e);
          setHasError(true);
          setIsLoading(false);
        });
      });
      
      // Handle errors
      hlsInstance.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setHasError(true);
          setIsLoading(false);
        }
      });
    } 
    // For non-HLS streams or if HLS.js is not supported, use native video
    else {
      videoElement.src = url;
      videoElement.load();
      videoElement.play().catch(e => {
        console.warn('Auto-play prevented:', e);
        setHasError(true);
        setIsLoading(false);
      });
    }
    
    // Set up event listeners
    const handleCanPlay = () => {
      // Wait a bit to let the video stabilize
      setTimeout(() => {
        captureFrame();
      }, 1000);
    };
    
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    // Add event listeners
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleError);
    
    // Set a timeout in case the video never loads
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 8000);
    
    // Clean up
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleError);
      clearTimeout(timeoutId);
      
      // Destroy HLS instance if it exists
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      
      // Stop the video
      videoElement.pause();
      videoElement.src = '';
      videoElement.load();
    };
  }, [url, onThumbnailCaptured]);
  
  return (
    <div className="hidden">
      <video 
        ref={videoRef}
        width="120"
        height="120"
        muted
        playsInline
      />
      <canvas 
        ref={canvasRef}
        width="120"
        height="120"
      />
    </div>
  );
}
