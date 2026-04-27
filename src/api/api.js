import axios from 'axios';

// axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true
});

// Add token to all requests
api.interceptors.request.use((config) => {
  debugger;
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}` ;
  }
  return config;
});

// Auth APIs
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await api.post('/auth/verify', { token });
    return response.data;
  }
};

// User Profile APIs
export const userApi = {
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/user/changepassword', passwordData);
    return response.data;
  }
};

// Personal Expense APIs
export const personalExpenseApi = {
  fetchExpenses: async () => {
    const response = await api.get('/user/totalexpenseofuser');
    return response.data;
  },

  fetchTotalExpense: async () => {
    const response = await api.get('/user/totalexpenseofuser');
    return parseFloat(response.data.total_expense);
  },

  addExpense: async (expenseData) => {
    const response = await api.post('/user/expenses', expenseData);
    return response.data;
  },

  updateExpense: async (expenseData) => {
    const response = await api.put('/user/updatepersonalexpense', expenseData);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await api.delete('/user/deletepersonalexpense', {
      data: { id: expenseId }
    });
    return response.data;
  },

  getExpensesByCategory: async () => {
    const response = await api.get('/user/userexpensecategorywise');
    return response.data;
  },

  getExpenseHistory: async () => {
    const response = await api.get('/user/expensehistory');
    return response.data;
  }
};

// Group APIs
export const groupApi = {
  createGroup: async (groupData) => {
    const response = await api.post('/group/create', groupData);
    return response.data;
  },

  getAllGroups: async () => {
    const response = await api.get('/group/all');
    return response.data;
  },

  getGroupDetails: async (groupId) => {
    const response = await api.get(`/group/${groupId}`);
    return response.data;
  },

  addMember: async (groupId, memberData) => {
    const response = await api.post(`/group/${groupId}/members`, memberData);
    return response.data;
  },

  removeMember: async (groupId, memberId) => {
    const response = await api.delete(`/group/${groupId}/members/${memberId}`);
    return response.data;
  }
};

// Group Expense APIs
export const groupExpenseApi = {
  fetchGroupExpenses: async (groupId) => {
    const response = await api.post('/group/getgrouphistory', { g_id: groupId });
    return response.data;
  },

  fetchGroupTotal: async (groupId) => {
    const response = await api.post('/group/getgrouptotal', { id: groupId });
    return response.data;
  },

  fetchGroupMembers: async (groupId) => {
    const response = await api.post('/group/getmembersandtotal', { group_id: groupId });
    return response.data;
  },

  addGroupExpense: async (expenseData) => {
    const response = await api.post('/group/creategroupexpense', expenseData);
    return response.data;
  },

  updateGroupExpense: async (expenseData) => {
    const response = await api.put('/group/updategroupexpense', expenseData);
    return response.data;
  },

  deleteGroupExpense: async (expenseId) => {
    const response = await api.delete('/group/deletegroupexpense', {
      data: { e_id: expenseId }
    });
    return response.data;
  },

  exitGroup: async (groupId) => {
    const response = await api.post('/group/exitgroup', { group_id: groupId });
    return response.data;
  },

  getGroupExpensesByCategory: async (groupId) => {
    const response = await api.get(`/group/${groupId}/expensesbycategory`);
    return response.data;
  },

  getGroupExpenseHistory: async (groupId) => {
    const response = await api.get(`/group/${groupId}/history`);
    return response.data;
  },

  settleGroupExpense: async (groupId, settlementData) => {
    const response = await api.post(`/group/${groupId}/settle`, settlementData);
    return response.data;
  }
};


api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {


      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 