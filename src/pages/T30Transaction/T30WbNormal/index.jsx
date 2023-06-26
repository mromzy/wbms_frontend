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

import { WbT30TransactionContext } from "../../../context/WbT30TransactionContext";
import { ProgressStatusContext } from "../../../context/ProgressStatusContext";

import GetWeightWB from "../../../components/GetWeightWB";
import QRCodeViewer from "../../../components/QRCodeViewer";
import CancelConfirmation from "../../../components/CancelConfirmation";

import Config from "../../../configs";
import { useForm } from "../../../utils/useForm";
import * as SemaiUtils from "../../../utils/SemaiUtils";
import * as TransactionAPI from "../../../api/transactionApi";
import * as ENUM from "../../../api/enumApi";
import * as SemaiAPI from "../../../api/semaiApi";

const tType = 2;

const T30WbNormal = (props) => {
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

  const { values, setValues, handleInputChange } = useForm({
    ...TransactionAPI.InitialData,
  });
  const [originWeightNetto, setOriginWeightNetto] = useState(0);

  const [canSubmit, setCanSubmit] = useState(false);
  const [showQRCodeViewer, setShowQRCodeViewer] = useState(false);
  const [qrContent, setQrContent] = useState("");

  const [dtDestinationSites, setDtDestinationSites] = useState([]);
  const [dtStorageTanks, setDtStorageTanks] = useState([]);
  const [dtTransportVehicles, setDtTransportVehicles] = useState([]);
  const [dtProducts, setDtProducts] = useState([]);
  const [dtVaScc, setDtVaScc] = useState([]);
  const [dtRspoScc, setDtRspoScc] = useState(ENUM.getRSPO_SCC_MODEL());
  const [dtIsccScc, setDtIsccScc] = useState([]);

  useEffect(() => {
    if (!wbT30Transaction) handleClose();

    let T30Site = SemaiAPI.getT30Site();

    const getTransaction = async () => {
      try {
        const rSearch = await TransactionAPI.searchFirst({
          where: {
            transportVehiclePlateNo: wbT30Transaction?.transportVehiclePlateNo,
            progressStatus: { in: [1, 6] }, // cari yang statusnya unloading
            tType,
          },
          orderBy: { bonTripNo: "desc" },
        });

        // Kendaraan baru masuk, belum ada data gantung di DB
        if (!rSearch?.status || !rSearch?.record) {
          let bonTripNo = `D011${moment().format("YYMMDDHHmmss")}`; //moment().valueOf()

          setValues({
            ...wbT30Transaction,
            tType,
            bonTripNo,
            originSiteId: T30Site.id,
            progressStatus: 0,
          });

          return;
        }

        if (rSearch?.record.progressStatus === 6)
          navigate("/wb/t30-transaction/cancel"); //Sudah cancel timbang masuk

        // Secara pemahaman jsonData dalam mobile app semai tidak terupdate (berubah) ketika di T30
        const tempTransaction = { ...rSearch.record };
        tempTransaction.vehicleOperationStatus =
          wbT30Transaction.vehicleOperationStatus;
        tempTransaction.deliveryStatus = wbT30Transaction.deliveryStatus;
        // tempTransaction.jsonData = { ...wbT30Transaction.jsonData }; // data tidak berubah
        tempTransaction.progressStatus = 2;

        setValues({ ...tempTransaction });
      } catch (error) {
        toast.error(`Error: ${error.message}.`);
        return handleClose();
      }
    };

    const getDB = async () => {
      let storageTanks = await SemaiAPI.getStorageTanksBySiteID(T30Site.id);
      let destinationSites = await SemaiAPI.getSites();
      let products = await SemaiAPI.getProducts();

      if (storageTanks?.status) setDtStorageTanks(storageTanks.records);
      if (destinationSites?.status)
        setDtDestinationSites(destinationSites.records);
      if (products?.status) setDtProducts(products.records);

      setDtVaScc(ENUM.getVA_SCC_MODEL());
      setDtRspoScc(ENUM.getRSPO_SCC_MODEL());
      setDtIsccScc(ENUM.getISCC_SCC_MODEL());
    };

    getTransaction();
    getDB();
  }, []);

  useEffect(() => {
    setProgressStatus(Config.T30_PROGRESS_STATUS[values.progressStatus]);

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
  }, [setProgressStatus, values]);

  // Untuk validasi field
  useEffect(() => {
    let cSubmit = false;

    if (values.progressStatus === 0) {
      if (
        values.originWeighInKg >= Config.ENV.WBMS_WB_MIN_WEIGHT &&
        values?.productId?.trim().length > 0 &&
        // values?.originSiteId?.trim().length > 0 &&
        values?.originSourceTankId?.trim().length > 0 &&
        values?.destinationSiteId?.trim().length > 0 &&
        values?.jsonData?.loadedSeal1?.trim().length > 0 &&
        values?.jsonData?.loadedSeal2?.trim().length > 0
      ) {
        cSubmit = true;
      }
    } else if (values.progressStatus === 2) {
      if (values.originWeighOutKg >= Config.ENV.WBMS_WB_MIN_WEIGHT)
        cSubmit = true;
    }

    setCanSubmit(cSubmit);
  }, [values]);

  const handleCancelTransaction = (reason) => {
    console.log(`handleCancelTransaction:${reason}`);
  };

  const handleClose = () => {
    setProgressStatus("-");
    setWbT30Transaction(null);

    navigate("/wb/t30-transaction");
  };

  const handleSubmit = async () => {
    let tempTrans = { ...values };

    // progressStatus === 0, dam tempTransaction.id === 0
    if (tempTrans.progressStatus === 0) {
      tempTrans.progressStatus = 1;
      // tempTrans.originWeighInTimestamp = SemaiUtils.GetDateStr();
      tempTrans.originWeighInTimestamp = moment().toDate();
      tempTrans.originWeighInOperatorName = user.fullname;

      let T30Site = SemaiAPI.getT30Site();

      tempTrans.jsonData.originSiteCode = T30Site.code;
      tempTrans.jsonData.rspoSccModel =
        tempTrans.jsonData.vehicleAllowableSccModel;
      tempTrans.jsonData.isccSccModel =
        tempTrans.jsonData.vehicleAllowableSccModel;
    } else {
      // progressStatus === 2
      tempTrans.progressStatus = 3;
      // tempTrans.originWeighOutTimestamp = SemaiUtils.GetDateStr();
      tempTrans.originWeighOutTimestamp = moment().toDate();
      tempTrans.originWeighOutOperatorName = user.fullname;
    }

    tempTrans = SemaiUtils.CopyWBToSemai(tempTrans);

    try {
      // Data baru, create transaksi, progressStatus === 1 && tempTransaction.id === 0
      if (tempTrans.progressStatus === 1) {
        const rValidateDispatchAPI = await SemaiAPI.validateDispatchDelivery({
          ...tempTrans.jsonData,
        });

        // console.log(rValidateDispatchAPI); // balikannya tidak sama, ada data yang hilang/berubah

        if (!rValidateDispatchAPI?.status) {
          toast.error(`Error: ${rValidateDispatchAPI?.message}.`);
          return;
        }

        toast.success("Validate dispatch transaksi WB-IN sukses.");

        // tempTrans.jsonData = { ...rValidateDispatchAPI?.record };

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

        if (!rDispatchAPI?.status) {
          toast.error(`Error: ${rDispatchAPI?.message}.`);
          return;
        }

        toast.success("Dispatch transaksi sukses.");

        tempTrans.progressStatus = 4;
        tempTrans.jsonData = { ...rDispatchAPI?.data.transaction };
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

  const handleCancel = async () => {
    let tempTrans = { ...values };

    let cancelReason = prompt("Alasan Cancel", "");

    if (cancelReason.trim().length === 0) return;
    if (cancelReason.trim().length <= 10)
      return alert("Alasan cancel harus melebihi 10 karakter");

    tempTrans.progressStatus = 6;
    // tempTrans.returnWeighInTimestamp = SemaiUtils.GetDateStr();
    tempTrans.returnWeighInTimestamp = moment().toDate();
    tempTrans.returnWeighInOperatorName = user.fullname;

    try {
      const rUpdTrans = await TransactionAPI.update({ ...tempTrans });

      if (!rUpdTrans?.status) {
        toast.error(`Error: ${rUpdTrans?.message}.`);
        return;
      }

      toast.success(`Transaksi CANCEL WB-IN telah tersimpan.`);

      return handleClose();
    } catch (error) {
      toast.error(`Error: ${error.message}.`);
      return;
    }
  };

  let cbVaScc;
  if (false && dtVaScc && dtVaScc.length > 0)
    cbVaScc = (
      <FormControl
        fullWidth
        size="small"
        sx={{
          mb: 2,
          backgroundColor: values.progressStatus !== 0 ? "whitesmoke" : "white",
        }}
        required
      >
        <InputLabel id="vaScc">Vehicle Allowable SCC Model</InputLabel>
        <Select
          labelId="vaScc"
          label="Vehicle Allowable SCC Model"
          name="vehicleAllowableSccModel"
          value={values?.jsonData?.vehicleAllowableSccModel || 0}
          onChange={(e) => handleInputChange(e, 2)}
          disabled={true}
        >
          <MenuItem value="">-</MenuItem>
          {dtVaScc?.map((data, index) => {
            return (
              <MenuItem key={index} value={data.id}>
                {data.value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );

  let cbRspoScc;
  if (false && dtRspoScc && dtRspoScc.length > 0)
    cbRspoScc = (
      <FormControl
        fullWidth
        size="small"
        sx={{
          mb: 2,
          backgroundColor: values.progressStatus !== 0 ? "whitesmoke" : "white",
        }}
        required
      >
        <InputLabel id="rspoScc">RSPO SCC Model</InputLabel>
        <Select
          labelId="rspoScc"
          label="RSPO SCC Model"
          name="rspoSccModel"
          value={values?.jsonData?.rspoSccModel || 0}
          onChange={(e) => handleInputChange(e, 2)}
          disabled={values.progressStatus !== 0}
        >
          <MenuItem value="">-</MenuItem>
          {dtRspoScc?.map((data, index) => {
            return (
              <MenuItem key={index} value={data.id}>
                {data.value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );

  let cbIsccScc;
  if (false && dtIsccScc && dtIsccScc.length > 0)
    cbIsccScc = (
      <FormControl
        fullWidth
        size="small"
        sx={{
          mb: 2,
          backgroundColor: values.progressStatus !== 0 ? "whitesmoke" : "white",
        }}
        required
      >
        <InputLabel id="isccScc">ISCC SCC Model</InputLabel>
        <Select
          labelId="isccScc"
          label="ISCC SCC Model"
          name="isccSccModel"
          value={values?.jsonData?.isccSccModel || "0"}
          onChange={(e) => handleInputChange(e, 2)}
          disabled={values.progressStatus !== 0}
        >
          <MenuItem value="">-</MenuItem>
          {dtIsccScc?.map((data, index) => {
            return (
              <MenuItem key={index} value={data.id}>
                {data.value}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );

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
        <InputLabel id="originSourceTankId">Tangki Asal</InputLabel>
        <Select
          labelId="originSourceTankId"
          label="Tangki Asal"
          name="originSourceTankId"
          value={values?.originSourceTankId}
          onChange={(e) => {
            handleInputChange(e);

            let selected = dtStorageTanks.filter(
              (item) => item.id === e.target.value
            );

            if (selected) {
              setValues((prev) => {
                prev.jsonData.originSourceTankCode = selected[0].code;
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
                dtRspoScc[data.allowableSccModel].value
              })`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );

  let cbDestinationSites;
  if (dtDestinationSites && dtDestinationSites.length > 0)
    cbDestinationSites = (
      <FormControl
        fullWidth
        size="small"
        sx={{
          mb: 2,
          backgroundColor: values.progressStatus !== 0 ? "whitesmoke" : "white",
        }}
        required
      >
        <InputLabel id="destinationSiteId">Site Tujuan</InputLabel>
        <Select
          labelId="destinationSiteId"
          label="Site Tujuan"
          name="destinationSiteId"
          value={values?.destinationSiteId}
          onChange={(e) => {
            handleInputChange(e);

            let selected = dtDestinationSites.filter(
              (item) => item.id === e.target.value
            );

            if (selected) {
              setValues((prev) => {
                prev.jsonData.destinationSiteCode = selected[0].code;
                return { ...prev };
              });
            }
          }}
          disabled={values.progressStatus !== 0}
        >
          <MenuItem value="">-</MenuItem>
          {dtDestinationSites?.map((data, index) => {
            return (
              <MenuItem key={index} value={data.id}>
                {`[${data.code}] ${data.name}`}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );

  let cbTransportVehicles;
  if (dtTransportVehicles && false)
    cbTransportVehicles = (
      <div
        className="mb-2"
        style={{
          backgroundColor: values.progressStatus !== 1 ? "whitesmoke" : "white",
        }}
      >
        <Select label="Truk" disabled={values.progressStatus !== 1}>
          {dtTransportVehicles?.map((data, index) => {
            return (
              <MenuItem id={data.id} key={index} value={data.id}>
                {`[${data.code}] ${data.name}`}
              </MenuItem>
            );
          })}
        </Select>
      </div>
    );

  let cbProducts;
  if (dtProducts && dtProducts.length > 0)
    cbProducts = (
      <FormControl
        fullWidth
        size="small"
        sx={{
          mb: 1,
          backgroundColor: values.progressStatus !== 0 ? "whitesmoke" : "white",
        }}
        required
      >
        <InputLabel id="productId">Produk</InputLabel>
        <Select
          labelId="productId"
          label="Produk"
          name="productId"
          value={values?.productId}
          onChange={(e) => {
            handleInputChange(e);

            let selected = dtProducts.filter(
              (item) => item.id === e.target.value
            );

            if (selected) {
              setValues((prev) => {
                prev.jsonData.productCode = selected[0].code;
                return { ...prev };
              });
            }
          }}
          disabled={values.progressStatus !== 0}
        >
          <MenuItem value="">-</MenuItem>
          {dtProducts?.map((data, index) => {
            return (
              <MenuItem key={index} value={data.id}>
                {`[${data.code}] ${data.name}`}
              </MenuItem>
            );
          })}
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

          {cbRspoScc}

          {cbIsccScc}

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
            name="loadedSeal1"
            value={values?.jsonData?.loadedSeal1 || ""}
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
            name="loadedSeal2"
            value={values?.jsonData?.loadedSeal2 || ""}
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
            name="loadedSeal3"
            value={values?.jsonData?.loadedSeal3 || ""}
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
            name="loadedSeal4"
            value={values?.jsonData?.loadedSeal4 || ""}
            onChange={(e) => {
              handleInputChange(e, 2);
            }}
          />

          {cbStorageTanks}
          {cbDestinationSites}

          {cbProducts}
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
            fullWidth
            sx={{ mb: 1 }}
            onClick={handleClose}
            disabled={!(values.progressStatus === 4)}
          >
            Tutup
          </Button>
          {values.progressStatus === 2 && (
            // <CancelConfirmation
            //   onClose={handleCancelTransaction}
            //   isDisabled={!canSubmit}
            // />
            <Button
              variant="contained"
              fullWidth
              sx={{ mb: 1, backgroundColor: "goldenrod" }}
              onClick={handleCancel}
            >
              Cancel (Batal)
            </Button>
          )}
          <Button
            variant="contained"
            fullWidth
            sx={{ mb: 1 }}
            onClick={() => {
              setValues((prev) => ({ ...prev }));
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

export default T30WbNormal;
