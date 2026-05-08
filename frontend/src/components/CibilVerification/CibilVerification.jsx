import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard, Search, RotateCcw, Download,
  FileText, User, Calendar, MapPin, Phone,
  Hash, CheckCircle2, AlertCircle, Loader2, ChevronLeft, LayoutDashboard, FileBarChart, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './CibilVerification.css';
import SecurityInfoWidget from '../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../Shared/HowItWorksWidget';
import API_BASE_URL from '../../config';
import CibilPdfTemplate from './CibilPdfTemplate';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';

const CibilVerification = () => {
  const { showToast, balance, user, fetchBalance } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    dob: '',
    phone: '',
    pincode: '',
    address: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [activeReportData, setActiveReportData] = useState(null);
  const [agreedToCibil, setAgreedToCibil] = useState(false);

  // Pagination & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 11;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/CibilProxy/history`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (response.ok) {
        const data = await response.json();
        const historyData = data.items || [];
        setHistory(historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredHistory = history.filter(row =>
    row.fName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    row.pan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      name: '',
      pan: '',
      dob: '',
      phone: '',
      pincode: '',
      address: ''
    });
    setAgreedToCibil(false);
    setSuccess(false);
    setError(null);
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    // Credit Check
    if (user?.role !== 'SUPER_ADMIN' && balance <= 0) {
      showToast('please add credits', 'warning');
      return;
    }

    if (!formData.name || !formData.pan || !formData.phone || !formData.pincode || !formData.dob) {
      setError('All fields including Name, PAN, DOB, Phone, and Pincode are strictly required.');
      showToast('All fields are required.', 'warning');
      return;
    }

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (!panRegex.test(formData.pan)) {
      setError('Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F).');
      showToast('Invalid PAN format.', 'error');
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Invalid mobile number. Must be a valid 10-digit Indian mobile number.');
      showToast('Invalid mobile number.', 'error');
      return;
    }

    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(formData.pincode)) {
      setError('Invalid pincode. Must be exactly 6 digits.');
      showToast('Invalid pincode.', 'error');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setSuccess(false);

    try {
      const queryParams = new URLSearchParams({
        fname: formData.name,
        phone: formData.phone,
        pan: formData.pan.toUpperCase(),
        dob: formData.dob,
        address: formData.address,
        pincode: formData.pincode
      }).toString();

      const response = await fetch(`${API_BASE_URL}/CibilProxy/verify?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showToast('CIBIL Report Generated Successfully!', 'success');
        fetchHistory();
        fetchBalance();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const msg = data.message || 'Verification failed. Please try again.';
        setError(msg);
        showToast(msg, 'error');
      }
    } catch (err) {
      setError('Connection error. Please check your network or try again later.');
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownloadPdf = async (row) => {
    let rawJsonStr = row.rawJsonResponse || row.RawJsonResponse;

    // If not present in the history row (since backend excludes it for performance), fetch detailed report
    if (!rawJsonStr) {
      setDownloadingId(row.id);
      try {
        const res = await fetch(`${API_BASE_URL}/CibilProxy/report/${row.id}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (res.ok) {
          const detail = await res.json();
          rawJsonStr = detail.rawJsonResponse || detail.RawJsonResponse;
        }
      } catch (e) {
        console.error("Failed to fetch detailed report", e);
      }
    }

    if (!rawJsonStr) {
      setDownloadingId(null);
      showToast('Raw data not available for this report.', 'warning');
      return;
    }

    try {
      setDownloadingId(row.id);
      const rawData = typeof rawJsonStr === 'string' ? JSON.parse(rawJsonStr) : rawJsonStr;
      const reportDateStr = new Date(row.createdAt).toLocaleDateString('en-GB');
      setActiveReportData({
        data: rawData,
        date: reportDateStr
      });

      setTimeout(async () => {
        const element = document.getElementById('cibil-pdf-template');
        if (!element) {
          setDownloadingId(null);
          return;
        }

        const hiddenWrapper = element.parentElement;
        const origStyle = hiddenWrapper.style.cssText;
        hiddenWrapper.style.position = 'absolute';
        hiddenWrapper.style.left = '-9999px';
        hiddenWrapper.style.top = '0';
        hiddenWrapper.style.visibility = 'visible';

        let titleImgData = null;
        let titleImgRatio = 0;
        const titleEl = element.querySelector('.cibil-title-bar');
        if (titleEl) {
          const titleCanvas = await html2canvas(titleEl, { scale: 3, useCORS: true, backgroundColor: null });
          titleImgData = titleCanvas.toDataURL('image/png');
          titleImgRatio = titleCanvas.height / titleCanvas.width;
        }

        hiddenWrapper.style.cssText = origStyle;

        const filename = `CIBIL_Report_${row.pan}_${row.id}.pdf`;

        const opt = {
          margin: [0.8, 0.2, 0.2, 0.2],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          const pageWidth = pdf.internal.pageSize.getWidth();
          const contentWidth = pageWidth - 0.4;

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setTextColor(0, 0, 0);

            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Print Date', 0.3, 0.2);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': ' + reportDateStr, 1.1, 0.2);

            pdf.setFont('helvetica', 'bold');
            pdf.text('Report Name', 0.3, 0.35);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': Cibil Report', 1.1, 0.35);

            pdf.setFont('helvetica', 'bold');
            pdf.text('User Id', pageWidth - 2.2, 0.2);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': ', pageWidth - 1.6, 0.2);

            pdf.setFont('helvetica', 'bold');
            pdf.text('Page No', pageWidth - 2.2, 0.35);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': Page ' + i + ' of ' + totalPages, pageWidth - 1.6, 0.35);

            if (i > 1 && titleImgData) {
              const titleHeight = contentWidth * titleImgRatio;
              const titleY = 0.8 - titleHeight;
              pdf.addImage(titleImgData, 'PNG', 0.2, titleY, contentWidth, titleHeight);
            }
          }

          pdf.save(filename);
          setDownloadingId(null);
          setActiveReportData(null);
        }).catch(err => {
          setDownloadingId(null);
          setActiveReportData(null);
        });
      }, 1500);
    } catch (err) {
      setDownloadingId(null);
      showToast('Error parsing raw JSON data.', 'error');
    }
  };

  return (
    <div className="vh-module-container">
      <div className="aadhar-grid">
        {/* Left Column: Form and Informational Cards */}
        <div className="vh-col-left">
          <div className="vh-card vh-form-card animate-fade-in">
            <div className="vh-card-header">
              <div className="vh-card-icon"><CreditCard size={20} /></div>
              <div className="vh-card-titles">
                <h2>Applicant Details</h2>
                <p>Bureau Report Analysis</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="vh-form-grid-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="vh-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Full Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="vh-input"
                  type="text"
                  name="name"
                  placeholder="As per PAN"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>PAN Number <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="vh-input uppercase"
                  type="text"
                  name="pan"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  pattern="^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$"
                  title="Please enter a valid 10-character PAN number (e.g., ABCDE1234F)"
                  value={formData.pan}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>Date of Birth <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="vh-input"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>Phone Number <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="vh-input"
                  type="text"
                  name="phone"
                  placeholder="10-digit mobile"
                  maxLength={10}
                  pattern="^[6-9]\d{9}$"
                  title="Please enter a valid 10-digit Indian mobile number"
                  value={formData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    handleInputChange({ target: { name: 'phone', value: val } });
                  }}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>Pincode <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="vh-input"
                  type="text"
                  name="pincode"
                  placeholder="6-digit"
                  maxLength={6}
                  pattern="^[1-9][0-9]{5}$"
                  title="Please enter a valid 6-digit Pincode"
                  value={formData.pincode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    handleInputChange({ target: { name: 'pincode', value: val } });
                  }}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>Full Address <span style={{ color: 'red' }}>*</span></label>
                <input
                  className="vh-input"
                  type="text"
                  name="address"
                  placeholder="Current residence address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="vh-form-group" style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <label className="checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'normal', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={agreedToCibil}
                    onChange={(e) => setAgreedToCibil(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Click to agree to the CIBIL check for verification and continue your application.</span>
                </label>
              </div>

              <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1', padding: '1rem 0 0.5rem' }}>
                <button
                  type="submit"
                  className={`vh-btn-teal ${isVerifying ? 'loading' : ''}`}
                  disabled={isVerifying || !agreedToCibil}
                >
                  {isVerifying ? (
                    <><Loader2 className="animate-spin" size={18} /> Verifying...</>
                  ) : (
                    <>Verify CIBIL Score</>
                  )}
                </button>
                <button type="button" className="vh-btn-outline" onClick={handleClear} disabled={isVerifying}>
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </form>

            {error && (
              <div className="vh-alert error">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            {success && (
              <div className="vh-alert success">
                <CheckCircle2 size={16} /> CIBIL Report Generated Successfully!
              </div>
            )}
          </div>

          {/* Verification Process Card */}
          {/* <div className="vh-card vh-process-card">
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
          </div> */}

          {/* Trusted Badges Grid */}
          {/* <div className="vh-features-grid">
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
          </div> */}
        </div>

        {/* Right Column: History */}
        <div className="vh-col-right">
          <div className="vh-card vh-history-card">
            <div className="vh-history-header">
              <h3>Recent Reports</h3>
              <div className="vh-search-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by Name or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="vh-history-body">
              <table className="vh-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>PAN NO.</th>
                    <th>SCORE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoading ? (
                     [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan="4">
                          <div className="skeleton skeleton-table-row" style={{ height: '40px', margin: '4px 0' }}></div>
                        </td>
                      </tr>
                    ))
                  ) : currentRecords.length > 0 ? (
                    currentRecords.map((row) => (
                      <tr key={row.id}>
                        <td className="vh-td-name">{row.fName}</td>
                        <td className="vh-td-code">{row.pan?.toUpperCase()}</td>
                        <td>
                          <span className={`vh-score-badge ${row.cibilScore > 750 ? 'high' : row.cibilScore > 650 ? 'medium' : 'low'}`}>
                            {row.cibilScore}
                          </span>
                        </td>
                        <td>
                          <div className="vh-td-actions">
                            <Link to={`/cibil/dashboard/${row.pan}`} title="View Dashboard">
                              <LayoutDashboard size={16} />
                            </Link>
                            <button
                              onClick={() => handleDownloadPdf(row)}
                              title="Download PDF"
                            >
                              {downloadingId === row.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="vh-no-data">No records found</td></tr>
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

      {/* Hidden PDF Template */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
        <div id="cibil-pdf-template">
          {activeReportData && (
            <CibilPdfTemplate
              data={activeReportData.data}
              reportDate={activeReportData.date}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CibilVerification;
