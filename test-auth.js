const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAuth() {
  console.log('🔐 Testing Authentication System...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Create default admin user
    console.log('\n👤 Creating default admin user...');
    const createUserResponse = await axios.post(`${BASE_URL}/auth/create-default-user`);
    console.log('✅ Admin user created:', createUserResponse.data);
    
    // Test login
    console.log('\n🔑 Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✅ Login successful:', {
      success: loginResponse.data.success,
      user: loginResponse.data.user.username,
      role: loginResponse.data.user.role
    });
    
    // Test token verification
    console.log('\n🔍 Testing token verification...');
    const token = loginResponse.data.token;
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Token verification successful:', verifyResponse.data.success);
    
    // Test protected endpoint
    console.log('\n🛡️ Testing protected endpoint...');
    const metricsResponse = await axios.get(`${BASE_URL}/interfaces/metrics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Protected endpoint accessible:', {
      totalExecutions: metricsResponse.data.summary.totalExecutions
    });
    
    console.log('\n🎉 Authentication system is working perfectly!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();
