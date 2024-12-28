import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const logo = process.env.PUBLIC_URL + '/images/logo.png';

const SpecialistSignup = ({ handleSignup }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    email: '',
    firstName: '',
    lastName: '',
    clinicName: '',
    specialization: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password policy enforcement
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,16}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Define an array of non-required fields (optional fields)
    const nonRequiredFields = ['email']; // Only optional fields go here

    // Filter out non-required fields and check if any required field is empty
    const requiredFields = Object.keys(formData).filter((field) => !nonRequiredFields.includes(field));

    // Check if any of the required fields are empty
    if (requiredFields.some((field) => !formData[field] || formData[field].trim() === '')) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      // Transform the formData to match backend expectations
      const transformedData = {
        password: formData.password,
        phone_number: formData.phoneNumber, // Convert phoneNumber to phone_number
        email: formData.email,
        first_name: formData.firstName, // Convert firstName to first_name
        last_name: formData.lastName, // Convert lastName to last_name
        clinic_name: formData.clinicName,
        specialization: formData.specialization,
        user_type: 'specialist', // Make sure user_type is passed as 'parent'
      };

      const response = await handleSignup(transformedData);

      if (!response.success) {
        setError(response.message); // Display backend error message if any
      } 
    } catch (error) {
      setError('Signup failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="card form-container">
        <div className="center">
          <img src={logo} alt="Logo" className="logo" />
          <h1>Smile2Steps Sign Up</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-container">
            <div className="grid-item">
              <label>Phone Number</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} autoComplete="phone_number" />
            </div>
            <div className="grid-item">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="email" />
            </div>
            <div className="grid-item">
              <label>First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="first-name" />
            </div>
            <div className="grid-item">
              <label>Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="last-name" />
            </div>
            <div className="grid-item">
              <label>Clinic Name</label>
              <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} autoComplete="clinicName" />
            </div>
            <div className="grid-item">
              <label>Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} autoComplete="specialization" />
            </div>
            <div className="grid-item">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} autoComplete="new-password" />
            </div>
            <div className="grid-item">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" className="input-btn">Sign Up</button>
        </form>
        <p>If already an existing specialist, please <Link to="/">Login</Link></p>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SpecialistSignup;
