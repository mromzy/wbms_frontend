import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { Grid, Paper } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import { ProgressStatusContext } from "../../context/ProgressStatusContext";
import { WbBulkingTransactionContext } from "../../context/WbBulkingTransactionContext";

import * as TransactionAPI from "../../api/transactionApi";

import PageHeader from "../../components/PageHeader";
import QRCodeScanner from "../../components/QRCodeScanner";
import ProgressStatus from "../../components/ProgressStatus";
import TransactionGrid from "../../components/TransactionGrid";

const tType = 3;

const BulkingTransaction = () => {
  const { wb } = useSelector((state) => state.app);
  const [wbBulkingTransaction, setWbBulkingTransaction] = useState(null);
  const [progressStatus, setProgressStatus] = useState("-");

  const wbBulkingTransactionValue = useMemo(
    () => ({ wbBulkingTransaction, setWbBulkingTransaction }),
    [wbBulkingTransaction, setWbBulkingTransaction]
  );
  const progressStatusValue = useMemo(
    () => ({ progressStatus, setProgressStatus }),
    [progressStatus, setProgressStatus]
  );

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

      setWbBulkingTransaction(response.data.transaction);
      navigate(response.data.urlPath);
    } else if (readEnter) {
      return toast.error(
        "Tidak dapat membaca QR Code atau QR Code tidak valid..."
      );
    }
  };

  useEffect(() => {
    console.clear();
    setProgressStatus("-");

    return () => {
      console.clear();
    };
  }, []);

  return (
    <WbBulkingTransactionContext.Provider value={wbBulkingTransactionValue}>
      <ProgressStatusContext.Provider value={progressStatusValue}>
        <PageHeader
          title="Transaksi Bulking"
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
    </WbBulkingTransactionContext.Provider>
  );
};

export default BulkingTransaction;
