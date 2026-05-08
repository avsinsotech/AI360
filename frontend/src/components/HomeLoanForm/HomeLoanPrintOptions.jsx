import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  FileText, 
  ChevronLeft, 
  ArrowRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function HomeLoanPrintOptions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const loanId = location.state?.id;

  if (!loanId) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No Application Selected</h2>
        <button onClick={() => navigate('/home-loan')}>Return to Dashboard</button>
      </div>
    );
  }

  const options = [
    {
      id: 'application',
      label: 'Application Print',
      icon: <FileText size={32} />,
      color: '#2563eb',
      desc: 'Print the complete home loan application with all technical details'
    },
    {
      id: 'sanction',
      label: 'Sanction Letter',
      icon: <ShieldCheck size={32} />,
      color: '#16a34a',
      desc: 'Generate the official sanction letter for the borrower'
    },
    {
      id: 'appraisal',
      label: 'Technical Appraisal',
      icon: <Printer size={32} />,
      color: '#f59e0b',
      desc: 'Generate the technical appraisal and legal valuation report'
    }
  ];

  const handleSelect = (id) => {
    switch(id) {
      case 'application':
        navigate(`/home-loan-form-print/${loanId}`);
        break;
      case 'sanction':
        navigate(`/home-loan-sanction-print/${loanId}`);
        break;
      case 'appraisal':
        showToast('Technical Appraisal module is in development', 'info');
        break;
      default:
        break;
    }
  };

  return (
    <div className="loans-module">
      <header className="loans-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => navigate('/home-loan')}
            style={{ 
              background: '#f8fafc', border: '1px solid #e2e8f0', 
              padding: '10px', borderRadius: '12px', cursor: 'pointer' 
            }}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="header-titles">
            <h1 className="header-title">Print Documents</h1>
            <p className="header-subtitle">Select the document type for Application #{loanId}</p>
          </div>
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {options.map((opt) => (
          <div 
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="print-opt-card"
          >
            <div style={{ 
              width: '64px', height: '64px', 
              borderRadius: '16px', 
              background: `${opt.color}10`, 
              color: opt.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {opt.icon}
            </div>
            
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>
                {opt.label}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>
                {opt.desc}
              </p>
            </div>

            <div style={{ 
              marginTop: 'auto', 
              display: 'flex', alignItems: 'center', gap: '8px', 
              color: opt.color, fontWeight: 600, fontSize: '14px' 
            }}>
              Generate Document <ArrowRight size={16} />
            </div>

            {/* Hover Decor */}
            <div style={{
              position: 'absolute', right: '-20px', top: '-20px',
              width: '100px', height: '100px',
              background: `${opt.color}05`,
              borderRadius: '50%',
              zIndex: 0
            }} />
          </div>
        ))}
      </div>

      <style>{`
        .print-opt-card:hover {
          transform: translateY(-8px);
          border-color: #2563eb !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .print-opt-card:active {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
