import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoutePage from './pages/transport/Route';
import VehiclePage from './pages/transport/Vehicle';
import PickupPointPage from './pages/transport/PickupPoint';
import FeeMasterPage from './pages/transport/FeeMaster';
import RoutePickupPointPage from './pages/transport/RoutePickupPoint';
import AssignVehiclePage from './pages/transport/AssignVehicle';
import StudentTransportPage from './pages/transport/StudentTransport';
import StudentPage from './pages/transport/Student';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transport/routes" element={<RoutePage />} />
          <Route path="/transport/vehicles" element={<VehiclePage />} />
          <Route path="/transport/pickup-points" element={<PickupPointPage />} />
          <Route path="/transport/fee-master" element={<FeeMasterPage />} />
          <Route path="/transport/route-pickup-points" element={<RoutePickupPointPage />} />
          <Route path="/transport/assign-vehicle" element={<AssignVehiclePage />} />
          <Route path="/transport/student-transport" element={<StudentTransportPage />} />
          <Route path="/transport/students" element={<StudentPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
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
