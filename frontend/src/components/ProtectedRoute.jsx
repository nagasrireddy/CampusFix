// ---------------------------------------------------------
// components/ProtectedRoute.jsx
// Frontend route guard. This is a UX convenience layer only -
// the REAL security boundary is always the backend JWT +
// authorizeRoles middleware. This component just prevents a
// logged-in student from ever rendering the admin UI shell.
// ---------------------------------------------------------

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @param {string[]} allowedRoles - roles permitted to view the children
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in, but wrong portal - redirect to their own dashboard
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
