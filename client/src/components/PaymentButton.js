import React from "react";

const PaymentButton = () => {
  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return new Promise((resolve) => {
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
    });
  };

  const handlePayment = async () => {
    const isLoaded = await loadRazorpay();

    if (!isLoaded) {
      alert("Razorpay SDK failed to load. Check your internet connection.");
      return;
    }

    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
      amount: 50000, // 500.00 INR
      currency: "INR",
      name: "Chirantan Store",
      description: "Test Transaction",
      image: "https://yourlogo.png", // optional
      handler: function (response) {
        alert(`Payment successful. Razorpay Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: {
        name: "Chirantan",
        email: "chirantan@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#0f172a",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
      >
        Pay ₹500
      </button>
    </div>
  );
};

export default PaymentButton;
