import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from '../pages/Dashboard/Dashboard';
import AuthPage  from '../pages/Authpage/Authpage';
import Homepage from '../pages/Homepage/Homepage';
import GroupExpensePage from '../pages/GroupExpensePage/GroupExpensePage';
const Navigation = () => {
  return (
   
                    <Router>
                      <Routes>
                        <Route path="/" element={<AuthPage />} />
                        <Route path="/homepage" element={<Homepage />} />
                         <Route path="/dashboard" element={<Dashboard />} />
                         <Route path="/group/:groupId" element={<GroupExpensePage />} />
                        <Route path="*" element={<AuthPage />} /> 
                      </Routes>
                    </Router>
        
  );
}

export default Navigation





