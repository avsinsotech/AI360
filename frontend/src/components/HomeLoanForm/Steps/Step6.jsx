import React from 'react';
import { TI, TA, Radio, CheckGroup } from '../SharedComponents';
import { t, ts, tOpt, T } from '../HomeLoanTranslations';

// Marathi baseline options (for storage)
const MR = (key) => T.opts[key]?.mr || [];

export default function Step6({ data, setData, errors, lang = "mr" }) {
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
    <div className="form-step-content" style={{ padding: '0 8px' }}>
      
      {/* ── Section 1: Collateral Property ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('colProperty', lang)}</div>
        </div>

        <div style={{ padding: '0 12px 8px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
             <div className="v-col pb-col1" style={{ flex: 1 }}>{fi('colHousingNaav', 'colHousingNaav')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colFlatNo', 'colFlatNo')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colManzala', 'colManzala')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colWing', 'colWing')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colPlotNo', 'colPlotNo')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colNagarSector', 'colNagarSector')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colRastyaNaav', 'colRastyaNaav')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colUpnagar', 'colUpnagar')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colJilha', 'colJilha')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colPinKod', 'colPinKod')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colHousingRegi', 'colHousingRegi')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colSabasadNo', 'colSabasadNo')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colSharesCert', 'colSharesCert')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colBhaagFrom', 'colBhaagFrom')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colBhaagTo', 'colBhaagTo')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colKshetrafal', 'colKshetrafal', 'number')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1.5 }}>
              <CheckGroup label={lang === 'en' ? 'Area Type' : 'क्षेत्रफळाचा प्रकार'} name="colKshetraType" options={tOpt('kshetraType', lang)} mrOptions={MR('kshetraType')} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colBandhamVarsh', 'colBandhamVarsh')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colSurveNo', 'colSurveNo')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colHissaNo', 'colHissaNo')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colGatNo', 'colGatNo')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colMunicipalNo', 'colMunicipalNo')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colShasaki', 'colShasaki', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colBazarBhav', 'colBazarBhav', 'number')}</div>
            <div className="v-col pb-col3 no-colon" style={{ flex: 1.5 }}>
               <Radio label={t('colOcMilale', lang)} name="colOcMilale" options={tOpt('yesNo', lang)} mrOptions={MR('yesNo')} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colOcDin', 'colOcDin', 'date')}</div>
            <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
               <Radio label={t('colDeedZale', lang)} name="colDeedZale" options={tOpt('yesNo', lang)} mrOptions={MR('yesNo')} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colDeedDin', 'colDeedDin', 'date')}</div>
          </div>

          <div style={{ margin: '12px 0 8px 0', padding: '4px 0', borderBottom: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>{lang === 'en' ? 'Boundaries' : 'चर्तुःसीमा'}</div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colPurvesi', 'colPurvesi')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('colPashchimesi', 'colPashchimesi')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('colDakshinesi', 'colDakshinesi')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('colUttaresi', 'colUttaresi')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}></div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Business Details ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('bizInfo', lang)}</div>
        </div>

        <div style={{ padding: '0 12px 0 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>{fi('busSwaarup', 'busSwaarup')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{fi('busFirmNaav', 'busFirmNaav')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>
               <CheckGroup label={t('busType', lang)} name="busType" options={tOpt('busType', lang)} mrOptions={MR('busType')} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>
               <CheckGroup label={t('busJageType', lang)} name="busJageType" options={tOpt('busJageType', lang)} mrOptions={MR('busJageType')} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('busKshetrafal', 'busKshetrafal', 'number')}</div>
            <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
               <CheckGroup label={t('busKshetraType', lang)} name="busKshetraType" options={tOpt('busKshetraType', lang)} mrOptions={MR('busKshetraType')} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('busSuruKelay', 'busSuruKelay', 'date')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1.5 }}>
               <Radio label={t('busParwane', lang)} name="busParwane" options={tOpt('yesNo', lang)} mrOptions={MR('yesNo')} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{data.busParwane === (lang === 'en' ? 'Yes' : 'होय') && fi('busParwaneDetails', 'busParwaneDetails')}</div>
            <div className="v-col pb-col3 no-colon" style={{ flex: 1.5 }}>
               <Radio label={t('busResidentStatus', lang)} name="busResidentStatus" options={tOpt('yesNo', lang)} mrOptions={MR('yesNo')} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>
              <TA label={t('busPatta', lang)} name="busPatta" data={data} setData={setData} rows={1} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('busPin', 'busPin')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('busTel', 'busTel')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('busEmail', 'busEmail')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('busPan', 'busPan')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('busGumasta', 'busGumasta')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('busVikrikar', 'busVikrikar')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('busVat', 'busVat')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('busServiceTax', 'busServiceTax')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('busOtherLicense', 'busOtherLicense')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('busAnubhav', 'busAnubhav', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('busEkunUtpanna', 'busEkunUtpanna', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('busKharcha', 'busKharcha', 'number')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '6px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('busNiwal', 'busNiwal', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 3 }}></div>
          </div>
        </div>

        {/* Regular Customers & Suppliers Split Pane */}
        <div style={{ display: 'flex', borderTop: '1px solid #fed7aa' }}>
           <div style={{ flex: 1, padding: '8px 12px', borderRight: '1px solid #fed7aa' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#4338ca', marginBottom: '8px', textTransform: 'uppercase' }}>{ts('regularCustomers', lang)}</div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('customer1Naav', 'customer1Naav')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '6px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('customer1Patta', 'customer1Patta')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('customer2Naav', 'customer2Naav')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('customer2Patta', 'customer2Patta')}</div></div>
           </div>
           <div style={{ flex: 1, padding: '8px 12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#4338ca', marginBottom: '8px', textTransform: 'uppercase' }}>{ts('suppliers', lang)}</div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('supplier1Naav', 'supplier1Naav')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '6px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('supplier1Patta', 'supplier1Patta')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('supplier2Naav', 'supplier2Naav')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{fi('supplier2Patta', 'supplier2Patta')}</div></div>
           </div>
        </div>
      </div>
    </div>
  );
}
