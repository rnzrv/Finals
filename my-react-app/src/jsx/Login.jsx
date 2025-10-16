import Logo from '../assets/logo.png'
import user from '../icons/user.svg'
import key from '../icons/key.svg'
import visible from '../icons/visible.svg'
import invisible from '../icons/invisible.svg'
import { use, useState } from 'react';
import { useNavigate } from "react-router-dom"; 
import '../css/Login.css'
import { useEffect } from 'react'

function Login() {

  useEffect(() => {
    document.title = "Login - Beauwitty"
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");  // ✅ track username
  const [password, setPassword] = useState("");  // ✅ track password
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // stop page reload

    // ✅ simple login check
    if (username === "asd" && password === "123") {
      navigate("/dashhboard"); // redirect
    } else {
      alert("Invalid credentials"); // 🚨 show error
    }
  };

  return (
    <div className="card">
      <div className="box">
        <div className="logo">
          <img src={Logo} alt="Logo"/>
          <span>Beauwitty</span>
        </div>
        <div className="login">
          <p>Welcome Back</p>
          <div className="form">
            <form onSubmit={handleLogin}>
              {/* Username */}
              <div className="inputBox">
                <img src={user} alt="User" className="icon-left"/>
                <input 
                  type="text" 
                  id="username" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} // ✅ update state
                />
                <label htmlFor="username">username</label>
              </div>

              {/* Password */}
              <div className="inputBox">
                <img src={key} alt="Key" className="icon-left"/>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} // ✅ update state
                />
                <label htmlFor="password">password</label>
                <img 
                  src={showPassword ? visible : invisible} 
                  alt="Toggle password" 
                  className="togglePassword"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>

              {/* Remember me + Forgot password */}
              <div className="bottom">
                <div className="left">
                  <input type="checkbox" id="rememberMe"/>
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <div className="right">
                  <a href="#">Forgot Password?</a>
                </div>
              </div>

              {/* Login button */}
              <button type="submit" className="loginBtn">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
