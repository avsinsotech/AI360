import React from 'react';
import { TI, TA, Radio } from '../SharedComponents';
import { t, ts, tOpt, T } from '../HomeLoanTranslations';

const MR = (key) => T.opts[key]?.mr || [];

export default function Step7({ data, setData, errors, lang = "mr" }) {
  const fi = (labelKey, name, type = 'text', extra = {}) => (
    <TI
      label={t(labelKey, lang)}
      name={name}
      data={data}
      setData={setData}
      type={type}
      error={errors[name]}
      {...extra}
    />
  );

  const updateTable = (field, index, key, value) => {
    const updated = [...(data[field] || [])];
    updated[index] = { ...updated[index], [key]: value };
    setData(p => ({ ...p, [field]: updated }));
  };

  const hasLoan = data.vimKarj === 'होय' || data.vimKarj === 'Yes';

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>
      
      {/* ── Section 1: Life Insurance ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('lifeInsurance', lang)}</div>
        </div>

        <div style={{ padding: '0 12px 8px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('vimaNaav', 'vimaNaav')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('vimaPolicy', 'vimaPolicy')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('vimaFrom', 'vimaFrom', 'date')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('vimaTo', 'vimaTo', 'date')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('vimaRakkam', 'vimaRakkam', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('vimaHapta', 'vimaHapta', 'number')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>
              <TA label={t('vimaPatta', lang)} name="vimaPatta" data={data} setData={setData} rows={1} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1.5 }}>
               <Radio label={t('vimaHaptaType', lang)} name="vimaHaptaType" options={tOpt('vimaHaptaType', lang)} mrOptions={MR('vimaHaptaType')} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
               <Radio label={t('vimKarj', lang)} name="vimKarj" options={tOpt('yesNo', lang)} mrOptions={MR('yesNo')} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{hasLoan && fi('vimKarjBank', 'vimKarjBank')}</div>
          </div>
          {hasLoan && (
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('vimKarjRakkam', 'vimKarjRakkam', 'number')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('vimKarjDin', 'vimKarjDin', 'date')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('vimShillak', 'vimShillak', 'number')}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Income Tax / Professional Tax ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('incomeTax', lang)} / {ts('profTax', lang)}</div>
        </div>

        <div style={{ display: 'flex', gap: '12px', padding: '0 12px 12px 12px' }}>
          {/* Income Tax Side */}
          <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px' }}>
             <div className="v-form-row" style={{ marginBottom: '6px' }}>
                <div className="v-col" style={{ flex: 1 }}>{fi('panNo', 'panNo', 'text', { style: { minWidth: '100px'} })}</div>
                <div className="v-col" style={{ flex: 1 }}>{fi('taxSuru', 'taxSuru', 'text', { style: { minWidth: '100px'} })}</div>
             </div>
             <table className="tax-table">
                <thead>
                  <tr>
                    <th>{t('fyLabel', lang)}</th>
                    <th>{t('itAmtLabel', lang)}</th>
                    <th>{t('payDateLabel', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2].map(i => {
                    const row = (data.taxRows || [])[i] || { varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' };
                    return (
                      <tr key={i}>
                        <td style={{ padding: '2px 4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input style={{ width: '45px', textAlign: 'center' }} value={row.varshaFrom || ''} onChange={e => updateTable('taxRows', i, 'varshaFrom', e.target.value)} placeholder="YYYY" />
                            <span style={{ fontSize: '10px' }}>-</span>
                            <input style={{ width: '45px', textAlign: 'center' }} value={row.varshaTo || ''} onChange={e => updateTable('taxRows', i, 'varshaTo', e.target.value)} placeholder="YYYY" />
                          </div>
                        </td>
                        <td style={{ padding: '2px 4px' }}><input style={{ width: '100%' }} type="number" value={row.rakkam} onChange={e => updateTable('taxRows', i, 'rakkam', e.target.value)} /></td>
                        <td style={{ padding: '2px 4px' }}><input style={{ width: '100%' }} type="date" value={row.dinank} onChange={e => updateTable('taxRows', i, 'dinank', e.target.value)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>

          {/* Prof Tax Side */}
          <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px' }}>
             <div className="v-form-row" style={{ marginBottom: '6px' }}>
                <div className="v-col" style={{ flex: 1 }}>{fi('ptNo', 'ptNo', 'text', { style: { minWidth: '100px'} })}</div>
                <div className="v-col" style={{ flex: 1 }}>{fi('ptSuru', 'ptSuru', 'text', { style: { minWidth: '100px'} })}</div>
             </div>
             <table className="tax-table">
                <thead>
                  <tr>
                    <th>{t('fyLabel', lang)}</th>
                    <th>{t('ptAmtLabel', lang)}</th>
                    <th>{t('payDateLabel', lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2].map(i => {
                    const row = (data.ptRows || [])[i] || { varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' };
                    return (
                      <tr key={i}>
                        <td style={{ padding: '2px 4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input style={{ width: '45px', textAlign: 'center' }} value={row.varshaFrom || ''} onChange={e => updateTable('ptRows', i, 'varshaFrom', e.target.value)} placeholder="YYYY" />
                            <span style={{ fontSize: '10px' }}>-</span>
                            <input style={{ width: '45px', textAlign: 'center' }} value={row.varshaTo || ''} onChange={e => updateTable('ptRows', i, 'varshaTo', e.target.value)} placeholder="YYYY" />
                          </div>
                        </td>
                        <td style={{ padding: '2px 4px' }}><input style={{ width: '100%' }} type="number" value={row.rakkam} onChange={e => updateTable('ptRows', i, 'rakkam', e.target.value)} /></td>
                        <td style={{ padding: '2px 4px' }}><input style={{ width: '100%' }} type="date" value={row.dinank} onChange={e => updateTable('ptRows', i, 'dinank', e.target.value)} /></td>
                      </tr>
                    );
                  })}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* ── Section 3: Other Info ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('insuranceInfo', lang)} / {ts('otherInfo', lang)}</div>
        </div>
        <div style={{ padding: '0 12px 8px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
             <div className="v-col" style={{ flex: 1 }}><TA label={t('insuranceDetails', lang)} name="insuranceDetails" data={data} setData={setData} rows={1} /></div>
          </div>
          <div className="v-form-row">
             <div className="v-col" style={{ flex: 1 }}><TA label={t('otherDetails', lang)} name="otherDetails" data={data} setData={setData} rows={1} /></div>
          </div>
        </div>
      </div>

    </div>
  );
}
