import React, { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GoldLoanPrintMaster from './GoldLoanPrintMaster';
import { Page1MR, Page2MR, Page3MR, Page4MR, Page5MR, Page6MR, Page7MR, Page8MR, Page9MR, Page10MR } from './GoldLoanPrintMarathi';

/* ─── Global styles injected once ────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Arial', 'Inter', sans-serif;
    font-size: 13px;
    background: #f1f5f9;
    color: #000;
    line-height: 1.5;
  }

  .page {
    width: 216mm;
    min-height: 356mm;
    background: #fff;
    margin: 10px auto;
    padding: 10mm 15mm;
    position: relative;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    color: #000;
  }

  @page {
    size: legal;
    margin: 0;
  }

  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #000; padding: 6px; text-align: center; font-size: 12px; }
  th { font-weight: 700; background: #fff; }

  .underline {
    border-bottom: 1px solid #000;
    display: inline-block;
    min-width: 100px;
    padding: 0 5px;
    text-align: center;
    font-weight: 700;
  }

  .flex-row { display: flex; justify-content: space-between; align-items: center; }
  .bold { font-weight: 700; }
  .text-center { textAlign: center; }
  .text-right { textAlign: right; }
  .uppercase { text-transform: uppercase; }

  @media print {
    @page { size: legal; margin: 0; }
    body { background: white !important; margin: 0 !important; padding: 0 !important; }
    .no-print { display: none !important; }
    .page { 
      margin: 0 !important; 
      box-shadow: none !important; 
      border: none !important; 
      page-break-after: always !important;
      min-height: auto !important;
      height: auto !important;
      overflow: hidden !important;
    }
    .page:last-child {
      page-break-after: avoid !important;
    }
  }
`;

const Underline = ({ value, minWidth = '100px' }) => (
  <span className="underline" style={{ minWidth }}>{value || <>&nbsp;</>}</span>
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

const Header = ({ clientInfo }) => (
  <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      {clientInfo?.logoUrl && <img src={clientInfo.logoUrl} alt="Logo" style={{ height: '60px' }} />}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 700 }}>{clientInfo?.name || "Pune People's Co-op Bank Ltd., Pune"}</h1>
        <p style={{ fontSize: '10px', margin: '2px 0' }}>(Multi-State bank)</p>
        <p style={{ fontSize: '12px', margin: 0 }}>{clientInfo?.address || "H.O. First Floor, 477/478, Market Yard Pune – 411 037."}</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1 — Application Form
   ══════════════════════════════════════════════════════════════════════════ */
const Page1 = ({ data, clientInfo }) => {
  const ornamentItems = data?.ornaments || [];
  const rows = [...ornamentItems, ...Array(Math.max(0, 9 - ornamentItems.length)).fill({})].slice(0, 9);

  return (
    <div className="page">
      <Header clientInfo={clientInfo} />

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <h2 style={{ textDecoration: 'underline', fontSize: '18px', fontWeight: 800 }}>GOLD LOAN APPLICATION MEMBER / NOMINAL MEMBER</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <p>Date : <Underline value={data?.sanctionDate} minWidth="120px" /></p>
      </div>

      <div style={{ marginBottom: '15px', lineHeight: 1.6 }}>
        <p>The Manager,</p>
        <p className="bold">{clientInfo?.name || "Pune People's Co-operative Bank Ltd.,"}</p>
        <p>Branch <Underline value={data?.branch} minWidth="200px" /></p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <p className="bold">Dear Sir / Madam,</p>
        <p style={{ marginTop: '5px', textIndent: '30px', lineHeight: 1.5 }}>
          I / We Mr / Mrs. <Underline value={data?.customerName} minWidth="500px" /> am / are the member/nominal member of your bank. My / Our membership / nominal membership number is / are <Underline value={data?.membershipNo} minWidth="150px" />
        </p>
      </div>

      <div style={{ marginBottom: '10px', lineHeight: 1.6 }}>
        <p style={{ textAlign: 'justify' }}>
          I / We request you to grant me / us a loan of Rs. <Underline value={data?.loanSanction} minWidth="120px" /> in words Rupees <Underline value={numberToWords(data?.loanSanction)} minWidth="350px" /> for educational / religious / debt clearance / house construction / business purpose against the security of the following Gold and Silver articles that, I / We own unconditionally. I / We have read and understood the rules of the Bank for the transaction and I / We have accept those and agree to carry out the transaction as per those rules. I / We confirm that I am / We are the true owner(s) of the said ornaments / jewellery that is being pledged with you and no prior lien or charge has been created on the said gold ornaments/jewellery.
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th colSpan="3">Details to be filled in by the Applicant</th>
            <th colSpan="5">Details to be filled in by the Goldsmith</th>
          </tr>
          <tr>
            <th style={{ width: '40px' }}>Sr No</th>
            <th>Name of the Articles</th>
            <th>Total Gross Weight Gm. Mgm.</th>
            <th style={{ width: '50px' }}>Carat</th>
            <th>Net Weight GM. Mgm</th>
            <th>Rate per 10 gm</th>
            <th colSpan="2">Cost (Rs. / Ps.)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => (
            <tr key={i} style={{ height: '24px' }}>
              <td>{i + 1}</td>
              <td>{item.particular || ''}</td>
              <td>{item.grossWt || ''}</td>
              <td>{item.carat || ''}</td>
              <td>{item.netWt || ''}</td>
              <td>{item.goldRate || ''}</td>
              <td>{item.valuerPrice ? Math.floor(item.valuerPrice) : ''}</td>
              <td style={{ width: '30px' }}>{item.valuerPrice ? (item.valuerPrice % 1).toFixed(2).split('.')[1] : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
        <div style={{ width: '300px' }}>
          <p>Yours faithfully</p>
          <div style={{ marginTop: '40px' }}>
            <p>Signature/s (Applicant/s)</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>Place: <Underline value={data?.branch?.split('-')[1]} minWidth="150px" /></p>
        <p>Date: <Underline value={data?.sanctionDate} minWidth="150px" /></p>
      </div>

      <div style={{ marginTop: '15px', borderTop: '1px solid #000', paddingTop: '10px' }}>
        <p style={{ marginBottom: '5px', fontSize: '12px' }}>It is hereby certified that I/We have checked and verified the above articles and have found them to be genuine. Their weights, rates and costs are mentioned above and they are correct.</p>
        <div style={{ lineHeight: 1.6, fontSize: '13px' }}>
          <p>1) Today’s Market rate (per 10 gm) Rs. <Underline value={data?.currentRate || data?.ornaments?.[0]?.goldRate} minWidth="250px" /></p>
          <p>2) Market Value as per net weight Rs. <Underline value={data?.marketValue} minWidth="300px" /></p>
          <p>3) Market Value as per Bank norm (considering Margin) at Rs. <Underline value={data?.loanLimit} minWidth="250px" /></p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div>
            <p>Place: <Underline value={data?.branch?.split('-')[1]} minWidth="120px" /></p>
            <p>Date: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginTop: '20px', borderTop: '1px solid #000', paddingTop: '5px' }}>
              <p className="bold">Signature (authorized Goldsmith)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 2 — Acceptance & Sanction
   ══════════════════════════════════════════════════════════════════════════ */
