import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const id = product.id || product._id;
  const name = product.name || 'Unnamed Product';
  const price = Number(product.price) || 0;
  const stock = product.stock ?? 0;
  const description = product.description || 'No description available.';
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  // Stock status badge formatting
  const renderStockBadge = () => {
    if (isOutOfStock) {
      return <span className="stock-badge out-of-stock">Out of Stock</span>;
    }
    if (stock <= 5) {
      return <span className="stock-badge low-stock">Only {stock} left!</span>;
    }
    return <span className="stock-badge in-stock">{stock} in stock</span>;
  };

  return (
    <div className="product-card">
      <Link to={`/products/${id}`} className="product-card-img-link">
        <div className="product-card-image-wrap">
          {product.image ? (
            <img src={product.image} alt={name} className="product-card-img" />
          ) : (
            <div className="product-placeholder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          )}
          <div className="stock-badge-container">{renderStockBadge()}</div>
        </div>
      </Link>

      <div className="product-card-content">
        <div className="product-card-header">
          <Link to={`/products/${id}`} className="product-title-link">
            <h3 className="product-name">{name}</h3>
          </Link>
          <span className="product-price">${price.toFixed(2)}</span>
        </div>

        <p className="product-description">{description}</p>

        <div className="product-card-actions">
          <Link to={`/products/${id}`} className="btn-secondary-sm">
            Details
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`btn-primary-sm ${justAdded ? 'btn-success' : ''}`}
          >
            {justAdded ? (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Added!
              </>
            ) : isOutOfStock ? (
              'Sold Out'
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
