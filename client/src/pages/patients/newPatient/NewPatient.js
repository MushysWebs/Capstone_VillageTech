import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./NewPatient.css";
import { supabase } from "../../../components/routes/supabaseClient";
import PatientTabs from "../../../components/PatientTabs";
import CreateContactModal from "../../contacts/CreateContactModal";

const OwnerSelection = ({ onSelectOwner, onCreateNewOwner }) => {
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState(null);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    const { data, error } = await supabase
      .from("owners")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Error fetching owners:", error);
    } else {
      setOwners(data);
    }
  };

  const handleOwnerSelect = (owner) => {
    setSelectedOwnerId(owner.id);
    onSelectOwner(owner);
  };

  return (
    <div className="owner-selection">
      <h2>Select an Owner</h2>
      <div className="owner-list">
        {owners.map((owner) => (
          <div
            key={owner.id}
            className={`owner-item ${
              selectedOwnerId === owner.id ? "active" : ""
            }`}
            onClick={() => handleOwnerSelect(owner)}
          >
            <img
              src={owner.profile_picture_url || `/api/placeholder/40/40`}
              alt={`${owner.first_name} ${owner.last_name}`}
              className="owner-avatar"
            />
            <span className="owner-name">
              {owner.last_name}, {owner.first_name}
            </span>
          </div>
        ))}
      </div>
      <button className="create-new-owner-button" onClick={onCreateNewOwner}>
        Create New Owner
      </button>
    </div>
  );
};

