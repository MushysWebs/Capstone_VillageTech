import React from "react";
import './SOC.css'
import PatientSidebar from "../../../components/patientSideBar/PatientSidebar";

const SOC = () => {

    return(
        <div className="SOC_container"> 
           <PatientSidebar/>
          <div className="standard-of-care">
          </div>
        {/* <Comments /> */}
      </div>
  );
};

export default SOC;