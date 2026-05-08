import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Loader2 } from 'lucide-react';
import './KycAnalyticsWidget.css';
import API_BASE_URL from '../../config';

const DEFAULT_PIE_DATA = [
  { name: 'Verified', value: 0, color: '#10b981' },
  { name: 'Pending', value: 0, color: '#f59e0b' },
  { name: 'Failed', value: 0, color: '#ef4444' }
];

export default function KycAnalyticsWidget() {
  const [pieData, setPieData] = useState(DEFAULT_PIE_DATA);
  const [trendData, setTrendData] = useState([]);
  const [stats, setStats] = useState({ totalVerified: 0, averageTime: '0 mins', averageTrend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = sessionStorage.getItem('tushgpt_jwt');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/Analytics/kyc-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setPieData(data.pieData);
          setTrendData(data.trendData);
          setStats(data.stats);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="kyc-analytics-card animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
        <Loader2 className="animate-spin" size={24} color="#2563eb" />
      </div>
    );
  }

  return (
    <div className="kyc-analytics-card animate-fade-in">
      <h3 className="kyc-card-title">KYC Analytics Overview</h3>
      
      <div className="kyc-analytics-top">
        <div className="kyc-pie-container">
          <ResponsiveContainer width={80} height={80}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={35}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="kyc-legend-main">
          {pieData.map(item => (
            <div className="legend-item" key={item.name}>
              <div className="legend-dot" style={{ backgroundColor: item.color }}></div>
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <div className="kyc-stats-grid">
          <div className="k-stat">
            <span className="k-label">Total Verified</span>
            <span className="k-val">{stats.totalVerified}</span>
          </div>
          <div className="k-stat">
            <span className="k-label">Average Time</span>
            <span className="k-val">{stats.averageTime}</span>
          </div>
          <div className="k-stat">
            <span className="k-label">Average Trend</span>
            <span className="k-val">{stats.averageTrend}</span>
          </div>
        </div>
      </div>

      <div className="kyc-analytics-bottom">
        <div className="kyc-bottom-stats">
          <div className="k-stat">
            <span className="k-label">Total Verified</span>
            <span className="k-val-lg">{stats.totalVerified}</span>
          </div>
          <div className="k-stat">
            <span className="k-label">Average Time</span>
            <span className="k-val-lg">{stats.averageTime}</span>
          </div>
        </div>
        
        <div className="kyc-trend-chart">
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                labelStyle={{ display: 'none' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="kyc-trend-labels">
            {trendData.map(d => <span key={d.name}>{d.name}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}
