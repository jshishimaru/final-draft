import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../apiservice';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    console.log('Checking Auth');
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setIsAuth(authStatus);
    };

    checkAuth();
  }, []);

  if (isAuth === null) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  if (!isAuth) {
    alert('Login Required');
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;