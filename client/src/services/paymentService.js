import axios from 'axios';

// Updated backend URL
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://payment-rrmv.onrender.com/api/payment';

export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-order`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error creating order:', error.response ? error.response.data : error.message);
        return { success: false, message: error.response?.data?.message || 'Failed to connect to server.' };
    }
};

export const verifyPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/verify-payment`, paymentData);
        return response.data;
    } catch (error) {
        console.error('Error verifying payment:', error.response ? error.response.data : error.message);
        return { success: false, message: error.response?.data?.message || 'Failed to connect to server.' };
    }
};
