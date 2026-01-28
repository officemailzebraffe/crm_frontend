import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PermissionRoute = React.memo(({ children, permission, adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);

  // If no user, redirect to login (safety check)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin has access to everything
  if (user?.role === 'admin') {
    return children;
  }

  // Check admin-only routes
  if (adminOnly) {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page. Admin access required.</p>
        </div>
      </div>
    );
  }

  // Check specific permission
  if (permission && user?.permissions?.[permission] !== true) {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return children;
});

PermissionRoute.displayName = 'PermissionRoute';

export default PermissionRoute;
