import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import  API_BASE_URL  from '../../config';
import { Building2, Mail, Phone, MapPin, Upload, Save, Loader2, Globe, ShieldCheck, Lock } from 'lucide-react';
import './ProfileManagement.css';

export default function ProfileManagement() {
    const { user, clientInfo, setClientInfo, showToast } = useApp();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        logoUrl: ''
    });

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const isAdmin = user?.role?.includes('ADMIN') || user?.role === 'SUPER_ADMIN';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        if (!user?.clientCode) return;
        try {
            const resp = await fetch(`${API_BASE_URL}/Client/${user.clientCode}`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    logoUrl: data.logoUrl || ''
                });
            }
        } catch (err) {
            showToast('Failed to load profile details.', 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                showToast('Logo must be smaller than 1MB', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const resp = await fetch(`${API_BASE_URL}/Client/${user.clientCode}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
                },
                body: JSON.stringify(formData)
            });

            if (resp.ok) {
                const result = await resp.json();
                showToast('Profile updated successfully!', 'success');
                if (setClientInfo) {
                    setClientInfo(result.client);
                }
            } else {
                const err = await resp.json();
                showToast(err.message || 'Update failed', 'error');
            }
        } catch (err) {
            showToast('Technical error updating profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters.', 'warning');
            return;
        }

        setLoading(true);
        try {
            const resp = await fetch(`${API_BASE_URL}/UserManagement/users/${user.userId}/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
                },
                body: JSON.stringify({ newPassword: passwordData.newPassword })
            });

            if (resp.ok) {
                showToast('Password updated successfully!', 'success');
                setPasswordData({ newPassword: '', confirmPassword: '' });
            } else {
                const err = await resp.json();
                showToast(err.message || 'Failed to update password', 'error');
            }
        } catch (err) {
            showToast('Error updating password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="profile-loading">
                <Loader2 className="animate-spin" size={40} />
                <p>Loading institutional profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-mgmt-container">
            <div className="profile-hero-section">
                <div className="hero-logo-badge">
                    {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" />
                    ) : (
                        <Building2 size={40} />
                    )}
                </div>
                <div className="hero-text">
                    <span className="hero-label">Institutional Profile</span>
                    <h1>{formData.name || 'Your Institution'}</h1>
                    <div className="hero-meta">
                        <span className="meta-item"><Globe size={14} /> {user.clientCode}</span>
                        <span className="meta-item"><ShieldCheck size={14} /> {user.role?.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            <div className="profile-content-wrapper">
                <div className="profile-sidebar">
                    <button 
                        className={`sidebar-tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        <Building2 size={18} />
                        General Details
                    </button>
                    <button 
                        className={`sidebar-tab ${activeTab === 'branding' ? 'active' : ''}`}
                        onClick={() => setActiveTab('branding')}
                    >
                        <Globe size={18} />
                        Branding & Logo
                    </button>
                    {isAdmin && (
                        <button 
                            className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={18} />
                            Security
                        </button>
                    )}
                </div>

                <div className="profile-main-card">
                    {activeTab === 'security' ? (
                        <form onSubmit={handlePasswordChange}>
                            <div className="tab-pane animate-fade-in">
                                <div className="pane-header">
                                    <h2>Security Settings</h2>
                                    <p>Update your account password to ensure security.</p>
                                </div>
                                
                                <div className="form-grid" style={{ maxWidth: '500px' }}>
                                    <div className="full-width">
                                        <div className="modern-field">
                                            <label>New Password</label>
                                            <div className="input-wrap">
                                                <Lock size={18} className="field-icon" />
                                                <input 
                                                    type="password" 
                                                    value={passwordData.newPassword} 
                                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    placeholder="Enter new password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="full-width">
                                        <div className="modern-field">
                                            <label>Confirm New Password</label>
                                            <div className="input-wrap">
                                                <Lock size={18} className="field-icon" />
                                                <input 
                                                    type="password" 
                                                    value={passwordData.confirmPassword} 
                                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    placeholder="Confirm new password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="profile-footer">
                                <div className="security-tag">
                                    <ShieldCheck size={16} />
                                    <span>Encrypted password update</span>
                                </div>
                                <button type="submit" className="modern-save-btn" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {activeTab === 'general' ? (
                                <div className="tab-pane animate-fade-in">
                                    <div className="pane-header">
                                        <h2>General Information</h2>
                                        <p>Update your institution's official contact and location details.</p>
                                    </div>
                                    
                                    <div className="form-grid">
                                        <div className="full-width">
                                            <div className="modern-field">
                                                <label>Full Institution Name</label>
                                                <div className="input-wrap">
                                                    <Building2 size={18} className="field-icon" />
                                                    <input 
                                                        type="text" 
                                                        name="name" 
                                                        value={formData.name} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter Official Name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modern-field">
                                            <label>Official Email</label>
                                            <div className="input-wrap">
                                                <Mail size={18} className="field-icon" />
                                                <input 
                                                    type="email" 
                                                    name="email" 
                                                    value={formData.email} 
                                                    onChange={handleInputChange}
                                                    placeholder="admin@institution.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="modern-field">
                                            <label>Contact Number</label>
                                            <div className="input-wrap">
                                                <Phone size={18} className="field-icon" />
                                                <input 
                                                    type="text" 
                                                    name="phone" 
                                                    value={formData.phone} 
                                                    onChange={handleInputChange}
                                                    placeholder="+91-XXXXXXXXXX"
                                                />
                                            </div>
                                        </div>

                                        <div className="full-width">
                                            <div className="modern-field">
                                                <label>Registered Address</label>
                                                <div className="input-wrap align-top">
                                                    <MapPin size={18} className="field-icon" />
                                                    <textarea 
                                                        name="address" 
                                                        value={formData.address} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter full address..."
                                                        rows="4"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="tab-pane animate-fade-in">
                                    <div className="pane-header">
                                        <h2>Brand Identity</h2>
                                        <p>Customize how your institution appears across reports and documents.</p>
                                    </div>

                                    <div className="logo-management-area">
                                        <div className="logo-display-card">
                                            {formData.logoUrl ? (
                                                <img src={formData.logoUrl} alt="Preview" className="large-logo-preview" />
                                            ) : (
                                                <div className="logo-placeholder-large">
                                                    <Upload size={48} />
                                                    <span>No Logo Uploaded</span>
                                                </div>
                                            )}
                                            <label htmlFor="logo-input" className="logo-action-overlay">
                                                <div className="blur-bg"></div>
                                                <span className="upload-btn-text"><Upload size={18} /> Upload New Logo</span>
                                            </label>
                                            <input id="logo-input" type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                                        </div>
                                        <div className="logo-specs">
                                            <h4>Branding Guidelines</h4>
                                            <ul>
                                                <li>Use high-resolution PNG or JPG</li>
                                                <li>Recommended size: 500x500px</li>
                                                <li>Max file size: 1MB</li>
                                                <li>Transparent backgrounds look best on reports</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="profile-footer">
                                <div className="security-tag">
                                    <ShieldCheck size={16} />
                                    <span>Secured institutional update</span>
                                </div>
                                <button type="submit" className="modern-save-btn" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    {loading ? 'Saving Changes...' : 'Update Profile'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

