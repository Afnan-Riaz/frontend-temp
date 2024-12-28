import React, { useState, useEffect } from 'react';
const logo = process.env.PUBLIC_URL + '/images/logo.png';

const ParentProfile = ({ currentUser, setCurrentUser, handleUpdateProfile }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [formData, setFormData] = useState({
    phoneNumber: currentUser.parent_phone_number || '',
    email: currentUser.parent_email || '',
    firstName: '',
    lastName: '',
    relationship: currentUser.relationship || '',
    address: currentUser.address || '',
    childFirstName: currentUser.child_first_name || '',
    childLastName: currentUser.child_last_name || '',
    childGender: currentUser.child_gender || '',
    childDob: currentUser.child_dob ? currentUser.child_dob.split('T')[0] : '',
    childBirthWeight: currentUser.child_birth_weight || '',
    childBirthHeight: currentUser.child_birth_height || '',
    childGestationalAge: currentUser.child_gestational_age || '',
    childMedicalHistory: currentUser.child_medical_history || '',
    age: '', // For age dropdown
    childWeight: currentUser.child_weight || '',
    childHeight: currentUser.child_height || '',
    childHeadCircumference: currentUser.child_head_circumference || '',
    additionalNotes: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [showChildProfilePopup, setShowChildProfilePopup] = useState(false); // New state for child profile pop-up
  const [newChildProfile, setNewChildProfile] = useState({ // State for new child profile
    childFirstName: '',
    childLastName: '',
    childDob: '',
    childGender: '',
    childGestationalAge: '',
    childMedicalHistory: '',
    childAge: '',
    childWeight: '',
    childHeight: '',
    childHeadCircumference: '',
    childBirthWeight: '',
    childBirthHeight: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (currentUser && selectedChild !== null && currentUser.children && currentUser.children.length > 0) {
      const childData = currentUser.children[selectedChild];
      if (childData) {
      // Get the most recent growth history entry (assuming it's sorted)
      const latestGrowth = childData.growth_history && childData.growth_history.length > 0
        ? childData.growth_history[0] // Most recent growth entry
        : {};
        setFormData({
          phoneNumber: currentUser.parent_phone_number || '',
          email: currentUser.parent_email || '',
          firstName: currentUser.parent_first_name || '',
          lastName: currentUser.parent_last_name || '',
          relationship: currentUser.relationship || '',
          address: currentUser.address || '',
          childFirstName: childData.child_first_name || '',
          childLastName: childData.child_last_name || '',
          childGender: childData.child_gender || '',
          childDob: childData.child_dob ? childData.child_dob.split('T')[0] : '',
          childBirthWeight: childData.child_birth_weight || '',
          childBirthHeight: childData.child_birth_height || '',
          childGestationalAge: childData.child_gestational_age || '',
          childMedicalHistory: childData.child_medical_history || '',
          age: latestGrowth.child_age || '',
          childWeight: latestGrowth.child_weight || '',
          childHeight: latestGrowth.child_height || '',
          childHeadCircumference: latestGrowth.child_head_circumference || '',
          additionalNotes: latestGrowth.additional_notes || '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
    } else {
      setFormData({
          phoneNumber: currentUser?.parent_phone_number || '',
          email: currentUser?.parent_email || '',
          firstName: currentUser?.parent_first_name || '',
          lastName: currentUser?.parent_last_name || '',
          relationship: currentUser?.relationship || '',
          address: currentUser?.address || '',
          childFirstName: '',
          childLastName: '',
          childGender: '',
          childDob: '',
          childBirthWeight: '', // New field
          childBirthHeight: '', // New field
          childGestationalAge: '', // New field
          childMedicalHistory: '', // New field
          age: '',
          childWeight: '',
          childHeight: '',
          childHeadCircumference: '',
          additionalNotes: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      }
  }, [currentUser, selectedChild]);  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'childDob') {
      const dateParts = value.split('-');
      if (dateParts[0].length > 4) {
        dateParts[0] = dateParts[0].slice(0, 4);
      }
      setFormData({ ...formData, [name]: dateParts.join('-') });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setSuccessMessage(''); // Clear success message on form change
  };

  const handleChildChange = (e) => {
    const index = parseInt(e.target.value, 10);
    setSelectedChild(index >= 0 && index < (currentUser.children || []).length ? index : null);
  };  

  const handleChildProfileChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'childDob') {
      // Limit year input to 4 digits
      const dateParts = value.split('-');
      if (dateParts[0].length > 4) {
        dateParts[0] = dateParts[0].slice(0, 4);
      }
  
      // Prevent selecting future dates
      const currentDate = new Date().toISOString().split('T')[0];
      // if (value > currentDate) {
      //   setError('Date of birth cannot be in the future.');
      //   return;
      // }
  
      setNewChildProfile({ ...newChildProfile, [name]: dateParts.join('-') });
    } else {
      setNewChildProfile({ ...newChildProfile, [name]: value });
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSuccessMessage(''); // Clear success message on mode toggle
  };

  const toggleChangePasswordMode = () => {
    setChangePasswordMode(!changePasswordMode);
    setFormData({
      ...formData,
      newPassword: '',
      confirmNewPassword: ''
    });
    setSuccessMessage(''); // Clear success message on password mode toggle
  };

  const toggleChildProfilePopup = () => { // Toggle the child profile pop-up
    setShowChildProfilePopup(!showChildProfilePopup);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (changePasswordMode) {
        // Ensure both password fields are filled
        if (!formData.newPassword || !formData.confirmNewPassword) {
            setError('Both password fields are required.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Check if passwords match
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('Passwords do not match.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Enforce password policy
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError('Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.');
            setTimeout(() => setError(''), 5000);
            return;
        }
    } else {
        // Ensure childFirstName and childLastName are filled
        if (!formData.childFirstName || !formData.childLastName) {
            setError('Child\'s first name and last name are required.');
            setTimeout(() => setError(''), 3000);
            return;
        }

        // Ensure childDob and childGender are filled if missing
        if ((!formData.childDob || !formData.childGender) &&
            (!currentUser.child_dob || !currentUser.child_gender)) {
            setError('Child\'s date of birth and gender are required.');
            setTimeout(() => setError(''), 3000);
            return;
        }
    }

    const isFormEdited =
        formData.firstName !== currentUser.parent_first_name ||
        formData.lastName !== currentUser.parent_last_name ||
        (selectedChild !== null && currentUser.children[selectedChild] && (
            formData.childFirstName !== currentUser.children[selectedChild].child_first_name ||
            formData.childLastName !== currentUser.children[selectedChild].child_last_name ||
            formData.childGender !== currentUser.children[selectedChild].child_gender ||
            formData.childDob !== currentUser.children[selectedChild].child_dob ||
            formData.childBirthWeight !== currentUser.children[selectedChild].child_birth_weight ||
            formData.childBirthHeight !== currentUser.children[selectedChild].child_birth_height ||
            formData.childGestationalAge !== currentUser.children[selectedChild].child_gestational_age ||
            formData.childMedicalHistory !== currentUser.children[selectedChild].child_medical_history ||
            formData.age !== currentUser.children[selectedChild].child_age ||
            formData.childWeight !== currentUser.children[selectedChild].child_weight ||
            formData.childHeight !== currentUser.children[selectedChild].child_height ||
            formData.childHeadCircumference !== currentUser.children[selectedChild].child_head_circumference ||
            formData.additionalNotes !== currentUser.children[selectedChild].additional_notes
        ));

    if (isFormEdited || (changePasswordMode && formData.newPassword)) {
        try {
            const response = await handleUpdateProfile(formData);
            if (response && response.success) {
                setSuccessMessage(changePasswordMode ? 'Password updated successfully!' : 'Profile updated successfully!');
                setCurrentUser(response.user);

                setTimeout(() => {
                    setSuccessMessage('');
                    setError('');
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setEditMode(false);
            setChangePasswordMode(false);
        }
    } else {
        setError(changePasswordMode ? 'Passwords do not match.' : 'No changes made.');
        setTimeout(() => setError(''), 3000);
    }
};

  const handleChildProfileSubmit = async (e) => {
    e.preventDefault();
  
    // Validation
    if (!newChildProfile.childFirstName || !newChildProfile.childLastName || !newChildProfile.childGender || !newChildProfile.childDob || !newChildProfile.childBirthWeight || !newChildProfile.childBirthHeight || !newChildProfile.childGestationalAge) {
      setError('All fields are required.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/add_child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies) in the request
        body: JSON.stringify({
          childFirstName: newChildProfile.childFirstName,
          childLastName: newChildProfile.childLastName,
          childDob: newChildProfile.childDob,
          childBirthWeight: newChildProfile.childBirthWeight,
          childBirthHeight: newChildProfile.childBirthHeight,
          childGestationalAge: newChildProfile.childGestationalAge,
          childMedicalHistory: newChildProfile.childMedicalHistory,
          childAge: newChildProfile.childAge,
          childGender: newChildProfile.childGender,
          childWeight: newChildProfile.childWeight,
          childHeight: newChildProfile.childHeight,
          childHeadCircumference: newChildProfile.childHeadCircumference,
          additionalNotes: newChildProfile.additionalNotes,
        }),
      });
  
      const result = await response.json();
      
      if (result.success) {
        // Re-fetch the current user's profile to include the new child
        const profileResponse = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });
        const updatedData = await profileResponse.json();
        console.log('', updatedData);
        if (profileResponse.ok) {
          setCurrentUser(updatedData.user);  // Update the currentUser state with the new child data
          // Optionally, set the newly added child as the selected child
          setSelectedChild(updatedData.user.children.length - 1); 
        }
        alert('Child profile added successfully!'); // Display alert on success
      } else {
        alert('Failed to add child profile.');
      }
    } catch (error) {
      console.error('Error adding child profile:', error);
    } finally {
      toggleChildProfilePopup();
      // Clear form fields after submission
      setNewChildProfile({
        childFirstName: '',
        childLastName: '',
        childDob: '',
        childBirthWeight: '',
        childBirthHeight: '',
        childGestationalAge: '',
        childMedicalHistory: '',
        childAge: '',
        childGender: '',
        childWeight: '',
        childHeight: '',
        childHeadCircumference: '',
        additionalNotes: ''
      });
    }
  };
  
  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div className="user-profile card">
      <div className="center">
        <img src={logo} alt="Logo" className="logo" />
        <h2>Your Profile</h2>
      </div>
      {successMessage && (
        <p className="success-message">{successMessage}</p>
      )}
      {error && (
        <p className="error-message">{error}</p>
      )}
      <br/>
      <form onSubmit={handleSubmit} className="centered-form">
        <div className="form-group-grid">
          <div className="form-group">
            <label>
              <span className="bold-label">Phone Number: </span>{currentUser.parent_phone_number}
            </label>
          </div>
          <div className="form-group">
            <label>
              <span className="bold-label">Email: </span>{currentUser.parent_email}
            </label>
          </div>
          <div className="form-group">
            <label>
              <span className="bold-label">Parent First Name: </span>{currentUser.parent_first_name}
            </label>
          </div>
          <div className="form-group">
            <label>
              <span className="bold-label">Parent Last Name: </span>{currentUser.parent_last_name}
            </label>
          </div>
          <div className="form-group">
            <label>
              <span className="bold-label">Relationship to the child: </span>{currentUser.relationship}
            </label>
          </div>
          <div className="form-group">
            <label>
              <span className="bold-label">Address: </span>{currentUser.address}
            </label>
          </div>
        </div>
        {currentUser.children && currentUser.children.length > 0 && (
          <div className="form-group">
            <label>
              <span className="bold-label">Select Child:</span> {' '} <br/>
              <select value={selectedChild} onChange={handleChildChange} required>
                <option value="">Select a Child</option>
                {currentUser.children
                  .filter((child) => child) // Filter out undefined/null children
                  .map((child, index) => (
                    <option key={index} value={index}>
                      {child.child_first_name} {child.child_last_name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}
          {selectedChild !== null && (
            <div className="form-group-grid">
              <div className="form-group">
                <label>
                  <span className="bold-label">First Name: </span>{formData.childFirstName}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Last Name: </span>{formData.childLastName}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Date of Birth: </span>{formData.childDob}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Gender: </span>{formData.childGender}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Birth Weight (kg): </span>{formData.childBirthWeight}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Birth Height (cm): </span>{formData.childBirthHeight}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Gestational Age (weeks): </span>{formData.childGestationalAge}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Birth Medical History: </span>{formData.childMedicalHistory}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Age (Months):</span> {' '}
                  {editMode ? (
                    <select
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Age</option>
                      <option value="0">At Birth</option>
                      {Array.from({ length: 36 }, (_, i) => i + 1).map((age) => (
                        <option key={age} value={age}>
                          {age} {age === 1 ? 'Month' : 'Months'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{formData.age}</span>
                  )}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Weight (kg):</span> {' '}
                  {editMode ? (
                    <input
                      type="text"
                      name="childWeight"
                      value={formData.childWeight}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{formData.childWeight}</span>
                  )}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Height (cm):</span> {' '}
                  {editMode ? (
                    <input
                      type="text"
                      name="childHeight"
                      value={formData.childHeight}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{formData.childHeight}</span>
                  )}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Head Circumference (cm):</span> {' '}
                  {editMode ? (
                    <input
                      type="text"
                      name="childHeadCircumference"
                      value={formData.childHeadCircumference}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{formData.childHeadCircumference}</span>
                  )}
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Additional Notes:</span> {' '}
                  {editMode ? (
                    <input
                      type="text"
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{formData.additionalNotes}</span>
                  )}
                </label>
              </div>
          </div>
        )}

        {editMode && (
          <div className="center">
            <button type="submit">Save Profile Changes</button>
          </div>
        )}
        {editMode && (
          <div className="center">
            <button type="button" onClick={toggleEditMode}>Cancel Profile Changes</button>
          </div>
        )}
      </form>
      {!editMode && !changePasswordMode && currentUser.children && currentUser.children.length > 0 && selectedChild !== null && selectedChild !== "" && (
        <div className="center">
          <button type="button" onClick={toggleEditMode}>Update Profile Details</button>
        </div>
      )}
      {!editMode && !changePasswordMode && (
        <div className="center">
          <button type="button" onClick={toggleChildProfilePopup}>Add Child Profile</button>
        </div>
      )}
      {/* Child Profile Popup */}
      {showChildProfilePopup && (
        <div className="child-profile-popup">
          <div className="popup-content">
            <span className="close-button" onClick={toggleChildProfilePopup}>&times;</span>
            <h3>Add Child Profile</h3>
            <form onSubmit={handleChildProfileSubmit}>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="childFirstName"
                  value={newChildProfile.childFirstName}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="childLastName"
                  value={newChildProfile.childLastName}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  name="childDob"
                  value={newChildProfile.childDob}
                  onChange={handleChildProfileChange}
                  max={new Date().toISOString().split('T')[0]}  // This disables future dates
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender:</label>
                <select
                  name="childGender"
                  value={newChildProfile.childGender}
                  onChange={handleChildProfileChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>Birth Weight (kg):</label>
                <input
                  type="text"
                  name="childBirthWeight"
                  value={newChildProfile.childBirthWeight}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Birth Height (cm):</label>
                <input
                  type="text"
                  name="childBirthHeight"
                  value={newChildProfile.childBirthHeight}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gestational Age (weeks):</label>
                <input
                  type="text"
                  name="childGestationalAge"
                  value={newChildProfile.childGestationalAge}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Birth Medical History:</label>
                <input
                  type="text"
                  name="childMedicalHistory"
                  value={newChildProfile.childMedicalHistory}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Age (Months):</label>
                  <select
                    name="childAge"
                    value={newChildProfile.childAge}
                    onChange={handleChildProfileChange}
                    required
                  >
                    <option value="">Select Age</option>
                    <option value="0">At Birth</option>
                    {Array.from({ length: 36 }, (_, i) => i + 1).map((childAge) => (
                      <option key={childAge} value={childAge}>
                        {childAge} {childAge === 1 ? 'Month' : 'Months'}
                      </option>
                    ))}
                  </select>
              </div>
              <div className="form-group">
                <label>Weight (kg):</label>
                <input
                  type="text"
                  name="childWeight"
                  value={newChildProfile.childWeight}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Height (cm):</label>
                <input
                  type="text"
                  name="childHeight"
                  value={newChildProfile.childHeight}
                  onChange={handleChildProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Head Circumference (cm):</label>
                <input
                  type="text"
                  name="childHeadCircumference"
                  value={newChildProfile.childHeadCircumference}
                  onChange={handleChildProfileChange}
                />
              </div>
              <div className="form-group">
                <label>Additional Notes:</label>
                <input
                  type="text"
                  name="additionalNotes"
                  value={newChildProfile.additionalNotes}
                  onChange={handleChildProfileChange}
                />
              </div>
              <div className="center">
                <button type="submit">Save Child Profile</button>
                <button type="button" onClick={toggleChildProfilePopup}>Cancel Child Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {!editMode && !changePasswordMode && (
        <div className="center">
          <button type="button" onClick={toggleChangePasswordMode}>Change Password</button>
        </div>
      )}
      {changePasswordMode && (
        <div>
          <form onSubmit={handleSubmit}>

          <div className="form-group-passwords">
              <div className="form-group">
                <label>
                  <span className="bold-label">New Password:</span>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="form-group">
                <label>
                  <span className="bold-label">Confirm New Password:</span>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                  />
                </label>
              </div>
            </div>
            <div className="center">
              <button type="submit">Save Password</button>
            </div>
          </form>
          <div className="center">
            <button type="button" onClick={toggleChangePasswordMode}>Cancel Password Change</button>
          </div>
        </div>
      )}    
    </div>
  );
};

export default ParentProfile;