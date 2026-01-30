import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { FiPlus, FiEdit, FiTrash, FiClock, FiCheckCircle } from 'react-icons/fi';

const Tasks = () => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tooltipTask, setTooltipTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const fetchTasks = useCallback(async () => {
    try {
      if (!user?.activeProject?._id) {
        setLoading(false);
        return;
      }
      const response = await api.get(`/tasks?projectId=${user.activeProject._id}`);
      setTasks(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  }, [user]);

  const fetchEmployees = useCallback(async () => {
    try {
      if (!user?.activeProject?._id) {
        setEmployees([]);
        return;
      }
      // Fetch users (employees) instead of students for task assignment
      const response = await api.get(`/users?projectId=${user.activeProject._id}`);
      // Filter for employees and managers who are active
      const activeEmployees = response.data.data.filter(emp => 
        emp.isActive && ['employee', 'manager'].includes(emp.role)
      );
      setEmployees(activeEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    }
  }, [user]);

  useEffect(() => {
    if (user?.activeProject) {
      fetchTasks();
      fetchEmployees();
    }
  }, [user, fetchTasks, fetchEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data, removing empty assignedTo field
      const taskData = { ...formData };
      if (!taskData.assignedTo) {
        delete taskData.assignedTo;
      }
      
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, taskData);
      } else {
        await api.post('/tasks', { ...taskData, projectId: user.activeProject._id });
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: new Date().toISOString().split('T')[0] });
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        const errorMessage = error.response?.data?.error || 'Failed to delete task';
        alert(errorMessage);
      }
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update task status';
      alert(errorMessage);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getLastStatusChanger = (task) => {
    if (!task.statusHistory || task.statusHistory.length === 0) {
      return null;
    }
    const lastEntry = task.statusHistory[task.statusHistory.length - 1];
    return lastEntry.changedBy;
  };

  const formatStatusHistory = (history) => {
    if (!history || history.length === 0) return [];
    return history.map((entry, index) => ({
      ...entry,
      displayDate: new Date(entry.changedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  const groupedTasks = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed')
  };

  // Check if user can edit/delete/create tasks - admin and manager have full control
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin' || user?.role === 'manager';
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
          <h1>Tasks</h1>
          <p style={{ color: '#64748b', marginTop: '5px' }}>Track and manage all your tasks</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', status: 'pending', dueDate: new Date().toISOString().split('T')[0] }); setShowModal(true); }}>
            <FiPlus style={{ marginRight: '8px' }} /> Add Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="grid grid-3">
          {/* Pending Column */}
          <div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '12px 16px', borderRadius: '8px 8px 0 0', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Pending</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)' }}>{groupedTasks.pending.length}</span>
            </div>
            <div style={{ background: '#fffbeb', padding: '12px', minHeight: '400px', borderRadius: '0 0 8px 8px' }}>
              {groupedTasks.pending.map((task) => (
                <div key={task._id} className="card" style={{ marginBottom: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', margin: 0, flex: 1 }}>{task.title}</h4>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(task.priority), marginLeft: '8px', marginTop: '4px' }}></div>
                  </div>
                  {task.description && <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{task.description.substring(0, 60)}...</p>}
                  {task.assignedTo && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                      <strong>Assigned to:</strong> {task.assignedTo.name}
                    </div>
                  )}
                  {getLastStatusChanger(task) && (
                    <div 
                      style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px', cursor: 'pointer', position: 'relative' }}
                      onMouseEnter={() => setTooltipTask(task._id)}
                      onMouseLeave={() => setTooltipTask(null)}
                    >
                      <strong>Status by:</strong> {getLastStatusChanger(task).name}
                      {tooltipTask === task._id && task.statusHistory && task.statusHistory.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '0',
                          background: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          minWidth: '200px',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          marginBottom: '5px'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>Status History</div>
                          {formatStatusHistory(task.statusHistory).reverse().map((entry, idx) => (
                            <div key={idx} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: idx < task.statusHistory.length - 1 ? '1px solid #374151' : 'none' }}>
                              <div style={{ color: '#10b981' }}>{getStatusLabel(entry.status)}</div>
                              <div style={{ color: '#9ca3af', fontSize: '10px' }}>{entry.changedBy?.name || 'Unknown'}</div>
                              <div style={{ color: '#6b7280', fontSize: '9px' }}>{entry.displayDate}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', marginBottom: '10px' }}>
                    <FiClock />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }} onClick={() => updateTaskStatus(task._id, 'in_progress')}>Start</button>
                    {canEdit && <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => openEditModal(task)}><FiEdit /></button>}
                    {canDelete && <button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => deleteTask(task._id)}><FiTrash /></button>}
                  </div>
                </div>
              ))}
              {groupedTasks.pending.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No pending tasks</p>}
            </div>
          </div>

          {/* In Progress Column */}
          <div>
            <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', padding: '12px 16px', borderRadius: '8px 8px 0 0', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>In Progress</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)' }}>{groupedTasks.in_progress.length}</span>
            </div>
            <div style={{ background: '#f0f9ff', padding: '12px', minHeight: '400px', borderRadius: '0 0 8px 8px' }}>
              {groupedTasks.in_progress.map((task) => (
                <div key={task._id} className="card" style={{ marginBottom: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', margin: 0, flex: 1 }}>{task.title}</h4>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityColor(task.priority), marginLeft: '8px', marginTop: '4px' }}></div>
                  </div>
                  {task.description && <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{task.description.substring(0, 60)}...</p>}
                  {task.assignedTo && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                      <strong>Assigned to:</strong> {task.assignedTo.name}
                    </div>
                  )}
                  {getLastStatusChanger(task) && (
                    <div 
                      style={{ fontSize: '11px', color: '#0ea5e9', marginBottom: '6px', fontWeight: '500', cursor: 'pointer', position: 'relative' }}
                      onMouseEnter={() => setTooltipTask(task._id)}
                      onMouseLeave={() => setTooltipTask(null)}
                    >
                      <strong>In progress by:</strong> {getLastStatusChanger(task).name}
                      {tooltipTask === task._id && task.statusHistory && task.statusHistory.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '0',
                          background: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          minWidth: '200px',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          marginBottom: '5px'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>Status History</div>
                          {formatStatusHistory(task.statusHistory).reverse().map((entry, idx) => (
                            <div key={idx} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: idx < task.statusHistory.length - 1 ? '1px solid #374151' : 'none' }}>
                              <div style={{ color: '#10b981' }}>{getStatusLabel(entry.status)}</div>
                              <div style={{ color: '#9ca3af', fontSize: '10px' }}>{entry.changedBy?.name || 'Unknown'}</div>
                              <div style={{ color: '#6b7280', fontSize: '9px' }}>{entry.displayDate}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', marginBottom: '10px' }}>
                    <FiClock />
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-primary" style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }} onClick={() => updateTaskStatus(task._id, 'completed')}>Complete</button>
                    {canEdit && <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => openEditModal(task)}><FiEdit /></button>}
                    {canDelete && <button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => deleteTask(task._id)}><FiTrash /></button>}
                  </div>
                </div>
              ))}
              {groupedTasks.in_progress.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No tasks in progress</p>}
            </div>
          </div>

          {/* Completed Column */}
          <div>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '12px 16px', borderRadius: '8px 8px 0 0', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Completed</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)' }}>{groupedTasks.completed.length}</span>
            </div>
            <div style={{ background: '#f0fdf4', padding: '12px', minHeight: '400px', borderRadius: '0 0 8px 8px' }}>
              {groupedTasks.completed.map((task) => (
                <div key={task._id} className="card" style={{ marginBottom: '12px', padding: '12px', opacity: 0.8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', margin: 0, flex: 1, textDecoration: 'line-through', color: '#6b7280' }}>{task.title}</h4>
                    <FiCheckCircle style={{ color: '#10b981', marginLeft: '8px' }} />
                  </div>
                  {task.description && <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>{task.description.substring(0, 60)}...</p>}
                  {task.assignedTo && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }}>
                      <strong>Assigned to:</strong> {task.assignedTo.name}
                    </div>
                  )}
                  {getLastStatusChanger(task) && (
                    <div 
                      style={{ fontSize: '11px', color: '#10b981', marginBottom: '6px', fontWeight: '500', cursor: 'pointer', position: 'relative' }}
                      onMouseEnter={() => setTooltipTask(task._id)}
                      onMouseLeave={() => setTooltipTask(null)}
                    >
                      <strong>Completed by:</strong> {getLastStatusChanger(task).name}
                      {tooltipTask === task._id && task.statusHistory && task.statusHistory.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '0',
                          background: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          minWidth: '200px',
                          zIndex: 1000,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                          marginBottom: '5px'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '6px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>Status History</div>
                          {formatStatusHistory(task.statusHistory).reverse().map((entry, idx) => (
                            <div key={idx} style={{ marginBottom: '4px', paddingBottom: '4px', borderBottom: idx < task.statusHistory.length - 1 ? '1px solid #374151' : 'none' }}>
                              <div style={{ color: '#10b981' }}>{getStatusLabel(entry.status)}</div>
                              <div style={{ color: '#9ca3af', fontSize: '10px' }}>{entry.changedBy?.name || 'Unknown'}</div>
                              <div style={{ color: '#6b7280', fontSize: '9px' }}>{entry.displayDate}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {canEdit && <button className="btn btn-secondary" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => openEditModal(task)}><FiEdit /></button>}
                    {canDelete && <button className="btn btn-danger" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => deleteTask(task._id)}><FiTrash /></button>}
                  </div>
                </div>
              ))}
              {groupedTasks.completed.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No completed tasks</p>}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  placeholder="Task details..."
                ></textarea>
              </div>
              <div className="grid grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Assign to Employee (Optional)</label>
                <select
                  className="form-control"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                >
                  <option value="">-- Not Assigned --</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} ({employee.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                {editingTask ? 'Update Task' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
