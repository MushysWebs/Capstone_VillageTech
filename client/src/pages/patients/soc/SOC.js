import React from "react";
import './SOC.css'
import PatientSidebar from "../../../components/patientSideBar/PatientSidebar";

const SOC = () => {

    return(
        <div className="SOC_container"> 
            <PatientSidebar/>
        <div className="standard-of-care">
          <h2>Standard Of Care</h2>
          <table>
            <thead>
              <tr>
                <th>Treatment/Vaccine</th>
                <th>Importance</th>
                <th>Fulfilled At</th>
                <th>Next Due</th>
              </tr>
            </thead>
            {/* <tbody>
              {treatments.map(treatment => (
                <tr key={treatment.id}>
                  <td>{treatment.name}</td>
                  <td>{treatment.importance}</td>
                  <td>{treatment.fulfilledAt || 'TBD'}</td>
                  <td>{treatment.nextDue || 'TBD'}</td>
                </tr>
              ))}
            </tbody> */}
          </table>
        </div>
        {/* <Comments /> */}
      </div>
  );
};

export default SOC;