import React from 'react';

const CibilGauge = ({ score }) => {
  const numericScore = parseInt(score) || 300;
  const percentage = Math.min(Math.max(((numericScore - 300) / 600) * 100, 0), 100);

  const getColor = () => {
    if (numericScore >= 750) return { primary: '#22c55e', label: 'Excellent' };
    if (numericScore >= 700) return { primary: '#eab308', label: 'Good' };
    if (numericScore >= 600) return { primary: '#f97316', label: 'Fair' };
    return { primary: '#ef4444', label: 'Poor' };
  };

  const { primary, label } = getColor();

  // Semi-circle gauge using SVG arc
  const width = 200;
  const height = 130;
  const cx = 100;
  const cy = 110;
  const r = 85;
  const strokeWidth = 16;

  // Arc from 180° to 0° (left to right, semi-circle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalAngle = Math.PI;

  const describeArc = (startA, endA) => {
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy - r * Math.sin(startA); // Subtract to go UP
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy - r * Math.sin(endA); // Subtract to go UP
    const largeArc = Math.abs(endA - startA) > Math.PI ? 1 : 0;
    const sweep = endA > startA ? 0 : 1;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
  };

  const bgPath = describeArc(startAngle, endAngle);
  const progressAngle = startAngle - (percentage / 100) * totalAngle;
  const progressPath = describeArc(startAngle, progressAngle);

  // Needle position
  const needleAngle = startAngle - (percentage / 100) * totalAngle;
  const needleLen = r - 15;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle); // Subtract to go UP

  // Color stops for gradient
  const gradientStops = [
    { offset: '0%', color: '#ef4444' },
    { offset: '35%', color: '#f97316' },
    { offset: '60%', color: '#eab308' },
    { offset: '100%', color: '#22c55e' }
  ];

  const badgeColors = {
    Excellent: { bg: '#ecfdf5', text: '#15803d', border: '#d1fae5' },
    Good: { bg: '#fffbeb', text: '#a16207', border: '#fef3c7' },
    Fair: { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' },
    Poor: { bg: '#fef2f2', text: '#b91c1c', border: '#fee2e2' }
  };
  const b = badgeColors[label] || badgeColors.Poor;

  return (
    <div style={{ textAlign: 'center', padding: '15px 0', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>

        {/* Background arc */}
        <path d={bgPath} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Progress arc */}
        <path d={progressPath} fill="none" stroke="url(#gaugeGrad)" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill="#1e293b" />
        <circle cx={cx} cy={cy} r="1.5" fill="#fff" />

        {/* Score text */}
        <text x={cx} y={cy - 35} textAnchor="middle" fontSize="48" fontWeight="800" fill="#1e293b" fontFamily="var(--font-sans)">
          {numericScore}
        </text>
        <text x={cx} y={cy - 12} textAnchor="middle" fontSize="14" fontWeight="600" fill="#94a3b8" fontFamily="var(--font-sans)">
          300 — 900
        </text>
      </svg>

      <div style={{
        position: 'absolute', right: '5%', top: '40%',
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: b.bg, padding: '6px 16px', borderRadius: '30px',
        color: b.text, fontSize: '0.9rem', fontWeight: '800',
        border: `1px solid ${b.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 5
      }}>
        <span>✓</span> {label}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {[
          { label: 'Poor', range: '<600', color: '#ef4444' },
          { label: 'Fair', range: '600-700', color: '#f97316' },
          { label: 'Good', range: '700-750', color: '#eab308' },
          { label: 'Excellent', range: '>750', color: '#22c55e' }
        ].map((item, i) => (
          <div key={i} style={{
            minWidth: '65px', padding: '6px 4px', borderRadius: '6px',
            background: `${item.color}15`, border: `1px solid ${item.color}20`,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: item.color }}>{item.label}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>{item.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CibilGauge;
