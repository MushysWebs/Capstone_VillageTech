import React, { useState } from "react";
import FinancialReportCard from "./FinancialReportCard";
import TotalSalesCard from "./TotalSalesCard"; 
import "./FinancialReports.css"; 
import ReportingTabs from "../../../components/ReportingTabs";

const FinancialReports = () => {
  const data1 = [
    { name: "Grady Spurrill", users: 10 },
    { name: "Day 2", users: 12 },
    { name: "Day 3", users: 9 },
    { name: "Day 4", users: 11 },
    { name: "Day 5", users: 15 },
    { name: "Day 6", users: 17 },
    { name: "Day 7", users: 18 },
    { name: "Day 8", users: 20 },
  ];

  const data2 = [
    { name: "Day 1", users: 1 },
    { name: "Day 2", users: 6 },
    { name: "Day 3", users: 7 },
    { name: "Day 4", users: 8 },
    { name: "Day 5", users: 7 },
    { name: "Day 6", users: 10 },
    { name: "Day 7", users: 6 },
    { name: "Day 9", users: 14 },
  ];

  const totalSales = 1253.67; // Set your total sales amount

  const [selectedReport, setSelectedReport] = useState("appointmentsToday");
  const [reportData, setReportData] = useState(data1);

  const handleReportChange = (event) => {
    const reportType = event.target.value;
    setSelectedReport(reportType);
    if (reportType === "appointmentsToday") {
      setReportData(data1);
    } else if (reportType === "appointmentsTomorrow") {
      setReportData(data2);
    }
    // Add more conditions if you have more reports
  };

  return (
    <div className="financial-reports-container">
      <ReportingTabs />
    <div className="container">
      <TotalSalesCard totalSales={totalSales} />

      <div className="card-container">
        <FinancialReportCard
          data={data1}
          title="Appointments Today"
          count="34"
          percentage="+25%"
        />

        <FinancialReportCard
          data={data2}
          title="Appointments Tomorrow"
          count="5"
          percentage="+15%"
        />
      </div>

      <div className="reporting-section">
        <div className="time-period-selector">
          <button className="time-period-selector-button">Daily</button>
          <button className="time-period-selector-button">Weekly</button>
          <button className="time-period-selector-button">Monthly</button>
        </div>
        
        <h2 className="financial-h2">Reports</h2>
        <select value={selectedReport} onChange={handleReportChange}>
          <option value="appointmentsToday">Appointments Today</option>
          <option value="appointmentsTomorrow">Appointments Tomorrow</option>
          {/* Add more options here */}
        </select>

        <div className="table-container">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Name</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>dummy data</td>
                  <td>dummy data</td>
                  <td>dummy data</td>
                  <td>dummy data</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
};

export default FinancialReports;
