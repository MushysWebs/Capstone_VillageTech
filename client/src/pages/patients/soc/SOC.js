import React, { useEffect, useState } from "react";
import './SOC.css';
import PatientSidebar from "../../../components/patientSideBar/PatientSidebar";

const SOC = () => {
    // const [socData, setSocData] = useState(null);
    // const [comments, setComments] = useState([]);

    // const fetchSOCData = async () => {
    //     // Example API fetch call
    //     const response = await fetch(`/api/soc/${patientId}`);
    //     const data = await response.json();
    //     setSocData(data.socEvents);
    //     setComments(data.comments);
    // };

    // useEffect(() => {
    //     fetchSOCData(); // Fetch initial data

    //     // Set interval to fetch every minute
    //     const interval = setInterval(() => {
    //         fetchSOCData();
    //     }, 60000); // 60000ms = 1 minute

    //     // Cleanup the interval on component unmount
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <div className="SOC_page">
            <PatientSidebar />

            <div className="SOC_container">
                {/* Standard of Care Section */}
                <div className="standard-of-care">
                    <h2>+ Standard Of Care</h2>

                    {socData ? (
                        <div className="soc-table">
                            {/* {socData.map((socEvent, index) => (
                                <div className="soc-row" key={index}>
                                    <div className="soc-item">{socEvent.name}</div>
                                    <div className={`soc-importance ${socEvent.importance}`}>{socEvent.importance}</div>
                                    <div className="soc-fulfilled">{socEvent.fulfilled}</div>
                                    <div className="soc-next-due">{socEvent.nextDue}</div>
                                </div>
                            ))} */}
                        </div>
                    ) : (
                        <p>No SOC events available</p>
                    )}
                </div>

                {/* Comments Section */}
                <div className="comments-section">
                    {/* <h2>+ Comments ({comments.length})</h2>
                    {comments.map((comment, index) => (
                        <div className="comment" key={index}>
                            <p>{comment.text}</p>
                            <div className="comment-meta">
                                <span>{comment.public ? "Public" : "Private"}</span>
                                <span>{comment.date}</span>
                                <span>{comment.author}</span>
                            </div>
                        </div>
                    ))} */}
                </div>
            </div>
        </div>
    );
};

export default SOC;
