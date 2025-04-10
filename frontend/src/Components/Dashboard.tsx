import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, List, ListItem, ListItemText, CssBaseline, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, Outlet , useNavigate } from 'react-router-dom';
import { getSelfProfile, logout } from '../apiservice';

const drawerWidth = 240;

interface Profile{
  username: string;
  first_name: string;
  last_name: string;
  is_reviewer: boolean;
  id: number;
}

const Dashboard = () => {

  const [userProfile , setUserProfile] = React.useState<Profile | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
	getSelfProfile().then((data) => {
	  setUserProfile(data);
	});
  }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

    const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/'; // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

    const handleUserClick = (userId: number) => {
    navigate(`/homepage/users/${userId}`);
   };

  const drawer = (
    <div>
      <Toolbar />
      <List
	  	sx={{
		    '& .MuiListItem-root': {
		      color: '#EEEEEE',
			//   fontSize:32,
		    },
	    }}
	  >
        <ListItem  component={Link} to="/homepage/assignments">
          <ListItemText primary="Assignments" />
        </ListItem>
        <ListItem  component={Link} to="/homepage/groups">
          <ListItemText primary="Groups" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display:"flex", 
			// border:"solid 1px yellow" 
		}}>
		<CssBaseline />

		<AppBar position="fixed" 
		sx={{ 
			color:"#EEEEEE",
			bgcolor: '#222831',
			borderBottom: "1px solid #676767",
			zIndex: (theme) => theme.zIndex.drawer + 1,
		}}>
		<Toolbar sx={{display:"flex" , justifyContent:"space-between"}}>
		  <Typography variant="h6" noWrap>
		    FinalDraft
		  </Typography>
          <div>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar>{userProfile?.username.charAt(0).toUpperCase()}</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  width: '200px',
                },
              }}
            >
              <MenuItem onClick={()=>{userProfile && handleUserClick(userProfile.id)}}>
                <Typography variant="body2">{userProfile?.username}</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2">Logout</Typography>
              </MenuItem>
            </Menu>
          </div>
		</Toolbar>
		</AppBar>

	    <Box 
	      sx={{
			// border:"solid 1px green",
	        width: drawerWidth,
			height:"100vh",
	        flexShrink: 0,
			borderRight: "1px solid #676767",
	        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' , boxShadow:"none",  },
	      }}
	    >
	      {drawer}
	    </Box>

		<Box
		    component="main"
		    sx={{
				flexGrow: 1,
				p:3,
				// border:"solid 1px red", 
				bgcolor: 'background.default', 
				// marginLeft: drawerWidth, 
				// marginTop:"64px" 
			}}>
		    <Toolbar />
			<Outlet />
		</Box>

    </Box>
  );
};

export default Dashboard;
