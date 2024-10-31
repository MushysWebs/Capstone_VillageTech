import React, { useState, useEffect } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import FinancialReportCard from "./FinancialReportCard";
import TotalSalesCard from "./TotalSalesCard";
import "./FinancialReports.css";
import ReportingTabs from "../../../components/ReportingTabs";

const FinancialReports = () => {
  const [appointments, setAppointments] = useState([]);
  const [paidReceipts, setPaidReceipts] = useState([]);
  const [totalSalesToday, setTotalSalesToday] = useState(0);
  const supabase = useSupabaseClient();

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("id, title, start_time, end_time, status");

      if (error) throw error;

      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointment data:", err.message);
    }
  };

  const fetchReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select(
          "receipt_id, invoice_id, patient_id, receipt_total, receipt_date, receipt_pdf_url"
        );

      if (error) throw error;
      setPaidReceipts(data);
    } catch (err) {
      console.error("Error fetching receipt data:", err.message);
    }
  };

  const fetchTotalSalesToday = async () => {
    try {
      const { data, error } = await supabase
        .from("receipts")
        .select("receipt_total")
        .gte("receipt_date", `${getTodayDate()}T00:00:00`)
        .lte("receipt_date", `${getTodayDate()}T23:59:59`);

      if (error) throw error;

      const total = data.reduce(
        (sum, receipt) => sum + receipt.receipt_total,
        0
      );
      setTotalSalesToday(total);
    } catch (err) {
      console.error("Error fetching today's total sales:", err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchReceipts();
    fetchTotalSalesToday();
  }, []);

  return (
    <div className="financial-reports-container">
      <ReportingTabs />
      <div className="container">
        <div className="top-section">
          <TotalSalesCard totalSales={totalSalesToday} />
          <FinancialReportCard
            data={appointments}
            title="Appointments Today"
            count={appointments.length}
            percentage="+25%"
          />
          <FinancialReportCard
            data={appointments}
            title="Appointments Tomorrow"
            count="5"
            percentage="+15%"
          />
        </div>

        <div className="reporting-section">
          <h2 className="financial-h2">Reports</h2>

          <div className="table-container">
            <div className="table-wrapper">
              <h3>Pending Appointments</h3>
              <div className="table-scroll">
                <table className="appointments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>{appointment.title}</td>
                        <td>
                          {new Date(appointment.start_time).toLocaleString()}
                        </td>
                        <td>
                          {new Date(appointment.end_time).toLocaleString()}
                        </td>
                        <td>{appointment.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="table-wrapper">
              <h3>Paid Invoices</h3>
              <div className="table-scroll">
                <table className="receipts-table">
                  <thead>
                    <tr>
                      <th>Receipt ID</th>
                      <th>Invoice ID</th>
                      <th>Patient ID</th>
                      <th>Total</th>
                      <th>Date</th>
                      <th>PDF URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paidReceipts.map((receipt) => (
                      <tr key={receipt.receipt_id}>
                        <td>{receipt.receipt_id}</td>
                        <td>{receipt.invoice_id}</td>
                        <td>{receipt.patient_id}</td>
                        <td>{receipt.receipt_total.toFixed(2)}</td>
                        <td>
                          {new Date(receipt.receipt_date).toLocaleDateString()}
                        </td>
                        <td>
                          <a
                            href={receipt.receipt_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
