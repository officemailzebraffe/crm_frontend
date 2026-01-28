import React from 'react';
import { useSelector } from 'react-redux';

const Settings = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="container">
      <h1>Settings</h1>
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Profile Information</h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={user?.name || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={user?.email || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input type="tel" className="form-control" value={user?.phone || ''} readOnly />
          </div>
          <div>
            <label className="form-label">Role</label>
            <input type="text" className="form-control" value={user?.role || ''} readOnly style={{ textTransform: 'capitalize' }} />
          </div>
        </div>
        <p style={{ marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          Settings page - Update profile, change password, manage notifications, and configure project settings.
        </p>
      </div>
    </div>
  );
};

export default Settings;
