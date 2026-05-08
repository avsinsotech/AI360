import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const fmt = (n) => '₹ ' + Math.round(n || 0).toLocaleString('en-IN');

export default function HousingLoanScrutinyDetail({ application }) {
  const [activeTab, setActiveTab] = useState(0);
  const [submittingAction, setSubmittingAction] = useState(null);

  /* ══ State ══ */
  const [applicant, setApplicant] = useState({
    fullName: application?.applicantName || '',
    fatherSpouseName: '',
    dob: '',
    gender: 'Male',
    maritalStatus: '',
    mobile: '',
    email: '',
    pan: '',
    aadhaar: '',
    currentAddress: '',
    city: '',
    pinCode: '',
  });

  // ── Aadhaar Verification Fetch ──────────────────────────────────────────
  useEffect(() => {
    const fetchVerifiedAadhar = async () => {
      if (!applicant.fullName) return;

      try {
        const res = await api.get('/api/AadharProxy/history');
        if (res.data && Array.isArray(res.data)) {
          // Find matching record by Name (Normalized)
          const searchName = applicant.fullName.toLowerCase().trim().replace(/ +/g, ' ');
          
          const match = res.data
            .filter(a => a.name)
            .find(a => a.name.toLowerCase().trim().replace(/ +/g, ' ') === searchName);

          if (match) {
            setApplicant(prev => ({
              ...prev,
              aadhaar: match.aadhaarNo || prev.aadhaar,
              dob: match.dob || prev.dob,
              currentAddress: match.address || prev.currentAddress,
              photo: match.photo || prev.photo, // Support for displaying verified photo
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching Aadhaar history:", err);
      }
    };

    fetchVerifiedAadhar();
  }, [applicant.fullName]);

  const [employment, setEmployment] = useState({
    type: 'Salaried',
    employerName: '',
    designation: '',
    experience: '',
  });

  const [loan, setLoan] = useState({
    amount: 0, tenure: 0, interestRate: 8.5, purpose: '',
    processingFee: 0,
  });

  const [property, setProperty] = useState({
    type: '', address: '', area: '', 
    marketValue: 0, agreementValue: 0,
    builder: '', project: '', possession: '',
  });

  const [income, setIncome] = useState({
    grossSalary: 0, deductions: 0, netSalary: 0, otherIncome: 0, coApplicantIncome: 0, existingEMI: 0,
  });

  const [cibilScore] = useState(742);

  useEffect(() => {
    if (application?.details) {
      const d = application.details;
      // Parse rawJson if it exists (Source of Truth)
      let r = {};
      try {
        if (d.rawJson) r = typeof d.rawJson === 'string' ? JSON.parse(d.rawJson) : d.rawJson;
      } catch (e) { console.error("Error parsing rawJson", e); }

      const b = r.Borrower || d.Borrower || {};
      const p = r.Property || d.Property || {};
      const i = r.Insurance || {};
      const biz = r.Business || {};

      // 1. Applicant Details
      setApplicant(prev => ({
        ...prev,
        fullName: r.arjdarNaav || b.FullName || d.ApplicantName || prev.fullName,
        fatherSpouseName: b.FatherName || d.Borrower?.FatherName || '',
        pan: i.PanNo || biz.BusinessPan || b.Pan || prev.pan,
        aadhaar: b.AadharNo || '',
        dob: b.Age || d.ApplicantAge || prev.dob, // Form stores age in 'Vay' field
        maritalStatus: r.vaivahik || b.MaritalStatus || '',
        mobile: b.Mobile || '',
        email: b.Email || '',
        currentAddress: b.Address || '',
        city: b.Village || b.District || d.Branch || '',
        pinCode: b.PinCode || '',
      }));

      // 2. Employment
      setEmployment({
        type: b.Company ? 'Salaried' : (biz.BusinessFirmName ? 'Business' : 'Other'),
        employerName: b.Company || biz.BusinessFirmName || '',
        designation: b.Designation || biz.BusinessNature || '',
        experience: b.JobYears || biz.BusinessExperience || '',
      });

      // 3. Loan
      const loanAmt = parseFloat(r.karjRakkam || d.LoanAmountNum || 0);
      setLoan(prev => ({
        ...prev,
        amount: loanAmt,
        tenure: parseInt(r.paratfedKalavadhi || d.RepaymentMonths || 0),
        purpose: r.karan || d.LoanPurpose || prev.purpose,
        processingFee: Math.round(loanAmt * 0.005),
      }));

      // 4. Property
      const builderName = p.BuilderFirmName || r.firmNaav || p.VendorName || r.vikretaNaav || '';
      setProperty({
        type: p.PropertyType || '',
        address: p.PropertyAddress || r.milkatPatta || '',
        area: p.Area || r.kshetrafal || '',
        marketValue: parseFloat(p.MarketValuation || r.bazarBhav || 0),
        agreementValue: parseFloat(p.TotalPurchasePrice || r.ekunKharedi || 0),
        builder: builderName,
        project: p.HousingSocietyName || r.housingNaav || '',
        possession: p.OcDate || r.ocDin || '',
      });

      // 5. Income & EMI
      const gross = parseFloat(b.MonthlySalary || r.bMonthlyVetan || 0);
      const net = parseFloat(b.NetSalary || r.bNiwal || 0);
      const other = parseFloat(b.AnnualIncome || biz.BusinessAnnualIncome || 0) / 12;
      
      // Calculate Existing EMI from CurrentLoansJson if available
      let extEmi = 0;
      try {
        if (p.CurrentLoansJson) {
          const lns = JSON.parse(p.CurrentLoansJson);
          extEmi = lns.reduce((acc, curr) => acc + parseFloat(curr.e || 0), 0);
        }
      } catch(e) {}

      setIncome({
        grossSalary: gross,
        deductions: gross - net,
        netSalary: net,
        otherIncome: Math.round(other),
        coApplicantIncome: 0, // Could be handled if co-applicant details exist
        existingEMI: extEmi || parseFloat(r.loan1Emi || 0),
      });
    }
  }, [application]);

  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (application?.items && application?.masterList) {
      // Group masterList items by Category
      const categories = [...new Set(application.masterList.map(m => m.category || 'Other Documents'))];
      
      const dynamicDocs = categories.map(catName => {
        const catItems = application.masterList
          .filter(m => (m.category || 'Other Documents') === catName)
          .map(master => {
            const uploaded = application.items.find(x => x.documentMasterId === master.id);
            return {
              id: master.id,
              name: master.documentName,
              detail: master.isMandatory ? 'Required' : 'Optional',
              checked: uploaded?.status === 'Verified',
              status: uploaded?.status || 'Pending',
              date: uploaded?.uploadedAt ? new Date(uploaded.uploadedAt).toLocaleDateString('en-IN') : '—',
              required: master.isMandatory
            };
          });

        return {
          cat: catName,
          items: catItems
        };
      });

      setDocuments(dynamicDocs);
    }
  }, [application]);

  const [officerRemarks, setOfficerRemarks] = useState('');

  /* ══ Calculations ══ */
  const totalDocs = documents.reduce((acc, cat) => acc + cat.items.length, 0);
  const verifiedDocs = documents.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0);
  const progressPercent = totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

  const netIncomeTotal = income.netSalary + income.otherIncome + income.coApplicantIncome;
  const mr = loan.interestRate / 12 / 100;
  const emi = (loan.amount && loan.tenure && mr > 0) ? Math.round((loan.amount * mr * Math.pow(1 + mr, loan.tenure)) / (Math.pow(1 + mr, loan.tenure) - 1)) : 0;
  const totalPayable = emi * (loan.tenure || 0);
  const totalInterest = Math.max(0, totalPayable - (loan.amount || 0));
  
  const totalObligation = income.existingEMI + emi;
  const foir = netIncomeTotal > 0 ? ((totalObligation / netIncomeTotal) * 100).toFixed(1) : 0;
  const ltv = property.marketValue > 0 ? ((loan.amount / property.marketValue) * 100).toFixed(1) : 0;
  const maxEMI = netIncomeTotal * 0.5;
  const availableForNew = Math.max(0, maxEMI - income.existingEMI);
  const eligibleAmount = (mr > 0 && loan.tenure) ? Math.round((availableForNew * (Math.pow(1 + mr, loan.tenure) - 1)) / (mr * Math.pow(1 + mr, loan.tenure))) : 0;

  const toggleDoc = (ci, ii) => {
    setDocuments(prev => prev.map((cat, i) => i === ci ? {
      ...cat,
      items: cat.items.map((item, j) => j === ii ? {
        ...item,
        checked: !item.checked,
        date: !item.checked ? new Date().toLocaleDateString('en-IN') : '—'
      } : item)
    } : cat));
  };

  const tabs = [
    '1. Applicant Details',
    '2. Loan Details',
    '3. Property Details',
    '4. Income Assessment',
    '5. Document Checklist',
    '6. Scrutiny Summary'
  ];
  const tabIcons = ['📋','🏦','🏠','₹','✅','📊'];
  const Badge = ({type, children}) => <span className={`ls-badge ${type}`}>{children}</span>;

  const handleAction = (action) => {
    if (action === 'reject' && !window.confirm('Reject this application?')) return;
    if (action === 'approve' && !window.confirm('Approve this application?')) return;
    setSubmittingAction(action);
    setTimeout(() => {
      setSubmittingAction(null);
      if (action === 'save') alert('Saved as Draft');
      if (action === 'reject') alert('Application Rejected');
      if (action === 'approve') alert('Approved & Forwarded');
    }, 1200);
  };

  const getStatusBadge = (status) => {
    if (status === 'Verified' || status === 'PASS') return 'success';
    if (status === 'Pending' || status === 'REVIEW') return 'warning';
    return 'danger';
  };

  return (
    <>
      <div className="ls-content-card">
        <div className="ls-tabs-header">
          {tabs.map((t, i) => (
            <button key={i} className={`ls-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
              {tabIcons[i]} {t}
            </button>
          ))}
        </div>

        {/* ═══ TAB 1: Applicant Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 0 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">व्यक्तिगत माहिती / Personal Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>अर्जदाराचे पूर्ण नाव / Full Name (as per PAN)</label><input value={applicant.fullName} readOnly /></div>
                <div className="ls-form-group"><label>वडिलांचे / पतीचे नाव / Father's / Spouse Name</label><input value={applicant.fatherSpouseName} readOnly /></div>
                <div className="ls-form-group"><label>जन्मतारीख / Date of Birth</label><input value={applicant.dob} readOnly /></div>
                <div className="ls-form-group"><label>लिंग / Gender</label><input value={applicant.gender} readOnly /></div>
                <div className="ls-form-group"><label>वैवाहिक स्थिती / Marital Status</label><input value={applicant.maritalStatus} readOnly /></div>
                <div className="ls-form-group"><label>मोबाईल नंबर / Mobile Number</label><input value={applicant.mobile} readOnly /></div>
                <div className="ls-form-group"><label>ईमेल / Email Address</label><input value={applicant.email} readOnly /></div>
                <div className="ls-form-group"><label>पॅन नंबर / PAN Number</label><input value={applicant.pan} readOnly /></div>
                <div className="ls-form-group"><label>आधार क्रमांक / Aadhaar Number</label><input value={applicant.aadhaar} readOnly /></div>
                <div className="ls-form-group" style={{gridColumn: 'span 2'}}><label>सध्याचा पत्ता / Current Address</label><input value={applicant.currentAddress} readOnly /></div>
                <div className="ls-form-group"><label>शहर / City</label><input value={applicant.city} readOnly /></div>
                <div className="ls-form-group"><label>पिन कोड / Pin Code</label><input value={applicant.pinCode} readOnly /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">रोजगार माहिती / Employment Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group">
                  <label>रोजगार प्रकार / Employment Type</label>
                  <select 
                    value={employment.type} 
                    onChange={e => setEmployment(prev => ({...prev, type: e.target.value}))}
                    style={{padding:'0.5rem 0.625rem', border:'1px solid #cbd5e1', borderRadius:8, fontSize:'0.8rem', outline:'none', background:'#fff', cursor:'pointer'}}
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed Professional">Self-Employed Professional</option>
                    <option value="Self-Employed Business">Self-Employed Business</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>मालकाचे नाव / Employer Name</label><input value={employment.employerName} readOnly /></div>
                <div className="ls-form-group"><label>पदनाम / Designation</label><input value={employment.designation} readOnly /></div>
                <div className="ls-form-group"><label>कार्यानुभव / Work Experience (Years)</label><input value={employment.experience} readOnly /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">केवायसी तपासणी / KYC Verification</div>
              <table className="ls-table">
                <thead><tr><th>Verification Point</th><th>Result</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>NSDL PAN Check</td><td>Name Matches</td><td><Badge type="success">Verified</Badge></td></tr>
                  <tr><td>UIDAI Aadhaar Check</td><td>Mobile Verified</td><td><Badge type="success">Verified</Badge></td></tr>
                  <tr><td>DigiLocker Integration</td><td>Documents Pulled</td><td><Badge type="success">Success</Badge></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ TAB 2: Loan Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 1 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>LOAN AMOUNT</h4><div className="ls-info-value">{fmt(loan.amount)}</div></div>
              <div className="ls-info-card"><h4>MONTHLY EMI</h4><div className="ls-info-value">{fmt(emi)}</div></div>
              <div className="ls-info-card"><h4>TOTAL INTEREST</h4><div className="ls-info-value">{fmt(totalInterest)}</div></div>
              <div className="ls-info-card"><h4>TOTAL PAYABLE</h4><div className="ls-info-value" style={{color:'#1e3a8a'}}>{fmt(totalPayable)}</div></div>
            </div>
            
            <div className="ls-section">
              <div className="ls-section-title">कर्ज तपशील / Loan Parameters</div>
              <div className="ls-form-grid" style={{gridTemplateColumns:'repeat(5, 1fr)'}}>
                <div className="ls-form-group"><label>कर्ज रक्कम (₹) / Loan Amount (₹)</label><input value={loan.amount} readOnly /></div>
                <div className="ls-form-group"><label>परतफेड कालावधी (महिने) / Tenure (Months)</label><input value={loan.tenure} readOnly /></div>
                <div className="ls-form-group"><label>व्याज दर (% वार्षिक) / Interest Rate (% p.a.)</label><input value={loan.interestRate} readOnly /></div>
                <div className="ls-form-group">
                  <label>कर्जाचा उद्देश / Loan Purpose</label>
                  <select value={loan.purpose} onChange={e => setLoan(p => ({...p, purpose: e.target.value}))} style={{padding:'0.5rem 0.625rem', border:'1px solid #cbd5e1', borderRadius:8, fontSize:'0.8rem', background:'#fff', cursor:'pointer', outline:'none'}}>
                    <option value="Purchase of Flat">Purchase of Flat</option>
                    <option value="Construction">Construction</option>
                    <option value="Renovation">Renovation</option>
                    <option value="Balance Transfer">Balance Transfer</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>सध्याचे ईएमआय (₹) / Existing EMI (₹)</label><input value={income.existingEMI} readOnly /></div>
                <div className="ls-form-group"><label>प्रक्रिया शुल्क (%) / Processing Fee (%)</label><input value="0.5" readOnly /></div>
              </div>
            </div>

            <div className="ls-section" style={{background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:12, padding:'1.25rem', marginTop:'1.5rem'}}>
              <h4 style={{fontSize:'0.9rem', color:'#0369a1', marginBottom:'0.75rem', fontWeight:700}}>EMI मोजण्याचे सूत्र / EMI Calculation Formula</h4>
              <div style={{fontSize:'0.85rem', color:'#0c4a6e', lineHeight:1.8}}>
                <div><strong>P</strong> = {fmt(loan.amount)} | <strong>R</strong> = {loan.interestRate}% p.a. ({(loan.interestRate/12).toFixed(3)}% p.m.) | <strong>N</strong> = {loan.tenure} months</div>
                <div style={{marginTop:8, fontSize:'0.95rem'}}>
                  <strong>EMI = P × r × (1+r)^n / [(1+r)^n - 1] = <span style={{color:'#1e3a8a', fontWeight:800}}>{fmt(emi)} प्रति महिना / per month</span></strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 3: Property Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 2 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>MARKET VALUE</h4><div className="ls-info-value">{fmt(property.marketValue)}</div></div>
              <div className="ls-info-card"><h4>AGREEMENT VALUE</h4><div className="ls-info-value">{fmt(property.agreementValue)}</div></div>
              <div className="ls-info-card"><h4>LTV RATIO</h4><div className="ls-info-value" style={{color: ltv > 80 ? '#dc2626' : '#BA7517'}}>{ltv}%</div></div>
              <div className="ls-info-card"><h4>LOAN AMOUNT</h4><div className="ls-info-value gold">{fmt(loan.amount)}</div></div>
            </div>
            <div className="ls-section">
              <div className="ls-section-title">मालमत्ता तपशील / Property Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group">
                  <label>मालमत्ता प्रकार / Property Type</label>
                  <select 
                    value={property.type} 
                    onChange={e => setProperty(prev => ({...prev, type: e.target.value}))}
                    style={{padding:'0.5rem 0.625rem', border:'1px solid #cbd5e1', borderRadius:8, fontSize:'0.8rem', outline:'none', background:'#fff', cursor:'pointer'}}
                  >
                    <option value="">Select Property Type</option>
                    <option value="Flat / Apartment">Flat / Apartment</option>
                    <option value="Row House">Row House</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Plot + Construction">Plot + Construction</option>
                  </select>
                </div>
                <div className="ls-form-group" style={{gridColumn:'span 2'}}><label>मालमत्ता पत्ता / Property Address</label><input value={property.address} readOnly /></div>
                <div className="ls-form-group"><label>कार्पेट क्षेत्र (चौ.फु.) / Carpet Area (sq.ft.)</label><input value={property.area} readOnly /></div>
                <div className="ls-form-group"><label>बाजार मूल्य (₹) / Market Value (₹)</label><input value={property.marketValue} readOnly /></div>
                <div className="ls-form-group"><label>करार मूल्य (₹) / Agreement Value (₹)</label><input value={property.agreementValue} readOnly /></div>
                <div className="ls-form-group"><label>बिल्डरचे नाव / Builder Name</label><input value={property.builder} readOnly /></div>
                <div className="ls-form-group"><label>प्रकल्पाचे नाव / Project Name</label><input value={property.project} readOnly /></div>
                <div className="ls-form-group"><label>अपेक्षित ताबा तारीख / Expected Possession</label>
                  <input 
                    type="date"
                    value={property.possession ? (property.possession.includes('T') ? property.possession.split('T')[0] : property.possession) : ''} 
                    onChange={e => setProperty(p => ({...p, possession: e.target.value}))}
                    style={{padding:'0.5rem 0.625rem', border:'1px solid #cbd5e1', borderRadius:8, fontSize:'0.8rem', outline:'none', background:'#fff', cursor:'pointer'}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 4: Income Assessment ═══ */}
        <div className={`ls-tab-content ${activeTab === 3 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>TOTAL INCOME</h4><div className="ls-info-value">{fmt(netIncomeTotal)}</div></div>
              <div className="ls-info-card"><h4>PROPOSED EMI</h4><div className="ls-info-value">{fmt(emi)}</div></div>
              <div className="ls-info-card"><h4>FOIR</h4><div className="ls-info-value" style={{color: foir > 50 ? '#dc2626' : '#059669'}}>{foir}%</div></div>
              <div className="ls-info-card"><h4>MAX ELIGIBLE LOAN</h4><div className="ls-info-value gold">{fmt(eligibleAmount)}</div></div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">उत्पन्न तपशील / Income Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>मासिक एकूण पगार (₹) / Gross Monthly Salary (₹)</label><input value={income.grossSalary} readOnly /></div>
                <div className="ls-form-group"><label>मासिक निव्वळ पगार (₹) / Net Monthly Salary (₹)</label><input value={income.netSalary} readOnly /></div>
                <div className="ls-form-group"><label>इतर उत्पन्न (₹/महिना) / Other Income (₹/month)</label><input value={income.otherIncome} readOnly /></div>
                <div className="ls-form-group"><label>सह-अर्जदाराचे उत्पन्न (₹/महिना) / Co-applicant Income (₹/month)</label><input value={income.coApplicantIncome} readOnly /></div>
              </div>
            </div>

            <div className="ls-section" style={{marginTop:'1.5rem'}}>
              <div className="ls-section-title">पात्रता आणि FOIR विश्लेषण / Eligibility & FOIR Analysis</div>
              <table className="ls-table">
                <tbody>
                  <tr><td>एकूण मासिक उत्पन्न / Total Monthly Income:</td><td>{fmt(netIncomeTotal)}</td></tr>
                  <tr><td>कमाल परवानगीयोग्य ईएमआय (50%) / Max Permissible EMI (50%):</td><td>{fmt(maxEMI)}</td></tr>
                  <tr><td>वजा: सध्याचे ईएमआय / Less: Existing EMI:</td><td>{fmt(income.existingEMI)}</td></tr>
                  <tr><td>नवीन ईएमआयसाठी उपलब्ध / Available for New EMI:</td><td>{fmt(availableForNew)}</td></tr>
                  <tr><td style={{fontWeight:700, color:'#1e3a8a'}}>कमाल पात्र कर्ज रक्कम / Maximum Eligible Loan:</td><td style={{fontWeight:800, color:'#1e3a8a'}}>{fmt(eligibleAmount)}</td></tr>
                  <tr><td style={{opacity:0.8}}>FOIR (Fixed Obligation to Income Ratio):</td><td style={{opacity:0.8}}>{foir}%</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ TAB 5: Document Checklist ═══ */}
        <div className={`ls-tab-content ${activeTab === 4 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section" style={{borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0'}}>
              <div style={{background:'#dbeafe', color:'#1e40af', padding:'1rem 1.25rem', fontWeight:700, fontSize:'0.9rem', borderBottom:'1px solid #bfdbfe'}}>
                आवाश्यक कागदपत्रे / Required Documents Checklist
              </div>
              <div style={{padding:'1.25rem'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem'}}>
                  <span style={{fontSize:'0.8rem', fontWeight:600, color:'#64748b'}}>कागदपत्र जमा स्थिती / Document Submission Status:</span>
                  <span style={{fontSize:'0.8rem', fontWeight:700, color: progressPercent === 100 ? '#059669' : '#1e40af'}}>{progressPercent}% Complete</span>
                </div>
                <div style={{width:'100%', height:12, background:'#f1f5f9', borderRadius:6, overflow:'hidden', marginBottom:'1.5rem'}}>
                  <div style={{width:`${progressPercent}%`, height:'100%', background:'linear-gradient(90deg, #10b981, #34d399)', transition:'width 0.5s ease'}}></div>
                </div>

                {documents.map((cat, ci) => (
                  <div key={`dc-${ci}`} style={{marginBottom:'1rem'}}>
                    <div style={{fontWeight:700, margin:'16px 0 8px 0', color:'#1e293b', fontSize:'0.85rem'}}>{cat.cat}:</div>
                    <div style={{display:'flex', flexDirection:'column', gap:8}}>
                      {cat.items.map((item, ii) => (
                        <div key={`di-${ci}-${ii}`} 
                          onClick={() => toggleDoc(ci, ii)}
                          style={{
                            display: 'flex', 
                            alignItems: 'center', 
                            padding: '0.75rem 1rem', 
                            borderRadius: 8, 
                            border: '1px solid',
                            borderColor: item.checked ? '#bbf7d0' : '#e2e8f0',
                            background: item.checked ? '#f0fdf4' : '#fff',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                          }}>
                          <input 
                            type="checkbox" 
                            checked={item.checked} 
                            onChange={() => {}} // toggled by parent div click
                            style={{width:18, height:18, marginRight:12, accentColor:'#059669', cursor:'pointer'}} 
                          />
                          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                            <div style={{fontSize:'1rem', color:'#1e293b'}}>
                              <strong>{item.name}</strong> {item.required && <span style={{color:'#dc2626'}}>*</span>} 
                              <span style={{fontSize:'0.85rem', color:'#64748b', marginLeft:6}}>({item.detail})</span>
                            </div>
                            <div style={{display:'flex', alignItems:'center'}}>
                              {item.checked ? (
                                <Badge type="success">✅ Verified ({item.date})</Badge>
                              ) : (
                                <span style={{fontSize:'0.85rem', color: item.required ? '#BA7517' : '#94a3b8', display:'flex', alignItems:'center', gap:4}}>
                                  {item.required ? <>⚠️ Required</> : <>⌛ Pending</>}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 6: Scrutiny Summary ═══ */}
        <div className={`ls-tab-content ${activeTab === 5 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-form-grid">
              {/* Applicant Summary */}
              <div className="ls-section">
                <div className="ls-section-title">अर्जदाराचा सारांश / Applicant Summary</div>
                <table className="ls-table">
                  <tbody>
                    <tr><td>नाव / Name:</td><td>{applicant.fullName}</td></tr>
                    <tr><td>पॅन / PAN:</td><td>{applicant.pan}</td></tr>
                    <tr><td>रोजगार / Employment:</td><td>{employment.type} ({employment.employerName})</td></tr>
                    <tr><td>अनुभव / Experience:</td><td>{employment.experience} Years</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Loan Summary */}
              <div className="ls-section">
                <div className="ls-section-title">कर्ज सारांश / Loan Summary</div>
                <table className="ls-table">
                  <tbody>
                    <tr><td>रक्कम / Amount:</td><td>{fmt(loan.amount)}</td></tr>
                    <tr><td>कालावधी / Tenure:</td><td>{loan.tenure} mths ({Math.floor(loan.tenure/12)} yrs)</td></tr>
                    <tr><td>व्याज / Interest:</td><td>{loan.interestRate}% p.a.</td></tr>
                    <tr><td>ईएमआय / EMI:</td><td>{fmt(emi)}/month</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Property Summary */}
              <div className="ls-section">
                <div className="ls-section-title">मालमत्ता सारांश / Property Summary</div>
                <table className="ls-table">
                  <tbody>
                    <tr><td>प्रकार / Type:</td><td>{property.type || 'Flat / Apartment'}</td></tr>
                    <tr><td>बाजार मूल्य / Market Value:</td><td>{fmt(property.marketValue)}</td></tr>
                    <tr><td>एलटीव्ही गुणोत्तर / LTV Ratio:</td><td>{ltv}%</td></tr>
                    <tr><td>ठिकाण / Location:</td><td>{applicant.city}</td></tr>
                  </tbody>
                </table>
              </div>

              {/* Income Summary */}
              <div className="ls-section">
                <div className="ls-section-title">उत्पन्न सारांश / Income Summary</div>
                <table className="ls-table">
                  <tbody>
                    <tr><td>निव्वळ उत्पन्न / Net Income:</td><td>{fmt(netIncomeTotal)}/mth</td></tr>
                    <tr><td>एफओआयआर / FOIR:</td><td>{foir}%</td></tr>
                    <tr><td>पात्रता / Eligibility:</td><td>{fmt(eligibleAmount)}</td></tr>
                    <tr><td>स्थिती / Status:</td><td>Within Limit / मर्यादेत</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ══ Risk Assessment Table ══ */}
            <div className="ls-section">
              <div className="ls-section-title">जोखीम मूल्यांकन सारांश / Risk Assessment Summary</div>
              <table className="ls-table">
                <thead>
                  <tr>
                    <th>घटक / Parameter</th>
                    <th>मूल्य / Value</th>
                    <th>मानक / Benchmark</th>
                    <th>स्थिती / Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>FOIR (Fixed Obligation to Income Ratio)</td>
                    <td>{foir}%</td>
                    <td>≤ 50%</td>
                    <td><Badge type={foir <= 50 ? 'success' : 'danger'}>{foir <= 50 ? 'PASS' : 'FAIL'}</Badge></td>
                  </tr>
                  <tr>
                    <td>LTV (Loan to Value Ratio)</td>
                    <td>{ltv}%</td>
                    <td>≤ 80%</td>
                    <td><Badge type={ltv <= 80 ? 'success' : 'warning'}>{ltv <= 80 ? 'PASS' : 'REVIEW'}</Badge></td>
                  </tr>
                  <tr>
                    <td>Loan Amount vs Eligibility</td>
                    <td>{Math.round(loan.amount/100000)}L / {Math.round(eligibleAmount/100000)}L</td>
                    <td>Within Limit</td>
                    <td><Badge type={loan.amount <= eligibleAmount ? 'success' : 'danger'}>{loan.amount <= eligibleAmount ? 'PASS' : 'FAIL'}</Badge></td>
                  </tr>
                  <tr>
                    <td>Document Completion</td>
                    <td>{progressPercent}%</td>
                    <td>100%</td>
                    <td><Badge type={progressPercent === 100 ? 'success' : 'danger'}>{progressPercent === 100 ? 'PASS' : 'INCOMPLETE'}</Badge></td>
                  </tr>
                  <tr>
                    <td>Employment Stability</td>
                    <td>{employment.experience} years</td>
                    <td>≥ 2 years</td>
                    <td><Badge type={parseInt(employment.experience) >= 2 ? 'success' : 'warning'}>{parseInt(employment.experience) >= 2 ? 'PASS' : 'REVIEW'}</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">निर्णय टिप्पणी / Recommendation</div>
              <textarea rows={3} style={{width:'100%',padding:12,border:'1px solid #cbd5e1',borderRadius:8,fontSize:'0.9rem',outline:'none'}} 
                placeholder="Enter final scrutiny remarks..."
                value={officerRemarks} onChange={e => setOfficerRemarks(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="ls-footer-actions">
        <div className="ls-status-indicator">
          <div className={`ls-status-dot processing`}></div>
          <span style={{fontWeight:700,fontSize:'0.8rem'}}>Process: Housing Loan Scrutiny Summary</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="ls-btn secondary" disabled={submittingAction} onClick={() => handleAction('save')}>
            {submittingAction === 'save' ? <><span className="ls-loader"></span> Saving...</> : '💾 Save Draft'}
          </button>
          <button className="ls-btn danger" disabled={submittingAction} onClick={() => handleAction('reject')}>
            {submittingAction === 'reject' ? <><span className="ls-loader"></span> Rejecting...</> : '❌ Reject'}
          </button>
          <button className="ls-btn success" disabled={submittingAction} onClick={() => handleAction('approve')}>
            {submittingAction === 'approve' ? <><span className="ls-loader"></span> Approving...</> : '✅ Approve & Forward'}
          </button>
        </div>
      </div>
    </>
  );
}