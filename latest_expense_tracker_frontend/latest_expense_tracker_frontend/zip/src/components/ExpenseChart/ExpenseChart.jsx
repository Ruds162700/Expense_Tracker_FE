import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Paper, CircularProgress, Typography } from "@mui/material";
import axios from "axios";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpenseChart = ({ refreshTrigger }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
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
          process.env.REACT_APP_API_BASE_URL + "/user/userexpensecategorywise",
          config
        );

        if (response.data.status) {
          const categories = response.data.data.map((item) => item.category);
          const amounts = response.data.data.map((item) => parseFloat(item.amount));

          setChartData({
            labels: categories,
            datasets: [
              {
                label: "Expenses (₹)",
                data: amounts,
                backgroundColor: [
  "#FF6384", "#36A2EB", "#FFCE56", "#8E44AD", "#2ECC71",
  "#E74C3C", "#3498DB", "#F39C12", "#1ABC9C", "#D35400",
  "#C0392B", "#2980B9", "#27AE60", "#9B59B6", "#34495E"
]
, 
              },
            ],
          });
        }
      } catch (err) {
        setError("Failed to fetch expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseData();
  }, [refreshTrigger]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: "Category" } },
      y: { beginAtZero: true, title: { display: true, text: "Amount (₹)" } },
    },
  };

  return (
    <Paper sx={{ p: 2, height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : chartData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Typography>No data available.</Typography>
      )}
    </Paper>
  );
};

export default ExpenseChart;
