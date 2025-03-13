import React, { useState } from 'react';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import FileUpload from './components/FileUpload';
import BidAnalysisTable from './components/BidAnalysisTable';
import DownloadIcon from '@mui/icons-material/Download';

const App = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [contractors, setContractors] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  const handleFilesAccepted = async (files) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze bids');
      }

      const result = await response.json();
      setAnalysisData(result.data);
      setContractors(result.contractors);
      setNotification({
        open: true,
        message: 'Bid analysis completed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error analyzing bids:', error);
      setNotification({
        open: true,
        message: 'Error analyzing bids. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: analysisData, contractors })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bid-analysis.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setNotification({
        open: true,
        message: 'Export completed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      setNotification({
        open: true,
        message: 'Error exporting data. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            CRE Bid Analyzer
          </Typography>
          {analysisData && (
            <Button
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
            >
              Export to Excel
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <FileUpload
          onFilesAccepted={handleFilesAccepted}
          isUploading={isUploading}
        />

        {analysisData && (
          <BidAnalysisTable
            data={analysisData}
            contractors={contractors}
          />
        )}

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default App; 