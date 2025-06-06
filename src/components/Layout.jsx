import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import AdminHeader from '../admin/components/AdminHeader';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');
  const noHeaderFooterRoutes = ["/login"];
  const showHeaderFooter = !noHeaderFooterRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      {isAdminRoute ? (
        <AdminHeader />
      ) : (
        showHeaderFooter && <Header />
      )}
      <main className={`content ${isAdminRoute ? 'admin' : ''}`}>
        <Outlet />
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default Layout;