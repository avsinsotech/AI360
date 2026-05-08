import { useState, useEffect } from 'react';
import { Search, UserPlus, Loader2, ShieldCheck, User, Trash2 } from 'lucide-react';
import CustomerAccountForm from './CustomerAccountForm';
import API_BASE_URL from '../../config';
import './MembershipPage.css';

export default function MembershipPage() {
  const [history, setHistory] = useState([]);
  const [totalVerificationsCount, setTotalVerificationsCount] = useState(0);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'completed'
  const [isReportMode, setIsReportMode] = useState(false);
  const recordsPerPage = 10;

  // --- Helper Functions ---
  
  // Extract full Aadhaar from rawResponse (the saved API response has the unmasked number)
  const getFullAadhaar = (record) => {
    if (!record) return 'N/A';
    if (record.rawResponse) {
      try {
        const raw = JSON.parse(record.rawResponse);
        // Check our injected field first
        if (raw._fullAadhaar) return raw._fullAadhaar;
        const d = raw.data || raw;
        const fullNo = d.aadhaar_number || d.adharNo || d.aadhaar || d.AadhaarNo || '';
        if (fullNo && fullNo.length >= 12) return fullNo;
      } catch (e) { /* ignore */ }
      // Try to find adharNo=XXXX in the raw string
      const paramMatch = record.rawResponse.match(/adharNo["=:]\s*["']?(\d{12})/i);
      if (paramMatch) return paramMatch[1];
      // Last resort: find any 12-digit number
      const digitMatch = record.rawResponse.match(/\d{12}/);
      if (digitMatch) return digitMatch[0];
    }
    return record.aadhaarNo || 'N/A';
  };

  const getMembershipForAadhaar = (aadhaar, clientCode) => {
    if (!aadhaar || aadhaar === 'N/A') return null;
    const cleanAadhar = aadhaar.replace(/\s/g, '');
    return memberships.find(m => 
      (m.aadhaar || '').replace(/\s/g, '') === cleanAadhar && 
      ((m.client_code || m.clientCode) === clientCode || !clientCode)
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchHistory(), fetchMemberships()]);
    setLoading(false);
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/AadharProxy/history?t=${new Date().getTime()}`, {
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setTotalVerificationsCount(data?.length || 0);
        
        // Group by Aadhaar + ClientCode to prevent duplicates for same bank, 
        // but allow same person in different banks
        const uniqueMap = new Map();
        (data || []).forEach(record => {
          const cleanAadhar = (record.aadhaarNo || '').replace(/\s/g, '');
          const groupKey = `${cleanAadhar}_${record.clientCode || 'default'}`;
          
          if (!uniqueMap.has(groupKey)) {
            uniqueMap.set(groupKey, record);
          } else {
            const existing = uniqueMap.get(groupKey);
            if (new Date(record.verifiedAt) > new Date(existing.verifiedAt)) {
              uniqueMap.set(groupKey, record);
            }
          }
        });
        const sorted = Array.from(uniqueMap.values()).sort((a, b) => new Date(b.verifiedAt) - new Date(a.verifiedAt));
        setHistory(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      // setLoading(false); // Controlled by fetchData
    }
  };

  const fetchMemberships = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/membership?t=${new Date().getTime()}`, {
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (resp.ok) {
        const data = await resp.json();
        setMemberships(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch memberships:', err);
    }
  };

  const filteredHistory = history.filter(r => {
    const isCompleted = !!getMembershipForAadhaar(getFullAadhaar(r), r.clientCode);
    const matchesSearch = (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (r.aadhaarNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    return activeTab === 'registry' ? !isCompleted : isCompleted;
  });

  const registryCount = history.filter(r => !getMembershipForAadhaar(getFullAadhaar(r), r.clientCode)).length;
  const completedCount = history.filter(r => !!getMembershipForAadhaar(getFullAadhaar(r), r.clientCode)).length;

  const totalPages = Math.ceil(filteredHistory.length / recordsPerPage);
  const currentRecords = filteredHistory.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleCreateAccount = (record) => {
    // Build initialData from the verified Aadhaar record
    let address = record.address || '';
    let photo = record.photo || '';
    const aadhar = getFullAadhaar(record);

    // Try parsing rawResponse for richer data
    if (record.rawResponse) {
      try {
        const raw = JSON.parse(record.rawResponse);
        const d = raw.data || raw;
        
        // Extract address if missing
        if (!address) {
          const rawAddr = d.address || d.Address || d.fullAddress || '';
          if (typeof rawAddr === 'object' && rawAddr !== null) {
            const parts = [
              rawAddr.house, rawAddr.street, rawAddr.landmark,
              rawAddr.locality || rawAddr.loc || rawAddr.vtc,
              rawAddr.district || rawAddr.dist, rawAddr.state,
              rawAddr.pincode || rawAddr.pc || rawAddr.zip
            ].filter(v => v && String(v).trim() !== '');
            address = parts.join(', ');
          } else {
            address = String(rawAddr || '');
          }
        }

        // Extract photo if missing
        if (!photo) {
          const img = d.profile_image || d.photo || d.Photo || d.capturedPhoto || d.CapturedPhoto;
          if (img) {
            photo = img.startsWith('data:image') ? img : `data:image/jpeg;base64,${img}`;
          }
        }
      } catch (e) { /* ignore parse errors */ }
    }

    setSelectedRecord({
      name: record.name,
      fullName: record.name,
      aadhaarNo: aadhar,
      dob: record.dob,
      address: address,
      phone: record.mobileNo || record.phone || '',
      photo: photo,
      clientCode: record.clientCode
    });
    setIsReportMode(false);
  };

  const handleDownloadPdf = (record) => {
    const aadhar = getFullAadhaar(record);
    const membership = getMembershipForAadhaar(aadhar);
    if (membership) {
      setSelectedRecord(membership);
      setIsReportMode(true);
    }
  };

  const handleDeleteMembership = async (record) => {
    const aadhar = getFullAadhaar(record);
    const membership = getMembershipForAadhaar(aadhar);
    if (!membership) return;

    if (!window.confirm(`Are you sure you want to delete the membership for ${record.name}? This will remove the account from the database and make it available for registration again.`)) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/membership/${membership.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) {
        await fetchData();
      } else {
        const error = await resp.text();
        alert('Failed to delete membership: ' + error);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('An error occurred while deleting the membership.');
    }
  };

  // If a record is selected, show the CustomerAccountForm
  if (selectedRecord) {
    return (
      <CustomerAccountForm
        isOpen={true}
        onClose={() => { setSelectedRecord(null); setIsReportMode(false); }}
        initialData={selectedRecord}
        readOnlyAndShowReport={isReportMode}
        onAccountCreated={() => {
          setSelectedRecord(null);
          setIsReportMode(false);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="membership-page">
      {/* Header */}
      <div className="mp-header">
        <div className="mp-header-left">
          <div className="mp-icon-wrap">
            <UserPlus size={22} />
          </div>
          <div>
            <h2>Membership Registration</h2>
            <p>
              Select a verified Aadhaar record to create a new member account.
              {totalVerificationsCount > history.length && (
                <span className="mp-total-badge">
                  (Showing {history.length} unique of {totalVerificationsCount} attempts)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="mp-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name or Aadhaar..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Stats & Tabs */}
      <div className="mp-toolbar">
        <div className="mp-stats">
          {loading ? (
            <>
              <div className="skeleton skeleton-card" style={{ height: '70px', width: '160px' }}></div>
              <div className="skeleton skeleton-card" style={{ height: '70px', width: '160px' }}></div>
            </>
          ) : (
            <>
              <div className={`mp-stat-card ${activeTab === 'registry' ? 'active' : ''}`} onClick={() => setActiveTab('registry')}>
                <div className="mp-stat-main">
                  <span className="mp-stat-num">{registryCount}</span>
                  <div className="mp-stat-indicator registry"></div>
                </div>
                <span className="mp-stat-label">Verified Registry</span>
              </div>
              <div className={`mp-stat-card ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
                <div className="mp-stat-main">
                  <span className="mp-stat-num">{completedCount}</span>
                  <div className="mp-stat-indicator completed"></div>
                </div>
                <span className="mp-stat-label">Completed Memberships</span>
              </div>
            </>
          )}
        </div>

        <div className="mp-tabs">
          <button 
            className={`mp-tab-btn ${activeTab === 'registry' ? 'active' : ''}`}
            onClick={() => setActiveTab('registry')}
          >
            Pending Registration
          </button>
          <button 
            className={`mp-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Registered Members
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mp-table-card">
        {loading ? (
          <div className="mp-table-wrap">
            <table className="mp-table">
              <thead>
                <tr>
                  <th>#</th><th>Photo</th><th>Name</th><th>Aadhaar No.</th><th>DOB</th><th>Verified On</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(recordsPerPage)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7"><div className="skeleton skeleton-table-row" style={{ height: '48px', margin: '4px 0' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="mp-table-wrap">
              <table className="mp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Aadhaar No.</th>
                    <th>DOB</th>
                    <th>Verified On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? currentRecords.map((record, idx) => (
                    <tr key={record.id || idx}>
                      <td className="mp-td-num">{(currentPage - 1) * recordsPerPage + idx + 1}</td>
                      <td>
                        {record.photo ? (
                          <img src={record.photo} alt="" className="mp-photo" />
                        ) : (
                          <div className="mp-photo-placeholder"><User size={16} /></div>
                        )}
                      </td>
                      <td className="mp-td-name">{record.name || 'N/A'}</td>
                      <td><span className="mp-td-code">{getFullAadhaar(record)}</span></td>
                      <td>{record.dob || 'N/A'}</td>
                      <td className="mp-td-date">
                        {record.verifiedAt ? new Date(record.verifiedAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td>
                        {getMembershipForAadhaar(getFullAadhaar(record), record.clientCode) ? (
                          <div className="mp-actions">
                            <button className="mp-download-btn" onClick={() => handleDownloadPdf(record)}>
                              <ShieldCheck size={14} />
                              PDF
                            </button>
                            <button className="mp-delete-btn" title="Delete Membership" onClick={() => handleDeleteMembership(record)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <button className="mp-create-btn" onClick={() => handleCreateAccount(record)}>
                            <UserPlus size={14} />
                            Create Account
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="mp-no-data">
                        {searchTerm ? `No records matching "${searchTerm}"` : 'No verified Aadhaar records found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mp-pagination">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="mp-page-btns">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
