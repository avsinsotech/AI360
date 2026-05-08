import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Lock, User, Eye, EyeOff, ShieldCheck, Loader2, CheckCircle, Zap, Shield } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import './Login.css'
import logo from '../../assets/logo.png'
import API_BASE_URL from '../../config'

export default function Login({ onLoginSuccess }) {
  const { showToast, user } = useApp()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Strictly redirect if already logged in or token exists
  useEffect(() => {
    if (user || sessionStorage.getItem('tushgpt_jwt')) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}...`)
      }

      if (!res.ok) {
        throw new Error(data.message || data.title || 'Login failed.')
      }

      const token = data.token || data.Token || data.tokenString;
      sessionStorage.setItem('tushgpt_jwt', token)
      showToast('Login successful! Welcome to AVS Suite.', 'success')
      onLoginSuccess(token)
    } catch (err) {
      const msg = err.message || 'Network error connecting to backend.'
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-v2-container light">
      {/* Unique Floating Glass Blobs */}
      <div className="glass-blob blob-1"></div>
      <div className="glass-blob blob-2"></div>
      <div className="glass-blob blob-3"></div>
      
      <div className="login-split-wrapper">
        {/* Left Hero Section */}
        <div className="login-hero-section animate-fade-in-left">
          <div className="hero-content">
            <div className="hero-badge">
              <Zap size={14} />
              <span>Next-Gen Analytics Platform</span>
            </div>
            <h1>Empowering Data Driven <span className="text-gradient">Verification</span></h1>
            <p className="login-hero-desc">Access the most advanced AI-powered verification suite for seamless customer onboarding and risk assessment.</p>
            
            <div className="hero-features">
              <div className="feature-item">
                <div className="feature-icon"><ShieldCheck size={20} /></div>
                <div>
                  <h4>Secure eKYC</h4>
                  <p>UIDAI compliant Aadhaar verification flow</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><CheckCircle size={20} /></div>
                <div>
                  <h4>Real-time Processing</h4>
                  <p>Instant CIBIL & Mobile authentication</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Shield size={20} /></div>
                <div>
                  <h4>Bank-Grade Security</h4>
                  <p>End-to-end encrypted data transmission</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="login-v2-card animate-fade-in-right">
          <div className="login-v2-header">
            <div className="brand-logo-container">
              <img src={logo} alt="AVS Logo" className="login-v2-logo" />
            </div>
            <h1 className="login-v2-title">Welcome Back</h1>
            <p className="login-v2-subtitle">Digital Verification & Analytics Suite</p>
          </div>

          {error && (
            <div className="login-v2-error animate-shake">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className="login-v2-form" onSubmit={handleSubmit}>
            <div className="login-v2-group">
              <label>Username</label>
              <div className="login-v2-input-wrap">
                <User size={18} className="input-v2-icon" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-v2-group">
              <label>Password</label>
              <div className="login-v2-input-wrap">
                <Lock size={18} className="input-v2-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-footer-v2">
              <div className="remember-me-v2">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <button type="button" className="btn-forgot-pw">Forgot Password?</button>
            </div>

            <button
              type="submit"
              className={`btn-v2-submit ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> Verifying...</>
              ) : (
                <><ShieldCheck size={20} /> Sign In to Dashboard</>
              )}
            </button>
          </form>

          <div className="login-v2-footer">
            <div className="auth-toggle">
              New Institution? <button onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
            <p>&copy; 2026 AVS Technologies. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
