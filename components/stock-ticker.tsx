import React from "react";
import styles from "./StockTicker.module.css";

const StockTicker = ({
  marketData,
  speed,
}: {
  marketData: any[];
  speed: number;
}) => {
  return (
    <div className={styles.tickerWrapper}>
      <div
        className={styles.tickerContainer}
        style={{ animationDuration: `${speed}s` }}
      >
        {marketData.map((data: any, index: number) => (
          <div key={`ticker${index}`} className={styles.tickerItem}>
            <h3>{data.question}</h3>
            <h3>{data.price}</h3>
          </div>
        ))}
        {marketData.map((data: any, index: number) => (
          <div key={`ticker${index}`} className={styles.tickerItem}>
            <h3>{data.question}</h3>
            <h3>{data.price}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;
