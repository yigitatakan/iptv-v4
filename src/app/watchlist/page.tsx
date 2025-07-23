'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Channel } from '@/utils/m3uParser';
import Header from '@/components/Header';
import ChannelCard from '@/components/ChannelCard';
import VideoPlayer from '@/components/VideoPlayer';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredWatchlist, setFilteredWatchlist] = useState<Channel[]>([]);
  
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
  
  // Filter watchlist based on search query
  useEffect(() => {
    if (searchQuery) {
      setFilteredWatchlist(
        watchlist.filter(channel => 
          channel.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredWatchlist(watchlist);
    }
  }, [watchlist, searchQuery]);
  
  // Handle channel play
  const handlePlayChannel = (channel: Channel) => {
    setCurrentChannel(channel);
  };
  
  // Handle closing video player
  const handleClosePlayer = () => {
    setCurrentChannel(null);
  };
  
  // Handle removing channel from watchlist
  const handleToggleWatchlist = (channel: Channel) => {
    const updatedWatchlist = watchlist.filter(item => item.id !== channel.id);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('iptvWatchlist', JSON.stringify(updatedWatchlist));
  };
  
  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      
      <main className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-6">My Watchlist</h1>
          
          {/* Search Control */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search in watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neo-input w-full md:w-1/2"
            />
          </div>
          
          {/* Watchlist Count */}
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {filteredWatchlist.length} {filteredWatchlist.length === 1 ? 'Channel' : 'Channels'} 
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </h2>
          </div>
        </div>
        
        {/* Empty Watchlist Message */}
        {watchlist.length === 0 && (
          <div className="neo-card text-center py-12">
            <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
            <p className="mb-6">Add channels to your watchlist from the main page</p>
            <a href="/" className="neo-button bg-blue-500 text-white">
              Browse Channels
            </a>
          </div>
        )}
        
        {/* Watchlist Grid */}
        {watchlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredWatchlist.map(channel => (
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
                  isInWatchlist={true}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* No Results Message */}
        {watchlist.length > 0 && filteredWatchlist.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold mb-2">No channels found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </main>
      
      {/* Video Player Modal */}
      {currentChannel && (
        <VideoPlayer channel={currentChannel} onClose={handleClosePlayer} />
      )}
    </div>
  );
}
