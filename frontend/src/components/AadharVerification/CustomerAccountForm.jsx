import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Camera, User, Home, Database, CreditCard, ShieldCheck } from 'lucide-react';
import './CustomerAccountForm.css';
import API_BASE_URL from '../../config';
import { useApp } from '../../context/AppContext';
import html2pdf from 'html2pdf.js';

export default function CustomerAccountForm({ isOpen, onClose, initialData, readOnlyAndShowReport, onAccountCreated }) {
  const { showToast, clientInfo } = useApp();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(readOnlyAndShowReport || false);
  const [submittedData, setSubmittedData] = useState(readOnlyAndShowReport ? initialData : null);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [formData, setFormData] = useState({
    // Page 1
    institution_name: '',
    membership_no: '',
    ni_no: '',
    saving_acc_no: '',
    client_id: '',
    branch: '',
    date: new Date().toISOString().split('T')[0],
    full_name: '',
    age: '',
    dob: '',
    current_address: '',
    permanent_address: '',
    working_address: '',
    monthly_income: '',
    yearly_income: '',
    phone: '',
    mobile: '',
    pan: '',
    aadhaar: '',
    email: '',
    is_member_elsewhere: 'no',
    other_ext_org_name: '',
    other_ext_branch: '',
    fee_share: '',
    fee_welfare: '',
    fee_savings: '',
    fee_entrance: '',
    fee_other: '',
    fee_total: '',

    // Page 2
    official_mobile: '',
    docs: {
      photos: false,
      id_card: false,
      ration_card: false,
      aadhar_card: false,
      voter_card: false,
      pan_card: false,
      light_bill: false,
      residence_cert: false,
      उतारा: false,
    },
    nominee_name: '',
    nominee_age: '',
    nominee_dob: '',
    nominee_relation: '',
    nominee_address: '',
    recommender1_name: '',
    recommender1_no: '',
    recommender1_sig: '',
    recommender2_name: '',
    recommender2_no: '',
    recommender2_sig: '',

    // Page 3
    acc_type: 'swata',
    acc_initial_amount: '',
    acc_initial_amount_words: '',
    holder2_name: '',
    holder2_age: '',
    other_instructions: '',
    photo: '',
  });

  const [errors, setErrors] = useState({});

  // Pre-fill from initialData (Aadhar Data)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        full_name: initialData.name || initialData.fullName || prev.full_name,
        aadhaar: (initialData.aadhaarNo || initialData.maskedAadhaar || '').replace(/\s/g, ''),
        dob: initialData.dob ? formatDateForInput(initialData.dob) : prev.dob,
        current_address: initialData.address || prev.current_address,
        mobile: (initialData.phone && initialData.phone !== 'Linked') ? initialData.phone : prev.mobile,
        photo: initialData.photo || prev.photo,
      }));
    }
  }, [initialData]);

  // Helper: calculate age from date string
  const calculateAge = (dobStr) => {
    if (!dobStr) return '';
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? String(age) : '';
  };

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (formData.dob) {
      setFormData(prev => ({ ...prev, age: calculateAge(prev.dob) }));
    }
  }, [formData.dob]);

  // Auto-calculate nominee age when nominee DOB changes
  useEffect(() => {
    if (formData.nominee_dob) {
      setFormData(prev => ({ ...prev, nominee_age: calculateAge(prev.nominee_dob) }));
    }
  }, [formData.nominee_dob]);

  // Sync permanent address when sameAsCurrentAddress is checked
  useEffect(() => {
    if (sameAsCurrentAddress) {
      setFormData(prev => ({ ...prev, permanent_address: prev.current_address }));
    }
  }, [sameAsCurrentAddress, formData.current_address]);

  // Auto-set institution name from context
  useEffect(() => {
    if (clientInfo?.name) {
      setFormData(prev => ({ ...prev, institution_name: clientInfo.name }));
    }
  }, [clientInfo]);

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
  };

  const validateField = (name, value) => {
    // Validations removed per user request
    setErrors(prev => ({ ...prev, [name]: '' }));
    return '';
  };

  const validateStep = (step) => {
    // Step validation removed per user request
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name.startsWith('doc_')) {
      const docKey = name.replace('doc_', '');
      setFormData(prev => ({
        ...prev,
        docs: { ...prev.docs, [docKey]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Real-time validation
      validateField(name, value);
    }
  };

  const nextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 3));
    } else {
      showToast('Please fix errors before proceeding', 'error');
    }
  };
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      showToast('Please fix errors before submitting', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      // Backend expects proper snake_case names for docs as per [JsonPropertyName]
      const payload = {
        ...formData,
        doc_photos: formData.docs.photos,
        doc_id_card: formData.docs.id_card,
        doc_ration_card: formData.docs.ration_card,
        doc_aadhar_card: formData.docs.aadhar_card,
        doc_voter_card: formData.docs.voter_card,
        doc_pan_card: formData.docs.pan_card,
        doc_light_bill: formData.docs.light_bill,
        doc_residence_cert: formData.docs.residence_cert,
        doc_utara: formData.docs.उतारा || false,
        photo: formData.photo,
        client_code: initialData.clientCode
      };

      const resp = await fetch(`${API_BASE_URL}/membership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ message: 'Submission failed' }));
        throw new Error(errorData.message || 'Submission failed');
      }

      const result = await resp.json();
      setSubmittedData({ ...formData, id: result.id });
      setShowReport(true);
      if (onAccountCreated) onAccountCreated();
      showToast('Membership application submitted successfully!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showReport && submittedData) {
    // Reconstruct docs object if it's flat (from backend)
    const normalizedData = {
      ...submittedData,
      docs: submittedData.docs || {
        photos: submittedData.doc_photos || false,
        id_card: submittedData.doc_id_card || false,
        ration_card: submittedData.doc_ration_card || false,
        aadhar_card: submittedData.doc_aadhar_card || false,
        voter_card: submittedData.doc_voter_card || false,
        pan_card: submittedData.doc_pan_card || false,
        light_bill: submittedData.doc_light_bill || false,
        residence_cert: submittedData.doc_residence_cert || false,
        उतारा: submittedData.doc_utara || false,
      }
    };
    const handleDownloadPdf = async () => {
      const element = document.querySelector('.report-root');
      if (!element) return;

      // Temporarily set styles for capture
      const originalStyle = element.style.cssText;
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.position = 'relative';
      element.style.background = '#ffffff';
      element.style.zIndex = '99999';

      // Hide the footer
      const footer = element.querySelector('.report-footer');
      if (footer) footer.style.display = 'none';

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `Membership_Application_${normalizedData.full_name || 'Member'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css' } // Remove the 'before' selector to avoid double breaks
      };

      try {
        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error('PDF generation error:', err);
      } finally {
        // Restore styles
        element.style.cssText = originalStyle;
        if (footer) footer.style.display = 'flex';
      }
    };

    return <MembershipReport data={normalizedData} onClose={onClose} onDownload={handleDownloadPdf} />;
  }

  return (
    <div className="caf-page-container">
      <div className="caf-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="caf-back-btn" onClick={onClose}>
            <ChevronLeft size={20} /> मागे (Back)
          </button>
          <h2><Database size={20} color="#2563eb" /> सभासद नोंदणी (Membership Registration)</h2>
        </div>
        <button className="caf-close-btn" onClick={onClose}><X size={20} /></button>
      </div>

      <div className="caf-stepper">
        <div className={`caf-step-item ${activeStep >= 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
          <div className="caf-step-num">{activeStep > 1 ? <Check size={14} /> : '1'}</div>
          <span className="caf-step-label">वैयक्तिक माहिती</span>
        </div>
        <div className={`caf-step-item ${activeStep >= 2 ? 'active' : ''} ${activeStep > 2 ? 'completed' : ''}`}>
          <div className="caf-step-num">{activeStep > 2 ? <Check size={14} /> : '2'}</div>
          <span className="caf-step-label">वारस व कागदपत्रे</span>
        </div>
        <div className={`caf-step-item ${activeStep >= 3 ? 'active' : ''}`}>
          <div className="caf-step-num">3</div>
          <span className="caf-step-label">हस्ताक्षर कार्ड</span>
        </div>
      </div>

      <div className="caf-content">
        {activeStep === 1 && (
          <div className="document-page animate-fade-in">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="doc-section-title">सभासद तपशील (Membership Details)</div>
                <div className="doc-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  <div className="doc-input-wrap">
                    <label>संस्थेचे नाव (Institution Name)</label>
                    <input
                      type="text"
                      className="doc-input"
                      name="institution_name"
                      value={formData.institution_name}
                      readOnly
                      style={{ backgroundColor: 'var(--bg-secondary)', fontWeight: '600' }}
                    />
                  </div>
                  <div className="doc-input-wrap">
                    <label>सभासद क्र.</label>
                    <input type="text" className="doc-input" name="membership_no" value={formData.membership_no} onChange={handleInputChange} />

                  </div>
                  <div className="doc-input-wrap">
                    <label>दिनांक (Date)</label>
                    <input type="date" className="doc-input" name="date" value={formData.date} onChange={handleInputChange} />

                  </div>
                  <div className="doc-input-wrap">
                    <label>शाखा (Branch)</label>
                    <input type="text" className="doc-input" name="branch" value={formData.branch} onChange={handleInputChange} />

                  </div>
                </div>

                <div className="doc-row" style={{ gridTemplateColumns: '3fr 1fr', marginTop: '0.5rem' }}>
                  <div className="doc-input-wrap">
                    <label>संपूर्ण नाव (Full Name)</label>
                    <input
                      type="text"
                      className="doc-input"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="श्री/श्रीमती..."
                      readOnly={!!initialData?.name || !!initialData?.fullName}
                      style={{ backgroundColor: 'var(--bg-secondary)' }}
                    />

                  </div>
                  <div className="doc-input-wrap">
                    <label>वय (Age)</label>
                    <input type="text" className="doc-input" name="age" value={formData.age} onChange={handleInputChange} readOnly={!!formData.dob} style={{ backgroundColor: formData.dob ? 'var(--bg-secondary)' : undefined }} />

                  </div>
                </div>
              </div>

              <div className="doc-photo-box" style={{ border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', background: '#fff', overflow: 'hidden', marginTop: '1.8rem' }}>
                {formData.photo ? (
                  <img src={formData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="photo" />
                ) : (
                  <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.65rem' }}>
                    <Camera size={16} /> <br /> फोटो (Photo)
                  </div>
                )}
              </div>
            </div>

            <div className="doc-grid-4">
              <div className="doc-input-wrap">
                <label>जन्म तारीख (DOB)</label>
                <input
                  type="date"
                  className="doc-input"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  readOnly={!!initialData?.dob}
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />

              </div>
              <div className="doc-input-wrap">
                <label>भ्रमणध्वनी (Mobile No.)</label>
                <input
                  type="tel"
                  className="doc-input"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  readOnly={initialData?.phone && initialData?.phone !== 'Linked'}
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />

              </div>
              <div className="doc-input-wrap">
                <label>पॅन नंबर (PAN)</label>
                <input type="text" className="doc-input" name="pan" value={formData.pan} onChange={handleInputChange} maxLength={10} style={{ textTransform: 'uppercase' }} />

              </div>
              <div className="doc-input-wrap">
                <label>आधार कार्ड नं. (Aadhaar)</label>
                <input
                  type="text"
                  className="doc-input"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleInputChange}
                  maxLength={12}
                  readOnly={!!(initialData?.aadhaarNo || initialData?.maskedAadhaar) && !formData.aadhaar?.includes('X')}
                  style={{ backgroundColor: (initialData?.aadhaarNo && !formData.aadhaar?.includes('X')) ? 'var(--bg-secondary)' : 'white' }}
                />

              </div>
            </div>

            <div className="doc-row">
              <div className="doc-input-wrap">
                <label>सध्याचा पत्ता (Current Address)</label>
                <input
                  type="text"
                  className="doc-input"
                  name="current_address"
                  value={formData.current_address}
                  onChange={handleInputChange}
                  readOnly={!!initialData?.address}
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                />

              </div>
              <div className="doc-input-wrap">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  कायमचा पत्ता (Permanent Address)
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={sameAsCurrentAddress} onChange={(e) => setSameAsCurrentAddress(e.target.checked)} style={{ accentColor: '#2563eb' }} />
                    सध्याच्या पत्त्याप्रमाणे (Same as Current)
                  </label>
                </label>
                <input type="text" className="doc-input" name="permanent_address" value={formData.permanent_address} onChange={(e) => { setSameAsCurrentAddress(false); handleInputChange(e); }} readOnly={sameAsCurrentAddress} style={{ backgroundColor: sameAsCurrentAddress ? 'var(--bg-secondary)' : undefined }} />

              </div>
            </div>

            <div className="doc-row">
              <div className="doc-input-wrap">
                <label>कामाचा पत्ता (Working Address)</label>
                <input type="text" className="doc-input" name="working_address" value={formData.working_address} onChange={handleInputChange} />

              </div>
              <div className="doc-input-wrap" style={{ flex: '0 0 200px' }}>
                <label>शाखा/कार्यालय फोन</label>
                <input type="tel" className="doc-input" name="phone" value={formData.phone} onChange={handleInputChange} />

              </div>
            </div>

            <div className="doc-grid-4">
              <div className="doc-input-wrap">
                <label>मासिक उत्पन्न</label>
                <input type="number" className="doc-input" name="monthly_income" value={formData.monthly_income} onChange={handleInputChange} />

              </div>
              <div className="doc-input-wrap">
                <label>वार्षिक उत्पन्न</label>
                <input type="number" className="doc-input" name="yearly_income" value={formData.yearly_income} onChange={handleInputChange} />

              </div>
              <div className="doc-input-wrap">
                <label>ई-मेल (Email)</label>
                <input type="email" className="doc-input" name="email" value={formData.email} onChange={handleInputChange} />

              </div>
              <div className="doc-input-wrap">
                <label>मी इतर संस्थेचा सभासद आहे?</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}><input type="radio" name="is_member_elsewhere" value="yes" checked={formData.is_member_elsewhere === 'yes'} onChange={handleInputChange} /> हो</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}><input type="radio" name="is_member_elsewhere" value="no" checked={formData.is_member_elsewhere === 'no'} onChange={handleInputChange} /> नाही</label>
                </div>
              </div>
            </div>

            {formData.is_member_elsewhere === 'yes' && (
              <div className="doc-row animate-fade-in" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="doc-input-wrap">
                  <label>संस्थेचे नाव</label>
                  <input type="text" className="doc-input" name="other_ext_org_name" value={formData.other_ext_org_name} onChange={handleInputChange} />

                </div>
                <div className="doc-input-wrap">
                  <label>शाखा</label>
                  <input type="text" className="doc-input" name="other_ext_branch" value={formData.other_ext_branch} onChange={handleInputChange} />

                </div>
              </div>
            )}

            <div className="doc-section-title" style={{ marginTop: '0.25rem' }}>वर्गणी तपशील (Fees & Contributions)</div>
            <div className="doc-fee-grid">
              <div className="fee-row">
                <label>१) सभासद भाग रक्कम</label>
                <input type="number" className="doc-input" name="fee_share" value={formData.fee_share} onChange={handleInputChange} />

              </div>
              <div className="fee-row">
                <label>४) सभासद प्रवेश फी</label>
                <input type="number" className="doc-input" name="fee_entrance" value={formData.fee_entrance} onChange={handleInputChange} />

              </div>
              <div className="fee-row">
                <label>२) सभासद कल्याण निधी</label>
                <input type="number" className="doc-input" name="fee_welfare" value={formData.fee_welfare} onChange={handleInputChange} />
              </div>
              <div className="fee-row">
                <label>५) इतर जमा रक्कम</label>
                <input type="number" className="doc-input" name="fee_other" value={formData.fee_other} onChange={handleInputChange} />
              </div>
              <div className="fee-row">
                <label>३) बचत जमा रक्कम</label>
                <input type="number" className="doc-input" name="fee_savings" value={formData.fee_savings} onChange={handleInputChange} />
              </div>
              <div className="fee-row">
                <label>६) एकूण सभासद वर्गणी</label>
                <input type="number" className="doc-input" name="fee_total" value={formData.fee_total} onChange={handleInputChange} />
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="document-page animate-fade-in">
            <div className="doc-section-title">ऑनलाईन सेवा व कागदपत्रे</div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <p style={{ fontSize: '0.75rem', flex: 1, color: 'var(--text-secondary)', margin: 0 }}>मला आपल्या संस्थेच्या ऑनलाईन सेवांचा लाभ घ्यायचा असून माझा अधिकृत मोबाईल नंबर खालील प्रमाणे आहे.</p>
              <div className="doc-input-wrap" style={{ maxWidth: 200 }}>
                <label>अधिकृत मोबाईल नंबर</label>
                <input type="tel" className="doc-input" name="official_mobile" value={formData.official_mobile} onChange={handleInputChange} />

              </div>
            </div>

            <div className="doc-section-title" style={{ marginTop: '0.5rem' }}>कागदपत्रांची यादी (Documents Checklist)</div>
            <div className="doc-docs-grid">
              <label className="doc-item"><input type="checkbox" name="doc_photos" checked={formData.docs.photos} onChange={handleInputChange} /> फोटो ३ प्रती</label>
              <label className="doc-item"><input type="checkbox" name="doc_aadhar_card" checked={formData.docs.aadhar_card} onChange={handleInputChange} /> आधार कार्ड</label>
              <label className="doc-item"><input type="checkbox" name="doc_pan_card" checked={formData.docs.pan_card} onChange={handleInputChange} /> पॅन कार्ड</label>
              <label className="doc-item"><input type="checkbox" name="doc_voter_card" checked={formData.docs.voter_card} onChange={handleInputChange} /> मतदान कार्ड</label>
              <label className="doc-item"><input type="checkbox" name="doc_id_card" checked={formData.docs.id_card} onChange={handleInputChange} /> नोकरीचे ओळखपत्र</label>
              <label className="doc-item"><input type="checkbox" name="doc_light_bill" checked={formData.docs.light_bill} onChange={handleInputChange} /> लाईट बिल</label>
              <label className="doc-item"><input type="checkbox" name="doc_residence_cert" checked={formData.docs.residence_cert} onChange={handleInputChange} /> रहिवाशी दाखला</label>
              <label className="doc-item"><input type="checkbox" name="doc_utara" checked={formData.docs.उतारा} onChange={handleInputChange} /> उतारा</label>
            </div>

            <div className="doc-section-title" style={{ marginTop: '0.5rem' }}>वारसदार माहिती (Nominee Details)</div>
            <div className="doc-grid-4">
              <div className="doc-input-wrap">
                <label>वारसाचे नाव</label>
                <input type="text" className="doc-input" name="nominee_name" value={formData.nominee_name} onChange={handleInputChange} />

              </div>
              <div className="doc-input-wrap">
                <label>नाते (Relation)</label>
                <input type="text" className="doc-input" name="nominee_relation" value={formData.nominee_relation} onChange={handleInputChange} />

              </div>
              <div className="doc-input-wrap">
                <label>वय (Age)</label>
                <input type="text" className="doc-input" name="nominee_age" value={formData.nominee_age} onChange={handleInputChange} readOnly={!!formData.nominee_dob} style={{ backgroundColor: formData.nominee_dob ? 'var(--bg-secondary)' : undefined }} />

              </div>
              <div className="doc-input-wrap">
                <label>जन्म तारीख</label>
                <input type="date" className="doc-input" name="nominee_dob" value={formData.nominee_dob} onChange={handleInputChange} />

              </div>
            </div>
            <div className="doc-input-wrap">
              <label>वारसाचा पत्ता</label>
              <input type="text" className="doc-input" name="nominee_address" value={formData.nominee_address} onChange={handleInputChange} />

            </div>

            <div className="doc-section-title" style={{ marginTop: '0.5rem' }}>शिफारस (Recommendation)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="doc-fee-grid" style={{ gridTemplateColumns: '2fr 1fr', padding: '0.5rem' }}>
                <div className="fee-row">
                  <label>१) शिफारस नाव</label>
                  <input type="text" className="doc-input" name="recommender1_name" value={formData.recommender1_name} onChange={handleInputChange} />

                </div>
                <div className="fee-row">
                  <label>सभासद क्र.</label>
                  <input type="text" className="doc-input" name="recommender1_no" value={formData.recommender1_no} onChange={handleInputChange} />

                </div>
              </div>
              <div className="doc-fee-grid" style={{ gridTemplateColumns: '2fr 1fr', padding: '0.5rem' }}>
                <div className="fee-row">
                  <label>२) शिफारस नाव</label>
                  <input type="text" className="doc-input" name="recommender2_name" value={formData.recommender2_name} onChange={handleInputChange} />

                </div>
                <div className="fee-row">
                  <label>सभासद क्र.</label>
                  <input type="text" className="doc-input" name="recommender2_no" value={formData.recommender2_no} onChange={handleInputChange} />

                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="document-page animate-fade-in">
            <div className="doc-sig-card">
              <div className="sig-card-title">बचत/उत्कर्ष/दैनंदिन खाते हस्ताक्षर कार्ड</div>
              <div className="sig-card-body">
                <div className="doc-grid-4">
                  <div className="doc-input-wrap">
                    <label>खाते क्र. (Acc No)</label>
                    <input type="text" className="doc-input" name="saving_acc_no" value={formData.saving_acc_no} onChange={handleInputChange} />

                  </div>
                  <div className="doc-input-wrap">
                    <label>जमा रक्कम</label>
                    <input type="text" className="doc-input" name="acc_initial_amount" value={formData.acc_initial_amount} onChange={handleInputChange} placeholder="रु. अंकी..." />

                  </div>
                  <div className="doc-input-wrap" style={{ gridColumn: 'span 2' }}>
                    <label>अक्षरी रक्कम</label>
                    <input type="text" className="doc-input" name="acc_initial_amount_words" value={formData.acc_initial_amount_words} onChange={handleInputChange} placeholder="रु. अक्षरी..." />

                  </div>
                </div>

                <div className="sig-h-grid" style={{ marginTop: '0.75rem' }}>
                  <div className="sig-h-box" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800 }}>१) खातेदार पहिले</label>
                    <div style={{ margin: '4px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formData.full_name || '—'}</div>
                    <div className="sig-sample-area" style={{ height: '50px' }}></div>
                  </div>
                  <div className="sig-h-box" style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800 }}>२) खातेदार दुसरे</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div style={{ flex: 2 }}>
                        <input type="text" className="doc-input" style={{ fontSize: '0.75rem', padding: '0.3rem', width: '100%' }} name="holder2_name" value={formData.holder2_name} onChange={handleInputChange} placeholder="नाव..." />

                      </div>
                      <div style={{ flex: 1 }}>
                        <input type="text" className="doc-input" style={{ fontSize: '0.75rem', padding: '0.3rem', width: '100%' }} name="holder2_age" value={formData.holder2_age} onChange={handleInputChange} placeholder="वय..." />

                      </div>
                    </div>
                    <div className="sig-sample-area" style={{ height: '50px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.75rem', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}><input type="radio" name="acc_type" value="swata" checked={formData.acc_type === 'swata'} onChange={handleInputChange} /> स्वतः (Self)</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}><input type="radio" name="acc_type" value="sanyukta" checked={formData.acc_type === 'sanyukta'} onChange={handleInputChange} /> संयुक्तपणे (Jointly)</label>
                </div>
              </div>
            </div>

            <div className="doc-field-group" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>कार्यालयीन वापरासाठी Only</h4>
              <div className="doc-grid-4">
                <div className="doc-input-wrap"><label>लिपिक सही</label><div style={{ height: 28, borderBottom: '1px dashed #cbd5e1' }}></div></div>
                <div className="doc-input-wrap"><label>शाखाधिकारी</label><div style={{ height: 28, borderBottom: '1px dashed #cbd5e1' }}></div></div>
                <div className="doc-input-wrap" style={{ gridColumn: 'span 2' }}><label>ठराव क्र.</label><input type="text" className="doc-input" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="caf-footer">
        <button className="caf-btn caf-btn-secondary" onClick={prevStep} disabled={activeStep === 1}>
          <ChevronLeft size={18} /> मागे (Back)
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="caf-btn caf-btn-secondary" onClick={onClose}>रद्द करा (Exit)</button>
          {activeStep < 3 ? (
            <button className="caf-btn caf-btn-primary" onClick={nextStep}>
              पुढील (Next) <ChevronRight size={18} />
            </button>
          ) : (
            <button className="caf-btn caf-btn-success" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'प्रक्रिया सुरू आहे...' : 'खाते तयार करा (Finalize)'} <Check size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Membership Report Component (Generated after submission) ---
function MembershipReport({ data, onClose, onDownload }) {
  return (
    <div className="report-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Marathi:ital@0;1&family=Noto+Serif+Devanagari:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;500;600&display=swap');

        .report-root {
          background: #e8dcc8;
          padding: 20px 0;
          overflow-y: auto;
          height: 100vh;
          position: fixed;
          inset: 0;
          z-index: 2000;
          --maroon: #7b1a1a;
          --dark-maroon: #5a0e0e;
          --gold: #c8922a;
          --light-gold: #f5e6c8;
          --cream: #fdf8f0;
          --off-white: #f9f5ee;
          --border: #c8922a;
          --text: #1a1a1a;
          --label: #4a3520;
          --section-bg: #7b1a1a;
          font-family: 'Noto Sans Devanagari', 'Noto Serif Devanagari', sans-serif;
          color: var(--text);
          font-size: 13px;
          line-height: 1.5;
        }

        .report-root .page {
          margin: 0 auto 20px;
          padding: 18mm 16mm;
          box-shadow: 0 4px 30px rgba(0,0,0,0.25);
          position: relative;
          border-top: 6px solid var(--maroon);
          width: 210mm;
          min-height: 297mm;
          background: var(--cream);
          box-sizing: border-box;
          display: block;
        }

        .report-root .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .report-root .logo-area { display: flex; align-items: center; gap: 12px; }
        .report-root .logo-circle {
          width: 72px; height: 72px; border-radius: 50%; background: var(--maroon);
          display: flex; align-items: center; justify-content: center; color: var(--gold);
          font-size: 28px; font-weight: 700; border: 3px solid var(--gold); flex-shrink: 0;
        }
        .report-root .org-name { font-family: 'Noto Serif Devanagari', serif; font-size: 30px; font-weight: 700; color: var(--maroon); line-height: 1.1; }
        .report-root .org-sub { font-size: 14px; color: var(--gold); font-weight: 600; margin-top: 2px; }
        .report-root .reg-no { font-size: 10px; color: #666; margin-top: 3px; }
        .report-root .corner-boxes { display: flex; flex-direction: column; gap: 6px; min-width: 160px; }
        .report-root .corner-box { display: flex; align-items: center; gap: 6px; font-size: 11px; }
        .report-root .corner-box label { color: var(--label); font-weight: 600; min-width: 80px; font-size: 10.5px; }
        .report-root .corner-box span { border-bottom: 1px solid var(--border); width: 70px; font-size: 11px; padding: 1px 2px; min-height: 1.2em; display: inline-block; }
        .report-root .address-bar { background: var(--light-gold); border: 1px solid var(--gold); border-radius: 4px; padding: 7px 12px; font-size: 11px; color: var(--dark-maroon); margin: 8px 0 10px; }
        .report-root .form-title {
          background: var(--maroon); color: #fff; text-align: center; font-size: 20px; font-weight: 700;
          padding: 8px 20px; border-radius: 30px; display: inline-block; margin: 0 auto 12px; box-shadow: 0 2px 8px rgba(123,26,26,0.35);
        }
        .report-root .photo-box { border: 1.5px solid var(--border); width: 90px; height: 110px; display: flex; align-items: center; justify-content: center; color: #999; background: #fff; border-radius: 4px; overflow: hidden; }
        .report-root .sub-heading { background: var(--maroon); color: #fff; text-align: center; font-size: 13.5px; font-weight: 700; padding: 5px 12px; border-radius: 4px; margin: 14px 0 10px; }
        .report-root .info-span { border-bottom: 1.5px solid var(--border); padding: 0 4px; min-height: 1.2em; display: inline-block; font-weight: 600; }
        .report-root .fee-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 20px; margin: 10px 0; padding: 10px 14px; background: var(--off-white); border: 1px solid #e0d0b0; border-radius: 6px; }
        .report-root .fee-item { display: flex; align-items: center; gap: 8px; font-size: 12.5px; }
        .report-root .fee-item label { min-width: 130px; font-weight: 500; color: var(--label); }
        .report-root .fee-item span { border-bottom: 1.5px solid var(--border); width: 90px; padding: 2px 4px; display: inline-block; }
        .report-root .office-section { background: #fff; border: 2px solid var(--maroon); border-radius: 6px; overflow: hidden; margin-top: 16px; }
        .report-root .office-section-title { background: var(--maroon); color: #fff; text-align: center; font-size: 14px; font-weight: 700; padding: 6px; }
        .report-root .office-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 30px; margin: 8px 0; padding-bottom: 8px; border-bottom: 1px dashed #ddd; }
        .report-root .sign-area { height: 40px; border-bottom: 1.5px solid var(--text); margin-bottom: 4px; }
        .report-root .sign-desc { font-size: 11px; color: #555; text-align: center; }
        .report-root .signature-card { border: 2px solid var(--maroon); border-radius: 8px; overflow: hidden; margin-top: 8px; }
        .report-root .signature-card-title { background: var(--maroon); color: #fff; text-align: center; font-size: 15px; font-weight: 700; padding: 8px; }
        .report-root .sig-holder-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
        .report-root .sig-holder { padding: 12px; background: var(--off-white); border: 1px solid #e0d0b0; border-radius: 6px; }
        .report-root .photo-small { border: 1.5px solid var(--border); width: 65px; height: 80px; display: flex; align-items: center; justify-content: center; color: #bbb; background: #fff; border-radius: 3px; overflow: hidden; }
        .report-root .report-footer { position: fixed; bottom: 30px; right: 40px; display: flex; gap: 1rem; z-index: 100; }

        @media print {
          @page {
            margin: 0;
            size: A4 portrait;
          }

          /* Aggressive Reset to hide EVERYTHING except the report */
          html, body {
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          #root > *:not(.report-root):not(.app-container), 
          .sidebar, .mobile-header-bar, .top-bar, .master-breadcrumbs, .master-footer, 
          .vh-top-header, .vh-horizontal-nav, .vh-sidebar,
          .aadhar-header-v2, .aadhar-module-v3, .mp-header, .mp-stats, .mp-table-card, 
          .vh-col-right, .no-print, .report-footer {
            display: none !important;
          }

          /* Ensure ancestors don't push the content down */
          .app-container, .main-layout, .content-area, .master-main, 
          .master-content-wrapper, .vh-root, .vh-main-content, 
          .membership-page, .aadhar-module-v3 {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            height: auto !important;
            min-height: 0 !important;
            position: static !important;
            overflow: visible !important;
          }

          .report-root {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            z-index: 99999 !important;
          }

          .report-root .page {
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            border-top: 6px solid var(--maroon) !important;
            page-break-after: always !important;
            page-break-before: avoid !important;
            page-break-inside: avoid !important;
            width: 210mm !important;
            height: 297mm !important;
            padding: 15mm !important;
            box-sizing: border-box !important;
            display: block !important;
          }

          .report-root .page:last-child {
            page-break-after: auto !important;
          }

          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      {/* PAGE 1 */}
      <div className="page">
        <div className="header">
          <div className="logo-area">
            {/* <div className="logo-circle">ब</div> */}
            <div>
              <div className="org-name">{data.institution_name}</div>
              {/* <div className="org-sub">सहकारी पतपेढी मर्यादित</div>
              <div className="reg-no">नोंदणी क्र.: बी.ओ.एम./डब्ल्यु.बी./आर.एस.आर./(सी.आर.)९८–५–९९/३५४</div> */}
            </div>
          </div>
          <div className="corner-boxes">
            <div className="corner-box"><label>सभासद क्र.</label><span className="info-span">{data.membership_no}</span></div>
            <div className="corner-box"><label>स. क. नि. क्र.</label><span className="info-span">{data.ni_no}</span></div>
            <div className="corner-box"><label>बचत खाते क्र.</label><span className="info-span">{data.saving_acc_no}</span></div>
            <div className="corner-box"><label>क्लाईट आय. डी. क्र.</label><span className="info-span">{data.client_id}</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <label style={{ fontWeight: 600 }}>शाखा :</label><span className="info-span" style={{ width: 140 }}>{data.branch}</span>
              <div style={{ flex: 1, textAlign: 'center' }}><div className="form-title">सभासद अर्ज</div></div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>प्रति, मा. अध्यक्ष/उपाध्यक्ष, {data.institution_name || '________________'}</div>
            <div style={{ textAlign: 'right', fontSize: 12, marginBottom: 5 }}>दिनांक : {data.date}</div>
          </div>
          <div className="photo-box">
            {data.photo ? <img src={data.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="photo" /> : 'फोटो'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '8px 0', fontSize: 13 }}>
          <span>मी श्री/श्रीमती</span>
          <span className="info-span" style={{ flex: 1 }}>{data.full_name}</span>
          <span>अर्ज करीतो/करीते की,</span>
        </div>
        <div style={{ fontSize: 12, margin: '4px 0 10px', lineHeight: 1.7 }}>
          मला आपल्या सहकारी पतपेढीचे सभासदत्व द्यावे हि विनंती. मी पतपेढीच्या नियमांना बांधील राहुन नियमान्वये भरावे लागणारे पैसे भरण्यास तयार आहे.
        </div>

        <div className="fee-grid">
          <div className="fee-item"><label>१) सभासद भाग रक्कम रु.</label><span>{data.fee_share}</span></div>
          <div className="fee-item"><label>४) सभासद प्रवेश फी रु.</label><span>{data.fee_entrance}</span></div>
          <div className="fee-item"><label>२) सभासद कल्याण निधी रु.</label><span>{data.fee_welfare}</span></div>
          <div className="fee-item"><label>५) इतर जमा रक्कम रु.</label><span>{data.fee_other}</span></div>
          <div className="fee-item"><label>३) बचत जमा रक्कम रु.</label><span>{data.fee_savings}</span></div>
          <div className="fee-item"><label>६) एकूण सभासद वर्गणी रु.</label><span>{data.fee_total}</span></div>
        </div>

        <div className="sub-heading">माझ्या विषयीची माहिती खालील प्रमाणे</div>
        <div style={{ margin: '8px 0', fontSize: 12.5 }}>
          मी दुसऱ्या कोणत्याही वित्तीय संस्थेचा सभासद आहे: <strong>{data.is_member_elsewhere === 'yes' ? 'हो' : 'नाही'}</strong>
          {data.is_member_elsewhere === 'yes' && (
            <span style={{ marginLeft: 15 }}>संस्थेचे नाव: <span className="info-span" style={{ width: 140 }}>{data.other_ext_org_name}</span> शाखा: <span className="info-span" style={{ width: 80 }}>{data.other_ext_branch}</span></span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '8px 0' }}>
          <div style={{ flex: 1 }}>नाव: <span className="info-span" style={{ width: '85%' }}>{data.full_name}</span></div>
          <div>वय: <span className="info-span" style={{ width: 40 }}>{data.age}</span></div>
          <div>जन्म: <span className="info-span" style={{ width: 90 }}>{data.dob}</span></div>
        </div>

        <div style={{ margin: '10px 0' }}>पत्ता: <span className="info-span" style={{ width: '85%' }}>{data.current_address}</span></div>
        <div style={{ margin: '10px 0' }}>कायम पत्ता: <span className="info-span" style={{ width: '80%' }}>{data.permanent_address}</span></div>
        <div style={{ display: 'flex', gap: 10, margin: '10px 0' }}>
          <div style={{ flex: 1 }}>कामाचा पत्ता: <span className="info-span" style={{ width: '80%' }}>{data.working_address}</span></div>
          <div>फोन (शाखा/कार्यालय): <span className="info-span" style={{ width: 120 }}>{data.phone}</span></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', margin: '8px 0' }}>
          <div>मासिक उत्पन्न रु.: <span className="info-span" style={{ width: 100 }}>{data.monthly_income}</span></div>
          <div>वार्षिक उत्पन्न रु.: <span className="info-span" style={{ width: 100 }}>{data.yearly_income}</span></div>
          <div>भ्रमणध्वनी क्र.: <span className="info-span" style={{ width: 120 }}>{data.mobile}</span></div>
          <div>ई–मेल: <span className="info-span" style={{ width: 140 }}>{data.email}</span></div>
          <div>पॅन नंबर: <span className="info-span" style={{ width: 120 }}>{data.pan}</span></div>
          <div>आधार कार्ड नं.: <span className="info-span" style={{ width: 140 }}>{data.aadhaar}</span></div>
        </div>

        <div style={{ fontSize: 11, color: '#444', marginTop: 14, textAlign: 'justify', borderTop: '1px dashed #c8922a', paddingTop: 10 }}>
          १) मी आपल्या पतपेढी संबंधीचे सर्व नियम वाचलेले आहेत व ते समजून घेतलेले आहेत ते मला मान्य आहेत. &nbsp; २) वरील संपूर्ण माहिती व सादर केलेली कागद पत्र सत्य आहेत. &nbsp; ३) वरील माहितीत बदल झाल्यास कळविण्याची माझी जबाबदारी राहील.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <div style={{ textAlign: 'center', minWidth: 160 }}>
            <div style={{ borderBottom: '1.5px solid #1a1a1a', height: 36, marginBottom: 4 }}></div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>अर्जदाराची सही</div>
          </div>
        </div>
      </div>

      {/* PAGE 2 */}
      <div className="page">
        <div className="header">
          <div className="logo-area">
            <div>
              <div className="org-name">{data.institution_name}</div>
            </div>
          </div>
          <div className="corner-boxes">
            <div className="corner-box"><label>सभासद क्र.</label><span className="info-span">{data.membership_no}</span></div>
            <div className="corner-box"><label>आधार कार्ड नं.</label><span className="info-span">{data.aadhaar}</span></div>
          </div>
        </div>

        <div style={{ fontSize: 12, lineHeight: 1.8, marginBottom: 12, textAlign: 'justify' }}>
          मला आपल्या संस्थेच्या ऑनलाईन सेवांचा (RTGS, NEFT, मोबाईल अॅप, QR कोड व एस.एम.एस. सुविधा) लाभ घ्यायचा असून माझा अधिकधिकृत मोबाईल नंबर : <span className="info-span" style={{ width: 120 }}>{data.official_mobile || data.mobile}</span> आहे. संस्थेच्या नियमानुसार सेवा शुल्क आकारण्यास माझी सहमती आहे.
        </div>

        <div className="sub-heading">मी सदर अर्जा सोबत खालील कागदपत्र (छायांकित प्रत) जोडत आहे.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, margin: '10px 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.photos ? '☑' : '☐'} फोटो ३ प्रती</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.id_card ? '☑' : '☐'} ओळखपत्र</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.ration_card ? '☑' : '☐'} रेशनिंग कार्ड</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.aadhar_card ? '☑' : '☐'} आधार कार्ड</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.voter_card ? '☑' : '☐'} मतदान कार्ड</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.pan_card ? '☑' : '☐'} पॅन कार्ड</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.light_bill ? '☑' : '☐'} लाईट बिल</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11.5px' }}>{data.docs.residence_cert ? '☑' : '☐'} रहिवाशी दाखला</label>
        </div>

        <div style={{ margin: '14px 0', padding: '10px 12px', background: '#f9f5ee', border: '1px solid #e0d0b0', borderRadius: 6 }}>
          <div style={{ fontSize: 12.5, marginBottom: 10 }}>माझा वारस श्री./श्रीमती/कु. <span className="info-span" style={{ width: 220 }}>{data.nominee_name}</span> हा/ही राहील.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <label>वय</label><span className="info-span" style={{ width: 40 }}>{data.nominee_age}</span>
            <label>जन्म दिनांक</label><span className="info-span" style={{ width: 90 }}>{data.nominee_dob}</span>
            <label>नाते</label><span className="info-span" style={{ width: 100 }}>{data.nominee_relation}</span>
          </div>
          <div style={{ marginTop: 8 }}>वारसाचा पत्ता: <span className="info-span" style={{ width: '85%' }}>{data.nominee_address}</span></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <div style={{ textAlign: 'center', minWidth: 160 }}>
              <div style={{ borderBottom: '1.5px solid #1a1a1a', height: 36, marginBottom: 4 }}></div>
              <div style={{ fontSize: 12 }}>अर्जदाराची सही</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, lineHeight: 1.8, margin: '12px 0 8px', padding: '8px 10px', background: '#f5e6c8', borderRadius: 4, borderLeft: '3px solid #c8922a' }}>
          सदर अर्जदार हा आमचा संपूर्ण माहितीचा असून त्यास सभासद करुन घेण्याबद्दल आम्ही शिफारस करत आहोत.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>१) <span className="info-span" style={{ flex: 1 }}>{data.recommender1_name || data.recommender1Name}</span> सभासद क्र.: <span className="info-span" style={{ width: 80 }}>{data.recommender1_no || data.recommender1No}</span> सही: <span className="info-span" style={{ width: 100 }}></span></div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12.5 }}>२) <span className="info-span" style={{ flex: 1 }}>{data.recommender2_name || data.recommender2Name}</span> सभासद क्र.: <span className="info-span" style={{ width: 80 }}>{data.recommender2_no || data.recommender2No}</span> सही: <span className="info-span" style={{ width: 100 }}></span></div>
        </div>

        <div className="office-section">
          <div className="office-section-title">कार्यालयीन माहितीसाठी</div>
          <div className="office-section-body">
            <div className="office-row">
              <div>
                <div style={{ fontWeight: 700, color: '#7b1a1a', textAlign: 'center', marginBottom: 6 }}>शाखा</div>
                <div className="sign-area"></div>
                <div className="sign-desc">लिपिक &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; शाखाधिकारी</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#7b1a1a', textAlign: 'center', marginBottom: 6 }}>मुख्य कार्यालय</div>
                <div className="sign-area"></div>
                <div className="sign-desc">शाखाधिकारी</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 12.5, marginTop: 10 }}>
              <label>सभा दि.:</label><span className="info-span" style={{ width: 90 }}></span>
              <label>सभा क्र.:</label><span className="info-span" style={{ width: 60 }}></span>
              <label>ठराव क्र.:</label><span className="info-span" style={{ width: 60 }}></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 25 }}>
              <div style={{ textAlign: 'center', minWidth: 160 }}><div style={{ borderBottom: '1.5px solid #1a1a1a', height: 30 }}></div><div style={{ fontSize: 11 }}>अधिकारी/व्यवस्थापक</div></div>
              <div style={{ textAlign: 'center', minWidth: 160 }}><div style={{ borderBottom: '1.5px solid #1a1a1a', height: 30 }}></div><div style={{ fontSize: 11 }}>अध्यक्ष/उपाध्यक्ष</div></div>
            </div>
          </div>
        </div>
      </div>

      {/* PAGE 3 */}
      <div className="page">
        <div className="header">
          <div className="logo-area">
            {/* <div className="logo-circle">{data.institution_name ? data.institution_name.charAt(0) : 'ब'}</div> */}
            <div>
              <div className="org-name">{data.institution_name}</div>
              {/* <div className="org-sub">सहकारी पतपेढी मर्यादित</div>
              <div className="reg-no">रजि. नं.: बी.ओ.एम./डब्ल्यु.बी./आर.एस.आर./(सी.आर.)/३५४/९८–५–९९</div> */}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="photo-small">{data.photo ? <img src={data.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '१'}</div>
            <div className="photo-small">{data.photo ? <img src={data.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '२'}</div>
          </div>
        </div>

        <div className="signature-card">
          <div className="signature-card-title">बचत/उत्कर्ष/दैनंदिन खाते हस्ताक्षर कार्ड</div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
              <span style={{ flex: 1 }}>मी माझे आपल्या पतसंस्थेत खाते उघडू इच्छितो.</span>
              <label style={{ fontWeight: 700 }}>खाते क्र.:</label><span className="info-span" style={{ width: 130 }}>{data.saving_acc_no}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 12.5 }}>
              जमा करण्यासाठी रु. <span className="info-span" style={{ width: 100 }}>{data.acc_initial_amount || data.accInitialAmount}</span> अक्षरी रु. <span className="info-span" style={{ width: 250 }}>{data.acc_initial_amount_words || data.accInitialAmountWords}</span> देत आहे.
            </div>

            <div className="sig-holder-grid">
              <div className="sig-holder">
                <div style={{ fontWeight: 700, fontSize: 13, color: '#7b1a1a', marginBottom: 10 }}>१) खातेदार पहिले</div>
                <div style={{ fontSize: 12.5 }}>नाव: <span className="info-span" style={{ width: '80%' }}>{data.full_name}</span> वय: <span className="info-span" style={{ width: 40 }}>{data.age}</span></div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 10 }}>सहीचा नमुना:</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <div style={{ flex: 1, borderBottom: '1.5px solid #c8922a', height: 40, textAlign: 'center', fontSize: 10, color: '#aaa' }}>१)</div>
                  <div style={{ flex: 1, borderBottom: '1.5px solid #c8922a', height: 40, textAlign: 'center', fontSize: 10, color: '#aaa' }}>२)</div>
                </div>
              </div>
              <div className="sig-holder">
                <div style={{ fontWeight: 700, fontSize: 13, color: '#7b1a1a', marginBottom: 10 }}>२) खातेदार दुसरे</div>
                <div style={{ fontSize: 12.5 }}>नाव: <span className="info-span" style={{ width: '80%' }}>{data.holder2_name || data.holder2Name}</span> वय: <span className="info-span" style={{ width: 40 }}>{data.holder2_age || data.holder2Age}</span></div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 10 }}>सहीचा नमुना:</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <div style={{ flex: 1, borderBottom: '1.5px solid #c8922a', height: 40, textAlign: 'center', fontSize: 10, color: '#aaa' }}>१)</div>
                  <div style={{ flex: 1, borderBottom: '1.5px solid #c8922a', height: 40, textAlign: 'center', fontSize: 10, color: '#aaa' }}>२)</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, margin: '14px 0', fontSize: 12.5 }}>
              <label style={{ fontWeight: 700 }}>सूचना:</label>
              <span>{data.acc_type === 'swata' ? '☑' : '☐'} स्वतः</span>
              <span>{data.acc_type === 'sanyukta' ? '☑' : '☐'} संयुक्तपणे</span>
              <span style={{ marginLeft: 10 }}>इतर: <span className="info-span" style={{ width: 140 }}></span></span>
            </div>

            <div style={{ display: 'flex', gap: 8, fontSize: 12, marginTop: 10 }}>
              <label>वारसाचे नाव:</label><span className="info-span" style={{ flex: 1 }}>{data.nominee_name}</span>
              <label>नाते:</label><span className="info-span" style={{ width: 100 }}>{data.nominee_relation}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 30, textAlign: 'center' }}>
              <div><div style={{ borderBottom: '1.5px solid #000', height: 28, marginBottom: 4 }}></div><span style={{ fontSize: 11 }}>लिपिक</span></div>
              <div><div style={{ borderBottom: '1.5px solid #000', height: 28, marginBottom: 4 }}></div><span style={{ fontSize: 11 }}>शाखाधिकारी</span></div>
              <div><div style={{ borderBottom: '1.5px solid #000', height: 28, marginBottom: 4 }}></div><span style={{ fontSize: 11 }}>अधिकारी</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="report-footer no-print">
        <button className="caf-btn caf-btn-secondary" onClick={() => (onClose ? onClose() : window.location.reload())}><ChevronLeft size={18} /> मागे</button>
        <button className="caf-btn caf-btn-primary" onClick={() => window.print()}><Check size={18} /> प्रिंट (Print)</button>
        <button className="caf-btn caf-btn-success" onClick={onClose}><X size={18} /> बाहेर पडा (Exit)</button>
      </div>
    </div>
  );
}


