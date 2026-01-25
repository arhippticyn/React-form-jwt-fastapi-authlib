import { useDispatch, useSelector } from "react-redux"
import styles from "../styles/Form.module.css";
import { RegisterUser } from "../redux/operation";
import { selectIsLogin } from "../redux/selectors";

const Register = () => {
    const dispatch = useDispatch()

    const handleRegister = e => {
        e.preventDefault()
        const form = e.target
        const elements = form.elements;
        const username = elements.username.value
        const email = elements.email.value;
        const password = elements.password.value;

        dispatch(RegisterUser({username: username, email: email, password: password}))
        form.reset()
    }

  return (
    <div>

      <h2>Register</h2>

      <form action="" className={styles.form} onSubmit={handleRegister}>
        <label htmlFor="username" className={styles.label}>
          Enter username
        </label>
        <input type="text" className={styles.input} name="username" />

        <label htmlFor="email" className={styles.label}>
          Enter email
        </label>
        <input type="email" className={styles.input} name="email" id="" />

        <label htmlFor="password" className={styles.label}>
          Enter password
        </label>
        <input type="password" className={styles.input} name="password" id="" />

        <button type="submit" className={styles.btn}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Register