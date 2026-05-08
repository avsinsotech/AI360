import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Users, CreditCard, AlertCircle, TrendingUp, Search, 
  ChevronRight, ArrowUpRight, ShieldAlert, FileText,
  Activity, Zap, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import './CibilModuleDashboard.css';

const CibilModuleDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/CibilAnalytics/portfolio-stats`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to load CIBIL analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return (
    <div className="cibil-module-wrapper">
      <div className="cmd-header">
        <div className="cmd-title-area">
          <div className="skeleton skeleton-title" style={{ width: '300px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '450px' }}></div>
        </div>
      </div>
      <div className="cmd-metrics">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton skeleton-card" style={{ height: '80px', flex: 1 }}></div>
        ))}
      </div>
      <div className="cmd-grid">
        <div className="skeleton skeleton-card" style={{ height: '350px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '350px' }}></div>
        <div className="skeleton" style={{ gridColumn: 'span 2', height: '400px', borderRadius: 'var(--radius-lg)' }}></div>
      </div>
    </div>
  );

  return (
    <div className="cibil-module-wrapper">
      <div className="cmd-header">
        <div className="cmd-title-area">
          <h1 className="cmd-title">CIBIL Module Dashboard</h1>
          <p className="cmd-subtitle">Aggregate credit risk analysis across your entire loan portfolio.</p>
        </div>
        <div className="cmd-actions">
           <button className="cmd-btn cmd-btn-outline" onClick={() => navigate('/admin/cibil-alerts')}><ShieldAlert size={18} /> Alert Config</button>
           <button className="cmd-btn cmd-btn-primary" onClick={() => navigate('/verification/cibil')}><Zap size={18} /> New Verification</button>
        </div>
      </div>

      <div className="cmd-metrics">
        <div className="cmd-m-card">
          <div className="cmd-m-icon blue"><Users size={20} /></div>
          <div className="cmd-m-info">
            <span className="cmd-m-label">Total Borrowers</span>
            <span className="cmd-m-value">{stats?.totalBorrowers}</span>
          </div>
        </div>
        <div className="cmd-m-card">
          <div className="cmd-m-icon green"><CreditCard size={20} /></div>
          <div className="cmd-m-info">
            <span className="cmd-m-label">Portfolio Exposure</span>
            <span className="cmd-m-value">₹ {(stats?.totalOutstanding / 100000).toFixed(1)}L</span>
          </div>
        </div>
        <div className="cmd-m-card">
          <div className="cmd-m-icon red"><AlertCircle size={20} /></div>
          <div className="cmd-m-info">
            <span className="cmd-m-label">High Risk Profiles</span>
            <span className="cmd-m-value">{stats?.highRiskCount}</span>
          </div>
        </div>
        <div className="cmd-m-card">
          <div className="cmd-m-icon gold"><TrendingUp size={20} /></div>
          <div className="cmd-m-info">
            <span className="cmd-m-label">Active Overdue Count</span>
            <span className="cmd-m-value">{stats?.overdueTotal}</span>
          </div>
        </div>
      </div>

      <div className="cmd-grid" style={{ minHeight: '600px' }}>
        {/* Score Distribution */}
        <div className="cmd-card">
          <div className="cmd-card-header">
            <h3 className="cmd-card-title">Credit Health Distribution</h3>
          </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats?.scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats?.scoreDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" iconSize={8} 
                  formatter={(value) => <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 600 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
        </div>

        {/* Verification Trend */}
        <div className="cmd-card">
          <div className="cmd-card-header">
            <h3 className="cmd-card-title">Verification Volume (6 Months)</h3>
          </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats?.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '6px', 
                    border: '1px solid #e2e8f0',
                    fontSize: '0.8rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="cmd-card cmd-span-2">
          <div className="cmd-card-header">
            <h3 className="cmd-card-title">Recent CIBIL Activities</h3>
            <button className="text-btn" onClick={() => navigate('/verification/cibil')}>View All <ChevronRight size={14} /></button>
          </div>
          <div className="cmd-table-container">
            <table className="cmd-table">
              <thead>
                <tr>
                  <th>Borrower</th>
                  <th>CIBIL Score</th>
                  <th>Activity Date</th>
                  <th>Risk Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentActivities?.map((act, i) => (
                  <tr key={i}>
                    <td className="font-bold">{act.borrower}</td>
                    <td>
                      <span className={`score-badge s-${act.score < 600 ? 'poor' : act.score < 700 ? 'fair' : 'good'}`}>
                        {act.score}
                      </span>
                    </td>
                    <td><Clock size={14} style={{ marginRight: '6px', opacity: 0.6 }} /> {new Date(act.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`risk-tag r-${act.status.toLowerCase()}`}>
                        {act.status}
                      </span>
                    </td>
                    <td>
                      <div className="cmd-table-actions">
                        <button className="cmd-btn cmd-btn-outline" onClick={() => navigate(`/cibil/dashboard/${act.pan}`)}>
                           View Report
                        </button>
                        <button className="cmd-btn cmd-btn-outline" onClick={() => navigate(`/cibil/dashboard/${act.pan}?print=true`)}>
                           <FileText size={14} /> Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CibilModuleDashboard;
