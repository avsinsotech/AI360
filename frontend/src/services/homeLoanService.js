import API_BASE_URL from '../config';

const API_URL = `${API_BASE_URL}/HomeLoan`;

const getAuthHeader = () => {
  const token = sessionStorage.getItem('tushgpt_jwt');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const homeLoanService = {
  /**
   * Fetch all home loan applications (lightweight list)
   */
  getAllLoans: async () => {
    const response = await fetch(API_URL, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch home loans');
    return await response.json();
  },

  /**
   * Fetch a single loan detail with its full formData
   */
  getLoan: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch home loan detail');
    return await response.json();
  },

  /**
   * Create a new home loan application
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
        throw new Error(error || 'Failed to save home loan');
    }
    return await response.json();
  },

  /**
   * Update an existing home loan application
   */
  updateLoan: async (id, data) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update home loan');
    }
    return await response.json();
  },

  /**
   * Delete an application
   */
  deleteLoan: async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete home loan');
    return true;
  }
};

export default homeLoanService;
