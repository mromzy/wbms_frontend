import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, InputAdornment, TextField } from "@mui/material";
import { w3cwebsocket } from "websocket";
import moment from "moment";

import { getEnvInit } from "../configs";
import { setWb } from "../slices/appSlice";

let wsClient;

const GetWeightWB = (props) => {
  const { isDisabled, handleSubmit } = props;

  const { wb, configs } = useSelector((state) => state.app);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () =>
      await getEnvInit().then((result) => {
        // ENV = result;
        console.log(configs);

        if (!wsClient) {
          wsClient = new w3cwebsocket(
            `ws://${result.WBMS_WB_IP}:${result.WBMS_WB_PORT}/GetWeight`
          );

          wsClient.onmessage = (message) => {
            const curWb = { ...wb };
            curWb.isStable = false;
            curWb.weight = Number.isNaN(+message.data) ? 0 : +message.data;

            if (curWb.weight !== wb.weight) {
              curWb.lastChange = moment().valueOf();
            } else if (
              moment().valueOf() - wb.lastChange >
              result.WBMS_WB_STABLE_PERIOD
            ) {
              curWb.isStable = true;
            }

            if (curWb.weight === 0 && curWb.isStable && !curWb.onProcessing)
              curWb.canStartScalling = true;

            dispatch(setWb({ ...curWb }));
          };

          wsClient.onerror = (err) => {
            // alert(`Cannot connect to WB: ${err}`);
            // console.log("Get Weight Component");
            // console.log(err);
          };
        }

        return result;
      }))();
  }, []);

  return (
    <>
      <TextField
        type="number"
        fullWidth
        sx={{
          mb: 1,
          backgroundColor: "whitesmoke",
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
        }}
        label="GET WEIGHT"
        disabled={true}
        value={wb.weight}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{
          mb: 2,
        }}
        disabled={
          isDisabled || !wb.isStable || wb.weight < configs.WBMS_WB_MIN_WEIGHT
            ? true
            : false
        }
        onClick={() => {
          handleSubmit(wb.weight);
        }}
      >
        Get Weight
      </Button>
    </>
  );
};

export default GetWeightWB;
