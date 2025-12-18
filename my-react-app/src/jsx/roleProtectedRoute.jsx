import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const role = sessionStorage.getItem("role");

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashhboard" replace />; 
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;