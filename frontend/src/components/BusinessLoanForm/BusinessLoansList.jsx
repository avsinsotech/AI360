import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Download, Plus, RotateCw, 
  Coins, LayoutGrid, CheckCircle2, 
  AlertCircle, Briefcase, Printer, Edit, Trash2, 
  ShieldCheck, Fingerprint, MapPin, Calendar, ArrowRight, UserPlus, FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import Businessloanapi from '../../services/Businessloanapi';
import '../Loans/Loans.css'; 

export default function BusinessLoansList() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  
  // Get today's date in YYYY-MM-DD format (Local Time)
  const getTodayDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [submittedLoans, setSubmittedLoans] = useState([]);
  const [aadhaarHistory, setAadhaarHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('registry'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [loanFilterDate, setLoanFilterDate] = useState(getTodayDate());

  const fetchLoans = async () => {
    setIsLoading(true);
    const headers = { 
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` 
    };
    try {
      const resp = await fetch(`${API_BASE_URL}/Analytics/recent-applications`, { headers });
      if (resp.ok) {
        const appsData = await resp.json();
        // Filter specifically for business loans
        const filtered = appsData.filter(app => 
          app.loanType?.toLowerCase() === 'business loan' || 
          app.loanType?.toLowerCase() === 'व्यावसायिक कर्ज'
        );

        const mapped = filtered.map(app => ({
          id: app.id,
          applicationNo: app.applicationNo,
          applicantName: app.applicantName,
          loanType: app.loanType,
          loanAmount: app.amount,
          status: app.status || 'Submitted',
          dateMs: new Date(app.createdAt).getTime(),
          dateStr: formatDate(app.createdAt)
        }));

        mapped.sort((a,b) => b.dateMs - a.dateMs);
        setSubmittedLoans(mapped);
      }
    } catch (err) {
      console.error("Business Loan Fetch Error:", err);
      showToast("Error fetching business loans", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAadhaarHistory = async () => {
    setIsLoading(true);
    const headers = { 
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` 
    };
    try {
      const resp = await fetch(`${API_BASE_URL}/AadharProxy/history`, { headers });
      if (resp.ok) {
        const data = await resp.json();
        const rawList = Array.isArray(data) ? data : (data.items || []);
        
        const validAadhaarRecords = rawList.filter(item => {
          if (!item.aadhaarNo || !/^\d{12}$/.test(item.aadhaarNo.trim())) return false;
          if (item.loanType) return false; 
          if (item.applicationNo) return false; 
          if (item.gender && /\d{4}/.test(item.gender)) return false;
          if (item.dob && item.dob.includes('₹')) return false;
          const verifiedDate = new Date(item.verifiedAt);
          if (isNaN(verifiedDate.getTime())) return false;
          return true;
        });
        
        setAadhaarHistory(validAadhaarRecords);
      }
    } catch (err) {
      console.error("Aadhaar Registry Fetch Error:", err);
      showToast("Error fetching identity registry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchAadhaarHistory();
  }, []);

  const formatDate = (dateInput) => {
    if (!dateInput) return '-';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredApplications = useMemo(() => {
    const searchDateStr = loanFilterDate ? loanFilterDate.split('-').reverse().join('/') : '';
    
    return submittedLoans.filter(l => {
      const matchesSearch = !searchTerm || 
        (l.applicantName && l.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.applicationNo && l.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDate = !loanFilterDate || l.dateStr === searchDateStr;
      return matchesSearch && matchesDate;
    });
  }, [submittedLoans, searchTerm, loanFilterDate]);

  const filteredRegistry = useMemo(() => {
    return aadhaarHistory.filter(h => {
      const matchesSearch = !searchTerm || 
        (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (h.aadhaarNo && h.aadhaarNo.includes(searchTerm));
      const matchesDate = !loanFilterDate || h.verifiedAt?.startsWith(loanFilterDate);
      return matchesSearch && matchesDate;
    });
  }, [aadhaarHistory, searchTerm, loanFilterDate]);

  const displayData = activeTab === 'applications' ? filteredApplications : filteredRegistry;
  const totalPages = Math.ceil(displayData.length / pageSize);
  
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayData.slice(start, start + pageSize);
  }, [displayData, currentPage]);

  const stats = [
    { label: 'Today Records', value: (filteredApplications.length + filteredRegistry.length).toString(), icon: <LayoutGrid size={24} />, color: '#fffbeb', textColor: '#b45309' },
    { label: 'Total Verified Identities', value: aadhaarHistory.length.toString(), icon: <ShieldCheck size={24} />, color: '#f0fdf4', textColor: '#166534' },
    { label: 'Total Loans Volume', value: '₹ ' + submittedLoans.reduce((acc, curr) => acc + (parseFloat(curr.loanAmount)||0), 0).toLocaleString('en-IN'), icon: <FileText size={24} />, color: '#eff6ff', textColor: '#2563eb' }
  ];

  return (
    <div className="loans-module">
      <header className="loans-header">
        <div className="header-titles">
          <h1 className="header-title"><Briefcase size={28} style={{color: '#2563eb'}} /> Business Loan Engine</h1>
          <p className="header-subtitle">Professional business loan processing and identity verification nexus</p>
        </div>
        <div className="header-actions">
          {/* New Application button removed as requested */}
          <button className="loans-btn loans-btn-dark" onClick={() => { fetchLoans(); fetchAadhaarHistory(); }} disabled={isLoading}>
            <RotateCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: s.color, color: s.textColor }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="loans-tabs" style={{marginBottom: '20px'}}>
        <button 
          className={`tab-btn ${activeTab === 'registry' ? 'active' : ''}`}
          onClick={() => { setActiveTab('registry'); setCurrentPage(1); }}
        >
          <Fingerprint size={16} /> Verified Registry
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => { setActiveTab('applications'); setCurrentPage(1); }}
        >
          <Briefcase size={16} /> Submitted Applications
        </button>
      </div>

      <div className="loans-section">
        <div className="section-header">
          <h2 className="section-title">
            {activeTab === 'applications' ? 'Application History' : 'Identity Registry'}
          </h2>
          <div className="section-actions">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-fixed" />
              <input 
                type="text" 
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <Calendar size={18} style={{ color: '#2563eb' }} />
               <input 
                 type="date" 
                 className="dm-filter-select" 
                 value={loanFilterDate}
                 onChange={e => { setLoanFilterDate(e.target.value); setCurrentPage(1); }}
                 style={{padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.8rem', fontSize: '0.875rem', outline: 'none', fontWeight: 600}}
               />
            </div>
          </div>
        </div>

        <div className="clean-table-container">
          <table className="clean-table">
            {activeTab === 'applications' ? (
              <>
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Applicant</th>
                    <th style={{ width: '20%' }}>Application No.</th>
                    <th style={{ width: '12%' }}>Date</th>
                    <th style={{ width: '13%' }}>Amount</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((loan, i) => (
                      <tr key={loan.id || i}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar-circle" style={{background: `hsl(${(i * 123) % 360}, 65%, 45%)`}}>
                              {(loan.applicantName || 'U').charAt(0)}
                            </div>
                            {loan.applicantName}
                          </div>
                        </td>
                        <td className="aadhaar-text" style={{fontWeight: 700}}>{loan.applicationNo || '-'}</td>
                        <td className="date-text">{loan.dateStr}</td>
                        <td className="amount-text" style={{ fontWeight: 600, color: '#2563eb' }}>
                          ₹ {(parseFloat(loan.loanAmount)||0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-pill status-${loan.status?.toLowerCase() === 'approved' ? 'approved' : 
                            loan.status?.toLowerCase() === 'draft' ? 'rejected' : 'sending'}`}>
                            {loan.status || 'Submitted'}
                          </span>
                        </td>
                        <td style={{textAlign: 'center'}}>
                          <div className="row-actions" style={{justifyContent: 'center', gap: '8px'}}>
                            <button className="action-icon-btn" onClick={() => navigate(`/business-loan/${loan.id}`)} title="Modify">
                              <Edit size={20} /> <span className="btn-label">Edit</span>
                            </button>
                            <button className="action-icon-btn" onClick={() => showToast('Authorization suite coming soon', 'info')} title="Authorize" style={{color: '#16a34a'}}>
                              <ShieldCheck size={20} /> <span className="btn-label">Verify</span>
                            </button>
                            <button className="action-icon-btn" onClick={() => navigate('/business-loan-print', { state: { id: loan.id } })} title="Print" style={{color: '#475569'}}>
                              <Printer size={20} /> <span className="btn-label">Print</span>
                            </button>
                            <button 
                              className="action-icon-btn delete-btn" 
                              onClick={async () => {
                                if(window.confirm('Delete this record?')) {
                                  try {
                                    await Businessloanapi.deleteApplication(loan.id);
                                    showToast("Application deleted successfully", "success");
                                    fetchLoans();
                                  } catch (err) {
                                    showToast(err.message, "error");
                                  }
                                }
                              }}
                              title="Delete" 
                            >
                              <Trash2 size={20} /> <span className="btn-label">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="empty-state">No business loans found for {loanFilterDate || 'selected criteria'}.</td></tr>
                  )}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Identity</th>
                    <th style={{ width: '20%' }}>Aadhaar Number</th>
                    <th style={{ width: '15%' }}>Verified On</th>
                    <th style={{ width: '15%' }}>Gender</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Process</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((user, i) => (
                      <tr key={user.id || i}>
                        <td>
                          <div className="user-cell">
                             <div className="avatar-circle" style={{background: `hsl(${(i * 54) % 360}, 50%, 40%)`}}>
                              {user.name?.charAt(0)}
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                              <span style={{fontWeight: 700}}>{user.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="aadhaar-text">
                          <Fingerprint size={14} style={{color: '#475569'}} /> {user.aadhaarNo}
                        </td>
                        <td className="date-text">
                          <Calendar size={14} /> {formatDate(user.verifiedAt)}
                        </td>
                        <td>{user.gender || '-'}</td>
                        <td style={{textAlign: 'center'}}>
                          <button 
                            className="new-app-btn"
                            onClick={() => navigate('/business-loan/add', { state: { aadharData: user } })}
                            style={{margin: '0 auto', background: '#eff6ff', color: '#1e3a8a', borderColor: '#dbeafe'}}
                          >
                            <UserPlus size={18} /> <span>Start Business Loan</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="empty-state">No identities verified on {loanFilterDate || 'selected criteria'}.</td></tr>
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>

        {totalPages > 1 && (
          <div className="clean-pagination">
            <div className="dm-page-numbers">
              {(() => {
                const delta = 1;
                const range = [];
                for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                  range.push(i);
                }
                if (currentPage - delta > 2) range.unshift("...");
                range.unshift(1);
                if (currentPage + delta < totalPages - 1) range.push("...");
                if (totalPages > 1) range.push(totalPages);

                return range.map((p, i) => (
                  <button
                    key={i}
                    className={`page-dot ${currentPage === p ? 'active' : ''} ${p === '...' ? 'dots' : ''}`}
                    onClick={() => typeof p === 'number' && setCurrentPage(p)}
                    disabled={p === '...'}
                  >
                    {p}
                  </button>
                ));
              })()}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
