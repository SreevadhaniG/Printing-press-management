import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import { setupPDFDocument } from '../../utils/pdfGenerator'; // Add this import
import './JobScheduler.css';
import { moveToDelivery } from '../../utils/collections';

const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - today;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

const JobScheduler = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const ordersRef = collection(db, 'orders');
            const snapshot = await getDocs(ordersRef);
            const jobsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    jobId: data.orderId || 'N/A',
                    product: data.productDetails?.productName || 'N/A',
                    quantity: data.productDetails?.quantity || 'N/A',
                    customer: data.customerDetails?.email || 'N/A',
                    dueDate: data.customerDetails?.deliveryDate || 'N/A',
                    status: data.orderStatus || 'pending',
                    // Check if assignedEmployees field exists
                    hasAssignedEmployees: 'assignedEmployees' in data,
                    assignedEmployees: data.assignedEmployees || []
                };
            });
            setJobs(jobsData);

            // Get available employees
            const employeesRef = collection(db, 'employees');
            const employeesSnapshot = await getDocs(employeesRef);
            const today = new Date().toISOString().split('T')[0];
            
            const availableEmployees = employeesSnapshot.docs
                .filter(doc => doc.data().attendance?.[today] === 'present')
                .map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));

            // Check for jobs without assignedEmployees field
            if (availableEmployees.length > 0) {
                for (const job of jobsData) {
                    if (!job.hasAssignedEmployees) {
                        await assignJobToEmployee(job, availableEmployees);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (jobId) => {
        try {
            const job = jobs.find(j => j.id === jobId);
            const newStatus = job.status === 'pending' ? 'in_progress' : 'out_for_delivery';
            
            if (newStatus === 'out_for_delivery') {
                // Move to delivery and remove from jobs
                const success = await moveToDelivery(job);
                if (success) {
                    setJobs(prev => prev.filter(j => j.id !== jobId));
                }
            } else {
                // Just update status
                await updateDoc(doc(db, 'orders', jobId), {
                    orderStatus: newStatus,
                    updatedAt: new Date()
                });

                setJobs(prev => prev.map(j => 
                    j.id === jobId ? {...j, status: newStatus} : j
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const assignJobToEmployee = async (job, availableEmployees) => {
        try {
            const response = await fetch('https://job-scheduling-api.onrender.com/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    days_left: calculateDaysLeft(job.dueDate),
                    quantity: parseInt(job.quantity),
                    workforce: availableEmployees.length
                })
            });

            const { priority } = await response.json();
            
            // Assign employees based on priority (1-5)
            const employeesNeeded = Math.min(Math.ceil(priority / 2), availableEmployees.length);
            const assignedEmployees = availableEmployees
                .slice(0, employeesNeeded)
                .map(emp => emp.name);

            // Update order with assignedEmployees field
            await updateDoc(doc(db, 'orders', job.id), {
                assignedEmployees: assignedEmployees,
                lastAssignedAt: serverTimestamp()
            });

            // Update local state
            setJobs(prev => prev.map(j => 
                j.id === job.id 
                    ? { 
                        ...j, 
                        hasAssignedEmployees: true,
                        assignedEmployees: assignedEmployees 
                    }
                    : j
            ));
        } catch (error) {
            console.error('Error assigning job:', error);
        }
    };

    const handleDownload = () => {
        try {
            const { doc, addFooter } = setupPDFDocument("Production Schedule Report");
            
            // Date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 55);

            let yPos = 75;
            jobs.forEach((job, index) => {
                // Job section header
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. Job Details`, 20, yPos);
                
                // Job information
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`Job ID: ${job.jobId}`, 25, yPos + 7);
                doc.text(`Product: ${job.product}`, 25, yPos + 14);
                doc.text(`Customer: ${job.customer}`, 25, yPos + 21);
                doc.text(`Quantity: ${job.quantity}`, 25, yPos + 28);
                doc.text(`Due Date: ${new Date(job.dueDate).toLocaleDateString('en-IN')}`, 25, yPos + 35);
                doc.text(`Status: ${job.status}`, 25, yPos + 42);
                doc.text(`Assigned Employees: ${job.assignedEmployees.join(', ')}`, 25, yPos + 48);
                
                yPos += 60;

                if (yPos > 220) {
                    addFooter();
                    doc.addPage();
                    yPos = 20;
                }
            });

            addFooter();
            doc.save(`production-schedule-${new Date().toLocaleDateString('en-IN')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        }
    };

    if (loading) {
        return <div className="loading">Loading production schedule...</div>;
    }

    return (
        <div className="jobs-page">
            <div className="jobs-grid">
                {jobs.map(job => (
                    <div key={job.id} className="job-card">
                        <h3>Job #{job.jobId}</h3>
                        <div className="job-details">
                            <p><strong>Product:</strong> {job.product}</p>
                            <p><strong>Quantity:</strong> {job.quantity}</p>
                            <p><strong>Customer:</strong> {job.customer}</p>
                            <p><strong>Due Date:</strong> {
                                job.dueDate !== 'N/A' ? 
                                new Date(job.dueDate).toLocaleDateString() : 
                                'N/A'
                            }</p>
                            <p><strong>Status:</strong> {job.status}</p>
                            
                            <div className="assigned-employees">
                                <strong>Assigned Employees:</strong>
                                {job.assignedEmployees.length > 0 ? (
                                    <ul className="employees-list">
                                        {job.assignedEmployees.map((employee, index) => (
                                            <li key={index}>{employee}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-employees">No employees assigned</p>
                                )}
                            </div>
                        </div>
                        <button 
                            className={`status-btn ${job.status}`}
                            onClick={() => handleStatusUpdate(job.id)}
                        >
                            {job.status === 'pending' ? 'Start Production' : 
                             job.status === 'in_progress' ? 'Complete Job' : 'Completed'}
                        </button>
                    </div>
                ))}
            </div>
            <button className="download-btn" onClick={handleDownload} title="Download Detailed Report">
                <FaDownload />
            </button>
        </div>
    );
};

export default JobScheduler;
