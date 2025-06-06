export const calculateWorkloadScore = (jobs, workforce) => {
    if (workforce === 0) return 100; // Maximum workload if no workers

    const totalQuantity = jobs.reduce((sum, job) => sum + job.productDetails.quantity, 0);
    const averageQuantityPerWorker = totalQuantity / workforce;
    
    // Normalize to 0-100 scale
    return Math.min(100, (averageQuantityPerWorker / 50) * 100);
};

export const calculateDaysLeft = (deliveryDate) => {
    const today = new Date();
    const due = new Date(deliveryDate);
    const timeDiff = due.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
};