import React from "react";
import CIcon from "@coreui/icons-react";
import { CNavGroup, CNavItem, CNavTitle } from "@coreui/react";

import { cilPuzzle, cilSpeedometer } from "@coreui/icons";
import { MdCarRepair } from "react-icons/md";

const _nav = [
  {
    component: CNavItem,
    name: "Dashboard",
    to: "/dashboard",
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: "Jembatan Timbang (WB)",
  },
  {
    component: CNavGroup,
    name: "PKS",
    to: "/pks-transaction",
    icon: <MdCarRepair className="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Transaksi WB",
        to: "/pks-transaction",
      },
      {
        component: CNavItem,
        name: "Report",
        to: "/reports/pks-transactions",
      },
    ],
  },
  {
    component: CNavGroup,
    name: "T30",
    to: "/base",
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Transaksi WB",
        to: "/wb/pks-transaction",
      },
      {
        component: CNavItem,
        name: "Report",
        to: "/base/breadcrumbs",
      },
    ],
  },
  {
    component: CNavGroup,
    name: "Labanan",
    to: "/base",
    icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: "Transaksi WB",
        to: "/wb/pks-transaction",
      },
      {
        component: CNavItem,
        name: "Report",
        to: "/base/breadcrumbs",
      },
    ],
  },
];

export default _nav;
