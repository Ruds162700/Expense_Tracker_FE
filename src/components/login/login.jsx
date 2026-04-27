import { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Snackbar, Alert } from "@mui/material";

const LoginComponent = ({ setIsLogin, setIsOtp, setIsAddPassword, setShowTerms }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleLogin = async () => {
    console.log("in handle")
    let isValid = true;
  
    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    } else {
      setEmailError("");
    }
  
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters long");
      isValid = false;
    } else {
      setPasswordError("");
    }
  
    if (!isValid) return;
  
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );
  
      // Success case
      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        setSnackbar({ open: true, message: res.data.message ||"Login successful!", severity: "success" });
        setTimeout(() => {
          window.location.href = "/homepage"; // Navigate to dashboard
        }, 2000);
      }
    } catch (error) {
      // Handle errors
      let errorMessage = "Something went wrong. Try again.";
      let severity = "error";

      if (error.response) {
        const { status, data } = error.response;

        // Handle specific error status codes
        if (status === 401) {
          errorMessage = "Incorrect email or password";
        } else if (status === 406) {
          localStorage.setItem("verify_token", data.verify_token);
          errorMessage = "User not verified";
          severity = "warning"; // Warning severity for user not verified
          setTimeout(() => {
            setIsLogin(false);
            setIsOtp(true); // Navigate to OTP page
          }, 2000);
        } else {
          errorMessage = data.message || errorMessage;
        }
      } else {
        errorMessage = "Network error. Please check your connection.";
      }

      setSnackbar({ open: true, message: errorMessage, severity });
    }
  };

  const handleAddPassword = async () => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/add_password`,
        { email }, // Sending email in the payload
        { withCredentials: true }
      );
  
      // Success case
      if (res.status === 200) {
        localStorage.setItem("verify_token", res.data.verify_token);
        setSnackbar({ open: true, message: res.data.message, severity: "success" });
        setTimeout(() => {
          setIsLogin(false);
          setIsAddPassword(true);
        }, 2000);
      }
    } catch (error) {
      // Handle errors
      let errorMessage = "Something went wrong";
      let severity = "error";

      if (error.response) {
        const { status, data } = error.response;
        errorMessage = data.message || errorMessage;
        severity = "error";

        if (status === 401) {
          setTimeout(() => {
            setIsLogin(true);
            setIsAddPassword(false);
          }, 2000);
        }
      } else {
        errorMessage = "Network error. Please check your connection.";
      }

      setSnackbar({ open: true, message: errorMessage, severity });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!emailError}
        helperText={emailError}
      />
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!passwordError}
        helperText={passwordError}
      />
      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleLogin}>
        Login
      </Button>
      <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={() => setShowTerms(true)}>
        Sign Up with Google
      </Button>
      <Typography
        sx={{ mt: 2, cursor: "pointer", textAlign: "center", color: "#1976D2" }}
        onClick={() => setIsLogin(false)}
      >
        New User? Sign up
      </Typography>
      <Typography
        sx={{ mt: 2, cursor: "pointer", textAlign: "center", color: "#D32F2F" }}
        onClick={handleAddPassword}
      >
        Add Password
      </Typography>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginComponent;
