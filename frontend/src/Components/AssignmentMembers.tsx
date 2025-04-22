import React, { useEffect, useState } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import { getMemberStatus , getAssignmentReviewers } from '../apiservice';
import { Box, List, ListItem, ListItemText, ListItemIcon, Typography } from '@mui/material';
import pending from '../assets/icons/pending.png'
import in_iteration from '../assets/icons/in_iteration.png'
import completed from "../assets/icons/completed.png"

interface Member {
  username: string;
  status: string;
  id: number;
}

interface Reviewer{
	  username: string;
	  id: number;
}

function Icon ({ status }: { status: string }) {

	return(
    <img src = {status === 'completed' 
      ? completed 
      : status === 'in_iteration' 
      ? in_iteration 
      : pending
        } 
      alt = {status}
      style={{width: '40px', height: '40px'}}
    ></img>
	)

}

const AssignmentMembers: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const { assignment_id } = useParams<{ assignment_id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
	if (assignment_id) {
    getMemberStatus(Number(assignment_id)).then((data) => setMembers(data));
	} else {
	  console.error("Assignment ID is undefined");
	}
	if (assignment_id) {
    getAssignmentReviewers(Number(assignment_id)).then((data) => setReviewers(data));
	} else {
	  console.error("Assignment ID is undefined");
	}
  }, [assignment_id]);

	  const handleUserClick = (userId: number) => {
	    navigate(`/homepage/users/${userId}`);
	  };


    return (
    <Box sx={{ p: 2  , color:"#EEEEEE" , display:"flex"  , flexDirection:"column" , alignItems:"center" }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{color:"#6FB7EE" , fontWeight:"bold" }}>
        Assignment Reviewees 
      </Typography>
      <List sx={{display:"flex" , flexWrap:"wrap" , gap:"20px" , pt:6 , justifyContent:"center" }}>
        {members.map((member, index) => (
          <ListItem key={index} sx={{borderRadius:10 , bgcolor:"#31363F" , width:"400px" , height:"100px"}} onClick={()=>{handleUserClick(member.id)}}>
            <ListItemText primary={member.username} 
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: 24, // font size for primary text
                  color: '#EEEEEE',
                },
				p:2,
                // '& .MuiListItemText-secondary': {
                //   fontSize: '0.9rem', // font size for secondary text
                //   color: '#B1B1B1',
                // },
              }}
			/>
			<ListItemIcon>
              <Icon status={member.status} />
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#6FB7EE', fontWeight: 'bold', mt: 4 }}>
        Assignment Reviewers
      </Typography>
      <List sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px', pt: 6, justifyContent: 'center' }}>
        {reviewers.map((reviewer, index) => (
          <ListItem key={index} sx={{ borderRadius: 10, bgcolor: '#31363F', width: '400px', height: '100px' }}>
            <ListItemText
              primary={reviewer.username}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: 24, // font size for primary text
                  color: '#EEEEEE',
                },
                p: 2,
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>

  );

};

export default AssignmentMembers;