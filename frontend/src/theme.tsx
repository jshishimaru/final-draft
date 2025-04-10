import { createTheme } from '@mui/material'

const theme = createTheme({
	palette: {
		primary: {
			main: '#6FB7EE'
		},
		secondary: {
			main: '#31363F'
		},
		background: {
			default: '#222831'
		},
		error:{
			main: "#FF5555"
		},
	},
	typography:{
		fontFamily:[
			'Lato',
		].join(','),
	    button: {
      		textTransform: 'none'
    	},	
	}
});

export default theme;