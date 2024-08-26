import * as React from 'react'
import { Container, TextField, Divider , Box, CssBaseline, FormControl, Select, InputLabel, OutlinedInput, MenuItem, Typography, Button  } from "@mui/material"
import axios from 'axios'
import Nav from "../components/Nav.js"
import {useNavigate} from 'react-router-dom'
import useAuth from '../context/AuthContext.js'
import toast, { Toaster } from 'react-hot-toast';
// password for page access
const PASSWORD = '12345'
// dropdown styles
function getStyles(name, cuisineName) {
    return {
      fontWeight:
      cuisineName.indexOf(name) === -1
          ? 10
          : 1,
    };
  }

const RegisterCafe = props => {
  // redirects hook
    const history = useNavigate()
    // context
    const { loggedIn } = useAuth()
    // state
    const [cuisine, setCuisine] = React.useState([]);
    const [password, setPassword] = React.useState([])
    // cuisines available
    const cuisines = [
        'Czech',
        'Italian',
        'French',
        'German',
        'Turkish',
        'Indian',
        'Fast-Food',
        'Sea-Food',
        'Burgers',
        'Pizza'
    ]
    // check for login
    if (loggedIn) history.push('/')
    // dropdown select hooks
    const handleChange = (event) => {
        const {
          target: { value },
        } = event;
        setCuisine(
          typeof value === 'string' ? value.split(',') : value,
        )
      }
      // register user with cafe
    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget)
        const postObj = {
                username: data.get('username'),
                password: data.get('password'),
            
            cafe: {
                title: data.get('title'),
                description: data.get('description'),
                location: data.get('location'),
                cuisine: data.get('cuisine'),
                image: null
            }
        }
        // check for fields
        const cafe = postObj.cafe
        if (!(postObj.username && postObj && cafe.title && cafe.description && cafe.location && cafe.cuisine)) return alert.error('Please fill all inputs')
        axios.post('https://dishwish.onrender.com/login/register/cafe', postObj).then(res => {
            if (res.status === 200) {
                if (res.data.user){
                    history.push('/login')
                }else{
                  toast.error("Something went wrong")
                }
            }
        }).catch(e => toast.error('Service unavailable'))
      };
      // asks for password on component mount
      React.useEffect(() => {
        setPassword(prompt('Enter password'))
        
      }, []);
    if (password == PASSWORD)
    return (
        <div>
                        <Nav/>
                        <Toaster />

        <Container maxwidth="xs" style={{ padding: 30 }}>
            <CssBaseline />
            <Box
          sx={{
            marginTop: 0,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: "center",
            alignItems: 'center',
            // border: 1,
            // borderColor: 'grey.500',
        }}
        >
            <Typography component="h1" variant="h5">
            Create account
          </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: "100%"}}>
                <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus />
                <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" />
                <Divider  />
                <Typography component="h1" variant="h5" sx={{marginTop: 1, display: "flex", alignSelf: "center", padding: "auto" }}>
                    Cafe Details
                </Typography>
                <TextField margin="normal" required fullWidth name="title" label="Title"  id="title" autoComplete="Cafe name" />
                <TextField margin="normal" required fullWidth name="description" label="Description"  id="description" autoComplete="Cafe description" />
                <TextField margin="normal" required fullWidth name="location" label="Location"  id="location" autoComplete="location" />
              
                <FormControl sx={{ m: 1, width: "100%" }}>
                    
                <InputLabel id="demo-multiple-name-label">Cuisine</InputLabel>
                <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                name="cuisine"
                value={cuisine}
                onChange={handleChange}
                input={<OutlinedInput label="Cuisine" name="cuisine" />}
                MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 250,
                      },
                    }}}
                >
                {cuisines.map((name) => (
                    <MenuItem
                    key={name}
                    value={name}
                    style={getStyles(name, cuisine)}
                    >
                    {name}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
                <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                >
                Register
                </Button>
            
            </Box>
            </Box>
        </Container>
        </div>

    )    
    else return (<Typography component="h1" variant="h2">RESTRICTED</Typography>)
}

export default RegisterCafe