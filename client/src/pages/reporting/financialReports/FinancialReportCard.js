// FinancialReportCard.js
import React from 'react';
import { Card, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './FinancialReports.css';  // Import your CSS file

const FinancialReportCard = ({ data, title, count, percentage }) => {
  return (
    <Card className="financial-report-card">
      <Box className="header">
        <Box>
          <Typography variant="subtitle2" className="users-title">
            {title}
          </Typography>
          <Typography variant="h4" component="div" className="users-count">
            {count}
          </Typography>
          <Typography variant="body2" className="last-30-days">
            Last 7 days
          </Typography>
        </Box>
        <Box className="percentage-box">
          <Typography variant="body2" className="percentage-text">
            {percentage}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="users" stroke="#52b202" strokeWidth={2} />
          <XAxis dataKey="name" hide />
          <YAxis hide />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default FinancialReportCard;
