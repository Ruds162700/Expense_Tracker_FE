import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, TextField, Button, Snackbar, Alert, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

const AddPasswordComponent = ({ setIsAddPassword, setIsLogin }) => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleResendOtp = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('verify_token');

      const res = await axios.post(
        `${API_BASE_URL}/auth/resend_otp`, 
        {}, 
        {
          withCredentials: true, // Ensures cookies are sent
          headers: {
            Authorization: `Bearer ${localStorage.getItem("verify_token")}` , // Add token if available
          }
        }
      );
      

      if (res.status === 200) {
        setSnackbar({ open: true, message: "OTP sent successfully!", severity: "success" });
      }
    } catch (error) {
      if (error.response) {
        const { status } = error.response;

        if (status === 401 || status === 406 || status === 500) {
          setSnackbar({ open: true, message: "Session expired. Redirecting to login...", severity: "error" });
          setTimeout(() => {
            setIsLogin(true);
            setIsAddPassword(false);
          }, 500);
        }
      } else {
        setSnackbar({ open: true, message: "Network error. Please try again.", severity: "error" });
      }
    }
  };

  const validateOtp = (otp) => /^[0-9]{6}$/.test(otp);
  const validatePassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);

  const handleSubmit = async () => {
    let isValid = true;

    // Validate OTP
    if (!validateOtp(otp)) {
      setOtpError("OTP must be exactly 6 digits");
      isValid = false;
    } else {
      setOtpError("");
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      setPasswordError("Password must be at least 6 characters long, including a letter and a number");
      isValid = false;
    } else {
      setPasswordError("");
    }

 
    if (confirmPassword !== newPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!isValid) return;

    try {
      const verifyToken = localStorage.getItem("verify_token");

      if (!verifyToken) {
        setSnackbar({ open: true, message: "No verify token found. Please log in again.", severity: "error" });
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/auth/checkandaddpass`,
        { otp, password: newPassword, confirmPassword },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${verifyToken}` 
          }
        }
      );

      if (res.status === 200) {
        localStorage.removeItem("verify_token"); 
        setSnackbar({ open: true, message: res.data.message, severity: "success" });
        setTimeout(() => {
          setIsLogin(true);
          setIsAddPassword(false);
        }, 200);
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        setSnackbar({ open: true, message: data.message || "Something went wrong", severity: "error" });

        if (status === 400 || status === 409) {
          setSnackbar({ open: true, message:data.message || "Incorrect OTP", severity: "error" });
        } else if (status === 401) {
          setSnackbar({ open: true, message:data.message || "No session found. Please log in again.", severity: "error" });
          setTimeout(() => {
            setIsLogin(true);
            setIsAddPassword(false);
          }, 2000);
        } else if (status === 406) {
          setSnackbar({ open: true, message: data.message || "Validation failed. Please enter correct details.", severity: "error" });
        }
      } else {
        setSnackbar({ open: true, message: "Network error. Please check your connection.", severity: "error" });
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>
          Add Password
        </Typography>
        <IconButton onClick={() => {
          setIsLogin(true);
          setIsAddPassword(false);
        }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <TextField fullWidth label="OTP" margin="normal" value={otp} onChange={(e) => setOtp(e.target.value)} error={!!otpError} helperText={otpError} />
      <TextField fullWidth label="New Password" type="password" margin="normal" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={!!passwordError} helperText={passwordError} />
      <TextField fullWidth label="Confirm Password" type="password" margin="normal" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={!!confirmPasswordError} helperText={confirmPasswordError} />

      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>Submit</Button>
      <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={handleResendOtp}>Resend OTP</Button>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddPasswordComponent;
