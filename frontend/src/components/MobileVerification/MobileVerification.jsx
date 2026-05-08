import React, { useState, useEffect } from 'react'
import { Phone, KeyRound, CheckCircle2, AlertTriangle, ArrowRight, History, Calendar, CheckCircle, Search, Loader2, ShieldCheck, ChevronLeft, RotateCcw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import API_BASE_URL from '../../config'
import SecurityInfoWidget from '../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../Shared/HowItWorksWidget';
import './MobileVerification.css'

export default function MobileVerification() {
  const { balance, user, showToast, fetchBalance } = useApp()
  const [mobileNo, setMobileNo] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: Input, 2: OTP, 3: Success

  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [verifiedHistory, setVerifiedHistory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [historyLoading, setHistoryLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 8;

  const filteredHistory = verifiedHistory.filter(item =>
    item.mobileNumber.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verified-numbers`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setVerifiedHistory(data || [])
      } else {
        setVerifiedHistory([]);
      }
    } catch (err) {
      setVerifiedHistory([]);
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleGetOtp = async () => {
    // Credit Check
    if (user?.role !== 'SUPER_ADMIN' && balance <= 0) {
      showToast('please add credits', 'warning');
      return;
    }

    if (!mobileNo || mobileNo.length < 10) {
      setError("Please enter a valid 10-digit mobile number.")
      setSuccessMsg(null)
      return
    }

    // Check if the number is already verified
    const isAlreadyVerified = verifiedHistory.some(item => item.mobileNumber === mobileNo);
    if (isAlreadyVerified) {
      setSuccessMsg(null);
      setError("This mobile number is already verified.");
      return;
    }

    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify({ mobileNumber: mobileNo })
      })

      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { data = { message: text } }

      if (!res.ok) {
        throw new Error(data.message || data.title || 'Failed to request OTP.')
      }

      setStep(2)
      setSuccessMsg("OTP has been sent to your mobile number.")
    } catch (err) {
      setError(err.message || 'Network error connecting to backend.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP.")
      setSuccessMsg(null)
      return
    }
    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify({ mobileNumber: mobileNo, otpCode: otp })
      })

      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { data = { message: text } }

      if (!res.ok) {
        throw new Error(data.message || data.title || 'Invalid OTP verification.')
      }

      setStep(3)
      setSuccessMsg("Mobile number successfully verified!")
      fetchHistory()
      fetchBalance()
    } catch (err) {
      setError(err.message || 'Network error during verification.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setOtp('')
    setMobileNo('')
    setError(null)
    setSuccessMsg(null)
  }

  return (
    <div className="vh-module-container">
      <div className="aadhar-grid">
        {/* Left Column: Form and Informational Cards */}
        <div className="vh-col-left">
          {/* Main Verification Form */}
          {step === 1 && (
            <div className="vh-card vh-form-card animate-fade-in">
              <div className="vh-card-header">
                <div className="vh-card-icon"><Phone size={20} /></div>
                <div className="vh-card-titles">
                  <h2>Mobile Number</h2>
                  <p>Secure SMS OTP Verification</p>
                </div>
              </div>
              <div className="vh-form-group">
                <label>Enter 10-digit Mobile Number</label>
                <div className="vh-input-wrap">
                  <span className="vh-input-prefix">+91</span>
                  <input
                    type="tel"
                    value={mobileNo}
                    onChange={e => { setMobileNo(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(null); }}
                    placeholder=""
                    maxLength={10}
                    className="vh-input"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleGetOtp()}
                  />
                </div>
                <span className="vh-hint">A secure 6-digit OTP will be sent to this number.</span>
              </div>
              {error && <div className="vh-alert error"><AlertTriangle size={16} /> {error}</div>}
              <div className="vh-form-actions-wrap">
                <button className="vh-btn-teal" onClick={handleGetOtp} disabled={isLoading || mobileNo.length < 10}>
                  {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><ArrowRight size={18} /> Send OTP</>}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="vh-card vh-form-card animate-fade-in">
              <div className="vh-card-header">
                <div className="vh-card-icon"><KeyRound size={20} /></div>
                <div className="vh-card-titles">
                  <h2>OTP Verification</h2>
                  <p>Sent to +91 {mobileNo}</p>
                </div>
              </div>
              <div className="vh-form-group">
                <input
                  type="text"
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }}
                  placeholder="● ● ● ● ● ●"
                  maxLength={6}
                  className="vh-input otp-center"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                />
              </div>
              <div className="vh-actions-space">
                <button className="vh-btn-text" onClick={() => { setStep(1); setOtp(''); setError(''); }}><ChevronLeft size={16} /> Back</button>
              </div>
              {error && <div className="vh-alert error"><AlertTriangle size={16} /> {error}</div>}
              <div className="vh-form-actions-wrap">
                <button className="vh-btn-teal" onClick={handleVerifyOtp} disabled={isLoading || otp.length < 4}>
                  {isLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : <><CheckCircle2 size={18} /> Verify Securely</>}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="vh-card vh-result-card animate-fade-in">
              <div className="vh-result-banner success">
                <CheckCircle2 size={18} /> Verification Successful
              </div>
              <div className="vh-result-body">
                <div className="vh-result-profile">
                  <div className="vh-profile-placeholder"><Phone size={32} /></div>
                  <div className="vh-profile-info">
                    <h3>+91 {mobileNo}</h3>
                    <p>Verified Mobile Target</p>
                    <span className="vh-badge-verified"><CheckCircle size={10} /> Verified</span>
                  </div>
                </div>
                <div className="vh-result-actions">
                  <button className="vh-btn-teal" onClick={handleReset}>
                    <RotateCcw size={18} /> New Verification
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
                <div className="vh-step-circle"><Phone size={18} /></div>
                <span>Input Data</span>
              </div>
              <div className="vh-step-line" />
              <div className={`vh-step-item ${step >= 2 ? 'active' : ''}`}>
                <div className="vh-step-circle"><KeyRound size={18} /></div>
                <span>Secure Auth</span>
              </div>
              <div className="vh-step-line" />
              <div className={`vh-step-item ${step >= 3 ? 'active' : ''}`}>
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
                  placeholder="Search Mobile No..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="vh-history-body">
              <table className="vh-table">
                <thead>
                  <tr>
                    <th>MOBILE NUMBER</th>
                    <th>DATE</th>
                    <th>STATUS</th>
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
                  ) : currentRecords.length > 0 ? currentRecords.map(item => (
                    <tr key={item.id}>
                      <td className="vh-td-code">+91 {item.mobileNumber}</td>
                      <td className="vh-td-date">{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td><span className="vh-badge-verified"><CheckCircle size={10} /> Verified</span></td>
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
                    {(() => {
                      let startPage = Math.max(1, currentPage - 2);
                      let endPage = Math.min(totalPages, startPage + 4);
                      if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
                      
                      const pages = [];
                      for (let i = startPage; i <= endPage; i++) pages.push(i);
                      return pages.map(pg => (
                        <button 
                          key={pg} 
                          className={currentPage === pg ? 'active' : ''} 
                          onClick={() => setCurrentPage(pg)}
                        >
                          {pg}
                        </button>
                      ));
                    })()}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
