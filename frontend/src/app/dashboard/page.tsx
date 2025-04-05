'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaFilm, FaTv, FaList, FaSignOutAlt, FaUser, FaStar, FaCalendarAlt } from 'react-icons/fa';

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist');

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // If still loading or no user, show loading state
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xl font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'watchlist', label: 'Watchlist', icon: FaList },
    { id: 'movies', label: 'Movies', icon: FaFilm },
    { id: 'tv', label: 'TV Shows', icon: FaTv },
    { id: 'ratings', label: 'My Ratings', icon: FaStar },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
  ];

  const toggleSidebar = () => {
    setActiveSidebar(!activeSidebar);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          activeSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <motion.div
                className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900"
                whileHover={{ scale: 1.05 }}
              >
                <FaUser className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
              <div>
                <h2 className="font-semibold dark:text-white">{user.username}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t dark:border-gray-700">
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 w-full p-2 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button className="hidden md:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg
                  className="h-6 w-6 text-gray-600 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {/* Placeholder content based on the active tab */}
            {activeTab === 'watchlist' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Watchlist</h2>
                
                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Currently Watching', 'Plan to Watch', 'Completed'].map((category) => (
                    <motion.div
                      key={category}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    >
                      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">{category}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {category === 'Currently Watching' ? 'Continue where you left off' : 
                           category === 'Plan to Watch' ? 'Your future entertainment' : 'Everything you have watched'}
                        </p>
                      </div>
                      <div className="p-5">
                        {/* Placeholder for empty state */}
                        <div className="py-8 flex flex-col items-center text-center">
                          <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-4">
                            <FaList className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">No items in this category yet</p>
                          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            Add content
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Recent activity - placeholder */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your recent activity will appear here as you use CineTracks. Start by adding movies and shows to your watchlist!
                  </p>
                </div>
              </div>
            )}
            
            {activeTab !== 'watchlist' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                  {activeTab === 'movies' && <FaFilm className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />}
                  {activeTab === 'tv' && <FaTv className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />}
                  {activeTab === 'ratings' && <FaStar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />}
                  {activeTab === 'calendar' && <FaCalendarAlt className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {activeTab === 'movies' ? 'Movie Collection' : 
                   activeTab === 'tv' ? 'TV Show Tracking' :
                   activeTab === 'ratings' ? 'Your Ratings & Reviews' : 'Release Calendar'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                  This is a placeholder for the {activeTab} feature. More functionality will be added in future updates.
                </p>
                <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  {activeTab === 'movies' ? 'Add Movies' : 
                   activeTab === 'tv' ? 'Add TV Shows' :
                   activeTab === 'ratings' ? 'Rate Content' : 'View Calendar'}
                </button>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}