import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getGroups , getAllReviewees , getAllReviewers , createAssignment , addSubtask , addAttachment } from "../apiservice";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';import { useNavigate } from 'react-router-dom';
import { Dayjs } from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';


interface Reviewee {
  id: number;
  username: string;
}

interface Reviewer {
  id: number;
  username: string;
}

interface Group {
  id: number;
  name: string;
}

interface Subtask{
	title:string;
	deadline:string;
	assignment:number;
}

interface Attachment{
	file:File;
	type: 'image' | 'document';
	name:string;
}


const CreateAssignment: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [deadline, setDeadline] = useState<dayjs.Dayjs | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [reviewees, setReviewees] = useState<Reviewee[]>([]);
  const [selectedReviewees, setSelectedReviewees] = useState<number[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<number[]>([]);
  const [subtasks , setSubtasks] = useState<Subtask[]>([]);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [subtaskTitle, setSubtaskTitle] = useState<string>('');
  const [subtaskDeadline, setSubtaskDeadline] = useState<Dayjs | null>(null);
  const [attachments, setAttachments ] = useState<Attachment[]>([]);
  const [sendToMail, setSendToMail] = useState<boolean>(false);
  const fileInputRef = React.createRef<HTMLInputElement>();

  const assignmentId = 0;

  const navigate = useNavigate();

  const isImageFile = (file: File): boolean => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif' , 'image/svg','image/BMP'];
  return imageTypes.includes(file.type);
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
  const handleGroupChange = (id: number) => {
    setSelectedGroups((prev) =>
      prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id]
    );
  };

    useEffect(() => {
    const fetchReviewees = async () => {
      const data = await getAllReviewees();
      setReviewees(data);
    };

    const fetchGroups = async () => {
      const data = await getGroups();
      setGroups(data);
    };

	const fetchReviewers = async () => {
	  const data = await getAllReviewers();
	  setReviewers(data);
	}

	fetchReviewees();
	fetchGroups();
	fetchReviewers();
	  }, []);
	 
   const handleAddSubtask = () => {
    if (subtaskTitle && subtaskDeadline) {
      setSubtasks((prev) => [
        ...prev,
        {
          title: subtaskTitle,
          deadline: subtaskDeadline.format('YYYY-MM-DD'),
          assignment: assignmentId,
        },
      ]);
      setSubtaskTitle('');
      setSubtaskDeadline(null);
      setOpenDialog(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
		const response = await createAssignment(
		title, 
		description, 
		deadline?.format('YYYY-MM-DD') || '', 
		selectedReviewees, 
		selectedGroups, 
		selectedReviewers,
		sendToMail,
		);
	    const assignmentId = response.assignment_id;
	  
		for (const subtask of subtasks) {
		await addSubtask(assignmentId, subtask.title, subtask.deadline);	  
		}

	    for (const attachment of attachments) {
	      await addAttachment(
	        assignmentId,
	        attachment.type === 'image' ? attachment.file : null,
	        attachment.type === 'document' ? attachment.file : null
	      );
	    }
      navigate('/homepage/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      // Optionally add error handling UI here
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 4,
        p: 2,
		color:"#EEEEEE",
		width:"50%",
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom sx={{color:"#6FB7EE" , fontWeight:"bold"}}>
        Create Assignment
      </Typography>
      <TextField
        label="Assignment Title"
        variant="outlined"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
		sx={{
		'& .MuiOutlinedInput-root': {
		  color: '#EEEEEE', // Text color
		},
		'& .MuiInputLabel-root': {
		  color: '#EEEEEE', // Label color
		  '&.Mui-focused': {
		    color: '#6FB7EE', // Label color when focused
		  },
		},
		width:"400px",
		bgcolor: "#31363F",
		}}      
		/>
      <TextField
        label="Assignment Description"
        variant="outlined"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
		sx={{
		'& .MuiOutlinedInput-root': {
		  color: '#EEEEEE', // Text color
		},
		'& .MuiInputLabel-root': {
		  color: '#EEEEEE', // Label color
		  '&.Mui-focused': {
		    color: '#6FB7EE', // Label color when focused
		  },
		},
		width:"400px",
		bgcolor: "#31363F",
		}}
      />
	  <LocalizationProvider dateAdapter={AdapterDayjs}>
	  <DatePicker 
		sx={{
		'& .MuiOutlinedInput-root': {
		  color: '#EEEEEE', // Text color
		},
		'& .MuiInputLabel-root': {
		  color: '#EEEEEE', // Label color
		  '&.Mui-focused': {
		    color: '#6FB7EE', // Label color when focused
		  },
		},
		'& .MuiSvgIcon-root': {
			color: '#EEEEEE', // Icon color
		},
		width:"400px",
		bgcolor: "#31363F",
		}}
	  label="Deadline"
	  value={deadline}
	  onChange={(newValue) => setDeadline(newValue)}
	  />
	  </LocalizationProvider>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}
		  PaperProps={{
			sx: {
			  bgcolor: '#31363F',
			  color: '#EEEEEE',
			}
		  }}
		>
        <DialogTitle>
          Add Subtask
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
            label="Subtask Title"
            variant="outlined"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Subtask Deadline"
              value={subtaskDeadline}
              onChange={(newValue) => setSubtaskDeadline(newValue)}
              slotProps={{ textField: { required: true, fullWidth: true } }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#6FB7EE' }}>
            Cancel
          </Button>
          <Button onClick={handleAddSubtask} sx={{ color: '#6FB7EE' }}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

	  <Box sx={{ mt: 2 }}>
  <Button
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
    Add Subtask
  </Button>

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

  {subtasks.length > 0 && (
    <Box
      sx={{
        bgcolor: '#31363F',
        borderRadius: 2,
        p: 2,
        width: '400px',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Added Subtasks:
      </Typography>
      <List>
        {subtasks.map((subtask, index) => (
          <ListItem key={index}>
            <ListItemText 
              primary={subtask.title}
              secondary={`Deadline: ${subtask.deadline}`}
              sx={{
                '& .MuiListItemText-primary': { color: '#EEEEEE' },
                '& .MuiListItemText-secondary': { color: '#B1B1B1' },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  )}
</Box>

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
        Select Groups
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
			padding: 2,
			borderRadius: 2,
  		}}
		>
        {groups.map((group) => (
          <FormControlLabel
            key={group.id}
            control={
              <Checkbox
				sx={{
					color: '#EEEEEE',
					'&.Mui-checked': {
					color: '#6FB7EE',
					},
				}}
                checked={selectedGroups.includes(group.id)}
                onChange={() => handleGroupChange(group.id)}
              />
            }
            label={group.name}
          />
        ))}
      </FormGroup>
	</Box>

	  <Box sx={{ width:"300px"}}>
	  <Typography variant="h6" component="h2" gutterBottom>
        Select Reviewers
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
			padding: 2,
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
	
	<FormControlLabel
	  control={
	    <Checkbox
	      checked={sendToMail}
	      onChange={(e) => setSendToMail(e.target.checked)}
	      sx={{ color: '#6FB7EE' }}
	    />
	  }
	  label="Send to Mail"
	  sx={{ color: '#EEEEEE' }}
	/>

      <Button type="submit" variant="contained" color="primary">
        Create Assignment
      </Button>
    </Box>
  );
};

export default CreateAssignment;