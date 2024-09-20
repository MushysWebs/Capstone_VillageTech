import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './NewPatient.css';
import { supabase } from '../../../components/routes/supabaseClient';

const OwnerSelection = ({ onSelectOwner, onCreateNewOwner }) => {
    const [owners, setOwners] = useState([]);
    const [selectedOwnerId, setSelectedOwnerId] = useState(null);
  
    useEffect(() => {
      fetchOwners();
    }, []);
  
    const fetchOwners = async () => {
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('last_name', { ascending: true });
  
      if (error) {
        console.error('Error fetching owners:', error);
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
              className={`owner-item ${selectedOwnerId === owner.id ? 'active' : ''}`}
              onClick={() => handleOwnerSelect(owner)}
            >
              <img
                src={owner.profile_picture_url || `/api/placeholder/40/40`}
                alt={`${owner.first_name} ${owner.last_name}`}
                className="owner-avatar"
              />
              <span className="owner-name">{owner.last_name}, {owner.first_name}</span>
            </div>
          ))}
        </div>
        <button className="create-new-owner-button" onClick={onCreateNewOwner}>
          Create New Owner
        </button>
      </div>
    );
  };
  
  const NewOwnerForm = ({ onCreateOwner, onCancel }) => {
    const [newOwner, setNewOwner] = useState({ first_name: '', last_name: '', email: '', phone_number: '' });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewOwner((prev) => ({ ...prev, [name]: value }));
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      const { data, error } = await supabase
        .from('owners')
        .insert([newOwner])
        .select();
  
      if (error) {
        console.error('Error creating new owner:', error);
        alert('Failed to create new owner');
      } else {
        onCreateOwner(data[0]);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className="new-owner-form">
        <h2>Create New Owner</h2>
        <input
          type="text"
          name="first_name"
          value={newOwner.first_name}
          onChange={handleInputChange}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="last_name"
          value={newOwner.last_name}
          onChange={handleInputChange}
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="email"
          value={newOwner.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
        />
        <input
          type="tel"
          name="phone_number"
          value={newOwner.phone_number}
          onChange={handleInputChange}
          placeholder="Phone Number"
          required
        />
        <button type="submit">Create Owner</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </form>
    );
  };

const NewPatient = () => {
    const [ownerSelectionState, setOwnerSelectionState] = useState('selecting');
    const [selectedOwner, setSelectedOwner] = useState(null);
    const [patientDetails, setPatientDetails] = useState({
        patientName: '',
        microchipNumber: '',
        weight: '',
        rabiesNumber: '',
        dateOfBirth: '',
        gender: '',
        species: '',
        breed: '',
        color: '',
        advancedLifeSupport: false,
        currentMedications: '',
        allergiesOrConditions: '',
        spayNeuterStatus: '',
    });

    const [otherDetails, setOtherDetails] = useState({
        insuranceSupplier: '',
        insuranceNumber: '',
        referringVetOrClinic: '',
        preferredDoctor: '',
        image: null,
    });

    const [tags, setTags] = useState({
        general: '',
        reminder: '',
    });

    const handleOwnerSelect = (owner) => {
        setSelectedOwner(owner);
        setOwnerSelectionState('selected');
      };

      

    const [animalNotes, setAnimalNotes] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [age, setAge] = useState(null);


    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }

        return calculatedAge;
    };

    const validateInput = (name, value) => {
        let error = '';

        if (name === 'weight') {
            if (value !== '' && isNaN(value)) {
                error = 'Must be a number';
            }
        } else if (value.trim() === '') {
            error = 'This field is required';
        }

        return error;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        const error = validateInput(name, newValue);
        setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));

        setPatientDetails((prevDetails) => ({ ...prevDetails, [name]: newValue }));

        // If the date of birth is changed, calculate and set the age
        if (name === 'dateOfBirth') {
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
        const { data, error } = await supabase
            .storage
            .from('patient/patient_pictures')  
            .upload(fileName, file);

        if (error) {
            console.error('Error uploading image:', error.message);
            return null;
        }


        const { publicURL, error: urlError } = supabase
            .storage
            .from('patient/patient_pictures')  
            .getPublicUrl(fileName);

        if (urlError) {
            console.error('Error getting public URL:', urlError.message);
            return null;
        }

        return publicURL;
    };

    const handleCreateNewOwner = () => {
        setOwnerSelectionState('creating');
      };
    
      const handleOwnerCreated = (newOwner) => {
        setSelectedOwner(newOwner);
        setOwnerSelectionState('selected');
      };
    
      const handleCancelNewOwner = () => {
        setOwnerSelectionState('selecting');
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();

        const hasErrors = Object.values(errors).some((error) => error);
        if (hasErrors) {
          alert('Please correct the errors before submitting');
          return;
        }
      
        try {
          let imageUrl = null;
      
          if (otherDetails.image) {
            const file = otherDetails.image;
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `patient_pictures/${fileName}`;
      
            const { error: uploadError } = await supabase.storage
              .from('patient')
              .upload(filePath, file);
      
            if (uploadError) {
              console.error('Error uploading image to Supabase:', uploadError.message);
              alert('Error uploading image.');
              return;
            }
      
            const { data: publicUrlData, error: urlError } = supabase.storage
              .from('patient')
              .getPublicUrl(filePath);
      
            if (urlError) {
              console.error('Error getting public URL for the image:', urlError.message);
              alert('Error getting image URL.');
              return;
            }
      
            imageUrl = publicUrlData.publicUrl;
          }
      
          const patientDataToInsert = {
            owner_id: selectedOwner.id,
            name: patientDetails.patientName,
            microchip_number: patientDetails.microchipNumber || null,
            weight: patientDetails.weight !== '' ? parseFloat(patientDetails.weight) : null,
            rabies_number: patientDetails.rabiesNumber || null,
            age: patientDetails.age !== '' ? parseInt(patientDetails.age) : null,
            date_of_birth: patientDetails.dateOfBirth || null,
            gender: patientDetails.gender,
            species: patientDetails.species,
            breed: patientDetails.breed || null,
            color: patientDetails.color || null,
            advanced_life_support: patientDetails.advancedLifeSupport,
            notes: animalNotes || null,
            current_medications: patientDetails.currentMedications,
            allergies_or_conditions: patientDetails.allergiesOrConditions,
            spay_neuter_status: patientDetails.spayNeuterStatus,
            general_tag: tags.general,
            reminder_tag: tags.reminder,
            image_url: imageUrl,
          };
      
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .insert([patientDataToInsert])
            .select();
      
          if (patientError) {
            console.error('Error inserting patient:', patientError.details || patientError.message || patientError);
            alert(`Error adding new patient: ${patientError.details || patientError.message}`);
            return;
          }
      
          setPatientDetails({
            patientName: '',
            microchipNumber: '',
            weight: '',
            rabiesNumber: '',
            age: '',
            dateOfBirth: '',
            gender: '',
            species: '',
            breed: '',
            color: '',
            advancedLifeSupport: false,
            currentMedications: '',
            allergiesOrConditions: '',
            spayNeuterStatus: '',
          });
          setOtherDetails({
            insuranceSupplier: '',
            insuranceNumber: '',
            referringVetOrClinic: '',
            preferredDoctor: '',
            image: null,
          });
          setTags({
            general: '',
            reminder: '',
          });
          setAnimalNotes('');
          setImagePreview(null);
        } catch (error) {
          console.error('Error creating new patient:', error.message || error);
          alert(`Failed to create new patient: ${error.message}`);
        }
      };
    

    return (
        <div className="new-patient-page">
          <header className="patient-header">
            <div className="patient-tabs">
              <Link to="/patient/clinical" className="tab-button">Clinical</Link>
              <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
              <Link to="/Financial" className="tab-button">Financial</Link>
              <Link to="/patient/summaries" className="tab-button">Summaries</Link>
              <Link to="/patient/healthStatus" className="tab-button">Health Status</Link>
              <Link to="/patient/medication" className="tab-button">Medication</Link>
              <Link to="/newPatient" className="tab-button active-tab">New Patient</Link>
            </div>
          </header>
          <div className="new-patient-header">
            {ownerSelectionState === 'selected' ? (
              <div className="selected-owner-header">
                <h1>{`${selectedOwner.last_name}, ${selectedOwner.first_name}`}</h1>
                <button type="button" onClick={() => setOwnerSelectionState('selecting')}>Change Owner</button>
              </div>
            ) : (
              <h1>New Patient</h1>
            )}
          </div>
          {ownerSelectionState === 'selecting' && (
            <div className="owner-selection-container">
              <OwnerSelection
                onSelectOwner={handleOwnerSelect}
                onCreateNewOwner={handleCreateNewOwner}
              />
            </div>
          )}
          {ownerSelectionState === 'creating' && (
            <NewOwnerForm
              onCreateOwner={handleOwnerCreated}
              onCancel={handleCancelNewOwner}
            />
          )}
          {ownerSelectionState === 'selected' && (
            <form className="new-patient-grid new-patient-form" onSubmit={handleSubmit}>
              <div className="details-section">
                <h2>Pet Details</h2>
                {[
                  { label: 'Patient Name', name: 'patientName', type: 'text' },
                  { label: 'Microchip Number', name: 'microchipNumber', type: 'text' },
                  { label: 'Weight in lb', name: 'weight', type: 'text' },
                  { label: 'Rabies Number', name: 'rabiesNumber', type: 'text' },
                  { label: 'Age', name: 'age', type: 'text' },
                  { label: 'Date of Birth', name: 'dateOfBirth', type: 'date' },
                  { label: 'Species', name: 'species', type: 'text' },
                  { label: 'Breed', name: 'breed', type: 'text' },
                  { label: 'Color', name: 'color', type: 'text' },
                ].map(({ label, name, type }) => (
                  <div key={name} className="input-wrapper">
                    <label>{label} {errors[name] && <span className="error-message-inline">{errors[name]}</span>}</label>
                    <input
                      type={type}
                      name={name}
                      value={patientDetails[name]}
                      onChange={handleInputChange}
                      className={errors[name] ? 'input-error' : ''}
                    />
                  </div>
                ))}
                <label>Gender</label>
                <select
                  name="gender"
                  value={patientDetails.gender}
                  onChange={handleInputChange}
                  className={errors.gender ? 'input-error' : ''}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Transcended Being</option>
                </select>
                {errors.gender && <span className="error-message-inline">{errors.gender}</span>}
              </div>
      
              <div className="additional-info-section">
                <h2>Additional Information</h2>
                {[
                  { label: 'Current Medications', name: 'currentMedications', type: 'text' },
                  { label: 'Allergies or Special Conditions', name: 'allergiesOrConditions', type: 'text' },
                  { label: 'Spay/Neuter Status', name: 'spayNeuterStatus', type: 'text' }
                ].map(({ label, name, type }) => (
                  <div key={name} className="input-wrapper">
                    <label>{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={patientDetails[name] || ''}
                      onChange={handleInputChange}
                      className={errors[name] ? 'input-error' : ''}
                    />
                    {errors[name] && <span className="error-message-inline">{errors[name]}</span>}
                  </div>
                ))}
      
                <div className="notes-subsection">
                  <h3>Animal Notes</h3>
                  <textarea
                    name="animalNotes"
                    value={animalNotes}
                    onChange={(e) => setAnimalNotes(e.target.value)}
                    className={`textarea-large ${errors.animalNotes ? 'input-error' : ''}`}
                    style={{ width: '100%', height: '150px' }}
                  />
                  {errors.animalNotes && <span className="error-message-inline">{errors.animalNotes}</span>}
                </div>
      
                <div className="tags-subsection">
                  <h3>Tags</h3>
                  {[
                    { label: 'General', name: 'general' },
                    { label: 'Reminder', name: 'reminder' }
                  ].map(({ label, name }) => (
                    <div key={name} className="input-wrapper">
                      <label>{label}</label>
                      <input
                        type="text"
                        name={name}
                        value={tags[name] || ''}
                        onChange={handleTagsChange}
                        className={errors[name] ? 'input-error' : ''}
                      />
                      {errors[name] && <span className="error-message-inline">{errors[name]}</span>}
                    </div>
                  ))}
                </div>
              </div>
      
              <div className="clinical-details-section">
                <h2>Clinical Details</h2>
                {[
                  { label: 'Insurance Supplier', name: 'insuranceSupplier' },
                  { label: 'Insurance Number', name: 'insuranceNumber' },
                  { label: 'Referring Vet/Clinic', name: 'referringVetOrClinic' },
                  { label: 'Preferred Doctor', name: 'preferredDoctor' },
                ].map(({ label, name }) => (
                  <div key={name} className="input-wrapper">
                    <label>{label} {errors[name] && <span className="error-message-inline">{errors[name]}</span>}</label>
                    <input
                      type="text"
                      name={name}
                      value={otherDetails[name]}
                      onChange={handleOtherDetailsChange}
                      className={errors[name] ? 'input-error' : ''}
                    />
                  </div>
                ))}
                <label>Upload Image</label>
                <input type="file" name="image" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                  </div>
                )}
                <button type="submit" className="create-patient-button">Create Patient</button>
              </div>
            </form>
          )}
        </div>
      );
};

export default NewPatient;
