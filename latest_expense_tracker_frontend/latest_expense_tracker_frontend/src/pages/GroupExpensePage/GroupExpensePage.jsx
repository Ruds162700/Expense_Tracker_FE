import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Chip, IconButton, Tooltip, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem} from "@mui/material";
import Grid from "@mui/material/Grid2"
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";
import AddGroupExpense from "../../components/AddGroupExpense/AddGroupExpense";
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const ExpenseCard = ({ expense, onEdit, onDelete }) => {
  console.log("ExpenseCard - Raw expense data:", {
    id: expense.expenses_id,
    details: expense.details,
    description: expense.description
  });
  const [expanded, setExpanded] = useState(false);

  const handleAction = (action, e) => {
    e.stopPropagation();
    action(expense);
  };

  return (
    <Paper 
      sx={{ 
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'scale(1.01)',
          boxShadow: 3,
        }
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <Box sx={{ 
        p: 2, 
        bgcolor: '#f8f9fa',
        borderBottom: expanded ? '1px dashed #e0e0e0' : 'none'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {expense.description}
            </Typography>
            <Chip
              label={expense.category}
              color="primary"
              size="small"
              sx={{ borderRadius: '4px' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Edit Expense">
              <IconButton 
                size="small" 
                color="info"
                onClick={(e) => handleAction(onEdit, e)}
                sx={{ '&:hover': { bgcolor: '#e0f7fa' } }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Expense">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => handleAction(onDelete, e)}
                sx={{ '&:hover': { bgcolor: '#ffebee' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {new Date(expense.date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: '#1976d2' }}>
                <PersonIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="body2">Recorded by: {expense.recorded_by}</Typography>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            ₹{parseFloat(expense.amount_total).toLocaleString('en-IN')}
          </Typography>
        </Box>
      </Box>

      {expanded && (
  <Box sx={{ p: 2, bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
    <Typography
      variant="subtitle2"
      sx={{
        color: "#1976d2",
        mb: 2,
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "1.1rem",
      }}
    >
      Split Details
    </Typography>

    <Grid container spacing={3}>
      {/* Left Side: Who Paid */}
      <Grid item xs={12} sm={6}>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 1,
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "2px solid #4caf50",
            pb: 0.5,
          }}
        >
          Paid By
        </Typography>
        {expense.details.map((detail, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              bgcolor: detail.contribution > 0 ? "#e8f5e9" : "#f9fbe7",
              borderRadius: 2,
              border: "1px solid",
              borderColor: detail.contribution > 0 ? "#81c784" : "#c5e1a5",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#4caf50" }}>
                <PersonIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                {detail.user}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: detail.contribution > 0 ? "#2e7d32" : "#757575",
              }}
            >
              ₹{detail.contribution.toLocaleString("en-IN")}
            </Typography>
          </Box>
        ))}
      </Grid>

      {/* Right Side: Who Owes Whom */}
      <Grid item xs={12} sm={6}>
        <Typography
          variant="subtitle1"
          sx={{
            mb: 1,
            fontWeight: "bold",
            textAlign: "center",
            borderBottom: "2px solid #ff9800",
            pb: 0.5,
          }}
        >
          Needs to Pay
        </Typography>
        {expense.optimized_transactions.length > 0 ? (
          expense.optimized_transactions.map((transaction, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                bgcolor: "#fff8e1",
                borderRadius: 2,
                border: "1px solid #ffb74d",
                mb: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "#ff9800" }}>
                  <PersonIcon sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: "medium" }}>
                  {transaction.from} → {transaction.to}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", color: "#d32f2f" }}
              >
                ₹{transaction.amount.toLocaleString("en-IN")}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", color: "#757575", mt: 2 }}
          >
            No pending payments.
          </Typography>
        )}
      </Grid>
    </Grid>
  </Box>
)}

    </Paper>
  );
};

const GroupExpensePage = () => {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const groupName = location.state?.group_name || "Group Expense";

  const [openModal, setOpenModal] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [groupMembers, setGroupMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchExpenseHistory = async () => {
    try {
      console.log("fetchExpenseHistory - Starting fetch");
      const token = localStorage.getItem("token");
      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + "/group/getgrouphistory",
        { g_id: groupId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      console.log("fetchExpenseHistory - Raw response:", response.data);

      if (response.data.status) {
        const expensesWithUserIds = response.data.data.map(expense => {
          console.log("fetchExpenseHistory - Processing expense:", {
            id: expense.expenses_id,
            details: expense.details
          });

          return {
            ...expense,
            details: expense.details.map(detail => {
              console.log("fetchExpenseHistory - Processing detail:", detail);
              
              const matchingMember = groupMembers.find(
                m => m.user_name === detail.user || 
                    m.user_name === detail.user_name || 
                    m.user_id === detail.user_id
              );

              console.log("fetchExpenseHistory - Matching member:", matchingMember);

              return {
                ...detail,
                user_id: detail.user_id || 
                        detail.userid || 
                        matchingMember?.user_id || 
                        groupMembers.find(m => m.user_name === detail.user)?.user_id
              };
            })
          };
        });

        console.log("fetchExpenseHistory - Final processed expenses:", expensesWithUserIds);
        setExpenses(expensesWithUserIds);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to fetch expense history',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error("fetchExpenseHistory - Error:", err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch expense history',
        severity: 'error'
      });
    }
  };

  const fetchGroupTotal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + "/group/getgrouptotal",
        { id: groupId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      if (response.data.status) {
        setTotalExpense(response.data.total);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to fetch group total',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error("Error fetching total:", err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch group total',
        severity: 'error'
      });
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setSnackbar({
          open: true,
          message: "No token found. Please login.",
          severity: "error"
        });
        return;
      }

      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + "/group/getmembersandtotal",
        { group_id: groupId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.status) {
        const formattedMembers = response.data.data.map(member => ({
          user_id: member.user_id,
          user_name: member.user_name,
          total_contribution: parseFloat(member.total_contribution) || 0
        }));

        setGroupMembers(formattedMembers);
      } else {
        throw new Error(response.data.message || 'Failed to fetch group members');
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
      
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: "Session expired. Please login again.",
          severity: "error"
        });
        navigate('/login');
        return;
      }

      if (error.response?.status === 404) {
        setSnackbar({
          open: true,
          message: "No active members found in this group.",
          severity: "warning"
        });
        return;
      }

      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch group members',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const refreshAllData = async () => {
    try {
      await Promise.all([
        fetchGroupTotal(),
        fetchGroupMembers(),
        fetchExpenseHistory()
      ]);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing group data:", error);
      setSnackbar({
        open: true,
        message: 'Failed to refresh group data',
        severity: 'error'
      });
    }
  };

  const handleAddExpense = async (requestData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + "/group/creategroupexpense",
        { ...requestData, group_id: groupId ,
          group_name: groupName
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.status) {
        await refreshAllData();
        setOpenModal(false);
        setSnackbar({
          open: true,
          message: 'Expense added successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to add expense',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error adding expense',
        severity: 'error'
      });
    }
  };

  const handleExitGroup = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL + "/group/exitgroup",
        { group_id: groupId },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: 'Successfully left the group',
          severity: 'success'
        });
        navigate('/homepage');
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to exit group',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error("Error exiting group:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error exiting group',
        severity: 'error'
      });
    }
  };

  const handleEditClick = (expense) => {
    console.log("handleEditClick - Starting edit for expense:", {
      id: expense.expenses_id,
      description: expense.description
    });
    console.log("handleEditClick - Group members available:", groupMembers);
    console.log("handleEditClick - Expense details:", expense.details);

    // Map group members to their IDs for reference
    const memberMap = groupMembers.reduce((acc, member) => {
      acc[member.user_name.toLowerCase()] = member.user_id;
      return acc;
    }, {});

    console.log("handleEditClick - Member mapping:", memberMap);

    // Format the details with proper user IDs
    const formattedDetails = expense.details.map(detail => {
      console.log("handleEditClick - Processing detail:", {
        original: detail,
        user: detail.user || detail.user_name,
        existingUserId: detail.user_id || detail.userid
      });

      // Try to get user_id from different possible sources
      const userId = detail.user_id || 
                    detail.userid || 
                    memberMap[(detail.user || '').toLowerCase()] || 
                    memberMap[(detail.user_name || '').toLowerCase()];

      console.log("handleEditClick - Found user_id:", userId);

      return {
        ...detail,
        user_id: userId ? parseInt(userId) : null,
        user: detail.user || detail.user_name,
        contribution: parseFloat(detail.contribution || detail.amount_paid || 0),
        percentage: parseFloat(detail.percentage || 0),
        owe: parseFloat(detail.owe || detail.split_value || 0)
      };
    });

    console.log("handleEditClick - Formatted details:", formattedDetails);

    // Check if we have all user IDs
    const missingUserIds = formattedDetails.filter(detail => !detail.user_id);
    if (missingUserIds.length > 0) {
      console.error("handleEditClick - Missing user IDs for:", missingUserIds);
      setSnackbar({
        open: true,
        message: `Missing user IDs for: ${missingUserIds.map(d => d.user).join(', ')}`,
        severity: "error"
      });
      return;
    }

    const formattedExpense = {
      ...expense,
      expenses_id: expense.expenses_id || expense.id,
      amount_total: parseFloat(expense.amount_total || expense.expenses_amount || 0),
      split_type: expense.split_type || "equal",
      description: expense.description || expense.expenses_text,
      category: expense.expenses_category || expense.category,
      date: new Date(expense.expenses_date || expense.date).toISOString().split('T')[0],
      details: formattedDetails
    };

    console.log("handleEditClick - Final formatted expense:", formattedExpense);
    setEditingExpense(formattedExpense);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      await handleEdit({
        ...editingExpense,
        description: updatedData.description,
        amount_total: updatedData.amount,
        category: updatedData.category,
        date: updatedData.date
      });
    } catch (error) {
      console.error("Error in edit submission:", error);
    }
  };

  const handleDelete = async (expense) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setSnackbar({
          open: true,
          message: "No token found. Please login.",
          severity: "error"
        });
        return;
      }

      const response = await axios.delete(
        process.env.REACT_APP_API_BASE_URL + "/group/deletegroupexpense",
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { e_id: expense.expenses_id },
          withCredentials: true
        }
      );

      if (response.data.status) {
        await refreshAllData();
        setSnackbar({
          open: true,
          message: 'Expense deleted successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to delete expense',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error deleting expense',
        severity: 'error'
      });
    }
  };

  const handleEdit = async (expense) => {
    try {
      // Prevent default if event is passed
      if (expense.preventDefault) {
        expense.preventDefault();
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setSnackbar({
          open: true,
          message: "No token found. Please login.",
          severity: "error"
        });
        return;
      }

      const totalAmount = parseFloat(expense.amount_total);

      // Format payment_vals with proper user IDs and values
      const payment_vals = expense.details.map(detail => {
        if (!detail.user_id) {
          throw new Error(`Missing user_id for member: ${detail.user}`);
        }

        // Calculate values based on split type
        let splitAmount = 0;
        let percentage = null;

        if (expense.split_type === "equal") {
          splitAmount = totalAmount / expense.details.length;
        } else if (expense.split_type === "percentage") {
          percentage = parseFloat(detail.percentage || 0);
          splitAmount = (percentage * totalAmount) / 100;
        } else if (expense.split_type === "unequal") {
          splitAmount = parseFloat(detail.owe || 0);
        }

        return {
          user_id: parseInt(detail.user_id),
          paid_amount: parseFloat(detail.contribution || 0),
          amount: expense.split_type === "percentage" ? null : splitAmount,
          percent: expense.split_type === "percentage" ? percentage : null
        };
      });

      const requestData = {
        data: {
          e_id: expense.expenses_id,
          split_type: expense.split_type,
          payment_vals: payment_vals,
          text: expense.description,
          category: expense.category,
          amount: totalAmount,
          date: expense.date,
          group_id: groupId
        }
      };

      console.log("Sending update request:", requestData);

      const response = await axios.put(
        process.env.REACT_APP_API_BASE_URL + "/group/updategroupexpense",
        requestData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.status) {
        await refreshAllData();
        setSnackbar({
          open: true,
          message: 'Expense updated successfully!',
          severity: 'success'
        });
        setEditModalOpen(false);
        setEditingExpense(null);
      } else {
        throw new Error(response.data.message || 'Failed to update expense');
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      console.error("Error response:", error.response?.data);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Error updating expense',
        severity: 'error'
      });
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const contributionData = groupMembers.map((member) => ({
    name: member.user_name,
    value: member.total_contribution
  }));

  useEffect(() => {
    if (groupId) {
      refreshAllData();
    }
  }, [groupId]);

  const EditExpenseDialog = () => (
    <Dialog 
      open={editModalOpen} 
      onClose={() => setEditModalOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Expense</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Description"
            value={editingExpense?.description || ''}
            onChange={(e) => setEditingExpense(prev => ({
              ...prev,
              description: e.target.value
            }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amount"
            type="number"
            inputProps={{
              step: "0.01",
              min: "0"
            }}
            value={editingExpense?.amount_total || ''}
            onChange={(e) => {
              const value = e.target.value;
              setEditingExpense(prev => ({
                ...prev,
                amount_total: value === '' ? '' : parseFloat(value)
              }));
            }}
            onKeyPress={(e) => {
              // Allow only numbers and decimal point
              if (!/[\d.]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={editingExpense?.category || ''}
              onChange={(e) => setEditingExpense(prev => ({
                ...prev,
                category: e.target.value
              }))}
            >
              {['Food', 'Transport', 'Shopping', 'Entertainment', 'Utilities', 'Others'].map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={editingExpense?.date || ''}
            onChange={(e) => setEditingExpense(prev => ({
              ...prev,
              date: e.target.value
            }))}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Split Type</InputLabel>
            <Select
              value={editingExpense?.split_type || 'equal'}
              onChange={(e) => setEditingExpense(prev => ({
                ...prev,
                split_type: e.target.value
              }))}
            >
              <MenuItem value="equal">Equal Split</MenuItem>
              <MenuItem value="percentage">Percentage Split</MenuItem>
              <MenuItem value="unequal">Unequal Split</MenuItem>
            </Select>
          </FormControl>

          {/* Payment Values Section */}
          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Payment Distribution
          </Typography>
          {editingExpense?.details?.map((detail, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label={`${detail.user} Paid Amount`}
                type="number"
                inputProps={{
                  step: "0.01",
                  min: "0"
                }}
                value={detail.contribution || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const newDetails = [...editingExpense.details];
                  newDetails[index] = {
                    ...detail,
                    contribution: value === '' ? '' : parseFloat(value)
                  };
                  setEditingExpense(prev => ({
                    ...prev,
                    details: newDetails
                  }));
                }}
                onKeyPress={(e) => {
                  if (!/[\d.]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                fullWidth
              />
              {editingExpense.split_type === 'percentage' && (
                <TextField
                  label="Percentage"
                  type="number"
                  inputProps={{
                    step: "0.01",
                    min: "0",
                    max: "100"
                  }}
                  value={detail.percentage || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const newDetails = [...editingExpense.details];
                    newDetails[index] = {
                      ...detail,
                      percentage: value === '' ? '' : parseFloat(value)
                    };
                    setEditingExpense(prev => ({
                      ...prev,
                      details: newDetails
                    }));
                  }}
                  onKeyPress={(e) => {
                    if (!/[\d.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  fullWidth
                />
              )}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
        <Button 
          onClick={() => handleEdit(editingExpense)}
          variant="contained"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Grid container spacing={3} sx={{ p: 2 }}>
        <Grid item size= {{xs:12 , sm:3 , md:2 }}>
          <Sidebar />
        </Grid>

        <Grid item size = {{xs:12 , sm:9 , md:10 }}>
          <Box sx={{ p: 3 }}>
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: "12px",
                boxShadow: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                color: 'white'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{groupName}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenModal(true)}
                    sx={{
                      borderRadius: '20px',
                      backgroundColor: 'white',
                      color: '#1976d2',
                      '&:hover': { backgroundColor: '#e3f2fd' }
                    }}
                  >
                    Add Expense
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<ExitToAppIcon />}
                    onClick={handleExitGroup}
                    sx={{
                      borderRadius: '20px',
                      backgroundColor: '#ff1744',
                      color: 'white',
                      '&:hover': { backgroundColor: '#d50000' }
                    }}
                  >
                    Exit Group
                  </Button>
                  <Button
  variant="contained"
  startIcon={<PersonAddIcon />} 
  // onClick={handleAddMember} 
  sx={{
    borderRadius: '20px',
    backgroundColor: '#4caf50', 
    color: 'white',
    '&:hover': { backgroundColor: '#388e3c' }
  }}
>
  Add Member
</Button>

                </Box>
              </Box>
              <Typography variant="h6">Total Group Expense: ₹{totalExpense.toLocaleString('en-IN')}</Typography>
            </Paper>

            <Grid container spacing={3}>
              <Grid item size = {{xs:12 , md:4 }} >
                <Paper sx={{ p: 2, mb: 3, borderRadius: "12px", boxShadow: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Group Members
                  </Typography>
                  <List>
                    {groupMembers.map((member) => (
                      <React.Fragment key={member.user_id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: COLORS[member.user_id % COLORS.length] }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={member.user_name} 
                            secondary={`Contributed: ₹${member.total_contribution.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`} 
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>

                <Paper sx={{ p: 2, height: '400px', borderRadius: "12px", boxShadow: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Contribution Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie
                        data={contributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={130}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item size = {{ xs:12 , md:8 }} >
                <Paper sx={{ p: 2, borderRadius: "12px", boxShadow: 3, height: 1000, overflow: 'auto' }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
                    Expense History
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {expenses.map((expense) => (
                      <ExpenseCard
                        key={expense.expenses_id}
                        expense={expense}
                        onEdit={() => handleEditClick(expense)}
                        onDelete={() => handleDelete(expense)}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <AddGroupExpense 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        onSave={handleAddExpense}
        groupId={groupId}
        groupMembers={groupMembers}
      />

      <EditExpenseDialog />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GroupExpensePage;