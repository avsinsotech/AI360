import API_BASE_URL from '../config';

export const globalSearch = async (query) => {
  const token = sessionStorage.getItem('tushgpt_jwt');
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
        throw new Error('Search request failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Global search failed:', error);
    return [];
  }
};
