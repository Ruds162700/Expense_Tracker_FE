import React, { useState, useEffect } from "react";
import { 
  Drawer, 
  List, 
  ListItem,
  ListItemText,
  Typography, 
  IconButton, 
  Divider, 
  Button, 
  Modal, 
  Box, 
  TextField,
  Stack,
  InputAdornment,
  Collapse,
  Avatar,
  ListItemIcon,
  Tooltip,
  Alert,
  Snackbar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "../ProfileModel/ProfileModel";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [highlightedEmails, setHighlightedEmails] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [emailList, setEmailList] = useState([""]);
  const [error, setError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      handleSignOut();
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user/getuser`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setName(response.data.user.name);
      setEmail(response.data.user.email); 
      setIsNotificationEnabled(response.data.user.isNotified);

      const groupsResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/user/getgroups`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setGroups(groupsResponse.data.groups);
    } catch (error) {
      console.error("Error fetching data:", error);
      if (error.response?.status === 401) {
        handleSignOut();
      }
    }
  };

  const handleAddEmail = () => {
    setEmailList([...emailList, ""]);
  };

  const handleRemoveEmail = (index) => {
    const newEmailList = emailList.filter((_, i) => i !== index);
    setEmailList(newEmailList);
  };

  const handleEmailChange = (index, value) => {
    const newEmailList = [...emailList];
    newEmailList[index] = value;
    setEmailList(newEmailList);
   
    if (error) setError("");
  };

  const handleCreateGroup = async () => {
    try {
        setError(""); 

        if (!groupName.trim()) {
            setError("Group name is required.");
            return;
        }

        const validEmails = emailList.filter(email => email.trim() !== "");
        if (validEmails.length === 0) {
            setError("At least one member email is required.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found. Redirecting to login...");
            setTimeout(() => handleSignOut(), 2000);
            return;
        }

        const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/group/creategroup`,
            { data: { name: groupName, email_list: validEmails } },
            {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );

        if (response.data.status) {
            await fetchUserData(token);

            setSnackbar({
                open: true,
                message: response.data.message || "Group created successfully!",
                severity: "success"
            });

            // Reset input fields
            setGroupName("");
            setEmailList([]);
            handleCloseModal();
        }
    } catch (error) {
        console.error("Error creating group:", error);

        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                setError("Session expired. Redirecting to login...");
                setTimeout(() => handleSignOut(), 2000);
                return;
            }

            if (status === 400) {
                if (data.invalidlist) {
                    const invalidEmails = data.invalidlist.map(item => item.email);
                    setError(`Invalid emails: ${invalidEmails.join(", ")}`);
                    setHighlightedEmails(invalidEmails);
                    return;
                }
                setError(data.message || "Invalid request. Please check your inputs.");
                return;
            }

            if (status === 409) {
                if (data.duplicateEmails) {
                    setError(`Duplicate emails found: ${data.duplicateEmails.join(", ")}`);
                    return;
                }
            }

            if (status === 500) {
                setSnackbar({
                    open: true,
                    message: "Internal server error. Please try again later.",
                    severity: "error"
                });
                return;
            }
        } else {
            setError("Network error. Please check your internet connection.");
        }
    }
};

  
  const handleCloseModal = () => {
    setIsCreateGroupModalOpen(false);
    setError("");
    setGroupName("");
    setEmailList([""]);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("verify_token");
    navigate("/auth");
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleExpandClick = () => {
    setExpanded((prev) => !prev);
  };

  const handleCreateGroupClick = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <IconButton 
        sx={{ 
          display: { xs: "block", sm: "block", md: "none" }, 
          position: "absolute", 
          top: 10, 
          left: 10, 
          zIndex: 1500 
        }} 
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Drawer 
        variant="permanent" 
        sx={{ 
          width: 280, 
          flexShrink: 0, 
          "& .MuiDrawer-paper": { 
            width: 280, 
            boxSizing: "border-box",
            background: 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)'
          }, 
          display: { xs: "none", sm: "block" } 
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            mb: 2
          }}
        >
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#fff',
              color: '#1976d2',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}
          >
            {name ? name.charAt(0).toUpperCase() : "?"}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {name ? name : "Loading..."}
            </Typography>
            
          </Box>
        </Box>

        <List sx={{ px: 2 }}>
          <ListItem 
            button 
            onClick={() => navigate("/homepage")}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <HomeRoundedIcon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem 
            button 
            onClick={() => navigate("/dashboard")}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <DashboardRoundedIcon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem 
            button 
            onClick={handleProfileClick}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <PersonRoundedIcon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>

          <ListItem 
            button 
            onClick={handleExpandClick}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <GroupsRoundedIcon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText primary="Groups" />
            <IconButton 
              sx={{ 
                ml: 'auto',
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.3s'
              }}
            >
              <KeyboardArrowDownRoundedIcon />
            </IconButton>
          </ListItem>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <List component="div" sx={{ pl: 4 }}>
              {groups.map((group) => (
                <ListItem 
                  button 
                  key={group.group_id} 
                  onClick={() => navigate(`/group/${group.group_id}`, { 
                    state: { group_name: group.group_name } 
                  })}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      background: 'rgba(91, 97, 103, 0.08)'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: '#1976d2',
                        fontSize: '0.875rem'
                      }}
                    >
                      {group.group_name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={group.group_name}
                    primaryTypographyProps={{
                      fontSize: '0.875rem'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>

          <ListItem 
            button 
            onClick={handleCreateGroupClick}
            sx={{
              borderRadius: 2,
              mb: 1,
              '&:hover': {
                background: 'rgba(25, 118, 210, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <GroupAddRoundedIcon sx={{ color: '#1976d2' }} />
            </ListItemIcon>
            <ListItemText primary="Create Group" />
          </ListItem>
        </List>

        <Divider sx={{ my: 2, mx: 2 }} />

        <List sx={{ px: 2 }}>
          <ListItem 
            button 
            onClick={handleSignOut}
            sx={{
              borderRadius: 2,
              color: '#d32f2f',
              '&:hover': {
                background: 'rgba(211, 47, 47, 0.08)'
              }
            }}
          >
            <ListItemIcon>
              <LogoutRoundedIcon sx={{ color: '#d32f2f' }} />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItem>
        </List>
      </Drawer>

      <ProfileModal
        open={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        name={name}
        email={email}
        isNotificationEnabled={isNotificationEnabled}
        setName={setName}
      />

      <Modal 
        open={isCreateGroupModalOpen} 
        onClose={handleCloseModal}
      >
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3 }}>
            Create New Group
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            sx={{ mb: 3 }}
            error={!groupName.trim() && error}
            helperText={!groupName.trim() && error ? "Group name is required" : ""}
          />

          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Group Members
          </Typography>

          <Stack spacing={2}>
            {emailList.map((email, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
              fullWidth
              name={`email-${index}`}
              label={`Member ${index + 1} Email`}
              value={email}
              onChange={(e) => handleEmailChange(index, e.target.value)}
              error={highlightedEmails.includes(email)} 
              type="email"
              InputProps={{
                endAdornment: emailList.length > 1 && (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => handleRemoveEmail(index)}
                      edge="end"
                      color="error"
                    >
                      <RemoveCircleRoundedIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

              </Box>
            ))}
          </Stack>

          <Button
            startIcon={<AddCircleRoundedIcon />}
            onClick={handleAddEmail}
            sx={{ mt: 2 }}
          >
            Add Another Member
          </Button>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Sidebar;