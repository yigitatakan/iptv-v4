/**
 * M3U Parser for IPTV channels
 * Parses M3U playlist format and extracts channel information
 */

import axios from 'axios';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export async function fetchAndParseM3U(url: string): Promise<Channel[]> {
  try {
    const response = await axios.get(url);
    return parseM3U(response.data);
  } catch (error) {
    console.error('Error fetching M3U playlist:', error);
    return [];
  }
}

export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split('\n');
  
  if (!lines[0].includes('#EXTM3U')) {
    throw new Error('Invalid M3U format');
  }
  
  let currentChannel: Partial<Channel> = {};
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Parse channel info line
      const infoLine = line.substring(line.indexOf(',') + 1);
      
      // Extract channel name
      currentChannel.name = infoLine.split('tvg-name=')[1]?.split('"')[1] || infoLine;
      
      // Extract logo URL
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      currentChannel.logo = logoMatch ? logoMatch[1] : '';
      
      // Extract group
      const groupMatch = line.match(/group-title="([^"]+)"/);
      currentChannel.group = groupMatch ? groupMatch[1] : 'Uncategorized';
      
      // Generate a unique ID
      currentChannel.id = `channel-${channels.length + 1}`;
    } else if (line.startsWith('http') && currentChannel.name) {
      // This is the URL line
      currentChannel.url = line;
      
      // Add the complete channel to our list
      channels.push(currentChannel as Channel);
      
      // Reset for the next channel
      currentChannel = {};
    }
  }
  
  return channels;
}

export function getUniqueGroups(channels: Channel[]): string[] {
  const groups = new Set<string>();
  channels.forEach(channel => {
    if (channel.group) {
      groups.add(channel.group);
    }
  });
  return Array.from(groups).sort();
}
