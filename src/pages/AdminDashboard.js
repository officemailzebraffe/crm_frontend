import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiUsers, FiUserPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'employee',
    permissions: {
      employees: false,
      dashboard: false,
      leads: false,
      students: false,
      courses: false,
      tasks: false,
      analytics: false,
      projects: false,
      attendance: false,
      leaves: false,
      settings: false
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
    fetchProjects();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData = {
        ...formData,
        projects: selectedProjects.map(projectId => ({
          projectId,
          role: 'viewer'
        }))
      };

      if (editingEmployee) {
        // Update existing employee
        await api.put(`/users/${editingEmployee._id}`, submitData);
        
        // Set active project if not already set and projects assigned
        if (selectedProjects.length > 0 && !editingEmployee.activeProject) {
          await api.put(`/auth/switch-project/${selectedProjects[0]}`);
        }
        setSuccess('Employee updated successfully');
      } else {
        // Create new employee
        const response = await api.post('/auth/register', submitData);
        
        // Set the first project as active if projects assigned
        if (selectedProjects.length > 0 && response.data.data) {
          await api.put(`/users/${response.data.data._id}`, {
            activeProject: selectedProjects[0]
          });
        }
        setSuccess('Employee created successfully');
      }
      
      fetchEmployees();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setSelectedProjects(employee.projects?.map(p => p.projectId?._id || p.projectId) || []);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '',
      phone: employee.phone || '',
      role: employee.role,
      permissions: employee.permissions || {
        dashboard: true,
        leads: false,
        students: false,
        courses: false,
        tasks: false,
        analytics: false,
        projects: false,
        settings: false
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/users/${employeeId}`);
        setSuccess('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete employee');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setSelectedProjects([]);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'employee',
      permissions: {
        dashboard: true,
        leads: false,
        students: false,
        courses: false,
        tasks: false,
        analytics: false,
        projects: false,
        settings: false
      }
    });
    setError('');
  };

  const toggleEmployeeStatus = async (employeeId, currentStatus) => {
    try {
      await api.put(`/users/${employeeId}`, { isActive: !currentStatus });
      setSuccess('Employee status updated');
      fetchEmployees();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update status');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const permissionLabels = {
    employees: 'Employees',
    dashboard: 'Dashboard',
    leads: 'Leads',
    students: 'Students',
    courses: 'Courses',
    tasks: 'Tasks',
    analytics: 'Analytics',
    projects: 'Projects',
    attendance: 'Attendance',
    leaves: 'Leaves',
    settings: 'Settings'
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard - Employee Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiUserPlus /> Add Employee
        </button>
      </div>

      {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}
      {success && <div className="success-message" style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px' }}>{success}</div>}

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <FiUsers size={24} />
          <h2 style={{ margin: 0 }}>All Employees ({employees.length})</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Department</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Designation</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Projects</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Permissions</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>{employee.name}</td>
                  <td style={{ padding: '12px' }}>{employee.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${employee.role === 'admin' ? 'success' : employee.role === 'manager' ? 'warning' : 'info'}`}>
                      {employee.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{employee.department || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>{employee.designation || 'N/A'}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => toggleEmployeeStatus(employee._id, employee.isActive)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: employee.isActive ? '#10b981' : '#ef4444'
                      }}
                    >
                      {employee.isActive ? <FiCheck /> : <FiX />}
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '200px' }}>
                      {employee.projects && employee.projects.length > 0 ? (
                        employee.projects.map((proj) => (
                          <span key={proj.projectId?._id || proj.projectId} style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            backgroundColor: '#dbeafe', 
                            color: '#1e40af',
                            borderRadius: '4px'
                          }}>
                            {proj.projectId?.name || 'Unknown'}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>No projects</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '250px' }}>
                      {employee.permissions && Object.entries(employee.permissions)
                        .filter(([_, value]) => value)
                        .map(([key]) => (
                          <span key={key} style={{ 
                            fontSize: '11px', 
                            padding: '2px 6px', 
                            backgroundColor: '#e0e7ff', 
                            color: '#4f46e5',
                            borderRadius: '4px'
                          }}>
                            {permissionLabels[key]}
                          </span>
                        ))
                      }
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        <FiEdit2 />
                      </button>
                      {employee._id !== user._id && (
                        <button
                          onClick={() => handleDelete(employee._id)}
                          className="btn"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '14px',
                            backgroundColor: '#ef4444',
                            color: 'white'
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
            maxWidth: '600px', 
            maxHeight: '90vh', 
            overflow: 'auto' 
          }}>
            <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
            {error && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {!editingEmployee && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="employee">Employee</option>
                  <option value="intern">Intern</option>
                  <option value="contractor">Contractor</option>
                  <option value="junior_developer">Junior Developer</option>
                  <option value="developer">Developer</option>
                  <option value="senior_developer">Senior Developer</option>
                  <option value="designer">Designer</option>
                  <option value="qa_engineer">QA Engineer</option>
                  <option value="business_analyst">Business Analyst</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="manager">Manager</option>
                  <option value="department_head">Department Head</option>
                  <option value="hr_manager">HR Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select
                  name="department"
                  className="form-control"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Management">Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  value={formData.designation || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. Software Engineer, Team Lead"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  name="employmentType"
                  className="form-control"
                  value={formData.employmentType || 'full_time'}
                  onChange={handleInputChange}
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '10px' }}>Assign Projects</label>
                <div style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  padding: '10px',
                  backgroundColor: '#f9fafb'
                }}>
                  {projects.length === 0 ? (
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No projects available</p>
                  ) : (
                    projects.map((project) => (
                      <label key={project._id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        backgroundColor: selectedProjects.includes(project._id) ? '#e0e7ff' : 'transparent',
                        marginBottom: '5px'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProjects([...selectedProjects, project._id]);
                            } else {
                              setSelectedProjects(selectedProjects.filter(id => id !== project._id));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px' }}>{project.name}</span>
                      </label>
                    ))
                  )}
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Select projects this employee can access
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '10px' }}>Permissions</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {Object.keys(permissionLabels).map((permission) => (
                    <label key={permission} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: formData.permissions[permission] ? '#e0e7ff' : '#f3f4f6'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.permissions[permission]}
                        onChange={() => handlePermissionChange(permission)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{permissionLabels[permission]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  style={{ flex: 1 }}
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

export default AdminDashboard;
