# Break The Fear - Fee Management System

[![Deploy to Netlify](https://github.com/u2204125/fee-management-system/actions/workflows/deploy.yml/badge.svg)](https://github.com/u2204125/fee-management-system/actions/workflows/deploy.yml)

A comprehensive fee management system for coaching centers built with Node.js, Express, MongoDB, and vanilla JavaScript frontend.

## 🏗️ Architecture

- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Authentication**: Express-session based authentication
- **APIs**: RESTful API architecture

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/u2204125/fee-management-system.git
   cd fee-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure MongoDB:**
   - For local MongoDB: Ensure MongoDB is running on `mongodb://localhost:27017/fee-management-system`
   - For MongoDB Atlas: Update the connection string in `server.js`

4. **Start the server:**
   ```bash
   # For production
   npm start
   
   # For development (with auto-restart)
   npm run dev
   ```

5. **Build for deployment:**
   ```bash
   npm run build
   ```

6. **Access the application:**
   - Open your browser and navigate to `http://localhost:5000`
   - Default admin credentials: admin/admin123

## 🚀 Features

### Core Modules

- **🔐 Authentication System**: Secure login with session management
- **👥 User Management**: Role-based access control (Admin, Manager, Developer)
- **🏫 Institution Management**: Multi-institution support with complete CRUD operations
- **🎓 Student Management**: Comprehensive student database with enrollment tracking
- **📚 Course & Batch Management**: Organize students by courses and batches
- **📅 Month Management**: Course-specific month configuration
- **💰 Fee Payment System**: Advanced payment processing with:
  - Multi-month payment support
  - Discount management
  - Auto-generated invoice numbers
  - Reference and receiver tracking
- **📊 Reports & Analytics**: Comprehensive reporting with:
  - Date-wise reports
  - Weekly/Monthly summaries
  - Course-wise filtering
  - Student-wise analysis
  - CSV export functionality
- **🧾 Invoice Generation**: Professional thermal printer-ready invoices
- **🌓 Theme Support**: Dark/Light theme switching

### Advanced Features

- **Real-time Data Sync**: All data is synced with MongoDB in real-time
- **Smart Filtering**: Advanced filtering in students database
- **Auto-calculations**: Automatic fee calculations and due amount tracking
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Print Support**: Optimized for thermal printer invoices

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

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check authentication status

### Core Resources
- `GET|POST|PUT|DELETE /api/users` - User management
- `GET|POST|PUT|DELETE /api/institutions` - Institution management
- `GET|POST|PUT|DELETE /api/students` - Student management
- `GET|POST|PUT|DELETE /api/courses` - Course management
- `GET|POST|PUT|DELETE /api/batches` - Batch management
- `GET|POST|PUT|DELETE /api/months` - Month management
- `GET|POST|PUT|DELETE /api/payments` - Payment management
- `GET|POST|PUT|DELETE /api/reference-options` - Reference options
- `GET|POST|PUT|DELETE /api/received-by-options` - Received by options

## 🛡️ Security Features

- **Session-based Authentication**: Secure server-side session management
- **Input Validation**: Comprehensive input validation using Mongoose schemas
- **XSS Protection**: HTML escaping for all user inputs
- **CORS Configuration**: Proper CORS setup for API security
- **Password Security**: Secure password handling and validation

## 📱 Frontend Architecture

### Module Structure
```
js/
├── auth.js                 # Authentication management
├── main.js                 # Application initialization
├── navigation.js           # Navigation and routing
├── dashboard.js            # Dashboard functionality
├── user-management.js      # User CRUD operations
├── student-management.js   # Student CRUD operations
├── students-database.js    # Student listing with filters
├── batch-management.js     # Batch CRUD operations
├── fee-payment.js          # Payment processing
├── reference-management.js # Reference option management
├── reports.js              # Report generation
├── invoice.js              # Invoice generation
└── utils.js                # Utility functions
```

### Service Layer
```
js/services/
├── ActivityService.js      # Activity logging
├── BatchService.js         # Batch operations
├── CourseService.js        # Course operations
├── InstitutionService.js   # Institution operations
├── MonthService.js         # Month operations
├── PaymentService.js       # Payment operations
└── StudentService.js       # Student operations
```

## 🎨 Styling

- **Component-based CSS**: Modular and reusable styles
- **Theme System**: Support for multiple themes
- **Responsive Design**: Mobile-first approach
- **Print Styles**: Optimized for invoice printing

## 🔧 Development

### Project Structure
```
├── server.js               # Express server setup
├── package.json            # Dependencies and scripts
├── index.html              # Main application file
├── backend/                # Future backend organization
├── js/                     # Frontend JavaScript modules
├── styles/                 # CSS stylesheets
├── models/                 # Mongoose data models
└── routes/                 # Express API routes
```

### Adding New Features

1. **Backend**: Create new models in `models/` and routes in `routes/`
2. **Frontend**: Add new modules in `js/` and corresponding styles
3. **Database**: Update Mongoose schemas as needed
4. **API**: Follow RESTful conventions for new endpoints

### Testing

- Test all CRUD operations through the UI
- Verify API endpoints using tools like Postman or curl
- Test responsive design on different screen sizes
- Validate print functionality with thermal printers

## 🚀 Deployment

### Production Setup

1. **Environment Variables**: Set up production MongoDB connection
2. **Process Management**: Use PM2 or similar for process management
3. **Reverse Proxy**: Configure Nginx for production deployment
4. **SSL Certificate**: Set up HTTPS for secure communication

### Recommended Production Stack

- **Server**: Ubuntu/CentOS with Node.js
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **Process Manager**: PM2
- **Web Server**: Nginx as reverse proxy
- **SSL**: Let's Encrypt certificates

## 📈 Performance Features

- **Client-side Caching**: localStorage caching for improved performance
- **Async Operations**: Non-blocking API calls
- **Optimized Queries**: Efficient MongoDB queries with proper indexing
- **Lazy Loading**: Load data only when needed

## 🔄 Migration Notes

This system has been migrated from localStorage-based storage to MongoDB for:
- Better data persistence
- Multi-user support
- Enhanced security
- Scalability and performance
- Professional deployment capabilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and queries, contact: info@breakthefear.com
</parameter>