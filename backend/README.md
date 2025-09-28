# Fee Management System - Backend API

A comprehensive Node.js/Express.js backend API for managing student fees, payments, institutions, and educational administration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev

# Run tests
npm test
```

The API will be available at `http://localhost:3001`

## 🏗️ Architecture

The backend follows the MVC (Model-View-Controller) pattern with additional middleware and utilities:

```
backend/
├── config/          # Configuration files
│   ├── db.js       # Database connection
│   └── server.js   # Server configuration
├── controllers/     # Business logic
├── middleware/      # Custom middleware
├── models/         # Database schemas
├── routes/         # API endpoints
├── utils/          # Helper functions
├── uploads/        # File uploads
└── server.js       # Application entry point
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `GET /api/auth/session` - Check session status
- `POST /api/auth/logout` - End session

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Institution Management
- `GET /api/institutions` - List institutions
- `POST /api/institutions` - Create institution
- `PUT /api/institutions/:id` - Update institution
- `DELETE /api/institutions/:id` - Delete institution

### Batch Management
- `GET /api/batches` - List batches
- `POST /api/batches` - Create batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Course Management
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Month Management
- `GET /api/months` - List months
- `POST /api/months` - Create month
- `PUT /api/months/:id` - Update month
- `DELETE /api/months/:id` - Delete month

### Student Management
- `GET /api/students` - List students (with filters)
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/byStudentId/:studentId` - Get student by student ID
- `GET /api/students/generate-id` - Generate new student ID
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Payment Management
- `GET /api/payments` - List payments (with discount filter)
- `GET /api/payments/:id` - Get payment by ID
- `GET /api/payments/generate-invoice` - Generate invoice number
- `POST /api/payments` - Process payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Reference Options
- `GET /api/reference-options` - List reference options
- `POST /api/reference-options` - Create reference option
- `PUT /api/reference-options/:id` - Update reference option
- `DELETE /api/reference-options/:id` - Delete reference option

### Received By Options
- `GET /api/received-by-options` - List received by options
- `POST /api/received-by-options` - Create received by option
- `PUT /api/received-by-options/:id` - Update received by option
- `DELETE /api/received-by-options/:id` - Delete received by option

### System
- `GET /api/health` - Health check
- `GET /api/activities` - List activities
- `POST /api/activities` - Log activity

## 📊 Data Models

