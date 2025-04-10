import { createBrowserRouter } from 'react-router-dom'
import LoginForm from './Components/LoginPage'
import SignUpForm from './Components/SignUpPage'
import Assignments from './Components/Assignments';
import Dashboard from './Components/Dashboard';
// import Groups from './Components/Groups';
// import Notifications from './Components/Notifications';
// import AssignmentDetails from './Components/AssignmentDetails';
// import CreateAssignment from './Components/CreateAssignment';
// import AssignmentMembers from './Components/AssignmentMembers';
// import Submissions from './Components/Submissions';
// import SubmitAssignment from './Components/SubmitAssignment';
// import ReviewAssignment from './Components/ReviewAssignment';
import ProtectedRoute from './Components/ProtectedRoute';
// import UserInfo from './Components/UserInfo';
// import Assignments from './Components/Assignments'

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
	    //   { path: 'groups', element: <Groups /> },
		//   { path : 'notifications', element: <Notifications /> },
		//   { path : 'assignments/:assignment_id', element: <AssignmentDetails /> },
		//   { path : 'assignments/create', element: <CreateAssignment /> },
		//   { path : 'assignments/members/:assignment_id/', element: <AssignmentMembers /> },
		//   { path : 'assignments/submissions/:assignment_id', element: <Submissions /> },
		//   { path : 'assignments/submit/:assignment_id', element: <SubmitAssignment /> },
		//   { path : 'assignments/submissions/:assignment_id/review/:submission_id', element: <ReviewAssignment /> },
		//   { path : 'users/:user_id', element: <UserInfo /> },
	    ]
 	},

]);

export default router;
