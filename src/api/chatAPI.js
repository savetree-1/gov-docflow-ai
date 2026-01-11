import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api/chat';

export const fetchChatHistory = async (roomId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};
