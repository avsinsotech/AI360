import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AvsSaarthiAi.css';

const T = {
  en: {
    back: "Back",
    report: "Report",
    download: "Download Report (PDF)",
    generating: "Generating...",
    reportTitle: "Loan Risk Assessment Report",
    appId: "Application ID",
    memberId: "Member ID",
    date: "Date",
    maker: "Prepared By (Maker)",
    checker: "Verified By (Checker)",
    makerRole: "Credit Officer",
    checkerRole: "Branch Manager",
    sec1: "1. Member Information",
    colComponent: "Component",
    colDetails: "Details",
    memberName: "Member Name",
    aadhaarNo: "Aadhaar Number",
    panNo: "PAN Number",
    cibilScore: "CIBIL Score",
    membershipYears: "Membership Tenure",
    years: "Years",
    shareCapital: "Share Capital",
    depositHolding: "Deposit Amount",
    netMonthlyIncome: "Net Monthly Income",
    employerType: "Employment Type",
    pastOverdue: "Past Overdue",
    pastOverdue_N: "No",
    pastOverdue_Y: "Yes",
    sec2: "2. Loan Details",
    proposedLoanAmount: "Proposed Loan Amount",
    interestRate: "Interest Rate",
    tenure: "Tenure",
    months: "Months",
    proposedEmi: "Proposed EMI",
    existingEmi: "Existing EMI",
    sec3: "3. Financial Analysis (AI Calculated)",
    foirTitle: "FOIR (Fixed Obligation to Income Ratio)",
    foirCalc: "FOIR = (Existing EMI + Proposed EMI) / Monthly Income",
    result: "Result",
    foirSuccess: "Below 50% – Within acceptable limits",
    foirWarning: "High debt ratio (>50%)",
    exposureTitle: "Exposure Ratio",
    exposureCalc: "Exposure = Loan Amount / Deposit Amount",
    exposureSafe: "Safe Level",
    exposureMedium: "Medium/High Risk Level",
    exposureHigh: "High Risk Level",
    sec4: "4. Risk Scoring (AI based, out of 100)",
    colScore: "Score",
    scoreMembership: "Membership Stability",
    scoreShare: "Share Capital Capacity",
    scoreDeposit: "Deposit Capacity",
    scoreFoir: "FOIR Score",
    scoreOverdue: "Overdue History",
    scoreEmployer: "Employment Stability",
    scoreGuarantor: "Guarantor FOIR",
    scoreIncome: "Income Stability",
    totalScore: "Total Score",
    sec5: "5. Risk Grade",
    finalGrade: "Final Grade",
    sec6: "6. Final Decision",
    systemDecision: "System Decision",
    committeeRequired: "Committee Approval Required",
    overrideRequired: "Override Required",
    yes: "Yes",
    no: "No",
    sec7: "7. Rules & Compliance Check",
    ruleFoir: "FOIR < 65%",
    ruleOverdue: "No past overdue",
    ruleMembership: "Membership > 1 year",
    ruleGuarFoir: "Guarantor FOIR < 60%",
    statusPass: "Pass",
    statusFail: "Fail",
    sec8: "8. Final Analysis & Recommendation (AI Recommendation)"
  },
  mr: {
    back: "मागे (Back)",
    report: "अहवाल (Report)",
    download: "अहवाल डाऊनलोड करा (PDF)",
    generating: "Generating...",
    reportTitle: "कर्ज जोखीम मूल्यांकन अहवाल",
    appId: "अर्ज क्रमांक",
    memberId: "सभासद आयडी",
    date: "दिनांक",
    maker: "तयार करणारे (Maker)",
    checker: "तपासणी करणारे (Checker)",
    makerRole: "क्रेडिट अधिकारी",
    checkerRole: "शाखा व्यवस्थापक",
    sec1: "👤 1. सभासद माहिती",
    colComponent: "घटक",
    colDetails: "तपशील",
    memberName: "सभासदाचे नाव",
    aadhaarNo: "आधार क्रमांक",
    panNo: "पॅन क्रमांक",
    cibilScore: "CIBIL स्कोर",
    membershipYears: "सभासदत्व कालावधी",
    years: "वर्षे",
    shareCapital: "शेअर भांडवल",
    depositHolding: "ठेवीची रक्कम",
    netMonthlyIncome: "मासिक निव्वळ उत्पन्न",
    employerType: "नोकरी प्रकार",
    pastOverdue: "मागील कर्ज थकबाकी",
    pastOverdue_N: "नाही",
    pastOverdue_Y: "होय",
    sec2: "💳 2. कर्ज तपशील",
    proposedLoanAmount: "प्रस्तावित कर्ज रक्कम",
    interestRate: "व्याजदर",
    tenure: "कालावधी",
    months: "महिने",
    proposedEmi: "प्रस्तावित EMI",
    existingEmi: "विद्यमान EMI",
    sec3: "📊 3. आर्थिक विश्लेषण (AI द्वारे गणना)",
    foirTitle: "🔹 FOIR (Fixed Obligation to Income Ratio)",
    foirCalc: "FOIR = (विद्यमान EMI + प्रस्तावित EMI) / मासिक उत्पन्न",
    result: "निकाल",
    foirSuccess: "✅ 50% पेक्षा कमी – स्वीकारार्ह मर्यादेत",
    foirWarning: "⚠ उच्च कर्ज प्रमाण (>50%)",
    exposureTitle: "🔹 एक्स्पोजर रेशो (Exposure Ratio)",
    exposureCalc: "एक्स्पोजर = कर्ज रक्कम / ठेवीची रक्कम",
    exposureSafe: "✔ सुरक्षित पातळी",
    exposureMedium: "⚠ मध्यम/उच्च जोखीम पातळी",
    exposureHigh: "❌ उच्च जोखीम पातळी",
    sec4: "📈 4. जोखीम गुणांकन (AI द्वारे १०० पैकी)",
    colScore: "गुण",
    scoreMembership: "सभासदत्व स्थैर्य",
    scoreShare: "शेअर भांडवल क्षमता",
    scoreDeposit: "ठेवीची क्षमता",
    scoreFoir: "FOIR गुण",
    scoreOverdue: "थकबाकी इतिहास",
    scoreEmployer: "नोकरी स्थैर्य",
    scoreGuarantor: "हमीदार FOIR",
    scoreIncome: "उत्पन्न स्थैर्य",
    totalScore: "एकूण गुण",
    sec5: "🏷 5. जोखीम श्रेणी",
    finalGrade: "✅ अंतिम श्रेणी",
    sec6: "🟢 6. अंतिम निर्णय",
    systemDecision: "सिस्टम निर्णय",
    committeeRequired: "कमिटी मंजुरी आवश्यक",
    overrideRequired: "ओव्हरराईड आवश्यक",
    yes: "होय",
    no: "नाही",
    sec7: "🔒 7. नियम व अनुपालन तपासणी",
    ruleFoir: "FOIR < 65%",
    ruleOverdue: "मागील थकबाकी नाही",
    ruleMembership: "सभासदत्व > 1 वर्ष",
    ruleGuarFoir: "हमीदार FOIR < 60%",
    statusPass: "योग्य",
    statusFail: "अयोग्य",
    sec8: "📌 8. अंतिम विश्लेषण व शिफारस (AI Recommendation)"
  }
};

