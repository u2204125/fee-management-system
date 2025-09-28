# Fee Management System - Frontend

A modern React/Next.js frontend application for managing student fees, payments, and educational administration.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at `http://localhost:3002`

## 🏗️ Architecture

Built with Next.js 14 App Router, the frontend follows modern React patterns:

```
frontend/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard layout group
│   │   ├── layout.tsx     # Dashboard layout
│   │   ├── page.tsx       # Dashboard home
│   │   ├── batch-management/
│   │   ├── student-management/
│   │   ├── fee-payment/
│   │   ├── reports/
│   │   └── ...
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Login page
│   └── providers.tsx     # App providers
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── layout/          # Layout components
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── ThemeContext.tsx  # Theme management
├── lib/                  # Utilities
│   └── api.ts           # API client
└── public/              # Static assets
```

## ✨ Features

### 🔐 Authentication
- Session-based authentication
- Role-based access control
- Automatic token refresh
- Protected routes

### 📊 Dashboard
- Real-time statistics
- Recent activities
- Quick actions
- Responsive design

### 👥 Student Management
- Student registration
- Institution management
- Batch assignment
- Course enrollment

### 💰 Fee Management
- Payment processing
- Invoice generation
- Discount management
- Payment history

### 📈 Reports
- Payment reports
- Discount reports
- Student statistics
- Export functionality

### 🎨 User Interface
- Modern, responsive design
- Dark/light theme support
- Mobile-friendly
- Accessibility compliant

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## 🔧 Development

### Prerequisites
- Node.js 16+ and npm
- Backend API running on port 3001

### Environment Setup

Create a `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# App Configuration
NEXT_PUBLIC_APP_NAME="Fee Management System"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Export static files
npm run export

# Start production server
npm start

# Lint code
npm run lint
```

### Project Structure Details

#### App Directory (`app/`)
- **Root Layout**: Global layout with providers
- **Login Page**: Authentication entry point
- **Dashboard Group**: Protected dashboard pages

#### Components (`components/`)
- **Reusable UI components**
- **Form components**
- **Layout components**

#### Contexts (`contexts/`)
- **AuthContext**: Authentication state and methods
- **ThemeContext**: Theme switching functionality

#### API Client (`lib/api.ts`)
Centralized API client with:
- Axios configuration
- Request/response interceptors
- Error handling
- TypeScript definitions

## 🎨 Styling

### Tailwind CSS Classes
The project uses a custom Tailwind configuration with:

- **Primary Colors**: Blue theme
- **Dark Mode**: System preference detection
- **Custom Components**: Button, form, card styles
- **Responsive Design**: Mobile-first approach

### Custom CSS Classes

```css
/* Form Elements */
.form-input          /* Input field styling */
.form-label          /* Label styling */
.form-error          /* Error message styling */

/* Button Variants */
.btn                 /* Base button */
.btn-primary         /* Primary button */
.btn-outline         /* Outline button */
.btn-danger          /* Danger button */

/* Layout */
.card                /* Card container */
.sidebar             /* Sidebar styling */
.header              /* Header styling */
```

## 🔌 API Integration

### API Client Structure

```typescript
// Authentication
authApi.login(username, password)
authApi.logout()
authApi.getSession()

// Students
studentsApi.getAll()
studentsApi.create(data)
studentsApi.update(id, data)
studentsApi.delete(id)

// Payments
paymentsApi.getAll()
paymentsApi.create(payment)
paymentsApi.generateInvoice()
```

### Error Handling
- Global error interceptor
- Toast notifications
- Form validation errors
- Network error recovery

### Request Interceptors
- Session management
- Loading states
- Error handling
- Response transformation

## 🚀 Pages & Features

### Dashboard (`/`)
- **Statistics Cards**: Students, payments, revenue
- **Recent Activities**: Latest system activities
- **Quick Actions**: Navigate to common tasks

### Student Management (`/student-management`)
- **Institution Creation**: Add new institutions
- **Student Registration**: Comprehensive student forms
- **Batch Assignment**: Assign students to batches
- **Course Enrollment**: Select courses and months

### Students Database (`/students-database`)
- **Advanced Filtering**: Search by multiple criteria
- **Student Profiles**: Detailed student information
- **Export Functionality**: CSV export capabilities

### Fee Payment (`/fee-payment`)
- **Student Search**: Find students by ID or name
- **Payment Processing**: Handle fee payments
- **Month Selection**: Choose payment months
- **Invoice Generation**: Automatic invoice creation

### Batch Management (`/batch-management`)
- **Batch Creation**: Create new batches
- **Course Management**: Add courses to batches
- **Month Setup**: Define payment months

### Reports (`/reports`)
- **Payment Reports**: Filter by date, course
- **Statistics**: Revenue and payment analytics
- **Export Options**: Download reports as CSV

### Reference Management (`/reference-management`)
- **Reference Options**: Manage payment references
- **Received By Options**: Manage receivers

### User Management (`/user-management`)
- **User Creation**: Add system users
- **Role Management**: Assign user roles
- **Access Control**: Manage permissions

## 🔒 Authentication & Security

### Authentication Flow
1. User submits credentials
2. Backend validates and creates session
3. Session stored in secure cookie
4. Frontend maintains auth state
5. Protected routes check authentication

### Role-Based Access
- **Developer**: Full system access
- **Admin**: Administrative functions
- **User**: Basic operations

### Security Features
- **Session Management**: Secure cookie-based sessions
- **CSRF Protection**: Built-in Next.js protection
- **XSS Prevention**: Sanitized inputs
- **Route Protection**: Private route guards

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly**: Large tap targets
- **Slide-out Menu**: Mobile navigation
- **Responsive Tables**: Horizontal scroll
- **Optimized Forms**: Mobile keyboards

## 🧪 Testing

### Component Testing
```bash
# Run component tests
npm run test

# Run with coverage
npm run test:coverage
```

### End-to-End Testing
```bash
# Run E2E tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Authentication flows
- [ ] CRUD operations
- [ ] Form validations
- [ ] Responsive design
- [ ] Error handling

## 🚢 Deployment

### Production Build
```bash
# Build optimized bundle
npm run build

# Test production build locally
npm start
```

### Static Export
```bash
# Generate static files
npm run export
```

### Environment Variables (Production)
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME="Fee Management System"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Deployment Platforms
- **Vercel**: Recommended for Next.js apps
- **Netlify**: Static site deployment
- **AWS S3**: Static hosting
- **Docker**: Containerized deployment

## 🔧 Configuration

### Next.js Configuration (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker deployments
  images: {
    unoptimized: true   // For static exports
  }
}
```

### Tailwind Configuration (`tailwind.config.js`)
Custom theme configuration with:
- Color palette
- Typography scale
- Spacing system
- Component utilities

### TypeScript Configuration (`tsconfig.json`)
Strict TypeScript configuration with:
- Path aliases
- Strict type checking
- Next.js optimizations

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** feature branch
3. **Implement** changes
4. **Test** thoroughly
5. **Submit** pull request

### Code Style
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Conventional Commits**: Commit messages

### Pull Request Guidelines
- Clear description
- Screenshots for UI changes
- Tests for new features
- Documentation updates

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
- Verify backend is running on port 3001
- Check CORS configuration
- Validate environment variables

**Authentication Problems**
- Clear browser cookies
- Check session configuration
- Verify API endpoints

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://react-query.tanstack.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is part of the Break The Fear Fee Management System.

---

**Frontend Version**: 1.0.0  
**Next.js Version**: 14.0.4  
**Last Updated**: September 2025