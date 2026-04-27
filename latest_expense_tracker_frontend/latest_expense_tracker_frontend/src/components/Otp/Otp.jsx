import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, TextField, Button, Snackbar, Alert, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; 

const OtpComponent = ({ isOtp, setIsOtp, setIsLogin }) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });
  const navigate = useNavigate();
  
  const validateOtp = (otp) => /^[0-9]{6}$/.test(otp); // OTP must be 6 digits

  // Handle OTP Submission
  const handleSubmit = async () => {
    if (!validateOtp(otp)) {
      setOtpError("OTP must be exactly 6 digits");
      return;
    }

    try {
      // Retrieve the verify_token from localStorage
      const verifyToken = localStorage.getItem("verify_token");

      if (!verifyToken) {
        setSnackbar({ open: true, message: "No verify token found. Please try again.", severity: "error" });
        setTimeout(() => {
          setIsOtp(false); // Reset OTP state
          setIsLogin(true); // Show login screen
        }, 300);
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/auth/verify_otp`,
        { otp },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${verifyToken}`, // Include token in the Authorization header
          },
        }
      );

      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.removeItem("verify_token"); // Remove verify_token from localStorage after success
        setSnackbar({ open: true, message: "OTP Verified! Redirecting...", severity: "success" });
        setIsOtp(false); // Reset OTP state
        navigate("/homepage");
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      const verifyToken = localStorage.getItem("verify_token");

      if (!verifyToken) {
        setSnackbar({ open: true, message: "No verify token found. Please try again.", severity: "error" });
        setTimeout(() => {
          setIsOtp(false); // Reset OTP state
          setIsLogin(true); // Show login screen
        }, 300);
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/auth/resend_otp`, {}, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${verifyToken}`, // Include token in the Authorization header
        },
      });

      if (res.status === 200) {
        setSnackbar({ open: true, message: res.data.message ||"OTP sent successfully!", severity: "success" });
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Handle errors
  const handleError = (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          setSnackbar({ open: true, message: data.message || "Session expired. Returning to login...", severity: "error" });
          setTimeout(() => {
            setIsOtp(false);
            setIsLogin(true);
          }, 300);
          break;
        case 408:
          setSnackbar({ open: true, message: data.message || "OTP expired. Please request a new one.", severity: "warning" });
          setTimeout(() => setIsOtp(true), 100);
          break;
        case 409:
          setSnackbar({ open: true, message: data.message || "Invalid OTP. Try again.", severity: "error" });
          setTimeout(() => setIsOtp(true), 100);
          break;
        case 500:
          setSnackbar({ open: true, message: "Server error. Returning to login...", severity: "error" });
          setTimeout(() => {
            setIsOtp(false);
            setIsLogin(true);
          }, 300);
          break;
        default:
          setSnackbar({ open: true, message: "An error occurred. Please try again.", severity: "error" });
          break;
      }
    } else {
      setSnackbar({ open: true, message: "Network error. Please check your connection.", severity: "error" });
    }
  };

  return (
    <Box>
      {/* Title & Back Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>
          Enter OTP
        </Typography>
        <IconButton onClick={() => { 
          setIsOtp(false); 
          setIsLogin(true);
        }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* OTP Input */}
      <TextField
        fullWidth
        label="OTP"
        margin="normal"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        error={!!otpError}
        helperText={otpError}
      />

      {/* Submit & Resend OTP Buttons */}
      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
        Submit
      </Button>
      <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={handleResendOtp}>
        Resend OTP
      </Button>

      {/* Snackbar for messages */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OtpComponent;
