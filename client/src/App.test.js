import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

// Mock external dependencies
jest.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => <div>{children}</div>,
}));
jest.mock("@supabase/auth-helpers-react", () => ({
  SessionContextProvider: ({ children }) => <div>{children}</div>,
}));
jest.mock("./components/routes/supabaseClient", () => ({
  supabase: {},
}));
jest.mock("./components/PrivateRoute", () => ({ children }) => <div>{children}</div>);

// Mock individual pages
jest.mock("./pages/login/Login", () => () => <div data-testid="login-page">Login Page</div>);
jest.mock("./pages/login/ResetPassword", () => () => <div data-testid="reset-password-page">Reset Password Page</div>);
jest.mock("./Layout", () => () => <div data-testid="layout">Layout</div>);
jest.mock("./pages/dashboard/Dashboard", () => () => <div data-testid="dashboard-page">Dashboard Page</div>);
jest.mock("./pages/admin/Admin", () => () => <div data-testid="admin-page">Admin Page</div>);
jest.mock("./pages/admin/Account", () => () => <div data-testid="account-page">Account Page</div>);
jest.mock("./pages/message/MessagingPage", () => () => <div data-testid="messaging-page">Messaging Page</div>);
jest.mock("./pages/contacts/Contacts", () => () => <div data-testid="contacts-page">Contacts Page</div>);
jest.mock("./pages/patients/newPatient/NewPatient", () => () => <div data-testid="new-patient-page">New Patient Page</div>);
jest.mock("./pages/patients/patientMain/PatientMain", () => () => <div data-testid="patient-main-page">Patient Main Page</div>);
jest.mock("./pages/patients/financial/Financial", () => () => <div data-testid="financial-page">Financial Page</div>);
jest.mock("./pages/patients/healthStatus/HealthStatus", () => () => <div data-testid="health-status-page">Health Status Page</div>);
jest.mock("./pages/patients/soc/SOC", () => () => <div data-testid="soc-page">SOC Page</div>);
jest.mock("./pages/patients/summaries/Summaries", () => () => <div data-testid="summaries-page">Summaries Page</div>);
jest.mock("./pages/patients/medication/Medication", () => () => <div data-testid="medication-page">Medication Page</div>);
jest.mock("./pages/patients/clinical/Clinical", () => () => <div data-testid="clinical-page">Clinical Page</div>);
jest.mock("./pages/payments/Payments", () => () => <div data-testid="payments-page">Payments Page</div>);
jest.mock("./pages/reporting/financialReports/FinancialReports", () => () => <div data-testid="financial-reports-page">Financial Reports Page</div>);
jest.mock("./pages/reporting/reportHistory/ReportHistory", () => () => <div data-testid="report-history-page">Report History Page</div>);

describe("App Component", () => {
  test("renders Login page at '/'", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });


});
