import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useDispatch } from 'react-redux';
import { getMe } from './redux/slices/authSlice';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PermissionRoute from './components/PermissionRoute';
import './App.css';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={
            <PermissionRoute permission="dashboard">
              <Dashboard />
            </PermissionRoute>
          } />
          <Route path="admin" element={
            <PermissionRoute adminOnly={true}>
              <AdminDashboard />
            </PermissionRoute>
          } />
          <Route path="attendance" element={
            <PermissionRoute permission="attendance">
              <Attendance />
            </PermissionRoute>
          } />
          <Route path="leaves" element={
            <PermissionRoute permission="leaves">
              <Leaves />
            </PermissionRoute>
          } />
          <Route path="leads" element={
            <PermissionRoute permission="leads">
              <Leads />
            </PermissionRoute>
          } />
          <Route path="students" element={
            <PermissionRoute permission="students">
              <Students />
            </PermissionRoute>
          } />
          <Route path="courses" element={
            <PermissionRoute permission="courses">
              <Courses />
            </PermissionRoute>
          } />
          <Route path="tasks" element={
            <PermissionRoute permission="tasks">
              <Tasks />
            </PermissionRoute>
          } />
          <Route path="analytics" element={
            <PermissionRoute permission="analytics">
              <Analytics />
            </PermissionRoute>
          } />
          <Route path="projects" element={
            <PermissionRoute permission="projects">
              <Projects />
            </PermissionRoute>
          } />
          <Route path="settings" element={
            <PermissionRoute permission="settings">
              <Settings />
            </PermissionRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
