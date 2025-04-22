import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getGroups, getGroupMembers ,getSelfProfile } from "../apiservice";
import { useNavigate } from "react-router-dom";

interface GroupProps {
  name: string;
  id: number;
  expanded: boolean;
  handleExpand: (id: number) => void;
  isReviewer: boolean;
}

interface MemberProps {
  username: string;
  id: number;
}

const GroupCard: React.FC<GroupProps> = ({ name, id, expanded, handleExpand , isReviewer }) => {
  const [members, setMembers] = useState<MemberProps[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (expanded) {
      const fetchMembers = async () => {
        const fetchedMembers = await getGroupMembers(id);
        setMembers(fetchedMembers);
      };
      fetchMembers();
    }
  }, [expanded, id]);
 
  const handleUserClick = (userId: number) => {
	if( isReviewer){
    navigate(`/homepage/users/${userId}`);
	}
  };

  return (
    <Accordion expanded={expanded} onChange={()=>handleExpand(id)} square={true} sx={{bgcolor:"#31363F" ,color:"#EEEEEE",borderRadius:"30px" , width:"900px" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{color:"#EEEEEE"}}/>}>
        <Typography sx={{fontSize:24 , p:1 , fontWeight:"bold",color:"#6FB7EE"}}>
			{name}
		</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{pl:2 , display:"flex" , flexDirection:"column" , gap:2}} >
          {members.map((member, index) => (
            <Box sx={{backgroundColor:"#22262E", borderRadius:10, textAlign:"center" , p:2 , pl:0 , width:"50%" , '&:hover':{border:"solid 1px white"}}} onClick={() => handleUserClick(member.id)} > 
              <Typography sx={{fontSize:"24px"}}>{member.username}</Typography>
			 </Box>
          ))}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

const Groups: React.FC = () => {
  const [groups, setGroups] = useState<GroupProps[]>([]);
  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);
  const [isReviewer , setIsReviewer] = useState<boolean>(false);

   const handleExpand = (id: number) => {
    setExpandedGroupId(expandedGroupId === id ? null : id);
   };

  useEffect(() => {
    const fetchGroups = async () => {
      const fetchedGroups = await getGroups();
      setGroups(fetchedGroups);
    };
    fetchGroups();

	const fetchProfile = async () => {
		const profile = await getSelfProfile();
		setIsReviewer(profile.is_reviewer);
	}
	fetchProfile();

  }, []);

  return (
    <Box sx={{display:"flex" , flexWrap:"wrap" , justifyContent:"space-around" , gap:"30px" }}>
      {groups.map((group) => (
        <GroupCard 
		key={group.id} 
		name={group.name} 
		id={group.id} 
		expanded={expandedGroupId===group.id} 
		handleExpand={handleExpand} 
		isReviewer={isReviewer} />
      ))}
    </Box>
  );
};

export default Groups;