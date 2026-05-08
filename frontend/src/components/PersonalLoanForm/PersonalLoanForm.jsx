import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApp } from "../../context/AppContext";
import loanService from "../../services/loanService";
import './PersonalLoanForm.css';
import PersonalLoanPrint from "./PersonalLoanPrint";
import '../../i18n';

// ─── Number to Words ────────────────────────────────────────────────────────
const onesMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस', 'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस', 'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास', 'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर', 'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'];

function numberToWordsMr(n) {
    if (!n || isNaN(n)) return '';
    n = parseInt(n);
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

const onesEn = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tensEn = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numberToWordsEn(n) {
    if (!n || isNaN(n)) return '';
    n = parseInt(n);
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

const initState = {
    dinank: '', saCra: '', karjKhate: '', shakha: '',
    saharjdarNaav: '', saharjdarVay: '',
    karjRakkam: '', akshari: '',
    paratfedKalavadhi: '', pahilaHapta: '', tarikh: '',
    karan: '', vyajDar: '',
    vaivahik: 'विवाहित', avalambun: '',
    extraGuarantors: [],
    bPhoto: null, bNaav: '', bVay: '', bSabasadNo: '', bShares: '', bSharesRakkam: '', bVadilNaav: '', bVadilVay: '', bAaiNaav: '', bAaiVay: '', bPatta: '', bPinKod: '', bDurdhvani: '', bMobile: '', bEmail: '', bJageSwaarup: [], bKalavadhi_m: '', bKalavadhi_v: '', bVaivahik: 'विवाहित', bAvalambun: '', bEmpType: 'नोकरी', bCompany: '', bCompanyPatta: '', bCompanyPin: '', bCompanyTel: '', bCompanyMobile: '', bCompanyEmail: '', bVibhag: '', bHudda: '', bEmpCode: '', bKarj_m: '', bKarj_v: '', bSeva: '', bMonthlyVetan: '', bKapat: '', bNiwal: '', bVaarshik: '', bKharcha: '', bNiwalVaarshik: '', bKutumb: '', bKutumbType: 'मासिक', bShetiNaav: '', bShetiNaate: '', bGaavMukkam: '', bGaavPost: '', bGaavTaluka: '', bGaavJilha: '', bGaavRajya: '', bGaavPin: '', bGaavDurdhvani: '', bGaavMobile: '', bPurvKarjPrakar: '', bPurvKhate: '', bPurvRakkam: '', bPurvDin1: '', bPurvDin2: '', bJam94aKarjdarNaav: '', bJam94aPrakar: '', bJam94aKhate: '', bJam94aRakkam: '', bJam94aDin1: '', bJam94aDin2: '', bJam94bKarjdarNaav: '', bJam94bPrakar: '', bJam94bKhate: '', bJam94bRakkam: '', bJam94bDin1: '', bJam94bDin2: '', bKutumb95Naav: '', bKutumb95Prakar: '', bKutumb95Khate: '', bKutumb95Rakkam: '', bKutumb95Din1: '', bKutumb95Din2: '', bBank96Naav: '', bBank96Shakha: '', bBank96Prakar: '', bBank96Khate: '', bBank96Rakkam: '', bBank96Din1: '', bBank96Din2: '',
    g1Photo: null, g1Naav: '', g1Vay: '', g1SabasadNo: '', g1Shares: '', g1SharesRakkam: '', g1VadilNaav: '', g1VadilVay: '', g1AaiNaav: '', g1AaiVay: '', g1Patta: '', g1PinKod: '', g1Durdhvani: '', g1Mobile: '', g1Email: '', g1JageSwaarup: [], g1Kalavadhi_m: '', g1Kalavadhi_v: '', g1Vaivahik: 'विवाहित', g1Avalambun: '', g1EmpType: 'नोकरी', g1Company: '', g1CompanyPatta: '', g1CompanyPin: '', g1CompanyTel: '', g1CompanyMobile: '', g1CompanyEmail: '', g1Vibhag: '', g1Hudda: '', g1EmpCode: '', g1Karj_m: '', g1Karj_v: '', g1Seva: '', g1MonthlyVetan: '', g1Kapat: '', g1Niwal: '', g1Vaarshik: '', g1Kharcha: '', g1NiwalVaarshik: '', g1Kutumb: '', g1KutumbType: 'मासिक', g1ShetiNaav: '', g1ShetiNaate: '', g1GaavMukkam: '', g1GaavPost: '', g1GaavTaluka: '', g1GaavJilha: '', g1GaavRajya: '', g1GaavPin: '', g1GaavMobile: '', g1PurvKarjPrakar: '', g1PurvKhate: '', g1PurvRakkam: '', g1PurvDin1: '', g1PurvDin2: '', g1Jam94aKarjdarNaav: '', g1Jam94aPrakar: '', g1Jam94aKhate: '', g1Jam94aRakkam: '', g1Jam94aDin1: '', g1Jam94aDin2: '', g1Jam94bKarjdarNaav: '', g1Jam94bPrakar: '', g1Jam94bKhate: '', g1Jam94bRakkam: '', g1Jam94bDin1: '', g1Jam94bDin2: '', g1Kutumb95Naav: '', g1Kutumb95Prakar: '', g1Kutumb95Khate: '', g1Kutumb95Rakkam: '', g1Kutumb95Din1: '', g1Kutumb95Din2: '', g1Bank96Naav: '', g1Bank96Shakha: '', g1Bank96Prakar: '', g1Bank96Khate: '', g1Bank96Rakkam: '', g1Bank96Din1: '', g1Bank96Din2: '',
    g2Photo: null, g2Naav: '', g2Vay: '', g2SabasadNo: '', g2Shares: '', g2SharesRakkam: '', g2VadilNaav: '', g2VadilVay: '', g2AaiNaav: '', g2AaiVay: '', g2Patta: '', g2PinKod: '', g2Durdhvani: '', g2Mobile: '', g2Email: '', g2JageSwaarup: [], g2Kalavadhi_m: '', g2Kalavadhi_v: '', g2Vaivahik: 'विवाहित', g2Avalambun: '', g2EmpType: 'नोकरी', g2Company: '', g2CompanyPatta: '', g2CompanyPin: '', g2CompanyTel: '', g2CompanyMobile: '', g2CompanyEmail: '', g2Vibhag: '', g2Hudda: '', g2EmpCode: '', g2Karj_m: '', g2Karj_v: '', g2Seva: '', g2MonthlyVetan: '', g2Kapat: '', g2Niwal: '', g2Vaarshik: '', g2Kharcha: '', g2NiwalVaarshik: '', g2Kutumb: '', g2KutumbType: 'मासिक', g2ShetiNaav: '', g2ShetiNaate: '', g2GaavMukkam: '', g2GaavPost: '', g2GaavTaluka: '', g2GaavJilha: '', g2GaavRajya: '', g2GaavPin: '', g2GaavMobile: '', g2PurvKarjPrakar: '', g2PurvKhate: '', g2PurvRakkam: '', g2PurvDin1: '', g2PurvDin2: '', g2Jam94aKarjdarNaav: '', g2Jam94aPrakar: '', g2Jam94aKhate: '', g2Jam94aRakkam: '', g2Jam94aDin1: '', g2Jam94aDin2: '', g2Jam94bKarjdarNaav: '', g2Jam94bPrakar: '', g2Jam94bKhate: '', g2Jam94bRakkam: '', g2Jam94bDin1: '', g2Jam94bDin2: '', g2Kutumb95Naav: '', g2Kutumb95Prakar: '', g2Kutumb95Khate: '', g2Kutumb95Rakkam: '', g2Kutumb95Din1: '', g2Kutumb95Din2: '', g1Bank96Naav: '', g1Bank96Shakha: '', g1Bank96Prakar: '', g1Bank96Khate: '', g1Bank96Rakkam: '', g1Bank96Din1: '', g1Bank96Din2: '',
    bAadhar: '', bDob: '', bPan: '', bOfficeAddress: '', bGavchaAddress: '',
    niyamArjdarNaav: '', niyamArjdarSahi: '', niyamJam1Naav: '', niyamJam1Sahi: '', niyamJam2Naav: '', niyamJam2Sahi: '', niyamJam3Naav: '', niyamJam3Sahi: '', niyamTikaan: '', niyamDinank: '', officeArjdarNaav: '', officeSabasadCr: '', officeArjCr: '', officeKaran: '', officeDinank: '',
};

// ─── Helper Components ──────────────────────────────────────────────────────
function TI({ label, name, data, setData, type = 'text', className = '', required = false, onlyNumbers = false, isDate = false, ...rest }) {
    const handleChange = (e) => {
        let v = e.target.value;
        if (onlyNumbers) {
            v = v.replace(/\D/g, '');
        }

        if (rest.maxLength && v.length > rest.maxLength) {
            v = v.substring(0, rest.maxLength);
        }
        setData(p => ({ ...p, [name]: v }));
    };

    // For date fields: convert DD/MM/YYYY (stored) ↔ YYYY-MM-DD (native input)
    if (isDate) {
        const storedVal = data[name] ?? '';
        // For date fields: convert DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD (stored) ↔ YYYY-MM-DD (native input)
        let inputVal = '';
        if (storedVal) {
            if (storedVal.includes('-')) {
                const parts = storedVal.split('-');
                if (parts.length === 3 && parts[0].length <= 2) {
                    inputVal = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`; // DD-MM-YYYY to YYYY-MM-DD
                } else {
                    inputVal = storedVal; // already YYYY-MM-DD
                }
            } else if (storedVal.includes('/')) {
                const parts = storedVal.split('/');
                if (parts.length === 3 && parts[0].length <= 2) {
                    inputVal = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                } else {
                    inputVal = storedVal;
                }
            } else {
                inputVal = storedVal;
            }
        }
        const handleDateChange = (e) => {
            if (rest.readOnly) return;
            const isoVal = e.target.value; // YYYY-MM-DD
            if (!isoVal) { setData(p => ({ ...p, [name]: '' })); return; }
            const [y, m, d] = isoVal.split('-');
            setData(p => ({ ...p, [name]: `${d}/${m}/${y}` })); // store as DD/MM/YYYY
        };
        return (
            <div className={`field ${className}`}>
                <label>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
                <input type="date" value={inputVal} onChange={handleDateChange} readOnly={rest.readOnly} style={rest.readOnly ? { background: '#f8f9fa', cursor: 'not-allowed', color: '#64748b' } : {}} />
            </div>
        );
    }

    return (
        <div className={`field ${className}`}>
            <label>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
            <input
                type={type === 'number' && onlyNumbers ? 'text' : type}
                value={data[name] ?? ''}
                onChange={(e) => { if (!rest.readOnly) handleChange(e); }}
                placeholder={rest.placeholder}
                readOnly={rest.readOnly}
                style={rest.readOnly ? { background: '#f8f9fa', cursor: 'not-allowed', color: '#64748b' } : {}}
                {...rest}
            />
        </div>
    );
}

function TA({ label, name, data, setData, rows = 1, readOnly = false }) {
    return (
        <div className="field">
            <label>{label}</label>
            <textarea rows={rows} value={data[name] ?? ''} onChange={e => { if (!readOnly) setData(p => ({ ...p, [name]: e.target.value })) }} readOnly={readOnly} style={readOnly ? { background: '#f8f9fa', cursor: 'not-allowed', color: '#64748b' } : {}} />
        </div>
    );
}

function Radio({ label, name, options, data, setData }) {
    return (
        <div className="field">
            <label>{label}</label>
            <div className="radio-group">
                {options.map(o => (
                    <label key={o.val} className="radio-item">
                        <input type="radio" name={name} value={o.val} checked={data[name] === o.val} onChange={() => setData(p => ({ ...p, [name]: o.val }))} />
                        {o.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

function CheckGroup({ label, name, options, data, setData }) {
    const vals = data[name] || [];
    return (
        <div className="field">
            <label>{label}</label>
            <div className="checkbox-group">
                {options.map(o => (
                    <label key={o.val} className="cb-item">
                        <input type="checkbox" checked={vals.includes(o.val)}
                            onChange={() => setData(p => {
                                const cur = p[name] || [];
                                return { ...p, [name]: cur.includes(o.val) ? cur.filter(x => x !== o.val) : [...cur, o.val] };
                            })} />
                        {o.label}
                    </label>
                ))}
            </div>
        </div>
    );
}

function PhotoUpload({ label, name, data, setData, t }) {
    const ref = useRef();
    const handleFile = e => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => setData(p => ({ ...p, [name]: ev.target.result }));
        reader.readAsDataURL(f);
    };
    return (
        <div className="field" style={{ alignItems: 'flex-start' }}>
            <div className="photo-upload" onClick={() => ref.current.click()}>
                {data[name] ? <img src={data[name]} alt="photo" /> : <><span style={{ fontSize: 24 }}>📷</span><span>{t('personal_loan.labels.upload_photo')}</span></>}
            </div>
            <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        </div>
    );
}

// ─── Reusable Person Block ──────────────────────────────────────────────────
function PersonBlock({ prefix, data, setData, title, t, lang = "mr" }) {
    const isFetched = prefix === 'b' && !!data.bAadhar;
    const getExtra = (name, baseExtra) => {
        if (isFetched && ['Naav', 'Vay', 'Patta', 'PinKod', 'Aadhar', 'Dob'].includes(name)) {
            return { ...baseExtra, readOnly: true };
        }
        return baseExtra;
    };
    const ti = (labelKey, name, type = 'text', extra = {}) => <TI label={t(`personal_loan.labels.${labelKey}`)} name={prefix + name} data={data} setData={setData} type={type} {...getExtra(name, extra)} />;

    const jageOpts = [
        { val: 'स्वःमालकीचे', label: t('personal_loan.options.self_owned') },
        { val: 'वडिलोपार्जित', label: t('personal_loan.options.ancestral') },
        { val: 'पागडीची', label: t('personal_loan.options.pagadi') },
        { val: 'कंपनी क्वार्टर्स', label: t('personal_loan.options.company_quarters') },
        { val: 'भाडेतत्त्वावर', label: t('personal_loan.options.rented') }
    ];

    const maritalOpts = [
        { val: 'विवाहित', label: t('personal_loan.options.married') },
        { val: 'अविवाहित', label: t('personal_loan.options.unmarried') }
    ];

    const empOpts = [
        { val: 'नोकरी', label: t('personal_loan.options.job') },
        { val: 'व्यवसाय', label: t('personal_loan.options.business') }
    ];

    return (
        <div className="form-step-content" style={{ padding: '0 8px' }}>
            {/* ── Section 1: Personal Info ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{title} — {t('personal_loan.sections.personal_info')}</div>
                </div>

                {/* ── CSS Grid: 3 equal columns. Photo occupies col3 rows 1-3, fields fill all columns ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '8px', rowGap: '8px', padding: '8px 12px' }}>

                    {/* Row 1 */}
                    <div className="v-col">{ti('applicant_name', 'Naav', 'text')}</div>
                    <div className="v-col">{ti('age', 'Vay', 'number', { onlyNumbers: true, maxLength: 3 })}</div>
                    {/* Col3, Rows 1-3: Photo */}
                    <div style={{ gridColumn: '3', gridRow: '1 / span 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PhotoUpload label={t('personal_loan.labels.photo')} name={prefix + 'Photo'} data={data} setData={setData} t={t} />
                    </div>

                    {/* Row 2 — Father Name & Age (photo still spans col3) */}

                    {/* Row 3 */}
                    <div className="v-col">{ti('father_husband_name', 'VadilNaav')}</div>
                    <div className="v-col">{ti('age', 'VadilVay', 'number', { onlyNumbers: true, maxLength: 3 })}</div>
                    {/* col3 row 3 occupied by photo span */}

                    {/* Row 4 — photo ends; col3 gets real field */}
                    <div className="v-col">{ti('mother_name', 'AaiNaav')}</div>
                    <div className="v-col">{ti('age', 'AaiVay', 'number', { onlyNumbers: true, maxLength: 3 })}</div>
                    <div className="v-col">{ti('member_no', 'SabasadNo', 'text', { onlyNumbers: true })}</div>

                    {/* Row 5 */}
                    <div className="v-col">{ti('pin_code', 'PinKod', 'text', { onlyNumbers: true, maxLength: 6 })}</div>
                    <div className="v-col">{ti('email', 'Email')}</div>
                    <div className="v-col">{ti('telephone', 'Durdhvani', 'text', { onlyNumbers: true, maxLength: 12 })}</div>

                    {/* Row 6: Mobile, Dependents */}
                    <div className="v-col">{ti('mobile', 'Mobile', 'text', { onlyNumbers: true, maxLength: 10 })}</div>
                    <div className="v-col">{ti('dependents', 'Avalambun', 'number', { onlyNumbers: true })}</div>

                    {/* Row 7: Shares — placed after Mobile as requested */}
                    <div className="v-col">{ti('shares_count', 'Shares', 'number', { onlyNumbers: true })}</div>
                    <div className="v-col">{ti('shares_amount', 'SharesRakkam', 'number', { onlyNumbers: true })}</div>

                    {/* Row 7 — Borrower only */}
                    {prefix === 'b' && <>
                        <div className="v-col">{ti('aadhaar', 'Aadhar', 'text', { onlyNumbers: true, maxLength: 12 })}</div>
                        <div className="v-col">{ti('dob', 'Dob', 'text', { isDate: true })}</div>
                        <div className="v-col">{ti('pan', 'Pan', 'text', { maxLength: 10 })}</div>
                    </>}

                    {/* Row 8 */}
                    <div className="v-col no-colon">
                        <Radio label={t('personal_loan.labels.marital_status')} name={prefix + 'Vaivahik'} options={maritalOpts} data={data} setData={setData} />
                    </div>
                      <div className="v-col">{ti('residence_duration_years', 'Kalavadhi_v', 'number', { onlyNumbers: true })}</div>
                    <div className="v-col">{ti('residence_duration_months', 'Kalavadhi_m', 'number', { onlyNumbers: true })}</div>
                   
                    
                </div>

                {/* Full-width rows */}
                <div style={{ padding: '0 12px 8px 12px' }}>
                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col no-colon" style={{ flex: 1 }}>
                            <CheckGroup label={t('personal_loan.labels.property_type')} name={prefix + 'JageSwaarup'} options={jageOpts} data={data} setData={setData} />
                        </div>
                    </div>
                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col" style={{ flex: 1 }}>
                            <TA label={t('personal_loan.labels.residential_address')} name={prefix + 'Patta'} data={data} setData={setData} rows={1} readOnly={isFetched} />
                        </div>
                    </div>
                    {prefix === 'b' && (
                        <div className="v-form-row" style={{ marginBottom: '8px', gap: '12px' }}>
                            <div className="v-col" style={{ flex: 1 }}>
                                <TA label={t('personal_loan.labels.office_address') || "Office Address"} name={prefix + 'OfficeAddress'} data={data} setData={setData} rows={1} />
                            </div>
                            <div className="v-col" style={{ flex: 1 }}>
                                <TA label={t('personal_loan.labels.gavcha_address') || "Gavcha Address"} name={prefix + 'GavchaAddress'} data={data} setData={setData} rows={1} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Section 2: Job/Business Details ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.job_details_title')}</div>
                </div>

                <div style={{ padding: '0 12px 4px 12px' }}>
                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1 no-colon" style={{ flex: 1.5 }}>
                            <Radio label={t('personal_loan.labels.job_type')} name={prefix + 'EmpType'} options={empOpts} data={data} setData={setData} />
                        </div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('company_name', 'Company')}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('department', 'Vibhag')}</div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('designation', 'Hudda')}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('employee_code', 'EmpCode')}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('retirement_date', 'Seva', 'text', { isDate: true })}</div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('pin_code', 'CompanyPin', 'text', { onlyNumbers: true, maxLength: 6 })}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('telephone', 'CompanyTel', 'text', { onlyNumbers: true, maxLength: 12 })}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('email', 'CompanyEmail')}</div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('mobile', 'CompanyMobile', 'text', { onlyNumbers: true, maxLength: 10 })}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('duration_months', 'Karj_m', 'number', { onlyNumbers: true })}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('duration_years', 'Karj_v', 'number', { onlyNumbers: true })}</div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1 }}>
                            <TA label={t('personal_loan.labels.company_address')} name={prefix + 'CompanyPatta'} data={data} setData={setData} rows={1} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 3 & 4: Income & Village side-by-side ── */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '4px', alignItems: 'stretch' }}>
                {/* ── Section 3: Income ── */}
                <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                        <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.income_details_title')}</div>
                    </div>

                    <div style={{ padding: '0 12px 12px 12px' }}>
                        {/* 1. If Salaried */}
                        <div style={{ fontSize: '11px', fontWeight: '700', margin: '4px 0 6px 0', color: '#1f2937' }}>{t('personal_loan.sections.income_salaried')}</div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('monthly_salary', 'MonthlyVetan', 'number', { onlyNumbers: true })}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('deductions', 'Kapat', 'number', { onlyNumbers: true })}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('net_salary', 'Niwal', 'number', { onlyNumbers: true })}</div>
                        </div>

                        {/* 2. If Business */}
                        <div style={{ fontSize: '11px', fontWeight: '700', margin: '10px 0 6px 0', color: '#1f2937' }}>{t('personal_loan.sections.income_business')}</div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('annual_income', 'Vaarshik', 'number', { onlyNumbers: true })}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('total_expenses', 'Kharcha', 'number', { onlyNumbers: true })}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('net_annual_income', 'NiwalVaarshik', 'number', { onlyNumbers: true })}</div>
                        </div>

                        {/* 3. Family Net Income */}
                        <div style={{ fontSize: '11px', fontWeight: '700', margin: '10px 0 6px 0', color: '#1f2937' }}>{t('personal_loan.sections.income_family')}</div>
                        <div className="v-form-row" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('family_net_income', 'Kutumb', 'number', { onlyNumbers: true })}</div>
                        </div>
                        <div className="v-form-row no-colon" style={{ marginBottom: '4px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>
                                <Radio label={t('personal_loan.labels.income_period')} name={prefix + 'KutumbType'} options={[{ val: 'मासिक', label: t('personal_loan.options.monthly') }, { val: 'वार्षिक', label: t('personal_loan.options.yearly') }]} data={data} setData={setData} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section 4: Village Address ── */}
                <div style={{ flex: 1.2, border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                        <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.house_farm_address')}</div>
                    </div>

                    <div style={{ padding: '8px 12px 12px 12px' }}>
                        <div className="v-form-row" style={{ marginBottom: '8px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('property_owner', 'ShetiNaav')}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '8px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('relation', 'ShetiNaate')}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '8px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('village_address', 'GaavMukkam')}</div>
                            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('post', 'GaavPost')}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '8px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('taluka', 'GaavTaluka')}</div>
                            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('district', 'GaavJilha')}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '8px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('state', 'GaavRajya')}</div>
                            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('pin_code', 'GaavPin', 'text', { onlyNumbers: true, maxLength: 6 })}</div>
                        </div>
                        <div className="v-form-row" style={{ marginBottom: '8px' }}>
                            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('telephone', 'GaavDurdhvani')}</div>
                            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('mobile', 'GaavMobile', 'text', { onlyNumbers: true, maxLength: 10 })}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 5: Previous Loans ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#f43f5e' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.prev_loan')}</div>
                </div>

                <div style={{ padding: '4px 12px 12px 12px' }}>
                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('loan_type', 'PurvKarjPrakar')}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('loan_acc_no', 'PurvKhate', 'text', { onlyNumbers: true })}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('loan_amount', 'PurvRakkam', 'number', { onlyNumbers: true })}</div>
                    </div>
                    <div className="v-form-row" style={{ marginBottom: '8px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('loan_taken_date', 'PurvDin1', 'text', { isDate: true })}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('loan_repayment_date', 'PurvDin2', 'text', { isDate: true })}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
                    </div>
                </div>
            </div>

            {/* ── Section 6: As Guarantor ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#f59e0b' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.as_guarantor')}</div>
                </div>
                <div style={{ padding: '4px 12px 12px 12px' }}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                        {[
                            { key: 'Jam94a', label: 'अ) ' },
                            { key: 'Jam94b', label: 'ब) ' }
                        ].map(item => (
                            <div key={item.key} style={{ flex: 1, padding: '8px', background: '#fcfaf5', borderRadius: '6px', border: '1px solid #fcebb6' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>
                                    {item.label}{t('personal_loan.labels.borrower_name')}
                                </div>
                                <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                    <div className="v-col" style={{ flex: 1 }}>{ti('applicant_name', item.key + 'KarjdarNaav')}</div>
                                </div>
                                <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                    <div className="v-col" style={{ flex: 1 }}>{ti('loan_type', item.key + 'Prakar')}</div>
                                    <div className="v-col" style={{ flex: 1 }}>{ti('loan_acc_no', item.key + 'Khate', 'text', { onlyNumbers: true })}</div>
                                </div>
                                <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                    <div className="v-col" style={{ flex: 1 }}>{ti('loan_amount', item.key + 'Rakkam', 'number', { onlyNumbers: true })}</div>
                                </div>
                                <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                    <div className="v-col" style={{ flex: 1 }}>{ti('loan_taken_date', item.key + 'Din1', 'text', { isDate: true })}</div>
                                    <div className="v-col" style={{ flex: 1 }}>{ti('loan_repayment_date', item.key + 'Din2', 'text', { isDate: true })}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Section 7+8: Family Loan & Other Bank Loan (side by side) ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '0', padding: '0' }}>

                    {/* Family Loan */}
                    <div style={{ flex: 1, borderRight: '1px solid #fed7aa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                            <div style={{ width: '3px', height: '14px', background: '#22c55e' }} />
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.family_loan')}</div>
                        </div>
                        <div style={{ padding: '4px 12px 12px 12px' }}>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('applicant_name', 'Kutumb95Naav')}</div></div>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('loan_type', 'Kutumb95Prakar')}</div></div>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_acc_no', 'Kutumb95Khate')}</div>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_amount', 'Kutumb95Rakkam', 'number', { onlyNumbers: true })}</div>
                            </div>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_taken_date', 'Kutumb95Din1', 'text', { isDate: true })}</div>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_repayment_date', 'Kutumb95Din2', 'text', { isDate: true })}</div>
                            </div>
                        </div>
                    </div>

                    {/* Other Bank Loan */}
                    <div style={{ flex: 1.2 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                            <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.other_bank_loan')}</div>
                        </div>
                        <div style={{ padding: '4px 12px 12px 12px' }}>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                <div className="v-col" style={{ flex: 1 }}>{ti('bank_name', 'Bank96Naav')}</div>
                                <div className="v-col" style={{ flex: 1 }}>{ti('branch', 'Bank96Shakha')}</div>
                            </div>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('loan_type', 'Bank96Prakar')}</div></div>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_acc_no', 'Bank96Khate')}</div>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_amount', 'Bank96Rakkam', 'number', { onlyNumbers: true })}</div>
                            </div>
                            <div className="v-form-row" style={{ marginBottom: '8px' }}>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_taken_date', 'Bank96Din1', 'text', { isDate: true })}</div>
                                <div className="v-col" style={{ flex: 1 }}>{ti('loan_repayment_date', 'Bank96Din2', 'text', { isDate: true })}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PersonalLoanForm() {
    const { clientInfo, showToast } = useApp();
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { id: paramId } = useParams();
    const effectiveId = paramId || location.state?.id;
    const [step, setStep] = useState(0);
    const [data, setData] = useState(initState);
    const [searchId, setSearchId] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const lang = i18n.language;
    const aadharAppliedRef = useRef(false);
    const draftLoadedRef = useRef(false);

    const draftKey = location.state?.aadharData?.id
        ? `pl_form_draft_${location.state.aadharData.id}`
        : 'pl_form_draft_general';

    const handleLoad = async () => {
        if (!searchId) {
            showToast('Please enter an Application ID', 'warning');
            return;
        }
        try {
            showToast('Fetching data...', 'info');
            const fetched = await loanService.getLoan(searchId);
            if (!fetched) {
                showToast('Application not found', 'error');
                return;
            }
            // Map comma-separated strings back to arrays for checkboxes
            const mapped = Object.fromEntries(
                Object.entries(fetched).map(([k, v]) => {
                    if (['bJageSwaarup', 'g1JageSwaarup', 'g2JageSwaarup'].includes(k) && typeof v === 'string') {
                        return [k, v.split(', ').filter(x => x)];
                    }
                    if (k === 'extraGuarantors') {
                        if (typeof v === 'string') {
                            try { return [k, JSON.parse(v)]; } catch { return [k, []]; }
                        }
                        return [k, Array.isArray(v) ? v : []];
                    }
                    return [k, v];
                })
            );
            // Robustness: Map sabasadCrNo to saCra if saCra is missing (for older records)
            if (mapped.sabasadCrNo && !mapped.saCra) {
                mapped.saCra = mapped.sabasadCrNo;
            }
            setData(mapped);
            showToast('Data loaded successfully!', 'success');
        } catch (err) {
            console.error('Load error:', err);
            showToast('Failed to load data. Please check the ID.', 'error');
        }
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem(draftKey);
            if (saved) {
                setData(p => ({ ...p, ...JSON.parse(saved) }));
                if (!draftLoadedRef.current) {
                    showToast(t('personal_loan.buttons.draft_loaded'), 'success');
                    draftLoadedRef.current = true;
                }
            }
        } catch (e) { console.error("Error loading draft", e); }
    }, [draftKey, t, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem(draftKey, JSON.stringify(data));
        }, 1000);
        return () => clearTimeout(timer);
    }, [data, draftKey]);

    const handleRakkam = e => {
        const v = e.target.value.replace(/\D/g, '');
        const func = lang === 'mr' ? numberToWordsMr : numberToWordsEn;
        setData(p => ({ ...p, karjRakkam: v, akshari: func(v) }));
    };

    const addGuarantor = () => {
        setData(p => ({
            ...p,
            extraGuarantors: [...(p.extraGuarantors || []), { id: Date.now(), Naav: '', Vay: '' }]
        }));
    };
    const removeGuarantor = (id) => {
        setData(p => ({
            ...p,
            extraGuarantors: p.extraGuarantors.filter(g => g.id !== id)
        }));
    };

    const ti = (labelKey, name, type = 'text', required = false, extra = {}) => {
        const isFetched = !!data.bAadhar;
        if (isFetched && ['bNaav', 'bVay', 'arjdarNaav', 'arjdarVay'].includes(name)) {
            extra = { ...extra, readOnly: true };
        }
        return <TI label={t(`personal_loan.labels.${labelKey}`)} name={name} data={data} setData={setData} type={type} required={required} {...extra} />;
    };

    const applyAadharData = (record) => {
        if (!record) return;
        
        // Robustly handle field naming variations (Aadhar records use both camelCase and PascalCase)
        const name = record.fullName || record.Name || record.name || '';
        const rawAddress = record.Address || record.address || '';
        const photo = record.CapturedPhoto || record.capturedPhoto || record.Photo || record.photo || record.profile_image || null;
        const dob = record.dob || record.Dob || record.DOB || '';
        const aadharNo = record.aadhaarNo || record.AadhaarNo || record.aadhar || record.Aadhar || '';
        const phone = record.Mobile || record.mobile || record.phone || '';

        // Handle address if it's an object (common from fresh verification)
        let formattedAddress = '';
        if (typeof rawAddress === 'object' && rawAddress !== null) {
            const parts = [
                rawAddress.house,
                rawAddress.street,
                rawAddress.landmark,
                rawAddress.locality || rawAddress.loc || rawAddress.vtc,
                rawAddress.district || rawAddress.dist,
                rawAddress.state,
                rawAddress.pincode || rawAddress.pc || rawAddress.zip
            ].filter(v => v && String(v).trim() !== '');
            formattedAddress = parts.join(', ');
        } else {
            formattedAddress = String(rawAddress || '');
        }

        const calculateAge = (dobStr) => {
            if (!dobStr) return '';
            try {
                // Handles multiple formats: DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY
                const parts = dobStr.split(/[\/\-]/);
                let birthDate;
                if (parts[0].length === 4) { // YYYY-MM-DD
                    birthDate = new Date(dobStr);
                } else { // DD-MM-YYYY or DD/MM/YYYY
                    birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                }
                
                if (isNaN(birthDate.getTime())) return '';

                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                return age.toString();
            } catch (e) { return ''; }
        };

        const age = calculateAge(dob);
        
        // Normalize DOB to DD/MM/YYYY for the form's date fields if possible
        let normalizedDob = dob;
        if (dob && dob.includes('-')) {
            const parts = dob.split('-');
            if (parts[0].length === 4) normalizedDob = `${parts[2]}/${parts[1]}/${parts[0]}`;
            else normalizedDob = dob.replace(/-/g, '/');
        }

        setData(prev => ({
            ...prev,
            arjdarNaav: name || prev.arjdarNaav,
            arjdarVay: age || prev.arjdarVay,
            bNaav: name || prev.bNaav,
            bVay: age || prev.bVay,
            bPatta: formattedAddress || prev.bPatta,
            bPhoto: photo || prev.bPhoto,
            bMobile: (phone && phone !== 'Linked' && phone !== 'Not Linked') ? phone : prev.bMobile,
            bPinKod: formattedAddress.match(/\d{6}/)?.[0] || prev.bPinKod,
            bAadhar: aadharNo || prev.bAadhar,
            bDob: normalizedDob || prev.bDob
        }));

        if (!aadharAppliedRef.current) {
            showToast('Details autofilled from Aadhaar', 'success');
            aadharAppliedRef.current = true;
        }
    };

    useEffect(() => {
        const fetchFullAadharDetail = async (partialData) => {
            // APPLY IMMEDIATELY with what we already have (fast)
            applyAadharData(partialData);

            try {
                // If we already have address AND photo, no need to fetch more
                if ((partialData.Address || partialData.address) && (partialData.Photo || partialData.photo || partialData.CapturedPhoto || partialData.capturedPhoto)) {
                    return;
                }

                // If no ID, we can't fetch more detailed records by ID
                if (!partialData.id && !partialData.Id) {
                    return;
                }

                const id = partialData.id || partialData.Id;
                const token = sessionStorage.getItem('tushgpt_jwt');
                const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                const response = await fetch(`${baseUrl}/AadharProxy/history/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const fullData = await response.json();
                    applyAadharData(fullData);
                }
            } catch (error) {
                console.error("Error fetching full Aadhar detail:", error);
            }
        };

        if (location.state?.aadharData) {
            fetchFullAadharDetail(location.state.aadharData);
        }
    }, [location.state]);

    // TRIGGER AUTO-FILL ON MANUAL 12-DIGIT ENTRY
    useEffect(() => {
        if (data.bAadhar?.length === 12 && !aadharAppliedRef.current) {
            const fetchByAadharNo = async () => {
                try {
                    const token = sessionStorage.getItem('tushgpt_jwt');
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
                    const response = await fetch(`${baseUrl}/AadharProxy/history?aadhaarNo=${data.bAadhar}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const results = await response.json();
                        if (results && results.length > 0) {
                            // Use the most recent record
                            applyAadharData(results[0]);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching by Aadhaar number:", error);
                }
            };
            fetchByAadharNo();
        }
        // Reset ref if user changes aadhar again
        if (data.bAadhar?.length < 12) {
            aadharAppliedRef.current = false;
        }
    }, [data.bAadhar]);

    const fetchedIdRef = useRef(null);

    // FETCH EXISTING LOAN DATA IF ID IS PASSED (FOR EDITING)
    useEffect(() => {
        const editId = effectiveId;
        if (!editId || fetchedIdRef.current === editId) return;

        const fetchExistingLoan = async (id) => {
            try {
                showToast('Loading loan data...', 'info');
                const existingData = await loanService.getLoan(id);
                if (existingData) {
                    // Normalize data: convert nulls to empty strings for controlled inputs
                    const normalizedData = {};
                    Object.keys(existingData).forEach(key => {
                        const val = existingData[key];
                        normalizedData[key] = val === null ? '' : val;
                    });

                    // Ensure extraGuarantors is an array
                    if (!Array.isArray(normalizedData.extraGuarantors)) {
                        normalizedData.extraGuarantors = [];
                    }

                    setData(prev => ({
                        ...prev,
                        ...normalizedData,
                        id: existingData.id || id // Ensure ID is preserved
                    }));
                    showToast('Loan data loaded for editing', 'success');
                    fetchedIdRef.current = id;
                }
            } catch (error) {
                console.error("Error fetching existing loan:", error);
                showToast('Failed to load loan data', 'error');
            }
        };

        fetchExistingLoan(editId);
    }, [location.state?.id, showToast]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const wrapper = document.querySelector('.master-content-wrapper');
        if (wrapper) wrapper.scrollTop = 0;
    }, [step, showPreview]);

    const handleReset = () => {
        if (window.confirm(t('personal_loan.buttons.reset_confirm'))) {
            localStorage.removeItem(draftKey);
            setData(initState);
            setStep(0);
            showToast(t('personal_loan.buttons.reset_success'), 'success');
        }
    };

    const handleSubmit = async () => {
        try {
            showToast('Saving application...', 'info');

            const integerKeys = [
                'arjdarVay', 'saharjdarVay', 'paratfedKalavadhi', 'pahilaHapta', 'tarikh', 'avalambun',
                'jameen1Vay', 'jameen2Vay', 'jameen3Vay', 'id',
                'bVay', 'bShares', 'bVadilVay', 'bAaiVay', 'bKalavadhi_m', 'bKalavadhi_v', 'bAvalambun', 'bKarj_m', 'bKarj_v', 'bEmpCode',
                'g1Vay', 'g1Shares', 'g1VadilVay', 'g1AaiVay', 'g1Kalavadhi_m', 'g1Kalavadhi_v', 'g1Avalambun', 'g1Karj_m', 'g1Karj_v',
                'g2Vay', 'g2Shares', 'g2VadilVay', 'g2AaiVay', 'g2Kalavadhi_m', 'g2Kalavadhi_v', 'g2Avalambun', 'g2Karj_m', 'g2Karj_v'
            ];

            const decimalKeys = [
                'karjRakkam', 'vyajDar', 'bSharesRakkam', 'bMonthlyVetan', 'bKapat', 'bNiwal', 'bVaarshik', 'bKharcha', 'bNiwalVaarshik', 'bKutumb', 'bPurvRakkam', 'bJam94aRakkam', 'bJam94bRakkam', 'bKutumb95Rakkam', 'bBank96Rakkam',
                'g1SharesRakkam', 'g1MonthlyVetan', 'g1Kapat', 'g1Niwal', 'g1Vaarshik', 'g1Kharcha', 'g1NiwalVaarshik', 'g1Kutumb', 'g1PurvRakkam', 'g1Jam94aRakkam', 'g1Jam94bRakkam', 'g1Kutumb95Rakkam', 'g1Bank96Rakkam',
                'g2SharesRakkam', 'g2MonthlyVetan', 'g2Kapat', 'g2Niwal', 'g2Vaarshik', 'g2Kharcha', 'g2NiwalVaarshik', 'g2Kutumb', 'g2PurvRakkam', 'g2Jam94aRakkam', 'g2Jam94bRakkam', 'g2Kutumb95Rakkam', 'g1Bank96Rakkam'
            ];

            const cleanRecursive = (obj) => {
                const result = {};
                for (let k in obj) {
                    let v = obj[k];
                    
                    // 1. Handle arrays
                    if (Array.isArray(v)) {
                        if (k === 'extraGuarantors') {
                            result[k] = v.map(g => cleanRecursive(g));
                        } else {
                            result[k] = v.length > 0 ? v.join(', ') : null;
                        }
                        continue;
                    }

                    // 2. Trim and nullify empty strings
                    if (typeof v === 'string') {
                        v = v.trim();
                        if (v === '') v = null;
                    }

                    if (v === null || v === undefined) {
                        result[k] = null;
                        continue;
                    }

                    // 3. Handle numbers
                    if (integerKeys.includes(k)) {
                        const n = parseInt(v, 10);
                        result[k] = isNaN(n) ? null : n;
                    } else if (decimalKeys.includes(k)) {
                        const n = parseFloat(v);
                        result[k] = isNaN(n) ? null : n;
                    } else {
                        result[k] = v;
                    }
                }
                return result;
            };

            const payload = cleanRecursive(data);
            console.log("Submit Payload:", payload);
            
            await loanService.saveLoan(payload);
            showToast('Personal loan application submitted successfully!', 'success');
            localStorage.removeItem(draftKey);
            setStep(0); setData(initState); navigate('/personal-loan', { state: { activeTab: 'applications' } });
            setTimeout(() => {
                window.location.reload();
            }, 2500);
        } catch (error) {
            console.error('Submit error:', error);
            showToast('Failed to submit application. Please check your connection.', 'error');
        }
    };

    const stepsList = [
        t('personal_loan.steps.step_1'),
        t('personal_loan.steps.step_2'),
        t('personal_loan.steps.step_3'),
        t('personal_loan.steps.step_4'),
        ...(Array.isArray(data.extraGuarantors) ? data.extraGuarantors : []).map((_, idx) => `${t('personal_loan.labels.guarantor')} ${idx + 3}`),
        t('personal_loan.steps.step_5')
    ];

    const next = () => { setStep(s => Math.min(s + 1, stepsList.length - 1)); };
    const prev = () => { setStep(s => Math.max(s - 1, 0)); };

    const stepContent = [
        <div key="step1" className="form-step-content" style={{ padding: '0 8px' }}>
            {/* ── Section 1: Basic Info ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.basic_info')}</div>
                </div>

                <div style={{ padding: '0 12px 6px 12px' }}>
                    <div className="v-form-row" style={{ marginBottom: '2px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('date', 'dinank', 'text', false, { isDate: true })}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('branch', 'shakha')}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('member_no_technical', 'saCra')}</div>
                    </div>
                    <div className="v-form-row" style={{ marginBottom: '2px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('loan_acc_no', 'karjKhate')}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('member_no', 'bSabasadNo')}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
                    </div>
                </div>
            </div>

            {/* ── Section 2: Loan Details ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.loan_details')}</div>
                </div>

                <div style={{ padding: '0 12px 6px 12px' }}>
                    <div className="v-form-row" style={{ marginBottom: '2px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('applicant_name', 'bNaav', 'text', true)}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('age', 'bVay', 'number', false, { maxLength: 3, onlyNumbers: true })}</div>
                        <div className="v-col pb-col3 no-colon" style={{ flex: 1.5 }}>
                            <Radio
                                label={t('personal_loan.labels.marital_status')}
                                name="vaivahik"
                                options={[{ val: 'विवाहित', label: t('personal_loan.options.married') }, { val: 'अविवाहित', label: t('personal_loan.options.unmarried') }]}
                                data={data}
                                setData={setData}
                            />
                        </div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '2px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('dependents', 'avalambun')}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>
                            <div className="field">
                                <label>{t('personal_loan.labels.loan_amount')}</label>
                                <div className="field-control-wrapper">
                                    <input type="text" value={data.karjRakkam} onChange={handleRakkam} />
                                </div>
                            </div>
                        </div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('repayment_period', 'paratfedKalavadhi', 'number', false, { onlyNumbers: true })}</div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '2px' }}>
                        <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('first_installment', 'pahilaHapta')}</div>
                        <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('installment_date', 'tarikh')}</div>
                        <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('interest_rate', 'vyajDar', 'number')}</div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '2px' }}>
                        <div className="v-col pb-col1" style={{ width: '100%', flex: '1 1 100%' }}>
                            <TA label={t('personal_loan.labels.purpose')} name="karan" data={data} setData={setData} rows={1} />
                        </div>
                    </div>

                    <div className="v-form-row" style={{ marginBottom: '0' }}>
                        <div className="v-col pb-col1" style={{ width: '100%', flex: '1 1 100%' }}>
                            <div className="field">
                                <label>{t('personal_loan.labels.in_words')}</label>
                                <div className="field-control-wrapper">
                                    <input type="text" value={data.akshari} readOnly style={{ background: '#f8f9fa' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Section 3: Guarantors ── */}
            <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
                    <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{t('personal_loan.sections.guarantors_info')}</div>
                </div>

                <div style={{ padding: '0 12px 10px 12px' }}>
                    <div className="v-form-row" style={{ alignItems: 'stretch', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px' }}>
                            <div style={{ fontWeight: '800', color: '#7c2d12', marginBottom: '8px', fontSize: '12px' }}>१) {t('personal_loan.labels.guarantor')}</div>
                            <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>{ti('applicant_name', 'g1Naav')}</div>
                            <div className="v-col lbl-med" style={{ width: '100%', flex: 'none', marginTop: '6px' }}>{ti('age', 'g1Vay', 'number', false, { maxLength: 3, onlyNumbers: true })}</div>
                        </div>
                        <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px' }}>
                            <div style={{ fontWeight: '800', color: '#7c2d12', marginBottom: '8px', fontSize: '12px' }}>२) {t('personal_loan.labels.guarantor')}</div>
                            <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>{ti('applicant_name', 'g2Naav')}</div>
                            <div className="v-col lbl-med" style={{ width: '100%', flex: 'none', marginTop: '6px' }}>{ti('age', 'g2Vay', 'number', false, { maxLength: 3, onlyNumbers: true })}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                        {(data.extraGuarantors || []).map((g, idx) => (
                            <div key={g.id} style={{ flex: '1 1 calc(50% - 6px)', border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px', minWidth: '300px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: '800', color: '#7c2d12', fontSize: '12px' }}>{idx + 3}) {t('personal_loan.labels.guarantor')}</div>
                                    <button className="delete-guarantor-btn" onClick={() => removeGuarantor(g.id)} style={{ padding: '4px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                                <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                                    <TI label={t('personal_loan.labels.applicant_name')} name="Naav" data={g} setData={(valFunc) => setData(p => ({ ...p, extraGuarantors: p.extraGuarantors.map(x => x.id === g.id ? valFunc(x) : x) }))} />
                                </div>
                                <div className="v-col lbl-med" style={{ width: '100%', flex: 'none', marginTop: '6px' }}>
                                    <TI label={t('personal_loan.labels.age')} name="Vay" data={g} setData={(valFunc) => setData(p => ({ ...p, extraGuarantors: p.extraGuarantors.map(x => x.id === g.id ? valFunc(x) : x) }))} type="number" onlyNumbers={true} maxLength={3} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="add-guarantor-link" onClick={addGuarantor} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="plus-icon"></span> {t('personal_loan.buttons.add_guarantor')}
                    </button>
                </div>
            </div>
        </div>,

        <PersonBlock key="borrower" prefix="b" data={data} setData={setData} title={t('personal_loan.steps.step_2')} t={t} lang={lang} />,
        <PersonBlock key="g1" prefix="g1" data={data} setData={setData} title={t('personal_loan.steps.step_3')} t={t} lang={lang} />,
        <PersonBlock key="g2" prefix="g2" data={data} setData={setData} title={t('personal_loan.steps.step_4')} t={t} lang={lang} />,

        ...(data.extraGuarantors || []).map((g, idx) => (
            <PersonBlock
                key={g.id}
                prefix=""
                data={g}
                setData={(valFunc) => setData(p => ({
                    ...p,
                    extraGuarantors: p.extraGuarantors.map(x => x.id === g.id ? valFunc(x) : x)
                }))}
                title={`${t('personal_loan.labels.guarantor')} ${idx + 3}`}
                t={t}
                lang={lang}
            />
        )),

        <div key="final">
            <div className="section-header">
                <div className="section-bar" />
                <h3>{t('personal_loan.steps.step_5')}</h3>
            </div>
            <div className="grid cols-1">
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Review all details before printing and submitting.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', paddingBottom: 20 }}>
                    <button className="btn-print" onClick={() => { setShowPreview(true); }} style={{ background: '#0e1a40', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        {t('personal_loan.buttons.preview_print')}
                    </button>
                    <button className="btn-submit" onClick={handleSubmit} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        {t('personal_loan.buttons.submit')}
                    </button>
                </div>
            </div>
        </div>
    ];

    return (
        <div className="personal-loan-wrapper">
            {showPreview ? (
                <div style={{ position: 'relative', minHeight: '100vh', background: '#ffffff', zIndex: 1001 }}>
                    <div className="no-print" style={{
                        position: 'sticky', top: 0,
                        background: '#0e1a40', color: 'white', padding: '12px 24px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1002
                    }}>
                        <div style={{ fontWeight: 700 }}>{t('personal_loan.buttons.preview_print')}</div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setShowPreview(false)} style={{ background: 'transparent', color: 'white', border: '1px solid #fff', padding: '6px 16px', borderRadius: 4, cursor: 'pointer' }}>Close Preview</button>
                        </div>
                    </div>
                    <div className="print-wrapper">
                        <PersonalLoanPrint data={data} clientInfo={clientInfo} />
                    </div>
                </div>
            ) : (
                <div className="no-print">
                    <div className="pl-progress-bar" style={{ justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="pl-progress-pill">{step + 1} / {stepsList.length}</div>
                            <div className="pl-progress-label">{stepsList[step]}</div>
                        </div>
                        <div className="pl-lang-switcher" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>

                            <button className={`pl-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => i18n.changeLanguage('en')}>EN</button>
                            <button className={`pl-lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => i18n.changeLanguage('mr')}>मराठी</button>
                        </div>
                    </div>

                    <div className="form-container">
                        <div className="form-content">
                            <div className="form-body">
                                {stepContent[step]}
                            </div>

                            <div className="nav-bar">
                                <button className={`btn-back ${step === 0 ? 'disabled' : ''}`} onClick={prev} disabled={step === 0}>
                                    {t('personal_loan.buttons.back')}
                                </button>
                                <div className="nav-page-info">
                                    {t('personal_loan.buttons.page')} {step + 1} / {stepsList.length}
                                </div>
                                {step < stepsList.length - 1 ? (
                                    <button className="btn-next" onClick={next}>{t('personal_loan.buttons.save_next')}</button>
                                ) : (
                                    <div style={{ width: 80 }}></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}