import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Grid, Paper } from "@mui/material";

import useSWR from "swr";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import Config from "../../../configs";
import * as ProvinceAPI from "../../../api/provinceApi";

import PageHeader from "../../../components/PageHeader";
import Tables from "../../../components/Tables";
import { Button } from "react-bootstrap";
import React from "react";

const Index = () => {
  const { configs } = useSelector((state) => state.app);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const statusFormatter = (params) => {
    return Config.PKS_PROGRESS_STATUS[params.value];
  };

  const gridRef = useRef();

  const [colDefs] = useState([
    { headerName: "Nama", field: "name", filter: true, sortable: true, hide: false },
    {
      headerName: "Actions",
      field: "id",
      cellRenderer: (params) => {
        return (
          <div>
            <Button
              variant="primary"
              className="me-3"
              onClick={() => navigate(`/provinces/${params.value}`)}
            >
              View
            </Button>
            <Button variant="secondary">Delete</Button>
          </div>
        );
      },
    },
  ]);

  // never changes, so we can use useMemo
  const groupColDef = useMemo(
    () => ({
      cellRendererParams: {
        suppressCount: true,
        checkbox: true,
      },
      field: "bonTripNo",
      width: 300,
    }),
    [],
  );

  const fetcher = () =>
    ProvinceAPI.getAll().then((res) => {
      console.log(res.data);
      return res.data.province.records;
    });

  useEffect(() => {
    // console.clear();

    return () => {
      // console.clear();
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Daftar Site"
        subTitle="Page Description"
        icon={<LocalShippingIcon fontSize="large" />}
      />

      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <div style={{ marginBottom: "3px" }}>
              <button
                onClick={() => {
                  gridRef.current.api.exportDataAsExcel();
                }}
              >
                Export Excel
              </button>
            </div>
            <Tables name={"site"} fetcher={fetcher} colDefs={colDefs} gridRef={gridRef} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Index;
