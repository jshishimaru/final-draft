import { getAllReviewees , getAllReviewers, getSubtasks , addSubmissionAttachment , submitAssignment } from "../apiservice";
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, FormGroup, TextField, FormControlLabel, Checkbox , List , ListItem , ListItemText ,Button} from '@mui/material';

interface Subtask{
	id:number;
	title:string;
}

interface Reviewee{
	id:number;
	username:string;
}

interface Reviewer{
	id:number;
	username:string;
}

interface Attachment{
	file:File;
	type: 'image' | 'document';
	name:string;
}

export default function SubmitAssignment(){

	const [repoLink , setRepoLink] = useState<string>('');
	const [subtasks , setSubtasks] = useState<Subtask[]>([]);
	const [selectedSubtasks , setSelectedSubtasks] = useState<number[]>([]);
	const [remark , setRemark] = useState<string>('');
	const [reviewees , setReviewees] = useState<Reviewee[]>([]);
	const [reviewers , setReviewers] = useState<Reviewer[]>([]);
    const [selectedReviewees, setSelectedReviewees] = useState<number[]>([]);
	const [selectedReviewers, setSelectedReviewers] = useState<number[]>([]);
    const [attachments, setAttachments ] = useState<Attachment[]>([]);
    const fileInputRef = React.createRef<HTMLInputElement>();
    const [repoLinkError, setRepoLinkError] = useState<boolean>(false);
	const { assignment_id } = useParams<{ assignment_id: string }>();

	const SubmissionId = 0;

	const isImageFile = (file: File): boolean => {
		const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif' , 'image/svg','image/BMP'];
		return imageTypes.includes(file.type);
	};

	const handleRevieweeChange = (id: number) => {
	setSelectedReviewees((prev) =>
	  prev.includes(id) ? prev.filter((revieweeId) => revieweeId !== id) : [...prev, id]
	);
	};
	const handleReviewerChange = (id: number) => {
	setSelectedReviewers((prev) =>
	  prev.includes(id) ? prev.filter((reviewerId) => reviewerId !== id) : [...prev, id]
	);
	};
	const handleSubtaskChange = (id: number) => {
	setSelectedSubtasks((prev) =>
			  prev.includes(id) ? prev.filter((subtaskId) => subtaskId !== id) : [...prev, id]
	);
	};

    useEffect(() => {
    const fetchReviewees = async () => {
      const data = await getAllReviewees();
      setReviewees(data);
    };

	const fetchReviewers = async () => {
	  const data = await getAllReviewers();
	  setReviewers(data);
	}

	const fetchSubtasks = async () => {
	  if (assignment_id) {
		const data = await getSubtasks(assignment_id);
		setSubtasks(data);
	  } else {
		console.error('Assignment ID is undefined');
	  }
	}

	fetchReviewees();
	fetchReviewers();
	fetchSubtasks();
	  }, []);

	const isValidURL = (url: string) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(url);
    };


	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const attachment: Attachment = {
				file,
				type: isImageFile(file) ? 'image' : 'document',
				name: file.name
			};
		 setAttachments(prev => [...prev, attachment]);
		}
		if (fileInputRef.current) {
		 fileInputRef.current.value = '';
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
	    if (repoLinkError) {
	      alert('Please enter a valid repository link.');
	      return;
	    }
		const response = await submitAssignment(
			assignment_id ? parseInt(assignment_id) : 0,
			repoLink,
			selectedSubtasks,
			remark,
			selectedReviewees,
			selectedReviewers,
		);

		const submissionId = response.submission_id;
		console.log(submissionId);

		for ( const attachment of attachments) {
	      await addSubmissionAttachment(
	        submissionId,
	        attachment.type === 'image' ? attachment.file : null,
	        attachment.type === 'document' ? attachment.file : null
	      );
		}
		
		alert('Assignment submitted successfully');
		
	}

	return(
	<Box
     component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 0	,
        p: 2,
        color: '#EEEEEE',
        width: '50%',
      }}
	>
		
	  <Typography sx={{fontSize:32, color:"primary.main" , fontWeight:"bold"}}>Submit Assignment</Typography>

	  <TextField
        label="Repository Link"
        variant="outlined"
        value={repoLink}
        onChange={(e)=>setRepoLink(e.target.value)}
        error={repoLinkError}
        helperText={repoLinkError ? 'Please enter a valid URL' : ''}
        required
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            color: '#EEEEEE',
          },
          '& .MuiInputLabel-root': {
            color: '#EEEEEE',
            '&.Mui-focused': {
              color: '#6FB7EE',
            },
          },
          '& .MuiFormHelperText-root': {
            color: '#FF0000',
          },
          bgcolor: '#31363F',
        }}
      />

      <TextField
        label="Remarks"
        variant="outlined"
        multiline
        rows={4}
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            color: '#EEEEEE',
          },
          '& .MuiInputLabel-root': {
            color: '#EEEEEE',
            '&.Mui-focused': {
              color: '#6FB7EE',
            },
          },
          bgcolor: '#31363F',
        }}
      />

		<Box sx={{ width:"300px"}}>	
		  <Typography variant="h6" component="h2" gutterBottom>
	        Select Reviewees
	      </Typography>
	      <FormGroup
		    sx={{
				display:"flex",
				flexDirection:"column",
				flexWrap:"nowrap",
				height:"200px",
				overflowY: 'scroll',
				overflowX:'hidden',
				backgroundColor: '#31363F', 
				p: 2,
				borderRadius: 2,
	  		}}
		  >
	        {reviewees.map((reviewee) => (
	          <FormControlLabel
	            key={reviewee.id}
	            control={
	              <Checkbox
					sx={{
						color: '#EEEEEE',
						'&.Mui-checked': {
						color: '#6FB7EE',
						},
					}}
	                checked={selectedReviewees.includes(reviewee.id)}
	                onChange={() => handleRevieweeChange(reviewee.id)}
	              />
	            }
	            label={reviewee.username}
	          />
	        ))}
	      </FormGroup>
		</Box>


		<Box sx={{ width:"300px"}}>	
		  <Typography variant="h6" component="h2" gutterBottom>
	        Tag Reviewers
	      </Typography>
	      <FormGroup
		    sx={{
				display:"flex",
				flexDirection:"column",
				flexWrap:"nowrap",
				height:"200px",
				overflowY: 'scroll',
				overflowX:'hidden',
				backgroundColor: '#31363F', 
				p: 2,
				borderRadius: 2,
	  		}}
		  >
	        {reviewers.map((reviewer) => (
	          <FormControlLabel
	            key={reviewer.id}
	            control={
	              <Checkbox
					sx={{
						color: '#EEEEEE',
						'&.Mui-checked': {
						color: '#6FB7EE',
						},
					}}
	                checked={selectedReviewers.includes(reviewer.id)}
	                onChange={() => handleReviewerChange(reviewer.id)}
	              />
	            }
	            label={reviewer.username}
	          />
	        ))}
	      </FormGroup>
		</Box>

		<Box sx={{ width:"300px"}}>	
		  <Typography variant="h6" component="h2" gutterBottom>
	        Select Subtasks
	      </Typography>
	      <FormGroup
		    sx={{
				display:"flex",
				flexDirection:"column",
				flexWrap:"nowrap",
				height:"200px",
				overflowY: 'scroll',
				overflowX:'hidden',
				backgroundColor: '#31363F', 
				p: 2,
				borderRadius: 2,
	  		}}
		  >
	        {subtasks.map((subtask) => (
	          <FormControlLabel
	            key={subtask.id}
	            control={
	              <Checkbox
					sx={{
						color: '#EEEEEE',
						'&.Mui-checked': {
						color: '#6FB7EE',
						},
					}}
	                checked={selectedSubtasks.includes(subtask.id)}
	                onChange={() => handleSubtaskChange(subtask.id)}
	              />
	            }
	            label={subtask.title}
	          />
	        ))}
	      </FormGroup>
		</Box>

		<Box sx={{ mt: 2 }}>
		  <input
		    type="file"
		    ref={fileInputRef}
		    style={{ display: 'none' }}
		    onChange={handleFileSelect}
		  />
		  <Button
		    variant="contained"
		    onClick={() => fileInputRef.current?.click()}
		    sx={{
		      bgcolor: '#6FB7EE',
		      color: '#000',
			  width:"140px",
		      mb: 2
		    }}
		  >
		    Add Attachment
		  </Button>

		  {attachments.length > 0 && (
		    <Box
		      sx={{
		        bgcolor: '#31363F',
		        borderRadius: 2,
		        p: 2,
		        width: '400px'
		      }}
		    >
		      <Typography variant="h6" gutterBottom>
		        Added Attachments:
		      </Typography>
		      <List>
		        {attachments.map((attachment, index) => (
		          <ListItem key={index}>
		            <ListItemText
		              primary={attachment.name}
		              secondary={`Type: ${attachment.type}`}
		              sx={{
		                '& .MuiListItemText-primary': { color: '#EEEEEE' },
		                '& .MuiListItemText-secondary': { color: '#B1B1B1' }
		              }}
		            />
		          </ListItem>
		        ))}
		      </List>
		    </Box>
		  )}
		</Box>

		<Button
		  type="submit"
		  variant="contained"
		  sx={{
		    bgcolor: '#6FB7EE',
		    color: '#000',
		    width:"140px",
			mt: 2
		  }}
		>
		  Submit
		</Button>
	 </Box>
	)

}	

