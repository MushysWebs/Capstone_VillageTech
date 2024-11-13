import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Box, TextField, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Divider, Avatar,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';
import { 
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import {
  Person,
  PersonOff,
  EventBusy,
  Receipt,
  Schedule,
  AttachMoney,
  MoneyOff,
  PersonAdd, 
  People, 
  Refresh,
  TrendingDown, 
  TrendingUp, 
  AccountBalance
} from '@mui/icons-material';
import { Check, Clock, X } from 'lucide-react';
import './EndOfDayWizard.css';
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const EndOfDayWizard = ({ open, onClose, reportData = null, readOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [data, setData] = useState(null);
  const supabase = useSupabaseClient();


  useEffect(() => {
    if (open) {
      if (reportData) {
        // transform old report data to match current implementation of wizard
        const transformedData = {
          patientStats: reportData.patient_stats || [],
          financialSummary: reportData.financial_summary || {
            invoicesCreated: 0,
            invoicesPaid: 0,
            paymentsReceived: 0,
            paymentsRefunded: 0
          },
          profitBreakdown: reportData.profit_breakdown || []
        };
        setData(transformedData);
        setComment(reportData.comment || '');
        setLoading(false);
      } else {
        fetchData();
      }
    }
  }, [open, reportData]);
  
  const fetchData = async () => {
    if (open) {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const todayEnd = new Date(today);
        todayEnd.setDate(todayEnd.getDate() + 1);
  
        const appointmentStats = await calculateAppointmentStats(today, todayEnd.toISOString());
        
        const { data: invoices, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .gte('invoice_date', today);
  
        if (invoiceError) throw invoiceError;
  
        const financialSummary = processInvoices(invoices);
        const patientStats = await calculatePatientStats(invoices);
        const profitBreakdown = calculateProfitBreakdown(invoices);
  
        setData({
          appointmentStats,
          patientStats,
          financialSummary,
          profitBreakdown,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setData({
          appointmentStats: {
            totalScheduled: 0,
            completed: 0,
            cancelled: 0,
            noShow: 0,
            inProgress: 0,
            walkIns: 0,
            uniquePatients: 0,
            completionRate: 0,
            cancellationRate: 0,
            noShowRate: 0
          },
          patientStats: [
            { name: 'New Patients', value: 0 },
            { name: 'Returning', value: 0 },
          ],
          financialSummary: {
            invoicesCreated: 0,
            invoicesPaid: 0,
            paymentsReceived: 0,
            paymentsRefunded: 0,
          },
          profitBreakdown: [],
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateAppointmentStats = async (todayStart, todayEnd) => {
    try {
      const { data: appointments, error: appointmentError } = await supabase
        .from('appointments')
        .select(`
          id,
          patient_id,
          status,
          start_time,
          title,
          description
        `)
        .gte('start_time', todayStart)
        .lt('start_time', todayEnd);
  
      if (appointmentError) throw appointmentError;
  
      const stats = {
        totalScheduled: appointments.length,
        completed: appointments.filter(apt => apt.status === 'Completed').length,
        cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
        inProgress: appointments.filter(apt => apt.status === 'In Progress').length,
        walkIns: appointments.filter(apt => apt.title.toLowerCase().includes('walk-in')).length,
        uniquePatients: new Set(appointments.map(apt => apt.patient_id)).size
      };
  
      stats.completionRate = (stats.completed / stats.totalScheduled) * 100;
      stats.cancellationRate = (stats.cancelled / stats.totalScheduled) * 100;
      stats.noShowRate = (stats.noShow / stats.totalScheduled) * 100;
  
      return stats;
    } catch (error) {
      console.error('Error calculating appointment stats:', error);
      return {
        totalScheduled: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        inProgress: 0,
        walkIns: 0,
        uniquePatients: 0,
        completionRate: 0,
        cancellationRate: 0,
        noShowRate: 0
      };
    }
  };

  const processInvoices = (invoices) => {
    const invoicesCreated = invoices.length;
    const invoicesPaid = invoices.filter(inv => inv.invoice_status === 'Completed').length;
    const paymentsReceived = invoices.reduce((sum, inv) => inv.invoice_status === 'Completed' ? sum + inv.invoice_total : sum, 0);
    const paymentsRefunded = invoices.reduce((sum, inv) => inv.invoice_status === 'Cancelled' ? sum + inv.invoice_total : sum, 0);

    return {
      invoicesCreated,
      invoicesPaid,
      paymentsReceived,
      paymentsRefunded,
    };
  };

  const calculatePatientStats = async (todaysInvoices) => {
    try {
      // unique patient IDs from today's invoices
      const uniquePatientIds = [...new Set(todaysInvoices.map(inv => inv.patient_id))];
      
      const { data: historicalInvoices, error } = await supabase
        .from('invoices')
        .select('patient_id, invoice_date')
        .in('patient_id', uniquePatientIds)
        .lt('invoice_date', new Date().toISOString().split('T')[0]) // Only get invoices before today
        .order('invoice_date', { ascending: true });
  
      if (error) throw error;
  
      const returningPatientIds = new Set(
        historicalInvoices.map(inv => inv.patient_id)
      );
  
      let newPatients = 0;
      let returningPatients = 0;
  
      uniquePatientIds.forEach(patientId => {
        if (returningPatientIds.has(patientId)) {
          returningPatients++;
        } else {
          newPatients++;
        }
      });
  
      return [
        { name: 'New Patients', value: newPatients },
        { name: 'Returning', value: returningPatients },
      ];
    } catch (error) {
      console.error('Error calculating patient stats:', error);
      return [
        { name: 'New Patients', value: 0 },
        { name: 'Returning', value: 0 },
      ];
    }
  };

  const calculateProfitBreakdown = (invoices) => {
    // simplified breakdown
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.invoice_total, 0);
    
    return [
      { name: 'Medicine', value: totalRevenue * 0.3 },
      { name: 'Staff Pay', value: totalRevenue * 0.4 }, 
      { name: 'Utilities', value: totalRevenue * 0.1 }, 
      { name: 'Other Expenses', value: totalRevenue * 0.1 }, 
      { name: 'Invoice Revenue', value: totalRevenue },
    ];
  };
  /*
  data fetching with dummy data
  const fetchData = async () => {
    if (open) {
      setTimeout(() => {
        setData({
          employeesStatus: [
            { name: 'Still Clocked In', value: 5 },
            { name: 'Clocked Out', value: 15 },
            { name: 'Absent', value: 2 },
            { name: 'Scheduled', value: 22 },
          ],
          patientStats: [
            { name: 'New Patients', value: 8 },
            { name: 'Returning Patients', value: 37 },
          ],
          financialSummary: {
            invoicesCreated: 40,
            invoicesPaid: 35,
            paymentsReceived: 5000,
            paymentsRefunded: 200,
          },
          profitBreakdown: [
            { name: 'Medicine', value: 1000 },
            { name: 'Staff Pay', value: 3000 },
            { name: 'Utilities', value: 500 },
            { name: 'Other Expenses', value: 500 },
            { name: 'Invoice Revenue', value: 8000 },
            { name: 'Other Revenue', value: 2000 },
          ],
        });
        setLoading(false);
      }, 2000);
    }
  };
  */

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async () => {
    if (readOnly) {
      onClose();
      return;
    }
  
    const reportToSave = {
      date: new Date().toISOString().split('T')[0],
      appointment_stats: data.appointmentStats,
      patient_stats: data.patientStats,
      financial_summary: data.financialSummary,
      profit_breakdown: data.profitBreakdown,
      comment: comment,
      created_at: new Date().toISOString()
    };
  
    try {
      const { data: savedReport, error } = await supabase
        .from('end_of_day_reports')
        .insert(reportToSave);
  
      if (error) throw error;
      console.log('Report saved successfully:', savedReport);
      onClose();
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };


  const renderPatientStats = () => {
    const totalPatients = data.patientStats.reduce((acc, curr) => acc + curr.value, 0);
    const COLORS = ['#0088FE', '#00C49F'];
    
    return (
      <Grid item xs={12}>
        <Card className="summary-card patient-stats">
          <Typography variant="h6" gutterBottom>Patient Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.patientStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.patientStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <People style={{ color: '#0088FE' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Patients" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {totalPatients}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonAdd style={{ color: '#00C49F' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="New Patients" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {data.patientStats.find(stat => stat.name === 'New Patients').value}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Refresh style={{ color: '#0088FE' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Returning" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {data.patientStats.find(stat => stat.name === 'Returning').value}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    );
  };
  const renderFinancialSummary = () => (
    <Grid item xs={12}>
      <Card className="summary-card financial-summary">
        <Typography variant="h6" gutterBottom>Financial Summary</Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Invoices Created', value: data.financialSummary.invoicesCreated, icon: Receipt, color: '#2196F3' },
            { label: 'Invoices Paid', value: data.financialSummary.invoicesPaid, icon: AttachMoney, color: '#4CAF50' },
            { label: 'Payments Received', value: `$${data.financialSummary.paymentsReceived}`, icon: AttachMoney, color: '#4CAF50' },
            { label: 'Payments Refunded', value: `$${data.financialSummary.paymentsRefunded}`, icon: MoneyOff, color: '#F44336' },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box display="flex" alignItems="center" padding={2} bgcolor={item.color + '22'} borderRadius={2}>
                <Avatar style={{ backgroundColor: item.color, marginRight: '16px' }}>
                  <item.icon />
                </Avatar>
                <Box>
                  <Typography variant="h5" style={{ color: item.color }}>{item.value}</Typography>
                  <Typography variant="body2" color="textSecondary">{item.label}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Grid>
  );

  const renderAppointmentStats = () => {
    const appointmentData = data.appointmentStats;
    const COLORS = {
      Completed: '#16a34a',    // Green
      'In Progress': '#ca8a04', // Yellow/Orange
      Cancelled: '#dc2626'     // Red
    };
    
    const pieData = [
      { name: 'Completed', value: appointmentData.completed },
      { name: 'In Progress', value: appointmentData.inProgress },
      { name: 'Cancelled', value: appointmentData.cancelled }
    ];
  
    return (
      <Grid item xs={12}>
        <Card className="summary-card appointment-stats">
          <Typography variant="h6" gutterBottom>Appointment Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Schedule style={{ color: '#09ACE0' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Scheduled" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {appointmentData.totalScheduled}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check style={{ color: '#16a34a' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Completed" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {appointmentData.completed}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Clock style={{ color: '#ca8a04' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="In Progress" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {appointmentData.inProgress}
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <X style={{ color: '#dc2626' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Cancelled" 
                    secondary={
                      <Typography variant="h4" component="span">
                        {appointmentData.cancelled}
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    );
  };
  
  const renderProfitBreakdown = () => {
    const expenses = data.profitBreakdown.filter(item => !item.name.includes('Revenue'));
    const revenue = data.profitBreakdown.filter(item => item.name.includes('Revenue'));
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.value, 0);
    const totalRevenue = revenue.reduce((acc, curr) => acc + curr.value, 0);
    const netProfit = totalRevenue - totalExpenses;

    return (
      <Grid item xs={12}>
        <Card className="summary-card profit-breakdown">
          <Typography variant="h6" gutterBottom>Profit Breakdown</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" align="center">Expenses</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
              <Box className="financial-summary-item" bgcolor="#ffcccb">
                <Typography variant="subtitle1">Total Expenses</Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <TrendingDown style={{ color: '#d32f2f', marginRight: '8px' }} />
                  <Typography variant="h4" style={{ color: '#d32f2f' }}>${totalExpenses.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" align="center">Revenue</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#4caf50" />
                </BarChart>
              </ResponsiveContainer>
              <Box className="financial-summary-item" bgcolor="#c8e6c9">
                <Typography variant="subtitle1">Total Revenue</Typography>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <TrendingUp style={{ color: '#388e3c', marginRight: '8px' }} />
                  <Typography variant="h4" style={{ color: '#388e3c' }}>${totalRevenue.toFixed(2)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <Box className="financial-summary-item" bgcolor={netProfit >= 0 ? '#e3f2fd' : '#ffcccb'} mt={2}>
            <Typography variant="subtitle1">Net Profit</Typography>
            <Box display="flex" alignItems="center" justifyContent="center">
              <AccountBalance style={{ color: netProfit >= 0 ? '#1976d2' : '#d32f2f', marginRight: '8px' }} />
              <Typography variant="h4" style={{ color: netProfit >= 0 ? '#1976d2' : '#d32f2f' }}>${netProfit.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Card>
      </Grid>
    );
  };
  

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{readOnly ? 'View End of Day Report' : 'End of Day Wizard'}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography>Generating report...</Typography>
        ) : (
          <Box className="end-of-day-content">
           <Grid container spacing={3}>
            {renderAppointmentStats()}
            {renderPatientStats()}
            {renderFinancialSummary()}
            {renderProfitBreakdown()}
          </Grid>
          </Box>
        )}
        <Divider style={{ margin: '24px 0' }} />
        <Box className="comment-section">
          <Typography variant="h6" gutterBottom>
            End of Day Comments
          </Typography>
          <TextField
          label="End of Day Comments"
          multiline
          rows={4}
          value={comment}
          onChange={handleCommentChange}
          fullWidth
          variant="outlined"
          disabled={readOnly}
        />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!readOnly && (
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
            Submit Report
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EndOfDayWizard;