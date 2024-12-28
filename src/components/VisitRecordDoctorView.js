import React, { useState, useEffect } from 'react';

const VisitRecordDoctorView = ({ parentId, childId }) => {
  const [visitRecords, setVisitRecords] = useState([]);

  // Fetch visit records for the provided child_id on component mount
  useEffect(() => {
    if (!childId) return;

    const fetchVisitRecords = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/get_visit_records_doctor_view?parent_id=${parentId}&child_id=${childId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to fetch visit records');

        const data = await response.json();
        if (data.success) setVisitRecords(data.records);
      } catch (error) {
        console.error('Error fetching visit records:', error);
        alert('Error fetching visit records.');
      }
    };

    fetchVisitRecords();
  }, [childId, parentId]);

  return (
    <div className="visit-record-container">
      <h1>Past Visit Records</h1>
      
      {/* Display Visit Records */}
      <div className="visit-records-table">
        {visitRecords.length === 0 ? (
          <p>No visit records available for this child.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date of Visit</th>
                <th>Auto-generated Notes</th>
                <th>Additional Notes</th>
                <th>Prescription Report</th>
              </tr>
            </thead>
            <tbody>
              {visitRecords.map((record, index) => (
                <tr key={index}>
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

export default VisitRecordDoctorView;
