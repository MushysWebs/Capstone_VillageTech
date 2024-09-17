import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from './components/routes/supabaseClient';
import Login from './pages/login/Login';
import Layout from './Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Contacts from './pages/contacts/Contacts';
import Admin from './pages/admin/Admin';
import MessagingPage from './pages/message/MessagingPage';
import PrivateRoute from './components/PrivateRoute';
import NewPatient from './pages/patients/newPatient/NewPatient';
import PatientMain from './pages/patients/patientMain/PatientMain';
import Financial from './pages/patients/financial/Financial'


function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute />}>

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/messages" element={<MessagingPage />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/patient" element={<PatientMain />} />
              <Route path="/newPatient" element={<NewPatient />} />
              <Route path="/financial" element={<Financial />} />
            </Route>

          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </SessionContextProvider>
  );
}

export default App;