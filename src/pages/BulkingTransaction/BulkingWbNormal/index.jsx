import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { toast } from "react-toastify";
import moment from "moment";

import { WbBulkingTransactionContext } from "../../../context/WbBulkingTransactionContext";
import { ProgressStatusContext } from "../../../context/ProgressStatusContext";

import GetWeightWB from "../../../components/GetWeightWB";
import QRCodeViewer from "../../../components/QRCodeViewer";

import Config from "../../../configs";
import { useForm } from "../../../utils/useForm";
import * as SemaiUtils from "../../../utils/SemaiUtils";
import * as TransactionAPI from "../../../api/transactionApi";
import * as ENUM from "../../../api/enumApi";
import * as SemaiAPI from "../../../api/semaiApi";

const tType = 3;

const BulkingWbNormal = (props) => {
  const { wbBulkingTransaction, setWbBulkingTransaction } = useContext(
    WbBulkingTransactionContext
  );
  const { setProgressStatus } = useContext(ProgressStatusContext);
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
  const [destinationWeighNetto, setDestinationWeighNetto] = useState(0);

  const [canSubmit, setCanSubmit] = useState(false);
  const [showQRCodeViewer, setShowQRCodeViewer] = useState(false);
  const [qrContent, setQrContent] = useState("");

  const [dtDestinationSites, setDtDestinationSites] = useState([]);
  const [dtStorageTanks, setDtStorageTanks] = useState([]);
  const [dtTransportVehicles, setDtTransportVehicles] = useState([]);
  const [dtProducts, setDtProducts] = useState([]);
  const [dtVaScc, setDtVaScc] = useState([]);
  const [dtRspoScc, setDtRspoScc] = useState([]);
  const [dtIsccScc, setDtIsccScc] = useState([]);

  useEffect(() => {
    if (!wbBulkingTransaction) handleClose();

    let Labanan = SemaiAPI.getLabananSite();

    const getTransaction = async () => {
      try {
        const rSearch = await TransactionAPI.searchFirst({
          where: {
            transportVehiclePlateNo:
              wbBulkingTransaction?.transportVehiclePlateNo,
            progressStatus: 1, // cari yang statusnya unloading
            tType,
          },
          orderBy: { bonTripNo: "desc" },
        });

        // Kendaraan baru masuk, belum ada data gantung di DB
        if (!rSearch?.status || !rSearch?.record) {
          setValues({ ...wbBulkingTransaction, tType, progressStatus: 0 });
          return;
        }

        // Secara pemahaman jsonData dalam mobile app semai tidak terupdate (berubah) ketika di Bulking
        const tempTrans = { ...rSearch.record };
        // tempTrans.vehicleOperationStatus = wbBulkingTransaction.vehicleOperationStatus; // data tidak berubah
        // tempTrans.deliveryStatus = wbBulkingTransaction.deliveryStatus; // data tidak berubah
        // tempTransaction.jsonData = { ...wbT30Transaction.jsonData }; // data tidak berubah
        tempTrans.progressStatus = 2;

        setValues({ ...tempTrans });
      } catch (error) {
        toast.error(`Error: ${error.message}.`);
        return handleClose();
      }
    };

    const getDB = async () => {
      let storageTanks = await SemaiAPI.getStorageTanksBySiteID(Labanan.id);
      // let destinationSites = await SemaiAPI.getSites();
      // let products = await SemaiAPI.getProducts();

      if (storageTanks?.status) setDtStorageTanks(storageTanks.records);
      // if (destinationSites?.status)
      //   setDtDestinationSites(destinationSites.records);
      // if (products?.status) setDtProducts(products.records);

      setDtVaScc(ENUM.getVA_SCC_MODEL());
      setDtRspoScc(ENUM.getRSPO_SCC_MODEL());
      setDtIsccScc(ENUM.getISCC_SCC_MODEL());
    };

    getTransaction();
    getDB();
  }, []);

  useEffect(() => {
    setProgressStatus(Config.BULKING_PROGRESS_STATUS[values.progressStatus]);

    if (
      values.originWeighInKg < Config.ENV.WBMS_WB_MIN_WEIGHT ||
      values.originWeighOutKg < Config.ENV.WBMS_WB_MIN_WEIGHT
    ) {
      setDestinationWeighNetto(0);
    } else {
      let total =
        Math.abs(values.originWeighInKg - values.originWeighOutKg) -
        values.potonganWajib -
        values.potonganLain;
      setOriginWeighNetto(total);
    }

    if (
      values.destinationWeighInKg < Config.ENV.WBMS_WB_MIN_WEIGHT ||
      values.destinationWeighOutKg < Config.ENV.WBMS_WB_MIN_WEIGHT
    ) {
      setDestinationWeighNetto(0);
    } else {
      let total = Math.abs(
        values.destinationWeighInKg - values.destinationWeighOutKg
      );
      setDestinationWeighNetto(total);
    }
  }, [setProgressStatus, values]);

  // Untuk validasi field
  useEffect(() => {
    let cSubmit = false;

    if (values.progressStatus === 0) {
      if (
        values.destinationWeighInKg >= Config.ENV.WBMS_WB_MIN_WEIGHT &&
        values?.destinationSinkTankId?.trim().length > 0 &&
        values?.jsonData?.unloadedSeal1?.trim().length > 0 &&
        values?.jsonData?.unloadedSeal2?.trim().length > 0
      ) {
        cSubmit = true;
      }
    } else if (values.progressStatus === 2) {
      if (values.destinationWeighOutKg >= Config.ENV.WBMS_WB_MIN_WEIGHT)
        cSubmit = true;
    }

    setCanSubmit(cSubmit);
  }, [values]);

  const handleClose = () => {
    setProgressStatus("-");
    setWbBulkingTransaction(null);

    navigate("/wb/bulking-transaction");
  };

  const handleSubmit = async () => {
    let tempTrans = { ...values };

    // progressStatus === 0, dam tempTransaction.id === 0
    if (tempTrans.progressStatus === 0) {
      tempTrans.progressStatus = 1;
      // tempTrans.destinationWeighInTimestamp = SemaiUtils.GetDateStr();
      tempTrans.destinationWeighInTimestamp = moment().toDate();
      tempTrans.destinationWeighInOperatorName = user.fullname;

      // let T30Site = SemaiAPI.getT30Site();

      // tempTrans.jsonData.destinationSiteCode = T30Site.code;
      // tempTrans.jsonData.rspoSccModel = tempTrans.jsonData.vehicleAllowableSccModel;
      // tempTrans.jsonData.isccSccModel = tempTrans.jsonData.vehicleAllowableSccModel;
    } else if (tempTrans.progressStatus === 2) {
      // progressStatus === 2
      tempTrans.progressStatus = 3;
      // tempTrans.destinationWeighOutTimestamp = SemaiUtils.GetDateStr();
      tempTrans.destinationWeighOutTimestamp = moment().toDate();
      tempTrans.destinationWeighOutOperatorName = user.fullname;
    }

    tempTrans = SemaiUtils.CopyWBDToSemai(tempTrans);

    try {
      // Data baru, create transaksi, progressStatus === 1 && tempTransaction.id === 0
      if (tempTrans.progressStatus === 1) {
        const rValidateUnloadingAPI = await SemaiAPI.validateUnloading({
          ...tempTrans.jsonData,
        });

        if (!rValidateUnloadingAPI?.status) {
          toast.error(`Error: ${rValidateUnloadingAPI?.message}.`);
          return;
        }

        toast.success("Validate unloading transaksi WB-IN sukses.");

        tempTrans.jsonData = { ...rValidateUnloadingAPI?.data.transaction };

        const results = await TransactionAPI.create({ ...tempTrans });

        if (!results?.status) {
          toast.error(`Error: ${results?.message}.`);
          return;
        }

        toast.success(`Transaksi WB-IN telah tersimpan.`);

        return handleClose();
      } else if (tempTrans.progressStatus === 3) {
        // progressStatus === 3
        const rCloseDeliveryAcceptedAPI = await SemaiAPI.closeDeliveryAccepted({
          ...tempTrans.jsonData,
        });

        if (!rCloseDeliveryAcceptedAPI?.status) {
          toast.error(`Error: ${rCloseDeliveryAcceptedAPI?.message}.`);
          return;
        }

        toast.success("Close Delivery As Accepted sukses.");

        tempTrans.progressStatus = 4;
        tempTrans.jsonData = { ...rCloseDeliveryAcceptedAPI?.data.transaction };
        tempTrans = SemaiUtils.UpdateStatusToWBMS(tempTrans);

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
      return toast.error(`Error: ${error.message}.`);
    }

    setValues({ ...tempTrans });
  };

  const handleReject = async () => {
    let tempTrans = { ...values };

    let rejectReason = prompt("Alasan Reject", "");

    if (rejectReason.trim().length === 0) return;
    if (rejectReason.trim().length <= 10)
      alert("Alasan reject harus melebihi 10 karakter");

    tempTrans.progressStatus = 12;
    // tempTrans.destinationWeighOutTimestamp = SemaiUtils.GetDateStr();
    tempTrans.destinationWeighOutTimestamp = moment().toDate();
    tempTrans.destinationWeighOutOperatorName = user.fullname;

    tempTrans = SemaiUtils.CopyWBDToSemai(tempTrans);

    try {
      const rRejectDeliveryAPI = await SemaiAPI.rejectDelivery({
        ...tempTrans.jsonData,
      });

      if (!rRejectDeliveryAPI?.status) {
        toast.error(`Error: ${rRejectDeliveryAPI?.message}.`);
        return;
      }

      toast.success("Reject Delivery submited.");

      tempTrans.progressStatus = 13;
      tempTrans.jsonData = { ...rRejectDeliveryAPI?.data.transaction };
      tempTrans = SemaiUtils.UpdateStatusToWBMS(tempTrans);

      const rUpdTrans = await TransactionAPI.update({
        ...tempTrans,
      });

      if (!rUpdTrans?.status) {
        toast.error(`Error: ${rUpdTrans?.message}.`);
        return;
      }

      toast.success(`Transaksi REJECT WB-OUT telah tersimpan.`);
    } catch (error) {
      toast.error(`Error: ${error.message}.`);
      return;
    }

    setValues({ ...tempTrans });
  };

  let cbStorageTanks;
  if (dtStorageTanks && dtStorageTanks.length > 0)
    cbStorageTanks = (
      <FormControl
        fullWidth
        size="small"
        sx={{
          mb: 2,
          backgroundColor: values.progressStatus !== 0 ? "whitesmoke" : "white",
        }}
        required
      >
        <InputLabel id="destinationSinkTankId">
          Tangki Tujuan Bongkar
        </InputLabel>
        <Select
          labelId="destinationSinkTankId"
          label="Tangki Tujuan Bongkar"
          name="destinationSinkTankId"
          value={values?.destinationSinkTankId}
          onChange={(e) => {
            handleInputChange(e);

            let selected = dtStorageTanks.filter(
              (item) => item.id === e.target.value
            );

            if (selected) {
              setValues((prev) => {
                prev.jsonData.destinationSinkTankCode = selected[0].code;
                return { ...prev };
              });
            }
          }}
          disabled={values.progressStatus !== 0}
        >
          <MenuItem value="">-</MenuItem>
          {dtStorageTanks?.map((data, index) => (
            <MenuItem key={index} value={data.id}>
              {`[${data.siteName}] ${data.name} ${data.productName} (${
                Config.SCC_MODEL[data.allowableSccModel]
              })`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );

  return (
    <>
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            label="Nomor BON Trip"
            name="bonTripNo"
            value={values?.bonTripNo || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            label="Nomor Polisi"
            name="transportVehiclePlateNo"
            value={values?.transportVehiclePlateNo || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            label="Nama Supir"
            name="driverFullName"
            value={values?.jsonData?.driverFullName || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            label="Nama Vendor"
            name="transporterCompanyFullName"
            value={values?.jsonData?.transporterCompanyFullName || ""}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            label="Vehicle Allowable Scc Model"
            name="vehicleAllowableSccModel"
            value={
              Config.SCC_MODEL[values?.jsonData?.vehicleAllowableSccModel || 0]
            }
          />

          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              mb: 2,
              backgroundColor:
                values.progressStatus !== 0 ? "whitesmoke" : "white",
            }}
            required
            label="Segel Mainhole 1"
            name="unloadedSeal1"
            value={values?.jsonData?.unloadedSeal1 || ""}
            onChange={(e) => {
              handleInputChange(e, 2);
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              mb: 2,
              backgroundColor:
                values.progressStatus !== 0 ? "whitesmoke" : "white",
            }}
            required
            label="Segel Valve 1"
            name="unloadedSeal2"
            value={values?.jsonData?.unloadedSeal2 || ""}
            onChange={(e) => {
              handleInputChange(e, 2);
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              mb: 2,
              backgroundColor:
                values.progressStatus !== 0 ? "whitesmoke" : "white",
            }}
            label="Segel Mainhole 2"
            name="unloadedSeal3"
            value={values?.jsonData?.unloadedSeal3 || ""}
            onChange={(e) => {
              handleInputChange(e, 2);
            }}
          />
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            sx={{
              mb: 2,
              backgroundColor:
                values.progressStatus !== 0 ? "whitesmoke" : "white",
            }}
            label="Segel Valve 2"
            name="unloadedSeal4"
            value={values?.jsonData?.unloadedSeal4 || ""}
            onChange={(e) => {
              handleInputChange(e, 2);
            }}
          />

          {cbStorageTanks}
        </Grid>
        <Grid item xs={3}>
          {values.progressStatus === 0 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  destinationWeighInKg: weightWb,
                }));
              }}
            />
          )}
          {values.progressStatus === 2 && (
            <GetWeightWB
              handleSubmit={(weightWb) => {
                setValues((prev) => ({
                  ...prev,
                  destinationWeighOutKg: weightWb,
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
            label="Destination Weight IN"
            name="destinationWeighInKg"
            value={values?.destinationWeighInKg}
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
            label="Destination Weight OUT"
            name="destinationWeighOutKg"
            value={values?.destinationWeighOutKg}
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
            value={destinationWeighNetto || 0}
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
              if (values.progressStatus === 4) {
                // Function Code 16 = Close Delivery As Accepted
                SemaiAPI.encodeQrcode(values.jsonData.deliveryOrderId, 16).then(
                  (results) => {
                    setQrContent(results.data.qrcode);
                    setShowQRCodeViewer(true);
                  }
                );
              } else if (values.progressStatus === 13) {
                // Function Code 9 = Reject Delivery
                SemaiAPI.encodeQrcode(values.jsonData.deliveryOrderId, 9).then(
                  (results) => {
                    setQrContent(results.data.qrcode);
                    setShowQRCodeViewer(true);
                  }
                );
              }
            }}
            disabled={
              !(values.progressStatus === 4 || values.progressStatus === 13)
            }
          >
            Tampilkan QR
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleClose}
            disabled={!(values.progressStatus === 4)}
          >
            Tutup
          </Button>
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => {
              setValues((prev) => ({ ...prev, originWeighInKg: 1.5 }));
              console.log("data transaction:");
              console.log(values);
              console.log(canSubmit);
            }}
          >
            Debugging
          </Button>
          {values.progressStatus === 2 && (
            <Button
              variant="contained"
              fullWidth
              sx={{ mb: 1, backgroundColor: "goldenrod" }}
              onClick={handleReject}
            >
              Cancel (Batal)
            </Button>
          )}
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

export default BulkingWbNormal;
