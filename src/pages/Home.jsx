import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../config/api';

export default function Home() {
  const [healthStatus, setHealthStatus] = useState({});
  const [checking, setChecking] = useState({});

  const services = [
    {
      name: 'Auth Service',
      port: 5001,
      url: API.AUTH,
      desc: 'Handles user registration, login, and JWT token issuance.',
      healthEndpoint: '/api/auth/me'
    },
    {
      name: 'Product Service',
      port: 5002,
      url: API.PRODUCT,
      desc: 'Manages product catalog, prices, and stock inventory.',
      healthEndpoint: '/api/products'
    },
    {
      name: 'Order Service',
      port: 5003,
      url: API.ORDER,
      desc: 'Creates customer orders and tracks purchasing history.',
      healthEndpoint: '/api/orders'
    },
    {
      name: 'Payment Service',
      port: 5004,
      url: API.PAYMENT,
      desc: 'Processes simulated payment transactions for orders.',
      healthEndpoint: '/api/payments'
    }
  ];

  // Helper function to test network connectivity to each microservice from the browser
  const testConnection = async (serviceName, baseUrl, endpoint) => {
    setChecking((prev) => ({ ...prev, [serviceName]: true }));
    const targetUrl = `${baseUrl.replace(/\/+$/, '')}${endpoint}`;

    try {
      // Initiate a test fetch with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // Even if status is 401 (Auth required) or 200, the service is REACHABLE!
      setHealthStatus((prev) => ({
        ...prev,
        [serviceName]: {
          status: 'online',
          message: `Reachable (HTTP ${res.status})`
        }
      }));
    } catch (err) {
      setHealthStatus((prev) => ({
        ...prev,
        [serviceName]: {
          status: 'offline',
          message: err.name === 'AbortError' ? 'Timeout (No response)' : 'Connection refused / offline'
        }
      }));
    } finally {
      setChecking((prev) => ({ ...prev, [serviceName]: false }));
    }
  };

  const testAllServices = () => {
    services.forEach((s) => testConnection(s.name, s.url, s.healthEndpoint));
  };

  return (
    <div className="page-container home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Microservices Architecture</span>
          <h1 className="hero-title">
            CloudMart <span className="text-gradient">E-Commerce</span>
          </h1>
          <p className="hero-subtitle">
            A distributed e-commerce frontend built with React, Vite, and modern JavaScript.
            Communicates seamlessly with independent backend microservices across your local network.
          </p>

          <div className="hero-buttons">
            <Link to="/products" className="btn-primary-lg">
              Explore Products
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <a href="#architecture" className="btn-secondary-lg">
              View Microservices
            </a>
          </div>
        </div>
      </section>

      {/* Network Setup Notice Banner */}
      <section className="network-alert-banner">
        <div className="network-alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>
          </svg>
        </div>
        <div className="network-alert-content">
          <h3>Dual Laptop / Multi-Device Environment</h3>
          <p>
            The backend microservices run on a <strong>different laptop</strong> on your local network.
            All API URLs are dynamically loaded from your <code>.env</code> file. Ensure your backend laptop's LAN IP is configured.
          </p>
        </div>
      </section>

      {/* Microservices Cards */}
      <section id="architecture" className="services-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Backend Microservices Status</h2>
            <p className="section-desc">
              Monitor the 4 microservices powering this e-commerce platform.
            </p>
          </div>
          <button onClick={testAllServices} className="btn-secondary-sm">
            Ping All Services
          </button>
        </div>

        <div className="services-grid">
          {services.map((service) => {
            const isChecking = checking[service.name];
            const result = healthStatus[service.name];

            return (
              <div key={service.name} className="service-card">
                <div className="service-card-top">
                  <div className="service-badge">Port {service.port}</div>
                  {result && (
                    <span className={`status-pill ${result.status}`}>
                      {result.status === 'online' ? '● Online' : '✕ Unreachable'}
                    </span>
                  )}
                </div>

                <h3 className="service-name">{service.name}</h3>
                <p className="service-desc">{service.desc}</p>

                <div className="service-url-box">
                  <span className="url-label">Target URL:</span>
                  <code className="url-code">{service.url || 'Not set in .env'}</code>
                </div>

                {result && (
                  <div className={`ping-result ${result.status}`}>
                    {result.message}
                  </div>
                )}

                <button
                  onClick={() => testConnection(service.name, service.url, service.healthEndpoint)}
                  disabled={isChecking || !service.url}
                  className="btn-ping"
                >
                  {isChecking ? 'Pinging...' : 'Test Connectivity'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features-section">
        <div className="feature-item">
          <div className="feature-icon">🛡️</div>
          <h3>JWT Authentication</h3>
          <p>Secure token storage with automatic session validation and authorization headers.</p>
        </div>

        <div className="feature-item">
          <div className="feature-icon">📦</div>
          <h3>Independent Services</h3>
          <p>Decoupled product inventory, order placement, and simulated payment processing.</p>
        </div>

        <div className="feature-item">
          <div className="feature-icon">🛒</div>
          <h3>Client-Side Cart</h3>
          <p>Persistent local shopping cart with instant quantity updates and stock awareness.</p>
        </div>
      </section>
    </div>
  );
}
