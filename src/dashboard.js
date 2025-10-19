import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'https://68d424b8214be68f8c6887f1.mockapi.io/api/mozilla/tech/web/task/sales';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function App() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setSalesData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalRevenue = salesData.reduce((sum, item) => sum + item.total_price, 0);
  const totalSales = salesData.length;

  const getSalesTrends = () => {
    const trends = {};
    salesData.forEach(item => {
      if (!trends[item.date]) trends[item.date] = 0;
      trends[item.date] += item.total_price;
    });
    return Object.entries(trends)
      .map(([date, total]) => ({ date, total: parseFloat(total.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getRegionData = () => {
    const regions = {};
    salesData.forEach(item => {
      if (!regions[item.region]) regions[item.region] = 0;
      regions[item.region] += item.total_price;
    });
    return Object.entries(regions).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }));
  };

  const getTopProducts = () => {
    const products = {};
    salesData.forEach(item => {
      if (!products[item.product]) {
        products[item.product] = { quantity: 0, revenue: 0 };
      }
      products[item.product].quantity += item.quantity;
      products[item.product].revenue += item.total_price;
    });
    return Object.entries(products)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px', fontSize:'24px'}}>Loading Dashboard...</div>;

  const salesTrends = getSalesTrends();
  const regionData = getRegionData();
  const topProducts = getTopProducts();

  return (
    <div style={{fontFamily: 'Arial, sans-serif', padding: '20px', background: '#f5f7fa', minHeight: '100vh'}}>
      <header style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', marginBottom: '30px'}}>
        <h1 style={{margin: 0, fontSize: '2.5em'}}>Sales Dashboard</h1>
        <p style={{margin: '10px 0 0 0', fontSize: '1.2em'}}>Real-time Sales Analytics</p>
      </header>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <h3 style={{color: '#666', margin: 0}}>Total Revenue</h3>
          <p style={{fontSize: '2em', fontWeight: 'bold', color: '#667eea', margin: '15px 0 0 0'}}>${totalRevenue.toFixed(2)}</p>
        </div>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <h3 style={{color: '#666', margin: 0}}>Total Sales</h3>
          <p style={{fontSize: '2em', fontWeight: 'bold', color: '#667eea', margin: '15px 0 0 0'}}>{totalSales}</p>
        </div>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', textAlign: 'center'}}>
          <h3 style={{color: '#666', margin: 0}}>Avg Sale Value</h3>
          <p style={{fontSize: '2em', fontWeight: 'bold', color: '#667eea', margin: '15px 0 0 0'}}>${(totalRevenue / totalSales).toFixed(2)}</p>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px', marginBottom: '30px'}}>
        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0}}>Sales Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Sales ($)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginTop: 0}}>Sales by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionData}
                cx="50%"
                cy="50%"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                dataKey="value"
              >
                {regionData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <h2 style={{marginTop: 0}}>Top 5 Products by Revenue</h2>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#667eea', color: 'white'}}>
              <th style={{padding: '15px', textAlign: 'left'}}>Rank</th>
              <th style={{padding: '15px', textAlign: 'left'}}>Product</th>
              <th style={{padding: '15px', textAlign: 'left'}}>Quantity</th>
              <th style={{padding: '15px', textAlign: 'left'}}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index} style={{borderBottom: '1px solid #ddd'}}>
                <td style={{padding: '15px'}}>{index + 1}</td>
                <td style={{padding: '15px'}}>{product.name}</td>
                <td style={{padding: '15px'}}>{product.quantity}</td>
                <td style={{padding: '15px'}}>${product.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
