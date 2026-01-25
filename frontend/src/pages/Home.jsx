import { useSelector } from "react-redux"
import { selectIsLogin } from "../redux/selectors"

const Home = () => {
   const isLogin = useSelector(selectIsLogin)
  return (
    <div>
      {isLogin ? null : <h2>Hello, please register</h2>}
    </div>
  )
}

export default Home