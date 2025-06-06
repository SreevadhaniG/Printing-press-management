import { 
    collection, 
    addDoc, 
    query, 
    where, 
    getDocs, 
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './config';
  
  export const createOrder = async (orderData, userId) => {
    try {
      const ordersCollection = collection(db, 'orders');
      
      const orderToSave = {
        ...orderData,
        userId,
        createdAt: serverTimestamp(),
        status: 'pending',
        paymentStatus: 'pending'
      };
  
      const docRef = await addDoc(ordersCollection, orderToSave);
      return { 
        id: docRef.id, 
        orderNumber: orderData.orderNumber 
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };
  
  export const getUserOrders = async (userId) => {
    try {
      const ordersCollection = collection(db, 'orders');
      const q = query(ordersCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };
  
  export const getAllOrders = async () => {
    try {
      const ordersCollection = collection(db, 'orders');
      const querySnapshot = await getDocs(ordersCollection);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  };