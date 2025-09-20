'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface User {
  email?: string;
  name: string;
  image?: string;
  githubToken?: string;
  bitbucketToken?: string;
  githubUsername?: string;
  bitbucketUsername?: string;
  githubId?: string;
  bitbucketId?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    // Clear user data and redirect to login
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <nav className="bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-white">
            Automate
          </Link>

          {/* Links */}
          <div className="flex space-x-6">
            <Link href="/pricing" className="text-gray-300 hover:text-white text-sm font-medium">
              Pricing
            </Link>
            <Link href="/blogs" className="text-gray-300 hover:text-white text-sm font-medium">
              Blogs
            </Link>
            
            {loading ? (
              <div className="text-gray-300 text-sm">Loading...</div>
            ) : user ? (
              // User is logged in - show logout and user info
              <>
                <Link
                  href="/home"
                  className="text-gray-300 hover:text-white text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              // User is not logged in - show login and signup
              <>
                <Link href="/login" className="text-gray-300 hover:text-white text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Get Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
