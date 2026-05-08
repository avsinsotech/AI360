import { useState, useEffect, lazy, Suspense, Fragment } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { Menu, Loader2, Bell, Search, User, Languages, ChevronDown } from 'lucide-react'
import { ToastContainer } from './components/Shared/Toast'
import logo from './assets/logo.png'
import HeaderSearch from './components/Shared/HeaderSearch'
import BusinessLoan from "./components/BusinessLoanForm/BusinessLoanForm";

// Lazy load components
const Sidebar = lazy(() => import('./components/Sidebar/Sidebar'))
const ChatWindow = lazy(() => import('./components/Chat/ChatWindow'))
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'))
const Login = lazy(() => import('./components/Auth/Login'))
const Signup = lazy(() => import('./components/Auth/Signup'))
const AvsSaarthiAi = lazy(() => import('./components/AvsSaarthiAi/AvsSaarthiAi'))
const SaarthiReport = lazy(() => import('./components/AvsSaarthiAi/SaarthiReport'))
const VerificationHub = lazy(() => import('./components/VerificationHub/VerificationHub'))
const MandateList = lazy(() => import('./components/RocketPayMandate/MandateList'))
const CreateMandate = lazy(() => import('./components/RocketPayMandate/CreateMandate'))
const MandateDetail = lazy(() => import('./components/RocketPayMandate/MandateDetail'))
const InstallmentList = lazy(() => import('./components/RocketPayInstallment/InstallmentList'))
const HomeLoanForm = lazy(() => import('./components/HomeLoanForm/HomeLoanForm'))
const HomeLoansList = lazy(() => import('./components/HomeLoanForm/HomeLoansList'))
const HomeLoanPrintOptions = lazy(() => import('./components/HomeLoanForm/HomeLoanPrintOptions'))
const HomeLoanPrint = lazy(() => import('./components/HomeLoanForm/HomeLoanPrint'))
const HomeLoanSanctionLetter = lazy(() => import('./components/HomeLoanForm/HomeLoanSanctionLetter'))
const PersonalLoanForm = lazy(() => import('./components/PersonalLoanForm/PersonalLoanForm'))
const PersonalLoansList = lazy(() => import('./components/PersonalLoanForm/PersonalLoansList'))
const PersonalLoanPrintOptions = lazy(() => import('./components/PersonalLoanForm/PersonalLoanPrintOptions'))
const PersonalLoanPrintPage = lazy(() => import('./components/PersonalLoanForm/PersonalLoanPrintPage'))
const PersonalLoanSanctionLetter = lazy(() => import('./components/PersonalLoanForm/PersonalLoanSanctionLetter'))
const PersonalLoanAgreement = lazy(() => import('./components/PersonalLoanForm/PersonalLoanAgreement'))
const BusinessLoansList = lazy(() => import('./components/BusinessLoanForm/BusinessLoansList'))
const BusinessLoanPrintOptions = lazy(() => import('./components/BusinessLoanForm/BusinessLoanPrintOptions'))
const BusinessLoanPrintPage = lazy(() => import('./components/BusinessLoanForm/BusinessLoanPrintPage'))
const VehicleLoan = lazy(() => import('./components/VehicleLoanForm/Vehicleloanform'))
const VehicleLoansList = lazy(() => import('./components/VehicleLoanForm/VehicleLoansList'))
const MembershipPage = lazy(() => import('./components/AadharVerification/MembershipPage'))
const Loans = lazy(() => import('./components/Loans/Loans'))
const DocumentManagement = lazy(() => import('./components/DocumentManagement/DocumentManagement'))
const GoldLoan = lazy(() => import('./components/GoldLoanForm/GoldLoanForm'))
const GoldLoansList = lazy(() => import('./components/GoldLoanForm/GoldLoansList'))
const GoldLoanPrintOptions = lazy(() => import('./components/GoldLoanForm/GoldLoanPrintOptions'))
const GoldLoanPrint = lazy(() => import('./components/GoldLoanForm/GoldLoanPrint'))
const GoldLoanSanctionLetter = lazy(() => import('./components/GoldLoanForm/GoldLoanSanctionLetter'))
const GoldLoanAppraisalNote = lazy(() => import('./components/GoldLoanForm/GoldLoanAppraisalNote'))
const GoldLoanClosureReceipt = lazy(() => import('./components/GoldLoanForm/GoldLoanClosureReceipt'))
const VehicleLoanPrintOptions = lazy(() => import('./components/VehicleLoanForm/VehicleLoanPrintOptions'))
const VehicleLoanPrint = lazy(() => import('./components/VehicleLoanForm/Vehicleloanprint'))
const VehicleLoanSanctionLetter = lazy(() => import('./components/VehicleLoanForm/VehicleLoanSanctionLetter'))
const ComingSoon = lazy(() => import('./components/Shared/ComingSoon'))

