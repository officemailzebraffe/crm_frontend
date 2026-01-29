import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiCalendar, FiPlus, FiCheck, FiX, FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../pages/Auth.css';

const Leaves = () => {
  const { user } = useSelector((state) => state.auth);
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false
  });

  const leaveTypes = [
    { value: 'casual', label: 'Casual Leave', color: '#3b82f6' },
    { value: 'sick', label: 'Sick Leave', color: '#ef4444' },
    { value: 'earned', label: 'Earned Leave', color: '#10b981' },
    { value: 'maternity', label: 'Maternity Leave', color: '#ec4899' },
    { value: 'paternity', label: 'Paternity Leave', color: '#8b5cf6' },
    { value: 'unpaid', label: 'Unpaid Leave', color: '#6b7280' },
    { value: 'compensatory', label: 'Compensatory Leave', color: '#f59e0b' },
    { value: 'bereavement', label: 'Bereavement Leave', color: '#64748b' },
    { value: 'other', label: 'Other', color: '#737373' }
  ];

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leaves');
      setLeaves(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError(error.response?.data?.message || 'Failed to load leave records');
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.get('/leaves/balance');
      setLeaveBalance(response.data.data || {});
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/leaves', formData);
      setSuccess('Leave application submitted successfully!');
      setShowModal(false);
      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: '',
        halfDay: false
      });
      fetchLeaves();
      fetchLeaveBalance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to apply for leave');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      await api.put(`/leaves/${leaveId}/review`, { status: 'approved' });
      setSuccess('Leave approved successfully!');
      fetchLeaves();
      fetchLeaveBalance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to approve leave');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      await api.put(`/leaves/${leaveId}/review`, { status: 'rejected' });
      setSuccess('Leave rejected successfully!');
      fetchLeaves();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reject leave');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = async (leaveId) => {
    if (window.confirm('Are you sure you want to cancel this leave application?')) {
      try {
        await api.put(`/leaves/${leaveId}/cancel`);
        setSuccess('Leave cancelled successfully!');
        fetchLeaves();
        fetchLeaveBalance();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to cancel leave');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleDelete = async (leaveId) => {
    if (window.confirm('Are you sure you want to delete this leave record?')) {
      try {
        await api.delete(`/leaves/${leaveId}`);
        setSuccess('Leave record deleted successfully!');
        fetchLeaves();
        fetchLeaveBalance();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete leave');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
      approved: { color: '#10b981', bg: '#d1fae5', label: 'Approved' },
      rejected: { color: '#ef4444', bg: '#fee2e2', label: 'Rejected' },
      cancelled: { color: '#6b7280', bg: '#f3f4f6', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: config.bg,
        color: config.color
      }}>
        {config.label}
      </span>
    );
  };

  const getLeaveTypeColor = (type) => {
    return leaveTypes.find(lt => lt.value === type)?.color || '#6b7280';
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const canApprove = user?.role === 'admin' || user?.role === 'hr_manager' || user?.role === 'manager';

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiCalendar /> Leave Management
        </h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiPlus /> Apply for Leave
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px' }}>{success}</div>}

      {/* Leave Balance */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white' }}>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>Your Leave Balance</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            {leaveTypes.map(type => {
              const balance = leaveBalance[type.value] || 0;
              return (
                <div key={type.value} style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '15px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '12px', marginBottom: '5px', opacity: 0.9 }}>{type.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{balance}</p>
                  <p style={{ fontSize: '11px', marginTop: '5px', opacity: 0.8 }}>days available</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="card">
        <h2 style={{ marginBottom: '15px' }}>Leave Applications</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Employee</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Leave Type</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Start Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>End Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Days</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Reason</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No leave applications found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{leave.userId?.name || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500,
                        backgroundColor: `${getLeaveTypeColor(leave.leaveType)}20`,
                        color: getLeaveTypeColor(leave.leaveType)
                      }}>
                        {leaveTypes.find(lt => lt.value === leave.leaveType)?.label || leave.leaveType}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{formatDate(leave.startDate)}</td>
                    <td style={{ padding: '12px' }}>{formatDate(leave.endDate)}</td>
                    <td style={{ padding: '12px' }}>
                      {leave.totalDays} {leave.halfDay ? '(Half Day)' : ''}
                    </td>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        color: '#4b5563'
                      }} title={leave.reason}>
                        {leave.reason}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(leave.status)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {canApprove && leave.status === 'pending' && leave.userId._id !== user._id && (
                          <>
                            <button
                              onClick={() => handleApprove(leave._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#10b981',
                                fontSize: '18px',
                                padding: '4px'
                              }}
                              title="Approve"
                            >
                              <FiCheck />
                            </button>
                            <button
                              onClick={() => handleReject(leave._id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#ef4444',
                                fontSize: '18px',
                                padding: '4px'
                              }}
                              title="Reject"
                            >
                              <FiX />
                            </button>
                          </>
                        )}
                        {leave.userId._id === user._id && leave.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(leave._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#f59e0b',
                              fontSize: '18px',
                              padding: '4px'
                            }}
                            title="Cancel"
                          >
                            <FiX />
                          </button>
                        )}
                        {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                          <button
                            onClick={() => handleDelete(leave._id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              fontSize: '18px',
                              padding: '4px'
                            }}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ 
            width: '90%', 
            maxWidth: '500px', 
            maxHeight: '90vh', 
            overflow: 'auto' 
          }}>
            <h2>Apply for Leave</h2>
            {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Leave Type</label>
                <select
                  name="leaveType"
                  className="form-control"
                  value={formData.leaveType}
                  onChange={handleInputChange}
                  required
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="halfDay"
                    checked={formData.halfDay}
                    onChange={handleInputChange}
                  />
                  <span>Half Day Leave</span>
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <textarea
                  name="reason"
                  className="form-control"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Please provide a reason for your leave..."
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Application
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      leaveType: 'casual',
                      startDate: '',
                      endDate: '',
                      reason: '',
                      halfDay: false
                    });
                  }}
                  style={{ 
                    flex: 1,
                    backgroundColor: '#f3f4f6',
                    color: '#374151'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
