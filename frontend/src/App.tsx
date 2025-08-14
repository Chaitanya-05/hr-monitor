
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import InterfaceDashboard from "./components/InterfaceDashboard";
import LoginPage from "./components/LoginPage";
import axios from "./services/axios";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  lastLogin?: Date;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token with backend
        const response = await axios.get('/auth/verify');
        
        if (response.data.success) {
          setIsAuthenticated(true);
          setUser(JSON.parse(savedUser));
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    
    setLoading(false);
  };

  const handleLoginSuccess = (_token: string, userData: { id: string; username: string; email: string; role: string; lastLogin?: string }) => {
    setIsAuthenticated(true);
    setUser({
      ...userData,
      lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : undefined
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && user ? (
          <InterfaceDashboard onLogout={handleLogout} user={user} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </>
  );
}
