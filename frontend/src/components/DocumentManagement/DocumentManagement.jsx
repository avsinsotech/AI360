import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Upload, CheckCircle2, Search, Eye, Trash2, X, Loader2,
  FileCheck, ShieldCheck, ChevronRight, File, Image as ImageIcon, FileSpreadsheet,
  AlertCircle, ArrowLeft, DownloadCloud, FileBadge, RotateCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DateRangePicker from '../Shared/DateRangePicker';
import API_BASE_URL from '../../config';
import './DocumentManagement.css';

/* ─────────────────────────────────────────────
   HELPERS & CONFIG
───────────────────────────────────────────── */
const FILE_ICONS = {
  'application/pdf': FileText,
  'image/jpeg': ImageIcon,
  'image/png': ImageIcon,
  'image/jpg': ImageIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': FileSpreadsheet,
};

function buildChecklist(masterList = [], documents = []) {
  const seenMasterIds = new Set();
  const dedupedMasters = masterList.filter(m => {
    if (seenMasterIds.has(m.id)) return false;
    seenMasterIds.add(m.id);
    return true;
  });

  const docByMaster = {};
  documents.forEach(doc => {
    const id = doc.documentMasterId;
    if (!docByMaster[id]) {
      docByMaster[id] = doc;
    } else {
      const prev = new Date(docByMaster[id].uploadedAt || 0);
      const curr = new Date(doc.uploadedAt || 0);
      if (curr > prev) docByMaster[id] = doc;
    }
  });

  return dedupedMasters.map(master => ({
    master,
    doc: docByMaster[master.id] || null,
  }));
}

