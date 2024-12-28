import React, { useState, useEffect } from 'react';

const VaccinationTrackerDoctorView = ({ parentId, childId }) => {
  const [vaccines, setVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVaccines = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/get_vaccine_tracker_doctor_view?parent_id=${parentId}&child_id=${childId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vaccination data');
        }

        const data = await response.json();
        if (data.success) {
          setVaccines(data.data.map(vaccine => ({
            ...vaccine,
            whether_taken: vaccine['Whether Taken'] === 'yes',
            date_when_taken: vaccine['Date When Taken'] ? formatDate(vaccine['Date When Taken']) : '',
          })));
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching vaccination data:', error);
        alert('Error fetching vaccination data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVaccines();
  }, [childId]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Helper function to format "When to Take"
  const formatWhenToTake = (whenToTake, ageRange) => {
    if (ageRange === '0-0 Months') {
      return formatDate(whenToTake.split(' To ')[0]); // Display only start date for "0-0 Months"
    }

    if (whenToTake.includes('To')) {
      const [startDate, endDate] = whenToTake.split(' To ');
      return startDate === endDate
        ? formatDate(startDate) // Only display one date if they are the same
        : `${formatDate(startDate)} To ${formatDate(endDate)}`; // Display both dates if they differ
    } else {
      return formatDate(whenToTake);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="vaccination-tracker">
      <h1>Vaccination Tracker</h1>
      <div className="legends">
          <p>
            *Only in endemic areas <br/>
            **Penta = DPT+HiB+HepatitisB <br/>
            ***IAP Recommended (Indian Academy of Pediatricians)
          </p>
        </div>
      <table>
        <thead>
          <tr>
            <th>Age Range</th>
            <th>When to Take</th>
            <th>Vaccine</th>
            <th>Whether Taken?</th>
            <th>Date When Taken</th>
          </tr>
        </thead>
        <tbody>
          {vaccines.map((vaccine, index) => (
            <tr key={index}>
              {index === 0 || vaccine['Age Range'] !== vaccines[index - 1]['Age Range'] ? (
                <td rowSpan={vaccines.filter(v => v['Age Range'] === vaccine['Age Range']).length}>
                  {vaccine['Age Range']}
                </td>
              ) : null}
              {index === 0 || vaccine['When to Take'] !== vaccines[index - 1]['When to Take'] ? (
                <td rowSpan={vaccines.filter(v => v['When to Take'] === vaccine['When to Take']).length}>
                  {formatWhenToTake(vaccine['When to Take'], vaccine['Age Range'])}
                </td>
              ) : null}
              <td>{vaccine.Vaccine}</td>
              <td>
                {vaccine.whether_taken ? (
                  <span style={{ color: 'green' }}>&#10003;</span>
                ) : (
                  <span style={{ color: 'red' }}>✗</span>
                )}
              </td>
              <td>
                {vaccine.date_when_taken ? (
                  <span>{vaccine.date_when_taken}</span>
                ) : (
                  <span>Not Taken</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VaccinationTrackerDoctorView;
