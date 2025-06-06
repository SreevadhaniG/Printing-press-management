import { collection, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const moveToDelivery = async (order) => {
    try {
        // Add to out_for_delivery collection
        const deliveryRef = await addDoc(collection(db, 'out_for_delivery'), {
            ...order,
            movedAt: serverTimestamp(),
            orderStatus: 'out_for_delivery'
        });

        // Update order status in orders collection
        await updateDoc(doc(db, 'orders', order.orderId), {
            orderStatus: 'out_for_delivery',
            updatedAt: serverTimestamp()
        });

        return deliveryRef.id;
    } catch (error) {
        console.error('Error moving order to delivery:', error);
        throw error;
    }
};

export const completeOrder = async (order) => {
    try {
        // Update order status to completed
        await updateDoc(doc(db, 'orders', order.id), {
            orderStatus: 'completed',
            completedAt: serverTimestamp()
        });

        // Move to delivery
        return await moveToDelivery(order);
    } catch (error) {
        console.error('Error completing order:', error);
        throw error;
    }
};

export const storeOrder = async (orderData) => {
    try {
        const orderRef = await addDoc(collection(db, 'orders'), {
            ...orderData,
            assignedEmployees: [], // Initialize empty array for employee assignments
            orderStatus: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return orderRef.id;
    } catch (error) {
        console.error('Error storing order:', error);
        throw error;
    }
};