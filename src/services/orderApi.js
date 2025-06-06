import axios from 'axios';

const API_BASE_URL = 'YOUR_API_BASE_URL';

export const orderApi = {
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/orders`, orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};