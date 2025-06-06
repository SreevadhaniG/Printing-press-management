import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date("2025-03-07T05:41:23Z").getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="brand-col">
            <h2 className="brand-name">Pentagon Printers</h2>
            <p className="brand-desc">Premium Printing Solutions</p>
          </div>

          <div>
            <h5>Products</h5>
            <ul>
              <li><Link to="/products/business-cards" className="footer-link">Business Cards</Link></li>
              <li><Link to="/products/brochures" className="footer-link">Brochures</Link></li>
              <li><Link to="/products/envelopes" className="footer-link">Envelopes</Link></li>
              <li><Link to="/products/stickers" className="footer-link">Stickers</Link></li>
              <li><Link to="/products/calendars" className="footer-link">Calendars</Link></li>
              <li><Link to="/products/id-cards" className="footer-link">ID Cards</Link></li>
            </ul>
          </div>

          <div>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h5>Connect</h5>
            <ul>
              <li>
                <a href="tel:+919363202424" className="footer-link">
                  +91 93632 02424
                </a>
              </li>
              <li>
                <a href="mailto:info@pentagonprinters.com" className="footer-link">
                  info@pentagonprinters.com
                </a>
              </li>
              <li>41, Samygoundanpalayam, West Street,</li>
              <li>Nasiyanur, Erode, Tamil Nadu</li>
              <li>638107</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {currentYear} Pentagon Printers. All rights reserved.</p>
          </div>
          <div className="legal-links">
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <span className="separator">|</span>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;