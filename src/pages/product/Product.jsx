import React, { useState, useEffect } from "react";
import { Carousel } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Product.css";

const AboutUsContent = {
  title: "About Pentagon Printers",
  description: `With over a decade of excellence in the printing industry, Pentagon Printers stands as your trusted partner for all printing needs. We specialize in delivering high-quality printing solutions, from business essentials to personalized merchandise.

  Our state-of-the-art technology combined with expert craftsmanship ensures exceptional quality in every project. We take pride in our commitment to customer satisfaction, offering quick turnaround times and competitive pricing without compromising on quality.
  
  Whether you're a business looking for professional printing services or an individual seeking custom designs, our dedicated team is here to bring your vision to life.`
};

const Product = () => {
  const [currentGroup, setCurrentGroup] = useState(0);

  const products = [
    { id: 1, subcategory: 'visitingcard', image: '/assets/colors/1.jpg', name: 'Visiting Cards' },
    { id: 2, subcategory: 'stamp', image: '/assets/colors/2.jpg', name: 'Stamps' },
    { id: 3, subcategory: 'mug', image: '/assets/colors/3.jpg', name: 'Mugs' },
    { id: 4, subcategory: 'tshirt', image: '/assets/colors/4.jpg', name: 'T-Shirts' },
    { id: 5, subcategory: 'banner', image: '/assets/colors/5.jpg', name: 'Banners' },
    { id: 6, subcategory: 'invitation', image: '/assets/colors/6.jpg', name: 'Invitations' },
    { id: 7, category: 'graphic', image: '/assets/colors/7.jpg', name: 'Graphics' },
    { id: 8, category: 'gifts', image: '/assets/colors/8.jpg', name: 'Gifts' },
  ];

  // Group products into arrays of 4
  const productGroups = [];
  for (let i = 0; i < products.length; i += 4) {
    productGroups.push(products.slice(i, i + 4));
  }

  const trendingProducts = [
    { id: 9, category: 'homedecor', image: '/assets/colors/9.jpg', name: 'Home Decor' },
    { id: 10, subcategory: 'album', image: '/assets/colors/10.jpg', name: 'Albums' },
    { id: 11, subcategory: 'crystal', image: '/assets/colors/11.jpg', name: 'Crystal Items' },
    { id: 12, subcategory: 'shirt', image: '/assets/colors/12.jpg', name: 'Shirts' },
    { id: 13, subcategory: 'photoframe', image: '/assets/colors/13.jpg', name: 'Photo Frames' },
    { id: 14, subcategory: 'card', image: '/assets/colors/1.jpg', name: 'Card' },
    { id: 15, subcategory: 'cushion', image: '/assets/colors/15.jpg', name: 'Cushions' },
    { id: 16, subcategory: 'notebook', image: '/assets/colors/16.jpg', name: 'Notebooks' },
  ];

  const carouselImages = [
    '/assets/carousel/slide1.png',
    '/assets/carousel/slide2.png',
    '/assets/carousel/slide3.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGroup((prev) => 
        prev === productGroups.length - 1 ? 0 : prev + 1
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [productGroups.length]);

  return (
    <div className="products-page">
      <section className="carousel-section">
        <Carousel interval={3000}>
          {carouselImages.map((image, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={process.env.PUBLIC_URL + image}
                alt={`Slide ${index + 1}`}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* About Us Section */}
      <section className="about-us">
        <h2 className="homeHeader">{AboutUsContent.title}</h2>
        <div className="about-content">
          {AboutUsContent.description.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph.trim()}</p>
          ))}
        </div>
      </section>

      {/* Top Sellers Section 
      <section className="top-sellers">
        <h2 className="homeHeader">TOP SELLERS</h2>
        <div className="slider-container">
          <div 
            className="slider-track" 
            style={{ 
              transform: `translateX(-${currentGroup * 100}%)`,
              width: `${productGroups.length * 100}%`
            }}
          >
            {productGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="product-group">
                {group.map((product) => (
                  <div key={product.id} className="product-card">
                    <Link 
                      to={`/product/${product.id}/customize`}
                      state={{ productImage: product.image, productName: product.name }}
                    >
                      <img 
                        src={process.env.PUBLIC_URL + product.image} 
                        alt={product.name} 
                      />
                      <h3>{product.name}</h3>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* Trending Products Section */}
      <section className="trending-products">
        <h2 className="homeHeader">TRENDING PRODUCTS</h2>
        <div className="homeColors">
          {trendingProducts.map((product) => (
            <div key={product.id}>
              <Link 
                to={`/product/${product.id}/customize`}
                state={{ productImage: product.image, productName: product.name }}
              >
                <img src={process.env.PUBLIC_URL + product.image} alt={product.name} />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Product;
