import React from "react";
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const role = sessionStorage.getItem("role");

  if(role === "ceo" || role === "ADMIN"){
    return <>{children}</>;
  }

  if(role === "MANAGER" && allowedRoles.includes("MANAGER")){
    return <>{children}</>;
  }

  if(role === "CASHIER" && allowedRoles.includes("CASHIER")){
   return <>{children}</>;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashhhboard" replace />; 
  }

  

  return <>{children}</>;
};

export default RoleProtectedRoute;