### User
```javascript
{
  username: String,
  password: String (hashed),
  role: String ('admin', 'user', 'developer'),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Institution
```javascript
{
  name: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Batch
```javascript
{
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Course
```javascript
{
  name: String,
  batchId: ObjectId (ref: Batch),
  createdAt: Date,
  updatedAt: Date
}
```

### Month
```javascript
{
  name: String,
  courseId: ObjectId (ref: Course),
  monthNumber: Number,
  payment: Number,
  dueDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Student
```javascript
{
  studentId: String (auto-generated),
  name: String,
  institutionId: ObjectId (ref: Institution),
  batchId: ObjectId (ref: Batch),
  gender: String,
  phone: String,
  guardianName: String,
  guardianPhone: String,
  enrolledCourses: [{
    courseId: ObjectId (ref: Course),
    startingMonthId: ObjectId (ref: Month),
    endingMonthId: ObjectId (ref: Month)
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Payment
```javascript
{
  invoiceNumber: String (auto-generated),
  studentId: ObjectId (ref: Student),
  studentName: String,
  paidAmount: Number,
  discountAmount: Number,
  discountType: String,
  months: [ObjectId] (ref: Month),
  monthPayments: [{
    monthId: ObjectId (ref: Month),
    paidAmount: Number,
    discountAmount: Number
  }],
  reference: String,
  receivedBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Authentication & Security

- **Session-based authentication** using express-session
- **Password hashing** with bcrypt
- **CORS protection** configured for frontend domains
- **Rate limiting** to prevent abuse
- **Security headers** with Helmet.js
- **Role-based access control** (admin, user, developer)

## 🛠️ Development

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Environment Setup

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
HOST=localhost
BIND_IP=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fee-management
MONGO_URI=mongodb://localhost:27017/fee-management

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_change_this

# CORS Configuration
CORS_ORIGIN=http://localhost:3002,http://localhost:3000

# Shared Hosting Configuration (optional)
SHARED_HOSTING=false
CONNECTION_TIMEOUT=120000
ALT_PORT=8080
```

### Available Scripts

```bash
# Development with hot reload
npm run dev

# Production start
npm start

# Run tests
npm test

# Reset demo users (development)
npm run reset-demo
```

### Database Setup

The application will automatically:
1. Connect to MongoDB using the provided URI
2. Create necessary collections
3. Set up indexes for optimal performance

### Testing

Basic structural tests are included:

```bash
npm test
```

Tests verify:
- Essential files exist
- Dependencies are properly installed
- Models are correctly structured
- Routes are accessible

## 🚢 Deployment

### Production Setup

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Ensure MongoDB is accessible
3. **Process Manager**: Use PM2 for production process management

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "fee-management-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Shared Hosting

The application includes special handling for shared hosting environments:

```env
SHARED_HOSTING=true
BIND_IP=your_server_ip
ALT_PORT=alternative_port
```

### Health Monitoring

Monitor application health via:
- `GET /api/health` - Returns server status
- Logs in `logs/` directory
- PM2 monitoring tools

## 🔧 Configuration

### Database Configuration (`config/db.js`)
Handles MongoDB connection with retry logic and error handling.

### Server Configuration (`config/server.js`)
Manages server settings, ports, and hosting environment detection.

### Middleware
- `auth.js` - Authentication verification
- `errorHandler.js` - Centralized error handling
- `security.js` - Security utilities

## 📝 Logging & Monitoring

- **Request logging** for API calls
- **Error logging** with stack traces
- **Activity logging** for user actions
- **Session tracking** for authentication

Logs are stored in the `logs/` directory and automatically rotated.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add/update tests
5. Submit a pull request

## 📄 License

This project is part of the Break The Fear Fee Management System.

---

**Backend API Version**: 1.0.0  
**Last Updated**: September 2025
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Students
- `GET /api/students` - Get all students with pagination and filters
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Batches
- `GET /api/batches` - Get all batches with pagination and filters
- `GET /api/batches/:id` - Get batch by ID with student count
- `POST /api/batches` - Create new batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Institutions
- `GET /api/institutions` - Get all institutions
- `GET /api/institutions/:id` - Get institution by ID
- `POST /api/institutions` - Create new institution
- `PUT /api/institutions/:id` - Update institution
- `DELETE /api/institutions/:id` - Delete institution

### Payments
- `GET /api/payments` - Get all payments with pagination and filters
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Months
- `GET /api/months` - Get all months
- `GET /api/months/:id` - Get month by ID
- `POST /api/months` - Create new month
- `PUT /api/months/:id` - Update month
- `DELETE /api/months/:id` - Delete month

### Reference Options
- `GET /api/reference-options` - Get all reference options
- `POST /api/reference-options` - Create new reference option
- `PUT /api/reference-options/:id` - Update reference option
- `DELETE /api/reference-options/:id` - Delete reference option

### Received By Options
- `GET /api/received-by-options` - Get all received by options
- `POST /api/received-by-options` - Create new received by option
- `PUT /api/received-by-options/:id` - Update received by option
- `DELETE /api/received-by-options/:id` - Delete received by option

### Activities
- `GET /api/activities` - Get system activities with pagination and filters

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings

## 🗄️ Database Schema

### Collections

- **users**: User authentication and role management
- **institutions**: Institution/coaching center details
- **students**: Student information with institution and batch references
- **courses**: Course definitions with fee structures
- **batches**: Batch management with course associations
- **months**: Monthly payment periods linked to courses
- **payments**: Payment records with detailed tracking
- **referenceOptions**: Payment reference options
- **receivedByOptions**: Payment receiver options

### Key Relationships

- Students → Institutions (Many-to-One)
- Students → Batches (Many-to-One)
- Batches → Courses (Many-to-One)
- Payments → Students (Many-to-One)
- Payments → Months (Many-to-Many through monthPayments)

## 🔒 Security Implementation

- **Authentication**: Session-based with JWT token fallback
- **Password Security**: bcrypt hashing with proper salt rounds
- **Input Validation**: Schema validation with Mongoose
- **XSS Protection**: Input sanitization and output encoding
- **CORS Protection**: Configured for specific origins in production
- **Rate Limiting**: API rate limiting to prevent abuse

## 🔧 Middleware

The backend uses several custom middleware components:

### Authentication Middleware
- Validates user sessions
- Checks JWT tokens when needed
- Handles role-based access control

### Error Handling Middleware
- Centralized error processing
- Proper HTTP status codes
- Development/production error responses

### Logging Middleware
- Request/response logging
- Error logging
- Activity tracking

### Security Middleware
- CORS configuration
- Rate limiting
- XSS protection

## 🌐 Shared Hosting Configuration

The backend is optimized for shared hosting environments with:

### Connection Resilience
- Database connection retries
- Error recovery mechanisms
- Timeout management

### Environment Detection
- Auto-detects shared hosting environments
- Adapts settings for hosting limitations
- Flexible port binding

### Resource Management
- Efficient memory usage
- Minimized CPU usage
- Optimized database queries

## 📦 Controllers

The backend implements the MVC pattern with these controllers:

- `authController.js` - Authentication logic
- `userController.js` - User management
- `studentController.js` - Student operations
- `batchController.js` - Batch management
- `courseController.js` - Course operations
- `institutionController.js` - Institution management
- `paymentController.js` - Payment processing
- `monthController.js` - Month configuration
- `referenceOptionController.js` - Reference option management
- `receivedByOptionController.js` - Received by option management
- `activityController.js` - Activity logging
- `settingsController.js` - System settings

## 🛠️ Utility Modules

### Helper Functions
- Invoice number generation
- Date formatting
- Currency formatting
- Input sanitization
- Pagination utilities

### Shared Hosting Utilities
- Environment detection
- Directory management
- Error handling
- Connection recovery

## 🚀 Backend Development

### Setting Up Development Environment
1. Clone the repository
2. Install dependencies with `npm install`
3. Create `.env` file (see example below)
4. Start development server with `npm run dev`

### Testing
Run tests with:
```bash
npm test
```

### Code Structure Best Practices
- Keep controllers focused on request/response handling
- Move business logic to services
- Use models for data validation
- Implement proper error handling
- Write comprehensive tests

## 📁 .env.example

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/fee_management

# Authentication
SESSION_SECRET=your_secret_key_here
JWT_SECRET=another_secret_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com

# Shared Hosting Configuration
SHARED_HOSTING=false
BIND_IP=0.0.0.0
CONNECTION_TIMEOUT=120000
```