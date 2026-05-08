import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { listInstallments, refreshInstallment, skipInstallment, retryInstallment } from '../../services/installmentApi'
import { createInstallmentForMandate } from '../../services/mandateApi'
import { 
  ArrowLeft, RefreshCw, Loader2, AlertCircle, Plus, 
  CreditCard, Calendar, Info, Clock, AlertTriangle, CheckCircle2
} from 'lucide-react'
import '../RocketPayMandate/RocketPay.css'

const INST_STATE_COLORS = {
  CREATED: '#3b82f6',
  TERMINATED: '#6b7280',
  COLLECTION_INITIATED: '#a78bfa',
  COLLECTION_SUCCESS: '#10b981',
  COLLECTION_FAILED: '#ef4444',
  SETTLEMENT_INITIATED: '#f59e0b',
  SETTLEMENT_SUCCESS: '#059669',
  SETTLEMENT_FAILED: '#dc2626',
}

function StateBadge({ state }) {
  const color = INST_STATE_COLORS[state] || '#94a3b8'
  return (
    <span style={{ 
      background: `${color}10`, 
      color, 
      border: `1px solid ${color}30`, 
      borderRadius: 6, 
      padding: '2px 8px', 
      fontSize: 10, 
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.02em'
    }}>
      {state || '—'}
    </span>
  )
}

function DetailItem({ label, value, color }) {
  return (
    <div style={{ padding: '0.25rem 0' }}>
      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: color || '#1e293b' }}>{value ?? '—'}</div>
    </div>
  )
}

