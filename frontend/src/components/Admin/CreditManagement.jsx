import React, { useState, useEffect } from 'react'
import { Wallet, PlusCircle, ArrowDownCircle, ArrowUpCircle, History, Loader2, AlertCircle, Search, IndianRupee, TrendingUp, Building2 } from 'lucide-react'
import API_BASE_URL from '../../config'
import '../Admin/Admin.css'
import { useApp } from '../../context/AppContext'
import CustomSelect from '../Shared/CustomSelect'

export default function CreditManagement() {
  const { user } = useApp()
  const [activeTab, setActiveTab] = useState('overview')
  const [balance, setBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [targetClientCode, setTargetClientCode] = useState('')
  const [addAmount, setAddAmount] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [clients, setClients] = useState([])
  const recordsPerPage = 12

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      fetchClients()
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [targetClientCode])

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

  const fetchData = async () => {
    setLoading(true)
    const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
    const params = (user?.role === 'SUPER_ADMIN' && targetClientCode) ? `?clientCode=${targetClientCode}` : ''
    
    try {
      const [balRes, txnRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Credit/balance${params}`, { headers }),
        fetch(`${API_BASE_URL}/Credit/transactions${params}${params ? '&' : '?'}limit=200`, { headers })
      ])
      if (balRes.ok) {
        const b = await balRes.json()
        setBalance(b.balance)
      }
      if (txnRes.ok) {
        const t = await txnRes.json()
        setTransactions(t)
      }
    } catch (err) {
      setError('Failed to load credit data.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredit = async (e) => {
    e.preventDefault()
    if (!addAmount || parseFloat(addAmount) <= 0) {
      setError('Enter a valid amount.')
      return
    }
    setAddLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`${API_BASE_URL}/Credit/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify({ 
          clientCode: user?.role === 'SUPER_ADMIN' ? targetClientCode : user?.clientCode,
          amount: parseFloat(addAmount), 
          description: addDesc || 'Manual credit addition' 
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(`₹${parseFloat(addAmount).toFixed(2)} added successfully.`)
        setBalance(data.balance)
        setAddAmount('')
        setAddDesc('')
        fetchData()
      } else {
        setError(data.message || 'Failed to add credit.')
      }
    } catch (err) {
      setError('Network error.')
    } finally {
      setAddLoading(false)
    }
  }

  const filtered = transactions.filter(t =>
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / recordsPerPage)
  const currentRecords = filtered.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)

  const totalCredits = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0)
  const totalDebits = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="admin-module">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-icon-box green">
            <Wallet size={20} />
          </div>
          <div className="admin-title">
            <h1>{user?.role === 'SUPER_ADMIN' ? 'Credit Management' : 'Wallet & Usage'}</h1>
            <p>{user?.role === 'SUPER_ADMIN' ? 'Manage wallet balance and view transaction history' : 'Monitor your wallet balance and recent activity'}</p>
          </div>
        </div>
        {user?.role !== 'SUPER_ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Balance</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981' }}>
                {loading ? '...' : `₹${(balance || 0).toFixed(2)}`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Blocks */}
      <div className="credit-nav-blocks">
        <div className={`credit-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <div className="nav-icon"><TrendingUp size={22} /></div>
          <div className="nav-text">Overview</div>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <div className={`credit-nav-item ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>
            <div className="nav-icon"><PlusCircle size={22} /></div>
            <div className="nav-text">Add Credit</div>
          </div>
        )}
        <div className={`credit-nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <div className="nav-icon"><History size={22} /></div>
          <div className="nav-text">Transactions</div>
        </div>
      </div>

      {error && <div className="msg-error"><AlertCircle size={16} /><span>{error}</span></div>}
      {success && <div className="msg-success"><ArrowUpCircle size={16} /><span>{success}</span></div>}

      <div className="admin-full">
        {user?.role === 'SUPER_ADMIN' && activeTab !== 'add' && (
          <div className="admin-card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Building2 size={18} style={{ color: 'var(--text-muted)' }} />
            <div style={{ flex: 1 }}>
              <CustomSelect
                placeholder="All Banks (Global View)"
                value={targetClientCode}
                onChange={val => setTargetClientCode(val)}
                options={[
                  { value: '', label: 'All Banks (Global View)' },
                  ...clients.map(c => ({ value: c.clientCode, label: `${c.name} (${c.clientCode})` }))
                ]}
                searchable
                icon={Building2}
              />
            </div>
              {targetClientCode && (
                <button className="btn btn-secondary" onClick={() => setTargetClientCode('')} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                  Clear Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="metric-row">
              {(user?.role !== 'SUPER_ADMIN' || targetClientCode) && (
                <div className="metric-card">
                  <span className="metric-label">Current Balance</span>
                  <span className="metric-value green">₹{(balance || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="metric-card">
                <span className="metric-label">Total Credited</span>
                <span className="metric-value blue">₹{totalCredits.toFixed(2)}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Total Debited</span>
                <span className="metric-value orange">₹{totalDebits.toFixed(2)}</span>
              </div>
              <div className="metric-card">
                <span className="metric-label">Transactions</span>
                <span className="metric-value">{transactions.length}</span>
              </div>
            </div>

            <div className="admin-card">
              <h2>
                <History size={16} /> 
                {user?.role === 'SUPER_ADMIN' && !targetClientCode ? ' Recent Transactions (All Banks)' : ' Recent Transactions'}
              </h2>
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Balance After</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 8).map(t => (
                      <tr key={t.id}>
                        <td><span className={`badge ${t.type === 'CREDIT' ? 'badge-credit' : 'badge-debit'}`}>{t.type}</span></td>
                        <td style={{ fontWeight: 600 }}>₹{t.amount.toFixed(2)}</td>
                        <td>{t.category || '—'}</td>
                        <td>{t.description || '—'}</td>
                        <td>₹{(t.balanceAfter || 0).toFixed(2)}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {transactions.length === 0 && (
                  <div className="empty-state"><Wallet size={32} /><p>No transactions yet</p></div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Add Credit Tab */}
        {activeTab === 'add' && (
          <div className="admin-card" style={{ maxWidth: 450 }}>
            <h2><PlusCircle size={16} /> Add Credit to Wallet</h2>
            <form onSubmit={handleAddCredit}>
              <div className="form-group">
                <label>Select Bank / Society *</label>
                <div style={{ position: 'relative' }}>
                  <CustomSelect
                    placeholder="-- Choose a Bank --"
                    value={targetClientCode}
                    onChange={val => setTargetClientCode(val)}
                    options={clients.map(c => ({ value: c.clientCode, label: `${c.name} (${c.clientCode})` }))}
                    searchable
                    icon={Building2}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input type="number" min="1" step="0.01" value={addAmount} onChange={e => setAddAmount(e.target.value)} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={addDesc} onChange={e => setAddDesc(e.target.value)} placeholder="e.g. Monthly recharge" />
              </div>
              <button type="submit" className="btn btn-success" disabled={addLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {addLoading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><IndianRupee size={16} /> Add Credit</>}
              </button>
            </form>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'history' && (
          <div className="admin-card" style={{ flex: 1 }}>
            <h2>
              <History size={16} /> 
              {user?.role === 'SUPER_ADMIN' && !targetClientCode ? ' All Transactions (Global)' : ' All Transactions'}
            </h2>
            <div className="admin-search">
              <Search size={16} />
              <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }} placeholder="Search by category or description..." />
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Balance After</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((t, i) => (
                    <tr key={t.id}>
                      <td>{(currentPage - 1) * recordsPerPage + i + 1}</td>
                      <td><span className={`badge ${t.type === 'CREDIT' ? 'badge-credit' : 'badge-debit'}`}>{t.type}</span></td>
                      <td style={{ fontWeight: 600 }}>₹{t.amount.toFixed(2)}</td>
                      <td>{t.category || '—'}</td>
                      <td>{t.description || '—'}</td>
                      <td>₹{(t.balanceAfter || 0).toFixed(2)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="empty-state"><History size={32} /><p>No transactions found</p></div>}
            </div>
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage + i - 2
                  if (page > totalPages || page < 1) return null
                  return <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => setCurrentPage(page)}>{page}</button>
                })}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
