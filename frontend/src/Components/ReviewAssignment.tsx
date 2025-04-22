import React, { useEffect, useState  } from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import { getSubmissionDetails , getAttachmentURL , submitReview , addComment , getComments ,getSelfProfile} from '../apiservice';
import { Box, 
	Typography,
	List,
	ListItem,
	ListItemText,
	ListItemIcon,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Button,
	IconButton,
	FormControl,
	Select,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
} from '@mui/material';
import { ExpandMore, AttachFile , ContentCopy , Download } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

enum Status{
	Pending = 'pending',
	InIteration = 'in_iteration',
	Completed = 'completed'
}

interface Subtask{
	name:string;
	status: Status;
	id:number;
}

interface Assignment{
	name:string;
	status: Status;
}

interface Attachment{
	id:number;
	name:string;
}

interface Reviewee{
	username:string;
}

function ReviewAssignment(){

	const [subtasks , setSubtasks] = useState<Subtask[]>([]);
	const [assignment , setAssignment] = useState<Assignment>({name:'',status:Status.Pending});
	const [attachments , setAttachments] = useState<Attachment[]>([]);
	const [reviewees , setReviewees] = useState<Reviewee[]>([]);
	const [repoLink , setRepoLink] = useState('');
	const [comment , setComment] = useState('');
	const [addedComments , setAddedComments] = useState<string[]>([]);
	const [preAddedComments, setPreAddedComments] = useState<string[]>([]);
	const [isApproved , setIsApproved] = useState(false);
	const [openDialog, setOpenDialog] = useState<boolean>(false);	
	const [isReviewer, setIsReviewer] = useState<boolean>(false);

	const navigate = useNavigate();
	
	const {submission_id} = useParams<{submission_id:string}>();

	const fetchData = async () => {
		
		const submission = await getSubmissionDetails(Number(submission_id));

		const processedSubtasks = submission.subtasks.map( (subtask:Subtask) => {
			let status :Status;
			if(subtask.status === 'completed'){
				status = Status.Completed;
			}
			else{
				status = Status.InIteration;
			}
			return { ...subtask , status };
		})
		setSubtasks(processedSubtasks);

		const assignment : Assignment = { name: submission.assignment_name, status: Status.Pending };
		if( submission.is_approved == 'False' ){
			assignment.status = Status.Pending;
		}
		if( submission.status === 'completed'){
			assignment.status = Status.Completed;
		}
		else{
			assignment.status = Status.InIteration;
		}
		setAssignment(assignment);

		const attachments = submission.attachments.map( (attachment:Attachment) => {
			
			console.log(attachment);
			return { id: attachment.id , name: attachment.name };

		});

		setAttachments(attachments);
		
		const reviewees = submission.reviewees.map( (reviewee:Reviewee) => {
			return { username: reviewee.username }
		});

		setReviewees(reviewees);
		setRepoLink(submission.repo_link);

		const commentData = await getComments(Number(submission_id));
		
		interface Comment {
			content: string;
		}

		const comments: string[] = commentData.map((comment: Comment) => comment.content);
		setPreAddedComments(comments);

		const profile = await getSelfProfile();
		setIsReviewer(profile.is_reviewer);

	};

   const handleAddComment = () => {
	  if( comment ){
	  setAddedComments((prev) => [
		...prev, comment,
	  ]);
	  }
      setOpenDialog(false);
    };

    const handleCopyRepoLink = () => {
	    navigator.clipboard.writeText(repoLink);

    };

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		const completed_subtasks = subtasks.filter( (subtask) => subtask.status === Status.Completed ).map(subtask => subtask.id);
		let is_completed:string
		if ( assignment.status === Status.Completed ){
			is_completed = 'True';
		}
		else{
			is_completed = 'False';
		}
		try {
		  const response = await submitReview(Number(submission_id), is_completed, completed_subtasks);
		  if (response === 200) {
		    navigate('/homepage/assignments/');
		  } else {
		    alert('Error in submitting review');
		  }
		} catch (error) {
		  console.error('Error in submitting review:', error);
		  alert('Error in submitting review');
		}

		addAllComments(addedComments, Number(submission_id));

	};	

	const addAllComments = async (comments: string[], submissionId: number) => {
	try {
	  for (const comment of comments) {
	    await addComment( submissionId , comment );
	  }
	} catch (error) {
	  console.error('Error adding comments:', error);
	}
	};

	const handleStatusChange = (index: number, newStatus: Status) => {
     const updatedSubtasks = [...subtasks];
     updatedSubtasks[index].status = newStatus;
     setSubtasks(updatedSubtasks);
    };

	const handleAssignmentStatusChange = ( newStatus : Status ) => {
		setAssignment( (prevAssignment) => (
			{
				...prevAssignment,
				status: newStatus,
			}
		))
	};

	const handleDownloadClick = async ( attachmentId : number) =>{

		const url = await getAttachmentURL(attachmentId);
		console.log(url);
		window.open(url);

	}

	useEffect(() => {
		fetchData();
	},[]);

	return(

	  <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        mt: 4,
        p: 2,
		color:"#EEEEEE",
		width:"50%",
		// '&:third-child':{
		// 	borderTopLeftRadius:10,
		// 	borderTopRightRadius:10,
		// }
      }}
      >
		
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#6FB7EE', fontWeight: 'bold' }}>
        {assignment.name}
      </Typography>

	  <Typography  sx={{color:"#EEEEEE" , fontSize:28 , fontWeight:"bold" }}>
        {reviewees.map((reviewee) => reviewee.username).join(' , ')}
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

      <Accordion sx={{ bgcolor: '#31363F', color: '#EEEEEE', width: '400px' , borderRadius:"30px", p: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#EEEEEE' }} />}>
          <Typography>Subtasks</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {subtasks.map((subtask, index) => (
              <ListItem key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                <ListItemText primary={subtask.name} sx={{ color: '#EEEEEE', flexGrow: 1 }} />
				{ isReviewer ? (
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <Select
                    value={subtask.status}
                    onChange={(e) => handleStatusChange(index, e.target.value as Status)}
                    label="Status"
                    sx={{
                      color: '#EEEEEE',
                      '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '.MuiSelect-icon': { color: '#EEEEEE' },
                      bgcolor: '#585E69',
					  borderRadius:6,
					  fontSize:16,
                    }}
                   >
                    <MenuItem value={Status.InIteration}>In Iteration</MenuItem>
                    <MenuItem value={Status.Completed}>Completed</MenuItem>
                  </Select>
                </FormControl>
				) : (
					<Typography
					sx={{
					  color: '#EEEEEE',
                      bgcolor: '#585E69',
					  borderRadius:6,
					  fontSize:16,
					  p:2,
					}}
					>{subtask.status} </Typography>
				)}
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

	   <Box
	   sx={{display:"flex" , gap:"40px"}}
	   >
	   <Typography sx={{fontSize:"20px" , pt:1}}>Assignment Status</Typography>
	   <Typography>
		{ isReviewer ? (<FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <Select
            value={assignment.status}
            onChange={(e) => handleAssignmentStatusChange( e.target.value as Status)}
            label="Status"
            sx={{
              color: '#EEEEEE',
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              '.MuiSelect-icon': { color: '#EEEEEE' },
              bgcolor: '#585E69',
			  borderRadius:6,
			  fontSize:16,
            }}
           >
            <MenuItem value={Status.InIteration}>In Iteration</MenuItem>
            <MenuItem value={Status.Completed}>Completed</MenuItem>
          </Select>
        </FormControl>
		):(
			<Typography
			sx={{
			  color: '#EEEEEE',
			  bgcolor: '#585E69',
			  borderRadius:6,
			  fontSize:16,
			  p:2,
			}}
			>{assignment.status} </Typography>
		)}
		  </Typography>
	  </Box>

      <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#6FB7EE', fontWeight: 'bold'  , fontSize:24 }}>
        Repository Link
      </Typography>
      <Box sx={{ width:"600px" , p:2 , pl:3 , pr:3 , display: 'flex', alignItems: 'center', bgcolor: '#31363F', borderRadius: 10  }}>
        <Typography variant="body1" component="p" sx={{ color: '#EEEEEE', flexGrow: 1 , fontSize:18}}>
          {repoLink}
        </Typography>
        <IconButton onClick={handleCopyRepoLink} sx={{ color: '#6FB7EE' }}>
          <ContentCopy />
        </IconButton>
      </Box>
		
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
		  PaperProps={{
			sx: {
			  bgcolor: '#31363F',
			  color: '#EEEEEE',
			}
		  }}
		>
        <DialogTitle>
          Add Comment
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#6FB7EE' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ 
	    borderColor: '#676767',
	    '& .MuiTextField-root': {
	      '& .MuiOutlinedInput-root': {
	        color: '#EEEEEE',
	        '& fieldset': {
	          borderColor: '#676767',
	        }
	      },
	      '& .MuiInputLabel-root': {
	        color: '#EEEEEE',
	      },
	    }
	    }}>
          <TextField
            label="Comment"
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6FB7EE' }}>
            Cancel
          </Button>
          <Button onClick={handleAddComment} sx={{ color: '#6FB7EE' }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

		{ isReviewer && <Button
	    variant="contained"
	    onClick={() => setOpenDialog(true)}
	    sx={{
	      bgcolor: '#6FB7EE',
	      color: '#000000',
	      '&:hover': {
	        bgcolor: '#5CA7DE',
	      },
		  width:"140px",
	      mb: 2,
	    }}
	  	>
	    Add Comment
	  </Button>}

      <Typography variant="h5" gutterBottom sx={{color:"primary.main" , fontWeight:"bold"}}>
        Added Comments:
      </Typography>
      <List sx={{ display:"flex" , flexDirection:"Column" , gap:"10px" }}>
        {addedComments.map((Comment, index) => (
          <ListItem key={index} sx={{borderRadius:10 , bgcolor:"#31363F" , width:"50%" }}>
            <ListItemText
              primary={Comment}
            />
          </ListItem>
        ))}
        {preAddedComments.map((Comment, index) => (
          <ListItem key={index} sx={{borderRadius:10 , bgcolor:"#31363F" , width:"50%" }}>
            <ListItemText
              primary={Comment}
            />
          </ListItem>
        ))}
      </List>

		{ isReviewer && <Button type="submit" variant="contained" sx={{ bgcolor: '#6FB7EE', color: '#000', fontWeight: 'bold' , borderRadius:10 , fontSize:24 , width:"400px" }}>
        Submit Review
      </Button>}
	   </Box>

	);
}

export default ReviewAssignment;