export default function InstallmentList() {
  const { id: mandateId } = useParams()
  const navigate = useNavigate()

  const [installments, setInstallments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actLoading, setActLoading] = useState('')
  const [actionMsg, setActionMsg] = useState(null)

  // Retry date input state
  const [retryDateMap, setRetryDateMap] = useState({})

  // Create installment form
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ amount: '', due_date: '', reference_id: '', description: '' })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listInstallments(mandateId)
      setInstallments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (mandateId) load() }, [mandateId])

  const doRefresh = async (instId) => {
    setActLoading('refresh_' + instId)
    try {
      await refreshInstallment(instId)
      await load()
      setActionMsg({ type: 'success', text: 'Installment status synchronized.' })
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message })
    } finally { setActLoading('') }
  }

  const doSkip = async (instId) => {
    if (!window.confirm('Are you sure you want to skip this installment?')) return
    setActLoading('skip_' + instId)
    try {
      await skipInstallment(instId)
      await load()
      setActionMsg({ type: 'success', text: 'Installment successfully skipped.' })
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message })
    } finally { setActLoading('') }
  }

  const doRetry = async (instId) => {
    const date = retryDateMap[instId]
    if (!date) return setActionMsg({ type: 'error', text: 'Please select a new collection date.' })
    setActLoading('retry_' + instId)
    try {
      await retryInstallment(instId, date)
      await load()
      setActionMsg({ type: 'success', text: 'Retry collection scheduled.' })
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message })
    } finally { setActLoading('') }
  }

  const doCreate = async (e) => {
    e.preventDefault()
    setActLoading('create')
    try {
      await createInstallmentForMandate(mandateId, {
        amount: Number(createForm.amount),
        due_date: createForm.due_date,
        reference_id: createForm.reference_id,
        description: createForm.description,
      })
      setShowCreate(false)
      await load()
      setActionMsg({ type: 'success', text: 'New installment registered.' })
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message })
    } finally { setActLoading('') }
  }

  return (
    <div className="rp-container">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-title">
          <h1>
            <Clock size={28} className="header-icon" />
            Installment Ledger
          </h1>
          <p>Tracking for Mandate: <span className="mono font-semibold" style={{ fontSize: '0.8rem' }}>{mandateId}</span></p>
        </div>
        <div className="rp-header-actions">
           <button className="rp-btn rp-btn-ghost" onClick={() => navigate(`/rocketpay/mandates/${mandateId}`)}>
            <ArrowLeft size={16} /> Mandate Overview
          </button>
          <button className="rp-btn rp-btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="rp-btn rp-btn-primary" onClick={() => setShowCreate(!showCreate)}>
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className={actionMsg.type === 'error' ? 'rp-error-banner' : 'rp-success-banner'}>
          {actionMsg.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <div style={{ flex: 1 }}>{actionMsg.text}</div>
          <button onClick={() => setActionMsg(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>×</button>
        </div>
      )}

      {/* Manual Creation Form */}
      {showCreate && (
        <form className="rp-block-group" style={{ borderStyle: 'dashed', background: '#fcfcfd' }} onSubmit={doCreate}>
          <div className="rp-block-title">Register Manual Collection</div>
          <div className="rp-grid-2">
            <div className="rp-form-group">
              <label className="rp-form-label">Collection Amount (₹)</label>
              <input type="number" className="rp-form-input" value={createForm.amount}
                onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))} required />
            </div>
            <div className="rp-form-group">
              <label className="rp-form-label">Scheduled Due Date</label>
              <input type="date" className="rp-form-input" value={createForm.due_date}
                onChange={e => setCreateForm(f => ({ ...f, due_date: e.target.value }))} required />
            </div>
          </div>
          <div className="rp-grid-2">
            <div className="rp-form-group">
              <label className="rp-form-label">Client Reference ID</label>
              <input type="text" className="rp-form-input" value={createForm.reference_id}
                onChange={e => setCreateForm(f => ({ ...f, reference_id: e.target.value }))} />
            </div>
            <div className="rp-form-group">
              <label className="rp-form-label">Internal Description</label>
              <input type="text" className="rp-form-input" value={createForm.description}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="rp-btn rp-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="rp-btn rp-btn-primary" disabled={actLoading === 'create'}>
              {actLoading === 'create' ? <Loader2 size={16} className="animate-spin" /> : null} Create Collection
            </button>
          </div>
        </form>
      )}

      {error && <div className="rp-error-banner"><AlertCircle size={20} /> {error}</div>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#0a1c5a' }} />
        </div>
      ) : installments.length === 0 ? (
        <div className="rp-empty-state">
          <Clock size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
          <div>No installments generated yet for this authorization.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {installments.map(inst => (
            <div key={inst.id} className="rp-block-group" style={{ transition: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <StateBadge state={inst.deleted ? 'DELETED' : inst.state} />
                    <span className="mono text-xs text-slate-500 font-semibold">{inst.id}</span>
                  </div>
                  <div className="text-sm font-semibold flex items-center gap-4">
                     <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> Due: {inst.dueDate}</span>
                     {inst.scheduleDate && <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> Sch: {inst.scheduleDate}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                    ₹{inst.payer?.amountValue?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{inst.payer?.amountCurrency || 'INR'}</div>
                </div>
              </div>

              <div className="rp-grid-4" style={{ padding: '1rem', background: '#fcfcfd', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <DetailItem label="Customer Persona" value={inst.payer?.name} />
                <DetailItem label="Mobile Ref" value={inst.payer?.mobileNumber} />
                <DetailItem label="Internal Ref" value={inst.referenceId} />
                <DetailItem label="Gateway UTR" value={inst.transactions?.[0]?.utr} color="#2563eb" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                <div className="flex gap-4">
                   {inst.payees?.map((p, i) => (
                    <div key={i} className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-600">
                      {p.tag}: ₹{p.amountValue}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button className="rp-btn rp-btn-ghost rp-btn-sm" onClick={() => doRefresh(inst.id)} disabled={actLoading === 'refresh_' + inst.id}>
                    {actLoading === 'refresh_' + inst.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Sync
                  </button>
                  
                  <button className="rp-btn rp-btn-ghost rp-btn-sm" onClick={() => doSkip(inst.id)} disabled={!!actLoading}>
                    Skip Period
                  </button>

                  {inst.state === 'COLLECTION_FAILED' && (
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#fffbeb', padding: '0.35rem', borderRadius: '8px', border: '1px solid #fef3c7', marginLeft: '0.5rem' }}>
                      <input
                        type="date"
                        className="rp-form-input"
                        style={{ padding: '0 8px', fontSize: '12px', width: '130px', height: '30px' }}
                        value={retryDateMap[inst.id] || ''}
                        onChange={e => setRetryDateMap(m => ({ ...m, [inst.id]: e.target.value }))}
                      />
                      <button className="rp-btn rp-btn-warning rp-btn-sm" onClick={() => doRetry(inst.id)} disabled={actLoading === 'retry_' + inst.id}>
                        {actLoading === 'retry_' + inst.id ? <Loader2 size={12} className="animate-spin" /> : 'Schedule Retry'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
