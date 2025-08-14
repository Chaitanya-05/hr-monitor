import React, { useState, useEffect } from 'react';
import axios from '../services/axios';

const ApiTest: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Testing...');
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('🔍 Testing API connection...');
        console.log('🔍 Environment variable:', import.meta.env.VITE_API_URL);
        console.log('🔍 Axios baseURL:', axios.defaults.baseURL);
        
        const response = await axios.get('/interfaces/metrics?timeRange=24h');
        console.log('✅ API Response:', response.data);
        
        setApiStatus('✅ API Connected Successfully!');
        setData(response.data);
        setError('');
      } catch (err: unknown) {
        console.error('❌ API Error:', err);
        setApiStatus('❌ API Connection Failed');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setData(null);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {apiStatus}
        </div>
        
        <div>
          <strong>Environment Variable:</strong> {import.meta.env.VITE_API_URL || 'Not set'}
        </div>
        
        <div>
          <strong>Axios Base URL:</strong> {axios.defaults.baseURL}
        </div>
        
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {data && (
          <div>
            <strong>Data Received:</strong>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTest;
