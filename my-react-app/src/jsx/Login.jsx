import Logo from '../assets/logo.png'
import user from '../icons/user.svg'
import key from '../icons/key.svg'
import visible from '../icons/visible.svg'
import invisible from '../icons/invisible.svg'
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"; 
import '../css/Login.css'

function Login() {

  useEffect(() => {
    document.title = "Login - Beauwitty"
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8081/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      console.log("User data:", data);

      alert("Login successful!");
      navigate("/dashhboard"); // ✅ redirect after success
    } catch (error) {
      alert(error.message);
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
                  onChange={(e) => setUsername(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
