import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Admin from './Admin';
import MessagingPage from './MessagingPage';
import PrivateRoute from './PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/messages" element={<MessagingPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;