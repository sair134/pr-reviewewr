export interface PRReviewRequest {
  provider: 'github' | 'bitbucket';
  repository: string;
  pullRequestId: string;
  token: string;
}

export interface PRReviewResponse {
  success: boolean;
  comments?: PRComment[];
  error?: string;
}

export interface PRComment {
  path: string;
  line: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface Repository {
  id: string;
  provider: 'github' | 'bitbucket';
  fullName: string;
  defaultBranch: string;
  token: string;
  refreshToken?: string;
}

export interface AuthResponse {
  ok: boolean;
  provider: 'github' | 'bitbucket';
  token: string;
  refreshToken?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SaaSUser {
  id: string;
  email: string;
  name: string;
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    features: string[];
    expiresAt?: Date;
  };
}
