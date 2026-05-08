import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import GoldLoanPrintMaster from '../GoldLoanForm/GoldLoanPrintMaster';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';

const GLOBAL_CSS = `
  @media print {
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
    .sanction-print-wrapper {
        background: white !important;
        padding: 0 !important;
    }
    table {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        display: table !important;
    }
    .print-content-wrapper {
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        overflow: visible !important;
    }
  }

  .page {
    font-family: 'Hind', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1e293b;
    line-height: 1.6;
    background: white;
    width: 210mm;
    min-height: 297mm;
    margin: 20px auto;
    padding: 15mm 20mm;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    position: relative;
    box-sizing: border-box;
  }

  .text-marathi {
    font-family: 'Hind', sans-serif;
  }

  .blue-header {
    background: #1e3a8a;
    color: white;
    padding: 15px;
    text-align: center;
    font-weight: bold;
    font-size: 22px;
    border-radius: 4px 4px 0 0;
    margin-bottom: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .agreement-title {
    background: #1e3a8a;
    color: #f59e0b;
    padding: 5px 15px 15px 15px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    border-radius: 0 0 4px 4px;
    margin-bottom: 30px;
    width: 100%;
    box-sizing: border-box;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .section-title {
    font-weight: 800;
    font-size: 14px;
    color: #0f172a;
    margin-top: 20px;
    margin-bottom: 8px;
    text-decoration: underline;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legal-text {
    font-size: 13px;
    text-align: justify;
    margin-bottom: 12px;
    color: #334155;
  }

  .agreement-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    table-layout: fixed;
  }

  .agreement-table td {
    border: 1px solid #1e293b;
    padding: 8px 12px;
    font-size: 13px;
  }

  .agreement-table .label-cell {
    background: #f8fafc;
    font-weight: bold;
    width: 40%;
  }

  .signature-block {
    margin-top: 40px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .signature-item {
    border-top: 1px solid #1e293b;
    padding-top: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
  }

  .tick-item {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
    font-size: 13px;
    align-items: flex-start;
  }

  .tick-icon {
    color: #10b981;
    font-weight: bold;
  }
`;

