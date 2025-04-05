'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaFilm, FaTv, FaList, FaSignOutAlt, FaUser, FaStar, FaCalendarAlt, FaCog, FaUserCircle, FaPlay } from 'react-icons/fa';

export default function Dashboard() {
  const { user, logout, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('watchlist');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

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
    { id: 'home', label: 'Home', icon: FaPlay, href: '/home' },
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
      {/* Sidebar - removed initial animation for better loading */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          activeSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div
                className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900"
              >
                <FaUser className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="font-semibold dark:text-white">{user.username}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isGuest ? 'Guest User' : user.role}
                  {isGuest && (
                    <Link href="/register" className="ml-2 text-indigo-500 hover:text-indigo-600">
                      Create Account
                    </Link>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
            {/* Home link - special case that navigates to /home */}
            <Link href="/home" className="w-full">
              <div className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors
                text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}>
                <FaPlay className="h-5 w-5" />
                <span>Home</span>
              </div>
            </Link>
            
            {/* Regular dashboard tabs */}
            {sidebarItems.slice(1).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            ))}
            
            <Link href="/dashboard/profile" passHref>
              <div
                className="flex items-center space-x-3 w-full p-3 rounded-lg transition-colors 
                text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer mt-4"
              >
                <FaCog className="h-5 w-5" />
                <span>Account Settings</span>
              </div>
            </Link>
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
      </div>

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
              <Link href="/home">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white cursor-pointer">
                  <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
                </h1>
              </Link>
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
              <div className="relative">
                <button 
                  onClick={toggleProfileMenu}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FaUserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
                
                {/* Profile dropdown menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
                    <div className="px-4 py-2 border-b dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.username}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'Guest User'}</p>
                    </div>
                    <Link href="/home">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaPlay className="mr-2 h-4 w-4" />
                        Home
                      </div>
                    </Link>
                    <Link href="/dashboard/profile">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaCog className="mr-2 h-4 w-4" />
                        Account Settings
                      </div>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    >
                      <FaSignOutAlt className="mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
              {isGuest && (
                <Link href="/register" className="hidden md:block">
                  <button className="ml-3 px-4 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
                    Create Account
                  </button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto">
          <div 
            className="max-w-7xl mx-auto"
          >
            {/* Display guest banner if user is guest */}
            {isGuest && (
              <div 
                className="mb-6 p-4 bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-700 dark:text-indigo-300 rounded-md"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium">You're browsing as a guest</h3>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400">Create an account to save your data and access all features</p>
                  </div>
                  <Link href="/register">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium transition-colors">
                      Create Account
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Placeholder content based on the active tab */}
            {activeTab === 'watchlist' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">My Watchlist</h2>
                
                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['Currently Watching', 'Plan to Watch', 'Completed'].map((category) => (
                    <div
                      key={category}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
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
                    </div>
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
          </div>
        </main>
      </div>
    </div>
  );
}