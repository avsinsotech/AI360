import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import GoldLoanPrintMaster from './GoldLoanPrintMaster';
import API_BASE_URL from '../../config';
import DattasevaLogo from '../../assets/Dattaseva logo.jpeg';

/* ──────────────────────────────────────────────────────────────────────────
   CSS OVERRIDES FOR THE PRINT COMPONENT
   ────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Marathi:wght@400;700;900&family=Outfit:wght@400;600;700;800&display=swap');

  .sanction-print-wrapper {
    background-color: #f1f5f9;
    min-height: 100vh;
    padding: 40px 0;
    font-family: 'Noto Sans Marathi', 'Inter', sans-serif;
  }

  .page {
    width: 210mm;
    min-height: 296mm;
    background: #fff;
    margin: 10px auto;
    padding: 8mm 12mm;
    position: relative;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    page-break-after: always;
    overflow: hidden;
  }

  .text-marathi {
    font-family: 'Noto Sans Marathi', sans-serif;
  }

  .bold { font-weight: 700; }
  .extra-bold { font-weight: 900; }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
  }
  
  th, td {
    border: 1px solid #000;
    padding: 4px;
    text-align: center;
    font-size: 10px;
  }

  th {
    background-color: #f8fafc;
    font-weight: 900;
  }

  .no-print {
    @media print {
      display: none !important;
    }
  }

  @media print {
    body { background: none; margin: 0; padding: 0; }
    .sanction-print-wrapper { background: none; padding: 0; }
    .page { margin: 0; box-shadow: none; width: 100%; height: 100%; }
    @page { size: A4; margin: 0; }
  }
`;

const Underline = ({ value, minWidth = '50px' }) => (
  <span style={{
    display: 'inline-block',
    borderBottom: '1px solid #333',
    minWidth: minWidth,
    textAlign: 'center',
    fontWeight: '700',
    padding: '0 5px'
  }}>
    {value || '\u00A0'}
  </span>
);

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

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1 — SANCTION LETTER CUMS GOLD PLEDGE RECEIPT
   ══════════════════════════════════════════════════════════════════════════ */
