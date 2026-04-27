import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  FormControlLabel, 
  Switch, 
  Snackbar, 
  Alert 
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const ProfileModal = ({ open, onClose, name, email, isNotificationEnabled, setName }) => {
  const [currentName, setCurrentName] = useState(name);
  const [currentEmail, setCurrentEmail] = useState(email);
  const [currentNotificationEnabled, setCurrentNotificationEnabled] = useState(isNotificationEnabled);
  const [isEditingName, setIsEditingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    setCurrentName(name);
    setCurrentEmail(email);
    setCurrentNotificationEnabled(isNotificationEnabled);
  }, [name, email, isNotificationEnabled]);

  const handleNotificationToggle = (event) => {
    setCurrentNotificationEnabled(event.target.checked);
  };

  const handleNameEditClick = () => {
    setIsEditingName(true);
  };

  const handleNameChange = (event) => {
    setCurrentName(event.target.value);
  };

  const validateName = (name) => {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(name);
  };

  const handleSave = async () => {
    if (!validateName(currentName)) {
      setErrorMessage("Name is invalid. Only alphabetic characters are allowed.");
      setOpenSnackbar(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        process.env.REACT_APP_API_BASE_URL + "/user/updateuser",
        {
          name: currentName,
          notification: currentNotificationEnabled,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        setName(currentName);
        onClose();
        setErrorMessage("Profile updated successfully!");
        setOpenSnackbar(true);
      } else {
        setErrorMessage(response.data.message || "Failed to update profile.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setErrorMessage("An error occurred while updating the profile.");
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Modal 
        open={open} 
        onClose={onClose}
        aria-labelledby="profile-modal"
        aria-describedby="edit-profile-details"
      >
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: { xs: '90%', sm: 450 },
            maxWidth: 500,
            borderRadius: 3,
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          <Typography 
            variant="h5" 
            id="profile-modal"
            sx={{ 
              mb: 3, 
              fontWeight: 600,
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            Edit Profile
          </Typography>

          {/* Name Field */}
          <Box sx={{ position: "relative", mb: 3 }}>
            <TextField
              fullWidth
              label="Name"
              value={currentName}
              onChange={handleNameChange}
              InputProps={{
                readOnly: !isEditingName,
                sx: {
                  borderRadius: 2,
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
                  }
                }
              }}
            />
            {!isEditingName && (
              <IconButton
                sx={{
                  position: "absolute",
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                  }
                }}
                onClick={handleNameEditClick}
                aria-label="edit name"
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {/* Email Field */}
          <TextField
            fullWidth
            label="Email"
            value={currentEmail}
            sx={{ mb: 3 }}
            InputProps={{
              readOnly: true,
              sx: {
                borderRadius: 2,
                bgcolor: 'action.hover'
              }
            }}
          />

          {/* Notification Toggle */}
          <FormControlLabel
            sx={{ 
              mb: 3,
              display: 'block',
              '& .MuiTypography-root': {
                fontSize: '0.95rem'
              }
            }}
            control={
              <Switch
                checked={currentNotificationEnabled}
                onChange={handleNotificationToggle}
                name="notifications"
                color="primary"
              />
            }
            label="Notify when an expense is added to group"
          />

          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleSave}
            sx={{
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={errorMessage === "Profile updated successfully!" ? "success" : "error"} 
          sx={{ 
            width: "100%",
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontSize: '0.95rem'
            }
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProfileModal;