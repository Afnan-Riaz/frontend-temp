// Search Patient (2nd Page)

import { useState, useRef ,useEffect } from "react";
import { toast } from "react-toastify";
//import axios from "axios";
import jsQR from "jsqr";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import PatientProfile from "./PatientProfile";
import "./SearchToggle.css";

const SearchToggle = ({pediatricianId}) => {



  
  
  
  // State variables
  const [searchResults, setSearchResults] = useState(""); // To display search result messages
  const [patientData, setPatientData] = useState([]); // List of patients fetched from the API
  const [firstName, setFirstName] = useState(""); // Input field for patient's first name
  const [lastName, setLastName] = useState(""); // Input field for patient's last name
  const [dob, setDob] = useState(null); // Date of birth input managed as a Date object
  const [selectedPatient, setSelectedPatient] = useState(null); // Holds selected patient for viewing profile

  const fileInputRef = useRef(null); // Ref for hidden file input (QR upload)

  // const dummyPatients = [
  //   {
  //     patientFirstName: "John",
  //     patientLastName: "Doe",
  //     caregiverFirstName: "Jane",
  //     caregiverLastName: "Doe",
  //     dateOfBirth: "2024-06-12", // Use an ISO date string
  //     ageInMonths: 108, // Dummy age in months (9 years)
  //   },
  //   {
  //     patientFirstName: "Alice",
  //     patientLastName: "Smith",
  //     caregiverFirstName: "Bob",
  //     caregiverLastName: "Smith",
  //     dateOfBirth: "2024-03-22",
  //     ageInMonths: 85, // Dummy age in months (7 years)
  //   },
  // ];

  // Handle QR code scan

  const handleQrScan = async (file) => {
    let encrypted_id;
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on the canvas
      ctx.drawImage(img, 0, 0);

      // Extract image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Decode QR Code
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        encrypted_id = code.data;
        console.log("QR Code Data:", code.data);

        try {
          if (encrypted_id === undefined) {
            throw new Error("No QR Code found.");
          }

          const payload = {
            encrypted_id: encrypted_id
          };

          const response = await fetch(
            "http://localhost:5001/api/get_patient_by_qr_code_doctor",
            {
              method: "POST", // Change to POST as GET requests do not have a body
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload),
              credentials: "include"
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error fetching patient data: ${response.statusText}`
            );
          }

          const data = await response.json();
          const patients = data.patients || [];
          console.log("Data", data);
          console.log("Patients from the backend:", patients);

          // Filter for matching patients

          if (patients.length > 0) {
            const patientDetails = patients.map((patient) => ({
              patientId : patient.patient_id,
              patientFirstName: patient.patient_first_name,
              patientLastName: patient.patient_last_name,
              date_of_birth:   calculateAgeInMonths(patient.date_of_birth) === 0
              ? ` ${caluclateAgeinDays(patient.date_of_birth)} days `
              : `${calculateAgeInMonths(patient.date_of_birth)} months`,
              caregiverFirstName: patient.caregiver_first_name,
              caregiverLastName: patient.caregiver_last_name
            }));
            setPatientData(patientDetails);
            setSearchResults("");
          } else {
            setSearchResults("No results found.");
            setPatientData([]);
          }
        } catch (error) {
          console.log("Error fetching patient data:", error);
        }
      } else {
        console.log("No QR Code found.");
      }
    };
  };

  // Handle the search operation
  const handleSearch = async () => {
    if (!firstName || !lastName || !dob) {
      toast.error("Please fill in all required fields!");
      return;
    }

    console.log(dob);
    

    try {
      // Create the payload as JSON
      const payload = {
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob.toLocaleDateString('en-CA') // Send the date in 'YYYY-MM-DD' format
      };

      console.table(payload.date_of_birth);

      const response = await fetch(
        "http://localhost:5001/api/get_patient_for_doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          credentials: "include"
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching patient data: ${response.statusText}`);
      }

      const data = await response.json();
      const patients = data.patients || [];
      console.log("Data", data);
      console.log("Patients from the backend:", patients);

      // Filter for matching patients
      // const matchingPatients = patients.filter(
      //   (patient) =>
      //     patient.patient_first_name.toLowerCase() ===
      //       firstName.toLowerCase() &&
      //     patient.patient_last_name.toLowerCase() === lastName.toLowerCase() &&
      //     patient.date_of_birth === dob.toLocaleDateString('en-CA')
      // );

      if (patients.length > 0) {
        const patientDetails = patients.map((patient) => ({
          patientId : patient.patient_id,
          patientFirstName: patient.patient_first_name,
          patientLastName: patient.patient_last_name,
          date_of_birth:
            calculateAgeInMonths(patient.date_of_birth) === 0
              ? ` ${caluclateAgeinDays(patient.date_of_birth)} days `
              : `${calculateAgeInMonths(patient.date_of_birth)} months`,
          caregiverFirstName: patient.caregiver_first_name,
          caregiverLastName: patient.caregiver_last_name
        }));
        setPatientData(patientDetails);
        setSearchResults("");
      } else {
        setSearchResults("No results found.");
        setPatientData([]);
      }
    } catch (error) {
      console.error("Error fetching patient data:", error);
      toast.error("Failed to fetch patient data.");
    } finally {
      setFirstName("");
      setLastName("");
      setDob(null);
    }
  };

  //? Calculate age in days
  const caluclateAgeinDays = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const diffTime = Math.abs(today - birthDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate age in months
  const calculateAgeInMonths = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const yearsDifference = today.getFullYear() - birthDate.getFullYear();
    const monthsDifference = today.getMonth() - birthDate.getMonth();
    const totalMonths = yearsDifference * 12 + monthsDifference;

    if (today.getDate() < birthDate.getDate()) {
      return totalMonths - 1;
    }
    return totalMonths;
  };

  // Handle patient click
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient); // Set selected patient
  };

  const handleBack = () => {
    setSelectedPatient(null);
  };

  // Show the PatientProfile component when a patient is selected
  if (selectedPatient) {
    return (
      <PatientProfile selectedPatient={selectedPatient} onBack={handleBack} pediatricianId={pediatricianId} />
    );
  }

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <input
          type="text"
          placeholder="Patient First Name *"
          className="search-input"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Patient Last Name *"
          className="search-input"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <div className="date-input-container">
          <DatePicker
            selected={dob}
            onChange={(date) => setDob(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Date of Birth *        🗓️"
            className="search-input date-picker"
            maxDate={new Date()}
          />
        </div>
        <button onClick={handleSearch} className="search-button">
          SEARCH
        </button>
      </div>

      <h4 className="or">OR</h4>

      <button
        onClick={() => fileInputRef.current.click()}
        className="upload-button"
      >
        Upload QR
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={(e) => {
          console.log("File uploaded:", e.target.files[0]);
          handleQrScan(e.target.files[0]);
          e.target.value = ""; // Reset the input field after upload
        }}
      />

      <div className="search-results">
        {searchResults && <p>{searchResults}</p>}
        {patientData.length > 0 && (
          <h3 className="search-result-label">Search Results</h3>
        )}

        {patientData.map((patient, index) => (
          <div
            key={index}
            className="patient-info-container"
            onClick={() => handlePatientClick(patient)}
          >
            <div className="patient-info">
              <div className="info-row">
                <div className="info-item">
                  <strong>Patient First Name:</strong>{" "}
                  {patient.patientFirstName}
                </div>
                <div className="info-item">
                  <strong>Caregiver First Name:</strong>{" "}
                  {patient.caregiverFirstName}
                </div>
              </div>

              <div className="info-row">
                <div className="info-item">
                  <strong>Patient Last Name:</strong> {patient.patientLastName}
                </div>
                <div className="info-item">
                  <strong>Caregiver Last Name:</strong>{" "}
                  {patient.caregiverLastName}
                </div>
              </div>

              <div className="info-row">
                <div className="info-item">
                  <strong>Age :</strong>

                  {patient.date_of_birth}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
};

export default SearchToggle;
