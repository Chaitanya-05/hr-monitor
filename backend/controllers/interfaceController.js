import Interface from '../models/Interface.js';

// Get interface logs with pagination, filtering, and sorting
export const getInterfaceLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      interfaceName,
      integrationKey,
      severity,
      startDate,
      endDate,
      globalSearch,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (interfaceName) filter.interfaceName = { $regex: interfaceName, $options: 'i' };
    if (integrationKey) filter.integrationKey = { $regex: integrationKey, $options: 'i' };
    if (severity) filter.severity = severity;
    
    // Global search across multiple fields
    if (globalSearch) {
      filter.$or = [
        { interfaceName: { $regex: globalSearch, $options: 'i' } },
        { integrationKey: { $regex: globalSearch, $options: 'i' } },
        { message: { $regex: globalSearch, $options: 'i' } },
        { sourceSystem: { $regex: globalSearch, $options: 'i' } },
        { targetSystem: { $regex: globalSearch, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with pagination
    const interfaces = await Interface.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Interface.countDocuments(filter);

    res.json({
      interfaces,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecords: total,
        hasNextPage: skip + interfaces.length < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get summary metrics for dashboard
export const getSummaryMetrics = async (req, res) => {
  try {
    const { timeRange = '24h', startDate: customStartDate, endDate: customEndDate } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate, endDate;
    
    // Handle custom date range
    if (customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      // Use predefined time ranges
      endDate = now;
      switch (timeRange) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    // Aggregate metrics
    const metrics = await Interface.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalExecutions: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] }
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] }
          },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] }
          },
          runningCount: {
            $sum: { $cond: [{ $eq: ['$status', 'RUNNING'] }, 1, 0] }
          },
          avgExecutionTime: { $avg: '$executionTime' },
          totalRecordsProcessed: { $sum: '$recordsProcessed' }
        }
      }
    ]);

    // Get status distribution by interface
    const statusByInterface = await Interface.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$interfaceName',
          total: { $sum: 1 },
          success: { $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          running: { $sum: { $cond: [{ $eq: ['$status', 'RUNNING'] }, 1, 0] } }
        }
      },
      {
        $sort: { total: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get time-based trends (hourly for 24h, daily for longer periods)
    const timeUnit = timeRange === '24h' || timeRange === '1h' ? 'hour' : 'day';
    const timeField = timeRange === '24h' || timeRange === '1h' ? '$hour' : '$dayOfYear';
    
    const timeTrends = await Interface.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            timeUnit: { [timeField]: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.timeUnit',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill gaps with zero values for continuous chart
    const filledTimeTrends = [];
    const totalHours = timeRange === '1h' ? 1 : 
                      timeRange === '24h' ? 24 : 
                      timeRange === '7d' ? 7 : 
                      timeRange === '30d' ? 30 : 24;
    
    const isCustomRange = customStartDate && customEndDate;
    const rangeInHours = isCustomRange ? 
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) : totalHours;
    
    const maxTimeUnits = timeRange === '24h' || timeRange === '1h' ? 24 : 
                        timeRange === '7d' ? 7 : 
                        timeRange === '30d' ? 30 : 24;
    
    for (let i = 0; i < maxTimeUnits; i++) {
      const existingData = timeTrends.find(trend => trend._id === i);
      if (existingData) {
        filledTimeTrends.push(existingData);
      } else {
        // Fill with zero values
        filledTimeTrends.push({
          _id: i,
          statuses: [
            { status: 'SUCCESS', count: 0 },
            { status: 'FAILED', count: 0 },
            { status: 'PENDING', count: 0 },
            { status: 'RUNNING', count: 0 }
          ]
        });
      }
    }

    const result = {
      summary: metrics[0] || {
        totalExecutions: 0,
        successCount: 0,
        failedCount: 0,
        pendingCount: 0,
        runningCount: 0,
        avgExecutionTime: 0,
        totalRecordsProcessed: 0
      },
      statusByInterface,
      hourlyTrends: filledTimeTrends,
      timeRange,
      startDate,
      endDate
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new interface log
export const createInterfaceLog = async (req, res) => {
  try {
    const interfaceLog = new Interface(req.body);
    const savedLog = await interfaceLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update interface log
export const updateInterfaceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLog = await Interface.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedLog) {
      return res.status(404).json({ message: 'Interface log not found' });
    }
    
    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get interface log by ID
export const getInterfaceLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const interfaceLog = await Interface.findById(id);
    
    if (!interfaceLog) {
      return res.status(404).json({ message: 'Interface log not found' });
    }
    
    res.json(interfaceLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete interface log
export const deleteInterfaceLog = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLog = await Interface.findByIdAndDelete(id);
    
    if (!deletedLog) {
      return res.status(404).json({ message: 'Interface log not found' });
    }
    
    res.json({ message: 'Interface log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed sample data for testing
export const seedSampleData = async (req, res) => {
  try {
    const sampleInterfaces = [
      'Employee Sync',
      'Payroll Integration',
      'Benefits Sync',
      'Time Tracking',
      'Performance Reviews',
      'Recruitment Pipeline',
      'Training Records',
      'Compensation Sync'
    ];

    const sampleMessages = [
      'Successfully processed 150 employee records',
      'Failed to connect to external API',
      'Data validation completed successfully',
      'Timeout occurred during data transfer',
      'Records synchronized successfully',
      'Authentication failed',
      'Batch processing completed',
      'Network connection lost'
    ];

    const sampleData = [];
    const now = new Date();

    // Generate 50,000 sample records with more success status
    for (let i = 0; i < 50000; i++) {
      const randomDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Last 90 days
      
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
        severity = ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)];
      } else {
        // For other statuses, can use all severity levels
        severity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)];
      }
      
      sampleData.push({
        interfaceName: sampleInterfaces[Math.floor(Math.random() * sampleInterfaces.length)],
        integrationKey: `INT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        status,
        message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        severity,
        executionTime: Math.floor(Math.random() * 5000) + 100,
        recordsProcessed: Math.floor(Math.random() * 1000) + 1,
        sourceSystem: ['SAP SuccessFactors', 'Workday', 'BambooHR', 'ADP'][Math.floor(Math.random() * 4)],
        targetSystem: ['SAP ECP', 'Oracle HCM', 'Salesforce', 'Custom System'][Math.floor(Math.random() * 4)],
        errorDetails: status === 'FAILED' ? 'Connection timeout after 30 seconds' : undefined,
        retryCount: status === 'FAILED' ? Math.floor(Math.random() * 3) : 0,
        nextRetryTime: status === 'FAILED' ? new Date(randomDate.getTime() + 5 * 60 * 1000) : undefined,
        createdAt: randomDate,
        updatedAt: randomDate
      });
    }

    // Clear existing data and insert new sample data
    await Interface.deleteMany({});
    await Interface.insertMany(sampleData);

    res.json({ 
      message: 'Sample data seeded successfully - 50,000 records over last 90 days', 
      count: sampleData.length 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
