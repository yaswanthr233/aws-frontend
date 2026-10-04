import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import ErrorMessage from '../components/ErrorMessage';

export default function Cart() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, cartTotal, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setErrorMsg('');
    setCreatingOrder(true);

    try {
      // Format items as required by Order Service: [{ productId: "...", quantity: 2 }]
      const orderItems = cart.map((item) => ({
        productId: item.id || item.productId || item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));

      // Call Order Service (Port 5003 via VITE_ORDER_API_URL) with JWT
      const createdOrder = await orderService.createOrder(orderItems, {
        totalAmount: cartTotal,
        userId: user?.id || user?._id || user?.email
      });

      const orderId = createdOrder?.id || createdOrder?._id || createdOrder?.orderId;

      if (!orderId) {
        throw new Error('Order was created but no Order ID was returned by the Order Service.');
      }

      // Clear the local cart after placing the order
      clearCart();

      // Navigate to Payment Simulation page
      navigate(`/payment/${orderId}`);
    } catch (err) {
      console.error('Checkout failed:', err);
      setErrorMsg(err.message || 'Failed to place order with Order Service.');
    } finally {
      setCreatingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="page-container empty-cart-container">
        <div className="empty-cart-card">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Shopping Cart is Empty</h2>
          <p>You haven't added any products to your cart yet.</p>
          <Link to="/products" className="btn-primary-lg">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">Review items in your client-side shopping bag</p>
        </div>
        <button onClick={clearCart} className="btn-danger-outline">
          Clear Entire Cart
        </button>
      </div>

      <ErrorMessage message={errorMsg} />

      <div className="cart-layout-grid">
        {/* Cart Items List */}
        <div className="cart-items-section">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          <div className="cart-items-list">
            {cart.map((item) => {
              const itemId = item.id || item.productId;
              const subtotal = (item.price * item.quantity).toFixed(2);

              return (
                <div key={itemId} className="cart-item-row">
                  <div className="item-info-col">
                    <Link to={`/products/${itemId}`} className="item-title">
                      {item.name}
                    </Link>
                    {item.stock !== undefined && (
                      <span className="item-stock-hint">
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </span>
                    )}
                  </div>

                  <div className="item-price-col">
                    ${Number(item.price).toFixed(2)}
                  </div>

                  <div className="item-qty-col">
                    <div className="qty-control-inline">
                      <button
                        onClick={() => decreaseQuantity(itemId)}
                        className="qty-btn-sm"
                        title="Decrease"
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(itemId)}
                        disabled={item.quantity >= item.stock}
                        className="qty-btn-sm"
                        title="Increase"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="item-subtotal-col">
                    ${subtotal}
                  </div>

                  <div className="item-remove-col">
                    <button
                      onClick={() => removeFromCart(itemId)}
                      className="btn-remove-item"
                      title="Remove product"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="cart-summary-section">
          <div className="summary-card">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-row">
              <span>Items Total ({totalItems})</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="text-free">FREE</span>
            </div>

            <div className="summary-row">
              <span>Estimated Tax</span>
              <span>$0.00</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Order Total</span>
              <span className="total-amount">${cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={creatingOrder}
              className="btn-primary-block btn-checkout"
            >
              {creatingOrder ? (
                <>
                  <span className="spinner-inline"></span>
                  Contacting Order Service...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>

            <div className="checkout-note">
              🔒 Order will be sent securely to Order Service on Port 5003 with JWT authentication.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
