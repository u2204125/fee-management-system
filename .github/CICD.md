## CI/CD Pipeline Status

[![Deploy to Netlify](https://github.com/u2204125/fee-management-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/u2204125/fee-management-system/actions/workflows/deploy.yml)

## Required GitHub Secrets

To enable automatic deployment, add these secrets to your GitHub repository:

### Repository Settings > Secrets and Variables > Actions

1. **NETLIFY_AUTH_TOKEN**
   - Go to [Netlify User Settings > Applications](https://app.netlify.com/user/applications)
   - Generate new access token
   - Copy and add as secret

2. **NETLIFY_SITE_ID**
   - Go to your Netlify site dashboard
   - Site settings > General > Site details
   - Copy Site ID and add as secret

## Pipeline Overview

### 🔄 Continuous Integration Workflows

1. **Deploy Pipeline** (`deploy.yml`)
   - Triggers on: Push to master/main, Pull Requests
   - Steps: Test → Build → Deploy Preview (PR) / Production (master)
   - Features: Automatic preview deployments for PRs

2. **Release Management** (`release.yml`)
   - Triggers on: Git tags (v*.*.*)
   - Steps: Create release, Generate changelog, Deploy to production
   - Features: Automated release creation and deployment

### 🚀 Deployment Flow

```mermaid
graph TD
    A[Code Push] --> B{Branch?}
    B -->|Feature Branch| C[Build & Test]
    B -->|Pull Request| D[Preview Deploy]
    B -->|Master/Main| E[Production Deploy]
    
    C --> F[Code Review]
    D --> G[Review & Test]
    E --> H[Lighthouse Check]
    
    G --> I{Approved?}
    I -->|Yes| J[Merge to Master]
    I -->|No| K[Request Changes]
    
    J --> E
    
    L[Create Tag] --> M[Release Pipeline]
    M --> N[GitHub Release]
    M --> O[Production Deploy]
```

### 📊 Performance Monitoring

- **Lighthouse CI**: Automatic performance, accessibility, and SEO audits
- **Build Size Monitoring**: Alerts for large file sizes
- **Dependency Tracking**: Outdated package notifications

## Manual Deployment Commands

For local testing and manual deployment:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and test locally
npm run build
netlify dev

# Manual deploy (preview)
netlify deploy --dir=dist --functions=netlify/functions

# Manual deploy (production)
netlify deploy --prod --dir=dist --functions=netlify/functions
```

## Troubleshooting CI/CD

### Common Issues

1. **Build Failures**
   ```bash
   # Check build locally
   npm ci
   npm run build
   ```

2. **Missing Secrets**
   - Verify all required secrets are added to GitHub repository
   - Check secret names match exactly (case-sensitive)

3. **Netlify API Errors**
   - Ensure NETLIFY_AUTH_TOKEN has proper permissions
   - Verify NETLIFY_SITE_ID is correct

### Monitoring

- **GitHub Actions**: Monitor workflow runs in the Actions tab
- **Netlify Dashboard**: Check deployment status and logs
- **Performance Reports**: Review Lighthouse CI results

## Environment-Specific Configuration

### Development
- Preview deployments for all PRs
- Detailed logging enabled
- All quality checks run

### Staging
- Deploy to staging environment (if configured)
- Extended testing suite
- Performance benchmarking

### Production
- Deploy only from master/main branch
- Production optimizations enabled
- Monitoring and alerting active

## Contributing

When contributing to this project:

1. All PRs trigger build checks and preview deployments
2. Code must pass all automated tests
3. Performance audits verify no regressions
4. Manual review required before merging

The CI/CD pipeline ensures consistent and high-quality deployments for the BTF Fee Management System.
