import React, { useState, useEffect } from 'react';
import { UserSquare, Search, FileText, CheckCircle, Database, Loader2, AlertCircle, ShieldCheck, RotateCcw, CheckCircle2, Download } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import SecurityInfoWidget from '../../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../../Shared/HowItWorksWidget';
import '../../AadharVerification/AadharVerification.css';
import API_BASE_URL from '../../../config';

const VOTER_API_BASE = `${API_BASE_URL}/VoterProxy`;

export default function VoterIdVerification() {
  const { user, showToast, balance, fetchBalance } = useApp();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [formData, setFormData] = useState({ epicNo: '', name: '', state: 'Maharashtra', district: 'Pune' });
  const [voterData, setVoterData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${VOTER_API_BASE}/history?pageSize=100`, {
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

  // ─── PDF Generation ───
  const handleDownloadPdf = async (record) => {
    let raw = {};
    try { raw = JSON.parse(record.rawResponse || '{}'); } catch (e) { }
    const d = raw.data || raw;

    const epicNo = d.epic_no || d.voter_id || record.voterId || record.epicNo || '';
    const name = d.name || d.fullName || d.voterName || record.name || '';
    const relationName = d.relation_name || d.father_name || '';
    const relationType = d.relation_type || d.relationType || '';
    const dob = d.dob || d.date_of_birth || '';
    const age = d.age || '';
    const gender = d.gender || '';
    const state = d.state || d.st_name || '';
    const district = d.district || d.dist_name || '';
    const acName = d.assembly_constituency || d.ac_name || '';
    const acNo = d.assembly_constituency_number || d.ac_no || '';
    const pcName = d.parliamentary_name || d.parliamentary_constituency || d.pc_name || '';
    const pcNo = d.parliamentary_number || d.pc_no || '';
    const partName = d.part_name || '';
    const partNo = d.part_number || d.part_no || '';
    const pollingStation = d.polling_station || '';

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

    const row = (label, value, isBold = false) => {
      if (value === undefined || value === null || value === '') return '';
      return `
        <tr>
          <td style="width:30%; padding:3px 0; font-size:13px; vertical-align:top; ${isBold ? 'font-weight:bold;' : ''}">${label}</td>
          <td style="width:5%; text-align:center; padding:3px 0; font-size:13px; vertical-align:top; ${isBold ? 'font-weight:bold;' : ''}">:</td>
          <td style="padding:3px 0; font-size:13px; vertical-align:top;">${value}</td>
        </tr>
      `;
    };

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';

    // Applying the layout exact mapping from PDF format requirements
    printContainer.innerHTML = `
      <div style="width:210mm; min-height:296mm; padding:15mm; box-sizing:border-box; font-family:Arial,sans-serif; color:#000; background:#fff; position:relative;">
        <div style="text-align:center; margin-bottom:20px; padding-top: 10px;">
          <h1 style="margin:0; font-size:24px; font-weight:bold; color:#000;">${clientName}</h1>
          <h3 style="margin:5px 0 5px 0; font-size:16px; font-weight:bold; color:#000;">Voter ID Verification Certificate</h3>
          <p style="margin:0; font-size:14px; text-transform:uppercase;">TO WHOMSOEVER IT MAY CONCERN</p>
        </div>

        <div style="margin-bottom:20px;">
          <p style="margin:0; font-size:14px; line-height:1.6;">This is to Certify that <strong style="text-transform:uppercase;">${name}</strong>, Voter Id No. <strong style="text-transform:uppercase;">${epicNo}</strong> are verified.</p>
        </div>

        <div style="border: 2px solid #000; padding: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${row('Status', 'success', true)}
            ${row('Id Number', epicNo)}
            ${row('Name', name)}
            ${row('Age', age)}
            ${row('Gender', gender)}
            ${row('Relation Name', relationName)}
            ${row('Relation Type', relationType)}
            ${row('State', state)}
            ${row('District', district)}
            ${row('Polling Station', pollingStation)}
            ${row('Assembly Constituency', acName)}
            ${row('Constituency Number', acNo)}
            ${row('Part Number', partNo)}
            ${row('Part Name', partName)}
            ${row('Parliamentary Name', pcName)}
            ${row('Parliamentary Number', pcNo)}
          </table>
        </div>

        <div style="margin-top:40px; display:flex; justify-content:space-between; font-size:13px; line-height:2;">
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
        margin: [0, 0, 0, 0],
        filename: `VoterID_Certificate_${epicNo}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] }
      });

      const pdf = await worker.outputPdf('dataurlstring');
      await html2pdf().from(printContainer.firstElementChild).set({
        margin: [0, 0, 0, 0],
        filename: `VoterID_Certificate_${epicNo}.pdf`,
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
          pdfDoc.rect(8, 8, 194, 281);
        }
        pdfDoc.save(`VoterID_Certificate_${epicNo}.pdf`);
      });
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      document.body.removeChild(printContainer);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    // Credit Check
    if (user?.role !== 'SUPER_ADMIN' && balance <= 0) {
      showToast('please add credits', 'warning');
      return;
    }

    if (!formData.epicNo) {
      setError('EPIC Number is required.');
      showToast('EPIC Number is required.', 'warning');
      return;
    }

    // Epic Number should be alphanumeric and exactly 10 characters long
    const voterRegex = /^[A-Za-z0-9]{10}$/i;
    if (!voterRegex.test(formData.epicNo)) {
      setError('Invalid Voter ID format. Should be exactly 10 characters.');
      showToast('Invalid Voter ID format.', 'warning');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${VOTER_API_BASE}/verify?voterId=${encodeURIComponent(formData.epicNo.toUpperCase())}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 402) throw new Error('Insufficient credits for Voter ID verification.');
        
        let errorMsg = `Server error: ${responseText.substring(0, 100)}`;
        try {
          const errData = JSON.parse(responseText);
          if (errData.message) errorMsg = errData.message;
        } catch(e) {}
        
        if (response.status === 409) {
          throw new Error(errorMsg || 'Warning: This Voter ID has already been verified.');
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
        throw new Error(parsed.message || parsed.error || 'Voter ID Verification Failed.');
      }

      const dd = parsed.data || parsed;

      const finalData = {
        name: dd.name || dd.fullName || dd.voterName || dd.name_v1 || formData.name || 'N/A',
        epicNo: dd.epic_no || formData.epicNo.toUpperCase(),
        fatherName: dd.relation_name || dd.father_name || 'N/A',
        age: dd.age || dd.dob || 'N/A',
        acName: dd.ac_name || dd.assembly_constituency || 'N/A',
        pcName: dd.pc_name || dd.parliamentary_constituency || 'N/A',
        state: dd.state || dd.st_name || formData.state || 'N/A',
        district: dd.district || dd.dist_name || formData.district || 'N/A'
      };

      setVoterData(finalData);
      setStatus('verified');
      showToast('Voter ID Verification Successful', 'success');
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
    setFormData({ ...formData, epicNo: '' });
    setVoterData(null);
    setError('');
  };

  const filteredHistory = history.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.voterId || record.epicNo)?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="vh-card-icon"><UserSquare size={20} /></div>
                <div className="vh-card-titles">
                  <h2>EPIC Details</h2>
                  <p>Verify Election Commission of India Records</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="vh-form-grid-v2">
                <div className="vh-form-group">
                  <label>Voter ID / EPIC No. <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="vh-input uppercase"
                    placeholder="ABC1234567"
                    maxLength={10}
                    pattern="^[A-Za-z0-9]{10}$"
                    title="Please enter a valid 10-character EPIC Number (e.g. ABC1234567)"
                    value={formData.epicNo}
                    onChange={e => { setFormData({ ...formData, epicNo: e.target.value.toUpperCase() }); setError(''); }}
                    required
                  />
                </div>

                

                <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="vh-btn-teal" disabled={loading || !formData.epicNo}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loading ? 'Verifying...' : 'Verify Voter ID'}
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
                  <div className="vh-profile-placeholder"><UserSquare size={32} /></div>
                  <div className="vh-profile-info">
                    <h3 style={{ textTransform: 'uppercase' }}>{voterData?.name}</h3>
                    <p style={{ textTransform: 'uppercase' }}>{voterData?.epicNo}</p>
                    <span className="vh-badge-verified">Valid Record</span>
                  </div>
                </div>
                <div className="vh-details-grid">
                  <div className="vh-detail-item"><label>Age / DOB</label><span>{voterData?.age}</span></div>
                  <div className="vh-detail-item"><label>Relative Name</label><span>{voterData?.fatherName}</span></div>
                  <div className="vh-detail-item"><label>State</label><span>{voterData?.state}</span></div>
                  <div className="vh-detail-item"><label>District</label><span>{voterData?.district}</span></div>
                  <div className="vh-detail-item" style={{ gridColumn: '1 / -1' }}><label>Assembly Const. (AC)</label><span>{voterData?.acName}</span></div>
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
                    <th>EPIC NO</th>
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
                    <tr key={record.id || record.voterId + Math.random()}>
                      <td className="vh-td-name">{record.name || 'N/A'}</td>
                      <td className="vh-td-code">{record.voterId || record.epicNo}</td>
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
