// Add Visit Record form (this form is from PatientProfile.jsx)

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AddVisitRecordForm.css";
import { toast } from "react-toastify";

const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const AddVisitForm = ({ onClose, pediatricianId, patientId }) => {
  const [formData, setFormData] = useState({
    visitDate: getFormattedDateTime(),
    patientAge: "",
    reasonForVisit: "",
    notes: null,
    diagnoses: null,
    prescribedMedications: null,
    recommendedTests: null,
    weight: "",
    height: "",
    headCircumference: null,
    temperature :null,
    heartRate: null ,
    respiratoryRate: null,
    bloodPressure:null,
    developmentalMilestone: null,
    feedingNutritionNotes: null,
    uploadDocuments:null,
    followUpDate: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // If the input is a file input, we handle files instead of text values
    if (name === "uploadDocuments" && files) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files // Store files in the state
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prevState) => ({
      ...prevState,
      followUpDate: date.toLocaleDateString("en-CA") // Format as "YYYY-MM-DD",
    }));
  };

  const getFormattedDate = (date) => {
    const visitDate = new Date(date);
    const formattedVisitDate = visitDate.toISOString(); // 'YYYY-MM-DDTHH:mm:ss.sssZ'
    const formattedForBackend = formattedVisitDate.replace('T', ' ').slice(0, 19) + '+0000'
    return formattedForBackend;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    const payload = {};

    if (patientId) payload.patient_id = patientId;
    if (pediatricianId) payload.doctor_id = pediatricianId;
    if (formData.visitDate) payload.visit_date_time = getFormattedDate(formData.visitDate.toLocaleString("en-CA"));
    if (formData.reasonForVisit) payload.reason_for_visit = formData.reasonForVisit;
    if (formData.weight) payload.weight_kg = formData.weight;
    if (formData.height) payload.height_cm = formData.height;
    if (formData.patientAge) payload.patient_age_in_months = formData.patientAge;

    // Add other optional fields similarly
    if (formData.notes) payload.notes = formData.notes;
    if (formData.prescribedMedications) payload.prescribed_medications = formData.prescribedMedications;
    if (formData.temperature) payload.temperature_c = Number(formData.temperature);
    if (formData.heartRate) payload.heart_rate_bpm = formData.heartRate;
    if (formData.respiratoryRate) payload.respiratory_rate_bpm = formData.respiratoryRate;
    if (formData.bloodPressure) payload.blood_pressure = formData.bloodPressure;
    if (formData.developmentalMilestone) payload.developmental_milestones = formData.developmentalMilestone;
    if (formData.feedingNutritionNotes) payload.feeding_nutrition_notes = formData.feedingNutritionNotes;
    if (formData.uploadDocuments) payload.upload_documents = formData.uploadDocuments;
    if (formData.followUpDate) payload.follow_up_date = formData.followUpDate;      




    try {
      const response = await fetch(
        "http://localhost:5001/api/add_visit_record_by_doctor",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify(payload)
        }
      );
      const result = await response.json();
      console.log(result);

      if (response.ok) {
        toast.success("Patient added successfully!");
      }
    } catch (error) {
      console.log("Error adding visit record:", error);
    }

    onClose(); // Close the popup after form submission
  };

  return (
    <div className="overlay">
      <div className="form-container">
        <div className="form-header">
          <h2>Add Visit Record</h2>
          <button id="close-button" onClick={onClose}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Visit Date and Time *</label>
          <input
            type="datetime-local"
            name="visitDate"
            value={formData.visitDate}
            className="datetime-input"
            required
          />

          <label>Patient Age (in Months) *</label>
          <input
            type="number"
            name="patientAge"
            onChange={handleChange}
            value={formData.patientAge}
            required
            min="1"
          />

          <label>Reason for Visit *</label>
          <input
            type="text"
            name="reasonForVisit"
            onChange={handleChange}
            value={formData.reasonForVisit}
            required
          />

          <label>Notes </label>
          <input
            type="text"
            name="notes"
            onChange={handleChange}
            value={formData.notes}
           />

          <label>Diagnoses</label>
          <input
            type="text"
            name="diagnoses"
            onChange={handleChange}
            value={formData.diagnoses}
          />

          <label>Prescribed Medications</label>
          <input
            type="text"
            name="prescribedMedications"
            onChange={handleChange}
            value={formData.prescribedMedications}
          />

          <label>Recommended Tests</label>
          <input
            type="text"
            name="recommendedTests"
            onChange={handleChange}
            value={formData.recommendedTests}
          />

          <label>Weight (kg) *</label>
          <input
            type="number"
            name="weight"
            onChange={handleChange}
            value={formData.weight}
            required
            step="0.1"
            min="0"
          />

          <label>Height (cm) *</label>
          <input
            type="number"
            name="height"
            onChange={handleChange}
            value={formData.height}
            required
            min="1"
          />

          <label>Head Circumference (cm)</label>
          <input
            type="number"
            name="headCircumference"
            onChange={handleChange}
            value={formData.headCircumference}
          />

          <label>Temperature (°C)</label>
          <input
            type="number"
            name="temperature"
            onChange={handleChange}
            value={formData.temperature}
            step="0.1"
          />

          <label>Heart Rate (bpm)</label>
          <input
            type="number"
            name="heartRate"
            onChange={handleChange}
            value={formData.heartRate}
          />

          <label>Respiratory Rate (breaths per minute)</label>
          <input
            type="number"
            name="respiratoryRate"
            onChange={handleChange}
            value={formData.respiratoryRate}
          />

          <label>Blood Pressure</label>
          <input
            type="number"
            name="bloodPressure"
            onChange={handleChange}
            value={formData.bloodPressure}
          />

          <label>Developmental Milestones</label>
          <input
            type="text"
            name="developmentalMilestone"
            onChange={handleChange}
            value={formData.developmentalMilestone}
          />

          <label>Feeding & Nutrition Notes</label>
          <input
            type="text"
            name="feedingNutritionNotes"
            onChange={handleChange}
            value={formData.feedingNutritionNotes}
          />

          <label>Upload Documents</label>
          <input
            type="file"
            name="uploadDocuments"
            onChange={handleChange}
            value={formData.uploadDocuments}
          />

          <label>Follow-up Date</label>

          <DatePicker
            selected={formData.followUpDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="datepicker-input"
            placeholderText="Select a date"
          />

          <div className="form-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVisitForm;
