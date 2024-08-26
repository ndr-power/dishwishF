import React, { useEffect } from 'react'
import { Container, Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Chip, Typography, Paper,
	CircularProgress, Grid, CardHeader, Avatar, CardContent, Card, CardActions,  colors, Button } from "@mui/material"
import { TextField, Dialog, DialogActions, DialogContent, Slider, DialogTitle } from '@mui/material'
import StarRateIcon from '@mui/icons-material/StarRate'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import axios from 'axios'
import Nav from "./Nav.js"
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import useAuth from '../context/AuthContext'
import { Toaster, toast } from 'react-hot-toast'

function FormDialog(props) {
	// context hook
	const { loggedIn, userId, username } = useAuth()
	// state
	const [title, setTitle] = React.useState('')
	const [text, setText] = React.useState('')
	const [rating1, setRating1] = React.useState(5)
	const [rating2, setRating2] = React.useState(5)
	// info from props
	const { dish, cafeId, dishId, updateRows } = props
	// dish slider 
	const handleChange1 = (event, newValue) => {
		setRating1(newValue);
	};
	// service slider
	const handleChange2 = (event, newValue) => {
		setRating2(newValue);
	};
	const handleClose = () => {
		props.setOpen(false);
	};
	// adds a review if a user is logged in
	const handleSubmit = () => {
		if (!loggedIn) return toast.error('Log in before adding a review')
    
		if (!(title && text)) return toast.error('Please fill all inputs')
		axios.post(`https://dishwish.onrender.com/cafe/${cafeId}/${dishId}/r`, { userId, username, title, text, ratingOverall: (rating1 + rating2) / 2, ratingService: rating2,
			ratingDish: rating1 }).then(res => {
			if (res.status === 200) {
				updateRows()
				handleClose()
				toast.success('Review added')
			} else {
				toast.error('Something went wrong')
			}
		})
		return
	}
	return (
		<React.Fragment>

        <Dialog  open={props.open} onClose={handleClose}>
            
          <DialogTitle>Rate the {dish.toLowerCase()}</DialogTitle>
          <DialogContent>
            <TextField margin="normal" required value={title} onChange={e=> setTitle(e.target.value)} fullWidth id="username" label="Title" name="title" autoComplete="title" autoFocus />
            <TextField margin="normal" required value={text} onChange={e=> setText(e.target.value)} fullWidth name="text" label="Text"  id="text" autoComplete="text" />
   
            <Typography variant="body2" sx={{paddingTop: 2}}>
                Rate the dish
            </Typography>   
            <Slider
            aria-label="Rating1"
            defaultValue={5}
            value={rating1}
            onChange={handleChange1}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={10}
            />
            <Typography variant="body2">
                Rate the service
            </Typography> 
            <Slider
            aria-label="Rating2"
            defaultValue={5}
            value={rating2}
            onChange={handleChange2}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={10}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Rate</Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
	);
}

function ReviewCard(props) {
	// props
  const { loggedIn, cafeId: userCafeId, username: authUsername, userId } = useAuth()
  const {cafeId , dishId, data} = props
  const reviewId = data._id
  const [showSentim, changeShowSentim ] = React.useState(!data.userConfirmsSentiment)
  const [confirmSentim, changeConfirmSentim] = React.useState(null)
  useEffect(() => {
    console.log('state changed ' + confirmSentim)
    
  }, [confirmSentim])

  const handleSentimentConfirm = (confirm) => {
    if (!loggedIn) return toast.error('Log in before adding a review')
    if (userCafeId) return toast.error('You can not post reviews as a Cafe Owner')
      axios.post(`https://dishwish.onrender.com/cafe/${cafeId}/${dishId}/${reviewId}/confirmSentiment`, {confirm: true, userId}).then(res => {
        if (res.status === 200) {
          toast.success('Thanks')
        } else {
          toast.error('Something went wrong')
        }
      })
  }
  const handleAccept = () => {
    changeConfirmSentim("accept")
    changeShowSentim(false)
    handleSentimentConfirm(true)
  }
  const handleDecline = () => {
    changeConfirmSentim("decline")
    changeShowSentim(false)
    handleSentimentConfirm(false)

  }
	const { username, title, text, date, ratingOverall, sentimentConfirmed, ratingSentiment } = props['data']
  console.log(ratingSentiment)
  let sentimentString = ''
  if (ratingSentiment < 0 ){
    sentimentString = 'Awful'
  }else if (ratingSentiment >=0 && ratingSentiment <= 0.25){
      sentimentString = 'Very bad'
  }else if (ratingSentiment >0.25 && ratingSentiment <= 0.5){
    sentimentString = 'Normal'
  }else if (ratingSentiment >0.5 && ratingSentiment <= 0.75){
    sentimentString = 'Good'
  }else{
    sentimentString = 'Amazing'
  }
	return (
		<React.Fragment>

        <Card sx={{ minWidth: 275 }}>
            <CardHeader
            avatar={
            <Avatar sx={{ bgcolor: colors.red[500] }} aria-label={username}>
                {username.toString()[0].toUpperCase()}
            </Avatar>
            }
            action={
            <div sx={{display: 'flex',}}>
                <Typography variant="button" display="block" gutterBottom sx={{}}>
                    {ratingOverall}                <StarRateIcon />

                </Typography>
            </div>
            
            }
            title={username}
            subheader={(new Date(date)).toLocaleDateString("en-US")}
        />
          <CardContent>
            
            <Typography variant="h5" component="div">
              {title}
            </Typography>

            <Typography variant="body2">
             {text}
            </Typography>
            
          </CardContent>
          <CardActions>
            Sentimentality guess: {sentimentString}
            {showSentim && (authUsername == username) ? (< >
            <Button onClick={handleAccept} size="contained">Confirm</Button>
            <Button onClick={handleDecline} size="outlined">Decline</Button>
            </>)
             : 
             < ></> }
            

          </CardActions>
        </Card>
        </React.Fragment>

	);
}

