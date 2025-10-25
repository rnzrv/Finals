import React, {useState, useEffect, useRef} from 'react'
import { createPortal } from 'react-dom';
import "../../css/modal/deletePatient.css";
import axios from 'axios';
import { use } from 'react';

function DeletePatient({ patient, onPatientDeleted }) {

    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [Message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);



    

    const handleDelete = async (e) => {
        // Logic to delete patient
        e.preventDefault();
        setMessage(null);
        setMessageType(null);
 
        try{
            // Make API call to delete patient
            // Example:

            const token = sessionStorage.getItem("accessToken");
            const response = await axios.delete(`http://localhost:8081/patients/deletePatient/${patient.id}`,
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage(response.data.message || "Patient deleted successfully");
            setMessageType("success");

        } catch (error) {
            console.error("Error deleting patient:", error);
            setMessage("Failed to delete patient");
            setMessageType("error");
        }

    
    }

    useEffect(() => {
        if (Message){
            setTimeout(() => {
                setIsOpen(false);
                onPatientDeleted();
            }, 1000);
        }
    }, [Message, messageType]);

    useEffect(() => {
        if(isOpen){
            setIsMounted(true);
            document.body.style.overflow = "hidden";
        }else{
            setIsMounted(false);
            document.body.style.overflow = "";
        }
    }, [isOpen]);


    const modalContent = (
        <div className={`delete-modal-overlay ${isOpen ? "open" : "closed"}`}>
            <div className="delete-modal">
                <h2>Delete Patient</h2>
                <p className={`message ${messageType}`}>{Message}</p>
                <p>Are you sure you want to delete this patient?</p>
                <div className="delete-modal-actions">
                    <button onClick={handleDelete}>Yes, Delete</button>
                    <button onClick={() => setIsOpen(false)}>Cancel</button>
                </div>
            </div>
        </div>
    );



  return (
    <>
        <button className="patients-card-button" onClick={()=>setIsOpen(true)}>
            Delete Patient
        </button>

        {isMounted && createPortal(modalContent, document.body)}
    
    
    </>
  )
}

export default DeletePatient;
