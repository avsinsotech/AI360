import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import homeLoanService from '../../services/homeLoanService';
import { useReactToPrint } from 'react-to-print';

/* ──────────────────────────────────────────────────────────────────────────
   CSS OVERRIDES FOR THE PRINT COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800;900&family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');

  .sanction-print-wrapper, .sanction-print-wrapper * {
    box-sizing: border-box !important;
  }

  .sanction-print-wrapper {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 20px 0;
    font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
  }

  .page {
    width: 210mm;
    height: 296mm;
    background: #fff;
    margin: 0 auto;
    padding: 15mm 20mm;
    position: relative;
    box-shadow: none;
    color: #1a1a1a;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 14px;
    border: 1px solid #e2e8f0;
  }
  
  th, td {
    border: 1px solid #e2e8f0;
    padding: 10px 14px;
    text-align: left;
    vertical-align: middle;
  }

  .blue-header {
    background: #0a1c5a;
    color: white;
    text-align: center;
    font-weight: 800;
    padding: 20px 10px;
    font-size: 22px;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-family: 'Outfit', sans-serif;
  }

  .gold-line {
    height: 4px;
    background-color: #f5a623;
    width: 100%;
    margin-bottom: 30px;
  }

  .blue-table-header {
    background-color: #0a1c5a;
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .text-blue-dark {
    color: #0a1c5a;
  }

  .number-list {
    list-style-type: none;
    padding-left: 0;
    margin-top: 10px;
  }
  .number-list li {
    margin-bottom: 10px;
    color: #334155;
    font-size: 13.5px;
    line-height: 1.5;
    display: flex;
    gap: 10px;
  }
  .number-list .li-num {
    font-weight: 800;
    color: #0a1c5a;
    min-width: 20px;
  }

  @media print {
    @page { 
      size: A4; 
      margin: 0; 
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    .sanction-print-wrapper {
      padding: 0 !important;
      background: #fff !important;
    }

    .page {
      width: 210mm !important;
      height: 296mm !important;
      margin: 0 !important;
      padding: 15mm 20mm !important;
      box-shadow: none !important;
      border: none !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
      page-break-before: avoid !important;
    }
  }
`;

const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return dateInput;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const TRANSLATIONS = {
  mr: {
    back: 'मागे',
    print: 'प्रिंट करा',
    instName: 'एव्हीएस इनसोटेक प्राइवेट लिमिटेड',
    header: 'होम लोन स्वीकृती पत्र | HOME LOAN SANCTION LETTER',
    dear: 'प्रिय महोदय/महोदया,',
    intro: 'आपल्या होम लोन अर्जाचा सराव केल्यानंतर आम्ही खुशीने आपला अर्ज स्वीकृत केल्याची सूचना देतो.',
    loanDetailsTitle: 'कर्ज तपशील (LOAN DETAILS):',
    amtLabel: 'मंजूर कर्ज रक्कम (Sanctioned Amount): ₹',
    rateLabel: 'वार्षिक व्याज दर (Interest Rate):',
    tenureLabel: 'कर्ज मुदत (Tenure):',
    tenureSub: 'वर्ष (Maximum 20 वर्ष)',
    emiLabel: 'मासिक किस्त (EMI): ₹',
    docsTitle: 'आवश्यक कागदपत्र (REQUIRED DOCUMENTS):',
    docs: [
      'संपूर्ण होम लोन करार',
      'संपती दस्तऐवज (७/१२, संपती नकल, म्युटेशन)',
      'मुक्त संपती प्रमाणपत्र (NOC)',
      'आधार/पॅन कार्ड',
      'वेतन पत्र आणि ITR',
      'बँक विवरण (6 महिने)',
      'संपती बीमा पॉलिसी'
    ],
    thanks: 'धन्यवाद!',
    pa: '% p.a.'
  },
  en: {
    back: 'Back',
    print: 'Click to Print',
    instName: 'AVS INSOTECH PRIVATE LIMITED',
    header: 'HOME LOAN SANCTION LETTER',
    dear: 'Dear Sir/Madam,',
    intro: 'After reviewing your home loan application, we are pleased to inform you that your loan has been sanctioned.',
    loanDetailsTitle: 'LOAN DETAILS:',
    amtLabel: 'Sanctioned Amount: ₹',
    rateLabel: 'Interest Rate:',
    tenureLabel: 'Tenure:',
    tenureSub: 'Years (Maximum 20 Years)',
    emiLabel: 'Monthly Installment (EMI): ₹',
    docsTitle: 'REQUIRED DOCUMENTS:',
    docs: [
      'Complete Home Loan Agreement',
      'Property Documents (7/12, Copy, Mutation)',
      'No Objection Certificate (NOC)',
      'Aadhar/PAN Card',
      'Salary Slip and ITR',
      'Bank Statement (6 Months)',
      'Property Insurance Policy'
    ],
    thanks: 'Thank You!',
    pa: '% p.a.'
  }
};

export default function HomeLoanSanctionLetter() {
  const { id } = useParams();
  const { clientInfo, showToast } = useApp();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('mr');

  const L = TRANSLATIONS[lang];

  useEffect(() => {
    if (id) {
      const fetchLoan = async () => {
        try {
          const res = await homeLoanService.getLoan(id);
          setData(res);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLoan();
    }
  }, [id]);

  // Helper: Robust case-insensitive property lookup (checks top-level and FormData)
  const resolve = (key) => {
    if (!data || !key) return '';
    
    // 1. Check top-level (direct fields)
    const topKey = Object.keys(data).find(k => k.toLowerCase() === key.toLowerCase());
    if (topKey && (data[topKey] !== undefined && data[topKey] !== null && data[topKey] !== '')) {
      return data[topKey];
    }
    
    // 2. Check nested FormData (JSON payload)
    const fd = data.FormData || data.formData;
    if (fd) {
      const fdKey = Object.keys(fd).find(k => k.toLowerCase() === key.toLowerCase());
      if (fdKey && (fd[fdKey] !== undefined && fd[fdKey] !== null && fd[fdKey] !== '')) {
        return fd[fdKey];
      }
    }
    return '';
  };

  const applicantName = resolve('ApplicantName');
  const sanctionAmountStr = ''; // Kept blank as requested
  const tenure = resolve('RepaymentMonths');
  const emiAmount = resolve('FirstInstalment');
  // Check common keys and fallback to 8.5 (HFC Standard) if missing
  const interestRate = resolve('interestRate') || resolve('vyajDar') || '8.5';

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Sanction_Letter_${applicantName?.replace(/\s+/g, '_') || id}`,
    onAfterPrint: () => console.log('Print preview closed'),
  });

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading document data...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>Application data not found.</div>;

  const Underline = ({ value, minWidth = '120px' }) => (
    <span style={{
      display: 'inline-block',
      borderBottom: '1px solid #111',
      minWidth: minWidth,
      textAlign: 'center',
      fontWeight: '700',
      padding: '0 8px',
      margin: '0 4px'
    }}>
      {value || '\u00A0'}
    </span>
  );

  return (
    <div className="sanction-print-wrapper">
      {/* ─── Premium Sticky Toolbar ─── */}
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 9999,
        background: '#0a1c5a', color: '#fff',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%', fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600,
              color: '#fff'
            }}
          >
            <ArrowLeft size={16} /> {L.back}
          </button>
          <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '0.5px' }}>{L.header}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px' }}>
            <button onClick={() => setLang('mr')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: lang === 'mr' ? '#fff' : 'transparent', color: lang === 'mr' ? '#0a1c5a' : '#fff' }}>Marathi</button>
            <button onClick={() => setLang('en')} style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: lang === 'en' ? '#fff' : 'transparent', color: lang === 'en' ? '#0a1c5a' : '#fff' }}>English</button>
          </div>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 24px', borderRadius: '8px', background: '#fff',
              color: '#0a1c5a', border: 'none', cursor: 'pointer', fontWeight: 700,
              fontSize: '14px'
            }}
          >
            <Printer size={18} /> {L.print}
          </button>
        </div>
      </div>

      <div ref={contentRef}>
        <style>{GLOBAL_CSS}</style>
        <div className="page" style={{ padding: '15mm 20mm' }}>
          {/* Header - EXACT AS IMAGE */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: '#0a1c5a', fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>
              {clientInfo?.name || L.instName}
            </h1>
            <h2 style={{ color: '#f59e0b', fontSize: '18px', fontWeight: 800 }}>
              {L.header}
            </h2>
          </div>

          <div style={{ height: '3px', background: '#f59e0b', width: '100%', marginBottom: '40px' }}></div>

          {/* Content Body */}
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <p style={{ fontWeight: 600, marginBottom: '20px' }}>{L.dear}</p>
            <p style={{ marginBottom: '35px' }}>{L.intro}</p>

            {/* Loan Details Section */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{ color: '#0a1c5a', fontSize: '18px', fontWeight: 800, marginBottom: '15px' }}>{L.loanDetailsTitle}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>{L.amtLabel} <Underline value={sanctionAmountStr ? Number(sanctionAmountStr).toLocaleString('en-IN') : ''} minWidth="150px" /></div>
                <div>{L.rateLabel} <Underline value={interestRate} minWidth="80px" /> {L.pa}</div>
                <div>{L.tenureLabel} <Underline value={tenure ? Math.floor(tenure / 12) : ''} minWidth="80px" /> {L.tenureSub}</div>
                <div>{L.emiLabel} <Underline value={emiAmount ? Number(emiAmount).toLocaleString('en-IN') : ''} minWidth="150px" /></div>
              </div>
            </div>

            {/* Required Documents Section */}
            <div style={{ marginBottom: '50px' }}>
              <h3 style={{ color: '#0a1c5a', fontSize: '18px', fontWeight: 800, marginBottom: '15px' }}>{L.docsTitle}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {L.docs.map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span>✓</span>
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Thank You */}
            <div style={{ textAlign: 'center', marginTop: 'auto', paddingBottom: '20px' }}>
              <h2 style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 800 }}>{L.thanks}</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