const NewPatient = () => {
  const [ownerSelectionState, setOwnerSelectionState] = useState("selecting");
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientDetails, setPatientDetails] = useState({
    patientName: "",
    microchipNumber: "",
    weight: "",
    dateOfBirth: "",
    gender: "",
    species: "",
    breed: "",
    color: "",
    advancedLifeSupport: false,
    currentMedications: "",
    allergiesOrConditions: "",
    demeanor: "",
  });

  const [otherDetails, setOtherDetails] = useState({
    insuranceSupplier: "",
    insuranceNumber: "",
    referringVetOrClinic: "",
    preferredDoctor: "",
    image: null,
  });

  const [tags, setTags] = useState({
    general: "",
    reminder: "",
  });

  const [animalNotes, setAnimalNotes] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [age, setAge] = useState(null);

  const requiredFields = [
    "patientName",
    "weight",
    "dateOfBirth",
    "species",
    "gender",
  ];

  const handleOwnerSelect = (owner) => {
    setSelectedOwner(owner);
    setOwnerSelectionState("selected");
  };

  const handleCreateNewOwner = () => {
    setShowCreateModal(true);
  };

  const handleCreateContact = async (formData) => {
    try {
      const { data, error } = await supabase
        .from("owners")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setSelectedOwner(data);
      setOwnerSelectionState("selected");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating new owner:", error);
      throw error;
    }
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  const validateInput = (name, value) => {
    let error = "";
  
    if (name === "gender" && value === "") {
      error = "Please select a gender"; 
    } else if (requiredFields.includes(name) && value.trim() === "") {
      error = "This field is required";
    } else if (name === "weight" && isNaN(value)) {
      error = "Must be a number";
    }
  
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    const error = validateInput(name, newValue);
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

    setPatientDetails((prevDetails) => ({ ...prevDetails, [name]: newValue }));

    if (name === "dateOfBirth") {
      const calculatedAge = calculateAge(newValue);
      setAge(calculatedAge);
    }
  };

  const handleOtherDetailsChange = (e) => {
    const { name, value } = e.target;
    setOtherDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setOtherDetails((prevDetails) => ({ ...prevDetails, image: file }));
    }
  };

  const handleTagsChange = (e) => {
    const { name, value } = e.target;
    setTags((prevTags) => ({ ...prevTags, [name]: value }));
  };

  const handleImageUpload = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("patient/patient_pictures")
      .upload(fileName, file);

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const { publicURL, error: urlError } = supabase.storage
      .from("patient/patient_pictures")
      .getPublicUrl(fileName);

    if (urlError) {
      console.error("Error getting public URL:", urlError.message);
      return null;
    }

    return publicURL;
  };

  const handleOwnerCreated = (newOwner) => {
    setSelectedOwner(newOwner);
    setOwnerSelectionState("selected");
  };

  const handleCancelNewOwner = () => {
    setOwnerSelectionState("selecting");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    
    let validationErrors = {};
    requiredFields.forEach((field) => {
      if (!patientDetails[field] || patientDetails[field].trim() === "") {
        validationErrors[field] = "This field is required";
      }
    });
  
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Please fill out all required fields before submitting");
      return;
    }
  
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      alert("Please correct the errors before submitting");
      return;
    }
  
    
    try {
      let imageUrl = null;
  
      if (otherDetails.image) {
        imageUrl = await handleImageUpload(otherDetails.image);
      }
  
      const patientDataToInsert = {
        owner_id: selectedOwner.id,
        name: patientDetails.patientName,
        microchip_number: patientDetails.microchipNumber || null,
        weight: patientDetails.weight !== "" ? parseFloat(patientDetails.weight) : null,
        age: age !== "" ? parseInt(age) : null,
        date_of_birth: patientDetails.dateOfBirth || null,
        gender: patientDetails.gender,
        species: patientDetails.species,
        breed: patientDetails.breed || null,
        color: patientDetails.color || null,
        advanced_life_support: patientDetails.advancedLifeSupport,
        notes: animalNotes || null,
        current_medications: patientDetails.currentMedications,
        allergies_or_conditions: patientDetails.allergiesOrConditions,
        demeanor: patientDetails.demeanor,
        general_tag: tags.general,
        reminder_tag: tags.reminder,
        image_url: imageUrl,
      };
  
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .insert([patientDataToInsert])
        .select();
  
      if (patientError) {
        console.error("Error inserting patient:", patientError.details || patientError.message || patientError);
        alert(`Error adding new patient: ${patientError.details || patientError.message}`);
        return;
      }
  
      
      setPatientDetails({
        patientName: "",
        microchipNumber: "",
        weight: "",
        dateOfBirth: "",
        gender: "",
        species: "",
        breed: "",
        color: "",
        advancedLifeSupport: false,
        currentMedications: "",
        allergiesOrConditions: "",
        demeanor: "",
      });
      setOtherDetails({
        insuranceSupplier: "",
        insuranceNumber: "",
        referringVetOrClinic: "",
        preferredDoctor: "",
        image: null,
      });
      setTags({
        general: "",
        reminder: "",
      });
      setAnimalNotes("");
      setImagePreview(null);
    } catch (error) {
      console.error("Error creating new patient:", error.message || error);
      alert(`Failed to create new patient: ${error.message}`);
    }
  };
  
  return (
    <div className="new-patient-page">
      <header className="patientMain-header">
        <PatientTabs />
      </header>
  
      <div className="new-patient-header">
        {ownerSelectionState === "selected" ? (
          <div className="selected-owner-header">
            <h1>{`${selectedOwner.last_name}, ${selectedOwner.first_name}`}</h1>
            <button
              type="button"
              onClick={() => setOwnerSelectionState("selecting")}
            >
              Change Owner
            </button>
          </div>
        ) : (
          <h1>New Patient</h1>
        )}
      </div>
  
      {ownerSelectionState === "selecting" && (
        <div className="owner-selection-container">
          <OwnerSelection
            onSelectOwner={handleOwnerSelect}
            onCreateNewOwner={handleCreateNewOwner}
          />
        </div>
      )}
  
     {showCreateModal && (
        <CreateContactModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateContact={handleCreateContact}
        />
      )}
  
      {ownerSelectionState === "selected" && (
        <form
          className="new-patient-grid new-patient-form"
          onSubmit={handleSubmit}
        >
          <div className="details-section">
            <h2>Pet Details</h2>
            {[
              {
                label: "Patient Name *",
                name: "patientName",
                type: "text",
              },
              {
                label: "Microchip Number",
                name: "microchipNumber",
                type: "text",
              },
              {
                label: "Weight in KG *",
                name: "weight",
                type: "text",
              },
              {
                label: "Date of Birth *",
                name: "dateOfBirth",
                type: "date",
              },
              {
                label: "Species *",
                name: "species",
                type: "text",
              },
              {
                label: "Breed",
                name: "breed",
                type: "text",
              },
              {
                label: "Color",
                name: "color",
                type: "text",
              },
            ].map(({ label, name, type }) => (
              <div key={name} className="input-wrapper">
                <label>
                  {label}
                  {errors[name] && (
                    <span className="error-message-inline">{errors[name]}</span>
                  )}
                </label>
                <input
                  type={type}
                  name={name}
                  value={patientDetails[name]}
                  onChange={handleInputChange}
                  className={errors[name] ? "input-error" : ""}
                />
              </div>
            ))}
  
            <label>Sex *</label>
            <select
              name="gender"
              value={patientDetails.gender}
              onChange={handleInputChange}
              className={errors.gender ? "input-error" : ""}
            >
              <option value="">Select Gender</option> 
              <option value="Male/Neutered">Male/Neutered</option>
              <option value="Male/Unneutered">Male/Unneutered</option>
              <option value="Female/Spayed">Female/Spayed</option>
              <option value="Female/Unspayed">Female/Unspayed</option>
            </select>
            {errors.gender && (
              <span className="error-message-inline">{errors.gender}</span>
            )}
          </div>
  
          <div className="additional-info-section">
            <h2>Additional Information</h2>
            {[
              {
                label: "Current Medications",
                name: "currentMedications",
                type: "text",
              },
              {
                label: "Allergies or Special Conditions",
                name: "allergiesOrConditions",
                type: "text",
              },
              {
                label: "Demeanor",
                name: "demeanor",
                type: "text",
              },
            ].map(({ label, name, type }) => (
              <div key={name} className="input-wrapper">
                <label>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={patientDetails[name] || ""}
                  onChange={handleInputChange}
                  className={errors[name] ? "input-error" : ""}
                />
                {errors[name] && (
                  <span className="error-message-inline">{errors[name]}</span>
                )}
              </div>
            ))}
  
            <div className="notes-subsection">
              <h3>Animal Notes</h3>
              <textarea
                name="animalNotes"
                value={animalNotes}
                onChange={(e) => setAnimalNotes(e.target.value)}
                className={`textarea-large ${
                  errors.animalNotes ? "input-error" : ""
                }`}
                style={{ width: "100%", height: "150px" }}
              />
              {errors.animalNotes && (
                <span className="error-message-inline">
                  {errors.animalNotes}
                </span>
              )}
            </div>
  
            <div className="tags-subsection">
              <h3>Tags</h3>
              {[
                {
                  label: "General",
                  name: "general",
                },
                {
                  label: "Reminder",
                  name: "reminder",
                },
              ].map(({ label, name }) => (
                <div key={name} className="input-wrapper">
                  <label>{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={tags[name] || ""}
                    onChange={handleTagsChange}
                    className={errors[name] ? "input-error" : ""}
                  />
                  {errors[name] && (
                    <span className="error-message-inline">{errors[name]}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
  
          <div className="clinical-details-section">
            <h2>Clinical Details</h2>
            {[
              {
                label: "Insurance Supplier",
                name: "insuranceSupplier",
              },
              {
                label: "Insurance Number",
                name: "insuranceNumber",
              },
              {
                label: "Referring Vet/Clinic",
                name: "referringVetOrClinic",
              },
              {
                label: "Preferred Doctor",
                name: "preferredDoctor",
              },
            ].map(({ label, name }) => (
              <div key={name} className="input-wrapper">
                <label>
                  {label}
                  {errors[name] && (
                    <span className="error-message-inline">{errors[name]}</span>
                  )}
                </label>
                <input
                  type="text"
                  name={name}
                  value={otherDetails[name]}
                  onChange={handleOtherDetailsChange}
                  className={errors[name] ? "input-error" : ""}
                />
              </div>
            ))}
  
            <label>Upload Image</label>
            <input type="file" name="image" onChange={handleImageChange} />
            {imagePreview && (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="image-preview"
                />
              </div>
            )}
            <button type="submit" className="create-patient-button">
              Create Patient
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NewPatient;
