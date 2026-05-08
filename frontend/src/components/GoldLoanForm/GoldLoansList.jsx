import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Plus, RotateCw,
  Coins, LayoutGrid, CheckCircle2,
  AlertCircle, Briefcase, Printer, Edit, Trash2,
  ShieldCheck, Fingerprint, MapPin, Calendar, ArrowRight, UserPlus,
  Upload, Eye, FileUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import goldLoanService from '../../services/goldLoanService';
import html2pdf from 'html2pdf.js';
import '../Loans/Loans.css'; // Reuse existing CSS from main loans component

export default function GoldLoansList() {
  const navigate = useNavigate();
  const { showToast, clientInfo } = useApp();

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
  const [activeTab, setActiveTab] = useState('registry'); // Default to Registry as requested
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Persistent Date Filter: Default to Today, but remember user selection
  const [loanFilterDate, setLoanFilterDate] = useState(() => {
    const saved = sessionStorage.getItem('gl_filter_date');
    return saved || getTodayDate();
  });

  const handleDateChange = (newDate) => {
    setLoanFilterDate(newDate);
    sessionStorage.setItem('gl_filter_date', newDate);
    setCurrentPage(1);
  };
  const [showValuationModal, setShowValuationModal] = useState(false);
  const [selectedRecordForValuation, setSelectedRecordForValuation] = useState(null);
  const [showDocViewModal, setShowDocViewModal] = useState(false);
  const [currentViewDoc, setCurrentViewDoc] = useState(null);
  const [currentViewId, setCurrentViewId] = useState(null);

  const fetchLoans = async () => {
    setIsLoading(true);
    const headers = {
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
    };
    try {
      const resp = await fetch(`${API_BASE_URL}/Analytics/recent-applications`, { headers });
      if (resp.ok) {
        const appsData = await resp.json();
        const filtered = appsData.filter(app => app.loanType?.toLowerCase() === 'gold loan');

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

        mapped.sort((a, b) => b.dateMs - a.dateMs);
        setSubmittedLoans(mapped);
      }
    } catch (err) {
      console.error("Gold Loan Fetch Error:", err);
      showToast("Error fetching gold loans", "error");
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
    // Fetch both to keep stats updated, but focus logic remains
    fetchLoans();
    fetchAadhaarHistory();
  }, []);

  const openValuationModal = (user) => {
    setSelectedRecordForValuation(user);
    setShowValuationModal(true);
  };

  const confirmValuationDownload = (includeDetails) => {
    setShowValuationModal(false);
    if (selectedRecordForValuation) {
      handleDownloadValuationForm(selectedRecordForValuation, includeDetails);
    }
  };

  const handleDownloadValuationForm = (record, includeDetails) => {
    if (!record) return;

    showToast('Generating Valuation Form...', 'info');

    const bankName = clientInfo?.name || clientInfo?.Name || "दत्तसेवा सहकारी पतपेढी";
    const bankAddress = clientInfo?.address || clientInfo?.Address || "Mumbai, Maharashtra";
    const bankLogo = clientInfo?.logoUrl || clientInfo?.LogoUrl || "";
    const today = new Date().toLocaleDateString('en-GB');
    const branch = clientInfo?.branch || clientInfo?.Branch || "Main Branch";
    const borrowerName = includeDetails ? (record.name || record.Name || "N/A") : "";
    const mobile = includeDetails ? (record.mobileNo || record.phone || record.MobileNo || record.Phone || "N/A") : "";

    const element = document.createElement('div');
    element.innerHTML = `
      <style>
        .valuation-paper {
          background: #FEFCF5;
          width: 790px;
          min-height: 1100px;
          border: 3px solid #B8860B;
          position: relative;
          padding: 0;
          margin: 0;
          font-family: 'Noto Sans Devanagari', Arial, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }
        .v-header-band {
          background: linear-gradient(135deg, #0D1B3E 0%, #1A2E5A 100%);
          padding: 15px 36px 12px;
          position: relative;
          border-bottom: 5px solid #B8860B;
        }
        .v-logo-row { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 8px; position: relative; }
        .v-logo-circle {
          width: 115px; height: 115px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .v-logo-circle img { width: 100%; height: 100%; object-fit: contain; }
        .v-bank-branding { flex: 1; padding-top: 1px; }
        .v-name-mr { font-size: 21px; font-weight: 700; color: #fff; letter-spacing: 0.5px; line-height: 1.1; }
        .v-address-gold { font-size: 10px; color: #FFFFFF; font-weight: 500; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        
        .v-reg-box { text-align: right; font-size: 11px; color: #FFFFFF; line-height: 2.2; }
        .v-reg-line-item { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
        .v-reg-line-field { border-bottom: 1px solid rgba(255,255,255,0.6); min-width: 90px; height: 15px; }

        .v-doc-title-section { text-align: center; margin-top: 8px; position: relative; }
        .v-doc-title-line { height: 1px; background: rgba(255,255,255,0.25); width: 160px; margin: 0 auto 6px; }
        .v-doc-title-mr { font-size: 17px; font-weight: 700; color: #FFFFFF; text-transform: uppercase; }
        .v-doc-title-en { font-size: 8px; color: #FFFFFF; letter-spacing: 1px; margin-top: 3px; text-transform: uppercase; opacity: 0.8; }

        .v-body { padding: 12px 35px 8px; }
        .v-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 25px; margin-bottom: 15px; }
        .v-field { display: flex; flex-direction: column; gap: 2px; }
        .v-label { font-size: 13px; font-weight: 700; color: #2C4580; text-transform: uppercase; }
        .v-value { border-bottom: 1px solid #C9A84C; min-height: 22px; font-size: 14px; padding: 1px 4px; color: #1A1209; }
        
        .v-section-title { display: flex; align-items: center; gap: 8px; margin: 8px 0 6px; }
        .v-section-text { font-size: 11px; font-weight: 700; color: #0D1B3E; }
        .v-section-line { flex: 1; height: 1px; background: #C9A84C; }
        
        .v-table-wrap { border: 1px solid #C9A84C; border-radius: 4px; overflow: hidden; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; }
        th { background: #0D1B3E; color: #FFFFFF; padding: 5px; border-right: 1px solid rgba(255,255,255,0.1); }
        td { padding: 3px 5px; border-right: 1px solid #E0CC80; border-bottom: 1px solid #E8D8A0; text-align: center; height: 26px; }
        
        .v-summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .v-summary-card { border: 1px solid #C9A84C; padding: 7px; background: #FDF6E3; }
        .v-summary-label { font-size: 11px; font-weight: 700; color: #2C4580; margin-bottom: 2px; }
        .v-summary-value { font-size: 14px; font-weight: 700; color: #0D1B3E; border-bottom: 1.5px solid #B8860B; }
        
        .v-declaration-box { border: 1px solid #E0CC80; background: #FEFCF5; padding: 10px 15px; margin-bottom: 12px; border-left: 4px solid #B8860B; }
        .v-decl-title { font-size: 13px; font-weight: 700; color: #0D1B3E; margin-bottom: 5px; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
        .v-decl-text { font-size: 11px; font-weight: 600; color: #3D2E10; line-height: 1.3; }
        .v-decl-en { font-size: 10px; color: #777; margin-top: 4px; font-weight: 400; }

        .v-sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 40px; margin-top: 10px; }
        .v-sig-box { display: flex; flex-direction: column; }
        .v-sig-label { font-size: 15px; font-weight: 800; color: #0D1B3E; text-transform: uppercase; margin-bottom: 25px; }
        .v-sig-line { border-bottom: 1px solid #B8860B; }
        .v-sig-sub { font-size: 9px; color: #666; text-align: center; margin-top: 4px; }
        
        .v-footer { background: #0D1B3E; color: #FFFFFF; padding: 8px 30px; display: flex; justify-content: space-between; align-items: center; font-size: 8px; border-top: 3px solid #B8860B; position: absolute; bottom: 0; width: 100%; box-sizing: border-box; }
        .v-foot-conf { background: #B8860B; color: #0D1B3E; padding: 2px 12px; font-weight: 800; border-radius: 2px; }
      </style>
      <div class="valuation-paper">
        <div class="v-header-band">
          <div class="v-logo-row">
            <div class="v-logo-circle">
              ${bankLogo ? `<img src="${bankLogo}" />` : '<div style="color:white; font-weight:bold; font-size:24px">₹</div>'}
            </div>
            <div class="v-bank-branding">
              <div class="v-name-mr">${bankName}</div>
              <div class="v-address-gold">${bankAddress}</div>
            </div>
            <div class="v-reg-box">
              <div class="v-reg-line-item">नोंदणी क्र. / Reg. No.: <div class="v-reg-line-field"></div></div>
              <div class="v-reg-line-item">दूरध्वनी / Tel: <div class="v-reg-line-field"></div></div>
              <div class="v-reg-line-item">RBI परवाना / Licence: <div class="v-reg-line-field"></div></div>
            </div>
          </div>
          <div class="v-doc-title-section">
            <div class="v-doc-title-line"></div>
            <div class="v-doc-title-mr">मूल्यांकन दाखला</div>
            <div class="v-doc-title-en">GOLD ORNAMENT VALUATION CERTIFICATE</div>
          </div>
        </div>

        <div class="v-body">
          <div class="v-meta-grid">
            <div class="v-field"><span class="v-label">दिनांक (Date)</span><div class="v-value">${today}</div></div>
            <div class="v-field"><span class="v-label">शाखा (Branch)</span><div class="v-value">${branch}</div></div>
            <div class="v-field"><span class="v-label">कर्जदाराचे नाव (Borrower's Name)</span><div class="v-value">${borrowerName}</div></div>
            <div class="v-field"><span class="v-label">मोबाईल (Mobile)</span><div class="v-value">${mobile}</div></div>
            <div class="v-field" style="grid-column: span 2"><span class="v-label">कर्ज प्रकार (Loan Type)</span><div class="v-value"></div></div>
          </div>
          
          <div className="v-section-title"><span class="v-section-text">दागिन्यांचे तपशील / Ornament Details</span></div>
          <div className="v-table-wrap">
            <table>
              <thead>
                <tr><th style="width:30px">Sr.</th><th>दागिन्यांचे वर्णन / Description</th><th style="width:40px">Pcs</th><th style="width:60px">Weight</th><th style="width:60px">Purity</th><th style="width:105px">Value (₹)</th></tr>
              </thead>
              <tbody>
                ${includeDetails
        ? [
          'Bangals', 'Chain Locket', 'Mangal Sutra', 'Haar',
          'Necklace', 'Chain', 'Studs', 'Ear chain'
        ].map((item, i) => `<tr><td>${i + 1}</td><td style="text-align: left; padding-left: 10px;">${item}</td><td></td><td></td><td></td><td></td></tr>`).join('')
        : Array(8).fill(0).map((_, i) => `<tr><td>${i + 1}</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')
      }
              </tbody>
              <tfoot style="background: #FDF6E3; color: #0D1B3E; font-weight: bold;">
                <tr><td colspan="2" style="text-align:right; border-right: 1px solid #E0CC80; padding:6px; color: #2C4580;">एकूण / TOTAL</td><td style="border-right: 1px solid #E0CC80"></td><td style="border-right: 1px solid #E0CC80"></td><td style="border-right: 1px solid #E0CC80"></td><td></td></tr>
              </tfoot>
            </table>
          </div>

          <div class="v-summary-grid">
            <div class="v-summary-card"><div class="v-summary-label">एकूण वजन / Total Weight</div><div class="v-summary-value">_________ g</div></div>
            <div class="v-summary-card"><div class="v-summary-label">एकूण किंमत / Total Value</div><div class="v-summary-value">₹ _________</div></div>
            <div class="v-summary-card"><div class="v-summary-label">पात्र कर्ज / Eligible Loan</div><div class="v-summary-value">₹ _________</div></div>
          </div>

          <div class="v-declaration-box">
             <div class="v-decl-title">► घोषणापत्र / DECLARATION</div>
             <div class="v-decl-text">वरील दागिन्यांचे प्रत्यक्ष पाहणी करून योग्य प्रमाणात मूल्यांकन करण्यात आले आहे.</div>
             <div class="v-decl-en">The above ornaments have been physically inspected and valued at appropriate market rates as on the date mentioned above.</div>
          </div>

          <div class="v-section-title"><span class="v-section-text">सह्या / Signatures</span></div>
          <div class="v-sig-grid">
            <div class="v-sig-box">
               <span class="v-sig-label">कर्जदाराची सही / BORROWER'S SIGNATURE</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub">नाव व दिनांक / Name & Date</div>
            </div>
            <div class="v-sig-box">
               <span class="v-sig-label">मूल्यांकनकर्ता सही / VALUER'S SIGNATURE</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub">नाव, पदनाम व सील / Name, Designation & Seal</div>
            </div>
            <div class="v-sig-box">
               <span class="v-sig-label">दागिने नेणारा अधिकारी / CUSTODIAN OFFICER</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub">नाव, पदनाम व सील / Name, Designation & Seal</div>
            </div>
            <div class="v-sig-box">
               <span class="v-sig-label">शाखा अधिकाऱ्याची सही / BRANCH MANAGER</span>
               <div class="v-sig-line"></div>
               <div class="v-sig-sub">नाव, पदनाम व सील / Name, Designation & Seal</div>
            </div>
          </div>
        </div>
        <div class="v-footer">
          <div>हा दस्तऐवज केवळ अंतर्गत वापरासाठी आहे | For Internal Use Only</div>
          <div class="v-foot-conf">CONFIDENTIAL</div>
          <div>Form No: DSP-GL-001 | Rev: 2024-01</div>
        </div>
      </div>
    `;

    const opt = {
      margin: 0,
      filename: `Valuation_Form_${borrowerName ? borrowerName.replace(/\s+/g, '_') : 'Blank'}_${today}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleValuationUpload = async (loanId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("File size too large (Max 2MB)", "warning");
      return;
    }

    showToast("Uploading document...", "info");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        const resp = await fetch(`${API_BASE_URL}/AadharProxy/upload-doc/${loanId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
          },
          body: JSON.stringify({ doc: base64 })
        });

        if (resp.ok) {
          showToast("Document uploaded successfully", "success");
          fetchAadhaarHistory();
        } else {
          showToast("Upload failed", "error");
        }
      } catch (err) {
        showToast(err.message, "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const viewValuationDoc = (docBase64, id) => {
    if (!docBase64) return;
    setCurrentViewDoc(docBase64);
    setCurrentViewId(id);
    setShowDocViewModal(true);
  };

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
    return submittedLoans.filter(l => {
      const matchesSearch = !searchTerm ||
        (l.applicantName && l.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.applicationNo && l.applicationNo.toLowerCase().includes(searchTerm.toLowerCase()));

      const lDate = l.dateMs ? new Date(l.dateMs).toDateString() : '';
      const fDate = loanFilterDate ? new Date(loanFilterDate).toDateString() : '';
      const matchesDate = !loanFilterDate || lDate === fDate;

      return matchesSearch && matchesDate;
    });
  }, [submittedLoans, searchTerm, loanFilterDate]);

  const filteredRegistry = useMemo(() => {
    return aadhaarHistory.filter(h => {
      const matchesSearch = !searchTerm ||
        (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (h.aadhaarNo && h.aadhaarNo.includes(searchTerm));

      const hDate = h.verifiedAt ? new Date(h.verifiedAt).toDateString() : '';
      const fDateObj = loanFilterDate ? new Date(loanFilterDate) : null;
      const isFilterValid = fDateObj && !isNaN(fDateObj.getTime());
      const fDate = isFilterValid ? fDateObj.toDateString() : '';

      // If user selected a date but it's invalid (like 31st April), show nothing.
      // If user cleared the date (loanFilterDate is empty), show all.
      const matchesDate = !loanFilterDate ? true : (isFilterValid ? hDate === fDate : false);

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
    { label: 'Total Loans Volume', value: '₹ ' + submittedLoans.reduce((acc, curr) => acc + (parseFloat(curr.loanAmount) || 0), 0).toLocaleString('en-IN'), icon: <Coins size={24} />, color: '#eff6ff', textColor: '#2563eb' }
  ];

  return (
    <div className="loans-module">
      <header className="loans-header">
        <div className="header-titles">
          <h1 className="header-title"><Coins size={28} style={{ color: '#d97706' }} /> Gold Loan Engine</h1>
          <p className="header-subtitle">Daily loan processing and identity verification nexus</p>
        </div>
        <div className="header-actions">

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

      <div className="loans-tabs" style={{ marginBottom: '20px' }}>
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
              <Calendar size={18} style={{ color: '#d97706' }} />
              <input
                type="date"
                className="dm-filter-select"
                value={loanFilterDate}
                onChange={e => handleDateChange(e.target.value)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.8rem', fontSize: '0.875rem', outline: 'none', fontWeight: 600 }}
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
                            <div className="avatar-circle" style={{ background: `hsl(${(i * 193) % 360}, 65%, 45%)` }}>
                              {(loan.applicantName || 'U').charAt(0)}
                            </div>
                            {loan.applicantName}
                          </div>
                        </td>
                        <td className="aadhaar-text" style={{ fontWeight: 700 }}>{loan.applicationNo || '-'}</td>
                        <td className="date-text">{loan.dateStr}</td>
                        <td className="amount-text" style={{ fontWeight: 600, color: '#d97706' }}>
                          ₹ {(parseFloat(loan.loanAmount) || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-pill status-${loan.status?.toLowerCase() === 'approved' ? 'approved' :
                            loan.status?.toLowerCase() === 'draft' ? 'rejected' : 'sending'}`}>
                            {loan.status || 'Submitted'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="row-actions" style={{ justifyContent: 'center', gap: '8px' }}>
                            <button className="action-icon-btn" onClick={() => navigate('/gold-loan/add', { state: { id: loan.id } })} title="Modify">
                              <Edit size={20} /> <span className="btn-label">Edit</span>
                            </button>
                            <button className="action-icon-btn" onClick={() => showToast('Authorization suite coming soon', 'info')} title="Authorize" style={{ color: '#16a34a' }}>
                              <ShieldCheck size={20} /> <span className="btn-label">Verify</span>
                            </button>
                            <button className="action-icon-btn" onClick={() => navigate('/gold-loan-print', { state: { id: loan.id } })} title="Print">
                              <Printer size={20} /> <span className="btn-label">Print</span>
                            </button>
                            <button
                              className="action-icon-btn delete-btn"
                              onClick={async () => {
                                if (window.confirm('Delete this record?')) {
                                  try {
                                    await goldLoanService.deleteLoan(loan.id);
                                    showToast("Loan deleted successfully", "success");
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
                    <tr><td colSpan="6" className="empty-state">No gold loans found for {loanFilterDate || 'selected criteria'}.</td></tr>
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
                            <div className="avatar-circle" style={{ background: `hsl(${(i * 54) % 360}, 50%, 40%)` }}>
                              {user.name?.charAt(0)}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700 }}>{user.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="aadhaar-text">
                          <Fingerprint size={14} style={{ color: '#475569' }} /> {user.aadhaarNo}
                        </td>
                        <td className="date-text">
                          <Calendar size={14} /> {formatDate(user.verifiedAt)}
                        </td>
                        <td>{user.gender || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              className="new-app-btn"
                              onClick={() => navigate('/gold-loan/add', { state: { aadharData: user } })}
                              style={{ margin: '0', background: '#fffbeb', color: '#b45309', borderColor: '#fef3c7', padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              <UserPlus size={16} /> <span>Loan</span>
                            </button>
                            <button
                              className="new-app-btn"
                              onClick={() => openValuationModal(user)}
                              style={{ margin: '0', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', padding: '6px 12px', fontSize: '0.75rem' }}
                            >
                              <Download size={16} style={{ color: '#d97706' }} /> <span>Form</span>
                            </button>

                            {(user.valuationDoc || user.ValuationDoc) ? (
                              <button
                                className="new-app-btn"
                                onClick={() => viewValuationDoc(user.valuationDoc || user.ValuationDoc, user.id)}
                                style={{ margin: '0', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe', padding: '6px 12px', fontSize: '0.75rem' }}
                              >
                                <Eye size={16} /> <span>View</span>
                              </button>
                            ) : (
                              <label
                                className="new-app-btn"
                                style={{ margin: '0', background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5', padding: '6px 12px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FileUp size={16} /> <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleValuationUpload(user.id, e)}
                                />
                              </label>
                            )}
                          </div>
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
      {showValuationModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', width: '400px', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Valuation Form Option</h3>
            </div>
            <div style={{ padding: '24px 20px', color: '#334155', fontSize: '14px', lineHeight: '1.5' }}>
              <p style={{ marginBottom: '16px', fontWeight: 500 }}>Do you want to generate the Valuation Form WITH default ornament details or WITHOUT details?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => confirmValuationDownload(true)}
                  style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.background = '#2563eb'}
                >
                  <CheckCircle2 size={18} /> WITH Details
                </button>
                <button
                  onClick={() => confirmValuationDownload(false)}
                  style={{ width: '100%', padding: '10px', background: 'white', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#f0f7ff'}
                  onMouseOut={(e) => e.target.style.background = 'white'}
                >
                  WITHOUT Details
                </button>
                <button
                  onClick={() => setShowValuationModal(false)}
                  style={{ width: '100%', padding: '10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', transition: 'background 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                  onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDocViewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', width: '90%', height: '90%', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Eye size={20} style={{ color: '#2563eb' }} />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Technical Appraisal Document</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label style={{
                  background: '#fff7ed', color: '#ea580c', border: '1px solid #ffedd5',
                  padding: '8px 16px', borderRadius: '6px', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                  <RotateCw size={16} /> Re-upload
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      await handleValuationUpload(currentViewId, e);
                      setShowDocViewModal(false);
                    }}
                  />
                </label>
                <button
                  onClick={() => setShowDocViewModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
            <div style={{ flex: 1, background: '#f1f5f9', padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <iframe
                src={currentViewDoc}
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px', background: 'white' }}
                title="Document Viewer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
