import { useDispatch, useSelector } from "react-redux"
import { selectToken, selectUser } from "../redux/selectors"
import { useEffect } from "react"
import { GetUser } from "../redux/operation"

const User = () => {
  const user = useSelector(selectUser)


    if (!user.username) {
      return <p>Loading user...</p>;
    }
  return (
    <div>
      <h2>Hello {user.username}, <br /> Your email: {user.email}</h2>
    </div>
  )
}

export default User