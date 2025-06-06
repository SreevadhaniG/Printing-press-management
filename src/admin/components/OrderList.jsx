import React from 'react';

const OrderList = ({ orders }) => {
    return (
        <div className="orders-list">
            {orders.map(order => (
                <div key={order.id} className="order-card">
                    <div className="order-details">
                        <h3>Order #{order.id}</h3>
                        <p>Customer: {order.customerName}</p>
                        <p>Status: {order.status}</p>
                        {order.imageUrl && (
                            <div className="order-image">
                                <img 
                                    src={order.imageUrl} 
                                    alt="Order design" 
                                    style={{ maxWidth: '200px' }}
                                />
                            </div>
                        )}
                    </div>
                    {/* ...other order details... */}
                </div>
            ))}
        </div>
    );
};

export default OrderList;