// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import RoutePage from './pages/transport/Route';
import VehiclePage from './pages/transport/Vehicle';
import PickupPointPage from './pages/transport/PickupPoint';
import FeeMasterPage from './pages/transport/FeeMaster';
import RoutePickupPointPage from './pages/transport/RoutePickupPoint';
import AssignVehiclePage from './pages/transport/AssignVehicle';
import StudentTransportPage from './pages/transport/StudentTransport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Main layout with sidebar */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Transport Module Routes */}
          <Route path="/transport/routes" element={<RoutePage />} />
          <Route path="/transport/vehicles" element={<VehiclePage />} />
          <Route path="/transport/pickup-points" element={<PickupPointPage />} />
          <Route path="/transport/fee-master" element={<FeeMasterPage />} />
          <Route path="/transport/route-pickup-points" element={<RoutePickupPointPage />} />
          <Route path="/transport/assign-vehicle" element={<AssignVehiclePage />} />
          <Route path="/transport/student-transport" element={<StudentTransportPage />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
