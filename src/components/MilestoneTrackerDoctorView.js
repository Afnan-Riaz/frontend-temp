import React, { useState, useEffect } from 'react';

const MilestoneTrackerDoctorView = ({ parentId, childId }) => {
  const [milestones, setMilestones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const fetchMilestones = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5001/api/get_milestone_tracker_doctor_view?parent_id=${parentId}&child_id=${childId}`, {
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
            red_flag_check: milestone['Red Flag Check'] === 'yes',
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
  }, [parentId, childId]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="milestone-tracker">
      <h1>Milestone Tracker</h1>

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
                {milestone.milestone_check ? (
                  <span style={{ color: 'green' }}>&#10003;</span>
                ) : (
                  <span>&#10007;</span>
                )}
              </td>
              <td>{milestone['Red Flag']}</td>
              <td>
                {milestone.red_flag_check ? (
                  <span style={{ color: 'red' }}>&#10003;</span>
                ) : (
                  <span>&#10007;</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MilestoneTrackerDoctorView;
