import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LogoutModal from "./modals/logout/logout";

function LogoutPage() {
  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");

      // Optional backend logout call
      if (token) {
        await axios.post(
          "http://localhost:8081/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear client-side auth
      sessionStorage.clear();
      localStorage.clear();

      // Redirect to login page
      navigate("/", { replace: true });
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <LogoutModal
  open={true}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>

  );
}

export default LogoutPage;
