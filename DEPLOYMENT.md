# Netlify Deployment Guide for BTF Fee Management System

## Prerequisites

1. **MongoDB Atlas Account**: Since Netlify Functions are serverless, you need a cloud database
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new cluster
   - Create a database user with read/write permissions
   - Get your connection string

2. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all files are committed to your Git repository
2. Push to GitHub, GitLab, or Bitbucket

### Step 2: Connect to Netlify

1. Log into Netlify
2. Click "New site from Git"
3. Choose your Git provider and repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### Step 3: Environment Variables

In Netlify dashboard, go to Site settings > Environment variables and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/btf-fms?retryWrites=true&w=majority
SESSION_SECRET=your_super_secure_session_secret_minimum_32_characters
NODE_ENV=production
```

**Important**: Replace the MongoDB URI with your actual Atlas connection string.

### Step 4: Deploy

1. Click "Deploy site"
2. Netlify will automatically build and deploy your application
3. Your site will be available at a random Netlify URL (e.g., `https://amazing-site-123456.netlify.app`)

### Step 5: Custom Domain (Optional)

1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS settings as instructed by Netlify

## Post-Deployment Setup

### 1. Initialize Default Users

Since this is a fresh deployment, you'll need to create the initial admin user:

1. Open your deployed site
2. The login screen should show the default credentials
3. Use these to log in and create other users as needed

### 2. Configure MongoDB Atlas Network Access

1. In MongoDB Atlas dashboard, go to Network Access
2. Add `0.0.0.0/0` to allow access from anywhere (Netlify Functions run from various IPs)
3. Or add specific Netlify IP ranges if you prefer more security

### 3. Test All Features

- Authentication
- Student management
- Payment processing
- Report generation
- All CRUD operations

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check your MongoDB Atlas connection string
   - Ensure network access is configured correctly
   - Verify database user permissions

2. **Environment Variables Not Working**
   - Double-check variable names (case-sensitive)
   - Redeploy after adding variables
   - Check Netlify function logs

3. **API Routes Not Working**
   - Verify `netlify.toml` configuration
   - Check that all routes are properly imported in `/netlify/functions/api.js`
   - Look at Netlify function logs for errors

### Debugging

1. **Function Logs**: In Netlify dashboard, go to Functions tab to see logs
2. **Deploy Logs**: Check build logs in the Deploys tab
3. **Browser Console**: Check for frontend JavaScript errors

## Local Development with Netlify

To test the Netlify setup locally:

```bash
npm install -g netlify-cli
npm install
netlify dev
```

This will run your site locally with Netlify Functions simulation.

## Performance Considerations

1. **Cold Starts**: Serverless functions may have cold start delays
2. **Database Connections**: MongoDB Atlas handles connection pooling
3. **Caching**: Consider implementing caching for frequently accessed data

## Security Notes

1. **HTTPS**: Netlify provides automatic HTTPS
2. **Environment Variables**: Never expose sensitive data in frontend code
3. **Database Security**: Use strong passwords and enable IP whitelisting
4. **Session Security**: Secure session cookies are automatically configured

## Backup Strategy

1. **Database**: MongoDB Atlas provides automated backups
2. **Code**: Your Git repository serves as backup
3. **Environment Variables**: Keep a secure backup of your environment variables

## Scaling Considerations

- Netlify Functions scale automatically
- MongoDB Atlas can be scaled up as needed
- Consider implementing database indexing for better performance
- Monitor usage and upgrade plans as necessary

## Support

If you encounter issues:
1. Check Netlify documentation
2. Review MongoDB Atlas guides
3. Check application logs in both Netlify and MongoDB dashboards
