import React from 'react'
const AuthContext = React.createContext()

// context hook
function useAuth() {
	// state
	const [loggedIn, setLoggedIn] = React.useState(false)
	const [username, setUsername] = React.useState(false)
	const [cafeId, setCafeId] = React.useState(null)
	const [userId, setUserId] = React.useState(null)
	return {
		loggedIn,
		username,
		userId,
		cafeId,
		login(username, userId, cafeId = null) {
			// when user loggs in or a session exists
			setLoggedIn(true)
			setUsername(username)
			setUserId(userId)
			if (cafeId) setCafeId(cafeId)
		},
		logout() {
			// when user loggs out and session doesn't exist
			setLoggedIn(false)
			setUserId(null)
			setCafeId(null)
			setUsername(null)
		}
	}
}
export const authContext = AuthContext
// auth provider
export function AuthProvider({ children }) {
	const auth = useAuth()

	return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
// auth consumer
export default function AuthConsumer() {
	return React.useContext(AuthContext)
}