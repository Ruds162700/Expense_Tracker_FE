import { useState } from "react";
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, Link, IconButton, Snackbar, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const SignupComponent = ({ setIsOtp, setIsLogin, handleRegister }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [checked, setChecked] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleSignup = () => {
    let isValid = true;

    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (isValid && checked) {
      try {
        handleRegister(name, email, password, confirmPassword);
        setSnackbar({ open: true, message: "Registration successful! Please check your email for OTP.", severity: "success" });
      } catch (error) {
        setSnackbar({ open: true, message: "Registration failed. Please try again.", severity: "error" });
      }
    } else if (!checked) {
      setSnackbar({ open: true, message: "You must agree to the terms and conditions.", severity: "warning" });
    }
  };

  return (
    <Box>
      {/* Aligning IconButton to the right */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>
          Sign Up
        </Typography>
        <IconButton onClick={() => setIsLogin(true)}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        label="Name"
        margin="normal"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={!!nameError}
        helperText={nameError}
      />
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
      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        margin="normal"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!confirmPasswordError}
        helperText={confirmPasswordError}
      />
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
        label={<span>I agree to the <Link href="#" sx={{ color: "#1976D2", textDecoration: "underline" }}>Terms and Conditions</Link></span>}
      />
      <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSignup} disabled={!checked}>
        Send OTP
      </Button>

      {/* Snackbar for displaying messages */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignupComponent;
