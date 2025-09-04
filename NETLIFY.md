# 🚀 Quick Netlify Deployment Guide

## One-Click Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/u2204125/fee-management-system)

## Manual Deployment Steps

### 1. Fork/Clone Repository
```bash
git clone https://github.com/u2204125/fee-management-system.git
cd fee-management-system
```

### 2. Set Up MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster
3. Create database user
4. Get connection string

### 3. Deploy to Netlify
1. Connect repository to Netlify
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### 4. Environment Variables
Add these in Netlify dashboard:
```
MONGODB_URI=your_mongodb_atlas_connection_string
SESSION_SECRET=your_secure_secret_key_32_chars_minimum
NODE_ENV=production
```

### 5. Test Deployment
- Visit your Netlify URL
- Test health endpoint: `/api/health`
- Login with default credentials: admin/admin123

## Features Included in Netlify Deployment

✅ **Serverless Backend**: All APIs converted to Netlify Functions  
✅ **MongoDB Integration**: Works with MongoDB Atlas  
✅ **Session Management**: Secure user sessions  
✅ **Auto HTTPS**: Netlify provides SSL certificates  
✅ **Global CDN**: Fast loading worldwide  
✅ **Automatic Builds**: Updates on Git push  

## Architecture

```
Frontend (Static Files) → Netlify CDN
API Requests → Netlify Functions → MongoDB Atlas
```

## Support

- 📖 Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Issues: Create GitHub issue
- 💬 Questions: Contact support

---

**Note**: This deployment converts the Node.js/Express backend to serverless Netlify Functions while maintaining all functionality.
