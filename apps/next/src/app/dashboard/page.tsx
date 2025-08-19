'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  language?: string;
  updatedAt: string;
}

interface User {
  email: string;
  name: string;
  image?: string;
  githubToken?: string;
  bitbucketToken?: string;
  githubUsername?: string;
  bitbucketUsername?: string;
}

export default function DashboardPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectedProviders, setConnectedProviders] = useState<{github: boolean, bitbucket: boolean}>({
    github: false,
    bitbucket: false
  });
  const searchParams = useSearchParams();
  const connected = searchParams.get('connected');

  useEffect(() => {
    fetchUserData();
    if (connected) {
      // Show success message for newly connected provider
      setTimeout(() => {
        alert(`${connected} connected successfully!`);
      }, 1000);
    }
  }, [connected]);

  const fetchUserData = async () => {
    try {
      // In a real app, you'd get the user from the session
      // For now, we'll simulate with localStorage or make an API call
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setConnectedProviders({
          github: !!userData.githubToken,
          bitbucket: !!userData.bitbucketToken
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    setLoading(false);
  };

  const fetchRepositories = async (provider: 'github' | 'bitbucket') => {
    try {
      const response = await fetch(`/api/repos/${provider}`, {
        headers: {
          'Authorization': `Bearer ${provider === 'github' ? user?.githubToken : user?.bitbucketToken}`
        }
      });
      
      if (response.ok) {
        const repos = await response.json();
        setRepositories(prev => [...prev, ...repos]);
      }
    } catch (error) {
      console.error(`Error fetching ${provider} repos:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Automate Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/settings"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  // Handle logout
                  window.location.href = '/login';
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome {user?.name || 'to Automate'}
            </h2>
            <p className="text-gray-600 mb-6">
              Connect your repositories to start automating your pull request reviews.
            </p>
            
            {/* Repository Loading */}
            {(connectedProviders.github || connectedProviders.bitbucket) && (
              <div className="mt-4">
                <button 
                  onClick={() => {
                    if (connectedProviders.github) fetchRepositories('github');
                    if (connectedProviders.bitbucket) fetchRepositories('bitbucket');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Load Repositories
                </button>
              </div>
            )}
            
            {!connectedProviders.github && !connectedProviders.bitbucket && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  Connect your accounts to view repositories
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Go to Login
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Repositories Section */}
        <div className="px-4 py-6 sm:px-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Repositories</h3>
          {loading ? (
            <div className="text-gray-500">Loading repositories...</div>
          ) : repositories.length === 0 ? (
            <div className="text-gray-500">No repositories connected yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {repositories.map((repo) => (
                <div key={repo.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{repo.name}</h4>
                          <p className="text-sm text-gray-500">{repo.fullName}</p>
                          {repo.description && (
                            <p className="text-sm text-gray-400 mt-1">{repo.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {repo.private && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-1">
                            Private
                          </span>
                        )}
                        {repo.language && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {repo.language}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Branch: {repo.defaultBranch}
                      </span>
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Repository
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="px-4 py-6 sm:px-0">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              <li className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">PR Review completed</p>
                      <p className="text-sm text-gray-500">example/repo-1 #123</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>
              </li>
              <li className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Repository connected</p>
                      <p className="text-sm text-gray-500">example/repo-2</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">1 day ago</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
