import * as React from 'react'
import { Container, TextField, Box, CssBaseline, Typography, Button } from "@mui/material"
import axios from 'axios'
import Nav from "../components/Nav.js"
import { useNavigate } from 'react-router-dom'
import useAuth from "../context/AuthContext.js"
import toast, { Toaster } from 'react-hot-toast';
const Register = () => {
	// hook for redirects
  const navigate = useNavigate();
	// context
	const { loggedIn } = useAuth()
	if (loggedIn) navigate('/')
	// register hook
	const handleSubmit = (event) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		axios.post('https://dishwish.onrender.com/login/register', {
			username: data.get('username'),
			password: data.get('password')
		}).then(res => {
			if (res.status === 200) {
				if (res.data.user) {
					navigate('/login')
				} else {
					toast.error("Something went wrong")
				}
			}
		}).catch(e => toast.error('Service unavailable'))
	};
	return (
		<div>
                        <Nav />
                        <Toaster />

        <Container maxwidth="xs" style={{ padding: 30 }}>
            <CssBaseline />
            <Box
          sx={{
            marginTop: 8,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',

          }}
        >
              <Typography component="h1" variant="h5">
                Create account
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                  <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"

                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  />
                  <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  />
                  
                  <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  >
                    Register
                  </Button>
                  <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/login')}
                  sx={{ mt: 3, mb: 2 }}
                  >
                    Login
                  </Button>
                  <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/register/cafe')}
                  sx={{ mt: 3, mb: 2 }}
                  >
                    Register Cafe
                  </Button>
              </Box>
            </Box>
        </Container>
        </div>

	)
}

export default Register