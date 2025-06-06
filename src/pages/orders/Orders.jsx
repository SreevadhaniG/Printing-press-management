import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, ORDER_STATUS } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [error, setError] = useState(null);

    // Add this useEffect for scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                const ordersRef = collection(db, 'orders');
                const q = query(
                    ordersRef,
                    where('customerDetails.email', '==', user.email),
                    orderBy('createdAt', 'desc')
                );

                const querySnapshot = await getDocs(q);
                const orderData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate(),
                    updatedAt: doc.data().updatedAt?.toDate()
                }));
                
                setOrders(orderData);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);
    
    if (!user) {
        return <div className="orders-error">Please log in to view your orders</div>;
    }

    if (loading) {
        return <div className="orders-loading">Loading orders...</div>;
    }

    if (error) {
        return <div className="orders-error">{error}</div>;
    }

    if (orders.length === 0) {
        return <div className="orders-empty">No orders found</div>;
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
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

    if (!user) {
        // Directly navigate to login page
        navigate('/login', { state: { from: '/orders' } });
        return null; // Return null while redirecting
    }

    if (loading) {
        return <div className="orders-page loading">Loading orders...</div>;
    }

    if (error) {
        return (
            <div className="orders-page error">
                <h3>Error loading orders: {error}</h3>
                <button 
                    onClick={() => window.location.reload()}
                    className="explore-button"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <h2>My Orders</h2>
            {orders.length > 0 ? (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.orderId}</h3>
                                <span className={`status-badge ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            </div>
                            <div className="order-details">
                                <p><strong>Product:</strong> {order.productDetails.productName}</p>
                                <p><strong>Quantity:</strong> {order.productDetails.quantity}</p>
                                <p><strong>Total Amount:</strong> ₹{order.pricing.finalAmount}</p>
                                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                                <p><strong>Delivery Date:</strong> {new Date(order.customerDetails.deliveryDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-orders-container">
                    <div className="no-orders-content">
                        <img 
                            src="../assets/cart/empty-cart.gif" 
                            alt="No orders"
                            className="no-orders-image"
                        />
                        <h3>No orders yet</h3>
                        <p>Explore our wide range of printing solutions for your business needs</p>
                        <div className="marketing-box">
                            <button 
                                onClick={() => navigate('/product')}
                                className="explore-button"
                            >
                                Start Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;