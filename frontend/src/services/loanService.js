import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/PersonalLoan`;

const getAuthHeader = () => {
  const token = sessionStorage.getItem('tushgpt_jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const loanService = {
  saveLoan: async (data) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to save loan');
    }
    return await response.json();
  },
  getLoan: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch loan');
    return await response.json();
  },
  getAllLoans: async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch loans');
    return await response.json();
  },
  deleteLoan: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete loan');
    }
    return true;
  }
};

export default loanService;