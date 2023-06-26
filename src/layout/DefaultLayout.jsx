import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AppContent, AppSidebar, AppFooter, AppHeader } from "../components/index";

const DefaultLayout = () => {
  const { userInfo } = useSelector((state) => state.app);

  const navigate = useNavigate();

  useEffect(() => {
    // if (!userInfo) navigate("/home");
  }, []);

  return (
    <div>
      <ToastContainer />
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100 bg-light">
        <AppHeader />
        <div className="body flex-grow-1 px-3">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  );
};

export default DefaultLayout;
