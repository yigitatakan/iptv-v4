'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Channel, parseM3U, getUniqueGroups, fetchAndParseM3U } from '@/utils/m3uParser';
import { getAllCountriesSorted, getCountryM3UUrl, DEFAULT_COUNTRY_CODE, Country } from '@/utils/countryUtils';
import Header from './Header';
import ChannelCard from './ChannelCard';
import VideoPlayer from './VideoPlayer';
import LoadingAnimation from './LoadingAnimation';

// Country playlists will be loaded dynamically
const CHANNELS_PER_PAGE = 20; // Number of channels to display per page

export default function ChannelListingPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Track first visit for loading animation
  const [_, setIsFirstVisit] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<string>(DEFAULT_COUNTRY_CODE);
  const [sortedCountries, setSortedCountries] = useState<Country[]>([]);
  const [watchlist, setWatchlist] = useState<Channel[]>([]);
  const [displayedChannels, setDisplayedChannels] = useState<Channel[]>([]);

  // Fetch channels on component mount
  useEffect(() => {
    // Initialize sorted countries
    setSortedCountries(getAllCountriesSorted());
    
    // Check if this is the first visit
    const visited = localStorage.getItem('visited');
    if (visited) {
      setIsFirstVisit(false);
    }
    
    // Check if there's a saved country preference
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      setSelectedCountry(savedCountry);
    }
    
    // Set visited flag
    localStorage.setItem('visited', 'true');
  }, []);
  
  useEffect(() => {
    // Fetch channels when selected country changes
    const fetchChannels = async () => {
      setIsLoading(true);
      const countryUrl = getCountryM3UUrl(selectedCountry);
      console.log(`Fetching channels for ${selectedCountry} from ${countryUrl}`);
      
      try {
        const data = await fetchAndParseM3U(countryUrl);
        setChannels(data);
        setFilteredChannels(data);
        setGroups(['All', ...getUniqueGroups(data)]);
        setTotalPages(Math.ceil(data.length / CHANNELS_PER_PAGE));
        setCurrentPage(1); // Reset to first page when changing country
        
        // Save country preference
        localStorage.setItem('selectedCountry', selectedCountry);
      } catch (error) {
        console.error('Error fetching channels:', error);
        setChannels([]);
        setFilteredChannels([]);
        setGroups(['All']);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, [selectedCountry]);
  
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
    
    if (searchTerm) {
      result = result.filter(channel => 
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedGroup !== 'All') {
      result = result.filter(channel => channel.group === selectedGroup);
    }
    
    setFilteredChannels(result);
    setTotalPages(Math.ceil(result.length / CHANNELS_PER_PAGE));
    setCurrentPage(1); // Reset to first page when filters change
  }, [channels, searchTerm, selectedGroup]);
  
  // Update displayed channels based on pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * CHANNELS_PER_PAGE;
    const endIndex = startIndex + CHANNELS_PER_PAGE;
    setDisplayedChannels(filteredChannels.slice(startIndex, endIndex));
  }, [filteredChannels, currentPage]);
  
  // Handle channel play
  const handlePlayChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };
  
  // Handle closing video player
  const handleClosePlayer = () => {
    setSelectedChannel(null);
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
        <Header 
          onGroupChange={(group) => setSelectedGroup(group)} 
          onSearch={(term) => setSearchTerm(term)}
          groups={groups}
          selectedGroup={selectedGroup}
          searchTerm={searchTerm}
        />
        
        <main className="container mx-auto px-4 pb-12">
          {/* Search and Filter Controls */}
          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-bold mb-1">Select Country</label>
                <div className="relative">
                  <select
                    className="w-full md:w-64 p-2 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] appearance-none pr-8"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    {sortedCountries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
              </div>
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
                  {searchTerm ? ` matching "${searchTerm}"` : ''}
                </h2>
              </div>
              
              {/* Channel Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayedChannels.map(channel => (
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
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`neo-button px-4 py-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1 mx-4">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center border-2 border-black
                            ${currentPage === pageNum ? 'bg-yellow-300' : 'bg-white hover:bg-gray-100'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="mx-1">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white hover:bg-gray-100"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`neo-button px-4 py-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Next
                  </button>
                </div>
              )}
              
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
      
      {/* Video Player */}
      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          onClose={handleClosePlayer}
        />
      )}
    </>
  );
}
