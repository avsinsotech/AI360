import React, { useState, useEffect } from 'react'
import { Tag, PlusCircle, Loader2, AlertCircle, CheckCircle2, Calendar, IndianRupee, Building2 } from 'lucide-react'
import API_BASE_URL from '../../config'
import '../Admin/Admin.css'
import { useApp } from '../../context/AppContext'
import CustomSelect from '../Shared/CustomSelect'

const CATEGORIES = [
  'AADHAAR', 
  'PAN', 
  'VOTER', 
  'PASSPORT', 
  'DL', 
  'GST', 
  'UDYAM', 
  'MOBILE_VERIFY', 
  'CIBIL', 
  'ROCKETPAY'
]

export default function RateManagement() {
  const { user } = useApp()
  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({ 
    clientCode: '',
    category: 'AADHAAR', 
    rate: '', 
    effectiveFrom: new Date().toISOString().split('T')[0] 
  })
  const [clients, setClients] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [filterClientCode, setFilterClientCode] = useState('')

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchClients()
    }
  }, [])

  useEffect(() => { 
    fetchRates() 
  }, [filterClientCode])

  const lastSelectionRef = React.useRef("");

  // Auto-populate existing rate when selection changes
  useEffect(() => {
    if (submitting) return; // Don't overwrite while saving

    const selectionKey = `${formData.clientCode}-${formData.category}`;
    const selectionChanged = lastSelectionRef.current !== selectionKey;

    if (formData.clientCode && formData.category && rates.length > 0) {
      // Find latest rate for client and category (sort by date, then by ID to ensure newest wins)
      const applicable = rates
        .filter(r => r.clientCode === formData.clientCode && r.category === formData.category)
        .sort((a, b) => {
          const dateA = new Date(a.effectiveFrom).getTime();
          const dateB = new Date(b.effectiveFrom).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return (b.id || 0) - (a.id || 0); // Newest ID first if dates match
        });

      const existing = applicable[0];

      if (existing) {
        // Only overwrite IF the bank/service actually changed, 
        // Or if we don't have a rate yet (initial select)
        if (selectionChanged || !formData.rate) {
          setFormData(prev => ({
            ...prev,
            rate: existing.rate.toString(),
          }))
        }
        setIsUpdating(true)
      } else if (selectionChanged) {
        setFormData(prev => ({ 
          ...prev, 
          rate: '',
          effectiveFrom: new Date().toISOString().split('T')[0] 
        }))
        setIsUpdating(false)
      }
    }
    lastSelectionRef.current = selectionKey;
  }, [formData.clientCode, formData.category, rates, submitting])

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Client`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (err) {
      console.error('Failed to fetch clients', err)
    }
  }

  const fetchRates = async () => {
    setLoading(true)
    const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
    const params = (user?.role === 'SUPER_ADMIN' && filterClientCode) ? `?clientCode=${filterClientCode}` : ''
    
    try {
      const res = await fetch(`${API_BASE_URL}/Rate${params}`, { headers })
      if (res.ok) setRates(await res.json())
    } catch (err) {
      setError('Failed to load rates.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.rate || parseFloat(formData.rate) < 0) {
      setError('Enter a valid rate.')
      return
    }
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API_BASE_URL}/Rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify({
          clientCode: formData.clientCode,
          category: formData.category,
          rate: parseFloat(formData.rate),
          effectiveFrom: formData.effectiveFrom
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(data.message || `Rate saved for ${formData.category}: ₹${parseFloat(formData.rate).toFixed(2)}`)
        // Clear rate but keep bank/service if they want to adjust again, 
        // actually better to clear and reset isUpdating
        setFormData(prev => ({ ...prev, rate: '' }))
        fetchRates()
      } else {
        setError(data.message || 'Failed to save rate.')
      }
    } catch (err) {
      setError('Network error.')
    } finally {
      setSubmitting(false)
    }
  }

  // Get current rate per category for the SELECTED bank
  const getCurrentRate = (category) => {
    const bankToFilter = filterClientCode || formData.clientCode
    if (!bankToFilter) return null;

    const now = new Date()
    const applicable = rates
      .filter(r => r.category === category && 
                   r.clientCode === bankToFilter && 
                   new Date(r.effectiveFrom).getTime() <= now.getTime())
      .sort((a, b) => {
        const dateA = new Date(a.effectiveFrom).getTime();
        const dateB = new Date(b.effectiveFrom).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return b.id - a.id; // Newest entry first if dates match
      })
    return applicable[0]
  }

  return (
    <div className="admin-module">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-icon-box purple">
            <Tag size={20} />
          </div>
          <div className="admin-title">
            <h1>Service Rate Configuration</h1>
            <p>Set per-service rates for KYC and payment modules</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-left">
          <div className="admin-card">
            <h2><PlusCircle size={16} /> Set New Rate</h2>
            {error && <div className="msg-error"><AlertCircle size={16} /><span>{error}</span></div>}
            {success && <div className="msg-success"><CheckCircle2 size={16} /><span>{success}</span></div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Bank / Society *</label>
                <div style={{ position: 'relative' }}>
                  <CustomSelect
                    placeholder="-- Choose a Bank --"
                    value={formData.clientCode}
                    onChange={val => {
                      setFormData({ ...formData, clientCode: val });
                      setFilterClientCode(val);
                    }}
                    options={clients.map(c => ({ value: c.clientCode, label: `${c.name} (${c.clientCode})` }))}
                    searchable
                    icon={Building2}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Service Category *</label>
                <CustomSelect
                  value={formData.category}
                  onChange={val => setFormData({ ...formData, category: val })}
                  options={CATEGORIES.map(c => ({ value: c, label: c.replace(/_/g, ' ') }))}
                  icon={Tag}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Rate (₹ per use) *</label>
                  <input type="number" min="0" step="0.01" value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} placeholder="e.g. 25.00" required />
                </div>
                <div className="form-group">
                  <label>Effective From *</label>
                  <input type="date" value={formData.effectiveFrom} onChange={e => setFormData({ ...formData, effectiveFrom: e.target.value })} required />
                </div>
              </div>
              <button type="submit" className={`btn ${isUpdating ? 'btn-success' : 'btn-primary'}`} disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
                {submitting ? (
                  <><Loader2 size={16} className="animate-spin" /> {isUpdating ? 'Updating...' : 'Saving...'}</>
                ) : (
                  <><Tag size={16} /> {isUpdating ? 'Update Rate' : 'Save Rate'}</>
                )}
              </button>
              {isUpdating && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, rate: '' }));
                    setIsUpdating(false);
                  }}
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* Current rates cards */}
          <div className="admin-card">
            <h2><IndianRupee size={16} /> Current Active Rates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {CATEGORIES.map(cat => {
                const current = getCurrentRate(cat)
                return (
                  <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: current ? '#10b981' : 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {current ? `₹${current.rate.toFixed(2)}` : 'Not Set'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="admin-right">
          <div className="admin-card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0 }}><Calendar size={16} /> Rate History</h2>
              {user?.role === 'SUPER_ADMIN' && (
                <CustomSelect
                  placeholder="All Banks"
                  value={filterClientCode}
                  onChange={val => {
                    setFilterClientCode(val);
                    setFormData(prev => ({ ...prev, clientCode: val }));
                  }}
                  options={[
                    { value: '', label: 'All Banks' },
                    ...clients.map(c => ({ value: c.clientCode, label: c.name }))
                  ]}
                  searchable
                  icon={Building2}
                />
              )}
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Category</th>
                    <th>Rate (₹)</th>
                    <th>Effective From</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={20} className="animate-spin" /></td></tr>
                  ) : rates.length === 0 ? (
                    <tr><td colSpan={4}><div className="empty-state"><Tag size={32} /><p>No rates configured yet</p></div></td></tr>
                  ) : rates.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.clientCode}</td>
                      <td><span className="badge badge-admin">{r.category}</span></td>
                      <td style={{ fontWeight: 600 }}>₹{r.rate.toFixed(2)}</td>
                      <td>{new Date(r.effectiveFrom).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
