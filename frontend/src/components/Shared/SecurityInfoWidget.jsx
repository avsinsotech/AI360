import React from 'react';
import { ShieldCheck, Lock, Server, CheckCircle } from 'lucide-react';

export default function SecurityInfoWidget() {
  return (
    <div className="security-info-widget animate-fade-in" style={{ 
      background: 'var(--bg-modal)', 
      borderRadius: '12px', 
      padding: '1rem', 
      border: '1px solid var(--border-color)',
      marginTop: 'auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem'
    }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
          <Lock size={18} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>256-Bit Encryption</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>End-to-end encrypted secured data transmission</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
          <ShieldCheck size={18} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>100% Compliant</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Meets all RBI & Govt standard compliance rules</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
          <Server size={18} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Data Retention</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>We do not store PII on our localized servers</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <div style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '8px', borderRadius: '8px', flexShrink: 0 }}>
          <CheckCircle size={18} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Real-Time Verification</h4>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>Direct ultra-fast API integration protocols</p>
        </div>
      </div>
    </div>
  );
}
