import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiPlus, FiEdit, FiTrash, FiSearch, FiUsers, FiClock, FiDollarSign, FiBookOpen } from 'react-icons/fi';

const Courses = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: '',
    price: '',
    instructor: '',
    curriculum: ''
  });

  const fetchCourses = useCallback(async () => {
    try {
      if (!user?.activeProject?._id) {
        setLoading(false);
        return;
      }
      const response = await api.get(`/courses?projectId=${user.activeProject._id}`);
      setCourses(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.activeProject) {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', { ...formData, projectId: user.activeProject._id });
      setShowModal(false);
      setFormData({ name: '', description: '', duration: '', price: '', instructor: '', curriculum: '' });
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1>Training Programs</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Manage all training courses and programs</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus style={{ marginRight: '8px' }} /> Create Program
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search training programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '35px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="grid grid-3">
          {filteredCourses.map((course) => (
            <div key={course._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px'
                }}>
                  <FiBookOpen />
                </div>
                {(canEdit || canDelete) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {canEdit && (
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '14px' }}>
                        <FiEdit />
                      </button>
                    )}
                    {canDelete && (
                      <button className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '14px' }} onClick={() => deleteCourse(course._id)}>
                        <FiTrash />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>{course.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px', minHeight: '40px' }}>
                {course.description ? course.description.substring(0, 80) + '...' : 'No description available'}
              </p>

              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}>
                    <FiClock />
                    <span>Duration</span>
                  </div>
                  <strong>{course.duration || 'Not set'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}>
                    <FiDollarSign />
                    <span>Price</span>
                  </div>
                  <strong style={{ color: '#0ea5e9' }}>₹{course.price || 0}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '14px' }}>
                    <FiUsers />
                    <span>Enrolled</span>
                  </div>
                  <span className="badge badge-success">{course.students?.length || 0} students</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <div className="card" style={{ padding: '60px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <FiBookOpen style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={{ color: '#6b7280', fontSize: '16px' }}>No training programs found</p>
            <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '8px' }}>Create your first program to start training your team!</p>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create Training Program</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Program Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., DSA Fundamentals"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the training program..."
                ></textarea>
              </div>
              <div className="grid grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 3 months"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 15000"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instructor</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  placeholder="Instructor name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Curriculum</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  placeholder="Key topics covered in this program..."
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Create Program
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
