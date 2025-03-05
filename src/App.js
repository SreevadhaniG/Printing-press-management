import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './context/AuthContext'; // Add useAuth import
import Home from "./home";
import AdminHome from "./admin/home";
import Header from './header/Header';
import Login from './login/login';
import Footer from './footer/Footer';
import Product from "./pages/product/Product";
import ProductDescription from './pages/product/ProductDescription';
import Payment from './pages/payment/Payment';

// Protected Route component using imported useAuth
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }

  return children;
};

function Layout() {
  const location = useLocation();
  const noHeaderFooterRoutes = ["/login"]; 

  return (
    <>
      {!noHeaderFooterRoutes.includes(location.pathname) && <Header />}
      <div className="app-container">
        <main className={`content ${noHeaderFooterRoutes.includes(location.pathname) ? 'no-header' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/product" />} />
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/product" element={<Product />} />
            <Route path="/products/:productType" element={<Product />} />
            <Route 
              path="/product/:id/customize" 
              element={
                <ProtectedRoute>
                  <ProductDescription />
                </ProtectedRoute>
              } 
            />
            <Route path="/payment" element={<Payment />} />
          </Routes>
        </main>
        {!noHeaderFooterRoutes.includes(location.pathname) && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
