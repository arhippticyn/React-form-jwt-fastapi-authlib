import { lazy, Suspense } from "react"
import { NavLink, Route, Routes } from 'react-router-dom'

const HomePage = lazy(() => import("./pages/Home.jsx"));
const RegisterPage = lazy(() => import("./pages/Register.jsx"));
const LoginPage = lazy(() => import("./pages/LogIn.jsx"));

function App() {

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/login">LogIn</NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App
