import React from "react";
import { Navigate, Outlet } from "react-router-dom"; // Use Navigate and Outlet in v6

const ProtectedRoute = () => {
  const  isAuthenticated  = localStorage.getItem('auth_token') // Assuming useAuth returns an object with isAuthenticated

  // If not authenticated, redirect to login, otherwise render the nested route (children)
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />; // Outlet will render the child route of the ProtectedRoute
};

export default ProtectedRoute;
