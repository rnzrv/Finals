import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashhboard from "./dashhboard";
import Inventory from "./inventory";
import Purchases from "./purchases";
import Appointments from "./appointments";
import Patients from "./patients";
import Reports from "./reports";
import PointofSales from "./pointofSales";
import ProtectedRoute from "./protectedRoute";
import Settings from "./settings";
import LogoutPage from "./LogoutPage";
import RoleProtectedRoute from "./roleProtectedRoute.jsx";
import SalesHistory from "./salesHistory.jsx";
function App() {
  return (
    <Router>
      <Routes>
        {/* Public route (Login) */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/dashhboard"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER", "STAFF"]}>
              <Dashhboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER", "STAFF"]}>
              <Inventory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER"]}>
              <Purchases />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER", "STAFF"]}>
              <PointofSales />
            </RoleProtectedRoute>
          }
        />
        <Route 
          path="/salesHistory"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER", "STAFF"]}>
              <SalesHistory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER", "STAFF"]}>
              <Appointments />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <RoleProtectedRoute allowedRoles={["ceo", "MANAGER", "STAFF"]}>
              <Patients />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        
      </Routes>
    </Router>
  );
}

export default App;
