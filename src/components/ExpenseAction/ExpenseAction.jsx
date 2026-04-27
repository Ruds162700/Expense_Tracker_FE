import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import AddPersonalExpense from "../AddPersonalExpense/AddPeronalExpense";

const ExpenseActions = ({ onAddExpense }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Add Expense
      </Button>
      <AddPersonalExpense 
        open={open} 
        onClose={() => setOpen(false)} 
        onAddExpense={onAddExpense}
      />
    </Box>
  );
};

export default ExpenseActions;
