import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ProductDescription.css';
import { useAuth } from '../../context/AuthContext';

const ProductDescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productImage, productName } = location.state || {};
  const { user } = useAuth();
  
  const [errors, setErrors] = useState({
    sampleDesign: ''
  });
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    size: '',
    logo: null,
    email: user?.email || '',
    contact: '',
    address: '',
    description: '',
    screenshots: [],
    quantity: '',
    sampleDesign: null
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const products = [
    { id: 1, name: 'Product 1', image: '/path/to/image1.jpg' },
    { id: 2, name: 'Product 2', image: '/path/to/image2.jpg' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); 

    return () => clearInterval(interval); 
  }, [products.length]);

  const getMaxQuantity = (productName) => {
    const limits = {
      'Visiting Cards': 2000,
      'Banners': 10,
      'Albums': 2,
      'Photo Frames': 2,
      'Cushions': 2,
      'Notebooks': 10
    };
    return limits[productName] || 100;
  };

  const validateQuantity = (value, productName) => {
    const maxLimit = getMaxQuantity(productName);
    if (!value || value <= 0) {
      return 'Quantity must be positive';
    }
    if (value > maxLimit) {
      return `Maximum quantity for ${productName} is ${maxLimit}`;
    }
    return '';
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.size.trim()) {
      newErrors.size = 'Size is required';
    }
    
    if (!formData.logo) {
      newErrors.logo = 'Logo is required';
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(formData.logo.type)) {
        newErrors.logo = 'Please upload a valid image file (JPEG, PNG, or GIF)';
      }
      if (formData.logo.size > 5000000) { // 5MB limit
        newErrors.logo = 'File size should be less than 5MB';
      }
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contact?.trim()) {
      newErrors.contact = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact.replace(/\D/g, ''))) {
      newErrors.contact = 'Please enter a valid 10-digit contact number';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    return newErrors;
};

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'File must be PDF, JPG, or PNG format';
    }
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }
    return '';
  };

  const handleFileChange = (e, type) => {
    if (type === 'logo') {
      setFormData({ ...formData, logo: e.target.files[0] });
    } else if (type === 'screenshots') {
      setFormData({ ...formData, screenshots: [...e.target.files] });
    } else if (type === 'sampleDesign') {
      const file = e.target.files[0];
      if (file) {
        const error = validateFile(file);
        setErrors(prev => ({
          ...prev,
          sampleDesign: error
        }));
        if (!error) {
          setFormData(prev => ({
            ...prev,
            sampleDesign: file
          }));
          // Update price when sample design is added
          setTotalPrice(calculatePrice(
            Number(formData.quantity), 
            true
          ));
        }
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    // Update price when quantity changes
    if (name === 'quantity') {
      const newPrice = calculatePrice(
        Number(value), 
        formData.sampleDesign !== null
      );
      setTotalPrice(newPrice);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    const stepErrors = validateStep1();
    
    if (Object.keys(stepErrors).length === 0) {
      setStep(2);
      setErrors({});
      // Scroll to top of the form smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      setErrors(stepErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep2();
    localStorage.setItem('pricingInfo', JSON.stringify({ formData, totalPrice }));

    if (Object.keys(stepErrors).length === 0) {
      localStorage.removeItem('productFormData'); // Clear storage after submission
      navigate('/payment', {
        state: {
          formData: formData, // Contains product details
          totalPrice: totalPrice // Pricing info
        }
      });
    } else {
      setErrors(stepErrors);
    }
  };
  

  const basePrice = {
    'Visiting Cards': 2.50,
    'Banners': 150,
    'Albums': 500,
    'Photo Frames': 300,
    'Cushions': 450,
    'Notebooks': 200,
    default: 5
  };

  const calculatePrice = (quantity, hasSampleDesign) => {
    const baseProductPrice = basePrice[productName] || basePrice.default;
    let total = baseProductPrice * quantity;
    if (hasSampleDesign) {
      total += 0.5 * quantity; // Add 0.5 rupees per unit for sample design
    }
    return total;
  };

  // Add this constant for product sizes
  const productSizes = {
    'Visiting Cards': [
      '2 × 3.5 inches (Standard)',
      '2.17 × 3.67 inches (European)',
      '2.75 × 4 inches (Premium)',
      'Custom Size'
    ],
    'Banners': [
      '24 × 48 inches',
      '36 × 72 inches',
      '48 × 96 inches',
      'Custom Size'
    ],
    'Albums': [
      'Small (20cm × 15cm)',
      'Medium (25cm × 20cm)',
      'Large (30cm × 25cm)',
      'Custom Size'
    ],
    'Photo Frames': [
      'Small (20cm × 25cm)',
      'Medium (30cm × 40cm)',
      'Large (40cm × 50cm)',
      'Custom Size'
    ],
    'Cushions': [
      'Standard (40cm × 40cm)',
      'Rectangle (50cm × 30cm)',
      'Custom Size'
    ],
    'Crystal Items': [
      'Small (10cm × 15cm)',
      'Medium (15cm × 20cm)',
      'Large (20cm × 25cm)',
      'Custom Size'
    ],
    'Notebooks': [
      'A6 (10.5cm × 14.8cm)',
      'A5 (14.8cm × 21cm)',
      'A4 (21cm × 29.7cm)',
      'Custom Size'
    ],
    'Card': [
      '2 × 3.5 inches (Standard)',
      '2.17 × 3.67 inches (European)',
      '2.75 × 4 inches (Premium)',
      'Custom Size'
    ]
  };

  const getPlaceholder = (productName) => {
    const placeholders = {
      'Visiting Cards': 'width × height (inches)',
      'Banners': 'width × height (inches)',
      'Albums': 'width × height (cm)',
      'Photo Frames': 'width × height (cm)',
      'Crystal Items': 'width × height (cm)',
      'Cushions': 'width × height (cm)',
      'Notebooks': 'width × height (cm)'
    };
    return placeholders[productName] || 'width × height';
  };

  // Add this to your component's state
  const [showCustomSize, setShowCustomSize] = useState(false);
  const [customSize, setCustomSize] = useState({ width: '', height: '' });

  // Also add scrolling to the Back button handler
  const handleBack = () => {
    setStep(1);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="product-container">
      {/* Left side - Product Image */}
      <div className="top"></div>
      <div className="product-image">
        <img 
          key={currentIndex} // Force re-render to trigger animation
          className="product-card"
          src={process.env.PUBLIC_URL + productImage} 
          alt={productName || 'Product'}
          onError={(e) => {
            console.error('Image failed to load:', e);
            e.target.src = '/fallback-image.jpg'; // Optional fallback
          }}
        />
        <h3 className="product-title">{productName || 'Product Details'}</h3>
        
        {/* Add Price Calculator */}
        <div className="price-calculator">
          <h4>Price Details</h4>
          <div className="price-details">
            <p>Base Price: ₹{basePrice[productName] || basePrice.default}</p>
            <p>Quantity: {formData.quantity || 0}</p>
            {formData.sampleDesign && (
              <p>Sample Design: +₹0.50 per unit</p>
            )}
            <div className="total-price">
              <strong>Total Price: ₹{totalPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="product-form">
        <div className="form-slider" style={{ transform: `translateX(-${(step - 1) * 100}%)` }}>
          {/* Step 1: Product Details */}
          <form onSubmit={handleNextStep} className="form-step">
            <br />
            <br />
            <h2>Product Details</h2>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                required
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label>Size</label>
              <select
                name="size"
                value={formData.size}
                onChange={(e) => {
                  handleInputChange(e);
                  setShowCustomSize(e.target.value === 'Custom Size');
                }}
                className={`form-control-sm ${errors.size ? 'error' : ''}`}
                required
              >
                <option value="">Select Size</option>
                {(productSizes[productName] || productSizes[productName?.split(' ')[0]] || []).map((size, index) => (
                  <option key={index} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              {showCustomSize && (
                <div className="custom-size-inputs">
                  <div className="d-flex gap-2 mt-2">
                    <input
                      type="number"
                      placeholder={`Width (${['Visiting Cards', 'Card', 'Banners'].includes(productName) ? 'inches' : 'cm'})`}
                      value={customSize.width}
                      onChange={(e) => {
                        setCustomSize(prev => ({ ...prev, width: e.target.value }));
                        const unit = ['Visiting Cards', 'Card', 'Banners'].includes(productName) ? 'inches' : 'cm';
                        setFormData(prev => ({ 
                          ...prev, 
                          size: `${e.target.value} × ${customSize.height} ${unit}`
                        }));
                      }}
                      className="form-control-sm"
                      min="1"
                      required
                    />
                    <span className="align-self-center">×</span>
                    <input
                      type="number"
                      placeholder={`Height (${['Visiting Cards', 'Card', 'Banners'].includes(productName) ? 'inches' : 'cm'})`}
                      value={customSize.height}
                      onChange={(e) => {
                        setCustomSize(prev => ({ ...prev, height: e.target.value }));
                        const unit = ['Visiting Cards', 'Card', 'Banners'].includes(productName) ? 'inches' : 'cm';
                        setFormData(prev => ({ 
                          ...prev, 
                          size: `${customSize.width} × ${e.target.value} ${unit}`
                        }));
                      }}
                      className="form-control-sm"
                      min="1"
                      required
                    />
                  </div>
                  <small className="size-hint mt-1">
                    {getPlaceholder(productName)}
                  </small>
                </div>
              )}
              {errors.size && <span className="error-message">{errors.size}</span>}
            </div>

            <div className="form-group">
              <label>Upload Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className={errors.logo ? 'error' : ''}
              />
              {errors.logo && <span className="error-message">{errors.logo}</span>}
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                max={getMaxQuantity(productName)}
                className={errors.quantity ? 'error' : ''}
                required
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>

            <div className="form-group">
              <label>Sample Design (PDF, JPG, PNG)</label>
              <input
                type="file"
                name="sampleDesign"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'sampleDesign')}
                className={errors.sampleDesign ? 'error' : ''}
              />
              {errors.sampleDesign && (
                <span className="error-message">{errors.sampleDesign}</span>
              )}
              <small className="file-hint">
                Maximum file size: 5MB
              </small>
            </div>

            <button type="submit" className="btn-primary">Next</button>
          </form>

          {/* Step 2: Contact Details */}
          <form onSubmit={handleSubmit} className="form-step">
          <br />
          <br />
            <h2>Contact Details</h2>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={user?.email || ''}
                className="form-control-sm readonly-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                className={errors.contact ? 'error' : ''}
                required
              />
              {errors.contact && <span className="error-message">{errors.contact}</span>}
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                required
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            
              <button 
                type="button" 
                onClick={handleBack} 
                className="btn-secondary"
              >
                Back
              </button> <br /><br />
              <button type="submit" className="btn-primary" onClick={handleSubmit}>
                View Bill
              </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;