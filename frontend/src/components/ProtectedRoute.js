import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [showLoading, setShowLoading] = useState(false);
  
  // Only show loading indicator after a slight delay to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowLoading(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // If no longer loading but still not authenticated, redirect to login
  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Show loading state only if it's been loading for more than the delay
  if (loading && showLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your notes...</p>
      </div>
    );
  }
  
  // When not loading anymore and authenticated, or if still loading but we don't show the indicator yet
  return isAuthenticated ? children : null;
};

export default ProtectedRoute;