import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiUsers, FiUserCheck, FiBookOpen, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      if (!user?.activeProject?._id) {
        setLoading(false);
        return;
      }
      const response = await api.get(`/analytics/dashboard?projectId=${user.activeProject._id}`);
      setAnalytics(response.data.data);
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
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>No Project Assigned</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
            You don't have any projects assigned to your account yet.
          </p>
          <div style={{ 
            backgroundColor: '#fef3c7', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #fbbf24',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <p style={{ color: '#92400e', fontSize: '14px', margin: 0 }}>
              <strong>What to do:</strong> Please contact your administrator to assign you to a project.
              {user?.role === 'admin' && ' You can assign projects in the Admin Panel.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const stats = [
    {
      title: 'Total Leads',
      value: analytics?.leads?.total || 0,
      icon: FiUsers,
      color: '#4f46e5',
      change: `${analytics?.leads?.conversionRate || 0}% conversion`
    },
    {
      title: 'Employees',
      value: analytics?.students?.total || 0,
      icon: FiUserCheck,
      color: '#10b981',
      change: 'Active employees'
    },
    {
      title: 'Courses',
      value: analytics?.courses?.total || 0,
      icon: FiBookOpen,
      color: '#f59e0b',
      change: `${analytics?.courses?.totalEnrollments || 0} enrollments`
    },
    {
      title: 'Revenue',
      value: `₹${analytics?.revenue?.collected || 0}`,
      icon: FiDollarSign,
      color: '#8b5cf6',
      change: `₹${analytics?.revenue?.pending || 0} pending`
    }
  ];

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p style={{ marginBottom: '30px', color: '#6b7280' }}>
        Project: <strong>{user.activeProject.name}</strong>
      </p>

      <div className="grid grid-4">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{stat.title}</p>
                <h2 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{stat.value}</h2>
                <p style={{ color: '#10b981', fontSize: '13px' }}>{stat.change}</p>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '10px', 
                backgroundColor: `${stat.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <stat.icon style={{ fontSize: '24px', color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Recent Interactions</h3>
          {analytics?.recentInteractions && analytics.recentInteractions.length > 0 ? (
            <div>
              {analytics.recentInteractions.slice(0, 5).map((interaction, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  borderBottom: index < 4 ? '1px solid #e5e7eb' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <p style={{ fontWeight: '500', marginBottom: '4px' }}>{interaction.subject}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                      {interaction.performedBy?.name} - {interaction.type}
                    </p>
                  </div>
                  <span className={`badge badge-${interaction.outcome === 'successful' ? 'success' : 'info'}`}>
                    {interaction.outcome}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#6b7280' }}>No recent interactions</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Quick Stats</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Converted Leads</span>
              <strong style={{ color: '#10b981' }}>{analytics?.leads?.converted || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Overdue Tasks</span>
              <strong style={{ color: '#ef4444' }}>{analytics?.tasks?.overdue || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Expected Revenue</span>
              <strong style={{ color: '#8b5cf6' }}>₹{analytics?.revenue?.expected || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Enrollments</span>
              <strong style={{ color: '#f59e0b' }}>{analytics?.courses?.totalEnrollments || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
