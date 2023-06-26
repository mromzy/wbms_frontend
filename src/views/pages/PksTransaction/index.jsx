import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { w3cwebsocket } from "websocket";
import { Grid, Paper } from "@mui/material";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import { setWb, clearWb, setWbTransaction } from "../../../slices/appSlice";

import * as TransactionAPI from "../../../api/transactionApi";

import PageHeader from "../../../components/PageHeader";
import QRCodeScanner from "../../../components/QRCodeScanner";
import ProgressStatus from "../../../components/ProgressStatus";
import TransactionGrid from "../../../components/TransactionGrid";

const tType = 1;
let wsClient;

const PksTransaction = () => {
  const { configs, wb, wbTransaction } = useSelector((state) => state.app);

  // const [wsClient, setWsClient] = useState(null);
  const [wbms, setWbms] = useState({ weight: -1 });

  // const [wbPksTransaction, setWbPksTransaction] = useState(null);
  // const [progressStatus, setProgressStatus] = useState("-");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCloseQRCodeScanner = async (codeContent, readEnter) => {
    if (codeContent?.trim().length > 10) {
      const data = { content: codeContent.trim(), tType };

      let response = await TransactionAPI.openCreateByQrcodeSemai(data);

      if (!response.status) {
        return toast.error(response.message);
      }

      console.log(
        `vStatus: ${response.data.transaction.vehicleStatus}, dStatus:${response.data.transaction.deliveryStatus}.`
      );

      // setWbPksTransaction(response.data.transaction);
      dispatch(setWbTransaction({ ...response.data.transaction }));

      navigate(response.data.urlPath);
    } else if (readEnter) {
      return toast.error(
        "Tidak dapat membaca QR Code atau QR Code tidak valid..."
      );
    }
  };

  useEffect(() => {
    if (!wbTransaction) {
      dispatch(setWb({ onProcessing: false }));
    } else dispatch(setWb({ onProcessing: true, canStartScalling: false }));
  }, [wbTransaction]);

  useEffect(() => {
    const curWb = { ...wb };
    curWb.weight = wbms.weight;
    curWb.isStable = false;

    if (curWb.weight !== wb.weight) {
      curWb.lastChange = moment().valueOf();
    } else if (
      moment().valueOf() - wb.lastChange >
      configs.WBMS_WB_STABLE_PERIOD
    ) {
      curWb.isStable = true;
    }

    if (curWb.weight === 0 && curWb.isStable && !curWb.onProcessing)
      curWb.canStartScalling = true;

    dispatch(setWb({ ...curWb }));
  }, [wbms]);

  useEffect(() => {
    console.clear();

    if (!wsClient) {
      wsClient = new w3cwebsocket(
        `ws://${configs.WBMS_WB_IP}:${configs.WBMS_WB_PORT}/GetWeight`
      );

      wsClient.onmessage = (message) => {
        const _wbms = { ...wbms };

        _wbms.weight = Number.isNaN(+message.data) ? 0 : +message.data;

        setWbms({ ..._wbms });
      };

      wsClient.onerror = (err) => {
        // alert(`Cannot connect to WB: ${err}`);
        // console.log("Get Weight Component");
        // console.log(err);
      };
    }

    return () => {
      console.log("Page PKS Transaction Closed");
      wsClient.close();
      wsClient = null;
      dispatch(clearWb());
      console.clear();
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Transaksi PKS4"
        subTitle="Page Description"
        sx={{ mb: 2 }}
        icon={<LocalShippingIcon fontSize="large" />}
      />

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs="auto">
              <Paper sx={{ p: 2, width: "220px", height: "70vh" }}>
                <ProgressStatus />
                <QRCodeScanner
                  onClose={handleCloseQRCodeScanner}
                  isDisable={wb.canStartScalling ? false : true}
                />
              </Paper>
            </Grid>
            <Grid item xs>
              <Paper sx={{ p: 2 }}>
                <TransactionGrid tType={tType} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <ToastContainer />
    </>
  );
};

export default PksTransaction;
