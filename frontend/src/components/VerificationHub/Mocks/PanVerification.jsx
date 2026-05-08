import React, { useState, useEffect } from 'react';
import { CreditCard, Search, FileText, CheckCircle, Database, Loader2, AlertCircle, Eye, ShieldCheck, History, User, RotateCcw, Download, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import SecurityInfoWidget from '../../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../../Shared/HowItWorksWidget';
import '../../AadharVerification/AadharVerification.css';
import API_BASE_URL from '../../../config';

const PAN_API_BASE = `${API_BASE_URL}/PanProxy`;

export default function PanVerification() {
  const { showToast, balance, user, fetchBalance } = useApp();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, verified
  const [formData, setFormData] = useState({ panNumber: '', name: '', dob: '', panType: 'Individual' });
  const [panData, setPanData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistoryDetail, setShowHistoryDetail] = useState(null);
  const recordsPerPage = 10;

  // PDF Generation function matching the exact user screenshot
  const handleDownloadPdf = async (record) => {
    let refId = 'N/A';
    try {
      const rw = JSON.parse(record.rawResponse);
      if (rw.reference_id) refId = rw.reference_id;
    } catch (e) { }

    const nameParts = record.name ? record.name.split(' ') : [];
    let fName = nameParts.length > 0 ? nameParts[0] : '';
    let lName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    let mName = nameParts.length > 2 ? nameParts.slice(1, nameParts.length - 1).join(' ') : '';
    if (nameParts.length === 1) lName = '';

    // Fetch the authentic full Bank Name (Client Name) dynamically from the backend
    let clientName = 'Authorized Bank';
    try {
      const codeToFetch = record.clientCode || user?.clientCode;
      if (codeToFetch) {
        const resp = await fetch(`${API_BASE_URL}/Client/${codeToFetch}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (resp.ok) {
          const cData = await resp.json();
          if (cData && cData.name) {
            clientName = cData.name;
          } else {
            clientName = codeToFetch; // Fallback to shortcode
          }
        } else {
          clientName = codeToFetch; // Fallback to shortcode if API fails
        }
      }
    } catch (err) {
      if (record.clientCode) clientName = record.clientCode;
    }
    const categoryName = record.panType ? record.panType.toUpperCase() : 'INDIVIDUAL';

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.innerHTML = `
      <div style="width: 7.5in; padding: 0.4in; box-sizing: border-box; font-family: 'Arial', sans-serif; background: #fff; color: #000; border: 2px solid #000; margin: 0 auto; min-height: 10in;">
        
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">${clientName}</h1>
          <h3 style="margin: 5px 0 5px 0; font-size: 16px; font-weight: bold; color: #000;">Pan Detail Verification Certificate</h3>
          <p style="margin: 0; font-size: 14px; text-transform: uppercase;">TO WHOMSOEVER IT MAY CONCERN</p>
        </div>

        <div style="margin-bottom: 25px;">
          <p style="margin: 0; font-size: 13px; line-height: 1.5;">This is to Certify that ${record.name}, Pan No. ${record.panNo} are verified from https://www.pan.utiitsl.com/.</p>
        </div>

        <div style="border: 2px solid #000; padding: 20px; margin-bottom: 50px;">
          <table style="width: 100%; font-size: 13px; line-height: 2;">
            <tr><td style="width: 40%; font-weight: bold;">Status</td><td>: success</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Id Number</td><td>: ${record.panNo}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">First Name</td><td>: ${fName}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Middle Name</td><td>: ${mName}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Last Name</td><td>: ${lName}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Full Name</td><td>: ${record.name}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Reference ID</td><td>: ${refId}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">PAN Status</td><td>: VALID</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Category</td><td>: ${categoryName}</td></tr>
            <tr><td style="width: 40%; font-weight: bold;">Aadhaar Seeding Status</td><td>: Successful</td></tr>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 13px; line-height: 2; margin-top: 60px;">
          <div style="width: 45%;">
            <p style="font-weight: bold; margin-bottom: 15px;">Signature of the Authorised Signatory</p>
            <p style="margin:0;">Name:<span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left:10px;"></span></p>
            <p style="margin:0;">Designation:<span style="border-bottom: 1px solid #000; display: inline-block; width: 163px; margin-left:10px;"></span></p>
            <p style="margin:0;">Phone no.:<span style="border-bottom: 1px solid #000; display: inline-block; width: 173px; margin-left:10px;"></span></p>
            <p style="margin-top: 40px;">(Bank Seal)</p>
          </div>
          <div style="width: 45%;">
            <p style="font-weight: bold; margin-bottom: 15px;">Signature of the Branch Manager</p>
            <p style="margin:0;">Name:<span style="border-bottom: 1px solid #000; display: inline-block; width: 200px; margin-left:10px;"></span></p>
            <p style="margin:0;">Designation:<span style="border-bottom: 1px solid #000; display: inline-block; width: 163px; margin-left:10px;"></span></p>
            <p style="margin:0;">Date:<span style="border-bottom: 1px solid #000; display: inline-block; width: 207px; margin-left:10px;"></span></p>
            <p style="margin-top: 40px; margin-left: 20px;">Verified By : User</p>
          </div>
        </div>

      </div>
    `;
    document.body.appendChild(printContainer);

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const opt = {
        margin: 0.2, // slightly smaller margin to accommodate border gracefully
        filename: `PAN_Certificate_${record.panNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().from(printContainer.firstElementChild).set(opt).save();
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
      const response = await fetch(`${PAN_API_BASE}/history?pageSize=100`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.items || []);
      }
    } catch (err) {
    } finally {
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

    if (!formData.panNumber || formData.panNumber.length < 10) {
      setError('Please enter a valid 10-digit PAN.');
      showToast('Please enter a valid 10-digit PAN.', 'warning');
      return;
    }
    if (!formData.name) {
      setError('Name on PAN is required.');
      showToast('Name on PAN is required.', 'warning');
      return;
    }
    if (!formData.dob) {
      setError('Date of Birth is required.');
      showToast('Date of Birth is required.', 'warning');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${PAN_API_BASE}/verify?pan=${formData.panNumber.toUpperCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dob: formData.dob,
          panType: formData.panType,
          name: formData.name
        })
      });
      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 402) throw new Error('Insufficient credits for PAN verification.');
        
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
        throw new Error('Verification failed: Invalid PAN or provider unavailable.');
      }

      // Standard failure checks for common verification API responses - Strictly enforcing 200 status code
      const isFailed = parsed.status === false || 
                       parsed.status === 'failed' || 
                       parsed.status === 'Failed' || 
                       parsed.error || 
                       (parsed.status_code && Number(parsed.status_code) !== 200) ||
                       (parsed.statusCode && Number(parsed.statusCode) !== 200) ||
                       (parsed.statuscode && Number(parsed.statuscode) !== 200);

      if (isFailed) {
        const errorMsg = parsed.message || parsed.error || (parsed.data && parsed.data.message) || 'PAN Verification Failed.';
        throw new Error(errorMsg);
      }

      const d = parsed.data || parsed;
      // Use API returned name if available and not 'N/A', otherwise use user input
      let returnedName = d.full_name || d.name || d.fullName || d.Name || 'N/A';
      if (returnedName === 'N/A') returnedName = formData.name;

      const finalData = {
        name: returnedName,
        pan: formData.panNumber.toUpperCase(),
        dob: formData.dob,
        panType: formData.panType,
        status: 'Active'
      };

      setPanData(finalData);
      setStatus('verified');
      showToast('PAN Verification Successful', 'success');
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
    setFormData({ panNumber: '', name: '', dob: '', panType: 'Individual' });
    setPanData(null);
    setError('');
  };

  const filteredHistory = history.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.panNo?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <div className="vh-card-icon"><CreditCard size={20} /></div>
                <div className="vh-card-titles">
                  <h2>PAN Details</h2>
                  <p>Verify Income Tax Department Records</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="vh-form-grid-v2">
                <div className="vh-form-group">
                  <label>PAN Number <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="vh-input uppercase"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    pattern="^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$"
                    title="Please enter a valid 10-character PAN number (e.g., ABCDE1234F)"
                    value={formData.panNumber}
                    onChange={e => { setFormData({ ...formData, panNumber: e.target.value.toUpperCase() }); setError(''); }}
                    required
                  />
                </div>

                <div className="vh-form-group">
                  <label>Name on PAN <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="vh-input"
                    placeholder=""
                    value={formData.name}
                    onChange={e => { setFormData({ ...formData, name: e.target.value }); setError(''); }}
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

                <div className="vh-form-group">
                  <label>PAN Entity Type</label>
                  <select
                    className="vh-input"
                    value={formData.panType}
                    onChange={e => setFormData({ ...formData, panType: e.target.value })}
                  >
                    <option>Individual</option>
                    <option>Company</option>
                    <option>HUF</option>
                    <option>Partnership Firm</option>
                  </select>
                </div>

                <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="vh-btn-teal">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loading ? 'Verifying...' : 'Fetch PAN Details'}
                  </button>
                  <button type="button" className="vh-btn-outline" onClick={resetVerification} disabled={loading}>
                    <RotateCcw size={16} /> Reset
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
                  <div className="vh-profile-placeholder"><CheckCircle size={32} /></div>
                  <div className="vh-profile-info">
                    <h3>{panData?.name}</h3>
                    <p>{panData?.pan}</p>
                    <span className="vh-badge-verified">Authenticated</span>
                  </div>
                </div>
                <div className="vh-details-grid">
                  <div className="vh-detail-item"><label>Entity Type</label><span>{panData?.panType}</span></div>
                  <div className="vh-detail-item"><label>Date of Birth</label><span>{panData?.dob || 'Not provided'}</span></div>
                  <div className="vh-detail-item"><label>Status</label><span style={{ color: '#10b981' }}>Active</span></div>
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
                    <th>PAN</th>
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
                    <tr key={record.id || record.panNo + Math.random()}>
                      <td className="vh-td-name">{record.name}</td>
                      <td className="vh-td-code">{record.panNo}</td>
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

      {/* Detail Overlay Modal */}
      {showHistoryDetail && (
        <div className="compact-overlay" onClick={() => setShowHistoryDetail(null)}>
          <div className="compact-modal-box" onClick={e => e.stopPropagation()}>
            <div className="compact-modal-header">
              <h4>Verification Detail</h4>
              <button className="btn-close-icon" onClick={() => setShowHistoryDetail(null)}>×</button>
            </div>
            <div className="compact-modal-body">
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', border: '1px solid #d1fae5' }}>
                  <CheckCircle size={28} />
                </div>
                <div>
                  <h3 style={{ margin: '0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{showHistoryDetail.name}</h3>
                  <p style={{ margin: '2px 0 0', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{showHistoryDetail.panNo}</p>
                </div>
              </div>
              <div className="result-details-compact">
                <div className="bg-info-item"><span className="bg-label">Status</span><span className="bg-value" style={{ color: '#10b981' }}>Active</span></div>
                <div className="bg-info-item full"><span className="bg-label">Verified At</span><span className="bg-value">{new Date(showHistoryDetail.verifiedAt).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="compact-modal-footer">
              <button
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                onClick={() => handleDownloadPdf(showHistoryDetail)}
              >
                <Download size={14} /> Download Certificate
              </button>
              <button className="btn-close-solid" onClick={() => setShowHistoryDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
