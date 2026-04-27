import React, { useState, useEffect } from "react";
import axios from "axios";
import Grid from "@mui/material/Grid2";
import LoginComponent from "../../components/login/login";
import SignupComponent from "../../components/Signup/Signup";
import AddPasswordComponent from "../../components/Addpassword/Addpassword";
import OtpComponent from "../../components/Otp/Otp";
import ass from "../../assets/login2.jpg";
import {
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { Google } from "@mui/icons-material";

const API_BASE_URL_TWO = process.env.REACT_APP_API_BASE_URL; 
const Google_API = API_BASE_URL_TWO+"/auth/google" ;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isOtp, setIsOtp] = useState(false);
  const [isAddPassword, setIsAddPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Snackbar State
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("auth_token", token); 
    }
  }, []); 

  // Register API Call
  const handleRegister = async (name, email, password, confirmPassword) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL_TWO}/auth/signup`,
        { name, email, password, confirmPassword },
        { withCredentials: true }
      );
      debugger
      // Handle success response
      if (res.status === 200) {
        setSnackbar({ open: true, message: res.data.message, severity: "success" });
        setIsOtp(true);
        localStorage.setItem("verify_token", res.data.verify_token);
        console.log(res.data.verify_token);
      }
    } catch (error) {
      // Handle errors
      let errorMessage = "Something went wrong. Please try again.";
      let severity = "error";

      if (error.response) {
        const { status, data } = error.response;

        // Customize messages based on the response status
        if (status === 406) {
          errorMessage = data.message || "Please enter correct data.";
        } else if (status === 409) {
          errorMessage = data.message || "User already exists.";
          severity = "warning"; // Warning severity for existing user error
        } else {
          errorMessage = data.message || errorMessage;
        }
      } else if (error.request) {
        // This handles the case of network errors or no response from server
        errorMessage = "Network error. Please check your connection.";
      }

      // Set snackbar with appropriate message and severity
      setSnackbar({ open: true, message: errorMessage, severity });
    }
  };

  return (
    <Grid
      container
      height="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{ background: "linear-gradient(135deg, #6D28D9, #3B82F6)" }}
    >
      <Grid
        container
        component={Box}
        sx={{
          backgroundColor: "white",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
          maxWidth: 900,
        }}
      >
        {/* Image Section */}
        <Grid
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            display: { xs: "none", md: "flex", lg: "flex" },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={ass} alt="Auth Visual" style={{ width: "100%" }} />
        </Grid>

        {/* Form Section */}
        <Grid
          item
          size={{ xs: 12, md: 6 }}
          sx={{ p: 4, display: "flex", flexDirection: "column", justifyContent: "center" }}
        >
          {isAddPassword ? (
            <AddPasswordComponent setIsAddPassword={setIsAddPassword} setIsLogin={setIsLogin} />
          ) : isOtp ? (
            <OtpComponent isOtp={isOtp} setIsOtp={setIsOtp} setIsLogin={setIsLogin} />
          ) : isLogin ? (
            <LoginComponent
              setIsLogin={setIsLogin}
              setIsOtp={setIsOtp}
              setShowTerms={setShowTerms}
              setIsAddPassword={setIsAddPassword}
            />
          ) : (
            <SignupComponent setIsOtp={setIsOtp} setIsLogin={setIsLogin} handleRegister={handleRegister} />
          )}
        </Grid>
      </Grid>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTerms} onClose={() => setShowTerms(false)}>
        <DialogTitle>Terms and Conditions</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please read and accept the
            <Link
              href="#"
              onClick={() => alert("Show full terms and conditions")}
              sx={{ color: "#1976D2", textDecoration: "underline", ml: 0.5 }}
            >
              Terms and Conditions
            </Link>{" "}
            before proceeding.
          </DialogContentText>
          <FormControlLabel
            control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
            label="I agree to the Terms and Conditions"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTerms(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setShowTerms(false);
              if (termsAccepted) {
                window.location.href = Google_API; // Redirect to Google OAuth
              }
            }}
            disabled={!termsAccepted}
            variant="contained"
            color="primary"
          >
            Accept & Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for API Responses */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default AuthPage;
