import React from 'react';
import { ArrowRight, ShieldCheck, FileCheck2 } from 'lucide-react';

export default function HowItWorksWidget() {
  return (
    <div className="how-it-works-widget animate-fade-in" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem 0.5rem',
      position: 'relative'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Verification Process</h4>
        <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Simple, secure, and instant</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '400px', gap: '8px' }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-modal)', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <FileCheck2 size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Input Data</span>
        </div>
        
        {/* Line 1 */}
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)', position: 'relative', top: '-12px' }}></div>

        {/* Step 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-modal)', border: '2px solid #3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)' }}>
            <ShieldCheck size={20} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)' }}>Secure Auth</span>
        </div>

        {/* Line 2 */}
        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, #cbd5e1 0%, #10b981 100%)', position: 'relative', top: '-12px' }}></div>

        {/* Step 3 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid #10b981', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>✓</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>Get Results</span>
        </div>
      </div>
    </div>
  );
}
