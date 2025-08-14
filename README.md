# HR Interface Monitoring Dashboard

A comprehensive real-time monitoring system for HR integration interfaces with advanced analytics, authentication, and data visualization capabilities.

## 🚀 Features

### 🔐 Authentication & Security
- **Login System**: Secure authentication with JWT tokens
- **Protected Routes**: All dashboard features require authentication
- **Session Management**: Automatic token refresh and session handling

### 📊 Dashboard Analytics
- **Real-time Metrics**: Live monitoring of interface execution status
- **Success Rate Tracking**: 93% success rate with detailed failure analysis
- **Performance Metrics**: Average execution time and records processed
- **Status Distribution**: Visual breakdown of SUCCESS, FAILED, PENDING, and RUNNING states

### 📈 Advanced Data Visualization
- **Interactive Charts**: 
  - Line charts showing execution trends over time
  - Pie charts for status distribution
  - Bar charts for interface performance comparison
- **Continuous Charts**: Gap-filling logic ensures smooth, unbroken visualizations
- **Responsive Design**: Optimized for desktop and mobile viewing

### 📅 Flexible Date Range Selection
- **Predefined Ranges**: Last Hour, 24 Hours, Week, Month
- **Custom Date Range**: Pick any start and end date/time
- **Dynamic Data Loading**: Charts update automatically based on selected range
- **Visual Feedback**: Active date range indicators

### 🔍 Advanced Filtering & Search
- **Global Search**: Search across interface names, integration keys, messages, and systems
- **Status Filtering**: Filter by SUCCESS, FAILED, PENDING, RUNNING
- **Severity Filtering**: Filter by LOW, MEDIUM, HIGH, CRITICAL
- **Date Range Filtering**: Filter by specific date ranges
- **Interface Name Filtering**: Filter by specific interface names
- **Integration Key Filtering**: Filter by specific integration keys

### 📋 Data Management
- **Infinite Scroll Pagination**: Load more records as you scroll (no page buttons)
- **Real-time Record Count**: Shows "Loaded X of Y records" at the top
- **Bulk Data Generation**: Generate 50,000+ sample records for testing
- **Data Export**: Export filtered data for analysis

### 🔔 Notification System
- **Real-time Alerts**: Instant notifications for critical failures
- **Status Updates**: Live updates on interface execution status
- **Toast Notifications**: User-friendly feedback for actions

### 🎨 Modern UI/UX
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works on all device sizes
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error messages and recovery

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18**: Latest React features with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Interactive chart library
- **Axios**: HTTP client for API communication
- **React Router**: Client-side routing
- **React Hot Toast**: Toast notifications

### Backend (Node.js + Express)
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware

### Database Schema
```javascript
Interface {
  interfaceName: String (required, indexed)
  integrationKey: String (required, indexed)
  status: String (SUCCESS|FAILED|PENDING|RUNNING, required, indexed)
  message: String
  severity: String (LOW|MEDIUM|HIGH|CRITICAL, default: LOW)
  executionTime: Number (milliseconds)
  recordsProcessed: Number
  sourceSystem: String (required)
  targetSystem: String (required)
  errorDetails: String
  retryCount: Number (default: 0)
  nextRetryTime: Date
  createdAt: Date (indexed)
  updatedAt: Date
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HR
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB connection and JWT secret
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend development server (from frontend directory)
   npm run dev
   ```

5. **Generate sample data**
   ```bash
   # Generate 50,000 sample records
   node generate-interface-data.js
   ```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Interface Monitoring Endpoints
- `GET /api/interfaces/metrics` - Get dashboard metrics
- `GET /api/interfaces/logs` - Get interface logs with pagination
- `POST /api/interfaces/logs` - Create new interface log
- `PUT /api/interfaces/logs/:id` - Update interface log
- `DELETE /api/interfaces/logs/:id` - Delete interface log
- `POST /api/interfaces/seed` - Generate sample data

### Query Parameters
- `page` - Page number (for traditional pagination)
- `limit` - Records per page
- `status` - Filter by status
- `severity` - Filter by severity
- `interfaceName` - Filter by interface name
- `integrationKey` - Filter by integration key
- `startDate` - Start date for filtering
- `endDate` - End date for filtering
- `globalSearch` - Global search term
- `timeRange` - Time range for metrics (1h, 24h, 7d, 30d)
- `sortBy` - Sort field
- `sortOrder` - Sort direction (asc/desc)

## 🎯 Usage Guide

### Dashboard Overview
1. **Login**: Use your credentials to access the dashboard
2. **View Metrics**: See real-time execution statistics
3. **Select Date Range**: Choose predefined or custom date ranges
4. **Analyze Charts**: Interact with charts for detailed insights

### Data Filtering
1. **Use Search Bar**: Enter any term for global search
2. **Apply Filters**: Use status, severity, and date filters
3. **Sort Data**: Click column headers to sort
4. **Export Results**: Download filtered data

### Monitoring Alerts
1. **View Notifications**: Check the notification panel
2. **Set Alerts**: Configure alert thresholds
3. **Track Failures**: Monitor failed executions
4. **Performance Analysis**: Analyze execution times

## 🔧 Configuration

### Environment Variables
```env
# Backend (.env)
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hr-interfaces
JWT_SECRET=your-secret-key
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:5001/api
```

### Database Indexes
- `createdAt: -1` - For time-based queries
- `status: 1, createdAt: -1` - For status filtering
- `interfaceName: 1, createdAt: -1` - For interface filtering
- `integrationKey: 1, createdAt: -1` - For integration key filtering

## 📊 Data Generation

### Sample Data Characteristics
- **50,000 records** generated over 90 days
- **93% success rate** (realistic for production systems)
- **No CRITICAL severity for SUCCESS status** (logical consistency)
- **Diverse interface types**: Employee Sync, Payroll, Benefits, etc.
- **Realistic execution times**: 100ms to 10 seconds
- **Varied record counts**: 1 to 1,000 records per execution

### Data Distribution
- **SUCCESS**: 93% (46,500 records)
- **FAILED**: 4% (2,000 records)
- **PENDING**: 2% (1,000 records)
- **RUNNING**: 1% (500 records)

## 🛠️ Development

### Project Structure
```
HR/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.tsx
│   └── package.json
├── generate-interface-data.js
└── README.md
```

### Available Scripts
```bash
# Backend
npm start          # Start production server
npm run dev        # Start development server with nodemon

# Frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 🚀 Deployment

### Production Deployment
1. **Build Frontend**: `npm run build`
2. **Set Environment Variables**: Configure production settings
3. **Deploy Backend**: Deploy to your preferred hosting service
4. **Configure Database**: Set up MongoDB Atlas or local MongoDB
5. **Set Up Reverse Proxy**: Configure nginx or similar

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password encryption
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet Security**: Security headers and middleware

## 📈 Performance Optimization

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading with infinite scroll
- **Caching**: Redis caching for frequently accessed data
- **Compression**: Gzip compression for API responses
- **CDN**: Static asset delivery optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0**: Initial release with basic monitoring
- **v1.1.0**: Added authentication and advanced filtering
- **v1.2.0**: Implemented infinite scroll and custom date ranges
- **v1.3.0**: Enhanced charts and notification system
