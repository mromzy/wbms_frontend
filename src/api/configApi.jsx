import axios from "axios";

const { REACT_APP_WBMS_BACKEND_API_URL } = process.env;

const api = axios.create({
  baseURL: `${REACT_APP_WBMS_BACKEND_API_URL}/`,
});

export const endpoint = "enum";

export const getEnv = async () => {
  const response = await api.get("configs/env");

  return response.data.data?.ENV;
};

export const getVA_SCC_MODEL = () => {
  const response = {
    data: [
      { id: 0, value: "None" },
      { id: 1, value: "Mass Balance" },
      { id: 2, value: "Segregated" },
      { id: 3, value: "Identity Preserved" },
    ],
  };
  return response.data;
};

export const getRSPO_SCC_MODEL = () => {
  const response = {
    data: [
      { id: 0, value: "None" },
      { id: 1, value: "Mass Balance" },
      { id: 2, value: "Segregated" },
      { id: 3, value: "Identity Preserved" },
    ],
  };
  return response.data;
};

export const getISCC_SCC_MODEL = () => {
  const response = {
    data: [
      { id: 0, value: "None" },
      { id: 1, value: "Mass Balance" },
      { id: 2, value: "Segregated" },
      { id: 3, value: "Identity Preserved" },
    ],
  };
  return response.data;
};

export const getById = async (id) => {
  const response = await api.get(`${endpoint}/${id}`);
  return response.data;
};
