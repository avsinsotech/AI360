import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, ArrowLeft, ChevronRight, ShieldCheck, Loader2,
  FileText, Clock, CheckCircle2, RotateCw, AlertTriangle,
  Landmark, Car, Home, Briefcase
} from 'lucide-react';
import API_BASE_URL from '../../config';


import { useApp } from '../../context/AppContext';

// Lazy load detail modules for performance
const VehicleLoanScrutinyDetail = lazy(() => import('./VehicleLoanScrutinyDetail'));
const PersonalLoanScrutinyDetail = lazy(() => import('./PersonalLoanScrutinyDetail'));
const HousingLoanScrutinyDetail = lazy(() => import('./HousingLoanScrutinyDetail'));
const BusinessLoanScrutinyDetail = lazy(() => import('./BusinessLoanScrutinyDetail'));

import './LoanScrutiny.css';

/* Import the Document Management CSS so we reuse the exact same table/pagination styles */
import '../DocumentManagement/DocumentManagement.css';

const safeDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const ITEMS_PER_PAGE = 9;

const LOAN_META = {
  VehicleLoan: { icon: <Car size={24} />, title: 'Vehicle Loan Scrutiny System' },
  PersonalLoan: { icon: <Landmark size={24} color="#ffd700" />, title: 'Personal Loan Scrutiny System' },
  HomeLoan: { icon: <Home size={24} />, title: 'Housing Loan Scrutiny System' },
  BusinessLoan: { icon: '🏢', title: 'Business Loan Scrutiny System' },
};

const DevelopmentPlaceholder = ({ loanType, onBack }) => (
  <div style={{ padding: 60, textAlign: 'center' }}>
    <div style={{ fontSize: 64, marginBottom: 20 }}>🚧</div>
    <h2 style={{ color: '#1F3864', marginBottom: 10 }}>Scrutiny Module Under Development</h2>
    <p style={{ color: '#666', maxWidth: 500, margin: '0 auto 30px auto' }}>
      The specialized scrutiny module for <strong>{loanType.replace('Loan', ' Loan')}</strong> is currently being developed by our engineering team.
    </p>
    <button className="dm-action-btn" onClick={onBack}><ArrowLeft size={16} /> Return to Dashboard</button>
  </div>
);

