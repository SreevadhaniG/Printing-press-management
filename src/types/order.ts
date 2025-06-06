export interface OrderPricing {
    baseAmount: number;
    gstAmount: number;
    finalAmount: number;
    advanceAmount: number;
    remainingAmount: number;
  }
  
  export interface OrderDetails {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    customerName: string;
    customerEmail: string;
    productDetails: {
      name: string;
      title: string;
      size: string;
      quantity: number;
      description?: string;
      hasSampleDesign: boolean;
    };
    contactDetails: {
      phone: string;
      address: string;
    };
    deliveryDate: string;
    pricing: OrderPricing;
    status: 'PENDING_PAYMENT' | 'PAYMENT_RECEIVED' | 'PROCESSING' | 'COMPLETED';
  }