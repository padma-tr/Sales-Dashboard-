import React from 'react';
import './MetricsCards.css';

function MetricsCards({ filteredData }) {
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_price, 0);
  const totalSales = filteredData.length;
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="metrics-cards">
      <div className="metric-card">
        <h3>Total Revenue</h3>
        <p className="metric-value">${totalRevenue.toFixed(2)}</p>
      </div>
      <div className="metric-card">
        <h3>Total Sales</h3>
        <p className="metric-value">{totalSales}</p>
      </div>
      <div className="metric-card">
        <h3>Avg Sale Value</h3>
        <p className="metric-value">${avgSaleValue.toFixed(2)}</p>
      </div>
      <div className="metric-card">
        <h3>Total Units Sold</h3>
        <p className="metric-value">{totalQuantity}</p>
      </div>
    </div>
  );
}

export default MetricsCards;
