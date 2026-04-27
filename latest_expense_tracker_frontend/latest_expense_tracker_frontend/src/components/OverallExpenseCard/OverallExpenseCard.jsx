import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const OverallExpenseCard = ({ totalExpense }) => {
  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" >
          Total Expenses
        </Typography>
        <Typography variant="h4" color="primary" >
          ₹{totalExpense.toFixed(2)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default OverallExpenseCard;
