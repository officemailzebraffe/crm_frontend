import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiClock, FiCheck, FiCalendar, FiUser, FiFilter } from 'react-icons/fi';
import '../pages/Auth.css';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    userId: user?.role === 'admin' || user?.role === 'hr_manager' ? '' : user?._id
  });

  const fetchAttendance = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(`/attendance?${params.toString()}`);
      setAttendanceRecords(response.data.data || []);
      
      // Check if user has checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRec = response.data.data?.find(rec => 
        rec.date?.split('T')[0] === today && rec.userId._id === user._id
      );
      setTodayRecord(todayRec);
      setHasCheckedInToday(!!todayRec?.checkIn);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError(error.response?.data?.message || 'Failed to load attendance records');
      setLoading(false);
    }
  }, [filters.month, filters.year, filters.userId, user._id]);

  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.userId) params.append('userId', filters.userId);

      const response = await api.get(`/attendance/summary?${params.toString()}`);
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [filters.month, filters.year, filters.userId]);

  useEffect(() => {
    fetchAttendance();
    fetchSummary();
  }, [fetchAttendance, fetchSummary]);

  const handleCheckIn = async () => {
    try {
      setError('');
      const response = await api.post('/attendance/checkin');
      setSuccess('Checked in successfully!');
      setHasCheckedInToday(true);
      setTodayRecord(response.data.data);
      fetchAttendance();
      fetchSummary();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to check in');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCheckOut = async () => {
    try {
      setError('');
      const response = await api.post('/attendance/checkout');
      setSuccess('Checked out successfully!');
      setTodayRecord(response.data.data);
      fetchAttendance();
      fetchSummary();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to check out');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      present: '#10b981',
      absent: '#ef4444',
      half_day: '#f59e0b',
      late: '#f97316',
      on_leave: '#8b5cf6',
      holiday: '#3b82f6',
      weekend: '#6b7280'
    };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: `${statusColors[status]}20`,
        color: statusColors[status]
      }}>
        {status?.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const canManageAttendance = user?.role === 'admin' || user?.role === 'hr_manager';

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiClock /> Attendance Management
        </h1>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px' }}>{success}</div>}

      {/* Check-In/Check-Out Card */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ color: 'white' }}>
          <h2 style={{ color: 'white', marginBottom: '15px' }}>Today's Attendance</h2>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <p style={{ marginBottom: '5px', opacity: 0.9 }}>Status</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                {hasCheckedInToday ? (todayRecord?.checkOut ? 'Checked Out' : 'Checked In') : 'Not Checked In'}
              </p>
            </div>
            {todayRecord && (
              <>
                <div>
                  <p style={{ marginBottom: '5px', opacity: 0.9 }}>Check-In Time</p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                    {formatTime(todayRecord.checkIn)}
                  </p>
                </div>
                {todayRecord.checkOut && (
                  <div>
                    <p style={{ marginBottom: '5px', opacity: 0.9 }}>Check-Out Time</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                      {formatTime(todayRecord.checkOut)}
                    </p>
                  </div>
                )}
                {todayRecord.workingHours && (
                  <div>
                    <p style={{ marginBottom: '5px', opacity: 0.9 }}>Working Hours</p>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                      {todayRecord.workingHours.toFixed(2)}h
                    </p>
                  </div>
                )}
              </>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {!hasCheckedInToday ? (
                <button 
                  className="btn"
                  onClick={handleCheckIn}
                  style={{ 
                    backgroundColor: 'white', 
                    color: '#667eea',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiCheck /> Check In
                </button>
              ) : !todayRecord?.checkOut ? (
                <button 
                  className="btn"
                  onClick={handleCheckOut}
                  style={{ 
                    backgroundColor: 'white', 
                    color: '#667eea',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Check Out
                </button>
              ) : (
                <div style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  All Done for Today!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Total Days</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6', margin: 0 }}>{summary.totalDays}</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Present</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>{summary.presentDays}</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Absent</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444', margin: 0 }}>{summary.absentDays}</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Avg Hours</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', margin: 0 }}>
              {summary.averageWorkingHours?.toFixed(1)}h
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      {canManageAttendance && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
            <FiFilter /> Filter Records
          </h3>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label className="form-label">Month</label>
              <select 
                className="form-control"
                value={filters.month}
                onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>
                    {new Date(2024, m-1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label className="form-label">Year</label>
              <select 
                className="form-control"
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}
              >
                {[2023, 2024, 2025].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="card">
        <h2 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar /> Attendance Records
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                {canManageAttendance && <th style={{ padding: '12px', textAlign: 'left' }}>Employee</th>}
                <th style={{ padding: '12px', textAlign: 'left' }}>Check-In</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Check-Out</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Working Hours</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={canManageAttendance ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No attendance records found for this period
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{formatDate(record.date)}</td>
                    {canManageAttendance && (
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FiUser />
                          {record.userId?.name || 'N/A'}
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '12px' }}>{formatTime(record.checkIn)}</td>
                    <td style={{ padding: '12px' }}>{formatTime(record.checkOut)}</td>
                    <td style={{ padding: '12px' }}>
                      {record.workingHours ? `${record.workingHours.toFixed(2)} hours` : 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(record.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
