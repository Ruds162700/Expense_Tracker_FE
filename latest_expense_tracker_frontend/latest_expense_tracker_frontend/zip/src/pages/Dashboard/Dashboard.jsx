
import React, { useState, useEffect } from "react";
import { 
  Container, 
  Paper, 
  Typography, 
  Box,
  Card,
  CardContent,
  IconButton,
  Fade,
  useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Sidebar from "../../components/Sidebar/Sidebar";
import ExpenseTable from "../../components/ExpenseTable/ExpenseTable";
import ProfileModal from "../../components/ProfileModel/ProfileModel";
import ExpenseChart from "../../components/ExpenseChart/ExpenseChart";
import ExpenseActions from "../../components/ExpenseAction/ExpenseAction";
import { useNavigate } from "react-router-dom";
import { personalExpenseApi } from '../../api/api';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RefreshIcon from '@mui/icons-material/Refresh';

const Dashboard = () => {
  const [openProfile, setOpenProfile] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [expensesData, totalExpenseAmount] = await Promise.all([
        personalExpenseApi.fetchExpenses(),
        personalExpenseApi.fetchTotalExpense()
      ]);

      setExpenses(expensesData);
      setTotalExpense(totalExpenseAmount);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefreshData = async () => {
    await fetchData();
    setRefreshTrigger(prev => prev + 1);
  };


  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: '#f8f9fa'
    }}>
      <Sidebar onProfileClick={() => setOpenProfile(true)} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%' }}>
        <Container maxWidth="xl">
          <Fade in={true}>
            <Box>
         
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4 
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Dashboard
                </Typography>
                <IconButton onClick={handleRefreshData} color="primary">
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item size = {{xs:12, md:4 }}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      color: 'white',
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                        <Typography variant="h6">Total Expenses</Typography>
                      </Box>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        ₹{totalExpense.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item size = {{xs:12 , md:8}}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4,
                      height: '100%',
                      bgcolor: 'white'
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="h6">Quick Actions</Typography>
                      </Box>
                      <ExpenseActions onAddExpense={handleRefreshData} />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts and Tables */}
              <Grid container spacing={3}>
                <Grid item size = {{xs:12,md:8}}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4,
                      bgcolor: 'white',
                      height: '400px'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Expense Overview
                      </Typography>
                      <ExpenseChart refreshTrigger={refreshTrigger} />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={12}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 4,
                      bgcolor: 'white',
                      mt: 3
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 3 }}>
                        Recent Expenses
                      </Typography>
                      <ExpenseTable 
                        refreshTrigger={refreshTrigger}
                        onDataChange={handleRefreshData}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>

      <ProfileModal 
        open={openProfile} 
        onClose={() => setOpenProfile(false)} 
      />
    </Box>
  );
};

export default Dashboard;
