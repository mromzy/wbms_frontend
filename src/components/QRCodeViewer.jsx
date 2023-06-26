import QRCode from "react-qr-code";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const QRCodeViewer = (props) => {
  const { visible, qrContent, handleClose } = props;

  return (
    <Dialog open={visible} fullWidth>
      <DialogTitle>QR Code</DialogTitle>
      <DialogContent dividers>
        <div
          style={{
            height: "auto",
            margin: "0 auto",
            maxWidth: 381,
            width: "100%",
          }}
        >
          <QRCode
            size={512}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            value={qrContent}
            viewBox={`0 0 256 256`}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => handleClose()}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeViewer;
