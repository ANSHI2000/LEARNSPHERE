import React from 'react';

const DashboardHeader = ({ title, userName, onLogout }) => (
  <div className="dashboard-header">
    <div>
      <h1>{title}</h1>
      <p>Welcome, {userName}!</p>
    </div>
    <button className="logout-btn" onClick={onLogout}>Logout</button>
  </div>
);

export default DashboardHeader;
