import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const savedData = localStorage.getItem('pricingInfo');
  
    // Redirect only if order data is missing, but not on refresh
    if (!savedData) {
      navigate('/product', { replace: true }); // Redirect to a more relevant page instead of product-description
      return;
    }
  
    setOrderData(JSON.parse(savedData));
  }, [navigate]);
  

  // Add cleanup on unmount
  useEffect(() => {
    return () => localStorage.removeItem('orderFormData');
  }, []);

  if (!orderData) return null;

  const { formData, totalPrice, productName } = orderData;
  const gstAmount = totalPrice * 0.18;
  const finalAmount = totalPrice + gstAmount;


  return (
    <div className="payment-container">
      <div className="bill-summary">
        <h2>Order Summary</h2>
        <div className="order-details">
          <p><strong>Product:</strong> {productName}</p>
          <p><strong>Title:</strong> {formData.title}</p>
          <p><strong>Size:</strong> {formData.size}</p>
          <p><strong>Quantity:</strong> {formData.quantity}</p>
          {formData.sampleDesign && (
            <p><strong>Sample Design:</strong> Included (+₹0.50 per unit)</p>
          )}
        </div>

        <div className="price-breakdown">
          <div className="price-row">
            <span>Base Amount:</span>
            <span>₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>GST (18%):</span>
            <span>₹{gstAmount.toFixed(2)}</span>
          </div>
          <div className="price-row total">
            <span>Total Amount:</span>
            <span>₹{finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button 
          className="payment-button"
        >
          Order through Whatsapp
        </button>
      </div>
    </div>
  );
};

export default Payment;