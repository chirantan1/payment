// server/controllers/paymentController.js
// Contains the logic for handling payment-related operations.
const razorpay = require('../config/razorpayConfig'); // Import the configured Razorpay instance
const crypto = require('crypto'); // Node.js built-in module for cryptographic functionality

// Handler to create a new order with Razorpay
exports.createOrder = async (req, res) => {
    const { amount, currency } = req.body;

    // Basic validation
    if (!amount || !currency) {
        return res.status(400).json({ success: false, message: 'Amount and currency are required.' });
    }

    // Razorpay amounts are in the smallest currency unit (e.g., paise for INR)
    const amountInPaise = Math.round(amount * 100);

    const options = {
        amount: amountInPaise,
        currency: currency,
        receipt: `receipt_${Date.now()}`, // Unique receipt ID for the order
        // You can add more notes or data here if needed
        notes: {
            // Example:
            // userId: req.user.id, // If you have user authentication
            // purpose: 'Product purchase'
        }
    };

    try {
        // Create an order using the Razorpay API
        const order = await razorpay.orders.create(options);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        // Provide more descriptive error for debugging
        let errorMessage = 'Failed to create order.';
        // Check if the error has Razorpay's specific error structure
        if (error.error && error.error.description) {
            errorMessage = `Razorpay Error: ${error.error.description}`;
        } else if (error.message) {
            errorMessage = `An unexpected error occurred: ${error.message}`;
        }
        res.status(500).json({ success: false, message: errorMessage, error: error });
    }
};

// Handler to verify the payment signature from Razorpay
exports.verifyPayment = async (req, res) => {
    const { orderId, paymentId, signature } = req.body;

    // Basic validation
    if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ success: false, message: 'Missing payment verification parameters.' });
    }

    // Construct the payload for signature verification
    // This string is a concatenation of Razorpay Order ID and Payment ID
    const body = orderId + "|" + paymentId;

    // Generate a signature using HMAC-SHA256 algorithm
    // The key for HMAC is your Razorpay Key Secret
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    // Compare the generated signature with the signature received from Razorpay
    const isAuthentic = expectedSignature === signature;

    if (isAuthentic) {
        // Payment is authentic and successful.
        // Here, you would typically update your database to mark the order as paid.
        // For example: await Order.findOneAndUpdate({ razorpayOrderId: orderId }, { status: 'paid', razorpayPaymentId: paymentId });
        console.log(`Payment successful for Order ID: ${orderId}, Payment ID: ${paymentId}`);
        res.status(200).json({ success: true, message: 'Payment verified successfully.' });
    } else {
        // Payment verification failed. This could indicate tampering or an invalid payment.
        console.warn(`Payment verification failed for Order ID: ${orderId}. Invalid signature.`);
        res.status(400).json({ success: false, message: 'Payment verification failed.' });
    }
};

