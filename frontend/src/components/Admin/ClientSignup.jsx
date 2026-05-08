import { useState } from 'react'
import { Building2, UserPlus, CheckCircle2, AlertCircle, Loader2, Copy, Shield } from 'lucide-react'
import API_BASE_URL from '../../config'
import '../Admin/Admin.css'

export default function ClientSignup() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Institution name is required.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_BASE_URL}/Client/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult(data)
        setFormData({ name: '', email: '', phone: '', address: '' })
      } else {
        setError(data.message || 'Signup failed.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="admin-module">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-icon-box">
            <Building2 size={20} />
          </div>
          <div className="admin-title">
            <h1>Bank / Society Registration</h1>
            <p>Register a new institution and create admin credentials</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Shield size={16} />
          Super Admin Only
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-left">
          <div className="admin-card">
            <h2><UserPlus size={18} /> New Institution</h2>

            {error && (
              <div className="msg-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="msg-success">
                <CheckCircle2 size={16} />
                <span>{result.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Institution Name *</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="" />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleChange} placeholder="Full institution address" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Registering...</> : <><Building2 size={16} /> Register Institution</>}
              </button>
            </form>

            {result && (
              <div className="signup-result">
                <div className="result-row">
                  <span className="result-label">Client Code</span>
                  <span className="result-value" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(result.clientCode)} title="Click to copy">
                    {result.clientCode} <Copy size={12} style={{ opacity: 0.5 }} />
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Admin Username</span>
                  <span className="result-value" style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(result.adminUsername)} title="Click to copy">
                    {result.adminUsername} <Copy size={12} style={{ opacity: 0.5 }} />
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label">Admin Password</span>
                  <span className="result-value" style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => copyToClipboard(result.adminPassword)} title="Click to copy">
                    {result.adminPassword} <Copy size={12} style={{ opacity: 0.5 }} />
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="admin-right">
          <div className="admin-card" style={{ flex: 1 }}>
            <h2><Building2 size={18} /> How It Works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
              {[
                { step: '1', title: 'Register Institution', desc: 'Fill in the bank or society details and submit the form.' },
                { step: '2', title: 'Get Credentials', desc: 'You receive a unique Client Code and admin login credentials.' },
                { step: '3', title: 'Login as Admin', desc: 'Use the admin credentials to login and manage the institution.' },
                { step: '4', title: 'Add Credits', desc: 'Top up the credit wallet to enable KYC and other services.' },
                { step: '5', title: 'Start Using', desc: 'Perform Aadhaar, CIBIL, Mobile verifications, and more.' }
              ].map(item => (
                <div key={item.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 28, height: 28, borderRadius: '50%', background: 'var(--accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
