import mongoose from 'mongoose';

const interfaceSchema = new mongoose.Schema({
  interfaceName: { 
    type: String, 
    required: true,
    index: true 
  },
  integrationKey: { 
    type: String, 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'RUNNING'],
    index: true 
  },
  message: { 
    type: String, 
    default: '' 
  },
  severity: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW' 
  },
  executionTime: { 
    type: Number, // in milliseconds
    default: 0 
  },
  recordsProcessed: { 
    type: Number, 
    default: 0 
  },
  sourceSystem: { 
    type: String, 
    required: true 
  },
  targetSystem: { 
    type: String, 
    required: true 
  },
  errorDetails: { 
    type: String 
  },
  retryCount: { 
    type: Number, 
    default: 0 
  },
  nextRetryTime: { 
    type: Date 
  }
}, { 
  timestamps: true 
});

// Indexes for performance optimization
interfaceSchema.index({ createdAt: -1 });
interfaceSchema.index({ status: 1, createdAt: -1 });
interfaceSchema.index({ interfaceName: 1, createdAt: -1 });
interfaceSchema.index({ integrationKey: 1, createdAt: -1 });

export default mongoose.model('Interface', interfaceSchema);
