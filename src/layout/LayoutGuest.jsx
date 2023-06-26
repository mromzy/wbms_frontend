import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CssBaseline from "@mui/material/CssBaseline";

import Header from "../components/Header";

const LayoutGuest = () => {
  return (
    <div className="wrapper bg-light min-vh-100 d-flex flex-column">
      <ToastContainer />
      <Header />
      <Container className="body flex-grow-1 px-3">
        {/* <CssBaseline /> */}
        <Outlet />
      </Container>
    </div>
  );
};

export default LayoutGuest;
