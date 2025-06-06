import React, { useState } from 'react';

const OrderForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        quantity: 1,
        size: '',
        customization: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Show preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please select an image');
            return;
        }
        await onSubmit(formData, imageFile);
    };

    return (
        <form onSubmit={handleSubmit} className="order-form">
            {/* ...existing form fields... */}
            <div className="form-group">
                <label>Upload Design/Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                />
                {imagePreview && (
                    <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="image-preview"
                        style={{ maxWidth: '200px', marginTop: '10px' }}
                    />
                )}
            </div>
            <button type="submit">Place Order</button>
        </form>
    );
};

export default OrderForm;