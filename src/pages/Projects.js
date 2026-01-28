import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../redux/slices/projectSlice';
import { FiPlus, FiTrash, FiUsers } from 'react-icons/fi';

const Projects = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects, loading, error } = useSelector((state) => state.projects);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'education'
  });

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createProject(formData));
    setShowModal(false);
    setFormData({ name: '', description: '', type: 'education' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch(deleteProject(id));
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Projects</h1>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus style={{ marginRight: '8px' }} /> Create Project
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : error ? (
        <div className="card" style={{ background: '#fee', border: '1px solid #fcc' }}>
          <p style={{ textAlign: 'center', color: '#c33' }}>
            Error loading projects: {error}
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {projects.map((project) => (
            <div key={project._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>{project.name}</h3>
                {project.owner?._id === user?._id && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '6px 12px' }}
                    onClick={() => handleDelete(project._id)}
                  >
                    <FiTrash />
                  </button>
                )}
              </div>
              <p style={{ color: '#6b7280', marginBottom: '15px' }}>{project.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-info`} style={{ textTransform: 'capitalize' }}>
                  {project.type}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', color: '#6b7280', fontSize: '14px' }}>
                  <FiUsers style={{ marginRight: '5px' }} />
                  {project.team?.length || 0} members
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280' }}>
            No projects yet. Create your first project to get started!
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Project</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., DSA Mentor"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project..."
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Project Type</label>
                <select
                  className="form-control"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="education">Education</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="consulting">Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Project
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
