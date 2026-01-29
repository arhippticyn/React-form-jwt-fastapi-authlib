import { useDispatch, useSelector } from "react-redux"
import { selectToken, selectUser } from "../redux/selectors"
import { useEffect } from "react"
import { GetUser } from "../redux/operation"
import { LogOut } from "../redux/slice"

const User = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()


    if (!user.username) {
      return <p>Loading user...</p>;
    }
  return (
    <div>
      <h2>
        Hello {user.username}, <br /> Your email: {user.email}
      </h2>
      <button onClick={() => dispatch(LogOut())}>Log Out</button>
    </div>
  );
}

export default User