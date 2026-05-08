import React, { useState, useEffect, useRef } from 'react';
import { 
  Loader2, FileText, Download, User, ShieldCheck, Banknote, 
  BarChart, Target, FolderOpen, AlertTriangle, CheckCircle,
  Save, XCircle, Send
} from 'lucide-react';
import API_BASE_URL from '../../config';
import { sendMessage } from '../../services/api';

const fmt = (n) => '₹ ' + Math.round(n).toLocaleString('en-IN');

export default function PersonalLoanScrutinyDetail({ application }) {
  const [activeTab, setActiveTab] = useState(0);
  const [submittingAction, setSubmittingAction] = useState(null);

  // AI & PDF state
  const [aiReport, setAiReport] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const pdfRef = useRef(null);

  /* ══ State ══ */
  const [applicant, setApplicant] = useState({
    fullName: application?.applicantName || '',
    pan: '', aadhaar: '', dob: '',
    mobile: '', email: '',
    currentAddress: '',
    permanentAddress: '',
    residenceType: '', yearsAtAddress: 0,
    bankAccount: '', bankName: '',
  });

  const [loan, setLoan] = useState({
    amount: 0, tenure: 0, interestRate: 12, purpose: '',
  });

  const [employment, setEmployment] = useState({
    type: '', company: '', designation: '',
    experience: 0, currentYears: 0, empId: '',
  });

  const [income, setIncome] = useState({
    grossSalary: 0, deductions: 0, otherIncome: 0, existingEMI: 0,
  });

  const [cibilScore, setCibilScore] = useState(0);
  const [availableCibils, setAvailableCibils] = useState([]);
  const [isLoadingCibils, setIsLoadingCibils] = useState(false);
  const [showCibilModal, setShowCibilModal] = useState(false);
  const [selectedCibil, setSelectedCibil] = useState(null);
  const [eligInputs, setEligInputs] = useState({
    membershipYears: 0, shareCapital: 0, depositAmount: 0,
    guarantorFoir: 0, hasOverdue: 'N',
  });
  const uElig = (f, v) => setEligInputs(p => ({ ...p, [f]: v }));

  // Decision & Condition State (Fixed: Moved from IIFE)
  const [officerDecision, setOfficerDecision] = useState('');
  const [condChecks, setCondChecks] = useState({
    foirVerified: false,
    cibilVerified: false,
    docsVerified: false,
    guarantorVerified: false,
    nachMandateReady: false,
  });
  const toggleCond = (k) => setCondChecks(p => ({ ...p, [k]: !p[k] }));

  const fetchAvailableCibils = async () => {
    setIsLoadingCibils(true);
    try {
      const res = await fetch(`${API_BASE_URL}/CibilProxy/history`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableCibils(data.items || []);
        setShowCibilModal(true);
      } else {
        alert('Failed to load CIBILs from DB');
      }
    } catch(err) {
      alert('Error fetching CIBILs');
    } finally {
      setIsLoadingCibils(false);
    }
  };

  const handleSelectCibil = async (c) => {
    try {
      const res = await fetch(`${API_BASE_URL}/CibilProxy/report/${c.id}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (res.ok) {
        const fullReport = await res.json();
        setCibilScore(parseInt(fullReport.cibilScore) || 0);
        setSelectedCibil(fullReport);
        setShowCibilModal(false);
      } else {
        alert('Failed to load detailed report from DB');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading full CIBIL report details');
    }
  };

  // Extract Detailed Arrays Robustly
  const getArray = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj === 'object') {
      const vals = Object.values(obj);
      if (vals.length === 1 && Array.isArray(vals[0])) return vals[0];
      if (vals.length === 1 && typeof vals[0] === 'object') return [vals[0]];
      return [obj];
    }
    return [];
  };

  const cibilRaw = (() => {
    if (!selectedCibil?.rawJsonResponse) return null;
    try { return JSON.parse(selectedCibil.rawJsonResponse); } catch { return null; }
  })();
  const cibilReportData = cibilRaw?.data?.cCRResponse?.cIRReportDataLst?.[0]?.cIRReportData || null;
  const retailAccounts = getArray(cibilReportData?.retailAccountDetails);
  const enquirySummary = cibilReportData?.enquirySummary || null;
  const recentActivities = cibilReportData?.recentActivities || null;
  const retailSummary = cibilReportData?.retailAccountsSummary || null;


  useEffect(() => {
    if (application?.details) {
      const d = application.details;
      const b = d?.borrower || d?.Borrower;

      if (b) {
        const curAddr = [b.residentialAddressLine1, b.residentialAddressLine2].filter(Boolean).join(', ');
        const permAddrRaw = [b.villageAddress, b.villageMukkam, b.villagePost, b.villageTaluka, b.villageDistrict, b.villageState, b.villagePinCode].filter(Boolean).join(', ');
        const permAddr = (permAddrRaw && permAddrRaw.length > 5) ? permAddrRaw : curAddr;

        setApplicant(prev => ({
          ...prev,
          fullName: b.fullName || application.applicantName || prev.fullName,
          pan: b.panNo || prev.pan,
          aadhaar: b.aadharNo || prev.aadhaar,
          dob: b.dob || prev.dob,
          mobile: b.mobile || prev.mobile,
          email: b.email || prev.email,
          currentAddress: curAddr || prev.currentAddress,
          permanentAddress: permAddr || prev.permanentAddress,
          residenceType: b.natureOfResidence || prev.residenceType,
          yearsAtAddress: b.durationYears || prev.yearsAtAddress,
          bankAccount: b.otherBankLoanAccountNo || b.OtherBankLoanAccountNo || b.bBank96Khate || prev.bankAccount,
          bankName: b.otherBankLoanInstitutionName || b.OtherBankLoanInstitutionName || b.bBank96Naav || prev.bankName,
        }));

        setEmployment(prev => ({
          ...prev,
          type: b.employmentType || prev.type,
          company: b.companyName || prev.company,
          designation: b.designation || prev.designation,
          experience: b.serviceYears || prev.experience,
          currentYears: b.serviceYears || prev.currentYears,
          empId: b.employeeCode || prev.empId,
        }));

        const netSal = b.netSalary || (b.monthlySalary - b.totalDeductions) || 0;
        const otherInc = b.netFamilyIncome ? Math.max(0, b.netFamilyIncome - netSal) : (b.annualIncome ? (b.annualIncome / 12) : 0);

        setIncome(prev => ({
          ...prev,
          grossSalary: b.monthlySalary || prev.grossSalary,
          deductions: b.totalDeductions || prev.deductions,
          otherIncome: Math.round(otherInc),
          existingEMI: b.otherBankLoanAmount ? Math.round(b.otherBankLoanAmount / 24) : prev.existingEMI,
        }));

        // Auto-populate eligibility fields from application where available
        setEligInputs(prev => ({
          ...prev,
          membershipYears: b.membershipYears || b.memberSince || b.membershipAge || prev.membershipYears,
          shareCapital: b.shareCapital || b.shareAmount || b.capitalAmount || prev.shareCapital,
          depositAmount: b.depositAmount || b.fdAmount || b.savingsAmount || prev.depositAmount,
        }));
      }

      setLoan(prev => ({
        ...prev,
        amount: d.loanAmount || prev.amount,
        tenure: d.repaymentPeriodMonths || prev.tenure,
        purpose: d.loanPurpose || prev.purpose,
      }));
    }
  }, [application]);

  // Auto-derive Past Repayment from CIBIL when report is selected
  useEffect(() => {
    if (recentActivities) {
      const delinquent = parseInt(recentActivities.accountsDeliquent) || 0;
      setEligInputs(prev => ({ ...prev, hasOverdue: delinquent > 0 ? 'Y' : 'N' }));
    }
  }, [recentActivities]);

  const [documents, setDocuments] = useState([
    {
      cat: 'Identity & Address Proof',
      items: [
        { name: 'Aadhaar Card', detail: 'Front & Back', checked: false, date: '—', required: true },
        { name: 'PAN Card', detail: 'Original Copy', checked: false, date: '—', required: true },
        { name: 'Address Proof', detail: 'Electricity/Utility Bill', checked: false, date: '—', required: true },
      ]
    },
    {
      cat: 'Income & Employment',
      items: [
        { name: 'Salary Slips', detail: 'Last 3 Months', checked: false, date: '—', required: true },
        { name: 'Bank Statement', detail: 'Last 6 Months Salary Account', checked: false, date: '—', required: true },
        { name: 'Form 16 / ITR', detail: 'Latest Assessment Year', checked: false, date: '—', required: false },
        { name: 'Employee ID Card', detail: 'Current Organization', checked: false, date: '—', required: true },
      ]
    },
    {
      cat: 'Other Documents',
      items: [
        { name: 'Photographs', detail: '2 Passport Size', checked: false, date: '—', required: true },
        { name: 'Appointment Letter', detail: 'Current Company', checked: false, date: '—', required: false },
      ]
    }
  ]);

  useEffect(() => {
    if (application?.items && application?.masterList) {
      setDocuments(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          const m = application.masterList.find(x => x.documentName?.toLowerCase().includes(item.name.toLowerCase()));
          const d = m ? application.items.find(x => x.documentMasterId === m.id) : null;
          return {
            ...item,
            checked: d?.status === 'Verified',
            date: d?.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-IN') : item.date
          };
        })
      })));
    }
  }, [application]);

  const [officerRemarks, setOfficerRemarks] = useState('');

  /* ══ Calculations ══ */
  const netSalary = income.grossSalary - income.deductions;
  const totalIncome = netSalary + income.otherIncome;
  const mr = loan.interestRate / 12 / 100;
  const emi = mr > 0 ? Math.round((loan.amount * mr * Math.pow(1 + mr, loan.tenure)) / (Math.pow(1 + mr, loan.tenure) - 1)) : 0;
  const totalObligation = income.existingEMI + emi;
  const foir = totalIncome > 0 ? ((totalObligation / totalIncome) * 100).toFixed(1) : 0;
  const maxObligation = totalIncome * 0.5;
  const availableForNew = maxObligation - income.existingEMI;
  const eligibleAmount = mr > 0 ? Math.round((availableForNew * (Math.pow(1 + mr, loan.tenure) - 1)) / (mr * Math.pow(1 + mr, loan.tenure))) : 0;
  const surplus = totalIncome - totalObligation;
  const totalInterest = emi * loan.tenure - loan.amount;
  const totalPayable = emi * loan.tenure;
  const processingFee = loan.amount * 0.02;
  const netDisbursement = loan.amount - processingFee;

  let rec = '✅ Approve', recClr = '#059669';
  if (!totalIncome || !loan.amount) { rec = '⏳ Waiting for Data'; recClr = '#64748b'; }
  else if (foir > 50) { rec = '❌ Reject'; recClr = '#dc2626'; }
  else if (foir > 45) { rec = '⚠️ Review'; recClr = '#d97706'; }

  let foirBg = 'linear-gradient(90deg, #059669, #34d399)';
  if (foir > 50) foirBg = 'linear-gradient(90deg, #dc2626, #f87171)';
  else if (foir > 45) foirBg = 'linear-gradient(90deg, #d97706, #fbbf24)';

  const emiSchedule = [];
  let bal = loan.amount;
  for (let i = 1; i <= Math.min(12, loan.tenure); i++) {
    const int = bal * mr; const prin = emi - int; bal -= prin;
    emiSchedule.push({ m: i, emi, p: Math.round(prin), i: Math.round(int), b: Math.round(bal) });
  }

  const allDocs = documents.flatMap(c => c.items);
  const checkedDocs = allDocs.filter(d => d.checked).length;
  const docPct = Math.round((checkedDocs / (allDocs.length || 1)) * 100);

  /* ══ Derivations (Scores & Decisions) ══ */
  // 1. Risk Score (for Risk Analysis & Decision tabs)
  const cR = cibilScore >= 750 ? 10 : cibilScore >= 700 ? 8 : cibilScore >= 650 ? 6 : cibilScore >= 600 ? 4 : cibilScore > 0 ? 2 : 0;
  const eT = employment.type || '';
  const iR = ['Govt','Government'].includes(eT) ? 10 : ['MNC','Salaried'].includes(eT) ? 8 : ['Private','Professional'].includes(eT) ? 6 : eT === 'Self-Employed' ? 5 : eT ? 3 : 0;
  const fR = foir < 30 ? 10 : foir < 40 ? 8 : foir <= 50 ? 6 : foir <= 55 ? 3 : 0;
  const totOut = retailAccounts.reduce((s, a) => s + (parseFloat(a.balance || a.currentBalance) || 0), 0);
  const dRatio = totalIncome > 0 ? totOut / (totalIncome * 12) : 0;
  const dR = dRatio < 2 ? 10 : dRatio < 4 ? 7 : dRatio < 6 ? 4 : 2;
  const deliq = parseInt(recentActivities?.accountsDeliquent) || 0;
  const enq = parseInt(enquirySummary?.total) || 0;
  const rR = deliq === 0 ? (enq <= 2 ? 10 : enq <= 5 ? 7 : 5) : (deliq === 1 ? 4 : 0);
  const kR = docPct >= 90 ? 10 : docPct >= 70 ? 7 : docPct >= 50 ? 5 : 3;
  const riskScore = Math.round(cR*2.5) + Math.round(iR*2) + Math.round(fR*2) + Math.round(dR) + Math.round(rR*1.5) + Math.round(kR);

  // 2. Eligibility Score (for Eligibility & Decision tabs)
  const es1 = eligInputs.membershipYears > 5 ? 10 : eligInputs.membershipYears >= 3 ? 8 : eligInputs.membershipYears >= 1 ? 5 : 2;
  const es2 = eligInputs.shareCapital > 100000 ? 15 : eligInputs.shareCapital >= 50000 ? 10 : eligInputs.shareCapital >= 25000 ? 7 : 3;
  const es3 = eligInputs.depositAmount > 200000 ? 10 : eligInputs.depositAmount >= 100000 ? 7 : eligInputs.depositAmount >= 50000 ? 5 : 2;
  const es4 = foir < 40 ? 15 : foir <= 50 ? 10 : foir <= 55 ? 5 : 0;
  const es5 = ['Govt','Government'].includes(eT) ? 20 : ['MNC','Salaried'].includes(eT) ? 15 : ['Private','Professional'].includes(eT) ? 10 : eT === 'Self-Employed' ? 8 : 3;
  const es6 = (parseFloat(eligInputs.guarantorFoir)||0) < 35 ? 20 : (parseFloat(eligInputs.guarantorFoir)||0) <= 45 ? 15 : (parseFloat(eligInputs.guarantorFoir)||0) <= 50 ? 8 : 0;
  const es7 = eligInputs.hasOverdue === 'N' ? 10 : 0;
  const eligTotalScore = es1 + es2 + es3 + es4 + es5 + es6 + es7;

  // 3. Auto Decision Logic
  const autoDecision = (eligTotalScore >= 80 && riskScore >= 65 && parseFloat(foir) <= 50)
    ? 'Approve'
    : (eligTotalScore >= 65 || riskScore >= 50)
      ? 'Committee'
      : 'Reject';

  // Sync auto-decision and conditions when data changes
  useEffect(() => {
    if (!officerDecision && autoDecision) setOfficerDecision(autoDecision);
  }, [autoDecision, officerDecision]);

  useEffect(() => {
    setCondChecks(prev => ({
      ...prev,
      foirVerified: parseFloat(foir) <= 50,
      cibilVerified: cibilScore > 0,
      docsVerified: docPct >= 70
    }));
  }, [foir, cibilScore, docPct]);

  const toggleDoc = (ci, ii) => setDocuments(prev => {
    const c = JSON.parse(JSON.stringify(prev));
    c[ci].items[ii].checked = !c[ci].items[ii].checked;
    return c;
  });

  const u = (setter) => (f, v) => setter(p => ({ ...p, [f]: v }));
  const uA = u(setApplicant), uL = u(setLoan), uE = u(setEmployment), uIn = u(setIncome);

  const tabs = ['Applicant Details','KYC Verification','Income Assessment','Credit Score','Eligibility','Documents','Risk Analysis','Decision'];
  const tabIcons = [
    <User size={18} />, 
    <ShieldCheck size={18} />, 
    <Banknote size={18} />, 
    <BarChart size={18} />, 
    <Target size={18} />, 
    <FolderOpen size={18} />, 
    <AlertTriangle size={18} />, 
    <CheckCircle size={18} />
  ];
  const Badge = ({type, children}) => <span className={`ls-badge ${type}`}>{children}</span>;

  const handleAction = (action) => {
    if (action === 'reject' && !window.confirm('Reject this application?')) return;
    if (action === 'approve' && !window.confirm('Submit this application?')) return;
    
    setSubmittingAction(action);
    setTimeout(() => {
      setSubmittingAction(null);
      if (action === 'save') alert('Saved as Draft');
      if (action === 'reject') alert('Application Rejected');
      if (action === 'approve') alert('Final Submission Completed & Forwarded');
    }, 1200);
  };

  const handleGenerateAi = async () => {
    setIsGeneratingAi(true);
    try {
      const prompt = `तुम्ही एक वरिष्ठ कर्ज छाननी अधिकारी आहात. खालील वैयक्तिक कर्ज (Personal Loan) अर्जाची माहिती तपासा.
माहिती:
- अर्जदाराचे नाव: ${applicant.fullName}
- आधार क्रमांक: ${applicant.aadhaar}
- पॅन क्रमांक: ${applicant.pan}
- मासिक वेतन/उत्पन्न: ₹${netSalary}
- एकूण दायित्व (दायित्व मिळून): ₹${totalObligation}
- FOIR: ${foir}%
- CIBIL स्कोर: ${cibilScore}
- प्रस्तावित कर्ज रक्कम: ₹${loan.amount}
- कर्ज कालावधी: ${loan.tenure} महिने

तुम्हाला खालील फॉरमॅटमध्ये अचूक उत्तरे द्यायची आहेत (फक्त आकडे आणि मजकूर):
[DECISION]: (मंजूर, समिती मंजुरी आवश्यक, किंवा नाकारले)
[REC_MR]: (मराठीमध्ये ५-६ मुद्देसूद विश्लेषण)
[REC_EN]: (English pointwise analysis)
`;

      const aiResponse = await sendMessage([
        { role: 'system', content: 'You are an experienced loan officer. Analyze the input and provide the [DECISION], [REC_MR] (Marathi), and [REC_EN] (English) sections. Provide actionable points.' },
        { role: 'user', content: prompt }
      ], { model: 'llama-3.3-70b-versatile' });

      const extract = (tag) => {
        const regex = new RegExp(`\\[${tag}\\]:\\s*(.*)`, 'i');
        const match = aiResponse.match(regex);
        return match ? match[1].trim() : '';
      };

      const decision = extract('DECISION') || 'Review';
      const recMrPart = aiResponse.split(/\[REC_MR\]:/i)[1]?.split(/\[REC_EN\]:/i)[0] || '';
      const recEnPart = aiResponse.split(/\[REC_EN\]:/i)[1] || '';
      
      const newAiReport = {
        decision,
        analysisMr: recMrPart.trim(),
        analysisEn: recEnPart.trim(),
      };

      setAiReport(newAiReport);
      
      const dbPayload = {
        appId: application?.applicationNo || `PL-${Date.now()}`,
        memberName: applicant.fullName || 'Unknown Applicant',
        dataJson: JSON.stringify(newAiReport),
        createdBy: sessionStorage.getItem('tushgpt_user') || 'System'
      };
      
      const res = await fetch(`${API_BASE_URL}/Reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify(dbPayload)
      });
      
      if(res.ok) alert('AI Report generated and securely stored in Database.');
      else alert('AI Report generated, but could not be stored in DB.');

    } catch (err) {
      console.error('AI Generation error:', err);
      alert('AI विश्लेषण मिळवण्यात अडचण आली.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const downloadPdf = async () => {
    if (!pdfRef.current) return;
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const element = pdfRef.current;
      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: `PL_Scrutiny_Report_${application?.applicationNo || 'Draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF.');
    }
  };

  return (
    <>
      <div className="ls-content-card">
        <div className="ls-tabs-header">
          {tabs.map((t, i) => (
            <button key={i} className={`ls-tab-btn ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
              <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: '8px' }}>{tabIcons[i]}</span> {t}
            </button>
          ))}
        </div>

        {/* ═══ TAB 0: Applicant Details ═══ */}
        <div className={`ls-tab-content ${activeTab === 0 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">व्यक्तिगत माहिती / Personal Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>अर्जदाराचे पूर्ण नाव / Full Name *</label><input value={applicant.fullName} onChange={e => uA('fullName', e.target.value)} /></div>
                <div className="ls-form-group"><label>पॅन कार्ड / PAN Card *</label><input value={applicant.pan} onChange={e => uA('pan', e.target.value)} maxLength={10} /></div>
                <div className="ls-form-group"><label>आधार क्रमांक / Aadhaar Number *</label><input value={applicant.aadhaar} onChange={e => uA('aadhaar', e.target.value)} /></div>
                <div className="ls-form-group"><label>जन्मतारीख / Date of Birth *</label><input type="date" value={applicant.dob} onChange={e => uA('dob', e.target.value)} /></div>
                <div className="ls-form-group"><label>मोबाईल नंबर / Mobile Number *</label><input value={applicant.mobile} onChange={e => uA('mobile', e.target.value)} /></div>
                <div className="ls-form-group"><label>ईमेल / Email *</label><input type="email" value={applicant.email} onChange={e => uA('email', e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">पत्ता तपशील / Address Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>सध्याचा पत्ता / Current Address *</label><textarea rows={2} value={applicant.currentAddress} onChange={e => uA('currentAddress', e.target.value)} style={{padding:'0.5rem 0.625rem',border:'1px solid #cbd5e1',borderRadius:8,fontSize:'0.8rem',outline:'none'}} /></div>
                <div className="ls-form-group"><label>कायमचा पत्ता / Permanent Address *</label><textarea rows={2} value={applicant.permanentAddress} onChange={e => uA('permanentAddress', e.target.value)} style={{padding:'0.5rem 0.625rem',border:'1px solid #cbd5e1',borderRadius:8,fontSize:'0.8rem',outline:'none'}} /></div>
                <div className="ls-form-group"><label>राहणीमान / Residence Type</label>
                  <select value={applicant.residenceType} onChange={e => uA('residenceType', e.target.value)}><option>Owned</option><option>Rented</option><option>Parental</option></select>
                </div>
                <div className="ls-form-group"><label>राहणीमान कालावधी / Years at Current Address</label><input type="number" value={applicant.yearsAtAddress} onChange={e => uA('yearsAtAddress', +e.target.value)} min={0} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">कर्ज तपशील / Loan Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>कर्जाची रक्कम / Loan Amount (₹) *</label><input type="number" value={loan.amount} onChange={e => uL('amount', +e.target.value)} step={10000} /></div>
                <div className="ls-form-group"><label>कर्जाचा कालावधी / Tenure (Months) *</label><input type="number" value={loan.tenure} min={12} max={60} onChange={e => uL('tenure', +e.target.value)} /></div>
                <div className="ls-form-group"><label>कर्जाचा उद्देश / Loan Purpose *</label>
                  <select value={loan.purpose} onChange={e => uL('purpose', e.target.value)}>
                    <option value="">Select Purpose</option>
                    <option>Wedding</option>
                    <option>Medical Emergency</option>
                    <option>Education</option>
                    <option>Home Renovation</option>
                    <option>Business</option>
                    <option>Debt Consolidation</option>
                    <option>Others</option>
                    {loan.purpose && !['Wedding', 'Medical Emergency', 'Education', 'Home Renovation', 'Business', 'Debt Consolidation', 'Others'].includes(loan.purpose) && (
                      <option value={loan.purpose}>{loan.purpose}</option>
                    )}
                  </select>
                </div>
                <div className="ls-form-group"><label>व्याज दर / Interest Rate (%)</label><input type="number" value={loan.interestRate} step={0.1} onChange={e => uL('interestRate', +e.target.value)} /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 1: KYC Verification ═══ */}
        <div className={`ls-tab-content ${activeTab === 1 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            {(() => {
              const getDoc = (nameRef) => {
                const m = application?.masterList?.find(x => x.documentName?.toLowerCase().includes(nameRef.toLowerCase()));
                return application?.items?.find(d => d.documentMasterId === m?.id);
              };

              const panDoc = getDoc('PAN');
              const aadhaarDoc = getDoc('Aadhaar');
              const bankDoc = getDoc('Bank') || getDoc('Cheque');
              const addressDoc = getDoc('Address') || getDoc('Electricity') || getDoc('Telephone');

              const kycItems = [
                { t: 'PAN Card', n: applicant.pan || '—', d: panDoc },
                { t: 'Aadhaar Card', n: applicant.aadhaar || '—', d: aadhaarDoc },
                { t: 'Bank Account', n: (applicant.bankName && applicant.bankAccount) ? `${applicant.bankName} - ${applicant.bankAccount}` : (applicant.bankAccount || '—'), d: bankDoc },
                { t: 'Address Proof', n: applicant.currentAddress || 'Electricity/Utility Bill', d: addressDoc }
              ];

              const isComplete = panDoc?.status === 'Verified' && aadhaarDoc?.status === 'Verified';

              return (
                <>
                  <div className="ls-info-row">
                    <div className="ls-info-card">
                      <h4>PAN Verification</h4>
                      <div className="ls-info-value">{panDoc?.status === 'Verified' ? '✅ Verified' : (panDoc?.status === 'Rejected' ? '❌ Rejected' : '⏳ Pending')}</div>
                    </div>
                    <div className="ls-info-card">
                      <h4>Aadhaar Verification</h4>
                      <div className="ls-info-value">{aadhaarDoc?.status === 'Verified' ? '✅ Verified' : (aadhaarDoc?.status === 'Rejected' ? '❌ Rejected' : '⏳ Pending')}</div>
                    </div>
                    <div className="ls-info-card">
                      <h4>Bank Account</h4>
                      <div className="ls-info-value">{bankDoc?.status === 'Verified' ? '✅ Active' : '⏳ Pending'}</div>
                    </div>
                    <div className="ls-info-card">
                      <h4>KYC Status</h4>
                      <div className="ls-info-value">{isComplete ? '✅ Complete' : '⏳ Incomplete'}</div>
                    </div>
                  </div>

                  <div className="ls-section">
                    <div className="ls-section-title">KYC Document Verification</div>
                    <table className="ls-table">
                      <thead>
                        <tr>
                          <th>Document Type</th>
                          <th>Document Number</th>
                          <th>Status</th>
                          <th>Verified By</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kycItems.map((item, i) => {
                          const status = item.d?.status || 'Awaiting File';
                          const badgeType = status === 'Verified' ? 'success' : (status === 'Rejected' ? 'danger' : (status === 'Uploaded' ? 'info' : 'warning'));
                          const displayStatus = status === 'Awaiting File' ? 'Pending' : status;
                          const verifiedBy = status === 'Verified' ? 'Audit System' : (item.t === 'PAN Card' ? 'NSDL' : (item.t === 'Aadhaar Card' ? 'UIDAI' : 'Manual'));
                          const date = item.d?.uploadedAt ? new Date(item.d.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

                          return (
                            <tr key={`kd-${i}`}>
                              <td>{item.t}</td>
                              <td>{item.n}</td>
                              <td><Badge type={badgeType}>{displayStatus}</Badge></td>
                              <td>{verifiedBy}</td>
                              <td>{date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
            <div className="ls-section">
              <div className="ls-section-title">Face Match & Liveness Check</div>
              <div className="ls-info-row">
                <div className="ls-info-card"><h4>Photo Match Score</h4><div className="ls-info-value">—%</div></div>
                <div className="ls-info-card"><h4>Liveness Detection</h4><div className="ls-info-value">—</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ TAB 2: Income Assessment ═══ */}
        <div className={`ls-tab-content ${activeTab === 2 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">रोजगार माहिती / Employment Information</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>रोजगार प्रकार / Employment Type</label>
                  <select value={employment.type} onChange={e => uE('type', e.target.value)}><option>Salaried</option><option>Self-Employed</option><option>Professional</option></select>
                </div>
                <div className="ls-form-group"><label>कंपनी नाव / Company Name</label><input value={employment.company} onChange={e => uE('company', e.target.value)} /></div>
                <div className="ls-form-group"><label>पदनाम / Designation</label><input value={employment.designation} onChange={e => uE('designation', e.target.value)} /></div>
                <div className="ls-form-group"><label>कार्यानुभव / Total Experience (Yrs)</label><input type="number" value={employment.experience} onChange={e => uE('experience', +e.target.value)} /></div>
                <div className="ls-form-group"><label>सध्याच्या कंपनीत वर्षे / Years in Current</label><input type="number" value={employment.currentYears} onChange={e => uE('currentYears', +e.target.value)} /></div>
                <div className="ls-form-group"><label>कर्मचारी आयडी / Employee ID</label><input value={employment.empId} onChange={e => uE('empId', e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">उत्पन्न तपशील / Income Details</div>
              <div className="ls-form-grid">
                <div className="ls-form-group"><label>मासिक पगार / Monthly Gross Salary (₹)</label><input type="number" value={income.grossSalary} onChange={e => uIn('grossSalary', +e.target.value)} /></div>
                <div className="ls-form-group"><label>मासिक कपात / Monthly Deductions (₹)</label><input type="number" value={income.deductions} onChange={e => uIn('deductions', +e.target.value)} /></div>
                <div className="ls-form-group"><label>निव्वळ मासिक पगार / Net Monthly Salary (₹)</label><input type="number" value={netSalary} readOnly style={{background:'#f1f5f9'}} /></div>
                <div className="ls-form-group"><label>अतिरिक्त उत्पन्न / Other Monthly Income (₹)</label><input type="number" value={income.otherIncome} onChange={e => uIn('otherIncome', +e.target.value)} /></div>
                <div className="ls-form-group"><label>एकूण मासिक उत्पन्न / Total Monthly Income (₹)</label><input type="number" value={totalIncome} readOnly style={{fontWeight:700,color:'#059669',background:'#f1f5f9'}} /></div>
                <div className="ls-form-group"><label>विद्यमान EMI / Existing EMIs (₹)</label><input type="number" value={income.existingEMI} onChange={e => uIn('existingEMI', +e.target.value)} /></div>
              </div>
            </div>

            <div className="ls-section">
              <div className="ls-section-title">बँक स्टेटमेंट विश्लेषण / Bank Statement Analysis (Last 6 Months)</div>
              <table className="ls-table"><thead><tr><th>Parameter</th><th>Value</th><th>Status</th></tr></thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══ TAB 3: Credit Score ═══ */}
        <div className={`ls-tab-content ${activeTab === 3 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px', padding: '1rem 1.5rem', color: '#fff', marginBottom: '0.75rem',
              boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
            }}>
              <div style={{ textAlign: 'center', minWidth: '100px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.08em', textTransform: 'uppercase' }}>CIBIL SCORE</div>
                <div style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1, marginTop: '2px' }}>{cibilScore || '—'}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '4px', opacity: 0.95 }}>
                  {cibilScore >= 750 ? '⭐ Excellent' : cibilScore >= 700 ? '✅ Good' : cibilScore >= 600 ? '⚠️ Fair' : cibilScore > 0 ? '❌ Poor' : ''}
                </div>
              </div>
              <div style={{ width: '2px', background: 'rgba(255,255,255,0.4)', alignSelf: 'stretch', borderRadius: '2px' }} />
              <div style={{ flex: 1, fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>📅 {selectedCibil ? new Date(selectedCibil.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Report Selected'}</div>
                {selectedCibil && <div style={{ marginTop: 5, fontWeight: 700, fontSize: '0.95rem' }}>👤 {selectedCibil.fName || selectedCibil.fname} · <span style={{ opacity: 1, fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>{selectedCibil.pan}</span></div>}
              </div>
              <button
                onClick={fetchAvailableCibils}
                disabled={isLoadingCibils}
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.6)', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}
              >
                {isLoadingCibils ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : '🔍 Select CIBIL Report'}
              </button>
            </div>

<div className="ls-section">
                <div className="ls-section-title">Recent Account Activity</div>
                <div className="ls-info-row">
                  {[
                    ['Accounts Delinquent', recentActivities?.accountsDeliquent || '0', true],
                    ['Accounts Opened', recentActivities?.accountsOpened || '0', false],
                    ['Total Inquiries', recentActivities?.totalInquiries || '0', false],
                    ['Accounts Updated', recentActivities?.accountsUpdated || '0', false],
                  ].map(([h, v, isRisk], i) => (
                    <div className="ls-info-card" key={`ra-${i}`}
                      style={{ borderLeft: `3px solid ${isRisk && parseInt(v) > 0 ? '#dc2626' : '#3b82f6'}` }}
                    >
                      <h4>{h}</h4>
                      <div className="ls-info-value" style={{ color: isRisk && parseInt(v) > 0 ? '#dc2626' : '#1a2332' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            <div className="ls-section">
              <div className="ls-section-title">Active Credit Facilities</div>
              <table className="ls-table"><thead><tr><th>Type</th><th>Institution</th><th>Sanctioned</th><th>Outstanding</th><th>EMI</th><th>Status</th></tr></thead>
                <tbody>
                  {retailAccounts.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign:'center', padding:'1.5rem', color:'#64748b', fontStyle:'italic'}}>No Active Credit Facilities Available</td></tr>
                  ) : (
                    retailAccounts.map((acc, i) => (
                      <tr key={`acc-${i}`}>
                        <td>{acc.accountType || acc.type || '—'}</td>
                        <td>{acc.institution || acc.institutionName || '—'}</td>
                        <td>₹ {acc.sanctionAmount || acc.highCreditAmount || '0'}</td>
                        <td>₹ {acc.balance || acc.currentBalance || '0'}</td>
                        <td>₹ {acc.installmentAmount || acc.emiAmount || acc.emi || '0'}</td>
                        <td>{acc.accountStatus || acc.open || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="ls-section">
              <div className="ls-section-title">Credit Enquiries Summary</div>
              <div className="ls-info-row">
                {[
                  ['Total Enquiries', enquirySummary?.total || '0'],
                  ['Last 30 Days', enquirySummary?.past30Days || '0'],
                  ['Last 12 Months', enquirySummary?.past12Months || '0'],
                  ['Last 24 Months', enquirySummary?.past24Months || '0'],
                ].map(([h, v], i) => (
                  <div className="ls-info-card" key={`enq-sum-${i}`}
                    style={{ borderLeft: `3px solid ${parseInt(v) > 3 ? '#dc2626' : parseInt(v) > 1 ? '#d97706' : '#059669'}` }}
                  >
                    <h4>{h}</h4>
                    <div className="ls-info-value" style={{ color: parseInt(v) > 3 ? '#dc2626' : parseInt(v) > 1 ? '#d97706' : '#059669' }}>{v}</div>
                  </div>
                ))}
              </div>
              {enquirySummary?.recent && (
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  📅 Most Recent Enquiry: <strong>{enquirySummary.recent}</strong>
                </div>
              )}
            </div>

            
          </div>
        </div>

        {/* ═══ TAB 4: Eligibility ═══ */}
        <div className={`ls-tab-content ${activeTab === 4 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            {(() => {
              const totalScore = eligTotalScore; // Use shared calculation
              const decisionLabel = totalScore >= 80 ? '✅ Auto Approval' : totalScore >= 65 ? '⚠️ Committee Review' : '❌ Reject';
              const decisionColor = totalScore >= 80 ? '#059669' : totalScore >= 65 ? '#d97706' : '#dc2626';
              const decisionBg = totalScore >= 80 ? '#d1fae5' : totalScore >= 65 ? '#fef3c7' : '#fee2e2';
              const SBar = ({ score, max }) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${(score/max)*100}%`, height: '100%', borderRadius: 4, transition: 'width 0.4s', background: score === max ? '#059669' : score >= max*0.6 ? '#3b82f6' : score > 0 ? '#d97706' : '#dc2626' }} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.82rem', minWidth: 40, textAlign: 'right' }}>{score}/{max}</span>
                </div>
              );
              const inp = (field, w=80) => <input type="number" min={0} value={eligInputs[field]} onChange={e => uElig(field, parseFloat(e.target.value)||0)} style={{ width: w, padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '0.82rem' }} />;
              const autoTxt = t => <span style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>{t}</span>;
              const autoNote = (txt, fromCibil = false) => (
                <span style={{ fontSize: '0.75rem', color: fromCibil ? '#059669' : '#64748b', fontStyle: 'italic' }}>
                  {fromCibil ? '🔗 ' : 'ℹ️ '}{txt}
                </span>
              );
              const rows = [
                ['1','Membership Age', `${eligInputs.membershipYears} yr(s)`, es1, 10,
                  <div style={{display:'flex',alignItems:'center',gap:6}}>{inp('membershipYears',70)}<span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Not in DB — enter manually</span></div>],
                ['2','Share Capital', `₹${Number(eligInputs.shareCapital).toLocaleString('en-IN')}`, es2, 15,
                  <div style={{display:'flex',alignItems:'center',gap:6}}>{inp('shareCapital',110)}<span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Not in DB — enter manually</span></div>],
                ['3','Deposit Holding', `₹${Number(eligInputs.depositAmount).toLocaleString('en-IN')}`, es3, 10,
                  <div style={{display:'flex',alignItems:'center',gap:6}}>{inp('depositAmount',110)}<span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Not in DB — enter manually</span></div>],
                ['4','FOIR Score', `${foir}% (auto)`, es4, 15, autoNote('Auto-calculated from Income tab')],
                ['5','Income Stability', employment.type || 'Not Set', es5, 20, autoNote('From Employment type in application')],
                ['6','Guarantor Strength', `${parseFloat(eligInputs.guarantorFoir)||0}% FOIR`, es6, 20,
                  <div style={{display:'flex',alignItems:'center',gap:6}}>{inp('guarantorFoir',70)}<span style={{fontSize:'0.72rem',color:'#94a3b8'}}>Not in DB — enter manually</span></div>],
                ['7','Past Repayment', eligInputs.hasOverdue === 'N' ? '✅ No Overdue' : '❌ Has Overdue', es7, 10,
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <select value={eligInputs.hasOverdue} onChange={e => uElig('hasOverdue', e.target.value)} style={{ padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: 4, fontSize: '0.82rem' }}>
                      <option value="N">No Overdue</option><option value="Y">Has Overdue</option>
                    </select>
                    {recentActivities ? autoNote('Auto-set from CIBIL report', true) : autoNote('Select CIBIL to auto-detect')}
                  </div>],
              ];
              return (
                <>
                  {/* Decision Banner */}
                  <div style={{ background: decisionBg, border: `2px solid ${decisionColor}`, borderRadius: 10, padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: decisionColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Risk Score Decision</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900, color: decisionColor, marginTop: 2 }}>{decisionLabel}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TOTAL SCORE</div>
                      <div style={{ fontSize: '3rem', fontWeight: 900, color: decisionColor, lineHeight: 1 }}>{totalScore}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>out of 100</div>
                    </div>
                    <div style={{ width: 140 }}>
                      <div className="ls-progress-bar" style={{ height: 14 }}>
                        <div className="ls-progress-fill" style={{ width: `${totalScore}%`, background: totalScore >= 80 ? 'linear-gradient(90deg,#059669,#34d399)' : totalScore >= 65 ? 'linear-gradient(90deg,#d97706,#fbbf24)' : 'linear-gradient(90deg,#dc2626,#f87171)' }}>{totalScore}%</div>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 4, textAlign: 'center' }}>
                        {totalScore >= 80 ? '≥80: Auto Approval' : totalScore >= 65 ? '65–79: Committee Review' : '<65: Reject'}
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="ls-section">
                    <div className="ls-section-title">Score Calculation Breakdown (out of 100)</div>
                    <table className="ls-table">
                      <thead><tr><th style={{width:28}}>#</th><th>Parameter</th><th>Current Value</th><th>Input</th><th>Score</th><th style={{minWidth:180}}>Progress</th></tr></thead>
                      <tbody>
                        {rows.map(([num, label, val, score, max, input]) => (
                          <tr key={`elig-${num}`}>
                            <td style={{ fontWeight: 700, color: '#94a3b8' }}>{num}</td>
                            <td style={{ fontWeight: 600 }}>{label}</td>
                            <td style={{ color: '#1a2332', fontWeight: 500 }}>{val}</td>
                            <td>{input}</td>
                            <td style={{ fontWeight: 700, color: score === max ? '#059669' : score >= max*0.5 ? '#d97706' : '#dc2626' }}>{score}/{max}</td>
                            <td><SBar score={score} max={max} /></td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                          <td colSpan={4} style={{ textAlign: 'right', paddingRight: 16, fontWeight: 700 }}>TOTAL RISK SCORE</td>
                          <td style={{ fontWeight: 900, fontSize: '1.1rem', color: decisionColor }}>{totalScore}/100</td>
                          <td><SBar score={totalScore} max={100} /></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* FOIR */}
                  <div className="ls-section">
                    <div className="ls-section-title">FOIR Analysis</div>
                    <table className="ls-table"><tbody>
                      <tr><td><strong>Total Monthly Income</strong></td><td><strong>{fmt(totalIncome)}</strong></td></tr>
                      <tr><td>Existing EMIs</td><td>{fmt(income.existingEMI)}</td></tr>
                      <tr><td>Proposed Loan EMI</td><td>{fmt(emi)}</td></tr>
                      <tr><td><strong>Total Obligations</strong></td><td><strong>{fmt(totalObligation)}</strong></td></tr>
                      <tr><td><strong>FOIR Ratio</strong></td><td><strong>{foir}%</strong></td></tr>
                      <tr><td><strong>Eligible Amount</strong></td><td><strong style={{ color: '#059669' }}>{fmt(eligibleAmount)}</strong></td></tr>
                    </tbody></table>
                    <div className="ls-progress-bar" style={{ marginTop: 10 }}>
                      <div className="ls-progress-fill" style={{ width: `${Math.min(foir,100)}%`, background: foirBg }}>{foir}%</div>
                    </div>
                    <div style={{ marginTop: 6, fontSize: '0.75rem', color: foir <= 50 ? '#059669' : '#dc2626' }}>
                      {foir <= 50 ? `✅ FOIR within limits (${foir}% < 50%)` : `❌ FOIR exceeds limit (${foir}% > 50%)`}
                    </div>
                  </div>

                  {/* EMI Schedule */}
                  <div className="ls-section">
                    <div className="ls-section-title">EMI Payment Schedule (First 12 Months)</div>
                    <table className="ls-table"><thead><tr><th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Outstanding</th></tr></thead>
                      <tbody>{emiSchedule.map(r => <tr key={`emi-${r.m}`}><td>{r.m}</td><td>{fmt(r.emi)}</td><td>{fmt(r.p)}</td><td>{fmt(r.i)}</td><td>{fmt(r.b)}</td></tr>)}</tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </div>


        {/* ═══ TAB 5: Documents ═══ */}
        <div className={`ls-tab-content ${activeTab === 5 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            <div className="ls-section">
              <div className="ls-section-title">आवश्यक कागदपत्रे / Required Documents Checklist</div>
              <div style={{marginBottom:12}}>
                <div style={{fontWeight:700,fontSize:'0.8rem',marginBottom:6,color:'#000'}}>Document Submission Status:</div>
                <div className="ls-progress-bar">
                  <div className="ls-progress-fill" style={{width:`${docPct}%`}}>{docPct}% Complete</div>
                </div>
              </div>
              {documents.map((cat, ci) => (
                <div key={`dc-${ci}`}>
                  <div style={{fontWeight:700,margin:'12px 0 6px 0',color:'#1a2332',fontSize:'0.8rem'}}>{cat.cat}:</div>
                  {cat.items.map((item, ii) => (
                    <div className={`ls-checklist-item ${item.checked ? 'checked' : ''}`} key={`di-${ci}-${ii}`} style={{padding: '6px 12px', marginBottom: '4px'}}>
                      <input type="checkbox" checked={item.checked} onChange={() => toggleDoc(ci, ii)} style={{width: 16, height: 16, margin:0}} />
                      <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
                        <div style={{display:'flex', alignItems:'center', gap: 8}}>
                          <span style={{fontSize:'0.95rem', fontWeight: 700}}>
                            {item.name}{item.required && <span style={{color:'#dc2626', marginLeft: 2}}>*</span>}
                          </span>
                          <span style={{fontSize:'0.85rem', opacity: 0.7}}>({item.detail})</span>
                        </div>
                        <div style={{fontSize:'0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6}}>
                          {item.checked ? (
                            <span style={{color: '#059669'}}>✅ Verified ({item.date})</span>
                          ) : (
                            <span style={{color: item.required ? '#dc2626' : '#64748b'}}>
                              {item.required ? '⚠️ Required' : '⌛ Pending'}
                            </span>
                          )}
                        </div>
                      </div>
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
            {(() => {
              const riskPct = riskScore;
              const totalRiskWt = riskScore;

              // Grade + Probability
              const riskGrade = riskPct >= 80 ? 'A+' : riskPct >= 70 ? 'A' : riskPct >= 60 ? 'B' : riskPct >= 50 ? 'C' : 'D';
              const defaultProb = riskPct >= 80 ? '< 3%' : riskPct >= 70 ? '3–7%' : riskPct >= 60 ? '7–15%' : riskPct >= 50 ? '15–25%' : '> 25%';
              const riskLabel = riskPct >= 80 ? '✅ Low Risk' : riskPct >= 65 ? '⚠️ Moderate Risk' : '❌ High Risk';
              const riskColor = riskPct >= 80 ? '#059669' : riskPct >= 65 ? '#d97706' : '#dc2626';
              const riskBg = riskPct >= 80 ? '#d1fae5' : riskPct >= 65 ? '#fef3c7' : '#fee2e2';

              // CIBIL status helpers
              const cibilLabel = cibilScore >= 750 ? 'Excellent' : cibilScore >= 700 ? 'Good' : cibilScore >= 650 ? 'Fair' : cibilScore >= 600 ? 'Poor' : cibilScore > 0 ? 'Very Poor' : 'Not Available';
              const statusPill = (st) => {
                const map = { Excellent:'#059669', Good:'#059669', Fair:'#d97706', Moderate:'#d97706', Poor:'#dc2626', High:'#dc2626', Complete:'#059669', Low:'#3b82f6' };
                const c = map[st] || '#64748b';
                return <span style={{ background: c + '22', color: c, border: `1px solid ${c}`, borderRadius: 12, padding: '1px 10px', fontSize: '0.74rem', fontWeight: 700 }}>{st}</span>;
              };

              // Data for display
              const delinquent = parseInt(recentActivities?.accountsDeliquent) || 0;
              const totalEnquiries = parseInt(enquirySummary?.total) || 0;
              const totalOutstanding = retailAccounts.reduce((s, a) => s + (parseFloat(a.balance || a.currentBalance) || 0), 0);

              // Red Flags
              const flags = [];
              if (cibilScore > 0 && cibilScore < 650) flags.push(['Credit Score', `CIBIL ${cibilScore} — below 650 threshold`, 'High', '⚠️ Action Required']);
              if (foir > 55) flags.push(['FOIR Breach', `FOIR ${foir}% exceeds 55% hard limit`, 'High', '⚠️ Action Required']);
              if (foir > 50 && foir <= 55) flags.push(['FOIR Warning', `FOIR ${foir}% above 50% ideal limit`, 'Medium', '📋 Review']);
              if (delinquent > 0) flags.push(['Delinquency', `${delinquent} delinquent account(s) in CIBIL`, 'High', '⚠️ Action Required']);
              if (totalEnquiries > 5) flags.push(['High Enquiries', `${totalEnquiries} CIBIL enquiries — indicates credit-hungry behavior`, 'Medium', '📋 Review']);
              if (totalOutstanding > loan.amount * 5) flags.push(['High Debt', `Existing outstanding ₹${(totalOutstanding/100000).toFixed(1)}L vs loan ₹${(loan.amount/100000).toFixed(1)}L`, 'Medium', '📋 Review']);
              if (docPct < 60) flags.push(['Incomplete Docs', `Only ${docPct}% documents submitted`, 'Medium', '📋 Review']);
              if (!employment.type) flags.push(['Employment', 'Employment type not specified in application', 'Low', 'ℹ️ Verify']);
              if (!selectedCibil) flags.push(['CIBIL Report', 'No CIBIL report linked — credit assessment incomplete', 'High', '⚠️ Action Required']);

              const params = [
                ['Credit Score (CIBIL)', `${cR}/10`, '25%', cibilLabel, cibilScore > 0 ? `Score: ${cibilScore}` : 'Not available — select CIBIL report', Math.round(cR*2.5), 25],
                ['Income Stability', `${iR}/10`, '20%', iR >= 8 ? 'Good' : iR >= 5 ? 'Moderate' : 'Poor', `${employment.type || 'Not set'} — ${employment.currentYears || 0} yr(s) experience`, iR*2, 20],
                ['FOIR Ratio', `${fR}/10`, '20%', fR >= 8 ? 'Good' : fR >= 5 ? 'Moderate' : 'High', `${foir}% (limit: 50%)`, fR*2, 20],
                ['Existing Debt Burden', `${dR}/10`, '10%', dR >= 8 ? 'Low' : dR >= 5 ? 'Moderate' : 'High', retailAccounts.length > 0 ? `${retailAccounts.length} active loan(s), ₹${(totalOutstanding/100000).toFixed(1)}L outstanding` : (selectedCibil ? 'No active loans in CIBIL' : 'Select CIBIL report'), dR*1, 10],
                ['Repayment History', `${rR}/10`, '15%', delinquent === 0 ? 'Good' : 'Poor', selectedCibil ? `${delinquent} delinquent, ${totalEnquiries} total enquiries` : 'Select CIBIL report to assess', Math.round(rR*1.5), 15],
                ['KYC & Documentation', `${kR}/10`, '10%', docPct >= 70 ? 'Complete' : 'Incomplete', `${docPct}% documents submitted`, kR*1, 10],
              ];
              return (
                <>
                  {/* Summary Cards */}
                  <div className="ls-info-row" style={{ marginBottom: '0.75rem' }}>
                    <div className="ls-info-card" style={{ borderLeft: `3px solid ${riskColor}` }}>
                      <h4>Overall Risk Score</h4>
                      <div className="ls-info-value" style={{ color: riskColor, fontSize: '1.8rem' }}>{riskPct}/100</div>
                      <div style={{ fontSize: '0.75rem', color: riskColor, fontWeight: 600 }}>{riskLabel}</div>
                    </div>
                    <div className="ls-info-card">
                      <h4>Default Probability</h4>
                      <div className="ls-info-value" style={{ color: riskColor }}>{defaultProb}</div>
                    </div>
                    <div className="ls-info-card">
                      <h4>Credit Risk Grade</h4>
                      <div className="ls-info-value" style={{ color: riskColor, fontSize: '2rem' }}>{riskGrade}</div>
                    </div>
                    <div className="ls-info-card" style={{ borderLeft: `3px solid ${riskColor}` }}>
                      <h4>Recommendation</h4>
                      <div className="ls-info-value" style={{ color: riskColor, fontSize: '0.95rem' }}>
                        {riskPct >= 80 ? 'Proceed' : riskPct >= 65 ? 'Committee Review' : 'Decline'}
                      </div>
                    </div>
                  </div>

                  {/* Risk Parameters Table */}
                  <div className="ls-section">
                    <div className="ls-section-title">Risk Parameters Assessment</div>
                    <table className="ls-table">
                      <thead><tr><th>Risk Parameter</th><th>Score</th><th>Weight</th><th>Status</th><th>Weighted</th><th>Remarks</th></tr></thead>
                      <tbody>
                        {params.map(([p, sc, w, st, rem, wt, maxWt], i) => (
                          <tr key={`rp-${i}`}>
                            <td style={{ fontWeight: 600 }}>{p}</td>
                            <td style={{ fontWeight: 700 }}>{sc}</td>
                            <td>{w}</td>
                            <td>{statusPill(st)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ width: `${(wt/maxWt)*100}%`, height: '100%', background: wt >= maxWt*0.8 ? '#059669' : wt >= maxWt*0.5 ? '#d97706' : '#dc2626', borderRadius: 3 }} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{wt}/{maxWt}</span>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.81rem', color: '#475569' }}>{rem}</td>
                          </tr>
                        ))}
                        <tr style={{ background: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                          <td colSpan={4} style={{ textAlign: 'right', paddingRight: 12 }}>TOTAL WEIGHTED SCORE</td>
                          <td colSpan={2}>
                            <span style={{ fontWeight: 900, fontSize: '1rem', color: riskColor }}>{totalRiskWt}/100</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: 10 }}>
                      <div className="ls-progress-bar" style={{ height: 14 }}>
                        <div className="ls-progress-fill" style={{ width: `${riskPct}%`, background: riskPct >= 80 ? 'linear-gradient(90deg,#059669,#34d399)' : riskPct >= 65 ? 'linear-gradient(90deg,#d97706,#fbbf24)' : 'linear-gradient(90deg,#dc2626,#f87171)' }}>
                          {riskPct}/100 — {riskLabel}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags */}
                  <div className="ls-section">
                    <div className="ls-section-title">🚩 Red Flags & Concerns ({flags.length})</div>
                    {flags.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#059669', fontWeight: 600, background: '#d1fae5', borderRadius: 8 }}>
                        ✅ No red flags detected — application appears clean
                      </div>
                    ) : (
                      <table className="ls-table">
                        <thead><tr><th>Type</th><th>Description</th><th>Severity</th><th>Status</th></tr></thead>
                        <tbody>
                          {flags.map(([type, desc, sev, st], i) => {
                            const c = sev === 'High' ? '#dc2626' : sev === 'Medium' ? '#d97706' : '#64748b';
                            return (
                              <tr key={`rf-${i}`}>
                                <td style={{ fontWeight: 700 }}>{type}</td>
                                <td style={{ fontSize: '0.82rem' }}>{desc}</td>
                                <td><span style={{ background: c + '22', color: c, border: `1px solid ${c}`, borderRadius: 12, padding: '1px 10px', fontSize: '0.74rem', fontWeight: 700 }}>{sev}</span></td>
                                <td style={{ fontSize: '0.82rem' }}>{st}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Compliance Checks */}
                  <div className="ls-info-row">
                    {[
                      ['Fraud Database', applicant.pan ? `PAN: ${applicant.pan}` : '—', applicant.pan ? '✅ Checked' : '⚠️ PAN Missing'],
                      ['Wilful Defaulter', cibilScore > 0 ? `CIBIL: ${cibilScore}` : '—', delinquent > 0 ? '❌ Delinquent' : cibilScore > 0 ? '✅ Clear' : '⚠️ No CIBIL'],
                      ['CIBIL Linked', selectedCibil ? '✅ Linked' : '—', selectedCibil ? `${selectedCibil.pan}` : '❌ Not Linked'],
                      ['Documents', `${docPct}% Complete`, docPct >= 80 ? '✅ Adequate' : '⚠️ Incomplete'],
                    ].map(([h, sub, v], i) => {
                      const isOk = v.startsWith('✅');
                      const isWarn = v.startsWith('⚠️');
                      return (
                        <div className="ls-info-card" key={`vc-${i}`} style={{ borderLeft: `3px solid ${isOk ? '#059669' : isWarn ? '#d97706' : '#dc2626'}` }}>
                          <h4>{h}</h4>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 2 }}>{sub}</div>
                          <div className="ls-info-value" style={{ fontSize: '0.82rem', color: isOk ? '#059669' : isWarn ? '#d97706' : '#dc2626' }}>{v}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>


        {/* ═══ TAB 7: Decision ═══ */}
        <div className={`ls-tab-content ${activeTab === 7 ? 'active' : ''}`}>
          <div className="ls-tab-body">
            {(() => {
              const currentDecision = officerDecision || autoDecision;
              const decColor = currentDecision === 'Approve' ? '#059669' : currentDecision === 'Committee' ? '#d97706' : '#dc2626';
              const decBg   = currentDecision === 'Approve' ? '#d1fae5' : currentDecision === 'Committee' ? '#fef3c7' : '#fee2e2';
              const decIcon = currentDecision === 'Approve' ? '✅' : currentDecision === 'Committee' ? '⚠️' : '❌';
              const decLabel = currentDecision === 'Approve' ? 'SANCTIONED' : currentDecision === 'Committee' ? 'REFERRED TO COMMITTEE' : 'REJECTED';

              const conditions = [
                ['foirVerified',      `FOIR within limits (${foir}% ≤ 50%)`,                  parseFloat(foir) <= 50],
                ['cibilVerified',     `CIBIL Score acceptable (${cibilScore || 'N/A'} ≥ 650)`, cibilScore >= 650],
                ['docsVerified',      `KYC documents verified (${docPct}% complete)`,          docPct >= 70],
                ['guarantorVerified', 'Guarantor verification completed',                        false],
                ['nachMandateReady',  'NACH/ECS mandate obtained',                              false],
              ];

              return (
                <div ref={pdfRef} style={{ background: '#fff', padding: '10px' }}>
                  {/* Decision Banner */}
                  <div style={{ background: decBg, border: `2px solid ${decColor}`, borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{decIcon}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 900, color: decColor, marginTop: 4 }}>{decLabel}</div>
                      <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: 2 }}>Personal Loan Application · {application?.applicationNo || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Eligibility Score</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: decColor, lineHeight: 1 }}>{eligTotalScore}/100</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Risk Score</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: decColor, lineHeight: 1 }}>{riskScore}/100</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>FOIR</div>
                      <div style={{ fontSize: '2.2rem', fontWeight: 900, color: parseFloat(foir) <= 50 ? '#059669' : '#dc2626', lineHeight: 1 }}>{foir}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>Officer Decision Override</div>
                      <select value={officerDecision || autoDecision} onChange={e => setOfficerDecision(e.target.value)}
                        style={{ padding: '6px 12px', border: `2px solid ${decColor}`, borderRadius: 6, fontWeight: 700, fontSize: '0.88rem', color: decColor, background: decBg, cursor: 'pointer' }}>
                        <option value="Approve">✅ Approve</option>
                        <option value="Committee">⚠️ Committee Review</option>
                        <option value="Reject">❌ Reject</option>
                      </select>
                      <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: 3 }}>Auto-suggested: {autoDecision}</div>
                    </div>
                  </div>

                  {/* Sanction Summary */}
                  <div className="ls-info-row" style={{ marginBottom: '0.75rem' }}>
                    <div className="ls-info-card"><h4>Loan Amount</h4><div className="ls-info-value">{fmt(loan.amount)}</div></div>
                    <div className="ls-info-card"><h4>Net Disbursement</h4><div className="ls-info-value" style={{ color: '#059669' }}>{fmt(netDisbursement)}</div></div>
                    <div className="ls-info-card"><h4>Interest Rate</h4><div className="ls-info-value">{loan.interestRate}% p.a.</div></div>
                    <div className="ls-info-card"><h4>Monthly EMI</h4><div className="ls-info-value">{fmt(emi)}</div></div>
                  </div>

                  <div className="ls-section">
                    <div className="ls-section-title">Sanction Letter Summary</div>
                    <table className="ls-table"><tbody>
                      <tr><td><strong>Applicant Name</strong></td><td>{applicant.fullName || '—'}</td><td><strong>PAN</strong></td><td style={{fontFamily:'monospace'}}>{applicant.pan || '—'}</td></tr>
                      <tr><td><strong>Application No</strong></td><td>{application?.applicationNo || '—'}</td><td><strong>Loan Type</strong></td><td>Personal Loan</td></tr>
                      <tr><td><strong>Purpose</strong></td><td colSpan={3}>{loan.purpose || '—'}</td></tr>
                      <tr><td><strong>Sanctioned Amount</strong></td><td><strong style={{color:'#059669'}}>{fmt(loan.amount)}</strong></td><td><strong>Processing Fee (2%)</strong></td><td>{fmt(processingFee)}</td></tr>
                      <tr><td><strong>Net Disbursement</strong></td><td><strong style={{color:'#059669'}}>{fmt(netDisbursement)}</strong></td><td><strong>Tenure</strong></td><td>{loan.tenure} months</td></tr>
                      <tr><td><strong>Interest Rate</strong></td><td>{loan.interestRate}% p.a.</td><td><strong>Monthly EMI</strong></td><td><strong>{fmt(emi)}</strong></td></tr>
                      <tr><td><strong>Total Interest</strong></td><td>{fmt(totalInterest)}</td><td><strong>Total Payable</strong></td><td><strong>{fmt(totalPayable)}</strong></td></tr>
                      <tr><td><strong>FOIR</strong></td><td style={{color: parseFloat(foir) <= 50 ? '#059669' : '#dc2626'}}>{foir}%</td><td><strong>Eligible Amount</strong></td><td style={{color:'#059669'}}>{fmt(eligibleAmount)}</td></tr>
                      {selectedCibil && <tr><td><strong>CIBIL Score</strong></td><td style={{color: cibilScore >= 700 ? '#059669' : cibilScore >= 600 ? '#d97706' : '#dc2626'}}>{cibilScore}</td><td><strong>Report Date</strong></td><td>{new Date(selectedCibil.createdAt).toLocaleDateString('en-IN')}</td></tr>}
                    </tbody></table>
                  </div>

                  {/* Pre-Sanction Conditions */}
                  <div className="ls-section">
                    <div className="ls-section-title">Pre-Sanction Conditions Checklist</div>
                    {conditions.map(([k, label, autoOk]) => (
                      <div key={k} className={`ls-checklist-item ${condChecks[k] ? 'checked' : ''}`} style={{ padding: '6px 12px', marginBottom: 4, cursor: 'pointer' }} onClick={() => toggleCond(k)}>
                        <input type="checkbox" checked={condChecks[k]} onChange={() => {}} style={{ width: 16, height: 16, margin: 0 }} />
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{label}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: autoOk ? '#059669' : '#d97706' }}>
                            {autoOk ? '✅ Auto-verified' : '⚠️ Requires manual check'}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#64748b' }}>
                      {Object.values(condChecks).filter(Boolean).length}/{conditions.length} conditions met
                      {Object.values(condChecks).filter(Boolean).length < conditions.length && <span style={{ color: '#d97706', marginLeft: 6 }}>— Complete all conditions before final submission</span>}
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="ls-section">
                    <div className="ls-section-title">Terms & Conditions</div>
                    <ol style={{ paddingLeft: 16, lineHeight: 1.7, fontSize: '0.82rem', color: '#334155' }}>
                      <li>Loan to be secured by Post-Dated Cheques (PDCs) for all EMIs</li>
                      <li>NACH/ECS mandate is mandatory for EMI auto-debit</li>
                      <li>Pre-payment charges: 2% on outstanding principal</li>
                      <li>Bounce charges: ₹500 per bounced EMI</li>
                      <li>Rate of interest subject to revision as per RBI guidelines</li>
                      <li>Life insurance coverage recommended for loan protection</li>
                    </ol>
                  </div>

                  {/* Officer Remarks */}
                  <div className="ls-section">
                    <div className="ls-section-title">कर्ज अधिकारी निर्णय / Loan Officer Remarks</div>
                    <textarea rows={4} style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.82rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                      placeholder="Enter officer remarks, conditions, or any special notes about this loan decision..."
                      value={officerRemarks} onChange={e => setOfficerRemarks(e.target.value)} />
                  </div>

                  {/* AI Report */}
                  {aiReport && (
                    <div className="ls-section" style={{ background: '#f8fafc', borderLeft: '4px solid #3b82f6', padding: '1rem', borderRadius: 8 }}>
                      <div className="ls-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1e293b' }}>
                        <FileText size={18} /> AI Scrutiny Report
                      </div>
                      <div style={{ marginBottom: 10 }}><strong style={{ fontSize: '0.85rem', color: '#334155' }}>Decision:</strong> <span style={{ fontWeight: 700, color: '#0f172a' }}>{aiReport.decision}</span></div>
                      <div style={{ marginBottom: 10 }}><strong style={{ display: 'block', fontSize: '0.85rem', color: '#334155' }}>मराठी विश्लेषण:</strong><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.83rem', color: '#475569', margin: 0 }}>{aiReport.analysisMr}</pre></div>
                      <div><strong style={{ display: 'block', fontSize: '0.85rem', color: '#334155' }}>English Analysis:</strong><pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.83rem', color: '#475569', margin: 0 }}>{aiReport.analysisEn}</pre></div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="ls-btn" style={{ background: '#4f46e5', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={handleGenerateAi} disabled={isGeneratingAi}>
                      {isGeneratingAi ? <><Loader2 size={16} className="animate-spin" /> Generating AI Report...</> : '🤖 Generate AI Report'}
                    </button>
                    <button className="ls-btn" style={{ background: '#fff', color: '#1e293b', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}
                      onClick={downloadPdf}>
                      <Download size={16} /> Generate PDF
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="ls-footer-actions">
        <div className="ls-status-indicator">
          <div className="ls-status-dot processing"></div>
          <span style={{fontWeight:700,fontSize:'0.8rem',color:'#000'}}>Status: Under Review</span>
        </div>
        {activeTab === 7 ? (
          <div style={{display:'flex',gap:8}}>
            <button className="ls-btn secondary" disabled={submittingAction} onClick={() => handleAction('save')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {submittingAction === 'save' ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Draft</>}
            </button>
            <button className="ls-btn danger" disabled={submittingAction} onClick={() => handleAction('reject')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {submittingAction === 'reject' ? <><Loader2 size={16} className="animate-spin" /> Rejecting...</> : <><XCircle size={16} /> Reject</>}
            </button>
            <button className="ls-btn success" disabled={submittingAction} onClick={() => handleAction('approve')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {submittingAction === 'approve' ? <><Loader2 size={16} className="animate-spin" /> Finalizing...</> : <><Send size={16} /> Approve & Forward</>}
            </button>
          </div>
        ) : (
          <button className="ls-btn success" onClick={() => setActiveTab(prev => prev + 1)}>
            Next ➔
          </button>
        )}
      </div>

      {showCibilModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', width: '90%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>Select CIBIL Report</h3>
              <button onClick={() => setShowCibilModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {availableCibils.length > 0 ? (
                <table className="ls-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>PAN</th>
                      <th>Score</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableCibils.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500 }}>{c.fName}</td>
                        <td style={{ fontFamily: 'monospace' }}>{c.pan}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: parseInt(c.cibilScore) >= 700 ? '#059669' : parseInt(c.cibilScore) >= 600 ? '#d97706' : '#dc2626' }}>
                            {c.cibilScore}
                          </span>
                        </td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => handleSelectCibil(c)} 
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
                          >
                            Use Score
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>No CIBIL reports available in history.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
