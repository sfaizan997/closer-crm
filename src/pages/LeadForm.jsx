import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Eye, EyeOff, Clock, Send } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { InputField, TextAreaField, SelectField } from '../components/ui/FormFields';
import { useLeads } from '../context/LeadContext';
import { useToast } from '../context/ToastContext';
import { maskSSN, maskAccountNumber } from '../utils/masking';
import { GoogleGenerativeAI } from "@google/generative-ai";
import styles from './LeadForm.module.css';

const emptyLead = {
  name: '', email: '', phone: '', status: 'New', carrier: '', premium: '',
  draftDate: '', dob: '', smoker: '', height: '', weight: '',
  doctorName: '', doctorAddress: '', beneficiary: '', relation: '',
  medications: '', healthConditions: '', currentPolicyNote: '',
  coverage: '', ssn: '', bankName: '', bankAddress: '', accountType: '',
  routingNumber: '', accountNumber: '', stateId: '',
  leadSource: '', followUpDate: '', notes: [],
};

const LeadForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getLead, addLead, updateLead, deleteLead, addNote } = useLeads();
  const toast = useToast();
  const isNew = !id;

  const [formData, setFormData] = useState(emptyLead);
  const [showSensitive, setShowSensitive] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);

  const handleAiSmartFill = async () => {
    if (!aiInput.trim()) {
      toast.warning('Please paste some lead notes first');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      toast.error('Gemini API Key is missing. Please add it to your .env.local file.');
      return;
    }

    setIsProcessingAi(true);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
        Extract lead information from the following raw notes and return ONLY a valid JSON object.
        If a piece of information is missing, use an empty string.
        
        Fields to extract:
        - full_name: The person's name.
        - phone: Contact number.
        - dob: Date of birth (format YYYY-MM-DD).
        - smoker: "Yes" if nicotine/tobacco/smoking is mentioned, "No" otherwise.
        - height: e.g., 5'10.
        - weight: e.g., 185 lbs.
        - follow_up_date: If the notes mention a timeframe like "call next month" or "in 2 weeks", calculate the date starting from today (${new Date().toISOString().split('T')[0]}) and return in YYYY-MM-DD.
        - activity_note: A concise summary of specific medical or policy instructions mentioned (e.g., "No medical issues", "Wants term life").

        RAW NOTES:
        ${aiInput}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = text.replace(/```json|```/g, '').trim();
      const aiData = JSON.parse(text);

      setFormData(prev => ({
        ...prev,
        name: aiData.full_name || prev.name,
        phone: aiData.phone || prev.phone,
        dob: aiData.dob || prev.dob,
        smoker: aiData.smoker || prev.smoker,
        height: aiData.height || prev.height,
        weight: aiData.weight || prev.weight,
        followUpDate: aiData.follow_up_date || prev.followUpDate,
      }));

      if (aiData.activity_note) {
        setNewNote(aiData.activity_note);
        toast.info('AI extracted an activity note. Click "Add Note" to save it!');
      }

      toast.success('Lead details extracted successfully!');
      setAiInput('');
      setIsDirty(true);
    } catch (err) {
      console.error("AI Error:", err);
      toast.error(err.message ? `AI Error: ${err.message}` : 'AI failed to process notes.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  useEffect(() => {
    if (id) {
      const existing = getLead(id);
      if (existing) {
        setFormData(existing);
      } else {
        navigate('/leads');
      }
    }
    setIsDirty(false);
  }, [id]);

  // Unsaved changes warning on browser close
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleChange = (e) => {
    const { id: fieldId, value } = e.target;
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Lead name is required');
      return;
    }
    setIsSaving(true);
    
    if (isNew) {
      addLead(formData).catch(err => {
        toast.error('Failed to save lead');
        console.error(err);
      });
      toast.success(`Lead "${formData.name}" added successfully`);
    } else {
      updateLead(id, formData).catch(err => {
        toast.error('Failed to save lead');
        console.error(err);
      });
      toast.success(`Lead "${formData.name}" saved`);
    }
    
    setIsDirty(false);
    navigate('/leads');
  };

  const handleDelete = () => {
    setIsDeleting(true);
    deleteLead(id).catch(err => {
      toast.error('Failed to delete lead');
      console.error(err);
    });
    toast.success(`Lead "${formData.name}" deleted`);
    setShowDeleteDialog(false);
    navigate('/leads');
  };

  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Leave anyway?')) return;
    }
    navigate('/leads');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    if (isNew) {
      toast.warning('Save the lead first before adding notes.');
      return;
    }
    
    addNote(id, newNote.trim()).catch(err => {
      toast.error('Failed to add note');
      console.error(err);
    });
    
    setNewNote('');
    toast.success('Note added');
  };

  const renderSensitive = (field, maskFn) => {
    const val = formData[field];
    if (!val) return '';
    return showSensitive ? val : maskFn(val);
  };

  const handleSensitiveChange = (e) => {
    if (!showSensitive) {
      toast.warning('Reveal sensitive data first before editing.');
      return;
    }
    handleChange(e);
  };

  const formatNoteTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const lead = id ? getLead(id) : null;
  const currentNotes = lead?.notes || [];

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleCancel} disabled={isSaving || isDeleting}>Cancel</Button>
          {!isNew && (
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)} disabled={isSaving || isDeleting}>
              <Trash2 size={14} /> Delete Lead
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving || isDeleting}>
            {isSaving ? 'Saving...' : isDirty ? '● Save Changes' : 'Save Lead'}
          </Button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mainCol}>
          
          {/* AI Smart Fill */}
          {isNew && (
            <Card className={styles.aiCard}>
              <div className={styles.aiHeader}>
                <h3 className={styles.sectionHeading}>✨ AI Smart Fill</h3>
                <span className={styles.aiBadge}>Beta</span>
              </div>
              <p className={styles.aiDescription}>Paste raw notes or lead data here to automatically populate the form.</p>
              <div className={styles.aiActionArea}>
                <textarea
                  className={styles.aiTextarea}
                  placeholder="e.g. Alice Jones 555-0123. Born 5/12/1980. Non-smoker. Call her back in 2 weeks..."
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <Button 
                  onClick={handleAiSmartFill} 
                  disabled={isProcessingAi || !aiInput.trim()}
                  variant="secondary"
                >
                  {isProcessingAi ? 'Analyzing...' : 'Auto-Fill Form'}
                </Button>
              </div>
            </Card>
          )}

          {/* Contact Info */}
          <Card className={styles.formCard}>
            <h3 className={styles.sectionHeading}>Contact Info</h3>
            <div className={styles.grid}>
              <InputField label="Full Name *" id="name" value={formData.name} onChange={handleChange} />
              <InputField label="Phone" id="phone" value={formData.phone} onChange={handleChange} />
              <InputField label="Address" id="address" value={formData.address || ''} onChange={handleChange} className={styles.fullWidth} />
              <InputField label="Email" id="email" type="email" value={formData.email} onChange={handleChange} />
              <InputField label="Date of Birth" id="dob" type="date" value={formData.dob} onChange={handleChange} />
              <SelectField label="Smoker" id="smoker" value={formData.smoker} onChange={handleChange}
                options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
              <InputField label="Height" id="height" value={formData.height} onChange={handleChange} placeholder='e.g. 5&apos;10"' />
              <InputField label="Weight" id="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 185 lbs" />
              <SelectField label="Status" id="status" value={formData.status} onChange={handleChange}
                options={[
                  { label: 'New', value: 'New' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Sold', value: 'Sold' },
                  { label: 'Lost', value: 'Lost' },
                ]} />
            </div>
          </Card>

          {/* Medical */}
          <Card className={styles.formCard}>
            <h3 className={styles.sectionHeading}>Medical</h3>
            <div className={styles.grid}>
              <InputField label="Doctor Name" id="doctorName" value={formData.doctorName} onChange={handleChange} />
              <InputField label="Doctor Address" id="doctorAddress" value={formData.doctorAddress} onChange={handleChange} />
              <TextAreaField label="Medications" id="medications" value={formData.medications} onChange={handleChange} className={styles.fullWidth} />
              <TextAreaField label="Health Conditions" id="healthConditions" value={formData.healthConditions} onChange={handleChange} className={styles.fullWidth} />
            </div>
          </Card>

          {/* Policy */}
          <Card className={styles.formCard}>
            <h3 className={styles.sectionHeading}>Policy</h3>
            <div className={styles.grid}>
              <InputField label="Carrier" id="carrier" value={formData.carrier} onChange={handleChange} placeholder="e.g. Mutual of Omaha" />
              <InputField label="Coverage Amount" id="coverage" value={formData.coverage} onChange={handleChange} placeholder="e.g. $10,000" />
              <InputField label="Monthly Premium" id="premium" value={formData.premium} onChange={handleChange} placeholder="e.g. $85.00" />
              <TextAreaField label="Current Policy Note" id="currentPolicyNote" value={formData.currentPolicyNote} onChange={handleChange} className={styles.fullWidth} />
            </div>
          </Card>

          {/* Beneficiary */}
          <Card className={styles.formCard}>
            <h3 className={styles.sectionHeading}>Beneficiary</h3>
            <div className={styles.grid}>
              <InputField label="Beneficiary Name" id="beneficiary" value={formData.beneficiary} onChange={handleChange} />
              <InputField label="Relation to Insured" id="relation" value={formData.relation} onChange={handleChange} placeholder="e.g. Spouse, Son, Daughter" />
            </div>
          </Card>

          {/* Banking */}
          <Card className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionHeading}>Banking</h3>
              <button className={styles.revealBtn} onClick={() => setShowSensitive(s => !s)}>
                {showSensitive ? <><EyeOff size={14} /> Hide Sensitive</> : <><Eye size={14} /> Reveal Sensitive</>}
              </button>
            </div>
            {showSensitive && (
              <div className={styles.sensitiveWarning}>
                ⚠ Sensitive data is visible. Ensure your screen is private.
              </div>
            )}
            <div className={styles.grid}>
              <InputField label="Bank Name" id="bankName" value={formData.bankName} onChange={handleChange} />
              <InputField label="Bank Address" id="bankAddress" value={formData.bankAddress} onChange={handleChange} />
              <SelectField label="Account Type" id="accountType" value={formData.accountType} onChange={handleChange}
                options={[{ label: 'Checking', value: 'Checking' }, { label: 'Savings', value: 'Savings' }]} />
              <InputField label="Initial Draft Date" id="draftDate" value={formData.draftDate} onChange={handleChange} placeholder="e.g. 15th" />
              <InputField label="Future Draft Date" id="futureDraftDate" value={formData.futureDraftDate || ''} onChange={handleChange} />
              <InputField label="Routing Number" id="routingNumber"
                value={renderSensitive('routingNumber', maskAccountNumber)}
                onChange={handleSensitiveChange}
                readOnly={!showSensitive} className={!showSensitive ? styles.maskedField : ''} />
              <InputField label="Account Number" id="accountNumber"
                value={renderSensitive('accountNumber', maskAccountNumber)}
                onChange={handleSensitiveChange}
                readOnly={!showSensitive} className={!showSensitive ? styles.maskedField : ''} />
            </div>
          </Card>

          {/* Identification */}
          <Card className={styles.formCard}>
            <h3 className={styles.sectionHeading}>Identification</h3>
            <div className={styles.grid}>
              <InputField label="SSN" id="ssn"
                value={renderSensitive('ssn', maskSSN)}
                onChange={handleSensitiveChange}
                readOnly={!showSensitive} className={!showSensitive ? styles.maskedField : ''} />
              <InputField label="State ID / DL ID" id="stateId" value={formData.stateId} onChange={handleChange} />
            </div>
          </Card>

        </div>

        {/* Right column — metadata + notes */}
        <div className={styles.sideCol}>

          <Card className={styles.metaCard}>
            <h3 className={styles.sectionHeading}>Lead Details</h3>
            <div className={styles.metaFields}>
              <SelectField label="Lead Source" id="leadSource" value={formData.leadSource} onChange={handleChange}
                options={[
                  { label: 'ViciDial', value: 'ViciDial' },
                  { label: 'Facebook', value: 'Facebook' },
                  { label: 'Referral', value: 'Referral' },
                  { label: 'Walk-in', value: 'Walk-in' },
                  { label: 'Direct Mail', value: 'Direct Mail' },
                  { label: 'Other', value: 'Other' },
                ]} />
              <InputField label="Follow-Up Date" id="followUpDate" type="date" value={formData.followUpDate} onChange={handleChange} />
            </div>
          </Card>

          {/* Activity Log / Notes */}
          <Card className={styles.notesCard}>
            <h3 className={styles.sectionHeading}>
              <Clock size={15} /> Activity Log
            </h3>
            <div className={styles.noteInput}>
              <textarea
                className={styles.noteTextarea}
                placeholder="Add a note (e.g. Called, no answer. Will retry Thursday.)"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAddNote(); }}
              />
              <button className={styles.noteSubmitBtn} onClick={handleAddNote} disabled={!newNote.trim()}>
                <Send size={14} />
              </button>
            </div>
            <p className={styles.noteHint}>Ctrl+Enter to submit</p>
            <div className={styles.notesList}>
              {currentNotes.length === 0 && (
                <p className={styles.noNotes}>No notes yet. Add your first note above.</p>
              )}
              {currentNotes.map(note => (
                <div key={note.id} className={styles.noteItem}>
                  <div className={styles.noteTime}>{formatNoteTime(note.timestamp)}</div>
                  <div className={styles.noteText}>{note.text}</div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Lead"
        message={`Permanently delete "${formData.name}"? All data including notes will be lost.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Lead"}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        disabled={isDeleting}
      />
    </div>
  );
};

export default LeadForm;
