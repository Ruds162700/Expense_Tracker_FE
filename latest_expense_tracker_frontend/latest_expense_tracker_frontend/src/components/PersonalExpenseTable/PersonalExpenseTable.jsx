import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";

const columns = [
  { field: "date", headerName: "Date", width: 150 },
  { field: "category", headerName: "Category", width: 150 },
  { field: "amount", headerName: "Amount (₹)", width: 150 },
  { field: "description", headerName: "Description", width: 250 },
];

const PersonalExpenseTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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
          process.env.REACT_APP_API_BASE_URL + "/user/getuserpersonalhistory" ,
          config
        );

        if (response.data.status) {
          const formattedData = response.data.data.map((item, index) => ({
            id: index + 1, // Using index as ID instead of API ID
            date: item.date,
            category: item.category,
            amount: `₹${parseFloat(item.amount).toFixed(2)}`, // Formatting amount
            description: item.description,
          }));

          setRows(formattedData);
        }
      } catch (err) {
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Personal Expense History
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <div style={{ height: 300, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              disableSelectionOnClick
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalExpenseTable;
