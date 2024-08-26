import React, { useEffect } from 'react'
import {
	Container,
	Box,
	Collapse,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Paper,
	CircularProgress
} from "@mui/material"
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
import { Link } from 'react-router-dom'
import stringSimilarity from 'string-similarity'
import { Toaster, toast } from 'react-hot-toast'

// table rows with all dishes served
function Row(props) {
	// info from props
	const { row, name } = props
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
          {name}
        </TableCell>
       
        <TableCell align="right">{row.length}</TableCell>
        
      </TableRow>
      
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Restaurants
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Dish</TableCell>
                    <TableCell align="right">Restaurant</TableCell>
                    <TableCell align="right">Avrg. Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* dishes map by type (sorted by rating) */}
                  {row.sort((a, b) => b.rating - a.rating).map((dish) => (
                    <TableRow key={dish.dishId}>
                      <TableCell component="th" scope="row">
                        {dish.title}
                      </TableCell>
                      <TableCell align="right">
                            <Link to={`/cafe/${dish.cafeId}`}>
                                {dish.cafeTitle}
                            </Link>
                          </TableCell>
                      <TableCell align="right">
                        {dish.rating}
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

const Dishes = props => {
	// state
	const [searched, setSearched] = React.useState("")
	const [allRows, setAllRows] = React.useState({})

	const [rows, setRows] = React.useState([])
	const [loading, setLoading] = React.useState(false)
	// searchbar functionality
	const requestSearch = (searchVal) => {
		searchVal = searchVal.target.value
		setSearched(searchVal)
		if (Object.keys(allRows).length) {
			const newRows = Object.keys(allRows)
				.filter(row => row.toLowerCase().includes(searchVal.toLowerCase()))
				.reduce((obj, key) => {
					obj[key] = allRows[key]
					return obj
				}, {})
			setRows(newRows)
		}

	}
	const cancelSearch = () => {
		setSearched("")
		requestSearch(searched)
	};
	// updates rows from API
	function updateRows() {
		axios.get('https://dishwish.onrender.com/cafe').then(res => {
			if (res.status === 200) {
				let dishes = {}
				res.data.matches.map(val => {
					val.menu.map(dish => {
						if (Object.keys(dishes).length) {
							// dish name similarity factor => organizes them in rows
							const bestMatch = stringSimilarity.findBestMatch(dish.title, Object.keys(dishes))
							if (bestMatch.bestMatch.rating > 0.6) {
								dishes[bestMatch.bestMatch.target].push({
									title: dish.title,
									cafeId: val._id,
									cafeTitle: val.title,
									dishId: dish._id,
									dishTitle: dish.title,
									rating: dish.rating
								})
							} else {
								dishes[dish.title] = [{
									title: dish.title,
									cafeId: val._id,
									cafeTitle: val.title,
									dishId: dish._id,
									dishTitle: dish.title,
									rating: dish.rating
                        }]
							}
						} else {
							dishes[dish.title] = [{
								title: dish.title,
								cafeId: val._id,
								cafeTitle: val.title,
								dishId: dish._id,
								dishTitle: dish.title,
								rating: dish.rating
                    }]
						}
						return true
					})
					return true
				})
				setRows(dishes)
				setAllRows(dishes)
				setLoading(false)
			} else {
				toast.error('Something went wrong')
			}
		}).catch(e => toast.error('Service unavailable'))
	}

	useEffect(() => {
		setLoading(true)
		updateRows()
	}, []);
	return (
		<React.Fragment>
                      <Nav  />
					  <Toaster />
                      <Container maxwidth="xs" style={{ padding: 30 }}>
                      <SearchBar
                            value={searched}
                            onChange={(searchVal) => requestSearch(searchVal)}
                            onCancelSearch={() => cancelSearch()}
                        />
                    {loading? <CircularProgress /> 
                    : (
                        
                        <TableContainer component={Paper}>
                                                <Table aria-label="collapsible table" >
                                <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>Dish</TableCell>
                                    <TableCell align="right">Serving restaurants</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                  {/* dishes types map */}
                                  {Object.keys(rows).map(dishName => (
                                      <Row key={dishName} row={rows[dishName]} name={dishName}/>
                                  ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                      )}            

                        </Container>
        </React.Fragment>

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
export default withRouter(Dishes)