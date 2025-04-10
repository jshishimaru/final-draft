import React , {useEffect, useState} from 'react';
import { Card, CardContent, Typography, IconButton, Menu, MenuItem , Box , Dialog , DialogActions , DialogContent , DialogContentText, DialogTitle } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { getAssignments } from '../apiservice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { getSelfProfile , getUsernames , deleteAssignment } from '../apiservice';
import { format } from 'date-fns';

interface AssignmentCardProps {
  title: string;
  creator: number;
  creatorUsername?: string;
  deadline: string;
  id: number;
  isReviewer: boolean;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ id , title, creatorUsername, deadline , isReviewer }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

   const handleDetailsClick = () => {
    navigate(`/homepage/assignments/${id}`);
    handleMenuClose();
  };

  const handleMembersClick = () => {
	navigate(`/homepage/assignments/members/${id}`);
	handleMenuClose();
  }

  const handleSubmissionsClick = () => {
	navigate(`/homepage/assignments/submissions/${id}`);
	handleMenuClose();
  }

  const handleDeleteClick = () => {
	
	setOpenDialog(true);
	handleMenuClose();

  };

  const handleConfirmDelete = async () => {
     try {
      await deleteAssignment(id);
      // Refresh assignments or handle deletion in state
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
    setOpenDialog(false);
   };

  return (
    <Card sx={{width:"800px" , height:"130px" , borderRadius:5 , bgcolor:"#31363F"}}>
      <CardContent sx={{display:"flex", height:"100%" , flexDirection:"column" , justifyContent:"space-between" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{color:"#6FB7EE"}}>{title}</Typography>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon sx={{color:"#EEEEEE"}}/>
          </IconButton>
        </div>

		<Box sx={{display:"flex" , flexDirection:"row" , justifyContent:"space-between"}}>
        <Typography variant="body2" color="#EEEEEE">
          Created by: {creatorUsername}
        </Typography>
        <Typography variant="body2" color="#EEEEEE">
          Due: {deadline}
        </Typography>
		</Box>

      </CardContent>
      <Menu
	  	sx={{color:"#EEEEEE"}}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDetailsClick}>Details</MenuItem>
		<MenuItem onClick={handleSubmissionsClick}>Submissions</MenuItem>
		{ isReviewer && (
			<>	
		<MenuItem onClick={handleMembersClick}>Members</MenuItem>
		<MenuItem onClick={handleDeleteClick}>Delete</MenuItem>
	    </>)}
      </Menu>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            bgcolor: '#31363F',
            color: '#EEEEEE',
          }
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#EEEEEE' }}>
            Are you sure you want to delete this assignment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

function Assignments(){

	const [assignments, setAssignments] = React.useState<AssignmentCardProps[]>([]);
	const [isReviewer, setIsReviewer] = useState<boolean>(false);
	const [creators, setCreators] = useState<{ [key: number]: string }>({});

	const navigate = useNavigate();

	React.useEffect(() => {
    const fetchAssignments = async () => {
      const data = await getAssignments();
      setAssignments(data);

	const creatorIds: number[] = data.map((assignment: AssignmentCardProps) => assignment.creator);
      const uniqueCreatorIds = Array.from(new Set(creatorIds));
      const usernamesData = await getUsernames(uniqueCreatorIds);
	interface User {
		id: number;
		username: string;
	}

	const creatorMap: { [key: number]: string } = usernamesData.reduce((acc: { [key: number]: string }, user: User) => {
		acc[user.id] = user.username;
		return acc;
	}, {});
      setCreators(creatorMap);	  

    };

	fetchAssignments();
    }, []);

	const fetchUserProfile = async () => {
      try {
        const profile = await getSelfProfile();
        setIsReviewer(profile.is_reviewer);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

	useEffect(() => {
		fetchUserProfile();
	}, []);

	const handleAddNewClick = () => {
    	navigate("/homepage/assignments/create");
 	};


	return(
		<Box sx={{
			display:"flex",
			flexDirection:"row",
			flexWrap:"wrap",
			gap:"20px",
			// border:"5px solid blue"
			}}>
				{assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.id}
            title={assignment.title}
            creator={assignment.creator}
            creatorUsername={creators[assignment.creator] || 'Loading...'}
            deadline={format(new Date(assignment.deadline), 'd MMMM yyyy')}
            id={assignment.id}
			isReviewer={isReviewer}
          />
				))}
			
			{ isReviewer && (<Button onClick = {handleAddNewClick} variant="contained" sx={{bgcolor:"#61A1D1", position:"fixed" , mx:"73%" , my:"38%" , color:"black" , fontSize:24 , borderRadius:3 , width:"200px" , height:"60px"}}>
				Add New
			</Button>
			)}

		</Box>
	)
}



export default Assignments;