// Patient Profile (3rd Page)

import { useState, useRef, useEffect } from "react";
import AddVisitForm from "./AddVisitRecordForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "./PatientProfile.css";

const PatientProfile = ({ selectedPatient, onBack , pediatricianId }) => {



  const [selectedHealthData, setSelectedHealthData] = useState(""); // State for selected dropdown option
  const [selectedTip, setSelectedTip] = useState("Select Tip");
  const [isFormVisible,setIsFormVisible] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State for the popup visibility
  const [popupContent, setPopupContent] = useState(""); // Content for the popup

  const healthDataRef = useRef(null);
   // Reference for health data container

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleTipSelect = (e) => {
    const selected = e.target.value;
    setSelectedTip(selected);

    // Show the popup with the selected tip content
    if (selected !== "Select Tip") {
      setPopupContent(getTipContent(selected));
      setIsPopupVisible(true);
    }
  };

  const getTipContent = (tip) => {
    // Return the content for each selected tip
    switch (tip) {
      case "Nutrition":
        return "Provide a balanced diet rich in fruits, vegetables, and proteins.";
      case "Dev Milestones":
        return "Focus on motor skill development and language growth.";
      case "Red Flags":
        return "Monitor for unusual symptoms like delayed speech or motor function.";
      case "Parent To-do list":
        return "Ensure regular health checkups and vaccinations.";
      case "How To-do list helps":
        return "Helps track key developmental milestones and medical appointments.";
      case "Immunization":
        return "Follow the vaccination schedule for essential childhood immunizations.";
      case "Growth Tracking":
        return "Keep track of height, weight, and head circumference for growth monitoring.";
      case "Security & Safety":
        return "Baby-proof the home and ensure safe sleeping environments.";
      default:
        return "";
    }
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const handleHealthDataChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedHealthData(selectedValue);
  };

  // Scroll into view when health data is selected
  useEffect(() => {
    if (selectedHealthData && healthDataRef.current) {
      healthDataRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedHealthData]); // This will trigger whenever `selectedHealthData` changes

  // Function to handle arrow click and go back to the previous page (or home page)
  const goBack = () => {
    window.history.back(); // This will take the user to the previous page in the browser history
  };

  return (
    <div className="patient-profile">
      {/* Arrow to go back */}
      <div className="back-arrow" onClick={onBack}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </div>

      {/* Heading */}
      <h1 className="patient-profile-heading">Patient Profile</h1>

      {/* Patient Information and Dropdown */}
      <div className="profile-wrapper">
        {/* Patient Information Card and Dropdown Container */}
        <div className="left-container">
          {/* Patient Card */}
          <div className="patient-card">
            <div className="patient-card-content">
              {/* Ensure patient name is coming from selectedPatient prop */}
              <p>
                <strong>First Name:</strong>{" "}
                {selectedPatient?.patientFirstName || "N/A"}
              </p>
              <p>
                <strong>Last Name:</strong>{" "}
                {selectedPatient?.patientLastName || "N/A"}
              </p>
              <p>
                <strong>Caregiver First Name:</strong>{" "}
                {selectedPatient?.caregiverFirstName || "N/A"}
              </p>
              <p>
                <strong>Caregiver Last Name:</strong>{" "}
                {selectedPatient?.caregiverLastName || "N/A"}
              </p>
              <p>
                <strong>Age:</strong> {selectedPatient?.date_of_birth || 0}{" "}
                
              </p>
            </div>
          </div>

          {/* Dropdown and Add Visit Record Button */}
          <div className="dropdown-container">
            <div className="dropdown-wrapper">
              <label htmlFor="age-tips-dropdown" className="dropdown-label">
                Age Appropriate Tips
              </label>
              <select
                id="age-tips-dropdown"
                className="dropdown"
                value={selectedTip}
                onChange={handleTipSelect}
              >
                <option value="Select Tip">Select Tip</option>
                <option value="Nutrition">Nutrition</option>
                <option value="Dev Milestones">Dev Milestones</option>
                <option value="Red Flags">Red Flags</option>
                <option value="Parent To-do list">Parent To-do list</option>
                <option value="How To-do list helps">
                  How To-do list helps
                </option>
                <option value="Immunization">Immunization</option>
                <option value="Growth Tracking">Growth Tracking</option>
                <option value="Security & Safety">Security & Safety</option>
              </select>
            </div>
          </div>

          <button className="add-visit-button" onClick={toggleFormVisibility}>
            Add Visit Record
          </button>
        </div>

        {/* Patient Summary */}
        <div className="right-container">
          <div className="patient-summary-label">Patient Summary</div>
        </div>
      </div>

      {/* View Health Data Dropdown */}
      <div className="health-data-dropdown-container">
        <label htmlFor="health-data-dropdown" className="health-dropdown-label">
          View Health Data
        </label>
        <select
          id="health-data-dropdown"
          className="health-dropdown"
          value={selectedHealthData}
          onChange={handleHealthDataChange}
        >
          <option value="">Select Data</option>
          <option value="Growth Charts">Growth Charts</option>
          <option value="Immunizations">Immunizations</option>
          <option value="Milestone Tracker with Red Flags">
            Milestone Tracker with Red Flags
          </option>
          <option value="Screening Tests">Screening Tests</option>
          <option value="Past Visit Records">Past Visit Records</option>
        </select>
      </div>

      {/* Health Data Content Based on Selection */}
      {selectedHealthData && (
        <div ref={healthDataRef} className="health-data-container">
          <div className="health-data-content">
            Content for {selectedHealthData}
          </div>
        </div>
      )}

      {/* Add Visit Form Popup */}
      {isFormVisible && (
        <div className="overlay">
          <div className="form-container">
            <AddVisitForm onClose={toggleFormVisibility} pediatricianId={pediatricianId} patientId={selectedPatient.patientId}  />
          </div>
        </div>
      )}

      {/* Age Appropriate Tip Popup */}
      {isPopupVisible && (
        <div className="overlay">
          <div className="popup-container">
            <div className="popup-content">
              <h3>{selectedTip}</h3>
              <p>{popupContent}</p>
              <button onClick={closePopup} className="close-popup-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;
