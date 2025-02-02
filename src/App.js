import React from "react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <div className="festival-name">Sankatahara Chaturti</div>
          <div className="gold-rate">
            Today's Rate: <span className="gold-rate-value">Gold 22 KT/1 g Rs 7450</span>
          </div>
          <div className="contact-info">
            <i className="fa fa-phone"></i> 18002031000
            <span className="currency-selector">
              <img src="/path/to/india-flag.png" alt="India Flag" /> INR
            </span>
          </div>
        </div>
        <div className="header-middle">
          <div className="logo">
            <img src="/path/to/logo.png" alt="GRT Jewellers" />
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for Jewellery, Coins, Silver Articles and more..."
            />
            <button className="search-button">
              <i className="fa fa-search"></i>
            </button>
          </div>
          <button className="purchase-plan-button">Purchase Plan Payment</button>
        </div>
        <div className="header-bottom">
          <nav className="navigation">
            <a href="/">All Jewellery</a>
            <a href="/">Gold</a>
            <a href="/">Diamond</a>
            <a href="/">Silver</a>
            <a href="/">Solitaire</a>
            <a href="/">Collection</a>
            <a href="/">Oriana</a>
            <a href="/">Gifts & Gold Coins</a>
            <a href="/">GRT Live</a>
            <a href="/">More</a>
          </nav>
        </div>
      </header>
    </div>
  );
}

export default App;
