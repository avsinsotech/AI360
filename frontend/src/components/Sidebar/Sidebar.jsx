import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import logo from '../../assets/logo.png'
import {
  ShieldCheck, Users, BarChart3,
  Bell, LayoutDashboard, Fingerprint, IndianRupee,
  MessageSquare, Smartphone, Clock, Gavel,
  RotateCcw, ShieldAlert, Activity, FileText,
  UserPlus, CreditCard, TrendingUp, Settings, UserCircle, Upload
} from 'lucide-react'

export default function Sidebar({ mobileOpen, onMobileClose, activeModule, onLogout }) {
  const navigate = useNavigate()
  const { conversations, createConversation, setSelectedReport, theme, toggleTheme, user } = useApp()

  const sections = [
    {
      title: 'CORE MODULES',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
        { id: 'verification', label: 'Verifications', icon: <ShieldCheck size={18} />, path: '/verification' },
        { id: 'loans', label: 'Loans', icon: <IndianRupee size={18} />, path: '/loans' },
        { id: 'doc_mgmt', label: 'Document Upload', icon: <Upload size={18} />, path: '/document-management' },
        { id: 'saarthi', label: 'Loan Scrutiny', icon: <Users size={18} />, path: '/loan-scrutiny' },
        { id: 'chat', label: 'New Chat', icon: <MessageSquare size={18} />, path: '/chat' },
        { id: 'ai_calling', label: 'Ai Calling', icon: <Smartphone size={18} />, path: '/ai-calling' },
        { id: 'membership', label: 'Membership', icon: <UserPlus size={18} />, path: '/membership' },
      ]
    },
    {
      title: 'CREDIT HUB',
      items: [
        { id: 'cibil_dash', label: 'CIBIL Dashboard', icon: <LayoutDashboard size={18} />, path: '/cibil/dashboard' },
        { id: 'cibil_alerts', label: 'CIBIL Alerts', icon: <Bell size={18} />, path: '/admin/cibil-alerts' },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'hr', label: 'HR & Admin', icon: <Users size={18} />, path: '/hr' },
        { id: 'legal', label: 'Business Target', icon: <BarChart3 size={18} />, path: '/business-target' },
        { id: 'rocketpay_mandates', label: 'AutoPay', icon: <Bell size={18} />, path: '/rocketpay/mandates' },  
        { id: 'user_mgmt', label: 'User Management', icon: <UserCircle size={18} />, path: '/admin/users' },
        { id: 'profile_mgmt', label: 'Profile Management', icon: <UserCircle size={18} />, path: '/profile' },
        { id: 'audit_logs', label: 'Audit Logs', icon: <Activity size={18} />, path: '/admin/audit' },
      ]
    },
    {
      title: 'REPORTS & ADMIN',
      items: [
        { id: 'loans_main', label: 'Reports', icon: <FileText size={18} />, path: '/report' },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} />, path: '/settings' },
        { id: 'credit_mgmt', label: user?.role === 'SUPER_ADMIN' ? 'Credit Mgmt' : 'Wallet & Usage', icon: <CreditCard size={18} />, path: '/admin/credit' },
        { id: 'rate_mgmt', label: 'Rate Mgmt', icon: <TrendingUp size={14} />, path: '/admin/rates', color: '#f59e0b' },
      ]
    }
  ]

  const handleModuleClick = (item) => {
    setSelectedReport(null)
    if (item.id === 'chat') {
      if (conversations.length === 0) createConversation()
    }
    navigate(item.path)
    onMobileClose?.()
  }

  const filteredSections = sections.map(section => {
    const filteredItems = section.items.filter(item => {
      // Role-based visibility rules
      if (user?.role === 'SUPER_ADMIN') return true

      // BANK_ADMIN restrictions
      if (user?.role === 'BANK_ADMIN') {
        const superAdminOnly = ['client_signup', 'rate_mgmt', 'hr']
        if (superAdminOnly.includes(item.id)) return false
      }

      // OPERATOR restrictions
      if (user?.role === 'OPERATOR') {
        const adminOnly = ['client_signup', 'rate_mgmt', 'user_mgmt', 'hr']
        if (adminOnly.includes(item.id)) return false
      }

      // AUDITOR restrictions
      if (user?.role === 'AUDITOR') {
        const verifyModules = ['verification', 'saarthi', 'loans', 'chat', 'rocketpay_mandates', 'user_mgmt', 'rate_mgmt']
        if (verifyModules.includes(item.id)) return false
      }

      // VIEWER restrictions
      if (user?.role === 'VIEWER') {
        const opModules = ['verification', 'saarthi', 'loans', 'chat', 'rocketpay_mandates', 'user_mgmt', 'audit_logs', 'rate_mgmt']
        if (opModules.includes(item.id)) return false
      }

      // CLIENT role restrictions (Legacy)
      if (user?.role === 'CLIENT') {
        const adminModules = ['client_signup', 'rate_mgmt', 'hr']
        if (adminModules.includes(item.id)) return false
      }

      return true
    })

    return { ...section, items: filteredItems }
  }).filter(section => section.items.length > 0)

  return (
    <aside className={`sidebar no-print ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logo} alt="AVS Logo" className="sidebar-logo-img" />
        </div>
      </div>
      <nav className="sidebar-nav">
        {filteredSections.map((section, idx) => (
          <div key={`section-${idx}`} className="nav-section">
            {section.title && <div className="section-title">{section.title}</div>}
            {section.group && <div className="section-group-label">{section.group}</div>}
            {section.items.map(item => (
              <button
                key={item.id}
                className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
                onClick={() => handleModuleClick(item)}
              >
                <div className="icon-container-clear">
                  {item.icon}
                </div>
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="version-info">v2.4.0 Build 2026</div>
      </div>
    </aside>
  )
}
