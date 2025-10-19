import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Charts.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function RegionDistributionChart({ filteredData }) {
  const getRegionData = () => {
    const regions = {};
    filteredData.forEach(item => {
      if (!regions[item.region]) {
        regions[item.region] = 0;
      }
      regions[item.region] += item.total_price;
    });

    return Object.entries(regions).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  };

  const regionData = getRegionData();

  return (
    <div className="chart-container">
      <h2>Sales Distribution by Region</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={regionData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {regionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RegionDistributionChart;