export default function LoanScrutiny() {
  const { appId: urlAppId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [openingId, setOpeningId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/recent-applications`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) setApplications(await res.json());
    } catch (_) {
      showToast('Error loading scrutiny dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchAppDetail = useCallback(async (id) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/Document/application/${id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedApp({ ...data.application, items: data.documents, masterList: data.masterList });
      } else {
        showToast('Application not found', 'error');
        navigate('/loan-scrutiny');
      }
    } catch (_) {
      showToast('Error fetching application details', 'error');
    } finally {
      setDetailLoading(false);
      setOpeningId(null);
    }
  }, [showToast, navigate]);

  useEffect(() => {
    if (urlAppId) {
      fetchAppDetail(urlAppId);
    } else {
      setSelectedApp(null);
      fetchApplications();
    }
  }, [urlAppId, fetchApplications, fetchAppDetail]);

  const enrichedApps = applications.map(app => ({
    ...app,
    computedDocStatus: app.documentCompletionPercentage === 100 ? 'COMPLETED' : (app.documentCompletionPercentage > 0 ? 'IN_PROGRESS' : 'PENDING')
  }));

  const filteredApps = enrichedApps.filter(app => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = !s || app.applicationNo?.toLowerCase().includes(s) || app.applicantName?.toLowerCase().includes(s);
    const matchesType = filterType === 'All' || app.loanType === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: enrichedApps.length,
    pending: enrichedApps.filter(a => a.computedDocStatus === 'PENDING').length,
    verified: enrichedApps.filter(a => a.computedDocStatus === 'COMPLETED').length,
    inProgress: enrichedApps.filter(a => a.computedDocStatus === 'IN_PROGRESS').length
  };

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const paginatedApps = filteredApps.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ═══ DETAIL VIEW ═══ */
  if (selectedApp) {
    const meta = LOAN_META[selectedApp.loanType] || { icon: '📋', title: 'Loan Scrutiny System' };

    const renderDetail = () => {
      return (
        <Suspense fallback={
          <div className="ls-loader-container" style={{ padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <Loader2 className="animate-spin" size={40} color="#ffd700" />
            <span style={{ color: '#64748b', fontWeight: 600 }}>Loading Scrutiny Module...</span>
          </div>
        }>
          {selectedApp.loanType === 'VehicleLoan' && <VehicleLoanScrutinyDetail application={selectedApp} />}
          {selectedApp.loanType === 'PersonalLoan' && <PersonalLoanScrutinyDetail application={selectedApp} />}
          {selectedApp.loanType === 'HomeLoan' && <HousingLoanScrutinyDetail application={selectedApp} />}
          {selectedApp.loanType === 'BusinessLoan' && <BusinessLoanScrutinyDetail application={selectedApp} />}
        </Suspense>
      );
    };

    return (
      <div className="ls-module-wrapper">
        <div className="ls-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="ls-top-bar-icon-box">{meta.icon}</div>
            <div>
              <h1>{meta.title}</h1>
              <div className="ls-top-bar-sub">AVS InSoTech Private Limited</div>
            </div>
          </div>
          <div className="ls-top-bar-right">
            <div className="ls-top-bar-meta">
              <span>Application ID: <strong>{selectedApp.applicationNo}</strong></span>
              <span>Applicant: <strong>{selectedApp.applicantName}</strong></span>
            </div>
            <button className="ls-btn secondary" onClick={() => navigate('/loan-scrutiny')}><ArrowLeft size={14} /> Back to Hub</button>
          </div>
        </div>

        {renderDetail()}

        {/* Full Page Processing Overlay - Simplified style matching Document Management */}
        {detailLoading && createPortal(
          <div className="dm-modal-overlay" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 9999 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Loader2 className="animate-spin" size={48} color="var(--dm-navy)" />
              <span style={{ fontWeight: 600, color: 'var(--dm-navy)', letterSpacing: '0.05em' }}>Analyzing Application...</span>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  /* ═══ LIST VIEW — uses dm- classes for identical styling ═══ */
  return (
    <div className="dm-container" style={{ position: 'relative' }}>
      <div className="dm-header">
        <div className="dm-header-title">
          <div className="dm-icon-box"><ShieldCheck size={24} /></div>
          <div>
            <h1 className="dm-title">Loan Scrutiny Hub</h1>
            <p className="dm-subtitle">Verification & risk assessment dashboard</p>
          </div>
        </div>
      </div>

      <div className="dm-summary-cards">
        <div className="dm-stat-card total">
          <div className="dm-stat-icon-wrapper"><FileText size={20} /></div>
          <div className="dm-stat-info">
            <span className="dm-stat-label">Total Applications</span>
            <span className="dm-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="dm-stat-card pending">
          <div className="dm-stat-icon-wrapper"><Clock size={20} /></div>
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
        <div className="dm-stat-card in-progress">
          <div className="dm-stat-icon-wrapper"><Loader2 size={20} /></div>
          <div className="dm-stat-info">
            <span className="dm-stat-label">In Progress</span>
            <span className="dm-stat-value">{stats.inProgress}</span>
          </div>
        </div>
      </div>

      <div className="dm-filter-bar">
        <div className="dm-search-input-group">
          <Search size={16} className="dm-search-icon" />
          <input
            type="text"
            className="dm-search-input"
            placeholder="Search by Applicant or Application No..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select className="dm-filter-select" value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}>
          <option value="All">All Loan Types</option>
          <option value="VehicleLoan">Vehicle Loan</option>
          <option value="HomeLoan">Home Loan</option>
          <option value="BusinessLoan">Business Loan</option>
          <option value="PersonalLoan">Personal Loan</option>
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
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && applications.length === 0 ? (
                Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                  <tr key={`skel-${i}`}>
                    <td colSpan="5">
                      <div className="skeleton skeleton-table-row" style={{ height: '52px', background: 'rgba(0,0,0,0.03)' }}></div>
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
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="dm-action-btn"
                        style={{ marginLeft: 'auto', minWidth: '130px', justifyContent: 'center' }}
                        onClick={() => {
                          setOpeningId(app.applicationNo);
                          navigate(`/loan-scrutiny/${app.applicationNo}`);
                        }}
                        disabled={openingId === app.applicationNo}
                      >
                        {openingId === app.applicationNo ? (
                          <><Loader2 size={16} className="animate-spin" /> Opening...</>
                        ) : (
                          <>Open Scrutiny <ChevronRight size={16} /></>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">
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

      {/* Full Page Processing Overlay - Simplified style matching Document Management */}
      {detailLoading && createPortal(
        <div className="dm-modal-overlay" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 9999 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 className="animate-spin" size={48} color="var(--dm-navy)" />
            <span style={{ fontWeight: 600, color: 'var(--dm-navy)', letterSpacing: '0.05em' }}>Analyzing Application...</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}