import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiTrendingUp, FiUsers, FiDollarSign, FiTarget, FiAward, FiActivity } from 'react-icons/fi';

const Analytics = () => {
  const { user } = useSelector((state) => state.auth);
  const [leadAnalytics, setLeadAnalytics] = useState(null);
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const projectId = user.activeProject._id;
      const [leads, students, revenue] = await Promise.all([
        api.get(`/analytics/leads?projectId=${projectId}`),
        api.get(`/analytics/students?projectId=${projectId}`),
        api.get(`/analytics/revenue?projectId=${projectId}`)
      ]);
      setLeadAnalytics(leads.data.data);
      setStudentAnalytics(students.data.data);
      setRevenueAnalytics(revenue.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.activeProject) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  if (!user?.activeProject) {
    return (
      <div className="container">
        <div className="card">
          <p>Please select a project first.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const totalLeadsBySource = leadAnalytics?.bySource?.reduce((acc, item) => acc + item.count, 0) || 0;
  const totalRevenue = revenueAnalytics?.byCourse?.reduce((acc, item) => acc + item.totalCollected, 0) || 0;
  const totalExpected = revenueAnalytics?.byCourse?.reduce((acc, item) => acc + item.totalExpected, 0) || 0;
  const totalEnrollments = studentAnalytics?.byCourse?.reduce((acc, item) => acc + item.count, 0) || 0;

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <h1>Analytics & Insights</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Comprehensive overview of your performance metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Leads</p>
              <h2 style={{ fontSize: '32px', margin: '0', color: '#1e293b' }}>{totalLeadsBySource}</h2>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiUsers style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Total Enrollments</p>
              <h2 style={{ fontSize: '32px', margin: '0', color: '#1e293b' }}>{totalEnrollments}</h2>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiAward style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Revenue Collected</p>
              <h2 style={{ fontSize: '32px', margin: '0', color: '#1e293b' }}>₹{totalRevenue}</h2>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiDollarSign style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>Expected Revenue</p>
              <h2 style={{ fontSize: '32px', margin: '0', color: '#1e293b' }}>₹{totalExpected}</h2>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiTarget style={{ fontSize: '28px', color: 'white' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Leads by Source */}
      <div className="grid grid-2" style={{ marginBottom: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiActivity style={{ color: '#0ea5e9' }} />
            Leads by Source
          </h3>
          {leadAnalytics?.bySource && leadAnalytics.bySource.length > 0 ? (
            <div>
              {leadAnalytics.bySource.map((item, index) => {
                const percentage = totalLeadsBySource > 0 ? ((item.count / totalLeadsBySource) * 100).toFixed(1) : 0;
                return (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>{item._id || 'Unknown'}</span>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{item.count} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #3b82f6)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>No lead data available</p>
          )}
        </div>

        {/* Students by Course */}
        <div className="card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiAward style={{ color: '#10b981' }} />
            Enrollments by Program
          </h3>
          {studentAnalytics?.byCourse && studentAnalytics.byCourse.length > 0 ? (
            <div>
              {studentAnalytics.byCourse.map((item, index) => (
                <div key={index} style={{ padding: '12px', borderBottom: index < studentAnalytics.byCourse.length - 1 ? '1px solid #e5e7eb' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>{item.courseName || 'Unknown Program'}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Revenue: ₹{item.totalRevenue || 0}</p>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '14px' }}>{item.count} students</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>No enrollment data available</p>
          )}
        </div>
      </div>

      {/* Revenue by Course */}
      <div className="card">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiTrendingUp style={{ color: '#0ea5e9' }} />
          Revenue Breakdown by Program
        </h3>
        {revenueAnalytics?.byCourse && revenueAnalytics.byCourse.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Enrollments</th>
                <th>Collected</th>
                <th>Expected</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {revenueAnalytics.byCourse.map((item, index) => {
                const collectionRate = item.totalExpected > 0 ? ((item.totalCollected / item.totalExpected) * 100).toFixed(1) : 0;
                return (
                  <tr key={index}>
                    <td><strong>{item.courseName || 'Unknown'}</strong></td>
                    <td>{item.enrollments || 0}</td>
                    <td style={{ color: '#10b981', fontWeight: '600' }}>₹{item.totalCollected || 0}</td>
                    <td>₹{item.totalExpected || 0}</td>
                    <td style={{ color: '#ef4444' }}>₹{item.pending || 0}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${collectionRate}%`, height: '100%', background: collectionRate > 70 ? '#10b981' : collectionRate > 40 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }}></div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '45px' }}>{collectionRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>No revenue data available</p>
        )}
      </div>

      {/* Payment Status */}
      {revenueAnalytics?.paymentStatus && revenueAnalytics.paymentStatus.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiDollarSign style={{ color: '#f59e0b' }} />
            Payment Status Distribution
          </h3>
          <div className="grid grid-3">
            {revenueAnalytics.paymentStatus.map((item, index) => (
              <div key={index} style={{ padding: '20px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', textTransform: 'capitalize' }}>{item._id || 'Unknown'}</p>
                <h3 style={{ fontSize: '28px', margin: '0 0 4px 0', color: '#1e293b' }}>{item.count}</h3>
                <p style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>₹{item.amount || 0}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
