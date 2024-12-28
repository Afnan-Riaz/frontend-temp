import React, { useState, useEffect } from 'react';

const VaccinationTracker = () => {
  const [vaccines, setVaccines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [children, setChildren] = useState([]); // List of distinct children
  const [selectedChild, setSelectedChild] = useState(null); // Track selected child

  useEffect(() => {
    // Fetch profile including distinct children list
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        if (data.success) {
          setChildren(data.user.children); // Set children list
          setSelectedChild(data.user.children[0]?.child_id); // Automatically select first child
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error fetching profile.');
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (!selectedChild) return;

    const fetchVaccines = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/get_vaccine_tracker?child_id=${selectedChild}`, {
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
            isDateActive: false,
            isChecked: vaccine['Whether Taken'] === 'yes',
            isDirty: false,
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
  }, [selectedChild]);

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

  const handleCheckboxChange = (index) => {
    const updatedVaccines = [...vaccines];
    updatedVaccines[index].whether_taken = !updatedVaccines[index].whether_taken;
    updatedVaccines[index].isDateActive = updatedVaccines[index].whether_taken;
    if (!updatedVaccines[index].whether_taken) {
      updatedVaccines[index].date_when_taken = '';
      updatedVaccines[index].isDateActive = false;
    }
    updatedVaccines[index].isDirty = true;
    setVaccines(updatedVaccines);
  };

  const handleDateChange = (index, event) => {
    let dateValue = event.target.value;
  
    // Split the date value and check the year part
    const dateParts = dateValue.split('-');
    if (dateParts.length > 0 && dateParts[0].length > 4) {
      // If the year part has more than 4 digits, limit it to 4 digits
      dateParts[0] = dateParts[0].slice(0, 4);
    }
  
    // Join the date back after modification
    dateValue = dateParts.join('-');

  // Ensure the date is handled in local time (preventing timezone issues)
  const localDate = new Date(dateValue + 'T00:00:00');  // Treat as local midnight
  const formattedLocalDate = localDate.toISOString().split('T')[0];  // Extract only the date portion

    // Update the vaccine's date_when_taken
    const updatedVaccines = [...vaccines];
    updatedVaccines[index].date_when_taken = dateValue;
    updatedVaccines[index].isDirty = true;
    setVaccines(updatedVaccines);
  };  

  const handleSaveChanges = async (index) => {
    try {
      const vaccine = vaccines[index];
      if (vaccine.whether_taken && !vaccine.date_when_taken) {
        alert('Choose Date when taken for selected vaccine.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/update_vaccine_tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          child_id: selectedChild,
          vaccines: [{
            vaccine: vaccine.Vaccine,
            whether_taken: vaccine.whether_taken ? 'yes' : 'no',
            date_when_taken: vaccine.date_when_taken || null,
          }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update vaccination data');
      }

      const data = await response.json();
      if (data.success) {
        alert('Vaccination data updated successfully');
        const updatedVaccines = [...vaccines];
        updatedVaccines[index].isChecked = updatedVaccines[index].whether_taken;
        updatedVaccines[index].isDirty = false;
        updatedVaccines[index].isDateActive = false;
        updatedVaccines[index].date_when_taken = formatDate(updatedVaccines[index].date_when_taken);
        setVaccines(updatedVaccines);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating vaccination data:', error);
      alert('Error updating vaccination data.');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="vaccination-tracker">
      <h1>Vaccination Tracker</h1>
      <div className="form-group centered-dropdown">
        <label htmlFor="childSelect">Select Child: </label>
        <select id="childSelect" value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
          {children.map((child) => (
            <option key={child.child_id} value={child.child_id}>
              {child.child_first_name} {child.child_last_name}
            </option>
          ))}
        </select>
      </div>
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
                  {/* {vaccine['Age Range'] === '0-0 Months' ? 'At Birth' : vaccine['Age Range']} */}
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
                {!vaccine.isChecked && (
                  <input
                    type="checkbox"
                    checked={vaccine.whether_taken}
                    onChange={() => handleCheckboxChange(index)}
                  />
                )}
                {vaccine.isChecked && <span style={{ color: 'green' }}>&#10003;</span>}
              </td>
              <td>
                {vaccine.isChecked ? (
                  <span>{vaccine.date_when_taken}</span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      className="date-input"
                      type="date"
                      value={vaccine.date_when_taken || ''}
                      onChange={(event) => handleDateChange(index, event)}
                      max={new Date().toISOString().split('T')[0]}  // This disables future dates
                      disabled={!vaccine.isDateActive} // Disable date input if isDateActive is false
                    />
                    {vaccine.isDirty && (
                      <button className="save-button" onClick={() => handleSaveChanges(index)}>Save Changes</button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VaccinationTracker;