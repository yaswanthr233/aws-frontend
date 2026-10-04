import React from 'react';

/**
 * Reusable Error Message Component
 * @param {string} message - Error explanation
 * @param {Function} [onRetry] - Optional retry handler
 * @param {string} [title="Something went wrong"]
 */
export default function ErrorMessage({ 
  message, 
  onRetry, 
  title = 'Something went wrong' 
}) {
  if (!message) return null;

  const isNetworkError = 
    message.toLowerCase().includes('connect') || 
    message.toLowerCase().includes('backend') ||
    message.toLowerCase().includes('network') ||
    message.toLowerCase().includes('failed to fetch');

  return (
    <div className="error-card" role="alert">
      <div className="error-header">
        <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h4 className="error-title">{title}</h4>
      </div>

      <p className="error-body">{message}</p>

      {isNetworkError && (
        <div className="network-help-box">
          <strong>Troubleshooting Checklist:</strong>
          <ul>
            <li>Is the backend laptop powered on and connected to the same Wi-Fi/LAN?</li>
            <li>Did the backend laptop's IP change? Check <code>.env</code> file.</li>
            <li>Is the microservice running on the expected port?</li>
            <li>Does the backend laptop's firewall permit incoming connections on ports 5001-5004?</li>
          </ul>
        </div>
      )}

      {onRetry && (
        <div className="error-actions">
          <button onClick={onRetry} className="btn-retry">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
