import React, { useEffect, useState } from "react";
import { DataGrid,  gridClasses } from "@mui/x-data-grid";
import {   IconButton,   CircularProgress,   Typography,  Dialog,  DialogTitle,  DialogContent,  DialogActions,  Button,  TextField,  MenuItem,  Select,  FormControl, InputLabel} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const ExpenseTable = ({ refreshTrigger, onDataChange }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [categories] = useState([
    'Food', 'Transport', 'Shopping', 'Sports',
    'Entertainment', 'Utilities', 'Others'
  ]);

  const fetchExpenses = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authorization token is missing.");
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      };

      const response = await axios.get(
        process.env.REACT_APP_API_BASE_URL + "/user/getuserpersonalhistory",
        config
      );

      if (response.data.status) {
        const formattedExpenses = response.data.data.map((item) => ({
          id: item.id,
          category: item.category,
          amount: parseFloat(item.amount).toFixed(2),
          date: item.date,
          description: item.description || "No description"
        }));

        setExpenses(formattedExpenses);
      }
    } catch (err) {
      setError("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  const handleEditClick = (expense) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedExpenseId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.delete(
        process.env.REACT_APP_API_BASE_URL + "/user/deletepersonalexpense",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: { id: selectedExpenseId },
          withCredentials: true
        }
      );

      if (response.data.status) {
        setSnackbar({
          open: true,
          message: response.data.message || "Expense deleted successfully",
          severity: "success"
        });
        await onDataChange();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to delete expense",
        severity: "error"
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedExpenseId(null);
    }
  };

  const handleEditSave = async () => {
    const updatedExpense = {
      ...selectedExpense,
      text: selectedExpense.description || null,
    };
  
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.put(
        process.env.REACT_APP_API_BASE_URL + "/user/updatepersonalexpense",
        { data: updatedExpense }, 
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
  
      if (response.data.status) {
        setSnackbar({
          open: true,
          message: "Expense updated successfully!",
          severity: "success",
        });
        await onDataChange();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update expense",
        severity: "error",
      });
    } finally {
      setEditDialogOpen(false);
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleInputChange = (e) => {
    setSelectedExpense({
      ...selectedExpense,
      [e.target.name]: e.target.value
    });
  };

  const columns = [
    { field: "category", headerName: "Category", flex: 1, headerAlign: "center", align: "center" },
    { field: "amount", headerName: "Amount (₹)", flex: 1, headerAlign: "center", align: "center" },
    { field: "date", headerName: "Date", flex: 1, headerAlign: "center", align: "center" },
    { field: "description", headerName: "Description", flex: 2, headerAlign: "center", align: "center" },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <IconButton color="primary" onClick={() => handleEditClick(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error" 
            onClick={() => handleDeleteClick(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ height: 400, width: "100%" }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <DataGrid
            rows={expenses}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            disableSelectionOnClick
            sx={{
              [`& .${gridClasses.cell}`]: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this expense?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select name="category" value={selectedExpense?.category || ""} onChange={handleInputChange}>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Amount" name="amount" fullWidth margin="dense" value={selectedExpense?.amount || ""} onChange={handleInputChange} />
          <TextField label="Date" name="date" fullWidth margin="dense" type="date" InputLabelProps={{ shrink: true }} value={selectedExpense?.date || ""} onChange={handleInputChange} />
          <TextField label="Description" name="description" fullWidth margin="dense" value={selectedExpense?.description || ""} onChange={handleInputChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} color="primary" variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExpenseTable;
