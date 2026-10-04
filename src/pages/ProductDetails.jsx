import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedNotice, setAddedNotice] = useState(false);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProductById(id);
      if (!data) {
        throw new Error('Product not found in database.');
      }
      setProduct(data);
    } catch (err) {
      console.error(`Failed to load product ${id}:`, err);
      setError(err.message || 'Unable to retrieve product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product || (product.stock ?? 0) <= 0) return;
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  if (loading) {
    return <Loading message="Loading product details..." />;
  }

  if (error) {
    return (
      <div className="page-container">
        <button onClick={() => navigate('/products')} className="btn-back">
          ← Back to Products
        </button>
        <ErrorMessage message={error} onRetry={fetchProduct} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container empty-state-box">
        <h3>Product Not Found</h3>
        <p>The requested product ID could not be located.</p>
        <Link to="/products" className="btn-primary-sm">Browse Products</Link>
      </div>
    );
  }

  const name = product.name || 'Unnamed Product';
  const price = Number(product.price) || 0;
  const stock = product.stock ?? 0;
  const isOutOfStock = stock <= 0;

  return (
    <div className="page-container product-details-page">
      <button onClick={() => navigate('/products')} className="btn-back">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Products
      </button>

      <div className="product-details-grid">
        {/* Product Media Column */}
        <div className="product-media-card">
          {product.image ? (
            <img src={product.image} alt={name} className="product-detail-img" />
          ) : (
            <div className="product-detail-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span>Product Image</span>
            </div>
          )}
        </div>

        {/* Product Info Column */}
        <div className="product-info-column">
          <div className="product-badge-row">
            <span className={`stock-pill ${isOutOfStock ? 'pill-out' : stock <= 5 ? 'pill-low' : 'pill-in'}`}>
              {isOutOfStock ? 'Out of Stock' : stock <= 5 ? `Low Stock: ${stock} Left` : `${stock} Available in Stock`}
            </span>
            <span className="service-tag">Product Service :5002</span>
          </div>

          <h1 className="detail-product-name">{name}</h1>
          <div className="detail-price-box">
            <span className="detail-price">${price.toFixed(2)}</span>
            <span className="price-tax-note">Tax included, shipping calculated at checkout</span>
          </div>

          <div className="detail-description-box">
            <h3>Description</h3>
            <p>{product.description || 'No detailed description provided for this product.'}</p>
          </div>

          {/* Add to Cart Actions */}
          <div className="detail-actions-box">
            {!isOutOfStock && (
              <div className="quantity-selector-wrap">
                <label htmlFor="qty-input" className="qty-label">Quantity:</label>
                <div className="qty-buttons">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <input
                    id="qty-input"
                    type="number"
                    min="1"
                    max={stock}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuantity(Math.min(Math.max(1, val), stock));
                      }
                    }}
                    className="qty-input"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="action-buttons-row">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`btn-primary-lg ${addedNotice ? 'btn-success' : ''}`}
              >
                {addedNotice ? (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added to Cart!
                  </>
                ) : isOutOfStock ? (
                  'Currently Out of Stock'
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Add {quantity} to Cart
                  </>
                )}
              </button>

              {addedNotice && (
                <Link to="/cart" className="btn-secondary-lg">
                  View Cart ({quantity}) →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
