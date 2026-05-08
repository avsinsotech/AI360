import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, ClipboardList, Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';

export default function PersonalLoanPrintOptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const rawData = location.state;
  const { showToast } = useApp();

  const [loanData, setLoanData] = useState(rawData);
  const [loading, setLoading] = useState(!rawData?.basic && rawData?.id);

  useEffect(() => {
    // If we only received an ID, fetch the full data
    if (rawData?.id && !rawData?.basic) {
      const fetchLoan = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/PersonalLoan/${rawData.id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
          });
          if (!res.ok) throw new Error('Failed to fetch personal loan application data');
          const finalData = await res.json();
          setLoanData(finalData);
        } catch (err) {
          showToast(err.message, 'error');
        } finally {
          setLoading(false);
        }
      };
      fetchLoan();
    } else {
      setLoading(false);
    }
  }, [rawData, showToast]);

  const options = [
    {
      id: 'app',
      label: 'Application Print',
      icon: <ClipboardList size={32} />,
      color: '#2563eb',
      desc: 'Generate and print the full loan application form'
    },
    {
      id: 'sanction',
      label: 'Sanction Letter',
      icon: <FileText size={32} />,
      color: '#10b981',
      desc: 'Generate the official sanction letter for the borrower'
    },
    {
      id: 'agreement',
      label: 'Loan Agreement',
      icon: <FileText size={32} />,
      color: '#6366f1',
      desc: 'Generate the full legal personal loan agreement'
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Personal Loan Print Options</h1>
          <p style={{ color: '#64748b' }}>Select the specific document you wish to generate</p>
        </div>
        <button
          onClick={() => navigate('/personal-loan')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
            borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0',
            color: '#475569', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} /> Back to Loans
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: '1 / -1', flexDirection: 'column', gap: '15px' }}>
            <Loader2 className="spinner" size={32} style={{ color: '#2563eb' }} />
            <span style={{ fontSize: '1.1rem', color: '#475569', fontWeight: 500 }}>Loading application details...</span>
          </div>
        ) : options.map(opt => (
          <div
            key={opt.id}
            onClick={() => {
              if (!loanData) {
                showToast('Application data is missing', 'error');
                return;
              }

              if (opt.id === 'app') {
                navigate('/personal-loan-application-print', { state: loanData });
              } else if (opt.id === 'sanction') {
                navigate(`/personal-loan-sanction-print/${loanData.id}`, { state: loanData });
              } else if (opt.id === 'agreement') {
                navigate(`/personal-loan-agreement-print/${loanData.id}`, { state: loanData });
              } else {
                showToast(`${opt.label} is currently under development.`, 'info');
              }
            }}
            style={{
              background: 'white', padding: '32px 24px', borderRadius: '24px',
              border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.3s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.borderColor = opt.color;
              e.currentTarget.style.boxShadow = `0 20px 25px -5px ${opt.color}15`;
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: `${opt.color}15`, color: opt.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px'
            }}>
              {opt.icon}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>{opt.label}</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>{opt.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
