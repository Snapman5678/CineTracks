'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaTrash, FaArrowLeft, FaFilm, FaTv, FaList, FaSignOutAlt, FaStar, FaCalendarAlt, FaCog, FaUserCircle, FaSearch, FaPlay } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmittingProfileUpdate, setIsSubmittingProfileUpdate] = useState(false);
  const [isSubmittingPasswordChange, setIsSubmittingPasswordChange] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const { user, updateUser, changePassword, deleteUser, isLoading, error, clearError, isGuest, logout } = useAuth();
  const router = useRouter();

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setActiveSidebar(!activeSidebar);
  };

  // Toggle profile menu dropdown
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email || '');
    }
    clearError();
  }, [user, clearError]);

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
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    
    if (username.trim() === '') {
      setValidationError('Username cannot be empty');
      return;
    }
    
    if (email && !validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      return;
    }

    // Prevent multiple submissions
    if (isSubmittingProfileUpdate) return;
    setIsSubmittingProfileUpdate(true);

    try {
      await updateUser(username, email);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSubmittingProfileUpdate(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMessage('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('All password fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }
    
    // Prevent multiple submissions
    if (isSubmittingPasswordChange) return;
    setIsSubmittingPasswordChange(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      setSuccessMessage('Password changed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsSubmittingPasswordChange(false);
    }
  };

  const handleAccountDelete = async () => {
    if (confirmDelete) {
      try {
        await deleteUser();
        // Deletion handled by AuthContext (logs out and redirects)
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    } else {
      setConfirmDelete(true);
      
      // Auto-cancel after 5 seconds
      setTimeout(() => {
        setConfirmDelete(false);
      }, 5000);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          activeSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900">
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
            {sidebarItems.map((item) => (
              <Link 
                key={item.id} 
                href={item.href}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                  false // Not active in profile page
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            
            <div
              className="flex items-center space-x-3 w-full p-3 rounded-lg transition-colors 
                bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 cursor-pointer mt-4"
            >
              <FaCog className="h-5 w-5" />
              <span>Account Settings</span>
            </div>
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
                    <Link href="/dashboard">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center">
                        <FaList className="mr-2 h-4 w-4" />
                        My Watchlist
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

        {/* Profile content */}
        <main className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
            </div>
            
            {successMessage && (
              <motion.div 
                className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-200 rounded-md shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <FaCheck className="mr-2" />
                  <span>{successMessage}</span>
                </div>
              </motion.div>
            )}
            
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-200 rounded-md shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p>{error}</p>
              </motion.div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Profile Information</h2>
                {!isEditing && !isGuest && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="Your username"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          placeholder="Your email"
                        />
                      </div>
                    </div>
                    
                    {validationError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={isLoading || isSubmittingProfileUpdate}
                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingProfileUpdate ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          if (user) {
                            setUsername(user.username);
                            setEmail(user.email || '');
                          }
                        }}
                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">{username}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {email || 'No email provided'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">
                      {isGuest ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Guest
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Registered User
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {isGuest && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create an Account</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Save your data permanently</p>
                    </div>
                    <button
                      onClick={() => router.push('/register')}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Password Section (only for registered users) */}
            {!isGuest && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Password</h2>
                  {!isChangingPassword && (
                    <button 
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-md dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 transition-colors"
                    >
                      Change Password
                    </button>
                  )}
                </div>
                
                {isChangingPassword ? (
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Current Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            placeholder="Your current password"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            placeholder="Create a new password"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Confirm New Password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLock className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                            placeholder="Confirm your new password"
                          />
                        </div>
                      </div>
                      
                      {validationError && (
                        <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>
                      )}
                      
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={isLoading || isSubmittingPasswordChange}
                          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingPasswordChange ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </span>
                          ) : 'Update Password'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Your password is securely stored. For security reasons, we recommend changing your password regularly.
                  </p>
                )}
              </div>
            )}

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-6">Danger Zone</h2>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Delete Account</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    This will permanently delete your account and all associated data.
                  </p>
                </div>
                <button
                  onClick={handleAccountDelete}
                  className={`mt-4 md:mt-0 px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${confirmDelete ? 
                      'bg-red-600 text-white hover:bg-red-700' : 
                      'bg-white text-red-600 border border-red-600 hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900/30'
                    }`}
                >
                  {confirmDelete ? 'Confirm Delete' : 'Delete Account'}
                </button>
              </div>

              {confirmDelete && (
                <motion.div 
                  className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <p className="text-sm">
                    This action cannot be undone. All your data will be permanently deleted. 
                    Please click "Confirm Delete" to proceed or click anywhere else to cancel.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}