import React, { useEffect } from 'react'
import { Container, Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper,
	CircularProgress, 
  Button} from "@mui/material"
  import { Modal } from '@mui/base/Modal';

import SearchBar from "./universal/SearchBar.js"
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import axios from 'axios'
import Nav from "../components/Nav.js"
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {  Link } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast';
import useAuth from "../context/AuthContext.js"

// resturant menu row
function Row(props) {
	// props information
	const { row } = props
	// state
	const [open, setOpen] = React.useState(false)

	return (
		<React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Link to={`/cafe/${row.cafeId}`}>{row.title}</Link>
        </TableCell>
        {/* properties map */}
        {Object.keys(row).map(val => 
          (val !== 'title' && val !== 'menu' && val !== 'cafeId') ? (<TableCell key={val} align="right">{row[val]}</TableCell>) : false
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Menu
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Dish</TableCell>
                    <TableCell align="right">Ingredients Amt.</TableCell>
                    <TableCell align="right">Avg. Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* sorted menu of a restaurant */}
                  {row.menu.sort((a,b) => b.avgRating - a.avgRating).map((dish) => (
                    <TableRow key={dish._id}>
                      <TableCell component="th" scope="row">
                        {dish.title}
                      </TableCell>
                      <TableCell align="right">{dish.ingredientsAmt}</TableCell>
                      <TableCell align="right">
                        {dish.avgRating}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
	);
}
// generate data from API
function createData(cafe) {
	const menuObj = []
	let accRating = 0
	let ratingL = 0
	if (cafe.menu.length) {
		cafe.menu.map(val => {
			menuObj.push({
				title: val.title,
				_id: val._id,
				ingredientsAmt: val.ingredients.split(',').length,
				avgRating: val.rating
			})
			if (val.rating > 0) {
				accRating += val.rating
				ratingL++
			}
			return true
		})
	}
	const calcRating = (accRating / ratingL).toFixed(1)
	return {
		cafeId: cafe._id,
		title: cafe.title,
		cuisine: cafe.cuisine,
		rating: calcRating === "NaN" ? '0.0' : calcRating,
		district: cafe.location,
		menu: menuObj
	};
}

const Main = props => {
	const { loggedIn, logout, cafeId, userId } = useAuth()

	// state
	const [searched, setSearched] = React.useState("")
	const [allRows, setAllRows] = React.useState({})
  const [openModal, setOpenModal] = React.useState(false);
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

	const [rows, setRows] = React.useState([])
	const [loading, setLoading] = React.useState(false)
	// update rows from api
	function updateRows() {
		axios.get('https://dishwish.onrender.com/cafe').then(res => {
			if (res.status === 200) {
				let newRows = []
				res.data.matches.map(val => newRows.push(createData(val)))
				setRows(newRows)
				setAllRows(newRows)
				setLoading(false)

			} else {
				toast.error('Something went wrong')
			}
		}).catch(e => toast.error('Service unavailable'))
	}
	// searchbar functionality
	const requestSearch = (searchVal) => {
		searchVal = searchVal.target.value
		setSearched(searchVal)

		if (allRows.length) {
			const newRows = allRows
				.filter(row => row.title.toLowerCase().includes(searchVal.toLowerCase()))
			setRows(newRows)
		}

	}
	const cancelSearch = () => {
		setSearched("")
		requestSearch(searched)
	};
	useEffect(() => {
    console.log('update')
		setLoading(true)
		updateRows()
	}, [])
  function handleRecommend() {
    console.log('handleRecommend')
    axios.post('https://dishwish.onrender.com/cafe/recommend', {userId}).then(res => {
			if (res.status === 200) {
        console.log('handleRecommend2')
				handleOpen()
				

			} else {
				toast.error('Something went wrong')
			}
		}).catch(e => {
      alert(e)
      toast.error('Service unavailable')})
  }
	return (
		<div>
                      <Nav  />
                      <Toaster />
                      <Container maxwidth="xs"   justifyContent="center"   alignItems="center"

 style={{ padding: 30 }}>
                      <SearchBar
                            value={searched}
                            onChange={(searchVal) => requestSearch(searchVal)}
                            onCancelSearch={() => cancelSearch()}
                        />
                        {loggedIn && !cafeId ? (
                          <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        style={{padding: 30}}>
                      <Button  onClick={handleRecommend} justifyContent="center"
                      variant="contained" color="success">
                        Recommend Me
                      </Button>                          </Box>
                        ) : <></>}
                        
                                          
                      {loading? <CircularProgress /> 
                      : (
                    <TableContainer component={Paper}>
                                            <Table aria-label="collapsible table" >
                            <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Restaurant</TableCell>
                                <TableCell align="right">Cuisine</TableCell>
                                <TableCell align="right">Avrg. dish rating</TableCell>
                                <TableCell align="right">District</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {rows.map((row) => (
                                <Row key={row.cafeId} row={row} />
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                      )}
                      

                    </Container>
                    <Modal
                      aria-labelledby="unstyled-modal-title"
                      aria-describedby="unstyled-modal-description"
                      open={openModal}
                      onClose={handleClose}
                      slots={{ backdrop: StyledBackdrop }}
                    >
                      <ModalContent sx={{ width: 400 }}>
                        <h2 id="unstyled-modal-title" className="modal-title">
                          Text in a modal
                        </h2>
                        <p id="unstyled-modal-description" className="modal-description">
                          Aliquid amet deserunt earum!
                        </p>
                      </ModalContent>
                    </Modal>
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
export default withRouter(Main)