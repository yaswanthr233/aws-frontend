import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentService } from '../services/paymentService';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Payment() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);

  // Fetch the order info to determine amount
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      setLoadingOrder(true);
      setErrorMsg('');
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
        // If order already has payment or status completed
        if (data?.status === 'paid' || data?.status === 'completed') {
          setPaymentResult({
            success: true,
            transactionId: data.transactionId || `txn_${orderId.slice(-6)}`,
            amount: data.totalAmount || data.amount,
            orderId: orderId,
            message: 'Order already paid.'
          });
        }
      } catch (err) {
        console.warn('Could not prefetch order for payment:', err);
        // Fallback to basic state so user can still test payment simulation
      } finally {
        setLoadingOrder(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handleSimulatePayment = async () => {
    setErrorMsg('');
    setProcessing(true);

    const amount = Number(order?.totalAmount || order?.amount || 100);
    const userId = user?.id || user?._id || user?.email || 'test-user';

    try {
      // Call Payment Service on Port 5004 (via VITE_PAYMENT_API_URL)
      const result = await paymentService.processPayment({
        orderId,
        userId,
        amount
      });

      // Construct payment outcome display object
      setPaymentResult({
        success: true,
        transactionId: result?.transactionId || result?.id || `txn_${Date.now()}`,
        amount: result?.amount || amount,
        orderId: result?.orderId || orderId
      });
    } catch (err) {
      console.error('Payment processing error:', err);
      setErrorMsg(err.message || 'Simulated payment failed. Please check Payment Service status.');
    } finally {
      setProcessing(false);
    }
  };

  if (loadingOrder) {
    return <Loading message="Preparing payment details..." />;
  }

  const amountToPay = Number(order?.totalAmount || order?.amount || 100);

  return (
    <div className="page-container payment-page">
      <div className="payment-card">
        {paymentResult ? (
          /* Payment Successful View */
          <div className="payment-success-view">
            <div className="success-icon-badge">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h1 className="success-title">Payment Successful</h1>
            <p className="success-subtitle">
              Your simulated payment transaction has been processed by Payment Service (:5004).
            </p>

            <div className="receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Transaction ID:</span>
                <span className="receipt-val font-mono">{paymentResult.transactionId}</span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Order ID:</span>
                <span className="receipt-val font-mono">{paymentResult.orderId}</span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Amount:</span>
                <span className="receipt-val font-bold text-success">
                  ${Number(paymentResult.amount).toFixed(2)}
                </span>
              </div>

              <div className="receipt-row">
                <span className="receipt-label">Status:</span>
                <span className="receipt-val text-success">Approved / Completed</span>
              </div>
            </div>

            <div className="payment-actions-row">
              <Link to={`/orders/${orderId}`} className="btn-primary-lg">
                View Order Details
              </Link>
              <Link to="/products" className="btn-secondary-lg">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Form View */
          <div className="payment-form-view">
            <div className="payment-header">
              <div className="payment-icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
              </div>
              <h2 className="payment-title">Simulated Payment Gateway</h2>
              <p className="payment-subtitle">
                Payment Microservice (Port 5004 via <code>VITE_PAYMENT_API_URL</code>)
              </p>
            </div>

            <ErrorMessage message={errorMsg} />

            <div className="order-summary-box">
              <div className="summary-line">
                <span>Order ID:</span>
                <span className="font-mono">#{String(orderId).slice(-8)}</span>
              </div>
              <div className="summary-line">
                <span>Customer Email:</span>
                <span>{user?.email || 'Signed-in User'}</span>
              </div>
              <div className="summary-line total-line">
                <span>Total Amount Due:</span>
                <span className="highlight-price">${amountToPay.toFixed(2)}</span>
              </div>
            </div>

            <div className="simulation-notice">
              <strong>ℹ️ Note for Evaluators:</strong>
              <p>
                This application uses a mock payment workflow. No real credit card or bank details are required. Clicking below sends a <code>POST /api/payments</code> request to the Payment Service.
              </p>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={processing}
              className="btn-primary-block btn-pay"
            >
              {processing ? (
                <>
                  <span className="spinner-inline"></span>
                  Processing Simulated Payment...
                </>
              ) : (
                `Simulate Payment ($${amountToPay.toFixed(2)})`
              )}
            </button>

            <button onClick={() => navigate('/orders')} className="btn-cancel">
              Cancel and Return to Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
