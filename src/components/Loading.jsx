import React from 'react';

/**
 * Reusable Loading Spinner Component
 * @param {string} [message="Loading..."]
 * @param {boolean} [fullPage=false]
 */
export default function Loading({ message = 'Loading...', fullPage = false }) {
  return (
    <div className={`loading-container ${fullPage ? 'full-page' : ''}`}>
      <div className="spinner" role="status" aria-label="loading"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}
