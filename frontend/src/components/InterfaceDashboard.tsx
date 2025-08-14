import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiTrendingUp,
  FiList
} from 'react-icons/fi';
import axios from '../services/axios';
import { toast } from 'react-hot-toast';
import InterfaceLogsTable from './InterfaceLogsTable';
import NotificationSystem from './NotificationSystem';
import CustomDateRangePicker from './CustomDateRangePicker';

interface SummaryMetrics {
  totalExecutions: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  runningCount: number;
  avgExecutionTime: number;
  totalRecordsProcessed: number;
}

interface StatusByInterface {
  _id: string;
  total: number;
  success: number;
  failed: number;
  pending: number;
  running: number;
}

interface HourlyTrend {
  _id: number;
  statuses: Array<{
    status: string;
    count: number;
  }>;
}

interface DashboardData {
  summary: SummaryMetrics;
  statusByInterface: StatusByInterface[];
  hourlyTrends: HourlyTrend[];
  timeRange: string;
}

const COLORS = {
  success: '#10B981',
  failed: '#EF4444',
  pending: '#F59E0B',
  running: '#3B82F6'
};

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin?: Date;
}

interface InterfaceDashboardProps {
  onLogout: () => void;
  user: User;
}

const InterfaceDashboard: React.FC<InterfaceDashboardProps> = ({ onLogout, user }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [viewMode, setViewMode] = useState<'dashboard' | 'logs'>('dashboard');
  const [customDateRange, setCustomDateRange] = useState<{ startDate: Date; endDate: Date } | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      
      let url = `/interfaces/metrics?timeRange=${timeRange}`;
      
      // Add custom date range parameters if available
      if (customDateRange) {
        url += `&startDate=${customDateRange.startDate.toISOString()}&endDate=${customDateRange.endDate.toISOString()}`;
      }
      
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [timeRange, customDateRange]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const getSuccessRate = () => {
    if (!data?.summary.totalExecutions) return 0;
    return ((data.summary.successCount / data.summary.totalExecutions) * 100).toFixed(1);
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getHourlyChartData = () => {
    if (!data?.hourlyTrends) return [];
    
    return data.hourlyTrends.map(hour => {
      const hourData: Record<string, string | number> = { 
        hour: data.timeRange === '24h' || data.timeRange === '1h' ? 
          `${hour._id.toString().padStart(2, '0')}:00` : 
          `Day ${hour._id + 1}`
      };
      
      // Initialize all status counts to 0
      hourData.success = 0;
      hourData.failed = 0;
      hourData.pending = 0;
      hourData.running = 0;
      
      // Set actual values from data
      hour.statuses.forEach(status => {
        hourData[status.status.toLowerCase()] = status.count;
      });
      
      return hourData;
    });
  };

  const getInterfaceChartData = () => {
    if (!data?.statusByInterface) return [];
    
    return data.statusByInterface.map(interface_ => ({
      name: interface_._id,
      success: interface_.success,
      failed: interface_.failed,
      pending: interface_.pending,
      running: interface_.running
    }));
  };

  const getPieChartData = () => {
    if (!data?.summary) return [];
    
    return [
      { name: 'Success', value: data.summary.successCount, color: COLORS.success },
      { name: 'Failed', value: data.summary.failedCount, color: COLORS.failed },
      { name: 'Pending', value: data.summary.pendingCount, color: COLORS.pending },
      { name: 'Running', value: data.summary.runningCount, color: COLORS.running }
    ].filter(item => item.value > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interface Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring of HR integration interfaces</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Welcome, {user.username}</span>
            <span className="text-gray-400">|</span>
            <span className="capitalize">{user.role}</span>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiActivity className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setViewMode('logs')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'logs'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FiList className="w-4 h-4 inline mr-2" />
              Logs
            </button>
          </div>

          {/* Notification System */}
          <NotificationSystem />

          {/* Time Range Selector */}
          <div className="flex space-x-2">
            {[
              { value: '1h', label: 'Last Hour' },
              { value: '24h', label: 'Last 24 Hours' },
              { value: '7d', label: 'Last Week' },
              { value: '30d', label: 'Last Month' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  setTimeRange(range.value);
                  setCustomDateRange(null); // Clear custom date range
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range.value && !customDateRange
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
            
            {/* Custom Date Range Picker */}
            <div className={`${customDateRange ? 'ring-2 ring-blue-500' : ''}`}>
              <CustomDateRangePicker
                onRangeChange={(range) => {
                  setCustomDateRange(range);
                  setTimeRange('custom'); // Set a custom timeRange to indicate custom date is selected
                }}
                currentRange={customDateRange || undefined}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conditional Rendering based on View Mode */}
      {viewMode === 'dashboard' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-3xl font-bold text-gray-900">{data?.summary.totalExecutions || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiActivity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-green-600">{getSuccessRate()}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed Executions</p>
              <p className="text-3xl font-bold text-red-600">{data?.summary.failedCount || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiXCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Execution Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatExecutionTime(data?.summary.avgExecutionTime || 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPieChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getPieChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Trends Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Trends (Last 24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getHourlyChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="success" stroke={COLORS.success} strokeWidth={2} />
              <Line type="monotone" dataKey="failed" stroke={COLORS.failed} strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke={COLORS.pending} strokeWidth={2} />
              <Line type="monotone" dataKey="running" stroke={COLORS.running} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interface Performance Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interface Performance</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={getInterfaceChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="success" fill={COLORS.success} />
            <Bar dataKey="failed" fill={COLORS.failed} />
            <Bar dataKey="pending" fill={COLORS.pending} />
            <Bar dataKey="running" fill={COLORS.running} />
          </BarChart>
        </ResponsiveContainer>
      </div>
        </>
      ) : (
        <InterfaceLogsTable />
      )}
    </div>
  );
};

export default InterfaceDashboard;
