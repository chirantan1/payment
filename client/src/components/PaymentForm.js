import React, { useState } from 'react';
import { createOrder, verifyPayment } from '../services/paymentService';

const PaymentForm = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(null);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setMessage('');
        setIsSuccess(null);

        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setMessage('Please enter a valid amount.');
            setIsSuccess(false);
            return;
        }

        setLoading(true);

        try {
            const orderResponse = await createOrder({
                amount: parseFloat(amount),
                currency: 'INR',
            });

            if (!orderResponse.success) {
                setMessage(`Error creating order: ${orderResponse.message}`);
                setIsSuccess(false);
                setLoading(false);
                return;
            }

            const { orderId } = orderResponse;

            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                setMessage('Razorpay SDK failed to load. Are you connected to the internet?');
                setIsSuccess(false);
                setLoading(false);
                return;
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_NoC8Bfi6L3v0ch',
                amount: orderResponse.amount,
                currency: orderResponse.currency,
                name: 'Payment Gateway Demo',
                description: 'Test Transaction',
                order_id: orderId,
                handler: async function (response) {
                    try {
                        const verificationResponse = await verifyPayment({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        });

                        if (verificationResponse.success) {
                            setMessage('Payment successful and verified!');
                            setIsSuccess(true);
                        } else {
                            setMessage(`Payment verification failed: ${verificationResponse.message}`);
                            setIsSuccess(false);
                        }
                    } catch (error) {
                        console.error('Error during payment verification:', error);
                        setMessage('An error occurred during payment verification.');
                        setIsSuccess(false);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    contact: '9999999999',
                },
                notes: {
                    address: 'Razorpay Corporate Office',
                },
                theme: {
                    color: '#3399CC',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                console.error('Razorpay payment failed:', response);
                setMessage(`Payment failed: ${response.error.description || 'Unknown error'}`);
                setIsSuccess(false);
                setLoading(false);
            });
            rzp.open();

        } catch (error) {
            console.error('Error initiating payment:', error);
            setMessage(`Failed to initiate payment: ${error.message}`);
            setIsSuccess(false);
            setLoading(false);
        }
    };

    return (
        <div className="payment-form p-4 border border-gray-200 rounded-md">
            <div className="mb-4">
                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                    Amount (INR):
                </label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    min="1"
                    step="0.01"
                    disabled={loading}
                />
            </div>
            <button
                onClick={handlePayment}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>

            {message && (
                <div
                    className={`mt-4 p-3 rounded-md text-center text-sm ${
                        isSuccess === true
                            ? 'bg-green-100 text-green-800'
                            : isSuccess === false
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                    role="alert"
                >
                    {message}
                </div>
            )}

            <p className="mt-6 text-xs text-gray-500 text-center">
                Note: For a real-world application, ensure secure API key handling,
                user authentication, and robust error logging.
            </p>
        </div>
    );
};

export default PaymentForm;
