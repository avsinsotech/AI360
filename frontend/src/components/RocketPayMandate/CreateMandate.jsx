import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMandate } from '../../services/mandateApi'
import {
  ArrowLeft, Plus, Loader2, AlertCircle, CheckCircle,
  FileText, UserCircle, CalendarClock, Trash2, ShieldCheck,
  CreditCard, Info
} from 'lucide-react'
import './RocketPay.css'

const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']
const MODES = ['UPI_AUTO_PAY', 'NACH']
const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto',
  'Asia/Dubai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Hong_Kong', 'Asia/Shanghai',
  'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland', 'Africa/Johannesburg',
  'America/Sao_Paulo', 'America/Mexico_City', 'Asia/Seoul', 'Asia/Bangkok',
  'Asia/Jakarta', 'Asia/Istanbul', 'Europe/Moscow'
]

export default function CreateMandate() {
  const navigate = useNavigate()

  const [scheduleType, setScheduleType] = useState('REGULAR')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [form, setForm] = useState({
    customer_mobile: '+91',
    customer_name: '',
    description: '',
    mode: 'UPI_AUTO_PAY',
    time_zone: 'Asia/Kolkata',
    advance_amount: 0,
    reference_id: '',
    reference_type: 'MAIN',
    frequency: 'MONTHLY',
    amount: '',
    installment_count: '',
    start_date: '',
    approval_amount: '',
    end_date: '',
  })

  const [customItems, setCustomItems] = useState([
    { installment_amount: '', due_date: '', description: '', reference_id: '' }
  ])

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const updateItem = (idx, k, v) => {
    const next = [...customItems]
    next[idx][k] = v
    setCustomItems(next)
  }
  const addCustomItem = () => setCustomItems([...customItems, { installment_amount: '', due_date: '', description: '', reference_id: '' }])
  const removeItem = idx => setCustomItems(customItems.filter((_, i) => i !== idx))

  const buildPayload = () => {
    const base = {
      customer: {
        mobile_number: form.customer_mobile,
        name: form.customer_name,
      },
      client_meta: { description: form.description },
      mode: form.mode,
      reference_id: form.reference_id,
      reference_type: form.reference_type,
    }

    if (scheduleType === 'REGULAR') {
      base.schedule = {
        frequency: form.frequency,
        time_zone: form.time_zone,
        advance_amount: Number(form.advance_amount),
        amount: Number(form.amount),
        installment_count: Number(form.installment_count),
        start_date: form.start_date,
      }
    } else if (scheduleType === 'CUSTOM') {
      base.schedule = {
        frequency: 'CUSTOM',
        time_zone: form.time_zone,
        advance_amount: Number(form.advance_amount),
        items: customItems.map(it => ({
          installment_amount: Number(it.installment_amount),
          due_date: it.due_date,
          description: it.description,
          reference_id: it.reference_id
        })),
      }
    } else {
      base.schedule = {
        frequency: 'ADHOC',
        time_zone: form.time_zone,
        approval_amount: Number(form.approval_amount),
        end_date: form.end_date,
      }
    }
    return base
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await createMandate(buildPayload())
      setSuccess(data)
      const url = data?.meta?.mandate_auth_checkout_url
      if (url) window.open(url, '_blank')
    } catch (err) {
      setError(err?.rawBody ? JSON.parse(err.rawBody).message : err.message)
    } finally {
      setLoading(false)
    }
  }

  const formInputBlock = (label, key, type = 'text', placeholder = '') => (
    <div className="rp-form-group">
      <label className="rp-form-label">{label}</label>
      <input
        type={type}
        className="rp-form-input"
        value={form[key]}
        placeholder={placeholder}
        onChange={e => update(key, e.target.value)}
        required
      />
    </div>
  )

  const formSelectBlock = (label, key, options) => (
    <div className="rp-form-group">
      <label className="rp-form-label">{label}</label>
      <select className="rp-form-input" value={form[key]} onChange={e => update(key, e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="rp-container">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-title">
          <h1>
            <ShieldCheck size={28} className="header-icon" />
            Create New Plan
          </h1>
          <p>Register a professional mandate setup for your customers.</p>
        </div>
        <div className="rp-header-actions">
          <button className="rp-btn rp-btn-ghost" onClick={() => navigate('/rocketpay/mandates')}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>
      </div>

      {error && (
        <div className="rp-error-banner">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <AlertCircle size={20} /> Verification Failed
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              {error}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', fontStyle: 'italic', opacity: 0.8 }}>
              Please check the highlighted fields and try again. Ensure the customer mobile is in +91 format.
            </p>
          </div>
        </div>
      )}

      {success ? (
        <div className="rp-success-banner">
          <CheckCircle size={24} />
          <div style={{ flex: 1 }}>
            <div className="font-bold text-lg mb-1">Mandate Created Successfully</div>
            <div className="text-sm mb-3">ID: <span className="mono font-semibold">{success.id}</span></div>

            {success.meta?.mandate_auth_checkout_url && (
              <div style={{ background: 'white', padding: '1rem', borderRadius: 12, border: '1px solid #a7f3d0' }}>
                <p className="text-sm mb-2">Customer approval required. The checkout form has been opened in a new tab.</p>
                <a href={success.meta.mandate_auth_checkout_url} target="_blank" rel="noreferrer" className="rp-btn rp-btn-primary" style={{ textDecoration: 'none' }}>
                  Open Checkout Form Manually
                </a>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button className="rp-btn rp-btn-primary" onClick={() => navigate(`/rocketpay/mandates/${success.id}`)}>
                View Plan Details
              </button>
              <button className="rp-btn rp-btn-ghost" onClick={() => { setSuccess(null) }}>
                Create Another Plan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Plan Type Selection */}
          <div className="rp-block-group">
            <div className="rp-block-title">
              <CalendarClock size={18} /> Schedule Strategy
            </div>
            <div className="rp-tab-group">
              {[
                { v: 'REGULAR', l: 'Regular (Fixed Frequency)' },
                { v: 'CUSTOM', l: 'Variable (Specific Items)' },
                { v: 'ADHOC', l: 'Adhoc (One-time Max)' }
              ].map(t => (
                <button
                  key={t.v} type="button"
                  className={`rp-tab ${scheduleType === t.v ? 'rp-tab-active' : ''}`}
                  onClick={() => setScheduleType(t.v)}
                >
                  {t.l}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 italic">
              {scheduleType === 'REGULAR' && 'Best for subscriptions or fixed EMI payments.'}
              {scheduleType === 'CUSTOM' && 'Used for varying amounts on specific dates.'}
              {scheduleType === 'ADHOC' && 'Sets an upper limit for future adhoc charges.'}
            </p>
          </div>

          <div className="rp-grid-2">
            {/* Customer Section */}
            <div className="rp-block-group">
              <div className="rp-block-title">
                <UserCircle size={18} /> Customer Details
              </div>
              <div className="rp-grid-2">
                {formInputBlock('Mobile Number', 'customer_mobile', 'text', '+91')}
                {formInputBlock('Customer Name', 'customer_name', 'text')}
              </div>
              {formSelectBlock('Authorized Payment Mode', 'mode', MODES)}
            </div>

            {/* Reference Section */}
            <div className="rp-block-group">
              <div className="rp-block-title">
                <FileText size={18} /> Identification
              </div>
              <div className="rp-grid-2">
                {formInputBlock('Your Record ID', 'reference_id', 'text', 'e.g. LOAN-101')}
                {formInputBlock('ID Type', 'reference_type', 'text', 'e.g. MAIN')}
              </div>
              {formInputBlock('Transaction description', 'description', 'text')}
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="rp-block-group">
            <div className="rp-block-title">
              <Info size={18} /> Plan Configuration
            </div>

            <div className="rp-grid-2 mb-4">
              {formSelectBlock('Time Zone', 'time_zone', TIMEZONES)}
              {formInputBlock('Advance Collection (₹)', 'advance_amount', 'number', '0')}
            </div>

            {scheduleType === 'REGULAR' && (
              <div className="rp-grid-4">
                {formSelectBlock('Frequency', 'frequency', FREQUENCIES)}
                {formInputBlock('Amount (₹)', 'amount', 'number')}
                {formInputBlock('Total Cycles', 'installment_count', 'number')}
                {formInputBlock('Active From', 'start_date', 'date')}
              </div>
            )}

            {scheduleType === 'CUSTOM' && (
              <div style={{ marginTop: '1rem' }}>
                {customItems.map((item, idx) => (
                  <div key={idx} className="rp-custom-item">
                    <div className="rp-custom-item-header">
                      <span className="rp-custom-item-index">Itemized Charge #{idx + 1}</span>
                      {customItems.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', fontWeight: 700 }}>
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                    <div className="rp-grid-4">
                      <div className="rp-form-group">
                        <label className="rp-form-label">Amount (₹)</label>
                        <input type="number" className="rp-form-input" value={item.installment_amount}
                          onChange={e => updateItem(idx, 'installment_amount', e.target.value)} required />
                      </div>
                      <div className="rp-form-group">
                        <label className="rp-form-label">Due Date</label>
                        <input type="date" className="rp-form-input" value={item.due_date}
                          onChange={e => updateItem(idx, 'due_date', e.target.value)} required />
                      </div>
                      <div className="rp-form-group">
                        <label className="rp-form-label">Label</label>
                        <input type="text" className="rp-form-input" value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="EMI 1" />
                      </div>
                      <div className="rp-form-group">
                        <label className="rp-form-label">UID</label>
                        <input type="text" className="rp-form-input" value={item.reference_id}
                          onChange={e => updateItem(idx, 'reference_id', e.target.value)} placeholder="001" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="rp-btn rp-btn-ghost" onClick={addCustomItem} style={{ width: '100%', borderStyle: 'dashed' }}>
                  <Plus size={16} /> Append Schedule Item
                </button>
              </div>
            )}

            {scheduleType === 'ADHOC' && (
              <div className="rp-grid-2">
                {formInputBlock('Maximum Approval Limit (₹)', 'approval_amount', 'number')}
                {formInputBlock('Authorization Expiry', 'end_date', 'date')}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="rp-btn rp-btn-ghost" onClick={() => navigate('/rocketpay/mandates')}>
              Discard
            </button>
            <button type="submit" className="rp-btn rp-btn-primary" disabled={loading} style={{ minWidth: '180px' }}>
              {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Confirm & Create Plan'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
