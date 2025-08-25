'use client';

import Link from 'next/link';
import { useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

export default function HomePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'dark-bg' : ''}`}>
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
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-white'}`}>PR Reviewer</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/login"
                className={`${isDark ? 'text-white hover:text-purple-200' : 'text-white hover:text-purple-200'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className={`${isDark ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative ${isDark ? 'dark-bg' : 'gradient-bg'} overflow-hidden pt-16`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="relative pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">AI-Powered</span>{' '}
                  <span className="block text-purple-200 xl:inline">PR Reviews</span>
                </h1>
                <p className="mt-3 text-base text-purple-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Streamline your development workflow with intelligent code reviews. 
                  Get instant feedback, catch issues early, and maintain code quality across your team.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href="/signup"
                      className="btn-primary w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg md:py-4 md:text-lg md:px-10"
                    >
                      Get started for free
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/payments"
                      className="btn-secondary w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-lg md:py-4 md:text-lg md:px-10"
                    >
                      View Pricing
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 ${isDark ? 'dark-bg' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className={`text-base text-purple-600 font-semibold tracking-wide uppercase`}>Features</h2>
            <p className={`mt-2 text-3xl leading-8 font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Everything you need for better code reviews
            </p>
            <p className={`mt-4 max-w-2xl text-xl ${isDark ? 'text-gray-300' : 'text-gray-500'} lg:mx-auto`}>
              Leverage the power of AI to transform your code review process
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>AI-Powered Reviews</h3>
                  <p className={`mt-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Get intelligent feedback on your code changes with our advanced AI analysis that understands context and best practices.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Real-time Integration</h3>
                  <p className={`mt-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Seamlessly integrate with GitHub and Bitbucket for instant review notifications and automated workflows.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics Dashboard</h3>
                  <p className={`mt-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Track your team's review performance, identify bottlenecks, and measure code quality improvements over time.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className={`text-lg leading-6 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Enterprise Security</h3>
                  <p className={`mt-2 text-base ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    Self-hosted options available for enterprise customers with strict security requirements and compliance needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg-alt">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-pink-200">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg"
              >
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/payments"
                className="btn-secondary inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-lg"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
