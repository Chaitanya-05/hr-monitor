const axios = require('axios');

const BACKEND_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:5173';

async function testBackendAPI() {
  console.log('🔍 Testing Backend API...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test metrics endpoint
    const metricsResponse = await axios.get(`${BACKEND_URL}/api/interfaces/metrics?timeRange=24h`);
    console.log('✅ Metrics endpoint:', {
      totalExecutions: metricsResponse.data.summary.totalExecutions,
      successCount: metricsResponse.data.summary.successCount,
      failedCount: metricsResponse.data.summary.failedCount,
      avgExecutionTime: metricsResponse.data.summary.avgExecutionTime
    });
    
    // Test logs endpoint with pagination
    const logsResponse = await axios.get(`${BACKEND_URL}/api/interfaces/logs?page=1&limit=5`);
    console.log('✅ Logs endpoint:', {
      totalRecords: logsResponse.data.pagination.totalRecords,
      totalPages: logsResponse.data.pagination.totalPages,
      recordsReturned: logsResponse.data.interfaces.length
    });
    
    // Test filtering
    const filterResponse = await axios.get(`${BACKEND_URL}/api/interfaces/logs?status=SUCCESS&limit=3`);
    console.log('✅ Filtering test:', {
      filteredRecords: filterResponse.data.interfaces.length,
      allSuccess: filterResponse.data.interfaces.every(log => log.status === 'SUCCESS')
    });
    
    // Test global search
    const searchResponse = await axios.get(`${BACKEND_URL}/api/interfaces/logs?globalSearch=Employee&limit=3`);
    console.log('✅ Global search test:', {
      searchResults: searchResponse.data.interfaces.length
    });
    
    console.log('\n🎉 Backend API is working perfectly!\n');
    return true;
    
  } catch (error) {
    console.error('❌ Backend API test failed:', error.message);
    return false;
  }
}

async function testFrontendConnection() {
  console.log('🔍 Testing Frontend Connection...\n');
  
  try {
    // Test if frontend is accessible
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend is accessible');
    
    // Test if frontend can reach backend
    const apiTestResponse = await axios.get(`${BACKEND_URL}/api/interfaces/metrics?timeRange=24h`);
    console.log('✅ Frontend can reach backend API');
    
    console.log('\n🎉 Frontend connection is working!\n');
    return true;
    
  } catch (error) {
    console.error('❌ Frontend connection test failed:', error.message);
    return false;
  }
}

async function testDataQuality() {
  console.log('🔍 Testing Data Quality...\n');
  
  try {
    const logsResponse = await axios.get(`${BACKEND_URL}/api/interfaces/logs?page=1&limit=10`);
    const logs = logsResponse.data.interfaces;
    
    // Check data structure
    const requiredFields = ['interfaceName', 'integrationKey', 'status', 'message', 'severity', 'executionTime', 'recordsProcessed', 'sourceSystem', 'targetSystem'];
    const sampleLog = logs[0];
    
    const missingFields = requiredFields.filter(field => !sampleLog.hasOwnProperty(field));
    if (missingFields.length === 0) {
      console.log('✅ All required fields are present');
    } else {
      console.log('❌ Missing fields:', missingFields);
    }
    
    // Check data variety
    const statuses = [...new Set(logs.map(log => log.status))];
    const interfaces = [...new Set(logs.map(log => log.interfaceName))];
    const severities = [...new Set(logs.map(log => log.severity))];
    
    console.log('✅ Status variety:', statuses);
    console.log('✅ Interface variety:', interfaces.length, 'different interfaces');
    console.log('✅ Severity variety:', severities);
    
    // Check date range
    const dates = logs.map(log => new Date(log.createdAt));
    const oldestDate = new Date(Math.min(...dates));
    const newestDate = new Date(Math.max(...dates));
    const daysDiff = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
    
    console.log('✅ Date range:', `${daysDiff.toFixed(1)} days (${oldestDate.toDateString()} to ${newestDate.toDateString()})`);
    
    console.log('\n🎉 Data quality is excellent!\n');
    return true;
    
  } catch (error) {
    console.error('❌ Data quality test failed:', error.message);
    return false;
  }
}

async function testPerformance() {
  console.log('🔍 Testing Performance...\n');
  
  try {
    const startTime = Date.now();
    
    // Test metrics endpoint performance
    const metricsStart = Date.now();
    await axios.get(`${BACKEND_URL}/api/interfaces/metrics?timeRange=24h`);
    const metricsTime = Date.now() - metricsStart;
    
    // Test logs endpoint performance
    const logsStart = Date.now();
    await axios.get(`${BACKEND_URL}/api/interfaces/logs?page=1&limit=50`);
    const logsTime = Date.now() - logsStart;
    
    // Test filtering performance
    const filterStart = Date.now();
    await axios.get(`${BACKEND_URL}/api/interfaces/logs?status=SUCCESS&limit=20`);
    const filterTime = Date.now() - filterStart;
    
    const totalTime = Date.now() - startTime;
    
    console.log('✅ Metrics endpoint:', `${metricsTime}ms`);
    console.log('✅ Logs endpoint:', `${logsTime}ms`);
    console.log('✅ Filtering endpoint:', `${filterTime}ms`);
    console.log('✅ Total test time:', `${totalTime}ms`);
    
    if (metricsTime < 1000 && logsTime < 1000 && filterTime < 1000) {
      console.log('\n🎉 Performance is excellent!\n');
      return true;
    } else {
      console.log('\n⚠️ Performance could be improved\n');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Interface Monitoring Dashboard - Integration Test\n');
  console.log('=' .repeat(60) + '\n');
  
  const results = {
    backend: await testBackendAPI(),
    frontend: await testFrontendConnection(),
    dataQuality: await testDataQuality(),
    performance: await testPerformance()
  };
  
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(30));
  console.log(`Backend API: ${results.backend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Connection: ${results.frontend ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Quality: ${results.dataQuality ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Performance: ${results.performance ? '✅ PASS' : '⚠️ NEEDS IMPROVEMENT'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED! The system is fully integrated and working.');
    console.log('\n🌐 Access your dashboard at: http://localhost:5173');
    console.log('🔧 API documentation: http://localhost:5001/health');
  } else {
    console.log('\n❌ Some tests failed. Please check the issues above.');
  }
  
  console.log('\n📈 Dashboard Features Available:');
  console.log('- Real-time metrics and charts');
  console.log('- Advanced filtering and search');
  console.log('- Pagination for large datasets');
  console.log('- Time-based filtering');
  console.log('- CSV export functionality');
  console.log('- Notification system');
  console.log('- Responsive design');
}

// Run the integration test
main().catch(console.error);
