import React from 'react';
import { TI, TA, Radio } from '../SharedComponents';
import { t, ts, tOpt } from '../HomeLoanTranslations';

const onesMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस', 'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस', 'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास', 'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर', 'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'];

const onesEn = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tensEn = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function numberToWordsMr(n) {
  if (!n || isNaN(n)) return '';
  n = parseInt(n, 10);
  if (n === 0) return 'शून्य';

  const convert = (num) => {
    let res = '';
    if (num >= 10000000) { res += convert(Math.floor(num / 10000000)) + ' कोटी '; num %= 10000000; }
    if (num >= 100000) { res += convert(Math.floor(num / 100000)) + ' लाख '; num %= 100000; }
    if (num >= 1000) { res += convert(Math.floor(num / 1000)) + ' हजार '; num %= 1000; }
    if (num >= 100) { res += onesMr[Math.floor(num / 100)] + 'शे '; num %= 100; }
    if (num > 0) res += onesMr[num] + ' ';
    return res.trim();
  };

  return convert(n) + ' रुपये फक्त';
}

export function numberToWordsEn(n) {
  if (!n || isNaN(n)) return '';
  n = parseInt(n, 10);
  if (n === 0) return 'Zero';
  const convert = (num) => {
    let res = '';
    if (num >= 10000000) { res += convert(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
    if (num >= 100000) { res += convert(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
    if (num >= 1000) { res += convert(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
    if (num >= 100) { res += onesEn[Math.floor(num / 100)] + ' Hundred '; num %= 100; }
    if (num > 0) {
      if (num < 20) res += onesEn[num];
      else { res += tensEn[Math.floor(num / 10)]; if (num % 10 > 0) res += ' ' + onesEn[num % 10]; }
    }
    return res.trim();
  };
  return convert(n) + ' Rupees Only';
}

export default function Step1({ data, setData, errors, lang = "mr", addGuarantor, removeGuarantor }) {
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

  return (
    <div className="form-step-content" style={{ padding: '2px 0' }}>
      
      {/* ── Section 1: Basic Info ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('basicInfo', lang)}</div>
        </div>
        
        <div style={{ padding: '0 12px 4px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col lbl-long" style={{ flex: 1.5}}>{fi('dinank', 'dinank', 'date')}</div>
            <div className="v-col lbl-short" style={{ flex: 1.5 }}>{fi('shakha', 'shakha', 'text', { short: true })}</div>
            <div className="v-col lbl-med" style={{ flex: 1.5 }}>{fi('saCra', 'saCra', 'text', { short: true })}</div>
          </div>
          
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col lbl-long" style={{ flex: 1.5 }}>{fi('karjKhate', 'karjKhate', 'text', { short: true })}</div>
            <div className="v-col lbl-short" style={{ flex: 1.5 }}>{fi('sabasad', 'sabasadNo', 'text', { short: true })}</div>
            <div className="v-col lbl-med" style={{ flex: 1.5 }}></div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Loan Details ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('loanDetails', lang)}</div>
        </div>
        
        <div style={{ padding: '0 12px 4px 12px' }}>
          {/* Row 1 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col lbl-long" style={{ flex: 1.5 }}>{fi('arjdarNaav', 'arjdarNaav')}</div>
            <div className="v-col lbl-short" style={{ flex: 1.5 }}>{fi('arjdarVay', 'arjdarVay', 'number')}</div>
            <div className="v-col lbl-med no-colon" style={{ flex: 1.5 }}>
              <Radio
                label={t('vaivahik', lang)}
                name="vaivahik"
                options={tOpt('vaivahik', lang)}
                mrOptions={tOpt('vaivahik', 'mr')}
                data={data}
                setData={setData}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col lbl-long" style={{ flex: 1.5 }}>{fi('coApplicant', 'saharjdarNaav')}</div>
            <div className="v-col lbl-short" style={{ flex: 1.5 }}>{fi('saharjdarVay', 'saharjdarVay', 'number')}</div>
            <div className="v-col lbl-med" style={{ flex: 1.5 }}>{fi('avalambuun', 'avalambuun', 'text')}</div>
          </div>

          {/* Row 3 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col lbl-long" style={{ flex: 1.5 }}>
              {fi('karjRakkam', 'karjRakkam', 'text', {
                onChange: (e) => {
                  const val = e.target.value;
                  const words = lang === 'mr' ? numberToWordsMr(val) : numberToWordsEn(val);
                  setData(p => ({ ...p, karjRakkam: val, akshari: words }));
                }
              })}
            </div>
            <div className="v-col lbl-short" style={{ flex: 1.5 }}>{fi('paratfed', 'paratfedKalavadhi', 'number')}</div>
            <div className="v-col lbl-med" style={{ flex: 1.5 }}>{fi('tarikh', 'tarikh', 'text')}</div>
          </div>

          {/* Row 4 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col lbl-long" style={{ flex: 1.5 }}>{fi('pahilaHapta', 'pahilaHapta', 'text')}</div>
            <div className="v-col lbl-short" style={{ flex: 1.5}}></div>
            <div className="v-col lbl-med" style={{ flex: 1.5 }}></div>
          </div>

          {/* Row 5 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col lbl-long" style={{ width: '100%', flex: '1 1 100%' }}>
              <TA label={t('karan', lang)} name="karan" data={data} setData={setData} rows={1} />
            </div>
          </div>

          {/* Row 6 */}
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col lbl-long" style={{ width: '100%', flex: '1 1 100%' }}>
              {fi('akshari', 'akshari', 'text', { readOnly: true, style: { background: '#f8f9fa' } })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Guarantors ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('guarantorInfo', lang)}</div>
        </div>
        
        <div style={{ padding: '0 12px 8px 12px' }}>
          {/* Guarantor 1 & 2: Side-by-side cards */}
          <div className="v-form-row" style={{ alignItems: 'stretch', gap: '8px', marginBottom: '4px' }}>
            
            {/* Box 1: Guarantor 1 */}
            <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', background: '#ffffff', padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', padding: '4px 8px', marginBottom: '4px' }}>
                १) {t('guarantor', lang)}
              </div>
              <div style={{ padding: '0 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                  {fi('naav', 'jameen1Naav')}
                </div>
                <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                  {fi('vay', 'jameen1Vay', 'number')}
                </div>
              </div>
            </div>

            {/* Box 2: Guarantor 2 */}
            <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', background: '#ffffff', padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', padding: '4px 8px', marginBottom: '4px' }}>
                २) {t('guarantor', lang)}
              </div>
              <div style={{ padding: '0 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                  {fi('naav', 'jameen2Naav')}
                </div>
                <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                  {fi('vay', 'jameen2Vay', 'number')}
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic Extra Guarantors (3+) */}
          {(data.extraGuarantors || []).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              {(data.extraGuarantors || []).map((g, idx) => (
                <div key={g.id} style={{ border: '1px solid #fed7aa', borderRadius: '4px', background: '#ffffff', padding: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{idx + 3}) {t('guarantor', lang)}</div>
                    <button 
                      type="button" 
                      onClick={() => removeGuarantor(g.id)} 
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                  <div style={{ padding: '0 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                      <TI 
                        label={t('naav', lang)} 
                        name="Naav" 
                        data={g} 
                        setData={(valFunc) => setData(p => ({ ...p, extraGuarantors: p.extraGuarantors.map(x => x.id === g.id ? valFunc(x) : x) }))} 
                      />
                    </div>
                    <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                      <TI 
                        label={t('vay', lang)} 
                        name="Vay" 
                        data={g} 
                        setData={(valFunc) => setData(p => ({ ...p, extraGuarantors: p.extraGuarantors.map(x => x.id === g.id ? valFunc(x) : x) }))} 
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Guarantor Button */}
          <button 
            type="button"
            onClick={addGuarantor}
            style={{ 
              marginTop: '8px', 
              background: '#ffffff', 
              border: '1.5px solid #2563eb', 
              color: '#2563eb', 
              fontWeight: 700, 
              cursor: 'pointer', 
              fontSize: '11px',
              padding: '6px 16px',
              borderRadius: '16px', // Slight pill shape as per standard dynamic add buttons
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <span style={{ fontSize: '13px', fontWeight: '800' }}>+ +</span> {ts('addGuarantor', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}