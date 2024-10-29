import { useState } from "react";
// import "./AddNoteModal.css";

const AddNoteModal = ({ isOpen, onClose, onAddNote }) => {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const handleAddNote = () => {
    const newNote = {
      date,
      note,
    };

    onAddNote(newNote);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setDate("");
    setNote("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Note</h2>
        <form>
          <label>
            Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label>
            Note:
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={handleAddNote}>
              Add
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
