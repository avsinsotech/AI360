import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft, Loader2, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import html2pdf from 'html2pdf.js';

/* ──────────────────────────────────────────────────────────────────────────
   STRICT FORMAT CSS (Matches Image)
   ────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Marathi:wght@400;700;900&family=Outfit:wght@400;600;700;800&display=swap');

  .sanction-print-wrapper {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 20px 0;
    font-family: 'Noto Sans Marathi', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .sanction-page {
    width: 210mm;
    min-height: 296.5mm;
    background: #fff;
    padding: 15mm 20mm;
    position: relative;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    box-sizing: border-box;
    overflow: hidden;
    page-break-after: avoid;
  }

  .sanction-header {
    text-align: center;
    margin-bottom: 20px;
  }

  .bank-title {
    font-size: 28px;
    font-weight: 800;
    color: #0c4a6e;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  .sanction-subtitle {
    font-size: 18px;
    font-weight: 700;
    color: #eab308;
    margin-bottom: 30px;
  }

  .gold-divider {
    height: 3px;
    background-color: #eab308;
    width: 100%;
    margin-bottom: 40px;
  }

  .sanction-content {
    font-size: 16px;
    line-height: 1.8;
    color: #1e293b;
  }

  .section-title {
    font-size: 18px;
    font-weight: 800;
    color: #0c4a6e;
    margin-top: 30px;
    margin-bottom: 15px;
    display: block;
  }

  .detail-row {
    display: flex;
    margin-bottom: 10px;
  }

  .detail-label {
    min-width: 240px;
    font-weight: 500;
  }

  .detail-value {
    font-weight: 500;
    border-bottom: 1.5px solid #334155;
    flex-grow: 1;
    min-width: 100px;
    padding-left: 10px;
    height: 24px;
    line-height: 24px;
    color: #0c4a6e;
  }

  .doc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .doc-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .footer-thanks {
    text-align: center;
    color: #eab308;
    font-size: 20px;
    font-weight: 800;
    margin-top: 60px;
  }

  /* ── Master Toolbar ── */
  .no-print-toolbar {
    position: sticky;
    top: 0;
    z-index: 999;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    width: 100%;
    margin-bottom: 20px;
  }

  @media print {
    @page { size: A4; margin: 0; }
    body { background: white !important; }
    .sanction-print-wrapper { padding: 0 !important; background: white !important; }
    .sanction-page { box-shadow: none !important; width: 100% !important; margin: 0 !important; }
    .no-print { display: none !important; }
  }
