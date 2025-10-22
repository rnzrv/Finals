import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("accessToken");
  
  // if no token, redirect to login page ("/")
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
