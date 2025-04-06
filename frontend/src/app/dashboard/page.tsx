'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaFilm, FaTv, FaList, FaSignOutAlt, FaUserCircle, FaStar, FaCalendarAlt, FaCog, FaPlay } from 'react-icons/fa';

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
    { id: 'watchlist', label: 'Watchlist', icon: FaList, href: '/dashboard' },
    { id: 'movies', label: 'Movies', icon: FaFilm, href: '/dashboard?tab=movies' },
    { id: 'tv', label: 'TV Shows', icon: FaTv, href: '/dashboard?tab=tv' },
    { id: 'ratings', label: 'My Ratings', icon: FaStar, href: '/dashboard?tab=ratings' },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt, href: '/dashboard?tab=calendar' },
  ];

  const toggleSidebar = () => {
    setActiveSidebar(!activeSidebar);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 z-50">
        <div className="px-6 py-4 flex items-center justify-between w-full">
          {/* Logo and mobile sidebar toggle */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
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
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white cursor-pointer">
                <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Username display and profile menu */}
            <div className="relative flex items-center space-x-3">
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username}
              </span>
              <button
                onClick={toggleProfileMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Profile dropdown menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700">
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

      <div className="flex min-h-screen pt-16"> {/* Changed to min-h-screen to ensure full height */}
        {/* Sidebar */}
        <div
          className={`fixed top-16 bottom-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800 z-40 ${
            activeSidebar ? 'translate-x-0' : '-translate-x-full'
          } md:sticky md:top-16 md:translate-x-0 md:h-[calc(100vh-4rem)]`} /* Changed positioning and added height calc */
        >
          <div className="flex flex-col h-full">
            {/* Navigation links */}
            <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                    (item.id === 'watchlist' && activeTab === 'watchlist') ||
                    (item.id === 'movies' && activeTab === 'movies') ||
                    (item.id === 'tv' && activeTab === 'tv') ||
                    (item.id === 'ratings' && activeTab === 'ratings') ||
                    (item.id === 'calendar' && activeTab === 'calendar')
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => {
                    if (item.id !== 'home') {
                      setActiveTab(item.id);
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
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
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Dashboard content */}
          <main className="flex-1 bg-gray-100 dark:bg-gray-900 p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* Display guest banner if user is guest */}
              {isGuest && (
                <div
                  className="mb-6 p-4 bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-700 dark:text-indigo-300 rounded-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-3 md:mb-0">
                      <h3 className="font-medium">You're browsing as a guest</h3>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">
                        Create an account to save your data and access all features
                      </p>
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
                            {category === 'Currently Watching'
                              ? 'Continue where you left off'
                              : category === 'Plan to Watch'
                              ? 'Your future entertainment'
                              : 'Everything you have watched'}
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
                      Your recent activity will appear here as you use CineTracks. Start by adding movies and shows to your
                      watchlist!
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
                    {activeTab === 'movies'
                      ? 'Movie Collection'
                      : activeTab === 'tv'
                      ? 'TV Show Tracking'
                      : activeTab === 'ratings'
                      ? 'Your Ratings & Reviews'
                      : 'Release Calendar'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the {activeTab} feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    {activeTab === 'movies'
                      ? 'Add Movies'
                      : activeTab === 'tv'
                      ? 'Add TV Shows'
                      : activeTab === 'ratings'
                      ? 'Rate Content'
                      : 'View Calendar'}
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}