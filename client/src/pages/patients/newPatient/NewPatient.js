import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './NewPatient.css';
import { supabase } from '../../../components/routes/supabaseClient';

const NewPatient = () => {
    const [patientDetails, setPatientDetails] = useState({
        ownerFirstName: '',
        ownerLastName: '',
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

    const [animalNotes, setAnimalNotes] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});

    const validateInput = (name, value) => {
        let error = '';

        if (name === 'weight' || name === 'age') {
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
    

            const { data: ownerData, error: ownerError } = await supabase
                .from('owners')
                .insert([{
                    first_name: patientDetails.ownerFirstName,
                    last_name: patientDetails.ownerLastName,
                    email: 'owner@example.com',
                    phone_number: '1234567890',
                }])
                .select();
    
            if (ownerError) {
                console.error('Error inserting owner:', ownerError);
                alert(`Error adding owner: ${ownerError.message}`);
                return;
            }
    
            const ownerId = ownerData[0].id;
    

            const patientDataToInsert = {
                owner_id: ownerId,
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
                ownerFirstName: '',
                ownerLastName: '',
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
    
            alert('New patient created successfully!');
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
                <h1>New Patient</h1>
            </div>
            <form className="new-patient-grid new-patient-form" onSubmit={handleSubmit}>
                <div className="details-section">
                    <h2>Pet Details</h2>
                    {[
                        { label: 'Owner First Name', name: 'ownerFirstName', type: 'text' },
                        { label: 'Owner Last Name', name: 'ownerLastName', type: 'text' },
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
                                value={otherDetails[name] || ''}
                                onChange={handleOtherDetailsChange}
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
        </div>
    );
};

export default NewPatient;
