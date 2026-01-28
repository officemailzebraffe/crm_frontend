import React, { useState, useMemo, useCallback } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, switchProject } from '../redux/slices/authSlice';
import { FiHome, FiUsers, FiUserCheck, FiBookOpen, FiCheckSquare, FiBarChart2, FiBriefcase, FiSettings, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi';
import Logo from './Logo';
import './Layout.css';

const Layout = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleProjectSwitch = useCallback((projectId) => {
    dispatch(switchProject(projectId));
    setShowProjectDropdown(false);
  }, [dispatch]);

  const menuItems = useMemo(() => [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard', permission: 'dashboard' },
    { path: '/admin', icon: FiShield, label: 'Admin Panel', permission: 'admin', adminOnly: true },
    { path: '/leads', icon: FiUsers, label: 'Prospects', permission: 'leads' },
    { path: '/students', icon: FiUserCheck, label: 'Employees', permission: 'students' },
    { path: '/courses', icon: FiBookOpen, label: 'Trainings', permission: 'courses' },
    { path: '/tasks', icon: FiCheckSquare, label: 'Tasks', permission: 'tasks' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics', permission: 'analytics' },
    { path: '/projects', icon: FiBriefcase, label: 'Projects', permission: 'projects' },
    { path: '/settings', icon: FiSettings, label: 'Settings', permission: 'settings' },
  ], []);

  // Filter menu items based on user permissions
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Admin can see all items
      if (user?.role === 'admin') return true;
      
      // Hide admin-only items from non-admins
      if (item.adminOnly) return false;
      
      // Check if user has permission for this item
      return user?.permissions?.[item.permission] === true;
    });
  }, [user, menuItems]);

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <Logo 
              src="/logo.png" 
              alt="CRM Portal Logo" 
              className="sidebar-logo"
              style={{ width: sidebarOpen ? '40px' : '32px', height: sidebarOpen ? '40px' : '32px' }}
            />
            {sidebarOpen && <h2>CRM Portal</h2>}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Project Selector */}
        {user && user.projects && user.projects.length > 0 && (
          <div className="project-selector">
            <button
              className="project-dropdown-btn"
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            >
              <span className="project-name">
                {user.activeProject?.name || 'Select Project'}
              </span>
              <span>▼</span>
            </button>
            {showProjectDropdown && (
              <div className="project-dropdown">
                {user.projects.map((project) => {
                  const projectId = project.projectId?._id || project.projectId;
                  const projectName = project.projectId?.name || 'Unknown Project';
                  return (
                    <div
                      key={projectId}
                      className={`project-item ${
                        user.activeProject?._id === projectId ? 'active' : ''
                      }`}
                      onClick={() => handleProjectSwitch(projectId)}
                    >
                      <span>{projectName}</span>
                      <span className="project-role">{project.role}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-item"
            >
              <item.icon className="nav-icon" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FiMenu />
          </button>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
