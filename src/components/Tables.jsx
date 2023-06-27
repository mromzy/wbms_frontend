import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RangeSelectionModule,
  RowGroupingModule,
  RichSelectModule,
]);

const Tables = (props) => {
  const { name, fetcher, colDefs, groupColDef, gridRef } = props;

  const { data } = useSWR(name, fetcher, {
    refreshInterval: 2000,
  });

  const defaultColDef = {
    sortable: true,
    resizable: true,
    floatingFilter: false,
    filter: true,
  };

  useEffect(() => {
    console.clear();

    return () => {
      console.clear();
    };
  }, []);
  return (
    <div className="ag-theme-alpine" style={{ width: "auto", height: "70vh" }}>
      <AgGridReact
        ref={gridRef}
        rowData={data} // Row Data for Rows
        columnDefs={colDefs} // Column Defs for Columns
        defaultColDef={defaultColDef} // Default Column Properties
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        rowSelection="multiple" // Options - allows click selection of rows
        rowGroupPanelShow="always"
        enableRangeSelection="true"
        groupSelectsChildren="true"
        suppressRowClickSelection="true"
        autoGroupColumnDef={groupColDef}
        pagination="true"
        paginationAutoPageSize="true"
        groupDefaultExpanded="1"
      />
    </div>
  );
};

export default Tables;
