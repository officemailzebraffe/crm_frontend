import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiPlus, FiEdit, FiTrash, FiSearch } from 'react-icons/fi';

const Leads = () => {
  const { user } = useSelector((state) => state.auth);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: 'website',
    status: 'new',
    interestedCourse: '',
    notes: ''
  });

  const fetchLeads = useCallback(async () => {
    try {
      if (!user?.activeProject?._id) {
        setLoading(false);
        return;
      }
      const query = `projectId=${user.activeProject._id}${statusFilter ? `&status=${statusFilter}` : ''}`;
      const response = await api.get(`/leads?${query}`);
      setLeads(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    if (user?.activeProject) {
      fetchLeads();
    }
  }, [user, statusFilter, fetchLeads]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', { ...formData, projectId: user.activeProject._id });
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', source: 'website', status: 'new', interestedCourse: '', notes: '' });
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      const errorMsg = error.response?.data?.error || 'Failed to create lead. Please try again.';
      alert(`Error: ${errorMsg}`);
    }
  };

  const deleteLead = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await api.delete(`/leads/${id}`);
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      new: 'badge-info',
      contacted: 'badge-warning',
      qualified: 'badge-success',
      negotiation: 'badge-warning',
      converted: 'badge-success',
      lost: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  };

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  // Check permissions
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  if (!user?.activeProject) {
    return (
      <div className="container">
        <div className="card">
          <p>Please select a project first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Leads</h1>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus style={{ marginRight: '8px' }} /> Add Lead
          </button>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '35px' }}
            />
          </div>
          <select
            className="form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="negotiation">Negotiation</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Status</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.name}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone}</td>
                  <td style={{ textTransform: 'capitalize' }}>{lead.source.replace('_', ' ')}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td>{lead.score || 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canEdit && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                          <FiEdit />
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => deleteLead(lead._id)}>
                          <FiTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredLeads.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            No leads found. Add your first lead to get started!
          </p>
        )}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Lead</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Source</label>
                <select
                  className="form-control"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                >
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="direct">Direct</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Lead
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
