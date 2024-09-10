import React, { useEffect } from 'react'
import { Container, Paper, Button, CircularProgress, Chip, Box } from '@mui/material'
import FoodBankOutlinedIcon from '@mui/icons-material/FoodBankOutlined'
import axios from 'axios'
import Nav from "./Nav.js"
import { Link, } from 'react-router-dom'
import { Map, Overlay } from "pigeon-maps"
import { pink } from '@mui/material/colors'

import { useGeolocated } from "react-geolocated";

import toast, { Toaster } from 'react-hot-toast';
// overlay marker element
const MapMarker = props => {
	// props info
	const { val } = props
	// state
	const [showText, setShowText] = React.useState(false)

	return (
		<div sx={{width: 91}}>

        
            <Box sx={{display: 'flex',
                alignItems: 'flex-start',
                alignContent: 'flex-start',
                flexDirection: 'column',
            }}>
                <Button onClick={() => setShowText(!showText)} >
                    <FoodBankOutlinedIcon  color="primary" sx={{ fontSize: 40, color: pink[500], alignSelf: 'left'}}/> 
                </Button>
                {showText && 
                    <React.Fragment>
                    <Link to={`/cafe/${val.cafeId}`}>
                        <Chip label={`${val.title} | ${val.bestDish}`} color="primary" />
                    </Link>
                    </React.Fragment>
                }
            </Box>

        </div>
	)
}
const MapComp = props => {
	// state
	const [loading, setLoading] = React.useState(false)
	const [markers, setMarkers] = React.useState([])
	const [coordsMap, setCoordsMap] = React.useState([55.79397085, 49.13446312083333])
	// check for user's geolocation
	const { coords, isGeolocationAvailable, isGeolocationEnabled } =
	 useGeolocated({
		positionOptions: {
			enableHighAccuracy: false,
		},
		userDecisionTimeout: 5000,
	});
	console.log(isGeolocationAvailable, isGeolocationEnabled)
	// if (isGeolocationAvailable && isGeolocationEnabled) {
	// 	setCoordsMap([parseFloat(coords.latitude), parseFloat(coords.longitude)])
	// }
	// add markers from api
	function updateMarkers() {
		axios.get(`https://dishwish.onrender.com/cafe/`).then(res => {
			setLoading(false)
			if (res.status === 200) {
				let newMarkers = []

				res.data.matches.map(val => {
					let bestDish = { title: 'No dishes available', rating: '0' }
					if (val.menu.length)
						bestDish = val.menu.sort((a, b) => b.rating - a.rating)[0]
					newMarkers.push({ title: val.title, lat: val.lat, lng: val.lng, cafeId: val._id,
						bestDish: `${bestDish.rating} - ${bestDish.title}` })
					return true
				})
				setMarkers(newMarkers)
			} else {
				toast.error('Something went wrong')
			}
		}).catch(e => {
			toast.error('Service unavailable')
			setLoading(false)
		})
	}
	// load markers on component mount
	useEffect(() => {
		setLoading(true)
		updateMarkers()
	}, []);
	return (
		<div>
                      <Nav  />
					  <Toaster />
                      <Container maxwidth="xs" style={{ padding: 30 }}>
                      <Paper sx={{
                          padding: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                      }} >
                            {loading? <CircularProgress /> 
                        : (
                            <Map height={600} defaultCenter={coordsMap} defaultZoom={13}>
                                {markers.map( val => (
                                    <Overlay key={val.title}    offset={[40.5,30]}  anchor={[parseFloat(val.lat), parseFloat(val.lng)]} >
                                        <MapMarker val={val} />
                                    </Overlay>
                                ))}
                            </Map>  
                            )}
                        </Paper>

                    </Container>
        </div>

	)

}

export default MapComp