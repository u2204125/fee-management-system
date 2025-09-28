# Break The Fear - Fee Management System

A comprehensive, full-stack fee management system for educational institutions, built with modern technologies and optimized for both development and production environments.

## 🎯 Overview

The Fee Management System is a complete solution for educational institutions to manage:
- **Student Registration & Management**
- **Fee Payment Processing**
- **Invoice Generation & Tracking**
- **Institutional Administration**
- **Comprehensive Reporting**
- **Multi-user Role Management**

## 🏗️ Architecture

### Full-Stack Technology Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: Session-based with JWT fallback
- **State Management**: React Query + Context API
- **Database**: MongoDB with Mongoose ODM

### Project Structure
```
fee-management-system/
├── backend/              # Node.js/Express API
│   ├── config/          # Database & server configuration
│   ├── controllers/     # Business logic
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Authentication & security
│   └── server.js       # Application entry point
├── frontend/            # Next.js React application
│   ├── app/            # Next.js App Router pages
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── lib/           # API client & utilities
│   └── public/        # Static assets
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+ (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/u2204125/fee-management-system.git
   cd fee-management-system
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create .env.local if needed
   npm run dev
   ```

4. **Access the Application:**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:3001
   - Health Check: http://localhost:3001/api/health

## ✨ Key Features

### 🔐 Authentication & Security
- **Session-based Authentication** with secure cookies
- **Role-based Access Control** (Developer, Admin, User)
- **Password Hashing** with bcrypt
- **CSRF Protection** and security headers
- **Rate Limiting** to prevent abuse

### 👥 Student Management
- **Student Registration** with auto-generated IDs
- **Institution Management** with addresses
- **Batch & Course Assignment**
- **Multiple Course Enrollment**
- **Advanced Search & Filtering**

### 💰 Payment Processing
- **Fee Payment Processing** with validation
- **Automatic Invoice Generation**
- **Discount Management** (fixed/percentage)
- **Multiple Payment Methods**
- **Payment History Tracking**

### 📊 Reporting & Analytics
- **Payment Reports** with date filtering
- **Discount Analysis** and summaries
- **Student Statistics** and demographics
- **Revenue Tracking** and trends
- **Export Functionality** (CSV/PDF)

