import React, { useState, useEffect } from 'react';
import { Building2, Search, FileText, CheckCircle, Database, Loader2, AlertCircle, ShieldCheck, RotateCcw, CheckCircle2, Download } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import SecurityInfoWidget from '../../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../../Shared/HowItWorksWidget';
import '../../AadharVerification/AadharVerification.css';
import API_BASE_URL from '../../../config';

const GST_API_BASE = `${API_BASE_URL}/GstProxy`;

export default function GstVerification() {
  const { user, showToast, balance, fetchBalance } = useApp();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [formData, setFormData] = useState({ gstin: '' });
  const [gstData, setGstData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // ─── PDF Generation ───
  const handleDownloadPdf = async (record) => {
    let raw = {};
    try { raw = JSON.parse(record.rawResponse || '{}'); } catch (e) { }
    const d = raw.data || raw;

    const formatAddress = (addr) => {
      if (!addr || typeof addr !== 'object') return String(addr || '');
      return [addr.addr1, addr.addr2, addr.locality, addr.city, addr.district, addr.state, addr.pin].filter(Boolean).join(', ');
    };

    const gstin = d.gstin || record.gstin || '';
    const panNumber = d.pan_number || '';
    const businessName = d.business_name || d.trade_name || record.name || '';
    const legalName = d.legal_name || businessName;
    const taxpayerType = d.taxpayer_type || '';
    const gstStatus = d.gstin_status || '';
    const regDate = d.date_of_registration || '';
    const natureBusiness = Array.isArray(d.nature_bus_activities) ? d.nature_bus_activities.join(', ') : (d.nature || '');
    const constitution = d.constitution_of_business || d.business_type || '';
    const centerJurisdiction = d.center_jurisdiction || '';
    const stateJurisdiction = d.state_jurisdiction || '';
    const address = formatAddress(d.address);
    const fieldVisit = d.field_visit_conducted || 'No';
    const aadhaarValidation = d.aadhaar_validation || 'No';
    const aadhaarDate = d.aadhaar_validation_date || '';
    const cancelDate = d.date_of_cancellation || '';
    const clientId = d.client_id || '';
    const activityCode = d.nature_of_core_business_activity_code || '';
    const activityDesc = d.nature_of_core_business_activity_description || '';
    const einvoiceStatus = d.einvoice_status || '';

    let filingHtml = '';
    const filingData = d.filing_status || [];
    if (Array.isArray(filingData) && filingData.length > 0) {
      filingHtml = `<div style="margin-top: 25px;"><p style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">Filing Status:</p>` +
        filingData.map(f =>
          `<p style="margin: 3px 0; font-size: 12px;"><strong>${f.return_type || ''} (${f.tax_period || ''}): ${f.status || 'Filed'}</strong><br/>&nbsp;&nbsp;Date of Filing - ${f.date_of_filing || ''}</p>`
        ).join('') + `</div>`;
    }

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

    const row = (label, value) => `<tr><td style="width:35%;font-weight:bold;vertical-align:top;padding:3px 0;font-size:13px;">${label}</td><td style="padding:3px 0;font-size:13px;">${value}</td></tr>`;

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    // SINGLE continuous div — NO min-height, NO page-break-after, NO separate page containers
    printContainer.innerHTML = `
      <div style="width:190mm; padding:10mm; font-family:Arial,sans-serif; color:#000; background:#fff;">
        <div style="text-align:center; margin-bottom:20px;">
          <h1 style="margin:0; font-size:22px; font-weight:bold; font-style:italic;">${clientName}</h1>
          <h3 style="margin:5px 0; font-size:15px; font-weight:bold;">GST Verification Certificate</h3>
          <p style="margin:0; font-size:12px; text-transform:uppercase;">TO WHOMSOEVER IT MAY CONCERN</p>
        </div>
        <p style="font-size:12px; line-height:1.6; margin-bottom:15px;">This is to certify that ${businessName}, GST No. ${gstin}, are verified.</p>
        <table style="width:100%; border-collapse:collapse; line-height:1.7;">
          ${row('GSTIN', gstin)}
          ${row('Pan Number', panNumber)}
          ${row('Business Name', businessName)}
          ${row('Legal Name', legalName)}
          ${row('Taxpayer Type', taxpayerType)}
          ${row('GST Status', gstStatus)}
          ${row('Date of Registration', regDate)}
          ${row('Nature of Core Business', natureBusiness)}
          ${row('Constitution of Business', constitution)}
          ${row('Center Jurisdiction', centerJurisdiction)}
          ${row('State Jurisdiction', stateJurisdiction)}
          ${row('Address', address)}
          ${row('Field Visit Conducted', fieldVisit)}
          ${row('Aadhaar Validation', aadhaarValidation)}
          ${row('Aadhaar Validation Date', aadhaarDate)}
          ${row('Date of Cancellation', cancelDate)}
          ${row('Client ID', clientId)}
          ${row('Nature of Core Business Activity Code', activityCode)}
          ${row('Nature of Core Business', natureBusiness)}
          ${row('Activity Description', activityDesc)}
          ${row('E-Invoice Status', einvoiceStatus)}
        </table>
        ${filingHtml}
        <div style="display:flex; justify-content:space-between; font-size:13px; line-height:2; margin-top:50px;">
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
        margin: [10, 10, 10, 10], // mm: top, left, bottom, right
        filename: `GST_Certificate_${record.gstin}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
      });

      // Generate PDF, then draw border on each page
      const pdf = await worker.outputPdf('dataurlstring');
      // Use the toPdf -> get approach to access jsPDF instance
      await html2pdf().from(printContainer.firstElementChild).set({
        margin: [10, 10, 10, 10],
        filename: `GST_Certificate_${record.gstin}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
      }).toPdf().get('pdf').then((pdfDoc) => {
        const totalPages = pdfDoc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdfDoc.setPage(i);
          pdfDoc.setDrawColor(0, 0, 0);
          pdfDoc.setLineWidth(0.5);
          // Draw rectangle inside margins: x=5mm, y=5mm, w=200mm, h=287mm
          pdfDoc.rect(5, 5, 200, 287);
        }
        pdfDoc.save(`GST_Certificate_${record.gstin}.pdf`);
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
      const response = await fetch(`${GST_API_BASE}/history?pageSize=100`, {
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

    if (!formData.gstin || formData.gstin.length < 15) {
      setError('Please enter a valid 15-character GSTIN.');
      showToast('Please enter a valid 15-character GSTIN.', 'warning');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${GST_API_BASE}/verify?gst=${formData.gstin.toUpperCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 402) throw new Error('Insufficient credits for GST verification.');
        
        let errorMsg = `Server error: ${response.status}`;
        try {
          const errData = JSON.parse(responseText);
          errorMsg = errData.message || (errData.error ? (typeof errData.error === 'string' ? errData.error : JSON.stringify(errData.error)) : `Error ${response.status}`);
        } catch (e) {
          errorMsg = responseText.substring(0, 100) || `Server error ${response.status}`;
        }
        throw new Error(errorMsg);
      }

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Verification failed: Invalid GSTIN or provider unavailable.');
      }

      if (parsed.status === false || parsed.status === 'failed' || parsed.status === 'Failed' || parsed.error || (parsed.status_code && parsed.status_code !== 200 && parsed.status_code !== 101)) {
        const errMsg = parsed.message || parsed.error || 'GST Verification Failed.';
        throw new Error(errMsg);
      }

      const dd = parsed.data || parsed;

      const finalData = {
        name: dd.business_name || dd.trade_name || dd.legal_name || 'N/A',
        gstin: formData.gstin.toUpperCase(),
        taxpayerType: dd.taxpayer_type || 'N/A',
        registrationDate: dd.date_of_registration || 'N/A',
        gstStatus: dd.gstin_status || 'Active',
      };

      setGstData(finalData);
      setStatus('verified');
      showToast('GST Verification Successful', 'success');
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
    setFormData({ gstin: '' });
    setGstData(null);
    setError('');
  };

  const filteredHistory = history.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="vh-card-icon"><Building2 size={20} /></div>
                <div className="vh-card-titles">
                  <h2>Legal Details</h2>
                  <p>Verify Commercial Tax / Goods and Services Tax Network</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="vh-form-grid-v2">
                <div className="vh-form-group required">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    className="vh-input uppercase"
                    placeholder="27ABCDE1234F1Z5"
                    maxLength={15}
                    pattern="^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[A-Za-z0-9]{3}$"
                    title="Please enter a valid 15-character GSTIN (e.g., 27ABCDE1234F1Z5)"
                    value={formData.gstin}
                    onChange={e => { setFormData({ ...formData, gstin: e.target.value.toUpperCase() }); setError(''); }}
                    required
                  />
                  <span className="vh-hint">GSTIN is a 15-character structure. E.g., State Code (2) + PAN (10) + Entity (1) + Z (1) + Checksum (1).</span>
                </div>

                <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="vh-btn-teal" disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loading ? 'Verifying...' : 'Verify GSTIN'}
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
                  <div className="vh-profile-placeholder"><Building2 size={32} /></div>
                  <div className="vh-profile-info">
                    <h3>{gstData?.name}</h3>
                    <p style={{ textTransform: 'uppercase' }}>{gstData?.gstin}</p>
                    <span className="vh-badge-verified">{gstData?.gstStatus || 'Active'}</span>
                  </div>
                </div>
                <div className="vh-details-grid">
                  <div className="vh-detail-item"><label>Taxpayer Type</label><span>{gstData?.taxpayerType}</span></div>
                  <div className="vh-detail-item"><label>Registration Date</label><span>{gstData?.registrationDate}</span></div>
                  <div className="vh-detail-item" style={{ gridColumn: '1 / -1' }}><label>Status</label><span style={{ color: '#10b981', fontWeight: 600 }}>{gstData?.gstStatus}</span></div>
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
                    <th>BUSINESS NAME</th>
                    <th>GSTIN</th>
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
                    <tr key={record.id || record.gstin + Math.random()}>
                      <td className="vh-td-name">{record.name}</td>
                      <td className="vh-td-code">{record.gstin}</td>
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
