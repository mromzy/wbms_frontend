import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HashRouter, Routes, Route } from "react-router-dom";

import "./scss/style.scss";

import { setConfigs } from "./slices/appSlice";
import { getEnvInit } from "./configs";

// Containers
const LayoutGuest = lazy(() => import("./layout/LayoutGuest"));
const DefaultLayout = lazy(() => import("./layout/DefaultLayout"));

// Pages
const Home = lazy(() => import("./views/pages/Home"));
const Login = lazy(() => import("./views/pages/login/Login"));
const SignIn = lazy(() => import("./views/pages/Auth/SignIn"));
const Page404 = lazy(() => import("./views/pages/page404/Page404"));
const Page500 = lazy(() => import("./views/pages/page500/Page500"));

const App = () => {
  const dispatch = useDispatch();

  const loading = (
    <div className="pt-3 text-center">
      <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
  );

  useEffect(() => {
    (async () =>
      await getEnvInit().then((result) => {
        dispatch(setConfigs({ ...result }));
      }))();
  }, []);

  return (
    <HashRouter>
      <Suspense fallback={loading}>
        <Routes>
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route path="/" element={<LayoutGuest />}>
            <Route index={true} exact path="/" name="Home Page" element={<Home />} />
            <Route path="/home" name="Home Page" element={<Home />} />
            <Route path="/signin" name="Sign In Page" element={<SignIn />} />
          </Route>
          <Route path="*" name="WBMS" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
    // </WbmsContext.Provider>
  );
};

export default App;