const Page2 = ({ data, clientInfo }) => {
  return (
    <div className="page" style={{ padding: '10mm 15mm' }}>
      <div style={{ marginTop: '30px', lineHeight: 1.6 }}>
        <p style={{ borderBottom: '1px solid #000', paddingBottom: '5px', textAlign: 'justify' }}>I / We have accept the weight, rate and costs of the articles valued and mentioned above by the Goldsmith. I / we have delivered the said articles in possession of the bank for the purpose of Pledge.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div>
            <p>Place <Underline value={data?.branch?.split('-')[1]} minWidth="150px" /></p>
            <p>Date: <Underline value={data?.sanctionDate} minWidth="150px" /></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '5px' }}>
              <p className="bold">Signature (Applicant)</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '40px' }}>
        <h3 style={{ textDecoration: 'underline', fontWeight: 800 }}>Signature Verification</h3>
        <p style={{ marginTop: '5px' }}>Signature of the Valuer Correct as per Valuer Agreement.</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <p>Date: <Underline minWidth="100px" /></p>
          <p className="bold">Officer / Asst. Manager</p>
          <p className="bold">Manager</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '1px double #000', paddingTop: '15px', lineHeight: 1.8 }}>
        <p>
          Applicants is / are sanctioned a Gold Loan of Rs <Underline value={data?.loanSanction} minWidth="150px" /> for a period of <Underline value={data?.tenure} minWidth="80px" /> months at the interest rate of <Underline value="14" minWidth="60px" /> % p.a. against the security of the above mentioned articles.
        </p>
        <div style={{ display: 'flex', gap: '50px', marginTop: '10px' }}>
          <p>Type of Loan OD/TL Code <Underline value={data?.scheme?.includes('OD') ? 'OD' : 'TL'} minWidth="150px" /></p>
          <p>EMI (if TL) Rs <Underline minWidth="150px" /></p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <p>Date :- <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          <p className="bold">Manager / Asst. Manager</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '2px solid #000', paddingTop: '15px' }}>
        <p>The above articles are counted, verified and taken into custody. Receipt No. <Underline value={data?.goldBagNo} minWidth="250px" /></p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
          <p>Date :- <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          <p className="bold">Officer / Asst. Manager</p>
          <p className="bold">Manager</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', borderTop: '2px solid #000', paddingTop: '15px', lineHeight: 1.6 }}>
        <p>
          Mr./Mrs. <Underline value={data?.customerName} minWidth="500px" /> is / are hereby granted a loan of Rs. <Underline value={data?.loanSanction} minWidth="150px" /> against the security of gold / silver as per the rules.
        </p>
        <p style={{ marginTop: '5px' }}>Honorable Board of Directors Resolution No. <Underline minWidth="150px" /> dated <Underline minWidth="100px" /></p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
          <p>Date / /20</p>
          <p className="bold">Asst. Manager / Manager / AGM / GM</p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 3 — Nomination
   ══════════════════════════════════════════════════════════════════════════ */
