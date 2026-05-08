import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMandate, refreshMandate, deleteMandate, cancelMandate } from '../../services/mandateApi'
import { 
  ArrowLeft, RefreshCw, Trash2, XCircle, Loader2, 
  AlertCircle, ExternalLink, FileText, Activity, 
  User, CreditCard, ShieldCheck, History, Info,
  CalendarClock
} from 'lucide-react'
import './RocketPay.css'

const STATE_COLORS = {
  CREATED: '#3b82f6',
  ACCEPTED: '#8b5cf6',
  ACTIVATED: '#10b981',
  PAUSED: '#f59e0b',
  REVOKED: '#ef4444',
  DELETED: '#6b7280',
}

function StateBadge({ state }) {
  const color = STATE_COLORS[state] || '#94a3b8'
  return (
    <span style={{
      background: `${color}10`,
      color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    }}>
      {state || '—'}
    </span>
  )
}

function InfoBlock({ label, value, icon: Icon }) {
  if (value == null || value === '') return null
  return (
    <div className="rp-info-block" style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', marginBottom: '4px' }}>
        {Icon && <Icon size={12} />}
        <span className="rp-info-label">{label}</span>
      </div>
      <div className="rp-info-value">{value}</div>
    </div>
  )
}

export default function MandateDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [mandate, setMandate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actLoading, setActLoading] = useState(null) // 'Refresh' | 'Delete Mandate' | etc
  const [actionMsg, setActionMsg] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getMandate(id)
        setMandate(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function doAction(label, actionFn) {
    setActLoading(label)
    setActionMsg(null)
    try {
      const updated = await actionFn()
      setMandate(updated)
      setActionMsg({ type: 'success', text: `${label} operation successful.` })
    } catch (err) {
      const msg = err?.rawBody ? JSON.parse(err.rawBody).message : err.message
      setActionMsg({ type: 'error', text: `${label} failed: ${msg}` })
    } finally {
      setActLoading(null)
    }
  }

  if (loading) return (
    <div className="rp-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Loader2 size={36} className="animate-spin" style={{ color: '#0a1c5a' }} />
    </div>
  )
  
  const m = mandate

  return (
    <div className="rp-container">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-title">
          <h1>
            <ShieldCheck size={28} className="header-icon" />
            Plan Overview
          </h1>
          <p>Detailed view of payment authorization and historical context.</p>
        </div>
        <div className="rp-header-actions">
           {m && <StateBadge state={m.deleted ? 'DELETED' : m.state} />}
           <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }} />
           <button className="rp-btn rp-btn-ghost" onClick={() => navigate('/rocketpay/mandates')}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>
      </div>

      {error && (
        <div className="rp-error-banner" style={{ margin: '1rem 0.5rem 2rem 0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <AlertCircle size={20} /> Unable to load plan details
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              {error.includes('Failed to fetch') ? 'Could not connect to the server. Please check if the backend is running or your internet connection.' : error}
            </p>
          </div>
        </div>
      )}

      {actionMsg && (
        <div className={actionMsg.type === 'error' ? 'rp-error-banner' : 'rp-success-banner'} style={{ margin: '1rem 0.5rem 2rem 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={18} /> <span>{actionMsg.text}</span>
          </div>
        </div>
      )}

      {m && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Core Schedule Block */}
          <div className="rp-block-group">
            <div className="rp-block-title">
              <CalendarClock size={18} /> Schedule Configuration
            </div>
            <div className="rp-grid-3">
              <InfoBlock label="Billing Frequency" value={m.frequency} />
              <InfoBlock label="Cycle Amount" value={m.approvalAmount != null ? `₹${m.approvalAmount.toLocaleString('en-IN')}` : '—'} />
              <InfoBlock label="Advance Amount" value={m.advanceAmount != null ? `₹${m.advanceAmount.toLocaleString('en-IN')}` : '0'} />
              <InfoBlock label="Effective Date" value={m.startDate} />
              <InfoBlock label="Expiry Date" value={m.endDate || 'Ongoing'} />
              <InfoBlock label="Remaining Cycles" value={m.installmentCount != null ? m.installmentCount : 'N/A'} />
            </div>
            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
               <InfoBlock label="Description / Memo" value={m.clientMetaDescription} />
            </div>
          </div>

          {/* Payee Entities */}
          {m.payees?.length > 0 && (
            <div className="rp-block-group">
              <div className="rp-block-title">
                <CreditCard size={18} /> Settling Entities
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {m.payees.map((p, i) => (
                  <div key={i} style={{ 
                    padding: '1rem', 
                    borderRadius: '12px', 
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ color: 'var(--accent-blue)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                      {p.tag?.replace(/_/g, ' ')}
                    </div>
                    <div className="rp-grid-3">
                      <InfoBlock label="Entity Name" value={p.name} />
                      <InfoBlock label="Allocated Amount" value={p.amountValue != null ? `₹${p.amountValue} ${p.amountCurrency || 'INR'}` : null} />
                      <InfoBlock label="Settlement A/C" value={p.accountNumber ? `${p.accountNumber} (${p.ifsc})` : p.accountId} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Trail / Transactions */}
          <div className="rp-block-group">
            <div className="rp-block-title">
              <History size={18} /> Event History
            </div>
            {m.transactions?.length > 0 ? (
              <div className="rp-table-wrap">
                <table className="rp-table">
                  <thead>
                    <tr>
                      <th>TXN ID</th>
                      <th>Status</th>
                      <th>Medium</th>
                      <th>UMRN / Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.transactions.map((t, i) => (
                      <tr key={i}>
                        <td className="mono text-xs">{t.txnId}</td>
                        <td className="font-semibold text-xs">{t.state}</td>
                        <td className="text-xs">{t.medium}</td>
                        <td className="mono text-xs">{t.umrn || t.gatewayReferenceId || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic py-2">No transaction history recorded for this plan yet.</div>
            )}
          </div>
        </div>

        {/* Sidebar / Actions Area */}
        <div style={{ position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Action Center */}
          <div className="rp-block-group">
            <div className="rp-block-title">
              <Activity size={18} /> Operation Center
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="rp-btn rp-btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/rocketpay/mandates/${id}/installments`)}>
                Manage Installments
              </button>
              
              {m.mandateAuthCheckoutUrl && (
                <a href={m.mandateAuthCheckoutUrl} target="_blank" rel="noreferrer" className="rp-btn rp-btn-ghost" style={{ width: '100%', textDecoration: 'none', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }}>
                  <ExternalLink size={14} /> Open Checkout Form
                </a>
              )}
              
              <button className="rp-btn rp-btn-ghost" style={{ width: '100%' }} onClick={() => doAction('Refresh', () => refreshMandate(id))} disabled={!!actLoading}>
                {actLoading === 'Refresh' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sync from Gateway
              </button>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

              {m.state === 'ACTIVATED' && (
                <button className="rp-btn rp-btn-warning" style={{ width: '100%' }} onClick={() => doAction('Cancel Mandate', () => cancelMandate(id))} disabled={!!actLoading}>
                  {actLoading === 'Cancel Mandate' ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Revoke Authorization
                </button>
              )}
              
              {m.state === 'CREATED' && (
                <button className="rp-btn rp-btn-danger" style={{ width: '100%' }} onClick={() => doAction('Delete Mandate', () => deleteMandate(id))} disabled={!!actLoading}>
                  {actLoading === 'Delete Mandate' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete Selection
                </button>
              )}
            </div>
          </div>

          {/* Context Identifiers */}
          <div className="rp-block-group">
            <div className="rp-block-title">
              <Info size={18} /> Identifiers
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <InfoBlock label="External ID" value={m.referenceId} />
              <InfoBlock label="Ref Type" value={m.referenceType} />
              <InfoBlock label="Order ID" value={m.paymentOrderId} />
              <InfoBlock label="UMRN" value={m.transactions?.[0]?.umrn} />
            </div>
          </div>

          {/* Payer Persona */}
          {m.payer && (
            <div className="rp-block-group">
               <div className="rp-block-title">
                <User size={18} /> Payer Profile
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <InfoBlock label="Legal Name" value={m.payer.name} />
                <InfoBlock label="Registered Mob" value={m.payer.mobileNumber} />
                <InfoBlock label="Auth Mode" value={m.payer.mode} />
                <InfoBlock label="VPA / Account" value={m.payer.accountNumber || m.payer.accountId} />
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
)
}
