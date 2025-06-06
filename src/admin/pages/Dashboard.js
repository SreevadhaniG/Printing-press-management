import React, { useState, useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { FaDownload } from 'react-icons/fa';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useDelivery } from '../../context/DeliveryContext';
import { setupPDFDocument } from '../../utils/pdfGenerator'; // Add this import
import jsPDF from 'jspdf';
import '../styles/AdminCommon.css';
import './Dashboard.css';

// Import and register required chart.js components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const PRODUCTS = [
    'Home Decor', 'Albums', 'Crystal Items', 'Shirts',
    'Photo Frames', 'Card', 'Cushions', 'Notebooks'
];

const Dashboard = () => {
    const { deliveredCount, totalRevenue, monthlyRevenue } = useDelivery();

    // Add null check when accessing monthlyRevenue
    const previousMonthRevenue = monthlyRevenue?.previous || 0;
    const currentMonthRevenue = monthlyRevenue?.current || 0;
    const growthRate = previousMonthRevenue ? 
        ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;
    
    // Calculate monthly growth
    const monthlyGrowth = monthlyRevenue.previous > 0 
        ? ((monthlyRevenue.current - monthlyRevenue.previous) / monthlyRevenue.previous * 100).toFixed(1)
        : 0;
    
    const [chartData, setChartData] = useState({
        dailyOrders: null,
        productOrders: null
    });

    const [deliveryStats, setDeliveryStats] = useState({
        total: 0,
        last30Days: 0
    });

    // Calculate revenue growth
    const calculateRevenueGrowth = () => {
        if (!monthlyRevenue.previous) return 0;
        return ((monthlyRevenue.current - monthlyRevenue.previous) / monthlyRevenue.previous * 100).toFixed(1);
    };

    // Store revenue growth in a variable
    const revenueGrowth = calculateRevenueGrowth();

    const lineChartRef = useRef(null);
    const barChartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                
                // Process orders for charts
                const orders = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate()
                })).filter(order => order.createdAt);

                // Update chart data
                updateChartData(orders);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        // Set up real-time listener for new orders
        const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
            fetchData();
        });

        fetchData();

        // Cleanup listener
        return () => unsubscribe();
    }, []);

    const updateChartData = (orders) => {
        // Get current month's date range
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Initialize daily counts
        const dailyOrderCounts = {};
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            dailyOrderCounts[d.toLocaleDateString()] = 0;
        }

        // Initialize product counts
        const productCounts = PRODUCTS.reduce((acc, product) => ({
            ...acc,
            [product]: 0
        }), {});

        // Process orders
        orders.forEach(order => {
            if (order.createdAt >= firstDay && order.createdAt <= lastDay) {
                const orderDate = order.createdAt.toLocaleDateString();
                dailyOrderCounts[orderDate] = (dailyOrderCounts[orderDate] || 0) + 1;
                
                const productName = order.productDetails.productName;
                if (PRODUCTS.includes(productName)) {
                    productCounts[productName] += 1;
                }
            }
        });

        setChartData({
            dailyOrders: {
                labels: Object.keys(dailyOrderCounts),
                datasets: [{
                    label: 'Daily Orders',
                    data: Object.values(dailyOrderCounts),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            productOrders: {
                labels: PRODUCTS,
                datasets: [{
                    label: 'Orders by Product',
                    data: Object.values(productCounts),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)',
                        'rgba(199, 199, 199, 0.5)',
                        'rgba(83, 102, 255, 0.5)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    };

    const fetchDeliveryStats = async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const ordersRef = collection(db, 'orders');
            const q = query(
                ordersRef,
                where('orderStatus', '==', 'delivered'),
                where('updatedAt', '>=', thirtyDaysAgo),
                orderBy('updatedAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            setDeliveryStats({
                total: querySnapshot.size,
                last30Days: querySnapshot.docs.filter(doc => 
                    doc.data().updatedAt?.toDate() >= thirtyDaysAgo
                ).length
            });
        } catch (error) {
            console.error('Error fetching delivery stats:', error);
        }
    };

    useEffect(() => {
        fetchDeliveryStats();
    }, []);

    const getTotalOrders = () => {
        return chartData.dailyOrders ? chartData.dailyOrders.datasets[0].data.reduce((a, b) => a + b, 0) : 0;
    };

    const getMostPopularProduct = () => {
        if (!chartData.productOrders) return '';
        const maxOrders = Math.max(...chartData.productOrders.datasets[0].data);
        const index = chartData.productOrders.datasets[0].data.indexOf(maxOrders);
        return chartData.productOrders.labels[index];
    };

    const getPeakOrderDay = () => {
        if (!chartData.dailyOrders) return '';
        const maxOrders = Math.max(...chartData.dailyOrders.datasets[0].data);
        const index = chartData.dailyOrders.datasets[0].data.indexOf(maxOrders);
        return chartData.dailyOrders.labels[index];
    };

    const getAverageOrders = () => {
        if (!chartData.dailyOrders) return 0;
        const totalOrders = getTotalOrders();
        return (totalOrders / chartData.dailyOrders.labels.length).toFixed(2);
    };

    const handleDownload = () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Set font to Times New Roman
            doc.setFont("times", "normal");
            
            // Header
            doc.setFontSize(24);
            doc.setTextColor(0, 0, 0);
            doc.text("Pentagon Printers", pageWidth/2, 20, { align: "center" });
            
            // Line under header
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(20, 25, pageWidth-20, 25);

            // Title & Date
            doc.setFontSize(16);
            doc.text("Monthly Analytics Report", pageWidth/2, 40, { align: "center" });
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth/2, 50, { align: "center" });

            // Statistics Section with more spacing
            doc.setFontSize(14);
            doc.setFont("times", "bold");
            doc.text("Key Metrics", 20, 70);

            // Highlight box for key metrics
            doc.setFillColor(245, 245, 245);
            doc.rect(20, 75, pageWidth-40, 45, 'F');
            
            doc.setFont("times", "normal");
            doc.setFontSize(12);
            doc.text(`Total Orders Delivered: ${deliveredCount}`, 30, 85);
            doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`, 30, 95);
            doc.text(`Monthly Growth: ${monthlyGrowth}%`, 30, 105);

            // Daily Orders Trend
            doc.setFont("times", "bold");
            doc.setFontSize(14);
            doc.text("Daily Orders Trend", 20, 140);

            // Add line chart
            const lineChartCanvas = document.querySelector('.chart-container canvas');
            if (lineChartCanvas) {
                doc.addImage(lineChartCanvas.toDataURL(), 'PNG', 20, 150, pageWidth-40, 80);
            }

            // Summary with spacing
            doc.text("Monthly Summary", 20, 250);
            doc.setFont("times", "normal");
            doc.setFontSize(12);
            const summary = [
                `Most Popular Product: ${getMostPopularProduct()}`,
                `Total Monthly Orders: ${getTotalOrders()}`,
                `Average Daily Orders: ${getAverageOrders()}`
            ];
            doc.text(summary, 25, 260);

            // Footer on each page
            const pageCount = doc.internal.getNumberOfPages();
            for(let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFont("times", "normal");
                doc.setFontSize(8);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth/2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: "center" }
                );
            }

            doc.save(`pentagon-analytics-${new Date().toLocaleDateString('en-IN')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('Monthly Performance Report', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 30);

        // Monthly Summary
        doc.setFontSize(14);
        doc.text('Monthly Summary', 20, 45);
        
        doc.setFontSize(12);
        doc.text([
            `Total Revenue: ₹${totalRevenue.toFixed(2)}`,
            `Orders Delivered: ${deliveredCount}`,
            `Monthly Growth: ${monthlyGrowth}%`
        ], 25, 60);

        // Revenue Chart
        if (lineChartRef.current) {
            const canvas = lineChartRef.current.canvas;
            const imgData = canvas.toDataURL('image/png');
            doc.addImage(imgData, 'PNG', 20, 90, 170, 80);
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text(
                `Page ${i} of ${pageCount}`,
                doc.internal.pageSize.width / 2,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        doc.save(`monthly-report-${new Date().toLocaleDateString('en-IN')}.pdf`);
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 10,
                ticks: { stepSize: 1 }
            }
        },
        plugins: {
            legend: {
                position: 'top'
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 15,
                ticks: { stepSize: 1 }
            }
        },
        plugins: {
            legend: {
                position: 'top'
            }
        }
    };

    return (
        <div className="dashboard">
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-value">{deliveredCount}</div>
                    <div className="stat-label">Orders Delivered</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
                    <div className="stat-label">Total Revenue</div>
                </div>
                <div className={`stat-card ${Number(revenueGrowth) >= 0 ? 'positive' : 'negative'}`}>
                    <div className="stat-value">{revenueGrowth}%</div>
                    <div className="stat-label">Monthly Growth</div>
                </div>
            </div>
            
            <div className="charts-grid">
                <div className="chart-container large">
                    <h3 className="chart-title">Daily Orders Trend</h3>
                    {chartData.dailyOrders && (
                        <Line ref={lineChartRef} data={chartData.dailyOrders} options={lineChartOptions} />
                    )}
                </div>
                
                <div className="chart-container large">
                    <h3 className="chart-title">Popular Products</h3>
                    {chartData.productOrders && (
                        <Bar ref={barChartRef} data={chartData.productOrders} options={barChartOptions} />
                    )}
                </div>
            </div>

            <button className="download-btn" onClick={handleDownload} title="Download Report">
                <FaDownload />
            </button>
        </div>
    );
};

export default Dashboard;
