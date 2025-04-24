import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loginSuccess = params.get('login_success');
    const userId = params.get('user_id');
    
    if (loginSuccess === 'true') {
      // Store authentication info in localStorage or state management
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', userId);
      
      // Redirect to homepage
      navigate('/homepage');
    } else {
      // Handle login failure
      navigate('/login?error=authentication_failed');
    }
  }, [location, navigate]);
  
  return <div>Processing authentication...</div>;
}

export default AuthCallback;