const Page3 = ({ data, clientInfo }) => {
  return (
    <div className="page" style={{ padding: '10mm 15mm', fontSize: '14px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '20px' }}>NOMINATION</h2>
      </div>

      <p style={{ marginBottom: '15px', textAlign: 'justify' }}>Nomination in respect of Gold Jewellery / Ornaments pledged and in the custody of Bank.</p>

      <div style={{ lineHeight: 2.0, textAlign: 'justify' }}>
        <p>
          I / We <Underline value={data?.customerName} minWidth="500px" /> Name (s) and address (es) nominate the following persons to whom in the event of my / our death the Gold Jewellery / Ornaments pledged and in the custody of Bank, particulars whereof are given below, may be returned by the Bank upon payment of outstanding amount in full <Underline minWidth="200px" />
        </p>

        <div style={{ marginTop: '10px' }}>
          <p>Nominee's Name: Mr./Ms. <Underline minWidth="450px" /></p>
          <p>Age : <Underline minWidth="60px" /> Date of Birth : <Underline minWidth="130px" /> Relationship with Borrower, if any: <Underline minWidth="150px" /></p>
          <p>Address (with PIN): <Underline minWidth="550px" /></p>
          <p>PIN: <Underline minWidth="80px" /> Tel. No.(with STD Code) <Underline minWidth="160px" /> Mobile No. <Underline minWidth="160px" /></p>
        </div>

        {/* Minor nominee section */}
        <div style={{ marginTop: '20px' }}>
          <p className="bold">* As the nominee is a minor on this date,</p>
          <p>I / We appoint <Underline minWidth="500px" /></p>
          <p><Underline minWidth="350px" /> (Name & Age) to receive the Gold Jewellery / Ornaments pledged and in the custody of Bank on behalf of the nominee in the event of my / our / minor's death during the minority of the nominee.</p>
        </div>

        {/* Mandatory for Minor Nominee */}
        <div style={{ marginTop: '20px' }}>
          <p className="bold" style={{ textDecoration: 'underline' }}>Mandatory for Minor Nominee:</p>
          <p>Relation with Nominee: <Underline minWidth="500px" /></p>
          <p>Address (with PIN No.): <Underline minWidth="500px" /></p>
          <p><Underline minWidth="650px" /></p>
        </div>

        {/* Name of Witness */}
        <div style={{ marginTop: '20px' }}>
          <p className="bold" style={{ textDecoration: 'underline' }}>Name of Witness:</p>
          <p>1<Underline minWidth="350px" /> Signature<Underline minWidth="200px" /></p>
          <p>Address<Underline minWidth="600px" /></p>
          <p>2<Underline minWidth="350px" /> Signature<Underline minWidth="200px" /></p>
          <p>Address<Underline minWidth="600px" /></p>
        </div>

        {/* Override confirmation */}
        <div style={{ marginTop: '15px', textAlign: 'justify' }}>
          <p>I / We confirm that this nomination shall override any other disposition made by me / us, whether testamentary or otherwise and the nominee shall become entitled to the return of the Gold Jewellery / Ornaments pledged and in the custody of the Bank against payment of all outstanding to the Bank to the exclusion of all other persons. I / We further confirm that on such return the Bank shall stand released & discharged.</p>
        </div>

        {/* Place and Date */}
        <div style={{ marginTop: '20px' }}>
          <p>Place<Underline value={data?.branch?.split('-')[1]} minWidth="200px" /></p>
          <p style={{ marginTop: '10px' }}>Date <Underline value={data?.sanctionDate} minWidth="200px" /></p>
        </div>

        {/* Applicant's Signature */}
        <div style={{ marginTop: '30px', textAlign: 'right' }}>
          <p className="bold">Applicant's Signature / Thumb Impression</p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 4 — Terms & Conditions (1-14)
   ══════════════════════════════════════════════════════════════════════════ */
const Page4 = ({ data }) => {
  return (
    <div className="page" style={{ padding: '12mm 15mm', fontSize: '13px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '20px' }}>TERMS AND CONDITIONS OF GOLD LOAN</h2>
      </div>

      <div style={{ textAlign: 'justify', lineHeight: 1.5 }}>
        <p style={{ marginBottom: '8px' }}>1. The loan is repayable on demand within a maximum period of <Underline value={data?.tenure} minWidth="60px" /> months or less as specified.</p>
        <p style={{ marginBottom: '8px' }}>2. Gold ornament(s) / jewellery / coin(s) pledged with the Bank shall be kept at the risk of the Borrower in the ordinary safes and the Bank exercising only the ordinary care of the safe custody. The Bank shall not be liable in case of any damage to the pledged articles by reason of accident, force majeure, act of God etc.</p>
        <p style={{ marginBottom: '8px' }}>3. The Borrower acknowledges that the rate per gram fixed by the Bank for Gold Loan as on date is Rs. <Underline value={data?.ornaments?.[0]?.goldRate} minWidth="100px" /> and in case of downward fluctuations of price, the Bank shall have the right to demand repayment to cover the margin within 15 days and if the Borrower fails to bring the margin and the loan is not repaid in terms of the demand, provision contained in clause 8 hereunder shall apply.</p>
        <p style={{ marginBottom: '8px' }}>4. The loan shall carry interest @ <Underline value="14" minWidth="40px" /> % p.a. with <span style={{ textDecoration: 'line-through' }}>monthly /</span> quarterly rests and compounded, rising and falling therewith calculated respectively on the daily balance of the amount due subject to revision by the Bank or at such other rates that the Bank may from time to time stipulate.</p>
        <p style={{ marginBottom: '8px' }}>5. Incidental charges, appraiser's charges or other charges as fixed by the Bank from time to time will be levied on the loan.</p>
        <p style={{ marginBottom: '8px' }}>6. The borrower understands that if the account is not closed by paying the total amount due as and when demanded or on or before the tenure of the loan, the account shall be classified as special mention account (SMA) and thereafter as non-performing asset (NPA) in tune with the guidelines of the Reserve Bank of India from time to time.</p>
        <p style={{ marginBottom: '8px' }}>7. If the pawnor has other dues to the Bank as principal debtor, co-obligant, guarantor or in any other capacity in other loans, overdrafts or other debts in any manner, unless and until such debts, or any other debts that may arise in future are fully repaid by the pawnor, the ornament(s) / jewellery / coin(s) pledged under this loan will be taken as security for all such debt or debts and will be retained by the Bank as security and will be dealt with in regard to sale etc. as a pledged commodity.</p>
        <p style={{ marginBottom: '8px' }}>8. If the loan is not repaid on demand, the ornament(s) / jewellery / coin(s) pledged will be sold in public auction or through private negotiation and the pawnor will be personally liable for any deficit. If there is any surplus available, it will be appropriated by the Bank towards any other loan, overdraft or debt due by the borrower as debtor, guarantor or in any other capacity. Such sale made by the Bank shall not be disputed by the pawnor in any manner whatsoever.</p>
        <p style={{ marginBottom: '8px' }}>9. The Borrower further agrees that the Bank shall have an unqualified right to recover all the expenses incurred by the Bank of whatever nature in connection with the recovery actions including but not limited to the fees and expenses towards its Advocates and solicitors with regard to Obtention of opinions, litigations, both Civil and criminal, initiated either by the bank or against the Bank with respect to the subject loan account and the Borrower hereby irrevocably and unconditionally authorizes and empowers the Bank to debit and recover the same from the loan account, The borrower also agree that the Bank shall have an unfettered right of set off or lien towards any dues in this regard.</p>
        <p style={{ marginBottom: '8px' }}>10. Notice in respect of the loan shall be deemed to have been duly served, if the letter containing the notice of demand is delivered to the pawnor (a) in person or (b) is posted properly addressed to the address given overleaf or if any change in address has been duly notified to the Bank, then to such address or (c) sent through e-mail id of the pawnor registered with the bank or (d) through any other mode recognized by law.</p>
        <p style={{ marginBottom: '8px' }}>11. When the loan is closed and ornament(s) / jewellery / coin(s) redeemed, discharge should be end or by the pawnor in the pledge form.</p>
        <p style={{ marginBottom: '8px' }}>12. Bank shall have the right to inspect the pledged gold ornament(s) / jewellery / coin(s) through its internal / external inspectors / auditors / Regulators or through any of its authorized representatives at any time during the continuance of the loan or otherwise without notice to the borrower.</p>
        <p style={{ marginBottom: '8px' }}>13. Penal charges @ <Underline value="2" minWidth="40px" /> % per annum will be charged if the loan is not closed within <Underline value={data?.tenure} minWidth="60px" /> months from the date of pledge or the actual period for which the loan is allowed, whichever is earlier.</p>
        <p style={{ marginBottom: '8px' }}>14. The Bank shall have right to recall the loan at any time before the expiry of <Underline value={data?.tenure} minWidth="40px" /> months or before the expiry of the period for which the loan is allowed if it considers that interest of the Bank is in jeopardy and the decision of the Bank in this regard shall be final and binding on the Borrower.</p>
      </div>
    </div>
  );
};

const Page5 = ({ data }) => {
  return (
    <div className="page" style={{ padding: '15mm 20mm', fontSize: '14px' }}>
      <div style={{ textAlign: 'justify', lineHeight: 1.6 }}>
        <p style={{ marginBottom: '12px' }}>15. The Bank shall have the right to make disclosure to Credit Information companies or any other agency approved by RBI.</p>
        <p style={{ marginBottom: '12px' }}>16. The Bank reserves its right to alter, add or delete any of these conditions / rules at any time. For this purpose, the Bank will not be required to give separate notice to each Borrower and any change in the conditions / rules displayed in the Notice Board of the Bank shall be sufficient notice to all the concerned persons.</p>
        <p style={{ marginBottom: '12px' }}>17. The Bank shall be entitled, without any further enquiry, to accept the particulars provided by the Appraiser of the description, condition, quality or otherwise as to the nature of gold pledged by us hereunder as correct. The borrower shall not be entitled to challenge the correctness of such particulars or to object to the ornament(s) / jewellery / coin(s) actually found in possession of the bank are not in accordance with the ornament(s) / jewellery / coin(s) as pledged by the borrower. The bank shall not be in any way liable for want of care or diligence. The bank shall not be in any way liable or responsible for any loss, destruction or deterioration, which the ornament(s) / jewellery / coin(s) for the time being pledged to the bank or any part thereof may suffer or sustain on any account whatsoever, while the same is / are in actual or constructive possession of the bank during the continuance of the loan or thereafter and all such loss, destruction or deterioration shall be wholly on the borrower’s account howsoever the same have been caused. The Bank shall also not be responsible for any shortage resulting from theft or pilferage or otherwise howsoever notwithstanding the fact that the ornament(s) / jewellery / coin(s) may be in the possession or under the control of the Bank.</p>

        <p style={{ marginTop: '40px', fontWeight: 600, fontSize: '15px' }}>All the above terms and conditions are explained to me / us and are accepted by me / us.</p>

        <div style={{ marginTop: '70px', textAlign: 'right' }}>
          <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '250px', paddingTop: '10px' }}>
              <p className="bold" style={{ fontSize: '14px' }}>Signature of the Borrower / Pawnor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 6 — Promissory Note
   ══════════════════════════════════════════════════════════════════════════ */
const Page6 = ({ data }) => {
  return (
    <div className="page" style={{ padding: '20mm 20mm', fontSize: '15px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '24px' }}>PROMISSORY NOTE</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '30px' }}>
        <p>Place : <Underline value={data?.branch?.split('-')[1]} minWidth="150px" /></p>
        <p style={{ marginTop: '10px' }}>Dated : <Underline value={data?.sanctionDate} minWidth="150px" /></p>
      </div>

      <div style={{ marginBottom: '25px', fontSize: '16px' }}>
        <p className="bold">Rs. <Underline value={data?.loanSanction} minWidth="150px" /> /-</p>
        <p style={{ marginTop: '10px' }}>(Rs. <Underline value={numberToWords(data?.loanSanction)} minWidth="500px" /> Only)</p>
      </div>

      <div style={{ marginTop: '30px', lineHeight: 1.8 }}>
        <p className="extra-bold" style={{ fontSize: '18px', textDecoration: 'underline', marginBottom: '10px' }}>ON DEMAND I / WE</p>
        <div style={{ marginLeft: '25px' }}>
          <p>1. Mr./Mrs./M/s. <Underline value={data?.customerName} minWidth="500px" /></p>
          <p style={{ marginLeft: '35px' }}>Address <Underline value={data?.address} minWidth="500px" /></p>

          <p style={{ marginTop: '10px' }}>2. Mr./Mrs./M/s. <Underline minWidth="500px" /></p>
          <p style={{ marginLeft: '35px' }}>Address <Underline minWidth="500px" /></p>

          <p style={{ marginTop: '10px' }}>3. Mr./Mrs./M/s. <Underline minWidth="500px" /></p>
          <p style={{ marginLeft: '35px' }}>Address <Underline minWidth="500px" /></p>
        </div>
      </div>

      <div style={{ marginTop: '50px', textAlign: 'justify', lineHeight: 1.6, fontSize: '16px' }}>
        <p>
          Do hereby <span className="bold">Jointly and severally promise to pay</span> “Pune People's Co-operative Bank Ltd.,” or order the sum of Rs. <Underline value={data?.loanSanction} minWidth="150px" /> /- (Rupees <Underline value={numberToWords(data?.loanSanction)} minWidth="450px" /> Only) for value received, together with interest @ <Underline value="14" minWidth="60px" /> % thereon Compounded with monthly rests.
        </p>
      </div>

      <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '250px', paddingTop: '10px' }}>
            <p className="bold">Signature/s of Borrower/s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 7 — Letter of Lien and Set-off
   ══════════════════════════════════════════════════════════════════════════ */
const Page7 = ({ data, clientInfo }) => {
  return (
    <div className="page" style={{ fontSize: '15px' }}>
      <Header clientInfo={clientInfo} />
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '22px' }}>LETTER OF LIEN AND SET-OFF</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <p>Date : <Underline value={data?.sanctionDate} minWidth="120px" /></p>
      </div>

      <div style={{ marginBottom: '20px', lineHeight: 1.6 }}>
        <p>The Manager,</p>
        <p className="bold">{clientInfo?.name || "Pune People's Co-op. Bank Ltd.,"}</p>
        <p>Branch <Underline value={data?.branch} minWidth="200px" /></p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <p style={{ fontWeight: 700, fontSize: '16px' }}>Dear Sir,</p>
        <p style={{ marginTop: '10px', textIndent: '30px', lineHeight: 1.6 }}>
          In consideration of your Bank having agreed to grant and / or continue to grant and / or granted from time to time credit facility(ies) / accommodation and facilities by way of loan / overdraft/cash credit. I / We agree with the Bank as follows :-
        </p>
      </div>

      <div style={{ textAlign: 'justify', lineHeight: 1.6, fontSize: '14px' }}>
        <p style={{ marginBottom: '15px' }}>
          1. That the Bank may hold all securities belonging to me/us (which may now be in your possession or which may at any time thereafter come into the possession of the Bank) and the proceeds there of respectively not only for the specific advance made thereon but also as collateral security for any other money now due or which may at any time be due from me/us to the Bank, whether singly or jointly with another or others.
        </p>
        <p style={{ marginBottom: '15px' }}>
          2. That in addition to any general lien or similar right to which you as bankers may be entitled by law, I/we confer on the Bank an undisputed right to at any time and without notice to me/us combine or consolidate all or any of my/our accounts with and liabilities to your Bank and set off or transfer any sum or sums standing to the credit or any one or more of such accounts in or towards satisfaction of any of my/our liabilities to your Bank on any other account or in any other respect whether such liabilities be actual or contingent primary or collateral and several or joint.
        </p>
        <p style={{ marginBottom: '15px' }}>
          3. I/we further authorize the Bank that if any balance of the sales proceed shall remain in the hands of the Bank after the sale of any of the securities, the Bank may at its sole discretion apply the balance if any, towards any sum or sums of money that may be owing by me/us to the Bank upon any other account or any other transaction or transactions separate or distinct from the security, and you will pay to me/us any surplus which may remain after settlement of all claims of your Bank against me us.
        </p>
      </div>

      <p style={{ marginTop: '30px', fontWeight: 600 }}>Notwithstanding anything contained in any other document executed in favor of the Bank the terms and conditions contained herein will prevail.</p>

      <p style={{ marginTop: '20px' }}>Dated this <Underline value={new Date().getDate()} minWidth="50px" /> day of <Underline value={new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date())} minWidth="150px" /></p>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
        <div style={{ width: '300px', lineHeight: 2.5 }}>
          <p className="bold">Yours faithfully,</p>
          <p>1. <Underline minWidth="250px" /></p>
          <p>2. <Underline minWidth="250px" /></p>
          <p>3. <Underline minWidth="250px" /></p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 8 — Letter of Pledge
   ══════════════════════════════════════════════════════════════════════════ */
const Page8 = ({ data, clientInfo }) => {
  return (
    <div className="page" style={{ fontSize: '13px' }}>
      <Header clientInfo={clientInfo} />
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '20px' }}>LETTER OF PLEDGE</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <p>Date: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
      </div>

      <div style={{ marginBottom: '10px', lineHeight: 1.4 }}>
        <p>The Manager,</p>
        <p className="bold">{clientInfo?.name || "Pune People's Co-Op Bank Ltd.,"}</p>
        <p>Branch <Underline value={data?.branch} minWidth="200px" /></p>
      </div>

      <p style={{ fontWeight: 700, fontSize: '14px' }}>Dear Sir/ Madam,</p>

      <div style={{ marginTop: '8px', lineHeight: 1.5 }}>
        <p>
          I/We <Underline value={data?.customerName} minWidth="400px" /> Age:- <Underline value={data?.age} minWidth="50px" /> years, Occupation:- <Underline minWidth="150px" /> R/at:- <Underline value={data?.address} minWidth="450px" />
        </p>
        <p style={{ marginTop: '5px', fontWeight: 700, fontSize: '14px' }}>Declare as follows-</p>
        <div style={{ textAlign: 'justify', fontSize: '12px', lineHeight: 1.5 }}>
          <p style={{ marginBottom: '6px' }}>1. I / we have taken a loan of Rs. <Underline value={data?.loanSanction} minWidth="150px" /> /- (in words Rupees <Underline value={numberToWords(data?.loanSanction)} minWidth="400px" />) for the purpose of <Underline minWidth="200px" /> from your Bank Against the security of Gold/ Silver articles Jewelry detailed in my application if which I /we am/are an unconditional owner/s. I /we have also submitted a promissory Note, letter of lien and set off for the said amount. I/we will pay an interest <Underline value="14" minWidth="60px" /> % p. a. with monthly rests on the said amounts per the Bank's Rules. I/ we will refund the said Loan amount with interest within or prior to <Underline value={data?.tenure} minWidth="50px" /> months from this day onwards. I/we accept the weights, rate and costs calculated by the gold smith for the said articles. I/ we will pay the monthly interest.</p>
          <p style={{ marginBottom: '6px' }}>2. I/We am/are a member of the Bank and I/We have read and understood the bylaws of the Bank and all rules and regulations regarding this transaction. These are binding on me/us and I/We agree to carry out the transaction as per the same.</p>
          <p style={{ marginBottom: '6px' }}>3. If the cost of the gold and silver articles is reduced as per the market rate or due to any other reason. I/We agree to pay the amount of difference in the Bank office within 24 hours of Intimation of the same. If I/We am/are fail to do so. I /We am/are authorized the Bank to sell the gold and silver articles and credit the amount to my/our loan account.</p>
          <p style={{ marginBottom: '6px' }}>4. If the said loan amount is not repaid with interest during the stipulated period, I/We authorized the Bank, to sell the articles described above at the market price and recover the amount; I /We will have no objection to the same. If the compensation is still incomplete, I/We will repay the balance amount personally or by selling my/our other movable and immovable properties/assets.</p>
          <p style={{ marginBottom: '6px' }}>5. I /We am /are owned the above gold/silver articles individually/Jointly. If the right or interest of any other party is generated on the same or if these articles are found to be stolen or false or counterfeit, I/We will compensate any damage to the Bank thereof from my/our movable and immovable properties as well as my/our heirs will also be responsible for the same.</p>
          <p style={{ marginBottom: '6px' }}>6. I/We am/are nominate the following to received the custody of articles in the event of my/our death before the closure of this account after my/our death the articles described above should be returned to Mr./Mrs./Miss. <Underline minWidth="350px" /> Occupation : <Underline minWidth="150px" /> Age <Underline minWidth="80px" /> address <Underline minWidth="550px" />.</p>
          <p>7. I/We am/are aware of the provisions of the Gold Control Act. If this transaction is considered irregular according to the provisions thereof, I /We will be wholly responsible for the same. I/My/Our heirs will be solely responsible for the damage arising out of the irregularity.</p>
        </div>
      </div>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ lineHeight: 1.6 }}>
          <p className="bold">Yours faithfully,</p>
          <p>Date: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          <p>Place : Pune</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: '5px', width: '250px' }}>
            <p className="bold">Signature/s (Borrower/s)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 9 — End Use Letter & Standing Instruction
   ══════════════════════════════════════════════════════════════════════════ */
const Page9 = ({ data, clientInfo }) => {
  return (
    <div className="page" style={{ padding: '15mm 20mm', fontSize: '15px' }}>
      {/* End Use Letter Section */}
      <div style={{ borderBottom: '2.5px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '22px' }}>END USE LETTER</h2>
        </div>
        <div style={{ lineHeight: 1.8 }}>
          <p>प्रति ,</p>
          <p className="bold">शाखाधिकारी ,</p>
          <p className="bold">पुणे पीपल्स को-ऑप बँक लि.,पुणे</p>
          <p>शाखा: <Underline value={data?.branch} minWidth="200px" /></p>

          <p style={{ marginTop: '15px', fontWeight: 600 }}>महोदय ,</p>
          <p style={{ textIndent: '40px', textAlign: 'justify' }}>
            मी श्री. / सौ. <Underline value={data?.customerName} minWidth="500px" /> आपल्या बँकेतून वैयक्तिक / तारणी कर्ज रक्कम <Underline value={data?.loanSanction} minWidth="150px" /> घेतले आहे. सदर कर्जाचा वापर मी / आम्ही <Underline minWidth="300px" /> साठी स्वतः करणार आहे याची मी आपणास हमी देतो . तरी सदर कर्जाची रक्कम माझ्या बचत जमा करावी हि विनंती.
          </p>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p>दिनांक : <Underline value={data?.sanctionDate} minWidth="120px" /></p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '5px' }}>
                <p className="bold">सही</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standing Instruction Section */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '22px' }}>STANDING INSTRUCTION</h2>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ width: '400px' }}>
            <p className="bold">From: <Underline value={data?.customerName} minWidth="300px" /></p>
            <p><Underline value={data?.address} minWidth="350px" /></p>
          </div>
          <div>
            <p>Date: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          </div>
        </div>

        <div style={{ lineHeight: 1.6 }}>
          <p className="bold">To,</p>
          <p className="bold">The Branch Manager</p>
          <p className="bold">Pune People’s Co-Op Bank Ltd., Pune</p>
          <p>Branch: <Underline value={data?.branch} minWidth="250px" /></p>
        </div>

        <div style={{ margin: '15px 0' }}>
          <p className="bold" style={{ fontSize: '17px' }}>Subject: Standing instruction for payment of Loan installment</p>
        </div>

        <div style={{ lineHeight: 1.8 }}>
          <p>Dear Sir / Madam,</p>
          <p>Reference: Loan A/c No. <Underline minWidth="350px" /></p>
          <p>With reference to above, I the undersigned <Underline value={data?.customerName} minWidth="450px" /></p>
          <p>Had availed a loan of Rs. <Underline value={data?.loanSanction} minWidth="200px" /> on <Underline value={data?.sanctionDate} minWidth="150px" />.</p>
          <p style={{ textAlign: 'justify' }}>
            In this context, I hereby authorize you to debit the amount of loan installment of Rs. <Underline minWidth="150px" /> to my saving / current/ cash credit account no. <Underline value={data?.sbAcNo} minWidth="300px" /> with you and credit the same to my aforesaid loan account by every month on date: <Underline minWidth="100px" />
          </p>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p>Thanking you</p>
              <p>Yours faithfully</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '5px' }}>
                <p className="bold">Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 10 — Declaration
   ══════════════════════════════════════════════════════════════════════════ */
