import React, { useState, useEffect } from "react";
import {  Modal,  Box, TextField, Button,  Typography,  MenuItem,  Select,  FormControl,  InputLabel, Alert, InputAdornment, Stack,Chip, Snackbar
} from "@mui/material";
import Grid from "@mui/material/Grid2";

const AddGroupExpense = ({ open, onClose, onSave, groupId, groupMembers, initialData }) => {
  const [error, setError] = useState("");
  const [splits, setSplits] = useState({});
  const [paidByAmounts, setPaidByAmounts] = useState({});
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalSplit, setTotalSplit] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const [formData, setFormData] = useState({
    amount: '',
    text: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    splitType: 'Equal',
  });

  const [categories] = useState([
    'Food', 'Transport', 'Shopping', 'Sports',
    'Entertainment', 'Utilities', 'Others'
  ]);

  useEffect(() => {
    if (groupMembers.length > 0) {
      initializeSplits(groupMembers);
      initializePaidBy(groupMembers);
    }
  }, [groupMembers]);

  const initializeSplits = (members) => {
    const newSplits = {};
    members.forEach(member => {
      newSplits[member.user_name] = 0;
    });
    setSplits(newSplits);
  };

  const initializePaidBy = (members) => {
    const newPaidBy = {};
    members.forEach(member => {
      newPaidBy[member.user_name] = 0;
    });
    setPaidByAmounts(newPaidBy);
    setTotalPaid(0);
  };

  useEffect(() => {
    if (initialData) {
      const amount = initialData.amount_total || initialData.expenses_amount || '';
      setFormData({
        amount: amount,
        text: initialData.description || initialData.expenses_text || '',
        category: initialData.expenses_category || initialData.category || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        splitType: initialData.split_type ? initialData.split_type.charAt(0).toUpperCase() + initialData.split_type.slice(1) : 'Equal'
      });

      // Move the split initialization here to prevent re-renders
      if (amount) {
        const equalShare = parseFloat(amount) / groupMembers.length;
        const newSplits = {};
        groupMembers.forEach(member => {
          newSplits[member.user_name] = equalShare;
        });
        setSplits(newSplits);
        setTotalSplit(parseFloat(amount));
      }

      if (initialData.details) {
        const initialPaidBy = {};
        const initialSplits = {};
        initialData.details.forEach(detail => {
          initialPaidBy[detail.user_name || detail.user] = parseFloat(detail.contribution || detail.paid_amount || 0);
          initialSplits[detail.user_name || detail.user] = parseFloat(detail.owe || detail.amount || 0);
        });
        setPaidByAmounts(initialPaidBy);
        setSplits(initialSplits);
        
        const totalPaidAmount = Object.values(initialPaidBy).reduce((sum, val) => sum + val, 0);
        setTotalPaid(totalPaidAmount);
        
        const totalSplitAmount = Object.values(initialSplits).reduce((sum, val) => sum + val, 0);
        setTotalSplit(totalSplitAmount);
      }
    }
  }, [initialData, groupMembers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Batch state updates to prevent multiple re-renders
    if (name === 'amount') {
      const amount = value ? parseFloat(value) : '';
      
      // Update form data first
      setFormData(prev => ({ ...prev, [name]: value }));
  
      if (amount && amount > 0) {
        if (formData.splitType === 'Equal') {
          const equalShare = amount / groupMembers.length;
          const newSplits = {};
          groupMembers.forEach(member => {
            newSplits[member.user_name] = equalShare;
          });
          setSplits(newSplits);
          setTotalSplit(amount);
        }
        setValidationErrors(prev => ({ ...prev, amount: undefined }));
      } else if (amount <= 0) {
        setValidationErrors(prev => ({
          ...prev,
          amount: "Amount must be greater than 0"
        }));
      }
      return;
    }
  
    if (name === 'splitType') {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (value === 'Equal' && formData.amount) {
        const amount = parseFloat(formData.amount);
        const equalShare = amount / groupMembers.length;
        const newSplits = {};
        groupMembers.forEach(member => {
          newSplits[member.user_name] = equalShare;
        });
        setSplits(newSplits);
        setTotalSplit(amount);
      } else {
        const newSplits = {};
        groupMembers.forEach(member => {
          newSplits[member.user_name] = 0;
        });
        setSplits(newSplits);
        setTotalSplit(0);
      }
      return;
    }
  
    // For all other fields, just update the form data
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const errors = {};
    
    //  Input Validations
    if (!formData.amount) {
      errors.amount = "Amount is required";
    } else if (parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }

    if (!formData.text.trim()) {
      errors.text = "Description is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.date) {
      errors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const currentDate = new Date();
      if (selectedDate > currentDate) {
        errors.date = "Date cannot be in the future";
      }
    }

    //  at least one person paid
    const totalPaidAmount = Object.values(paidByAmounts).reduce((sum, val) => sum + val, 0);
    if (totalPaidAmount <= 0) {
      errors.paidBy = "At least one person must pay";
    }

    //  total paid matches expense amount
    if (Math.abs(totalPaidAmount - parseFloat(formData.amount)) > 0.01) {
      errors.paidBy = "Total paid amount must equal the expense amount";
    }

    //  Type Specific Validations
    if (formData.splitType === 'Percentage') {
      const totalPercentage = Object.values(splits).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        errors.split = "Total percentage must equal 100%";
      }
      
      Object.entries(splits).forEach(([member, value]) => {
        if (value < 0 || value > 100) {
          errors.split = "Percentages must be between 0 and 100";
        }
      });
    }

    if (formData.splitType === 'Unequal') {
      const totalSplitAmount = Object.values(splits).reduce((sum, val) => sum + val, 0);
      if (Math.abs(totalSplitAmount - parseFloat(formData.amount)) > 0.01) {
        errors.split = "Total split amount must equal the expense amount";
      }
      
      Object.entries(splits).forEach(([member, value]) => {
        if (value < 0) {
          errors.split = "Split amounts cannot be negative";
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
    
  //   if (name === 'amount' && value) {
  //     const amount = parseFloat(value);
  //     if (amount <= 0) {
  //       setValidationErrors(prev => ({
  //         ...prev,
  //         amount: "Amount must be greater than 0"
  //       }));
  //       return;
  //     }
      
  //     initializePaidBy(groupMembers);
      
  //     if (formData.splitType === 'Equal') {
  //       const equalShare = amount / groupMembers.length;
  //       const newSplits = {};
  //       groupMembers.forEach(member => {
  //         newSplits[member.user_name] = equalShare;
  //       });
  //       setSplits(newSplits);
  //       setTotalSplit(amount);
  //     } else {
  //       const newSplits = {};
  //       groupMembers.forEach(member => {
  //         newSplits[member.user_name] = 0;
  //       });
  //       setSplits(newSplits);
  //       setTotalSplit(0);
  //     }
  //   }

  //   if (name === 'splitType') {
  //     if (value === 'Equal' && formData.amount) {
  //       const amount = parseFloat(formData.amount);
  //       const equalShare = amount / groupMembers.length;
  //       const newSplits = {};
  //       groupMembers.forEach(member => {
  //         newSplits[member.user_name] = equalShare;
  //       });
  //       setSplits(newSplits);
  //       setTotalSplit(amount);
  //     } else {
  //       const newSplits = {};
  //       groupMembers.forEach(member => {
  //         newSplits[member.user_name] = 0;
  //       });
  //       setSplits(newSplits);
  //       setTotalSplit(0);
  //     }
  //   }

  //   setValidationErrors(prev => ({ ...prev, [name]: undefined }));
  //   setFormData(prev => ({ ...prev, [name]: value }));
  // };

  const handlePaidByChange = (memberName, value) => {
    const numValue = parseFloat(value) || 0;
    const newPaidBy = { ...paidByAmounts, [memberName]: numValue };
    setPaidByAmounts(newPaidBy);
    
    const newTotal = Object.values(newPaidBy).reduce((sum, val) => sum + val, 0);
    setTotalPaid(newTotal);

    setValidationErrors(prev => ({ ...prev, paidBy: undefined }));
  };

  const handleSplitChange = (memberName, value) => {
    const numValue = parseFloat(value) || 0;
    const newSplits = { ...splits, [memberName]: numValue };
    setSplits(newSplits);
    
    const newTotal = Object.values(newSplits).reduce((sum, val) => sum + val, 0);
    setTotalSplit(newTotal);

    setValidationErrors(prev => ({ ...prev, split: undefined }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      text: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      splitType: 'Equal'
    });
    initializeSplits(groupMembers);
    initializePaidBy(groupMembers);
    setTotalSplit(0);
    setTotalPaid(0);
    setValidationErrors({});
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors',
        severity: 'error'
      });
      return;
    }

    try {
      let payment_vals;
      if (formData.splitType === 'Equal') {
        const equalShare = parseFloat(formData.amount) / groupMembers.length;
        payment_vals = groupMembers.map(member => ({
          user_id: member.user_id,
          paid_amount: paidByAmounts[member.user_name] || 0,
          amount: equalShare
        }));
      } else if (formData.splitType === 'Percentage') {
        payment_vals = groupMembers.map(member => ({
          user_id: member.user_id,
          paid_amount: paidByAmounts[member.user_name] || 0,
          percent: splits[member.user_name] || 0,
          amount: (parseFloat(formData.amount) * (splits[member.user_name] || 0)) / 100
        }));
      } else { // Unequal
        payment_vals = groupMembers.map(member => ({
          user_id: member.user_id,
          paid_amount: paidByAmounts[member.user_name] || 0,
          amount: splits[member.user_name] || 0
        }));
      }

      const requestData = {
        data: {
          text: formData.text,
          category: formData.category, // Remove toUpperCase() here since we're storing as-is
          amount: parseFloat(formData.amount),
          date: formData.date,
          group_id: parseInt(groupId),
          split_type: formData.splitType.toLowerCase(),
          payment_vals
        }
      };

      console.log('Request Data:', requestData); 
      await onSave(requestData);
      resetForm();
      onClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to add expense',
        severity: 'error'
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '80%', md: 900 },
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: '#ffffff',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          p: 4
        }}>
          <Typography variant="h5" component="h2" sx={{ mb: 4, textAlign: 'center' }}>
            {initialData ? 'Edit Expense' : 'Add Group Expense'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid itemsize = {{xs:12 , sm:4 }}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  error={!!validationErrors.amount}
                  helperText={validationErrors.amount}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item size = {{xs:12 , sm:6}}>
                <FormControl fullWidth>
                  <InputLabel>Split Type</InputLabel>
                  <Select
                    name="splitType"
                    value={formData.splitType}
                    onChange={handleChange}
                    required
                    label="Split Type"
                  >
                    <MenuItem value="Equal">Equally</MenuItem>
                    <MenuItem value="Unequal">Unequally</MenuItem>
                    <MenuItem value="Percentage">Percentage</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item size = {{xs:12 , sm:4 }}>
                <TextField
                  fullWidth
                  label="Description"
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  required
                  error={!!validationErrors.text}
                  helperText={validationErrors.text}
                />
              </Grid>

              <Grid item size = {{xs:12 , sm:4 }}>
                <FormControl fullWidth error={!!validationErrors.category}>
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
              </Grid>

              <Grid item size = {{xs:12 , sm:4 }}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  error={!!validationErrors.date}
                  helperText={validationErrors.date}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

             
              <Grid item size={12}>
                <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 3, 
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Paid By</span>
                    <Chip 
                      label={`Total: ₹${totalPaid}`}
                      color={
                        formData.amount && Math.abs(totalPaid - parseFloat(formData.amount)) > 0.01 
                          ? "error" 
                          : "default"
                      }
                    />
                  </Typography>

                  {validationErrors.paidBy && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {validationErrors.paidBy}
                    </Alert>
                  )}

                  <Stack spacing={2}>
                    {groupMembers.map((member) => (
                      <Box 
                        key={member.user_name}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          bgcolor: '#ffffff',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}
                      >
                        <Typography sx={{ flex: 1 }}>
                          {member.user_name}
                        </Typography>
                        <TextField
                          type="number"
                          value={paidByAmounts[member.user_name] || ''}
                          onChange={(e) => handlePaidByChange(member.user_name, e.target.value)}
                          inputProps={{ min: 0, step: "0.01" }}
                          sx={{ width: '150px' }}
                          size="small"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>

           
              {(formData.splitType === 'Unequal' || formData.splitType === 'Percentage') && (
                <Grid item size={12}>
                  <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3 }}>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>
                        {formData.splitType === 'Percentage' ? 'Split Percentage' : 'Split Amount'}
                      </span>
                      <Chip 
                        label={`Total: ${formData.splitType === 'Percentage' ? `${totalSplit}%` : `₹${totalSplit}`}`}
                        color={
                          (formData.splitType === 'Percentage' && totalSplit !== 100) ||
                          (formData.splitType === 'Unequal' && formData.amount && 
                           Math.abs(totalSplit - parseFloat(formData.amount)) > 0.01)
                            ? "error"
                            : "default"
                        }
                      />
                    </Typography>

                    {validationErrors.split && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {validationErrors.split}
                      </Alert>
                    )}

                    <Stack spacing={2}>
                      {groupMembers.map((member) => (
                        <Box 
                          key={member.user_name}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            bgcolor: '#ffffff',
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}
                        >
                          <Typography sx={{ flex: 1 }}>
                            {member.user_name}
                          </Typography>
                          <TextField
                            type="number"
                            value={splits[member.user_name] || ''}
                            onChange={(e) => handleSplitChange(member.user_name, e.target.value)}
                            inputProps={{ min: 0, step: "0.01" }}
                            sx={{ width: '150px' }}
                            size="small"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">
                                {formData.splitType === 'Percentage' ? '%' : '₹'}
                              </InputAdornment>,
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
              <Button variant="outlined" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
             
              >
                {initialData ? 'Save Changes' : 'Add Expense'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

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

export default AddGroupExpense;