import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import GoldLoanPrintMaster from '../GoldLoanForm/GoldLoanPrintMaster';
import API_BASE_URL from '../../config';

/* ──────────────────────────────────────────────────────────────────────────
   CSS OVERRIDES FOR THE PRINT COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Marathi:wght@400;700;900&family=Outfit:wght@400;600;700;800&display=swap');

  .sanction-print-wrapper, .sanction-print-wrapper * {
    box-sizing: border-box !important;
  }

  .sanction-print-wrapper {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 20px 0;
    font-family: 'Noto Sans Marathi', 'Inter', sans-serif;
  }

  .page {
    width: 210mm;
    min-height: 295mm;
    background: #fff;
    margin: 10px auto;
    padding: 8mm 10mm;
    position: relative;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    page-break-after: always;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .text-marathi {
    font-family: 'Noto Sans Marathi', sans-serif;
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
    padding: 12px 16px;
    text-align: left;
    vertical-align: middle;
  }

  .blue-header {
    background: #1e3a8a;
    color: white;
    text-align: center;
    font-weight: 800;
    padding: 18px 10px;
    font-size: 20px;
    margin-bottom: 2px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .gold-line {
    height: 3px;
    background-color: #b48c36;
    width: 100%;
    margin-bottom: 20px;
  }

  .blue-table-header {
    background-color: #1e3a8a;
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  /* Tick list styles */
  .tick-list {
    list-style-type: none;
    padding-left: 0;
    margin-top: 10px;
  }
  .tick-list li {
    margin-bottom: 8px;
    position: relative;
    padding-left: 20px;
    color: #1e3a8a;
    font-weight: 600;
  }
  .tick-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    font-weight: bold;
  }

  /* Numbered list styles */
  .number-list {
    list-style-type: none;
    padding-left: 0;
    margin-top: 10px;
  }
  .number-list li {
    margin-bottom: 8px;
    color: #1e3a8a;
    font-weight: 600;
  }

  .text-blue-dark {
    color: #1e3a8a;
  }

  @media print {
    @page { size: A4; margin: 0; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #root, .app-container, .main-layout, .content-area, .master-main, .master-content-wrapper, .sanction-print-wrapper, .print-content-wrapper { 
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    table {
      width: 100% !important;
      min-width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      table-layout: auto !important;
    }

    .blue-header {
      width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      border-radius: 0 !important;
    }
    @page {
      size: A4;
      margin: 0 !important;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .page {
      width: 100% !important;
      margin: 0 !important;
      padding: 15mm 20mm !important;
      box-shadow: none !important;
      display: block !important;
      overflow: visible !important;
    }
    .page * {
      box-sizing: border-box !important;
      overflow: visible !important;
    }
    .no-print, .sidebar, .top-bar, .master-breadcrumbs, .master-footer, .preview-toolbar, .no-print * { 
      display: none !important; 
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Consolidated Table Rules for Perfect Alignment */
    table { 
      width: 100% !important; 
      min-width: 100% !important;
      display: table !important;
      table-layout: fixed !important; 
      border-collapse: collapse !important; 
      margin-left: 0 !important;
      margin-right: 0 !important;
      overflow: visible !important;
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

export default function PersonalLoanSanctionLetter() {
  const location = useLocation();
  const { id } = useParams();
  const { clientInfo, showToast } = useApp();
  const navigate = useNavigate();

  const [data, setData] = useState(location.state);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!data && id) {
      const fetchLoan = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/PersonalLoan/${id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
          });
          if (!res.ok) throw new Error('Failed to fetch personal loan application data');
          setData(await res.json());
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchLoan();
    }
  }, [data, id, showToast]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' }}>Loading document...</div>;
  }

  if (!data) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#ef4444' }}>Data not found.</div>;
  }

  const sanctionAmountStr = data.karjRakkam ? parseFloat(data.karjRakkam).toLocaleString('en-IN') : '';
  const tenure = data.paratfedKalavadhi || '';
  const emiAmount = data.pahilaHapta ? Number(data.pahilaHapta).toLocaleString('en-IN') : '';
  const interestRate = data.vyajDar || '';

  return (
    <div className="sanction-print-wrapper">
      <GoldLoanPrintMaster title="Personal Loan Sanction Letter">
        <div className="page text-marathi">
          <style>{GLOBAL_CSS}</style>

          {/* Header Banner */}
          <div className="blue-header">
            {clientInfo?.name || ""}
          </div>
          <div className="gold-line"></div>

          {/* Org Details Table - Structured like Reference */}
          <table style={{ marginBottom: '30px', width: '100%', tableLayout: 'fixed' }}>
            <tbody>
              <tr style={{ background: '#f8fafc' }}>
                <td style={{ width: '50%', fontWeight: '700', fontSize: '12px', border: '1px solid #e2e8f0' }}>पत्ता (Address):</td>
                <td style={{ width: '50%', fontWeight: '700', fontSize: '12px', border: '1px solid #e2e8f0' }}>बँक तपशील (Bank Details):</td>
              </tr>
              <tr>
                <td style={{ height: '60px', verticalAlign: 'top', fontSize: '12px', border: '1px solid #e2e8f0' }}>
                  {clientInfo?.address || 'N/A'}
                </td>
                <td style={{ verticalAlign: 'top', fontSize: '12px', border: '1px solid #e2e8f0', width: '50%', padding: '8px' }}>
                  <div style={{ fontWeight: '500', lineHeight: '1.5' }}>
                    Bank: {clientInfo?.name || '________________'} 
                    {" | "} A/c: {clientInfo?.accountNo || '________________'} 
                    {" | "} IFSC: {clientInfo?.ifsc || '________________'}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Document Title */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#1e3a8a', fontSize: '20px', margin: '0 0 5px 0', fontWeight: 'bold' }}>व्यक्तिगत कर्ज स्वीकृती पत्र</h2>
            <h3 style={{ color: '#1e3a8a', fontSize: '16px', margin: 0, fontWeight: 'bold' }}>PERSONAL LOAN SANCTION LETTER</h3>
          </div>

          {/* Basic Info Table - Matched to Image 2 */}
          <table style={{ marginBottom: '30px', width: '100%', tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={{ width: '35%', fontWeight: '600', border: '1px solid #e2e8f0' }}>दिनांक (Date):</td>
                <td style={{ width: '65%', fontWeight: '700', border: '1px solid #e2e8f0' }}>{formatDate(data.dinank) || formatDate(data.createdAt)}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', border: '1px solid #e2e8f0' }}>अर्जदाराचे नाव (Applicant Name):</td>
                <td style={{ fontWeight: '700', border: '1px solid #e2e8f0' }}>{data.bNaav || ''}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: '600', border: '1px solid #e2e8f0' }}>कर्ज संदर्भ क्र. (Loan Ref. No.):</td>
                <td style={{ fontWeight: '700', border: '1px solid #e2e8f0' }}>{data.applicationNo || ''}</td>
              </tr>
            </tbody>
          </table>

          {/* Introduction */}
          <div style={{ marginBottom: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            <p>प्रिय महोदय/महोदया,</p>
            <p>आपल्या व्यक्तिगत कर्जाचा अर्ज सराव केल्यानंतर आम्ही खुशीने आपला अर्ज स्वीकृत केल्याची सूचना देतो. <span style={{ color: '#1e3a8a', fontWeight: 'bold' }}>कर्ज तपशील (LOAN DETAILS):</span></p>
          </div>

          {/* Loan Details Table */}
          <table style={{ marginBottom: '30px', width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th className="blue-table-header" style={{ width: '40%' }}>विवरण (Description)</th>
                <th className="blue-table-header" style={{ width: '30%', textAlign: 'right' }}>मूल्य (Value)</th>
                <th className="blue-table-header" style={{ width: '30%' }}>नोट्स (Notes)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #e2e8f0' }}>मंजूर कर्ज रक्कम (Sanctioned Amount)</td>
                <td style={{ fontWeight: '700', textAlign: 'right', color: '#1e3a8a', fontSize: '15px', border: '1px solid #e2e8f0' }}>{sanctionAmountStr ? `₹ ${sanctionAmountStr}` : '—'}</td>
                <td style={{ color: '#64748b', fontSize: '12px', border: '1px solid #e2e8f0' }}>सर्व खर्च समाविष्ट (Inclusive)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #e2e8f0' }}>वार्षिक व्याज दर (Rate of Interest p.a.)</td>
                <td style={{ fontWeight: '700', textAlign: 'right', color: '#1e3a8a', fontSize: '15px', border: '1px solid #e2e8f0' }}>{interestRate ? `${interestRate} %` : '—'}</td>
                <td style={{ color: '#64748b', fontSize: '12px', border: '1px solid #e2e8f0' }}>बदलणारा दर (Floating)</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #e2e8f0' }}>कर्ज मुदत (Tenure)</td>
                <td style={{ fontWeight: '700', textAlign: 'right', color: '#1e3a8a', fontSize: '15px', border: '1px solid #e2e8f0' }}>{tenure ? `${tenure} महिने (Months)` : '—'}</td>
                <td style={{ color: '#64748b', fontSize: '12px', border: '1px solid #e2e8f0' }}>अधिकतम ७२ महिने</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #e2e8f0' }}>मासिक किस्त (EMI)</td>
                <td style={{ fontWeight: '700', textAlign: 'right', color: '#1e3a8a', fontSize: '15px', border: '1px solid #e2e8f0' }}>{emiAmount ? `₹ ${emiAmount}` : '—'}</td>
                <td style={{ color: '#64748b', fontSize: '12px', border: '1px solid #e2e8f0' }}>महिन्याच्या १ तारखेला</td>
              </tr>
            </tbody>
          </table>

          {/* Conditions */}
          <div style={{ marginBottom: '30px' }}>
            <div className="text-blue-dark" style={{ fontWeight: 'bold', fontSize: '15px' }}>स्वीकृतीच्या शर्ती: (CONDITIONS OF SANCTION):</div>
            <ul className="number-list">
              <li>१. कर्ज मंजुरी आपल्या सर्व आवश्यक कागदपत्रांची अचूक पडताळणी आणि स्वीकृतीवर अवलंबून आहे.</li>
              <li>२. कर्ज संपूर्ण कर्ज करारानुसार आणि आमच्या नियमांनुसार दिली जाईल.</li>
              <li>३. व्याज दर बाजारातील परिस्थितीनुसार बदलू शकते.</li>
              <li>४. कर्जदार सर्व कर, शुल्क आणि खर्च वहन करणार आहे.</li>
            </ul>
          </div>

          {/* Documents Required - Force to Page 2 */}
        </div>

        <div className="page text-marathi">
          <div style={{ marginBottom: '50px' }}>
            <div className="text-blue-dark" style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '15px' }}>आवश्यक कागदपत्र (DOCUMENTS REQUIRED):</div>
            <ul className="tick-list" style={{ fontSize: '15px' }}>
              <li>संपूर्ण कर्ज करार (Complete Loan Agreement)</li>
              <li>आधार/पॅन कार्ड (Aadhar/PAN Card)</li>
              <li>कर्मचारी ओळखपत्र किंवा व्यावसायिक प्रमाणपत्र (Employee ID/Business Certificate)</li>
              <li>वेतन पत्र आणि बँक विवरण (Salary Letter & Bank Statement)</li>
              <li>जमीन वर्ग किंवा वैकल्पिक संपत्ती कागदपत्र (Collateral Documents)</li>
            </ul>
          </div>

          {/* Signatures */}
          <div>
            <div className="text-blue-dark" style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '10px' }}>हस्ताक्षर / Signatures:</div>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%', padding: '20px', height: '140px', verticalAlign: 'top' }}>
                    <div style={{ marginBottom: '80px', fontSize: '12px', color: '#111' }}>अर्जदार / Applicant</div>
                    <div style={{ borderTop: '1px solid #111', paddingTop: '10px', fontSize: '12px', color: '#111' }}>
                      नाव व हस्ताक्षर / Name & Signature
                    </div>
                  </td>
                  <td style={{ width: '50%', padding: '20px', height: '140px', verticalAlign: 'top' }}>
                    <div style={{ marginBottom: '80px', fontSize: '12px', color: '#111' }}>अधिकृत / Authorized Officer</div>
                    <div style={{ borderTop: '1px solid #111', paddingTop: '10px', fontSize: '12px', color: '#111' }}>
                      नाव व हस्ताक्षर / Name & Signature
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </GoldLoanPrintMaster>
    </div>
  );
}
