import { useState } from "react";
// import "./AddAllergyModal.css";

const AddAllergyModal = ({ isOpen, onClose, onAddAllergy }) => {
  const [name, setName] = useState("");
  const [reaction, setReaction] = useState("");

  const handleAddAllergy = () => {
    const newAllergy = {
      name,
      reaction,
    };

    onAddAllergy(newAllergy);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setReaction("");
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Allergy</h2>
        <form>
          <label>
            Allergy:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Reaction:
            <input
              type="text"
              required
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
            />
          </label>
          <div className="modal-actions">
            <button type="button" onClick={handleAddAllergy}>
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

export default AddAllergyModal;
