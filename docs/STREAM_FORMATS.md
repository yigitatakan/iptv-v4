# IPTV Stream Format Handling

This document explains how the IPTV application handles various stream formats.

## Supported Stream Formats

The application supports the following stream formats:

1. **HLS (.m3u8)** - Using HLS.js library for browsers without native HLS support
2. **MP4** - Native browser support
3. **DASH** - Limited support through native browser capabilities
4. **Direct streams** - Various direct stream URLs

## Implementation Details

### HLS Streams (.m3u8)

HLS (HTTP Live Streaming) is handled using the HLS.js library. The implementation:

1. Detects if the URL contains `.m3u8`
2. Checks if HLS.js is supported in the browser
3. Uses HLS.js to load and attach the stream to the video element
4. Implements error recovery for network and media errors
5. Falls back to native video element if HLS.js isn't supported

### Error Handling

The player implements several error handling strategies:

1. **Network Errors**: Attempts to reload the stream
2. **Media Errors**: Attempts to recover the media playback
3. **Fatal Errors**: Shows an error message with retry button
4. **Loading States**: Shows a loading spinner during buffering

## Browser Compatibility

- **Chrome/Edge/Safari**: Full support for all stream types
- **Firefox**: May have limited HLS support without HLS.js
- **Mobile Browsers**: Generally good support with HLS.js fallback

## Troubleshooting

If a stream doesn't play:

1. Check if the stream URL is valid and accessible
2. Verify the stream format is supported
3. Try refreshing the page
4. Check browser console for specific error messages
5. Use the retry button on the player

## Future Improvements

Potential improvements for stream handling:

1. Add DASH.js support for DASH streams
2. Implement quality selection for adaptive streams
3. Add stream health monitoring
4. Implement more sophisticated error recovery strategies
