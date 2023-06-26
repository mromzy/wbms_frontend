import * as ConfigAPI from "../api/configApi";

const sccModel = {
  0: "None",
  1: "Mass Balance",
  2: "Segregated",
  3: "Identity Preserved",
};

const pksProgressStatus = {
  0: "TIMBANG MASUK",
  1: "LOADING/UNLOADING",
  2: "TIMBANG KELUAR",
  3: "DATA DISPATCHED",
  4: "DATA DISPATCHED",
  5: "CANCEL\nTIMBANG MASUK",
  6: "CANCEL\nUNLOADING",
  7: "CANCEL\nTIMBANG KELUAR",
  8: "CANCEL\nSUBMITTED",
  9: "CANCEL\nSUBMITTED",
  10: "REJECT\nTIMBANG MASUK",
  11: "REJECT\nUNLOADING",
  12: "REJECT\nTIMBANG KELUAR",
  13: "REJECT\nSUBMITTED",
  14: "REJECT\nSUBMITTED",
  15: "SELESAI",
};

const t30ProgressStatus = {
  0: "TIMBANG MASUK",
  1: "TIMBANG MASUK\nVALIDATED",
  2: "TIMBANG KELUAR",
  3: "DATA DISPATCHED",
  4: "DATA DISPATCHED",
  5: "CANCEL\nTIMBANG MASUK",
  6: "CANCEL\nUNLOADING",
  7: "CANCEL\nTIMBANG KELUAR",
  8: "CANCEL\nSUBMITTED",
  9: "CANCEL\nSUBMITTED",
  15: "SELESAI",
};

const bulkingProgressStatus = {
  0: "TIMBANG MASUK",
  1: "TIMBANG MASUK\nVALIDATED",
  2: "TIMBANG KELUAR",
  3: "DATA SUBMITED",
  4: "DATA SUBMITED",
  12: "REJECT\nTIMBANG KELUAR",
  13: "REJECT\nSUBMITTED",
  14: "REJECT\nSUBMITTED",
  15: "SELESAI",
};

// 4:15 harus dirubah, ini sementara, status ini tidak valid, seharusnya 4:20
const WbTransactionUrlMapping = {
  1: {
    1: { 0: "/wb/pks-transaction/normal", 15: "/wb/pks-transaction/cancel" },
    3: { 10: "/wb/pks-transaction/normal", 15: "/wb/pks-transaction/cancel" },
    4: { 15: "/wb/pks-transaction/cancel", 20: "/wb/pks-transaction/cancel" },
    5: { 23: "/wb/pks-transaction/reject" },
  },
  2: {
    1: { 0: "/wb/t30-transaction/normal" },
    4: { 20: "/wb/t30-transaction/cancel" },
  },
  3: {
    4: { 20: "/wb/bulking-transaction/normal" },
  },
};

export const getEnvInit = async () => {
  Config.ENV = await ConfigAPI.getEnv();

  return Config.ENV;
};

const Config = {
  ENV: {},

  WB_TRANSACTION_URL_MAPPING: WbTransactionUrlMapping,

  PKS_PROGRESS_STATUS: pksProgressStatus,
  T30_PROGRESS_STATUS: t30ProgressStatus,
  BULKING_PROGRESS_STATUS: bulkingProgressStatus,
  SCC_MODEL: sccModel,
};

getEnvInit();

export default Config;
