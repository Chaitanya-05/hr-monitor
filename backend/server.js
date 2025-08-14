import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import interfaceRoutes from './routes/interfaceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Interface Monitoring API is running' });
});

// Protected routes - require authentication
app.use('/api/interfaces', authenticateToken, interfaceRoutes);

// Create default admin user on server start
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const adminUser = new User({
        username: 'admin',
        email: 'admin@hr-dashboard.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created successfully!');
      console.log('📋 Login Credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`🚀 Interface Monitoring API running on port ${PORT}`);
  await createDefaultAdmin();
});
