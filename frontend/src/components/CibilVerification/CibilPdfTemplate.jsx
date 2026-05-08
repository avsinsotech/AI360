import React from 'react';

/**
 * CibilPdfTemplate component
 * Renders the CIBIL report content for PDF generation.
 * 
 * NOTE: The header (Print Date, Report Name, Page No, Title bar) is NOT rendered here.
 * It is drawn on EVERY page via jsPDF post-processing in CibilVerification.jsx handleDownload.
 * This ensures the header repeats on all pages while accounts flow naturally.
 */
const CibilPdfTemplate = ({ data, reportDate }) => {
  if (!data) return null;

  const ccr = data.data?.cCRResponse;
  const reportData = ccr?.cIRReportDataLst?.[0]?.cIRReportData;
  const personalInfo = reportData?.iDAndContactInfo?.personalInfo;
  const identityInfo = reportData?.iDAndContactInfo?.identityInfo;

  // Robust Contact Info Extraction using typeCode (H, M, T)
  const allPhones = reportData?.iDAndContactInfo?.phoneInfo || [];
  const allEmails = reportData?.iDAndContactInfo?.emailAddressInfo || [];

  const mobilePhones = allPhones.filter(p => p.typeCode === 'M' || p.typeCode === '4' || p.type === 'MOBILE').map(p => p.number);
  const officePhones = allPhones.filter(p => p.typeCode === 'T' || p.typeCode === '2' || p.type === 'OFFICE').map(p => p.number);
  const homePhones = allPhones.filter(p => p.typeCode === 'H' || p.typeCode === '1' || p.type === 'HOME').map(p => p.number);
  const otherPhones = allPhones.filter(p => !['M', 'T', 'H', '1', '2', '4', 'MOBILE', 'OFFICE', 'HOME'].includes(p.typeCode || p.type)).map(p => p.number);

  const contact = {
    home: homePhones[0] || '',
    office: officePhones[0] || '',
    mobile: mobilePhones[0] || '',
    altHomeOther: homePhones[1] || otherPhones[0] || '',
    altOffice: officePhones[1] || '',
    altMobile: mobilePhones[1] || '',
    email: allEmails[0]?.emailAddress || ''
  };

  const scoreDetails = reportData?.scoreDetails?.[0];
  const accounts = reportData?.retailAccountDetails || [];

  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === '') return '0.00';
    return parseFloat(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="cibil-pdf-wrapper" style={{
      padding: '0 0 15px 0',
      fontFamily: 'Arial, sans-serif',
      color: '#000',
      fontSize: '11px',
      backgroundColor: '#fff',
      visibility: 'visible',
      width: '1050px',
      margin: '0 auto'
    }}>
      {/* Title bar — rendered in HTML so it aligns perfectly with the table below */}
      <div className="cibil-title-bar" style={{
        backgroundColor: '#c0c0c0',
        textAlign: 'center',
        padding: '6px 0',
        fontWeight: 'bold',
        fontStyle: 'italic',
        fontSize: '12px',
        border: '1px solid #999',
        borderBottom: 'none'
      }}>
        CIBIL REPORTS
      </div>

      {/* Basic Info Grid */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        border: '1px solid #999',
        pageBreakInside: 'avoid'
      }}>
        <thead>
          <tr>
            <th style={{ width: '33.33%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Personal Information</th>
            <th style={{ width: '33.33%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Identification</th>
            <th style={{ width: '33.33%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Contact Details</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top', border: '1px solid #999', padding: '5px' }}>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>Name</div>
                <div style={{ flex: 1 }}>: {personalInfo?.name?.fullName || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>Alias Name</div>
                <div style={{ flex: 1 }}>: </div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>DOB</div>
                <div style={{ flex: 1 }}>: {personalInfo?.dateOfBirth} 12:00AM</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>Age</div>
                <div style={{ flex: 1 }}>: {personalInfo?.age?.age || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>Gender</div>
                <div style={{ flex: 1 }}>: {personalInfo?.gender || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>Total Income</div>
                <div style={{ flex: 1 }}>: {personalInfo?.totalIncome || '0'}</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '80px', fontWeight: 'bold' }}>Occupation</div>
                <div style={{ flex: 1 }}>: {personalInfo?.occupation || ''}</div>
              </div>
            </td>
            <td style={{ verticalAlign: 'top', border: '1px solid #999', padding: '5px' }}>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>PAN</div>
                <div style={{ flex: 1 }}>: {identityInfo?.pANId?.[0]?.idNumber || 'N/A'}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>Voter ID</div>
                <div style={{ flex: 1 }}>: </div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>Passport ID</div>
                <div style={{ flex: 1 }}>: </div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>UID</div>
                <div style={{ flex: 1 }}>: {identityInfo?.nationalIDCard?.[0]?.idNumber || ''}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>Driver's License</div>
                <div style={{ flex: 1 }}>: {identityInfo?.driverLicense?.[0]?.idNumber || ''}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>Ration Card</div>
                <div style={{ flex: 1 }}>: </div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>Photo Credit Card</div>
                <div style={{ flex: 1 }}>: </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '100px', fontWeight: 'bold' }}>ID</div>
                <div style={{ flex: 1 }}>: {identityInfo?.otherId?.[0]?.idNumber || ''}</div>
              </div>
            </td>
            <td style={{ verticalAlign: 'top', border: '1px solid #999', padding: '5px' }}>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Home</div>
                <div style={{ flex: 1 }}>: {contact.home}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Office</div>
                <div style={{ flex: 1 }}>: {contact.office}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Mobile</div>
                <div style={{ flex: 1 }}>: {contact.mobile}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Alt. Home/Other No</div>
                <div style={{ flex: 1 }}>: {contact.altHomeOther}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Alt. Office</div>
                <div style={{ flex: 1 }}>: {contact.altOffice}</div>
              </div>
              <div style={{ display: 'flex', marginBottom: '3px' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Alt. Mobile</div>
                <div style={{ flex: 1 }}>: {contact.altMobile}</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '110px', fontWeight: 'bold' }}>Email</div>
                <div style={{ flex: 1 }}>: {contact.email}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Score Section */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>SCORE :</div>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #999',
          pageBreakInside: 'avoid'
        }}>
          <thead>
            <tr>
              <th style={{ width: '20%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Score Name</th>
              <th style={{ width: '15%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Score</th>
              <th style={{ border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Scoring Elements</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #999', padding: '5px', textAlign: 'left' }}>{scoreDetails?.name || 'ERS4.0'}</td>
              <td style={{ border: '2px solid red', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>{scoreDetails?.value || 'N/A'}</td>
              <td style={{ border: '1px solid #999', padding: '5px' }}>
                {scoreDetails?.scoringElements?.map(e => e.description).join(', ') || 'ERS'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Account Details — each account is its own table to prevent splitting across pages */}
      <div style={{ marginTop: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>Account Details:</div>
        {/* Column header row */}
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999' }}>
          <thead>
            <tr>
              <th style={{ width: '35%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Accounts</th>
              <th style={{ width: '40%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}></th>
              <th style={{ width: '25%', border: '1px solid #999', padding: '5px', backgroundColor: '#f2f2f2', textAlign: 'center' }}>Open Status</th>
            </tr>
          </thead>
        </table>
        {/* Each account rendered as its own table — won't split across pages */}
        {accounts.map((acc, idx) => (
          <table key={idx} style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #999',
            borderTop: 'none',
            pageBreakInside: 'avoid'
          }}>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td style={{ width: '35%', border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '105px', fontWeight: 'bold' }}>ACC No</div>
                    <div>: {acc.accountNumber || 'N/A'}</div>
                  </div>
                </td>
                <td style={{ width: '40%', border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '135px', fontWeight: 'bold' }}>Balance</div>
                    <div>: {formatCurrency(acc.balance)}</div>
                  </div>
                </td>
                <td style={{ width: '25%', border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '115px', fontWeight: 'bold' }}>Open</div>
                    <div>: {acc.open || 'N/A'}</div>
                  </div>
                </td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '105px', fontWeight: 'bold' }}>Institution</div>
                    <div>: {acc.institution || 'N/A'}</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '135px', fontWeight: 'bold' }}>Past Due Amount:</div>
                    <div>: {formatCurrency(acc.pastDueAmount)}</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '115px', fontWeight: 'bold' }}>Interest Rate:</div>
                    <div>: {acc.interestRate || '0.00'}</div>
                  </div>
                </td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '105px', fontWeight: 'bold' }}>Type</div>
                    <div>: {acc.accountType || 'N/A'}</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '135px', fontWeight: 'bold' }}>Last Payment:</div>
                    <div>: {formatCurrency(acc.lastPayment)}</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '115px', fontWeight: 'bold' }}>Last Payment Date:</div>
                    <div>: {formatDate(acc.lastPaymentDate)}</div>
                  </div>
                </td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '105px', fontWeight: 'bold' }}>Ownership Type:</div>
                    <div>: {acc.ownershipType || 'Individual'}</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '135px', fontWeight: 'bold' }}>Write-off Amount:</div>
                    <div>: {formatCurrency(acc.writeOffAmount)}</div>
                  </div>
                </td>
                <td style={{ border: '1px solid #999', padding: '3px 5px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '115px', fontWeight: 'bold' }}>Sanction Amount:</div>
                    <div>: {formatCurrency(acc.sanctionAmount)}</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>


    </div>
  );
};

export default CibilPdfTemplate;