const translateAiLine = (line, data) => {
  if (line.includes('CIBIL स्कोर')) {
    return `The member's CIBIL score is low (${data.input.cibilScore}), which will cause difficulties in loan repayment capacity.`;
  }
  if (line.includes('शेअर भांडवल')) {
    return `The member's share capital is low (₹${data.input.shareCapital}), which poses a risk to loan repayment.`;
  }
  if (line.includes('ठेवी')) {
    return `The member's deposit is ₹${data.input.depositHolding}, which is good, but there is still a weakness in repayment capacity.`;
  }
  if (line.includes('मासिक निव्वळ उत्पन्न')) {
    return `The member's net monthly income is ₹${data.input.netMonthlyIncome}, which is low, causing further difficulties in repayment.`;
  }
  if (line.includes('FOIR')) {
    return `The member's FOIR is ${data.input.foirPercent}%, which is very high, posing additional risk to repayment.`;
  }
  if (line.includes('नोकरी प्रकार')) {
    return `The member's employment type is ${data.input.employerType}, which is concerning for job stability and repayment.`;
  }
  return line;
};

export default function SaarthiReport() {
  const navigate = useNavigate();
  const { selectedReport, showToast } = useApp();
  const reportRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('mr');

  const reportData = selectedReport;

  if (!reportData) {
    return (
      <div className="saarthi-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No Report Selected</h2>
          <button className="wizard-back-btn" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    
    setLoading(true);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const element = reportRef.current;
      const opt = {
        margin:       [0.3, 0.3, 0.3, 0.3],
        filename:     `Saarthi_Report_${reportData?.input.memberId || 'Draft'}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true,
          letterRendering: true 
        },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
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
      <div className="saarthi-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="wizard-back-btn" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowLeft size={18} /> {T[lang].back}
          </button>
          <h1>{T[lang].report} — {reportData.appId}</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="saarthi-lang-toggle">
            <button className={`saarthi-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            <button className={`saarthi-lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>मराठी</button>
          </div>
          
          <button className="download-btn" onClick={handleDownloadPdf} disabled={loading}>
            <Download size={18} />
            {loading ? T[lang].generating : T[lang].download}
          </button>
        </div>
      </div>

      <div className="saarthi-content">
        <div className="report-container" ref={reportRef}>
          <div className="report-header" style={{ textAlign: 'center', borderBottom: '3px solid #333', paddingBottom: '1rem' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#111' }}>{reportData.institute}</h1>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#444' }}>📄 {T[lang].reportTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: '1.5rem', fontSize: '0.95rem', textAlign: 'left' }}>
              <div>
                <p><strong>{T[lang].appId}:</strong> {reportData.appId}</p>
                <p><strong>{T[lang].memberId}:</strong> {reportData.input.memberId}</p>
                <p><strong>{T[lang].date}:</strong> {reportData.date}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p><strong>{T[lang].maker}:</strong> {T[lang].makerRole}</p>
                <p><strong>{T[lang].checker}:</strong> {T[lang].checkerRole}</p>
              </div>
            </div>
          </div>

          <div className="report-section">
            <h3>{T[lang].sec1}</h3>
            <table className="report-table">
              <thead>
                <tr><th>{T[lang].colComponent}</th><th>{T[lang].colDetails}</th></tr>
              </thead>
              <tbody>
                <tr><td>{T[lang].memberName}</td><td>{reportData.input.memberName || 'N/A'}</td></tr>
                <tr><td>{T[lang].aadhaarNo}</td><td>{reportData.input.aadhaarNo || 'N/A'}</td></tr>
                <tr><td>{T[lang].panNo}</td><td>{reportData.input.panNo || 'N/A'}</td></tr>
                <tr><td>{T[lang].cibilScore}</td><td>{reportData.input.cibilScore || 'N/A'}</td></tr>
                <tr><td>{T[lang].membershipYears}</td><td>{reportData.input.membershipYears} {T[lang].years}</td></tr>
                <tr><td>{T[lang].shareCapital}</td><td>₹{reportData.input.shareCapital}</td></tr>
                <tr><td>{T[lang].depositHolding}</td><td>₹{reportData.input.depositHolding}</td></tr>
                <tr><td>{T[lang].netMonthlyIncome}</td><td>₹{reportData.input.netMonthlyIncome}</td></tr>
                <tr><td>{T[lang].employerType}</td><td>{reportData.input.employerType}</td></tr>
                <tr><td>{T[lang].pastOverdue}</td><td>{reportData.input.pastOverdue === 'N' ? T[lang].pastOverdue_N : T[lang].pastOverdue_Y}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h3>{T[lang].sec2}</h3>
            <table className="report-table">
              <thead>
                <tr><th>{T[lang].colComponent}</th><th>{T[lang].colDetails}</th></tr>
              </thead>
              <tbody>
                <tr><td>{T[lang].proposedLoanAmount}</td><td>₹{reportData.input.proposedLoanAmount}</td></tr>
                <tr><td>{T[lang].interestRate}</td><td>{reportData.input.interestRate}%</td></tr>
                <tr><td>{T[lang].tenure}</td><td>{reportData.input.tenure} {T[lang].months}</td></tr>
                <tr><td>{T[lang].proposedEmi}</td><td>₹{reportData.input.proposedEmi}</td></tr>
                <tr><td>{T[lang].existingEmi}</td><td>₹{reportData.input.existingEmi}</td></tr>
              </tbody>
            </table>
          </div>

          <div className="report-section" style={{ borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
            <h3>{T[lang].sec3}</h3>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <p><strong>{T[lang].foirTitle}</strong></p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', margin: '10px 0' }}>
                {T[lang].foirCalc} <br/>
                {T[lang].result}: <strong>{reportData.input.foirPercent}%</strong>
              </p>
              <p style={{ color: parseFloat(reportData.input.foirPercent) < 50 ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                {parseFloat(reportData.input.foirPercent) < 50 ? T[lang].foirSuccess : T[lang].foirWarning}
              </p>
              
              <p style={{ marginTop: '15px' }}><strong>{T[lang].exposureTitle}</strong></p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.1rem', margin: '10px 0' }}>
                {T[lang].exposureCalc} <br/>
                {T[lang].result}: <strong>{reportData.input.exposureRatio}</strong>
              </p>
              <p style={{ color: parseFloat(reportData.input.exposureRatio) < 1.0 ? '#16a34a' : (parseFloat(reportData.input.exposureRatio) < 2.5 ? '#d97706' : '#dc2626'), fontWeight: 'bold' }}>
                {parseFloat(reportData.input.exposureRatio) < 1.0 ? T[lang].exposureSafe : (parseFloat(reportData.input.exposureRatio) < 2.5 ? T[lang].exposureMedium : T[lang].exposureHigh)}
              </p>
            </div>
          </div>

          <div className="report-section">
            <h3>{T[lang].sec4}</h3>
            <table className="report-table">
              <thead>
                <tr><th>{T[lang].colComponent}</th><th>{T[lang].colScore}</th></tr>
              </thead>
              <tbody>
                <tr><td>{T[lang].scoreMembership}</td><td>{reportData.scores.membership}</td></tr>
                <tr><td>{T[lang].scoreShare}</td><td>{reportData.scores.share}</td></tr>
                <tr><td>{T[lang].scoreDeposit}</td><td>{reportData.scores.deposit}</td></tr>
                <tr><td>{T[lang].scoreFoir}</td><td>{reportData.scores.foir}</td></tr>
                <tr><td>{T[lang].scoreOverdue}</td><td>{reportData.scores.overdue}</td></tr>
                <tr><td>{T[lang].scoreEmployer}</td><td>{reportData.scores.employer}</td></tr>
                <tr><td>{T[lang].scoreGuarantor}</td><td>{reportData.scores.guarantor}</td></tr>
                <tr><td>{T[lang].scoreIncome}</td><td>{reportData.scores.income}</td></tr>
                <tr style={{ background: '#eee', fontWeight: 'bold' }}>
                  <td>{T[lang].totalScore}</td>
                  <td>{reportData.scores.total} / 100</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="report-section">
            <h3>{T[lang].sec5}</h3>
            <p style={{ fontSize: '1.1rem' }}>{T[lang].finalGrade}: <strong className={reportData.outcome.colorClass} style={{ fontSize: '1.4rem', padding: '4px 12px', borderRadius: '4px' }}>{reportData.outcome.grade}</strong></p>
          </div>

          <div className="report-section" style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3>{T[lang].sec6}</h3>
            <p style={{ fontSize: '1.1rem' }}>{T[lang].systemDecision}: <strong>{reportData.outcome.decision === 'मंजूर' ? T[lang].yes : (reportData.outcome.decision === 'नाकारले' ? T[lang].no : reportData.outcome.decision)}</strong></p>
            <p>{T[lang].committeeRequired}: {reportData.outcome.grade.includes('A') ? T[lang].no : T[lang].yes}</p>
            <p>{T[lang].overrideRequired}: {T[lang].no}</p>
          </div>

          <div className="report-section">
            <h3>{T[lang].sec7}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>{parseFloat(reportData.input.foirPercent) < 65 ? '✔' : '❌'} {T[lang].ruleFoir} : <strong>{parseFloat(reportData.input.foirPercent) < 65 ? T[lang].statusPass : T[lang].statusFail}</strong></li>
              <li>{reportData.input.pastOverdue === 'N' ? '✔' : '❌'} {T[lang].ruleOverdue} : <strong>{reportData.input.pastOverdue === 'N' ? T[lang].statusPass : T[lang].statusFail}</strong></li>
              <li>{parseInt(reportData.input.membershipYears) >= 1 ? '✔' : '❌'} {T[lang].ruleMembership} : <strong>{parseInt(reportData.input.membershipYears) >= 1 ? T[lang].statusPass : T[lang].statusFail}</strong></li>
              <li>{parseFloat(reportData.input.guarantorFoir) < 60 ? '✔' : '❌'} {T[lang].ruleGuarFoir} : <strong>{parseFloat(reportData.input.guarantorFoir) < 60 ? T[lang].statusPass : T[lang].statusFail}</strong></li>
            </ul>
          </div>

          <div className="report-section">
            <h3>{T[lang].sec8}</h3>
            <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fde68a', lineHeight: '1.8', fontSize: '1.05rem' }}>
              {(() => {
                const isEn = lang === 'en';
                const hasEn = !!reportData.aiAnalysisEn;
                const source = (isEn && hasEn) ? reportData.aiAnalysisEn : reportData.aiAnalysis;
                
                return source.split('\n').filter(l => l.trim()).map((line, i) => {
                  // Fallback to pattern-match translation only if we are in EN mode but don't have native AI English content
                  const displayLine = (isEn && !hasEn) ? translateAiLine(line, reportData) : line;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#d97706', fontSize: '1.2rem', lineHeight: '1.4' }}>•</span>
                      <span>{displayLine.trim().replace(/^[*-]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
