import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashhboard from "./dashhboard";
import Inventory from "./inventory";
import Purchases from "./purchases";
import Appointments from "./appointments"
import Patients from "./patients"
import Reports from "./reports"


function App() {
  return (
    <Router>
      <Routes>
        {/* default page (Login) */}
        <Route path="/" element={<Login />} />
        {/* after login redirect here */}
        <Route path="/dashhboard" element={<Dashhboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/reports" element={<Reports />} />




      </Routes>
    </Router>
  );
}

export default App;


