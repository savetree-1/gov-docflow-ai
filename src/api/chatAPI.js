import axios from "axios";

const API_URL = "http://localhost:5001/api";

export const fetchChatHistory = async (adminId, token) => {
  try {
    const response = await axios.get(`${API_URL}/chat/${adminId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};
