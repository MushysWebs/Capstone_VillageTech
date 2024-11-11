import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { PatientProvider } from "./context/PatientContext"; 
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "./components/routes/supabaseClient";
import Login from "./pages/login/Login";
import Layout from "./Layout";
import Dashboard from "./pages/dashboard/Dashboard";
import Contacts from "./pages/contacts/Contacts";
import Admin from "./pages/admin/Admin";
import MessagingPage from "./pages/message/MessagingPage";
import PrivateRoute from "./components/PrivateRoute";
import NewPatient from "./pages/patients/newPatient/NewPatient";
import PatientMain from "./pages/patients/patientMain/PatientMain";
import Financial from "./pages/patients/financial/Financial";
import HealthStatus from "./pages/patients/healthStatus/HealthStatus";
import SOC from "./pages/patients/soc/SOC";
import Summaries from "./pages/patients/summaries/Summaries";
import Medication from "./pages/patients/medication/Medication";
import Clinical from "./pages/patients/clinical/Clinical";
import Payments from "./pages/payments/Payments";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import FinancialReports from "./pages/reporting/financialReports/FinancialReports";
import ReportHistory from "./pages/reporting/reportHistory/ReportHistory";
import ResetPassword from "./pages/login/ResetPassword";
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      <SessionContextProvider supabaseClient={supabase}>
        <Router>
          <PatientProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/messages" element={<MessagingPage />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/patient" element={<PatientMain />} />
                  <Route path="/SOC" element={<SOC />} />
                  <Route path="/newPatient" element={<NewPatient />} />
                  <Route path="/financial" element={<Financial />} />
                  <Route path="/healthStatus" element={<HealthStatus />} />
                  <Route path="/summaries" element={<Summaries />} />
                  <Route path="/medication" element={<Medication />} />
                  <Route path="/clinical" element={<Clinical />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/reporting/history" element={<ReportHistory />} />
                  <Route path="/reporting" element={<FinancialReports />} />
                  
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PatientProvider>
        </Router>
      </SessionContextProvider>
    </Elements>
  );
}

export default App;
