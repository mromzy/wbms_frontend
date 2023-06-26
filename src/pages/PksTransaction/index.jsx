import { useState, useMemo, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { Grid, Paper } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import { setWb } from "../../slices/appSlice";

import { ProgressStatusContext } from "../../context/ProgressStatusContext";
import { WbPksTransactionContext } from "../../context/WbPksTransactionContext";

import * as TransactionAPI from "../../api/transactionApi";

import PageHeader from "../../components/PageHeader";
import QRCodeScanner from "../../components/QRCodeScanner";
import ProgressStatus from "../../components/ProgressStatus";
import TransactionGrid from "../../components/TransactionGrid";

const tType = 1;

const PksTransaction = () => {
  const { configs, wb } = useSelector((state) => state.app);
  const [wbPksTransaction, setWbPksTransaction] = useState(null);
  const [progressStatus, setProgressStatus] = useState("-");

  const wbPksTransactionValue = useMemo(
    () => ({ wbPksTransaction, setWbPksTransaction }),
    [wbPksTransaction, setWbPksTransaction]
  );
  const progressStatusValue = useMemo(
    () => ({ progressStatus, setProgressStatus }),
    [progressStatus, setProgressStatus]
  );

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

      setWbPksTransaction(response.data.transaction);

      navigate(response.data.urlPath);
    } else if (readEnter) {
      return toast.error(
        "Tidak dapat membaca QR Code atau QR Code tidak valid..."
      );
    }
  };

  useEffect(() => {
    if (!wbPksTransaction) {
      dispatch(setWb({ onProcessing: false }));
    } else dispatch(setWb({ onProcessing: true, canStartScalling: false }));
  }, [wbPksTransaction]);

  useEffect(() => {
    console.clear();
    setProgressStatus("-");

    return () => {
      console.clear();
    };
  }, []);

  return (
    <WbPksTransactionContext.Provider value={wbPksTransactionValue}>
      <ProgressStatusContext.Provider value={progressStatusValue}>
        <PageHeader
          title="Transaksi PKS4"
          subTitle="Page Description"
          icon={<LocalShippingIcon fontSize="large" />}
        />

        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs="auto">
                <Paper sx={{ p: 2, ml: 1, width: "220px", height: "50vh" }}>
                  <ProgressStatus />
                  <QRCodeScanner
                    onClose={handleCloseQRCodeScanner}
                    isDisable={!wb.canStartScalling}
                  />
                </Paper>
              </Grid>
              <Grid item xs>
                <Paper sx={{ p: 2, mr: 1 }}>
                  <Outlet />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mx: 1 }}>
              <div
                className="ag-theme-alpine"
                style={{ width: "auto", height: "40vh" }}
              >
                <TransactionGrid tType={tType} />
              </div>
            </Paper>
          </Grid>
        </Grid>
        <ToastContainer />
      </ProgressStatusContext.Provider>
    </WbPksTransactionContext.Provider>
  );
};

export default PksTransaction;
