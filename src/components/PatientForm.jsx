// Patient Management System Page (1st Page)

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./PatientForm.css";
import SearchToggle from "./SearchToggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowDown } from "@fortawesome/free-solid-svg-icons";


const PatientForm = ({ pediatricianId }) => {
  // To check the pediatrician id being passed, we can alert it as below
  useEffect(() => {
    if (pediatricianId) {
      alert(`Pediatrician ID: ${pediatricianId}`); // This will now work
    }
  }, [pediatricianId]);

  const [activeTab, setActiveTab] = useState("addPatient");
  const [formData, setFormData] = useState({
    caregiverFirstName: "",
    caregiverLastName: "",
    relationship: "",
    phoneNumber: "",
    email: "",
    address: "",
    patientFirstName: "",
    patientMiddleName: "",
    patientLastName: "",
    dateOfBirth: null,
    gender: "",
    birthWeight: "",
    birthLength: "",
    birthHeadCircumference: "",
    gestationalAge: "",
    birthMedicalHistory: "",
    currentAge: "",
    currentWeight: "",
    currentHeight: "",
    currentHeadCircumference: "",
    currentMedicalConditions: "",
  });
  const [qrCode, setQrCode] = useState(""); // Store generated QR Code
  const [isQrModalVisible, setQrModalVisible] = useState(false); // Show/hide QR modal

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Reset the QR code when switching to "Search Patient"
    if (tab === "searchPatient") {
      setQrCode("");
      setQrModalVisible(false); // Close modal if open
    }
  };

  // Function to validate email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log("Form submitted with data:", formData);
    // Check if all required fields are filled
    const requiredFields = [
      "caregiverFirstName",
      "caregiverLastName",
      "relationship",
      "patientFirstName",
      "patientLastName",
      "dateOfBirth",
      "gender",
      "birthWeight",
      "birthLength",
      "gestationalAge",
      "currentAge",
      "currentWeight",
      "currentHeight",
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        toast.error("All mandatory fields must be filled!");
        return;
      }
    }

    // Validate the email
    if (formData.email && !validateEmail(formData.email)) {
      toast.error("Please enter a valid email address with '@' and '.'");
      return;
    }

    console.log("dateOfBirth before conversion:", formData.dateOfBirth);
    const payload = {
      pediatricianId,
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? formData.dateOfBirth.toLocaleDateString('en-CA')// Format as "YYYY-MM-DD"
        : null,
    };
    console.log("Payload:", payload);
    try {
      const response = await fetch(
        "http://localhost:5001/api/add_patient_by_doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      console.log(result);
      
      if (response.ok) {
        toast.success("Patient added successfully!");
        const qrCodeBase64 = result.qr_code;
        setQrCode(`data:image/png;base64,${qrCodeBase64}`);
        setQrModalVisible(true);

        // Reset form data to empty values
        setFormData({
          caregiverFirstName: "",
          caregiverLastName: "",
          relationship: "",
          phoneNumber: "",
          email: "",
          address: "",
          patientFirstName: "",
          patientMiddleName: "",
          patientLastName: "",
          dateOfBirth: "",
          gender: "",
          birthWeight: "",
          birthLength: "",
          birthHeadCircumference: "",
          gestationalAge: "",
          birthMedicalHistory: "",
          currentAge: "",
          currentWeight: "",
          currentHeight: "",
          currentHeadCircumference: "",
          currentMedicalConditions: "",
        });
      } else {
        toast.error(
          result.message || "An error occurred while adding the patient."
        );
      }
    } catch (error) {
      console.error("Error adding patient:", error);
      toast.error("Failed to add patient. Please try again later.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Ensure correct formatting for numeric fields
    if (name === "phoneNumber") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value.replace(/\D/g, ""), // Allow only numbers
      }));
    } else if (
      name === "birthWeight" ||
      name === "birthLength" ||
      name === "birthHeadCircumference" ||
      name === "currentWeight" ||
      name === "currentHeight" ||
      name === "currentHeadCircumference"
    ) {
      // Allow only decimal values for weight, length, and head circumference
      setFormData((prevData) => ({
        ...prevData,
        [name]: value.replace(/[^0-9.]/g, ""), // Allow only numbers and decimal points
      }));
    } else if (name === "gestationalAge" || name === "currentAge") {
      // Allow only integers for gestational and current age
      setFormData((prevData) => ({
        ...prevData,
        [name]: value.replace(/[^0-9]/g, ""), // Allow only numbers
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const closeQrModal = () => {
    setQrModalVisible(false);
  };

  // Handle date change for Date Picker
  const handleDateChange = (date) => {
    setFormData((prevData) => ({
      ...prevData,
      dateOfBirth: date,
    }));
  };

  return (
    <div className="patient-profile">
      {/* Tab Section */}

      <div className="tabs">
        <div
          className={`tab ${activeTab === "addPatient" ? "active" : ""}`}
          onClick={() => handleTabClick("addPatient")}
        >
          ADD PATIENT
        </div>
        <div
          className={`tab ${activeTab === "searchPatient" ? "active" : ""}`}
          onClick={() => handleTabClick("searchPatient")}
        >
          SEARCH PATIENT
        </div>
      </div>

      {/* Add Patient Section */}
      {activeTab === "addPatient" && (
        <form className="add-patient-form" onSubmit={handleSubmit}>
          <h2>Patient Management System</h2>

          {/* Caregiver Information */}
          <div className="form-group">
            <input
              required
              type="text"
              name="caregiverFirstName"
              placeholder="Caregiver First Name *"
              value={formData.caregiverFirstName}
              onChange={handleInputChange}
            />
            <input
              required
              type="text"
              name="caregiverLastName"
              placeholder="Caregiver Last Name *"
              value={formData.caregiverLastName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input
              required
              type="text"
              name="relationship"
              placeholder="Relationship * (e.g., Mother, 
Father)"
              value={formData.relationship}
              onChange={handleInputChange}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          {/* Patient Information */}
          <div className="form-group">
            <input
              required
              type="text"
              name="patientFirstName"
              placeholder="Patient First Name *"
              value={formData.patientFirstName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="patientMiddleName"
              placeholder="Patient Middle Name"
              value={formData.patientMiddleName}
              onChange={handleInputChange}
            />
            <input
              required
              type="text"
              name="patientLastName"
              placeholder="Patient Last Name *"
              value={formData.patientLastName}
              onChange={handleInputChange}
            />
          </div>

          {/* Birth Information */}
          <div className="form-group">
            <DatePicker
              required
              selected={formData.dateOfBirth}
              onChange={handleDateChange}
              placeholderText="Date of Birth *                                          🗓️"
              dateFormat="dd-MM-yyyy"
              className="date-picker-input"
            />
            <select
              required
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Gender *
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Birth Stats */}
          <div className="form-group">
            <input
              required
              type="text"
              name="birthWeight"
              placeholder="Birth Weight in kg* (e.g., 
3.50)"
              value={formData.birthWeight}
              onChange={handleInputChange}
            />
            <input
              required
              type="text"
              name="birthLength"
              placeholder="Birth Length in cm* (e.g., 50.00)"
              value={formData.birthLength}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="birthHeadCircumference"
              placeholder="Birth Head Circumference in 
cm"
              value={formData.birthHeadCircumference}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input
              required
              type="text"
              name="gestationalAge"
              placeholder="Gestational Age in weeks* (e.g., 38 weeks)"
              value={formData.gestationalAge}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="birthMedicalHistory"
              placeholder="Birth Medical History"
              value={formData.birthMedicalHistory}
              onChange={handleInputChange}
            />
          </div>

          {/* Current Information */}
          <div className="form-group">
            <input
              required
              type="text"
              name="currentAge"
              placeholder="Current Age in Months*"
              value={formData.currentAge}
              onChange={handleInputChange}
            />
            <input
              required
              type="text"
              name="currentWeight"
              placeholder="Current Weight in kg* (e.g., 
3.50)"
              value={formData.currentWeight}
              onChange={handleInputChange}
            />
            <input
              required
              type="text"
              name="currentHeight"
              placeholder="Current Length in cm* (e.g., 50.00)"
              value={formData.currentHeight}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="currentHeadCircumference"
              placeholder="Current Head Circumference in 
cm"
              value={formData.currentHeadCircumference}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group full-width">
            <input
              type="text"
              name="currentMedicalConditions"
              placeholder="Current Medical Conditions"
              value={formData.currentMedicalConditions}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="submit-btn">
            Submit
          </button>
        </form>
      )}
      {/* Search Patient Section */}
      {activeTab === "searchPatient" && <SearchToggle pediatricianId={pediatricianId} />}
      {/* QR Code Modal */}
      {isQrModalVisible && (
        <div className="qr-modal">
          <div className="qr-modal-content">
            <button className="close-btn" onClick={closeQrModal}>
              ×
            </button>
            <button id="download-qr">
              <a href={qrCode} download={qrCode.length > 30  ? qrCode.substring(25, 30) : qrCode}>
              <FontAwesomeIcon icon={faCloudArrowDown} width={50} height={50} size="2x" />
              </a>
            </button>
            <h3>QR Code</h3>
            <img src={qrCode} width={256} height={256} alt={"qr-code"} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;
