import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import GoldLoanPrintMaster from '../GoldLoanForm/GoldLoanPrintMaster'; 
import PersonalLoanPrint from './PersonalLoanPrint';

export default function PersonalLoanPrintPage() {
  const { state } = useLocation();
  const { clientInfo, showToast } = useApp();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (state?.id) {
       fetch(`${API_BASE_URL}/PersonalLoan/${state.id}`, {
         headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
       })
       .then(res => res.json())
       .then(fetched => {
           // Parse fields correctly just like the form does
           const mapped = Object.fromEntries(
                Object.entries(fetched).map(([k, v]) => {
                    if (['bJageSwaarup', 'g1JageSwaarup', 'g2JageSwaarup'].includes(k) && typeof v === 'string') {
                        return [k, v.split(', ').filter(x => x)];
                    }
                    if (k === 'extraGuarantors') {
                        if (typeof v === 'string') {
                            try { return [k, JSON.parse(v)]; } catch { return [k, []]; }
                        }
                        return [k, Array.isArray(v) ? v : []];
                    }
                    return [k, v];
                })
            );
           setData(mapped);
           setIsLoading(false);
       })
       .catch(err => {
           console.error(err);
           showToast("Error loading document", "error");
           setIsLoading(false);
       });
    } else {
        setIsLoading(false);
    }
  }, [state, showToast]);

  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' }}>
              Loading document data...
          </div>
      );
  }

  if (!data) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#ef4444' }}>
              Document not found or invalid ID.
          </div>
      );
  }

  return (
     <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
       {/* Reusing the reliable PrintMaster wrapper from Gold Loan for identical standardized print UI */}
       <GoldLoanPrintMaster title="Personal Loan Application">
         <div className="print-wrapper shadow-lg printable-document-container" style={{ background: 'white', maxWidth: '210mm', margin: '0 auto' }}>
            <PersonalLoanPrint data={data} clientInfo={clientInfo} />
         </div>
       </GoldLoanPrintMaster>
     </div>
  );
}
