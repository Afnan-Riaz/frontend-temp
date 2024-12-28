import React, { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';

import ParentLogin from './components/ParentLogin';
import PediatricianLogin from './components/PediatricianLogin';
import SpecialistLogin from './components/SpecialistLogin';

import ParentSignup from './components/ParentSignup';
import PediatricianSignup from './components/PediatricianSignup';
import SpecialistSignup from './components/SpecialistSignup';

import ParentProfile from './components/ParentProfile';
import PediatricianProfile from './components/PediatricianProfile';
import SpecialistProfile from './components/SpecialistProfile';

import PatientForm from './components/PatientForm';

import ChatWindow from './components/ChatWindow';
import GrowthChart from './components/GrowthChart';
import VaccinationTracker from './components/VaccinationTracker';
import MilestoneTracker from './components/MilestoneTracker';
import VisitRecord from './components/VisitRecord';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // To Track the role of the user (parent, pediatrician, or specialist)
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
          setUserRole(data.user_type);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setCurrentUser(null);
        setUserRole(null);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),  // credentials includes identifier, password, and user_type
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        const profileResponse = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });
        const profileData = await profileResponse.json();
        if (profileResponse.ok) {
          setCurrentUser(profileData.user);
          setUserRole(profileData.user_type); // Setting the user role from the response
          // Navigating to the correct profile based on userRole
          if (profileData.user_type === 'parent') {
            navigate('/parent-profile');
          } else if (profileData.user_type === 'pediatrician') {
            navigate('/patient-profile');
          } else if (profileData.user_type === 'specialist') {
            navigate('/patient-profile');
          }
        } else {
          alert(profileData.message);
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleSignup = async (credentials) => {
    try {
      const response = await fetch('http://localhost:5001/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials), // credentials includes formData and user_type
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setUserRole(data.user_type); // Setting the user role from the response
        // Navigating to the correct profile based on userRole
        if (data.user_type === 'parent') {
          navigate('/parent-profile');
        } else if (data.user_type === 'pediatrician') {
          navigate('/patient-profile');
        } else if (data.user_type === 'specialist') {
          navigate('/patient-profile');
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        setCurrentUser(null);
        setUserRole(null);
        navigate('/');
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      const response = await fetch('http://localhost:5001/api/update_profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const profileResponse = await fetch('http://localhost:5001/api/profile', {
          method: 'GET',
          credentials: 'include',
        });
        const updatedData = await profileResponse.json();
        if (profileResponse.ok) {
          setCurrentUser(updatedData.user);
          alert('Profile Updated Successfully');
        }
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Profile update failed. Please try again.');
    }
  };

  // Menu options based on user role
  const renderMenu = () => {
    if (!currentUser) return null;

    let menuItems = [];

    if (userRole === 'parent') {
      menuItems = [
        <Link to="/chat">Chat</Link>,
        <Link to="/parent-profile">Profile</Link>,
        <Link to="/growth-chart">Growth Chart</Link>,
        <Link to="/vaccination-tracker">Vaccination Tracker</Link>,
        <Link to="/milestone-tracker">Milestone / Red Flag Tracker</Link>,
        <Link to="/visit-record">Visit Record</Link>
      ];
    } else if (userRole === 'pediatrician') {
      menuItems = [
        <Link to="/patient-profile">Patient Profile</Link>,
        <Link to="/pediatrician-profile">Profile</Link>,
      ];
    } else if (userRole === 'specialist') {
      menuItems = [
        <Link to="/patient-profile">Patient Record</Link>,
        <Link to="/specialist-profile">Profile</Link>,
      ];
    }

    return (
      <div className="menu-right">
        <div className="dropdown">
        <button className="dropbtn">
          Hi, {currentUser[`${userRole}_first_name`]} {currentUser[`${userRole}_last_name`]}!
        </button>
          <div className="dropdown-content">
            {menuItems}
            <button onClick={handleLogout}>Log Out</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <nav className={!currentUser ? 'hidden' : ''}>
        {renderMenu()}
      </nav>
      <Routes>
        <Route path="/" element={<ParentLogin handleLogin={(credentials) => handleLogin(credentials)} />} />
        <Route path="/parent-login" element={<ParentLogin handleLogin={(credentials) => handleLogin(credentials)} />} />
        <Route path="/pediatrician-login" element={<PediatricianLogin handleLogin={(credentials) => handleLogin(credentials)} />} />
        <Route path="/specialist-login" element={<SpecialistLogin handleLogin={(credentials) => handleLogin(credentials)} />} />
        <Route path="/parent-signup" element={<ParentSignup handleSignup={(credentials) => handleSignup(credentials)} />} />
        <Route path="/pediatrician-signup" element={<PediatricianSignup handleSignup={(credentials) => handleSignup(credentials)} />} />
        <Route path="/specialist-signup" element={<SpecialistSignup handleSignup={(credentials) => handleSignup(credentials)} />} />

        {currentUser && userRole === 'parent' && (
          <>
            <Route path="/chat" element={<ChatWindow />} />
            <Route
              path="/parent-profile"
              element={
                <ParentProfile
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  handleUpdateProfile={handleUpdateProfile}
                />
              }
            />
            <Route path="/growth-chart" element={<GrowthChart />} />
            <Route path="/vaccination-tracker" element={<VaccinationTracker />} />
            <Route path="/milestone-tracker" element={<MilestoneTracker />} />
            <Route path="/visit-record" element={<VisitRecord />} />
          </>
        )}

        {currentUser && userRole === 'pediatrician' && (
          <>
            <Route path="/patient-profile" element={<PatientForm pediatricianId={currentUser.pediatrician_id} />} />
            <Route
              path="/pediatrician-profile"
              element={
                <PediatricianProfile
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  handleUpdateProfile={handleUpdateProfile}
                />
              }
            />
          </>
        )}

        {currentUser && userRole === 'specialist' && (
          <>
            <Route path="/patient-profile" element={<PatientForm />} />
            <Route
              path="/specialist-profile"
              element={
                <SpecialistProfile
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  handleUpdateProfile={handleUpdateProfile}
                />
              }
            />
          </>
        )}

        {!currentUser && <Route path="*" element={<Navigate to="/" />} />}
      </Routes>
    </div>
  );
};

export default App;
