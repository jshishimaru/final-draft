import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../apiservice';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  // const location = useLocation();

  useEffect(() => {
    console.log('Checking Auth');
    // First check localStorage as a fallback
    const localAuth = localStorage.getItem('isAuthenticated');
    if (localAuth === 'true') {
      console.log('User authenticated via localStorage');
    }

    const checkAuth = async () => {
      try {
        // Log cookies for debugging
        console.log('All cookies:', document.cookie);
        
        // Log a direct fetch to debug endpoint
        try {
          const debugResponse = await fetch('http://localhost:8000/debug/auth/', {
            credentials: 'include'
          });
          const debugData = await debugResponse.json();
          console.log('Direct auth check:', debugData);
        } catch (e) {
          console.error('Debug endpoint failed:', e);
        }
        
        const authResult = await isAuthenticated();
        console.log('Auth result from apiservice:', authResult);
        if (authResult) {
          localStorage.setItem('isAuthenticated', 'true');
        }

        setIsAuth(authResult || localAuth === 'true');
      } catch (error) {
        console.error('Protected route auth check failed:', error);
        setIsAuth(localAuth === 'true');
      } finally {
        setLoading(false);
      }
    };
  
    checkAuth();
  }, []);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuth === null) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  if (!isAuth) {
    alert('Not authenticated, redirecting to login');
    localStorage.removeItem('isAuthenticated');
    return <Navigate to="/login" replace />;
  }

  console.log('Authentication confirmed, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;