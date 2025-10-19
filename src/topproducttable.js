import React, { useState } from 'react';
import './TopProductsTable.css';

function TopProductsTable({ filteredData }) {
  const [sortBy, setSortBy] = useState('revenue'); // 'revenue' or 'quantity'

  const getTopProducts = () => {
    const products = {};
    filteredData.forEach(item => {
      if (!products[item.product]) {
        products[item.product] = { quantity: 0, revenue: 0 };
      }
      products[item.product].quantity += item.quantity;
      products[item.product].revenue += item.total_price;
    });

    const productArray = Object.entries(products).map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: parseFloat(data.revenue.toFixed(2))
    }));

    productArray.sort((a, b) => b[sortBy] - a[sortBy]);
    return productArray.slice(0, 5);
  };

  const topProducts = getTopProducts();

  return (
    <div className="top-products-container">
      <div className="top-products-header">
        <h2>Top 5 Products</h2>
        <div className="sort-buttons">
          <button 
            className={sortBy === 'revenue' ? 'active' : ''} 
            onClick={() => setSortBy('revenue')}
          >
            By Revenue
          </button>
          <button 
            className={sortBy === 'quantity' ? 'active' : ''} 
            onClick={() => setSortBy('quantity')}
          >
            By Quantity
          </button>
        </div>
      </div>
      <table className="top-products-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Product</th>
            <th>Quantity Sold</th>
            <th>Revenue ($)</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map((product, index) => (
            <tr key={product.name}>
              <td>{index + 1}</td>
              <td>{product.name}</td>
              <td>{product.quantity}</td>
              <td>${product.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TopProductsTable;
