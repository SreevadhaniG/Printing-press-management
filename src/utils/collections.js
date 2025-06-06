import { addDoc, deleteDoc, doc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const moveToDelivery = async (job) => {
    try {
        // First add to out_for_delivery collection
        const deliveryRef = await addDoc(collection(db, 'out_for_delivery'), {
            ...job,
            movedAt: serverTimestamp(),
            status: 'pending_delivery'
        });

        // Then delete from orders collection
        await deleteDoc(doc(db, 'orders', job.id));

        return true;
    } catch (error) {
        console.error('Error moving to delivery:', error);
        throw error; // Re-throw to handle in calling function
    }
};