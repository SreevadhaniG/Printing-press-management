import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './ManageOrders.css';
import '../styles/AdminCommon.css';
import { FaDownload } from 'react-icons/fa';
import { setupPDFDocument } from '../../utils/pdfGenerator';
import jsPDF from 'jspdf';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('createdAt', 'desc'));
                const querySnapshot = await getDocs(q);
                
                const orderData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate(),
                    orderStatus: doc.data().orderStatus || 'ordered' // Provide default status
                }));
                
                setOrders(orderData);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        if (!status) return 'status-ordered';
        
        switch (status.toLowerCase()) {
            case 'ordered':
                return 'status-ordered';
            case 'processing':
                return 'status-processing';
            case 'out_for_delivery':
                return 'status-shipping';
            case 'delivered':
                return 'status-delivered';
            default:
                return 'status-ordered';
        }
    };

    const handleDownload = () => {
        try {
            const { doc, addFooter } = setupPDFDocument("Orders Report");

            let yPos = 60;
            orders.forEach((order, index) => {
                // Order header
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`Order #${index + 1}`, 20, yPos);
                
                // Order details
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`Order ID: ${order.orderId}`, 25, yPos + 7);
                doc.text(`Customer: ${order.customerDetails.email}`, 25, yPos + 14);
                doc.text(`Product: ${order.productDetails.productName}`, 25, yPos + 21);
                doc.text(`Quantity: ${order.productDetails.quantity}`, 25, yPos + 28);
                doc.text(`Amount: ₹${order.pricing.finalAmount.toFixed(2)}`, 25, yPos + 35);
                doc.text(`Status: ${order.status}`, 25, yPos + 42);
                doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 25, yPos + 49);
                
                yPos += 60;

                // Add new page if needed
                if (yPos > 250) {
                    addFooter();
                    doc.addPage();
                    yPos = 20;
                }
            });

            addFooter();
            doc.save(`orders-report-${new Date().toLocaleDateString('en-IN')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        }
    };

    if (loading) return <div className="orders-loading">Loading orders...</div>;
    if (error) return <div className="orders-error">{error}</div>;

    return (
        <div className="admin-page manage-orders">
            <h2>Manage Orders</h2>
            <div className="admin-grid">
                {orders.map(order => (
                    <div key={order.id} className="admin-card order-card">
                        <div className="order-header">
                            <h3>Order #{order.orderId || order.id}</h3>
                            <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus ? order.orderStatus.replace(/_/g, ' ').toUpperCase() : 'ORDERED'}
                            </span>
                        </div>
                        <div className="order-details">
                            <p><strong>Customer:</strong> {order.customerDetails?.name || 'N/A'}</p>
                            <p><strong>Email:</strong> {order.customerDetails?.email || 'N/A'}</p>
                            <p><strong>Product:</strong> {order.productDetails?.productName || 'N/A'}</p>
                            <p><strong>Quantity:</strong> {order.productDetails?.quantity || 0}</p>
                            <p><strong>Amount:</strong> ₹{order.pricing?.finalAmount || 0}</p>
                            <p><strong>Order Date:</strong> {order.createdAt?.toLocaleDateString() || 'N/A'}</p>
                            <p><strong>Delivery Date:</strong> {
                                order.customerDetails?.deliveryDate ? 
                                new Date(order.customerDetails.deliveryDate).toLocaleDateString() : 
                                'N/A'
                            }</p>
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

export default ManageOrders;