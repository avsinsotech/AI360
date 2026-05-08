import React from 'react';
import { TI, TA, Radio, CheckGroup } from '../SharedComponents';
import { t, ts, tOpt, T } from '../HomeLoanTranslations';

// Marathi baseline options (for storage)
const MR = (key) => T.opts[key]?.mr || [];

export default function Step5({ data, setData, errors, lang = "mr" }) {
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

  const L = (mr, en) => lang === 'mr' ? mr : en;

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>
      <div className="hl-property-tabs" style={{ marginBottom: '8px' }}>
        <button
          className={`hl-prop-tab ${data.propertyType === 'resale' ? 'active' : ''}`}
          onClick={() => setData(p => ({ ...p, propertyType: 'resale' }))}
        >
          {lang === 'en' ? 'A) Resale Purchase' : 'अ) रिसेल खरेदी'}
        </button>
        <button
          className={`hl-prop-tab ${data.propertyType === 'construction' ? 'active' : ''}`}
          onClick={() => setData(p => ({ ...p, propertyType: 'construction' }))}
        >
          {lang === 'en' ? 'B) Under Construction' : 'ब) बांधकाम सुरू'}
        </button>
      </div>

      {data.propertyType === 'resale' ? (
        <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
            <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('sellerProperty', lang)}</div>
          </div>
          
          <div style={{ padding: '0 12px 8px 12px' }}>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('vikretaNaav', 'vikretaNaav')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('vikretaVay', 'vikretaVay', 'number')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('housingNaav', 'housingNaav')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>
                <TA label={t('milkatPatta', lang)} name="milkatPatta" data={data} setData={setData} rows={1} />
              </div>
            </div>

            <div style={{ margin: '12px 0 8px 0', padding: '4px 0', borderBottom: '1px solid #fecaca', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>{ts('propDesc', lang)}</div>
            
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('flatNo', 'flatNo')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('manzala', 'manzala')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('wing', 'wing')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('plotNo', 'plotNo')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('nagarSector', 'nagarSector')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('rastyaNaav', 'rastyaNaav')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('upnagar', 'upnagar')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('jilha', 'jilha')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('pinKodProp', 'pinKod')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('housingRegi', 'housingRegi')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('sabasadNo', 'sabasadNo')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('sharesCert', 'sharesCert')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('bhaagFrom', 'bhaagFrom')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('bhaagTo', 'bhaagTo')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('kshetrafal', 'kshetrafal', 'number')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>
                <CheckGroup
                  label={lang === 'en' ? 'Area Type' : 'क्षेत्रफळाचा प्रकार'}
                  name="kshetraType"
                  options={tOpt('kshetraType', lang)}
                  mrOptions={MR('kshetraType')}
                  data={data}
                  setData={setData}
                />
              </div>
            </div>

            <div style={{ margin: '12px 0 8px 0', padding: '4px 0', borderBottom: '1px solid #fecaca', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>{ts('borders', lang)}</div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('purvesi', 'purvesi')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('pashchimesi', 'pashchimesi')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('dakshinesi', 'dakshinesi')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('uttaresi', 'uttaresi')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}></div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
            </div>

            <div style={{ margin: '12px 0 8px 0', padding: '4px 0', borderBottom: '1px solid #fecaca', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>{ts('buildingRec', lang)}</div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('bandhamVarsh', 'bandhamVarsh')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('surveNo', 'surveNo')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('hissaNo', 'hissaNo')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('gatNo', 'gatNo')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('municipalNo', 'municipalNo')}</div>
              <div className="v-col pb-col3 no-colon" style={{ flex: 1.5 }}>
                 <Radio label={t('ocMilale', lang)} name="ocMilale" options={tOpt('ocMilale', lang)} mrOptions={MR('ocMilale')} data={data} setData={setData} />
              </div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('ocDin', 'ocDin', 'date')}</div>
              <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
                 <Radio label={t('deedZale', lang)} name="deedZale" options={tOpt('deedZale', lang)} mrOptions={MR('deedZale')} data={data} setData={setData} />
              </div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('deedDin', 'deedDin', 'date')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('ekunKharedi', 'ekunKharedi', 'number')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('dilelRakkam', 'dilelRakkam', 'number')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('deneBaki', 'deneBaki', 'number')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('taranMahiti', 'taranMahiti')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('shasaki', 'shasaki', 'number')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('bazarBhav', 'bazarBhav', 'number')}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
            <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{ts('constInfo', lang)}</div>
          </div>
          <div style={{ padding: '0 12px 8px 12px' }}>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('firmNaav', 'firmNaav')}</div>
                <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
                   <Radio label={lang === 'en' ? 'Plan Approved?' : 'प्लॅन मंजूर का?'} name="planManjur" options={tOpt('planManjur', lang)} mrOptions={MR('planManjur')} data={data} setData={setData} />
                </div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('bandhamSwaarup', 'bandhamSwaarup')}</div>
             </div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('constKshetrafal', 'constKshetrafal', 'number')}</div>
                <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
                   <CheckGroup
                    label={lang === 'en' ? 'Area Type' : 'क्षेत्रफळाचा प्रकार'}
                    name="constKshetraType"
                    options={tOpt('kshetraType', lang)}
                    mrOptions={MR('kshetraType')}
                    data={data}
                    setData={setData}
                  />
                </div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
             </div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
               <div className="v-col pb-col1" style={{ flex: 1 }}>
                 <TA label={t('tarnPatta', lang)} name="tarnPatta" data={data} setData={setData} rows={1} />
               </div>
             </div>

             <div style={{ margin: '12px 0 8px 0', padding: '4px 0', borderBottom: '1px solid #fecaca', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>{ts('constBorders', lang)}</div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('purvesi', 'constPurvesi')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('pashchimesi', 'constPashchimesi')}</div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('dakshinesi', 'constDakshinesi')}</div>
             </div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('uttaresi', 'constUttaresi')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}></div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
             </div>

             <div style={{ margin: '12px 0 8px 0', padding: '4px 0', borderBottom: '1px solid #fecaca', fontSize: '12px', fontWeight: 800, color: '#991b1b' }}>{ts('constRecords', lang)}</div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('constPlotNo', 'constPlotNo')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('constSurveNo', 'constSurveNo')}</div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('constGatNo', 'constGatNo')}</div>
             </div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('constHissaNo', 'constHissaNo')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('constMunicipal', 'constMunicipalNo')}</div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('agreementDin', 'agreementDin', 'date')}</div>
             </div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('stampDuty', 'stampDuty', 'number')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('regRakkam', 'regRakkam', 'number')}</div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}>{fi('constEkun', 'constEkunKharedi', 'number')}</div>
             </div>
             <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{fi('constDilel', 'constDilelRakkam', 'number')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{fi('constDene', 'constDeneBaki', 'number')}</div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
