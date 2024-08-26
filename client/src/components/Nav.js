import * as React from 'react'
import { AppBar, Container, Typography, Menu, MenuItem, Toolbar, IconButton, Box, Button, Tooltip } from "@mui/material"
import MenuIcon from '@mui/icons-material/Menu'
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from 'axios'
import useAuth from "../context/AuthContext.js"
import toast, { Toaster } from 'react-hot-toast';
const Nav = props => {
	// context
	const { loggedIn, logout, cafeId } = useAuth()
	// history for redirects
	let navigate = useNavigate()
	// state
	const [anchorElNav, setAnchorElNav] = React.useState(null);
	const [anchorElUser, setAnchorElUser] = React.useState(null);
	// navbar mobile hooks
	const handleOpenNavMenu = (event) => {
		setAnchorElNav(event.currentTarget)
	}
	const handleOpenUserMenu = (event) => {
		setAnchorElUser(event.currentTarget)
	}

	const handleCloseNavMenu = () => {
		setAnchorElNav(null)
	}

	const handleCloseUserMenu = () => {
		setAnchorElUser(null)
	}
	// logout a user
	const handleLogout = () => {
		axios.get('https://dishwish.onrender.com/login/logout').then(res => {
			if (res.status === 200) {
				logout()
				navigate('/login')
			} else toast.error("Error Logout")
		}).catch(e => toast.error('Service unavailable'))
	}
	return (
		<AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                Dish&Wish
              </Typography>
    
              <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                              <MenuIcon />

                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                >
                    <MenuItem key="Main" onClick={() => navigate('/')}>
                      <Typography textAlign="center">Main</Typography>
                    </MenuItem>
                    <MenuItem key="Dishes" onClick={() => navigate('/dishes')}>
                      <Typography textAlign="center">Dishes</Typography>
                    </MenuItem>
                    <MenuItem key="Map" onClick={() => navigate('/dishes')}>
                      <Typography textAlign="center">Map</Typography>
                    </MenuItem>
                  
                </Menu>
              </Box>
              <Typography
                variant="h5"
                noWrap
                component="a"
                href=""
                sx={{
                  mr: 2,
                  display: { xs: 'flex', md: 'none' },
                  flexGrow: 1,
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                Wish&Dish
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    key="Main"
                    onClick={() => navigate('/')}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Main
                  </Button>
                  
                  <Button
                    key="Dishes"
                    onClick={() => navigate('/dishes')}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Dishes
                  </Button>
                  <Button
                    key="Map"
                    onClick={() => navigate('/map')}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Map
                  </Button>
              </Box>
            {loggedIn ? 
              (<Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                <MenuItem key="Profile" onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Typography textAlign="center">Profile</Typography>

                </MenuItem>
                  </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {cafeId && (
                      <MenuItem key="editCafe" onClick={() => navigate(`/cafe/${cafeId}/edit`)} >
                      <Typography textAlign="center">Edit Cafe Info</Typography>
                    </MenuItem>
                    )}
                    <MenuItem key="Logout" onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                    
                </Menu>
              </Box>)
               : (<Box sx={{flexGrow: 0}}>
                   <Button
                    key="Login"
                    onClick={e => {
                      e.preventDefault()
                      navigate('/login')}}
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Login
                  </Button>
                </Box>
                ) }
            </Toolbar>
          </Container>
        </AppBar>
	)
}
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
export default withRouter(Nav)