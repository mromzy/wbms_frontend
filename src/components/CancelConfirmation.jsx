import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

const CancelConfirmation = (props) => {
  const { onClose, isDisabled } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [isOpen]);

  return (
    <>
      <Button
        variant="contained"
        fullWidth
        sx={{ mb: 1, backgroundColor: "goldenrod" }}
        disabled={isDisabled}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Cancel (Batal)
      </Button>
      <Dialog open={isOpen} fullWidth>
        <DialogTitle>Pembatalan Transaksi WB</DialogTitle>
        <DialogContent dividers>
          <DialogContentText>
            Anda yakin melakukan pembatalan transaksi WB ini?
          </DialogContentText>
          <TextField
            type="text"
            autoFocus
            size="small"
            fullWidth
            sx={{ mb: 2, backgroundColor: "whitesmoke" }}
            label="Alasan Pembatalan"
            name="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsOpen(false);
              onClose(reason);
            }}
          >
            Yakin Pembatalan
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsOpen(false);
              onClose("");
            }}
          >
            Kembali
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CancelConfirmation;
