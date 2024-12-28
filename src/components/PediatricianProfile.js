import React, { useState, useEffect } from 'react';

const logo = process.env.PUBLIC_URL + '/images/logo.png';

const PediatricianProfile = ({ currentUser, setCurrentUser, handleUpdateProfile }) => {
  const [formData, setFormData] = useState({
    phoneNumber: currentUser.pediatrician_phone_number || '',
    email: currentUser.pediatrician_email || '',
    firstName: '',
    lastName: '',
    clinicName: '',
    specialization: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        phoneNumber: currentUser.pediatrician_phone_number || '',
        email: currentUser.pediatrician_email || '',
        firstName: currentUser.pediatrician_first_name || '',
        lastName: currentUser.pediatrician_last_name || '',
        clinicName: currentUser.pediatrician_clinic_name || '',
        specialization: currentUser.pediatrician_specialization || '',
        newPassword: '',
        confirmNewPassword: '',
      });
    }
  }, [currentUser]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isFormEdited =
      formData.phoneNumber !== currentUser.pediatrician_phone_number ||
      formData.email !== currentUser.pediatrician_email ||
      formData.firstName !== currentUser.pediatrician_first_name ||
      formData.lastName !== currentUser.pediatrician_last_name ||
      formData.clinicName !== currentUser.pediatrician_clinic_name ||
      formData.specialization !== currentUser.pediatrician_specialization;

    // Password policy enforcement
    if (changePasswordMode && formData.newPassword && formData.newPassword === formData.confirmNewPassword) {
      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        setError('Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.');
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
          setError('');
        }, 5000);
        return;
      }
    }

    if (isFormEdited || (changePasswordMode && formData.newPassword && formData.newPassword === formData.confirmNewPassword)) {
      try {
        const response = await handleUpdateProfile(formData);
        if (response && response.success) {
          setSuccessMessage(changePasswordMode ? 'Password updated successfully!' : 'Profile updated successfully!');
          setCurrentUser(response.user); // Update currentUser state with updated data

          // Clear success message after 3 seconds
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
      if (changePasswordMode && formData.newPassword !== formData.confirmNewPassword) {
        setError('Passwords do not match.');
      } else {
        setError('No changes made.');
      }
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
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
                <span className="bold-label">Phone Number: </span>{currentUser.pediatrician_phone_number}
              </label>
            </div>
            <div className="form-group">
              <label>
                <span className="bold-label">Email: </span>{currentUser.pediatrician_email}
              </label>
            </div>
            <div className="form-group">
              <label>
                <span className="bold-label">First Name: </span>{currentUser.pediatrician_first_name}
              </label>
            </div>
            <div className="form-group">
              <label>
                <span className="bold-label">Last Name: </span>{currentUser.pediatrician_last_name}
              </label>
            </div>
            <div className="form-group">
              <label>
                  <span className="bold-label">Clinic:</span> {' '}
                  {editMode ? (
                    <input
                      type="text"
                      name="clinicName"
                      value={formData.clinicName}
                      onChange={handleChange}
                    />
                  ) : (
                    <span>{formData.clinicName}</span>
                  )}
                </label>
            </div>
            <div className="form-group">
              <label>
                <span className="bold-label">Specialization: </span>{currentUser.pediatrician_specialization}
              </label>
            </div>
        </div>

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
      {!editMode && !changePasswordMode && (
        <div className="center">
          <button type="button" onClick={toggleEditMode}>Update Profile Details</button>
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
            <div className="form-group">
              <label>
                <span className="bold-label">New Password:</span> {' '}
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
                <span className="bold-label">Confirm New Password:</span> {' '}
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                />
              </label>
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

export default PediatricianProfile;