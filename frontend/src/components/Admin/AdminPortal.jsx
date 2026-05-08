import React, { useState, useEffect } from 'react';
import { Search, Building2, ShieldCheck, X, Loader2, ArrowRight, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';

export default function AdminPortal({ isOpen, onClose }) {
  const { user, switchSession, showToast } = useApp();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSwitching, setIsSwitching] = useState(null);

  useEffect(() => {
    if (isOpen && (user?.role === 'SUPER_ADMIN' || user?.impersonated === 'true' || user?.originalRole === 'SUPER_ADMIN')) {
      fetchClients();
    }
  }, [isOpen, user]);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/Client`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) {
        setClients(await resp.json());
      }
    } catch (err) {
      showToast('Error loading institutions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitch = async (clientCode) => {
    setIsSwitching(clientCode);
    try {
      const resp = await fetch(`${API_BASE_URL}/Auth/switch-client`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
        },
        body: JSON.stringify({ clientCode })
      });

      if (resp.ok) {
        const { token } = await resp.json();
        showToast(`Switching to ${clientCode}...`, 'success');
        setTimeout(() => {
            switchSession(token);
        }, 1000);
      } else {
        showToast('Failed to switch institution', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setIsSwitching(null);
    }
  };

  if (!isOpen) return null;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.clientCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-portal-overlay animate-fade-in" onClick={onClose}>
      <div className="admin-portal-modal" onClick={e => e.stopPropagation()}>
        <div className="portal-header">
          <div className="portal-title-wrap">
            <div className="portal-icon-bg"><ShieldCheck size={24} /></div>
            <div>
              <h2>SuperAdmin Portal</h2>
              <p>Institution Impersonation & Testing Environment</p>
            </div>
          </div>
          <button className="portal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="portal-search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by Institution Name or Client Code..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="portal-content">
          {isLoading ? (
            <div className="portal-client-list">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="client-item" style={{ cursor: 'default' }}>
                  <div className="client-info" style={{ width: '100%' }}>
                    <div className="skeleton skeleton-avatar" style={{ width: '40px', height: '40px' }}></div>
                    <div className="client-details" style={{ flex: 1 }}>
                      <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                      <div className="skeleton skeleton-text short" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="portal-client-list">
              <div 
                className={`client-item ${user?.clientCode === 'GLOBAL' ? 'active' : ''}`}
                onClick={() => handleSwitch('GLOBAL')}
              >
                <div className="client-info">
                  <div className="client-avatar system"><Globe size={20} /></div>
                  <div className="client-details">
                    <span className="client-name">AVS System Global</span>
                    <span className="client-code">GLOBAL (Owner)</span>
                  </div>
                </div>
                {isSwitching === 'GLOBAL' ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              </div>

              {filteredClients.map(client => (
                <div 
                  key={client.clientCode} 
                  className={`client-item ${user?.clientCode === client.clientCode ? 'active' : ''}`}
                  onClick={() => handleSwitch(client.clientCode)}
                >
                  <div className="client-info">
                    <div className="client-avatar"><Building2 size={20} /></div>
                    <div className="client-details">
                      <span className="client-name">{client.name}</span>
                      <span className="client-code">{client.clientCode}</span>
                    </div>
                  </div>
                  {isSwitching === client.clientCode ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                </div>
              ))}

              {filteredClients.length === 0 && !isLoading && (
                <div className="portal-empty">No institutions found matching your search.</div>
              )}
            </div>
          )}
        </div>

        <div className="portal-footer">
          <div className="user-indicator">
            <span className={`indicator-dot ${user?.Impersonated === 'true' ? 'impersonating' : 'active'}`}></span>
            {user?.Impersonated === 'true' ? (
              <span>Impersonating as <strong>{user?.role}</strong> (Original: SuperAdmin)</span>
            ) : (
              <span>Authenticated as <strong>{user?.name} (SuperAdmin)</strong></span>
            )}
          </div>
          <div className="portal-version">AVS Cloud v2.4.5</div>
        </div>
      </div>

      <style jsx>{`
        .admin-portal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 8, 20, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }

        .admin-portal-modal {
          background: #ffffff;
          width: 100%;
          max-width: 650px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          max-height: 85vh;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .portal-header {
          padding: 24px;
          background: linear-gradient(135deg, #0a1c5a 0%, #1a365d 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .portal-title-wrap {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .portal-icon-bg {
          width: 48px;
          height: 48px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
        }

        .portal-title-wrap h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }

        .portal-title-wrap p {
          margin: 4px 0 0;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .portal-close {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .portal-close:hover {
          background: #ef4444;
          transform: rotate(90deg);
        }

        .portal-search-bar {
          padding: 16px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
        }

        .portal-search-bar input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 1rem;
          color: #1e293b;
        }

        .portal-content {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          min-height: 300px;
        }

        .portal-client-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .client-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
        }

        .client-item:hover {
          background: #f1f5f9;
        }

        .client-item.active {
          background: #eff6ff;
          border-color: #bfdbfe;
        }

        .client-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .client-avatar {
          width: 40px;
          height: 40px;
          background: #e2e8f0;
          color: #475569;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .client-avatar.system {
          background: #dcfce7;
          color: #166534;
        }

        .client-details {
          display: flex;
          flex-direction: column;
        }

        .client-name {
          font-weight: 600;
          color: #1e293b;
          font-size: 0.95rem;
        }

        .client-code {
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
          background: #f1f5f9;
          padding: 1px 6px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 2px;
          width: fit-content;
        }

        .portal-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #64748b;
          gap: 12px;
        }

        .portal-empty {
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-style: italic;
        }

        .portal-footer {
          padding: 16px 24px;
          background: #1e293b;
          color: #94a3b8;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
        }

        .user-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .indicator-dot.active {
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }

        .indicator-dot.impersonating {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}
