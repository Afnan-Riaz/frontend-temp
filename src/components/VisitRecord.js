import React, { useState, useEffect } from 'react';

const VisitRecord = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [savedAppointmentDate, setSavedAppointmentDate] = useState('');
  const [visitRecords, setVisitRecords] = useState([]);
  const [visitDetails, setVisitDetails] = useState({
    dateOfVisit: '',
    prescriptionReport: null,
    autoGeneratedNotes: '',
    additionalNotes: '',
  });
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the parent profile and get children list
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch profile data');

        const data = await response.json();
        if (data.success && data.user.children.length > 0) {
          setChildren(data.user.children);
          setSelectedChild(data.user.children[0]?.child_id); // Select the first child by default
        } else {
          setChildren([]);
          setSelectedChild(null);
          alert(data.message || 'No children found.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error fetching profile.');
      }
    };

    fetchProfile();
  }, []);

  // Fetch visit records for the selected child
  useEffect(() => {
    if (!selectedChild) return;

    const fetchVisitRecords = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/get_visit_records?child_id=${selectedChild}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch visit records');

        const data = await response.json();
        if (data.success) {
          setVisitRecords(data.records || []);
          if (data.records.length > 0) {
            const date = data.records[0]?.appointment_date || '';
            setAppointmentDate(date);
            setSavedAppointmentDate(date);
          } else {
            setAppointmentDate('');
            setSavedAppointmentDate('');
          }
        } else {
          setAppointmentDate('');
          setSavedAppointmentDate('');
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching visit records:', error);
        alert('Error fetching visit records.');
      }
    };

    fetchVisitRecords();
  }, [selectedChild]);

  const handleAppointmentSave = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/save_appointment_date', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_id: selectedChild,
          appointment_date: appointmentDate,
        }),
      });

      if (!response.ok) throw new Error('Failed to save appointment date');

      const data = await response.json();
      if (data.success) {
        alert('Appointment date saved successfully');
        setSavedAppointmentDate(appointmentDate);
        setIsEditingAppointment(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving appointment date:', error);
      alert('Error saving appointment date.');
    }
  };

  const handleVisitSave = async () => {
    if (!savedAppointmentDate) {
      alert('Please save an appointment date before adding a visit record.');
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('child_id', selectedChild);
      formData.append('appointment_date', appointmentDate);
      formData.append('date_of_visit', visitDetails.dateOfVisit);
      formData.append('prescription_report', visitDetails.prescriptionReport);
      formData.append('auto_generated_notes', '');
      formData.append('additional_notes', visitDetails.additionalNotes);

      const response = await fetch('http://localhost:5001/api/save_visit_record', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save visit record');

      const data = await response.json();
      if (data.success) {
        alert('Visit record saved successfully');
        setVisitRecords([...visitRecords, data.record]);
        // Clear fields after save
        setVisitDetails({ dateOfVisit: '', prescriptionReport: null, autoGeneratedNotes: '', additionalNotes: '' });
        setAppointmentDate('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving visit record:', error);
      alert('Error saving visit record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="visit-record-container">
      <h1>Visit Record</h1>
  
      {/* Child Selection Dropdown */}
      <div className="form-group centered-dropdown">
        <label htmlFor="childSelect">Select Child: </label>
        <select
          id="childSelect"
          value={selectedChild}
          onChange={(e) => setSelectedChild(e.target.value)}
          className="dropdown-select"
        >
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.child_first_name} {child.child_last_name}
            </option>
          ))}
        </select>
      </div>
  
      {/* Upcoming Appointment Section */}
      <div className="appointment-section">
        <h2>Upcoming Appointment</h2>
        {isEditingAppointment ? (
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="date-input"
          />
        ) : (
          <span>{savedAppointmentDate || 'No date selected'}</span>
        )}
        {isEditingAppointment ? (
          <button onClick={handleAppointmentSave} className="btn-primary">Save</button>
        ) : (
          <button onClick={() => setIsEditingAppointment(true)} className="btn-primary">Edit</button>
        )}
      </div>
  
      {/* Visit Details Form */}
      <div className="visit-details">
        <h2>Visit Details</h2>
        <label>
          Date of Visit:
          <input
            type="date"
            value={visitDetails.dateOfVisit}
            onChange={(e) =>
              setVisitDetails({ ...visitDetails, dateOfVisit: e.target.value })
            }
            className="form-input"
          />
        </label>
        <label>
          Prescriptions/Reports:
          <input
            type="file"
            onChange={(e) =>
              setVisitDetails({ ...visitDetails, prescriptionReport: e.target.files[0] })
            }
            className="file-input"
          />
        </label>
        <label>
          Additional Notes:
          <textarea
            value={visitDetails.additionalNotes}
            onChange={(e) =>
              setVisitDetails({ ...visitDetails, additionalNotes: e.target.value })
            }
            className="form-textarea"
          />
        </label>
        <div className="button-container">
          <button onClick={handleVisitSave} disabled={isSaving} className="btn-primary">
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
  
      {/* Display Visit Records */}
      <div className="visit-records-table">
        <h2>Past Visit Records</h2>
        {visitRecords.length === 0 ? (
          <p>No visit records available for this child.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Appointment Date</th>
                <th>Date of Visit</th>
                <th>Auto-generated Notes</th>
                <th>Additional Notes</th>
                <th>Prescription Report</th>
              </tr>
            </thead>
            <tbody>
              {visitRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.appointment_date}</td>
                  <td>{record.date_of_visit}</td>
                  <td>{record.auto_generated_notes}</td>
                  <td>{record.additional_notes}</td>
                  <td>
                    {record.prescription_report ? (
                      <a href={record.prescription_report} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );    
};

export default VisitRecord;
