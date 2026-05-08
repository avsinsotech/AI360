import { useState, useEffect } from 'react'
import { Search, Loader2, ScrollText, Activity, Shield, Building2, ShieldCheck } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import API_BASE_URL from '../../config'
import './Admin.css'
import CustomSelect from '../Shared/CustomSelect'

export default function AuditLogs() {
  const { user } = useApp()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const [clients, setClients] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const recordsPerPage = 15

  useEffect(() => { 
    fetchLogs()
    if (user?.role === 'SUPER_ADMIN') fetchClients()
  }, [filterClient])

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Client`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      })
      if (res.ok) setClients(await res.json())
    } catch (err) {}
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const url = `${API_BASE_URL}/Audit?limit=500${filterClient ? `&filterClient=${filterClient}` : ''}`
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const actions = [...new Set(logs.map(l => l.action))]

  const filtered = logs.filter(l =>
    (l.description || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterAction ? l.action === filterAction : true)
  )

  const totalPages = Math.ceil(filtered.length / recordsPerPage)
  const currentRecords = filtered.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)

  const getActionColor = (action) => {
    if (action.includes('CREDIT_ADDED')) return 'badge-credit'
    if (action.includes('DEDUCT')) return 'badge-debit'
    if (action.includes('SIGNUP') || action.includes('CLIENT')) return 'badge-admin'
    if (action.includes('RATE')) return 'badge-client'
    if (action.includes('LOGIN')) return 'badge-active'
    return 'badge-admin'
  }

  return (
    <div className="admin-module">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-icon-box orange">
            <ScrollText size={20} />
          </div>
          <div className="admin-title">
            <h1>Audit Logs</h1>
            <p>Track all system actions, credit operations, and changes</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Shield size={16} />
          {logs.length} entries
        </div>
      </div>

      <div className="metric-row">
        <div className="metric-card">
          <span className="metric-label">Total Entries</span>
          <span className="metric-value blue">{logs.length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Credit Operations</span>
          <span className="metric-value green">{logs.filter(l => l.action?.includes('CREDIT')).length}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Client Activities</span>
          <span className="metric-value orange">{logs.filter(l => l.clientCode !== 'GLOBAL' && l.clientCode !== null).length}</span>
        </div>
      </div>

      <div className="admin-full">
        <div className="admin-card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div className="admin-search" style={{ flex: 1, marginBottom: 0 }}>
              <Search size={16} />
              <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }} placeholder="Search audit logs..." />
            </div>
            {user?.role === 'SUPER_ADMIN' && (
              <CustomSelect
                placeholder="All Clients"
                value={filterClient}
                onChange={val => { setFilterClient(val); setCurrentPage(1); }}
                options={[
                  { value: '', label: 'All Clients' },
                  ...clients.map(c => ({ value: c.clientCode, label: c.name }))
                ]}
                searchable
                icon={Building2}
              />
            )}

            <CustomSelect
              placeholder="All Actions"
              value={filterAction}
              onChange={val => { setFilterAction(val); setCurrentPage(1); }}
              options={[
                { value: '', label: 'All Actions' },
                ...actions.map(a => ({ value: a, label: a.replace(/_/g, ' ') }))
              ]}
              searchable
              icon={ShieldCheck}
            />
          </div>

          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Client</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={20} className="animate-spin" /></td></tr>
                ) : currentRecords.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><ScrollText size={32} /><p>No audit logs found</p></div></td></tr>
                ) : currentRecords.map((log, i) => (
                  <tr key={log.id}>
                    <td>{(currentPage - 1) * recordsPerPage + i + 1}</td>
                    <td><span className={`badge ${getActionColor(log.action || '')}`}>{log.action}</span></td>
                    <td style={{ maxWidth: 300 }}>{log.description}</td>
                    <td><span className="badge badge-admin">{log.clientCode || 'SYSTEM'}</span></td>
                    <td>
                      <code 
                        title={log.ipAddress}
                        style={{ 
                          fontSize: '0.75rem', 
                          background: 'var(--bg-secondary)', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          cursor: 'help',
                          color: log.ipAddress === '::1' ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                        {log.ipAddress === '::1' ? 'Localhost' : (log.ipAddress || '—')}
                      </code>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = currentPage <= 4 ? i + 1 : currentPage + i - 3
                if (page > totalPages || page < 1) return null
                return <button key={page} className={currentPage === page ? 'active' : ''} onClick={() => setCurrentPage(page)}>{page}</button>
              })}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
