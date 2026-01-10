import instance from "./config";

export const getProfile = async ({ uuid, accessToken }) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  try {
    const res = await instance.get(`/api/users/${uuid}/`, { headers });
    return Promise.resolve(res.data);
  } catch (err) {
    return Promise.reject(err.response?.data?.msg);
  }
};
