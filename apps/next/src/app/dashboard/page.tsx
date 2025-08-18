'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Repository {
  id: string;
  provider: 'github' | 'bitbucket';
  fullName: string;
  defaultBranch: string;
}

export default function DashboardPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from your API
    setRepositories([
      {
        id: '1',
        provider: 'github',
        fullName: 'example/repo-1',
        defaultBranch: 'main'
      },
      {
        id: '2',
        provider: 'bitbucket',
        fullName: 'example/repo-2',
        defaultBranch: 'develop'
      }
    ]);
    setLoading(false);
  }, []);

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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Automate</h2>
            <p className="text-gray-600 mb-6">
              Connect your repositories to start automating your pull request reviews.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Connect Repository
            </button>
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
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          {repo.provider === 'github' ? 'G' : 'B'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{repo.fullName}</h4>
                        <p className="text-sm text-gray-500">{repo.provider}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
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
