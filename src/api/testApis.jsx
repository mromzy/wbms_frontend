import axios from "axios";

const { REACT_APP_TEST_DATA_BACKEND_URL } = process.env;

const api = axios.create({
  baseURL: `${REACT_APP_TEST_DATA_BACKEND_URL}/`,
});

export const endpoint = "injectPksWbIn";

export const injectPksWbIn = async () => {
  const response = await api.get(`injectPksWbIn`);
  console.log("API Test:");
  console.log(REACT_APP_TEST_DATA_BACKEND_URL);

  return response.data;
};
