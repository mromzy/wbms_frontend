import moment from "moment";
import { toast } from "react-toastify";

import Config from "../configs";
import * as TransactionAPI from "../api/transactionApi";
import * as SemaiAPI from "../api/semaiApi";

export const CopyWBToSemai = (data) => {
  data.jsonData.externalRefNo = data.bonTripNo;

  if (data.originWeighInKg > 0) {
    data.jsonData.originWeighInKg = data.originWeighInKg;
    data.jsonData.originWeighInOperatorName = data.originWeighInOperatorName;
    data.jsonData.originWeighInTimestamp = ConvertDateStr(
      data.originWeighInTimestamp
    );
  }

  if (data.originWeighOutKg > 0) {
    data.jsonData.originWeighOutKg = data.originWeighOutKg;
    data.jsonData.originWeighOutOperatorName = data.originWeighOutOperatorName;
    data.jsonData.originWeighOutTimestamp = ConvertDateStr(
      data.originWeighOutTimestamp
    );
  }

  return data;
};

export const CopyWBRToSemai = (data) => {
  if (data.returnWeighInKg > 0) {
    data.jsonData.returnWeighInKg = data.returnWeighInKg;
    data.jsonData.returnWeighInOperatorName = data.returnWeighInOperatorName;
    data.jsonData.returnWeighInTimestamp = ConvertDateStr(
      data.returnWeighInTimestamp
    );
  }

  if (data.returnWeighOutKg > 0) {
    data.jsonData.returnWeighOutKg = data.returnWeighOutKg;
    data.jsonData.returnWeighOutOperatorName = data.returnWeighOutOperatorName;
    data.jsonData.returnWeighOutTimestamp = ConvertDateStr(
      data.returnWeighOutTimestamp
    );
  }

  return data;
};

export const CopyWBDToSemai = (data) => {
  if (data.destinationWeighInKg) {
    data.jsonData.destinationWeighInKg = data.destinationWeighInKg;
    data.jsonData.destinationWeighInOperatorName =
      data.destinationWeighInOperatorName;
    data.jsonData.destinationWeighInTimestamp = ConvertDateStr(
      data.destinationWeighInTimestamp
    );
  }

  if (data.destinationWeighOutKg > 0) {
    data.jsonData.destinationWeighOutKg = data.destinationWeighOutKg;
    data.jsonData.destinationWeighOutOperatorName =
      data.destinationWeighOutOperatorName;
    data.jsonData.destinationWeighOutTimestamp = ConvertDateStr(
      data.destinationWeighOutTimestamp
    );
  }

  return data;
};

export const CopyQRToWBMS = (data) => {
  data.bonTripNo = data.jsonData.externalRefNo;
  data.vehiclePlateNo = data.jsonData.vehiclePlateNo;
  data.vehicleStatus = data.jsonData.vehicleOperationStatus;
  data.deliveryStatus = data?.jsonData?.deliveryStatus || 0;

  data.originWeighInKg = data.jsonData?.originWeighInKg || 0;
  data.originWeighInOperatorName =
    data.jsonData?.originWeighInOperatorName || "";
  data.originWeighInTimestamp = data.jsonData?.originWeighInTimestamp || "";

  data.originWeighOutKg = data.jsonData?.originWeighOutKg || 0;
  data.originWeighOutOperatorName =
    data.jsonData?.originWeighOutOperatorName || "";
  data.originWeighOutTimestamp = data.jsonData?.originWeighOutTimestamp || "";

  data.returnWeighInKg = data.jsonData?.returnWeighInKg || 0;
  data.returnWeighInOperatorName =
    data.jsonData?.returnWeighInOperatorName || "";
  data.returnWeighInTimestamp = data.jsonData?.returnWeighInTimestamp || "";

  data.returnWeighOutKg = data.jsonData?.returnWeighOutKg || 0;
  data.returnWeighOutOperatorName =
    data.jsonData?.returnWeighOutOperatorName || "";
  data.returnWeighOutTimestamp = data.jsonData?.returnWeighOutTimestamp || "";

  return { ...data };
};

export const UpdateStatusToWBMS = (data) => {
  data.vehicleStatus = data.jsonData?.vehicleOperationStatus || 0;
  data.deliveryStatus = data.jsonData?.deliveryStatus || 0;
  data.deliveryOrderId = data.jsonData?.deliveryOrderId || "";
  data.deliveryOrderNo = data.jsonData?.deliveryOrderNo || "";
  data.deliveryDate = data.jsonData?.deliveryDate
    ? moment(data.jsonData?.deliveryDate).toDate()
    : null;

  data.productCode = data.jsonData?.productCode || "";
  data.productName = data.jsonData?.productName || "";

  data.destinationSiteCode = data.jsonData?.destinationSiteCode || "";
  data.destinationSiteName = data.jsonData?.destinationSiteName || "";

  //ini nanti dipindah ke backend dan ditambahkan untuk seluruh data

  return data;
};

export const GetDateStr = () => {
  return moment().format(`yyyy-MM-DD[T]HH:mm:ssZZ`);
};

export const ConvertDateStr = (date) => {
  return moment(date).local().format(`yyyy-MM-DD[T]HH:mm:ssZZ`);
};

export const GenerateQrCode = async (id, functionCode) => {
  try {
    const resultEncodeQrcode = await SemaiAPI.encodeQrcode(id, functionCode);

    if (!resultEncodeQrcode?.status) {
      return toast.error(`Error: ${resultEncodeQrcode?.message}.`);
    }

    toast.success(`Generate QRCode sukses.`);

    return resultEncodeQrcode?.record;
  } catch (error) {
    return toast.error(`Error: ${error.message}.`);
  }
};
