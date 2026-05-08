import React, { useState, useEffect } from 'react';
import { Save, Bell, ShieldAlert, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import './CibilModuleDashboard.css';

const CibilAlerts = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    scoreThreshold: 700,
    isPeriodicPullEnabled: false,
    notifyOnNewEnquiry: true,
    alertOnScoreDrop: true
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/CibilAlert`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data) setConfig(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/CibilAlert`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      if (resp.ok) {
        showToast('Success', 'Alert configuration saved successfully.', 'success');
      } else {
        showToast('Error', 'Failed to save configuration.', 'error');
      }
    } catch (err) {
      showToast('Error', 'Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="cibil-module-wrapper">
      <div className="cmd-header">
        <div className="skeleton skeleton-title" style={{ width: '250px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '400px' }}></div>
      </div>
      <div className="cmd-grid" style={{ gridTemplateColumns: '1fr 340px', gap: '20px' }}>
        <div className="skeleton skeleton-card" style={{ height: '400px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
      </div>
    </div>
  );

  return (
    <div className="cibil-module-wrapper">
      <div className="cmd-header">
        <div className="cmd-title-area">
          <Link to="/cibil/dashboard" className="back-link"><ArrowLeft size={18} /> Back to Dashboard</Link>
          <h1 className="cmd-title">CIBIL Alert Config</h1>
          <p className="cmd-subtitle">Manage risk thresholds and automated credit monitoring rules.</p>
        </div>
      </div>

      <div className="cmd-grid" style={{ gridTemplateColumns: '1fr 340px' }}>
        <div className="cmd-card">
          <div className="cmd-card-header">
            <h3 className="cmd-card-title"><ShieldAlert size={20} /> Monitoring Settings</h3>
          </div>
          
          <form onSubmit={handleSave} className="cmd-form">
            <div className="form-group-premium">
              <label>Minimum Score Threshold</label>
              <div className="input-with-sub">
                <input 
                  type="number" 
                  value={config.scoreThreshold}
                  onChange={e => setConfig({...config, scoreThreshold: parseInt(e.target.value)})}
                  min="300" max="900"
                  className="cmd-input"
                />
                <p className="input-help">Trigger alert if borrower score falls below this value.</p>
              </div>
            </div>

            <div className="cmd-toggle-grid">
              <div className="cmd-toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Periodic Auto-Pull</span>
                  <p className="toggle-desc">Automatically fetch fresh CIBIL reports every 30 days.</p>
                </div>
                <label className="cmd-switch">
                  <input 
                    type="checkbox" 
                    checked={config.isPeriodicPullEnabled}
                    onChange={e => setConfig({...config, isPeriodicPullEnabled: e.target.checked})}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="cmd-toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">New Enquiry Alerts</span>
                  <p className="toggle-desc">Notify whenever a hard enquiry is detected on a borrower.</p>
                </div>
                <label className="cmd-switch">
                  <input 
                    type="checkbox" 
                    checked={config.notifyOnNewEnquiry}
                    onChange={e => setConfig({...config, notifyOnNewEnquiry: e.target.checked})}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="cmd-toggle-item">
                <div className="toggle-info">
                  <span className="toggle-label">Score Drop Warning</span>
                  <p className="toggle-desc">Real-time alert for any negative score movement.</p>
                </div>
                <label className="cmd-switch">
                  <input 
                    type="checkbox" 
                    checked={config.alertOnScoreDrop}
                    onChange={e => setConfig({...config, alertOnScoreDrop: e.target.checked})}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="form-footer" style={{ marginTop: '2rem' }}>
              <button type="submit" className="cmd-btn cmd-btn-primary" disabled={saving}>
                {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>

        <div className="cmd-card cmd-side-card">
           <h3 className="cmd-card-title"><Bell size={18} /> Why use Alerts?</h3>
           <ul className="premium-list">
              <li><CheckCircle2 size={16} /> Proactive risk mitigation</li>
              <li><CheckCircle2 size={16} /> Automated portfolio monitoring</li>
              <li><CheckCircle2 size={16} /> Early warning for delinquencies</li>
              <li><CheckCircle2 size={16} /> Client-specific risk settings</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default CibilAlerts;
