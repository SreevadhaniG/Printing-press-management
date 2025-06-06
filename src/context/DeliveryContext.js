import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { deleteDoc, doc, getDocs, query, collection, where } from 'firebase/firestore';

export const DeliveryContext = createContext();

export const DeliveryProvider = ({ children }) => {
    const [deliveredCount, setDeliveredCount] = useState(() => {
        const saved = localStorage.getItem('deliveredCount');
        return saved ? parseInt(saved) : 0;
    });

    const [totalRevenue, setTotalRevenue] = useState(() => {
        const saved = localStorage.getItem('totalRevenue');
        return saved ? parseFloat(saved) : 0;
    });

    const [monthlyRevenue, setMonthlyRevenue] = useState(() => {
        const saved = localStorage.getItem('monthlyRevenue');
        return saved ? JSON.parse(saved) : { previous: 12000, current: 0 }; // Initialize with 12000
    });

    const incrementDeliveryCountAndRevenue = async (orderId, amount) => {
        try {
            const parsedAmount = parseFloat(amount) || 0;

            // Update stats
            const newCount = deliveredCount + 1;
            const newRevenue = totalRevenue + parsedAmount;
            const newMonthly = {
                previous: monthlyRevenue.previous,
                current: monthlyRevenue.current + parsedAmount
            };

            // Update state and localStorage
            setDeliveredCount(newCount);
            setTotalRevenue(newRevenue);
            setMonthlyRevenue(newMonthly);

            localStorage.setItem('deliveredCount', newCount);
            localStorage.setItem('totalRevenue', newRevenue);
            localStorage.setItem('monthlyRevenue', JSON.stringify(newMonthly));

            // Delete using orderId
            const querySnapshot = await getDocs(
                query(collection(db, 'out_for_delivery'), 
                      where('orderId', '==', orderId))
            );
            
            if (!querySnapshot.empty) {
                await deleteDoc(doc(db, 'out_for_delivery', querySnapshot.docs[0].id));
            }

            return true;
        } catch (error) {
            console.error('Error processing delivery:', error);
            return false;
        }
    };

    const value = {
        deliveredCount,
        totalRevenue,
        monthlyRevenue,
        incrementDeliveryCountAndRevenue
    };

    return (
        <DeliveryContext.Provider value={value}>
            {children}
        </DeliveryContext.Provider>
    );
};

export const useDelivery = () => {
    const context = useContext(DeliveryContext);
    if (!context) {
        throw new Error('useDelivery must be used within a DeliveryProvider');
    }
    return context;
};