function safeDate(val) {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getProgressBarClass(pct) {
  if (pct >= 100) return 'success';
  if (pct >= 70) return 'info';
  if (pct >= 35) return 'warning';
  return 'danger';
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function DocumentManagement() {
  const { applicationId: urlAppId } = useParams();
  const navigate = useNavigate();
  const { showToast, user } = useApp();

  const [searchId, setSearchId] = useState(urlAppId || '');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [appData, setAppData] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [recentApps, setRecentApps] = useState([]);

  // Caching master list to avoid redundant processing
  const masterCache = useRef({});

  // Dashboard Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterLoanType, setFilterLoanType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docFilterCategory, setDocFilterCategory] = useState('All');
  const [docFilterStatus, setDocFilterStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Detail View State
  const [activeTab, setActiveTab] = useState('documents'); // 'details', 'documents', 'verification'

  // Modals
  const [uploadModal, setUploadModal] = useState({ open: false, masterId: null, masterName: '' });
  const [previewModal, setPreviewModal] = useState({ open: false, docId: null, fileName: '', fileType: '', blobUrl: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, docId: null, remarks: '' });

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'BANK_ADMIN';

  /* ── Fetch Dashboard Data ── */
  const fetchRecentApps = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/recent-applications`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) setRecentApps(await res.json());
    } catch (_) {
      showToast('Error loading tracking dashboard', 'error');
    } finally {
      setDashboardLoading(false);
    }
  }, [showToast]);

  /* ── Fetch Detail Data ── */
  const fetchData = useCallback(async (id, isRefresh = false) => {
    if (!id) return;
    if (!isRefresh) setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/application/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAppData(data.application);

        // Cache masterList if not present
        if (!masterCache.current[data.application.loanType]) {
          masterCache.current[data.application.loanType] = data.masterList;
        }

        setChecklist(buildChecklist(masterCache.current[data.application.loanType], data.documents));
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Application not found', 'error');
        setAppData(null);
        setChecklist([]);
      }
    } catch (_) {
      showToast('Error fetching application details', 'error');
    } finally {
      setDetailLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (urlAppId) {
      setSearchId(urlAppId);
      fetchData(urlAppId);
    } else {
      setAppData(null);
      setChecklist([]);
      setSearchId(''); // Clear the search field when on dashboard
      fetchRecentApps();
    }
  }, [urlAppId, fetchData, fetchRecentApps]);

  const handleSearchNavigate = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/document-management/${searchId.trim()}`);
  };

  /* ── Actions ── */
  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) { 
        showToast('Document deleted successfully', 'success'); 
        setChecklist(prev => prev.map(i => i.doc?.id === docId ? { ...i, doc: null } : i));
        setAppData(prev => ({ 
          ...prev, 
          uploadedDocuments: Math.max(0, (prev.uploadedDocuments || 0) - 1),
          documentCompletionPercentage: prev.totalDocuments > 0 ? (Math.max(0, (prev.uploadedDocuments || 0) - 1) / prev.totalDocuments) * 100 : 0
        }));
        setActionLoading(false);
        fetchData(appData?.applicationNo || urlAppId, true);
      }
    } catch (_) { showToast('Failed to delete document', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleVerify = async (docId) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/verify/${docId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) { 
        showToast('Document verified successfully', 'success'); 
        setChecklist(prev => prev.map(i => i.doc?.id === docId ? { ...i, doc: { ...i.doc, status: 'Verified' } } : i));
        setAppData(prev => ({ ...prev, verifiedDocuments: (prev.verifiedDocuments || 0) + 1 }));
        setActionLoading(false);
        fetchData(appData?.applicationNo || urlAppId, true);
      }
    } catch (_) { showToast('Failed to verify document', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectModal.remarks.trim()) {
      showToast('Please provide a rejection reason', 'warning');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/reject/${rejectModal.docId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rejectModal.remarks),
      });
      if (res.ok) {
        showToast('Document rejected', 'success');
        setChecklist(prev => prev.map(i => i.doc?.id === rejectModal.docId ? { ...i, doc: { ...i.doc, status: 'Rejected', remarks: rejectModal.remarks } } : i));
        setRejectModal({ open: false, docId: null, remarks: '' });
        setActionLoading(false);
        fetchData(appData?.applicationNo || urlAppId, true);
      }
    } catch (_) { showToast('Failed to reject document', 'error'); }
    finally { setActionLoading(false); }
  };

  const handlePreview = async (doc) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/view/${doc.id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewModal({
          open: true,
          docId: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          blobUrl: url
        });
      } else {
        showToast('Could not retrieve file content', 'error');
      }
    } catch (_) {
      showToast('Error loading preview', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!window.confirm('This will recalculate progress for ALL applications in the system based on current master rules. Continue?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/sync-all-stats`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) {
        showToast('All app statistics synchronized successfully', 'success');
        fetchRecentApps();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || 'Sync failed', 'error');
      }
    } catch (_) {
      showToast('Error connecting to sync service', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const closePreview = () => {
    if (previewModal.blobUrl) URL.revokeObjectURL(previewModal.blobUrl);
    setPreviewModal({ open: false, docId: null, fileName: '', fileType: '', blobUrl: '' });
  };

  /* ─────────────────────────────────────────────
     RENDER DASHBOARD VIEW
  ───────────────────────────────────────────── */
  if (!urlAppId && !appData) {
    // Filter Dashboard Data
    const enrichedApps = recentApps.map(app => ({
      ...app,
      computedDocStatus: app.documentCompletionPercentage === 100 ? 'COMPLETED' : (app.documentCompletionPercentage > 0 ? 'IN_PROGRESS' : 'PENDING')
    }));

    const filteredApps = enrichedApps.filter(app => {
      const matchesSearch = !searchTerm || (app.applicationNo?.toLowerCase().includes(searchTerm.toLowerCase()) || app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesLoan = filterLoanType === 'All' || app.loanType === filterLoanType;
      const matchesStatus = filterStatus === 'All' || app.computedDocStatus === filterStatus;
      const matchesDate = (() => {
        if (!filterStartDate && !filterEndDate) return true;
        const submitDate = new Date(app.createdAt).setHours(0, 0, 0, 0);
        const start = filterStartDate ? new Date(filterStartDate).setHours(0, 0, 0, 0) : 0;
        const end = filterEndDate ? new Date(filterEndDate).setHours(23, 59, 59, 999) : Infinity;
        return submitDate >= start && submitDate <= end;
      })();
      return matchesSearch && matchesLoan && matchesStatus && matchesDate;
    });

    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const stats = {
      total: enrichedApps.length,
      pending: enrichedApps.filter(a => a.computedDocStatus === 'PENDING').length,
      verified: enrichedApps.filter(a => a.computedDocStatus === 'COMPLETED').length,
      rejected: enrichedApps.filter(a => a.computedDocStatus === 'IN_PROGRESS').length
    };

    return (
      <div className="dm-container">
        <div className="dm-header">
          <div className="dm-header-title">
            <div className="dm-icon-box"><ShieldCheck size={24} /></div>
            <div>
              <h1 className="dm-title">Document Management Hub</h1>
              <p className="dm-subtitle">Enterprise asset verification and document scoring</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              className="dm-action-btn"
              onClick={() => window.location.reload()}
              style={{ background: 'var(--dm-navy)', borderColor: 'var(--dm-navy)' }}
            >
              <RotateCw size={16} /> Refresh Dashboard
            </button>
            <form className="dm-search-input-group" style={{ maxWidth: '300px', position: 'relative' }} onSubmit={handleSearchNavigate}>
              <Search size={16} className="dm-search-icon" />
              <input
                type="text"
                className="dm-search-input"
                placeholder="Search by App. No..."
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                style={{ paddingRight: searchId ? '2.5rem' : '1rem' }}
              />
              {searchId && (
                <button
                  type="button"
                  onClick={() => setSearchId('')}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--dm-text-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </form>
          </div>
        </div>

        <div className="dm-summary-cards">
          <div className="dm-stat-card total">
            <div className="dm-stat-icon-wrapper"><FileCheck size={20} /></div>
            <div className="dm-stat-info">
              <span className="dm-stat-label">Total Files</span>
              <span className="dm-stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="dm-stat-card pending">
            <div className="dm-stat-icon-wrapper"><Loader2 size={20} /></div>
            <div className="dm-stat-info">
              <span className="dm-stat-label">Pending</span>
              <span className="dm-stat-value">{stats.pending}</span>
            </div>
          </div>
          <div className="dm-stat-card verified">
            <div className="dm-stat-icon-wrapper"><CheckCircle2 size={20} /></div>
            <div className="dm-stat-info">
              <span className="dm-stat-label">Cleared</span>
              <span className="dm-stat-value">{stats.verified}</span>
            </div>
          </div>
          <div className="dm-stat-card rejected">
            <div className="dm-stat-icon-wrapper"><AlertCircle size={20} /></div>
            <div className="dm-stat-info">
              <span className="dm-stat-label">Action Need</span>
              <span className="dm-stat-value">{stats.rejected}</span>
            </div>
          </div>
        </div>

        <div className="dm-filter-bar">
          <div className="dm-search-input-group">
            <Search size={16} className="dm-search-icon" />
            <input
              type="text"
              className="dm-search-input"
              placeholder="Search by Applicant or App No..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <DateRangePicker 
            startDate={filterStartDate}
            endDate={filterEndDate}
            onStartChange={val => { setFilterStartDate(val); setCurrentPage(1); }}
            onEndChange={val => { setFilterEndDate(val); setCurrentPage(1); }}
          />
          <select className="dm-filter-select" value={filterLoanType} onChange={e => { setFilterLoanType(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Loan Types</option>
            <option value="HomeLoan">Home Loan</option>
            <option value="PersonalLoan">Personal Loan</option>
            <option value="VehicleLoan">Vehicle Loan</option>
            <option value="BusinessLoan">Business Loan</option>
          </select>
          <select className="dm-filter-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Status</option>
            <option value="PENDING">Pending Docs</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Fully Verified</option>
          </select>
        </div>

        <div className="dm-table-card">
          <div className="dm-table-wrapper">
            <table className="dm-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Application No.</th>
                  <th>Loan Module</th>
                  <th>Submission Date</th>
                  <th>Document Status</th>
                  <th>Compliance Progress</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboardLoading && filteredApps.length === 0 ? (
                  Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7">
                        <div className="skeleton skeleton-table-row" style={{ height: '52px', margin: '4px 0' }}></div>
                      </td>
                    </tr>
                  ))
                ) : paginatedApps.length > 0 ? (
                  paginatedApps.map(app => (
                    <tr key={`${app.loanType}-${app.id}`}>
                      <td>
                        <span className="dm-app-name">{app.applicantName || 'Anonymous Applicant'}</span>
                      </td>
                      <td>
                        <span className="dm-app-no">{app.applicationNo || '—'}</span>
                      </td>
                      <td>
                        <span className={`dm-badge ${app.loanType.replace('Loan', '').toLowerCase()}`}>
                          {app.loanType.replace('Loan', '')} Loan
                        </span>
                      </td>
                      <td>{safeDate(app.createdAt)}</td>
                      <td>
                        <span className={`dm-badge ${app.computedDocStatus || 'PENDING'}`}>
                          {app.computedDocStatus === 'COMPLETED' ? 'Verified' : app.computedDocStatus === 'IN_PROGRESS' ? 'Under Audit' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="dm-progress-wrapper">
                          <div className="dm-progress-track">
                            <div
                              className={`dm-progress-fill ${getProgressBarClass(app.documentCompletionPercentage)}`}
                              style={{ width: `${app.documentCompletionPercentage || 0}%` }}
                            />
                          </div>
                          <div className="dm-progress-text">
                            <span>{Math.round(app.documentCompletionPercentage || 0)}%</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--dm-text-muted)' }}>{app.uploadedDocuments}{app.totalDocuments}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="dm-action-btn" style={{ marginLeft: 'auto' }} onClick={() => navigate(`/document-management/${app.applicationNo}`)}>
                          Process Hub <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="dm-empty-state">
                        <Search size={32} />
                        <h3>No applications match your filters</h3>
                        <p>Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="dm-pagination">
              <span className="dm-pagination-info">Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length}</span>
              <div className="dm-pagination-controls">
                <button className="dm-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} className={`dm-page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                ))}
                <button className="dm-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER DETAIL VIEW
  ───────────────────────────────────────────── */

  // Group checklist by categories
  const categoriesMap = {};
  checklist.forEach(item => {
    const cat = item.master.category || 'General Documents';
    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push(item);
  });

  return (
    <div className="dm-container">
      {detailLoading && !appData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '140px' }} />
          <div className="skeleton" style={{ height: '500px', width: '100%', borderRadius: 'var(--radius-lg)' }} />
        </div>
      ) : appData && (
        <>
          {/* Top Profile Card */}
          <div className="dm-profile-card">
            <div className="dm-profile-main">
              <div className="dm-avatar">{appData.applicantName?.[0] ?? '?'}</div>
              <div className="dm-profile-info">
                <h2>{appData.applicantName || 'Anonymous'}</h2>
                <div className="dm-profile-sub">
                  <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--dm-navy)' }}>{appData.applicationNo}</span>
                  <span>•</span>
                  <span className={`dm-badge ${appData.loanType.replace('Loan', '').toLowerCase()}`}>{appData.loanType}</span>
                  <span>•</span>
                  <span>Submitted {safeDate(appData.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="dm-profile-stats">
              <div className="dm-stat-mini-card" style={{ minWidth: '180px', borderLeft: '4px solid var(--dm-info)' }}>
                <div className="dm-stat-mini-label">Compliance Audit</div>
                <div className="dm-progress-wrapper" style={{ marginTop: '0.35rem' }}>
                  <div className="dm-progress-track" style={{ height: '8px', background: '#f1f5f9' }}>
                    <div className={`dm-progress-fill ${getProgressBarClass(appData.documentCompletionPercentage)}`} style={{ width: `${appData.documentCompletionPercentage || 0}%` }} />
                  </div>
                  <div className="dm-progress-text" style={{ marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 800 }}>{Math.round(appData.documentCompletionPercentage || 0)}%</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Score</span>
                  </div>
                </div>
              </div>

              <div className="dm-stat-mini-card navy">
                <div className="dm-stat-mini-label">Total Req.</div>
                <div className="dm-stat-mini-value">{appData.totalDocuments || 0}</div>
              </div>

              <div className="dm-stat-mini-card info">
                <div className="dm-stat-mini-label">Uploaded</div>
                <div className="dm-stat-mini-value" style={{ color: 'var(--dm-info)' }}>{appData.uploadedDocuments || 0}</div>
              </div>

              <div className="dm-stat-mini-card success">
                <div className="dm-stat-mini-label">Verified</div>
                <div className="dm-stat-mini-value" style={{ color: 'var(--dm-success)' }}>{appData.verifiedDocuments || 0}</div>
              </div>

              <div className="dm-stat-mini-card error">
                <div className="dm-stat-mini-label">Rejected</div>
                <div className="dm-stat-mini-value" style={{ color: 'var(--dm-error)' }}>{checklist.filter((item) => item.doc?.status === 'Rejected').length}</div>
              </div>
            </div>
          </div>



          <div className="dm-tabs-container">
            <div className="dm-tabs-header">

              <button className={`dm-tab-btn ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
                <Upload size={18} /> Document Upload
              </button>
              {isAdmin && (
                <button className={`dm-tab-btn ${activeTab === 'verification' ? 'active' : ''}`} onClick={() => setActiveTab('verification')}>
                  <ShieldCheck size={18} /> Audit & Verification
                </button>
              )}
            </div>

            <div className="dm-tab-content">


              {activeTab === 'documents' && (() => {
                const availableCategories = ['All', ...new Set(checklist.map(i => i.master.category || 'General').filter(Boolean))];
                return (
                  <div className="dm-doc-list-view">
                    <div className="dm-filter-bar" style={{ marginBottom: '1rem', flexWrap: 'wrap', padding: '0.25rem 0', border: 'none', boxShadow: 'none', background: 'transparent' }}>
                      <div className="dm-search-input-group" style={{ minWidth: '250px', flex: 1 }}>
                        <Search size={16} className="dm-search-icon" />
                        <input
                          type="text"
                          className="dm-search-input"
                          placeholder="Search document by name..."
                          value={docSearchTerm}
                          onChange={e => setDocSearchTerm(e.target.value)}
                        />
                      </div>
                      <select className="dm-filter-select" value={docFilterCategory} onChange={e => setDocFilterCategory(e.target.value)}>
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
                      </select>
                      <select className="dm-filter-select" value={docFilterStatus} onChange={e => setDocFilterStatus(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Pending">Pending (Awaiting File)</option>
                        <option value="Uploaded">Uploaded</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>

                    <div className="dm-table-card">
                      <div className="dm-table-wrapper" style={{ overflowX: 'auto' }}>
                        <table className="dm-table dm-doc-table">
                          <thead>
                            <tr>
                              <th>Document Requirements</th>
                              <th>Status & Category</th>
                              <th>Uploaded File</th>
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {checklist
                              .filter(item => {
                                const searchLower = docSearchTerm.toLowerCase();
                                const searchMatch = !docSearchTerm || item.master.documentName?.toLowerCase().includes(searchLower);
                                const catMatch = docFilterCategory === 'All' || (item.master.category || 'General') === docFilterCategory;
                                const status = item.doc ? item.doc.status : 'Pending';
                                // Some docs might have 'Awaiting File' but logically it's 'Pending'
                                const compStatus = status === 'Awaiting File' ? 'Pending' : status;
                                const statusMatch = docFilterStatus === 'All' || compStatus === docFilterStatus;
                                return searchMatch && catMatch && statusMatch;
                              })
                              .map(({ master, doc }) => (
                                <tr key={master.id} className={`${master.isMandatory ? 'mandatory-row' : ''}`}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <span className="dm-app-name" style={{ fontSize: '0.9rem', margin: 0 }}>{master.documentName}</span>
                                      {master.isMandatory && <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: 1 }}>*</span>}
                                    </div>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: '0.5rem', alignItems: 'center' }}>
                                      <span className={`dm-badge ${doc?.status || 'Pending'}`}>
                                        {doc ? doc.status : 'Awaiting File'}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--dm-text-muted)', background: 'var(--dm-bg)', padding: '2px 6px', borderRadius: '4px' }}>{master.category || 'General'}</span>
                                    </div>
                                  </td>
                                  <td>
                                    {doc ? (
                                      <div className="dm-uploaded-file" style={{ border: 'none', padding: 0, background: 'transparent', flexDirection: 'row', alignItems: 'center' }}>
                                        <div className="dm-file-icon" style={{ width: 28, height: 28, background: 'var(--dm-bg)', border: '1px solid var(--dm-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                                          {doc.fileType?.includes('pdf') ? <FileText size={14} /> : <ImageIcon size={14} />}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <span className="dm-file-name" style={{ maxWidth: '200px', margin: 0, fontSize: '0.85rem' }} title={doc.fileName}>{doc.fileName}</span>
                                          <span className="dm-file-date" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--dm-text-muted)' }}>• {safeDate(doc.uploadedAt)}</span>
                                        </div>
                                      </div>
                                    ) : (
                                      <span style={{ color: 'var(--dm-text-light)', fontSize: '0.875rem' }}>Asset Not Provided</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    {doc ? (
                                      <div className="dm-doc-card-actions" style={{ borderTop: 'none', padding: 0, gap: '0.5rem', justifyContent: 'flex-end', marginTop: 0 }}>
                                        <button className="dm-icon-action-btn view" title="Preview File" onClick={() => handlePreview(doc)}>
                                          <Eye size={16} />
                                        </button>
                                        <button className="dm-icon-action-btn upload" title="Re-upload File" onClick={() => setUploadModal({ open: true, masterId: master.id, masterName: master.documentName })}>
                                          <RotateCw size={16} />
                                        </button>
                                        <button className="dm-icon-action-btn delete" title="Remove File" onClick={() => handleDelete(doc.id)}>
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        className="dm-btn-primary"
                                        style={{
                                          marginLeft: 'auto',
                                          padding: '0.4rem 0.75rem',
                                          fontSize: '0.75rem',
                                          background: 'var(--dm-success)',
                                          borderColor: 'var(--dm-success)',
                                          color: 'white',
                                          fontWeight: '600',
                                          boxShadow: '0 2px 4px -1px rgba(22, 163, 74, 0.15)'
                                        }}
                                        onClick={() => setUploadModal({ open: true, masterId: master.id, masterName: master.documentName })}
                                      >
                                        <Upload size={14} /> Upload Now
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            {checklist.filter(item => {
                              const searchLower = docSearchTerm.toLowerCase();
                              const searchMatch = !docSearchTerm || item.master.documentName?.toLowerCase().includes(searchLower);
                              const catMatch = docFilterCategory === 'All' || (item.master.category || 'General') === docFilterCategory;
                              const status = item.doc ? item.doc.status : 'Pending';
                              const compStatus = status === 'Awaiting File' ? 'Pending' : status;
                              const statusMatch = docFilterStatus === 'All' || compStatus === docFilterStatus;
                              return searchMatch && catMatch && statusMatch;
                            }).length === 0 && (
                                <tr>
                                  <td colSpan="4">
                                    <div className="dm-empty-state" style={{ padding: '2rem' }}>
                                      <Search size={24} />
                                      <h3>No Documents Found</h3>
                                      <p>Adjust your filter to see more requirements.</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {activeTab === 'verification' && isAdmin && (
                <div className="dm-verification-list">
                  {checklist.filter(i => i.doc).length === 0 ? (
                    <div className="dm-empty-state">
                      <ShieldCheck size={32} />
                      <h3>No Documents for Audit</h3>
                      <p>Waiting for the applicant to upload files.</p>
                    </div>
                  ) : (
                    Object.keys(categoriesMap).map(category => {
                      const docsToVerify = categoriesMap[category].filter(i => i.doc);
                      if (docsToVerify.length === 0) return null;

                      return (
                        <div key={`vp-${category}`} style={{ marginBottom: '2rem' }}>
                          <h3 className="dm-doc-category-header">{category}</h3>
                          {docsToVerify.map(({ master, doc }) => (
                            <div className="dm-verification-row" key={`verify-${doc.id}`}>
                              {/* Left: Title & File Info */}
                              <div className="dm-vr-primary">
                                <div className="dm-vr-icon">
                                  {doc.fileType?.includes('pdf') ? <FileText size={18} /> : <ImageIcon size={18} />}
                                </div>
                                <div className="dm-vr-info">
                                  <h4 className="dm-vr-name">{master.documentName}</h4>
                                  <span className="dm-vr-filename">{doc.fileName}</span>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <span className={`dm-badge ${doc.status}`} style={{ margin: '0 0.5rem' }}>{doc.status}</span>

                              {/* Rejection Notes (Inline) */}
                              {doc.status === 'Rejected' && doc.remarks && (
                                <div className="dm-vr-remarks">
                                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                                  <span className="dm-vr-remarks-text">{doc.remarks}</span>
                                  <div className="dm-vr-tooltip">
                                    <div className="dm-vr-tooltip-header">
                                      <AlertCircle size={12} />
                                      <span>Rejection Reason</span>
                                    </div>
                                    <p className="dm-vr-tooltip-content">{doc.remarks}</p>
                                  </div>
                                </div>
                              )}

                              {/* Action Controls */}
                              <div className="dm-vr-actions">
                                <button
                                  className="dm-action-btn dm-vr-btn-info"
                                  onClick={() => handlePreview(doc)}
                                  title={`Review Document (Uploaded: ${safeDate(doc.uploadedAt)})`}
                                >
                                  <Eye size={14} /> Review
                                </button>
                                <button
                                  className="dm-action-btn dm-vr-btn-success"
                                  onClick={() => handleVerify(doc.id)}
                                  disabled={doc.status === 'Verified'}
                                  title="Confirm Verification"
                                >
                                  <CheckCircle2 size={14} /> Verify
                                </button>
                                <button
                                  className="dm-action-btn dm-vr-btn-danger"
                                  onClick={() => setRejectModal({ open: true, docId: doc.id, remarks: doc.status === 'Rejected' ? (doc.remarks || '') : '' })}
                                  title="Reject Asset"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── Modals (Rendered via Portal) ── */}
      {uploadModal.open && createPortal(
        <div className="dm-modal-overlay" onClick={() => setUploadModal({ open: false })}>
          <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h3>Submit Asset Package</h3>
              <button className="dm-modal-close" onClick={() => setUploadModal({ open: false })}><X size={20} /></button>
            </div>
            <div className="dm-modal-body">
              <p style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--dm-text-muted)', fontSize: '0.875rem' }}>
                Uploading <strong style={{ color: 'var(--dm-navy)' }}>{uploadModal.masterName}</strong> to the secure vault.
              </p>
              <UploadFormV2
                masterId={uploadModal.masterId}
                applicationId={appData?.id}
                loanType={appData?.loanType}
                onSuccess={() => { 
                  setUploadModal({ open: false }); 
                  // Optimization: optimistic UI for upload is harder since we don't have the new doc ID, 
                  // but we can still use quiet refresh to avoid showing skeleton
                  fetchData(appData.applicationNo, true); 
                }}
                onClose={() => setUploadModal({ open: false })}
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {previewModal.open && createPortal(
        <div className="dm-modal-overlay dm-preview-modal-wrapper" onClick={closePreview}>
          <div className="dm-modal-content dm-preview-content" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header dm-preview-header">
              <h3>{previewModal.fileName ?? 'Secure Preview'}</h3>
              <button className="dm-modal-close dm-preview-close" onClick={closePreview}><X size={20} /></button>
            </div>
            <div className="dm-modal-body dm-preview-body">
              {previewModal.fileType?.startsWith('image/') ? (
                <img src={previewModal.blobUrl} className="dm-preview-image" alt={previewModal.fileName} />
              ) : (
                <iframe src={previewModal.blobUrl} className="dm-preview-iframe" title="Document Preview" />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {rejectModal.open && createPortal(
        <div className="dm-modal-overlay" onClick={() => setRejectModal({ open: false })}>
          <div className="dm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="dm-modal-header">
              <h3>Decline Document</h3>
              <button className="dm-modal-close" onClick={() => setRejectModal({ open: false })}><X size={20} /></button>
            </div>
            <div className="dm-modal-body">
              <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--dm-text-muted)', fontSize: '0.875rem' }}>
                Specify the exact reason for failing the compliance check. This will be recorded in the audit logs.
              </p>
              <textarea
                className="dm-vp-textarea"
                placeholder="E.g. Blurry image, signature missing, invalid date..."
                value={rejectModal.remarks}
                onChange={e => {
                  if (e.target.value.length <= 250) {
                    setRejectModal({ ...rejectModal, remarks: e.target.value });
                  }
                }}
                autoFocus
                maxLength={250}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: (rejectModal.remarks || '').length >= 250 ? 'var(--dm-error)' : 'var(--dm-text-muted)', fontWeight: 500 }}>
                  Characters: {(rejectModal.remarks || '').length} / 250
                </span>
                {(rejectModal.remarks || '').length >= 250 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--dm-error)', fontWeight: 600 }}>Limit reached</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button className="dm-btn-secondary" style={{ flex: 1 }} onClick={() => setRejectModal({ open: false })}>Cancel</button>
                <button 
                  className="dm-btn-primary" 
                  style={{ flex: 1, background: 'var(--dm-error)', justifyContent: 'center' }} 
                  onClick={handleReject}
                  disabled={(rejectModal.remarks || '').length > 250}
                >
                  Enforce Rejection
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Global Page Action Loading Overlay */}
      {actionLoading && createPortal(
        <div className="dm-modal-overlay" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 9999 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--dm-navy)" />
            <span style={{ fontWeight: 600, color: 'var(--dm-navy)', letterSpacing: '0.05em' }}>Processing Request...</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────── */

function UploadFormV2({ masterId, applicationId, loanType, onSuccess, onClose }) {
  const { showToast } = useApp();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('documentMasterId', masterId);
      formData.append('file', file);
      if (loanType) formData.append('loanType', loanType);

      const res = await fetch(`${API_BASE_URL}/Document/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
        body: formData,
      });
      if (res.ok) onSuccess();
      else showToast('Protocol error during transfer', 'error');
    } catch (_) {
      showToast('Infrastructure error', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        className={`dm-doc-dropzone ${file ? 'drag-active' : ''}`}
        style={{ minHeight: '150px' }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
        {!file ? (
          <>
            <Upload size={36} className="dm-doc-dropzone-icon" />
            <span className="dm-doc-dropzone-text">Browse or Drag & Drop</span>
            <span className="dm-doc-dropzone-hint">PDF, JPEG, PNG up to 5MB</span>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={32} style={{ color: 'var(--dm-success)' }} />
            <span style={{ fontWeight: 600, color: 'var(--dm-navy)' }}>{file.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--dm-text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="dm-btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={uploading}>Cancel</button>
        <button
          className="dm-btn-primary"
          style={{ flex: 1, justifyContent: 'center', background: 'var(--dm-success)', borderColor: 'var(--dm-success)', color: 'white', fontWeight: '600' }}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? <><Loader2 size={16} className="animate-spin" /> Transmitting...</> : 'Confirm Upload'}
        </button>
      </div>
    </div>
  );
}