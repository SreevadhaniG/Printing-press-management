import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="footer-main">
          <Col lg={3} md={6} className="brand-col">
            <h2 className="brand-name">Pentagon Printers</h2>
            <p className="brand-desc">Premium Printing Solutions</p>
          </Col>
          <Col lg={2} md={6}>
            <h5>Products</h5>
            <ul>
              <li><a href="/products/business-cards">Business Cards</a></li>
              <li><a href="/products/brochures">Brochures</a></li>
              <li><a href="/products/stationery">Stationery</a></li>
              <li><a href="/products/merchandise">Merchandise</a></li>
            </ul>
          </Col>
          <Col lg={2} md={6}>
            <h5>Company</h5>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Col>
          <Col lg={5} md={6}>
            <h5>Connect</h5>
            <ul>
              <li><a href="tel:+1234567890">+91 93632 02424</a></li>
              <li><a href="mailto:info@pentagonprinters.com">info@pentagonprinters.com</a></li>
              <li>41, Samygoundanpalayam, West Street, Nasiyanur, Erode, Tamil Nadu</li>
              <li>638107</li>
            </ul>
          </Col>
        </Row>
        <Row className="footer-bottom">
          <Col md={6} className="copyright">
            <p>&copy; 2025 Pentagon Printers. All rights reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
