import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './AppRoutes';
import Header from './header/Header';
import Footer from "./footer/Footer";

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <DeliveryProvider>
                        <div className="app">
                            <AppRoutes />
                        </div>
                    </DeliveryProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;