function Row(props) {
	// context hook
	const { loggedIn, cafeId: userCafeId } = useAuth()
	// info from props
	const { row, cafeId, updateRows, handleOpenError, handleOpenSuccess } = props;
	// state
	const [open, setOpen] = React.useState(false)
	const [openModal, setOpenModal] = React.useState(false)

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
          {row.title}
        </TableCell>
       
        <TableCell align="right">{row.ingredients.split(',').length}</TableCell>
        <TableCell align="right">{row.rating}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" >
            <Box sx={{ margin: 1}}>
            <Grid container direction="row" alignItems="center">
                <Grid item xs={6}>
                    <Typography variant="h6" gutterBottom component="div">
                        Ratings
                    </Typography>
                </Grid>
                {(loggedIn && !userCafeId) && (
                    <Grid item xs={6} sx={{paddingBottom: '0.35em'}} justify={"flex-end"} align="right">
                        <Button  variant="contained" onClick={() => setOpenModal(true)}>Rate</Button>
                    </Grid>
                )}
                
            </Grid>
              
              {/* foreach reviews */}
            <Grid container spacing={2}>
            
                {row.reviews.length && row.reviews.sort((a,b) =>  (new Date(b.date)) - (new Date(a.date))).map(val => {                
                    return (  
                <Grid key={val._id} item xs={12} sm={6} md={4} sx={{marginBottom: 1, marginTop: 1}}>
                   <ReviewCard data={val} dishId={row._id} cafeId={cafeId} updateRows={updateRows}/>
               </Grid> 
                )})}
                
                
            </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <FormDialog dish={row.title} dishId={row._id} cafeId={cafeId} handle open={openModal} handleOpenError={handleOpenError} handleOpenSuccess={handleOpenSuccess} setOpen={setOpenModal} updateRows={updateRows}/>

    </React.Fragment>
	);
}


const Cafe = props => {
	// router parameters
	const { id } = useParams()
	// state
	const [rows, setRows] = React.useState([])
	const [info, setInfo] = React.useState({})
	const [loading, setLoading] = React.useState(false)
  const [overallRating, setOverallRating] = React.useState(0)
  const [overallRatingService, setOverallRatingService] = React.useState(0)

	// updates info from API
	function updateRows() {
		axios.get(`https://dishwish.onrender.com/cafe/${id}`).then(res => {
			if (res.status === 200) {
        // console.log(res)
				setRows([])
				setInfo(res.data.matches)
				setRows(res.data.matches.menu)
        let ratedDishes = 0
        let ratedDishesSum = 0
        let ratedService = []
        res.data.matches.menu.map(dish => {
          if (dish.rating > 0) {
            ratedDishes++
            ratedDishesSum += dish.rating
          }
          dish.reviews.map(rev => {
            ratedService.push(rev.ratingService)
          })
        })
        setOverallRating((ratedDishesSum / ratedDishes).toFixed(1))
        setOverallRatingService((ratedService.reduce((a,b) => a+b) / ratedService.length).toFixed(1))
				setLoading(false)
			} else {
				setLoading(false)
				toast.error('Something went wrong')
			}
		}).catch(e => {
			setLoading(false)
			toast.error('Service unavailable')
		})
	}
	// updates rows on component mount
	useEffect(() => {
		setLoading(true)
		updateRows()
	}, []);
	return (
		<React.Fragment>
                      <Nav  />
                      <Container maxwidth="xs" style={{ padding: 30 }}>
                      <Paper sx={{
                          padding: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                      }} >
                          <Typography variant="h4" component="h2">{info.title}</Typography>
                          <Divider sx={{width:'100%', paddingTop: 1 }}>
                            <Chip label={info.cuisine} />
                        </Divider>
                          <Typography variant="subtitle1" gutterBottom component="div" sx={{
                              paddingTop:2 
                          }}>
                            {info.description}
                            </Typography>
                            <Divider sx={{width:'100%', paddingTop: 1 }}>
                            <Chip label={"Rating"} />
                            </Divider>
                            <Typography variant="subtitle1" gutterBottom component="div" sx={{
                              paddingTop:2 
                          }}>
                            Overall Rating: {overallRating ? overallRating.toFixed(1) : 0} <br />
                            Service Rating: {overallRatingService ? overallRatingService : 0}
                            </Typography>
                            <Divider sx={{width:'100%', paddingTop: 1 }}>
                            <Chip label="Menu" />
                        </Divider>
                      {loading? <CircularProgress /> 
                      : (
                        
                    <TableContainer component={Paper}>
                                            <Table aria-label="collapsible table" >
                            <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell>Dish</TableCell>
                                <TableCell align="right">Ingredients Amt</TableCell>
                                <TableCell align="right">Avrg. Rating</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {/* dishes map */}
                            {rows.map(row => (
                                <Row key={row._id} row={row} cafeId={id}  updateRows={updateRows}/>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                      )}
                                           </Paper>

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
export default withRouter(Cafe)