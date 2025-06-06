import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Payment.css';
import { db, ORDER_STATUS, generateOrderId } from '../../firebase/config'; // Import Firestore configuration
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PDFDocument, rgb } from '@react-pdf/renderer';
import jsPDF from 'jspdf';
import letterhead from './letterhead.png';
import { loadScript } from '../../utils/loadScript';

const CURRENT_USER = "Sree";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [finalPricing, setFinalPricing] = useState({
    baseAmount: 0,
    gstAmount: 0,
    finalAmount: 0
  });

  useEffect(() => {
    // First check location state
    if (location.state?.formData) {
      const { formData } = location.state;
      setOrderData(formData);
      setOrderNumber(generateOrderNumber());
      return;
    }

    // Fallback to localStorage
    const savedData = localStorage.getItem('pricingInfo');
    if (!savedData) {
      navigate('/product');
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);
      setOrderData(parsedData);
      setOrderNumber(generateOrderNumber());
    } catch (error) {
      console.error('Error parsing order data:', error);
      navigate('/product');
    }
  }, [navigate, location.state]);

  useEffect(() => {
    if (orderData?.pricing?.totalPrice) {
      const baseAmount = Number(orderData.pricing.totalPrice);
      const gstAmount = baseAmount * 0.18;
      const finalAmount = baseAmount + gstAmount;

      setFinalPricing({
        baseAmount,
        gstAmount,
        finalAmount
      });
    }
  }, [orderData]);

  const calculatePrices = (totalPrice) => {
    const gstAmount = totalPrice * 0.18;
    const finalAmount = totalPrice + gstAmount;

    return {
      baseAmount: totalPrice,
      gstAmount,
      finalAmount
    };
  };

  const generateOrderNumber = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${year}${month}-${random}`;
  };

  const generatePDF = (orderDoc) => {
    const doc = new jsPDF();
    
    // Add Logo/Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 128); // Navy Blue
    doc.text("Pentagon Printers", 105, 20, { align: "center" });
    
    // Add line under header
    doc.setDrawColor(0, 0, 128);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Bill Details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", 105, 40, { align: "center" });

    // Order Details
    doc.setFontSize(10);
    doc.text(`Order ID: ${orderDoc.orderId}`, 20, 55);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 20, 62);
    doc.text(`Customer: ${user?.email}`, 20, 69);

    // Product Details
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Product Details", 20, 85);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Product: ${orderDoc.productDetails.productName}`, 25, 95);
    doc.text(`Title: ${orderDoc.productDetails.title}`, 25, 102);
    doc.text(`Size: ${orderDoc.productDetails.size}`, 25, 109);
    doc.text(`Quantity: ${orderDoc.productDetails.quantity}`, 25, 116);
    
    if (orderDoc.productDetails.description) {
        doc.text(`Description: ${orderDoc.productDetails.description}`, 25, 123);
    }

    // Delivery Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Delivery Details", 20, 140);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Contact: ${orderDoc.customerDetails.contact}`, 25, 150);
    doc.text(`Address: ${orderDoc.customerDetails.address}`, 25, 157);
    doc.text(`Delivery Date: ${new Date(orderDoc.customerDetails.deliveryDate).toLocaleDateString('en-IN')}`, 25, 164);

    // Price Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Price Details", 20, 185);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Base Amount:", 25, 195);
    doc.text(`₹${orderDoc.pricing.baseAmount.toFixed(2)}`, 150, 195);
    
    doc.text("GST (18%):", 25, 202);
    doc.text(`₹${orderDoc.pricing.gstAmount.toFixed(2)}`, 150, 202);
    
    // Total Amount (Highlighted)
    doc.setFillColor(255, 255, 0); // Yellow highlight
    doc.rect(20, 208, 175, 8, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 25, 214);
    doc.text(`₹${orderDoc.pricing.finalAmount.toFixed(2)}`, 150, 214);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Thank you for your business!", 105, 240, { align: "center" });
    doc.text("For any queries, please contact:", 105, 245, { align: "center" });
    doc.text("Phone: +91 93632 02424 | Email: info@pentagonprinters.com", 105, 250, { align: "center" });

    return doc;
};

const initializeRazorpay = async (orderDoc) => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

    if (!res) {
        alert('Razorpay SDK failed to load');
        return;
    }

    const options = {
        key: 'rzp_test_WVLBm3gHT6NJGH',
        amount: Math.round(finalPricing.finalAmount * 100), // Convert to paise
        currency: 'INR',
        name: 'Pentagon Printers',
        description: `Order ${orderNumber}`,
        handler: function (response) {
            const updatedOrderDoc = {
                ...orderDoc,
                pricing: finalPricing,
                orderId: orderNumber
            };
            handlePaymentSuccess(response, updatedOrderDoc);
        },
        prefill: {
            name: user?.displayName || '',
            email: user?.email || '',
            contact: orderDoc.customerDetails.contact
        },
        theme: {
            color: '#000'
        }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
};

