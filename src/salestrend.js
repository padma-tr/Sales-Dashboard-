import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import './Charts.css';

function SalesTrendsChart({ filteredData }) {
  const getTrendsData = () => {
    const trends = {};
    filteredData.forEach(item => {
      const date = item.date;
      if (!trends[date]) {
        trends[date] = 0;
      }
      trends[date] += item.total_price;
    });

    return Object.entries(trends)
      .map(([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const trendsData = getTrendsData();

  return (
    <div className="chart-container">
      <h2>Sales Trends Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} name="Total Sales ($)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SalesTrendsChart;
