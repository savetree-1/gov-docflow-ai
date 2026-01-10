import axios from "axios";

/****** Using the URL from your environment variables ******/
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

export const fetchBottlenecks = async (token) => {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(`${API_URL}/analytics/bottlenecks`, config);
  return response.data;
};
