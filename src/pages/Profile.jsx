import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Profile() {
  const { user, token, logout } = useAuth();
  const { totalItems, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const name = user?.name || 'Valued Customer';
  const email = user?.email || 'N/A';
  const userId = user?.id || user?._id || 'Standard User';

  return (
    <div className="page-container profile-page">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="profile-header-meta">
            <h1 className="profile-name">{name}</h1>
            <p className="profile-email">{email}</p>
            <span className="profile-badge">Authenticated via Auth Service :5001</span>
          </div>
        </div>

        <div className="profile-divider"></div>

        {/* Profile Details Sections */}
        <div className="profile-details-grid">
          <div className="profile-field">
            <span className="field-label">Full Name</span>
            <span className="field-value">{name}</span>
          </div>

          <div className="profile-field">
            <span className="field-label">Email Address</span>
            <span className="field-value">{email}</span>
          </div>

          <div className="profile-field">
            <span className="field-label">Account ID</span>
            <span className="field-value font-mono">{userId}</span>
          </div>

          <div className="profile-field">
            <span className="field-label">Authentication Token (JWT)</span>
            <span className="field-value text-success">
              {token ? 'Active & Stored in LocalStorage' : 'None'}
            </span>
          </div>
        </div>

        {/* Quick Activity Summary */}
        <div className="profile-activity-box">
          <h3>Quick Activity</h3>
          <div className="activity-cards">
            <div className="activity-card">
              <span className="activity-number">{totalItems}</span>
              <span className="activity-title">Items in Cart (${cartTotal.toFixed(2)})</span>
              <Link to="/cart" className="activity-link">Open Cart →</Link>
            </div>

            <div className="activity-card">
              <span className="activity-number">📦</span>
              <span className="activity-title">Orders History</span>
              <Link to="/orders" className="activity-link">View Orders →</Link>
            </div>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="profile-actions">
          <button onClick={handleLogout} className="btn-danger-outline btn-logout-lg">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
