import React, { useState, useEffect } from 'react'
import { Users, Shield, Search, Power, User, Mail, Smartphone, Calendar, Loader2, Building2, ChevronRight, ChevronDown, CheckCircle2, XCircle } from 'lucide-react'
import API_BASE_URL from '../../config'
import '../Admin/Admin.css'

export default function ManageUsers() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedClient, setExpandedClient] = useState(null)
  const [clientUsers, setClientUsers] = useState({})
  const [loadingUsers, setLoadingUsers] = useState({})
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  const headers = {
    'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
  }

  const fetchClients = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch(`${API_BASE_URL}/Client`, { headers })
      if (!resp.ok) throw new Error('Failed to fetch clients')
      const data = await resp.json()
      setClients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchUsers = async (clientCode) => {
    if (clientUsers[clientCode]) return 
    
    setLoadingUsers(prev => ({ ...prev, [clientCode]: true }))
    try {
      const resp = await fetch(`${API_BASE_URL}/Client/${clientCode}/users`, { headers })
      if (!resp.ok) throw new Error('Failed to fetch users')
      const data = await resp.json()
      setClientUsers(prev => ({ ...prev, [clientCode]: data }))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingUsers(prev => ({ ...prev, [clientCode]: false }))
    }
  }

  const toggleClientStatus = async (clientCode) => {
    setActionLoading(`client-${clientCode}`)
    try {
      const resp = await fetch(`${API_BASE_URL}/Client/${clientCode}/toggle-active`, {
        method: 'PATCH',
        headers
      })
      if (resp.ok) {
        setClients(prev => prev.map(c => 
          c.clientCode === clientCode ? { ...c, isActive: !c.isActive } : c
        ))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleUserStatus = async (clientCode, userId) => {
    setActionLoading(`user-${userId}`)
    try {
      const resp = await fetch(`${API_BASE_URL}/Client/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers
      })
      if (resp.ok) {
        setClientUsers(prev => ({
          ...prev,
          [clientCode]: prev[clientCode].map(u => 
            u.userCode === userId ? { ...u, isActive: !u.isActive } : u
          )
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleExpand = (clientCode) => {
    if (expandedClient === clientCode) {
      setExpandedClient(null)
    } else {
      setExpandedClient(clientCode)
      fetchUsers(clientCode)
    }
  }

  return (
    <div className="admin-module">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-icon-box purple">
            <Users size={20} />
          </div>
          <div className="admin-title">
            <h1>Manage Users & Clients</h1>
            <p>Monitor all institutions and manage their access credentials</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <Shield size={16} />
          Super Admin Console
        </div>
      </div>

      <div className="admin-full">
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2><Building2 size={18} /> Registered Clients ({clients.length})</h2>
            <div className="admin-search" style={{ margin: 0, width: 300 }}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search by name, code or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <Loader2 size={32} className="animate-spin" />
              <p>Loading clients database...</p>
            </div>
          ) : error ? (
            <div className="msg-error">
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="empty-state">
              <Building2 size={32} />
              <p>No clients found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Client Name</th>
                    <th>Client Code</th>
                    <th>Contact Info</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <React.Fragment key={client.clientCode}>
                      <tr>
                        <td style={{ cursor: 'pointer' }} onClick={() => handleExpand(client.clientCode)}>
                          {expandedClient === client.clientCode ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{client.name}</div>
                        </td>
                        <td>
                          <span className="badge badge-admin">{client.clientCode}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {client.email && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={10} /> {client.email}</div>}
                            {client.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Smartphone size={10} /> {client.phone}</div>}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {new Date(client.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${client.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {client.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            className={`btn ${client.isActive ? 'btn-danger' : 'btn-success'}`}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', backgroundColor: client.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: client.isActive ? '#ef4444' : '#10b981', border: `1px solid ${client.isActive ? '#ef4444' : '#10b981'}` }}
                            onClick={() => toggleClientStatus(client.clientCode)}
                            disabled={actionLoading === `client-${client.clientCode}`}
                          >
                            {actionLoading === `client-${client.clientCode}` ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                            {client.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                      {expandedClient === client.clientCode && (
                        <tr>
                          <td colSpan="7" style={{ padding: '0 0 1rem 3rem', background: 'var(--bg-hover)' }}>
                            <div style={{ borderLeft: '2px solid var(--accent-blue)', padding: '0.5rem 1rem' }}>
                              <h3 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={14} /> Registered Users for {client.name}
                              </h3>
                              
                              {loadingUsers[client.clientCode] ? (
                                <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  <Loader2 size={14} className="animate-spin" /> Loading users...
                                </div>
                              ) : clientUsers[client.clientCode]?.length === 0 ? (
                                <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>No users found for this client.</div>
                              ) : (
                                <div className="admin-table-wrap">
                                  <table style={{ background: 'var(--bg-modal)', borderRadius: '8px' }}>
                                    <thead style={{ background: 'transparent' }}>
                                      <tr>
                                        <th>User Name</th>
                                        <th>Login ID</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {clientUsers[client.clientCode]?.map(user => (
                                        <tr key={user.userCode}>
                                          <td style={{ fontWeight: 500 }}>{user.userName}</td>
                                          <td style={{ fontFamily: 'monospace' }}>{user.userLoginId}</td>
                                          <td>
                                            <span className={`badge ${user.roleName === 'BANK_ADMIN' ? 'badge-admin' : user.roleName === 'OPERATOR' ? 'badge-active' : user.roleName === 'AUDITOR' ? 'badge-admin' : 'badge-client'}`}>{user.roleName || 'No Role'}</span>
                                          </td>
                                          <td>
                                            <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                              {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                          </td>
                                          <td>
                                            <button 
                                              className="btn"
                                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', border: '1px solid var(--border-color)' }}
                                              onClick={() => toggleUserStatus(client.clientCode, user.userCode)}
                                              disabled={actionLoading === `user-${user.userCode}`}
                                            >
                                              {actionLoading === `user-${user.userCode}` ? <Loader2 size={10} className="animate-spin" /> : (user.isActive ? 'Disable' : 'Enable')}
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
