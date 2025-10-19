import React from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ExportButtons.css';

function ExportButtons({ filteredData }) {
  const exportToCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sales_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Sales Dashboard Report', 14, 22);
    
    const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_price, 0);
    doc.setFontSize(12);
    doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 35);
    doc.text(`Total Sales: ${filteredData.length}`, 14, 42);
    
    const tableData = filteredData.map(item => [
      item.sale_id,
      item.date,
      item.region,
      item.product,
      item.quantity,
      `$${item.unit_price.toFixed(2)}`,
      `$${item.total_price.toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: 50,
      head: [['ID', 'Date', 'Region', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
    });
    
    doc.save('sales_report.pdf');
  };

  return (
    <div className="export-buttons">
      <button onClick={exportToCSV} className="export-btn csv-btn">
        Export to CSV
      </button>
      <button onClick={exportToPDF} className="export-btn pdf-btn">
        Export to PDF
      </button>
    </div>
  );
}

export default ExportButtons;
