import React, { createContext, useContext } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const calculateDaysLeft = (deliveryDate) => {
        const today = new Date();
        const due = new Date(deliveryDate);
        return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    };

    const placeOrder = async (orderData) => {
        try {
            // Add order to Firestore
            const orderRef = await addDoc(collection(db, 'orders'), {
                ...orderData,
                createdAt: serverTimestamp(),
                status: 'pending'
            });

            // Call job scheduling API
            const response = await fetch('https://job-scheduling-api.onrender.com/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    days_left: calculateDaysLeft(orderData.customerDetails.deliveryDate),
                    quantity: orderData.productDetails.quantity,
                    workforce: 5
                })
            });

            const { priority } = await response.json();

            // Update order with assigned priority
            await updateDoc(doc(db, 'orders', orderRef.id), {
                assignedPriority: priority
            });

            return orderRef.id;
        } catch (error) {
            console.error('Error placing order:', error);
            throw error;
        }
    };

    return (
        <OrderContext.Provider value={{ placeOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => useContext(OrderContext);