const ReceiptPage = ({ data, clientInfo }) => {
  const brandingName = clientInfo?.name || '';
  const bankName = clientInfo?.name || '';
  const branchName = data.branch || '';

  return (
    <div className="page text-marathi">
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0px', marginBottom: '8px' }}>
          {clientInfo?.logoUrl ? (
            <img src={clientInfo.logoUrl} alt="Logo" style={{ height: '80px', width: 'auto', padding: '4px' }} />
          ) : (
            brandingName.toUpperCase().includes("DATTASEVA") && (
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
            {bankName.toUpperCase()}
          </h1>
        </div>
        <h2 className="extra-bold" style={{ fontSize: '15px', textDecoration: 'underline', margin: 0, textDecorationThickness: '1.5px', textUnderlineOffset: '3px' }}>Sanction Letter Cums Gold Pledge Receipt</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, textAlign: 'right' }}>
          <span>Print DateTime : {new Date().toLocaleString()}</span>
        </div>
      </div>



      {/* Info Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', lineHeight: 1.4 }}>
        <div style={{ flex: 1 }}>
          <p>नोंदणी क्र. : <Underline value="" minWidth="80px" /></p>
          <p>रिजन : <Underline value="" minWidth="80px" /> &nbsp; GSTIN : <Underline value="" minWidth="120px" /></p>
          <p>शाखा / सोने तारण कक्ष : <span className="bold">{branchName}</span></p>

          <div style={{ marginTop: '5px' }}>
            <p>ब्रांच ई-मेल : <Underline value="" minWidth="150px" /> &nbsp; वेबसाइट : <Underline value="" minWidth="150px" /></p>
            <p>अर्जदाराचे नाव :- <span className="bold">{data.customerName}</span></p>
            <p>पत्ता : <span className="bold">{data.address}</span></p>
            <p>फोन / मोबा.नं.(व्हट्स अॅप नं.) :- <span className="bold">{data.mobileNo}</span> &nbsp; आधार / पॅन क्र.<span className="bold">{data.aadhaarNo} / {data.panNo}</span></p>
            <p>ग्राहक ई-मेल : <Underline value="" minWidth="200px" /></p>
            <p>कर्ज खाते नंबर : <span className="bold">{data.applicationNo}</span> &nbsp; पेमेंट मोड : <Underline value="Transfer" minWidth="80px" /></p>
          </div>
        </div>

        <div style={{ width: '220px', borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 10px auto', rowGap: '2px' }}>
            <span>Print DateTime</span> <span>:</span> <span className="bold">{new Date().toLocaleString()}</span>
            <span>वय</span> <span>:</span> <span className="bold">{data.age} {data.age ? 'वर्ष' : ''}</span>
            <span>तारीख</span> <span>:</span> <span className="bold">{data.sanctionDate}</span>
            <span>व्यवसाय</span> <span>:</span> <span className="bold"></span>
            <span>कर्ज दिल्यााची तारीख</span> <span>:</span> <span className="bold">{data.sanctionDate}</span>
            <span>सभासद नं</span> <span>:</span> <span className="bold">{data.id}</span>
            <span>सोनेतारण नं</span> <span>:</span> <span className="bold">{data.applicationNo}</span>
            <span>बॅग नं .</span> <span>:</span> <span className="bold">{data.goldBagNo}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <table style={{ marginTop: '15px' }}>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>प्रकार सोने / चांदी</th>
            <th style={{ width: '25%' }}>दागिन्यााचे वर्णन</th>
            <th style={{ width: '8%' }}>दागिने नग</th>
            <th style={{ width: '10%' }}>ग्रॉस वजन</th>
            <th style={{ width: '10%' }}>Deduction Stone</th>
            <th style={{ width: '10%' }}>नेट वजन</th>
            <th style={{ width: '12%' }}>किंमत अदमासे रुपये</th>
            <th style={{ width: '10%' }}>किती कर्ज पाहिजे रुपये</th>
            <th style={{ width: '10%' }}>कर्ज फेडण्याची तारीख</th>
          </tr>
        </thead>
        <tbody>
          {(data.ornaments && data.ornaments.length > 0 ? data.ornaments : Array(4).fill({})).map((item, idx) => {
            const gross = parseFloat(item.grossWt) || 0;
            const net = parseFloat(item.netWt) || 0;
            const stone = (gross - net).toFixed(2);
            return (
              <tr key={idx} style={{ height: '22px' }}>
                <td>{item.particular ? 'Gold' : ''}</td>
                <td style={{ textAlign: 'left', paddingLeft: '8px' }}>{item.particular || ''}</td>
                <td>{item.qty || ''}</td>
                <td>{item.grossWt || ''}</td>
                <td>{item.particular ? stone : ''}</td>
                <td>{item.netWt || ''}</td>
                <td>{item.valuerPrice || ''}</td>
                {idx === 0 && <td rowSpan="5" className="extra-bold">{data.loanSanction}</td>}
                {idx === 0 && <td rowSpan="5" className="extra-bold">{data.repaymentDate}</td>}
              </tr>
            );
          })}
          <tr className="bold" style={{ background: '#f8fafc' }}>
            <td colSpan="2" style={{ textAlign: 'right', paddingRight: '15px' }}>Total :</td>
            <td>{data.ornaments?.reduce((acc, curr) => acc + (Number(curr.qty) || 0), 0) || ''}</td>
            <td>{data.ornaments?.reduce((acc, curr) => acc + (Number(curr.grossWt) || 0), 0).toFixed(2) || ''}</td>
            <td>{(data.ornaments?.reduce((acc, curr) => acc + (Number(curr.grossWt) || 0), 0) - data.ornaments?.reduce((acc, curr) => acc + (Number(curr.netWt) || 0), 0)).toFixed(2) || ''}</td>
            <td>{data.ornaments?.reduce((acc, curr) => acc + (Number(curr.netWt) || 0), 0).toFixed(2) || ''}</td>
            <td>{data.ornaments?.reduce((acc, curr) => acc + (Number(curr.valuerPrice) || 0), 0) || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* Photo Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px 0', gap: '10px' }}>
        <div style={{ width: '140px', height: '120px', border: '1px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px', background: '#f8fafc' }}>
          {data.customerPhoto ? (
            <img src={data.customerPhoto} alt="Customer" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '10px', fontWeight: 900 }}>Customer Photo</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ width: '180px', height: '120px', border: '1px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            {data.goldImages && data.goldImages.length > 0 ? (
              <img src={data.goldImages[0]} alt="Gold" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '10px', fontWeight: 900 }}>Ornaments Photo</span>
            )}
          </div>
          <div style={{ width: '180px', height: '120px', border: '1px solid #000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
            {data.goldBagImages && data.goldBagImages.length > 0 ? (
              <img src={data.goldBagImages[0]} alt="Bag" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '10px', fontWeight: 900 }}>Gold Bag Photo</span>
            )}
          </div>
        </div>
      </div>

      {/* Charges & Footer Grid */}
      <div style={{ border: '1.5px solid #000' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1fr 1fr', borderBottom: '1px solid #000' }}>
          <div style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 900, fontSize: '11px' }}>Total Loan: Rs. {data.loanSanction}</div>
          <div style={{ padding: '4px', borderRight: '1px solid #000', fontSize: '9px', fontWeight: 700 }}>In Words: {numberToWords(data.loanSanction)}</div>
          <div style={{ padding: '4px' }}></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #000', fontSize: '10px' }}>
          <div style={{ padding: '4px', borderRight: '1px solid #000' }}>Interest Rate &nbsp; <span className="bold">{data.interestRate ? `${data.interestRate}%` : <span className="header-underline"></span>}</span></div>
          <div style={{ padding: '4px', borderRight: '1px solid #000' }}>Loan Amount &nbsp; <span className="bold">{data.loanSanction}</span></div>
          <div style={{ padding: '4px' }}>Eligible Amount &nbsp; <span className="bold">{data.loanLimit}</span></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', borderBottom: '1px solid #000', fontSize: '10px' }}>
          <div style={{ padding: '4px', borderRight: '1px solid #000' }}>Applicable charges(Inc GST 18%)</div>
          <div style={{ padding: '4px' }}>Signature of the Borrower</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #000', fontSize: '9px', background: '#f8fafc' }}>
          <div style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 700 }}>Token / Service</div>
          <div style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 700 }}>CAC Service</div>
          <div style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 700 }}>Security Charges</div>
          <div style={{ padding: '4px', borderRight: '1px solid #000', fontWeight: 700 }}>Stamp Duty</div>
          <div style={{ padding: '4px', fontWeight: 700 }}>Others</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px solid #000', height: '25px' }}>
          <div style={{ borderRight: '1px solid #000' }}></div>
          <div style={{ borderRight: '1px solid #000' }}></div>
          <div style={{ borderRight: '1px solid #000' }}></div>
          <div style={{ borderRight: '1px solid #000' }}></div>
          <div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', fontSize: '9px' }}>
          <div style={{ padding: '6px', borderRight: '1px solid #000', textAlign: 'justify', lineHeight: 1.3 }}>
            I acknowledge having recieved the detailed terms and conditions relating the above gold loan sanction and send to me through web link to my registered mobile number and I confirm having agreed to same and signed digitally through an Otp
          </div>
          <div style={{ padding: '6px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', fontWeight: 900 }}>
            Branch Seal & Manager Signature
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 2 — TERMS & CONDITIONS
   ══════════════════════════════════════════════════════════════════════════ */
