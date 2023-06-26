import axios from "axios";

const { REACT_APP_WBMS_BACKEND_URL } = process.env;

console.log(REACT_APP_WBMS_BACKEND_URL);

const api = axios.create({
  baseURL: `${REACT_APP_WBMS_BACKEND_URL}/`,
});

console.log(api.baseURL);

export const endpoint = "/users";

export const getAll = async () => {
  const response = await api.get(endpoint);
  return response.data;
};

export const getById = async (id) => {
  const response = await api.get(`${endpoint}/${id}`);
  return response.data;
};

export const createNew = async (data) => {
  const response = await api.post(endpoint, data);
  return response.data;
};

export const updateData = async (data) => {
  const response = await api.patch(`${endpoint}/${data.id}`, data);
  return response.data;
};

export const deleteById = async (id) => {
  const response = await api.delete(`${endpoint}/${id}`);
  return response.data;
};
