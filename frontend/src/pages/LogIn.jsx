import { useDispatch } from "react-redux"
import { Login } from '../redux/operation';
import styles from "../styles/Form.module.css";
import { FaGoogle } from 'react-icons/fa';
import { FaGithub } from 'react-icons/fa';

const LogIn = () => {
  const dispatch = useDispatch()
  const handleLogin = e => {
    e.preventDefault()
    const form = e.target
    const elements = form.elements;
    const username = elements.username.value;
    const password = elements.password.value;
    
    dispatch(Login({username: username, password: password}))
    form.reset()
  }
  return (
    <div>
      <h2>LogIn</h2>

      <form action="" className={styles.form} onSubmit={handleLogin}>
        <label htmlFor="username" className={styles.label}>
          Enter username
        </label>
        <input type="text" className={styles.input} name="username" />

        <label htmlFor="password" className={styles.label}>
          Enter password
        </label>
        <input type="password" className={styles.input} name="password" id="" />

        <button type="submit" className={styles.btn}>
          Login
        </button>
      </form>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() =>
            (window.location.href = 'http://127.0.0.1:8000/auth/google')
          }
        >
          Log in with Google <FaGoogle />
        </button>
        <button
          onClick={() =>
            (window.location.href = 'http://127.0.0.1:8000/auth/github')
          }
        >
          Log in with Github <FaGithub />
        </button>
      </div>
    </div>
  );
}

export default LogIn