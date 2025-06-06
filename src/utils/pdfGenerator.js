import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const setupPDFDocument = (title) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("Pentagon Printers", 105, 20, { align: "center" });
    
    // Line under header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    // Report Title
    doc.setFontSize(14);
    doc.text(title, 105, 40, { align: "center" });

    // Add footer function
    const addFooter = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text("Pentagon Printers - Admin Report", 105, 280, { align: "center" });
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 105, 285, { align: "center" });
    };

    return { doc, addFooter };
};

export const generateEmployeesPDF = (employees) => {
    const { doc, addFooter } = setupPDFDocument("Employee Management Report");
    
    // Table data
    const tableColumn = ["ID", "Name", "Contact", "Rating", "Today's Attendance"];
    const tableRows = employees.map(emp => [
        emp.employeeId,
        emp.name,
        emp.contact,
        emp.rating,
        emp.attendance?.[new Date().toISOString().split('T')[0]] || 'Not marked'
    ]);

    // Using autoTable directly
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 0, 0] }
    });

    addFooter();
    return doc;
};

export const generateJobsPDF = (jobs) => {
    const { doc, addFooter } = setupPDFDocument("Production Schedule Report");
    
    const tableColumn = ["Job ID", "Product", "Customer", "Quantity", "Due Date", "Status"];
    const tableRows = jobs.map(job => [
        job.jobId,
        job.product,
        job.customer,
        job.quantity,
        job.dueDate,
        job.status
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60
    });

    addFooter();
    return doc;
};

export const generateOrdersPDF = (orders) => {
    const { doc, addFooter } = setupPDFDocument("Orders Report");
    
    const tableColumn = ["Order ID", "Customer", "Product", "Status", "Amount"];
    const tableRows = orders.map(order => [
        order.orderId,
        order.customerDetails.email,
        order.productDetails.productName,
        order.status,
        `₹${order.pricing.finalAmount}`
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60
    });

    addFooter();
    return doc;
};