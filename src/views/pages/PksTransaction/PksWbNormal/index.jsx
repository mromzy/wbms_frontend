import { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button, Grid, InputAdornment, TextField } from "@mui/material";
import { toast } from "react-toastify";
import moment from "moment";

import { setWb } from "../../../slices/appSlice";

import { WbPksTransactionContext } from "../../../context/WbPksTransactionContext";
import { ProgressStatusContext } from "../../../context/ProgressStatusContext";

import GetWeightWB from "../../../components/GetWeightWB";
import QRCodeViewer from "../../../components/QRCodeViewer";
import BonTripPrint from "../../../components/BonTripPrint";

import Config from "../../../configs";
import { useForm } from "../../../utils/useForm";
import * as SemaiUtils from "../../../utils/SemaiUtils";
import * as TransactionAPI from "../../../api/transactionApi";
import * as SemaiAPI from "../../../api/semaiApi";

const tType = 1;

const PksWbNormal = (props) => {
  const { configs, wb } = useSelector((state) => state.app);
  const { wbPksTransaction, setWbPksTransaction } = useContext(
    WbPksTransactionContext
  );
  const { setProgressStatus } = useContext(ProgressStatusContext);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user] = useState({
    id: 1,
    username: "mromzy",
    email: "mromzy@gmail.com",
    fullname: "Muhammad Romzi",
  });

  const { values, setValues } = useForm({ ...TransactionAPI.InitialData });
  const [originWeightNetto, setOriginWeightNetto] = useState(0);

  const [canSubmit, setCanSubmit] = useState(false);
  const [showQRCodeViewer, setShowQRCodeViewer] = useState(false);
  const [qrContent, setQrContent] = useState("");

  const handleClose = () => {
    setProgressStatus("-");
    setWbPksTransaction(null);

    navigate("/wb/pks-transaction");
  };

  const handleSubmit = async () => {
    let tempTrans = { ...values };

    // progressStatus === 0, dam tempTransaction.id === 0
    if (tempTrans.progressStatus === 0) {
      tempTrans.progressStatus = 1;
      // tempTrans.originWeighInTimestamp = SemaiUtils.GetDateStr();
      tempTrans.originWeighInTimestamp = moment().toDate();
      tempTrans.originWeighInOperatorName = user.fullname;
    } else {
      // progressStatus === 2
      tempTrans.progressStatus = 3;
      // tempTrans.originWeighOutTimestamp = SemaiUtils.GetDateStr();
      tempTrans.originWeighOutTimestamp = moment().toDate();
      tempTrans.originWeighOutOperatorName = user.fullname;

      tempTrans = SemaiUtils.CopyWBToSemai(tempTrans);
    }

    try {
      // Data baru, create transaksi, progressStatus === 1 && tempTransaction.id === 0
      if (tempTrans.progressStatus === 1) {
        const results = await TransactionAPI.create({ ...tempTrans });

        if (!results?.status) {
          toast.error(`Error: ${results?.message}.`);
          return;
        }

        toast.success(`Transaksi WB-IN telah tersimpan.`);

        return handleClose();
      } else {
        // progressStatus === 3
        const rDispatchAPI = await SemaiAPI.dispatchDelivery({
          ...tempTrans.jsonData,
        });

        console.log("return JSON Data dispatchDelivery");
        console.log(rDispatchAPI);

        if (!rDispatchAPI?.status) {
          toast.error(`Error: ${rDispatchAPI?.message}.`);
          return;
        }

        toast.success("Dispatch transaksi sukses.");

        tempTrans.progressStatus = 4;
        tempTrans.jsonData = { ...rDispatchAPI?.data.transaction };
        tempTrans = SemaiUtils.UpdateStatusToWBMS(tempTrans);

        console.log("updated trans data");
        console.log(tempTrans);

        const rUpdTrans = await TransactionAPI.update({
          ...tempTrans,
        });

        if (!rUpdTrans?.status) {
          toast.error(`Error: ${rUpdTrans?.message}.`);
          return;
        }

        toast.success(`Transaksi WB-OUT telah tersimpan.`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}.`);
      return;
    }

    setValues({ ...tempTrans });
  };

  useEffect(() => {
    if (!wbPksTransaction) {
      handleClose();
      return;
    }

    dispatch(setWb({ onProcessing: true, canStartScalling: false }));

    const getTransaction = async () => {
      try {
        const rSearch = await TransactionAPI.searchFirst({
          where: {
            transportVehiclePlateNo: wbPksTransaction.transportVehiclePlateNo,
            progressStatus: 1, // cari yang statusnya unloading
            tType,
          },
          orderBy: { bonTripNo: "desc" },
        });

        // Kendaraan baru masuk, belum ada data gantung di DB
        if (!rSearch?.status || !rSearch.record) {
          if (wbPksTransaction?.deliveryStatus !== 0) {
            toast.error("Error: vStatus atau dStatus tidak valid.");

            return handleClose();
          }

          let bonTripNo = `P041${moment().format("YYMMDDHHmmss")}`; //moment().valueOf()

          setValues({
            ...wbPksTransaction,
            tType: 1,
            bonTripNo,
            progressStatus: 0,
          });

          return;
        }

        if (wbPksTransaction?.deliveryStatus === 0) {
          toast.error("Error: vStatus atau dStatus tidak valid.");

          return handleClose();
        }

        // Secara pemahaman jsonData dalam mobile app semai terupdate (berubah) ketika scan QR dari mobile APP Semai
        const tempTrans = { ...rSearch.record };
        tempTrans.vehicleStatus = wbPksTransaction.vehicleStatus;
        tempTrans.deliveryStatus = wbPksTransaction.deliveryStatus;
        tempTrans.jsonData = { ...wbPksTransaction.jsonData };
        tempTrans.progressStatus = 2;

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
      setOriginWeightNetto(0);
    } else {
      let total =
        Math.abs(values.originWeighInKg - values.originWeighOutKg) -
        values.potonganWajib -
        values.potonganLain;
      setOriginWeightNetto(total);
    }
  }, [values]);

  // Untuk validasi field
  useEffect(() => {
    let cSubmit = false;

    if (values.progressStatus === 0) {
      if (values.originWeighInKg >= Config.ENV.WBMS_WB_MIN_WEIGHT) {
        cSubmit = true;
      }
    } else if (values.progressStatus === 2) {
      if (values.originWeighOutKg >= Config.ENV.WBMS_WB_MIN_WEIGHT)
        cSubmit = true;
    }

    setCanSubmit(cSubmit);
  }, [values]);

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
            sx={{ my: 1, backgroundColor: "whitesmoke" }}
            label="Nomor Polisi"
            name="transportVehiclePlateNo"
            value={values?.transportVehiclePlateNo || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ my: 1, backgroundColor: "whitesmoke" }}
            label="Nama Supir"
            name="driverFullName"
            value={values?.jsonData?.driverFullName || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ my: 1, backgroundColor: "whitesmoke" }}
            label="Nama Vendor"
            name="transporterCompanyFullName"
            value={values?.jsonData?.transporterCompanyFullName || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ my: 1, backgroundColor: "whitesmoke" }}
            label="Sertifikasi Tipe Truk"
            name="vehicleAllowableSccModel"
            value={
              Config.SCC_MODEL[values?.jsonData?.vehicleAllowableSccModel || 0]
            }
          />
        </Grid>

        <Grid item xs={3}>
          {values.progressStatus === 0 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  originWeighInKg: weightWb,
                }));
              }}
            />
          )}
          {values.progressStatus === 2 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  originWeighOutKg: weightWb,
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
            value={values.originWeighInKg || 0}
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
            value={values.originWeighOutKg || 0}
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
            label="Potongan Wajib Vendor"
            name="potonganWajib"
            value={values.potonganWajib || 0}
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
            label="Potongan Lainnya"
            name="potonganLain"
            value={values.potonganLain || 0}
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
            value={originWeightNetto || 0}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleSubmit}
            disabled={
              !(
                canSubmit &&
                (values.progressStatus === 0 || values.progressStatus === 2)
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
              // Function Code 5 = Dispatch Delivery
              SemaiAPI.encodeQrcode(values.jsonData.deliveryOrderId, 5).then(
                (results) => {
                  setQrContent(results.data.qrcode);
                  setShowQRCodeViewer(true);
                }
              );
            }}
            disabled={!(values.progressStatus === 4)}
          >
            Tampilkan QR
          </Button>
          <Button
            variant="contained"
            sx={{ mb: 1 }}
            fullWidth
            onClick={handleClose}
            disabled={!(values.progressStatus === 4)}
          >
            Tutup
          </Button>

          <BonTripPrint
            dtTrans={{ ...values }}
            isDisable={!(values.progressStatus === 4)}
          />

          <Button
            variant="contained"
            sx={{ my: 1 }}
            fullWidth
            onClick={() => {
              setValues((prev) => ({ ...prev, originWeighInKg: 1.5 }));
              console.log("data transaction:");
              console.log(values);
            }}
          >
            Debugging
          </Button>
        </Grid>

        <Grid item xs={6}></Grid>
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

export default PksWbNormal;
