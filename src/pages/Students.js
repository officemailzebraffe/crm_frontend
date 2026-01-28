import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiPlus, FiEdit, FiTrash, FiSearch, FiAward } from 'react-icons/fi';

const Students = () => {
  const { user } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    enrollmentDate: new Date().toISOString().split('T')[0],
    batch: '',
    notes: ''
  });

  const fetchStudents = useCallback(async () => {
    try {
      if (!user?.activeProject?._id) {
        setLoading(false);
        return;
      }
      const query = `projectId=${user.activeProject._id}${statusFilter ? `&status=${statusFilter}` : ''}`;
      const response = await api.get(`/students?${query}`);
      setStudents(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  }, [user, statusFilter]);

  useEffect(() => {
    if (user?.activeProject) {
      fetchStudents();
    }
  }, [user, statusFilter, fetchStudents]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', { ...formData, projectId: user.activeProject._id });
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', status: 'active', enrollmentDate: new Date().toISOString().split('T')[0], batch: '', notes: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const deleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'badge-success',
      completed: 'badge-info',
      on_hold: 'badge-warning',
      dropped: 'badge-danger'
    };
    return classes[status] || 'badge-info';
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm)
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
        <div>
          <h1>Employees</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Manage your team members and their details</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus style={{ marginRight: '8px' }} /> Add Employee
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
              placeholder="Search employees..."
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="dropped">Dropped</option>
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
                <th>Batch</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{student.name}</strong>
                    </div>
                  </td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.batch || 'Not assigned'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                      {student.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {canEdit && (
                        <button className="btn btn-secondary" style={{ padding: '6px 12px' }}>
                          <FiEdit />
                        </button>
                      )}
                      {canDelete && (
                        <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => deleteStudent(student._id)}>
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

        {!loading && filteredStudents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <FiAward style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>No employees found</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>Add your first team member to get started!</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Employee</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
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
                <label className="form-label">Batch/Team</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  placeholder="e.g., DSA Batch 2024, Team Alpha"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.enrollmentDate}
                  onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional information about the employee..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Add Employee
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
