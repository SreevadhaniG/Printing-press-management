import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiLineChart, BiGroup, BiTask, BiPackage, BiUser } from 'react-icons/bi';
import { FaTruck } from 'react-icons/fa';
import './AdminHeader.css';

const AdminHeader = () => {
    const navigate = useNavigate();

    const navItems = [
        { icon: <BiLineChart />, path: '/admin/dashboard', title: 'Dashboard' },
        { icon: <BiGroup />, path: '/admin/employee', title: 'Employees' },
        { icon: <BiTask />, path: '/admin/job', title: 'Jobs' },
        { icon: <BiPackage />, path: '/admin/orders', title: 'Orders' },
        { icon: <FaTruck />, path: '/admin/delivery', title: 'Delivery' },
        { icon: <BiUser />, path: '/admin/profile', title: 'Profile' }
    ];

    return (
        <header className="admin-header">
            <Link to="/admin" className="logo">Pentagon Printers</Link>
            <nav className="nav-icons">
                {navItems.map((item, index) => (
                    <button
                        key={index}
                        className="nav-icon"
                        onClick={() => navigate(item.path)}
                        title={item.title}
                    >
                        {item.icon}
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default AdminHeader;