`;

export default function VehicleLoanSanctionLetter() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { clientInfo, showToast } = useApp();
  const pageRef = useRef(null);

  const [data, setData] = useState(location.state);
  const [loading, setLoading] = useState(!location.state && id);

  useEffect(() => {
    if (!data && id) {
      const fetchLoan = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/vehicle-loan/${id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
          });
          if (!res.ok) throw new Error('Failed to fetch application data');
          const resp = await res.json();
          setData(resp.data);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchLoan();
    }
  }, [data, id, showToast]);
  
  const handlePrintPreview = () => {
    if (!pageRef.current) return;
    
    const element = pageRef.current;
    const opt = {
      margin: 0,
      filename: `Sanction_Letter_${data?.applicationNo || 'VL'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().from(element).set(opt).output('bloburl').then(url => {
      window.open(url, '_blank');
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '15px' }}>
        <Loader2 className="animate-spin" size={40} color="#0c4a6e" />
        <span style={{ fontSize: '1.1rem', color: '#64748b' }}>Loading Sanction Letter...</span>
      </div>
    );
  }

  if (!data) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ef4444' }}>Data not found.</div>;
  }

  // Formatting helpers
  const fmt = (val) => val ? val : '';
  const num = (val) => {
    if (!val) return '';
    const n = parseFloat(val);
    return isNaN(n) ? '' : n.toLocaleString('en-IN');
  };
  
  // Tenure in years calculation
  const getTenureYears = (months) => {
    if (!months) return '____';
    const m = parseInt(months);
    if (isNaN(m)) return '____';
    return Math.floor(m / 12) || m; // If less than a year, just show the number? Assuming years for display.
  };

  return (
    <div className="sanction-print-wrapper">
      <style>{GLOBAL_CSS}</style>
      
      {/* Action Toolbar (Standardized) */}
      <div className="no-print-toolbar no-print">
        <button 
          onClick={() => navigate(-1)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '8px 16px', background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '8px', color: '#475569', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button 
          onClick={handlePrintPreview}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            padding: '10px 24px', background: '#0c4a6e', border: 'none',
            borderRadius: '8px', color: 'white', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(12, 74, 110, 0.2)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Printer size={18} /> Print Letter
        </button>
      </div>

      <div className="sanction-page" ref={pageRef}>
        <header className="sanction-header">
          <h1 className="bank-title">{clientInfo?.name || 'बँकेचे नाव'}</h1>
          <div className="sanction-subtitle">
            वाहन कर्ज स्वीकृती पत्र | VEHICLE LOAN SANCTION LETTER
          </div>
        </header>

        <div className="gold-divider"></div>

        <article className="sanction-content">
          <p>प्रिय महोदय/महोदया,</p>
          <p style={{ marginBottom: '25px' }}>
            आपल्या वाहन कर्जाचा अर्ज सराव केल्यानंतर आम्ही खुशीने आपला अर्ज स्वीकृत केल्याची सूचना देतो.
          </p>

          <strong className="section-title">कर्ज तपशील (LOAN DETAILS):</strong>
          
          <div className="detail-row">
            <span className="detail-label">वाहन प्रकार (Vehicle Type):</span>
            <span className="detail-value">
              {fmt(data.NewVehicle?.VahanaPrakar || data.NewVehicle?.vahanaPrakar || 
                   data.OldVehicle?.VahanaPrakar || data.OldVehicle?.vahanaPrakar)}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">वाहन किंमत (Vehicle Price): ₹</span>
            <span className="detail-value">
              {num(data.NewVehicle?.Kimat || data.NewVehicle?.kimat || 
                   data.OldVehicle?.Kimat || data.OldVehicle?.kimat)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">मंजूर कर्ज रक्कम (Sanctioned Amount): ₹</span>
            <span className="detail-value">
              {num(data.KarjRakkam || data.karjRakkam)}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">वार्षिक व्याज दर (Interest Rate):</span>
            <span className="detail-value" style={{ flexGrow: 0, minWidth: '80px', textAlign: 'center' }}>
              {fmt(data.VyajDar || data.vyajDar)}
            </span>
            <span style={{ paddingLeft: '5px' }}>% p.a.</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">कर्ज मुदत (Tenure):</span>
            <span className="detail-value" style={{ flexGrow: 0, minWidth: '80px', textAlign: 'center' }}>
              {getTenureYears(data.ParatfedKalavadhi || data.paratfedKalavadhi)}
            </span>
            <span style={{ paddingLeft: '5px' }}>वर्ष (Maximum ७ वर्ष)</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">मासिक किस्त (EMI): ₹</span>
            <span className="detail-value">
              {num(data.PahilaHapta || data.pahilaHapta)}
            </span>
          </div>

          <strong className="section-title">आवश्यक कागदपत्र (REQUIRED DOCUMENTS):</strong>
          
          <ul className="doc-list">
            <li className="doc-item"><span>✓</span> <span>संपूर्ण वाहन कर्ज करार</span></li>
            <li className="doc-item"><span>✓</span> <span>वाहन इन्वॉईस आणि RC नकल</span></li>
            <li className="doc-item"><span>✓</span> <span>आधार/पॅन/ड्रायव्हिंग लायसेन्स</span></li>
            <li className="doc-item"><span>✓</span> <span>वेतन पत्र आणि बँक विवरण</span></li>
            <li className="doc-item"><span>✓</span> <span>CIBIL रिपोर्ट</span></li>
            <li className="doc-item"><span>✓</span> <span>वाहन बीमा पॉलिसी (Comprehensive)</span></li>
          </ul>

          <div className="footer-thanks">
            धन्यवाद!
          </div>
        </article>
      </div>
    </div>
  );
}
