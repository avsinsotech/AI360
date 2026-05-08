import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
  RefreshCw, Download, ArrowLeft, Calendar, AlertTriangle,
  TrendingUp, FileText, Bell, Mail, MessageSquare, Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import CibilGauge from './CibilGauge';
import CibilPdfTemplate from './CibilPdfTemplate';
import html2pdf from 'html2pdf.js';
import html2canvas from 'html2canvas';
import './CibilDashboard.css';

const CibilDashboard = () => {
  const { pan } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [d, setD] = useState(null); // dashboard data
  const [trendData, setTrendData] = useState([]);
  const [alertConfig, setAlertConfig] = useState({
    scoreThreshold: 650,
    isPeriodicPullEnabled: true,
    notifyOnNewEnquiry: true,
    alertOnScoreDrop: true
  });
  const [activeReportData, setActiveReportData] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => { if (pan) fetchDashboard(); }, [pan]);
  useEffect(() => { fetchAlertConfig(); }, []);

  // Handle auto-print if coming from "Download" on Module Dashboard
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!loading && d && params.get('print') === 'true') {
      setTimeout(() => {
        handleDownloadPdf();
        // Clean URL after print logic starts
        window.history.replaceState({}, '', window.location.pathname);
      }, 1500);
    }
  }, [loading, d]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` };
      const historyResp = await fetch(`${API_BASE_URL}/CibilProxy/history?pageSize=500`, { headers });
      const data = await historyResp.json();
      const history = data.items || [];
      const userReports = history.filter(r => r.pan === pan);
      
      if (userReports.length > 0) {
        setD(userReports[0]);
        const trendResp = await fetch(`${API_BASE_URL}/CibilProxy/trend/${pan}`, { headers });
        const trend = await trendResp.json();
        setTrendData(trend.map(t => ({
          date: new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          score: parseInt(t.cibilScore),
          ts: new Date(t.createdAt).getTime(),
          fullDate: new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        })));
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to load credit dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePullFresh = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        fname: d.fName,
        phone: d.phone,
        pan: d.pan,
        dob: d.dob,
        address: d.address || 'N/A',
        pincode: d.pincode || '000000'
      });
      const resp = await fetch(`${API_BASE_URL}/CibilProxy/verify?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      
      if (resp.ok) {
        showToast('Success', 'Fresh CIBIL report pulled successfully.', 'success');
        await fetchDashboard();
      } else {
        const err = await resp.json();
        throw new Error(err.message || 'Bureau pull failed.');
      }
    } catch (err) {
      console.error(err);
      showToast('Bureau Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!d) return;

    let rawJsonStr = d.rawJsonResponse;

    if (!rawJsonStr) {
      setDownloadingId(d.id);
      try {
        showToast('Info', 'Fetching full report data...', 'info');
        const res = await fetch(`${API_BASE_URL}/CibilProxy/report/${d.id}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
        });
        if (res.ok) {
          const detail = await res.json();
          rawJsonStr = detail.rawJsonResponse;
        }
      } catch (e) {
        console.error("Failed to fetch detailed report", e);
      }
    }

    if (!rawJsonStr) {
      setDownloadingId(null);
      showToast('Error', 'Raw report data not found.', 'warning');
      return;
    }

    try {
      setDownloadingId(d.id);
      const rawData = typeof rawJsonStr === 'string' ? JSON.parse(rawJsonStr) : rawJsonStr;
      const reportDateStr = new Date(d.createdAt).toLocaleDateString('en-GB');
      setActiveReportData({ data: rawData, date: reportDateStr });

      setTimeout(async () => {
        const element = document.getElementById('cibil-pdf-template-dashboard');
        if (!element) {
          setDownloadingId(null);
          return;
        }

        const hiddenWrapper = element.parentElement;
        const origStyle = hiddenWrapper.style.cssText;
        hiddenWrapper.style.position = 'absolute';
        hiddenWrapper.style.left = '-9999px';
        hiddenWrapper.style.top = '0';
        hiddenWrapper.style.visibility = 'visible';

        let titleImgData = null;
        let titleImgRatio = 0;
        const titleEl = element.querySelector('.cibil-title-bar');
        if (titleEl) {
          const titleCanvas = await html2canvas(titleEl, { scale: 3, useCORS: true, backgroundColor: null });
          titleImgData = titleCanvas.toDataURL('image/png');
          titleImgRatio = titleCanvas.height / titleCanvas.width;
        }

        hiddenWrapper.style.cssText = origStyle;
        const filename = `CIBIL_Report_${d.pan}_${d.id}.pdf`;

        const opt = {
          margin: [0.8, 0.2, 0.2, 0.2],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).toPdf().get('pdf').then((pdf) => {
          const totalPages = pdf.internal.getNumberOfPages();
          const pageWidth = pdf.internal.pageSize.getWidth();

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setTextColor(0, 0, 0); pdf.setFontSize(8);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Print Date', 0.3, 0.2);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': ' + reportDateStr, 1.1, 0.2);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Report Name', 0.3, 0.35);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': Cibil Report', 1.1, 0.35);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Page No', pageWidth - 2.2, 0.35);
            pdf.setFont('helvetica', 'normal');
            pdf.text(': Page ' + i + ' of ' + totalPages, pageWidth - 1.6, 0.35);

            if (i > 1 && titleImgData) {
              const contentWidth = pageWidth - 0.4;
              const titleHeight = contentWidth * titleImgRatio;
              pdf.addImage(titleImgData, 'PNG', 0.2, 0.8 - titleHeight, contentWidth, titleHeight);
            }
          }
          pdf.save(filename);
          setDownloadingId(null);
          setActiveReportData(null);
        }).catch(() => {
          setDownloadingId(null);
          setActiveReportData(null);
        });
      }, 1500);
    } catch {
      setDownloadingId(null);
      showToast('Error', 'Failed to generate PDF report.', 'error');
    }
  };

  const fetchAlertConfig = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/CibilAlert`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
      });
      if (resp.ok) { const data = await resp.json(); if (data) setAlertConfig(data); }
    } catch {}
  };

  if (loading && !d) return (
    <div className="ci-wrapper">
      <div className="ci-header">
        <div className="ci-header-left">
          <div className="skeleton skeleton-title" style={{ width: '200px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '300px' }}></div>
        </div>
      </div>
      <div className="ci-grid ci-grid-3">
        <div className="skeleton skeleton-card" style={{ height: '350px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '350px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '350px' }}></div>
      </div>
      <div className="ci-grid ci-grid-3" style={{ marginTop: '20px' }}>
        <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
        <div className="skeleton skeleton-card" style={{ height: '300px' }}></div>
      </div>
    </div>
  );
  if (!d) return (
    <div className="ci-empty">
      <AlertTriangle size={48} />
      <h3>No Credit Data Found</h3>
      <p>No CIBIL reports found for PAN: {pan}</p>
      <Link to="/verification/cibil" className="ci-btn-fill">Pull New Report</Link>
    </div>
  );

  const score = parseInt(d.cibilScore) || 300;
  const scoreDate = new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const scoreLabel = score >= 750 ? 'Excellent' : score >= 700 ? 'Good' : score >= 600 ? 'Fair' : 'Poor';

  // Calculate real 3M change
  let scoreChange = 0;
  if (trendData.length > 1) {
    const latestScore = trendData[trendData.length - 1].score;
    // Find first record from ~3 months ago or the oldest one
    const threeMonthsAgoTs = Date.now() - (90 * 24 * 60 * 60 * 1000);
    const oldPoint = trendData.find(t => t.ts >= threeMonthsAgoTs) || trendData[0];
    scoreChange = latestScore - oldPoint.score;
  }

  // DPD data
  const dpdRows = [
    { bucket: 'Current', color: '#22c55e', accounts: d.openAccounts || 0, amount: d.totalOutstanding || '0' },
    { bucket: 'DPD 30', color: '#f59e0b', accounts: 0, amount: '0' },
    { bucket: 'DPD 60', color: '#f97316', accounts: 0, amount: '0' },
    { bucket: 'DPD 90+', color: '#ef4444', accounts: d.overdueCount || 0, amount: '0' }
  ];

  // Try parse DPD JSON if available
  try {
    if (d.dpdJson && d.dpdJson !== '[]') {
      const dpd = JSON.parse(d.dpdJson);
      if (Array.isArray(dpd)) {
        dpd.forEach(item => {
          const row = dpdRows.find(r => r.bucket.toLowerCase().includes(item.label?.toLowerCase()));
          if (row) { row.accounts = item.accounts || 0; row.amount = item.amount || '0'; }
        });
      }
    }
  } catch {}

  const totalAmt = dpdRows.reduce((s, r) => s + parseFloat(String(r.amount).replace(/,/g, '')) || 0, 0);

  return (
    <div className="ci-wrapper">
      {/* Header */}
      <div className="ci-header">
        <div className="ci-header-left">
          <Link to="/cibil/dashboard" className="ci-back"><ArrowLeft size={16} /> Back</Link>
          <h1 className="ci-title">CIBIL Intelligence</h1>
          <p className="ci-subtitle">Bureau credit monitoring — Last refreshed: {scoreDate}</p>
        </div>
        <div className="ci-header-right">
          <div className="ci-borrower-tag">
            <span className="ci-dot green"></span>
            {d.fName} · {d.pan}
          </div>
          <button className="ci-btn-outline" onClick={fetchDashboard}><RefreshCw size={15} /> Refresh Data</button>
          <button className="ci-btn-fill" onClick={handlePullFresh}><FileText size={15} /> Pull Fresh Report</button>
        </div>
      </div>

      {/* Row 1: Score | Trend | DPD */}
      <div className="ci-grid ci-grid-3">
        {/* Credit Score */}
        <div className="ci-card">
          <div className="ci-card-dot green"></div>
          <h3 className="ci-card-label">CREDIT SCORE</h3>
          <CibilGauge score={d.cibilScore} />
          <div className="ci-score-footer">
            <div className="ci-sf-item">
              <span className="ci-sf-val" style={{ color: scoreChange >= 0 ? '#22c55e' : '#ef4444' }}>
                {scoreChange >= 0 ? `+${scoreChange}` : scoreChange}
              </span>
              <span className="ci-sf-sub">3M CHANGE</span>
            </div>
            <div className="ci-sf-item">
              <span className="ci-sf-val">{new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <span className="ci-sf-sub">SCORE DATE</span>
            </div>
          </div>
          {score < (alertConfig.scoreThreshold || 650) && (
            <div className="ci-card-alert red">
              <AlertTriangle size={14} />
              <span>Below Threshold ({alertConfig.scoreThreshold})</span>
            </div>
          )}
        </div>

        {/* Historical Trend */}
        <div className="ci-card">
          <div className="ci-card-dot green"></div>
          <h3 className="ci-card-label">HISTORICAL SCORE TREND — LAST 12 MONTHS</h3>
          <div style={{ height: '200px', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[600, 900]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  labelKey="fullDate"
                  contentStyle={{ background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)' }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="ci-trend-summary">
            <span><b>{d.openAccounts || 0}</b> Open Accounts</span>

            <span className="ci-dot-sep">·</span>
            <span><b>{d.overdueCount || 0}</b> Overdue</span>
            <span className="ci-dot-sep">·</span>
            <span><b>{d.settledAccounts || 0}</b> Settled</span>
          </div>
          <div className="ci-trend-outstanding">
            ₹ {(parseFloat(String(d.totalOutstanding).replace(/,/g,'')) / 100000).toFixed(1)}L Total Outstanding
          </div>
        </div>

        {/* DPD Summary */}
        <div className="ci-card">
          <div className="ci-card-dot red"></div>
          <h3 className="ci-card-label">DPD SUMMARY</h3>
          <table className="ci-dpd-table">
            <thead>
              <tr>
                <th>BUCKET</th>
                <th>ACCOUNTS</th>
                <th>AMOUNT</th>
                <th>DISTRIBUTION</th>
              </tr>
            </thead>
            <tbody>
              {dpdRows.map((row, i) => {
                const pct = totalAmt > 0 ? (parseFloat(String(row.amount).replace(/,/g,'')) / totalAmt) * 100 : (i === 0 ? 100 : 0);
                return (
                  <tr key={i}>
                    <td><span className="ci-dpd-dot" style={{background: row.color}}></span> {row.bucket}</td>
                    <td className="ci-dpd-num">{row.accounts}</td>
                    <td>₹ {row.amount}</td>
                    <td>
                      <div className="ci-dpd-bar-bg">
                        <div className="ci-dpd-bar" style={{width: `${Math.max(pct, 0)}%`, background: row.color}}></div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="ci-dpd-worst">
            Worst DPD on record
            <span className="ci-dpd-worst-tag">DPD {d.overdueCount > 0 ? '90+' : '0'}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Enquiries | Report Fields | Alert Config */}
      <div className="ci-grid ci-grid-3">
        {/* Enquiries */}
        <div className="ci-card">
          <div className="ci-card-dot blue"></div>
          <h3 className="ci-card-label">ENQUIRIES — LAST 6 MONTHS</h3>
          <div className="ci-enq-grid">
            <div className="ci-enq-box">
              <span className="ci-enq-num">{d.hardEnquiries || 0}</span>
              <span className="ci-enq-name">Hard Enquiries</span>
              <span className="ci-enq-tag hard">HARD PULL</span>
            </div>
            <div className="ci-enq-box">
              <span className="ci-enq-num">{d.softEnquiries || 0}</span>
              <span className="ci-enq-name">Soft Enquiries</span>
              <span className="ci-enq-tag soft">SOFT PULL</span>
            </div>
          </div>
          {(d.hardEnquiries || 0) >= 3 && (
            <div className="ci-enq-alert">
              <AlertTriangle size={16} />
              <div>
                <strong>High Enquiry Alert</strong>
                <p>{d.hardEnquiries} hard enquiries detected in 6 months. Multiple applications may negatively impact score. Review lending activity.</p>
              </div>
            </div>
          )}
        </div>

        {/* CIBIL Report Fields */}
        <div className="ci-card">
          <div className="ci-card-dot navy"></div>
          <h3 className="ci-card-label">CIBIL REPORT FIELDS</h3>
          <div className="ci-fields-grid">
            <div className="ci-field">
              <span className="ci-field-label">CREDIT SCORE</span>
              <div className="ci-field-row">
                <span className="ci-field-val">{d.cibilScore}</span>
                <span className={`ci-field-badge ${scoreLabel.toLowerCase()}`}>{scoreLabel}</span>
              </div>
            </div>
            <div className="ci-field">
              <span className="ci-field-label">SCORE DATE</span>
              <span className="ci-field-val">{scoreDate}</span>
            </div>
            <div className="ci-field">
              <span className="ci-field-label">OPEN ACCOUNTS</span>
              <span className="ci-field-val">{d.openAccounts || 0}</span>
            </div>
            <div className="ci-field">
              <span className="ci-field-label">TOTAL OUTSTANDING</span>
              <span className="ci-field-val">₹ {d.totalOutstanding || '0'}</span>
            </div>
            <div className="ci-field">
              <span className="ci-field-label">SETTLED ACCOUNTS</span>
              <span className="ci-field-val">{d.settledAccounts || 0}</span>
            </div>
            <div className="ci-field">
              <span className="ci-field-label">HARD ENQUIRIES (6M)</span>
              <span className="ci-field-val">{d.hardEnquiries || 0}</span>
            </div>
          </div>
          <div className="ci-report-file">
            <span>CIBIL_Report_{d.pan}_{new Date(d.createdAt).toLocaleDateString('en-IN', {month:'short', year:'numeric'}).replace(' ','')}.pdf</span>
            <button className="ci-file-btn" onClick={handleDownloadPdf} disabled={!!downloadingId}>
              {downloadingId ? <RefreshCw size={13} className="spin" /> : <Download size={13} />}
              {downloadingId ? ' Generating...' : ' Download'}
            </button>
          </div>
        </div>


      </div>

      {/* Hidden PDF Template for generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
        <div id="cibil-pdf-template-dashboard">
          {activeReportData && (
            <CibilPdfTemplate
              data={activeReportData.data}
              reportDate={activeReportData.date}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CibilDashboard;
