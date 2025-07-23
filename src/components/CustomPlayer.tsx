'use client';

import { useState, useRef, useEffect } from 'react';
// Import HLS.js with proper type safety
import Hls from 'hls.js';

interface CustomPlayerProps {
  url: string;
  onReady?: () => void;
  onError?: () => void;
}

export default function CustomPlayer({ url, onReady, onError }: CustomPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Don't render the player if URL is empty
  if (!url || url.trim() === '') {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white">
        <p>No video source available</p>
      </div>
    );
  }
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Initialize HLS instance reference
    let hlsInstance: Hls | null = null;
    
    const handleCanPlay = () => {
      setIsLoading(false);
      if (onReady) onReady();
    };
    
    const handleError = (message = '') => {
      console.error('Video error for URL:', url, message ? `- ${message}` : '');
      setHasError(true);
      setErrorMessage(message || 'Unable to play this stream');
      setIsLoading(false);
      if (onError) onError();
    };
    
    // Separate handler for video element error events
    const handleVideoError = () => {
      console.error('HTML5 video error for URL:', url);
      setHasError(true);
      setErrorMessage('Unable to play this stream');
      setIsLoading(false);
      if (onError) onError();
    };
    
    const handleWaiting = () => {
      setIsLoading(true);
    };
    
    const handlePlaying = () => {
      setIsLoading(false);
    };
    
    // Function to load video using native capabilities
    const loadVideoNatively = () => {
      videoElement.src = url;
      videoElement.load();
    };
    
    // Check if the URL is an HLS stream (.m3u8)
    const isHlsStream = url.toLowerCase().includes('.m3u8');
    
    // Use HLS.js if it's an HLS stream and HLS.js is supported
    if (isHlsStream && Hls.isSupported()) {
      // Create a new HLS instance
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      
      // Bind HLS to the video element
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(videoElement);
      
      // Add HLS event listeners
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement.play().catch(e => {
          console.warn('Auto-play prevented:', e);
        });
      });
      
      hlsInstance.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS network error:', data.details);
              
              // Handle specific network errors
              if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                  data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT) {
                // Check if it's a DNS resolution error
                if (data.response && (data.response as any).code === 'ERR_NAME_NOT_RESOLVED') {
                  handleError('Stream source unavailable (DNS error)');
                  return;
                }
                
                // Try to recover once for other manifest errors
                if (hlsInstance) {
                  console.log('Attempting to recover from manifest error...');
                  hlsInstance.startLoad();
                  
                  // Set a timeout to check if recovery worked
                  setTimeout(() => {
                    if (hasError) {
                      handleError('Stream source unavailable');
                    }
                  }, 5000);
                }
              } else {
                // For other network errors, try to recover
                if (hlsInstance) hlsInstance.startLoad();
              }
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS media error:', data.details);
              if (hlsInstance) hlsInstance.recoverMediaError(); // Try to recover
              break;
              
            default:
              console.error('HLS fatal error, cannot recover:', data.details);
              handleError('Stream format not supported');
              break;
          }
        }
      });
    } 
    // For non-HLS streams or if HLS.js is not supported, use native video
    else {
      loadVideoNatively();
    }
    
    // Add event listeners
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('error', handleVideoError);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);
    
    // Clean up
    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('error', handleVideoError);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('playing', handlePlaying);
      
      // Destroy HLS instance if it exists
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [url, onReady, onError]);
  
  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    
    // Reset video element
    if (videoRef.current) {
      videoRef.current.load();
    }
  };
  
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      {hasError ? (
        <div className="text-white text-center p-4">
          <p className="mb-2">{errorMessage || 'Unable to play this stream'}</p>
          <p className="text-sm opacity-70">
            {errorMessage ? 'Please try another channel' : 'The stream might be offline or in an unsupported format'}
          </p>
          <button 
            onClick={handleRetry}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded border-2 border-black"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-black bg-opacity-70">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-black rounded-full animate-spin"></div>
            </div>
          )}
          
          <video 
            ref={videoRef}
            className="w-full h-full" 
            controls 
            autoPlay
            playsInline
          />
        </>
      )}
    </div>
  );
}
