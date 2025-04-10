import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import router from './router'
import theme from './theme'
import {CssBaseline, ThemeProvider } from '@mui/material'
import { RouterProvider } from 'react-router-dom'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
	<ThemeProvider theme={theme}>
		<CssBaseline />
	<RouterProvider router={router} />
	</ThemeProvider>
  </StrictMode>,
)

