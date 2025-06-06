import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { FaStar, FaEdit, FaPlus, FaMinus, FaDownload } from 'react-icons/fa';
import jsPDF from 'jspdf';
import './EmployeeManagement.css';
import { setupPDFDocument } from '../../utils/pdfGenerator';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        rating: 1,
        contact: ''
    });

    const generateEmployeeId = () => {
        const prefix = 'EMP';
        const timestamp = Date.now().toString().slice(-4);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'employees'));
            const employeeData = snapshot.docs.map(doc => ({
                id: doc.id,
                employeeId: doc.data().employeeId,
                ...doc.data(),
                attendance: doc.data().attendance || {}
            }));
            setEmployees(employeeData);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleAttendance = async (employeeId, status) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const employeeRef = doc(db, 'employees', employeeId);
            
            await updateDoc(employeeRef, {
                [`attendance.${today}`]: status,
                lastAttendanceUpdate: serverTimestamp()
            });

            // Update local state
            setEmployees(prev => prev.map(emp => 
                emp.id === employeeId 
                    ? { 
                        ...emp, 
                        attendance: { 
                            ...emp.attendance, 
                            [today]: status 
                        } 
                    }
                    : emp
            ));

        } catch (error) {
            console.error('Error updating attendance:', error);
            alert('Failed to update attendance');
        }
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setFormData({ 
            name: employee.name,
            rating: employee.rating || 1,
            contact: employee.contact || '',
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (formData.name !== editingEmployee.name) {
                // Create new employee
                if (window.confirm('Changing the name will create a new employee. Continue?')) {
                    const newEmployeeId = generateEmployeeId();

                    // Create new document with custom ID
                    await setDoc(doc(db, 'employees', newEmployeeId), {
                        employeeId: newEmployeeId,
                        name: formData.name,
                        contact: formData.contact,
                        rating: Number(formData.rating),
                        attendance: {},
                        createdAt: new Date()
                    });
                    
                    setEmployees(prev => [...prev, { 
                        id: newEmployeeId,
                        employeeId: newEmployeeId,
                        name: formData.name,
                        contact: formData.contact,
                        rating: Number(formData.rating),
                        attendance: {}
                    }]);
                }
            } else {
                // Update existing employee
                const employeeRef = doc(db, 'employees', editingEmployee.id);
                const updatedData = {
                    name: formData.name,
                    contact: formData.contact,
                    rating: Number(formData.rating)
                };
                
                await updateDoc(employeeRef, updatedData);
                
                setEmployees(prev => prev.map(emp => 
                    emp.id === editingEmployee.id 
                        ? { ...emp, ...updatedData }
                        : emp
                ));
            }
            setEditingEmployee(null);
        } catch (error) {
            console.error('Error saving employee:', error);
            alert('Error saving employee data: ' + error.message);
        }
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            const employeeId = generateEmployeeId();
            const today = new Date().toISOString().split('T')[0];
            
            const employeeData = {
                ...newEmployee,
                employeeId,
                createdAt: new Date(),
                attendance: {
                    [today]: 'absent' // Initialize with absent
                }
            };

            // Use custom ID for document
            await setDoc(doc(db, 'employees', employeeId), employeeData);
            
            setEmployees(prev => [...prev, { id: employeeId, ...employeeData }]);
            setShowAddForm(false);
            setNewEmployee({ name: '', rating: 1, contact: '' });
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    };

    const handleDeleteEmployee = async (employeeId) => {
        try {
            await deleteDoc(doc(db, 'employees', employeeId));
            setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    const handleDownload = () => {
        try {
            const { doc, addFooter } = setupPDFDocument("Employee Management Report");
            
            // Date
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, 55);

            let yPos = 70;
            employees.forEach((emp, index) => {
                const today = new Date().toISOString().split('T')[0];

                // Employee section header
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${index + 1}. Employee Details`, 20, yPos);
                
                // Employee information
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.text(`ID: ${emp.employeeId}`, 25, yPos + 7);
                doc.text(`Name: ${emp.name}`, 25, yPos + 14);
                doc.text(`Contact: ${emp.contact}`, 25, yPos + 21);
                doc.text(`Rating: ${emp.rating}/5`, 25, yPos + 28);
                doc.text(`Today's Attendance: ${emp.attendance?.[today] || 'Not marked'}`, 25, yPos + 35);
                
                yPos += 45;

                // Add new page if needed
                if (yPos > 220) {
                    addFooter();
                    doc.addPage();
                    yPos = 20;
                }
            });

            addFooter();
            doc.save(`employee-report-${new Date().toLocaleDateString('en-IN')}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF report');
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar 
                key={index}
                className={index < rating ? 'star active' : 'star'}
            />
        ));
    };

    const renderAttendanceButtons = (employee) => {
        const today = new Date().toISOString().split('T')[0];
        const currentStatus = employee.attendance?.[today] || 'absent';

        return (
            <div className="attendance-buttons">
                <button 
                    className={`attendance-btn ${currentStatus === 'present' ? 'active' : ''}`}
                    onClick={() => handleAttendance(employee.id, 'present')}
                >
                    Present
                </button>
                <button 
                    className={`attendance-btn ${currentStatus === 'absent' ? 'active' : ''}`}
                    onClick={() => handleAttendance(employee.id, 'absent')}
                >
                    Absent
                </button>
            </div>
        );
    };

    return (
        <div className="employee-management">
            <h2 className="page-title">Employee Management</h2>
            
            <div className="header-actions">
                <button className="add-btn" onClick={() => setShowAddForm(true)}>
                    <FaPlus />
                </button>
                <button className="download-btn" onClick={handleDownload}>
                    <FaDownload />
                </button>
            </div>

            <div className="employees-grid">
                {employees.map(employee => (
                    <div key={employee.id} className="employee-card">
                        <button 
                            className="delete-btn"
                            onClick={() => handleDeleteEmployee(employee.id)}
                        >
                            <FaMinus />
                        </button>
                        <div className="employee-info">
                            <div className="employee-header">
                                <h3 className="employee-name">{employee.name}</h3>
                                <span className="employee-id">{employee.employeeId}</span>
                            </div>
                            <p className="contact">
                                <span className="label">Contact:</span> 
                                {employee.contact}
                            </p>
                            <div className="rating-container">
                                <span className="label">Rating:</span>
                                {renderStars(employee.rating)}
                            </div>
                            <div className="attendance-container">
                                <span className="label">Today's Attendance:</span>
                                {renderAttendanceButtons(employee)}
                            </div>
                            <button 
                                className="edit-btn"
                                onClick={() => handleEdit(employee)}
                            >
                                <FaEdit /> Edit Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showAddForm && (
                <div className="modal" onClick={() => setShowAddForm(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Add New Employee</h3>
                        <form onSubmit={handleAddEmployee}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={newEmployee.name}
                                    onChange={(e) => setNewEmployee({
                                        ...newEmployee,
                                        name: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Rating:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={newEmployee.rating}
                                    onChange={(e) => setNewEmployee({
                                        ...newEmployee,
                                        rating: Number(e.target.value)
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact:</label>
                                <input
                                    type="tel"
                                    value={newEmployee.contact}
                                    onChange={(e) => setNewEmployee({
                                        ...newEmployee,
                                        contact: e.target.value
                                    })}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Save</button>
                                <button type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingEmployee && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Edit Employee</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                                <small className="warning">
                                    Note: Changing the name will create a new employee record
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Rating:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact:</label>
                                <input
                                    type="tel"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit">Save Changes</button>
                                <button type="button" onClick={() => setEditingEmployee(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="modal" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="confirm-delete">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete this employee?</p>
                            <div className="confirm-actions">
                                <button 
                                    className="delete-confirm"
                                    onClick={() => handleDeleteEmployee(showDeleteConfirm)}
                                >
                                    Delete
                                </button>
                                <button 
                                    className="cancel"
                                    onClick={() => setShowDeleteConfirm(null)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;