// Enterprise Admin Modules
const ClientSignup = lazy(() => import('./components/Admin/ClientSignup'))
const CreditManagement = lazy(() => import('./components/Admin/CreditManagement'))
const RateManagement = lazy(() => import('./components/Admin/RateManagement'))
const AuditLogs = lazy(() => import('./components/Admin/AuditLogs'))
const ManageUsers = lazy(() => import('./components/Admin/ManageUsers'))
const UserManagement = lazy(() => import('./components/UserManagement/UserManagement'))
const CibilDashboard = lazy(() => import('./components/CibilVerification/CibilDashboard'))
const CibilModuleDashboard = lazy(() => import('./components/CibilVerification/CibilModuleDashboard'))
const CibilAlerts = lazy(() => import('./components/CibilVerification/CibilAlerts'))
const LoanScrutiny = lazy(() => import('./components/LoanScrutiny/LoanScrutiny'))
const AdminPortal = lazy(() => import('./components/Admin/AdminPortal'))
const ProfileManagement = lazy(() => import('./components/Profile/ProfileManagement'))

const LoadingFallback = () => (
  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%' }}>
    <div className="skeleton skeleton-title" style={{ width: '30%' }}></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
    </div>
    <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)', marginTop: '20px' }}></div>
  </div>
);

// Map route paths to module IDs for sidebar active state
const routeToModule = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/chat': 'chat',
  '/saarthi': 'saarthi',
  '/saarthi/report': 'saarthi',
  '/ai-calling': 'ai_calling',
  '/business-target': 'legal',
  '/settings': 'settings',
  '/report': 'loans_main',
  '/loans': 'loans',
  '/home-loan': 'loans',
  '/personal-loan': 'loans',
  '/business-loan': 'loans',
  '/vehicle-loan': 'loans',
  '/gold-loan': 'loans',
  '/gold-loan-print': 'loans',
  '/gold-loan-application-print': 'loans',
  '/loan-scrutiny': 'saarthi',
  '/membership': 'membership',
  '/admin/rates': 'rate_mgmt',
  '/admin/users': 'user_mgmt',
  '/admin/audit': 'audit_logs',
  '/admin/credit': 'credit_mgmt',
  '/admin/cibil-alerts': 'cibil_alerts',
  '/cibil/dashboard': 'cibil_dash',
  '/rocketpay/mandates': 'rocketpay_mandates',
  '/document-management': 'doc_mgmt',
  '/profile': 'profile_mgmt',
  '/hr': 'hr'
}

