import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GoldLoanPrintMaster from './GoldLoanPrintMaster';
import API_BASE_URL from '../../config';
import DattasevaLogo from '../../assets/Dattaseva logo.jpeg';

/* ──────────────────────────────────────────────────────────────────────────
   CSS FOR PRECISE A4 PRINT OUTPUT
   ────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Marathi:wght@400;700;900&family=Outfit:wght@400;600;700;800&display=swap');

  .appraisal-note-container {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 20px 0;
    font-family: 'Noto Sans Marathi', sans-serif;
    color: #000;
  }

  .page {
    width: 210mm;
    min-height: 296mm;
    background: #fff;
    margin: 10px auto;
    padding: 10mm 15mm;
    position: relative;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    page-break-after: always;
    overflow: hidden;
  }

  .text-marathi { font-family: 'Noto Sans Marathi', sans-serif; }
  .bold { font-weight: 700; }
  .extra-bold { font-weight: 900; }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 5px 0;
  }
  
  th, td {
    border: 1px solid #000;
    padding: 2px 4px;
    text-align: center;
    font-size: 11px;
  }

  th { font-weight: 900; background: none; }

  .no-print {
    @media print { display: none !important; }
  }

  @media print {
    body { background: none; margin: 0; padding: 0; }
    .appraisal-note-container { background: none; padding: 0; }
    .page { margin: 0; box-shadow: none; width: 100%; height: 100%; padding: 10mm 15mm; }
    @page { size: A4; margin: 0; }
  }

  .legal-block {
    font-size: 11px;
    line-height: 1.4;
    text-align: justify;
    margin: 10px 0;
  }

  .header-underline {
    display: inline-block;
    border-bottom: 1px solid #777;
    min-width: 60px;
    padding: 0 5px;
    font-weight: 700;
  }
`;

const numberToWords = (amount) => {
  if (!amount || isNaN(amount)) return '';
  const a = ['', 'ONE ', 'TWO ', 'THREE ', 'FOUR ', 'FIVE ', 'SIX ', 'SEVEN ', 'EIGHT ', 'NINE ', 'TEN ', 'ELEVEN ', 'TWELVE ', 'THIRTEEN ', 'FOURTEEN ', 'FIFTEEN ', 'SIXTEEN ', 'SEVENTEEN ', 'EIGHTEEN ', 'NINETEEN '];
  const b = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const inWords = (num) => {
    if ((num = num.toString()).length > 9) return 'OVERFLOW';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'CRORE ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'LAKH ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'THOUSAND ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'HUNDRED ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'AND ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str;
  };
  return (inWords(Math.floor(amount)) + ' RUPEES ONLY').toUpperCase();
};

export default function GoldLoanAppraisalNote() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: idParam } = useParams();
  const loanId = idParam || location.state?.id;

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const { clientInfo } = useApp();

  React.useEffect(() => {
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

        // Normalize
        const normalized = {
          ...raw,
          ...(raw.basic || {}),
          ...(raw.loanSummary || {}),
          customerPhoto: raw.customerPhoto
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

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading technical appraisal data...</div>;

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No loan record found in database</h2>
        <button onClick={() => navigate('/loans')} style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}>Back to Loans</button>
      </div>
    );
  }

  // Helper to calculate default repayment date (1 year from sanction date)
  const getRepaymentDate = () => {
    if (data.repaymentDate) return data.repaymentDate;
    if (data.sanctionDate) {
      try {
        const parts = data.sanctionDate.split('-');
        if (parts.length === 3) return `${parseInt(parts[0]) + 1}-${parts[1]}-${parts[2]}`;
      } catch (e) { }
    }
    return '';
  };

  const appraisalData = {
    branding: clientInfo?.name || '',
    branch: data.branch || '',
    customerName: data.customerName || '',
    address: data.address || '',
    mobile: data.mobileNo || '',
    aadharNo: data.aadhaarNo || '',
    panNo: data.panNo || '',
    age: data.age || '',
    applicationDate: data.sanctionDate || '',
    repaymentDate: getRepaymentDate(),
    memberNo: data.id,
    loanNo: data.applicationNo || '',
    bagNo: data.goldBagNo || '',
    ornaments: data.ornaments || [],
    loanReqAmount: data.loanLimit || data.loanSanction || '',
    loanSanction: data.loanSanction || '',
    goldImage: data.goldImages && data.goldImages.length > 0 ? data.goldImages[0] : null,
    goldBagImage: data.goldBagImages && data.goldBagImages.length > 0 ? data.goldBagImages[0] : null,
    customerPhoto: data.customerPhoto,
    valuerReceiptNo: data.valuerReceiptNo || '',
    tenure: data.tenure || ''
  };

  return (
    <GoldLoanPrintMaster title="Appraisal Note">
      <style>{GLOBAL_CSS}</style>

      <div className="print-area">
        <AppraisalPage data={appraisalData} clientInfo={clientInfo} />
        <DeclarationPage branding={appraisalData.branding} />
      </div>
    </GoldLoanPrintMaster>
  );
}

const AppraisalPage = ({ data, clientInfo }) => {
  const branding = data.branding;
  const branch = data.branch;

  return (
    <div className="page text-marathi">
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px', marginBottom: '8px' }}>
          {clientInfo?.logoUrl ? (
            <img src={clientInfo.logoUrl} alt="Logo" style={{ height: '80px', width: 'auto', padding: '4px' }} />
          ) : (
            branding.toUpperCase().includes("DATTASEVA") && (
              <img src={DattasevaLogo} alt="Logo" style={{ height: '80px', width: 'auto', padding: '4px' }} />
            )
          )}
          <h1 className="extra-bold" style={{
            fontSize: '20px',
            color: '#000',
            margin: 0,
            marginLeft: '10px',
            textAlign: 'left',
            lineHeight: '1.2',
            letterSpacing: '0.5px',
            fontFamily: "'Outfit', sans-serif"
          }}>
            {branding.toUpperCase()}
          </h1>
        </div>
        <h2 className="extra-bold" style={{ fontSize: '15px', textDecoration: 'underline', margin: 0, textDecorationThickness: '1.5px', textUnderlineOffset: '3px' }}>Appraisal Note - For Gold Ornaments</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>
          <span>Print DateTime : {new Date().toLocaleDateString('en-GB')}</span>
        </div>
      </div>

      {/* METADATA BLOCK 1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '2px 0' }}>नोंदणी क्र. : <span className="header-underline"></span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; GSTIN : <span className="header-underline" style={{ minWidth: '120px' }}></span></p>
          <p style={{ margin: '2px 0' }}>रिजन : <span className="header-underline"></span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; शाखा / सोने तारण कक्ष : <span className="bold">{branch}</span></p>
        </div>
        <div style={{ width: '180px', fontSize: '11px', lineHeight: 1.3 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 10px auto' }}>
            <span>वय</span> <span>:</span> <span className="bold">{data.age} {data.age ? 'वर्ष' : ''}</span>
            <span>तारीख</span> <span>:</span> <span className="bold">{data.applicationDate}</span>
          </div>
        </div>
      </div>

      {/* METADATA BLOCK 2 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '10px' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '2px 0' }}>ब्रांच ई-मेल : <span className="header-underline" style={{ minWidth: '120px' }}></span> &nbsp;&nbsp;&nbsp; वेबसाइट : <span className="header-underline" style={{ minWidth: '150px' }}></span></p>
          <p style={{ margin: '2px 0' }}>अर्जदाराचे नाव :- <span className="bold">{data.customerName}</span></p>
          <p style={{ margin: '2px 0' }}>पत्ता : <span className="bold">{data.address}</span></p>
          <p style={{ margin: '2px 0' }}>फोन / मोबा.नं.(व्हट्स अॅप नं.) :- <span className="bold">{data.mobile}</span> &nbsp;&nbsp;&nbsp; आधार / पॅन क्र. : <span className="bold">{data.aadharNo} / {data.panNo}</span></p>
          <p style={{ margin: '2px 0' }}>ग्राहक ई-मेल : <span className="header-underline" style={{ minWidth: '120px' }}></span></p>
          <p style={{ margin: '2px 0' }}>कर्ज खाते नंबर : <span className="bold">{data.loanNo}</span></p>
        </div>
        <div style={{ width: '180px', fontSize: '11px', lineHeight: 1.3 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 10px auto' }}>
            <span>व्यवसाय</span> <span>:</span> <span className="bold"></span>
            <span>कर्ज दिल्यााची तारीख</span> <span>:</span> <span className="bold">{data.applicationDate}</span>
            <span>सभासद नं</span> <span>:</span> <span className="bold">{data.memberNo}</span>
            <span>सोनेतारण नं</span> <span>:</span> <span className="bold">{data.loanNo}</span>
            <span>बॅग नं .</span> <span>:</span> <span className="bold">{data.bagNo}</span>
          </div>
        </div>
      </div>

      {/* ORNAMENT TABLE */}
      <table style={{ marginTop: '10px' }}>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>प्रकार सोने / चांदी</th>
            <th style={{ width: '18%' }}>दागिन्यााचे वर्णन</th>
            <th style={{ width: '8%' }}>दागिने नग</th>
            <th style={{ width: '10%' }}>ग्रॉस वजन</th>
            <th style={{ width: '12%' }}>Deduction Stone</th>
            <th style={{ width: '10%' }}>नेट वजन</th>
            <th style={{ width: '12%' }}>किंमत अदमासे रुपये</th>
            <th style={{ width: '10%' }}>किती कर्ज पाहिजे रुपये</th>
            <th style={{ width: '10%' }}>कर्ज फेडण्याची तारीख</th>
          </tr>
        </thead>
        <tbody>
          {(data.ornaments.length > 0 ? data.ornaments : Array(2).fill({})).map((item, idx) => {
            const gross = parseFloat(item.grossWt) || 0;
            const net = parseFloat(item.netWt) || 0;
            const stone = (gross - net).toFixed(2);
            return (
              <tr key={idx} style={{ height: '24px' }}>
                <td>{item.particular ? 'Gold' : ''}</td>
                <td style={{ textAlign: 'left', paddingLeft: '5px' }}>{item.particular || ''}</td>
                <td>{item.qty || ''}</td>
                <td>{item.grossWt || ''}</td>
                <td>{item.particular ? stone : ''}</td>
                <td>{item.netWt || ''}</td>
                <td>{item.valuerPrice || ''}</td>
                <td>{idx === 0 ? (data.loanReqAmount) : ''}</td>
                <td>{idx === 0 ? (data.repaymentDate) : ''}</td>
              </tr>
            );
          })}
          <tr className="extra-bold">
            <td style={{ borderRight: 'none' }}></td>
            <td style={{ textAlign: 'right', paddingRight: '15px', borderLeft: 'none' }}>Total :</td>
            <td>{data.ornaments.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0) || ''}</td>
            <td>{data.ornaments.reduce((acc, curr) => acc + (Number(curr.grossWt) || 0), 0).toFixed(2) || ''}</td>
            <td></td>
            <td>{data.ornaments.reduce((acc, curr) => acc + (Number(curr.netWt) || 0), 0).toFixed(2) || ''}</td>
            <td>{data.ornaments.reduce((acc, curr) => acc + (Number(curr.valuerPrice) || 0), 0).toFixed(2) || ''}</td>
            <td>{data.loanReqAmount}</td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* 6. Receipt Confirmation */}
      <div style={{ border: '1px solid #000', borderTop: 'none', padding: '5px 10px', fontSize: '11px', textAlign: 'left' }}>
        I hereby confirm the receipt of gold ornament as described above and certify that weights and purity of gold mentioned above are provided & verified by me and correctly mentioned. I confirm the ornaments are packed and sealed in my presence.
      </div>

      {/* PHOTOS SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', gap: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '130px', height: '110px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', background: '#f8fafc' }}>
            {data.customerPhoto ? (
              <img src={data.customerPhoto} alt="Customer" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span className="bold" style={{ fontSize: '10px' }}>Customer Photo</span>
            )}
          </div>
          <div style={{ fontSize: '9px', marginTop: '4px' }}>Customer Photo</div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', height: '120px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', background: '#f8fafc' }}>
              {data.goldImage ? (
                <img src={data.goldImage} alt="Ornaments" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span className="bold" style={{ fontSize: '10px' }}>Ornaments Photo</span>
              )}
            </div>
            <div style={{ fontSize: '9px', marginTop: '4px' }}>Gold Ornaments Photo</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '180px', height: '120px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', background: '#f8fafc' }}>
              {data.goldBagImage ? (
                <img src={data.goldBagImage} alt="Gold Bag" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              ) : (
                <span className="bold" style={{ fontSize: '10px' }}>Gold Bag Photo</span>
              )}
            </div>
            <div style={{ fontSize: '9px', marginTop: '4px' }}>Gold Bag Photo</div>
          </div>
        </div>
      </div>

      {/* OFFICE USE SECTION */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <h3 className="extra-bold" style={{ fontSize: '16px', margin: '5px 0' }}>FOR BRANCH USE ONLY</h3>
        <p style={{ fontSize: '11px', margin: '5px 0', textAlign: 'left' }}>
          I hereby confirm that the above ornaments have been appraised in my presence and confirm the receipt of the gold ornaments from Valuer. Gold Ornaments as described in the table are packed and sealed in the Pouch. We confirm the receipt of Gold Pouch containing the Gold Ornaments for storage in dual custody Safe/Vault.
        </p>
        <table style={{ marginTop: '5px' }}>
          <thead>
            <tr>
              <th style={{ width: '25%' }}>DETAILS</th>
              <th style={{ width: '18%' }}>Clerk</th>
              <th style={{ width: '18%' }}>Officer</th>
              <th style={{ width: '18%' }}>Br Manager</th>
              <th style={{ width: '21%' }}>Loan Amount(Rs)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: '30px' }}>
              <td className="bold">Name & Emp Id</td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ fontSize: '13px', fontWeight: 900, textAlign: 'right', paddingRight: '10px' }}>{data.loanSanction}</td>
            </tr>
            <tr style={{ height: '30px' }}>
              <td className="bold">Signature</td>
              <td></td>
              <td></td>
              <td></td>
              <td style={{ borderBottom: 'none' }}></td>
            </tr>
            <tr style={{ border: 'none' }}>
              <td colSpan="4" style={{ border: 'none' }}></td>
              <td style={{ border: 'none', textAlign: 'left', fontWeight: 900, paddingTop: '5px' }}>Branch Seal</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* DPN SECTION */}
      <div style={{ textAlign: 'center', margin: '15px 0 5px 0' }}>
        <h3 className="extra-bold" style={{ fontSize: '16px', margin: 0 }}>DEMAND PROMISSORY NOTE</h3>
      </div>
      <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span>Rate Of Interest : <span className="bold">{data.interestRate ? `${data.interestRate}%` : <span className="header-underline"></span>}</span></span>
        <span style={{ textAlign: 'right' }}>Sanction Date : <span className="bold">{data.applicationDate}</span></span>
      </div>
      <div style={{ fontSize: '12px', marginBottom: '5px' }}>Amount Rs: <span className="bold">{data.loanSanction}</span></div>

      <p className="legal-block" style={{ margin: '5px 0' }}>
        A gold loan or a loan against gold is a secured loan that customers can avail from {branding} in lieu of gold ornaments like gold jewellery. It is the easiest way to fulfill your financial needs and proves to be a sensible alternative to availing loans from banking channels. ON DEMAND. I promise to pay to {branding.toUpperCase()} ("Lender") or order the sum of Rs. {data.loanSanction} (Rupees <span className="bold">{numberToWords(data.loanSanction)}</span>) with interest from the date hereof, at {data.interestRate ? `${data.interestRate}%` : <span className="header-underline"></span>} per annum or such other rate, the lender may fix from time to time, compounding and payable with daily/monthly/quarterly rests, for value received. I have fully understood the terms and conditions relating to the loan and I have received the loan amount.
      </p>
    </div>
  );
};

