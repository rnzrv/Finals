import Logo from '../assets/logo.png';
import user from '../icons/user.svg';
import key from '../icons/key.svg';
import visible from '../icons/visible.svg';
import invisible from '../icons/invisible.svg';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../css/Login.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState(Logo); // default fallback logo
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - Beauwitty";
    getLogo();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8081/users/user/login", 
        {username, password},
        {withCredentials: true}
      );

      // Store access token in memory (not localStorage)
      sessionStorage.setItem("accessToken", response.data.accessToken);
      sessionStorage.setItem("role", response.data.role);

      alert("Login successful!");

      if (response.data.role === "ADMIN" || response.data.role === "ceo") {
        navigate("/dashhboard");
      }  
      
      if (response.data.role === "MANAGER") {
        navigate("/inventory");
      } 
      if (response.data.role === "CASHIER") {
        navigate("/sales");
      }
    
    } catch (error) {
      // Axios automatically handles non-200 responses as errors
      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  const getLogo = async () => {
    try {
      const response = await axios.get("http://localhost:8081/users/user/logo", {
        withCredentials: true,
      });
      if (response.data?.logoUrl) {
        const logoPath = response.data.logoUrl;
        const normalized = logoPath.startsWith('http')
          ? logoPath
          : `http://localhost:8081${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
        setLogo(normalized);
        try {
          localStorage.setItem('logoUrl', normalized);
        } catch (storageError) {
          console.warn('Unable to persist logoUrl to localStorage:', storageError);
        }
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
      return null;
    }
  }

  return (
    <div className="card">
      <div className="box">
        <div className="logo">
          <img
            src={logo}
            alt="Logo"
            onError={() => setLogo(Logo)}
          />
          <span>Beauwitty</span>
        </div>
        <div className="login">
          <p>Welcome Back</p>
          <div className="form">
            <form onSubmit={handleLogin}>
              {/* Username */}
              <div className="inputBox">
                <img src={user} alt="User" className="icon-left" />
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
                <img src={key} alt="Key" className="icon-left" />
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
                  <input type="checkbox" id="rememberMe" />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
               
              </div>

              {/* Login button */}
              <button type="submit" className="loginBtn">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
