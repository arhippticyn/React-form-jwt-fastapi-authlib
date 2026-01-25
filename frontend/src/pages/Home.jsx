import { useDispatch, useSelector } from "react-redux"
import { selectIsLogin, selectToken, selectUser } from "../redux/selectors"
import User from "../components/User"
import { useEffect } from "react"
import { setToken } from "../redux/slice"
import { GetUser, SetAuthHeaders } from "../redux/operation"

const Home = () => {
   const token = useSelector(selectToken);
   const user = useSelector(selectUser);
   const dispatch = useDispatch()

   useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      SetAuthHeaders(token)
      dispatch(setToken(token))
      dispatch(GetUser())

      window.history.replaceState({}, '', '/')
    }
   }, [dispatch])

   if (!token) {
    return <h2>Hello, please register</h2>;
   }

   if (!user) {
    return <h2>User Loading...</h2>
   }
  return (
    <div>
      <User /> 
    </div>
  )
}

export default Home