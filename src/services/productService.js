import { API, apiRequest } from '../config/api';

/**
 * Product Service
 * Talks to Product Service running on port 5002 (via VITE_PRODUCT_API_URL)
 */
export const productService = {
  /**
   * Fetch all products from Product Service
   * @returns {Promise<Array>} List of products
   */
  async getProducts() {
    const data = await apiRequest(API.PRODUCT, '/api/products', {
      method: 'GET'
    });

    // Support both direct array response and object wrapped response { products: [...] } or { data: [...] }
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.products)) {
      return data.products;
    }
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  },

  /**
   * Fetch single product details by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product details
   */
  async getProductById(id) {
    const data = await apiRequest(API.PRODUCT, `/api/products/${id}`, {
      method: 'GET'
    });
    return data?.product || data?.data || data;
  }
};
