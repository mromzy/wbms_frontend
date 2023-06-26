import React from "react";
import { CFooter } from "@coreui/react";

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="https://dsn.id" target="_blank" rel="noopener noreferrer">
          WBMS
        </a>
        <span className="ms-1">&copy; 2023 Dharma Satya Nusantara.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://armin.co.id" target="_blank" rel="noopener noreferrer">
          ARMIN
        </a>
      </div>
    </CFooter>
  );
};

export default React.memo(AppFooter);
