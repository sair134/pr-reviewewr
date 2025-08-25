'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function DashboardPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isDark = theme === 'dark';
  const isSuccess = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Check if user has an active subscription
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark-bg' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark-bg' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`${isDark ? 'glass-dark' : 'glass'} fixed w-full z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PR Reviewer</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                className={`${isDark ? 'text-white hover:text-purple-200' : 'text-gray-700 hover:text-gray-900'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Success Message */}
      {isSuccess && (
        <div className="pt-16 pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6 mb-8`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Payment Successful!
                  </h3>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Thank you for subscribing to PR Reviewer. Your account has been upgraded and you now have access to all premium features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              Welcome to PR Reviewer
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Your AI-powered code review assistant
            </p>
          </div>

          {/* Subscription Status */}
          <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6 mb-8`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Subscription Status
            </h2>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Plan:</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {subscription.plan === 'free' ? 'Free Trial' : 
                     subscription.plan === 'monthly' ? 'Monthly Pro' : 'Team Pro'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {subscription.status === 'active' ? 'Active' : 'Trial'}
                  </span>
                </div>
                {subscription.prReviewsUsed && (
                  <div className="flex items-center justify-between">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>PR Reviews Used:</span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {subscription.prReviewsUsed} / {subscription.prReviewsLimit || '∞'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading subscription details...
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Review PR
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Submit a pull request for AI-powered review
              </p>
              <button className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
                Start Review
              </button>
            </div>

            <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                View Analytics
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Check your review performance and insights
              </p>
              <button className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
                View Analytics
              </button>
            </div>

            <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Settings
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Manage your account and preferences
              </p>
              <button className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium">
                Open Settings
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${isDark ? 'modern-card-dark' : 'modern-card'} p-6`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Welcome to PR Reviewer! Your account is now active.
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Just now
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
