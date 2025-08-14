import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiFilter, 
  FiSearch, 
  FiRefreshCw, 
  FiEye, 
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiDownload
} from 'react-icons/fi';
import { format } from 'date-fns';
import axios from '../services/axios';
import { toast } from 'react-hot-toast';

interface InterfaceLog {
  _id: string;
  interfaceName: string;
  integrationKey: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'RUNNING';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  executionTime: number;
  recordsProcessed: number;
  sourceSystem: string;
  targetSystem: string;
  errorDetails?: string;
  retryCount: number;
  nextRetryTime?: Date;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FilterState {
  status: string;
  interfaceName: string;
  integrationKey: string;
  severity: string;
  startDate: string;
  endDate: string;
  globalSearch: string;
}

const STATUS_COLORS = {
  SUCCESS: 'bg-green-100 text-green-800 border-green-200',
  FAILED: 'bg-red-100 text-red-800 border-red-200',
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  RUNNING: 'bg-blue-100 text-blue-800 border-blue-200'
};

const SEVERITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800'
};

const STATUS_ICONS = {
  SUCCESS: FiCheckCircle,
  FAILED: FiAlertCircle,
  PENDING: FiClock,
  RUNNING: FiPlay
};

const InterfaceLogsTable: React.FC = () => {
  const [logs, setLogs] = useState<InterfaceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    interfaceName: '',
    integrationKey: '',
    severity: '',
    startDate: '',
    endDate: '',
    globalSearch: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<InterfaceLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [hasMore, setHasMore] = useState(true);

  const fetchLogs = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, value]) => value !== '')
        )
      });

      const response = await axios.get(`/interfaces/logs?${params}`);
      
      if (isLoadMore) {
        setLogs(prev => [...prev, ...response.data.interfaces]);
      } else {
        setLogs(response.data.interfaces);
      }
      
      setPagination(response.data.pagination);
      setHasMore(response.data.pagination.hasNextPage);
    } catch (error) {
      toast.error('Failed to fetch interface logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, sortBy, sortOrder, filters, limit]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (page === 1) {
      fetchLogs(false);
    } else {
      fetchLogs(true);
    }
  }, [page, sortBy, sortOrder, filters, limit, fetchLogs]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [filters, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      interfaceName: '',
      integrationKey: '',
      severity: '',
      startDate: '',
      endDate: '',
      globalSearch: ''
    });
    setPage(1);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Interface Name',
      'Integration Key',
      'Status',
      'Severity',
      'Message',
      'Execution Time (ms)',
      'Records Processed',
      'Source System',
      'Target System',
      'Created At'
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.interfaceName,
        log.integrationKey,
        log.status,
        log.severity,
        `"${log.message.replace(/"/g, '""')}"`,
        log.executionTime,
        log.recordsProcessed,
        log.sourceSystem,
        log.targetSystem,
        format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interface-logs-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Interface Logs</h2>
            <p className="text-sm text-gray-600">
              {pagination ? `Loaded ${logs.length} of ${pagination.totalRecords} records` : 'Loading...'}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiDownload className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setPage(1);
                setHasMore(true);
                fetchLogs(false);
              }}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search across all fields..."
            value={filters.globalSearch}
            onChange={(e) => handleFilterChange('globalSearch', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Advanced Filters */}
        <div className="mb-4">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <FiFilter className="w-4 h-4 mr-2" />
            Advanced Filters
            {showAdvancedFilters ? <FiChevronUp className="w-4 h-4 ml-2" /> : <FiChevronDown className="w-4 h-4 ml-2" />}
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
                <option value="RUNNING">Running</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interface Name</label>
              <input
                type="text"
                value={filters.interfaceName}
                onChange={(e) => handleFilterChange('interfaceName', e.target.value)}
                placeholder="Filter by interface name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Integration Key</label>
              <input
                type="text"
                value={filters.integrationKey}
                onChange={(e) => handleFilterChange('integrationKey', e.target.value)}
                placeholder="Filter by integration key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Severity</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2 flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiX className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('interfaceName')}>
                Interface Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('integrationKey')}>
                Integration Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('status')}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('severity')}>
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('executionTime')}>
                Execution Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('createdAt')}>
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No interface logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.interfaceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.integrationKey}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[log.status]}`}>
                      {getStatusIcon(log.status)}
                      <span className="ml-1">{log.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[log.severity]}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatExecutionTime(log.executionTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Infinite Scroll Loading Indicator */}
      {loadingMore && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Loading more records...</span>
          </div>
        </div>
      )}
      
      {/* End of Records Indicator */}
      {!hasMore && logs.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            You've reached the end of all records
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Interface Log Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interface Name</label>
                  <p className="text-sm text-gray-900">{selectedLog.interfaceName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Integration Key</label>
                  <p className="text-sm text-gray-900">{selectedLog.integrationKey}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedLog.status]}`}>
                    {getStatusIcon(selectedLog.status)}
                    <span className="ml-1">{selectedLog.status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[selectedLog.severity]}`}>
                    {selectedLog.severity}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Execution Time</label>
                  <p className="text-sm text-gray-900">{formatExecutionTime(selectedLog.executionTime)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Records Processed</label>
                  <p className="text-sm text-gray-900">{selectedLog.recordsProcessed}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source System</label>
                  <p className="text-sm text-gray-900">{selectedLog.sourceSystem}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Target System</label>
                  <p className="text-sm text-gray-900">{selectedLog.targetSystem}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Retry Count</label>
                  <p className="text-sm text-gray-900">{selectedLog.retryCount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-sm text-gray-900">{format(new Date(selectedLog.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedLog.message}</p>
              </div>
              
              {selectedLog.errorDetails && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Error Details</label>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{selectedLog.errorDetails}</p>
                </div>
              )}
              
              {selectedLog.nextRetryTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Next Retry Time</label>
                  <p className="text-sm text-gray-900">{format(new Date(selectedLog.nextRetryTime), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterfaceLogsTable;
