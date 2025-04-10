import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, colors } from '@mui/material';
import { getUserInfo } from '../apiservice';


interface UserData {
  username: string;
  first_name: string;
  last_name: string;
  is_reviewer: boolean;
}

interface AssignmentStatus {
	 title: string;
	 status: string;
}

function UserInfo(){

	const [userData , setUserData] = React.useState<UserData | null>(null);
	const [assignmentStatuses , setAssignmentStatuses] = React.useState<AssignmentStatus[] | null>(null);
	const [groups , setGroups] = React.useState<string[] | null>(null);
	
	const {user_id} = useParams<{user_id:string}>();
	const green = "#50FA7B";
	const red = "#FF5555";
	const yellow = "#F1FA8C";

	const fetchUserInfo = async (userId: number) => {
		
		try{
			const data = await getUserInfo(userId);
			const userData : UserData = {username:data.username, first_name:data.first_name, last_name:data.last_name, is_reviewer:data.is_reviewer};
			setUserData(userData);
			
			const assignmentStatuses : AssignmentStatus[] = data.assignment_statuses.map((assignment:any) => {
				return {title:assignment.assignment , status:assignment.status};
			},[]);
			setAssignmentStatuses(assignmentStatuses);			
			setGroups(data.groups);
		}	
		catch(error){
			console.error('Error fetching user info:', error);
		}
	}

	React.useEffect(() => {
		fetchUserInfo(Number(user_id));
	},[user_id]);

	if(userData === null){
		return <div>Loading...</div>
	}

	return(
    <Box>
	<Box sx={{ borderRadius:10,color:"#EEEEEE" , pb:4 , pl:4 , pt:2 ,width:"40%" , display:"flex" , flexDirection:"column" , gap:2 ,}}>
	  <Typography variant="h3" sx={{p:2,color:"primary.main",fontWeight:"bold"}}>User Data</Typography>
        <Typography sx={{ fontSize: '28px', borderRadius:10 , backgroundColor:"secondary.main" , p:2 , pl:0 , width:"60%" , fontWeight:"bold" , textAlign:"center" }}>{userData?.is_reviewer ? 'Reviewer' : 'Reviewee'}</Typography>
        <Typography sx={{ fontSize: '24px', borderRadius:10 , backgroundColor:"secondary.main" , p:2 , pl:4 , width:"60%" }}><span style={{fontWeight:"bold" }}>Username </span>: {userData.username}</Typography>
        <Typography sx={{ fontSize: '24px', borderRadius:10 , backgroundColor:"secondary.main" , p:2 , pl:4 , width:"60%" }}><span style={{fontWeight:"bold" }}>First Name </span>: {userData.first_name}</Typography>
        <Typography sx={{ fontSize: '24px', borderRadius:10 , backgroundColor:"secondary.main" , p:2 , pl:4 , width:"60%" }}><span style={{fontWeight:"bold" }}>Last Name </span>: {userData.last_name}</Typography>

	</Box>

	<Box sx={{ borderRadius:10,color:"#EEEEEE" , pb:4 , pl:4 , pt:2 ,width:"40%" , display:"flex" , flexDirection:"column" , gap:2 ,}}>
	  <Typography variant="h3" sx={{p:2,color:"primary.main",fontWeight:"bold"}}>Groups</Typography>
		  {groups && groups.map((group) => (
        <Typography sx={{ fontSize: '24px', borderRadius:10 , backgroundColor:"secondary.main" , p:2 , pl:4 , width:"60%" }}> {group}</Typography>
		))}
      </Box>

	<Box sx={{ borderRadius:10,color:"#EEEEEE" , pb:4 , pl:4 , pt:2 ,width:"40%" , display:"flex" , flexDirection:"column" , gap:2 ,}}>
	  <Typography variant="h3" sx={{p:2,color:"primary.main",fontWeight:"bold"}}>Assignments</Typography>
		  {assignmentStatuses && assignmentStatuses.map((assignment) => (
	        <Typography sx={{ fontSize: '24px', borderRadius:10 , backgroundColor:"secondary.main" , p:2 , pl:4 , width:"100%" ,
				color: assignment.status === "in_iteration" ? yellow : assignment.status === "completed" ? green : red
			 }}><span style={{fontWeight:"bold" , color:"#EEEEEE" }}>{assignment.title} : </span> {assignment.status}</Typography>
		 ))}
      </Box>
    </Box>
	);

}

export default UserInfo;