const handlePaymentSuccess = async (response, orderDoc) => {
    try {
        // Save order to Firestore
        const ordersRef = collection(db, 'orders');
        const docRef = await addDoc(ordersRef, {
            ...orderDoc,
            paymentDetails: {
                razorpayPaymentId: response.razorpay_payment_id,
                paymentStatus: 'completed',
                paidAt: serverTimestamp()
            }
        });

        // Generate and download PDF
        const pdf = generatePDF(orderDoc);
        pdf.save(`Pentagon_Printers_Order_${orderDoc.orderId}.pdf`);

        localStorage.removeItem('pricingInfo');
        navigate('/orders');
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Payment successful but order processing failed. Please contact support.');
    }
};

const handlePlaceOrder = async () => {
    try {
        setIsSubmitting(true);

        // Create orderDoc directly from orderData and finalPricing
        const orderDoc = {
            productDetails: orderData.productDetails,
            customerDetails: orderData.customerDetails,
            pricing: finalPricing, // Use the calculated finalPricing
            orderStatus: ORDER_STATUS.ORDERED,
            orderId: orderNumber, // Use the generated orderNumber
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        await initializeRazorpay(orderDoc);
    } catch (error) {
        console.error('Failed to process order:', error);
        alert('Failed to process order. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
};

  const pricing = calculatePrices(orderData?.totalPrice || 0);


  return (
    <div className="payment-container">
      <div className="bill-summary">
        <h2>Order Summary</h2>
        
        <div className="order-details">
          <div className="detail-row">
            <span className="label">Order Number:</span>
            <span className="value">{orderNumber}</span>
          </div>
          <div className="detail-row">
            <span className="label">Order Date:</span>
            <span className="value">
              {new Date().toLocaleString('en-IN')}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Customer:</span>
            <span className="value">{user?.email || CURRENT_USER}</span>
          </div>
          <div className="detail-row">
            <span className="label">Product:</span>
            <span className="value">{orderData?.productDetails?.productName}</span>
          </div>
          <div className="detail-row">
            <span className="label">Title:</span>
            <span className="value">{orderData?.productDetails?.title}</span>
          </div>
          <div className="detail-row">
            <span className="label">Size:</span>
            <span className="value">{orderData?.productDetails?.size}</span>
          </div>
          <div className="detail-row">
            <span className="label">Quantity:</span>
            <span className="value">{orderData?.productDetails?.quantity}</span>
          </div>
          {orderData?.productDetails?.description && (
            <div className="detail-row">
              <span className="label">Description:</span>
              <span className="value">{orderData.productDetails.description}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="label">Delivery Date:</span>
            <span className="value">
              {orderData?.customerDetails?.deliveryDate && 
               new Date(orderData.customerDetails.deliveryDate).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Contact:</span>
            <span className="value">{orderData?.customerDetails?.contact}</span>
          </div>
          <div className="detail-row">
            <span className="label">Address:</span>
            <span className="value">{orderData?.customerDetails?.address}</span>
          </div>
        </div>

        <div className="price-breakdown">
          <h3>Price Details</h3>
          <div className="price-row">
            <span>Base Amount:</span>
            <span>₹{finalPricing.baseAmount.toFixed(2)}</span>
          </div>
          <div className="price-row">
            <span>GST (18%):</span>
            <span>₹{finalPricing.gstAmount.toFixed(2)}</span>
          </div>
          <div className="price-row total">
            <span>Total Amount:</span>
            <span>₹{finalPricing.finalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="disclaimer">
          <p>
            <strong>Important Notice:</strong>
            <br />
            By clicking 'Place Order', you acknowledge that:
            <br />
            1. The order cannot be cancelled online once placed
            <br />
            2. For any queries or support, please contact:
            <br />
            Phone: +91 93632 02424
            <br />
            Email: info@pentagonprinters.com
          </p>
        </div>

        <button 
          className="payment-button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Place Order'}
        </button>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Order</h3>
            <p>Total Amount: ₹{finalPricing.finalAmount.toFixed(2)}</p>
            <p>Would you like to proceed with the payment?</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={() => {
                  setShowConfirmModal(false);
                  handlePlaceOrder();
              }}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;