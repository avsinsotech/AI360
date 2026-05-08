import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// html2pdf will be dynamically imported on demand
import { Download, FileText, CheckCircle, AlertTriangle, Loader2, Plus, Bot, Search, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sendMessage } from '../../services/api';
import './AvsSaarthiAi.css';

const generateAppId = (count) => {
  const year = new Date().getFullYear();
  return `APP-${year}-${String(count).padStart(4, '0')}`;
};

const ReportLoadingOverlay = ({ status }) => (
  <div className="report-loading-overlay">
    <div className="loading-content">
      <div className="ai-scanner">
        <div className="scanning-line"></div>
        <div className="ai-ring">
          <Bot size={48} className="ai-icon" />
        </div>
      </div>
      <div className="loading-text">
        <h3>AI विश्लेषण सुरू आहे</h3>
        <p>{status}</p>
      </div>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
);

export default function AvsSaarthiAi() {
  const navigate = useNavigate();
  const { reports, refreshReports, addReport, selectedReport, setSelectedReport, showToast, clientInfo } = useApp();

  useEffect(() => {
    refreshReports();
  }, [refreshReports]);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Initialize counter based on existing reports to avoid duplicate App IDs
  const [appCounter, setAppCounter] = useState(() => {
    if (reports && reports.length > 0) {
      // Find the highest number in the existing reports appId
      const nums = reports.map(r => {
        const match = r.appId.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
      return Math.max(...nums) + 1;
    }
    return 1;
  });

  const [instituteName, setInstituteName] = useState('');

  // Auto-fetch institute name from clientInfo (bank/society name)
  useEffect(() => {
    if (clientInfo?.name && !instituteName) {
      setInstituteName(clientInfo.name);
    }
  }, [clientInfo]);

  const [viewMode, setViewMode] = useState('table'); // 'table', 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const DECISION_MAP = {
    'मंजूर': 'Approved',
    'समिती मंजुरी आवश्यक': 'Review',
    'नाकारले': 'Rejected'
  };

  const filteredReports = [...reports].reverse().filter(r => 
    (r.appId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.input?.memberName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.input?.aadhaarNo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / recordsPerPage);
  const currentReports = filteredReports.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const [formData, setFormData] = useState({
    applicationNo: generateAppId(appCounter),
    memberName: '',
    aadhaarNo: '',
    panNo: '',
    memberId: '',
    membershipYears: '',
    shareCapital: '',
    depositHolding: '',
    netMonthlyIncome: '',
    existingEmi: '',
    proposedEmi: '',
    proposedLoanAmount: '',
    tenure: '',
    interestRate: '12',
    guarantorFoir: '',
    pastOverdue: 'N',
    employerType: '',
    cibilScore: ''
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const reportRef = useRef(null);

  useEffect(() => {
    if (selectedReport) {
      // Navigating from Dashboard with an existing report — go directly to report page
      navigate('/saarthi/report');
    }
  }, [selectedReport]);

  // Auto-calculate EMI based on Amount, Rate, and Tenure
  useEffect(() => {
    const P = parseFloat(formData.proposedLoanAmount);
    const R = parseFloat(formData.interestRate) / 12 / 100;
    const N = parseFloat(formData.tenure);

    if (P > 0 && R > 0 && N > 0) {
      const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
      setFormData(prev => ({ ...prev, proposedEmi: Math.round(emi).toString() }));
    } else {
      setFormData(prev => ({ ...prev, proposedEmi: '' }));
    }
  }, [formData.proposedLoanAmount, formData.interestRate, formData.tenure]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setViewMode('form');
    setSelectedReport(null);
    const nextCount = appCounter + 1;
    setAppCounter(nextCount);
    setFormData({
      applicationNo: generateAppId(nextCount),
      memberName: '',
      aadhaarNo: '',
      panNo: '',
      memberId: '',
      membershipYears: '',
      shareCapital: '',
      depositHolding: '',
      netMonthlyIncome: '',
      existingEmi: '',
      proposedEmi: '',
      proposedLoanAmount: '',
      tenure: '',
      interestRate: '12',
      guarantorFoir: '',
      pastOverdue: 'N',
      employerType: '',
      cibilScore: ''
    });
    setReportData(null);
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const calculateScores = async () => {
    setLoading(true);
    setLoadingStatus('माहिती संकलित केली जात आहे...');
    try {
      const data = { ...formData };

      setTimeout(() => setLoadingStatus('आर्थिक रेशो तपासले जात आहेत...'), 1500);
      setTimeout(() => setLoadingStatus('जोखीम गुणांकन केले जात आहे...'), 3000);
      setTimeout(() => setLoadingStatus('AI शिफारस तयार केली जात आहे...'), 4500);

      // 1. AI Analysis & Calculation Request
      const prompt = `तुम्ही एक वरिष्ठ कर्ज छाननी अधिकारी आहात. खालील कर्ज अर्जाची माहिती तपासा.
तुम्हाला खालील सर्व गणिते आणि विश्लेषण करायचे आहे:

माहिती:
- सभासद ID: ${data.memberId}
- आधार क्रमांक: ${data.aadhaarNo}
- पॅन क्रमांक: ${data.panNo}
- CIBIL स्कोर: ${data.cibilScore}
- सभासदत्व: ${data.membershipYears} वर्षे
- शेअर भांडवल: ₹${data.shareCapital}
- ठेवी: ₹${data.depositHolding}
- मासिक निव्वळ उत्पन्न: ₹${data.netMonthlyIncome}
- प्रस्तावित कर्ज रक्कम: ₹${data.proposedLoanAmount}
- प्रस्तावित EMI: ₹${data.proposedEmi}
- विद्यमान EMI: ₹${data.existingEmi}
- हमीदार FOIR: ${data.guarantorFoir}%
- मागील थकबाकी: ${data.pastOverdue === 'Y' ? 'होय' : 'नाही'}
- नोकरी प्रकार: ${data.employerType}

तुम्हाला खालील फॉरमॅटमध्ये अचूक उत्तरे द्यायची आहेत (फक्त आकडे आणि मजकूर):

[FOIR_VAL]: (येथे FOIR % लिहा, सूत्र: (विद्यमान + प्रस्तावित EMI) / उत्पन्न)
[EXP_VAL]: (येथे एक्स्पोजर रेशो लिहा, सूत्र: कर्ज / ठेवी)
[SCORE_MEM]: (सभासदत्व स्थैर्य गुण, ०-१०)
[SCORE_CAP]: (शेअर भांडवल गुण, ०-१०)
[SCORE_DEP]: (ठेवीची क्षमता गुण, ०-१०)
[SCORE_FOIR]: (FOIR गुण, ०-१५)
[SCORE_HIST]: (थकबाकी इतिहास गुण, ०-१५)
[SCORE_EMP]: (नोकरी स्थैर्य गुण, ०-८)
[SCORE_G]: (हमीदार FOIR गुण, ०-१०)
[SCORE_INC]: (उत्पन्न स्थैर्य गुण, ०-७)
[TOTAL_SCORE]: (एकूण गुण, १०० पैकी)
[GRADE]: (A, B किंवा C)
[DECISION]: (मंजूर, समिती मंजुरी आवश्यक, किंवा नाकारले)
[REC_MR]: (येथे तुमचे सविस्तर विश्लेषण आणि शिफारस मराठीमध्ये **मुद्देसूद (Pointwise)** लिहा. किमान ५-६ महत्वाचे मुद्दे द्या.)
[REC_EN]: (Write the same detailed analysis and recommendation in English **Pointwise**. Provide at least 5-6 key points.)

तुमचे सर्व विश्लेषण मराठी आणि इंग्रजी दोन्हीमध्ये असावे. मुद्देसूद माहिती द्या ज्यामुळे वाचायला सोपे होईल. अचूक गणिते करा.`;

      const aiResponse = await sendMessage([
        { role: 'system', content: 'You are an experienced bank loan officer. Analyze the input and provide the [REC_MR] (Marathi) and [REC_EN] (English) sections. Both should be detailed pointwise lists with 5+ points. Each point starting on a new line.' },
        { role: 'user', content: prompt }
      ], { model: 'llama-3.3-70b-versatile' });

      // 2. Parse Structured AI Response
      const extract = (tag) => {
        const regex = new RegExp(`\\[${tag}\\]:\\s*(.*)`, 'i');
        const match = aiResponse.match(regex);
        return match ? match[1].trim() : '';
      };

      const foir = parseFloat(extract('FOIR_VAL')) || 0;
      const exp = parseFloat(extract('EXP_VAL')) || 0;
      const total = parseInt(extract('TOTAL_SCORE')) || 0;
      const grade = extract('GRADE');
      const decision = extract('DECISION');

      // Greedily capture everything after the tags for multi-line support
      const recMrPart = aiResponse.split(/\[REC_MR\]:/i)[1]?.split(/\[REC_EN\]:/i)[0] || '';
      const recEnPart = aiResponse.split(/\[REC_EN\]:/i)[1] || '';
      
      const analysisMr = recMrPart.trim();
      const analysisEn = recEnPart.trim();

      let colorClass = 'risk-grade-high';
      if (grade.startsWith('A')) colorClass = 'risk-grade-low';
      else if (grade.startsWith('B')) colorClass = 'risk-grade-medium';

      const newReport = {
        appId: data.applicationNo,
        institute: instituteName,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        input: { ...data, foirPercent: foir, exposureRatio: exp },
        scores: {
          membership: extract('SCORE_MEM'),
          share: extract('SCORE_CAP'),
          deposit: extract('SCORE_DEP'),
          foir: extract('SCORE_FOIR'),
          overdue: extract('SCORE_HIST'),
          employer: extract('SCORE_EMP'),
          guarantor: extract('SCORE_G'),
          income: extract('SCORE_INC'),
          total: total
        },
        outcome: { grade, decision, colorClass },
        aiAnalysis: analysisMr,
        aiAnalysisEn: analysisEn
      };

      setReportData(newReport);
      addReport(newReport);
      setSelectedReport(newReport);
      navigate('/saarthi/report');
    } catch (err) {
      showToast('AI विश्लेषण मिळवण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setLoading(true);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const element = reportRef.current;
      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3], // Top, Left, Bottom, Right
        filename: `Saarthi_Report_${reportData?.input.memberId || 'Draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(element).set(opt).save();
    } catch (err) {
      showToast('PDF तयार करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saarthi-container">
      {loading && <ReportLoadingOverlay status={loadingStatus} />}
      <div className="saarthi-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <input
            type="text"
            value={instituteName}
            readOnly
            placeholder="Institute Name (Auto-fetched)"
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              minWidth: '300px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'default'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {viewMode === 'table' ? null : (
            <button className="add-new-btn" onClick={() => setViewMode('table')} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
              <ArrowLeft size={18} /> परत (Back)
            </button>
          )}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Self-Scrutiny Loan Assessment</div>
        </div>
      </div>

      <div className="saarthi-content">
        {viewMode === 'table' && !reportData ? (
          <div className="saarthi-table-view">
            <div className="table-header-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Recent Loan Applications</h3>
              <div className="search-wrap" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                <input 
                  type="text" 
                  placeholder="Search application, name or Aadhaar..." 
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', width: '250px' }}
                />
              </div>
            </div>

            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead style={{ background: 'linear-gradient(135deg, #0a1c5a 0%, #142e86 100%)', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Appl. No</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Applicant</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Aadhaar No.</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Monthly Income</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Loan Amount</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Decision</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReports.length > 0 ? (
                    currentReports.map((r, i) => {
                      const decisionLabel = DECISION_MAP[r.outcome?.decision] || r.outcome?.decision || 'Pending';
                      let statusColor = '#94a3b8'; // Default
                      let statusBg = '#f1f5f9';
                      if (decisionLabel === 'Approved') { statusColor = '#059669'; statusBg = '#dcfce7'; }
                      else if (decisionLabel === 'Review') { statusColor = '#d97706'; statusBg = '#fef3c7'; }
                      else if (decisionLabel === 'Rejected') { statusColor = '#e11d48'; statusBg = '#ffe4e6'; }

                      return (
                        <tr key={i} onClick={() => { setSelectedReport(r); navigate('/saarthi/report'); }} style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--text-primary)' }}>{r.appId || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{r.input?.memberName || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{r.input?.aadhaarNo || 'N/A'}</td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>₹ {(parseFloat(r.input?.netMonthlyIncome || 0)).toLocaleString()}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--text-primary)' }}>₹ {(parseFloat(r.input?.proposedLoanAmount || 0)).toLocaleString()}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', color: statusColor, backgroundColor: statusBg }}>
                              {decisionLabel}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{r.date || 'N/A'}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        {searchTerm ? 'No matches found.' : 'No recent loan applications found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {currentPage} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
                </div>
              </div>
            )}
          </div>
        ) : !reportData && viewMode === 'form' ? (
          <>
            <div className="saarthi-steps">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-num">{currentStep > 1 ? <CheckCircle size={18} /> : '1'}</div>
              <span>सभासद माहिती</span>
            </div>
            <div className={`step-line ${currentStep > 1 ? 'active' : ''}`}></div>
            <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-num">{currentStep > 2 ? <CheckCircle size={18} /> : '2'}</div>
              <span>आर्थिक माहिती</span>
            </div>
            <div className={`step-line ${currentStep > 2 ? 'active' : ''}`}></div>
            <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-num">3</div>
              <span>कर्ज तपशील</span>
            </div>
          </div>

        {/* Input Form */}
          <div className="saarthi-form-container">
            {currentStep === 1 && (
              <div className="form-step-section animate-fade-in">
                <h3 className="section-title">👤 सभासद माहिती (Member Information)</h3>
                <div className="saarthi-form-grid">
                  <div className="form-group">
                    <label>अर्ज क्रमांक (Application No)</label>
                    <input name="applicationNo" value={formData.applicationNo} disabled style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
                  </div>
                  <div className="form-group">
                    <label>सभासदाचे नाव (Member Name)</label>
                    <input name="memberName" value={formData.memberName} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>आधार क्रमांक (Aadhaar No)</label>
                    <input name="aadhaarNo" value={formData.aadhaarNo} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>पॅन क्रमांक (PAN No)</label>
                    <input name="panNo" value={formData.panNo} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>सभासद आयडी (Member ID)</label>
                    <input name="memberId" value={formData.memberId} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>सभासदत्व वर्षे (Membership Years)</label>
                    <input name="membershipYears" type="number" value={formData.membershipYears} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>नोकरी प्रकार (Employer Type)</label>
                    <input name="employerType" value={formData.employerType} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step-section animate-fade-in">
                <h3 className="section-title">💰 आर्थिक माहिती (Financial Background)</h3>
                <div className="saarthi-form-grid">
                  <div className="form-group">
                    <label>CIBIL स्कोर (CIBIL Score)</label>
                    <input name="cibilScore" type="number" value={formData.cibilScore} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>शेअर भांडवल (₹)</label>
                    <input name="shareCapital" type="number" value={formData.shareCapital} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>ठेवीची रक्कम (₹)</label>
                    <input name="depositHolding" type="number" value={formData.depositHolding} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>मासिक निव्वळ उत्पन्न (₹)</label>
                    <input name="netMonthlyIncome" type="number" value={formData.netMonthlyIncome} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>विद्यमान EMI (₹)</label>
                    <input name="existingEmi" type="number" value={formData.existingEmi} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="form-step-section animate-fade-in">
                <h3 className="section-title">📑 कर्ज तपशील (Loan Details)</h3>
                <div className="saarthi-form-grid">
                  <div className="form-group">
                    <label>प्रस्तावित कर्ज रक्कम (₹)</label>
                    <input name="proposedLoanAmount" type="number" value={formData.proposedLoanAmount} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>व्याजदर % (Interest Rate)</label>
                    <input name="interestRate" type="number" value={formData.interestRate} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>कालावधी (Tenure Months)</label>
                    <input name="tenure" type="number" value={formData.tenure} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>प्रस्तावित EMI (₹) - ऑटो</label>
                    <input name="proposedEmi" value={formData.proposedEmi} disabled style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 'bold' }} />
                  </div>
                  <div className="form-group">
                    <label>हमीदार FOIR %</label>
                    <input name="guarantorFoir" type="number" value={formData.guarantorFoir} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>मागील कर्ज थकबाकी (Y/N)</label>
                    <select name="pastOverdue" value={formData.pastOverdue} onChange={handleInputChange}>
                      <option value="N">नाही (No)</option>
                      <option value="Y">होय (Yes)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="wizard-navigation">
              {currentStep > 1 && (
                <button className="wizard-back-btn" onClick={prevStep}>
                  मागे (Back)
                </button>
              )}
              {currentStep < 3 ? (
                <button className="wizard-next-btn" onClick={nextStep}
                  disabled={currentStep === 1 && !formData.memberName}>
                  पुढील (Next)
                </button>
              ) : (
                <button className="generate-btn" onClick={calculateScores} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      AI विश्लेषण सुरू आहे...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      अहवाल तयार करा
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          </>
        ) : null}

      </div>
    </div>
  );
}
