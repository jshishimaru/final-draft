import { createBrowserRouter } from 'react-router-dom'
import LoginForm from './Components/LoginPage'
import SignUpForm from './Components/SignUpPage'
import Assignments from './Components/Assignments';
import Dashboard from './Components/Dashboard';
import ProtectedRoute from './Components/ProtectedRoute';
import UserInfo from './Components/UserInfo';

const router = createBrowserRouter([
	
	{	
		path: '/',
		element: <LoginForm />
	},
	{
		path: '/login',
		element: <LoginForm />
	},
	{
		path: '/signup',
		element: <SignUpForm />
	},

   {
	    path: '/homepage',
	    element:(
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
		),
	    children: [
	      { index: true, element: <Assignments /> }, // Default to Home on /homepage
	      { path: 'assignments', element: <Assignments /> },

		  { path : 'users/:user_id', element: <UserInfo /> },
	    ]
 	},

]);

export default router;
