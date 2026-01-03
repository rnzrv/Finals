import React from "react";
import ReactDOM from "react-dom";

function LogoutModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div className="logout-modal-backdrop">
        <div className="logout-modal">
          <h3>Confirm Logout</h3>
          <p>Are you sure you want to log out?</p>
          <div className="logout-modal-actions">
            <button className="logout-btn cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="logout-btn confirm" onClick={onConfirm}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .logout-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .logout-modal {
          background: #ffffff;
          border-radius: 10px;
          padding: 20px 24px;
          width: 320px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .logout-modal h3 {
          margin: 0 0 8px;
          font-size: 18px;
        }

        .logout-modal p {
          margin: 0 0 16px;
          color: #555;
          font-size: 14px;
          font-family: Inter, sans-serif;
          font-weight: 500;
        }

        .logout-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .logout-btn {
          border: none;
          border-radius: 6px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 600;
        }

        .logout-btn.cancel {
          background: #e5e7eb;
          color: #374151;
        }

        .logout-btn.confirm {
          background: #ef4444;
          color: #ffffff;
        }
      `}</style>
    </>,
    document.body // <- this renders modal at the very top of DOM
  );
}

export default LogoutModal;
