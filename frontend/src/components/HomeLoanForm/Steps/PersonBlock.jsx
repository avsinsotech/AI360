import React from 'react';
import { TI, TA, Radio, CheckGroup, PhotoUpload } from '../SharedComponents';

export function PersonBlock({ prefix, data, setData, title, errors = {}, lang = "mr" }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI
      label={L(mr, en)}
      name={prefix + name}
      data={data}
      setData={setData}
      type={type}
      error={errors[prefix + name]}
      {...extra}
    />;

  const jageOpts = lang === 'mr'
    ? ['स्वःमालकीचे', 'वडिलोपार्जित', 'पागडीची', 'कंपनी क्वार्टर्स', 'भाडेतत्त्वावर']
    : ['Self-owned', 'Ancestral', 'Pagadi', 'Company Qtrs', 'Rented'];

  const mrJageOpts = ['स्वःमालकीचे', 'वडिलोपार्जित', 'पागडीची', 'कंपनी क्वार्टर्स', 'भाडेतत्त्वावर'];

  const maritalOpts = lang === 'mr' ? ['विवाहित', 'अविवाहित'] : ['Married', 'Unmarried'];
  const mrMaritalOpts = ['विवाहित', 'अविवाहित'];

  const incomeOpts = lang === 'mr' ? ['मासिक', 'वार्षिक'] : ['Monthly', 'Yearly'];
  const mrIncomeOpts = ['मासिक', 'वार्षिक'];

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>

      {/* ── Section 1: Personal Info ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div className="section-bar" style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{title} — {L('वैयक्तिक माहिती', 'Personal Information')}</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '8px', rowGap: '2px', padding: '0 4px' }}>
          {/* Row 1 */}
          <div className="v-col">{ti('संपूर्ण नाव', 'Full Name', 'Naav', 'text')}</div>
          <div className="v-col">{ti('वय', 'Age', 'Vay', 'number')}</div>
          {/* Col 3, Row 1-3 : Photo */}
          <div style={{ gridColumn: '3', gridRow: '1 / span 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhotoUpload label={L('फोटो', 'Photo')} name={prefix + 'Photo'} data={data} setData={setData} />
          </div>

          {/* Row 2 */}
          <div className="v-col">{ti('सभासद क्रमांक', 'Member No.', 'SabasadNo', 'text', { short: true })}</div>
          <div className="v-col">{ti('भाग (शेअर्स) संख्या', 'Shares Count', 'Shares', 'number')}</div>

          {/* Row 3 */}
          <div className="v-col">{ti('शेअर्स रक्कम ₹', 'Shares Amount ₹', 'SharesRakkam', 'text')}</div>
          <div className="v-col">{ti('वडील/पतीचे नाव', "Father/Husband's Name", 'VadilNaav')}</div>

          {/* Row 4 — Photo span ends */}
          <div className="v-col">{ti('वय', 'Age', 'VadilVay', 'number')}</div>
          <div className="v-col">{ti('आईचे नाव', "Mother's Name", 'AaiNaav')}</div>
          <div className="v-col">{ti('वय', 'Age', 'AaiVay', 'number')}</div>

          {/* Row 5 */}
          <div className="v-col">{ti('पिन कोड', 'Pin Code', 'PinKod', 'text', { short: true })}</div>
          <div className="v-col">{ti('दूरध्वनी', 'Telephone', 'Durdhvani')}</div>
          <div className="v-col">{ti('ई मेल', 'Email', 'Email')}</div>

          {/* Row 6 */}
          <div className="v-col">{ti('मोबाईल', 'Mobile', 'Mobile', 'text', { short: true })}</div>
          <div className="v-col">{ti('अवलंबून व्यक्ती', 'Dependents', 'Avalambun', 'text')}</div>
          <div className="v-col no-colon">
              <Radio label={L('वैवाहिक स्थिती', 'Marital Status')} name={prefix + 'Vaivahik'} options={maritalOpts} mrOptions={mrMaritalOpts} data={data} setData={setData} />
          </div>

          {/* Row 7 */}
          <div className="v-col">{ti('सध्याच्या जागेत राहत असल्याचा कालावधी (महिने)', 'Residence Duration (Months)', 'Kalavadhi_m', 'text')}</div>
          <div className="v-col">{ti('कालावधी (वर्षे)', 'Duration (Years)', 'Kalavadhi_v', 'text')}</div>
          <div className="v-col"></div>
        </div>

        {/* Full-width rows beneath the grid */}
        <div style={{ padding: '0 4px 8px 4px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <CheckGroup label={L('राहण्याच्या जागेचे स्वरूप', 'Property Type')} name={prefix + 'JageSwaarup'} options={jageOpts} mrOptions={mrJageOpts} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>
              <TA label={L('राहण्याचा पत्ता', 'Residential Address')} name={prefix + 'Patta'} data={data} setData={setData} rows={1} />
            </div>
          </div>
          {prefix === 'b' && (
            <>
              <div className="v-form-row">
                <div className="v-col" style={{ flex: 1 }}>
                  <TA label={L('ऑफिस पत्ता', 'Office Address')} name={prefix + 'OfficeAddress'} data={data} setData={setData} rows={1} />
                </div>
              </div>
              <div className="v-form-row">
                <div className="v-col" style={{ flex: 1 }}>
                  <TA label={L('गावचा पत्ता', 'Gavcha Address')} name={prefix + 'GavchaAddress'} data={data} setData={setData} rows={1} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Section 2: Job/Business Details ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div className="section-bar" style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('नोकरी/व्यवसायाचा तपशील', 'Job/Business Details')}</h3>
        </div>

        <div style={{ padding: '0 4px 4px 4px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1.5 }}>{ti('कंपनीचे नाव', 'Company Name', 'Company')}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('विभाग', 'Department', 'Vibhag')}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('हुद्दा', 'Designation', 'Hudda')}</div>
          </div>

          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1.5 }}>{ti('कर्मचारी कोड', 'Employee Code', 'EmpCode', 'text', { short: true })}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('पिन कोड', 'Pin Code', 'CompanyPin', 'text', { short: true })}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('दूरध्वनी', 'Telephone', 'CompanyTel')}</div>
          </div>

          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1.5 }}>{ti('मोबाईल', 'Mobile', 'CompanyMobile', 'text', { short: true })}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('ई मेल/वेबसाईट', 'Email/Website', 'CompanyEmail')}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('सेवानिवृत्ती दिनांक', 'Retirement Date', 'Seva', 'date')}</div>
          </div>

          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1.5 }}>{ti('नोकरी/व्यवसायाचा कालावधी (महिने)', 'Duration (Months)', 'Karj_m', 'text')}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('कालावधी (वर्षे)', 'Duration (Years)', 'Karj_v', 'text')}</div>
            <div className="v-col" style={{ flex: 1.5 }}></div>
          </div>

          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>
              <TA label={L('कंपनीचा पत्ता', 'Company Address')} name={prefix + 'CompanyPatta'} data={data} setData={setData} rows={1} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3 & 4: Income & Village side-by-side ── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', alignItems: 'stretch' }}>

        {/* ── Section 3: Income ── */}
        <div className="v-form-section" style={{ flex: 1, marginBottom: 0 }}>
          <div className="v-form-section-header">
            <div className="section-bar" style={{ width: '3px', height: '14px', background: '#10b981' }} />
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('उत्पन्नाचा तपशील', 'Income Details')}</h3>
          </div>

          <div style={{ padding: '0 4px 8px 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a1c5a', margin: '4px 0' }}>{L('१. नोकरदार असल्यास :', '1. If Salaried :')}</div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('एकूण मासिक वेतन ₹', 'Monthly Salary ₹', 'MonthlyVetan', 'text')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('एकूण कपात ₹', 'Total Deductions ₹', 'Kapat', 'text')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('निव्वळ वेतन ₹', 'Net Salary ₹', 'Niwal', 'text')}</div></div>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a1c5a', margin: '4px 0' }}>{L('२. व्यावसायिक असल्यास :', '2. If Professional :')}</div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('वार्षिक उत्पन्न ₹', 'Annual Income ₹', 'Vaarshik', 'text')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('एकूण खर्च ₹', 'Total Expenses ₹', 'Kharcha', 'text')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('निव्वळ वार्षिक उत्पन्न ₹', 'Net Annual Income ₹', 'NiwalVaarshik', 'text')}</div></div>

            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a1c5a', margin: '4px 0' }}>{L('३. संपूर्ण कुटुंबाचे निव्वळ उत्पन्न', '3. Total Net Family Income')}</div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('कुटुंब निव्वळ उत्पन्न ₹', 'Family Net ₹', 'Kutumb', 'text')}</div></div>
            <div className="v-form-row no-colon" style={{ marginTop: '0' }}>
              <div className="v-col" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#552e1e', width: '140px', textAlign: 'right', paddingRight: '6px' }}>{L('उत्पन्न कालावधी', 'Period')} :</label>
                  {incomeOpts.map((o, idx) => (
                    <label key={o} className="radio-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '500' }}>
                      <input type="radio" name={prefix + 'KutumbType'} checked={data[prefix + 'KutumbType'] === mrIncomeOpts[idx]} onChange={() => setData(p => ({ ...p, [prefix + 'KutumbType']: mrIncomeOpts[idx] }))} style={{ accentColor: 'var(--hl-navy)', cursor: 'pointer', width: '14px', height: '14px' }} />
                      {o}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Village Address ── */}
        <div className="v-form-section" style={{ flex: 1.2, marginBottom: 0 }}>
          <div className="v-form-section-header">
            <div className="section-bar" style={{ width: '3px', height: '14px', background: '#6366f1' }} />
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('घर/शेती व गावचा पत्ता', 'Village Address')}</h3>
          </div>

          <div style={{ padding: '0 4px 8px 4px' }}>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('घर/शेती मालकाचे नाव', 'Owner Name', 'ShetiNaav')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('नाते', 'Relation', 'ShetiNaate')}</div></div>

            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('मुक्काम', 'Village', 'GaavMukkam')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('पोस्ट', 'Post', 'GaavPost')}</div>
            </div>

            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('तालुका', 'Taluka', 'GaavTaluka')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('जिल्हा', 'District', 'GaavJilha')}</div>
            </div>

            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('राज्य', 'State', 'GaavRajya')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('पिन कोड', 'Pin Code', 'GaavPin', 'text', { short: true })}</div>
            </div>

            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('दूरध्वनी', 'Telephone', 'GaavDurdhvani')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('मोबाईल', 'Mobile', 'GaavMobile', 'text', { short: true })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Previous Loans ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div className="section-bar" style={{ width: '3px', height: '14px', background: '#f43f5e' }} />
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('मागील कर्जाचा तपशील', 'Previous Loan Details')}</h3>
        </div>

        <div style={{ padding: '0 4px 8px 4px' }}>
          <div className="v-form-row">
            <div className="v-col">{ti('कर्ज प्रकार', 'Loan Type', 'PurvKarjPrakar')}</div>
            <div className="v-col">{ti('खाते क्र.', 'A/C No.', 'PurvKhate', 'text', { short: true })}</div>
            <div className="v-col">{ti('रक्कम ₹', 'Amount ₹', 'PurvRakkam', 'text')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col">{ti('कर्ज घेतल्याचा दिनांक', 'Loan Date', 'PurvDin1', 'date')}</div>
            <div className="v-col">{ti('कर्ज परतफेडीचा दिनांक', 'Repayment Date', 'PurvDin2', 'date')}</div>
            <div className="v-col"></div>
          </div>
        </div>
      </div>

      {/* ── Section 6: As Guarantor ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div className="section-bar" style={{ width: '3px', height: '14px', background: '#f59e0b' }} />
          <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('जामिनदार असल्यास तपशील', 'As Guarantor Details')}</h3>
        </div>
        <div style={{ padding: '4px 12px 12px 12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'Jam94a', label: L('अ) कर्जदाराचे नाव', 'A) Borrower Name') },
              { key: 'Jam94b', label: L('ब) कर्जदाराचे नाव', 'B) Borrower Name') },
            ].map(item => (
              <div key={item.key} style={{ flex: 1, padding: '8px', background: '#fcfaf5', borderRadius: '6px', border: '1px solid #fcebb6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>{item.label}</div>
                <div className="v-form-row" style={{ padding: 0 }}><div className="v-col" style={{ flex: 1 }}>{ti('नाव', "Name", item.key + 'KarjdarNaav')}</div></div>
                <div className="v-form-row" style={{ padding: 0 }}>
                  <div className="v-col" style={{ flex: 1 }}>{ti('प्रकार', 'Type', item.key + 'Prakar')}</div>
                  <div className="v-col" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C', item.key + 'Khate', 'text', { short: true })}</div>
                </div>
                <div className="v-form-row" style={{ padding: 0 }}><div className="v-col" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount', item.key + 'Rakkam', 'text')}</div></div>
                <div className="v-form-row" style={{ padding: 0 }}>
                  <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक १', 'Date 1', item.key + 'Din1', 'date')}</div>
                  <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक २', 'Date 2', item.key + 'Din2', 'date')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 7 & 8 ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'stretch' }}>
        {/* Section 7: Family Loans */}
        <div className="v-form-section" style={{ flex: 1, marginBottom: 0 }}>
            <div className="v-form-section-header">
                <div className="section-bar" style={{ width: '3px', height: '14px', background: '#10b981' }} />
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('कुटुंब सदस्यांनी संस्थेकडून घेतलेल्या कर्जाचा तपशील', 'Family Member Loans')}</h3>
            </div>
            <div style={{ padding: '0 4px 8px 4px' }}>
                <div className="v-form-row" style={{ padding: 0 }}><div className="v-col" style={{ flex: 1 }}>{ti('नाव', 'Name', 'Kutumb95Naav')}</div></div>
                <div className="v-form-row" style={{ padding: 0 }}><div className="v-col" style={{ flex: 1 }}>{ti('प्रकार', 'Type', 'Kutumb95Prakar')}</div></div>
                <div className="v-form-row" style={{ padding: 0 }}>
                    <div className="v-col" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'Kutumb95Khate', 'text', { short: true })}</div>
                    <div className="v-col" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount', 'Kutumb95Rakkam', 'text')}</div>
                </div>
                <div className="v-form-row" style={{ padding: 0 }}>
                    <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक १', 'Date 1', 'Kutumb95Din1', 'date')}</div>
                    <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक २', 'Date 2', 'Kutumb95Din2', 'date')}</div>
                </div>
            </div>
        </div>

        {/* Section 8: Other Bank Loans */}
        <div className="v-form-section" style={{ flex: 1, marginBottom: 0 }}>
            <div className="v-form-section-header">
                <div className="section-bar" style={{ width: '3px', height: '14px', background: '#6366f1' }} />
                <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', margin: 0 }}>{L('इतर बँकांचे कर्ज', 'Other Bank Loans')}</h3>
            </div>
            <div style={{ padding: '0 4px 8px 4px' }}>
                <div className="v-form-row" style={{ padding: 0 }}>
                    <div className="v-col" style={{ flex: 1 }}>{ti('बँक नाव', 'Bank', 'Bank96Naav')}</div>
                    <div className="v-col" style={{ flex: 1 }}>{ti('शाखा', 'Branch', 'Bank96Shakha')}</div>
                </div>
                <div className="v-form-row" style={{ padding: 0 }}><div className="v-col" style={{ flex: 1 }}>{ti('प्रकार', 'Type', 'Bank96Prakar')}</div></div>
                <div className="v-form-row" style={{ padding: 0 }}>
                    <div className="v-col" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'Bank96Khate', 'text', { short: true })}</div>
                    <div className="v-col" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount', 'Bank96Rakkam', 'text')}</div>
                </div>
                <div className="v-form-row" style={{ padding: 0 }}>
                    <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक १', 'Date 1', 'Bank96Din1', 'date')}</div>
                    <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक २', 'Date 2', 'Bank96Din2', 'date')}</div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function EntryBlock({ prefix, data, setData, title, errors, lang }) {
  return <PersonBlock prefix={prefix} data={data} setData={setData} title={title} errors={errors} lang={lang} />;
}