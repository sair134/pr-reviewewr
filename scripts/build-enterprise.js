const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ENTERPRISE_DIR = 'dist/enterprise';
const EXPRESS_APP_DIR = 'apps/express-integration';

// Ensure enterprise directory exists
if (!fs.existsSync(ENTERPRISE_DIR)) {
  fs.mkdirSync(ENTERPRISE_DIR, { recursive: true });
}

// Create a new zip file
const zip = new AdmZip();

// Add Express app files
function addDirectoryToZip(dirPath, zipPath = '') {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const relativePath = path.join(zipPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other unnecessary directories
      if (item === 'node_modules' || item === '.git' || item === 'dist') {
        continue;
      }
      addDirectoryToZip(fullPath, relativePath);
    } else {
      // Skip unnecessary files
      if (item === '.DS_Store' || item === 'Thumbs.db' || item.endsWith('.log')) {
        continue;
      }
      zip.addLocalFile(fullPath, zipPath);
    }
  }
}

// Add Express integration app
console.log('Adding Express integration app...');
addDirectoryToZip(EXPRESS_APP_DIR, 'express-integration');

// Add shared package (only the built version)
const sharedDistPath = 'dist/packages/shared';
if (fs.existsSync(sharedDistPath)) {
  console.log('Adding shared package...');
  addDirectoryToZip(sharedDistPath, 'shared');
}

// Add Dockerfile
if (fs.existsSync('apps/express-integration/Dockerfile')) {
  console.log('Adding Dockerfile...');
  zip.addLocalFile('apps/express-integration/Dockerfile');
}

// Add environment example
const envExample = `# Enterprise Environment Configuration
# Copy this file to .env and update with your values

# GitHub OAuth Configuration
GITHUB_AUTHID=your_github_client_id
GITHUB_AUTHSECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback
GITHUB_SCOPE=repo

# Bitbucket OAuth Configuration
BITBUCKET_CLIENT_ID=your_bitbucket_client_id
BITBUCKET_CLIENT_SECRET=your_bitbucket_client_secret
BITBUCKET_REDIRECT_URI=http://localhost:3000/auth/bitbucket/callback
BITBUCKET_SCOPE=repository:read

# SaaS API Configuration (for license validation)
SAAS_API_BASE=https://api.automate-saas.com

# Server Configuration
PORT=3000
NODE_ENV=production

# License Key (provided by Automate team)
LICENSE_KEY=your_enterprise_license_key
`;

zip.addFile('.env.example', Buffer.from(envExample));

// Add README for enterprise
const enterpriseReadme = `# Automate Enterprise - PR Review Integration

This is the enterprise distribution of Automate, providing PR review automation for GitHub and Bitbucket.

## Quick Start

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

3. **Build the Application**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Start the Server**
   \`\`\`bash
   npm start
   \`\`\`

## Docker Deployment

1. **Build the Docker Image**
   \`\`\`bash
   docker build -t automate-enterprise .
   \`\`\`

2. **Run the Container**
   \`\`\`bash
   docker run -p 3000:3000 --env-file .env automate-enterprise
   \`\`\`

## API Endpoints

- \`POST /webhook/github\` - GitHub webhook for PR events
- \`POST /webhook/bitbucket\` - Bitbucket webhook for PR events
- \`GET /auth/github\` - GitHub OAuth initiation
- \`GET /auth/bitbucket\` - Bitbucket OAuth initiation
- \`GET /github/repos\` - List GitHub repositories
- \`GET /bitbucket/repos\` - List Bitbucket repositories

## License Key

This enterprise distribution requires a valid license key. Contact the Automate team to obtain your license key.

## Support

For enterprise support, contact: enterprise@automate-saas.com

## Version

This distribution includes:
- Express Integration App
- Shared Utilities
- License Key Validation
- Docker Support
`;

zip.addFile('README.md', Buffer.from(enterpriseReadme));

// Add package.json for enterprise
const enterprisePackageJson = {
  name: 'automate-enterprise',
  version: '1.0.0',
  description: 'Enterprise distribution of Automate PR review automation',
  main: 'dist/apps/express-integration/main.js',
  scripts: {
    build: 'nx build express-integration',
    start: 'node dist/apps/express-integration/main.js',
    dev: 'nx serve express-integration',
    lint: 'nx lint express-integration'
  },
  dependencies: {
    "@eslint/js": "^9.33.0",
    "@octokit/auth-app": "^8.0.2",
    "@octokit/rest": "^22.0.0",
    "axios": "^1.11.0",
    "dotenv": "^17.2.1",
    "eslint": "^9.32.0",
    "eslint-plugin-svelte": "^3.11.0",
    "express": "^5.1.0",
    "fs": "^0.0.1-security",
    "mongoose": "^8.17.1",
    "node-fetch": "^3.3.2",
    "typescript-eslint": "^8.39.0",
    "@automate/shared": "file:./shared"
  },
  devDependencies: {
    "@types/express": "^5.0.3",
    "@types/node": "^24.2.0"
  },
  engines: {
    node: ">=18.0.0"
  },
  license: "SEE LICENSE IN LICENSE"
};

zip.addFile('package.json', Buffer.from(JSON.stringify(enterprisePackageJson, null, 2)));

// Write the zip file
const timestamp = new Date().toISOString().split('T')[0];
const zipFileName = `automate-enterprise-${timestamp}.zip`;
const zipFilePath = path.join(ENTERPRISE_DIR, zipFileName);

zip.writeZip(zipFilePath);

console.log(`✅ Enterprise distribution created: ${zipFilePath}`);
console.log(`📦 File size: ${(zip.getBuffer().length / 1024 / 1024).toFixed(2)} MB`);
console.log('\n📋 Contents:');
console.log('- Express integration app');
console.log('- Shared utilities');
console.log('- Dockerfile');
console.log('- Environment configuration');
console.log('- Enterprise README');
console.log('- Package.json for standalone installation');
