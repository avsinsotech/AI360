import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, ClipboardList, Printer, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import html2pdf from 'html2pdf.js';

export default function GoldLoanPrintOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawData = location.state;
  const { showToast, clientInfo } = useApp();

  const [loanData, setLoanData] = useState(rawData);
  const [loading, setLoading] = useState(!rawData?.basic && rawData?.id);

  useEffect(() => {
    // If we only received an ID (like after submission), fetch the full data
    if (rawData?.id && !rawData?.basic) {
      const fetchLoan = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/GoldLoan/${rawData.id}?excludeImages=true`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
          });
          if (!res.ok) throw new Error('Failed to fetch application data');
          const finalData = await res.json();
          setLoanData(finalData);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchLoan();
    } else {
      setLoading(false);
    }
  }, [rawData, showToast]);

  const options = [
    {
      id: 'app',
      label: 'Application Print',
      icon: <ClipboardList size={32} />,
      color: '#2563eb',
      desc: 'Generate and print the full loan application form'
    },
    {
      id: 'sanction',
      label: 'Sanction Letter',
      icon: <FileText size={32} />,
      color: '#10b981',
      desc: 'Generate the official sanction letter for the borrower'
    },
    {
      id: 'appraisal',
      label: 'Appraisal Note',
      icon: <Printer size={32} />,
      color: '#f59e0b',
      desc: 'Generate the technical appraisal and valuation note'
    },
    {
      id: 'closure',
      label: 'Closure Receipt',
      icon: <ClipboardList size={32} />,
      color: '#8b5cf6',
      desc: 'Generate the final closure and gold return receipt'
    },
    {
      id: 'valuation',
      label: 'Valuation Form',
      icon: <CheckCircle2 size={32} />,
      color: '#0ea5e9',
      desc: 'Generate the filled valuation certificate with ornament details'
    }
  ];

  const handleValuationDownload = (record) => {
    if (!record) return;

    showToast('Generating Valuation Form...', 'info');

    const bankName = clientInfo?.name || "दत्तसेवा सहकारी पतपेढी";
    const bankAddress = clientInfo?.address || "Mumbai, Maharashtra";
    const bankLogo = clientInfo?.logoUrl || "";
    const today = new Date().toLocaleDateString('en-GB');
    const branch = record.basic?.branch || clientInfo?.branch || "Main Branch";
    const borrowerName = record.basic?.customerName || "N/A";
    const mobile = record.basic?.mobileNo || "N/A";

    // Ornament details logic
    const ornaments = record.ornaments || [];
    const totals = ornaments.reduce((acc, curr) => ({
      qty: acc.qty + (Number(curr.qty) || 0),
      gross: acc.gross + (Number(curr.grossWt) || 0),
      net: acc.net + (Number(curr.netWt) || 0),
      value: acc.value + (Number(curr.valuerPrice) || 0)
    }), { qty: 0, gross: 0, net: 0, value: 0 });

    const element = document.createElement('div');
    element.innerHTML = `
      <style>
        .valuation-paper {
          background: #FEFCF5;
          width: 790px;
          min-height: 1100px;
          border: 3px solid #B8860B;
          position: relative;
          padding: 0;
          margin: 0;
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }
        .v-header-band {
          background: linear-gradient(135deg, #0D1B3E 0%, #1A2E5A 100%);
          padding: 15px 36px 12px;
          position: relative;
          border-bottom: 5px solid #B8860B;
        }
        .v-logo-row { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 8px; position: relative; }
        .v-logo-circle {
          width: 115px; height: 115px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .v-logo-circle img { width: 100%; height: 100%; object-fit: contain; }
        .v-bank-branding { flex: 1; padding-top: 1px; }
        .v-name-mr { font-size: 21px; font-weight: 700; color: #fff; letter-spacing: 0.5px; line-height: 1.1; }
        .v-address-gold { font-size: 10px; color: #FFFFFF; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        
        .v-reg-box { text-align: right; font-size: 11px; color: #FFFFFF; line-height: 2.2; }
        .v-reg-line-item { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .v-reg-line-field { border-bottom: 1px solid rgba(255,255,255,0.6); min-width: 90px; height: 15px; }

        .v-doc-title-section { text-align: center; margin-top: 8px; position: relative; }
        .v-doc-title-mr { font-size: 17px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; }
        .v-doc-title-en { font-size: 8px; color: #FFFFFF; letter-spacing: 1px; margin-top: 3px; text-transform: uppercase; opacity: 0.8; }

        .v-body { padding: 12px 35px 8px; }
        .v-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 25px; margin-bottom: 15px; }
        .v-field { display: flex; flex-direction: column; gap: 2px; }
        .v-label { font-size: 13px; font-weight: 700; color: #2C4580; text-transform: uppercase; }
        .v-value { border-bottom: 1px solid #C9A84C; min-height: 22px; font-size: 14px; padding: 1px 4px; color: #1A1209; }
        
        .v-section-title { display: flex; align-items: center; gap: 8px; margin: 8px 0 6px; }
        .v-section-text { font-size: 11px; font-weight: 700; color: #0D1B3E; }
        
        .v-table-wrap { border: 1px solid #C9A84C; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #0D1B3E; color: #FFFFFF; padding: 5px; border-right: 1px solid rgba(255,255,255,0.1); }
        td { padding: 3px 5px; border-right: 1px solid #E0CC80; border-bottom: 1px solid #E8D8A0; text-align: center; height: 26px; }
        
        .v-summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .v-summary-card { border: 1px solid #C9A84C; padding: 7px; background: #FDF6E3; }
        .v-summary-label { font-size: 11px; font-weight: 700; color: #2C4580; margin-bottom: 2px; }
        .v-summary-value { font-size: 14px; font-weight: 700; color: #0D1B3E; border-bottom: 1.5px solid #B8860B; }
        
        .v-declaration-box { border: 1px solid #E0CC80; background: #FEFCF5; padding: 10px 15px; margin-bottom: 12px; border-left: 4px solid #B8860B; }
        .v-decl-title { font-size: 13px; font-weight: 700; color: #0D1B3E; margin-bottom: 5px; text-transform: uppercase; }
        .v-decl-text { font-size: 11px; font-weight: 600; color: #3D2E10; line-height: 1.3; }

        .v-sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 40px; margin-top: 10px; }
        .v-sig-box { display: flex; flex-direction: column; }
        .v-sig-label { font-size: 15px; font-weight: 800; color: #0D1B3E; text-transform: uppercase; margin-bottom: 25px; }
        .v-sig-line { border-bottom: 1px solid #B8860B; }
        .v-sig-sub { font-size: 9px; color: #666; text-align: center; margin-top: 4px; }
        
        .v-footer { background: #0D1B3E; color: #FFFFFF; padding: 8px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; border-top: 3px solid #B8860B; position: absolute; bottom: 0; width: 100%; box-sizing: border-box; }
        .v-foot-conf { background: #B8860B; color: #0D1B3E; padding: 2px 12px; font-weight: 800; border-radius: 2px; }
      </style>
      <div class="valuation-paper">
        <div class="v-header-band">
          <div class="v-logo-row">
            <div class="v-logo-circle">
              ${bankLogo ? `<img src="${bankLogo}" />` : '<div style="color:white; font-weight:bold; font-size:24px">₹</div>'}
            </div>
            <div class="v-bank-branding">
              <div class="v-name-mr">${bankName}</div>
              <div class="v-address-gold">${bankAddress}</div>
            </div>
            <div class="v-reg-box">
              <div class="v-reg-line-item">नोंदणी क्र. / Reg. No.: <div class="v-reg-line-field"></div></div>
              <div class="v-reg-line-item">दूरध्वनी / Tel: <div class="v-reg-line-field"></div></div>
              <div class="v-reg-line-item">RBI परवाना / Licence: <div class="v-reg-line-field"></div></div>
            </div>
          </div>
          <div class="v-doc-title-section">
            <div class="v-doc-title-mr">मूल्यांकन दाखला</div>
            <div class="v-doc-title-en">GOLD ORNAMENT VALUATION CERTIFICATE</div>
          </div>
        </div>

        <div class="v-body">
          <div class="v-meta-grid">
            <div class="v-field"><span class="v-label">दिनांक (Date)</span><div class="v-value">${today}</div></div>
            <div class="v-field"><span class="v-label">शाखा (Branch)</span><div class="v-value">${branch}</div></div>
            <div class="v-field"><span class="v-label">कर्जदाराचे नाव (Borrower's Name)</span><div class="v-value">${borrowerName}</div></div>
            <div class="v-field"><span class="v-label">मोबाईल (Mobile)</span><div class="v-value">${mobile}</div></div>
            <div class="v-field" style="grid-column: span 2"><span class="v-label">कर्ज प्रकार (Loan Type)</span><div class="v-value">Gold Loan</div></div>
          </div>
          
          <div class="v-section-title"><span class="v-section-text">दागिन्यांचे तपशील / Ornament Details</span></div>
          <div class="v-table-wrap">
            <table>
              <thead>
                <tr><th style="width:30px">Sr.</th><th>दागिन्यांचे वर्णन / Description</th><th style="width:40px">Pcs</th><th style="width:60px">Weight</th><th style="width:60px">Purity</th><th style="width:105px">Value (₹)</th></tr>
              </thead>
              <tbody>
                ${ornaments.length > 0 
                  ? ornaments.map((item, i) => `<tr><td>${i+1}</td><td style="text-align: left; padding-left: 10px;">${item.particular || 'Gold'}</td><td>${item.qty || ''}</td><td>${item.netWt || ''}</td><td>22K</td><td>${item.valuerPrice || ''}</td></tr>`).join('')
                  : Array(8).fill(0).map((_, i) => `<tr><td>${i+1}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')
                }
              </tbody>
              <tfoot style="background: #FDF6E3; color: #0D1B3E; font-weight: bold;">
                <tr><td colspan="2" style="text-align:right; padding:6px;">एकूण / TOTAL</td><td>${totals.qty}</td><td>${totals.net.toFixed(3)}</td><td></td><td>₹ ${totals.value.toLocaleString()}</td></tr>
              </tfoot>
            </table>
          </div>

          <div class="v-summary-grid">
            <div class="v-summary-card"><div class="v-summary-label">एकूण वजन / Total Weight</div><div class="v-summary-value">${totals.net.toFixed(3)} g</div></div>
            <div class="v-summary-card"><div class="v-summary-label">एकूण किंमत / Total Value</div><div class="v-summary-value">₹ ${totals.value.toLocaleString()}</div></div>
            <div class="v-summary-card"><div class="v-summary-label">पात्र कर्ज / Eligible Loan</div><div class="v-summary-value">₹ ${record.loanSummary?.loanSanction || ''}</div></div>
          </div>

          <div class="v-declaration-box">
             <div class="v-decl-title">► घोषणापत्र / DECLARATION</div>
             <div class="v-decl-text">वरील दागिन्यांचे प्रत्यक्ष पाहणी करून योग्य प्रमाणात मूल्यांकन करण्यात आले आहे.</div>
             <div class="v-decl-en" style="font-size: 10px; color: #777; margin-top: 4px; font-weight: 400;">The above ornaments have been physically inspected and valued at appropriate market rates.</div>
          </div>

          <div class="v-section-title"><span class="v-section-text">सह्या / Signatures</span></div>
          <div class="v-sig-grid">
            <div class="v-sig-box">
               <span class="v-sig-label" style="font-size: 13px;">कर्जदाराची सही / BORROWER'S SIGNATURE</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub" style="font-size: 9px; color: #666; text-align: center; margin-top: 4px;">नाव व दिनांक / Name & Date</div>
            </div>
            <div class="v-sig-box">
               <span class="v-sig-label" style="font-size: 13px;">मूल्यांकनकर्ता सही / VALUER'S SIGNATURE</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub" style="font-size: 9px; color: #666; text-align: center; margin-top: 4px;">नाव, पदनाम व सील / Name, Designation & Seal</div>
            </div>
            <div class="v-sig-box">
               <span class="v-sig-label" style="font-size: 13px;">दागिने नेणारा अधिकारी / CUSTODIAN OFFICER</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub" style="font-size: 9px; color: #666; text-align: center; margin-top: 4px;">नाव, पदनाम व सील / Name, Designation & Seal</div>
            </div>
            <div class="v-sig-box">
               <span class="v-sig-label" style="font-size: 13px;">शाखा अधिकाऱ्याची सही / BRANCH MANAGER</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub" style="font-size: 9px; color: #666; text-align: center; margin-top: 4px;">नाव, पदनाम व सील / Name, Designation & Seal</div>
            </div>
          </div>
        </div>
        <div class="v-footer">
          <div>AVS AI360 System Generated Document</div>
          <div class="v-foot-conf">Confidential Document</div>
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `Valuation_Form_${record.basic?.customerName || 'Gold_Loan'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Gold Loan Print Options</h1>
          <p style={{ color: '#64748b' }}>Select the specific document you wish to generate</p>
        </div>
        <button
          onClick={() => navigate('/gold-loan')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0',
            color: '#475569', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} /> Back to Loans
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: '1 / -1', flexDirection: 'column', gap: '15px' }}>
            <Loader2 className="spinner" size={32} style={{ color: 'var(--gl-navy)' }} />
            <span style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 500 }}>{loading === 'images' ? 'Fetching high-resolution images...' : 'Loading application details...'}</span>
          </div>
        ) : options.map(opt => (
          <div
            key={opt.id}
            onClick={async () => {
              if (!loanData) {
                showToast('Application data is missing', 'error');
                return;
              }

              // Lazy load images if needed
              if (['app', 'appraisal', 'sanction'].includes(opt.id) && loanData.hasImages && !loanData.imagesFetched) {
                setLoading('images');
                try {
                  const res = await fetch(`${API_BASE_URL}/GoldLoan/${loanData.id}`, {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
                  });
                  if (!res.ok) throw new Error('Failed to fetch data');
                  const fullData = await res.json();
                  setLoanData(fullData);
                  
                  if (opt.id === 'app') navigate('/gold-loan-application-print', { state: fullData });
                  else if (opt.id === 'appraisal') navigate(`/gold-loan-appraisal-print/${loanData.id}`, { state: fullData });
                  else if (opt.id === 'sanction') navigate(`/gold-loan-sanction-print/${loanData.id}`, { state: fullData });
                } catch (err) {
                  showToast(err.message, 'error');
                } finally {
                  setLoading(false);
                }
                return;
              }

              if (opt.id === 'app') {
                navigate('/gold-loan-application-print', { state: loanData });
              } else if (opt.id === 'sanction') {
                navigate(`/gold-loan-sanction-print/${loanData.id}`, { state: loanData });
              } else if (opt.id === 'appraisal') {
                navigate(`/gold-loan-appraisal-print/${loanData.id}`, { state: loanData });
              } else if (opt.id === 'closure') {
                navigate(`/gold-loan-closure-print/${loanData.id}`, { state: loanData });
              } else if (opt.id === 'valuation') {
                handleValuationDownload(loanData);
              } else {
                showToast(`${opt.label} coming soon`, 'info');
              }
            }}
            style={{
              background: 'white', padding: '20px', borderRadius: '16px',
              border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.3s ease',
              display: 'flex', alignItems: 'center', gap: '20px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.borderColor = opt.color;
              e.currentTarget.style.boxShadow = `0 10px 15px -3px ${opt.color}15`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '12px',
              background: `${opt.color}15`, color: opt.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {opt.icon}
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>{opt.label}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>{opt.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
