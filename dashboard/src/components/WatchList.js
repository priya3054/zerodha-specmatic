import React, { useState, useContext, useEffect } from "react";
import SseContext from "../context/SseContext";
import GeneralContext from "./GeneralContext";

import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";

import { watchlist as initialWatchlist } from "../data/data";
import { DoughnutChart } from "./DoughnoutChart";

/*WATCHLIST (MAIN)*/

const WatchList = () => {
  const eventSource = useContext(SseContext);

  const [stocks, setStocks] = useState(initialWatchlist);

  /*LIVE PRICE UPDATE*/
  useEffect(() => {
    if (!eventSource) return;

    const handlePriceUpdate = (event) => {
      const data = JSON.parse(event.data);

      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          if (stock.name !== data.name) return stock;

          const newPrice = Number(data.price);
          const oldPrice = stock.price;

          const percentChange = (
            ((newPrice - oldPrice) / oldPrice) *
            100
          ).toFixed(2);

          return {
            ...stock,
            price: newPrice,
            percent: `${percentChange}%`,
            isDown: newPrice < oldPrice,
          };
        }),
      );
    };

    eventSource.addEventListener("price-update", handlePriceUpdate);

    return () => {
      eventSource.removeEventListener("price-update", handlePriceUpdate);
    };
  }, [eventSource]);

  /*CHART DATA*/
  const labels = stocks.map((stock) => stock.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: stocks.map((stock) => stock.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search eg: infy, bse, nifty fut weekly"
          className="search"
        />
        <span className="counts">{stocks.length} / 50</span>
      </div>

      <ul className="list">
        {stocks.map((stock) => (
          <WatchListItem stock={stock} key={stock.name} />
        ))}
      </ul>

      <DoughnutChart data={data} />
    </div>
  );
};

export default WatchList;

/* WATCHLIST ITEM*/

const WatchListItem = ({ stock }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <li
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>

        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>

          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}

          <span className="price">{stock.price}</span>
        </div>
      </div>

      {showActions && <WatchListActions uid={stock.name} />}
    </li>
  );
};

/*ACTION BUTTONS*/

const WatchListActions = ({ uid }) => {
  const { openBuyWindow, openSellWindow } = useContext(GeneralContext);

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button
            className="buy"
            onClick={() => {
              openBuyWindow(uid);
            }}
          >
            Buy
          </button>
        </Tooltip>

        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="sell" onClick={() => openSellWindow(uid)}>
            Sell
          </button>
        </Tooltip>

        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>

        <Tooltip title="More" placement="top" arrow TransitionComponent={Grow}>
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};
