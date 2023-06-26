import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

const QRCodeScanner = (props) => {
  const { onClose, isDisable } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [codeContent, setCodeContent] = useState("");

  useEffect(() => {
    setCodeContent("");
  }, [isOpen]);

  const barcodeAutoFocus = () => {
    document.getElementById("barcode")?.focus();
  };

  const onChangeBarcode = (event) => {
    setCodeContent(event.target.value);
  };

  const onKeyDown = (event) => {
    if (event.keyCode === 13) {
      setIsOpen(false);
      onClose(codeContent, true);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        sx={{ mt: 1 }}
        fullWidth
        disabled={isDisable}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Scan QR
      </Button>
      <Dialog open={isOpen} fullWidth>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent dividers>
          <TextField
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            id="barcode"
            name="barcode"
            label="Please Scan QR Code"
            autoFocus={true}
            value={codeContent}
            onChange={onChangeBarcode}
            onKeyDown={onKeyDown}
            onBlur={barcodeAutoFocus}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              setIsOpen(false);
              onClose("", false);
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QRCodeScanner;
