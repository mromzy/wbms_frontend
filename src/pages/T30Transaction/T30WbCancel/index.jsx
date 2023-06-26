import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Grid, InputAdornment, TextField } from "@mui/material";
import { toast } from "react-toastify";
import moment from "moment";

import { WbT30TransactionContext } from "../../../context/WbT30TransactionContext";
import { ProgressStatusContext } from "../../../context/ProgressStatusContext";

import GetWeightWB from "../../../components/GetWeightWB";
import QRCodeViewer from "../../../components/QRCodeViewer";

import Config from "../../../configs";
import { useForm } from "../../../utils/useForm";
import * as SemaiUtils from "../../../utils/SemaiUtils";
import * as TransactionAPI from "../../../api/transactionApi";
import * as SemaiAPI from "../../../api/semaiApi";

const T30WbCancel = (props) => {
  const { wbT30Transaction, setWbT30Transaction } = useContext(
    WbT30TransactionContext
  );
  const { setProgressStatus } = useContext(ProgressStatusContext);
  const navigate = useNavigate();

  const [user] = useState({
    id: 1,
    username: "mromzy",
    email: "mromzy@gmail.com",
    fullname: "Muhammad Romzi",
  });

  const { values, setValues } = useForm({ ...TransactionAPI.InitialData });
  const [originWeighNetto, setOriginWeighNetto] = useState(0);
  const [returnWeighNetto, setReturnWeighNetto] = useState(0);

  const [canSubmit, setCanSubmit] = useState(false);
  const [showQRCodeViewer, setShowQRCodeViewer] = useState(false);
  const [qrContent, setQrContent] = useState("");

  useEffect(() => {
    console.log("kesini");
    const getTransaction = async () => {
      try {
        const rSearch = await TransactionAPI.searchFirst({
          where: {
            transportVehiclePlateNo: wbT30Transaction?.transportVehiclePlateNo,
            progressStatus: { in: [1, 4, 6] },
            tType: 2,
          },
          orderBy: { bonTripNo: "desc" },
        });

        // (case: check apakah pks asalnya sesuai)
        if (!rSearch?.status || !rSearch.record) {
          toast.error(
            `Error mencari data transaksi PEMBATALAN dengan Plat nomor: ${wbT30Transaction?.vehiclePlateNo}, error: ${rSearch?.message}.`
          );

          return handleClose();
        }

        // Secara pemahaman jsonData dalam mobile app semai tidak terupdate (tidak berubah)
        const tempTrans = { ...rSearch.record };
        tempTrans.vehicleOperationStatus =
          wbT30Transaction.vehicleOperationStatus;
        tempTrans.deliveryStatus = wbT30Transaction.deliveryStatus;

        if (tempTrans.progressStatus === 1 || tempTrans.progressStatus === 4) {
          //tempTrans.jsonData = { ...wbT30Transaction.jsonData }; // karena data berubah
          tempTrans.progressStatus = 5;
        } else if (tempTrans.progressStatus === 6) {
          tempTrans.progressStatus = 7;
        }

        setValues({ ...tempTrans });
      } catch (error) {
        toast.error(`Error: ${error.message}.`);
        return handleClose();
      }
    };

    getTransaction();
  }, []);

  useEffect(() => {
    setProgressStatus(Config.PKS_PROGRESS_STATUS[values.progressStatus]);

    if (
      values.originWeighInKg < Config.ENV.WBMS_WB_MIN_WEIGHT ||
      values.originWeighOutKg < Config.ENV.WBMS_WB_MIN_WEIGHT
    ) {
      setOriginWeighNetto(0);
    } else {
      let total = Math.abs(values.originWeighInKg - values.originWeighOutKg);

      setOriginWeighNetto(total);
    }

    if (
      values.returnWeighInKg < Config.ENV.WBMS_WB_MIN_WEIGHT ||
      values.returnWeighOutKg < Config.ENV.WBMS_WB_MIN_WEIGHT
    ) {
      setReturnWeighNetto(0);
    } else {
      let total = Math.abs(values.returnWeighInKg - values.returnWeighOutKg);

      setReturnWeighNetto(total);
    }
  }, [values]);

  // Untuk validasi field
  useEffect(() => {
    let cSubmit = false;

    if (values.progressStatus === 5) {
      if (values.returnWeighInKg >= Config.ENV.WBMS_WB_MIN_WEIGHT) {
        cSubmit = true;
      }
    } else if (values.progressStatus === 7) {
      if (values.returnWeighOutKg >= Config.ENV.WBMS_WB_MIN_WEIGHT)
        cSubmit = true;
    }

    setCanSubmit(cSubmit);
  }, [values]);

  const handleClose = () => {
    navigate("/wb/t30-transaction");

    setProgressStatus("-");
    setWbT30Transaction(null);
  };

  const handleSubmit = async () => {
    let tempTrans = { ...values };

    if (tempTrans.progressStatus === 5) {
      tempTrans.progressStatus = 6;
      // tempTrans.returnWeighInTimestamp = SemaiUtils.GetDateStr();
      tempTrans.returnWeighInTimestamp = moment().toDate();
      tempTrans.returnWeighInOperatorName = user.fullname;
    } else {
      // progressStatus === 7
      tempTrans.progressStatus = 8;
      // tempTrans.returnWeighOutTimestamp = SemaiUtils.GetDateStr();
      tempTrans.returnWeighOutTimestamp = moment().toDate();
      tempTrans.returnWeighOutOperatorName = user.fullname;

      tempTrans = SemaiUtils.CopyWBToSemai(tempTrans);
      tempTrans = SemaiUtils.CopyWBRToSemai(tempTrans);
    }

    try {
      if (tempTrans.progressStatus === 6) {
        const rUpdTrans = await TransactionAPI.update({ ...tempTrans });

        if (!rUpdTrans?.status) {
          toast.error(`Error: ${rUpdTrans?.message}.`);
          return;
        }

        toast.success(`Transaksi CANCEL WB-IN telah tersimpan.`);

        return handleClose();
      } else if (tempTrans.progressStatus === 8) {
        const rCanceledAPI = await SemaiAPI.closeDeliveryCanceled({
          ...tempTrans.jsonData,
        });

        if (!rCanceledAPI?.status) {
          toast.error(`Error : ${rCanceledAPI?.message}.`);
          return;
        }

        toast.success(`Close Delivery as Canceled sukses.`);

        tempTrans.progressStatus = 9;
        tempTrans.jsonData = { ...rCanceledAPI?.data.transaction };
        tempTrans = SemaiUtils.UpdateStatusToWBMS(tempTrans);

        const rUpdTrans = await TransactionAPI.update({ ...tempTrans });

        if (!rUpdTrans?.status) {
          toast.error(`Error: ${rUpdTrans?.message}.`);
          return;
        }

        toast.success(`Transaksi CANCEL WB-OUT telah tersimpan.`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}.`);
      return;
    }

    setValues({ ...tempTrans });
  };

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1, backgroundColor: "whitesmoke" }}
            label="Nomor BON Trip"
            name="bonTripNo"
            value={values?.bonTripNo || ""}
          />

          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1, backgroundColor: "whitesmoke" }}
            label="Nomor Polisi"
            name="transportVehiclePlateNo"
            value={values?.transportVehiclePlateNo || ""}
          />

          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1, backgroundColor: "whitesmoke" }}
            label="Nama Supir"
            name="driverFullName"
            value={values?.jsonData?.driverFullName || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1, backgroundColor: "whitesmoke" }}
            label="Nama Vendor"
            name="transporterCompanyFullName"
            value={values?.jsonData?.transporterCompanyFullName || ""}
          />

          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 1, backgroundColor: "whitesmoke" }}
            label="Sertifikasi Tipe Truk"
            name="vehicleAllowableSccModel"
            value={
              Config.SCC_MODEL[values?.jsonData?.vehicleAllowableSccModel || 0]
            }
          />
        </Grid>

        <Grid item xs={3}>
          {values.progressStatus === 5 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  returnWeighInKg: weightWb,
                }));
              }}
            />
          )}
          {values.progressStatus === 7 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  returnWeighOutKg: weightWb,
                }));
              }}
            />
          )}

          <TextField
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            label="Weight IN"
            name="originWeighInKg"
            value={values.originWeighInKg}
          />

          <TextField
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            label="Weight OUT"
            name="originWeighOutKg"
            value={values.originWeighOutKg}
          />
          <TextField
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            label="TOTAL"
            name="weightNetto"
            value={originWeighNetto}
          />
          <TextField
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            label="RETURN Weight IN"
            name="returnWeighInKg"
            value={values.returnWeighInKg}
          />
          <TextField
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            label="RETURN Weight OUT"
            name="returnWeighOutKg"
            value={values.returnWeighOutKg}
          />
          <TextField
            type="number"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
            label="TOTAL RETURN"
            name="returnWeightNetto"
            value={returnWeighNetto}
          />
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleSubmit}
            disabled={
              !(
                canSubmit &&
                (values.progressStatus === 5 || values.progressStatus === 7)
              )
            }
          >
            Simpan
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => {
              // Function Code 13 = Closed Delivery as Canceled
              SemaiAPI.encodeQrcode(values.jsonData.deliveryOrderId, 13).then(
                (results) => {
                  setQrContent(results.data.qrcode);
                  setShowQRCodeViewer(true);
                }
              );
            }}
            disabled={!(values.progressStatus === 9)}
          >
            Tampilkan QR
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleClose}
          >
            Tutup
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => {
              console.log("data transaction:");
              console.log(values);
            }}
          >
            Debugging
          </Button>
        </Grid>

        <Grid item xs={6}>
          {/* others content */}
        </Grid>
      </Grid>

      <QRCodeViewer
        visible={showQRCodeViewer}
        qrContent={qrContent}
        handleClose={() => {
          setShowQRCodeViewer(false);
          setQrContent("");
        }}
      />
    </>
  );
};

export default T30WbCancel;
