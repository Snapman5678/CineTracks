'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { FaFilm, FaTv, FaList, FaSignOutAlt, FaUserCircle, FaSearch, FaPlay, FaChevronRight, FaChevronLeft, FaPlus, FaCalendarAlt, FaCog, FaStar, FaCheckCircle, FaRegClock, FaRegEye } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Define Movie interface based on the API response
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  trailerUrl?: string; // Added for trailer functionality
}

export default function Home() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const { user, logout, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Set active tab based on URL param
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab('home');
    }
  }, [tabParam]);

  // Ref for the dropdown menu and button
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  // Toggle profile menu dropdown
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showProfileMenu &&
        profileMenuRef.current &&
        profileButtonRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Fetch popular movies
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch('/api/movie-catalog/movies/popular?page=1');
        const data = await response.json();
        setPopularMovies(data);
        setIsLoadingMovies(false);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        setIsLoadingMovies(false);
      }
    };

    fetchPopularMovies();
  }, []);

  // Auto-cycle through featured movies every 5 seconds but stop when trailer is shown
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    
    if (autoRotate && !showTrailer && popularMovies.length > 0) {
      interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => (prevIndex + 1) % popularMovies.length);
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRotate, popularMovies.length, showTrailer]);

  // Pause auto-rotation when showing trailer
  useEffect(() => {
    if (showTrailer) {
      setAutoRotate(false);
    } else {
      setAutoRotate(true);
    }
  }, [showTrailer]);

  // Manually cycle to the next movie
  const nextMovie = () => {
    if (popularMovies.length === 0) return;
    setCurrentFeaturedIndex((prevIndex) => (prevIndex + 1) % popularMovies.length);
  };

  // Manually cycle to the previous movie
  const prevMovie = () => {
    if (popularMovies.length === 0) return;
    setCurrentFeaturedIndex((prevIndex) => (prevIndex - 1 + popularMovies.length) % popularMovies.length);
  };

  // Watch trailer functionality
  const openTrailer = () => {
    if (popularMovies[currentFeaturedIndex]?.trailerUrl) {
      setShowTrailer(true);
    }
  };

  const closeTrailer = () => {
    setShowTrailer(false);
  };

  // Extract YouTube video ID from YouTube URL
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[7].length === 11 ? match[7] : '';
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&fs=1`;
  };

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
    { id: 'watchlist', label: 'Watchlist', icon: FaList, href: '/home?tab=watchlist' },
    { id: 'movies', label: 'Movies', icon: FaFilm, href: '/home?tab=movies' },
    { id: 'tv', label: 'TV Shows', icon: FaTv, href: '/home?tab=tv' },
    { id: 'ratings', label: 'My Ratings', icon: FaStar, href: '/home?tab=ratings' },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt, href: '/home?tab=calendar' },
  ];

  const toggleSidebar = () => {
    setActiveSidebar(!activeSidebar);
  };

  // Function to get movie poster URL
  const getMoviePosterUrl = (posterPath: string) => {
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  // Function to get movie backdrop URL
  const getMovieBackdropUrl = (backdropPath: string) => {
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
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
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search movies & shows..."
                className="w-64 py-2 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:text-white"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            
            {/* Notification button */}
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
            
            {/* Username display and profile menu */}
            <div className="relative flex items-center space-x-3">
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.username}
              </span>
              <button
                ref={profileButtonRef}
                onClick={toggleProfileMenu}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUserCircle className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Profile dropdown menu positioned correctly under profile icon */}
              {showProfileMenu && (
                <div
                  ref={profileMenuRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border dark:border-gray-700"
                >
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email || 'Guest User'}</p>
                  </div>
                  <Link href="/home?tab=watchlist">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaList className="mr-2 h-4 w-4" />
                      My Watchlist
                    </div>
                  </Link>
                  <Link href="/home/profile">
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
                    item.id === activeTab
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              <Link href="/home/profile" passHref>
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
          {/* Home content */}
          <main className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
            {/* Display guest banner if user is guest */}
            {isGuest && (
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 border-l-4 border-indigo-500 text-indigo-700 dark:text-indigo-300 rounded-md mx-6 mt-6">
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

            {/* Dashboard Content or Home Content based on active tab */}
            {activeTab === 'home' && (
              <>
                {/* Featured Movie Section with Arrows */}
                <div className="relative w-full h-[70vh] overflow-hidden">
                  {/* Left navigation arrow */}
                  <button 
                    onClick={prevMovie}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-3 rounded-full backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                  >
                    <FaChevronLeft className="h-6 w-6" />
                  </button>
                  
                  {/* Right navigation arrow */}
                  <button
                    onClick={nextMovie}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 p-3 rounded-full backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
                  >
                    <FaChevronRight className="h-6 w-6" />
                  </button>

                  {popularMovies.map((movie, index) => (
                    <motion.div
                      key={movie.id}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: currentFeaturedIndex === index ? 1 : 0,
                        scale: currentFeaturedIndex === index ? 1 : 1.05,
                      }}
                      transition={{
                        opacity: { duration: 1, ease: 'easeInOut' },
                        scale: { duration: 1.2, ease: 'easeInOut' },
                      }}
                      style={{
                        zIndex: currentFeaturedIndex === index ? 1 : 0,
                      }}
                    >
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent z-10"></div>
                        {movie.backdrop_path && (
                          <Image
                            src={getMovieBackdropUrl(movie.backdrop_path)}
                            alt={movie.title}
                            fill
                            className="object-cover object-center"
                            priority
                            key={movie.id}
                          />
                        )}
                      </div>
                      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-16">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>
                        <p className="text-lg text-gray-300 max-w-2xl mb-6">
                          {movie.overview.length > 200 ? `${movie.overview.substring(0, 200)}...` : movie.overview}
                        </p>
                        <div className="flex flex-wrap gap-3 mb-8">
                          <span className="px-3 py-1 bg-indigo-600/90 text-white text-sm rounded-full">
                            Rating: {movie.vote_average.toFixed(1)}/10
                          </span>
                          <span className="px-3 py-1 bg-gray-600/90 text-white text-sm rounded-full">
                            {new Date(movie.release_date).getFullYear()}
                          </span>
                        </div>
                        <div className="flex gap-4 flex-wrap">
                          <button
                            onClick={openTrailer}
                            disabled={!movie.trailerUrl}
                            className={`px-6 py-3 rounded-md flex items-center gap-2 transition-colors ${
                              movie.trailerUrl
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-400 text-white cursor-not-allowed'
                            }`}
                          >
                            <FaPlay className="h-4 w-4" />
                            <span>{movie.trailerUrl ? 'Watch Trailer' : 'No Trailer Available'}</span>
                          </button>
                          <Link href={`/movie/${movie.id}`}>
                            <button className="px-6 py-3 bg-gray-700/70 text-white rounded-md hover:bg-gray-600 transition-colors">
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Progress indicators for featured movies */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
                    {popularMovies.map((_, index) => (
                      <button
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentFeaturedIndex === index ? 'w-8 bg-white' : 'w-2 bg-white/50'
                        }`}
                        onClick={() => setCurrentFeaturedIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 py-8">
                  {/* Popular Movies Section */}
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Popular Movies</h2>

                    {isLoadingMovies ? (
                      <div className="flex items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {popularMovies.slice(1, 11).map((movie) => (
                          <div
                            key={movie.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 relative group"
                          >
                            <Link href={`/movie/${movie.id}`} className="block">
                              <div className="relative aspect-[2/3] w-full">
                                {movie.poster_path ? (
                                  <Image
                                    src={getMoviePosterUrl(movie.poster_path)}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <FaFilm className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {movie.vote_average.toFixed(1)}
                                </div>
                              </div>
                            </Link>

                            {/* Add to watchlist button (icon only) */}
                            <button 
                              className="absolute bottom-20 right-3 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add to watchlist functionality
                              }}
                            >
                              <FaPlus className="h-4 w-4" />
                            </button>

                            {/* Separate trailer button to avoid conflicts with poster click */}
                            {movie.trailerUrl && (
                              <button
                                className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setCurrentFeaturedIndex(popularMovies.indexOf(movie));
                                  setShowTrailer(true);
                                }}
                              >
                                <FaPlay className="h-4 w-4" />
                              </button>
                            )}
                            
                            <Link href={`/movie/${movie.id}`}>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-1 line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{movie.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(movie.release_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Coming Soon Section */}
                  {!isLoadingMovies && (
                    <section className="mb-12">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Coming Soon</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularMovies.slice(11, 14).map((movie) => (
                          <Link key={movie.id} href={`/movie/${movie.id}`}>
                            <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="relative w-1/3">
                                {movie.poster_path ? (
                                  <Image
                                    src={getMoviePosterUrl(movie.poster_path)}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <FaFilm className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="p-4 w-2/3">
                                <h3 className="font-bold text-gray-800 dark:text-white mb-1">{movie.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  Release:{' '}
                                  {new Date(movie.release_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">{movie.overview}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Recommended for You */}
                  {!isLoadingMovies && (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Recommended for You</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {popularMovies.slice(14, 18).map((movie) => (
                          <Link key={movie.id} href={`/movie/${movie.id}`}>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                              <div className="relative aspect-[16/9] w-full">
                                {movie.backdrop_path ? (
                                  <Image
                                    src={getMovieBackdropUrl(movie.backdrop_path)}
                                    alt={movie.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                    <FaFilm className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                                  <h3 className="text-white font-bold p-4">{movie.title}</h3>
                                </div>
                                <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  {movie.vote_average.toFixed(1)}
                                </div>
                                {/* Play trailer button */}
                                {movie.trailerUrl && (
                                  <div
                                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setCurrentFeaturedIndex(popularMovies.indexOf(movie));
                                      setShowTrailer(true);
                                    }}
                                  >
                                    <div className="bg-indigo-600/80 p-3 rounded-full hover:bg-indigo-600 transition-colors">
                                      <FaPlay className="text-white h-5 w-5" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{movie.overview}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <FaCalendarAlt className="mr-1 h-3 w-3" />
                                    {new Date(movie.release_date).getFullYear()}
                                  </span>
                                  <button 
                                    className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      // Add to watchlist functionality
                                    }}
                                  >
                                    <FaPlus className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </>
            )}

            {/* Watchlist Tab Content */}
            {activeTab === 'watchlist' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
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
                              {category === 'Currently Watching' && <FaRegEye className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
                              {category === 'Plan to Watch' && <FaRegClock className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
                              {category === 'Completed' && <FaCheckCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
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
              </div>
            )}

            {/* Movies Tab Content */}
            {activeTab === 'movies' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaFilm className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Movie Collection
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the movie collection feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Add Movies
                  </button>
                </div>
              </div>
            )}

            {/* TV Shows Tab Content */}
            {activeTab === 'tv' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaTv className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    TV Show Tracking
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the TV show tracking feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Add TV Shows
                  </button>
                </div>
              </div>
            )}

            {/* Ratings Tab Content */}
            {activeTab === 'ratings' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaStar className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Your Ratings & Reviews
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the ratings feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Rate Content
                  </button>
                </div>
              </div>
            )}

            {/* Calendar Tab Content */}
            {activeTab === 'calendar' && (
              <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-6">
                    <FaCalendarAlt className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Release Calendar
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                    This is a placeholder for the calendar feature. More functionality will be added in future updates.
                  </p>
                  <button className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    View Calendar
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Trailer Modal with Blurred Background */}
      {showTrailer && popularMovies[currentFeaturedIndex]?.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Blurred background instead of black */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/40" onClick={closeTrailer}></div>
          <div className="relative w-full max-w-5xl z-10">
            <button
              onClick={closeTrailer}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
              aria-label="Close trailer"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            {/* Improved aspect ratio container with proper sizing */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-2xl">
              <iframe
                src={getYoutubeEmbedUrl(popularMovies[currentFeaturedIndex].trailerUrl)}
                title={`${popularMovies[currentFeaturedIndex].title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            </div>
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{popularMovies[currentFeaturedIndex].title} - Official Trailer</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}