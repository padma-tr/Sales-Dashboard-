import React from 'react';
import './Filters.css';

function Filters({ salesData, filters, setFilters }) {
  const uniqueRegions = [...new Set(salesData.map(item => item.region))];
  const uniqueProducts = [...new Set(salesData.map(item => item.product))];

  const handleRegionChange = (region) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter(r => r !== region)
      : [...filters.regions, region];
    setFilters({ ...filters, regions: newRegions });
  };

  const handleProductChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFilters({ ...filters, products: selectedOptions });
  };

  const handleDateChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    setFilters({ regions: [], products: [], startDate: '', endDate: '' });
  };

  return (
    <div className="filters-container">
      <h3>Filters</h3>
      
      <div className="filter-group">
        <label>Regions:</label>
        <div className="checkbox-group">
          {uniqueRegions.map(region => (
            <label key={region} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.regions.includes(region)}
                onChange={() => handleRegionChange(region)}
              />
              {region}
            </label>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label>Products:</label>
        <select 
          multiple 
          value={filters.products} 
          onChange={handleProductChange}
          className="product-select"
        >
          {uniqueProducts.map(product => (
            <option key={product} value={product}>{product}</option>
          ))}
        </select>
      </div>

      <div className="filter-group date-filters">
        <div>
          <label>Start Date:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
          />
        </div>
        <div>
          <label>End Date:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <button onClick={clearFilters} className="clear-filters-btn">
        Clear All Filters
      </button>
    </div>
  );
}

export default Filters;
