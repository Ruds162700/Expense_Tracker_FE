import React, { useState, useEffect } from "react";
import { 
  Card, 
  Typography, 
  Chip, 
  Box, 
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const GroupExpenseTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const columns = [
  
    
    { 
      field: "group_name", 
      headerName: "Group Name",
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}>
            <PersonIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    { 
      field: "expenses_text", 
      headerName: "Description", 
      width: 250,
      flex: 1,
    },
    {
      field: "expenses_category",
      headerName: "Category",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ borderRadius: '4px' }}
        />
      ),
    },
    {
      field: "expenses_amount",
      headerName: "Total Amount",
      width: 150,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          ₹{parseFloat(params.value).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: "amount_paid",
      headerName: "You Paid",
      width: 150,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          ₹{parseFloat(params.value).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: "amount_owed",
      headerName: "Your Share",
      width: 150,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#0288d1' }}>
          ₹{parseFloat(params.value).toLocaleString('en-IN')}
        </Typography>
      ),
    },
    {
      field: "balance",
      headerName: "Balance",
      width: 180,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      renderCell: (params) => {
        const balance = parseFloat(params.row.owe) - parseFloat(params.row.debt);
        return (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              color: balance > 0 ? '#2e7d32' : balance < 0 ? '#d32f2f' : '#757575'
            }}
          >
            ₹{Math.abs(balance).toLocaleString('en-IN')}
            {balance !== 0 && (
              <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                {balance > 0 ? '(to receive)' : '(to pay)'}
              </Typography>
            )}
          </Typography>
        );
      },
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          process.env.REACT_APP_API_BASE_URL+"/user/getgrouphistoryofauser",
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true,
          }
        );

        if (response.data.status) {
          const formattedData = response.data.data.map(item => ({
            ...item,
            id: item.expenses_id,
            expenses_date: new Date(item.expenses_date).toISOString().split('T')[0]
          }));
          console.log('Formatted Data:', formattedData);
          setRows(formattedData);
        }
      } catch (error) {
        console.error("Error fetching group expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card sx={{ 
      height: 450,
      boxShadow: 3,
      borderRadius: 2,
      bgcolor: '#ffffff',
    }}>
      <Box sx={{ p: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 3,
            fontWeight: 'bold',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AccountBalanceIcon />
          Group Expense History
        </Typography>
        <DataGrid 
          rows={rows} 
          columns={columns} 
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          loading={loading}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              py: 1,
            },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f5f5f5',
              color: '#212121',
              fontWeight: 'bold',
            },
            '& .MuiDataGrid-columnHeader': {
              overflow: 'visible',
              '& .MuiDataGrid-columnHeaderTitle': {
                whiteSpace: 'normal',
                lineHeight: '1.2',
              },
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: '#f5f5f5',
            },
          }}
        />
      </Box>
    </Card>
  );
};

export default GroupExpenseTable; 