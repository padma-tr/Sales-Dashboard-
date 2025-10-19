import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const API_URL = 'https://68d424b8214be68f8c6887f1.mockapi.io/api/mozilla/tech/web/task/sales';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function App() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters (separate state for allOptions vs. current selection)
  const [region, setRegion] = useState('');
  const [product, setProduct] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);

  // Fetch and normalize
  useEffect(() => {
    let interval;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        let data = await res.json();
        data = data.map(s => ({
          ...s,
          region: s.region || s.reigon || '',
          sale_id: s.sale_id || s.id || '',
          date: typeof s.date === 'string' ? s.date : '',
        }));
        setSales(data);
      } catch {
        setSales([]);
      }
      setLoading(false);
    };
    fetchData();
    interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Region options and product options dynamically update
  const regionOptions = Array.from(new Set(sales.map(s => s.region).filter(x => !!x)));

  // When region changes, pick only products for that region (or all if no region selected)
  useEffect(() => {
    let filtered = sales;
    if (region) filtered = sales.filter(s => s.region === region);
    const prods = Array.from(new Set(filtered.map(s => s.product).filter(x => !!x)));
    setAvailableProducts(prods);
    // reset product if current selection is not in options any more
    if (product && !prods.includes(product)) setProduct('');
  }, [region, product, sales]);

  // Filtering
  function filteredSales() {
    return sales.filter(s =>
      (!region || s.region === region) &&
      (!product || s.product === product) &&
      (!dateStart || (!s.date || s.date >= dateStart)) &&
      (!dateEnd || (!s.date || s.date <= dateEnd))
    );
  }
  const rows = filteredSales();

  // Metrics
  const totalRevenue = rows.reduce((sum, s) => sum + (s.total_price ? parseFloat(s.total_price) : 0), 0);
  const totalSales = rows.length;

  // Sales Trends
  const salesTrends = Object.values(
    rows.reduce((acc, s) => {
      if (s.date) {
        if (!acc[s.date]) acc[s.date] = { date: s.date, revenue: 0 };
        acc[s.date].revenue += s.total_price ? parseFloat(s.total_price) : 0;
      }
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

  // Region Distribution
  const regionData = Object.values(
    rows.reduce((acc, s) => {
      if (s.region) {
        if (!acc[s.region]) acc[s.region] = { name: s.region, value: 0 };
        acc[s.region].value += s.total_price ? parseFloat(s.total_price) : 0;
      }
      return acc;
    }, {})
  );

  // Top 5 Products by Revenue
  const topProducts = Object.values(
    rows.reduce((acc, s) => {
      if (s.product) {
        if (!acc[s.product]) acc[s.product] = { name: s.product, quantity: 0, revenue: 0 };
        acc[s.product].quantity += s.quantity ? parseInt(s.quantity) : 0;
        acc[s.product].revenue += s.total_price ? parseFloat(s.total_price) : 0;
      }
      return acc;
    }, {})
  ).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // CSV Export
  function exportCSV() {
    const header = "Date,Region,Product,Quantity,Unit Price,Total Price\n";
    const data = rows.map(s =>
      [s.date, s.region, s.product, s.quantity, s.unit_price, s.total_price].join(",")
    ).join("\n");
    const blob = new Blob([header + data], { type: "text/csv" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sales-data.csv';
    a.click();
  }

  return (
    <main style={{
      fontFamily: 'Segoe UI, Arial, sans-serif',
      background: '#f7f8fa',
      minHeight: '100vh',
      padding: 0
    }} aria-label="Sales Dashboard">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2em',
        borderRadius: '0 0 18px 18px',
        textAlign: 'center'
      }}>
        <h1 style={{fontSize: '2.7em', fontWeight: '700', margin: '0 0 0.3em'}}>Sales Analytics Dashboard</h1>
        <p style={{fontSize: '1.25em'}}>Live sales data, trends, and insights</p>
      </header>

      {/* Filters */}
      <section aria-label="Dashboard Filters" style={{
        margin: '30px auto 0', maxWidth: 950, display: 'flex', flexWrap: 'wrap', gap: '1.5em', justifyContent: 'center'
      }}>
        <label htmlFor="regionSel">Region:
          <select id="regionSel" aria-label="Select region"
            value={region} onChange={e=>setRegion(e.target.value)} style={{marginLeft:10}}>
            <option value="">All</option>
            {regionOptions.map(r => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label htmlFor="productSel">Product:
          <select id="productSel" aria-label="Select product"
            value={product} onChange={e=>setProduct(e.target.value)} style={{marginLeft:10}}>
            <option value="">All</option>
            {availableProducts.map(p => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label htmlFor="dateStart">Date Start:
          <input id="dateStart" type="date" value={dateStart} onChange={e=>setDateStart(e.target.value)} style={{marginLeft:10}}/>
        </label>
        <label htmlFor="dateEnd">Date End:
          <input id="dateEnd" type="date" value={dateEnd} onChange={e=>setDateEnd(e.target.value)} style={{marginLeft:10}}/>
        </label>
        <button onClick={exportCSV} style={{background:'#667eea', color:'white', borderRadius:7, border:'none', padding:'0.4em 1em', fontWeight:500, cursor:'pointer'}}>Export CSV</button>
      </section>

      {/* Stats cards */}
      <section aria-label="Top Metrics" style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1.5em', margin:'38px auto 0', maxWidth:950
      }}>
        <div style={{
          background:'#fff', borderRadius:12, padding:'2em', textAlign:'center', boxShadow:'0 0 30px #667eea14'
        }}>
          <h2 style={{color:'#667eea', margin:'0', fontSize:'1.7em'}}>Total Revenue</h2>
          <p style={{fontSize:'2em', fontWeight:700, margin:'0.3em 0 0', color:'#764ba2'}}>
            ₹{totalRevenue.toLocaleString('en-IN', {minimumFractionDigits:2})}
          </p>
        </div>
        <div style={{
          background:'#fff', borderRadius:12, padding:'2em', textAlign:'center', boxShadow:'0 0 30px #667eea14'
        }}>
          <h2 style={{color:'#667eea', margin:'0', fontSize:'1.7em'}}>Total Sales</h2>
          <p style={{fontSize:'2em', fontWeight:700, margin:'0.3em 0 0', color:'#764ba2'}}>
            {totalSales}
          </p>
        </div>
        <div style={{
          background:'#fff', borderRadius:12, padding:'2em', textAlign:'center', boxShadow:'0 0 30px #667eea14'
        }}>
          <h2 style={{color:'#667eea', margin:'0', fontSize:'1.7em'}}>Average Sale Value</h2>
          <p style={{fontSize:'2em', fontWeight:700, margin:'0.3em 0 0', color:'#764ba2'}}>
            ₹{(totalRevenue/Math.max(1,totalSales)).toLocaleString('en-IN',{minimumFractionDigits:2})}
          </p>
        </div>
      </section>

      <section aria-label="Charts" style={{
        margin: '40px auto', maxWidth: 950, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(425px, 1fr))', gap:'2em'
      }}>
        {/* Sales Trends */}
        <div style={{
          background:'#fff', borderRadius:12, padding:'2em', boxShadow:'0 0 30px #667eea14'
        }}>
          <h3>Sales Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Region Distribution */}
        <div style={{
          background:'#fff', borderRadius:12, padding:'2em', boxShadow:'0 0 30px #667eea14'
        }}>
          <h3>Sales Distribution by Region</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={regionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                label={({ percent, name }) => `${name}: ${(percent*100).toFixed(1)}%`}>
                {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section aria-label="Top Products" style={{
        background:'#fff', borderRadius:12, padding:'2em', boxShadow:'0 0 30px #667eea14', margin:'0 auto 40px', maxWidth:950
      }}>
        <h3>Top 5 Products by Revenue</h3>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#ece9f7', color:'#667eea'}}>
                <th style={{padding:'12px 6px', textAlign:'left'}}>Rank</th>
                <th style={{padding:'12px 6px', textAlign:'left'}}>Product</th>
                <th style={{padding:'12px 6px', textAlign:'left'}}>Quantity</th>
                <th style={{padding:'12px 6px', textAlign:'left'}}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p,i)=>
                <tr key={p.name} style={{borderBottom:'1px solid #f0f0f0'}}>
                  <td style={{padding:'10px 6px'}}>{i+1}</td>
                  <td style={{padding:'10px 6px'}}>{p.name}</td>
                  <td style={{padding:'10px 6px'}}>{p.quantity}</td>
                  <td style={{padding:'10px 6px'}}>₹{p.revenue.toLocaleString('en-IN',{minimumFractionDigits:2})}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* All Sales Table */}
      <section aria-label="All Sales Records"
        style={{background:'#fff', borderRadius:12, padding:'2em', boxShadow:'0 0 30px #667eea14', margin:'30px auto 40px', maxWidth:950, overflowX:'auto'}}>
        <h3>All Sales Records</h3>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#ece9f7', color: '#667eea'}}>
              <th style={{padding: '12px 6px', textAlign: 'left'}}>Date</th>
              <th style={{padding: '12px 6px', textAlign: 'left'}}>Region</th>
              <th style={{padding: '12px 6px', textAlign: 'left'}}>Product</th>
              <th style={{padding: '12px 6px', textAlign: 'left'}}>Quantity</th>
              <th style={{padding: '12px 6px', textAlign: 'left'}}>Unit Price</th>
              <th style={{padding: '12px 6px', textAlign: 'left'}}>Total Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <tr key={i} style={{borderBottom: '1px solid #f0f0f0'}}>
                <td style={{padding: '10px 6px'}}>{s.date}</td>
                <td style={{padding: '10px 6px'}}>{s.region}</td>
                <td style={{padding: '10px 6px'}}>{s.product}</td>
                <td style={{padding: '10px 6px'}}>{s.quantity}</td>
                <td style={{padding: '10px 6px'}}>₹{Number(s.unit_price).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                <td style={{padding: '10px 6px'}}>₹{Number(s.total_price).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {loading && <p style={{textAlign:'center',color:'#667eea',fontWeight:500,fontSize:'1.25em'}}>Loading data...</p>}
      <footer style={{
        textAlign:'center', margin:'0 0 28px', color:'#667eea', fontSize:'1em'
      }}>© 2025 Your Company. Mobile-friendly & accessible dashboard.</footer>
    </main>
  );
}

export default App;
