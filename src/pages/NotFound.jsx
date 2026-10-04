import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-container notfound-page">
      <div className="notfound-card">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-text">
          The page or route you are looking for does not exist or may have been moved.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn-primary-lg">
            Return to Home
          </Link>
          <Link to="/products" className="btn-secondary-lg">
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
