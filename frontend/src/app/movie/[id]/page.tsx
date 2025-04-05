'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowLeft, FaPlay, FaStar, FaCalendarAlt, FaClock, FaGlobe, FaMoneyBillWave, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaCircle, FaUserCircle, FaSearch } from 'react-icons/fa';

// Extended Movie interface with additional details
interface DetailedMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime?: number;
  budget?: number;
  revenue?: number;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; name: string; logo_path?: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  homepage?: string;
  tagline?: string;
  status?: string;
  trailerUrl?: string;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
  similar?: {
    results: {
      id: number;
      title: string;
      poster_path: string | null;
      vote_average: number;
    }[];
  };
}

// Define route params interface
interface MoviePageProps {
  params: {
    id: string;
  };
}

export default function MovieDetails({ params }: MoviePageProps) {
  const movieId = params.id;

  const { user, logout, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const [movie, setMovie] = useState<DetailedMovie | null>(null);
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Toggle profile menu dropdown
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Protect this page - redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Fetch detailed movie info
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setIsLoadingMovie(true);
        // Get basic movie details
        const response = await fetch(`/api/movie-catalog/movies/${movieId}`);
        if (!response.ok) {
          throw new Error('Movie not found');
        }
        const movieData = await response.json();

        setMovie(movieData);
        setIsLoadingMovie(false);
      } catch (error) {
        console.error('Error fetching movie details:', error);
        setIsLoadingMovie(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();
    }
  }, [movieId]);

  // Watch trailer functionality
  const openTrailer = () => {
    if (movie?.trailerUrl) {
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
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  };

  // Toggle watchlist status
  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    // Here you would call your API to update the user's watchlist
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would call your API to update the user's favorites
  };

  // Helper function to format runtime
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'Unknown';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function for number formatting
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Function to get movie poster URL
  const getMoviePosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  };

  // Function to get movie backdrop URL
  const getMovieBackdropUrl = (backdropPath: string | null) => {
    if (!backdropPath) return '';
    return `https://image.tmdb.org/t/p/original${backdropPath}`;
  };

  // Function to get profile image URL
  const getProfileImageUrl = (profilePath: string | null) => {
    if (!profilePath) return '';
    return `https://image.tmdb.org/t/p/w185${profilePath}`;
  };

  // Loading state
  if (isLoading || isLoadingMovie) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-xl font-medium text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Movie not found
  if (!movie) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-900 px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">Movie Not Found</h1>
        <p className="mb-8 text-xl text-gray-300">
          We couldn't find the movie you're looking for.
        </p>
        <Link href="/home">
          <div className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-lg transition-colors hover:bg-indigo-700">
            <FaArrowLeft />
            <span>Back to Home</span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header/Navigation Bar */}
      <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/home">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white cursor-pointer">
                <span className="text-indigo-600 dark:text-indigo-400">Cine</span>Tracks
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search movies & shows..."
                className="w-64 py-2 pl-10 pr-4 rounded-lg bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm dark:text-white"
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
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
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{user?.username || 'Guest'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'Guest User'}</p>
                  </div>
                  <Link href="/dashboard">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaBookmark className="mr-2 h-4 w-4" />
                      My Watchlist
                    </div>
                  </Link>
                  <Link href="/dashboard/profile">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                      <FaCircle className="mr-2 h-4 w-4" />
                      Account Settings
                    </div>
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                  >
                    <FaArrowLeft className="mr-2 h-4 w-4" />
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

      {/* Hero Section with Backdrop */}
      <div className="relative h-[70vh] w-full">
        {/* Backdrop Image */}
        {movie.backdrop_path && (
          <div className="absolute inset-0">
            <Image
              src={getMovieBackdropUrl(movie.backdrop_path)}
              alt={movie.title}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50"></div>
          </div>
        )}

        {/* Navigation and content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Back button */}
          <div className="p-6">
            <Link href="/home">
              <div className="inline-flex items-center space-x-2 rounded-lg bg-black/30 px-4 py-2 font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50">
                <FaArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </div>
            </Link>
          </div>

          {/* Movie info */}
          <div className="mt-auto flex flex-col md:flex-row items-end space-y-6 md:space-y-0 md:space-x-8 p-6 md:p-12">
            {/* Poster */}
            <div className="hidden md:block relative h-72 w-48 shrink-0 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-105">
              {movie.poster_path ? (
                <Image
                  src={getMoviePosterUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-800">
                  <span className="text-gray-400">No Poster</span>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <div className="w-full">
              {/* Title and Tagline */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {movie.title}
              </h1>

              {movie.tagline && (
                <p className="mb-4 text-xl text-gray-300 italic">
                  {movie.tagline}
                </p>
              )}

              {/* Basic Info Row */}
              <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                {movie.release_date && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1 h-4 w-4 text-gray-400" />
                    {new Date(movie.release_date).getFullYear()}
                  </div>
                )}

                {movie.runtime && (
                  <div className="flex items-center">
                    <FaClock className="mr-1 h-4 w-4 text-gray-400" />
                    {formatRuntime(movie.runtime)}
                  </div>
                )}

                {movie.vote_average && (
                  <div className="flex items-center">
                    <FaStar className="mr-1 h-4 w-4 text-yellow-500" />
                    {movie.vote_average.toFixed(1)}/10 ({movie.vote_count} votes)
                  </div>
                )}

                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full bg-indigo-600/90 px-3 py-1 text-xs font-medium text-white"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {movie.trailerUrl && (
                  <button
                    onClick={openTrailer}
                    className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <FaPlay className="h-4 w-4" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                <button
                  onClick={toggleWatchlist}
                  className="flex items-center gap-2 rounded-md bg-gray-700/80 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  {isInWatchlist ? <FaBookmark className="h-4 w-4" /> : <FaRegBookmark className="h-4 w-4" />}
                  <span>{isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 rounded-md bg-gray-700/80 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  {isFavorite ? <FaHeart className="h-4 w-4 text-red-500" /> : <FaRegHeart className="h-4 w-4" />}
                  <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Overview and Details */}
          <div className="md:col-span-2 space-y-8">
            {/* Overview */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Overview</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {showFullOverview || movie.overview.length <= 400 
                  ? movie.overview 
                  : `${movie.overview.substring(0, 400)}...`}
                {movie.overview.length > 400 && (
                  <button
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    className="ml-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline focus:outline-none"
                  >
                    {showFullOverview ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>
            </section>

            {/* Cast Section */}
            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Top Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.credits.cast.slice(0, 8).map((person) => (
                    <div key={person.id} className="flex flex-col items-center text-center">
                      <div className="h-24 w-24 rounded-full overflow-hidden mb-2">
                        {person.profile_path ? (
                          <Image
                            src={getProfileImageUrl(person.profile_path)}
                            alt={person.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                            <span className="text-gray-400 text-xs">No Photo</span>
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">{person.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">{person.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Movies */}
            {movie.similar?.results && movie.similar.results.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Similar Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {movie.similar.results.slice(0, 4).map((similarMovie) => (
                    <Link key={similarMovie.id} href={`/movie/${similarMovie.id}`}>
                      <div className="rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                        <div className="relative aspect-[2/3]">
                          {similarMovie.poster_path ? (
                            <Image
                              src={getMoviePosterUrl(similarMovie.poster_path)}
                              alt={similarMovie.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                              <span className="text-gray-400 text-sm">No Poster</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-indigo-600/90 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {similarMovie.vote_average.toFixed(1)}
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-800">
                          <h3 className="font-medium text-gray-800 dark:text-white text-sm truncate">
                            {similarMovie.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Movie Info */}
          <div className="space-y-6">
            {/* Movie Poster (Mobile Only) */}
            <div className="md:hidden relative aspect-[2/3] max-w-xs mx-auto rounded-lg overflow-hidden shadow-lg">
              {movie.poster_path ? (
                <Image
                  src={getMoviePosterUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <span className="text-gray-400">No Poster</span>
                </div>
              )}
            </div>

            {/* Movie Details */}
            <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Movie Details</h2>

              <div className="space-y-4">
                {movie.status && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p className="text-gray-800 dark:text-white">{movie.status}</p>
                  </div>
                )}

                {movie.release_date && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Release Date</h3>
                    <p className="text-gray-800 dark:text-white">
                      {new Date(movie.release_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}

                {movie.budget !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Budget</h3>
                    <p className="text-gray-800 dark:text-white">{formatCurrency(movie.budget)}</p>
                  </div>
                )}

                {movie.revenue !== undefined && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
                    <p className="text-gray-800 dark:text-white">{formatCurrency(movie.revenue)}</p>
                  </div>
                )}

                {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages</h3>
                    <p className="text-gray-800 dark:text-white">
                      {movie.spoken_languages.map(lang => lang.english_name).join(', ')}
                    </p>
                  </div>
                )}

                {movie.production_countries && movie.production_countries.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Production Countries</h3>
                    <p className="text-gray-800 dark:text-white">
                      {movie.production_countries.map(country => country.name).join(', ')}
                    </p>
                  </div>
                )}

                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Production Companies</h3>
                    <div className="space-y-2 mt-2">
                      {movie.production_companies.map(company => (
                        <div key={company.id} className="flex items-center space-x-2">
                          <FaCircle className="h-1.5 w-1.5 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{company.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {movie.homepage && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</h3>
                    <a 
                      href={movie.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
                    >
                      <FaGlobe className="h-3.5 w-3.5" />
                      <span>Official Website</span>
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Crew Section */}
            {movie.credits?.crew && movie.credits.crew.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Key Crew</h2>
                <div className="space-y-3">
                  {/* Filter for director */}
                  {movie.credits.crew.filter(p => p.job === 'Director').slice(0, 1).map(person => (
                    <div key={`${person.id}-${person.job}`}>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Director</h3>
                      <p className="text-gray-800 dark:text-white">{person.name}</p>
                    </div>
                  ))}

                  {/* Filter for producers */}
                  {movie.credits.crew.filter(p => p.job === 'Producer').slice(0, 1).map(person => (
                    <div key={`${person.id}-${person.job}`}>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Producer</h3>
                      <p className="text-gray-800 dark:text-white">{person.name}</p>
                    </div>
                  ))}

                  {/* Filter for screenplay */}
                  {movie.credits.crew.filter(p => p.job === 'Screenplay').slice(0, 1).map(person => (
                    <div key={`${person.id}-${person.job}`}>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Screenplay</h3>
                      <p className="text-gray-800 dark:text-white">{person.name}</p>
                    </div>
                  ))}

                  {/* Filter for cinematography */}
                  {movie.credits.crew.filter(p => p.job === 'Director of Photography').slice(0, 1).map(person => (
                    <div key={`${person.id}-${person.job}`}>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Cinematography</h3>
                      <p className="text-gray-800 dark:text-white">{person.name}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal with Blurred Background */}
      {showTrailer && movie.trailerUrl && (
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

            {/* Video container with proper aspect ratio */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-2xl">
              <iframe
                src={getYoutubeEmbedUrl(movie.trailerUrl)}
                title={`${movie.title} Trailer`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            </div>

            {/* Movie title below video */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-bold">{movie.title} - Official Trailer</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}