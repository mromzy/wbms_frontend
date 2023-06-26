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

import Config from "../../../configs";
import { useForm } from "../../../utils/useForm";
import * as SemaiUtils from "../../../utils/SemaiUtils";
import * as TransactionAPI from "../../../api/transactionApi";
import * as SemaiAPI from "../../../api/semaiApi";

const tType = 1;

const PksWbReject = (props) => {
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

  const { values, setValues, handleInputChange } = useForm({
    ...TransactionAPI.InitialData,
  });
  const [originWeighNetto, setOriginWeighNetto] = useState(0);
  const [returnWeighNetto, setReturnWeighNetto] = useState(0);

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

    // progressStatus === 10, dam tempTransaction.id === 0
    if (tempTrans.progressStatus === 10) {
      tempTrans.progressStatus = 11;
      // tempTrans.returnWeighInTimestamp = SemaiUtils.GetDateStr();
      tempTrans.returnWeighInTimestamp = moment().toDate();
      tempTrans.returnWeighInOperatorName = user.fullname;
    } else {
      // progressStatus === 12
      tempTrans.progressStatus = 13;
      // tempTrans.returnWeighOutTimestamp = SemaiUtils.GetDateStr();
      tempTrans.returnWeighOutTimestamp = moment().toDate();
      tempTrans.returnWeighOutOperatorName = user.fullname;

      tempTrans = SemaiUtils.CopyWBToSemai(tempTrans);
      tempTrans = SemaiUtils.CopyWBRToSemai(tempTrans);
    }

    try {
      // Data baru, create transaksi, progressStatus === 1 && tempTransaction.id === 0
      if (tempTrans.progressStatus === 11) {
        const results = await TransactionAPI.create({ ...tempTrans });

        if (!results?.status) {
          toast.error(`Error: ${results?.message}.`);
          return;
        }

        toast.success(`Transaksi REJECT WB-IN telah tersimpan.`);

        return handleClose();
      } else if (tempTrans.progressStatus === 13) {
        // progressStatus === 13
        const rRejectedAPI = await SemaiAPI.closeDeliveryRejected({
          ...tempTrans.jsonData,
        });

        if (!rRejectedAPI?.status) {
          toast.error(`Error: ${rRejectedAPI?.message}.`);
          return;
        }

        toast.success(`Close Delivery as Rejected sukses.`);

        tempTrans.progressStatus = 14;
        tempTrans.jsonData = { ...rRejectedAPI?.data.transaction };
        tempTrans = SemaiUtils.UpdateStatusToWBMS(tempTrans);

        const rUpdTrans = await TransactionAPI.update({
          ...tempTrans,
        });

        if (!rUpdTrans?.status) {
          toast.error(`Error: ${rUpdTrans?.message}.`);
          return;
        }

        toast.success(`Transaksi REJECT WB-OUT telah tersimpan.`);
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
            // bonTripNo: dataTransaction?.bonTripNo,
            //tidak bisa, karena statusnya nanti berbeda dengan transaksi reject yng lain
            //kl reject pasti buat 2 record jika dari PKS, atau 1 jika dari bulking
            transportVehiclePlateNo: wbPksTransaction.transportVehiclePlateNo,
            progressStatus: 11, // cari yang statusnya unloading
            tType,
          },
          orderBy: { bonTripNo: "desc" },
        });

        // Kendaraan baru masuk, belum ada data gantung di DB
        if (!rSearch?.status || !rSearch.record) {
          setValues({ ...wbPksTransaction, tType, progressStatus: 10 });
          return;
        }

        // Secara pemahaman jsonData dalam mobile app semai tidak terupdate (tidak berubah)
        const tempTrans = { ...rSearch.record };
        // tempTrans.vehicleStatus = wbPksTransaction.vehicleStatus; // data tidak berubah
        // tempTrans.deliveryStatus = wbPksTransaction.deliveryStatus; // data tidak berubah
        // tempTransaction.jsonData = { ...wbPksTransaction.jsonData };  // data tidak berubah
        tempTrans.progressStatus = 12;

        setValues({ ...tempTrans });
      } catch (error) {
        toast.error(`Error: ${error.message}`);
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
    if (values.progressStatus === 10) {
      if (
        values.returnWeighInKg >= Config.ENV.WBMS_WB_MIN_WEIGHT &&
        values?.jsonData?.returnUnloadedSeal1?.trim().length > 0 &&
        values?.jsonData?.returnUnloadedSeal2?.trim().length > 0
      ) {
        cSubmit = true;
      }
    } else if (values.progressStatus === 12) {
      if (values.returnWeighOutKg >= Config.ENV.WBMS_WB_MIN_WEIGHT)
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

          {/* {transaction.progressStatus === 10 && ( */}
          <>
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              required
              sx={{ mb: 1, backgroundColor: "whitesmoke" }}
              label="Segel Mainhole 1"
              name="returnUnloadedSeal1"
              value={values?.jsonData?.returnUnloadedSeal1 || ""}
              onChange={(e) => {
                handleInputChange(e, 2);
              }}
              disabled={values.progressStatus !== 10}
            />
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              required
              sx={{ mb: 1, backgroundColor: "whitesmoke" }}
              label="Segel Valve 1"
              name="returnUnloadedSeal2"
              value={values?.jsonData?.returnUnloadedSeal2 || ""}
              onChange={(e) => {
                handleInputChange(e, 2);
              }}
              disabled={values.progressStatus !== 10}
            />
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 1, backgroundColor: "whitesmoke" }}
              label="Segel Mainhole 2"
              name="returnUnloadedSeal3"
              value={values?.jsonData?.returnUnloadedSeal3 || ""}
              onChange={(e) => {
                handleInputChange(e, 2);
              }}
              disabled={values.progressStatus !== 10}
            />
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              sx={{ mb: 1, backgroundColor: "whitesmoke" }}
              label="Segel Valve 2"
              name="returnUnloadedSeal4"
              value={values?.jsonData?.returnUnloadedSeal4 || ""}
              onChange={(e) => {
                handleInputChange(e, 2);
              }}
              disabled={values.progressStatus !== 10}
            />
          </>
          {/* )} */}
        </Grid>

        <Grid item xs={3}>
          {values.progressStatus === 10 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  returnWeighInKg: weightWb,
                }));
              }}
            />
          )}
          {values.progressStatus === 12 && (
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
            value={values?.returnWeighOutKg}
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
                (values.progressStatus === 10 || values.progressStatus === 12)
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
              // Function Code 15 = Closed Delivery as Rejected
              SemaiAPI.encodeQrcode(values.jsonData.deliveryOrderId, 15).then(
                (results) => {
                  setQrContent(results.data.qrcode);
                  setShowQRCodeViewer(true);
                }
              );
            }}
            disabled={!(values.progressStatus === 14)}
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
          others content
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

export default PksWbReject;
