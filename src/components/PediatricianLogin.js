import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const logo = process.env.PUBLIC_URL + '/images/logo.png';

const PediatricianLogin = ({ handleLogin }) => {
  const [identifier, setIdentifier] = useState(''); // Changed to identifier
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (identifier.trim() === '' || password.trim() === '') {
      setError('Phone Number/Email and password are required.');
      return;
    }
    handleLogin({ identifier, password, user_type: 'pediatrician' });
  };

  return (
    <div className="centered">
      <div className="form-container">
        <div className="center">
          <img src={logo} alt="Logo" className="logo" />
          <h1>Welcome to Smile2Steps</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Phone Number or Email ID
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p>If not already an existing pediatrician, please <Link to="/pediatrician-signup">Sign up</Link></p>
        <p>If you're a specialist, please <Link to="/specialist-login">Log in</Link></p>
        <p>If you're a parent, please <Link to="/parent-login">Log in</Link></p>
      </div>
    </div>
  );
};

export default PediatricianLogin;
