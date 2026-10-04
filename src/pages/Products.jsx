import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await productService.getProducts();

      console.log('Products API response:', data);

      // Handle different possible response formats
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        console.error('Unexpected products response:', data);
        setProducts([]);
        setError('Product Service returned an unexpected response.');
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      setError(
        err.message || 'Unable to fetch products from Product Service.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Search
  const filteredProducts = products.filter((product) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return (
      (product.name || '').toLowerCase().includes(query) ||
      (product.description || '').toLowerCase().includes(query)
    );
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return Number(a.price || 0) - Number(b.price || 0);
    }

    if (sortBy === 'price-high') {
      return Number(b.price || 0) - Number(a.price || 0);
    }

    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }

    return 0;
  });

  return (
    <div className="page-container products-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>

          <p className="page-subtitle">
            Browse our full catalog retrieved live from the Product Microservice
          </p>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="products-controls-bar">

        <div className="search-input-wrap">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            className="search-input"
            placeholder="Search products by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="sort-controls">

          <label htmlFor="sort-select" className="sort-label">
            Sort by:
          </label>

          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>

          <button
            onClick={fetchProducts}
            className="btn-refresh"
            title="Reload products"
          >
            ↻
          </button>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <Loading message="Fetching products from Product Service (port 5002)..." />
      )}

      {/* Error */}
      {error && !loading && (
        <ErrorMessage
          message={error}
          title="Product Service Error"
          onRetry={fetchProducts}
        />
      )}

      {/* Products */}
      {!loading && !error && (
        <>
          {sortedProducts.length > 0 ? (
            <div className="products-grid">

              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                />
              ))}

            </div>
          ) : (
            <div className="empty-state-box">

              <div className="empty-icon">📦</div>

              <h3>No Products Found</h3>

              <p>
                {searchQuery
                  ? `No products matched "${searchQuery}".`
                  : 'No products were returned by the Product Service.'}
              </p>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-secondary-sm"
                >
                  Clear Search
                </button>
              )}

            </div>
          )}
        </>
      )}

    </div>
  );
}