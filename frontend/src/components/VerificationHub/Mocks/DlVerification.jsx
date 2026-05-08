import React, { useState } from 'react';
import { Car, Search, FileText, CheckCircle, Database, Loader2, ShieldCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import SecurityInfoWidget from '../../Shared/SecurityInfoWidget';
import HowItWorksWidget from '../../Shared/HowItWorksWidget';
import '../../AadharVerification/AadharVerification.css';

export default function DlVerification() {
  const { showToast, balance, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('pending');
  const [formData, setFormData] = useState({ dlNumber: '', name: '', dob: '' });

  const handleVerify = (e) => {
    e.preventDefault();

    // Credit Check
    if (user?.role !== 'SUPER_ADMIN' && balance <= 0) {
      showToast('please add credits', 'warning');
      return;
    }

    if (!formData.dlNumber || !formData.dob || !formData.name) {
        showToast('All fields are required.', 'warning');
        return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus('verified');
      showToast('Driving Licence verified successfully via mock API.', 'success');
    }, 1500);
  };

  return (
    <div className="vh-module-container">
      <div className="aadhar-grid">
        {/* Left Column: Form and Informational Cards */}
        <div className="vh-col-left">
          <div className="vh-card vh-form-card animate-fade-in">
            <div className="vh-card-header">
              <div className="vh-card-icon"><Car size={20} /></div>
              <div className="vh-card-titles">
                <h2>DL Details</h2>
                <p>Verify Regional Transport Office (RTO) Records</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="vh-form-grid-v2">
              <div className="vh-form-group">
                <label>DL Number <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="vh-input uppercase"
                  placeholder="MH1420110062821"
                  maxLength={15}
                  pattern="^[A-Z]{2}[0-9]{13}$"
                  title="Please enter a valid 15-character Driving Licence Number (e.g., MH14 20110062821 without spaces)"
                  value={formData.dlNumber}
                  onChange={e => setFormData({ ...formData, dlNumber: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>Date of Birth <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="date"
                  className="vh-input"
                  value={formData.dob}
                  onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  required
                />
              </div>

              <div className="vh-form-group">
                <label>Name on DL <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  className="vh-input"
                  placeholder=""
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="vh-form-actions-wrap" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="vh-btn-teal" disabled={loading}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  {loading ? 'Verifying...' : 'Verify DL'}
                </button>
              </div>
            </form>
          </div>

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

        {/* Right Column: Results/History */}
        <div className="vh-col-right">
          <div className="vh-card vh-history-card">
            <div className="vh-history-header">
              <h3>{status === 'verified' ? 'Verification Result' : 'Recent Queries'}</h3>
            </div>
            <div className="vh-history-body">
              {status === 'pending' ? (
                <div className="vh-no-data">
                  <FileText size={32} style={{ opacity: 0.2, margin: '0 auto 10px auto' }} />
                  <p>No recent DL verifications found.</p>
                </div>
              ) : (
                <div className="vh-result-body animate-fade-in">
                  <div className="vh-result-profile">
                    <div className="vh-profile-placeholder"><Car size={32} /></div>
                    <div className="vh-profile-info">
                      <h3>{formData.name || 'VERIFIED RIDER'}</h3>
                      <p>{formData.dlNumber}</p>
                      <span className="vh-badge-verified">Valid</span>
                    </div>
                  </div>
                  <div className="vh-details-grid">
                    <div className="vh-detail-item"><label>Vehicle Categories</label><span>MCWG, LMV</span></div>
                    <div className="vh-detail-item"><label>Issue Date</label><span>12/04/2015</span></div>
                    <div className="vh-detail-item"><label>Expiry Date</label><span>11/04/2035</span></div>
                    <div className="vh-detail-item"><label>Blood Group</label><span>O+</span></div>
                  </div>
                  <div className="vh-result-actions">
                    <button className="vh-btn-teal" onClick={() => setStatus('pending')}>
                      <RotateCcw size={18} /> New Verification
                    </button>
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
