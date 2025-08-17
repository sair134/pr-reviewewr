# Automate - PR Review Automation Monorepo

A comprehensive Nx monorepo for PR review automation with both SaaS and enterprise distribution options.

## 🏗️ Monorepo Structure

```
automate/
├── apps/
│   ├── express-integration/     # PR reviewer proxy (enterprise distribution)
│   └── next-frontend/          # Next.js SaaS frontend
├── packages/
│   └── shared/                 # Shared utilities and types
├── scripts/
│   └── build-enterprise.js     # Enterprise distribution builder
└── dist/
    └── enterprise/             # Enterprise distribution output
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for containerized deployment)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd automate
   npm install
   ```

2. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both:
- **Express Integration** on http://localhost:3000
- **Next.js Frontend** on http://localhost:3001

## 📦 Available Scripts

### Development
- `npm run dev` - Start both apps in development mode
- `npm run serve:express` - Start only Express integration
- `npm run serve:next` - Start only Next.js frontend

### Building
- `npm run build` - Build all applications
- `npm run build:enterprise` - Create enterprise distribution zip

### Code Quality
- `npm run lint` - Lint all applications
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests for all applications

### Utilities
- `npm run clean` - Clean Nx cache
- `npm run graph` - View dependency graph

## 🏢 Enterprise Distribution

The enterprise distribution includes only the Express integration app for self-hosted deployment:

```bash
npm run build:enterprise
```

This creates a zip file in `dist/enterprise/` containing:
- Express integration app
- Shared utilities
- Dockerfile
- Environment configuration
- Enterprise README
- Standalone package.json

## 🐳 Docker Deployment

### SaaS Mode (Both Apps)
```bash
docker-compose up
```

### Enterprise Mode (Express Only)
```bash
cd apps/express-integration
docker build -t automate-enterprise .
docker run -p 3000:3000 --env-file .env automate-enterprise
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_AUTHID` | GitHub OAuth Client ID | Yes |
| `GITHUB_AUTHSECRET` | GitHub OAuth Client Secret | Yes |
| `BITBUCKET_CLIENT_ID` | Bitbucket OAuth Client ID | Yes |
| `BITBUCKET_CLIENT_SECRET` | Bitbucket OAuth Client Secret | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `SAAS_API_BASE` | SaaS API base URL | No |

### Ports

- **Express Integration**: 3000
- **Next.js Frontend**: 3001

## 🏗️ Architecture

### Express Integration (`apps/express-integration`)
- Handles PR review logic
- GitHub/Bitbucket webhooks
- OAuth authentication
- License key validation
- Available for enterprise distribution

### Next.js Frontend (`apps/next-frontend`)
- SaaS application frontend
- User authentication
- Dashboard and analytics
- Proxies PR review requests to Express app
- Not included in enterprise distribution

### Shared Package (`packages/shared`)
- Common utilities and types
- License validation logic
- Authentication helpers
- Used by both apps

## 🔐 Authentication

### SaaS Mode
- Next.js handles user authentication
- JWT tokens for session management
- OAuth integration for GitHub/Bitbucket

### Enterprise Mode
- License key validation required
- Direct OAuth integration
- No SaaS frontend included

## 📊 Features

### PR Review Automation
- AI-powered code analysis
- GitHub and Bitbucket integration
- Real-time webhook processing
- Customizable review rules

### SaaS Features
- User dashboard
- Repository management
- Analytics and reporting
- Team collaboration

### Enterprise Features
- Self-hosted deployment
- License key validation
- Custom branding options
- Advanced security controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **SaaS Support**: support@automate-saas.com
- **Enterprise Support**: enterprise@automate-saas.com
- **Documentation**: https://docs.automate-saas.com
