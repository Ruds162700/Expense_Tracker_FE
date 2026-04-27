import React, { useState } from "react";
import {  Modal,  Box,  TextField,  Button,  Typography,  MenuItem,  Select,  FormControl,  InputLabel, Alert, Snackbar} from "@mui/material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const AddPersonalExpense = ({ open, onClose, onAddExpense }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [formData, setFormData] = useState({
    amount: '',
    text: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [categories] = useState([
    'Food', 'Transport', 'Shopping', 'Sports',
    'Entertainment', 'Utilities', 'Others'
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      if (parseFloat(value) <= 0) {
        setError("Amount must be greater than 0");
        return;
      }
    }
    
    if (name === 'date') {
      const selectedDate = new Date(value);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        setError("Date cannot be in the future");
        return;
      }
    }

    setError("");
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    const selectedDate = new Date(formData.date);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      setError("Date cannot be in the future");
      return;
    }

    if (!formData.text || !formData.category) {
      setError("Please fill all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authorization token is missing");
        return;
      }

      const requestData = {
        data: {
          amount: formData.amount,
          text: formData.text,
          category: formData.category,
          date: formData.date
        }
      };

      const response = await axios.post(
        process.env.REACT_APP_API_BASE_URL +"/user/addpersonalexpense",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: response.data.message || "Expense added successfully",
          severity: "success"
        });
        onAddExpense(response.data);
        onClose();
      }

      setFormData({
        amount: '',
        text: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error("Error adding expense:", error);
      
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: "Session expired. Please login again.",
          severity: "error"
        });
        setTimeout(() => {
          handleLogout();
        }, 2000);
      } else if (error.response?.status === 500) {
        setError("Internal server error. Please try again later.");
      } 
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Add Personal Expense
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Description"
              name="text"
              value={formData.text}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
              >
                Save Expense
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddPersonalExpense;