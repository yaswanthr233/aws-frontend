import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await orderService.getOrders();

      console.log('ORDERS FROM API:', data);

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to retrieve orders:', err);
      setError(
        err.message || 'Unable to load orders from Order Service.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="page-container orders-page">

      <div className="page-header">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">
            Track your purchases from the Order Microservice
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn-secondary-sm"
        >
          Refresh Orders
        </button>
      </div>

      {loading && (
        <Loading message="Loading your orders from Order Service (port 5003)..." />
      )}

      {error && !loading && (
        <ErrorMessage
          message={error}
          title="Order Service Error"
          onRetry={fetchOrders}
        />
      )}

      {!loading && !error && (
        <>
          {orders.length > 0 ? (
            <div className="orders-table-card">
              <table className="orders-table">

                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const orderId =
                      order._id ||
                      order.id ||
                      order.orderId;

                    const itemsCount = order.items?.length || 0;

                    const amount = Number(
                      order.totalAmount ||
                      order.amount ||
                      0
                    );

                    const paymentStatus = String(
                      order.paymentStatus || 'PENDING'
                    ).toUpperCase();

                    const orderStatus = String(
                      order.status || 'PENDING'
                    ).toUpperCase();

                    const isPaid =
                      paymentStatus === 'COMPLETED' ||
                      paymentStatus === 'SUCCESS';

                    const createdAt = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : 'Recent';

                    return (
                      <tr key={orderId}>

                        {/* Order ID */}
                        <td className="font-mono">
                          <Link
                            to={`/orders/${orderId}`}
                            className="order-id-link"
                          >
                            #{String(orderId).slice(-8)}
                          </Link>
                        </td>

                        {/* Date */}
                        <td>
                          {createdAt}
                        </td>

                        {/* Items */}
                        <td>
                          {itemsCount}{' '}
                          {itemsCount === 1 ? 'item' : 'items'}
                        </td>

                        {/* Amount */}
                        <td className="font-semibold">
                          ${amount.toFixed(2)}
                        </td>

                        {/* Payment Status */}
                        <td>
                          {isPaid ? (
                            <span className="status-pill pill-paid">
                              ✓ PAID
                            </span>
                          ) : (
                            <span className="status-pill pill-pending">
                              {paymentStatus}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="table-actions">

                            {/* View Details */}
                            <Link
                              to={`/orders/${orderId}`}
                              className="btn-secondary-xs"
                            >
                              View Details
                            </Link>

                            {/* Pay only if payment is not completed */}
                            {!isPaid && (
                              <Link
                                to={`/payment/${orderId}`}
                                className="btn-pay-xs"
                              >
                                Pay Now
                              </Link>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          ) : (
            <div className="empty-state-box">
              <div className="empty-icon">📋</div>

              <h3>No Orders Found</h3>

              <p>
                You haven't placed any orders yet.
              </p>

              <Link
                to="/products"
                className="btn-primary-sm"
              >
                Browse Products
              </Link>
            </div>
          )}
        </>
      )}

    </div>
  );
}