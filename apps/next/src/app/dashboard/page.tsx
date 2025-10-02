'use client';

import { useState, useEffect, Suspense } from 'react';
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
  workspace?: string; // For Bitbucket
  cloneUrl?: string;
}

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

function DashboardContent() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRepositories, setShowRepositories] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<{github: boolean, bitbucket: boolean}>({
    github: false,
    bitbucket: false
  });
  const [webhookStatus, setWebhookStatus] = useState<{[key: string]: 'idle' | 'creating' | 'success' | 'error'}>({});
  const [existingWebhooks, setExistingWebhooks] = useState<{[key: string]: boolean}>({});
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
      console.log(`Fetching ${provider} repositories...`);
      const response = await fetch(`/api/repos/${provider}`);
      
      if (response.ok) {
        const repos = await response.json();
        console.log(`Received ${repos.length} ${provider} repositories`);
        setRepositories(prev => [...prev, ...repos]);
      } else {
        const errorData = await response.json();
        console.error(`Error fetching ${provider} repos:`, errorData);
      }
    } catch (error) {
      console.error(`Error fetching ${provider} repos:`, error);
    }
  };

  const handleConnectGitHub = () => {
    window.location.href = '/api/auth/github/connect';
  };

  const handleConnectBitbucket = () => {
    window.location.href = '/api/auth/bitbucket/connect';
  };

  const handleLoadRepositories = () => {
    setShowRepositories(true);
    if (connectedProviders.github) fetchRepositories('github');
    if (connectedProviders.bitbucket) fetchRepositories('bitbucket');
    fetchExistingWebhooks();
  };

  const fetchExistingWebhooks = async () => {
    try {
      const response = await fetch('/api/webhooks/create');
      if (response.ok) {
        const data = await response.json();
        const webhookMap: {[key: string]: boolean} = {};
        
        data.repositories.forEach((repo: any) => {
          const repoKey = `${repo.provider}-${repo.id}`;
          webhookMap[repoKey] = true;
        });
        
        setExistingWebhooks(webhookMap);
      }
    } catch (error) {
      console.error('Error fetching existing webhooks:', error);
    }
  };

  const handleCreateWebhook = async (repo: Repository, provider: 'github' | 'bitbucket') => {
    const repoKey = `${provider}-${repo.id}`;
    setWebhookStatus(prev => ({ ...prev, [repoKey]: 'creating' }));

    try {
      const response = await fetch('/api/webhooks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          repositoryId: repo.id,
          repositoryData: repo,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setWebhookStatus(prev => ({ ...prev, [repoKey]: 'success' }));
        setExistingWebhooks(prev => ({ ...prev, [repoKey]: true }));
        alert(`Webhook created successfully for ${repo.fullName}! The system will now automatically review pull requests.`);
      } else {
        setWebhookStatus(prev => ({ ...prev, [repoKey]: 'error' }));
        alert(`Failed to create webhook: ${result.error}`);
      }
    } catch (error) {
      setWebhookStatus(prev => ({ ...prev, [repoKey]: 'error' }));
      console.error('Error creating webhook:', error);
      alert('Failed to create webhook. Please try again.');
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
            
            {/* Connection Options */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Your Accounts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GitHub Connection */}
                <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">GitHub</h4>
                        <p className="text-sm text-gray-500">
                          {connectedProviders.github ? `Connected as ${user?.githubUsername}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleConnectGitHub}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
                    >
                      {connectedProviders.github ? 'Reconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                {/* Bitbucket Connection */}
                <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.26a.772.772 0 00.77-.646l3.27-20.03a.772.772 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Bitbucket</h4>
                        <p className="text-sm text-gray-500">
                          {connectedProviders.bitbucket ? `Connected as ${user?.bitbucketUsername}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleConnectBitbucket}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      {connectedProviders.bitbucket ? 'Reconnect' : 'Connect'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Load Repositories Button - Only show if providers are connected */}
            {(connectedProviders.github || connectedProviders.bitbucket) && !showRepositories && (
              <div className="mt-6">
                <button 
                  onClick={handleLoadRepositories}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium"
                >
                  Load Repositories
                </button>
              </div>
            )}
            
            {!connectedProviders.github && !connectedProviders.bitbucket && (
              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-4">
                  Connect at least one account to view repositories
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleConnectGitHub}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Connect GitHub
                  </button>
                  <button
                    onClick={handleConnectBitbucket}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.26a.772.772 0 00.77-.646l3.27-20.03a.772.772 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
                    </svg>
                    Connect Bitbucket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Repositories Section - Only show if repositories are loaded */}
        {showRepositories && (
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Connected Repositories</h3>
              <button
                onClick={() => setShowRepositories(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide Repositories
              </button>
            </div>
            {loading ? (
              <div className="text-gray-500">Loading repositories...</div>
            ) : repositories.length === 0 ? (
              <div className="text-gray-500">No repositories found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {repositories.map((repo) => {
                  // Determine provider based on repository data
                  const provider = repo.workspace ? 'bitbucket' : 'github';
                  const repoKey = `${provider}-${repo.id}`;
                  const hasExistingWebhook = existingWebhooks[repoKey];
                  const status = hasExistingWebhook ? 'success' : (webhookStatus[repoKey] || 'idle');

                  return (
                    <div key={repo.id} className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                {provider === 'github' ? (
                                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.26a.772.772 0 00.77-.646l3.27-20.03a.772.772 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
                                  </svg>
                                )}
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
                        <div className="mt-4">
                          <button
                            onClick={() => handleCreateWebhook(repo, provider)}
                            disabled={status === 'creating' || hasExistingWebhook}
                            className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                              status === 'creating' || hasExistingWebhook
                                ? 'bg-gray-400 cursor-not-allowed'
                                : status === 'success'
                                ? 'bg-green-600 hover:bg-green-700'
                                : status === 'error'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                          >
                            {status === 'creating' && (
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            )}
                            {status === 'success' && (
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {status === 'error' && (
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            {status === 'creating' && 'Creating Webhook...'}
                            {status === 'success' && 'Webhook Active'}
                            {status === 'error' && 'Retry Setup'}
                            {status === 'idle' && 'Review this PR'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
