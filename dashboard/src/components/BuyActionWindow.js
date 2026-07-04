import React, { useState, useContext } from "react";
import GeneralContext from "./GeneralContext";
import "./BuyActionWindow.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const { closeBuyWindow } = useContext(GeneralContext);

  const handleBuyClick = async () => {
    const res = await fetch(`${API_BASE}/newOrder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: uid,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode: "BUY",
      }),
    });

    if (res.ok) {
      closeBuyWindow();
    }
  };

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              min="1"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
            />
          </fieldset>

          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
            />
          </fieldset>
        </div>
      </div>

      <div className="buttons">
        <span>Margin required ₹140.65</span>
        <div>
          <button className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </button>
          <button className="btn btn-grey" onClick={closeBuyWindow}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;
