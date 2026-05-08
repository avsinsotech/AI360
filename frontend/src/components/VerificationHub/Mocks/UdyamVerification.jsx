import React, { useState, useEffect } from 'react';
import { Briefcase, Search, FileText, CheckCircle, Database, Loader2, AlertCircle, Eye, ShieldCheck, History, User, RotateCcw, Download, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import SecurityInfoWidget from '../../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../../Shared/HowItWorksWidget';
import '../../AadharVerification/AadharVerification.css';
import API_BASE_URL from '../../../config';

const UDYAM_API_BASE = `${API_BASE_URL}/UdyamProxy`;

export default function UdyamVerification() {
  const { user, showToast, balance, fetchBalance } = useApp();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, verified
  const [formData, setFormData] = useState({ udyamNo: '' });
  const [udyamData, setUdyamData] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showHistoryDetail, setShowHistoryDetail] = useState(null);
  const recordsPerPage = 10;

  // PDF Generation function
  // PDF Generation function
  const handleDownloadPdf = async (record) => {
    // Fetch the authentic full Bank Name (Client Name) dynamically from the backend
    let clientName = 'AVS AI 360 Admin'; // Default for GLOBAL
    try {
      const codeToFetch = record.clientCode || user?.clientCode;
      if (codeToFetch && codeToFetch !== 'GLOBAL') {
        const resp = await fetch(`${API_BASE_URL}/Client/${codeToFetch}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (resp.ok) {
          const cData = await resp.json();
          if (cData && cData.name) {
            clientName = cData.name;
          } else {
            clientName = codeToFetch;
          }
        } else {
          clientName = codeToFetch;
        }
      }
    } catch (err) {
      if (record.clientCode && record.clientCode !== 'GLOBAL') clientName = record.clientCode;
    }

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    
    // Deep data mapping from raw JSON
    let raw = {};
    try { raw = JSON.parse(record.rawResponse || '{}'); } catch(e) {}
    const d = raw.data || raw;

    const getValue = (val) => {
      if (!val || val === 'N/A' || val === 'null' || val === 'undefined') return null;
      return val;
    };

    const ed = d.enterprise_data || {};
    const enterpriseName = getValue(ed.name || d.enterprise_name || d.name || record.name);
    const udyamNo = getValue(ed.document_id || d.udyam_no || record.udyamNo);
    const majorActivity = getValue(ed.major_activity || d.majorActivity);
    const enterpriseType = getValue(ed.enterprise_type || d.enterpriseType);
    const organizationType = getValue(ed.organization_type || d.organizationType);
    const mobile = getValue(ed.mobile || d.mobileNo);
    const email = getValue(ed.email);
    
    // Address Object Formatter
    let address = null;
    if (ed.address && typeof ed.address === 'object') {
       const addr = ed.address;
       address = [addr.door_no, addr.building, addr.street, addr.area, addr.city, addr.district, addr.state, addr.pincode]
                  .filter(Boolean).join(', ');
    } else {
       address = getValue(ed.address || d.address || d.office_address);
    }

    const regDate = getValue(ed.date_of_udyam_registration || d.registration_date);
    const msmeDi = getValue(ed.msme_di || d.msmeDi);
    const dic = getValue(ed.dic || d.DIC);
    const incorporationDate = getValue(ed.date_of_incorporation || d.incorp_date);
    const socialCategory = getValue(ed.social_category || d.socialCategory);
    
    // Enterprise Units - Format as string
    let enterpriseUnitsArr = getValue(d.enterprise_units || d.units);
    let enterpriseUnits = null;
    if (Array.isArray(enterpriseUnitsArr)) {
       enterpriseUnits = enterpriseUnitsArr.map(u => (typeof u === 'object') ? (u.name || JSON.stringify(u)) : u).join(', ');
    } else if (enterpriseUnitsArr && typeof enterpriseUnitsArr === 'object') {
       enterpriseUnits = enterpriseUnitsArr.name || JSON.stringify(enterpriseUnitsArr);
    }
    
    // NIC Code 
    const nicData = d.nic_data || {};
    const nicCode = getValue(nicData.nic_5_digit || d.nic_code || d.NicCode);

    const renderRow = (label, value) => {
      if (!value) return '';
      return `
        <div style="display: flex; margin-bottom: 8px; font-size: 13px;">
          <div style="width: 200px; font-weight: bold; color: #000;">${label} :</div>
          <div style="flex: 1; color: #333;">${value}</div>
        </div>
      `;
    };

    printContainer.innerHTML = `
      <div style="width: 190mm; padding: 15mm; box-sizing: border-box; font-family: 'Arial', sans-serif; background: #fff; color: #000; position: relative; border: 1px solid #eee;">
        <!-- Main Border -->
        <div style="position: absolute; top: 5mm; left: 5mm; right: 5mm; bottom: 5mm; border: 2px solid #000; pointer-events: none;"></div>

        <div style="text-align: center; margin-bottom: 25px; position: relative; z-index: 1;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; color: #000;">${clientName}</h1>
          <h3 style="margin: 8px 0 4px; font-size: 16px; font-weight: bold;">Udyam Aadhaar Verification Certificate</h3>
          <h4 style="margin: 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">TO WHOMSOEVER IT MAY CONCERN</h4>
        </div>

        <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.5;">
          <p>This is to Certify that <strong>${enterpriseName || 'N/A'}</strong>, Udyam Id No. <strong>${udyamNo || 'N/A'}</strong> is verified from the Udyam portal.</p>
        </div>

        <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px; background: #fff;">
          ${renderRow('Enterprise Name', enterpriseName)}
          ${renderRow('Document ID', udyamNo)}
          ${renderRow('Major Activity', majorActivity)}
          ${renderRow('Enterprise Type', enterpriseType)}
          ${renderRow('Organization Type', organizationType)}
          ${renderRow('Mobile', mobile)}
          ${renderRow('Email', email)}
          ${renderRow('Address', address)}
          ${renderRow('Udyam Registration Date', regDate)}
          ${renderRow('MSME DI', msmeDi)}
          ${renderRow('DIC', dic)}
          ${renderRow('Date of Incorporation', incorporationDate)}
          ${renderRow('Social Category', socialCategory)}
          ${renderRow('Enterprise Units', enterpriseUnits)}
          ${renderRow('NIC Code', nicCode)}
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="width: 45%;">
            <p style="font-weight: bold; margin-bottom: 25px; font-size: 13px;">Signature of the Authorised Signatory</p>
            <p style="margin: 5px 0; font-size: 12px;">Name: ________________________</p>
            <p style="margin: 5px 0; font-size: 12px;">Designation: _________________</p>
            <p style="margin: 5px 0; font-size: 12px;">Phone no.: ___________________</p>
            <p style="margin-top: 30px; font-size: 12px;">(Bank Seal)</p>
          </div>
          <div style="width: 45%;">
            <p style="font-weight: bold; margin-bottom: 25px; font-size: 13px; text-align: right;">Signature of the Branch Manager</p>
            <p style="margin: 5px 0; font-size: 12px; text-align: right;">Name: ________________________</p>
            <p style="margin: 5px 0; font-size: 12px; text-align: right;">Designation: _________________</p>
            <p style="margin: 5px 0; font-size: 12px; text-align: right;">Date: ________________________</p>
            <p style="margin-top: 30px; font-size: 12px; text-align: right; font-weight: bold;">Verified By : User</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(printContainer);

    try {
      const { default: html2pdf } = await import('html2pdf.js');
      const opt = {
        margin: 5,
        filename: `Udyam_Certificate_${record.udyamNo}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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
      const response = await fetch(`${UDYAM_API_BASE}/history?pageSize=100`, {
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

    if (!formData.udyamNo || formData.udyamNo.length < 5) {
      setError('Please enter a valid Udyam Registration Number.');
      showToast('Please enter a valid Udyam Registration Number.', 'warning');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${UDYAM_API_BASE}/verify?udyam=${formData.udyamNo.toUpperCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const responseText = await response.text();

      if (!response.ok) {
        if (response.status === 402) throw new Error('Insufficient credits for Udyam verification.');
        
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
        throw new Error('Verification failed: Invalid Udyam number or provider unavailable.');
      }

      // Standard failure checks - Strictly enforcing 200 status code
      const isFailed = parsed.status === false || 
                       parsed.status === 'failed' || 
                       parsed.status === 'Failed' || 
                       parsed.error || 
                       (parsed.status_code && Number(parsed.status_code) !== 200) ||
                       (parsed.statusCode && Number(parsed.statusCode) !== 200) ||
                       (parsed.statuscode && Number(parsed.statuscode) !== 200);

      if (isFailed) {
        throw new Error(parsed.message || parsed.error || 'Udyam Verification Failed.');
      }

      const d = parsed.data || parsed;
      const ed = d.enterprise_data || {};
      let returnedName = ed.name || d.enterprise_name || d.name || d.Name || d.fullName || 'N/A';

      const finalData = {
        name: returnedName,
        udyamNo: formData.udyamNo.toUpperCase(),
        enterpriseType: ed.enterprise_type || d.enterprise_type || 'N/A',
        majorActivity: ed.major_activity || d.major_activity || 'N/A',
        status: 'Active',
        rawResponse: responseText
      };

      setUdyamData(finalData);
      setStatus('verified');
      showToast('Udyam Verification Successful', 'success');
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
    setFormData({ udyamNo: '' });
    setUdyamData(null);
    setError('');
  };

  const filteredHistory = history.filter(record => {
    // Only show successfully verified records (implicit based on backend + strict frontend logic)
    // but we can add a check if needed.
    const lowerSearch = searchTerm.toLowerCase();
    return (record.name?.toLowerCase().includes(lowerSearch) ||
            record.udyamNo?.toLowerCase().includes(lowerSearch));
  });

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
                <div className="vh-card-icon"><Briefcase size={20} /></div>
                <div className="vh-card-titles">
                  <h2>Udyam Details</h2>
                  <p>Verify Ministry of Micro, Small and Medium Enterprises Records</p>
                </div>
              </div>

              <form onSubmit={handleVerify} className="vh-form-grid-v2">
                <div className="vh-form-group required">
                  <label>Udyam Registration No.</label>
                  <input
                    type="text"
                    className="vh-input uppercase"
                    placeholder="UDYAM-XX-00-0000000"
                    maxLength={19}
                    pattern="^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$"
                    title="Please enter a valid 19-character Udyam Number (e.g., UDYAM-MH-00-1234567)"
                    value={formData.udyamNo}
                    onChange={e => { setFormData({ ...formData, udyamNo: e.target.value.toUpperCase() }); setError(''); }}
                    required
                  />
                  <span className="vh-hint">Look for the 19-digit unique MSME registration identifier printed on the Udyam certificate.</span>
                </div>

                <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="vh-btn-teal" disabled={loading}>
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    {loading ? 'Verifying...' : 'Search Udyam'}
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
                  <div className="vh-profile-placeholder"><Briefcase size={32} /></div>
                  <div className="vh-profile-info">
                    <h3>{udyamData?.name}</h3>
                    <p style={{ textTransform: 'uppercase' }}>{udyamData?.udyamNo}</p>
                    <span className="vh-badge-verified">Active Entity</span>
                  </div>
                </div>
                <div className="vh-details-grid">
                  <div className="vh-detail-item"><label>Enterprise Type</label><span>{udyamData?.enterpriseType}</span></div>
                  <div className="vh-detail-item"><label>Major Activity</label><span>{udyamData?.majorActivity}</span></div>
                  <div className="vh-detail-item" style={{ gridColumn: '1 / -1' }}><label>Status Check</label><span style={{ color: '#10b981', fontWeight: 600 }}>Active and Valid</span></div>
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
                    <th>ENTERPRISE NAME</th>
                    <th>UDYAM NO</th>
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
                    <tr key={record.id || record.udyamNo + Math.random()}>
                      <td className="vh-td-name">{record.name}</td>
                      <td className="vh-td-code">{record.udyamNo}</td>
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
