import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Adjust this for production

// GET /api/bot-status
export const getBotStatus = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/bot-status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bot status:", error);
    return null;
  }
};

// GET /api/tokens
export const getTokenData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/tokens`);
    return response.data;
  } catch (error) {
    console.error("Error fetching token data:", error);
    return null;
  }
};

