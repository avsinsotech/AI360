import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Construction, ArrowLeft, Cpu, Zap, ShieldCheck, BarChart3, Clock, Settings, FileText, RotateCcw } from 'lucide-react';
import './ComingSoon.css';

const MODULE_CONFIG = {
  'ai-calling': { label: 'AI Calling', icon: <Cpu size={40} />, features: ['Voice Synthesis', 'Automated Dialing', 'Natural Language Processing'] },
  'business-target': { label: 'Business Target', icon: <BarChart3 size={40} />, features: ['Goal Tracking', 'Performance Analytics', 'Revenue Forecasting'] },
  'minutes': { label: 'Minutes', icon: <Clock size={40} />, features: ['Meeting Transcription', 'Action Item Extraction', 'AI Summarization'] },
  'recovery': { label: 'Recovery', icon: <RotateCcw size={40} />, features: ['NPA Management', 'Debt Collection Workflow', 'Legal Action Tracking'] },
  'compliance': { label: 'Compliance', icon: <ShieldCheck size={40} />, features: ['Regulatory Auditing', 'KYC Verification', 'AML Screenings'] },
  'settings': { label: 'Settings', icon: <Settings size={40} />, features: ['System Configuration', 'User Permissions', 'API Keys'] },
  'report': { label: 'Reports', icon: <FileText size={40} />, features: ['Dynamic PDF Export', 'Financial Statements', 'Operational Insights'] },
};

export default function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Derive module ID from path
  const path = location.pathname.split('/').pop();
  const config = MODULE_CONFIG[path] || { 
    label: 'Module Under Development', 
    icon: <Construction size={40} />, 
    features: ['Real-time Updates', 'AI Integration', 'Premium UI'] 
  };

  return (
    <div className="coming-soon-container animate-fade-in">
      <div className="coming-soon-card">
        <div className="cs-module-badge">Project AVS AI360</div>
        
        <div className="cs-icon-wrapper">
          <div className="cs-glow"></div>
          {config.icon}
        </div>

        <h1>{config.label}</h1>
        
        <p>
          We're building something extraordinary for you. This module is currently under development 
          and will be integrated with our core AI infrastructure soon.
        </p>

        <div className="cs-features-preview">
          {config.features.map((feature, i) => (
            <div key={i} className="cs-feature-tag">
              <Zap size={14} style={{ color: '#f59e0b', marginRight: '6px' }} />
              {feature}
            </div>
          ))}
        </div>

        <button className="cs-btn-back" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="cs-footer">
          Estimated deployment: Q2 2026 | Build v2.4.5-Beta
        </div>
      </div>
    </div>
  );
}
