import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

/**
 * Standardized Master Layout for Print Modules
 * Uses react-to-print to render content in an isolated iframe,
 * eliminating blank-page issues caused by parent CSS constraints.
 */
const GoldLoanPrintMaster = ({ title, children, hideToolbar = false, onLanguageChange, currentLanguage = 'EN' }) => {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: title || 'Gold Loan Document',
  });

  return (
    <div className="print-master-layout">
      {/* ─── Non-Printing Standardized Header ─── */}
      {!hideToolbar && (
        <div className="no-print" style={{ 
        position: 'sticky', top: 0, 
        zIndex: 999, background: 'rgba(255,255,255,0.9)', 
        backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        width: '100%'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '8px 16px', borderRadius: '8px', background: '#f8fafc', 
              border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: 600,
              color: '#475569', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
            onMouseOut={(e) => e.target.style.background = '#f8fafc'}
          >
            <ArrowLeft size={18} /> Back
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onLanguageChange && (
            <div style={{ 
              display: 'flex', 
              background: '#f1f5f9', 
              padding: '4px', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginRight: '12px'
            }}>
              <button 
                onClick={() => onLanguageChange('EN')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: currentLanguage === 'EN' ? '#fff' : 'transparent',
                  color: currentLanguage === 'EN' ? '#2563eb' : '#64748b',
                  boxShadow: currentLanguage === 'EN' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                English
              </button>
              <button 
                onClick={() => onLanguageChange('MR')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: currentLanguage === 'MR' ? '#fff' : 'transparent',
                  color: currentLanguage === 'MR' ? '#2563eb' : '#64748b',
                  boxShadow: currentLanguage === 'MR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                मराठी
              </button>
            </div>
          )}

          <button 
            onClick={handlePrint} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 24px', borderRadius: '8px', background: '#2563eb', 
              color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, 
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Printer size={18} /> Print {title}
          </button>
        </div>
      </div>)}

      {/* ─── Document Content (wrapped with ref for react-to-print) ─── */}
      <div className="print-content-wrapper" ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default GoldLoanPrintMaster;
