import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', user.uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(newNotifications);
        });

        return () => unsubscribe();
    }, [user]);

    const removeNotification = async (notificationId) => {
        try {
            await deleteDoc(doc(db, 'notifications', notificationId));
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);