export default function PersonalLoanAgreement() {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(location.state || null);
  const { clientInfo, showToast } = useApp();

  useEffect(() => {
    if (!data && id) {
      const fetchLoan = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/PersonalLoan/${id}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
          });
          if (!res.ok) throw new Error('Failed to fetch loan data');
          const result = await res.json();
          setData(result);
        } catch (err) {
          showToast(err.message, 'error');
        }
      };
      fetchLoan();
    }
  }, [id, data, showToast]);

  if (!data) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  const today = new Date().toLocaleDateString('mr-IN');
  const principal = data.karjRakkam ? Number(data.karjRakkam).toLocaleString('en-IN') : '________';

  return (
    <div className="sanction-print-wrapper">
      <GoldLoanPrintMaster title="Personal Loan Agreement">
        <div className="page text-marathi">
          <style>{GLOBAL_CSS}</style>

          {/* Header Banner */}
          <div className="blue-header">
            {clientInfo?.name || ""}
          </div>
          <div className="gold-line"></div>

          {/* Org Details Table - Shows Logged-in Bank Info */}
          

          {/* Document Title */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ color: '#1e3a8a', fontSize: '20px', margin: '0 0 5px 0', fontWeight: 'bold' }}>व्यक्तिगत कर्ज करार</h2>
            <h3 style={{ color: '#1e3a8a', fontSize: '16px', margin: 0, fontWeight: 'bold' }}>PERSONAL LOAN AGREEMENT</h3>
          </div>

          <div className="legal-text" style={{ fontWeight: 'bold' }}>
            यह समझौता (THIS AGREEMENT)
          </div>
          <div className="legal-text">
            एव्हीएस इनसोतेक प्राइवेट लिमिटेड ("ऋणदाता/बैंक") आणि <strong>{data.arjdarNaav || '____________________'}</strong> ("कर्जदार") यांच्यातील केले जाते.
          </div>

          <div className="section-title">प्रस्तावना (WHEREAS):</div>
          <div className="legal-text">
            १) ऋणदाता कर्जदारला व्यक्तिगत उद्देशांसाठी कर्ज देण्यास तयार आहे.<br />
            २) कर्जदार निर्देशित शर्तींवर हा कर्ज घेण्यास सहमत आहे.<br />
            ३) दोन्ही पक्ष या करारशीर्षस्थानीन परिभाषित शर्तींना बंधनकारक आहेत.
          </div>

          <div className="section-title">करार आणि शर्ती: (TERMS & CONDITIONS):</div>
          
          <div className="legal-text" style={{ fontWeight: 700 }}>१. कर्ज तपशील (LOAN DETAILS):</div>
          <table className="agreement-table">
            <tbody>
              <tr>
                <td className="label-cell">कर्ज मुख्यधन (Principal Amount)</td>
                <td>₹ {principal}</td>
              </tr>
              <tr>
                <td className="label-cell">व्याज दर (Rate of Interest)</td>
                <td>{data.vyajDar || '____'} % प्रति वर्ष (p.a.)</td>
              </tr>
              <tr>
                <td className="label-cell">मुद्दत (Tenure)</td>
                <td>{data.paratfedKalavadhi || '____'} महिने (Months)</td>
              </tr>
              <tr>
                <td className="label-cell">मासिक किस्त (EMI)</td>
                <td>₹ {data.pahilaHapta ? Number(data.pahilaHapta).toLocaleString('en-IN') : '________'} (Fixed/Floating)</td>
              </tr>
            </tbody>
          </table>

          <div className="legal-text" style={{ fontWeight: 700 }}>२. भुगतान अनुसूची (REPAYMENT SCHEDULE):</div>
          <div className="legal-text">
            अ) कर्जदार मासिक ₹ <strong>{data.pahilaHapta ? Number(data.pahilaHapta).toLocaleString('en-IN') : '________'}</strong> की किस्ती हर महीने की <strong>{data.tarikh || '1'}</strong> तारीख को ऋणदाता के बैंक खाते में जमा करेगा।<br />
            ब) किस्ती में व्याज और मुख्यधन दोनों सम्मिलित हैं।<br />
            क) किस्ती देर से दी गई तो प्रति माह 1% की दर से विलंब शुल्क लगेगा।
          </div>

          <div className="legal-text" style={{ fontWeight: 700 }}>३. कर्जदार के दायित्व (BORROWER'S OBLIGATIONS):</div>
          <div className="tick-item"><span className="tick-icon">✓</span> प्रत्येक महीने निर्धारित तारीख पर किस्तों का भुगतान करना।</div>
          <div className="tick-item"><span className="tick-icon">✓</span> सभी आवश्यक कर और अन्य कानूनी दायित्वों का पालन करना।</div>
          <div className="tick-item"><span className="tick-icon">✓</span> ऋणदाता को संपत्ति या व्यक्तिगत परिवर्तन की सूचना देना।</div>
          <div className="tick-item"><span className="tick-icon">✓</span> किस्तों में जीरो बैलेंस खाते को सक्रिय रखना।</div>

          <div className="legal-text" style={{ fontWeight: 700, marginTop: '15px' }}>४. ऋणदाता के अधिकार (LENDER'S RIGHTS):</div>
          <div className="tick-item"><span className="tick-icon">✓</span> किसी भी समय व्याज दर में परिवर्तन कर सकता है (30 दिन का नोटिस के साथ)।</div>
          <div className="tick-item"><span className="tick-icon">✓</span> किस्तों में देरी की स्थिति में कानूनी कार्रवाई कर सकता है।</div>
          <div className="tick-item"><span className="tick-icon">✓</span> तीन महीने की लगातार डिफॉल्ट पर कर्ज को तुरंत देय घोषित कर सकता है।</div>

          <div className="legal-text" style={{ fontWeight: 700, marginTop: '15px', pageBreakBefore: 'always', paddingTop: '10mm' }}>५. संपार्श्विक / सुरक्षा (COLLATERAL/SECURITY):</div>
          <div className="legal-text">
            यदि कर्ज की राशि ₹5 लाख से अधिक है, तो निम्नलिखित में से कोई सुरक्षा आवश्यक है:<br />
            - व्यक्तिगत गारंटी (Personal Guarantee)<br />
            - जमीन/संपत्ति बंधक (Property Mortgage)<br />
            - बीमा पॉलिसी (Insurance Policy)
          </div>

          <div className="legal-text" style={{ fontWeight: 700 }}>६. प्रस्फुटन अवधि (DISBURSEMENT):</div>
          <div className="legal-text">कर्ज राशि स्वीकृति के 5-7 कार्य दिवसों में कर्जदार के बैंक खाते में जमा की जाएगी।</div>

          <div className="legal-text" style={{ fontWeight: 700 }}>७. शर्तों का उल्लंघन (DEFAULT):</div>
          <div className="legal-text">यदि कर्जदार किसी भी शर्त का उल्लंघन करता है, तो ऋणदाता निम्नलिखित कदम उठा सकता है:</div>
          <div className="legal-text" style={{ paddingLeft: '20px' }}>
            - कानूनी नोटिस जारी करना<br />
            - संपत्ति को जब्त करना (यदि सुरक्षा हो)<br />
            - कानूनी कार्रवाई शुरू करना
          </div>

          <div className="legal-text" style={{ fontWeight: 700 }}>८. गोपनीयता (CONFIDENTIALITY):</div>
          <div className="legal-text">दोनों पक्ष इस करार की शर्तों को गोपनीय रखेंगे।</div>

          <div className="legal-text" style={{ fontWeight: 700 }}>९. लागू कानून (GOVERNING LAW):</div>
          <div className="legal-text">यह करार भारत के कानूनों द्वारा शासित होगा। सभी विवाद नवी मुंबई की अदालतों में सुलझाए जाएंगे।</div>

          {/* Signatures */}
          <div className="section-title">हस्ताक्षर (SIGNATURES):</div>
          
          <div className="signature-block">
            <div className="signature-item">
              कर्जदार / BORROWER<br /><br /><br />
              नाम व हस्ताक्षर / Name & Signature
            </div>
            <div className="signature-item">
              दिनांक / Date: ________________
            </div>
          </div>

          <div className="signature-block" style={{ marginTop: '20px' }}>
            <div className="signature-item">
              ऋणदाता / LENDER<br /><br /><br />
              नाम व हस्ताक्षर / Name & Signature
            </div>
            <div className="signature-item">
              दिनांक / Date: ________________
            </div>
          </div>

          <div className="legal-text" style={{ marginTop: '30px', fontWeight: 'bold' }}>गवाह (WITNESS):</div>
          <div style={{ fontSize: '12px' }}>
            गवाह १ / Witness 1: ________________________________________________________________<br /><br />
            गवाह २ / Witness 2: ________________________________________________________________
          </div>

        </div>
      </GoldLoanPrintMaster>
    </div>
  );
}
