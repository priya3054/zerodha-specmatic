import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SseContext from "../context/SseContext";
import AuthContext from "../context/AuthContext";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3002";

const Funds = () => {
  const eventSource = useContext(SseContext);
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (user?.balance != null) {
      setBalance(user.balance);
    }
  }, [user]);

  useEffect(() => {
    if (!eventSource) return;

    const handleBalanceUpdate = (event) => {
      const data = JSON.parse(event.data);
      setBalance(data.balance);
    };

    eventSource.addEventListener("balance-update", handleBalanceUpdate);
    return () => {
      eventSource.removeEventListener("balance-update", handleBalanceUpdate);
    };
  }, [eventSource]);

  const addFunds = async () => {
    const amount = prompt("Enter amount to add");

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const orderRes = await fetch(`${API_BASE}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: Number(amount) }),
      });

      const order = await orderRes.json();

      const options = {
        key: "rzp_test_SFizfwdHnPINhB",
        amount: order.amount,
        currency: "INR",
        name: "Zerodha Clone",
        description: "Add Funds",
        order_id: order.id,

        handler: async function (response) {
          const verifyRes = await fetch(
            `${API_BASE}/verify-payment`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                ...response,
                amount: Number(amount),
              }),
            },
          );

          const result = await verifyRes.json();

          if (result.status === "success") {
            alert("Funds added successfully!");
          } else {
            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#0f9d58",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Add funds error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <>
      <div className="funds">
        <p>Instant, zero-cost fund transfers with UPI </p>
        <button className="btn btn-green" onClick={addFunds}>
          Add funds
        </button>
        <Link className="btn btn-blue">Withdraw</Link>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">{balance.toFixed(2)}</p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">3,757.30</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp">{balance.toFixed(2)}</p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>4,043.10</p>
            </div>
            <div className="data">
              <p>Opening Balance</p>
              <p>3736.40</p>
            </div>
            <div className="data">
              <p>Payin</p>
              <p>4064.00</p>
            </div>
            <div className="data">
              <p>SPAN</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Delivery margin</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Exposure</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Options premium</p>
              <p>0.00</p>
            </div>
            <hr />
            <div className="data">
              <p>Collateral (Liquid funds)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Collateral (Equity)</p>
              <p>0.00</p>
            </div>
            <div className="data">
              <p>Total Collateral</p>
              <p>0.00</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="commodity">
            <p>You don't have a commodity account</p>
            <Link className="btn btn-blue">Open Account</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Funds;
