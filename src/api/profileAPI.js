import instance from "./config";

const url = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const getProfile = async ({ uuid, accessToken }) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  try {
    const res = await instance.get(`${url}/users/${uuid}/`, { headers });
    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err.response?.data?.msg);
  }
};
