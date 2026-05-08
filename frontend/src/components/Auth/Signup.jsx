import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Building2, Mail, Phone, MapPin, Loader2, CheckCircle, Zap, Shield, Copy, AlertCircle, Users, CreditCard } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './Login.css'
import './Signup.css'
import logo from '../../assets/logo.png'
import API_BASE_URL from '../../config'

export default function Signup() {
  const { showToast } = useApp()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard!`, 'success')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/Client/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setResult(data)
        showToast('Institution registered successfully!', 'success')
      } else {
        throw new Error(data.message || 'Registration failed.')
      }
    } catch (err) {
      const msg = err.message || 'Network error. Please try again.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-v2-container light">
      {/* Floating Glass Blobs */}
      <div className="glass-blob blob-1"></div>
      <div className="glass-blob blob-2"></div>
      <div className="glass-blob blob-3"></div>

      <div className="login-split-wrapper">
        {/* Left Hero Section */}
        <div className="login-hero-section animate-fade-in-left">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Join AVS AI360 Platform</span>
            </div>
            <h1>Register Your <span className="text-gradient">Institution</span></h1>
            <p className="login-hero-desc">Onboard your Bank or Society onto the most advanced AI-powered verification and analytics platform.</p>

            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon"><Building2 size={20} /></div>
                <div>
                  <h4>Instant Onboarding</h4>
                  <p>Get your institution live in under 2 minutes</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Users size={20} /></div>
                <div>
                  <h4>Admin Credentials</h4>
                  <p>Auto-generated secure login for your admin</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><CreditCard size={20} /></div>
                <div>
                  <h4>Credit Wallet</h4>
                  <p>Pre-provisioned wallet for KYC services</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Signup Card */}
        <div className="login-v2-card animate-fade-in-right">
          <div className="login-v2-header">
            <div className="brand-logo-container">
              <img src={logo} alt="AVS Logo" className="login-v2-logo" />
            </div>
            <h1 className="login-v2-title">Create Account</h1>
            <p className="login-v2-subtitle">Register your Bank or Society</p>
          </div>

          {error && (
            <div className="login-v2-error animate-shake">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {!result ? (
            <form className="login-v2-form" onSubmit={handleSubmit}>
              <div className="login-v2-group">
                <label>Institution Name *</label>
                <div className="login-v2-input-wrap">
                  <Building2 size={18} className="input-v2-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. "
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="login-v2-group">
                <label>Email Address *</label>
                <div className="login-v2-input-wrap">
                  <Mail size={18} className="input-v2-icon" />
                  <input
                    type="email"
                    name="email"
                    placeholder=""
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="login-v2-group">
                <label>Phone Number *</label>
                <div className="login-v2-input-wrap">
                  <Phone size={18} className="input-v2-icon" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder=""
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    title="Please enter a valid 10-digit Indian mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="login-v2-group">
                <label>Address *</label>
                <div className="login-v2-input-wrap">
                  <MapPin size={18} className="input-v2-icon" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Full institution address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`btn-v2-submit ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin" size={20} /> Registering...</>
                ) : (
                  <><Shield size={20} /> Register Institution</>
                )}
              </button>
            </form>
          ) : (
            <div className="signup-credential-card">
              <div className="credential-header">
                <CheckCircle size={20} />
                Registration Successful!
              </div>

              <div className="credential-row">
                <span className="credential-label">Client Code</span>
                <span className="credential-value" onClick={() => copyToClipboard(result.clientCode, 'Client Code')}>
                  {result.clientCode} <Copy size={14} />
                </span>
              </div>

              <div className="credential-row">
                <span className="credential-label">Admin Username</span>
                <span className="credential-value" onClick={() => copyToClipboard(result.adminUsername, 'Username')}>
                  {result.adminUsername} <Copy size={14} />
                </span>
              </div>

              <div className="credential-row">
                <span className="credential-label">Admin Password</span>
                <span className="credential-value danger" onClick={() => copyToClipboard(result.adminPassword, 'Password')}>
                  {result.adminPassword} <Copy size={14} />
                </span>
              </div>

              <div className="credential-warning">
                <AlertCircle size={16} />
                Save these credentials securely. They will not be shown again.
              </div>

              <button
                className="btn-v2-submit"
                onClick={() => navigate('/login')}
                style={{ marginTop: '0.5rem' }}
              >
                <Shield size={20} /> Sign In Now
              </button>
            </div>
          )}

          <div className="login-v2-footer">
            <div className="auth-toggle">
              Already registered? <button onClick={() => navigate('/login')}>Sign In</button>
            </div>
            <p>&copy; 2026 AVS Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
