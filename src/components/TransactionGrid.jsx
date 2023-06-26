import React, { useMemo, useRef, useState } from "react";
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

import Config from "../configs";
import * as TransactionAPI from "../api/transactionApi";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RangeSelectionModule,
  RowGroupingModule,
  RichSelectModule,
]);

const TransactionGrid = (props) => {
  const { tType } = props;

  const statusFormatter = (params) => {
    return Config.PKS_PROGRESS_STATUS[params.value];
  };

  const gridRef = useRef();
  const [columnDefs] = useState([
    {
      headerName: "Bontrip No",
      field: "bonTripNo",
      filter: true,
      sortable: true,
      hide: false,
    },
    { headerName: "No Pol", field: "transportVehiclePlateNo", filter: true },
    {
      headerName: "Status",
      field: "progressStatus",
      cellClass: "progressStatus",
      valueFormatter: statusFormatter,
      enableRowGroup: true,
      rowGroup: true,
      hide: true,
    },
    {
      headerName: "DO No",
      field: "deliveryOrderNo",
      filter: true,
      sortable: true,
    },
    {
      headerName: "Product",
      field: "productName",
      filter: true,
      sortable: true,
    },
    { headerName: "WB-IN", field: "originWeighInKg", maxWidth: 150 },
    { headerName: "WB-OUT", field: "originWeighOutKg", maxWidth: 150 },
    { headerName: "Return WB-IN", field: "returnWeighInKg", maxWidth: 185 },
    { headerName: "Return WB-OUT", field: "returnWeighOutKg", maxWidth: 195 },
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
    []
  );

  const fetcher = () =>
    TransactionAPI.searchMany({
      where: {
        tType,
        progressStatus: { notIn: [4, 9, 14] },
      },
      orderBy: { bonTripNo: "desc" },
    }).then((res) => res.records);

  const { data: dtTransactions } = useSWR("transaction", fetcher, {
    refreshInterval: 1000,
  });
  return (
    <div className="ag-theme-alpine" style={{ width: "auto" }}>
      <AgGridReact
        rowData={dtTransactions} // Row Data for Rows
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
  );
};

export default TransactionGrid;
