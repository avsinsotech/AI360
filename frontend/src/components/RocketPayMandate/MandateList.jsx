import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listMandates, getDashboardMetrics } from '../../services/mandateApi'
import {
  RefreshCw, Plus, Eye, Loader2, AlertCircle,
  FileText, TrendingUp, TrendingDown, Users, User,
  Search, Download, Filter, PieChart as PieIcon
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell
} from 'recharts'
import './RocketPay.css'

const STATE_COLORS = {
  CREATED: '#3b82f6',
  ACCEPTED: '#8b5cf6',
  ACTIVATED: '#10b981',
  PAUSED: '#f59e0b',
  REVOKED: '#ef4444',
  DELETED: '#6b7280',
}

function StateBadge({ state }) {
  const color = STATE_COLORS[state] || '#94a3b8'
  return (
    <span style={{
      background: `${color}10`,
      color,
      border: `1px solid ${color}30`,
      borderRadius: '6px',
      padding: '2px 8px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.02em'
    }}>
      {state || '—'}
    </span>
  )
}

export default function MandateList() {
  const [mandates, setMandates] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('7days')

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const navigate = useNavigate()

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [mandatesData, metricsData] = await Promise.all([
        listMandates(),
        getDashboardMetrics(timeRange)
      ])
      setMandates(mandatesData)
      setMetrics(metricsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Reload just the metrics if the timeRange changes
  useEffect(() => {
    async function fetchChart() {
      setLoadingMetrics(true)
      try {
        const data = await getDashboardMetrics(timeRange)
        setMetrics(data)
      } finally {
        setLoadingMetrics(false)
      }
    }
    if (metrics) fetchChart()
  }, [timeRange])

  useEffect(() => { loadData() }, [])

  // ── Derived Data / Filtering ───────────────────────────────────────────────

  const filteredMandates = mandates.filter(m => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.payer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.payer?.mobileNumber || '').includes(searchTerm) ||
      (m.referenceId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || m.state === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Status Distribution for Pie Chart
  const pieData = Object.keys(STATE_COLORS).map(status => ({
    name: status,
    value: mandates.filter(m => m.state === status).length
  })).filter(d => d.value > 0);

  const COLORS = Object.values(STATE_COLORS);

  const handleExport = () => {
    if (filteredMandates.length === 0) return;
    const headers = ['ID', 'Payer Name', 'Mobile', 'Frequency', 'Amount', 'Date', 'Status'];
    const rows = filteredMandates.map(m => [
      m.id,
      m.payer?.name || 'Unknown',
      m.payer?.mobileNumber || '—',
      m.frequency || 'N/A',
      m.approvalAmount || 0,
      m.startDate || '—',
      m.state
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `mandate_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Calculate percentages safely to avoid infinity
  const monthTarget = metrics?.expectedThisMonth || 1;
  const monthPercent = metrics ? ((metrics.collectedLastMonth / monthTarget) * 100).toFixed(1) : 0;

  const todayTarget = metrics?.expectedToday || 1;
  const todayPercent = metrics ? ((metrics.collectedYesterday / todayTarget) * 100).toFixed(1) : 0;

  return (
    <div className="rp-container">
      {/* Header */}
      <div className="rp-header">
        <div className="rp-header-title">
          <h1>
            <FileText size={28} className="header-icon" />
            UPI AutoPay Management
          </h1>
          <p>Monitor and manage all customer payment authorizations with advanced analytics.</p>
        </div>
        <div className="rp-header-actions">
          <button onClick={handleExport} className="rp-btn rp-btn-ghost" disabled={filteredMandates.length === 0}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={loadData} className="rp-btn rp-btn-ghost" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => navigate('/rocketpay/mandates/create')} className="rp-btn rp-btn-primary">
            <Plus size={16} /> Create UPI AutoPay
          </button>
        </div>
      </div>

      {error && (
        <div className="rp-error-banner" style={{ margin: '0 0.5rem 1.5rem 0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <AlertCircle size={20} /> Unable to load mandates
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              {error.includes('Failed to fetch') ? 'Could not connect to the server. Please check if the backend is running or your internet connection.' : error}
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      {!loading && metrics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>

          {/* Metric Cards Row */}
          <div className="rp-dashboard-grid">
            <div className="rp-metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="metric-title">Expected Collection</span>
                <span style={{ background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>+{monthPercent}%</span>
              </div>
              <span className="metric-value">₹{metrics.totalExpectedCollection.toLocaleString('en-IN')}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--rp-slate-500)', marginTop: '0.5rem' }}>Expecting ₹{metrics.expectedThisMonth.toLocaleString('en-IN')} this month</div>
            </div>

            <div className="rp-metric-card">
              <span className="metric-title">Today's Forecast</span>
              <span className="metric-value">₹{metrics.expectedToday.toLocaleString('en-IN')}</span>
              <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.5rem' }}>Yesterday: ₹{metrics.collectedYesterday.toLocaleString('en-IN')}</div>
            </div>

            <div className="rp-metric-card">
              <span className="metric-title">Active Mandates</span>
              <span className="metric-value">{metrics.totalActiveMandates}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--rp-slate-500)', marginTop: '0.5rem' }}>Authorized and running plans</div>
            </div>

            <div className="rp-metric-card">
              <span className="metric-title">Total Customers</span>
              <span className="metric-value">{metrics.totalCustomers}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--rp-slate-500)', marginTop: '0.5rem' }}>Unique payer profiles</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="rp-dashboard-charts">
            {/* Performance Area Chart */}
            <div className="rp-chart-card">
              <div className="rp-chart-header">
                <div>
                  <div className="rp-chart-title">Collection Performance</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Revenue trends over time</div>
                </div>
                <div style={{ display: 'flex', background: 'var(--rp-slate-100)', borderRadius: '8px', padding: '2px' }}>
                  {['3months', '30days', '7days'].map(range => (
                    <button key={range} onClick={() => setTimeRange(range)} className="rp-tab" style={{ padding: '4px 12px', fontSize: '0.7rem' }}>
                      {range.replace('months', 'M').replace('days', 'D')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rp-chart-container">
                {loadingMetrics && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>}
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={metrics.chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0a1c5a" stopOpacity={0.3} /><stop offset="95%" stopColor="#0a1c5a" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#0a1c5a" strokeWidth={2} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution Pie Chart */}
            <div className="rp-chart-card">
              <div className="rp-chart-header">
                <div className="rp-chart-title">Status Distribution</div>
                <PieIcon size={16} style={{ color: '#0a1c5a' }} />
              </div>
              <div className="rp-chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATE_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '-20px' }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATE_COLORS[d.name] }} /> {d.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Row */}
      <div className="rp-filter-row">
        <div className="rp-search-wrap">
          <Search className="rp-search-icon" size={18} />
          <input
            type="text"
            className="rp-search-input"
            placeholder="Search by ID, Name, mobile or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rp-filter-group">
          <label className="rp-filter-label"><Filter size={14} /> Status</label>
          <select
            className="rp-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(STATE_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><Loader2 size={32} className="animate-spin" style={{ color: '#0a1c5a' }} /></div>
      ) : filteredMandates.length === 0 ? (
        <div className="rp-empty-state">
          <FileText size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
          <div className="text-lg font-semibold">No mandates found</div>
          <div className="text-sm">Try adjusting your search or filters.</div>
          <button className="rp-btn rp-btn-ghost mt-4" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>Clear All Filters</button>
        </div>
      ) : (
        <div className="rp-table-wrap">
          <table className="rp-table">
            <thead>
              <tr>
                <th>Mandate Identification</th>
                <th>Payer Information</th>
                <th>Frequency</th>
                <th>Cycle Value</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMandates.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="font-semibold mono text-xs mb-0.5" style={{ color: 'var(--accent-navy)' }}>{m.id}</div>
                    <div className="text-xs text-slate-500">Ref: {m.referenceId || 'N/A'}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-sm">{m.payer?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500 mono">{m.payer?.mobileNumber || '—'}</div>
                  </td>
                  <td><span className="rp-freq-badge">{m.frequency || 'N/A'}</span></td>
                  <td><div className="font-bold text-slate-900">₹{m.approvalAmount?.toLocaleString('en-IN') || '0'}</div></td>
                  <td><StateBadge state={m.deleted ? 'DELETED' : m.state} /></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="rp-btn rp-btn-ghost" style={{ padding: '6px 10px' }} onClick={() => navigate(`/rocketpay/mandates/${m.id}`)}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