const TermsPage = ({ data, branding }) => (
  <div className="page" style={{ fontSize: '11px', lineHeight: 1.6 }}>
    <div style={{ textAlign: 'center', marginBottom: '25px' }}>
      <h2 className="extra-bold" style={{ fontSize: '18px', margin: 0 }}>GOLD LOAN APPLICATION STANDARD TERMS & CONDITIONS</h2>
    </div>

    <div style={{ textAlign: 'justify' }}>
      <p>1. I have understood the entire agreement constituting all clauses including the "Declaration cum Terms and Conditions of Loan Collateralized by Gold", which has been filled in my presence. I shall be bound to all the conditions including the details stated in the agreement. The legal documents have been explained to me in the language understood by me and I have understood the entire meaning of the various clauses stated in the legal documents. I have affixed my thumb impression/signed in vernacular language after understanding the contents of the legal documents.</p>
      <p>2. I acknowledge that the Society shall have no liability for any consequences arising out of any erroneous details provided by me and I shall utilize the loan solely for the purpose stated in the Application form / Sanction Letter and will not be used for any speculative or anti-social purpose.</p>
      <p>3. All particulars information given in this application form are true and complete and no material information has been suppressed. withheld. I acknowledge that {branding} ("the Society") shall have no liability for any consequences arising out of any erroneous details provided by me/us for which I shall be solely liable. I authorize the Society to carry out such credit checks and at such time as it may deem necessary. The Society may sanction, at its sole discretion, loans of such amount as the Society may deem fit (Loan) for such purpose(s) as set out by me in the application form or as may be specified by Society in the sanction letters. The quantum of the Loan advanced to me shall be dependent on the internal policies of the Society which may charge from time to time. The amount of the Loan will be conveyed to me by and under sanction letters issued by the Society. I agree to abide by the terms and conditions of the sanction letter. The Loan along with interest, compound interest, default interest and such other charges as are may be payable by me to the Society are hereinafter collectively referred to as "Dues".</p>
      <p>4. I am the owner or several owners and am in possession of certain gold including in the form of jewellery ornaments ("Gold Security") over which I will create a first and exclusive charge by way of pledge in favour of the Society by depositing the same with the Society which shall remain deposited with the Society till any dues hereunder remain owed by me to the Society. I confirm (a) that my/our title to the Gold Security deposited / to be deposited by me as security is not defective, challenged by any person in any manner nor is it spurious or of inferior quality as it has been acquired by me from genuine sources, is genuine gold, is my bonafide property and no other person has any claim, lien or charge against it.</p>
      <p>5. In case the value of Gold Security falls lower than the required margin of the Society as applicable from time to time, whether pursuant to an Audit/Inspection (as defined hereinafter) or otherwise, without prejudice to the right to declare an Event of Default under Clause 22 hereof and or to right to sell the Gold Security and/or exercise any other rights or remedies available with the Society hereunder or under law, I shall within 7 (seven) days of a notice from the Society in this regard, at the Society's sole discretion, deposit with the Society, such additional security, as may be required.</p>
      <p>6) If it is discovered that there is any collusion between the appraiser and me resulting in a fraudulent and error valuation of gold ornaments, or in case the Society has a reasonable suspicion in this regard.</p>
      <p>7) If any attachment, distress, execution or other process against me or any of the security is enforced/levied upon.</p>
      <p>8) in the event of death, Insolvency, commission of an act of Bankruptcy of either of us.</p>
      <p>9) Any attempt by me without prior written consent of Society to create any charge, lien, mortgage or any encumbrance over the Gold/Gold ornaments.</p>
      <p>10) Upon the occurrence of an Event of Default, Society shall be entitled to sell the Gold Security in the open market after giving me a sufficient notice which I agree is a reasonable period for the purposes of Section 176 of the Indian Contract Act.</p>
      <p>11. The Society may take such other and further actions as it may deem necessary to realize the balance amount from me, in case of more than one borrower, I agree that our liability shall be joint and several.</p>
      <p>12. In case of my failure to repay the loan, I hereby authorize Society to publish my photographs and other details, in the print media under the title of a defaulter of loan, I am also aware that the right to publish the photograph shall solely be with Society. Society shall have the discretion to publish the photographs of all or selected defaulters.</p>
    </div>

    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <p className="bold">Place : <Underline value={data.branch} minWidth="100px" /></p>
        <p className="bold">Date : <Underline value={data.sanctionDate} minWidth="100px" /></p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p className="extra-bold" style={{ fontSize: '13px' }}>Borrower Signature</p>
        <div style={{ borderTop: '1px solid #000', width: '200px', marginTop: '40px' }}></div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function GoldLoanSanctionLetter() {
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

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading sanction details...</div>;

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No evaluation data found in database</h2>
        <button onClick={() => navigate('/loans')} style={{ padding: '8px 16px', marginTop: '10px', cursor: 'pointer' }}>Back to Loans</button>
      </div>
    );
  }

  return (
    <GoldLoanPrintMaster title="Sanction Letter">
      <style>{GLOBAL_CSS}</style>
      <div className="print-area">
        <ReceiptPage data={data} clientInfo={clientInfo} />
        <TermsPage data={data} branding={clientInfo?.name || ''} />
      </div>
    </GoldLoanPrintMaster>
  );
}