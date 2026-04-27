import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Cell } from "recharts";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";
import Grid from "@mui/material/Grid2";
import axios from "axios";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4560", 
  "#A28DFF", "#FF6384", "#36A2EB", "#4BC0C0", "#9966FF", 
  "#FF9F40", "#FFCD56", "#2E93fA", "#66DA26", "#546E7A"
];


const ExpensePieChart = ({ setTotalExpense }) => {
  const [groupData, setGroupData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalGroupExpense, setTotalGroupExpense] = useState(0);
  const [totalCategoryExpense, setTotalCategoryExpense] = useState(0);

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

        const [groupResponse, categoryResponse] = await Promise.all([
          axios.get(
            process.env.REACT_APP_API_BASE_URL + "/user/usergroupexpensetotal",
            config
          ),
          axios.get(
            process.env.REACT_APP_API_BASE_URL + "/user/userexpensecategorywise",
            config
          ),
        ]);

        if (groupResponse.data.status) {
          const groupExpenses = groupResponse.data.data.map((item) => ({
            name: item.group_name,
            value: parseFloat(item.amount),
          }));
          setGroupData(groupExpenses);
          setTotalGroupExpense(groupExpenses.reduce((acc, item) => acc + item.value, 0));
        }

        if (categoryResponse.data.status) {
          const categoryExpenses = categoryResponse.data.data.map((item) => ({
            name: item.category,
            value: parseFloat(item.amount),
          }));
          setCategoryData(categoryExpenses);
          setTotalCategoryExpense(categoryExpenses.reduce((acc, item) => acc + item.value, 0));
        }

        setTotalExpense(totalGroupExpense + totalCategoryExpense);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [setTotalExpense, totalGroupExpense, totalCategoryExpense]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Grid container spacing={2}>
      {/* Group-Wise Contribution Pie Chart */}
      <Grid item size = {{ xs:12 , sm:6 }}>
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" align="center">
              Group-Wise Contribution
            </Typography>
            {groupData.length > 0 ? (
              <>
                <PieChart width={300} height={250}>
                  <defs>
                    {groupData.map((_, index) => (
                      <linearGradient id={`colorGroup${index}`} key={index} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={groupData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {groupData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#colorGroup${index})`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <Typography variant="h6" align="center" sx={{ mt: 2, color: "#0088FE", fontWeight: "bold" }}>
                  Total: ₹{totalGroupExpense.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography align="center"> No Data Available </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Category-Wise Expense Pie Chart */}
      <Grid item size = {{ xs:12 , sm:6 }}>
        <Card sx={{ p: 2 }}>
          <CardContent>
            <Typography variant="h6" align="center">
              Category-Wise Expense
            </Typography>
            {categoryData.length > 0 ? (
              <>
                <PieChart width={300} height={250}>
                  <defs>
                    {categoryData.map((_, index) => (
                      <linearGradient id={`colorCategory${index}`} key={index} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#colorCategory${index})`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
                <Typography variant="h6" align="center" sx={{ mt: 2, color: "#FF4560", fontWeight: "bold" }}>
                  Total: ₹{totalCategoryExpense.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography align="center">No Data Available</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ExpensePieChart;