// Auth & Role-based routing
const RoleProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const TranslationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'मराठी (Marathi)', code: 'mr' },
    { name: 'हिंदी (Hindi)', code: 'hi' }
  ];

  const changeLanguage = (lang) => {
    setIsOpen(false);

    const trigger = () => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang.code;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        select.dispatchEvent(new Event('input', { bubbles: true }));
        setCurrentLang(lang.name);
        return true;
      }
      return false;
    };

    // Try immediately, then retry if needed
    if (!trigger()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (trigger() || attempts >= 10) {
          clearInterval(interval);
          if (attempts >= 10) {
            alert('Language engine is taking longer than usual. Please refresh the page if it persists.');
          }
        }
      }, 500);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.translation-dropdown')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="translation-dropdown" style={{ position: 'relative', marginRight: '1rem' }}>
      <button
        className="premium-lang-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
      >
        <Languages size={16} />
        {currentLang}
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          className="lang-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '180px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            padding: '8px',
            zIndex: 1000,
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang)}
              style={{
                width: '100%',
                padding: '10px 14px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                borderRadius: '8px',
                color: '#334155',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: currentLang === lang.name ? '600' : '400'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#2563eb'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = currentLang === lang.name ? '#2563eb' : '#334155'; }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function AppInner({ onLogout }) {
  const { activeConversation, notifications, removeToast, theme, user, clientInfo, setSelectedReport } = useApp()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Derive activeModule from current route with improved prefix matching
  let activeModule = 'dashboard'
  if (location.pathname.startsWith('/verification')) {
    activeModule = 'verification'
  } else if (location.pathname.startsWith('/rocketpay/mandates')) {
    activeModule = 'rocketpay_mandates'
  } else if (location.pathname.startsWith('/saarthi')) {
    activeModule = 'saarthi'
  } else if (location.pathname.startsWith('/cibil/dashboard')) {
    activeModule = 'cibil_dash'
  } else if (location.pathname.startsWith('/document-management')) {
    activeModule = 'doc_mgmt'
  } else {
    activeModule = routeToModule[location.pathname] || 'dashboard'
  }

  // Calculate breadcrumbs
  const pathSegments = location.pathname.split('/').filter(x => x);
  const breadcrumbMap = {
    'saarthi': 'Scrutiny',
    'report': 'Report',
    'loans': 'Loans',
    'home-loan': 'Home Loan',
    'home-loan-print': 'Home Loan Print',
    'personal-loan': 'Personal Loan',
    'vehicle-loan': 'Vehicle Loan',
    'gold-loan': 'Gold Loan',
    'gold-loan-print': 'Gold Loan Print',
    'vehicle-loan-print': 'Vehicle Loan Print',
    'gold-loan-application-print': 'Application Print',
    'rocketpay': 'RocketPay',
    'mandates': 'Mandates',
    'create': 'Create',
    'installments': 'Installments',
    'admin': 'Admin',
    'signup': 'Signup',
    'credit': 'Credit Management',
    'rates': 'Rate Management',
    'audit': 'Audit Logs',
    'users': 'User Management',
    'cibil-alerts': 'CIBIL Alerts',
    'cibil': 'CIBIL Verification',
    'dashboard': 'Dashboard',
    'membership': 'Membership Verification',
    'document-management': 'Document Management',
    'profile': 'Profile Management'
  };

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark-theme' : ''}`}>
      <div className="main-layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <Sidebar
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
          activeModule={activeModule}
          onLogout={onLogout}
        />

        <div className="content-area">
          <header className="top-bar no-print">
            <div className="top-bar-left">
              <button
                className="mobile-menu-btn"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div className="brand-area">
                <span className="brand-logo">
                  AVS <span className="brand-accent">AI360</span>
                </span>

                {clientInfo && (
                  <>
                    <div className="header-separator"></div>
                    <div className="client-branding">
                      {clientInfo.logoUrl ? (
                        <img src={clientInfo.logoUrl} alt="Bank Logo" className="header-client-logo" />
                      ) : (
                        <div className="header-client-badge">
                          {clientInfo.name?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="client-header-name" data-tooltip={clientInfo.name}>
                        {clientInfo.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="top-bar-right">
              <HeaderSearch />
              <button className="icon-btn"><Bell size={18} /></button>
              <div className="user-profile">
                <div className="user-avatar">{((user?.role || 'U').slice(0, 2)).toUpperCase()}</div>
                <div className="user-info">
                  <span className="user-role" style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{user?.role?.replace('_', ' ') || 'Guest'}</span>
                </div>
              </div>
              <button className="logout-btn" onClick={onLogout}>Logout</button>
            </div>
          </header>

          {/* Master Page: Breadcrumbs */}
          {!location.pathname.includes('-print') && (
            <div className="master-breadcrumbs no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/" className="breadcrumb-link">Home</Link>
              {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const isLast = index === pathSegments.length - 1;
                const displayName = breadcrumbMap[segment] || decodeURIComponent(segment).replace(/-/g, ' ');

                // Filter out IDs (numeric or UUID-like)
                if (!isNaN(segment) || segment.length > 20) return null;

                return (
                  <Fragment key={path}>
                    <span className="breadcrumb-separator">&gt;</span>
                    {isLast ? (
                      <span className="active-crumb" style={{ textTransform: 'capitalize' }}>{displayName}</span>
                    ) : (
                      <Link
                        to={path}
                        className="breadcrumb-link"
                        style={{ textTransform: 'capitalize' }}
                        onClick={() => { if (segment === 'saarthi') setSelectedReport(null); }}
                      >
                        {displayName}
                      </Link>
                    )}
                  </Fragment>
                );
              })}
            </div>
            
            {/* Specific action for Document Management Detailed View */}
            {location.pathname.startsWith('/document-management/') && pathSegments.length > 1 && (
              <Link
                to="/document-management"
                className="breadcrumb-link hover-action-btn"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  background: '#f8fafc', 
                  border: '1px solid #cbd5e1', 
                  padding: '4px 12px', 
                  borderRadius: '6px', 
                  fontWeight: '600', 
                  color: '#334155', 
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
              >
                <span>&larr;</span> Back to Dashboard
              </Link>
            )}
          </div>
        )}

          {/* Master Page: Main Content Area */}
          <main className="master-main">
            <div className="master-content-wrapper">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/chat" element={<ChatWindow />} />
                  <Route path="/saarthi" element={<AvsSaarthiAi />} />
                  <Route path="/saarthi/report" element={<SaarthiReport />} />
                  <Route path="/home-loan" element={<HomeLoansList />} />
                  <Route path="/home-loan/add" element={<HomeLoanForm />} />
                  <Route path="/home-loan/:id" element={<HomeLoanForm />} />
                  <Route path="/home-loan-print" element={<HomeLoanPrintOptions />} />
                  <Route path="/home-loan-form-print/:id" element={<HomeLoanPrint />} />
                  <Route path="/home-loan-sanction-print/:id" element={<HomeLoanSanctionLetter />} />
                  <Route path="/personal-loan" element={<PersonalLoansList />} />
                  <Route path="/personal-loan/add" element={<PersonalLoanForm />} />
                  <Route path="/personal-loan/:id" element={<PersonalLoanForm />} />
                  <Route path="/personal-loan-print" element={<PersonalLoanPrintOptions />} />
                  <Route path="/personal-loan-application-print" element={<PersonalLoanPrintPage />} />
                  <Route path="/personal-loan-sanction-print/:id" element={<PersonalLoanSanctionLetter />} />
                  <Route path="/personal-loan-agreement-print/:id" element={<PersonalLoanAgreement />} />
                  <Route path="/vehicle-loan" element={<VehicleLoansList />} />
                  <Route path="/vehicle-loan/add" element={<VehicleLoan />} />
                  <Route path="/vehicle-loan/:id" element={<VehicleLoan />} />
                  <Route path="/vehicle-loan-print" element={<VehicleLoanPrintOptions />} />
                  <Route path="/vehicle-loan-form-print/:id" element={<VehicleLoanPrint />} />
                  <Route path="/vehicle-loan-sanction-print/:id" element={<VehicleLoanSanctionLetter />} />
                  <Route path="/membership" element={<MembershipPage />} />
                  <Route path="/document-management" element={<DocumentManagement />} />
                  <Route path="/document-management/:applicationId" element={<DocumentManagement />} />
                  <Route path="/profile" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN']}>
                      <ProfileManagement />
                    </RoleProtectedRoute>
                  } />


                  {/* Restricted Modules */}
                  <Route path="/verification/*" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <VerificationHub />
                    </RoleProtectedRoute>
                  } />

                  {/* UPI AutoPay Mandate V4 */}
                  <Route path="/rocketpay/mandates" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <MandateList />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/rocketpay/mandates/create" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <CreateMandate />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/rocketpay/mandates/:id" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <MandateDetail />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/rocketpay/mandates/:id/installments" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <InstallmentList />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/business-target" element={<ComingSoon />} />
                  <Route path="/ai-calling" element={<ComingSoon />} />
                  <Route path="/settings" element={<ComingSoon />} />
                  <Route path="/report" element={<ComingSoon />} />
                  
                  {/* New Loan Coming Soon Placeholders */}
                  <Route path="/education-loan" element={<ComingSoon />} />
                  <Route path="/agriculture-loan" element={<ComingSoon />} />
                  <Route path="/microfinance" element={<ComingSoon />} />
                  <Route path="/property-loan" element={<ComingSoon />} />
                  <Route path="/fd-loan" element={<ComingSoon />} />
                  <Route path="/emergency-loan" element={<ComingSoon />} />
                  <Route path="/od-loan" element={<ComingSoon />} />

                  <Route path="/audit" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'AUDITOR']}>
                      <AuditLogs />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/hr" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <ManageUsers />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/loans" element={<Loans />} />

                  {/* Enterprise Admin */}
                  <Route path="/admin/signup" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <ClientSignup />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/admin/credit" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'CLIENT', 'OPERATOR', 'AUDITOR', 'VIEWER']}>
                      <CreditManagement />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/admin/rates" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <RateManagement />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/admin/audit" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'AUDITOR']}>
                      <AuditLogs />
                    </RoleProtectedRoute>
                  } />
                  <Route path="/admin/users" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'CLIENT']}>
                      <UserManagement />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/admin/cibil-alerts" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR']}>
                      <CibilAlerts />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/cibil/dashboard/:pan" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <CibilDashboard />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/cibil/dashboard" element={
                    <RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'BANK_ADMIN', 'OPERATOR', 'CLIENT']}>
                      <CibilModuleDashboard />
                    </RoleProtectedRoute>
                  } />

                  <Route path="/business-loan" element={<BusinessLoansList />} />
                  <Route path="/business-loan/add" element={<BusinessLoan />} />
                  <Route path="/business-loan/:id" element={<BusinessLoan />} />
                  <Route path="/business-loan-print" element={<BusinessLoanPrintOptions />} />
                  <Route path="/business-loan-application-print" element={<BusinessLoanPrintPage />} />
                  <Route path="/gold-loan" element={<GoldLoansList />} />
                  <Route path="/gold-loan/add" element={<GoldLoan />} />
                  <Route path="/gold-loan/:id" element={<GoldLoan />} />
                  <Route path="/gold-loan-print" element={<GoldLoanPrintOptions />} />
                  <Route path="/gold-loan-application-print" element={<GoldLoanPrint />} />
                  <Route path="/gold-loan-sanction-print/:id" element={<GoldLoanSanctionLetter />} />
                  <Route path="/gold-loan-appraisal-print/:id" element={<GoldLoanAppraisalNote />} />
                  <Route path="/gold-loan-closure-print/:id" element={<GoldLoanClosureReceipt />} />
                  <Route path="/loan-scrutiny" element={<LoanScrutiny />} />
                  <Route path="/loan-scrutiny/:appId" element={<LoanScrutiny />} />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
          </main>

          {/* Master Page: Bottom Footer Bar */}
          <footer className="master-footer no-print">
            <div className="footer-left">Copyright &copy; 2025 AVS InSoTech Private Limited | AVS AI360 v1.0</div>
            <div className="footer-right">
              <span>Last Login: {user?.lastLogin || 'N/A'}</span> &nbsp;|&nbsp; <span>IP: {user?.clientIp || '127.0.0.1'}</span> &nbsp;|&nbsp; <a href="#">Support</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppAuthGuard />
      </AppProvider>
    </BrowserRouter>
  )
}

function AppAuthGuard() {
  const { user, login, logout, notifications, removeToast } = useApp()
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F10' && (user?.role === 'SUPER_ADMIN' || user?.impersonated === 'true' || user?.originalRole === 'SUPER_ADMIN')) {
        e.preventDefault();
        setIsAdminPortalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  return (
    <>
      {user ? (
        <AppInner onLogout={logout} />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Login onLoginSuccess={login} />} />
          </Routes>
        </Suspense>
      )}
      <ToastContainer notifications={notifications} removeToast={removeToast} />
      <Suspense fallback={null}>
        <AdminPortal isOpen={isAdminPortalOpen} onClose={() => setIsAdminPortalOpen(false)} />
      </Suspense>
    </>
  )
}
