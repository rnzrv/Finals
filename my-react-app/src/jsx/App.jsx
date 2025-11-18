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
            <ProtectedRoute>
              <Dashhboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <ProtectedRoute>
              <Purchases />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <PointofSales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <Patients />
            </ProtectedRoute>
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
      </Routes>
    </Router>
  );
}

export default App;
