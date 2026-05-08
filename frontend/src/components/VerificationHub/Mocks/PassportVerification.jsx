import React, { useState, useEffect } from 'react';
import { Plane, Search, FileText, CheckCircle, Database, Loader2, AlertCircle, ShieldCheck, RotateCcw, CheckCircle2, Download } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import SecurityInfoWidget from '../../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../../Shared/HowItWorksWidget';
import '../../AadharVerification/AadharVerification.css';
import API_BASE_URL from '../../../config';

const PASSPORT_API_BASE = `${API_BASE_URL}/PassportProxy`;

export default function PassportVerification() {
  const { showToast, balance, user, fetchBalance } = useApp();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [formData, setFormData] = useState({ passportNo: '', dob: '' });
  const [passportData, setPassportData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const handleDownloadPdf = async (record) => {
    let raw = {};
    try { raw = JSON.parse(record.rawResponse || '{}'); } catch (e) { }
    const d = raw.data || raw;

    const passportNo = d.file_number || d.passport_number || record.passportNo || '';
    const name = d.full_name || d.name || record.name || '';
    const surname = d.surname || '';
    const givenName = d.given_name || '';
    const dob = d.dob || d.date_of_birth || record.dob || '';
    const typeOfApplication = d.application_type || d.type_of_application || 'Ordinary';
    const applicationDate = d.date_of_application || d.application_date || '';

    let clientName = 'Authorized Bank';
    try {
      const codeToFetch = record.clientCode || user?.clientCode;
      if (codeToFetch) {
        const resp = await fetch(`${API_BASE_URL}/Client/${codeToFetch}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (resp.ok) {
          const cData = await resp.json();
          if (cData && cData.name) clientName = cData.name;
          else clientName = codeToFetch;
        } else { clientName = codeToFetch; }
      }
    } catch (err) {
      if (record.clientCode) clientName = record.clientCode;
    }

    const row = (label, value) => `
      <tr>
        <td style="width:25%; font-weight:bold; padding:8px 0; font-size:14px; vertical-align:top;">${label}</td>
        <td style="width:5%; text-align:center; padding:8px 0; font-size:14px; font-weight:bold; vertical-align:top;">:</td>
        <td style="padding:8px 0; font-size:14px; vertical-align:top;">${value || ''}</td>
      </tr>
    `;

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    // Single continuous rendering structure - precisely A4 size
    printContainer.innerHTML = `
      <div style="width:210mm; min-height:296mm; padding:15mm; box-sizing:border-box; font-family:Arial,sans-serif; color:#000; background:#fff; position:relative;">
        <div style="text-align:center; margin-bottom:25px; padding-top: 10px;">
          <h1 style="margin:0; font-size:24px; font-weight:bold; color:#000;">${clientName}</h1>
          <h3 style="margin:5px 0 5px 0; font-size:16px; font-weight:bold; color:#000;">Passport Verification Certificate</h3>
          <p style="margin:0; font-size:14px; text-transform:uppercase;">TO WHOMSOEVER IT MAY CONCERN</p>
        </div>

        <div style="margin-bottom:25px;">
          <p style="margin:0; font-size:14px; line-height:1.6;">This is to Certify that <strong style="text-transform:uppercase;">${name}</strong>, Passport / File No. <strong style="text-transform:uppercase;">${passportNo}</strong> are verified.</p>
        </div>

        <div style="border: 2px solid #000; padding: 25px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${row('Status', 'Success')}
            ${row('File Number', passportNo)}
            ${row('Full Name', name)}
            ${row('Date of Birth', dob)}
            ${row('Date of Application', applicationDate)}
            ${row('Application Type', typeOfApplication)}
            ${row('Verification Date', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/'))}
            ${surname ? row('Surname', surname) : ''}
            ${givenName ? row('Given Name', givenName) : ''}
          </table>
        </div>

        <div style="position:absolute; bottom:50mm; left:15mm; right:15mm; display:flex; justify-content:space-between; font-size:13px; line-height:2;">
          <div style="width:45%;">
            <p style="font-weight:bold; margin-bottom:15px;">Signature of the Authorised Signatory</p>
            <p style="margin:0;">Name:<span style="border-bottom:1px solid #000; display:inline-block; width:150px; margin-left:8px;"></span></p>
            <p style="margin:0;">Designation:<span style="border-bottom:1px solid #000; display:inline-block; width:113px; margin-left:8px;"></span></p>
            <p style="margin:0;">Phone no.:<span style="border-bottom:1px solid #000; display:inline-block; width:123px; margin-left:8px;"></span></p>
            <p style="margin-top:30px;">(Bank Seal)</p>
          </div>
          <div style="width:45%;">
            <p style="font-weight:bold; margin-bottom:15px;">Signature of the Branch Manager</p>
            <p style="margin:0;">Name:<span style="border-bottom:1px solid #000; display:inline-block; width:150px; margin-left:8px;"></span></p>
            <p style="margin:0;">Designation:<span style="border-bottom:1px solid #000; display:inline-block; width:113px; margin-left:8px;"></span></p>
            <p style="margin:0;">Date:<span style="border-bottom:1px solid #000; display:inline-block; width:157px; margin-left:8px;"></span></p>
            <p style="margin-top:30px; margin-left:15px;">Verified By : User</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(printContainer);

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const worker = html2pdf().from(printContainer.firstElementChild).set({
        margin: [0, 0, 0, 0], // Margins handled entirely in CSS container padding
        filename: `Passport_Certificate_${record.passportNo}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
      });

      // Generate PDF, then draw thick border on each page using jsPDF internal API
      const pdf = await worker.outputPdf('dataurlstring');
      await html2pdf().from(printContainer.firstElementChild).set({
        margin: [0, 0, 0, 0],
        filename: `Passport_Certificate_${record.passportNo}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
      }).toPdf().get('pdf').then((pdfDoc) => {
        const totalPages = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdfDoc.setPage(i);
          pdfDoc.setDrawColor(0, 0, 0);
          pdfDoc.setLineWidth(1.5);
          // Drawing thick border close to paper edges
          pdfDoc.rect(8, 8, 194, 281);
        }
        pdfDoc.save(`Passport_Certificate_${record.passportNo}.pdf`);
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      document.body.removeChild(printContainer);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${PASSPORT_API_BASE}/history?pageSize=100`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.items || []);
      }
    } catch (err) { }
    finally {
      setHistoryLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    // Credit Check
    if (user?.role !== 'SUPER_ADMIN' && balance <= 0) {
      showToast('please add credits', 'warning');
      return;
    }

    if (!formData.passportNo || !formData.dob) {
      setError('Passport Number and Date of Birth are required.');
      return;
    }

    const passportRegex = /^[A-Z][0-9]{7}$/i;
    if (!passportRegex.test(formData.passportNo)) {
        setError('Invalid Passport Number format. It should be 1 letter followed by 7 digits (e.g., A1234567).');
        showToast('Invalid Passport Number format.', 'warning');
        return;
    }

    // Format DOB to dd/mm/yyyy if it's from standard HTML date input (yyyy-mm-dd)
    let formattedDob = formData.dob;
    if (formData.dob.includes('-')) {
      const parts = formData.dob.split('-');
      if (parts.length === 3) formattedDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${PASSPORT_API_BASE}/verify?passportNo=${formData.passportNo.toUpperCase()}&dob=${formattedDob}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 402) throw new Error('Insufficient credits for Passport verification.');
        
        let errorMsg = `Server error: ${responseText.substring(0, 100)}`;
        try {
          const errData = JSON.parse(responseText);
          if (errData.message) errorMsg = errData.message;
        } catch(e) {}
        
        if (response.status === 409) {
          throw new Error(errorMsg || 'Warning: This Passport has already been verified.');
        }
        
        throw new Error(errorMsg);
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Verification failed: Invalid response from provider.');
      }

      if (parsed.status === false || parsed.status === 'failed' || parsed.status === 'error' || parsed.error || (parsed.status_code && parsed.status_code !== 200 && parsed.status_code !== 101)) {
        throw new Error(parsed.message || parsed.error || 'Passport Verification Failed.');
      }

      const dd = parsed.data || parsed;

      const finalData = {
        name: dd.name || dd.full_name || dd.surname ? `${dd.given_name || ''} ${dd.surname || ''}`.trim() : formData.name,
        passportNo: formData.passportNo.toUpperCase(),
        dob: dd.dob || formattedDob,
        typeOfApplication: dd.type_of_application || 'Ordinary',
        applicationDate: dd.application_date || 'N/A'
      };

      setPassportData(finalData);
      setStatus('verified');
      showToast('Passport Verification Successful', 'success');
      fetchHistory();
      fetchBalance();
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setStatus('pending');
    setFormData({ passportNo: '', name: '', dob: '' });
    setPassportData(null);
    setError('');
  };

  const filteredHistory = history.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.passportNo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  return (
    <div className="vh-module-container">
      <div className="aadhar-grid">
        {/* Left Column: Form and Informational Cards */}
        <div className="vh-col-left">
          {status === 'pending' ? (
            <div className="vh-card vh-form-card animate-fade-in">
              <div className="vh-card-header">
                <div className="vh-card-icon"><Plane size={20} /></div>
                <div className="vh-card-titles">
                  <h2>Passport Details</h2>
                  <p>Verify Central Passport Organization (CPO) Records</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="vh-form-grid-v2">
                <div className="vh-form-group">
                  <label>Passport Number <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="vh-input uppercase"
                    placeholder="L1234567"
                    maxLength={8}
                    pattern="^[A-Za-z][0-9]{7}$"
                    title="Please enter a valid Passport Number (1 letter followed by 7 digits)"
                    value={formData.passportNo}
                    onChange={e => { setFormData({ ...formData, passportNo: e.target.value.toUpperCase() }); setError(''); }}
                    required
                  />
                </div>

                <div className="vh-form-group">
                  <label>Date of Birth <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="date"
                    className="vh-input"
                    value={formData.dob}
                    onChange={e => { setFormData({ ...formData, dob: e.target.value }); setError(''); }}
                    required
                  />
                </div>

                <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="vh-btn-teal" disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loading ? 'Verifying...' : 'Verify Passport'}
                  </button>
                </div>
              </form>

              {error && <div className="vh-alert error"><AlertCircle size={16} /> {error}</div>}
            </div>
          ) : (
            <div className="vh-card vh-result-card animate-fade-in">
              <div className="vh-result-banner success">
                <CheckCircle size={18} /> Verification Successful
              </div>
              <div className="vh-result-body">
                <div className="vh-result-profile">
                  <div className="vh-profile-placeholder"><Plane size={32} /></div>
                  <div className="vh-profile-info">
                    <h3 style={{ textTransform: 'uppercase' }}>{passportData?.name || formData.name}</h3>
                    <p>{passportData?.passportNo}</p>
                    <span className="vh-badge-verified">Valid Record</span>
                  </div>
                </div>
                <div className="vh-details-grid">
                  <div className="vh-detail-item"><label>Date of Birth</label><span>{passportData?.dob}</span></div>
                  <div className="vh-detail-item"><label>Application Type</label><span>{passportData?.typeOfApplication}</span></div>
                  <div className="vh-detail-item"><label>Application Date</label><span>{passportData?.applicationDate}</span></div>
                </div>
                <div className="vh-result-actions">
                  <button className="vh-btn-teal" onClick={resetVerification}>
                    Verify Another
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Verification Process Card */}
          <div className="vh-card vh-process-card">
            <div className="vh-process-header">
              <h3>VERIFICATION PROCESS</h3>
              <p>Simple, secure, and instant</p>
            </div>
            <div className="vh-stepper">
              <div className="vh-step-item active">
                <div className="vh-step-circle"><FileText size={18} /></div>
                <span>Input Data</span>
              </div>
              <div className="vh-step-line" />
              <div className="vh-step-item">
                <div className="vh-step-circle"><ShieldCheck size={18} /></div>
                <span>Secure Auth</span>
              </div>
              <div className="vh-step-line" />
              <div className="vh-step-item">
                <div className="vh-step-circle"><CheckCircle2 size={18} /></div>
                <span>Get Results</span>
              </div>
            </div>
          </div>

          {/* Trusted Badges Grid */}
          <div className="vh-features-grid">
            <div className="vh-feature-card">
              <div className="vh-feature-icon"><ShieldCheck size={18} /></div>
              <div className="vh-feature-text">
                <h4>256-Bit Encryption</h4>
                <p>End-to-end encrypted</p>
              </div>
            </div>
            <div className="vh-feature-card">
              <div className="vh-feature-icon"><CheckCircle2 size={18} /></div>
              <div className="vh-feature-text">
                <h4>100% Compliant</h4>
                <p>RBI & Govt standard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="vh-col-right">
          <div className="vh-card vh-history-card">
            <div className="vh-history-header">
              <h3>Recent Verifications</h3>
              <div className="vh-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>
            <div className="vh-history-body">
              <table className="vh-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>PASSPORT NO</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                     [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan="3">
                          <div className="skeleton skeleton-table-row" style={{ height: '40px', margin: '4px 0' }}></div>
                        </td>
                      </tr>
                    ))
                  ) : currentRecords.length > 0 ? currentRecords.map(record => (
                    <tr key={record.id || record.passportNo + Math.random()}>
                      <td className="vh-td-name">{record.name || 'N/A'}</td>
                      <td className="vh-td-code">{record.passportNo}</td>
                      <td>
                        <div className="vh-td-actions">
                          <button
                            title="Download Certificate"
                            onClick={() => handleDownloadPdf(record)}
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="vh-no-data">No history found</td></tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="vh-table-footer">
                  <span className="vh-page-info">Page {currentPage} of {totalPages}</span>
                  <div className="vh-pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
