'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchAndParseM3U, Channel, getUniqueGroups } from '@/utils/m3uParser';
import Header from './Header';
import ChannelCard from './ChannelCard';
import VideoPlayer from './VideoPlayer';
import LoadingAnimation from './LoadingAnimation';

const M3U_URL = 'https://iptv-org.github.io/iptv/index.m3u';

export default function ChannelListingPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [watchlist, setWatchlist] = useState<Channel[]>([]);
  
  // Fetch channels on component mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const fetchedChannels = await fetchAndParseM3U(M3U_URL);
        setChannels(fetchedChannels);
        setFilteredChannels(fetchedChannels);
        setGroups(['All', ...getUniqueGroups(fetchedChannels)]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching channels:', error);
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, []);
  
  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('iptvWatchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (error) {
        console.error('Error parsing watchlist:', error);
      }
    }
  }, []);
  
  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('iptvWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);
  
  // Filter channels based on search query and selected group
  useEffect(() => {
    let result = channels;
    
    if (searchQuery) {
      result = result.filter(channel => 
        channel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGroup !== 'All') {
      result = result.filter(channel => channel.group === selectedGroup);
    }
    
    setFilteredChannels(result);
  }, [channels, searchQuery, selectedGroup]);
  
  // Handle channel play
  const handlePlayChannel = (channel: Channel) => {
    setCurrentChannel(channel);
  };
  
  // Handle closing video player
  const handleClosePlayer = () => {
    setCurrentChannel(null);
  };
  
  // Handle toggling channel in watchlist
  const handleToggleWatchlist = (channel: Channel) => {
    const isInWatchlist = watchlist.some(item => item.id === channel.id);
    
    if (isInWatchlist) {
      setWatchlist(watchlist.filter(item => item.id !== channel.id));
    } else {
      setWatchlist([...watchlist, channel]);
    }
  };
  
  // Check if a channel is in the watchlist
  const isInWatchlist = (channel: Channel) => {
    return watchlist.some(item => item.id === channel.id);
  };
  
  return (
    <>
      <LoadingAnimation />
      
      <div className="min-h-screen bg-[#f5f5f5]">
        <Header />
        
        <main className="container mx-auto px-4 pb-12">
          {/* Search and Filter Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neo-input w-full"
              />
            </div>
            
            <div className="w-full md:w-64">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="neo-select w-full appearance-none"
              >
                {groups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-t-blue-500 border-black rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Channel Count */}
              <div className="mb-6">
                <h2 className="text-xl font-bold">
                  {filteredChannels.length} {filteredChannels.length === 1 ? 'Channel' : 'Channels'} 
                  {selectedGroup !== 'All' ? ` in ${selectedGroup}` : ''}
                  {searchQuery ? ` matching "${searchQuery}"` : ''}
                </h2>
              </div>
              
              {/* Channel Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredChannels.map(channel => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChannelCard
                      channel={channel}
                      onPlay={handlePlayChannel}
                      onToggleWatchlist={handleToggleWatchlist}
                      isInWatchlist={isInWatchlist(channel)}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* No Results Message */}
              {filteredChannels.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-xl font-bold mb-2">No channels found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      {/* Video Player Modal */}
      {currentChannel && (
        <VideoPlayer channel={currentChannel} onClose={handleClosePlayer} />
      )}
    </>
  );
}