const Page10 = ({ data }) => {
  return (
    <div className="page" style={{ padding: '20mm 20mm', fontSize: '15px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '24px' }}>DECLARATION</h2>
      </div>
      <p style={{ textAlign: 'center', fontSize: '13px', marginBottom: '30px', fontStyle: 'italic' }}>
        (To be obtained in case the executant signs in the language other than English / Illiterates)
      </p>

      <div style={{ lineHeight: 1.8, textAlign: 'justify', fontSize: '16px' }}>
        <p>
          The Content of this document have been read to <span className="bold">Mr / Mrs <Underline value={data?.customerName} minWidth="450px" /></span> in the language <Underline minWidth="180px" />, being the language know by him / her / & he / She has understood the same & affixed his / her thumb impression / signature in vernacular language to the document.
        </p>

        <div style={{ marginTop: '40px', lineHeight: 1.6 }}>
          <p>Name of the Witness: <Underline minWidth="450px" /></p>
          <p>Address of Witness: <Underline minWidth="450px" /></p>
          <p>Signature of Witness: ____________________</p>
          <p>Relationship with Witness: <Underline minWidth="450px" /></p>
          <p>Contact Number of Witness: <Underline minWidth="450px" /></p>
        </div>

        <div style={{ marginTop: '80px', textAlign: 'right' }}>
          <div style={{ display: 'inline-block', textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '350px', paddingTop: '10px' }}>
              <p className="bold">Signature / Thumb Impression of customer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function GoldLoanPrint({ data: propData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const rawData = propData || location.state || {};
  const { clientInfo } = useApp();
  const [language, setLanguage] = useState('EN');

  const data = {
    ...rawData,
    ...(rawData.basic || {}),
    ...(rawData.loanSummary || {}),
    loanSanctionWords: numberToWords(rawData.loanSanction || rawData.loanSummary?.loanSanction)
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No evaluation data found</h2>
        <button onClick={() => navigate('/gold-loan')}>Back to Loans</button>
      </div>
    );
  }

  const isMarathi = language === 'MR';

  return (
    <GoldLoanPrintMaster 
      title={isMarathi ? "अर्ज अर्ज" : "Application Form"} 
      hideToolbar={!!propData}
      currentLanguage={language}
      onLanguageChange={setLanguage}
    >
      <style>{GLOBAL_CSS}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap');
        .marathi-font { font-family: 'Noto Sans Devanagari', sans-serif !important; }
      `}</style>
      <div className="print-pages-container">
        {isMarathi ? (
          <>
            <Page1MR data={data} clientInfo={clientInfo} />
            <Page2MR data={data} clientInfo={clientInfo} />
            <Page3MR data={data} clientInfo={clientInfo} />
            <Page4MR data={data} />
            <Page5MR data={data} />
            <Page6MR data={data} />
            <Page7MR data={data} clientInfo={clientInfo} />
            <Page8MR data={data} clientInfo={clientInfo} />
            <Page9MR data={data} clientInfo={clientInfo} />
            <Page10MR data={data} />
          </>
        ) : (
          <>
            <Page1 data={data} clientInfo={clientInfo} />
            <Page2 data={data} clientInfo={clientInfo} />
            <Page3 data={data} clientInfo={clientInfo} />
            <Page4 data={data} />
            <Page5 data={data} />
            <Page6 data={data} />
            <Page7 data={data} clientInfo={clientInfo} />
            <Page8 data={data} clientInfo={clientInfo} />
            <Page9 data={data} clientInfo={clientInfo} />
            <Page10 data={data} />
          </>
        )}
      </div>
    </GoldLoanPrintMaster>
  );
}

