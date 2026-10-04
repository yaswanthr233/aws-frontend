import { API, apiRequest } from '../config/api';

/**
 * Payment Service
 * Talks to Payment Service running on port 5004 (via VITE_PAYMENT_API_URL)
 * Handles simulated payment processing.
 */
export const paymentService = {
  /**
   * Process a simulated payment for an order
   * @param {Object} paymentData
   * @param {string} paymentData.orderId - Order ID
   * @param {string} paymentData.userId - User ID
   * @param {number} paymentData.amount - Payment amount
   * @returns {Promise<Object>} Payment result (transactionId, status, etc.)
   */
  async processPayment({ orderId, userId, amount }) {
    const data = await apiRequest(API.PAYMENT, '/api/payments', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        userId: userId || 'anonymous',
        amount: Number(amount)
      })
    });

    return data?.payment || data?.data || data;
  }
};
