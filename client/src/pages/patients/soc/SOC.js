import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../components/routes/supabaseClient";
import { usePatient } from "../../../context/PatientContext";
import PatientSidebar from "../../../components/patientSidebar/PatientSidebar";
import "./SOC.css";
import PatientTabs from "../../../components/PatientTabs";

const SOC = () => {
  const { selectedPatient } = usePatient();
  const [socEvents, setSocEvents] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [commentsData, setCommentsData] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newEvent, setNewEvent] = useState({
    event_name: "",
    type: "Treatment",
    importance: "Core",
    fulfilled_at: "",
    next_due: "",
    comments: "",
  });
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const commentToEdit = useRef(null);

  useEffect(() => {
    if (selectedPatient) {
      fetchSocEvents();
      fetchVaccinations();
      fetchComments();
    }
  }, [selectedPatient]);

  const fetchSocEvents = async () => {
    const { data, error } = await supabase
      .from("soc")
      .select("*")
      .eq("patient_id", selectedPatient.id);

    if (error) {
      console.error("Error fetching SOC events:", error.message);
    } else {
      setSocEvents(data);
    }
  };

  const fetchVaccinations = async () => {
    const { data, error } = await supabase
      .from("vaccinations")
      .select("*")
      .eq("patient_id", selectedPatient.id);

    if (error) {
      console.error("Error fetching vaccinations:", error.message);
    } else {
      setVaccinations(data);
    }
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("soc_comments")
      .select("*")
      .eq("patient_id", selectedPatient.id);

    if (error) {
      console.error("Error fetching comments:", error.message);
    } else {
      setCommentsData(data);
    }
  };

  const handleEventTypeChange = (e) => {
    const selectedType = e.target.value;

    if (selectedType === "Vaccination") {
      setNewEvent({ ...newEvent, type: selectedType, importance: "Core" });
    } else {
      setNewEvent({ ...newEvent, type: selectedType });
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newEvent.event_name) {
      setErrorMessage("Event name is required.");
      return;
    }

    const eventToInsert = {
      ...newEvent,
      next_due: newEvent.next_due || null, 
      patient_id: selectedPatient.id,
    };

    try {
      if (newEvent.type === "Vaccination") {
        const { error: vaccinationError } = await supabase
          .from("vaccinations")
          .insert({
            patient_id: selectedPatient.id,
            name: newEvent.event_name,
            date_given: newEvent.fulfilled_at || null,
            next_due: newEvent.next_due || null,
            importance: "Core",
          });
        if (vaccinationError) throw vaccinationError;
      }

      const { error } = await supabase.from("soc").insert([eventToInsert]);
      if (error) throw error;

      alert("Event added successfully.");
      fetchSocEvents();
      fetchVaccinations();
      setNewEvent({
        event_name: "",
        type: "Treatment",
        importance: "Core",
        fulfilled_at: "",
        next_due: "",
        comments: "",
      });
      setShowEventModal(false);
    } catch (error) {
      setErrorMessage(
        "Unable to add the event. Please ensure all required fields are filled out."
      );
    }
  };

  const handleEditEvent = (event) => {
    setNewEvent(event);
    setShowEventModal(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newEvent.event_name) {
      setErrorMessage("Event name is required.");
      return;
    }

    try {
      const { error } = await supabase
        .from("soc")
        .update({
          event_name: newEvent.event_name,
          type: newEvent.type,
          importance: newEvent.importance,
          fulfilled_at: newEvent.fulfilled_at || null,
          next_due: newEvent.next_due || null,
          comments: newEvent.comments,
        })
        .eq("id", newEvent.id);
      if (error) throw error;

      alert("Event updated successfully.");
      fetchSocEvents();
      setNewEvent({
        event_name: "",
        type: "Treatment",
        importance: "Core",
        fulfilled_at: "",
        next_due: "",
        comments: "",
      });
      setShowEventModal(false);
    } catch (error) {
      setErrorMessage(
        "Unable to update the event. Please ensure all required fields are filled out."
      );
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newComment) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    try {
      const { error } = await supabase
        .from("soc_comments")
        .insert([{ patient_id: selectedPatient.id, comment: newComment }]);
      if (error) throw error;

      alert("Comment added successfully.");
      setNewComment("");
      fetchComments();
      setShowCommentModal(false);
    } catch (error) {
      setErrorMessage(
        "Unable to add the comment. Please ensure all required fields are filled out."
      );
    }
  };

  const handleEditComment = (comment) => {
    setNewComment(comment.comment);
    setShowCommentModal(true);
    commentToEdit.current = comment.id;
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newComment) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    try {
      const { error } = await supabase
        .from("soc_comments")
        .update({ comment: newComment })
        .eq("id", commentToEdit.current);
      if (error) throw error;

      alert("Comment updated successfully.");
      fetchComments();
      setNewComment("");
      setShowCommentModal(false);
      commentToEdit.current = null;
    } catch (error) {
      setErrorMessage(
        "Unable to update the comment. Please ensure all required fields are filled out."
      );
    }
  };
  
  return (
    <div className="SOC-main">
      <PatientSidebar />
  
      <div className="SOC-page">
        <header className="SOC-patient-header">
          <PatientTabs />
        </header>
  
        <div className="SOC-section-box">
          <h2 className="SOC-section-header">Standard of Care Events</h2>
          <table className="SOC-soc-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Treatment/Vaccine</th>
                <th>Importance</th>
                <th>Fulfilled At</th>
                <th>Next Due</th>

              </tr>
            </thead>
            <tbody>
              {vaccinations.map((vac) => (
                <tr key={vac.id}>
                  <td>Vaccination</td>
                  <td>{vac.name}</td>
                  <td className="SOC-core">Core</td>
                  <td>
                    {vac.date_given
                      ? new Date(vac.date_given).toLocaleDateString()
                      : "TBD"}
                  </td>
                  <td>
                    {vac.next_due && vac.next_due !== "N/A"
                      ? new Date(vac.next_due).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="SOC-edit-button"
                      onClick={() => handleEditEvent(vac)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {socEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.type}</td>
                  <td>{event.event_name}</td>
                  <td
                    className={
                      event.importance === "Required"
                        ? "SOC-required"
                        : event.importance === "Core"
                        ? "SOC-core"
                        : "SOC-non-core"
                    }
                  >
                    {event.importance}
                  </td>
                  <td>
                    {event.fulfilled_at
                      ? new Date(event.fulfilled_at).toLocaleDateString()
                      : "TBD"}
                  </td>
                  <td>
                    {event.next_due && event.next_due !== "N/A"
                      ? new Date(event.next_due).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      className="SOC-edit-button"
                      onClick={() => handleEditEvent(event)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  
          <button
            onClick={() => {
              setNewEvent({
                event_name: "",
                type: "Treatment",
                importance: "Core",
                fulfilled_at: "",
                next_due: "",
                comments: "",
              });
              setShowEventModal(true);
            }}
            className="SOC-add-event-button"
          >
            + Add SOC Event
          </button>
  
          {showEventModal && (
            <div className="SOC-modal">
              <div className="SOC-modal-content">
                <h3>{newEvent.id ? "Edit SOC Event" : "Add New SOC Event"}</h3>
                <form
                  onSubmit={newEvent.id ? handleUpdateEvent : handleAddEvent}
                >
                  <label htmlFor="event_name">Event Name</label>
                  <input
                    type="text"
                    id="event_name"
                    name="event_name"
                    value={newEvent.event_name}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_name: e.target.value })
                    }
                    required
                  />
  
                  <label htmlFor="type">Type (Vaccination or Treatment)</label>
                  <select
                    id="type"
                    name="type"
                    value={newEvent.type}
                    onChange={handleEventTypeChange}
                    required
                  >
                    <option value="Treatment">Treatment</option>
                    <option value="Vaccination">Vaccination</option>
                  </select>
  
                  <label htmlFor="importance">Importance</label>
                  <select
                    id="importance"
                    name="importance"
                    value={newEvent.importance}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, importance: e.target.value })
                    }
                    required
                    disabled={newEvent.type === "Vaccination"}
                  >
                    <option value="Core">Core</option>
                    <option value="Required">Required</option>
                    <option value="Non-Core">Non-Core</option>
                  </select>
  
                  <label htmlFor="fulfilled_at">Fulfilled At</label>
                  <input
                    type="date"
                    id="fulfilled_at"
                    name="fulfilled_at"
                    value={newEvent.fulfilled_at}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        fulfilled_at: e.target.value,
                      })
                    }
                  />
  
                  <label htmlFor="next_due">Next Due (Optional)</label>
                  <input
                    type="date"
                    id="next_due"
                    name="next_due"
                    value={newEvent.next_due}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, next_due: e.target.value })
                    }
                  />
  
                  {errorMessage && (
                    <p className="SOC-error-message">{errorMessage}</p>
                  )}
  
                  <div className="SOC-button-container">
                    <button
                      type="submit"
                      className="SOC-add-event-button-modal"
                    >
                      {newEvent.id ? "Update SOC Event" : "Add SOC Event"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEventModal(false)}
                      className="SOC-close-modal"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
  
        <div className="SOC-comments-section">
          <h2 className="SOC-section-header">Comments</h2>
          {commentsData.length > 0 ? (
            <table className="SOC-comments-table">
              <thead>
                <tr>
                  <th>Comment</th>
                  <th>Date Created</th>

                </tr>
              </thead>
              <tbody>
                {commentsData.map((comment) => (
                  <tr key={comment.id}>
                    <td>{comment.comment}</td>
                    <td>{new Date(comment.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="SOC-edit-button"
                        onClick={() => handleEditComment(comment)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No comments yet.</p>
          )}
  
          <button
            onClick={() => {
              setNewComment("");
              setShowCommentModal(true);
              commentToEdit.current = null;
            }}
            className="SOC-add-comment-button"
          >
            + Add Comment
          </button>
  
          {showCommentModal && (
            <div className="SOC-modal">
              <div className="SOC-modal-content">
                <h3>{commentToEdit.current ? "Edit Comment" : "Add Comment"}</h3>
                <form
                  onSubmit={
                    commentToEdit.current
                      ? handleUpdateComment
                      : handleAddComment
                  }
                >
                  <label htmlFor="comment">Comment</label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                  {errorMessage && (
                    <p className="SOC-error-message">{errorMessage}</p>
                  )}
                  <div className="SOC-button-container">
                    <button
                      type="submit"
                      className="SOC-add-comment-button-modal"
                    >
                      {commentToEdit.current ? "Update Comment" : "Add Comment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCommentModal(false)}
                      className="SOC-close-modal"
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default SOC;
