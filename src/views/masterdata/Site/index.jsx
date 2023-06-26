import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Grid, Paper } from "@mui/material";

import useSWR from "swr";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component
import "ag-grid-enterprise";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { RichSelectModule } from "@ag-grid-enterprise/rich-select";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import { ModuleRegistry } from "@ag-grid-community/core";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";

import Config from "../../../configs";
import * as SiteAPI from "../../../api/siteApi";

import PageHeader from "../../../components/PageHeader";
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RangeSelectionModule,
  RowGroupingModule,
  RichSelectModule,
]);

const Sites = () => {
  const { configs } = useSelector((state) => state.app);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.clear();
  const statusFormatter = (params) => {
    return Config.PKS_PROGRESS_STATUS[params.value];
  };

  const gridRef = useRef();

  const [columnDefs] = useState([
    {
      headerName: "Kode",
      field: "code",
      filter: true,
      sortable: true,
      hide: false,
    },
    { headerName: "Nama", field: "name", filter: true, sortable: true, hide: false },
    {
      headerName: "Perusahaan",
      field: "companyName",
      filter: true,
      sortable: true,
      hide: false,
    },
  ]);

  const defaultColDef = {
    sortable: true,
    resizable: true,
    floatingFilter: false,
    filter: true,
  };

  // never changes, so we can use useMemo
  const autoGroupColumnDef = useMemo(
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

  const fetcher = () => SiteAPI.getAll().then((res) => res.data.site.records);

  const { data: dtSites } = useSWR("site", fetcher, {
    refreshInterval: 2000,
  });

  useEffect(() => {
    console.clear();

    return () => {
      console.clear();
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
          <Paper sx={{ p: 2, mx: 1 }}>
            <div style={{ marginBottom: "3px" }}>
              <button
                onClick={() => {
                  gridRef.current.api.exportDataAsExcel();
                }}
              >
                Export Excel
              </button>
            </div>
            <div className="ag-theme-alpine" style={{ width: "auto", height: "70vh" }}>
              <AgGridReact
                ref={gridRef}
                rowData={dtSites} // Row Data for Rows
                columnDefs={columnDefs} // Column Defs for Columns
                defaultColDef={defaultColDef} // Default Column Properties
                animateRows={true} // Optional - set to 'true' to have rows animate when sorted
                rowSelection="multiple" // Options - allows click selection of rows
                rowGroupPanelShow="always"
                enableRangeSelection="true"
                groupSelectsChildren="true"
                suppressRowClickSelection="true"
                autoGroupColumnDef={autoGroupColumnDef}
                pagination="true"
                paginationAutoPageSize="true"
                groupDefaultExpanded="1"
              />
            </div>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Sites;