const DeclarationPage = ({ branding }) => (
  <div className="page text-marathi" style={{ fontSize: '12.5px', lineHeight: 1.6 }}>
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <h2 className="extra-bold" style={{ fontSize: '22px', margin: 0 }}>CUSTOMER DECLARATION</h2>
    </div>

    <div style={{ textAlign: 'justify' }}>
      <p style={{ margin: '8px 0' }}>1. I have applied for Gold loan from {branding} and would like to hereby declare and confirm that my/our title to the gold Jewellery/Ornaments deposited / to be deposited by me as security is not defective /Challenge by any person in any manner. I also confirm that the gold jewellery/ornaments is not spurious or of inferior quality as it has been acquired (purchased/gifted/inherited) by me from genuine sources and is my bona fide property and no other person has any claim, lien charge against it. I could not provide the necessary documents in support of my security (herein referred as gold loan ornaments).</p>
      <p style={{ margin: '8px 0' }}>2. I declare that nomination person to whom in the event of my death, the Gold Security pledged and in the custody of the society, may be returned by the Society upon payment of outstanding amount in full. I confirm that this nomination shall override any other disposition made by me, whether testamentary or otherwise and the Nominee shall become entitled to the return of the Gold Security pledged and in the Custody of the Society against payment of all outstanding to the Society to the exclusion of all other person. I further confirm that on such return the society shall stand released and discharged.</p>
      <p style={{ margin: '8px 0' }}>3. I agree that the Society shall be entitled to conduct investigation, inspection and/or audit of/in connection with the quality, purity, value of Gold Security in the manner deemed fit by Society (collectively, "Audit"), at my cost at any time till any Dues hereunder remain owed to the Society by me without notice to me and without my presence, including by opening packets and seals, if any, in which Gold Security is kept. The Society may in its absolute discretion, use services of and rely on the advice of any expert or valuer or assayer in this regard, and I hereby waive any objection I may have in that regard.</p>
      <p style={{ margin: '8px 0' }}>4. I consent to receive information/services etc. for marketing purpose through telephone/mobile/SMSs/Email by society and its agents.</p>
      <p style={{ margin: '8px 0' }}>5. I confirmed having received, read and understood the terms and conditions applicable to this loan accept hereby without notice the terms and conditions unconditionally and agree that this terms and conditions may be changed by the society at any time and will be bounded by amended terms and condition, All T&C of Loan agreement will be updated on the Society website from time to time.</p>
      <p style={{ margin: '8px 0' }}>6. I have understood the entire agreement constituting all clauses including the "Declaration cum Terms and Conditions of Loan Collateralized by Gold", which has been filled in my presence. I shall be bound to all the conditions including the details stated in the agreement. The legal documents have been explained to me in the language understood by me and I have understood the entire meaning of the various clauses stated in the legal documents.</p>
    </div>

  </div>
);