### 🎨 Modern UI/UX
- **Responsive Design** for all devices
- **Dark/Light Theme** support
- **Intuitive Navigation** with breadcrumbs
- **Real-time Notifications**
- **Loading States** and error handling

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/auth/session` - Session validation
- `POST /api/auth/logout` - Session termination

### Core Resource Endpoints
- **Students**: `/api/students/*` - CRUD operations, search
- **Payments**: `/api/payments/*` - Payment processing, invoices
- **Institutions**: `/api/institutions/*` - Institution management
- **Batches**: `/api/batches/*` - Batch management
- **Courses**: `/api/courses/*` - Course management
- **Users**: `/api/users/*` - User management

### System Endpoints
- `GET /api/health` - System health check
- `GET /api/activities` - Activity logging
- Various configuration endpoints for references and options

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm test            # Run tests
npm start           # Production start
```

### Frontend Development
```bash
cd frontend
npm run dev         # Development server
npm run build       # Production build
npm run lint        # Code linting
npm start          # Production server
```

### Environment Configuration

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fee-management
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:3002
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚢 Deployment

### Production Deployment

1. **Backend Deployment:**
   ```bash
   cd backend
   npm install --production
   npm start
   # Or use PM2 for process management
   pm2 start server.js --name "fee-management-api"
   ```

2. **Frontend Deployment:**
   ```bash
   cd frontend
   npm run build
   npm start
   # Or deploy to Vercel/Netlify
   ```

### Shared Hosting Support
The backend includes special handling for shared hosting environments:
- Custom port binding
- Alternative port fallback
- Connection timeout management
- Environment detection

### Docker Support (Optional)
```bash
# Build and run with Docker
docker-compose up --build
```

## 🔧 Configuration

### Database Configuration
- **MongoDB** connection with retry logic
- **Session storage** in MongoDB
- **Automatic indexing** for performance
- **Connection pooling** for scalability

### Security Configuration
- **CORS** setup for frontend domains
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **Session** security configuration

## 📚 User Guides

### For Administrators
1. **System Setup**: Configure institutions, batches, and courses
2. **User Management**: Create user accounts with appropriate roles
3. **Student Registration**: Add students and assign to batches
4. **Payment Processing**: Handle fee payments and generate invoices
5. **Reporting**: Generate and export various reports

### For Users
1. **Login**: Access the system with provided credentials
2. **Student Search**: Find students by ID or name
3. **Payment Entry**: Process fee payments efficiently
4. **View Reports**: Access payment and student reports

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                # Basic structure tests
```

### Frontend Testing
```bash
cd frontend
npm run build          # Build verification
npm run lint           # Code quality check
```

### Manual Testing
- Authentication flows
- CRUD operations
- Payment processing
- Report generation
- Responsive design

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Standards
- **TypeScript** for type safety (frontend)
- **ESLint** for code quality
- **Consistent naming** conventions
- **Comprehensive comments** for complex logic
- **Error handling** for all operations

## 🐛 Troubleshooting

### Common Issues

**Connection Issues:**
- Verify MongoDB is running
- Check environment variables
- Ensure ports 3001 and 3002 are available

**Authentication Problems:**
- Clear browser cookies
- Check session configuration
- Verify user credentials

**Build Errors:**
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📄 License

This project is part of the Break The Fear educational initiative.

## 🆘 Support

For support and questions:
- Check the documentation in `/backend/README.md` and `/frontend/README.md`
- Review the API endpoints and examples
- Check the troubleshooting section above

---

**Project Version**: 1.0.0  
**Last Updated**: September 2025  
**Maintained by**: Break The Fear Team
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment:**
   Create a `.env` file in the backend directory based on the `.env.example` template.

4. **Start the application:**
   ```bash
   # Start backend server (development mode)
   cd backend
   npm run dev
   ```

5. **Access the application:**
   - Open the frontend directly by double-clicking `frontend/index.html` file
   - Or navigate to the frontend folder and open it in a browser: `file:///path/to/fee-management-system/frontend/index.html`
   - Default admin credentials: `admin` / `admin123`

## 📊 Key Features

- **User Authentication** - Secure login with role-based access control
- **Student Management** - Complete student database with enrollment tracking
- **Fee Payment Processing** - Multi-month payment support with discounts
- **Invoicing** - Auto-generated invoice numbers optimized for thermal printers
- **Reporting** - Comprehensive financial and student reports
- **Multi-Institution Support** - Manage multiple institutions from one dashboard

## 🛠️ Project Scripts

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm test` | Run test suite |
| `npm run reset-demo` | Reset the fundamental users' data |

### Frontend Usage

The frontend is designed to work without any build process or server:
- Open `frontend/index.html` directly in a browser
- For development, the frontend will connect to a local backend at `http://localhost:5000`
- For production, it will automatically connect to `http://api.breakthefear-bd.com/`

## � Environment Variables

Create a `.env` file in the backend directory with these variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `SESSION_SECRET` | Session encryption key | Yes | - |
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment (development/production) | No | development |
| `CORS_ORIGIN` | Allowed CORS origins | No | * |
| `SHARED_HOSTING` | Set to 'true' for shared hosting | No | false |
| `BIND_IP` | IP to bind server to | No | 0.0.0.0 |
| `CONNECTION_TIMEOUT` | Connection timeout in ms | No | 120000 |

## 🌐 Deployment Guide

### Shared Hosting Deployment

1. **Prepare your files:**
   ```bash
   # Package backend (no build needed for frontend)
   cd backend
   npm ci --production
   ```

2. **Upload to server:**
   - Upload `backend` folder to your server root directory
   - Upload `frontend` folder to your public HTML directory

3. **Configure .htaccess:**
   Create an `.htaccess` file in your backend directory:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   
   # Set environment variables
   SetEnv NODE_ENV production
   SetEnv SHARED_HOSTING true
   ```

4. **Configure Node.js:**
   - Use provided shared hosting configuration in server.js
   - Set environment variables in hosting control panel
   - Use MongoDB Atlas for database

5. **Start the application:**
   ```bash
   cd backend
   node server.js
   ```

### Netlify Frontend Deployment

1. **Create `netlify.toml` file:**
   ```toml
   [build]
     publish = "frontend/"
     command = "echo 'No build needed, using static files'"
   
   [[redirects]]
     from = "/api/*"
     to = "http://api.breakthefear-bd.com/:splat"
     status = 200
     force = true
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set environment variables in Netlify dashboard
   - Deploy with the settings from netlify.toml

3. **Configure API URL:**
   - The frontend is configured to use `http://api.breakthefear-bd.com/` in production

## 🔄 Database Backup & Restore

### Backup MongoDB:
```bash
mongodump --uri="mongodb://username:password@host:port/database" --out=./backup
```

### Restore MongoDB:
```bash
mongorestore --uri="mongodb://username:password@host:port/database" ./backup
```

## � User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, user management, settings |
| **Manager** | Student and fee management, reports |
| **Developer** | Limited access for testing |

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and queries, contact: info@breakthefear.com
