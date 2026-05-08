import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Check, X, Search, Info, Edit3, Lock, UserCircle, Power } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import './UserManagement.css';
import CustomSelect from '../Shared/CustomSelect';

export default function UserManagement() {
  const { showToast } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({ userName: '', role: '', newPassword: '' });
  const [newUser, setNewUser] = useState({
    userName: '',
    userLoginId: '',
    password: '',
    role: 'OPERATOR'
  });

  const roles = [
    { id: 'BANK_ADMIN', name: 'Admin (Bank Manager)', desc: 'Full control within bank' },
    { id: 'OPERATOR', name: 'Operator (Data Entry)', desc: 'KYC & Operations' },
    { id: 'AUDITOR', name: 'Auditor', desc: 'Compliance & Reports' },
    { id: 'VIEWER', name: 'Viewer', desc: 'Read-only Access' }
  ];

  const permissionMatrix = [
    { module: 'Dashboard View', admin: true, operator: true, auditor: true, viewer: true },
    { module: 'Aadhaar Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'PAN Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'CIBIL Check', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'Mobile Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'Driving Licence Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'Passport Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'Voter ID Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'GST Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'Udyam Verification', admin: true, operator: true, auditor: false, viewer: false },
    { module: 'View Verification History', admin: true, operator: true, auditor: true, viewer: true },
    { module: 'Download Reports', admin: true, operator: true, auditor: true, viewer: true },
    { module: 'View Credit Balance', admin: true, operator: true, auditor: true, viewer: true },
    { module: 'View Transaction History', admin: true, operator: true, auditor: true, viewer: true },
    { module: 'Manage Users (Create/Edit)', admin: true, operator: false, auditor: false, viewer: false },
    { module: 'View Audit Logs', admin: true, operator: true, auditor: true, viewer: false },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/UserManagement/users`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setUsers(data);
      }
    } catch (err) {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch(`${API_BASE_URL}/UserManagement/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify(newUser)
      });
      if (resp.ok) {
        showToast("User created successfully", "success");
        setShowModal(false);
        setNewUser({ userName: '', userLoginId: '', password: '', role: 'OPERATOR' });
        fetchUsers();
      } else {
        const err = await resp.json();
        showToast(err.message || "Failed to create user", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    const body = {};
    if (editForm.userName && editForm.userName !== editModal.userName) body.userName = editForm.userName;
    if (editForm.role && editForm.role !== editModal.roleName) body.role = editForm.role;
    if (editForm.newPassword) body.newPassword = editForm.newPassword;

    if (Object.keys(body).length === 0) {
      showToast("No changes to save", "info");
      return;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/UserManagement/users/${editModal.userCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        showToast("User updated successfully", "success");
        setEditModal(null);
        setEditForm({ role: '', newPassword: '' });
        fetchUsers();
      } else {
        const err = await resp.json();
        showToast(err.message || "Update failed", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const resp = await fetch(`${API_BASE_URL}/UserManagement/users/${id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) {
        fetchUsers();
        showToast("Status updated", "success");
      }
    } catch (err) {
      showToast("Error updating status", "error");
    }
  };

  const openEditModal = (user) => {
    setEditModal(user);
    setEditForm({ 
      userName: user.userName,
      role: user.roleName, 
      newPassword: '' 
    });
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'BANK_ADMIN') return 'role-admin';
    if (role === 'OPERATOR') return 'role-operator';
    if (role === 'AUDITOR') return 'role-auditor';
    if (role === 'CLIENT') return 'role-client';
    return 'role-viewer';
  };

  const renderCheck = (val) => val ? <Check className="perm-check" size={16} /> : <X className="perm-cross" size={16} />;

  return (
    <div className="user-mgmt-container">
      {/* Header */}
      <div className="user-mgmt-header">
        <div className="header-title-box">
          <h1>User Management</h1>
          <p>Manage your institutional staff users and assign roles</p>
        </div>
        <button className="um-btn-submit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="user-list-card">
        <div className="card-header">
          <h2><Users size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Staff Directory</h2>
          <div className="mini-search">
            <Search size={14} color="#94a3b8" />
            <input type="text" placeholder="Search users..." />
          </div>
        </div>
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Login ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading users...</td></tr>
              ) : users.length > 0 ? users.map(user => (
                <tr key={user.userCode}>
                  <td>
                    <div className="row-user-info">
                      <div className="user-avatar"><UserCircle size={20} /></div>
                      <span style={{ fontWeight: 600 }}>{user.userName}</span>
                    </div>
                  </td>
                  <td><code style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{user.userLoginId}</code></td>
                  <td>
                    <span className={`badge-role ${getRoleBadgeClass(user.roleName)}`}>
                      {user.roleName?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className={`status-indicator ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      <div className="status-dot"></div>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-action edit" onClick={() => openEditModal(user)}>
                        <Edit3 size={12} /> Edit
                      </button>
                      <button className={`btn-action ${user.isActive ? 'deactivate' : 'activate'}`}
                              onClick={() => toggleUserStatus(user.userCode)}>
                        <Power size={12} /> {user.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <UserCircle size={40} style={{ marginBottom: '8px', opacity: 0.3 }} /><br />No users found. Click "Add New User" to get started.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="matrix-card">
        <div className="card-header" style={{ background: '#0f172a', color: '#fff', borderBottom: 'none' }}>
          <h2 style={{ color: '#fff' }}><Shield size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Roles & Permissions Matrix</h2>
          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Official Bank Policy</span>
        </div>
        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', minWidth: '220px' }}>Feature / Module</th>
                <th>Admin</th>
                <th>Operator</th>
                <th>Auditor</th>
                <th>Viewer</th>
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.module}</td>
                  <td>{renderCheck(item.admin)}</td>
                  <td>{renderCheck(item.operator)}</td>
                  <td>{renderCheck(item.auditor)}</td>
                  <td>{renderCheck(item.viewer)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '10px', alignItems: 'center', borderTop: '1px solid #edf2f7' }}>
          <Info size={15} />
          All users are strictly bound to their <strong style={{ margin: '0 3px' }}>Institutional ClientCode</strong>. Bank users cannot add credit or modify service rates.
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="um-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="um-modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="um-modal-title">Create New Staff User</h2>
            <p className="um-modal-subtitle">Add a new team member to your institution</p>
            <form onSubmit={handleCreateUser}>
              <div className="um-form-group">
                <label>Full Name</label>
                <input type="text" className="um-form-input" placeholder="e.g. Rajesh Kumar" required
                       value={newUser.userName} onChange={e => setNewUser({...newUser, userName: e.target.value})} />
              </div>
              <div className="um-form-group">
                <label>Login ID (Unique)</label>
                <input type="text" className="um-form-input" placeholder="e.g. rajesh_avs" required
                       value={newUser.userLoginId} onChange={e => setNewUser({...newUser, userLoginId: e.target.value})} />
              </div>
              <div className="um-form-group">
                <label>Password</label>
                <input type="password" className="um-form-input" placeholder="Min 6 characters" required
                       value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="um-form-group">
                <label>Assigned Role</label>
                <CustomSelect
                  value={newUser.role}
                  onChange={val => setNewUser({...newUser, role: val})}
                  options={roles.map(role => ({ value: role.id, label: role.name }))}
                  icon={Shield}
                />
                <p className="um-form-hint">{roles.find(r => r.id === newUser.role)?.desc}</p>
              </div>
              <div className="um-modal-footer">
                <button type="button" className="um-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="um-btn-submit">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (Role + Password) */}
      {editModal && (
        <div className="um-modal-overlay" onClick={() => { setEditModal(null); setEditForm({ role: '', newPassword: '' }); }}>
          <div className="um-modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="um-modal-title">Edit User</h2>
            <p className="um-modal-subtitle">
              Editing <strong>{editModal.userName}</strong> ({editModal.userLoginId})
            </p>
            <form onSubmit={handleEditUser}>
              <div className="um-form-group">
                <label><Users size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Full Name</label>
                <input type="text" className="um-form-input" placeholder="e.g. Rajesh Kumar" required
                       value={editForm.userName} onChange={e => setEditForm({...editForm, userName: e.target.value})} />
              </div>

              <div className="um-form-group">
                <label><Shield size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Change Role</label>
                <CustomSelect
                  value={editForm.role}
                  onChange={val => setEditForm({...editForm, role: val})}
                  options={roles.map(role => ({ value: role.id, label: role.name }))}
                  icon={Shield}
                />
                <p className="um-form-hint">
                  Current: <strong>{editModal.roleName?.replace('_', ' ')}</strong>
                  {editForm.role !== editModal.roleName && <span style={{ color: 'var(--accent-blue)', marginLeft: '6px' }}>→ {editForm.role?.replace('_', ' ')}</span>}
                </p>
              </div>

              <hr className="um-form-divider" />

              <div className="um-form-group">
                <label><Lock size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Reset Password</label>
                <input type="password" className="um-form-input" placeholder="Leave blank to keep current password"
                       value={editForm.newPassword} onChange={e => setEditForm({...editForm, newPassword: e.target.value})} />
                <p className="um-form-hint">Minimum 6 characters. Leave empty if no change needed.</p>
              </div>

              <div className="um-modal-footer">
                <button type="button" className="um-btn-cancel" onClick={() => { setEditModal(null); setEditForm({ role: '', newPassword: '' }); }}>Cancel</button>
                <button type="submit" className="um-btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
