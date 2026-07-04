import React, { useState, useContext } from "react";
import GeneralContext from "./GeneralContext";
import "./SellActionWindow.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(0.0);

  const { closeSellWindow } = useContext(GeneralContext);

  const handleSellClick = async () => {
    const res = await fetch(`${API_BASE}/newOrder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: uid,
        qty: Number(stockQuantity),
        price: Number(stockPrice),
        mode: "SELL",
      }),
    });

    if (res.ok) {
      closeSellWindow();
    }
  };

  return (
    <div className="container" id="sell-window" draggable="true">
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
          <button className="btn btn-red" onClick={handleSellClick}>
            Sell
          </button>
          <button className="btn btn-grey" onClick={closeSellWindow}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;