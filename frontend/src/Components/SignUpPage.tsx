import { useState } from 'react';
import { signup } from '../apiservice';
import { useNavigate } from 'react-router-dom';
import { Container, TextField , Box , Button , Typography , Snackbar , Alert } from '@mui/material';

interface InputBoxProps {
	label: string;
	type: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InputBox({ label, type, value, onChange }: InputBoxProps){
	return(
			<TextField
			sx={{
				backgroundColor: '#31363F',
                '& .MuiInputLabel-root': { // label text
                    color: '#929292',
					fontSize:"28px",
                },
	            '& .MuiOutlinedInput-root': {
	                '& fieldset': {
	                    border: 'none', // Disable the outline
	            	},
				},
				'& input':{ //input text
					color: "#EEEEEE",
					fontSize:20, 
				},
				borderRadius:'20px',
				width:'448px',
				height:'81px',
				py:2,
			}}
			variant='outlined' 
			name={label} 
			label={label} 
			value={value}
			type={type}
			onChange={onChange}
			/>
	);
}

function SignUpForm(){

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [first_name, setFirst_name] = useState('');
	const [last_name, setLast_name] = useState('');
	const [confirm_password, setConfirm_password] = useState('');
	const [error, setError] = useState('');
	const [open, setOpen] = useState(false);

	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		const usernamepPattern = /^[a-zA-Z0-9]+([._]?[a-zA-Z0-9]+)*$/;

		if(!emailPattern.test(email)){
			setError('Inavlid email format.')
			setOpen(true);
			return;
		}

		if( !usernamepPattern.test(username) || username.length < 4){
			setError('Invalid username format.')
			setOpen(true);
			return;
		}

		if(password !== confirm_password){
			setError('Passwords do not match.')
			setOpen(true);
			return;
		}


		try {
			const data = await signup(username, password, email, first_name, last_name);
			if( data.success ){
			setError('');
			navigate('/');
			}
			else{
			setError(data.data.error);
			setOpen(true);
			}
		}
		catch(error){
		}
	}

	const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
	if (reason === 'clickaway') {
	  return;
	}
	setOpen(false);
	};

	return(
	<Container sx={{display:"flex" , alignItems:"center" , justifyContent:"center" , heigth:"100vh" , py:15 }}>
		
	<form onSubmit={handleSubmit}>

		<Typography
		sx={{
			fontSize:"76px",
			fontWeight:"fontWeightExtraLight",
			color:"primary.main",
			py:3,
		}}
		variant="h1">
		FINALDRAFT
		</Typography>

		<Box sx={{ display:"flex", flexDirection:"column" , gap:"19px" }}>
			<InputBox label="First Name" value={first_name} onChange={(e)=>setFirst_name(e.target.value)} type="text" >
			</InputBox>

			<InputBox label="Last Name" value={last_name} onChange={(e)=>setLast_name(e.target.value)} type="text" >
			</InputBox>

			<InputBox label="Username" value={username} onChange={(e)=>setUsername(e.target.value)} type="text" >
			</InputBox>

			<InputBox label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} type="text" >
			</InputBox>

			<InputBox label="Password" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" >
			</InputBox>

			<InputBox label="Confirm Password" value={confirm_password} onChange={(e)=>setConfirm_password(e.target.value)} type="password" >
			</InputBox>

			<Button
				variant="outlined" 
				sx={{
					borderRadius:"50px",
					width:"448px",
					height:"77px",
					fontSize:32,
					color:"#EEEEEE",
					bgcolor:"#31363F",
					border:"3px solid #6FB7EE",
					my:2,
				}} 
				name="submit" 
				type="submit">
				Sign Up
			</Button> 
		</Box>
	</form>
    <Snackbar open={open} autoHideDuration={2000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose} sx={{}}>
	    <Alert onClose={handleClose} severity="error" sx={{ width: '100%' , fontSize:"24px" , color:"#FF5555" , backgroundColor:"secondary.main" }}>
	      {error}
	    </Alert>
    </Snackbar>
	</Container>
	);
}

export default SignUpForm;
