import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ClipboardList, FileCheck, Search, 
  FileSignature, Scale, Bot, Bell, Zap, 
  BarChart3, Plus, ArrowRight, ShieldCheck,
  RotateCcw, Gavel, Users, CheckSquare, Filter,
  TrendingUp, TrendingDown, LayoutDashboard, Download,
  Activity, PieChart as PieIcon, RotateCw,
  Home, Briefcase, Car, User, X, Coins
} from 'lucide-react';
import LoanSelectionModal from '../Shared/LoanSelectionModal';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import './Dashboard.css';

// Marathi to English mapping for decisions
const DECISION_MAP = {
  'मंजूर': 'Approved',
  'समिती मंजुरी आवश्यक': 'Review',
  'नाकारले': 'Rejected'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { reports, refreshReports, setSelectedReport } = useApp();

  // Real-time Data States
  const [membership, setMembership] = useState([]);
  const [aadhaarHistory, setAadhaarHistory] = useState([]);
  const [cibilHistory, setCibilHistory] = useState([]);
  const [mobileHistory, setMobileHistory] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [mandateDashboard, setMandateDashboard] = useState(null);
  const [kycStats, setKycStats] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncMessage, setSyncMessage] = useState('Just now');

  const fetchData = async () => {
    setIsLoadingData(true);
    const headers = { 
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` 
    };

    try {
      const [memberRes, aadhaarRes, cibilRes, mobileRes, mandateRes, kycRes, appsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/membership`, { headers }),
        fetch(`${API_BASE_URL}/AadharProxy/history`, { headers }),
        fetch(`${API_BASE_URL}/CibilProxy/history`, { headers }),
        fetch(`${API_BASE_URL}/auth/verified-numbers`, { headers }),
        fetch(`${API_BASE_URL}/mandates/dashboard`, { headers }),
        fetch(`${API_BASE_URL}/Analytics/kyc-stats`, { headers }),
        fetch(`${API_BASE_URL}/Analytics/recent-applications`, { headers })
      ]);

      refreshReports();

      if (memberRes.ok) {
        const data = await memberRes.json();
        setMembership(Array.isArray(data) ? data : (data.items || []));
      }
      if (aadhaarRes.ok) {
        const data = await aadhaarRes.json();
        setAadhaarHistory(Array.isArray(data) ? data : (data.items || []));
      }
      if (cibilRes.ok) {
        const data = await cibilRes.json();
        setCibilHistory(Array.isArray(data) ? data : (data.items || []));
      }
      if (mobileRes.ok) {
        const data = await mobileRes.json();
        setMobileHistory(Array.isArray(data) ? data : (data.items || []));
      }
      if (mandateRes.ok) setMandateDashboard(await mandateRes.json());
      if (kycRes.ok) setKycStats(await kycRes.json());
      if (appsRes.ok) setRecentApplications(await appsRes.json());
      setLastSync(new Date());
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date() - lastSync) / 60000);
      if (diff === 0) setSyncMessage('Just now');
      else setSyncMessage(`${diff} min ago`);
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSync]);

  // Real-time Metrics
  const metrics = useMemo(() => {
    const todayISO = new Date().toISOString().split('T')[0];
    const todayLocale = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Count today's activity from histories
    const checkToday = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    };

    const aadhaarToday = aadhaarHistory.filter(h => checkToday(h.verifiedAt)).length;
    const mobileToday = mobileHistory.filter(h => checkToday(h.createdAt)).length;
    const cibilToday = cibilHistory.filter(h => checkToday(h.createdAt)).length;
    const appsToday = recentApplications.filter(a => checkToday(a.createdAt)).length;

    // Unify Members (Unique Names or Max count to represent engagement)
    const membershipNames = new Set(membership.map(m => (m.full_name || m.fullName || "").toLowerCase().trim()));
    recentApplications.forEach(a => {
      const name = (a.applicantName || "").toLowerCase().trim();
      if (name && name !== 'n/a' && name !== 'n / a') membershipNames.add(name);
    });
    
    // Unify Active Loans (Requested by user to be equal to Total Applications)
    const submittedAppsCount = recentApplications.filter(a => {
      const st = (a.status || '').toLowerCase().trim();
      return st !== 'draft' && st !== '';
    }).length;
    const activeMandatesCount = mandateDashboard?.totalActiveMandates || 0;
    
    return [
      { label: 'Total Members', value: (membershipNames.size || Math.max(membership.length, recentApplications.length)).toLocaleString(), sub: `${recentApplications.length} Applications`, color: '#3b82f6' },
      { label: 'Active Loans', value: (submittedAppsCount + activeMandatesCount).toLocaleString(), sub: `All Live Applications`, color: '#0ea5e9' },
      { label: 'Verifications Today', value: (aadhaarToday + mobileToday + cibilToday + appsToday).toString(), sub: 'System-wide activity', color: '#10b981' },
      { label: 'Risk Accounts', value: recentApplications.filter(a => (a.status || '').toLowerCase() === 'rejected').length.toLocaleString(), sub: 'Applications Flagged', color: '#ef4444' },
    ];
  }, [membership, mandateDashboard, aadhaarHistory, mobileHistory, cibilHistory, recentApplications, reports]);

  // Real-time Activity Feed (Latest 5 reports — Scrutiny is the primary activity)
  const activityFeed = useMemo(() => {
    return recentApplications.slice(0, 5).map(app => ({
      text: `${app.loanType} Application — ${app.applicantName} (${app.applicationNo})`,
      time: `${new Date(app.createdAt).toLocaleDateString()} · Application Status: ${app.status}`,
      color: app.status === 'Approved' ? '#10b981' : app.status === 'Draft' ? '#f59e0b' : '#3b82f6'
    }));
  }, [recentApplications]);

  // Real-time Verification Summary
  const verifSummary = useMemo(() => {
    const failedKYC = kycStats?.pieData?.find(d => d.name === "Failed")?.value || 0;
    return {
      aadhaar: aadhaarHistory.length,
      pan: cibilHistory.length,
      cibil: cibilHistory.length,
      failed: failedKYC
    };
  }, [aadhaarHistory, cibilHistory, kycStats]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter and Paginate reports
  const filteredApps = useMemo(() => {
    if (!recentApplications) return [];
    
    const validApps = recentApplications.filter(app => {
      const appNo = (app.applicationNo || '').trim().toLowerCase();
      const status = (app.status || '').trim().toLowerCase();
      return appNo && appNo !== 'n/a' && status === 'submitted';
    });

    if (!searchTerm) return validApps;
    
    const lower = searchTerm.trim().toLowerCase();
    return validApps.filter(app => 
      (app.applicationNo || '').toLowerCase().includes(lower) ||
      (app.applicantName || '').toLowerCase().includes(lower) ||
      (app.loanType || '').toLowerCase().includes(lower)
    );
  }, [recentApplications, searchTerm]);

  const totalPages = Math.ceil(filteredApps.length / pageSize);
  
  const displayApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApps.slice(start, start + pageSize).map(app => ({
      id: app.applicationNo,
      member: app.applicantName,
      type: app.loanType,
      amount: `₹ ${parseFloat(app.amount || 0).toLocaleString('en-IN')}`,
      status: app.status?.toLowerCase() === 'approved' ? 'approved' : 
              app.status?.toLowerCase() === 'draft' ? 'rejected' : 'sending',
      label: app.status || 'Draft',
      fullData: app
    }));
  }, [filteredApps, currentPage]);

  const businessTargets = useMemo(() => {
    const totalDisbursed = mandateDashboard?.collectedThisMonth || 0;
    const disbursementTarget = 6000000; // 60L
    const memberTarget = 100;
    const combinedMemberCount = Math.max(membership.length, reports.length);
    
    return [
      { 
        label: 'Loan Collection', 
        value: `₹ ${(totalDisbursed / 100000).toFixed(1)}L / ₹ ${(disbursementTarget / 100000).toFixed(0)}L`, 
        progress: Math.min(Math.round((totalDisbursed / disbursementTarget) * 100), 100), 
        color: '#4f46e5' 
      },
      { 
        label: 'New Members', 
        value: `${combinedMemberCount} / ${memberTarget}`, 
        progress: Math.min(Math.round((combinedMemberCount / memberTarget) * 100), 100), 
        color: '#059669' 
      },
      { label: 'NPA Recovery', value: '₹ 8.2L / ₹ 20L', progress: 41, color: '#dc2626' },
      { label: 'Gold Loans', value: '34 / 40', progress: 85, color: '#d97706' },
    ];
  }, [membership, mandateDashboard]);

  // Header Actions
  const handleExportExcel = () => {
    if (recentApplications.length === 0) return;
    
    const headers = ['App ID', 'Applicant Name', 'Loan Type', 'Amount', 'Status', 'Date'];
    const rows = recentApplications.map(app => [
      app.applicationNo || 'N/A',
      app.applicantName || 'N/A',
      app.loanType || 'N/A',
      app.amount || 0,
      app.status || 'Pending',
      new Date(app.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Loan_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPdf = async () => {
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      if (recentApplications.length === 0) return;
      
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
          <h1 style="color: #0a1c5a; margin-bottom: 5px;">AVS AI360 — Loan Applicants Directory</h1>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 20px;">Generated on: ${new Date().toLocaleString()}</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 10px; border: 1px solid #e2e8f0;">App ID</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Applicant Name</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Loan Type</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Amount</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Status</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Date</th>
              </tr>
            </thead>
            <tbody>
              ${recentApplications.map(app => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${app.applicationNo || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 600;">${app.applicantName || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${app.loanType || 'N/A'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; font-weight: 700;">₹ ${(parseFloat(app.amount || 0)).toLocaleString()}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${app.status || 'Pending'}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${new Date(app.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 10px; color: #94a3b8; text-align: center;">
            CONFIDENTIAL — AVS InfoTech Pvt. Ltd.
          </div>
        </div>
      `;

      const opt = {
        margin: 0.5,
        filename: `Loan_Applications_Directory_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
      };
      
      html2pdf().from(element).set(opt).save();
    } catch (err) {
      console.error("PDF Export Error:", err);
      window.print();
    }
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1 className="header-title">Dashboard — Overview</h1>
          <div className="sync-status">
            <span className="sync-text">Last sync: {syncMessage}</span>
            <span className="sync-dot pulsing"></span>
          </div>
        </div>
        <div className="header-actions">
          <button className="action-btn" onClick={handleExportExcel}><Download size={16} /> Export</button>
          <button className="action-btn" onClick={handlePrintPdf}><FileText size={16} /> Print</button>
          <button className="action-btn action-btn-dark" onClick={fetchData} disabled={isLoadingData}>
            <RotateCw size={16} className={isLoadingData ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      <div className="metrics-grid">
        {isLoadingData ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton-card"></div>
          ))
        ) : (
          metrics.map((m, i) => (
            <div key={i} className="premium-card metric-card" style={{ borderTopColor: m.color }}>
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
              <span className="metric-sub" style={{ color: m.color }}>{m.sub}</span>
            </div>
          ))
        )}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-column">
          <section className="premium-card section-card">
            <div className="section-header">
              <h2 className="section-title">Recent Loan Applications</h2>
              <div className="search-bar">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search members or IDs..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Appl. No</th>
                    <th>Member</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingData ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan="5"><div className="skeleton skeleton-table-row"></div></td>
                      </tr>
                    ))
                  ) : displayApplications.length > 0 ? (
                    displayApplications.map((app, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{app.id}</td>
                        <td>{app.member}</td>
                        <td>{app.type}</td>
                        <td style={{ fontWeight: 700 }}>{app.amount}</td>
                        <td>
                          <span className={`status-pill status-${app.status}`}>{app.label}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        {searchTerm ? 'No matches found.' : 'No data found in dashboard.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="page-btn"
                >
                  Previous
                </button>
                <div className="page-numbers">
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    
                    if (totalPages <= maxVisible + 2) {
                      // Show all pages if total is small enough
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      // Always show first page
                      pages.push(1);
                      
                      let start = Math.max(2, currentPage - 1);
                      let end = Math.min(totalPages - 1, currentPage + 1);
                      
                      // Adjust window to always show 3 middle pages
                      if (currentPage <= 3) { start = 2; end = Math.min(maxVisible, totalPages - 1); }
                      if (currentPage >= totalPages - 2) { end = totalPages - 1; start = Math.max(2, totalPages - maxVisible + 1); }
                      
                      if (start > 2) pages.push('...');
                      for (let i = start; i <= end; i++) pages.push(i);
                      if (end < totalPages - 1) pages.push('...');
                      
                      // Always show last page
                      pages.push(totalPages);
                    }
                    
                    return pages.map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className="page-dots">...</span>
                      ) : (
                        <button
                          key={p}
                          className={`page-num ${currentPage === p ? 'active' : ''}`}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </section>

          <section className="premium-card section-card">
            <div className="section-header">
              <h2 className="section-title">Business Targets — Current Month</h2>
              <span className="status-pill status-sending" style={{ fontSize: '0.65rem' }}>In Progress</span>
            </div>
            <div className="target-list">
              {isLoadingData ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="target-item">
                    <div className="skeleton skeleton-text" style={{ height: '30px', marginBottom: '8px' }}></div>
                  </div>
                ))
              ) : (
                businessTargets.map((t, i) => (
                  <div key={i} className="target-item">
                    <div className="target-info">
                      <span>{t.label}</span>
                      <span>{t.value}</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${t.progress}%`, backgroundColor: t.color }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="dashboard-column">
          <section className="premium-card section-card">
            <div className="section-header">
              <h2 className="section-title">Activity Feed</h2>
            </div>
            <div className="activity-list">
              {isLoadingData ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="activity-item">
                    <div className="skeleton skeleton-avatar" style={{ width: '12px', height: '12px' }}></div>
                    <div className="activity-content" style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text"></div>
                    </div>
                  </div>
                ))
              ) : (
                activityFeed.map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" style={{ backgroundColor: a.color }} />
                    <div className="activity-content">
                      <span className="activity-text">{a.text}</span>
                      <span className="activity-time">{a.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="premium-card section-card">
            <div className="section-header">
              <h2 className="section-title">Verification Summary</h2>
            </div>
            <div className="verif-summary-grid">
              {isLoadingData ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton skeleton-card" style={{ height: '80px' }}></div>
                ))
              ) : (
                <>
                  <div className="verif-box" style={{ background: '#f0fdf4' }}>
                    <span className="verif-label" style={{ color: '#15803d' }}>Aadhaar</span>
                    <span className="verif-value" style={{ color: '#166534' }}>{verifSummary.aadhaar.toLocaleString()}</span>
                    <span className="verif-sub" style={{ color: '#166534' }}>Verified</span>
                  </div>
                  <div className="verif-box" style={{ background: '#eff6ff' }}>
                    <span className="verif-label" style={{ color: '#1d4ed8' }}>PAN</span>
                    <span className="verif-value" style={{ color: '#1e40af' }}>{verifSummary.pan.toLocaleString()}</span>
                    <span className="verif-sub" style={{ color: '#1e40af' }}>Verified</span>
                  </div>
                  <div className="verif-box" style={{ background: '#fef2f2' }}>
                    <span className="verif-label" style={{ color: '#991b1b' }}>CIBIL</span>
                    <span className="verif-value" style={{ color: '#991b1b' }}>{verifSummary.cibil.toLocaleString()}</span>
                    <span className="verif-sub" style={{ color: '#991b1b' }}>Checked</span>
                  </div>
                  <div className="verif-box" style={{ background: '#fff1f2' }}>
                    <span className="verif-label" style={{ color: '#e11d48' }}>Failed</span>
                    <span className="verif-value" style={{ color: '#e11d48' }}>{verifSummary.failed.toLocaleString()}</span>
                    <span className="verif-sub" style={{ color: '#e11d48' }}>Review needed</span>
                  </div>
                </>
              )}
            </div>
            <div className="verif-footer">
              GST: 145 verified | Udyam: 88 verified | Voter: 342 verified
            </div>
          </section>
        </div>
      </div>
      <LoanSelectionModal isOpen={showLoanModal} onClose={() => setShowLoanModal(false)} />

    </div>
  );
}
