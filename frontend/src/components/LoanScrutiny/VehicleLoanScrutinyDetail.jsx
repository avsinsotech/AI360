import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const fmt = (n) => '₹ ' + Math.round(n || 0).toLocaleString('en-IN');

export default function VehicleLoanScrutinyDetail({ application, onBack }) {
  const [activeTab, setActiveTab] = useState(0);
  const [submittingAction, setSubmittingAction] = useState(null);

  const [applicant, setApplicant] = useState({
    fullName: application?.applicantName || '',
    pan: '', aadhaar: '', dob: '',
    mobile: '', email: '',
    address: '', residenceType: 'Owned',
  });

  const [vehicle, setVehicle] = useState({
    type: 'Four Wheeler', make: '', variant: '',
    year: '', exShowroom: 0, onRoad: 0, fuel: 'Petrol',
    engineCC: '', color: '', dealer: '',
    chassisNo: '', engineNo: '',
    transmission: 'Manual', seating: '5 Persons', mileage: '',
    dealerGST: '', invoiceNo: '',
    invoiceDate: '', deliveryDate: '',
    rtoReg: 0, insurance: 0, extWarranty: 0, accessories: 0,
  });

  const [loan, setLoan] = useState({ downPayment: 0, tenure: 5, interestRate: 9.5 });
  const [ins, setIns] = useState({ type: 'Comprehensive', amount: 0, warranty: 'No', addonAmount: 0 });
  const [employment, setEmployment] = useState({
    type: 'Salaried', employer: '', designation: '',
    experience: 0, currentYears: 0, empId: '',
  });
  const [income, setIncome] = useState({ grossSalary: 0, deductions: 0, otherIncome: 0, existingEMI: 0 });
  const [cibilScore] = useState(750);

  useEffect(() => {
    if (!application?.details) return;

    try {
      const d = typeof application.details === 'string' ? JSON.parse(application.details) : application.details;
      
      // Borrower Mapping
      const b = d.borrower || d.Borrower || {};
      setApplicant(prev => ({
        ...prev,
        fullName: application.applicantName || b.naav || d.arjdarNaav || b.fullName || prev.fullName,
        pan: d.incTaxPan || b.panNo || prev.pan,
        aadhaar: b.aadharNo || prev.aadhaar,
        mobile: b.mobile || d.bMobile || prev.mobile,
        email: b.email || d.bEmail || prev.email,
        address: b.patta || d.bPatta || prev.address,
        residenceType: b.natureOfResidence || (b.jageSwaarupJson ? JSON.parse(b.jageSwaarupJson)[0] : prev.residenceType),
      }));

      // Vehicle Mapping
      const nv = d.newVehicle || d.NewVehicle || {};
      const ov = d.oldVehicle || d.OldVehicle || {};
      const isNew = !!d.newCompanyNaav || !!nv.companyNaav || !!d.newVahanaPrakar;
      
      const vData = isNew ? nv : ov;
      
      setVehicle(prev => ({
        ...prev,
        type: vData.vahanaPrakar || d.newVahanaPrakar || ov.vahanaPrakar || d.oldVahanaPrakar || prev.type,
        make: vData.companyNaav || d.newCompanyNaav || ov.companyNaav || d.oldCompanyNaav || prev.make,
        variant: vData.model || d.newModel || ov.model || d.oldModel || prev.variant,
        year: vData.nirmitVarsh || d.newNirmitVarsh || ov.nirmitVarsh || d.oldNirmitVarsh || prev.year,
        exShowroom: parseFloat(vData.kimat || d.newKimat || ov.kimat || d.oldKimat || 0),
        onRoad: parseFloat(vData.kimat || d.newKimat || ov.kimat || d.oldKimat || 0) * 1.15, 
        fuel: vData.fuelType || d.newFuelType || ov.fuelType || d.oldFuelType || prev.fuel,
        dealer: vData.dealerNaav || d.newDealerNaav || ov.dealerNaav || d.oldDealerNaav || prev.dealer,
        engineNo: vData.engineNo || prev.engineNo,
        chassisNo: vData.chassisNo || prev.chassisNo,
      }));

      // Loan Mapping
      setLoan(prev => ({
        ...prev,
        downPayment: parseFloat(vData.booking || d.newBooking || vData.advance || d.oldAdvance || 0),
        tenure: parseInt(d.paratfedKalavadhi || 60) / 12,
        interestRate: application.interestRate || 9.5,
      }));

      // Employment & Income
      setEmployment(prev => ({
        ...prev,
        type: b.employmentType || prev.type,
        employer: b.company || d.bCompany || prev.employer,
        designation: b.hudda || d.bHudda || prev.designation,
        experience: parseInt(b.karj_v || 0),
        empId: b.empCode || prev.empId,
      }));

      setIncome(prev => ({
        ...prev,
        grossSalary: parseFloat(b.monthlyVetan || 0),
        deductions: parseFloat(b.kapat || 0),
        existingEMI: b.bank96Rakkam ? parseFloat(b.bank96Rakkam) / 24 : 0, 
      }));

    } catch (err) {
      console.error("Error parsing application details:", err);
    }
  }, [application]);

  const [documents, setDocuments] = useState([
    { cat: 'KYC Documents', items: [
      { name: 'PAN Card', detail: '', date: '', checked: false },
      { name: 'Aadhaar Card', detail: '', date: '', checked: false },
      { name: 'Driving License', detail: '', date: '', checked: false },
      { name: 'Passport Size Photos', detail: '', date: '', checked: false },
    ]},
    { cat: 'Address Proof', items: [{ name: 'Electricity Bill / Ration Card', detail: '', date: '', checked: false }]},
    { cat: 'Income Proof', items: [
      { name: 'Salary Slips', detail: '', date: '', checked: false },
      { name: 'Bank Statement', detail: '', date: '', checked: false },
      { name: 'Form 16 / ITR', detail: '', date: '', checked: false },
    ]},
    { cat: 'Employment Proof', items: [{ name: 'Employment ID Card', detail: '', date: '', checked: false }]},
    { cat: 'Vehicle Documents', items: [
      { name: 'Proforma Invoice', detail: '', date: '', checked: false },
      { name: 'Quotation', detail: '', date: '', checked: false },
    ]},
    { cat: 'Additional Documents', items: [
      { name: 'Post-Dated Cheques', detail: '', date: '', checked: false },
      { name: 'NACH Mandate', detail: '', date: '', checked: false },
      { name: 'Insurance Quotation', detail: '', date: '', checked: false },
    ]},
  ]);

  useEffect(() => {
    if (application?.items) {
      setDocuments(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const match = application.items.find(doc => doc.documentType === item.name);
          return match ? { ...item, checked: match.status === 'VERIFIED', date: match.updatedAt?.split('T')[0] || '', detail: match.documentNo || '' } : item;
        })
      })));
    }
  }, [application]);

  const [officerRemarks, setOfficerRemarks] = useState('');

  /* ══ Calculations ══ */

  const netSalary = income.grossSalary - income.deductions;
  const totalIncome = netSalary + income.otherIncome;
  const loanAmount = vehicle.onRoad - loan.downPayment;
  const ltv = ((loanAmount / vehicle.onRoad) * 100).toFixed(2);
  const tenureMonths = loan.tenure * 12;
  const mr = loan.interestRate / 12 / 100;
  const emi = mr > 0 ? Math.round((loanAmount * mr * Math.pow(1 + mr, tenureMonths)) / (Math.pow(1 + mr, tenureMonths) - 1)) : 0;
  const totalObligation = income.existingEMI + emi;
  const foir = totalIncome > 0 ? ((totalObligation / totalIncome) * 100).toFixed(1) : 0;
  const maxObligation = totalIncome * 0.5;
  const availableForNew = maxObligation - income.existingEMI;
  const eligibleAmount = mr > 0 ? Math.round((availableForNew * (Math.pow(1 + mr, tenureMonths) - 1)) / (mr * Math.pow(1 + mr, tenureMonths))) : 0;
  const surplus = totalIncome - totalObligation;
  const totalInterest = emi * tenureMonths - loanAmount;
  const totalPayable = emi * tenureMonths;
  const dpPct = ((loan.downPayment / vehicle.onRoad) * 100).toFixed(0);

  let rec = '✅ Approve', recClr = '#059669';
  if (foir > 50) { rec = '❌ Reject'; recClr = '#dc2626'; }
  else if (foir > 45) { rec = '⚠️ Review'; recClr = '#d97706'; }

  let foirBg = 'linear-gradient(90deg, #059669, #34d399)';
  if (foir > 50) foirBg = 'linear-gradient(90deg, #dc2626, #f87171)';
  else if (foir > 45) foirBg = 'linear-gradient(90deg, #d97706, #fbbf24)';

  const emiSchedule = [];
  let bal = loanAmount;
  for (let i = 1; i <= Math.min(12, tenureMonths); i++) {
    const int = bal * mr; const prin = emi - int; bal -= prin;
    emiSchedule.push({ m: i, emi, p: Math.round(prin), i: Math.round(int), b: Math.round(bal) });
  }

  const allDocs = documents.flatMap(c => c.items);
  const checkedDocs = allDocs.filter(d => d.checked).length;
  const docPct = Math.round((checkedDocs / allDocs.length) * 100);

  const toggleDoc = (ci, ii) => setDocuments(prev => {
    const c = JSON.parse(JSON.stringify(prev));
    c[ci].items[ii].checked = !c[ci].items[ii].checked;
    return c;
  });

  const u = (setter) => (f, v) => setter(p => ({ ...p, [f]: v }));
  const uA = u(setApplicant), uV = u(setVehicle), uL = u(setLoan), uI = u(setIns), uE = u(setEmployment), uIn = u(setIncome);

  const tabs = ['Applicant & Vehicle','KYC Verification','Income Assessment','Credit Score','Vehicle Valuation','Eligibility','Documents','Risk Analysis','Decision'];
  const tabIcons = ['📋','✅','💰','📊','🚗','🎯','📁','⚠️','✓'];

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

  return (
    <>
      {/* Tabs */}
      <div className="ls-content-card">
        <div className="ls-tabs-header">
          {tabs.map((t, i) => (
            <button key={i} className={`ls-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
              {tabIcons[i]} {t}
            </button>
          ))}
        </div>

        {/* ═══ TAB 0: Applicant & Vehicle ═══ */}
        <div className={`ls-tab-content ${activeTab === 0 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">अर्जदाराचे तपशील / Applicant Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>पूर्ण नाव / Full Name *</label><input value={applicant.fullName} onChange={e => uA('fullName', e.target.value)} /></div>
                <div className="ls-form-group"><label>पॅन कार्ड / PAN Card *</label><input value={applicant.pan} onChange={e => uA('pan', e.target.value)} maxLength={10} /></div>
                <div className="ls-form-group"><label>आधार क्रमांक / Aadhaar *</label><input value={applicant.aadhaar} onChange={e => uA('aadhaar', e.target.value)} /></div>
                <div className="ls-form-group"><label>जन्मतारीख / DOB *</label><input type="date" value={applicant.dob} onChange={e => uA('dob', e.target.value)} /></div>
                <div className="ls-form-group"><label>मोबाइल / Mobile *</label><input value={applicant.mobile} onChange={e => uA('mobile', e.target.value)} /></div>
                <div className="ls-form-group"><label>ईमेल / Email</label><input type="email" value={applicant.email} onChange={e => uA('email', e.target.value)} /></div>
                <div className="ls-form-group"><label>पत्ता / Address *</label><input value={applicant.address} onChange={e => uA('address', e.target.value)} /></div>
                <div className="ls-form-group"><label>राहणीमान / Residence</label>
                  <select value={applicant.residenceType} onChange={e => uA('residenceType', e.target.value)}><option>Owned</option><option>Rented</option><option>Parental</option></select>
                </div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">वाहन तपशील / Vehicle Details</div>
              <div className="ls-form-grid">
                {[['Vehicle Type',vehicle.type,'type'],['Make & Model',vehicle.make,'make'],['Variant',vehicle.variant,'variant'],['Manufacturing Year',vehicle.year,'year']].map(([l,v,k],i) => (
                  <div className="ls-form-group" key={`vs-${i}`}><label>{l}</label><input value={v} onChange={e => uV(k, e.target.value)} /></div>
                ))}
                <div className="ls-form-group"><label>Ex-Showroom Price</label><input value={fmt(vehicle.exShowroom)} readOnly style={{background:'#f1f5f9'}} /></div>
                <div className="ls-form-group"><label>On-Road Price</label><input value={fmt(vehicle.onRoad)} readOnly style={{background:'#f1f5f9'}} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">कर्ज तपशील / Loan Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>On-Road Price (₹)</label><input type="number" value={vehicle.onRoad} onChange={e => uV('onRoad', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Down Payment (₹)</label><input type="number" value={loan.downPayment} onChange={e => uL('downPayment', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Loan Amount (₹)</label><input type="number" value={loanAmount} readOnly style={{background:'#f1f5f9'}} /></div>
                <div className="ls-form-group"><label>Tenure (Years)</label><input type="number" value={loan.tenure} min={1} max={7} onChange={e => uL('tenure', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Interest Rate (%)</label><input type="number" value={loan.interestRate} step={0.1} onChange={e => uL('interestRate', +e.target.value)} /></div>
                <div className="ls-form-group"><label>LTV Ratio (%)</label><input value={ltv} readOnly style={{background:'#f1f5f9'}} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Insurance & Add-ons</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>Insurance Type</label>
                  <select value={ins.type} onChange={e => uI('type', e.target.value)}><option>Comprehensive</option><option>Third Party</option></select>
                </div>
                <div className="ls-form-group"><label>Insurance Amount (₹)</label><input type="number" value={ins.amount} onChange={e => uI('amount', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Extended Warranty</label>
                  <select value={ins.warranty} onChange={e => uI('warranty', e.target.value)}><option>Yes - 2 Years</option><option>No</option></select>
                </div>
                <div className="ls-form-group"><label>Add-on Amount (₹)</label><input type="number" value={ins.addonAmount} onChange={e => uI('addonAmount', +e.target.value)} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 1: KYC ═══ */}
        <div className={`ls-tab-content ${activeTab === 1 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-info-row">
              {[['PAN Verification','✅ Verified'],['Aadhaar Verification','✅ Verified'],['Driving License','✅ Valid'],['KYC Status','✅ Complete']].map(([h,v],i) => (
                <div className="ls-info-card" key={`kyc-${i}`}><h4>{h}</h4><div className="ls-info-value">{v}</div></div>
              ))}
            </div>
            <div className="ls-section">
              <div className="ls-section-title">KYC Document Verification</div>
              <table className="ls-table"><thead><tr><th>Document Type</th><th>Document Number</th><th>Status</th><th>Expiry</th><th>Verified By</th></tr></thead>
                <tbody>
                  {[['PAN Card','ABCPP1234N','Verified','-','NSDL'],['Aadhaar Card','XXXX XXXX 0123','Verified','-','UIDAI'],['Driving License','MH12-20260012345','Valid','19-Mar-2046','Parivahan'],['Bank Account','SBI-XXXX5678','Active','-','Penny Drop'],['Address Proof','Electricity Bill','Verified','-','Manual']].map(([t,n,s,e,b],i) => (
                    <tr key={`kd-${i}`}><td>{t}</td><td>{n}</td><td><Badge type="success">{s}</Badge></td><td>{e}</td><td>{b}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ls-section">
              <div className="ls-section-title">Driving License Details</div>
              <div className="ls-info-row">
                {[['License Number','MH12-20260012345'],['Issue Date','20-Mar-2016'],['Valid Till','19-Mar-2046'],['Vehicle Class','LMV, MCWG']].map(([h,v],i) => (
                  <div className="ls-info-card" key={`dl-${i}`}><h4>{h}</h4><div className="ls-info-value">{v}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 2: Income ═══ */}
        <div className={`ls-tab-content ${activeTab === 2 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">रोजगार माहिती / Employment Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>Employment Type</label>
                  <select value={employment.type} onChange={e => uE('type', e.target.value)}><option>Salaried</option><option>Self-Employed Professional</option><option>Business Owner</option></select>
                </div>
                <div className="ls-form-group"><label>Employer Name</label><input value={employment.employer} onChange={e => uE('employer', e.target.value)} /></div>
                <div className="ls-form-group"><label>Designation</label><input value={employment.designation} onChange={e => uE('designation', e.target.value)} /></div>
                <div className="ls-form-group"><label>Total Experience (Yrs)</label><input type="number" value={employment.experience} onChange={e => uE('experience', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Current Company (Yrs)</label><input type="number" value={employment.currentYears} onChange={e => uE('currentYears', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Employee ID</label><input value={employment.empId} onChange={e => uE('empId', e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">उत्पन्न तपशील / Income Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>Monthly Gross Salary (₹)</label><input type="number" value={income.grossSalary} onChange={e => uIn('grossSalary', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Monthly Deductions (₹)</label><input type="number" value={income.deductions} onChange={e => uIn('deductions', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Net Monthly Salary (₹)</label><input type="number" value={netSalary} readOnly style={{background:'#f1f5f9'}} /></div>
                <div className="ls-form-group"><label>Other Income (₹)</label><input type="number" value={income.otherIncome} onChange={e => uIn('otherIncome', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Total Monthly Income (₹)</label><input type="number" value={totalIncome} readOnly style={{fontWeight:700,color:'#059669',background:'#f1f5f9'}} /></div>
                <div className="ls-form-group"><label>Existing EMIs (₹)</label><input type="number" value={income.existingEMI} onChange={e => uIn('existingEMI', +e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Bank Statement Analysis (Last 6 Months)</div>
              <table className="ls-table"><thead><tr><th>Parameter</th><th>Value</th><th>Status</th></tr></thead>
                <tbody>
                  {[['Avg Monthly Credit','₹ 1,26,500','Excellent'],['Avg Monthly Balance','₹ 85,400','Healthy'],['Bounce Cheques','0','Excellent'],['Salary Credit Regularity','6/6 Months','Regular'],['Min Balance Violations','0','Perfect']].map(([p,v,s],i) => (
                    <tr key={`bs-${i}`}><td>{p}</td><td>{v}</td><td><Badge type="success">{s}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ TAB 3: Credit Score ═══ */}
        <div className={`ls-tab-content ${activeTab === 3 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-score-display">
              <div style={{fontSize:'0.85rem'}}>CIBIL Score</div>
              <div className="ls-score-number">{cibilScore}</div>
              <div>Excellent Credit Score</div>
              <div style={{marginTop:6,fontSize:'0.7rem',opacity:0.85}}>Report Date: 04-Apr-2026 | Source: TransUnion CIBIL</div>
            </div>
            <div className="ls-info-row">
              {[['Total Accounts','5'],['Active Accounts','3'],['Credit Utilization','25%'],['Payment History','100%']].map(([h,v],i) => (
                <div className="ls-info-card" key={`cs-${i}`}><h4>{h}</h4><div className="ls-info-value">{v}</div></div>
              ))}
            </div>
            <div className="ls-section">
              <div className="ls-section-title">Active Credit Facilities</div>
              <table className="ls-table"><thead><tr><th>Type</th><th>Institution</th><th>Sanctioned</th><th>Outstanding</th><th>EMI</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Home Loan</td><td>SBI</td><td>₹ 35,00,000</td><td>₹ 28,50,000</td><td>₹ 32,500</td><td><Badge type="success">Regular</Badge></td></tr>
                  <tr><td>Credit Card</td><td>HDFC Bank</td><td>₹ 3,00,000</td><td>₹ 75,000</td><td>-</td><td><Badge type="success">Active</Badge></td></tr>
                  <tr><td>Credit Card</td><td>Axis Bank</td><td>₹ 2,00,000</td><td>₹ 25,000</td><td>-</td><td><Badge type="success">Active</Badge></td></tr>
                </tbody>
              </table>
            </div>
            <div className="ls-section">
              <div className="ls-section-title">Credit Enquiries (Last 6 Months)</div>
              <table className="ls-table"><thead><tr><th>Date</th><th>Institution</th><th>Purpose</th><th>Amount</th></tr></thead>
                <tbody><tr><td>20-Mar-2026</td><td>Kotak Mahindra Bank</td><td>Car Loan</td><td>₹ 12,00,000</td></tr></tbody>
              </table>
              <div style={{marginTop:6,color:'#059669',fontSize:'0.75rem'}}>✅ Only 1 enquiry in last 6 months - Excellent</div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 4: Vehicle Valuation ═══ */}
        <div className={`ls-tab-content ${activeTab === 4 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">वाहन मूल्यांकन / Vehicle Valuation</div>
              <table className="ls-table"><tbody>
                <tr><td><strong>Make & Model</strong></td><td><input value={`${vehicle.make} ${vehicle.variant}`} onChange={e => uV('make', e.target.value)} /></td></tr>
                <tr><td><strong>Manufacturing Year</strong></td><td><input value={vehicle.year} onChange={e => uV('year', e.target.value)} /></td></tr>
                <tr><td><strong>Ex-Showroom Price</strong></td><td><input type="number" value={vehicle.exShowroom} onChange={e => uV('exShowroom', +e.target.value)} /></td></tr>
                <tr><td><strong>RTO Registration</strong></td><td><input type="number" value={vehicle.rtoReg} onChange={e => uV('rtoReg', +e.target.value)} /></td></tr>
                <tr><td><strong>Insurance</strong></td><td><input type="number" value={vehicle.insurance} onChange={e => uV('insurance', +e.target.value)} /></td></tr>
                <tr><td><strong>Extended Warranty</strong></td><td><input type="number" value={vehicle.extWarranty} onChange={e => uV('extWarranty', +e.target.value)} /></td></tr>
                <tr><td><strong>Accessories</strong></td><td><input type="number" value={vehicle.accessories} onChange={e => uV('accessories', +e.target.value)} /></td></tr>
                <tr><td><strong>On-Road Price</strong></td><td><strong style={{color:'#1a2332',fontSize:'1rem'}}>{fmt(vehicle.onRoad)}</strong></td></tr>
              </tbody></table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Dealer Information & Invoice</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>Dealer Name</label><input value={vehicle.dealer.split(',')[0]} onChange={e => uV('dealer', e.target.value)} /></div>
                <div className="ls-form-group"><label>Dealer Location</label><input value="Pune, Maharashtra" readOnly /></div>
                <div className="ls-form-group"><label>Dealer GST</label><input value={vehicle.dealerGST} onChange={e => uV('dealerGST', e.target.value)} /></div>
                <div className="ls-form-group"><label>Invoice Number</label><input value={vehicle.invoiceNo} onChange={e => uV('invoiceNo', e.target.value)} /></div>
                <div className="ls-form-group"><label>Invoice Date</label><input type="date" value={vehicle.invoiceDate} onChange={e => uV('invoiceDate', e.target.value)} /></div>
                <div className="ls-form-group"><label>Delivery Date</label><input type="date" value={vehicle.deliveryDate} onChange={e => uV('deliveryDate', e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Down Payment & Loan Calculation</div>
              <table className="ls-table"><tbody>
                <tr><td><strong>On-Road Price</strong></td><td><strong>{fmt(vehicle.onRoad)}</strong></td></tr>
                <tr><td>Down Payment ({dpPct}%)</td><td>{fmt(loan.downPayment)}</td></tr>
                <tr><td><strong>Loan Amount ({100 - dpPct}%)</strong></td><td><strong style={{color:'#059669'}}>{fmt(loanAmount)}</strong></td></tr>
                <tr><td>LTV Ratio</td><td>{ltv}%</td></tr>
                <tr><td>Maximum LTV Allowed</td><td>90%</td></tr>
                <tr><td><strong>Status</strong></td><td><Badge type={+ltv <= 90 ? 'success' : 'danger'}>{+ltv <= 90 ? 'Within Limits' : 'Exceeds Limit'}</Badge></td></tr>
              </tbody></table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Vehicle Specifications</div>
              <table className="ls-table"><thead><tr><th>Specification</th><th>Details</th></tr></thead>
                <tbody>
                  {[['Engine Capacity',vehicle.engineCC,'engineCC'],['Fuel Type',vehicle.fuel,'fuel'],['Transmission',vehicle.transmission,'transmission'],['Seating',vehicle.seating,'seating'],['Mileage',vehicle.mileage,'mileage'],['Color',vehicle.color,'color'],['Chassis No',vehicle.chassisNo,'chassisNo'],['Engine No',vehicle.engineNo,'engineNo']].map(([s,d,k],i) => (
                    <tr key={`sp-${i}`}><td>{s}</td><td><input value={d} onChange={e => uV(k, e.target.value)} /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ TAB 5: Eligibility ═══ */}
        <div className={`ls-tab-content ${activeTab === 5 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>Monthly EMI</h4><div className="ls-info-value">{fmt(emi)}</div></div>
              <div className="ls-info-card"><h4>FOIR Ratio</h4><div className="ls-info-value">{foir}%</div></div>
              <div className="ls-info-card"><h4>Eligible Amount</h4><div className="ls-info-value">{fmt(eligibleAmount)}</div></div>
              <div className="ls-info-card"><h4>Recommendation</h4><div className="ls-info-value" style={{color: recClr}}>{rec}</div></div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">FOIR Analysis</div>
              <table className="ls-table"><tbody>
                <tr><td><strong>Total Monthly Income</strong></td><td><strong>{fmt(totalIncome)}</strong></td></tr>
                <tr><td>Existing Home Loan EMI</td><td>{fmt(income.existingEMI)}</td></tr>
                <tr><td>Proposed Vehicle Loan EMI</td><td>{fmt(emi)}</td></tr>
                <tr><td><strong>Total Obligations</strong></td><td><strong>{fmt(totalObligation)}</strong></td></tr>
                <tr><td><strong>FOIR Ratio</strong></td><td><strong>{foir}%</strong></td></tr>
                <tr><td><strong>Max FOIR</strong></td><td><strong>50%</strong></td></tr>
                <tr><td><strong>Surplus</strong></td><td><strong style={{color: surplus > 0 ? '#059669' : '#dc2626'}}>{fmt(surplus)}</strong></td></tr>
              </tbody></table>

              <div style={{marginTop:10}}>
                <div style={{fontWeight:600,marginBottom:6,fontSize:'0.8rem'}}>FOIR Status:</div>
                <div className="ls-progress-bar">
                  <div className="ls-progress-fill" style={{width: `${Math.min(foir, 100)}%`, background: foirBg}}>{foir}%</div>
                </div>
                <div style={{marginTop:6,fontSize:'0.75rem',color: foir <= 50 ? '#059669' : '#dc2626'}}>
                  {foir <= 50 ? `✅ FOIR within limits (${foir}% < 50%)` : `❌ FOIR exceeds limits (${foir}% > 50%)`}
                </div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">EMI Payment Schedule (First 12 Months)</div>
              <table className="ls-table"><thead><tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Outstanding</th></tr></thead>
                <tbody>
                  {emiSchedule.map(r => <tr key={`emi-${r.m}`}><td>{r.m}</td><td>{fmt(r.emi)}</td><td>{fmt(r.p)}</td><td>{fmt(r.i)}</td><td>{fmt(r.b)}</td></tr>)}
                </tbody>
              </table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Loan Summary</div>
              <table className="ls-table"><tbody>
                <tr><td><strong>Loan Amount</strong></td><td><strong>{fmt(loanAmount)}</strong></td></tr>
                <tr><td>Interest Rate</td><td>{loan.interestRate}% p.a.</td></tr>
                <tr><td>Tenure</td><td>{loan.tenure} Years ({tenureMonths} Months)</td></tr>
                <tr><td><strong>Monthly EMI</strong></td><td><strong>{fmt(emi)}</strong></td></tr>
                <tr><td>Total Interest</td><td>{fmt(totalInterest)}</td></tr>
                <tr><td><strong>Total Payable</strong></td><td><strong style={{color:'#1a2332'}}>{fmt(totalPayable)}</strong></td></tr>
              </tbody></table>
            </div>
          </div>
        </div>

        {/* ═══ TAB 6: Documents ═══ */}
        <div className={`ls-tab-content ${activeTab === 6 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">आवश्यक कागदपत्रे / Required Documents Checklist</div>
              <div style={{marginBottom:12}}>
                <div style={{fontWeight:600,fontSize:'0.8rem',marginBottom:6}}>Document Submission Status:</div>
                <div className="ls-progress-bar">
                  <div className="ls-progress-fill" style={{width: `${docPct}%`}}>{docPct}% Complete</div>
                </div>
              </div>

              {documents.map((cat, ci) => (
                <div key={`dc-${ci}`}>
                  <div style={{fontWeight:600,margin:'12px 0 6px 0',color:'#1a2332',fontSize:'0.8rem'}}>{cat.cat}:</div>
                  {cat.items.map((item, ii) => (
                    <div className={`ls-checklist-item ${item.checked ? 'checked' : ''}`} key={`di-${ci}-${ii}`}>
                      <input type="checkbox" checked={item.checked} onChange={() => toggleDoc(ci, ii)} />
                      <div>
                        <strong style={{fontSize:'0.8rem'}}>{item.name}</strong>{item.detail ? ` - ${item.detail}` : ''}
                        <div style={{fontSize:'0.65rem',color: item.checked ? '#666' : '#dc2626'}}>
                          {item.checked ? `Uploaded: ${item.date} | Verified ✅` : (item.detail || 'Pending ⚠️')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TAB 7: Risk Analysis ═══ */}
        <div className={`ls-tab-content ${activeTab === 7 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>Overall Risk Score</h4><div className="ls-info-value" style={{color:'#059669'}}>Low Risk</div><Badge type="success">8.5/10</Badge></div>
              <div className="ls-info-card"><h4>Default Probability</h4><div className="ls-info-value">5.2%</div><Badge type="success">Very Low</Badge></div>
              <div className="ls-info-card"><h4>Credit Risk Grade</h4><div className="ls-info-value">A+</div><Badge type="success">Excellent</Badge></div>
              <div className="ls-info-card"><h4>Recommendation</h4><div className="ls-info-value">Approve</div><Badge type="success">✓</Badge></div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Risk Parameters Assessment</div>
              <table className="ls-table"><thead><tr><th>Risk Parameter</th><th>Score</th><th>Weight</th><th>Status</th><th>Remarks</th></tr></thead>
                <tbody>
                  {[
                    ['Credit Score (CIBIL)','10/10','25%','Excellent',`Score: ${cibilScore}`],
                    ['Income Stability','9/10','20%','Excellent',`${employment.designation}, ${employment.experience}yrs`],
                    ['FOIR Ratio','8/10','20%','Good',`${foir}% (< 50%)`],
                    ['Banking Behavior','9/10','15%','Excellent','Perfect statement, no bounces'],
                    ['Vehicle LTV','8/10','10%','Safe',`${ltv}% (< 90%)`],
                    ['KYC & Docs','9/10','10%','Complete',`${docPct}% submitted`],
                  ].map(([p,sc,w,st,rem],i) => (
                    <tr key={`rp-${i}`}><td>{p}</td><td>{sc}</td><td>{w}</td><td><Badge type="success">{st}</Badge></td><td>{rem}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop:10}}>
                <div style={{fontWeight:600,marginBottom:6,fontSize:'0.8rem'}}>Overall Risk Score:</div>
                <div className="ls-progress-bar">
                  <div className="ls-progress-fill" style={{width:'85%',background:'linear-gradient(90deg, #059669, #34d399)'}}>8.5/10 - Low Risk</div>
                </div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Vehicle Specific Risk Factors</div>
              <table className="ls-table"><thead><tr><th>Factor</th><th>Assessment</th><th>Risk Level</th></tr></thead>
                <tbody>
                  {[['Vehicle Type','Brand New SUV - High Resale'],['Brand','Maruti Suzuki - Market Leader'],['Dealer','Authorized, Valid GST'],['Insurance','Comprehensive + Extended Warranty'],['Down Payment',`${dpPct}% (${fmt(loan.downPayment)}) - Adequate`]].map(([f,a],i) => (
                    <tr key={`vr-${i}`}><td>{f}</td><td>{a}</td><td><Badge type="success">Low</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Red Flags & Concerns</div>
              <table className="ls-table"><thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>Pending Documents</td><td>PDC cheques to be collected</td><td><Badge type="warning">Low</Badge></td><td>To be collected at disbursement</td></tr>
                  <tr><td colSpan={4} style={{textAlign:'center',color:'#059669',fontWeight:600,fontSize:'0.8rem'}}>✅ No Major Red Flags Identified</td></tr>
                </tbody>
              </table>
            </div>

            <div className="ls-info-row">
              {[['Fraud Database','✅ Clear'],['ECGC Database','✅ Clear'],['Court Cases','✅ None'],['Wilful Defaulter','✅ No']].map(([h,v],i) => (
                <div className="ls-info-card" key={`vc-${i}`}><h4>{h}</h4><div className="ls-info-value">{v}</div></div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TAB 8: Decision ═══ */}
        <div className={`ls-tab-content ${activeTab === 8 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-approval-banner">
              <div style={{fontSize:36,marginBottom:6}}>✅</div>
              <h2 style={{fontSize:'1.25rem',margin:'0 0 4px 0'}}>APPROVED</h2>
              <div style={{fontSize:'0.8rem',opacity:0.9}}>Vehicle Loan Application Recommended for Approval</div>
            </div>
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>Sanctioned Amount</h4><div className="ls-info-value">{fmt(loanAmount)}</div></div>
              <div className="ls-info-card"><h4>Interest Rate</h4><div className="ls-info-value">{loan.interestRate}% p.a.</div></div>
              <div className="ls-info-card"><h4>Tenure</h4><div className="ls-info-value">{loan.tenure} Years</div></div>
              <div className="ls-info-card"><h4>Monthly EMI</h4><div className="ls-info-value">{fmt(emi)}</div></div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Sanction Summary</div>
              <table className="ls-table"><tbody>
                <tr><td><strong>Applicant</strong></td><td><input value={applicant.fullName} onChange={e => uA('fullName', e.target.value)} /></td></tr>
                <tr><td><strong>Application ID</strong></td><td>{application?.applicationNo || 'VL-2026-0001'}</td></tr>
                <tr><td><strong>Vehicle</strong></td><td>{vehicle.make} {vehicle.variant} ({vehicle.year})</td></tr>
                <tr><td><strong>On-Road Price</strong></td><td>{fmt(vehicle.onRoad)}</td></tr>
                <tr><td><strong>Down Payment</strong></td><td>{fmt(loan.downPayment)} ({dpPct}%)</td></tr>
                <tr><td><strong>Sanctioned Amount</strong></td><td><strong style={{color:'#059669'}}>{fmt(loanAmount)}</strong></td></tr>
                <tr><td><strong>Processing Fee (1.5%)</strong></td><td>{fmt(loanAmount * 0.015)}</td></tr>
                <tr><td><strong>Doc Charges</strong></td><td>₹ 2,500</td></tr>
                <tr><td><strong>Net Disbursement</strong></td><td><strong>{fmt(loanAmount - loanAmount * 0.015 - 2500)}</strong></td></tr>
                <tr><td><strong>Interest Rate</strong></td><td>{loan.interestRate}% p.a. (Reducing)</td></tr>
                <tr><td><strong>Tenure</strong></td><td>{tenureMonths} Months ({loan.tenure} Years)</td></tr>
                <tr><td><strong>Monthly EMI</strong></td><td><strong>{fmt(emi)}</strong></td></tr>
                <tr><td><strong>Total Interest</strong></td><td>{fmt(totalInterest)}</td></tr>
                <tr><td><strong>Total Payable</strong></td><td><strong>{fmt(totalPayable)}</strong></td></tr>
              </tbody></table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Terms & Conditions</div>
              <ol style={{paddingLeft:16,lineHeight:1.6,fontSize:'0.8rem'}}>
                <li>Loan secured by Hypothecation of Vehicle</li>
                <li>60 Post-Dated Cheques (PDCs) mandatory</li>
                <li>NACH/ECS mandate for auto-debit of EMI</li>
                <li>Comprehensive Insurance mandatory</li>
                <li>RC Book to be submitted to bank</li>
                <li>First EMI due: 05-May-2026</li>
                <li>Pre-payment charges: 3% (first 12 months), 2% thereafter</li>
                <li>Bounce charges: ₹750 per bounced EMI</li>
                <li>Late payment: 2% per month on overdue</li>
                <li>No ownership change without bank permission</li>
                <li>Annual insurance renewal proof mandatory</li>
              </ol>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Loan Officer Remarks</div>
              <textarea rows={3} style={{width:'100%',padding:8,border:'1px solid var(--dm-border, #e2e8f0)',borderRadius:8,fontSize:'0.8rem',outline:'none'}} value={officerRemarks} onChange={e => setOfficerRemarks(e.target.value)} />
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Approval Workflow</div>
              <table className="ls-table"><thead><tr><th>Level</th><th>Approver</th><th>Status</th><th>Date/Time</th><th>Comments</th></tr></thead>
                <tbody>
                  <tr><td>Level 1</td><td>Yogesh Vagare (Loan Officer)</td><td><Badge type="success">Approved</Badge></td><td>04-Apr-2026 15:45</td><td>Strongly recommended</td></tr>
                  <tr><td>Level 2</td><td>Jayant Kulkarni (Branch Manager)</td><td><Badge type="warning">Pending</Badge></td><td>-</td><td>Awaiting review</td></tr>
                  <tr><td>Level 3</td><td>AVS (Managing Director)</td><td><Badge type="warning">Pending</Badge></td><td>-</td><td>Final approval pending</td></tr>
                </tbody>
              </table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Disbursement Checklist</div>
              <ol style={{paddingLeft:16,lineHeight:1.6,fontSize:'0.8rem'}}>
                <li>✅ All KYC documents verified</li>
                <li>✅ Credit score check completed ({cibilScore})</li>
                <li>✅ Income verification done</li>
                <li>✅ Dealer invoice verified</li>
                <li>✅ Insurance policy issued</li>
                <li>✅ NACH mandate signed</li>
                <li>⚠️ PDC cheques to be collected</li>
                <li>⚠️ Hypothecation agreement to be signed</li>
                <li>⚠️ RC book to be submitted post-registration</li>
                <li>⚠️ Final sanction letter to be issued</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="ls-footer-actions">
        <div className="ls-status-indicator">
          <div className="ls-status-dot processing"></div>
          <span style={{fontWeight:600,fontSize:'0.8rem'}}>Status: Under Review</span>
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
