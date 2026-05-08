import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GoldLoanPrintMaster from './GoldLoanPrintMaster';
import API_BASE_URL from '../../config';
import DattasevaLogo from '../../assets/Dattaseva logo.jpeg';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Inter:wght@400;600;700&family=Outfit:wght@400;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .receipt-wrapper {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 40px 0;
    font-family: 'Noto Sans Marathi', sans-serif;
  }

  .page {
    width: 210mm;
    min-height: 296mm;
    background: #fff;
    margin: 10px auto;
    padding: 7mm 12mm;
    position: relative;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    page-break-after: always;
    color: #111;
  }

  .text-marathi {
    font-family: 'Noto Sans Devanagari', sans-serif;
  }

  .bold { font-weight: 700; }
  .extra-bold { font-weight: 900; }
  
  .underline-field {
    border-bottom: 1px solid #000;
    display: inline-block;
    padding: 0 10px;
    font-weight: 700;
  }

  .line-field {
    border-bottom: 1px solid #000;
    flex: 1;
    margin-left: 10px;
    min-height: 25px;
    font-weight: 700;
    padding-left: 5px;
  }

  @media print {
    body { background: none; margin: 0; padding: 0; }
    .receipt-wrapper { background: none; padding: 0; }
    .page { margin: 0; box-shadow: none; width: 100%; height: 100%; }
    @page { size: A4; margin: 0; }
  }
`;

/* ─── Reusable Premium Header Component ───────────────────────────────────── */
const PremiumHeader = ({ clientInfo, institutionName, subTitle }) => (
  <div style={{ 
    marginBottom: '15px',
    backgroundColor: '#111827',
    border: '3px solid #C4A45B',
    color: 'white'
  }}>
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '25px', 
      padding: '15px 25px',
      borderBottom: '2px solid #C4A45B'
    }}>
      {/* Logo Container */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '110px',
        height: '110px'
      }}>
        {clientInfo?.logoUrl ? (
          <img src={clientInfo.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : institutionName.toUpperCase() === "दत्तसेवा सहकारी पतपेढी मर्यादित, मुंबई" || institutionName.toUpperCase() === "DATTASEVA SAHAKARI PATPEDHI MARYADIT.,MUMBAI" ? (
          <img src={DattasevaLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <div style={{ border: '2px solid #000', padding: '10px', fontSize: '12px', fontWeight: 700, textAlign: 'center', color: 'black' }}>LOGO</div>
        )}
      </div>

      {/* Institution Details */}
      <div style={{ flex: 1 }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 800, 
          margin: '0 0 8px 0', 
          letterSpacing: '0.8px',
          fontFamily: "'Outfit', sans-serif",
          color: '#FFFFFF'
        }}>
          {institutionName ? institutionName.toUpperCase() : 'DATTASEVA SAHAKARI PATPEDHI MARYADIT.,MUMBAI'}
        </h1>
        <div style={{ fontSize: '13px', lineHeight: 1.5, fontWeight: 500, color: '#FFFFFF' }}>
          <p style={{ margin: 0 }}>1/136, B.M.C Colany, Marve Road, Malavani, Malad West 400 095</p>
          <p style={{ margin: '4px 0 0 0' }}>
            <span className="bold">दूरध्वनी :</span> 8575854585 &nbsp; • &nbsp; <span className="bold">ईमेल:</span> dattaseva@gmail.com
          </p>
        </div>
      </div>
    </div>

    {/* Document Title Bar */}
    <div style={{ 
      backgroundColor: '#111827',
      padding: '10px 0',
      textAlign: 'center'
    }}>
      <h2 style={{ 
        fontSize: '16px', 
        fontWeight: 700, 
        margin: 0,
        color: '#FFFFFF',
        letterSpacing: '0.5px'
      }}>{subTitle}</h2>
    </div>
  </div>
);

const UnderlineText = ({ label, value, width = 'auto', flex = false }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '15px', flex: flex ? 1 : 'none' }}>
    <span style={{ fontSize: '18px', whiteSpace: 'nowrap' }}>{label}</span>
    <div className="line-field" style={{ minWidth: width }}>{value || '\u00A0'}</div>
  </div>
);

export default function GoldLoanClosureReceipt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: idParam } = useParams();
  const loanId = idParam || location.state?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clientInfo } = useApp();

  useEffect(() => {
    if (!loanId || isNaN(loanId)) {
      setLoading(false);
      return;
    }

    const fetchFreshData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/GoldLoan/${loanId}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch data');
        const raw = await res.json();
        const normalized = {
          ...raw,
          ...(raw.basic || {}),
          ...(raw.loanSummary || {}),
        };
        setData(normalized);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFreshData();
  }, [loanId]);

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading closure details...</div>;

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No evaluation data found</h2>
        <button onClick={() => navigate('/gold-loan')} style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}>Back to Loans</button>
      </div>
    );
  }

  const institutionName = clientInfo?.name || 'दत्तसेवा सहकारी पतपेढी मर्यादित, मुंबई';

  return (
    <GoldLoanPrintMaster title="Closure Receipt">
      <style>{GLOBAL_CSS}</style>
      <div className="receipt-wrapper">
        <div className="page text-marathi">
          {/* Premium Header */}
          <PremiumHeader clientInfo={clientInfo} institutionName={institutionName} subTitle="तारण सोने परत मिळाल्याची पावती" />

          {/* Details Grid */}
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
              <UnderlineText label="दिनांक :" value={new Date().toLocaleDateString('en-GB')} width="150px" />
              <UnderlineText label="शाखा :" value={data.branch} flex={true} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
              <UnderlineText label="कर्ज खाते क्र. :" value={data.applicationNo} flex={true} />
              <UnderlineText label="सदस्य क्र. :" value={data.id} width="150px" />
            </div>

            <div style={{ marginTop: '10px' }}>
              <UnderlineText label="कर्जदाराचे नाव :" value={data.customerName} flex={true} />
            </div>
          </div>

          {/* Section: Loan Details */}
          <div style={{ marginTop: '40px' }}>
            <p className="bold" style={{ fontSize: '20px', marginBottom: '20px' }}>कर्ज तपशील:</p>
            <div style={{ marginLeft: '10px' }}>
              <UnderlineText label="मंजूर कर्ज रक्कम : ₹" value={data.loanSanction} width="200px" />
              <UnderlineText label="एकूण भरलेली रक्कम : ₹" value={data.totalPaid || ''} width="200px" />
            </div>
          </div>

          {/* Section: Declaration */}
          <div style={{ marginTop: '50px' }}>
            <p className="bold" style={{ fontSize: '20px', marginBottom: '15px' }}>घोषणापत्र:</p>
            <p style={{ fontSize: '19px', lineHeight: '1.8', textAlign: 'justify', textIndent: '40px' }}>
              मी वरील कर्जाची संपूर्ण रक्कम भरून माझे तारण सोने आज रोजी सुरक्षित स्थितीत परत मिळाले आहे. याबाबत मला कोणतीही हरकत नाही.
            </p>
          </div>

          {/* Signature Section */}
          <div style={{ marginTop: '100px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>कर्जदाराची सही:</span>
                <div style={{ borderBottom: '1px solid #000', flex: 0.4, marginLeft: '15px', height: '25px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>कर्मचारी सही:</span>
                <div style={{ borderBottom: '1px solid #000', flex: 0.4, marginLeft: '15px', height: '25px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '18px', fontWeight: 700 }}>शाखा अधिकारी:</span>
                <div style={{ borderBottom: '1px solid #000', flex: 0.4, marginLeft: '15px', height: '25px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoldLoanPrintMaster>
  );
}
