# Break The Fear - Fee Management System

A simple and efficient fee management system for coaching centers built with Node.js, Express, MongoDB, and vanilla JavaScript.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/u2204125/fee-management-system.git
   cd fee-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/fee-management-system
   SESSION_SECRET=your_32_character_secret_key_here
   PORT=5000
   ```

4. **Start the application:**
   ```bash
   # For production
   npm start
   
   # For development (with auto-restart)
   npm run dev
   ```

5. **Access the application:**
   - Open your browser and navigate to `http://localhost:5000`
   - **Default admin credentials:** admin / admin123

## 🎯 Features

### Core Modules
- **🔐 Authentication System** - Secure login with session management
- **👥 User Management** - Role-based access control (Admin, Manager, Developer)
- **🏫 Institution Management** - Multi-institution support
- **🎓 Student Management** - Complete student database with enrollment tracking
- **📚 Course & Batch Management** - Organize students by courses and batches
- **📅 Month Management** - Course-specific month configuration
- **💰 Fee Payment System** - Payment processing with:
  - Multi-month payment support
  - Discount management
  - Auto-generated invoice numbers
  - Reference and receiver tracking
- **📊 Reports & Analytics** - Comprehensive reporting with date filters
- **🧾 Invoice Generation** - Professional thermal printer-ready invoices

### Dashboard Features
- Real-time statistics (students, batches, revenue, pending fees)
- Recent activities tracking
- Quick overview of system status

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Authentication:** Express-session
- **Architecture:** MVC pattern with RESTful APIs

## 📁 Project Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── index.html             # Main frontend file
├── js/                    # Frontend JavaScript
│   ├── auth.js
│   ├── dashboard.js
│   ├── student-management.js
│   ├── fee-payment.js
│   └── ...
├── styles/                # CSS files
├── models/                # MongoDB schemas
├── routes/                # API routes
└── test/                  # Test files
```

## 🔧 Configuration

### Database Setup

**Option 1: Local MongoDB**
1. Install MongoDB on your system
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/fee-management-system`

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster and database user
3. Get connection string and update `.env` file

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fee-management-system` |
| `SESSION_SECRET` | Secret key for sessions | Required |
| `PORT` | Server port | `5000` |

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management |
| **Manager** | Student and fee management, reports |
| **Developer** | Limited access for testing |

**Demo Credentials:**
- Admin: `admin` / `admin123`
- Manager: `manager` / `manager123`
- Developer: `developer` / `dev123`

## 🧪 Testing

Run basic tests:
```bash
npm test
```

## 📊 Usage Guide

1. **Login** with appropriate credentials
2. **Create Institution** (if not exists)
3. **Add Batches and Courses** for organization
4. **Configure Months** for each course
5. **Add Students** and enroll them in courses
6. **Process Fee Payments** with invoicing
7. **Generate Reports** for analysis

## 🔒 Security Features

- Secure password hashing with bcrypt
- Session-based authentication
- Input validation and sanitization
- CORS protection
- Environment-based configuration

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Break The Fear Fee Management System** - Simple, Secure, Efficient

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