import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  IconButton,
} from '@mui/material';
import { ExpandMore, AttachFile, Download } from '@mui/icons-material';
import { getAssignmentDetails , getAttachmentURL } from '../apiservice';
import { useParams } from 'react-router-dom';
import { getAttachments , getSubtasks } from '../apiservice';
import { useNavigate } from 'react-router-dom';

interface Attachment {
  name: string;
  url: string;
  id: number;
}

interface Subtask {
  title: string;
  deadline: string;
}


const AssignmentDetails: React.FC = () => {
	const [attachments, setAttachments] = useState<Attachment[]>([]);
	const [subtasks, setSubtasks] = useState<Subtask[]>([]);
	const { assignment_id } = useParams<{ assignment_id: string }>();
	const navigate = useNavigate();

	useEffect(() => {
	if (assignment_id) {
	  getAttachments(assignment_id).then((data) => setAttachments(data));
	  getSubtasks(assignment_id).then((data) => setSubtasks(data));
	} else {
	  console.error('Assignment ID is undefined');
	}
	}, []);

	const [assignment, setAssignment] = useState<{
    title: string;
    description: string;
    attachments: Attachment[];
    deadline: string;
    subtasks: Subtask[];
	} | null>(null);

	const handleSubmitClick = () => {
		navigate(`/homepage/assignments/submit/${assignment_id}`);
	}

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        if (assignment_id) {
          const details = await getAssignmentDetails(assignment_id);
          setAssignment(details);
        } else {
          console.error('Assignment ID is undefined');
        }
      } catch (error) {
        console.error('Error fetching assignment details:', error);
      }
    };

   	 fetchAssignmentDetails();
  	}, [assignment_id]);

	const handleDownloadClick = async ( attachmentId : number) =>{

	const url = await getAttachmentURL(attachmentId);
	console.log(url);
	window.open(url);

	}


  if (!assignment) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p:2, color:"#EEEEEE" , display:"flex" , gap:"20px" , justifyContent:"space-between" , flexDirection:"column"}}>
      <Typography sx={{ color: "#6FB7EE" , fontSize:48 , fontWeight:"bold" }}>
        {assignment.title}
      </Typography>

	  <Box sx={{ display:"flex" , flexDirection:"column" , gap:"15px"}}>
	  <Typography sx={{fontSize:32 , color:"#EEEEEE"}}>
		Description :
	  </Typography>      
      <Box mb={2}>
		<Box sx={{borderRadius:10,bgcolor:"#31363F" , width:"822px"  , display:"flex" , p:4,}}>
        <Typography sx={{color:"#B1B1B1" , fontSize:24,}} >
          {assignment.description}
        </Typography>
		</Box>
      </Box>
	  </Box>

	<Typography sx={{fontSize:24, color:"#B1B1B1"}}>
		<span style={{ fontSize:32 , color:"#EEEEEE" }}>Deadline:</span> {assignment.deadline}
	</Typography>


      <Accordion sx={{ bgcolor: '#31363F', color: '#EEEEEE', width: '400px', borderRadius:"30px" , p: 2, 
          '&:first-of-type': {
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px',
          },
          '&:last-of-type': {
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
          },
	  }}>
        <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#EEEEEE' }} />}>
          <Typography>Attachments</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {attachments.map((attachment, index) => (
              <ListItem key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemIcon>
                  <AttachFile sx={{ color: '#EEEEEE' }} />
                </ListItemIcon>
                <ListItemText primary={attachment.name} sx={{ color: '#EEEEEE', flexGrow: 1 }} />
                <IconButton onClick={() => handleDownloadClick(attachment.id)} sx={{ color: '#6FB7EE' }}>
                  <Download />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion square={true} sx={{ borderRadius:"30px"  ,bgcolor:"#31363F" , color:"#EEEEEE" , width:"400px" , p:2,           
	  	 '&:last-child': {
            borderBottomLeftRadius: "30px",
            borderBottomRightRadius: "30px",
          },}}>
        <AccordionSummary expandIcon={<ExpandMore sx={{color:"#EEEEEE"}} />}>
          <Typography>Subtasks</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ }}>
          <List sx={{ color:"#EEEEEE" }} >
            {subtasks.map((subtask, index) => (
              <ListItem key={index}>
                <ListItemText primary={subtask.title} 
				secondary={`Deadline: ${subtask.deadline}`} 
				secondaryTypographyProps={{ style: { color: "#EEEEEE" } }} 
				/>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

	  <Button variant='contained' sx={{position:"fixed" , mx:"1300px" , width:"230px" , height:"60px" , fontSize:22, fontWeight:"semibold" , my:"700px"}}  onClick={handleSubmitClick}  >
		Submit Assignment
	  </Button>

    </Box>
  );
};

export default AssignmentDetails;