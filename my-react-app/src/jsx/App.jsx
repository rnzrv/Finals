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
import LogoutPage from "./logoutPage.jsx";
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
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <Dashhboard />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
              <Inventory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Purchases />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
              <PointofSales />
            </RoleProtectedRoute>
          }
        />
        <Route 
          path="/salesHistory"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
              <SalesHistory />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
              <Appointments />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER", "CASHIER"]}>
              <Patients />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Reports />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
              <Settings />
            </RoleProtectedRoute>
          }
        />

        
      </Routes>
    </Router>
  );
}

export default App;
