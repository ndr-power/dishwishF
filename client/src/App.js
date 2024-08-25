import { Component } from 'react'
import {
	Routes ,
	Route,
	Navigate ,
} from "react-router-dom";
import './App.css';
import Main from "./components/Main.js"
import Login from "./components/Login.js"
import Register from "./components/Register.js"
import RegisterCafe from "./components/RegisterCafe.js"
import Cafe from './components/Cafe.js'
import Dishes from './components/Dishes.js'
import Map from './components/Map.js'
import EditCafe from './components/EditCafe.js'
import axios from 'axios'
import useAuth, { authContext } from "./context/AuthContext.js";

function RequireAuth({ children }) {
	const { loggedIn } = useAuth();

	return loggedIn === true ? children : <Navigate  to="/login" replace />;
}

function RequireCafeAdmin({ children }) {
	const { loggedIn, cafeId } = useAuth()
	return (loggedIn === true && cafeId) ? children : <Navigate  to="/" replace />
}
const CafeEdit = () => {
	return (<RequireCafeAdmin>
		<EditCafe />
	  </RequireCafeAdmin>)
}
class App extends Component {
	static contextType = authContext
	constructor() {
		super()
		this.getUser = this.getUser.bind(this)
		this.componentDidMount = this.componentDidMount.bind(this)
	}
	componentDidMount() {
		this.getUser()
	}
	getUser() {
		axios.get('https://dishwish.onrender.com/login').then(res => {
			if (res.data.user) {
				if (res.data.cafeId) {
					this.context.login(res.data.user, res.data.user._id, res.data.cafeId)
				} else this.context.login(res.data.user, res.data.user._id)
			} else {
				this.context.logout()
			}
		}).catch(e => {
			this.context.logout()
		})
	}

	render() {
		return (

			<Routes >
        {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dishes" element={<Dishes />}/>
          <Route path="/map" element={<Map />} />
          <Route path="/register/cafe" element={<RegisterCafe />} />
          <Route path="/register" element={<Register  />} />
                  {/* protected cafe routes */}
          <Route path="/cafe/:id/edit" element={<CafeEdit />}/>

          <Route path="/cafe/:id" element={<Cafe />}/>
           
          <Route path="/" element={ <Main />} />
          
      </Routes >
		);
	}
}
export default App;