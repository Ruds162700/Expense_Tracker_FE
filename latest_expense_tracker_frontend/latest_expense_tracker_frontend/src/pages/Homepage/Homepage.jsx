
import React, { useState } from "react";
import {  Box,  Typography,  Button,  Menu,  MenuItem,  Snackbar, Alert } from "@mui/material";
import Grid from "@mui/material/Grid2";
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import Sidebar from "../../components/Sidebar/Sidebar";
import OverallExpenseCard from "../../components/OverallExpenseCard/OverallExpenseCard";
import ExpensePieChart from "../../components/ExpensePieChart/ExpensePieChart";
import ExpenseLineChart from "../../components/ExpenseLineChart/ExpenseLineChart";
import PersonalExpenseTable from "../../components/PersonalExpenseTable/PersonalExpenseTable";
import GroupExpenseTable from "../../components/GroupExpenseTable/GroupExpenseTable";
import axios from "axios";

const Homepage = () => {
  const [totalExpense, setTotalExpense] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDownload = async (format) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        process.env.REACT_APP_API_BASE_URL + "/user/downloadpdfreport",
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
          params: { format },
          responseType: 'blob',
          withCredentials: true 
        }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expense_report.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      setSnackbar({
        open: true,
        message: `Report downloaded successfully in ${format.toUpperCase()} format`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Download error:', error);
      setSnackbar({
        open: true,
        message: `Error downloading ${format} report`,
        severity: 'error'
      });
    }
    handleClose();
  };
  
  return (
    <Grid container spacing={2}>
  
      <Grid item size={{ xs:12, sm:3, md:2 }}>
        <Sidebar />
      </Grid>

      <Grid item size={{ xs:12, sm:9, md:10 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3 
          }}>
            <Typography 
              variant="h4" 
               sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'}}>
                              Expense & Debt Tracker
                            </Typography>
       
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleClick}
              sx={{
                borderRadius: '8px',
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' }
              }}
            >
              Download Report
            </Button>
            
           
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => handleDownload('PDF')}>
                <PictureAsPdfIcon sx={{ mr: 1 }} />
                PDF Format
              </MenuItem>
              <MenuItem onClick={() => handleDownload('CSV')}>
                <TableViewIcon sx={{ mr: 1 }} />
                CSV Format
              </MenuItem>
            </Menu>
          </Box>

      
          <OverallExpenseCard totalExpense={totalExpense} />

         
          <Grid container spacing={2}>
            <Grid item size={{ xs:12, md:6 }}>
              <ExpensePieChart setTotalExpense={setTotalExpense} />
            </Grid>
            <Grid item size={{ xs:12, md:6 }}>
              <ExpenseLineChart />
            </Grid>
          </Grid>

        
          <PersonalExpenseTable />
          <GroupExpenseTable />
        </Box>
      </Grid>

 
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default Homepage;
