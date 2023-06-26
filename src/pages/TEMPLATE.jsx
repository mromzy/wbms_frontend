import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";

import {
  Input,
  Button,
  Textarea,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import QRCodeScanner from "./QRCodeScanner";
import GetWeightWB from "../components/GetWeightWB";

import { decodeQrcode, dispatchDelivery } from "../api/semaiApis";
import {
  create as createDataTransaction,
  getByPlateNo,
} from "../api/dataTransactionsApi";
import { injectPksWbIn } from "../api/testApis";

const {
  REACT_APP_WBMS_INITIAL_VEHICLE_STATUS,
  REACT_APP_WBMS_INITIAL_DELIVERY_STATUS,
} = process.env;

const initialDataTransaction = {
  formatIdentifier: "",
  formatVersion: 0,
  functionCode: 0,
  applicationId: 0,
  applicationVersion: "",
  deviceId: "",
  transporterCompanyCode: "",
  transporterCompanyShortName: "",
  transporterCompanyFullName: "",
  driverCitizenNo: "",
  driverFullName: "",
  vehiclePlateNo: "",
  vehicleProductCode: "",
  vehicleProductName: "",
  vehicleAllowableSccModel: 0,
  drivingLicenceNo: "",
  vehicleOperationStatus: 0,
  currentSeal1: "",
  currentSeal2: "",
  currentSeal3: "",
  currentSeal4: "",
  deliveryOrderId: "",
  deliveryOrderNo: "",
  deliveryDate: "",
  productCode: "",
  productName: "",
  originSiteCode: "",
  originSiteName: "",
  originSourceTankCode: "",
  originSourceTankName: "",
  destinationSiteCode: "",
  destinationSiteName: "",
  destinationSinkTankCode: "",
  destinationSinkTankName: "",
  rspoSccModel: 0,
  rspoUniqueNumber: "",
  isccSccModel: 0,
  isccUniqueNumber: "",
  isccGhgValue: 0,
  isccEeeValue: 0,
  deliveryStatus: 0,
  originFfaPercentage: 0,
  originMoistPercentage: 0,
  originDirtPercentage: 0,
  originWeighInTimestamp: "",
  originWeighInOperatorName: "",
  originWeighInKg: 0,
  originWeighInRemark: "",
  originWeighOutTimestamp: "",
  originWeighOutOperatorName: "",
  originWeighOutKg: 0,
  originWeighOutRemark: "",
  originNettoKg: 0,
  destinationWeighInTimestamp: "",
  destinationWeighInOperatorName: "",
  destinationWeighInKg: 0,
  destinationWeighInRemark: "",
  destinationWeighOutTimestamp: "",
  destinationWeighOutOperatorName: "",
  destinationWeighOutKg: 0,
  destinationWeighOutRemark: "",
  destinationNettoKg: 0,
  returnWeighInTimestamp: "",
  returnWeighInOperatorName: "",
  returnWeighInKg: 0,
  returnWeighInRemark: "",
  returnWeighOutTimestamp: "",
  returnWeighOutOperatorName: "",
  returnWeighOutKg: 0,
  returnWeighOutRemark: "",
  returnNettoKg: 0,
  loadingTimestamp: "",
  loadingOperatorName: "",
  loadedSeal1: "",
  loadedSeal2: "",
  loadedSeal3: "",
  loadedSeal4: "",
  loadingRemark: "",
  unloadingTimestamp: "",
  unloadingOperatorName: "",
  unloadedSeal1: "",
  unloadedSeal2: "",
  unloadedSeal3: "",
  unloadedSeal4: "",
  unloadingRemark: "",
  returnUnloadingTimestamp: "",
  returnUnloadingOperatorName: "",
  returnUnloadedSeal1: "",
  returnUnloadedSeal2: "",
  returnUnloadedSeal3: "",
  returnUnloadedSeal4: "",
  returnUnloadingRemark: "",
  externalRefNo: "",
  externalRefNo2: "",
  signature: "",
  armin_wbout: 0,
  armin_pot_wajib: 0,
  armin_pot_lain: 0,
};

const TransactionsX = () => {
  const [QrCodeDC, setQrCodeDC] = useState("");
  const [QrCodeEC, setQrCodeEC] = useState("");

  const [QrCodeCmdDC, setQrCodeCmdDC] = useState("");
  const [QrCodeCmdEC, setQrCodeCmdEC] = useState("");

  const [canSubmit, setCanSubmit] = useState(false);

  const [notes, setNotes] = useState("");

  const [dataTransaction, setDataTransaction] = useState(
    initialDataTransaction
  );

  const [showQRCodeScannerIn, setShowQRCodeScannerIn] = useState(false);

  const [showQR, setShowQR] = useState(false);
  const [disableInput, setDisableInput] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  const handleShowQR = () => setShowQR(!showQR);

  const handleDecodeQR = async (barcodeInputValue) => {
    const dataPost = { content: barcodeInputValue };

    decodeQrcode(dataPost)
      .then((results) => {
        if (results?.success) {
          setQrCodeDC(JSON.stringify(results.record, null, 2));

          setDataTransaction((prev) => {
            const temp = { ...prev, ...results?.record };

            if (temp.vehicleOperationStatus === 1) {
              setNotes((prev) => `PKS WB-IN\n${prev}`);
            } else if (temp.vehicleOperationStatus === 3) {
              setNotes((prev) => `PKS WB-OUT\n${prev}`);

              getByPlateNo(temp.vehiclePlateNo).then((results) => {
                setDataTransaction((prev) => {
                  const temp2 = { ...prev };

                  console.log("result search plate no");
                  console.log(results);

                  temp2.externalRefNo =
                    results.records.dataTransaction.bonTripNo;
                  temp2.originWeighInKg =
                    results.records.dataTransaction.jsonIn.originWeighInKg;
                  return temp2;
                });
              });
            } else {
              setNotes(
                (prev) =>
                  `Vehicle Operation Status: ${dataTransaction.vehicleOperationStatus}\n${prev}`
              );
            }

            return temp;
          });
        } else {
          setNotes(
            (prev) => `Decoding processing failed: ${results?.message}\n${prev}`
          );
        }

        // Push process untuk ngetest
        /*
        injectPksWbIn().then((results) => {
          setDataTransaction((prev) => {
            const temp = { ...prev, ...results?.record };

            if (temp.vehicleOperationStatus === 1) {
              setNotes((prev) => `Push data to process: PKS WB-IN\n${prev}`);
            } else if (temp.vehicleOperationStatus === 3) {
              setNotes((prev) => `Push data to process: PKS WB-OUT\n${prev}`);
            } else {
              setNotes(
                (prev) =>
                  `Push data to process: Vehicle Operation Status: ${dataTransaction.vehicleOperationStatus}\n${prev}`
              );
            }

            return temp;
          });
        });*/
      })
      .catch((error) => {
        setNotes((prev) => `Error decoding process...\n${prev}`);
      });

    // const results = await axios.post(
    //   "https://dispatch-api-dev.semaigroup.com/external-channel/cmd/decode-qrcode",
    //   dataPost
    // );

    // const result = await axios.get(
    //   "https://dispatch-api-dev.semaigroup.com/external-channel/storage-tanks"
    // );
  };

  const handleSubmit = () => {
    console.log("handleSubmit");
    let dateWb = new Date();

    setDataTransaction((prev) => ({
      ...prev,
      originWeighInTimestamp: `${dateWb.toJSON()}`,
      originWeighOutTimestamp: `${dateWb.toJSON()}`,
    }));

    const dataDispatch = {
      ...dataTransaction,
      originWeighInTimestamp: `${dateWb.toJSON()}`,
      originWeighOutTimestamp: `${dateWb.toJSON()}`,
    };

    delete dataDispatch.armin_wbout;
    delete dataDispatch.armin_pot_wajib;
    delete dataDispatch.armin_pot_lain;

    const dataWbTransaction = {
      prevId: 0,
      bonTripNo: dataTransaction.externalRefNo,
      deliveryOrderNo: dataTransaction.deliveryOrderNo,
      vehiclePlateNo: dataTransaction.vehiclePlateNo,
      vehicleStatus: dataTransaction.vehicleOperationStatus,
      deliveryStatus: dataTransaction.deliveryStatus,
      potonganWajib: dataTransaction.armin_pot_wajib,
      potonganLain: dataTransaction.armin_pot_lain,

      weightIn: dataTransaction.originWeighInKg,
      weightOut: dataTransaction.originWeighOutKg,

      jsonIn: { ...dataTransaction },
      jsonOut: {
        ...dataTransaction,
        originWeighInTimestamp: `${dateWb.toJSON()}`,
        originWeighOutTimestamp: `${dateWb.toJSON()}`,
      },
    };

    // console.log("Data WB IN:");
    // console.log(dataWbTransaction);

    if (dataTransaction.vehicleOperationStatus === 1) {
      console.log("Data Save WB IN");

      createDataTransaction(dataWbTransaction)
        .then((results) => {
          alert("WBIN Data Saved");
          setDataTransaction(initialDataTransaction);
          setQrCodeCmdDC("");
          setQrCodeCmdEC("");
        })
        .catch((error) => {
          console.log("error on saving wbin:");
          console.log(error);
        });
    } else if (dataTransaction.vehicleOperationStatus === 3) {
      console.log("Data Dispatch:");
      console.log(dataDispatch);

      dispatchDelivery(dataDispatch)
        .then((results) => {
          console.log("results on dispatch:");
          console.log(results);
        })
        .catch((error) => {
          console.log("error on dispatch:");
          console.log(error);
        });
    }
  };

  useEffect(() => {
    setDataTransaction((prev) => ({
      ...prev,
      originWeighOutKg:
        dataTransaction.armin_wbout -
        dataTransaction.armin_pot_wajib -
        dataTransaction.armin_pot_lain,
      originNettoKg:
        dataTransaction.armin_wbout -
        dataTransaction.armin_pot_wajib -
        dataTransaction.armin_pot_lain -
        dataTransaction.originWeighInKg,
    }));
  }, [
    dataTransaction.armin_wbout,
    dataTransaction.armin_pot_wajib,
    dataTransaction.armin_pot_lain,
    dataTransaction.originWeighInKg,
  ]);

  useEffect(() => {
    setCanSubmit(
      dataTransaction.externalRefNo &&
        dataTransaction.externalRefNo.trim().length > 0 &&
        dataTransaction.deliveryOrderNo &&
        dataTransaction.deliveryOrderNo.trim().length > 0
    );
  }, [dataTransaction.externalRefNo, dataTransaction.deliveryOrderNo]);

  const saveWb = async (e) => {
    e.preventDefault();

    // await axios.post("http://localhost:8800/api/weighbridges", {
    //   siteId: parseInt(id),
    //   code: code,
    //   ip_address: ipAddress,
    //   port: port,
    // });

    navigate(`/weighbridges/${id}`);
  };

  return (
    <div className="flex flex-row mx-2">
      <QRCodeScanner
        visible={showQRCodeScannerIn}
        handleClose={(barcodeInputValue) => {
          setShowQRCodeScannerIn(false);

          if (barcodeInputValue?.trim()) {
            handleDecodeQR(barcodeInputValue.trim());
            setQrCodeEC(barcodeInputValue.trim());
          }
        }}
      />

      <div className="basis-1/4 mx-2 my-2 bg-white p-4 rounded-xl shadow shadow-slate-300">
        <div className="mb-2">
          <Button
            className="mb-4"
            style={{ height: "60px", fontWeight: "bold", fontSize: "25px" }}
            fullWidth
            onClick={() => {
              setQrCodeDC("");
              setQrCodeEC("");
              setDataTransaction(initialDataTransaction);

              setShowQRCodeScannerIn(true);
            }}
          >
            Scan QR
          </Button>
          <Textarea
            className="mb-2"
            style={{ backgroundColor: "lightgreen" }}
            readOnly={true}
            label="[WB-IN] QRCode Scan Value"
            value={QrCodeEC}
          />

          <Textarea
            className="mb-2"
            style={{ backgroundColor: "lightgreen" }}
            readOnly={true}
            label="[WB-IN] QRCode Decode Value"
            value={QrCodeDC}
          />

          <Textarea
            className="mb-2"
            style={{ backgroundColor: "lightgreen" }}
            readOnly={true}
            label="Notes"
            value={notes}
          />
        </div>
      </div>

      <div className="basis-1/4 mx-2 my-2 bg-white p-4 rounded-xl shadow shadow-slate-300">
        <div className="mb-2">
          <Button
            className="mb-2"
            color="indigo"
            fullWidth
            onClick={() => setDisableInput((prev) => !prev)}
          >
            {disableInput ? "Enable" : "Disable"} Input
          </Button>

          <div className="flex flex-col">
            <div
              className="mb-2"
              style={{ backgroundColor: disableInput ? "whitesmoke" : "white" }}
            >
              <Input
                label="BON Trip No"
                value={dataTransaction.externalRefNo}
                onChange={(e) =>
                  setDataTransaction({
                    ...dataTransaction,
                    externalRefNo: e.target.value,
                  })
                }
                readOnly={disableInput}
              />
            </div>
            <div
              className="mb-2"
              style={{ backgroundColor: disableInput ? "whitesmoke" : "white" }}
            >
              <Input
                label="Delivery Order No"
                value={dataTransaction.deliveryOrderNo}
                onChange={(e) =>
                  setDataTransaction({
                    ...dataTransaction,
                    deliveryOrderNo: e.target.value,
                  })
                }
                readOnly={disableInput}
              />
            </div>
            <div
              className="mb-2"
              style={{ backgroundColor: disableInput ? "whitesmoke" : "white" }}
            >
              <Input
                label="Nomor Polisi"
                value={dataTransaction.vehiclePlateNo}
                onChange={(e) =>
                  setDataTransaction({
                    ...dataTransaction,
                    vehiclePlateNo: e.target.value,
                  })
                }
                readOnly={disableInput}
              />
            </div>

            <div
              className="mb-2"
              style={{ backgroundColor: disableInput ? "whitesmoke" : "white" }}
            >
              <Input
                label="Nama Supir"
                value={dataTransaction.driverFullName}
                onChange={(e) =>
                  setDataTransaction({
                    ...dataTransaction,
                    driverFullName: e.target.value,
                  })
                }
                readOnly={disableInput}
              />
            </div>

            <div
              className="mb-2"
              style={{ backgroundColor: disableInput ? "whitesmoke" : "white" }}
            >
              <Input
                label="Nama Vendor"
                value={
                  dataTransaction?.transporterCompanyFullName
                    ? dataTransaction.transporterCompanyFullName
                    : ""
                }
                onChange={(e) =>
                  setDataTransaction({
                    ...dataTransaction,
                    transporterCompanyFullName: e.target.value,
                  })
                }
                readOnly={disableInput}
              />
            </div>

            <div
              className="mb-2"
              style={{ backgroundColor: disableInput ? "whitesmoke" : "white" }}
            >
              <Input
                label="Sertifikasi Tipe Truk"
                value={""}
                onChange={(e) =>
                  setDataTransaction({
                    ...dataTransaction,
                  })
                }
                readOnly={disableInput}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="basis-1/4 mx-2 my-2 bg-white p-4 rounded-xl shadow shadow-slate-300">
        <GetWeightWB
          handleSubmit={(weightWb) => {
            if (dataTransaction.vehicleOperationStatus === 1) {
              setDataTransaction((prev) => ({
                ...prev,
                originWeighInKg: weightWb,
              }));
            } else if (dataTransaction.vehicleOperationStatus === 3) {
              setDataTransaction((prev) => ({
                ...prev,
                originWeighOutKg: weightWb,
                armin_wbout: weightWb,
              }));
            }
          }}
        />
        <div className="mb-4">
          <Input
            type={"number"}
            label="Weight IN"
            style={{ backgroundColor: "whitesmoke" }}
            value={dataTransaction.originWeighInKg}
            onChange={(e) =>
              setDataTransaction({
                ...dataTransaction,
                originWeighInKg: e.target.value,
              })
            }
            readOnly={true}
          />
        </div>
        <div className="mb-2">
          <Input
            type={"number"}
            label="Weight OUT"
            style={{ backgroundColor: "whitesmoke" }}
            value={dataTransaction.armin_wbout}
            onChange={(e) =>
              setDataTransaction({
                ...dataTransaction,
                armin_wbout: e.target.value,
              })
            }
            readOnly={true}
          />
        </div>

        <div className="mb-2">
          <Input
            type={"number"}
            label="Potongan Wajib Vendor"
            style={{
              backgroundColor:
                disableInput || dataTransaction.vehicleOperationStatus === 1
                  ? "whitesmoke"
                  : "white",
            }}
            value={dataTransaction.armin_pot_wajib}
            onChange={(e) =>
              setDataTransaction({
                ...dataTransaction,
                armin_pot_wajib: e.target.value,
              })
            }
            readOnly={disableInput}
          />
        </div>
        <div className="mb-2">
          <Input
            type={"number"}
            label="Potongan Lainnya"
            style={{
              backgroundColor:
                disableInput || dataTransaction.vehicleOperationStatus === 1
                  ? "whitesmoke"
                  : "white",
            }}
            value={dataTransaction.armin_pot_lain}
            onChange={(e) =>
              setDataTransaction({
                ...dataTransaction,
                armin_pot_lain: e.target.value,
              })
            }
            readOnly={disableInput}
          />
        </div>
        <div className="mb-2">
          <Input
            type={"number"}
            label="TOTAL"
            style={{ backgroundColor: "whitesmoke" }}
            value={dataTransaction.originNettoKg}
            onChange={(e) =>
              setDataTransaction({
                ...dataTransaction,
                originNettoKg: e.target.value,
              })
            }
            readOnly={true}
          />
        </div>

        <Button
          className="mt-4"
          style={{ height: "60px", fontWeight: "bold", fontSize: "25px" }}
          fullWidth
          onClick={handleSubmit}
          disabled={canSubmit ? false : true}
        >
          Submit
        </Button>
      </div>

      <div className="basis-1/4 mx-2 my-2 bg-white p-4 rounded-xl shadow shadow-slate-300">
        <Textarea
          className="mb-2"
          style={{ backgroundColor: "lightskyblue" }}
          readOnly={true}
          label="QR Code CMD Value"
          value={QrCodeCmdDC}
        />

        <Textarea
          className="mb-2"
          style={{ backgroundColor: "lightskyblue" }}
          readOnly={true}
          label="QR Code CMD Encode"
          value={QrCodeCmdEC}
        />
        <Button className="mb-2" color="indigo" onClick={handleShowQR}>
          Show QR
        </Button>
      </div>

      <Dialog open={showQR} handler={handleShowQR}>
        <DialogHeader>QR Code</DialogHeader>
        <DialogBody>
          <div
            style={{
              height: "auto",
              margin: "0 auto",
              maxWidth: 254,
              width: "100%",
            }}
          >
            <QRCode
              size={512}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={QrCodeDC}
              viewBox={`0 0 256 256`}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button color="brown" onClick={handleShowQR}>
            OK
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Transactions;
