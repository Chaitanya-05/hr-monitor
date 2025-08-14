const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Interface configurations
const INTERFACES = [
  'Employee Sync',
  'Payroll Integration', 
  'Benefits Sync',
  'Time Tracking',
  'Performance Reviews',
  'Recruitment Pipeline',
  'Training Records',
  'Compensation Sync',
  'Leave Management',
  'Onboarding Process'
];

const SOURCE_SYSTEMS = [
  'SAP SuccessFactors',
  'Workday',
  'BambooHR',
  'ADP',
  'Oracle HCM',
  'UltiPro',
  'Ceridian Dayforce',
  'Paycom'
];

const TARGET_SYSTEMS = [
  'SAP ECP',
  'Oracle HCM',
  'Salesforce',
  'Custom HR System',
  'Payroll System',
  'Benefits Portal',
  'Time Management',
  'Learning Platform'
];

const MESSAGES = {
  SUCCESS: [
    'Successfully processed 150 employee records',
    'Data synchronization completed successfully',
    'Records updated without errors',
    'Integration completed in 2.3 seconds',
    'All records validated and processed',
    'Batch processing completed successfully',
    'Employee data synchronized successfully',
    'Payroll data transferred successfully'
  ],
  FAILED: [
    'Connection timeout after 30 seconds',
    'Authentication failed - invalid credentials',
    'Data validation error: missing required fields',
    'Network connection lost during transfer',
    'API rate limit exceeded',
    'Database connection failed',
    'Invalid data format received',
    'Service unavailable - retry later'
  ],
  PENDING: [
    'Waiting for system availability',
    'Queued for processing',
    'Awaiting data validation',
    'Scheduled for next batch',
    'Pending approval workflow',
    'Waiting for dependencies'
  ],
  RUNNING: [
    'Processing employee records',
    'Synchronizing data between systems',
    'Validating data integrity',
    'Transferring records in progress',
    'Running batch job'
  ]
};

const ERROR_DETAILS = [
  'Connection timeout: The target system did not respond within the expected timeframe',
  'Authentication error: Invalid API credentials or expired token',
  'Data validation failed: Required fields missing or invalid format',
  'Network error: Unable to establish connection to target system',
  'Rate limit exceeded: Too many requests in a short time period',
  'Database error: Unable to write to target database',
  'Service unavailable: Target system is currently down for maintenance',
  'Data format error: Received data does not match expected schema'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(startDate, endDate) {
  return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
}

function generateInterfaceLog() {
  const now = new Date();
  const startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)); // 90 days ago
  const randomDate = getRandomDate(startDate, now);
  
  // Bias towards success status (93% success, 4% failed, 2% pending, 1% running)
  const statusRandom = Math.random();
  let status;
  if (statusRandom < 0.93) {
    status = 'SUCCESS';
  } else if (statusRandom < 0.97) {
    status = 'FAILED';
  } else if (statusRandom < 0.99) {
    status = 'PENDING';
  } else {
    status = 'RUNNING';
  }
  
  // Determine severity based on status
  let severity;
  if (status === 'SUCCESS') {
    // For success status, only use LOW, MEDIUM, or HIGH (no CRITICAL)
    severity = getRandomElement(['LOW', 'MEDIUM', 'HIGH']);
  } else {
    // For other statuses, can use all severity levels
    severity = getRandomElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  }
  
  const interfaceName = getRandomElement(INTERFACES);
  const sourceSystem = getRandomElement(SOURCE_SYSTEMS);
  const targetSystem = getRandomElement(TARGET_SYSTEMS);
  
  const executionTime = Math.floor(Math.random() * 10000) + 100; // 100ms to 10s
  const recordsProcessed = Math.floor(Math.random() * 1000) + 1;
  
  const message = getRandomElement(MESSAGES[status]);
  const errorDetails = status === 'FAILED' ? getRandomElement(ERROR_DETAILS) : undefined;
  const retryCount = status === 'FAILED' ? Math.floor(Math.random() * 3) : 0;
  const nextRetryTime = status === 'FAILED' ? new Date(randomDate.getTime() + 5 * 60 * 1000) : undefined;
  
  return {
    interfaceName,
    integrationKey: `INT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    status,
    message,
    severity,
    executionTime,
    recordsProcessed,
    sourceSystem,
    targetSystem,
    errorDetails,
    retryCount,
    nextRetryTime,
    createdAt: randomDate,
    updatedAt: randomDate
  };
}

async function generateBulkData(totalRecords = 10000, batchSize = 100) {
  console.log(`🚀 Starting to generate ${totalRecords} interface logs...`);
  
  const batches = Math.ceil(totalRecords / batchSize);
  let successCount = 0;
  let errorCount = 0;
  
  for (let batch = 0; batch < batches; batch++) {
    const batchData = [];
    const currentBatchSize = Math.min(batchSize, totalRecords - (batch * batchSize));
    
    for (let i = 0; i < currentBatchSize; i++) {
      batchData.push(generateInterfaceLog());
    }
    
    try {
      // Create logs in parallel for better performance
      const promises = batchData.map(log => 
        axios.post(`${BASE_URL}/interfaces/logs`, log)
          .then(() => ({ success: true }))
          .catch(err => ({ success: false, error: err.message }))
      );
      
      const results = await Promise.all(promises);
      
      const batchSuccess = results.filter(r => r.success).length;
      const batchErrors = results.filter(r => !r.success).length;
      
      successCount += batchSuccess;
      errorCount += batchErrors;
      
      console.log(`📦 Batch ${batch + 1}/${batches}: ${batchSuccess} created, ${batchErrors} failed`);
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error in batch ${batch + 1}:`, error.message);
      errorCount += currentBatchSize;
    }
  }
  
  console.log(`\n✅ Data generation completed!`);
  console.log(`📊 Total records created: ${successCount}`);
  console.log(`❌ Total errors: ${errorCount}`);
  console.log(`📈 Success rate: ${((successCount / totalRecords) * 100).toFixed(1)}%`);
  
  return { successCount, errorCount };
}

async function testAPIEndpoints() {
  console.log('🔍 Testing API endpoints...\n');
  
  try {
    // Test health endpoint
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Test metrics endpoint
    const metricsResponse = await axios.get(`${BASE_URL}/interfaces/metrics?timeRange=24h`);
    console.log('✅ Metrics endpoint:', metricsResponse.data.summary);
    
    // Test logs endpoint
    const logsResponse = await axios.get(`${BASE_URL}/interfaces/logs?page=1&limit=5`);
    console.log('✅ Logs endpoint:', logsResponse.data.pagination);
    
    console.log('\n🎉 All API endpoints are working correctly!\n');
    return true;
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Interface Monitoring Dashboard - Data Generator\n');
  
  // Test API first
  const apiWorking = await testAPIEndpoints();
  if (!apiWorking) {
    console.log('❌ API is not working. Please start the backend server first.');
    return;
  }
  
  // Generate data
  await generateBulkData(50000);
  
  // Test final metrics
  console.log('\n🔍 Final API test after data generation...');
  await testAPIEndpoints();
  
  console.log('\n🎉 Data generation script completed!');
  console.log('🌐 You can now access the dashboard at: http://localhost:5173');
}

// Run the script
main().catch(console.error);
