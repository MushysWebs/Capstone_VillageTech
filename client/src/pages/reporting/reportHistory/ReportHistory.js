import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button,
  Typography, CircularProgress, Container
} from '@mui/material';
import EndOfDayWizard from '../endOfDayWizard/EndOfDayWizard';
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ReportingTabs from '../../../components/ReportingTabs';
import './ReportHistory.css';

const ReportHistory = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = useSupabaseClient();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('end_of_day_reports')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      console.log('Fetched reports:', data);
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReport = (report) => {
    setSelectedReport(report);
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setSelectedReport(null);
  };

  return (
    <div className="financial-reports-container">
      <ReportingTabs />
      <Container className="report-history-container">
        <Typography variant="h4" gutterBottom>End of Day Report History</Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : reports.length === 0 ? (
          <Typography>No reports available.</Typography>
        ) : (
          <TableContainer component={Paper} className="report-table">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(report.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => handleOpenReport(report)}
                      >
                        View Report
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {isWizardOpen && (
          <EndOfDayWizard
            open={isWizardOpen}
            onClose={handleCloseWizard}
            reportData={selectedReport}
            readOnly={true}
          />
        )}
      </Container>
    </div>
  );
};

export default ReportHistory;