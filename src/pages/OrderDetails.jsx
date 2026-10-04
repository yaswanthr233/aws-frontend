import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(id);
      if (!data) {
        throw new Error('Order not found on Order Service.');
      }
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError(err.message || 'Unable to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return <Loading message="Loading order details from Order Service..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/orders')} className="btn-back">
          ← Back to Orders
        </button>
        <ErrorMessage message={error} onRetry={fetchOrder} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container empty-state-box">
        <h3>Order Not Found</h3>
        <p>The requested order #{id} could not be located.</p>
        <Link to="/orders" className="btn-primary-sm">Back to Orders</Link>
      </div>
    );
  }

  const orderId = order.id || order._id || order.orderId || id;
  const status = (order.status || 'pending').toLowerCase();
  const isPaid = status === 'paid' || status === 'completed';
  const totalAmount = Number(order.totalAmount || order.amount || 0);
  const items = Array.isArray(order.items) ? order.items : [];
  const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';

  return (
    <div className="page-container order-details-page">
      <button onClick={() => navigate('/orders')} className="btn-back">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Orders
      </button>

      <div className="order-details-card">
        {/* Order Header */}
        <div className="order-header-row">
          <div>
            <div className="order-meta-tag">Order Service :5003</div>
            <h1 className="order-title">Order #{String(orderId).slice(-8)}</h1>
            <p className="order-timestamp">Placed on {createdAt}</p>
          </div>
          <div className="order-header-status">
            <span className={`status-pill ${isPaid ? 'pill-paid' : 'pill-pending'}`}>
              Status: {order.status || 'Pending'}
            </span>
          </div>
        </div>

        <div className="order-divider"></div>

        {/* Order Items Table */}
        <div className="order-items-wrapper">
          <h3>Purchased Items ({items.length})</h3>
          <div className="order-items-table">
            <div className="order-table-head">
              <span>Item Description</span>
              <span>Unit Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {items.map((item, idx) => {
              const itemPrice = Number(item.price || (item.productId && item.productId.price) || 0);
              const itemTotal = itemPrice * item.quantity;
              const itemName = item.name || item.productId?.name || `Product ID: ${item.productId}`;

              return (
                <div key={item.productId || idx} className="order-table-row">
                  <div>
                    <span className="order-item-title">{itemName}</span>
                    {item.productId && typeof item.productId === 'string' && (
                      <span className="order-item-sub">ID: {item.productId}</span>
                    )}
                  </div>
                  <div>${itemPrice.toFixed(2)}</div>
                  <div>{item.quantity}</div>
                  <div className="font-semibold">${itemTotal.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="order-divider"></div>

        {/* Financial Summary */}
        <div className="order-cost-breakdown">
          <div className="cost-row">
            <span>Subtotal:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="cost-row">
            <span>Shipping:</span>
            <span>$0.00 (Free)</span>
          </div>
          <div className="cost-row total-highlight">
            <span>Total Amount Paid / Due:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="order-actions-footer">
          {!isPaid ? (
            <div className="unpaid-callout">
              <p>This order is currently pending payment confirmation.</p>
              <Link to={`/payment/${orderId}`} className="btn-primary-lg">
                Complete Simulated Payment (${totalAmount.toFixed(2)}) →
              </Link>
            </div>
          ) : (
            <div className="paid-callout">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Payment has been received and confirmed for this order.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
