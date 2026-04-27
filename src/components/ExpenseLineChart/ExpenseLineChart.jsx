import React, { useState, useEffect } from "react";
import {  LineChart, Line, XAxis, YAxis, Tooltip,  CartesianGrid,  ResponsiveContainer, Legend} from "recharts";
import { 
  Card, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  Box,
  useTheme 
} from "@mui/material";
import axios from "axios";

const ExpenseLineChart = () => {
  const theme = useTheme();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState([]);
  const [years] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    fetchMonthlyData(selectedYear);
  }, [selectedYear]);

  const fetchMonthlyData = async (year) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
      process.env.REACT_APP_API_BASE_URL+"/user/getpersonalbarchart",
        { year: selectedYear },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.status) {
  
        const formattedData = response.data.data.map(item => ({
          month: new Date(item.month).toLocaleString('default', { month: 'short' }),
          Personal: parseFloat(item.personal_expenses) || 0,
          Group: parseFloat(item.group_contributions) || 0,
          Total: parseFloat(item.total_spending) || 0
        }));

        console.log('Formatted Data:', formattedData); 
        setMonthlyData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
   
      const emptyData = months.map(month => ({
        month: month.substring(0, 3),
        Personal: 0,
        Group: 0,
        Total: 0
      }));
      setMonthlyData(emptyData);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            p: 2,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle2" color="textPrimary">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              color={entry.color}
              sx={{ mt: 1 }}
            >
              {`${entry.name}: ₹${entry.value.toLocaleString()}`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Card 
      sx={{ 
        p: 3, 
        mb: 2,
        height: 500,
        boxShadow: 3,
        borderRadius: 2,
        background: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Monthly Expense Trend
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={monthlyData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis 
            dataKey="month" 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
          />
          <YAxis 
            stroke={theme.palette.text.secondary}
            tick={{ fill: theme.palette.text.secondary }}
            tickFormatter={(value) => `₹${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Personal" 
            name="Personal Expenses"
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="Group" 
            name="Group Contributions"
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="Total" 
            name="Total Spending"
            stroke="#ff7300" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ExpenseLineChart; 