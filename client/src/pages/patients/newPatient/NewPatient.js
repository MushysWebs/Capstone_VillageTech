import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NewPatient.css';

const NewPatient = () => {
    const [patientDetails, setPatientDetails] = useState({
        ownerName: '',
        patientName: '',
        code: '',
        microchipNumber: '',
        weight: '',
        rabiesNumber: '',
        age: '',
        dateOfBirth: '',
        gender: '',
        species: '',
        breed: '',
        color: '',
        resuscitate: false,
        advancedLifeSupport: false,
        deceased: false,
    });

    const [otherDetails, setOtherDetails] = useState({
        insuranceSupplier: '',
        insuranceNumber: '',
        referringClinic: '',
        referringVet: '',
        preferredDoctor: '',
        secondPreferredDoctor: '',
        otherContacts: [],
        image: null,
    });

    const [animalNotes, setAnimalNotes] = useState('');
    const [tags, setTags] = useState({ general: '', reminder: '' });
    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setPatientDetails((prevDetails) => ({ ...prevDetails, [name]: checked }));
        } else {
            setPatientDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
        }
    };

    const handleOtherDetailsChange = (e) => {
        const { name, value } = e.target;
        setOtherDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setOtherDetails({ ...otherDetails, image: file });

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTagsChange = (e) => {
        const { name, value } = e.target;
        setTags((prevTags) => ({ ...prevTags, [name]: value }));
    };

    return (
        <div className="new-patient-page">
            {/* Add the patient navigation buttons */}
            <header className="patient-header">
                <div className="patient-tabs">
                    <Link to="/patient/clinical" className="tab-button">Clinical</Link>
                    <Link to="/patient/soc" className="tab-button">S.O.C.</Link>
                    <Link to="/patient/financial" className="tab-button">Financial</Link>
                    <Link to="/patient/summaries" className="tab-button">Summaries</Link>
                    <Link to="/patient/healthStatus" className="tab-button">Health Status</Link>
                    <Link to="/patient/medication" className="tab-button">Medication</Link>
                    <Link to="/newPatient" className="tab-button active-tab">New Patient</Link>
                </div>
            </header>

            <div className="new-patient-header">
                <h1>New Patient</h1>
            </div>

            <div className="new-patient-grid">
                {/* Patient Details Section */}
                <div className="details-section">
                    <h2>Pet Details</h2>
                    <label>Owner</label>
                    <input type="text" name="ownerName" value={patientDetails.ownerName} onChange={handleInputChange} />

                    <label>Patient Name</label>
                    <input type="text" name="patientName" value={patientDetails.patientName} onChange={handleInputChange} />

                    <label>Code</label>
                    <input type="text" name="code" value={patientDetails.code} onChange={handleInputChange} />

                    <label>Microchip Number</label>
                    <input type="text" name="microchipNumber" value={patientDetails.microchipNumber} onChange={handleInputChange} />

                    <label>Weight</label>
                    <input type="number" name="weight" value={patientDetails.weight} onChange={handleInputChange} />

                    <label>Rabies Number</label>
                    <input type="text" name="rabiesNumber" value={patientDetails.rabiesNumber} onChange={handleInputChange} />

                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={patientDetails.dateOfBirth} onChange={handleInputChange} />

                    <label>Gender</label>
                    <select name="gender" value={patientDetails.gender} onChange={handleInputChange}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unknown">Transcended Being</option>
                    </select>

                    <label>Species</label>
                    <input type="text" name="species" value={patientDetails.species} onChange={handleInputChange} />

                    <label>Breed</label>
                    <input type="text" name="breed" value={patientDetails.breed} onChange={handleInputChange} />

                    <label>Color</label>
                    <input type="text" name="color" value={patientDetails.color} onChange={handleInputChange} />

                    <label>Resuscitate</label>
                    <select
                        name="resuscitate"
                        value={patientDetails.resuscitate ? 'yes' : 'no'}
                        onChange={(e) => setPatientDetails(prevDetails => ({ ...prevDetails, resuscitate: e.target.value === 'yes' }))}>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>

                {/* Other Details Section */}
                <div className="other-details-section">
                    <h2>Other Details</h2>

                    <label>Insurance Supplier</label>
                    <input type="text" name="insuranceSupplier" value={otherDetails.insuranceSupplier} onChange={handleOtherDetailsChange} />

                    <label>Insurance Number</label>
                    <input type="text" name="insuranceNumber" value={otherDetails.insuranceNumber} onChange={handleOtherDetailsChange} />

                    <label>Referring Clinic</label>
                    <input type="text" name="referringClinic" value={otherDetails.referringClinic} onChange={handleOtherDetailsChange} />

                    <label>Referring Vet</label>
                    <input type="text" name="referringVet" value={otherDetails.referringVet} onChange={handleOtherDetailsChange} />

                    <label>Preferred Doctor</label>
                    <input type="text" name="preferredDoctor" value={otherDetails.preferredDoctor} onChange={handleOtherDetailsChange} />

                    <label>Second Preferred Doctor</label>
                    <input type="text" name="secondPreferredDoctor" value={otherDetails.secondPreferredDoctor} onChange={handleOtherDetailsChange} />

                    <label>Upload Image</label>
                    <input type="file" name="image" onChange={handleImageChange} />

                    {imagePreview && (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                        </div>
                    )}
                </div>

                {/* Additional Info Section */}
                <div className="additional-info-section">
                    <h2>Additional Information</h2>
                    <div className="notes-subsection">
                        <h3>Animal Notes</h3>
                        <textarea name="animalNotes" value={animalNotes} onChange={(e) => setAnimalNotes(e.target.value)} />
                    </div>

                    <div className="tags-subsection">
                        <h3>Tags</h3>
                        <label>General</label>
                        <input type="text" name="general" value={tags.general} onChange={handleTagsChange} />

                        <label>Reminder</label>
                        <input type="text" name="reminder" value={tags.reminder} onChange={handleTagsChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPatient;
