import React, { useEffect } from 'react'
import {
	Container,
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Divider,
	Chip,
	Typography,
	Paper,
	CircularProgress,
	Grid,
	Button
} from "@mui/material"
import { TextField } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

import axios from 'axios'
import Nav from "./Nav.js"
import {
	useLocation,
	useNavigate,
	useParams,
  } from "react-router-dom";
  import useAuth from '../context/AuthContext'
import toast, { Toaster } from 'react-hot-toast';


// rows of dishes
function Row(props) {
	// props info
	const { row, cafeId, editRows } = props

	// deletes a dish from cafe's menu
	function handleDelete() {
		axios.delete(`/cafe/${cafeId}/${row._id}`).then(res => {
			if (res.status === 200) {
				editRows(res)
				toast.success('Successfully deleted a dish!')
			} else {
				toast.error('Something went wrong...')
			}
		}).catch(e => {
			toast.error("Service unavailable")
		})
	}
	return (
		<React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          {row.title}
        </TableCell>
        <TableCell align="right" component="th" scope="row">
          <Button onClick={() => handleDelete()} color="error">DELETE</Button>
        </TableCell>
       
        
      </TableRow>
      

    </React.Fragment>
	);
}


const EditCafe = props => {
	// context hook
	const { cafeId, loggedIn } = useAuth()
	// state
	const [rows, setRows] = React.useState([])
	const [loading, setLoading] = React.useState(false)
	const [title, setTitle] = React.useState(false)
	const [description, setDescription] = React.useState(false)
	const [loadingButton, setLoadingButton] = React.useState(false)
	const [dishName, setDishName] = React.useState('')
	const [ingredients, setIngredients] = React.useState('')



	// updates rows with info from API
	function updateRows() {
		axios.get(`/cafe/${cafeId}`).then(res => {
			if (res.status === 200) {
				let newRows = []
				res.data.matches.menu.map(val => newRows.push(val))
				setTitle(res.data.matches.title)
				setDescription(res.data.matches.description)
				setRows(newRows)
				setLoading(false)
			} else {
				toast.error('Something went wrong')
			}
		}).catch(e => toast.error('Service unavailable'))
	}
	// updates information of the cafe
	function handleSubmit(e) {
		e.preventDefault()
		setLoadingButton(true)
		axios.patch(`/cafe/${cafeId}`, { title, description }).then(res => {
			setLoadingButton(false)
			if (res.status === 200) {
				toast.success('Successfully updated information')
			} else {
				toast.error('Something went wrong')
			}
		}).catch(e => {
			setLoadingButton(false)
			toast.error('Service unavailable')
		})
	}
	// updates rows with provided info
	function editRows(res) {
		setTitle(res.data.matches.title)
		setDescription(res.data.matches.description)
		setRows(res.data.matches.menu)
	}
	// adds a dish to the menu
	function addDish() {
		axios.post(`/cafe/${cafeId}/menu`, { title: dishName, ingredients }).then(res => {
			if (res.status === 200) {
				setTitle(res.data.matches.title)
				setDescription(res.data.matches.description)
				setRows(res.data.matches.menu)
				toast.success("Successfully added a dish!")
			} else {
				toast.error("Such dish already exists!")
			}
		}).catch(e => toast.error('Service unavailable'))
	}
	// updates rows on component mount
	useEffect(() => {
		setLoading(true)
		updateRows()
	}, []);
	// checks if user is authorized to edit cafe
	if (!(cafeId && loggedIn)) return (<h1>Restricted</h1>)
	return (
		<div>
			<Toaster />
                      <Nav  />
                      <Container maxwidth="xs" style={{ padding: 30 }}>
                      <Paper sx={{
                          padding: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                      }} >
                                                  <Typography variant="h4" component="h2">Edit Restaurant's Details</Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: "100%"}}>
                          <TextField value={title} onChange={e => setTitle(e.target.value)} margin="normal" required fullWidth id="cafeTitle" label="Title" name="title" autoComplete="title" autoFocus />
                          <TextField value={description} onChange={e => setDescription(e.target.value)} margin="normal" required fullWidth name="description" label="Description" type="text" id="description" autoComplete="description" />
                          <LoadingButton
                            type="submit"
                            loading={loadingButton}
                            size="large"
                            sx={{width: '50%', marginTop: 2, marginBottom: 2}}
                            // loadingPosition="end"
                            variant="contained"
                          > 
                            UPDATE
                          </LoadingButton>

                        </Box>
                         
                        <Divider sx={{width:'100%', paddingTop: 1 }} >
                          <Chip label="Add Dish" /> 
                        </Divider>
                        <Grid container spacing={2} direction="row"
                        justifyContent="center"
                        alignItems="stretch"
                        sx={{marginTop: 2, marginBottom: 4}}>
                          <Grid item xs={12} >
                            <TextField value={dishName} onChange={e => setDishName(e.target.value)}  required fullWidth id="newDish" label="Dish Name" name="dish" autoComplete="dish" autoFocus />
                          </Grid>
                          <Grid item xs={12} >
                            <TextField value={ingredients} onChange={e => setIngredients(e.target.value)}  required fullWidth id="ingredients" label="Ingredients (separated by comma)" name="ingredients" autoComplete="ingredients"  />
                          </Grid>
                          <Grid item xs={6} alignItems="stretch" sx={{display: 'flex', padding: '2px'}}>
                            <Button fullWidth  size="large" variant="contained" onClick={() => addDish()}>Add</Button>
                          </Grid>
                        </Grid>
                        
                      {loading? <CircularProgress /> 
                      : (
                        
                    <TableContainer component={Paper}>
                                            <Table aria-label="collapsible table" >
                            <TableHead>
                            <TableRow>
                                <TableCell>Dish</TableCell>
                                <TableCell align="right">Action</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {rows.map(row => (
                                <Row key={row._id} row={row} cafeId={cafeId} editRows={editRows}/>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                      )}
                                           </Paper>
                   
                    </Container>
        </div>

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
export default withRouter(EditCafe)