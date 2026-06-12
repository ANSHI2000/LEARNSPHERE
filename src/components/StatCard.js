import React from 'react';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color || ''}`}>
    {icon && <div className="stat-icon">{icon}</div>}
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-title">{title}</div>
    </div>
  </div>
);

export default StatCard;
