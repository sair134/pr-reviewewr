# Webhook Setup Guide

This guide explains how to set up and use the automated PR review system with webhooks for GitHub and Bitbucket.

## Overview

The system automatically creates webhooks for your repositories when you click "Review this PR" in the dashboard. These webhooks will trigger automated code reviews whenever pull requests are created or updated.

## Features

- **GitHub Integration**: Creates webhooks using GitHub's REST API
- **Bitbucket Integration**: Creates webhooks using Bitbucket's API
- **Database Storage**: Saves repository details and webhook information
- **Automatic PR Reviews**: Triggers AI-powered code reviews on PR events
- **Webhook Verification**: Secure webhook signature verification

## Setup Instructions

### 1. Environment Variables

Make sure your `.env` file includes:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/automate

# GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:4200/api/auth/github/callback
GITHUB_SCOPE=repo user

# Bitbucket OAuth
BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
BITBUCKET_REDIRECT_URI=http://localhost:4200/api/auth/bitbucket/callback
BITBUCKET_SCOPE=repository:read

# NextAuth
NEXTAUTH_URL=http://localhost:4200
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Express API (for PR review proxy)
EXPRESS_API_URL=http://localhost:3333

# FastAPI (for AI processing)
FASTAPI_URL=http://localhost:8000

# Encryption
ENCRYPTION_KEY=your-secret-encryption-key-32-chars-long
```

### 2. Database Models

The system uses two main models:

#### User Model
- Stores encrypted GitHub and Bitbucket tokens
- Links users to their connected accounts

#### Repository Model
- Stores repository details (name, full name, provider, etc.)
- Stores webhook information (ID, URL, secret)
- Links repositories to users
- Tracks webhook status (active/inactive)

### 3. Webhook Creation Process

1. **User Authentication**: User connects GitHub/Bitbucket accounts
2. **Repository Loading**: System fetches user's repositories
3. **Webhook Creation**: User clicks "Review this PR" button
4. **API Call**: Frontend calls `/api/webhooks/create`
5. **Webhook Setup**: System creates webhook via platform API
6. **Database Storage**: Repository and webhook details saved
7. **Confirmation**: User receives success notification

### 4. Webhook Endpoints

#### GitHub Webhook Endpoint
- **URL**: `/api/webhooks/github`
- **Events**: `pull_request` (opened, edited, synchronize)
- **Verification**: Uses `X-Hub-Signature-256` header

#### Bitbucket Webhook Endpoint
- **URL**: `/api/webhooks/bitbucket`
- **Events**: `pullrequest:created`, `pullrequest:updated`, `pullrequest:approved`, `pullrequest:unapproved`
- **Verification**: Uses `X-Hub-Signature-256` header

### 5. API Endpoints

#### Create Webhook
```http
POST /api/webhooks/create
Content-Type: application/json

{
  "provider": "github" | "bitbucket",
  "repositoryId": "string",
  "repositoryData": {
    "id": "string",
    "name": "string",
    "fullName": "string",
    "description": "string",
    "private": boolean,
    "defaultBranch": "string",
    "htmlUrl": "string",
    "cloneUrl": "string",
    "language": "string",
    "workspace": "string" // For Bitbucket only
  }
}
```

#### List Webhooks
```http
GET /api/webhooks/create
```

#### Test Webhook System
```http
GET /api/webhooks/test
```

## Usage

### 1. Connect Accounts
1. Go to the dashboard
2. Click "Connect" for GitHub and/or Bitbucket
3. Complete OAuth flow

### 2. Load Repositories
1. Click "Load Repositories" button
2. System fetches repositories from connected accounts

### 3. Enable PR Reviews
1. For each repository, click "Review this PR"
2. System creates webhook and saves repository details
3. Button changes to "Webhook Active" when successful

### 4. Automatic Reviews
- When PRs are created or updated, webhooks trigger
- System forwards webhook to Express API
- Express API processes the PR and generates reviews
- Reviews are posted as comments on the PR

## Security

- **Token Encryption**: All access tokens are encrypted before storage
- **Webhook Verification**: All incoming webhooks are verified using HMAC signatures
- **Database Indexing**: Unique constraints prevent duplicate webhooks
- **Error Handling**: Comprehensive error handling and logging

## Troubleshooting

### Common Issues

1. **Webhook Creation Fails**
   - Check if user has proper permissions on the repository
   - Verify OAuth token has required scopes
   - Check network connectivity to platform APIs

2. **Webhooks Not Triggering**
   - Verify webhook URL is accessible from the internet
   - Check webhook secret configuration
   - Review platform webhook delivery logs

3. **Database Errors**
   - Ensure MongoDB is running and accessible
   - Check database connection string
   - Verify model schemas are correct

### Debug Endpoints

- `GET /api/webhooks/test` - Test webhook system status
- `GET /api/webhooks/create` - List all configured webhooks

## Development

### Adding New Platforms

1. Create webhook creation function in `webhook-utils.ts`
2. Add webhook endpoint in `apps/next/src/app/api/webhooks/[platform]/route.ts`
3. Update frontend to handle new platform
4. Add platform-specific repository data handling

### Testing

1. Use webhook testing tools (ngrok for local development)
2. Test webhook creation with different repository types
3. Verify webhook signature verification works
4. Test error handling scenarios

## References

- [GitHub Webhooks API](https://docs.github.com/en/rest/repos/webhooks)
- [Bitbucket Webhooks API](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-hooks-post)
- [Webhook Security Best Practices](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks)
