import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Link } from "react-router-dom";
import './ProductForm.css';

const ProductForm = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productsData);
        };
        fetchProducts();
    }, []);

    const handleToggleStatus = async (productId, currentStatus) => {
        try {
            await updateDoc(doc(db, 'products', productId), {
                isActive: !currentStatus
            });
            setProducts(products.map(product => 
                product.id === productId 
                    ? {...product, isActive: !currentStatus}
                    : product
            ));
        } catch (error) {
            console.error('Error updating product status:', error);
        }
    };

    return (
        <div className="product-management">
            <h2 className="homeHeader">MANAGE PRODUCTS</h2>
            <div className="homeColors">
                {products.map((product) => (
                    <div key={product.id} className="product-container">
                        <div className="product-image">
                            <img 
                                src={process.env.PUBLIC_URL + product.image} 
                                alt={product.name} 
                            />
                            <button 
                                className={`toggle-status ${product.isActive ? 'disable' : 'enable'}`}
                                onClick={() => handleToggleStatus(product.id, product.isActive)}
                            >
                                {product.isActive ? 'Disable' : 'Enable'}
                            </button>
                        </div>
                        <h3>{product.name}</h3>
                        <span className={`status-indicator ${product.isActive ? 'active' : 'inactive'}`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductForm;