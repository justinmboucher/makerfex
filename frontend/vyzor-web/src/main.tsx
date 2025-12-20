// src/main.tsx
// ============================================================================
// App Entrypoint + Routing
// ----------------------------------------------------------------------------
// Purpose:
// - Bootstraps the Vyzor UI shell (sidebar/topbar layout) and all routes.
// - Wires Makerfex authentication + protected routes into the Vyzor shell.
// - Ensures Makerfex pages (list + detail) render INSIDE the App layout,
//   so they inherit sidebar/topbar and consistent navigation.
// ============================================================================

import { Fragment, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AuthProvider from "./context/AuthProvider.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";

const MFLogin = lazy(() => import("./pages/makerfex/Login.tsx"));
const MFProof = lazy(() => import("./pages/makerfex/MFProof.tsx"));
const MFProjectDetail = lazy(() => import("./pages/makerfex/ProjectDetail.tsx"));
const MFCustomerDetail = lazy(() => import("./pages/makerfex/CustomerDetail.tsx"));
const MFEmployees = lazy(() => import("./pages/makerfex/Employees.tsx"));
const MFEmployeeDetail = lazy(() => import("./pages/makerfex/EmployeeDetail.tsx"));
const MFStations = lazy(() => import("./pages/makerfex/Stations.tsx"));
const MFStationDetail = lazy(() => import("./pages/makerfex/StationDetail.tsx"));
const MFTasks = lazy(() => import("./pages/makerfex/Tasks.tsx"));
const MFInventory = lazy(() => import("./pages/makerfex/Inventory.tsx"));
const MFProducts = lazy(() => import("./pages/makerfex/Products.tsx"));


const App = lazy(() => import('./pages/App.tsx'));
const Landing = lazy(() => import('./components/pages/landing/landing.tsx'));
const AuthenticationLayout = lazy(() => import('./pages/authenticationlayout.tsx'));
const Error500 = lazy(() => import('./components/pages/error/500-error/500-error.tsx'));
const ComingSoon = lazy(() => import('./components/pages/authentication/coming-soon/coming-soon.tsx'));
const CpBasic = lazy(() => import('./components/pages/authentication/create-password/basic/basic.tsx'));
const CpCover = lazy(() => import('./components/pages/authentication/create-password/cover/cover.tsx'));
const Error404 = lazy(() => import('./components/pages/error/404-error/404-error.tsx'));
const Error401 = lazy(() => import('./components/pages/error/401-error/401-error.tsx'));
const LsBasic = lazy(() => import('./components/pages/authentication/lock-screen/basic/basic.tsx'));
const Lscover = lazy(() => import('./components/pages/authentication/lock-screen/cover/cover.tsx'));
const Rpbasic = lazy(() => import('./components/pages/authentication/reset-password/basic/basic.tsx'));
const Rpcover = lazy(() => import('./components/pages/authentication/reset-password/cover/cover.tsx'));
const Sibasic = lazy(() => import('./components/pages/authentication/sign-in/basic/basic.tsx'));
const Sicover = lazy(() => import('./components/pages/authentication/sign-in/cover/cover.tsx'));
const Subasic = lazy(() => import('./components/pages/authentication/sign-up/basic/basic.tsx'));
const Sucover = lazy(() => import('./components/pages/authentication/sign-up/cover/cover.tsx'));
const Tsvbasic = lazy(() => import('./components/pages/authentication/two-step-verification/basic/basic.tsx'));
const Tsvcover = lazy(() => import('./components/pages/authentication/two-step-verification/cover/cover.tsx'));
const UnderMaintenance = lazy(() => import('./components/pages/authentication/under-maintainance/under-maintainance.tsx'));
const Landinglayout = lazy(() => import('./pages/landinglayout.tsx'));

import { Provider } from 'react-redux';
import RootWrapper from './pages/Rootwrapper.tsx';
import { store } from './shared/redux/store.tsx';
import { RouteData } from './shared/data/routingdata.tsx';
const Firebaselayout = lazy(() => import('./pages/Firebaselayout.tsx'));
const Signin = lazy(() => import('./firebase/login.tsx'));

const MFDashboard = lazy(() => import("./pages/makerfex/Dashboard.tsx"));
const MFProjects = lazy(() => import("./pages/makerfex/Projects.tsx"));
const MFCustomers = lazy(() => import("./pages/makerfex/Customers.tsx"));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Fragment>
    <Provider store={store}>
      <RootWrapper>
        <AuthProvider>
          <BrowserRouter>
            {/* <Scrolltotop /> */}
            <Routes>
              {/* Makerfex auth entrypoint (NOT inside App shell) */}
              <Route path="/login" element={<MFLogin />} />

              <Route path={`${import.meta.env.BASE_URL}`} element={<Firebaselayout />}>
                <Route index element={<Signin />} />
                <Route path={`${import.meta.env.BASE_URL}common/firebase/signin`} element={<Signin />} />
              </Route>

              {/* Main Vyzor shell */}
              <Route path={`${import.meta.env.BASE_URL}`} element={<App />}>
                {RouteData.map((idx) => (
                  <Route key={idx.id} path={idx.path} element={idx.element} />
                ))}

                {/* Makerfex routes INSIDE the Vyzor shell */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <MFDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="projects"
                  element={
                    <ProtectedRoute>
                      <MFProjects />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ FIX: project detail must be inside the App shell */}
                <Route
                  path="projects/:id"
                  element={
                    <ProtectedRoute>
                      <MFProjectDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="customers"
                  element={
                    <ProtectedRoute>
                      <MFCustomers />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="customers/:id"
                  element={
                    <ProtectedRoute>
                      <MFCustomerDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="employees"
                  element={
                    <ProtectedRoute>
                      <MFEmployees />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="employees/:id"
                  element={
                    <ProtectedRoute>
                      <MFEmployeeDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="stations"
                  element={
                    <ProtectedRoute>
                      <MFStations />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="stations/:id"
                  element={
                    <ProtectedRoute>
                      <MFStationDetail />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="tasks"
                  element={
                    <ProtectedRoute>
                      <MFTasks />
                    </ProtectedRoute>
                  }
                />

                <Route 
                  path="inventory" 
                  element={
                  <ProtectedRoute>
                    <MFInventory />
                  </ProtectedRoute>
                  } 
                />

                <Route 
                  path="products" 
                  element={
                  <ProtectedRoute>
                    <MFProducts />
                  </ProtectedRoute>
                  } 
                />

                {/* Keep proof route for now */}
                <Route
                  path="mf-proof"
                  element={
                    <ProtectedRoute>
                      <MFProof />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Landing pages */}
              <Route path={`${import.meta.env.BASE_URL}`} element={<Landinglayout />}>
                <Route path={`${import.meta.env.BASE_URL}pages/landing`} element={<Landing />} />
              </Route>

              {/* Template authentication pages */}
              <Route path={`${import.meta.env.BASE_URL}`} element={<AuthenticationLayout />}>
                <Route path="*" element={<Error500 />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/coming-soon`} element={<ComingSoon />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/create-password/basic`} element={<CpBasic />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/create-password/cover`} element={<CpCover />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/lock-screen/basic`} element={<LsBasic />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/lock-screen/cover`} element={<Lscover />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/reset-password/basic`} element={<Rpbasic />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/reset-password/cover`} element={<Rpcover />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/sign-up/basic`} element={<Subasic />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/sign-up/cover`} element={<Sucover />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/sign-in/basic`} element={<Sibasic />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/sign-in/cover`} element={<Sicover />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/two-step-verification/basic`} element={<Tsvbasic />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/two-step-verification/cover`} element={<Tsvcover />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/under-maintainance`} element={<UnderMaintenance />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/error/401-error`} element={<Error401 />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/error/404-error`} element={<Error404 />} />
                <Route path={`${import.meta.env.BASE_URL}pages/authentication/error/500-error`} element={<Error500 />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </RootWrapper>
    </Provider>
  </Fragment>
);
