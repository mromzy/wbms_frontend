import axios from "axios";

// import { getEnvInit } from "../configs";

// let api = null;

// const ENV = (async () =>
//   await getEnvInit().then((result) => {
//     api = axios.create({
//       baseURL: `${result.WBMS_SEMAI_BACKEND_URL}/`,
//       headers: {
//         common: {
//           "x-api-key": result.WBMS_SEMAI_API_KEY,
//         },
//       },
//     });

//     return result;
//   }))();

// const { WBMS_SEMAI_BACKEND_URL, WBMS_SEMAI_API_KEY } = Config.ENV;

const { REACT_APP_WBMS_BACKEND_API_URL } = process.env;

const api = axios.create({
  baseURL: `${REACT_APP_WBMS_BACKEND_API_URL}/`,
});

export const endpoint = "semai";

// export const decodeQrcode = async (data) => {
//   const dataOut = {
//     status: false,
//     message: "",
//     data: {},
//   };

//   const response = await api
//     .post(`${endpoint}/decode-qrcode`, data)
//     .catch((error) => {
//       dataOut.message = error.message;
//       dataOut.data.error = error;
//     });

//   // dataOut.status = response.data?.success || false;
//   // dataOut.message = response.data?.message || "";
//   // dataOut.data.jsonData = response.data?.record || null;

//   return response.data;
// };

export const dispatchDelivery = async (data) => {
  const response = await api.post(`${endpoint}/dispatch-delivery`, data);

  return response.data;
};

export const rejectDelivery = async (data) => {
  const response = await api.post(`${endpoint}/reject-delivery`, data);

  return response.data;
};

export const closeDeliveryCanceled = async (data) => {
  const response = await api.post(
    `${endpoint}/close-delivery-as-canceled`,
    data
  );

  return response.data;
};

export const closeDeliveryAccepted = async (data) => {
  const response = await api.post(
    `${endpoint}/close-delivery-as-accepted`,
    data
  );

  return response.data;
};

export const closeDeliveryRejected = async (data) => {
  const response = await api.post(
    `${endpoint}/close-delivery-as-rejected`,
    data
  );

  return response.data;
};

export const validateDispatchDelivery = async (data) => {
  const response = await api.post(
    `${endpoint}/validate-dispatch-delivery`,
    data
  );

  return response.data;
};

export const validateUnloading = async (data) => {
  const response = await api.post(`${endpoint}/validate-unloading`, data);

  return response.data;
};

export const encodeQrcode = async (orderId, functionCode) => {
  const data = {
    orderId,
    functionCode,
  };

  const response = await api.post(`${endpoint}/encode-qrcode`, data);

  return response.data;
};

export const getSites = async () => {
  const response = await api.get(`sites`);
  return response.data;
};

export const getStorageTanks = async () => {
  const response = await api.get(`storage-tanks`);
  return response.data;
};

export const getStorageTanksBySiteID = async (siteID) => {
  const data = { params: {} };

  data.params.fltSiteId = siteID;

  const response = await api.get(`storage-tanks`, data);
  return response.data;
};

export const getTransportVehicles = async () => {
  const response = await api.get(`transport-vehicles`);
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get(`products`);
  return response.data;
};

export const getT30Site = () => {
  const t30 = {
    code: "T30",
    companyId: "1ebcf18d-249f-6976-a935-2191b934b823",
    companyName: "PT DHARMA SATYA NUSANTARA",
    createdBy: "user01",
    createdTime: "2022-10-16T08:37:57+0000",
    description: "Desa Miau Baru, Kec. Kongbeng",
    id: "1ed4d2dd-5f82-6d72-a734-af3611b77aab",
    isDeleted: 0,
    isMill: false,
    latitude: 1.27632,
    longitude: 116.889,
    name: "T30",
    shortName: "T30",
    solarCalibration: 14,
    syncedStatus: 1,
    syncedTime: "2023-01-09T00:27:42+0000",
    updatedBy: "user01",
    updatedTime: "2022-10-16T08:37:57+0000",
    version: 2,
  };

  return t30;
};

export const getLabananSite = () => {
  const data = {
    code: "DS14/DI14/SW14",
    companyId: "1ebcf18d-249f-6976-a935-2191b934b823",
    companyName: "PT DHARMA SATYA NUSANTARA",
    createdBy: "user01",
    createdTime: "2022-10-16T08:38:43+0000",
    description: "Jalan Petani 2, Desa Labanan, Kec. Teluk Bayur",
    id: "1ed4d2df-187a-6f7b-a734-af3611b77aab",
    isDeleted: 0,
    isMill: false,
    latitude: 2.09176,
    longitude: 117.322,
    name: "Bulking Station Labanan",
    sourceSiteId: "1ed4d2df-187a-6f7b-a734-af3611b77aab",
    sourceSiteName: "Bulking Station Labanan",
    syncedStatus: 1,
    syncedTime: "2023-04-16T14:37:32+0000",
    updatedBy: "it.admin",
    updatedTime: "2023-04-16T14:37:32+0000",
    version: 3,
  };

  return data;
};
