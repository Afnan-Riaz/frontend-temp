import React, { useState, useEffect } from 'react';

const MilestoneTracker = () => {
  const [milestones, setMilestones] = useState([]);
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
          setSelectedChild(data.user.children[0]?.child_id); // Automatically select the first child
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

    const fetchMilestones = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/get_milestone_tracker?child_id=${selectedChild}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch milestone data');
        }

        const data = await response.json();
        if (data.success) {
          setMilestones(data.data.map(milestone => ({
            ...milestone,
            milestone_check: milestone['Milestone Check'] === 'yes',
            isMilestoneChecked: milestone['Milestone Check'] === 'yes',
            isRedFlagChecked: milestone['Red Flag Check'] === 'yes',
            isDirty: false,
            showMilestoneSaveButton: false, // Separate save button state for milestone
            showRedFlagSaveButton: false,
          })));
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching milestone data:', error);
        alert('Error fetching milestone data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [selectedChild]);

  const handleMilestoneCheckboxChange = (index) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index].milestone_check = !updatedMilestones[index].milestone_check;
    updatedMilestones[index].isDirty = true;
    updatedMilestones[index].showMilestoneSaveButton  = updatedMilestones[index].milestone_check;
    setMilestones(updatedMilestones);
  };

  const handleRedFlagCheckboxChange = (index) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index].red_flag_check = updatedMilestones[index].red_flag_check === 'yes' ? 'no' : 'yes';
    updatedMilestones[index].isDirty = true;
    updatedMilestones[index].showRedFlagSaveButton = updatedMilestones[index].red_flag_check === 'yes';
    setMilestones(updatedMilestones);
  };

  const handleSaveChanges = async (index, type = null) => {
    try {
      const milestone = milestones[index];

      const response = await fetch('http://localhost:5001/api/update_milestone_tracker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          child_id: selectedChild,
          milestones: [{
            milestone: milestone.Milestone,
            milestone_check: type === 'milestone' ? (milestone.milestone_check ? 'yes' : 'no') : milestone.milestone_check ? 'yes' : 'no',
            red_flag: milestone['Red Flag'] || "",
            red_flag_check: type === 'redFlag' ? (milestone.red_flag_check ? 'yes' : 'no') : milestone.red_flag_check ? 'yes' : 'no',
          }],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone data');
      }

      const data = await response.json();
      if (data.success) {
        alert('Milestone data updated successfully');
        const updatedMilestones = [...milestones];
        if (type === 'milestone') {
          updatedMilestones[index].isDirty = false;
          updatedMilestones[index].showMilestoneSaveButton = false;
          updatedMilestones[index].isMilestoneChecked = updatedMilestones[index].milestone_check; // Keep this line
        }
        if (type === 'redFlag') {
          updatedMilestones[index].isDirty = false;
          updatedMilestones[index].showRedFlagSaveButton = false;
          updatedMilestones[index].isRedFlagChecked = updatedMilestones[index].red_flag_check; // Keep this line
        }
        setMilestones(updatedMilestones);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating milestone data:', error);
      alert('Error updating milestone data.');
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="milestone-tracker">
      <h1>Milestone Tracker</h1>
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

      <table>
        <thead>
          <tr>
            <th>Age Range</th>
            <th>When to Complete</th>            
            <th>Milestone</th>
            <th>Check</th>
            <th>Red Flag</th>
            <th>Check</th>            
          </tr>
        </thead>
        <tbody>
          {milestones.map((milestone, index) => (
            <tr key={index}>
              {index === 0 || milestone['Age Range'] !== milestones[index - 1]['Age Range'] ? (
                <td rowSpan={milestones.filter(v => v['Age Range'] === milestone['Age Range']).length}>
                  {milestone['Age Range']}
                </td>
              ) : null}
              {index === 0 || milestone['When to Complete'] !== milestones[index - 1]['When to Complete'] ? (
                <td rowSpan={milestones.filter(v => v['When to Complete'] === milestone['When to Complete']).length}>
                  {milestone['When to Complete']}
                </td>
              ) : null}
              <td>{milestone.Milestone}</td>
              <td>
                {milestone.Milestone && milestone.Milestone !== "" ? (
                  milestone.isMilestoneChecked ? (
                    <span style={{ color: 'green' }}>&#10003;</span>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={milestone.milestone_check}
                        onChange={() => handleMilestoneCheckboxChange(index)}
                      />
                      {milestone.showMilestoneSaveButton && (
                        <button onClick={() => handleSaveChanges(index, 'milestone')}>Save</button>
                      )}
                    </>
                  )
                ) : null}
              </td>
              <td>{milestone['Red Flag']}</td>
              <td>
                {milestone['Red Flag'] && milestone['Red Flag'] !== "" ? (
                  milestone.isRedFlagChecked ? (
                    <span style={{ color: 'red' }}>&#10003;</span>
                  ) : (
                    <>
                      <input
                        type="checkbox"
                        checked={milestone.red_flag_check === 'yes'}
                        onChange={() => handleRedFlagCheckboxChange(index)}
                      />
                      {milestone.showRedFlagSaveButton && (
                        <button onClick={() => handleSaveChanges(index, 'redFlag')}>Save</button>
                      )}
                    </>
                  )
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MilestoneTracker;
