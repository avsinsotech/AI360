import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/GoldLoan`;

const getAuthHeader = () => {
  const token = sessionStorage.getItem('tushgpt_jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const goldLoanService = {
  /**
   * Save or Update Gold Loan
   */
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
        throw new Error(error || 'Failed to save gold loan');
    }
    return await response.json();
  },

  /**
   * Fetch single gold loan
   */
  getLoan: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch gold loan detail');
    return await response.json();
  },

  /**
   * Delete gold loan
   */
  deleteLoan: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete gold loan');
    }
    return true;
  }
};

export default goldLoanService;
