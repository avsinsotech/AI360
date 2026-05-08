import React from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Fingerprint, Smartphone, Car, Plane, UserSquare, Building2, Briefcase } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './VerificationHub.css';

// Working Modules
import AadharVerification from '../AadharVerification/AadharVerification';
import CibilVerification from '../CibilVerification/CibilVerification';
import MobileVerification from '../MobileVerification/MobileVerification';
import PanVerification from './Mocks/PanVerification';

// Mock Modules (To be created)
import DlVerification from './Mocks/DlVerification';
import PassportVerification from './Mocks/PassportVerification';
import VoterIdVerification from './Mocks/VoterIdVerification';
import GstVerification from './Mocks/GstVerification';
import UdyamVerification from './Mocks/UdyamVerification';

const NAV_ITEMS = [
  {
    title: 'INDIVIDUAL VERIFICATION',
    items: [
      { id: 'aadhar', label: 'Aadhaar eKYC', icon: <ShieldCheck size={16} />, path: '/verification/aadhar' },
      { id: 'pan', label: 'PAN Verification', icon: <CreditCard size={16} />, path: '/verification/pan' },
      { id: 'cibil', label: 'CIBIL Score', icon: <Fingerprint size={16} />, path: '/verification/cibil' },
      { id: 'mobile', label: 'Mobile Verify', icon: <Smartphone size={16} />, path: '/verification/mobile' },
      { id: 'dl', label: 'Driving Licence', icon: <Car size={16} />, path: '/verification/dl' },
      { id: 'passport', label: 'Passport', icon: <Plane size={16} />, path: '/verification/passport' },
      { id: 'voter', label: 'Voter ID', icon: <UserSquare size={16} />, path: '/verification/voter-id' },
    ]
  },
  {
    title: 'LEGAL VERIFICATION',
    items: [
      { id: 'gst', label: 'GST Search', icon: <Building2 size={16} />, path: '/verification/gst' },
      { id: 'udyam', label: 'Udyam (MSME)', icon: <Briefcase size={16} />, path: '/verification/udyam' },
    ]
  }
];

export default function VerificationHub() {
  const { balance } = useApp();
  // Flatten groups for horizontal tabs
  const allTabs = NAV_ITEMS.flatMap(group => group.items);

  return (
    <div className="vh-root">
      {/* Top Professional Header */}
      <header className="vh-top-header">
        <div className="vh-header-left">
          <div className="vh-brand-icon">
            <ShieldCheck size={28} />
          </div>
          <div className="vh-brand-text">
            <h1>Verification Hub</h1>
            <p>Identity & Document Verification</p>
          </div>
        </div>
        
        <div className="vh-header-right">
          <nav className="vh-breadcrumbs">
            <span className="bc-item">Home</span>
            <span className="bc-sep">/</span>
            <span className="bc-item active">Verification</span>
          </nav>
          <div className="vh-credits-box">
            <span className="credits-label">Credits</span>
            <span className="credits-value">₹ {parseFloat(balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </header>

      {/* Horizontal Tab Navigation */}
      <nav className="vh-horizontal-nav">
        <div className="vh-tabs-container">
          {allTabs.map(item => (
            <NavLink 
              key={item.id} 
              to={item.path} 
              className={({ isActive }) => `vh-tab-item ${isActive ? 'active' : ''}`}
            >
              <span className="vh-tab-icon">
                {item.icon}
              </span>
              <span className="vh-tab-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="vh-main-content">
        <Routes>
          <Route path="/" element={<Navigate to="aadhar" replace />} />
          
          {/* Working Modules */}
          <Route path="aadhar" element={<AadharVerification embedded={true} />} />
          <Route path="cibil" element={<CibilVerification embedded={true} />} />
          <Route path="mobile" element={<MobileVerification embedded={true} />} />
          
          {/* Mocks */}
          <Route path="pan" element={<PanVerification />} />
          <Route path="dl" element={<DlVerification />} />
          <Route path="passport" element={<PassportVerification />} />
          <Route path="voter-id" element={<VoterIdVerification />} />
          <Route path="gst" element={<GstVerification />} />
          <Route path="udyam" element={<UdyamVerification />} />
        </Routes>
      </main>
    </div>
  );
}
