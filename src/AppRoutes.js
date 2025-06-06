import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './login/login';
import Dashboard from './admin/pages/Dashboard';
import EmployeeManagement from './admin/pages/EmployeeManagement';
import JobScheduler from './admin/components/JobScheduler';
import ManageOrders from './admin/pages/ManageOrders';
import DeliveryOrders from './admin/components/DeliveryOrders';
import AdminProfile from './admin/pages/AdminProfile';
import Product from "./pages/product/Product";
import ProductDescription from './pages/product/ProductDescription';
import Payment from './pages/payment/Payment';
import Orders from './pages/orders/Orders';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/login" element={<Login />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
                <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
                <Route path="/admin/employee" element={<PrivateRoute adminOnly><EmployeeManagement /></PrivateRoute>} />
                <Route path="/admin/job" element={<PrivateRoute adminOnly><JobScheduler /></PrivateRoute>} />
                <Route path="/admin/orders" element={<PrivateRoute adminOnly><ManageOrders /></PrivateRoute>} />
                <Route path="/admin/delivery" element={<PrivateRoute adminOnly><DeliveryOrders /></PrivateRoute>} />
                <Route path="/admin/profile" element={<PrivateRoute adminOnly><AdminProfile /></PrivateRoute>} />

                {/* User Routes */}
                <Route path="/" element={<Product />} />
                <Route path="/product" element={<Product />} />
                <Route path="/products/:productType" element={<Product />} />
                <Route path="/product/:id/customize" element={<ProductDescription />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/orders" element={<Orders />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;