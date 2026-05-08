import React, { useState, useEffect } from 'react';

const fmt = (n) => '₹ ' + Math.round(n || 0).toLocaleString('en-IN');

export default function BusinessLoanScrutinyDetail({ application }) {
  const [activeTab, setActiveTab] = useState(0);
  const [submittingAction, setSubmittingAction] = useState(null);

  /* ══ State Management ══ */
  const [applicant, setApplicant] = useState({
    fullName: application?.applicantName || '',
    appNo: application?.applicationNo || '',
    date: new Date().toISOString().split('T')[0],
    dob: '',
    pan: '',
    aadhaar: '',
    mobile: '',
    altMobile: '',
    email: '',
    constitution: 'Proprietorship',
    address1: '',
    address2: '',
    taluka: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
  });

  const [business, setBusiness] = useState({
    name: '',
    type: 'Trading',
    gst: '',
    udyam: '',
    yearEst: '',
    employees: '',
    address: '',
    nature: '',
    products: '',
    turnover: 0,
  });

  const [coApplicant, setCoApplicant] = useState({
    name: '',
    relation: '',
    pan: '',
    mobile: '',
    cibil: 0,
    income: 0,
  });

  const [financials, setFinancials] = useState({
    fy1: { turnover: 0, cogs: 0, opex: 0, dep: 0, tax: 0 },
    fy2: { turnover: 0, cogs: 0, opex: 0, dep: 0, tax: 0 },
    fy3: { turnover: 0, cogs: 0, opex: 0, dep: 0, tax: 0 },
  });

  const [loan, setLoan] = useState({
    amount: 500000,
    tenure: 60,
    roi: 12,
    purpose: 'Working Capital',
    fee: 5000,
    mode: 'Monthly EMI',
    existEmi: 0,
    monthlyInc: 0,
    avgBal: 0,
  });

  const [security, setSecurity] = useState({
    primaryType: 'Hypothecation of Stock & Debtors',
    primaryVal: 0,
    primaryDesc: '',
    ltvPct: 70,
    collateralType: 'None',
    collateralVal: 0,
    collateralAddr: '',
    collateralOwner: '',
    surveyNo: '',
    area: '',
  });

  const [cibilScore, setCibilScore] = useState(700);
  const [cibilDetails, setCibilDetails] = useState({
    score: 700,
    reportDate: new Date().toISOString().split('T')[0],
    activeAccounts: 0,
    pastDefaults: 'No',
    writeOff: 'No',
    overdueAmt: 0,
  });
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [decision, setDecision] = useState({
    officerName: '',
    designation: '',
    branch: '',
    scrutinyDate: new Date().toISOString().split('T')[0],
    recAmount: loan.amount,
    recTenure: loan.tenure,
  });

  const [documents, setDocuments] = useState([
    {
      cat: 'KYC Documents',
      items: [
        { name: 'Aadhar Card - Applicant', checked: false },
        { name: 'PAN Card - Applicant', checked: false },
        { name: 'Photo ID Proof', checked: false },
        { name: 'Address Proof', checked: false },
        { name: 'Passport Size Photo', checked: false },
        { name: 'Aadhar + PAN - Co-Applicant', checked: false },
      ]
    },
    {
      cat: 'Business Documents',
      items: [
        { name: 'GST Registration Certificate', checked: false },
        { name: 'UDYAM / MSME Certificate', checked: false },
        { name: 'Shop Act / Trade License', checked: false },
        { name: 'Partnership Deed / MOA & AOA', checked: false },
        { name: 'Business Address Proof', checked: false },
        { name: 'Board Resolution', checked: false },
      ]
    },
    {
      cat: 'Financial Documents',
      items: [
        { name: 'ITR - Last 3 Years', checked: false },
        { name: 'Audited Balance Sheet (3 Years)', checked: false },
        { name: 'CA Certified P&L Statement', checked: false },
        { name: 'Bank Statement - 12 Months', checked: false },
        { name: 'GST Returns (GSTR-3B)', checked: false },
        { name: 'Stock Statement', checked: false },
      ]
    },
    {
      cat: 'Security / Legal',
      items: [
        { name: 'Property Documents / Title Deed', checked: false },
        { name: 'Property Valuation Report', checked: false },
        { name: 'Search Report (30 Years)', checked: false },
        { name: 'CIBIL / Bureau Report', checked: false },
      ]
    }
  ]);

  /* ══ Mapper logic from application data if any ══ */
  useEffect(() => {
    if (!application?.details) return;
    try {
      const d = typeof application.details === 'string' ? JSON.parse(application.details) : application.details;
      // Basic mapping (to be expanded based on actual schema)
      setApplicant(prev => ({
        ...prev,
        fullName: application.applicantName || prev.fullName,
        appNo: application.applicationNo || prev.appNo,
      }));
    } catch (err) { console.error("Error parsing details", err); }
  }, [application]);

  /* ══ Calculations ══ */

  const calcFY = (f) => {
    const gp = f.turnover - f.cogs;
    const npbt = gp - f.opex - f.dep;
    const npat = npbt - f.tax;
    return { gp, npbt, npat };
  };

  const f1 = calcFY(financials.fy1);
  const f2 = calcFY(financials.fy2);
  const f3 = calcFY(financials.fy3);

  const avgTurnover = (financials.fy1.turnover + financials.fy2.turnover + financials.fy3.turnover) / 3;
  const avgProfit = (f1.npat + f2.npat + f3.npat) / 3;
  const profitMargin = avgTurnover > 0 ? (avgProfit / avgTurnover * 100) : 0;
  const growthRate = financials.fy1.turnover > 0 ? ((financials.fy3.turnover - financials.fy1.turnover) / financials.fy1.turnover * 100) : 0;

  const mr = loan.roi / 12 / 100;
  const n = loan.tenure;
  const P = loan.amount;
  const emi = (P > 0 && n > 0 && mr > 0) ? Math.round((P * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1)) : (P / (n || 1));
  
  const foir = loan.monthlyInc > 0 ? ((emi + loan.existEmi) / loan.monthlyInc * 100) : 0;
  const annualEmi = emi * 12;
  const annualInc = loan.monthlyInc * 12;
  const dscr = annualEmi > 0 ? (annualInc / annualEmi) : 0;
  const eligibleAmount = loan.monthlyInc > 0 ? Math.round((loan.monthlyInc * 0.5 - loan.existEmi) * n) : P;

  const totalPayable = emi * n;
  const totalInterest = totalPayable - P;

  const primaryEligible = security.primaryVal * security.ltvPct / 100;
  
  const allDocs = documents.flatMap(c => c.items);
  const checkedDocs = allDocs.filter(d => d.checked).length;
  const docPct = Math.round((checkedDocs / allDocs.length) * 100);

  /* ══ Helpers ══ */
  const u = (setter) => (f, v) => setter(p => ({ ...p, [f]: v }));
  const uA = u(setApplicant), uB = u(setBusiness), uL = u(setLoan), uS = u(setSecurity), uCibil = u(setCibilDetails), uD = u(setDecision);
  const uF = (fy, f, v) => setFinancials(p => ({ ...p, [fy]: { ...p[fy], [f]: parseFloat(v) || 0 } }));
  
  const toggleDoc = (ci, ii) => setDocuments(prev => {
    const c = JSON.parse(JSON.stringify(prev));
    c[ci].items[ii].checked = !c[ci].items[ii].checked;
    return c;
  });

  const tabs = ['Applicant Details', 'Business Details', 'Financials', 'Loan Details', 'Security Details', 'Documents', 'Risk Analysis', 'Decision'];
  const tabIcons = ['📋', '🏢', '📊', '💰', '🛡️', '📁', '⚠️', '✓'];
  const Badge = ({ type, children }) => <span className={`ls-badge ${type}`}>{children}</span>;

  const handleAction = (action) => {
    if (action === 'reject' && !window.confirm('Reject this application?')) return;
    if (action === 'approve' && !window.confirm('Approve this application?')) return;
    setSubmittingAction(action);
    setTimeout(() => {
      setSubmittingAction(null);
      alert(action === 'save' ? 'Draft Saved' : action === 'reject' ? 'Rejected' : 'Approved');
    }, 1200);
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

        {/* ═══ TAB 0: Applicant Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 0 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">अर्जदाराची माहिती / Applicant Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>अर्जदाराचे पूर्ण नाव / Applicant Full Name *</label><input value={applicant.fullName} onChange={e => uA('fullName', e.target.value)} placeholder="Full name as per PAN" /></div>
                <div className="ls-form-group"><label>अर्ज क्रमांक / Application No.</label><input value={applicant.appNo} onChange={e => uA('appNo', e.target.value)} placeholder="BL/2026/001" /></div>
                <div className="ls-form-group"><label>अर्जाची तारीख / Date of Application</label><input type="date" value={applicant.date} onChange={e => uA('date', e.target.value)} /></div>
                <div className="ls-form-group"><label>जन्मतारीख / Date of Birth *</label><input type="date" value={applicant.dob} onChange={e => uA('dob', e.target.value)} /></div>
                <div className="ls-form-group"><label>पॅन क्रमांक / PAN No. *</label><input value={applicant.pan} onChange={e => uA('pan', e.target.value)} maxLength={10} style={{textTransform:'uppercase'}} placeholder="ABCDE1234F" /></div>
                <div className="ls-form-group"><label>आधार क्रमांक / Aadhar No. *</label><input value={applicant.aadhaar} onChange={e => uA('aadhaar', e.target.value)} placeholder="XXXX XXXX XXXX" /></div>
                <div className="ls-form-group"><label>मोबाईल / Mobile No. *</label><input value={applicant.mobile} onChange={e => uA('mobile', e.target.value)} placeholder="9XXXXXXXXX" /></div>
                <div className="ls-form-group"><label>पर्यायी मोबाईल / Alternate Mobile</label><input value={applicant.altMobile} onChange={e => uA('altMobile', e.target.value)} placeholder="9XXXXXXXXX" /></div>
                <div className="ls-form-group"><label>ईमेल / Email Address</label><input type="email" value={applicant.email} onChange={e => uA('email', e.target.value)} placeholder="email@example.com" /></div>
                <div className="ls-form-group"><label>संस्था प्रकार / Constitution / Entity Type</label>
                  <select value={applicant.constitution} onChange={e => uA('constitution', e.target.value)}>
                    <option>Proprietorship</option>
                    <option>Partnership</option>
                    <option>Private Limited Company</option>
                    <option>LLP</option>
                    <option>HUF</option>
                    <option>Trust / Society</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="ls-section">
              <div className="ls-section-title">निवासी पत्ता / Residential Address</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>Address Line 1</label><input value={applicant.address1} onChange={e => uA('address1', e.target.value)} placeholder="House No., Street, Area" /></div>
                <div className="ls-form-group"><label>Address Line 2</label><input value={applicant.address2} onChange={e => uA('address2', e.target.value)} placeholder="Landmark, Village/Ward" /></div>
                <div className="ls-form-group"><label>Taluka</label><input value={applicant.taluka} onChange={e => uA('taluka', e.target.value)} placeholder="Taluka" /></div>
                <div className="ls-form-group"><label>District</label><input value={applicant.district} onChange={e => uA('district', e.target.value)} placeholder="District" /></div>
                <div className="ls-form-group"><label>State</label><input value={applicant.state} onChange={e => uA('state', e.target.value)} placeholder="Maharashtra" /></div>
                <div className="ls-form-group"><label>PIN Code</label><input value={applicant.pincode} onChange={e => uA('pincode', e.target.value)} maxLength={6} placeholder="4XXXXX" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 1: Business Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 1 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">व्यवसायाची माहिती / Business Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>व्यवसायाचे नाव / Business / Firm Name *</label><input value={business.name} onChange={e => uB('name', e.target.value)} placeholder="Firm / Company name" /></div>
                <div className="ls-form-group"><label>व्यवसाय प्रकार / Type of Business</label>
                  <select value={business.type} onChange={e => uB('type', e.target.value)}>
                    <option>Trading</option>
                    <option>Manufacturing</option>
                    <option>Service</option>
                    <option>Agriculture / Allied</option>
                    <option>Construction</option>
                    <option>Retail</option>
                    <option>Export / Import</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>जीएसटी नोंदणी क्रमांक / GST Registration No.</label><input value={business.gst} onChange={e => uB('gst', e.target.value)} style={{textTransform:'uppercase'}} placeholder="27XXXXXXXXXXXXXXXXXX" /></div>
                <div className="ls-form-group"><label>उद्यम नोंदणी / UDYAM / MSME No.</label><input value={business.udyam} onChange={e => uB('udyam', e.target.value)} placeholder="UDYAM-MH-XX-XXXXXXX" /></div>
                <div className="ls-form-group"><label>स्थापना वर्ष / Year of Establishment</label><input type="number" value={business.yearEst} onChange={e => uB('yearEst', e.target.value)} placeholder="2015" /></div>
                <div className="ls-form-group"><label>कर्मचारी संख्या / No. of Employees</label><input type="number" value={business.employees} onChange={e => uB('employees', e.target.value)} placeholder="10" /></div>
                <div className="ls-form-group"><label>व्यवसाय पत्ता / Business Address</label><textarea value={business.address} onChange={e => uB('address', e.target.value)} rows={2} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8,outline:'none',fontSize:'0.8rem'}} placeholder="Complete business address..." /></div>
                <div className="ls-form-group"><label>व्यवसायाचे स्वरूप / Nature of Business</label><textarea value={business.nature} onChange={e => uB('nature', e.target.value)} rows={2} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8,outline:'none',fontSize:'0.8rem'}} placeholder="Brief description of business activity..." /></div>
                <div className="ls-form-group"><label>प्रमुख उत्पादने / सेवा / Major Products / Services</label><textarea value={business.products} onChange={e => uB('products', e.target.value)} rows={2} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8,outline:'none',fontSize:'0.8rem'}} placeholder="List main products or services..." /></div>
                <div className="ls-form-group"><label>वार्षिक उलाढाल (चालू) / Annual Turnover (Current)</label><input type="number" value={business.turnover} onChange={e => uB('turnover', +e.target.value)} placeholder="₹ (approx)" /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">सह-अर्जदार / जामीनदार तपशील / Co-Applicant / Guarantor Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>सह-अर्जदाराचे नाव / Co-Applicant Name</label><input value={coApplicant.name} onChange={e => uC('name', e.target.value)} placeholder="Full name" /></div>
                <div className="ls-form-group"><label>अर्जदाराशी नाते / Relationship with Applicant</label><input value={coApplicant.relation} onChange={e => uC('relation', e.target.value)} placeholder="Spouse / Partner / Director" /></div>
                <div className="ls-form-group"><label>सह-अर्जदार पॅन / Co-Applicant PAN</label><input value={coApplicant.pan} onChange={e => uC('pan', e.target.value)} maxLength={10} style={{textTransform:'uppercase'}} placeholder="ABCDE1234F" /></div>
                <div className="ls-form-group"><label>सह-अर्जदार मोबाईल / Co-Applicant Mobile</label><input value={coApplicant.mobile} onChange={e => uC('mobile', e.target.value)} placeholder="9XXXXXXXXX" /></div>
                <div className="ls-form-group"><label>सह-अर्जदार सिबिल स्कोर / Co-Applicant CIBIL Score</label><input type="number" value={coApplicant.cibil} onChange={e => uC('cibil', +e.target.value)} placeholder="700" /></div>
                <div className="ls-form-group"><label>सह-अर्जदार मासिक उत्पन्न / Co-Applicant Income / Month (₹)</label><input type="number" value={coApplicant.income} onChange={e => uC('income', +e.target.value)} placeholder="0" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 2: Financials ═══ */}
        <div className={`ls-tab-content ${activeTab === 2 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">Income Statement (Last 3 Years — ITR / Audited P&L)</div>
              <style>{`
                .financial-table input::-webkit-outer-spin-button,
                .financial-table input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                .financial-table input[type=number] { -moz-appearance: textfield; }
              `}</style>
              <table className="ls-table financial-table">
                <thead>
                  <tr>
                    <th style={{width:'30%', textAlign:'left'}}>PARTICULARS</th>
                    <th style={{width:'23%', textAlign:'right'}}>FY 2022-23 (₹)</th>
                    <th style={{width:'23%', textAlign:'right'}}>FY 2023-24 (₹)</th>
                    <th style={{width:'23%', textAlign:'right'}}>FY 2024-25 (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Gross Turnover / Sales</td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy1.turnover} onChange={e => uF('fy1', 'turnover', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy2.turnover} onChange={e => uF('fy2', 'turnover', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy3.turnover} onChange={e => uF('fy3', 'turnover', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                  </tr>
                  <tr>
                    <td>Cost of Goods Sold / Direct Exp</td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy1.cogs} onChange={e => uF('fy1', 'cogs', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy2.cogs} onChange={e => uF('fy2', 'cogs', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy3.cogs} onChange={e => uF('fy3', 'cogs', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                  </tr>
                  <tr style={{background:'#f8f9fa', fontWeight:700}}>
                    <td>Gross Profit</td>
                    <td style={{textAlign:'right'}}>{Math.round(f1.gp).toLocaleString('en-IN')}</td>
                    <td style={{textAlign:'right'}}>{Math.round(f2.gp).toLocaleString('en-IN')}</td>
                    <td style={{textAlign:'right'}}>{Math.round(f3.gp).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Operating Expenses</td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy1.opex} onChange={e => uF('fy1', 'opex', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy2.opex} onChange={e => uF('fy2', 'opex', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy3.opex} onChange={e => uF('fy3', 'opex', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                  </tr>
                  <tr>
                    <td>Depreciation</td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy1.dep} onChange={e => uF('fy1', 'dep', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy2.dep} onChange={e => uF('fy2', 'dep', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy3.dep} onChange={e => uF('fy3', 'dep', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                  </tr>
                  <tr style={{background:'#f8f9fa', fontWeight:700}}>
                    <td>Net Profit Before Tax</td>
                    <td style={{textAlign:'right'}}>{Math.round(f1.npbt).toLocaleString('en-IN')}</td>
                    <td style={{textAlign:'right'}}>{Math.round(f2.npbt).toLocaleString('en-IN')}</td>
                    <td style={{textAlign:'right'}}>{Math.round(f3.npbt).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Tax Paid</td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy1.tax} onChange={e => uF('fy1', 'tax', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy2.tax} onChange={e => uF('fy2', 'tax', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                    <td style={{textAlign:'right'}}><input type="number" value={financials.fy3.tax} onChange={e => uF('fy3', 'tax', e.target.value)} style={{textAlign:'right',border:'none',background:'transparent',width:'100%',outline:'none'}} /></td>
                  </tr>
                  <tr style={{background:'#f1f5f9', fontWeight:700}}>
                    <td>Net Profit After Tax (NAP)</td>
                    <td style={{textAlign:'right'}}>{Math.round(f1.npat).toLocaleString('en-IN')}</td>
                    <td style={{textAlign:'right'}}>{Math.round(f2.npat).toLocaleString('en-IN')}</td>
                    <td style={{textAlign:'right'}}>{Math.round(f3.npat).toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Banking & Liabilities</div>
              <div className="ls-form-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="ls-form-group"><label>Bank Name</label><input value={loan.bankName} onChange={e => uL('bankName', e.target.value)} placeholder="Bank name" /></div>
                <div className="ls-form-group"><label>Account No.</label><input value={loan.accNo} onChange={e => uL('accNo', e.target.value)} placeholder="Account number" /></div>
                <div className="ls-form-group"><label>Avg. Monthly Bank Balance (₹)</label><input type="number" value={loan.avgBal} onChange={e => uL('avgBal', +e.target.value)} placeholder="0" /></div>
                <div className="ls-form-group"><label>Monthly Business Income (₹)</label><input type="number" value={loan.monthlyInc} onChange={e => uL('monthlyInc', +e.target.value)} placeholder="0" /></div>
                <div className="ls-form-group"><label>Existing EMI / Obligations (₹/MO)</label><input type="number" value={loan.existEmi} onChange={e => uL('existEmi', +e.target.value)} placeholder="0" /></div>
                <div className="ls-form-group"><label>Total Outstanding Loans (₹)</label><input type="number" value={loan.totalOut} onChange={e => uL('totalOut', +e.target.value)} placeholder="0" /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Financial Summary</div>
              <div className="ls-info-row" style={{gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem'}}>
                <div className="ls-info-card" style={{textAlign: 'center', padding: '1.25rem'}}>
                  <div className="ls-info-value" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{fmt(avgTurnover)}</div>
                  <h4 style={{fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Avg. Turnover (3Y)</h4>
                </div>
                <div className="ls-info-card" style={{textAlign: 'center', padding: '1.25rem'}}>
                  <div className="ls-info-value" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{fmt(avgProfit)}</div>
                  <h4 style={{fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Avg. Net Profit</h4>
                </div>
                <div className="ls-info-card" style={{textAlign: 'center', padding: '1.25rem'}}>
                  <div className="ls-info-value" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{profitMargin.toFixed(1)}%</div>
                  <h4 style={{fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Profit Margin</h4>
                </div>
                <div className="ls-info-card" style={{textAlign: 'center', padding: '1.25rem'}}>
                  <div className="ls-info-value" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>{growthRate.toFixed(1)}%</div>
                  <h4 style={{fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Turnover Growth</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 3: Loan Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 3 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">कर्जाची आवश्यकता / Loan Requirement</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>Loan Amount (₹) *</label><input type="number" value={loan.amount} onChange={e => uL('amount', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Tenure (Months) *</label><input type="number" value={loan.tenure} onChange={e => uL('tenure', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Interest Rate (% p.a.)</label><input type="number" value={loan.roi} onChange={e => uL('roi', +e.target.value)} step={0.1} /></div>
                <div className="ls-form-group"><label>Purpose</label>
                  <select value={loan.purpose} onChange={e => uL('purpose', e.target.value)}>
                    <option value="Working Capital">Working Capital</option>
                    <option value="Business Expansion">Business Expansion</option>
                    <option value="Equipment / Machinery Purchase">Equipment / Machinery Purchase</option>
                    <option value="Stock / Inventory Purchase">Stock / Inventory Purchase</option>
                    <option value="Debt Consolidation">Debt Consolidation</option>
                    <option value="Infrastructure Development">Infrastructure Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>Repayment Mode</label>
                  <select value={loan.mode} onChange={e => uL('mode', e.target.value)}>
                    <option value="Monthly EMI">Monthly EMI</option>
                    <option value="Bullet Repayment">Bullet Repayment</option>
                    <option value="Monthly Interest + Quarterly Principal">Monthly Interest + Quarterly Principal</option>
                    <option value="Overdraft / CC Limit">Overdraft / CC Limit</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>Existing EMI (₹)</label><input type="number" value={loan.existEmi} onChange={e => uL('existEmi', +e.target.value)} /></div>
                <div className="ls-form-group"><label>Monthly Income (₹)</label><input type="number" value={loan.monthlyInc} onChange={e => uL('monthlyInc', +e.target.value)} /></div>
              </div>
            </div>
            <div className="ls-info-row">
              <div className="ls-info-card"><h4>Monthly EMI</h4><div className="ls-info-value">{fmt(emi)}</div></div>
              <div className="ls-info-card"><h4>FOIR Ratio</h4><div className="ls-info-value">{foir.toFixed(1)}%</div></div>
              <div className="ls-info-card"><h4>DSCR</h4><div className="ls-info-value">{dscr.toFixed(2)}</div></div>
              <div className="ls-info-card"><h4>Eligible Amount</h4><div className="ls-info-value">{fmt(eligibleAmount)}</div></div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 4: Security ═══ */}
        <div className={`ls-tab-content ${activeTab === 4 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">तारण तपशील / Primary Security</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>SECURITY TYPE</label>
                  <select value={security.primaryType} onChange={e => uS('primaryType', e.target.value)}>
                    <option>Hypothecation of Stock & Debtors</option>
                    <option>Mortgage of Immovable Property</option>
                    <option>Pledge of FD / NSC / LIC</option>
                    <option>Hypothecation of Machinery / Equipment</option>
                    <option>Assignment of Receivables</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>SECURITY MARKET VALUE (₹)</label><input type="number" value={security.primaryVal} onChange={e => uS('primaryVal', +e.target.value)} /></div>
                <div className="ls-form-group"><label>SECURITY DESCRIPTION</label>
                  <textarea value={security.primaryDesc} onChange={e => uS('primaryDesc', e.target.value)} rows={2} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8,outline:'none',fontSize:'0.8rem'}} placeholder="Description of primary security offered..." />
                </div>
                <div className="ls-form-group"><label>LTV % (LOAN TO VALUE)</label><input type="number" value={security.ltvPct} onChange={e => uS('ltvPct', +e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">Collateral Security</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>COLLATERAL TYPE</label>
                  <select value={security.collateralType} onChange={e => uS('collateralType', e.target.value)}>
                    <option>None</option>
                    <option>Residential Property</option>
                    <option>Commercial Property</option>
                    <option>Agricultural Land</option>
                    <option>Fixed Deposit (FD)</option>
                    <option>Gold / Ornaments</option>
                    <option>NSC / KVP / LIC</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>COLLATERAL MARKET VALUE (₹)</label><input type="number" value={security.collateralVal} onChange={e => uS('collateralVal', +e.target.value)} /></div>
                <div className="ls-form-group"><label>PROPERTY / ASSET ADDRESS</label>
                  <textarea value={security.collateralAddr} onChange={e => uS('collateralAddr', e.target.value)} rows={2} style={{padding:8,border:'1px solid #cbd5e1',borderRadius:8,outline:'none',fontSize:'0.8rem'}} placeholder="Full address of collateral property..." />
                </div>
                <div className="ls-form-group"><label>COLLATERAL OWNER NAME</label><input value={security.collateralOwner} onChange={e => uS('collateralOwner', e.target.value)} placeholder="Owner name as per documents" /></div>
                <div className="ls-form-group"><label>SURVEY NO. / GAT NO.</label><input value={security.surveyNo} onChange={e => uS('surveyNo', e.target.value)} placeholder="Survey / Gat number" /></div>
                <div className="ls-form-group"><label>AREA (SQ. FT. / ACRE)</label><input value={security.area} onChange={e => uS('area', e.target.value)} placeholder="Area with unit" /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">CIBIL / Credit Bureau Report</div>
              <div className="ls-form-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="ls-form-group"><label>APPLICANT CIBIL SCORE</label><input type="number" value={cibilDetails.score} onChange={e => {uCibil('score', +e.target.value); setCibilScore(+e.target.value);}} /></div>
                <div className="ls-form-group"><label>BUREAU REPORT DATE</label><input type="date" value={cibilDetails.reportDate} onChange={e => uCibil('reportDate', e.target.value)} /></div>
                <div className="ls-form-group"><label>ACTIVE LOAN ACCOUNTS</label><input type="number" value={cibilDetails.activeAccounts} onChange={e => uCibil('activeAccounts', +e.target.value)} /></div>
                <div className="ls-form-group"><label>PAST DEFAULTS / NPA</label>
                  <select value={cibilDetails.pastDefaults} onChange={e => uCibil('pastDefaults', e.target.value)}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>WRITEOFF / SUIT FILED</label>
                  <select value={cibilDetails.writeOff} onChange={e => uCibil('writeOff', e.target.value)}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
                <div className="ls-form-group"><label>OVERDUE AMOUNT (₹)</label><input type="number" value={cibilDetails.overdueAmt} onChange={e => uCibil('overdueAmt', +e.target.value)} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 5: Documents ═══ */}
        <div className={`ls-tab-content ${activeTab === 5 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">कागदपत्रे / Document Checklist</div>
              <div style={{marginBottom:15}}>
                <div style={{fontWeight:600,fontSize:'0.8rem',marginBottom:5}}>Verification Progress:</div>
                <div className="ls-progress-bar">
                  <div className="ls-progress-fill" style={{width:`${docPct}%` }}>{docPct}% Complete</div>
                </div>
              </div>
              {documents.map((cat, ci) => (
                <div key={cat.cat} style={{marginBottom:15}}>
                  <div style={{fontWeight:600,color:'#1e293b',fontSize:'0.8rem',marginBottom:8}}>{cat.cat}</div>
                  {cat.items.map((item, ii) => (
                    <div key={item.name} className={`ls-checklist-item ${item.checked ? 'checked' : ''}`} onClick={() => toggleDoc(ci, ii)}>
                      <input type="checkbox" checked={item.checked} readOnly />
                      <span style={{fontSize:'0.8rem'}}>{item.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TAB 6: Risk Analysis ═══ */}
        <div className={`ls-tab-content ${activeTab === 6 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">जोखीम विश्लेषण / Risk Parameter Assessment</div>
              <table className="ls-table">
                <thead><tr><th>Parameter</th><th>Value</th><th>Benchmark</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td>FOIR</td><td>{foir.toFixed(1)}%</td><td>≤ 65%</td><td><Badge type={foir <= 65 ? 'success' : 'danger'}>{foir <= 65 ? 'PASS' : 'HIGH'}</Badge></td></tr>
                  <tr><td>DSCR</td><td>{dscr.toFixed(2)}</td><td>≥ 1.25</td><td><Badge type={dscr >= 1.25 ? 'success' : 'danger'}>{dscr >= 1.25 ? 'PASS' : 'LOW'}</Badge></td></tr>
                  <tr><td>CIBIL Score</td><td>{cibilScore}</td><td>≥ 650</td><td><Badge type={cibilScore >= 650 ? 'success' : 'danger'}>{cibilScore >= 650 ? 'PASS' : 'POOR'}</Badge></td></tr>
                  <tr><td>Document Score</td><td>{docPct}%</td><td>100%</td><td><Badge type={docPct >= 80 ? 'success' : 'warning'}>{docPct >= 80 ? 'GOOD' : 'PENDING'}</Badge></td></tr>
                </tbody>
              </table>
              <div style={{marginTop:20}}>
                <div style={{fontWeight:600,marginBottom:8,fontSize:'0.8rem'}}>Overall Risk Score:</div>
                <div className="ls-progress-bar">
                  <div className="ls-progress-fill" style={{width:'75%', background: 'linear-gradient(90deg, #059669, #34d399)'}}>7.5/10 - Low Risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 7: Decision ═══ */}
        <div className={`ls-tab-content ${activeTab === 7 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            
            <div className="ls-section">
              <div className="ls-section-title">SCRUTINY PARAMETER SUMMARY</div>
              <div className="ls-info-row" style={{gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem'}}>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{fmt(emi)}</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>MONTHLY EMI</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{foir.toFixed(1)}%</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>FOIR</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{dscr.toFixed(2)}</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>DSCR</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{docPct}%</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>DOCUMENT SCORE</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{cibilScore || '—'}</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>CIBIL SCORE</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{fmt(eligibleAmount)}</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>ELIGIBLE AMOUNT</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{fmt(loan.amount)}</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>LOAN REQUESTED</h4>
                </div>
                <div className="ls-info-card" style={{textAlign:'center', padding:'1rem'}}>
                  <div className="ls-info-value" style={{fontSize:'1.1rem', marginBottom:2}}>{fmt(avgProfit)}</div>
                  <h4 style={{fontSize:'0.65rem', opacity:0.8, textTransform:'uppercase'}}>AVG. NET PROFIT</h4>
                </div>
              </div>
            </div>

            <div style={{background:'#fff7ed', border:'1px solid #ffedd5', borderRadius:8, padding:'24px', textAlign:'center', margin:'16px 0'}}>
              <div style={{fontSize:32, marginBottom:10}}>⏳</div>
              <h2 style={{margin:0, fontSize:'1.2rem', color:'#9a3412', fontWeight:800}}>UNDER REVIEW</h2>
              <p style={{margin:'8px 0 0 0', fontSize:'0.75rem', color:'#c2410c'}}>Complete all sections and enter loan details to generate recommendation</p>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">PARAMETER SCORECARD</div>
              <div style={{padding:'10px 0'}}>
                {[
                  { lab: 'FOIR', val: foir, max: 100, color: foir <= 65 ? '#059669' : '#ef4444' },
                  { lab: 'DSCR', val: Math.min(dscr * 25, 100), max: 100, color: dscr >= 1.25 ? '#059669' : '#f59e0b' },
                  { lab: 'CIBIL', val: Math.min((cibilScore / 900) * 100, 100), max: 100, color: cibilScore >= 650 ? '#059669' : '#ef4444' },
                  { lab: 'Documents', val: docPct, max: 100, color: docPct >= 80 ? '#059669' : '#f59e0b' }
                ].map(p => (
                  <div key={p.lab} style={{display:'flex', alignItems:'center', gap:15, marginBottom:12}}>
                    <div style={{width:80, fontSize:'0.75rem', fontWeight:600}}>{p.lab}</div>
                    <div style={{flex:1, height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden'}}>
                      <div style={{width:`${p.val}%`, height:'100%', background:p.color, borderRadius:4}} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">SCRUTINY REMARKS</div>
              <textarea 
                rows={3} 
                value={officerRemarks} 
                onChange={e => setOfficerRemarks(e.target.value)} 
                placeholder="Enter scrutiny officer remarks, observations, conditions, or special notes here..." 
                style={{width:'100%', padding:12, border:'1px solid #cbd5e1', borderRadius:8, fontSize:'0.8rem', outline:'none', resize:'none'}} 
              />
            </div>

            <div className="ls-section">
              <div className="ls-section-title">APPROVAL AUTHORITY DETAILS</div>
              <div className="ls-form-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
                <div className="ls-form-group"><label>SCRUTINY OFFICER NAME</label><input value={decision.officerName} onChange={e => uD('officerName', e.target.value)} placeholder="Officer name" /></div>
                <div className="ls-form-group"><label>DESIGNATION</label><input value={decision.designation} onChange={e => uD('designation', e.target.value)} placeholder="LO / BM / AGM" /></div>
                <div className="ls-form-group"><label>BRANCH / OFFICE</label><input value={decision.branch} onChange={e => uD('branch', e.target.value)} placeholder="Branch name" /></div>
                <div className="ls-form-group"><label>DATE OF SCRUTINY</label><input type="date" value={decision.scrutinyDate} onChange={e => uD('scrutinyDate', e.target.value)} /></div>
                <div className="ls-form-group"><label>RECOMMENDED AMOUNT (₹)</label><input type="number" value={decision.recAmount} onChange={e => uD('recAmount', +e.target.value)} placeholder="0" /></div>
                <div className="ls-form-group"><label>RECOMMENDED TENURE</label><input value={decision.recTenure} onChange={e => uD('recTenure', e.target.value)} placeholder="e.g. 60 Months" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ls-footer-actions">
        <div className="ls-status-indicator">
          <div className="ls-status-dot processing"></div>
          <span style={{fontWeight:600,fontSize:'0.8rem'}}>Status: Under Scrutiny</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="ls-btn secondary" disabled={submittingAction} onClick={() => handleAction('save')}>
            {submittingAction === 'save' ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button className="ls-btn danger" disabled={submittingAction} onClick={() => handleAction('reject')}>
            {submittingAction === 'reject' ? 'Rejecting...' : '❌ Reject'}
          </button>
          <button className="ls-btn success" disabled={submittingAction} onClick={() => handleAction('approve')}>
            {submittingAction === 'approve' ? 'Approving...' : '✅ Approve'}
          </button>
        </div>
      </div>
    </>
  );
}