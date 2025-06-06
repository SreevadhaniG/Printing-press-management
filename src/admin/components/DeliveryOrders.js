import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useDelivery } from '../../context/DeliveryContext';
import { FaDownload } from 'react-icons/fa';
import './DeliveryOrders.css';
import jsPDF from 'jspdf';

const DeliveryOrders = () => {
    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { incrementDeliveryCountAndRevenue } = useDelivery();

    useEffect(() => {
        fetchDeliveryOrders();
    }, []);

    const fetchDeliveryOrders = async () => {
        try {
            const deliveryRef = collection(db, 'out_for_delivery');
            const snapshot = await getDocs(deliveryRef);
            
            const orders = snapshot.docs.map(doc => ({
                id: doc.id, // Ensure we have the document ID
                ...doc.data(),
                pricing: doc.data().pricing || { finalAmount: 0 } // Add fallback for pricing
            }));
            
            setDeliveryOrders(orders);
        } catch (error) {
            console.error('Error fetching delivery orders:', error);
            alert('Failed to fetch delivery orders');
        }
    };

    const handleDelivered = async (order) => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            const success = await incrementDeliveryCountAndRevenue(
                order.orderId,
                order.pricing?.finalAmount || 0
            );

            if (success) {
                setDeliveryOrders(prev => prev.filter(o => o.id !== order.id));
                alert('Order marked as delivered successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to process: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async (order) => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            // Delete from out_for_delivery collection
            const docRef = doc(db, 'out_for_delivery', order.id);
            await deleteDoc(docRef);

            // Update local state
            setDeliveryOrders(prev => prev.filter(o => o.id !== order.id));
            alert('Order cancelled successfully!');
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Failed to cancel order: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const setupPDFDocument = (title) => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text(title, 105, 15, { align: 'center' });
        
        const addFooter = () => {
            doc.setFontSize(8);
            doc.text(`Page ${doc.internal.getNumberOfPages()}`, 105, 290, { align: 'center' });
        };

        return { doc, addFooter };
    };

    const handleDownload = () => {
        try {
            const { doc, addFooter } = setupPDFDocument("Delivery Orders Report");
            
            // Date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 55);

            let yPos = 70;
            deliveryOrders.forEach((order, index) => {
                // Order section header
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. Order Details`, 20, yPos);
                
                // Order information
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`Order ID: ${order.orderId}`, 25, yPos + 7);
                doc.text(`Customer: ${order.customerDetails.email}`, 25, yPos + 14);
                doc.text(`Product: ${order.productDetails.productName}`, 25, yPos + 21);
                doc.text(`Quantity: ${order.productDetails.quantity}`, 25, yPos + 28);
                doc.text(`Status: ${order.status}`, 25, yPos + 35);
                
                yPos += 45;

                if (yPos > 220) {
                    addFooter();
                    doc.addPage();
                    yPos = 20;
                }
            });

            addFooter();
            doc.save(`delivery-orders-${new Date().toLocaleDateString('en-IN')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        }
    };

    return (
        <div className="delivery-page">
            <div className="orders-grid">
                {deliveryOrders.map(order => (
                    <div key={order.id} className="order-card">
                        <h3>Order #{order.orderId}</h3>
                        <div className="order-details">
                            <p><strong>Customer:</strong> {order.customerDetails.email}</p>
                            <p><strong>Product:</strong> {order.productDetails.productName}</p>
                            <p><strong>Quantity:</strong> {order.productDetails.quantity}</p>
                            <p><strong>Amount:</strong> ₹{order.pricing?.finalAmount?.toFixed(2)}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                        </div>
                        <div className="button-group">
                            <button 
                                className="delivery-btn"
                                onClick={() => handleDelivered(order)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Mark as Delivered'}
                            </button>
                            
                        </div>
                    </div>
                ))}
            </div>
            <button className="download-btn" onClick={handleDownload}>
                <FaDownload />
            </button>
        </div>
    );
};

export const moveToDelivery = async (order) => {
    try {
        // Create custom document ID
        const customId = `DEL-${order.orderId}-${Date.now()}`;
        
        // Add to out_for_delivery with custom ID
        await setDoc(doc(db, 'out_for_delivery', customId), {
            ...order,
            movedAt: serverTimestamp(),
            orderStatus: 'out_for_delivery'
        });

        // Delete from orders collection
        await deleteDoc(doc(db, 'orders', order.orderId));

        return customId;
    } catch (error) {
        console.error('Error moving order to delivery:', error);
        throw error;
    }
};

export default DeliveryOrders;