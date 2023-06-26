import Filter1Icon from "@mui/icons-material/Filter1";
import Filter2Icon from "@mui/icons-material/Filter2";
import Filter3Icon from "@mui/icons-material/Filter3";
import CarRepairOutlinedIcon from "@mui/icons-material/CarRepairOutlined";
import AssessmentIcon from "@mui/icons-material/Assessment";

export const SideMenuItems = [
  {
    id: 0,
    icon: <CarRepairOutlinedIcon />,
    label: "Transaksi PKS",
    route: "wb/pks-transaction",
  },
  {
    id: 3,
    icon: <AssessmentIcon />,
    label: "Report Transaksi",
    route: "wb/report-daily-transaction",
  },
];
