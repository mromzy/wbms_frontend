import { useSelector } from "react-redux";
import { TextField } from "@mui/material";

const ProgressStatus = () => {
  const { wbTransaction } = useSelector((state) => state.app);

  return (
    <>
      <TextField
        variant="filled"
        inputProps={{
          style: {
            textAlign: "center",
            fontWeight: "bold",
          },
        }}
        size="small"
        label="STATUS PROSES"
        fullWidth
        multiline
        value={
          wbTransaction?.progressStatus ? wbTransaction.progressStatus : "-"
        }
      />
    </>
  );
};

export default ProgressStatus;
