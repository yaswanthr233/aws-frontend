import { API, apiRequest } from '../config/api';

/**
 * Order Service
 * Talks to Order Service running on port 5003 (via VITE_ORDER_API_URL)
 * All endpoints require JWT authentication.
 */
export const orderService = {
  /**
   * Create a new order with items
   * @param {Array<{productId: string, quantity: number}>} items
   * @param {Object} [extraDetails={}] - Optional extra info like totalAmount, shippingAddress
   * @returns {Promise<Object>} Created order
   */
  async createOrder(items, extraDetails = {}) {
    const payload = {
      items: items.map(item => ({
        productId: item.productId || item.id || item._id,
        quantity: item.quantity
      })),
      ...extraDetails
    };

    const data = await apiRequest(API.ORDER, '/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return data?.order || data?.data || data;
  },

  /**
   * Fetch current user's orders
   * @returns {Promise<Array>} List of orders
   */
  async getOrders() {
    const data = await apiRequest(API.ORDER, '/api/orders', {
      method: 'GET'
    });

    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.orders)) {
      return data.orders;
    }
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  },

  /**
   * Fetch single order details by ID
   * @param {string} id - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(id) {
    const data = await apiRequest(API.ORDER, `/api/orders/${id}`, {
      method: 'GET'
    });

    return data?.order || data?.data || data;
  }
};
