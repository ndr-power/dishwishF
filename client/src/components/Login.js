import * as React from 'react'
import { Container, TextField, Box, CssBaseline, Typography, Button } from "@mui/material"
import axios from 'axios'
import Nav from "../components/Nav.js"
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import useAuth from "../context/AuthContext.js"
import toast, { Toaster } from 'react-hot-toast';

// login component
const Login = props => {
	// push is used for redirect
	const navigate  = useNavigate()
	// context hook 
	const { login, loggedIn } = useAuth()

	// if user is logged in redirect to main page
	if (loggedIn) navigate('/')
	// loggs user in
	const handleSubmit = (event) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget);
		axios.post('https://dishwish.onrender.com/login', {
				username: data.get('username'),
				password: data.get('password')
			}).then(res => {
				if (res.status === 200) {
					if ('cafeId' in res.data) login(res.data.user, res.data.userId, res.data.cafeId)
					else login(res.data.user, res.data.userId)
					navigate('/')
				} else {
					toast.error("Incorrect login information")
				}
			})
			.catch(e => {
				toast.error("Service unavailable")
			})
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
            // border: 1,
            // borderColor: 'grey.500'
          }}
        >
            <Typography component="h1" variant="h5">
            Sign in
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
                Sign In
                </Button>
                    <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={() => navigate('/register')}
                    >
                    Register
                    </Button>
            </Box>
            </Box>
        </Container>
        </div>

	)
};
function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}
export default withRouter(Login)