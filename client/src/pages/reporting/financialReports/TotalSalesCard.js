// TotalSalesCard.js
import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import './FinancialReports.css'; // Import your CSS file

const TotalSalesCard = ({ totalSales }) => {
  return (
    <Card className="total-sales-card">
      <Box className="header">
        <Typography variant="subtitle2" className="users-title">
          Total Sales Today
        </Typography>
        <Typography variant="h4" component="div" className="users-count">
          ${totalSales.toFixed(2)} {/* Format the number to two decimal places */}
        </Typography>
      </Box>
    </Card>
  );
};

export default TotalSalesCard;
