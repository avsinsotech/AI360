import React, { useRef } from 'react';

export function Field({ label, required, children, className }) {
  return (
    <div className={`field ${className || ''}`}>
      <label>{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
      {children}
    </div>
  );
}

export function TI({ label, name, data, setData, type = 'text', error, short, ...rest }) {
  const isShort = short || type === 'number' || type === 'date' || 
                 name.toLowerCase().includes('pin') || 
                 name.toLowerCase().includes('mobile') ||
                 name.toLowerCase().includes('email') ||
                 name.toLowerCase().includes('vay');

  return (
    <Field label={label} required={rest.required} className={isShort ? 'short-input' : ''}>
      <div className="field-control-wrapper">
        <input
          type={type}
          value={data[name] || ''}
          name={name}
          onChange={e => {
            if (rest.onChange) {
              rest.onChange(e);
            } else {
              setData(p => ({ ...p, [name]: e.target.value }));
            }
          }}
          style={error ? { borderColor: 'red' } : {}}
          {...rest}
        />
        {error && (
          <div className="error-tooltip">
            <div className="error-icon">!</div>
            <div className="error-text">{error}</div>
          </div>
        )}
      </div>
    </Field>
  );
}

export function TA({ label, name, data, setData, rows = 3, error, ...rest }) {
  return (
    <Field label={label} required={rest.required}>
      <div className="field-control-wrapper">
        <textarea
          rows={rows}
          value={data[name] || ''}
          onChange={e => setData(p => ({ ...p, [name]: e.target.value }))}
          style={error ? { borderColor: 'red' } : {}}
          {...rest}
        />
        {error && (
          <div className="error-tooltip" style={{ top: '100%', marginTop: 2 }}>
            <div className="error-icon">!</div>
            <div className="error-text">{error}</div>
          </div>
        )}
      </div>
    </Field>
  );
}

export function Radio({ label, name, options, data, setData, mrOptions }) {
  const storedVal = data[name] || '';
  const getChecked = (opt, idx) => {
    if (mrOptions && mrOptions.length > 0) {
      return storedVal === (mrOptions[idx] || opt);
    }
    return storedVal === opt;
  };

  const handleChange = (opt, idx) => {
    const storeVal = mrOptions ? (mrOptions[idx] || opt) : opt;
    setData(p => ({ ...p, [name]: storeVal }));
  };

  return (
    <Field label={label}>
      <div className="radio-row">
        {options.map((o, idx) => (
          <label key={o} className="radio-item">
            <input
              type="radio"
              name={name}
              value={o}
              checked={getChecked(o, idx)}
              onChange={() => handleChange(o, idx)}
            />
            {o}
          </label>
        ))}
      </div>
    </Field>
  );
}

export function CheckGroup({ label, name, options, data, setData, mrOptions }) {
  const vals = data[name] || [];
  const isChecked = (opt, idx) => {
    const storeOpt = mrOptions ? (mrOptions[idx] || opt) : opt;
    return vals.includes(storeOpt);
  };

  const handleChange = (opt, idx) => {
    const storeOpt = mrOptions ? (mrOptions[idx] || opt) : opt;
    setData(p => {
      const cur = p[name] || [];
      return { ...p, [name]: cur.includes(storeOpt) ? cur.filter(x => x !== storeOpt) : [...cur, storeOpt] };
    });
  };

  return (
    <Field label={label}>
      <div className="radio-row" style={{ flexWrap: 'wrap' }}>
        {options.map((o, idx) => (
          <label key={o} className="radio-item">
            <input
              type="checkbox"
              checked={isChecked(o, idx)}
              onChange={() => handleChange(o, idx)}
            />
            {o}
          </label>
        ))}
      </div>
    </Field>
  );
}

export function PhotoUpload({ label, name, data, setData }) {
  const ref = useRef();
  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setData(p => ({ ...p, [name]: ev.target.result }));
    reader.readAsDataURL(f);
  };
  return (
    <div className="photo-box" onClick={() => ref.current.click()}>
      {data[name] ? (
        <img src={data[name]} alt="photo" />
      ) : (
        <>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
          </svg>
          <span>{label === 'Photo' ? 'Upload Photo' : 'फोटो अपलोड करा'}</span>
        </>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

export function SectionHeader({ title, lang, setLang, showSwitcher = false }) {
  return (
    <div className="section-header" style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="section-bar" />
        <h3>{title}</h3>
      </div>
      {showSwitcher && setLang && (
        <div className="hl-lang-switcher" style={{ background: 'rgba(0,0,0,0.05)' }}>
          <button className={`hl-lang-btn ${lang === 'en' ? 'active' : ''}`} style={{ color: '#0e1a40' }} onClick={() => setLang('en')}>EN</button>
          <button className={`hl-lang-btn ${lang === 'mr' ? 'active' : ''}`} style={{ color: '#0e1a40' }} onClick={() => setLang('mr')}>मराठी</button>
        </div>
      )}
    </div>
  );
}