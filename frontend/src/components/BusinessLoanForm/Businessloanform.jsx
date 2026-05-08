import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from "../../context/AppContext";
import './BusinessLoanForm.css';
import BusinessLoanPrint from "./BusinessLoanPrint";
import {
  saveStep1, updateStep1,
  saveStep2, saveStep3, saveStep4,
  saveExtraGuarantor,
  saveStep5, saveStep6, saveStep7,
  submitApplication, getApplicationById
} from '../../services/Businessloanapi';
import API_BASE_URL from '../../config';

// ─── Number to Words ───────────────────────────────────────────────────────
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

// ─── Initial State ─────────────────────────────────────────────────────────
const initState = {
  dinank: '', saCra: '', karjKhate: '', shakha: '', sabasadNo: '',
  arjdarNaav: '', arjdarVay: '', saharjdarNaav: '', saharjdarVay: '',
  karjRakkam: '', akshari: '',
  paratfedKalavadhi: '', pahilaHapta: '', tarikh: '',
  karan: '',
  vaivahik: 'विवाहित', avalambun: '',
  jameen1Naav: '', jameen1Vay: '',
  jameen2Naav: '', jameen2Vay: '',
  extraGuarantors: [],

  bPhoto: null, bNaav: '', bVay: '', bSabasadNo: '', bShares: '', bSharesRakkam: '',
  bVadilNaav: '', bVadilVay: '', bAaiNaav: '', bAaiVay: '',
  bPatta: '', bPinKod: '', bDurdhvani: '', bMobile: '', bEmail: '',
  bJageSwaarup: [], bKalavadhi_m: '', bKalavadhi_v: '', bVaivahik: 'विवाहित', bAvalambun: '',
  bJobType: 'नोकरी',
  bCompany: '', bCompanyPatta: '', bCompanyPin: '', bCompanyTel: '', bCompanyMobile: '', bCompanyEmail: '',
  bVibhag: '', bHudda: '', bEmpCode: '', bKarj_m: '', bKarj_v: '', bSeva: '',
  bMonthlyVetan: '', bKapat: '', bNiwal: '',
  bVaarshik: '', bKharcha: '', bNiwalVaarshik: '',
  bKutumb: '', bKutumbType: 'मासिक',
  bShetiNaav: '', bShetiNaate: '',
  bGaavMukkam: '', bGaavPost: '', bGaavTaluka: '', bGaavJilha: '', bGaavRajya: '', bGaavPin: '', bGaavDurdhvani: '', bGaavMobile: '',
  bOfficeAddress: '', bGavchaAddress: '',
  bPurvKarjPrakar: '', bPurvKhate: '', bPurvRakkam: '', bPurvDin1: '', bPurvDin2: '',
  bJam94aKarjdarNaav: '', bJam94aPrakar: '', bJam94aKhate: '', bJam94aRakkam: '', bJam94aDin1: '', bJam94aDin2: '',
  bJam94bKarjdarNaav: '', bJam94bPrakar: '', bJam94bKhate: '', bJam94bRakkam: '', bJam94bDin1: '', bJam94bDin2: '',
  bKutumb95Naav: '', bKutumb95Prakar: '', bKutumb95Khate: '', bKutumb95Rakkam: '', bKutumb95Din1: '', bKutumb95Din2: '',
  bBank96Naav: '', bBank96Shakha: '', bBank96Prakar: '', bBank96Khate: '', bBank96Rakkam: '', bBank96Din1: '', bBank96Din2: '',
  bDinank: '', bThikan: '',

  g1Photo: null, g1Naav: '', g1Vay: '', g1SabasadNo: '', g1Shares: '', g1SharesRakkam: '',
  g1VadilNaav: '', g1VadilVay: '', g1AaiNaav: '', g1AaiVay: '',
  g1Patta: '', g1PinKod: '', g1Durdhvani: '', g1Mobile: '', g1Email: '',
  g1JageSwaarup: [], g1Kalavadhi_m: '', g1Kalavadhi_v: '', g1Vaivahik: 'विवाहित', g1Avalambun: '',
  g1JobType: 'नोकरी',
  g1Company: '', g1CompanyPatta: '', g1CompanyPin: '', g1CompanyTel: '', g1CompanyMobile: '', g1CompanyEmail: '',
  g1Vibhag: '', g1Hudda: '', g1EmpCode: '', g1Karj_m: '', g1Karj_v: '', g1Seva: '',
  g1MonthlyVetan: '', g1Kapat: '', g1Niwal: '',
  g1Vaarshik: '', g1Kharcha: '', g1NiwalVaarshik: '',
  g1Kutumb: '', g1KutumbType: 'मासिक',
  g1ShetiNaav: '', g1ShetiNaate: '',
  g1GaavMukkam: '', g1GaavPost: '', g1GaavTaluka: '', g1GaavJilha: '', g1GaavRajya: '', g1GaavPin: '', g1GaavDurdhvani: '', g1GaavMobile: '',
  g1PurvKarjPrakar: '', g1PurvKhate: '', g1PurvRakkam: '', g1PurvDin1: '', g1PurvDin2: '',
  g1Jam94aKarjdarNaav: '', g1Jam94aPrakar: '', g1Jam94aKhate: '', g1Jam94aRakkam: '', g1Jam94aDin1: '', g1Jam94aDin2: '',
  g1Jam94bKarjdarNaav: '', g1Jam94bPrakar: '', g1Jam94bKhate: '', g1Jam94bRakkam: '', g1Jam94bDin1: '', g1Jam94bDin2: '',
  g1Kutumb95Naav: '', g1Kutumb95Prakar: '', g1Kutumb95Khate: '', g1Kutumb95Rakkam: '', g1Kutumb95Din1: '', g1Kutumb95Din2: '',
  g1Bank96Naav: '', g1Bank96Shakha: '', g1Bank96Prakar: '', g1Bank96Khate: '', g1Bank96Rakkam: '', g1Bank96Din1: '', g1Bank96Din2: '',
  g1Dinank: '', g1Thikan: '',

  g2Photo: null, g2Naav: '', g2Vay: '', g2SabasadNo: '', g2Shares: '', g2SharesRakkam: '',
  g2VadilNaav: '', g2VadilVay: '', g2AaiNaav: '', g2AaiVay: '',
  g2Patta: '', g2PinKod: '', g2Durdhvani: '', g2Mobile: '', g2Email: '',
  g2JageSwaarup: [], g2Kalavadhi_m: '', g2Kalavadhi_v: '', g2Vaivahik: 'विवाहित', g2Avalambun: '',
  g2JobType: 'नोकरी',
  g2Company: '', g2CompanyPatta: '', g2CompanyPin: '', g2CompanyTel: '', g2CompanyMobile: '', g2CompanyEmail: '',
  g2Vibhag: '', g2Hudda: '', g2EmpCode: '', g2Karj_m: '', g2Karj_v: '', g2Seva: '',
  g2MonthlyVetan: '', g2Kapat: '', g2Niwal: '',
  g2Vaarshik: '', g2Kharcha: '', g2NiwalVaarshik: '',
  g2Kutumb: '', g2KutumbType: 'मासिक',
  g2ShetiNaav: '', g2ShetiNaate: '',
  g2GaavMukkam: '', g2GaavPost: '', g2GaavTaluka: '', g2GaavJilha: '', g2GaavRajya: '', g2GaavPin: '', g2GaavDurdhvani: '', g2GaavMobile: '',
  g2PurvKarjPrakar: '', g2PurvKhate: '', g2PurvRakkam: '', g2PurvDin1: '', g2PurvDin2: '',
  g2Jam94aKarjdarNaav: '', g2Jam94aPrakar: '', g2Jam94aKhate: '', g2Jam94aRakkam: '', g2Jam94aDin1: '', g2Jam94aDin2: '',
  g2Jam94bKarjdarNaav: '', g2Jam94bPrakar: '', g2Jam94bKhate: '', g2Jam94bRakkam: '', g2Jam94bDin1: '', g2Jam94bDin2: '',
  g2Kutumb95Naav: '', g2Kutumb95Prakar: '', g2Kutumb95Khate: '', g2Kutumb95Rakkam: '', g2Kutumb95Din1: '', g2Kutumb95Din2: '',
  g2Bank96Naav: '', g2Bank96Shakha: '', g2Bank96Prakar: '', g2Bank96Khate: '', g2Bank96Rakkam: '', g2Bank96Din1: '', g2Bank96Din2: '',
  g2Dinank: '', g2Thikan: '',

  bizNature: '', bizType: '', bizJagaType: '', bizArea: '',
  bizFirmName: '', bizAddress: '', bizAddress2: '', bizPin: '', bizTel: '', bizEmail: '',
  bizPan: '', bizGumasta: '', bizSalesTax: '', bizVat: '', bizServiceTax: '', bizOtherLicense: '',
  bizLicenseYes: null, bizResidentYes: null,
  bizSince: '', bizExperience: '',
  bizAnnualIncome: '', bizAnnualExpense: '', bizNetIncome: '',
  bizCust1Naav: '', bizCust1Patta: '',
  bizCust2Naav: '', bizCust2Patta: '',
  bizSupp1Naav: '', bizSupp1Patta: '',
  bizSupp2Naav: '', bizSupp2Patta: '',
  bizExtra1: '', bizExtra2: '', bizExtra3: '', bizExtra4: '',

  insCompany: '', insAddress: '', insPolicy: '',
  insDurFrom_d: '', insDurTo_d: '',
  insAmount: '', insPremium: '', insPremiumType: '',
  insLoanYes: null, insLoanBank: '', insLoanAddress: '', insLoanAmount: '',
  insLoanDate_d: '', insLoanBalance: '',
  itPan: '', itSince: '',
  itYear1From: '', itYear1To: '', itAmount1: '', itDate1: '',
  itYear2From: '', itYear2To: '', itAmount2: '', itDate2: '',
  itYear3From: '', itYear3To: '', itAmount3: '', itDate3: '',
  ptNo: '', ptSince: '',
  ptYear1From: '', ptYear1To: '', ptAmount1: '', ptDate1: '',
  ptYear2From: '', ptYear2To: '', ptAmount2: '', ptDate2: '',
  ptYear3From: '', ptYear3To: '', ptAmount3: '', ptDate3: '',

  colPropType: '', colPropTypeOther: '',
  colAddress: '', colAddress2: '', colPin: '', colTel: '', colMobile: '',
  colGalaArea: '', colBuildYear: '', colCitySurvey: '', colPlot: '', colWard: '',
  colCompletionCert: '', colOCDate: '', colConveyanceDate: '', colHousingReg: '', colMemberNo: '',
  colLandArea: '', colNADate: '', colLandCitySurvey: '', colLandPlot: '', colLandWard: '',
  colGutNo: '', colHissaNo: '', colEast: '', colWest: '', colSouth: '', colNorth: '',
  colGovtVal: '', colMarketVal: '',
  colInsCompany: '', colInsAddress: '', colInsAddress2: '', colInsPolicy: '',
  colInsDurFrom_d: '', colInsDurTo_d: '',
  colInsAmount: '', colInsPremium: '',
};

// ─── Helper to build per-extra-guarantor initial fields ────────────────────
function buildExtraGuarantorFields(id) {
  const prefix = `eg_${id}_`;
  return {
    [`${prefix}Photo`]: null,
    [`${prefix}Naav`]: '', [`${prefix}Vay`]: '', [`${prefix}SabasadNo`]: '',
    [`${prefix}Shares`]: '', [`${prefix}SharesRakkam`]: '',
    [`${prefix}VadilNaav`]: '', [`${prefix}VadilVay`]: '',
    [`${prefix}AaiNaav`]: '', [`${prefix}AaiVay`]: '',
    [`${prefix}Patta`]: '', [`${prefix}PinKod`]: '', [`${prefix}Durdhvani`]: '',
    [`${prefix}Mobile`]: '', [`${prefix}Email`]: '',
    [`${prefix}JageSwaarup`]: [], [`${prefix}Kalavadhi_m`]: '', [`${prefix}Kalavadhi_v`]: '',
    [`${prefix}Vaivahik`]: 'विवाहित', [`${prefix}Avalambun`]: '',
    [`${prefix}JobType`]: 'नोकरी',
    [`${prefix}Company`]: '', [`${prefix}CompanyPatta`]: '', [`${prefix}CompanyPin`]: '',
    [`${prefix}CompanyTel`]: '', [`${prefix}CompanyMobile`]: '', [`${prefix}CompanyEmail`]: '',
    [`${prefix}Vibhag`]: '', [`${prefix}Hudda`]: '', [`${prefix}EmpCode`]: '',
    [`${prefix}Karj_m`]: '', [`${prefix}Karj_v`]: '', [`${prefix}Seva`]: '',
    [`${prefix}MonthlyVetan`]: '', [`${prefix}Kapat`]: '', [`${prefix}Niwal`]: '',
    [`${prefix}Vaarshik`]: '', [`${prefix}Kharcha`]: '', [`${prefix}NiwalVaarshik`]: '',
    [`${prefix}Kutumb`]: '', [`${prefix}KutumbType`]: 'मासिक',
    [`${prefix}ShetiNaav`]: '', [`${prefix}ShetiNaate`]: '',
    [`${prefix}GaavMukkam`]: '', [`${prefix}GaavPost`]: '', [`${prefix}GaavTaluka`]: '',
    [`${prefix}GaavJilha`]: '', [`${prefix}GaavRajya`]: '', [`${prefix}GaavPin`]: '',
    [`${prefix}GaavDurdhvani`]: '', [`${prefix}GaavMobile`]: '',
    [`${prefix}OfficeAddress`]: '', [`${prefix}GavchaAddress`]: '',
    [`${prefix}PurvKarjPrakar`]: '', [`${prefix}PurvKhate`]: '', [`${prefix}PurvRakkam`]: '',
    [`${prefix}PurvDin1`]: '', [`${prefix}PurvDin2`]: '',
    [`${prefix}Jam94aKarjdarNaav`]: '', [`${prefix}Jam94aPrakar`]: '', [`${prefix}Jam94aKhate`]: '',
    [`${prefix}Jam94aRakkam`]: '', [`${prefix}Jam94aDin1`]: '', [`${prefix}Jam94aDin2`]: '',
    [`${prefix}Jam94bKarjdarNaav`]: '', [`${prefix}Jam94bPrakar`]: '', [`${prefix}Jam94bKhate`]: '',
    [`${prefix}Jam94bRakkam`]: '', [`${prefix}Jam94bDin1`]: '', [`${prefix}Jam94bDin2`]: '',
    [`${prefix}Kutumb95Naav`]: '', [`${prefix}Kutumb95Prakar`]: '', [`${prefix}Kutumb95Khate`]: '',
    [`${prefix}Kutumb95Rakkam`]: '', [`${prefix}Kutumb95Din1`]: '', [`${prefix}Kutumb95Din2`]: '',
    [`${prefix}Bank96Naav`]: '', [`${prefix}Bank96Shakha`]: '', [`${prefix}Bank96Prakar`]: '',
    [`${prefix}Bank96Khate`]: '', [`${prefix}Bank96Rakkam`]: '', [`${prefix}Bank96Din1`]: '',
    [`${prefix}Bank96Din2`]: '', [`${prefix}Dinank`]: '', [`${prefix}Thikan`]: '',
  };
}

function Select({ label, name, data, setData, options, className = '', error, ...rest }) {
  return (
    <div className={`field ${className}`}>
      {label && <label>{label}</label>}
      <div className="field-control-wrapper">
        <select
          value={data[name] || ''}
          onChange={e => setData(p => ({ ...p, [name]: e.target.value }))}
          style={error ? { borderColor: 'red' } : {}}
          {...rest}
        >
          <option value="">-- Select Year --</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {error && (
          <div className="error-tooltip">
            <div className="error-icon">!</div>
            <div className="error-text">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function TI({ label, name, data, setData, type = 'text', className = '', required = false, error, maxLength, numberOnly, ...rest }) {
  const handleChange = (e) => {
    let val = e.target.value;
    if (numberOnly) { val = val.replace(/\D/g, ''); }
    if (maxLength && val.length > maxLength) { val = val.slice(0, maxLength); }
    setData(p => ({ ...p, [name]: val }));
  };

  const handleKeyDown = (e) => {
    if (!numberOnly) return;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); }
    if (maxLength && data[name]?.toString().length >= maxLength) { e.preventDefault(); }
  };

  return (
    <div className={`field ${className}`}>
      {label && <label>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>}
      <div className="field-control-wrapper">
        <input
          type={type}
          value={data[name] || ''}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
    </div>
  );
}

function TA({ label, name, data, setData, rows = 1, error, ...rest }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <div className="field-control-wrapper">
        <textarea
          rows={rows}
          value={data[name] || ''}
          onChange={e => setData(p => ({ ...p, [name]: e.target.value }))}
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
    </div>
  );
}

function Radio({ label, name, options, data, setData, direction = 'row' }) {
  return (
    <div className="field" style={{ alignItems: direction === 'column' ? 'flex-start' : 'center' }}>
      {label && <label style={{ paddingTop: direction === 'column' ? '4px' : '0' }}>{label}</label>}
      <div className="radio-group" style={{ padding: '4px 0', display: 'flex', flexDirection: direction, gap: direction === 'column' ? '6px' : '12px', flexWrap: 'wrap' }}>
        {options.map(o => (
          <label key={String(o.val)} className="radio-item" style={{ margin: 0 }}>
            <input type="radio" name={name} value={String(o.val)} checked={data[name] === o.val} onChange={() => setData(p => ({ ...p, [name]: o.val }))} />
            {o.label}
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckGroup({ label, name, options, data, setData, direction = 'row' }) {
  const vals = data[name] || [];
  return (
    <div className="field" style={{ alignItems: direction === 'column' ? 'flex-start' : 'center' }}>
      {label && <label style={{ paddingTop: direction === 'column' ? '4px' : '0' }}>{label}</label>}
      <div className="checkbox-group" style={{ padding: '4px 0', display: 'flex', flexDirection: direction, gap: direction === 'column' ? '6px' : '12px', flexWrap: 'wrap' }}>
        {options.map(o => (
          <label key={o.val} className="cb-item" style={{ margin: 0 }}>
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

function PhotoUpload({ label, name, data, setData }) {
  const ref = useRef();
  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setData(p => ({ ...p, [name]: ev.target.result }));
    reader.readAsDataURL(f);
  };
  return (
    <div className="field" style={{ alignItems: 'flex-start', justifyContent: 'flex-start', gap: 0 }}>
      {label && <label>{label}</label>}
      <div className="photo-upload" onClick={() => ref.current.click()}>
        {data[name] ? <img src={data[name]} alt="photo" /> : <><span style={{ fontSize: 24 }}>📷</span>photo<span></span></>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}


// ─── Person Block ──────────────────────────────────────────────────────────
function PersonBlock({ prefix, data, setData, title, lang, nameSource, aadhaarRecords = [], errors = {} }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) => {
    const fieldName = prefix + name;
    return <TI label={L(mr, en)} name={fieldName} data={data} setData={setData} type={type} error={errors[fieldName]} {...extra} />;
  };

  const jageOpts = [
    { val: 'स्वःमालकीचे', label: L('स्वःमालकीचे', 'Self-owned') },
    { val: 'वडिलोपार्जित', label: L('वडिलोपार्जित', 'Ancestral') },
    { val: 'पागडीची', label: L('पागडीची', 'Pagadi') },
    { val: 'कंपनी क्वार्टर्स', label: L('कंपनी क्वार्टर्स', 'Company Qtrs') },
    { val: 'भाडेतत्त्वावर', label: L('भाडेतत्त्वावर', 'Rented') },
  ];
  const maritalOpts = [
    { val: 'विवाहित', label: L('विवाहित', 'Married') },
    { val: 'अविवाहित', label: L('अविवाहित', 'Unmarried') },
  ];
  const incomeOpts = [
    { val: 'मासिक', label: L('मासिक', 'Monthly') },
    { val: 'वार्षिक', label: L('वार्षिक', 'Yearly') },
  ];
  const jobTypeOpts = [
    { val: 'नोकरी', label: L('नोकरी', 'Job') },
    { val: 'व्यवसाय', label: L('व्यवसाय', 'Business') },
  ];

  return (
    <div className="form-step-content" style={{ padding: '2px 0' }}>
      {/* ── Section 1: Personal Information ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{title} — {L('वैयक्तिक माहिती', 'Personal Information')}</div>
        </div>

        {/* Top Area: Personal details and Photo Upload inline */}
        <div style={{ display: 'flex', gap: '1px', padding: '0 12px 0 12px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            {/* Row 1: Full Name | Age | Member No */}
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>
                <TI
                  label={L('संपूर्ण नाव', 'Full Name')}
                  name={prefix + 'Naav'}
                  data={data}
                  setData={setData}
                  error={errors[prefix + 'Naav']}
                  value={data[prefix + 'Naav'] || (nameSource ? data[nameSource] || '' : '')}
                  onChange={e => setData(p => ({
                    ...p,
                    [prefix + 'Naav']: e.target.value,
                    ...(nameSource ? { [nameSource]: e.target.value } : {}),
                  }))}
                />
              </div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('वय', 'Age', 'Vay', 'number')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('सभासद क्रमांक', 'Member No.', 'SabasadNo')}</div>
            </div>

            {/* Row 2: Shares | Shares Amount | Marital Status */}
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('भाग (शेअर्स) संख्या', 'Shares Count', 'Shares', 'number')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('शेअर्स रक्कम ₹', 'Shares Amount ₹', 'SharesRakkam', 'number')}</div>
              <div className="v-col pb-col3 no-colon" style={{ flex: 1.5 }}>
                <Radio label={L('वैवाहिक स्थिती', 'Marital Status')} name={prefix + 'Vaivahik'} options={maritalOpts} data={data} setData={setData} />
              </div>
            </div>

            {/* Row 3: Father Name | Father Age | Mother Name */}
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('वडील/पतीचे नाव', "Father/Husband's Name", 'VadilNaav')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('वय', 'Age', 'VadilVay', 'number')}</div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('आईचे नाव', "Mother's Name", 'AaiNaav')}</div>
            </div>

            {/* Row 4: Mother Age | empty | empty */}
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('वय', 'Age', 'AaiVay', 'number')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}></div>
              <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
            </div>
          </div>

          {/* Photo — aligned to top-right spanning rows 1-4 */}
          <div style={{ marginTop: '4px' }}>
            <PhotoUpload label={L('फोटो', 'Photo')} name={prefix + 'Photo'} data={data} setData={setData} />
          </div>
        </div>

        {/* Bottom Area: Residential Details taking full width beneath photo */}
        <div style={{ padding: '0 12px 8px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('पिन कोड', 'Pin Code', 'PinKod', 'text', { numberOnly: true, maxLength: 6 })}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('ई मेल', 'Email', 'Email')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('दूरध्वनी', 'Telephone', 'Durdhvani', 'text', { numberOnly: true, maxLength: 10 })}</div>
          </div>

          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('मोबाईल', 'Mobile', 'Mobile', 'text', { numberOnly: true, maxLength: 10 })}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('अवलंबून व्यक्ती', 'Dependents', 'Avalambun', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
          </div>

          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('राहण्याचा कालावधी (महिने)', 'Duration (Months)', 'Kalavadhi_m', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('राहण्याचा कालावधी (वर्षे)', 'Duration (Years)', 'Kalavadhi_v', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
          </div>

          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>
              <CheckGroup label={L('जागेचे स्वरूप', 'Property Type')} name={prefix + 'JageSwaarup'} options={jageOpts} data={data} setData={setData} />
            </div>
          </div>

          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>
              <TA label={L('राहण्याचा पत्ता', 'Residential Address')} name={prefix + 'Patta'} data={data} setData={setData} rows={1} />
            </div>
          </div>
          {prefix === 'b' && (
            <>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1 }}>
                  <TA label={L('ऑफिस पत्ता', 'Office Address')} name={prefix + 'OfficeAddress'} data={data} setData={setData} rows={1} />
                </div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1 }}>
                  <TA label={L('गावचा पत्ता', 'Gavcha Address')} name={prefix + 'GavchaAddress'} data={data} setData={setData} rows={1} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Section 2: Job/Business Details ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('नोकरी/व्यवसायाचा तपशील', 'Job/Business Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 0.6, minWidth: 'max-content', paddingRight: '20px' }}>
              <Radio label={L('प्रकार', 'Type')} name={prefix + 'JobType'} options={jobTypeOpts} data={data} setData={setData} />
            </div>
            <div className="v-col lbl-med">{ti('कंपनीचे नाव', 'Company Name', 'Company')}</div>
            <div className="v-col lbl-med">{ti('विभाग', 'Department', 'Vibhag')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col lbl-long">{ti('हुद्दा', 'Designation', 'Hudda')}</div>
            <div className="v-col lbl-med">{ti('कर्मचारी कोड', 'Employee Code', 'EmpCode')}</div>
            <div className="v-col lbl-med">{ti('सेवानिवृत्ती दिनांक', 'Retirement Date', 'Seva', 'date')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col lbl-long">{ti('पिन कोड', 'Pin Code', 'CompanyPin', 'text', { numberOnly: true, maxLength: 6 })}</div>
            <div className="v-col lbl-med">{ti('दूरध्वनी', 'Telephone', 'CompanyTel', 'text', { numberOnly: true, maxLength: 10 })}</div>
            <div className="v-col lbl-med">{ti('ई मेल/वेबसाईट', 'Email/Website', 'CompanyEmail')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col lbl-long">{ti('मोबाईल', 'Mobile', 'CompanyMobile', 'text', { numberOnly: true, maxLength: 10 })}</div>
            <div className="v-col lbl-med">{ti('व्यवसायाचा कालावधी (महिने)', 'Duration (Months)', 'Karj_m', 'number')}</div>
            <div className="v-col lbl-med">{ti('व्यवसायाचा कालावधी (वर्षे)', 'Duration (Years)', 'Karj_v', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ width: '100%', flex: '1 1 100%' }}>
              <TA label={L('कंपनीचा पत्ता', 'Company Address')} name={prefix + 'CompanyPatta'} data={data} setData={setData} rows={1} />
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
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('उत्पन्न', 'Income Details')}</div>
          </div>

          <div style={{ padding: '0 12px 12px 12px' }}>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('१) मासिक वेतन ₹', 'Monthly Salary ₹', 'MonthlyVetan', 'number')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('एकूण कपात ₹', 'Total Deductions ₹', 'Kapat', 'number')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('निव्वळ वेतन ₹', 'Net Salary ₹', 'Niwal', 'number')}</div>
            </div>

            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('२) वार्षिक उत्पन्न ₹', 'Annual Income ₹', 'Vaarshik', 'number')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('सर्व खर्च कपात ₹', 'Total Expenses ₹', 'Kharcha', 'number')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('निव्वळ वार्षिक उत्पन्न ₹', 'Net Annual Income ₹', 'NiwalVaarshik', 'number')}</div>
            </div>

            <div className="v-form-row" style={{ marginBottom: '4px', alignItems: 'flex-start' }}>
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>
                <TI label={L('३) कुटुंबाचे निव्वळ उत्पन्न ₹', 'Family Net Income')} name={prefix + 'Kutumb'} data={data} setData={setData} type="number" className="short-input" />
              </div>
              <div className="no-colon" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                {incomeOpts.map(o => (
                  <label key={String(o.val)} className="radio-item" style={{ margin: 0 }}>
                    <input type="radio" name={prefix + 'KutumbType'} value={String(o.val)} checked={data[prefix + 'KutumbType'] === o.val} onChange={() => setData(p => ({ ...p, [prefix + 'KutumbType']: o.val }))} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Village Address ── */}
        <div style={{ flex: 1.2, border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
            <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('घर/शेती व गावचा पत्ता', 'Village Address')}</div>
          </div>

          <div style={{ padding: '0 12px 12px 12px' }}>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('मालक नाव', 'Owner Name', 'ShetiNaav')}</div>
            </div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('नाते', 'Relation', 'ShetiNaate')}</div>
            </div>

            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('मुक्काम', 'Village', 'GaavMukkam')}</div>
              <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('पोस्ट', 'Post', 'GaavPost')}</div>
            </div>

            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('तालुका', 'Taluka', 'GaavTaluka')}</div>
              <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('जिल्हा', 'District', 'GaavJilha')}</div>
            </div>

            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('राज्य', 'State', 'GaavRajya')}</div>
              <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('पिन कोड', 'Pin Code', 'GaavPin', 'text', { numberOnly: true, maxLength: 6 })}</div>
            </div>

            <div className="v-form-row" style={{ marginBottom: '2px' }}>
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('दूरध्वनी', 'Telephone', 'GaavDurdhvani', 'text', { numberOnly: true, maxLength: 10 })}</div>
              <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('मोबाईल', 'Mobile', 'GaavMobile', 'text', { numberOnly: true, maxLength: 10 })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Previous Loans ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#f43f5e' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('मागील कर्जांचा तपशील', 'Previous Loan Details')}</div>
        </div>

        <div style={{ padding: '4px 12px 12px 12px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

          {/* Section 5.1 & 5.3 (Old Loans / Self) mapping to col-4 logic */}
          <div style={{ flex: 1.2 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c2d12', padding: '0 0 4px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>१) {L('संस्थेकडून पूर्वी कर्ज', 'Previous Loan')}</div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('कर्ज प्रकार', 'Loan Type', 'PurvKarjPrakar')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'PurvKhate')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount ₹', 'PurvRakkam', 'number')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('तारीख १', 'Date 1', 'PurvDin1', 'date')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('तारीख २', 'Date 2', 'PurvDin2', 'date')}</div></div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c2d12', padding: '16px 0 4px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>२) {L('कुटुंब कर्ज', 'Family Loans')}</div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('नाव', 'Name', 'Kutumb95Naav')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('कर्ज प्रकार', 'Loan Type', 'Kutumb95Prakar')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'Kutumb95Khate')}</div></div>
            <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col1" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount ₹', 'Kutumb95Rakkam', 'number')}</div></div>
          </div>

          {/* Section 5.2 & 5.4 (Guarantors & Other Banks) mapping to col-8 logic */}
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c2d12', padding: '0 0 4px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>३) {L('जामीनदार व इतर तपशील', 'Guarantor & Others')}</div>

            <div style={{ display: 'flex', gap: '16px' }}>
              {[
                { key: 'Jam94a', mr: 'अ) जामीनदार', en: 'A) Guarantor' },
                { key: 'Jam94b', mr: 'ब) जामीनदार', en: 'B) Guarantor' },
              ].map(item => (
                <div key={item.key} style={{ flex: 1, padding: '8px', background: '#fcfaf5', borderRadius: '6px', border: '1px solid #fcebb6', marginBottom: '12px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>{lang === 'mr' ? item.mr : item.en}</div>
                  <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('नाव', "Name", item.key + 'KarjdarNaav')}</div></div>
                  <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', item.key + 'Khate')}</div></div>
                  <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount', item.key + 'Rakkam', 'number')}</div></div>
                  <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('तारीख १', 'Date 1', item.key + 'Din1', 'date')}</div></div>
                  <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('तारीख २', 'Date 2', item.key + 'Din2', 'date')}</div></div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c2d12', padding: '8px 0 4px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px' }}>४) {L('इतर बँक कर्ज', 'Other Bank Loans')}</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('बँक', 'Bank', 'Bank96Naav')}</div></div>
                <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('शाखा', 'Branch', 'Bank96Shakha')}</div></div>
                <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('प्रकार', 'Loan Type', 'Bank96Prakar')}</div></div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'Bank96Khate')}</div></div>
                <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount ₹', 'Bank96Rakkam', 'number')}</div></div>
                <div className="v-form-row" style={{ marginBottom: '2px' }}><div className="v-col pb-col3" style={{ flex: 1 }}>{ti('तारीख १', 'Date 1', 'Bank96Din1', 'date')}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Place & Date */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('स्वाक्षरी', 'Signature')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('ठिकाण :', 'Place :', 'Thikan')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('दिनांक :', 'Date :', 'Dinank', 'date')}</div>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Business Details Block ────────────────────────────────────────────────
function BusinessDetailsBlock({ data, setData, lang, errors = {} }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} error={errors[name]} {...extra} />;
  const ta = (mr, en, name, rows = 1, extra = {}) =>
    <TA label={L(mr, en)} name={name} data={data} setData={setData} rows={rows} error={errors[name]} {...extra} />;

  const bizTypeOpts = [
    { val: 'पब्लिक लि.', label: L('पब्लिक लि.', 'Public Ltd.') },
    { val: 'प्रा. लि.', label: L('प्रा. लि.', 'Pvt. Ltd.') },
    { val: 'भागीदारी', label: L('भागीदारी', 'Partnership') },
    { val: 'खाजगी', label: L('खाजगी', 'Proprietary') },
    { val: 'व्यापारी ', label: L('व्यापारी ', 'Trade') },
    { val: 'शेती', label: L('शेती', 'Agriculture') },
    { val: 'इतर', label: L('इतर', 'Other') },
  ];

  const bizJagaOpts = [
    { val: 'स्व:मालकीची', label: L('स्व:मालकीची', 'Self-owned') },
    { val: 'वडिलोपार्जित', label: L('वडिलोपार्जित', 'Ancestral') },
    { val: 'पागडीची', label: L('पागडीची', 'Pagadi') },
    { val: 'भाडेतत्त्वावर', label: L('भाडेतत्त्वावर', 'Rented') },
    { val: 'लिजवर', label: L('लिजवर', 'Lease') },
  ];

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>
      {/* ── Section 1: Business Nature ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#0e1a40' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('अर्जदाराच्या व्यवसायाची माहिती', "Applicant's Business Information")}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ta('व्यवसायाचे कामकाजाचे स्वरूप', 'Nature of Business Work', 'bizNature', 1)}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>
              <Radio label={L('व्यवसायाचे स्वरूप', 'Business Type')} name="bizType" options={bizTypeOpts} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1 no-colon" style={{ flex: 1, flexDirection: 'column' }}>
              <Radio label={L('व्यवसायाच्या जागेचे स्वरूप (अ)', 'Business Premises Type (a)')} name="bizJagaType" options={bizJagaOpts} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('क्षेत्रफळ (चौ. फुट/मिटर)', 'Area (Sq.Ft/Mtr)', 'bizArea', 'number')}</div>
            <div style={{ flex: 2 }} />
          </div>
        </div>
      </div>

      {/* ── Section 2: Company/Firm Details ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('कंपनी/फर्म माहिती', 'Company/Firm Information')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('कंपनी/फर्मचे नाव', 'Company/Firm Name', 'bizFirmName')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ta('संपूर्ण पत्ता', 'Full Address', 'bizAddress', 1)}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>{ta('\u00A0', '\u00A0', 'bizAddress2', 1)}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('पिन कोड', 'Pin Code', 'bizPin', 'text', { numberOnly: true, maxLength: 6 })}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('दूरध्वनी/मोबाईल', 'Tel/Mobile', 'bizTel', 'text', { numberOnly: true, maxLength: 10 })}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('ई मेल आयडी', 'Email ID', 'bizEmail')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('पॅन कार्ड क्र.', 'PAN Card No.', 'bizPan')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('गुमास्ता लायसन्स क्र.', 'Gumasta License No.', 'bizGumasta')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('विक्रीकर क्र.', 'Sales Tax No.', 'bizSalesTax')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('व्हॅट (VAT) क्र.', 'VAT No.', 'bizVat')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('सर्व्हिस टॅक्स क्र.', 'Service Tax No.', 'bizServiceTax')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('इतर लायसन्स', 'Other Licenses', 'bizOtherLicense')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1 no-colon" style={{ flex: 1.5 }}>
              <Radio label={L('सर्व लायसन्स आहेत काय?', 'All Licenses Available?')} name="bizLicenseYes" options={[{ val: true, label: L('होय', 'Yes') }, { val: false, label: L('नाही', 'No') }]} data={data} setData={setData} />
            </div>
            <div className="v-col pb-col2 no-colon" style={{ flex: 1.5 }}>
              <Radio label={L('लघुउद्योग/वाहन विभागाचे रहिवासी?', 'Small Industry/Transport Resident?')} name="bizResidentYes" options={[{ val: true, label: L('होय', 'Yes') }, { val: false, label: L('नाही', 'No') }]} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('व्यवसाय केव्हापासून?', 'Business Running Since', 'bizSince')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('व्यवसायाचा अनुभव', 'Business Experience', 'bizExperience')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Income ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('वार्षिक उत्पन्न तपशील', 'Annual Income Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('एकूण वार्षिक उत्पन्न ₹', 'Total Annual Income ₹', 'bizAnnualIncome', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('एकूण वार्षिक खर्च ₹', 'Total Annual Expenses ₹', 'bizAnnualExpense', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('निव्वळ वार्षिक ₹', 'Net Annual Income ₹', 'bizNetIncome', 'number')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Customers & Suppliers ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#f59e0b' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('नियमित ग्राहक व पुरवठादार', 'Regular Customers & Suppliers')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            {[1, 2].map(i => (
              <div key={`cust${i}`} className="v-col" style={{ border: '1px solid #fcebb6', borderRadius: '4px', padding: '8px', background: '#fcfaf5' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', marginBottom: '8px', textTransform: 'uppercase' }}>{L(`ग्राहक ${i}`, `Customer ${i}`)}</div>
                <div className="v-form-row" style={{ marginTop: '2px' }}>
                  <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('नाव', 'Name', `bizCust${i}Naav`)}</div>
                  <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('पत्ता', 'Address', `bizCust${i}Patta`)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="v-form-row" style={{ marginTop: '8px' }}>
            {[1, 2].map(i => (
              <div key={`supp${i}`} className="v-col" style={{ border: '1px solid #fcebb6', borderRadius: '4px', padding: '8px', background: '#fcfaf5' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', marginBottom: '8px', textTransform: 'uppercase' }}>{L(`पुरवठादार ${i}`, `Supplier ${i}`)}</div>
                <div className="v-form-row" style={{ marginTop: '2px' }}>
                  <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('नाव', 'Name', `bizSupp${i}Naav`)}</div>
                  <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('पत्ता', 'Address', `bizSupp${i}Patta`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Insurance & Tax Block ─────────────────────────────────────────────────
function InsuranceTaxBlock({ data, setData, lang, errors = {} }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} error={errors[name]} {...extra} />;
  const ta = (mr, en, name, rows = 1, extra = {}) =>
    <TA label={L(mr, en)} name={name} data={data} setData={setData} rows={rows} error={errors[name]} {...extra} />;

  const financialYearOptions = (() => {
    const opts = [];
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 25; y <= currentYear + 5; y++) {
      const nextY = (y + 1).toString().slice(-2);
      opts.push(`${y}-${nextY}`);
    }
    return opts.reverse();
  })();

  const yearRows = (prefix, labelKey, typeLabel) => (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', marginBottom: '8px', textTransform: 'uppercase' }}>{labelKey}</div>
      <div style={{ overflowX: 'auto', border: '1px solid #fed7aa', borderRadius: '4px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#fff7ed' }}>
              <th style={{ padding: '8px', borderBottom: '1px solid #fed7aa', textAlign: 'left', color: '#7c2d12' }}>{L('आर्थिक वर्ष', 'Financial Year')}</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #fed7aa', textAlign: 'left', color: '#7c2d12' }}>{L(`${typeLabel} रक्कम ₹`, `${typeLabel} Amount ₹`)}</th>
              <th style={{ padding: '8px', borderBottom: '1px solid #fed7aa', textAlign: 'left', color: '#7c2d12' }}>{L(`${typeLabel} भरणा दिनांक`, `${typeLabel} Filing Date`)}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i} style={{ borderBottom: i < 3 ? '1px solid #fcebb6' : 'none' }}>
                <td style={{ padding: '4px 8px' }}>
                  <select
                    className="bl-select"
                    value={data[`${prefix}Year${i}From`] || ''}
                    onChange={e => setData(p => ({ ...p, [`${prefix}Year${i}From`]: e.target.value }))}
                    style={{ width: '100%', height: '32px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  >
                    <option value="">-- Year --</option>
                    {financialYearOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </td>
                <td style={{ padding: '4px 8px' }}>
                  <input
                    type="text"
                    placeholder="₹"
                    value={data[`${prefix}Amount${i}`] || ''}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setData(p => ({ ...p, [`${prefix}Amount${i}`]: val }));
                    }}
                    style={{ width: '100%', height: '32px', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '0 8px', fontSize: '13px' }}
                  />
                </td>
                <td style={{ padding: '4px 8px' }}>
                  <input
                    type="date"
                    value={data[`${prefix}Date${i}`] || ''}
                    onChange={e => setData(p => ({ ...p, [`${prefix}Date${i}`]: e.target.value }))}
                    style={{ width: '100%', height: '32px', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '0 8px', fontSize: '13px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>
      {/* ── Section 1: Insurance ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#0e1a40' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('जीवन विमा तपशील', 'Life Insurance Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('विमा कंपनीचे नाव *', 'Insurance Company Name *', 'insCompany')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('पॉलिसी नंबर', 'Policy Number', 'insPolicy')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('विमा कालावधी (From)', 'Period (From)', 'insDurFrom_d', 'date')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('विमा कालावधी (To)', 'Period (To)', 'insDurTo_d', 'date')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('विमा रक्कम ₹', 'Insurance Amount ₹', 'insAmount', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('हप्ता रक्कम ₹', 'Premium Amount ₹', 'insPremium', 'number')}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ta('संपूर्ण पत्ता', 'Full Address', 'insAddress', 1)}</div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col pb-col1 no-colon" style={{ flex: 1.2 }}>
              <Radio
                label={L('हप्ता प्रकार', 'Premium Type')}
                name="insPremiumType"
                options={[
                  { val: 'मासिक', label: L('मासिक', 'Monthly') },
                  { val: 'त्रैमासिक', label: L('त्रैमासिक', 'Quarterly') },
                  { val: 'अर्धवार्षिक', label: L('अर्धवार्षिक', 'Half-Yearly') },
                  { val: 'वार्षिक', label: L('वार्षिक', 'Annual') },
                ]}
                data={data} setData={setData}
              />
            </div>
            <div className="v-col pb-col2 no-colon" style={{ flex: 1 }}>
              <Radio label={L(<>विम्याच्या पॉलिसी तारणावर<br />कर्ज घेतलेले आहे का?</>, 'Loan against policy?')} name="insLoanYes" options={[{ val: true, label: L('होय', 'Yes') }, { val: false, label: L('नाही', 'No') }]} data={data} setData={setData} />
            </div>
            <div style={{ flex: 0.8 }}></div>
          </div>
          {data.insLoanYes === true && (
            <div style={{ border: '1px solid #fcebb6', borderRadius: '4px', padding: '8px', background: '#fcfaf5', marginTop: '8px' }}>
              <div className="v-form-row">
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('बँक/संस्था नाव', 'Bank/Institution', 'insLoanBank')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('कर्ज रक्कम ₹', 'Loan Amount ₹', 'insLoanAmount', 'number')}</div>
              </div>
              <div className="v-form-row">
                <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('कर्ज दिनांक', 'Loan Date', 'insLoanDate_d', 'date')}</div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('शिल्लक कर्ज ₹', 'Balance ₹', 'insLoanBalance', 'number')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: IT details ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('आयकर (Income Tax) तपशील', 'Income Tax Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('पॅन कार्ड क्र.', 'PAN Card No.', 'itPan')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('भरणा कधीपासून? सन', 'IT Filing Since (Year)', 'itSince')}</div>
          </div>
          {yearRows('it', L('आयकर वर्षनिहाय तपशील', 'Income Tax Year-wise Details'), L('आयकर', 'Income Tax'))}
        </div>
      </div>

      {/* ── Section 3: PT details ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#0e1a40' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('व्यवसाय कर (Professional Tax) तपशील', 'Professional Tax Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('प्रोफेशनल टॅक्स क्र.', 'PT No.', 'ptNo')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('भरणा कधीपासून? सन', 'PT Filing Since (Year)', 'ptSince')}</div>
          </div>
          {yearRows('pt', L('व्यवसाय कर वर्षनिहाय तपशील', 'PT Year-wise Details'), L('व्यवसाय कर', 'Professional Tax'))}
        </div>
      </div>

      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#f59e0b' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('व्यवसाया विषयी अतिरिक्त माहिती', 'Additional Business Information')}</div>
        </div>
        <div style={{ padding: '12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('१.', '1.', 'bizExtra1')}</div>
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('२.', '2.', 'bizExtra2')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('३.', '3.', 'bizExtra3')}</div>
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('४.', '4.', 'bizExtra4')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Collateral Block ──────────────────────────────────────────────────────
function CollateralBlock({ data, setData, lang, errors = {} }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} error={errors[name]} {...extra} />;
  const ta = (mr, en, name, rows = 1, extra = {}) =>
    <TA label={L(mr, en)} name={name} data={data} setData={setData} rows={rows} error={errors[name]} {...extra} />;

  const propTypeOpts = [
    { val: 'गाळा', label: L('गाळा', 'Shop/Gala') },
    { val: 'फ्लॅट', label: L('फ्लॅट', 'Flat') },
    { val: 'अकृषक शेत जमीन', label: L('अकृषक शेत जमीन', 'Non-agri Land') },
    { val: 'शेत जमीन', label: L('शेत जमीन', 'Agri Land') },
    { val: 'इतर', label: L('इतर', 'Other') },
  ];

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#0e1a40' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('तारण मिळकतीचा तपशील', 'Collateral Property Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1 no-colon" style={{ flex: 1 }}>
              <Radio label={L('मिळकतीचे स्वरूप', 'Property Type')} name="colPropType" options={propTypeOpts} data={data} setData={setData} />
            </div>
          </div>
          {data.colPropType === 'इतर' && (
            <div className="v-form-row">
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('इतर तपशील', 'Other Details', 'colPropTypeOther')}</div>
            </div>
          )}
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ta('मिळकतीचा संपूर्ण पत्ता', 'Full Address of Property', 'colAddress', 1)}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('पिन कोड', 'Pin Code', 'colPin', 'text', { numberOnly: true, maxLength: 6 })}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('दूरध्वनी क्र.', 'Telephone No.', 'colTel', 'text', { numberOnly: true, maxLength: 10 })}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('मोबाईल क्र.', 'Mobile No.', 'colMobile', 'text', { numberOnly: true, maxLength: 10 })}</div>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('गाळा/फ्लॅट तपशील', 'Shop/Flat Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('क्षेत्रफळ (चौ. फुट/मिटर)', 'Area (Sq.Ft/Mtr)', 'colGalaArea')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('इमारत बांधकाम वर्ष', 'Construction Year', 'colBuildYear')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('सिटी सर्व्हे नंबर', 'City Survey No.', 'colCitySurvey')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('प्लॉट नंबर', 'Plot No.', 'colPlot')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('वॉर्ड नंबर', 'Ward No.', 'colWard')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('हौसिंग सोसा. रजि. नं.', 'Housing Soc. Reg. No.', 'colHousingReg')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('बांधकाम पूर्णत्व दाखला दि.', 'Comp. Cert. Date', 'colCompletionCert', 'date')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('ओ. सी. दिनांक', 'OC Date', 'colOCDate', 'date')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('कनव्हेन्स डिड दिनांक', 'Conveyance Date', 'colConveyanceDate', 'date')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('सभासद नंबर', 'Member No.', 'colMemberNo')}</div>
            <div style={{ flex: 2 }}></div>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#0e1a40' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('अकृषक/शेत जमीन तपशील', 'Non-agri/Agri Land Details')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('क्षेत्र (हेक्टर-आर)', 'Area (Hectare-Are)', 'colLandArea')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('एन. ए. ऑर्डर दिनांक', 'NA Order Date', 'colNADate', 'date')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('सिटी सर्व्हे नंबर', 'City Survey No.', 'colLandCitySurvey')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('प्लॉट नंबर', 'Plot No.', 'colLandPlot')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('वॉर्ड नंबर', 'Ward No.', 'colLandWard')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('गट नंबर', 'Gut No.', 'colGutNo')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('हिस्सा नंबर', 'Hissa No.', 'colHissaNo')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('पूर्वेस', 'East Boundary', 'colEast')}</div>
            <div className="v-col pb-col3" style={{ flex: 1 }}>{ti('पश्चिमेस', 'West Boundary', 'colWest')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('दक्षिणेस', 'South Boundary', 'colSouth')}</div>
            <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('उत्तरेस', 'North Boundary', 'colNorth')}</div>
            <div style={{ flex: 1 }}></div>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '8px' }}>
          <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('मिळकतीची किंमत व विमा', 'Property Valuation & Insurance')}</div>
        </div>
        <div style={{ padding: '0 12px 12px 12px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('शासकीय मुल्यांकन ₹', 'Govt. Valuation ₹', 'colGovtVal', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('बाजारभाव ₹', 'Market Value ₹', 'colMarketVal', 'number')}</div>
          </div>
          <div style={{ borderTop: '1px solid #fcebb6', margin: '8px 0', paddingTop: '8px' }}>
            <div className="v-form-row">
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('विमा कंपनीचे नाव', 'Insurance Co.', 'colInsCompany')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('पॉलिसी नंबर', 'Policy No.', 'colInsPolicy')}</div>
            </div>
            <div className="v-form-row">
              <div className="v-col pb-col1" style={{ flex: 1 }}>{ti('विमा रक्कम ₹', 'Sum Assured ₹', 'colInsAmount', 'number')}</div>
              <div className="v-col pb-col2" style={{ flex: 1 }}>{ti('हप्ता रक्कम ₹', 'Premium ₹', 'colInsPremium', 'number')}</div>
            </div>
            <div className="v-form-row">
              <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('विमा कालावधी (From)', 'Policy From', 'colInsDurFrom_d', 'date')}</div>
              <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('विमा कालावधी (To)', 'Policy To', 'colInsDurTo_d', 'date')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function BusinessLoanForm() {
  const { clientInfo, showToast } = useApp();
  const { id: paramId } = useParams();
  const [lang, setLang] = useState('mr');
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initState);
  const [showPreview, setShowPreview] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ─── Map Backend DTO back to Flat React state ─────────────────────────────
  const mapDtoToState = (app) => {
    if (!app) return initState;

    const res = { ...initState };

    // Step 1
    res.dinank = app.applicationDate ? app.applicationDate.split('T')[0] : '';
    res.saCra = app.memberNo || '';
    res.karjKhate = app.loanAccountNo || '';
    res.shakha = app.branch || '';
    res.arjdarNaav = app.applicantName || '';
    res.arjdarVay = app.applicantAge || '';
    res.karjRakkam = app.loanAmount || '';
    res.akshari = app.loanAmountInWords || '';
    res.paratfedKalavadhi = app.repaymentMonths || '';
    res.pahilaHapta = app.firstInstallmentAfterMonths || '';
    res.tarikh = app.installmentDate || '';
    res.karan = app.purpose || '';
    res.vaivahik = app.maritalStatus || 'विवाहित';
    res.avalambun = app.dependents || '';
    res.jameen1Naav = app.guarantor1Name || '';
    res.jameen1Vay = app.guarantor1Age || '';
    res.jameen2Naav = app.guarantor2Name || '';
    res.jameen2Vay = app.guarantor2Age || '';
    res.jameen3Naav = app.guarantor3Name || '';
    res.jameen3Vay = app.guarantor3Age || '';

    // Extra Guarantors List
    res.extraGuarantors = (app.extraGuarantors || []).map(eg => ({
      id: parseInt(eg.frontendId || '0')
    }));

    const mapPerson = (person, prefix) => {
      if (!person) return;
      res[`${prefix}Photo`] = person.photoBase64 || null;
      res[`${prefix}Naav`] = person.fullName || '';
      res[`${prefix}Vay`] = person.age || '';
      res[`${prefix}SabasadNo`] = person.memberNo || '';
      res[`${prefix}Shares`] = person.sharesCount || '';
      res[`${prefix}SharesRakkam`] = person.sharesAmount || '';
      res[`${prefix}VadilNaav`] = person.fatherHusbandName || '';
      res[`${prefix}VadilVay`] = person.fatherHusbandAge || '';
      res[`${prefix}AaiNaav`] = person.motherName || '';
      res[`${prefix}AaiVay`] = person.motherAge || '';
      res[`${prefix}Patta`] = person.residentialAddress || '';
      res[`${prefix}PinKod`] = person.pinCode || '';
      res[`${prefix}Durdhvani`] = person.telephone || '';
      res[`${prefix}Mobile`] = person.mobile || '';
      res[`${prefix}Email`] = person.email || '';
      res[`${prefix}JageSwaarup`] = person.propertyTypes || [];
      res[`${prefix}Kalavadhi_m`] = person.residenceMonths || '';
      res[`${prefix}Kalavadhi_v`] = person.residenceYears || '';
      res[`${prefix}Vaivahik`] = person.maritalStatus || 'विवाहित';
      res[`${prefix}Avalambun`] = person.dependents || '';
      res[`${prefix}OfficeAddress`] = person.officeAddress || '';
      res[`${prefix}GavchaAddress`] = person.gavchaAddress || '';
      res[`${prefix}Company`] = person.companyName || '';
      res[`${prefix}CompanyPatta`] = person.companyAddress || '';
      res[`${prefix}CompanyPin`] = person.companyPinCode || '';
      res[`${prefix}CompanyTel`] = person.companyTelephone || '';
      res[`${prefix}CompanyMobile`] = person.companyMobile || '';
      res[`${prefix}CompanyEmail`] = person.companyEmail || '';
      res[`${prefix}Vibhag`] = person.department || '';
      res[`${prefix}Hudda`] = person.designation || '';
      res[`${prefix}EmpCode`] = person.employeeCode || '';
      res[`${prefix}Karj_m`] = person.employmentMonths || '';
      res[`${prefix}Karj_v`] = person.employmentYears || '';
      res[`${prefix}Seva`] = person.retirementDate ? person.retirementDate.split('T')[0] : '';
      res[`${prefix}MonthlyVetan`] = person.monthlySalary || '';
      res[`${prefix}Kapat`] = person.deductions || '';
      res[`${prefix}Niwal`] = person.netSalary || '';
      res[`${prefix}Vaarshik`] = person.annualBusinessIncome || '';
      res[`${prefix}Kharcha`] = person.totalExpenses || '';
      res[`${prefix}NiwalVaarshik`] = person.netAnnualIncome || '';
      res[`${prefix}Kutumb`] = person.familyIncome || '';
      res[`${prefix}KutumbType`] = person.familyIncomeType || 'मासिक';
      res[`${prefix}ShetiNaav`] = person.propertyOwnerName || '';
      res[`${prefix}ShetiNaate`] = person.propertyOwnerRelation || '';
      res[`${prefix}GaavMukkam`] = person.villageMukkam || '';
      res[`${prefix}GaavPost`] = person.villagePost || '';
      res[`${prefix}GaavTaluka`] = person.villageTaluka || '';
      res[`${prefix}GaavJilha`] = person.villageDistrict || '';
      res[`${prefix}GaavRajya`] = person.villageState || '';
      res[`${prefix}GaavPin`] = person.villagePinCode || '';
      res[`${prefix}GaavDurdhvani`] = person.villageTelephone || '';
      res[`${prefix}GaavMobile`] = person.villageMobile || '';
      res[`${prefix}PurvKarjPrakar`] = person.prevLoanType || '';
      res[`${prefix}PurvKhate`] = person.prevLoanAccountNo || '';
      res[`${prefix}PurvRakkam`] = person.prevLoanAmount || '';
      res[`${prefix}PurvDin1`] = person.prevLoanTakenDate ? person.prevLoanTakenDate.split('T')[0] : '';
      res[`${prefix}PurvDin2`] = person.prevLoanRepaidDate ? person.prevLoanRepaidDate.split('T')[0] : '';
      res[`${prefix}Jam94aKarjdarNaav`] = person.guar94aBorrowerName || '';
      res[`${prefix}Jam94aPrakar`] = person.guar94aLoanType || '';
      res[`${prefix}Jam94aKhate`] = person.guar94aAccountNo || '';
      res[`${prefix}Jam94aRakkam`] = person.guar94aAmount || '';
      res[`${prefix}Jam94aDin1`] = person.guar94aTakenDate ? person.guar94aTakenDate.split('T')[0] : '';
      res[`${prefix}Jam94aDin2`] = person.guar94aRepaidDate ? person.guar94aRepaidDate.split('T')[0] : '';
      res[`${prefix}Jam94bKarjdarNaav`] = person.guar94bBorrowerName || '';
      res[`${prefix}Jam94bPrakar`] = person.guar94bLoanType || '';
      res[`${prefix}Jam94bKhate`] = person.guar94bAccountNo || '';
      res[`${prefix}Jam94bRakkam`] = person.guar94bAmount || '';
      res[`${prefix}Jam94bDin1`] = person.guar94bTakenDate ? person.guar94bTakenDate.split('T')[0] : '';
      res[`${prefix}Jam94bDin2`] = person.guar94bRepaidDate ? person.guar94bRepaidDate.split('T')[0] : '';
      res[`${prefix}Kutumb95Naav`] = person.familyLoanMemberName || '';
      res[`${prefix}Kutumb95Prakar`] = person.familyLoanType || '';
      res[`${prefix}Kutumb95Khate`] = person.familyLoanAccountNo || '';
      res[`${prefix}Kutumb95Rakkam`] = person.familyLoanAmount || '';
      res[`${prefix}Kutumb95Din1`] = person.familyLoanTakenDate ? person.familyLoanTakenDate.split('T')[0] : '';
      res[`${prefix}Kutumb95Din2`] = person.familyLoanRepaidDate ? person.familyLoanRepaidDate.split('T')[0] : '';
      res[`${prefix}Bank96Naav`] = person.otherBankName || '';
      res[`${prefix}Bank96Shakha`] = person.otherBankBranch || '';
      res[`${prefix}Bank96Prakar`] = person.otherBankLoanType || '';
      res[`${prefix}Bank96Khate`] = person.otherBankAccountNo || '';
      res[`${prefix}Bank96Rakkam`] = person.otherBankLoanAmount || '';
      res[`${prefix}Bank96Din1`] = person.otherBankLoanTakenDate ? person.otherBankLoanTakenDate.split('T')[0] : '';
      res[`${prefix}Bank96Din2`] = person.otherBankLoanRepaidDate ? person.otherBankLoanRepaidDate.split('T')[0] : '';
      res[`${prefix}Thikan`] = person.placeOfSign || '';
      res[`${prefix}Dinank`] = person.dateOfSign ? person.dateOfSign.split('T')[0] : '';
    };

    mapPerson(app.borrower, 'b');
    mapPerson((app.guarantors || []).find(g => g.guarantorNumber === 1), 'g1');
    mapPerson((app.guarantors || []).find(g => g.guarantorNumber === 2), 'g2');

    (app.extraGuarantors || []).forEach(eg => {
      const prefix = `eg_${eg.frontendId}_`;
      mapPerson(eg, prefix);
    });

    // Step 5 - Business Info
    if (app.businessInfo) {
      const b = app.businessInfo;
      res.bizNature = b.businessNature || '';
      res.bizType = b.businessType || '';
      res.bizJagaType = b.businessPropertyType || '';
      res.bizArea = b.floorArea || '';
      res.bizFirmName = b.firmName || '';
      res.bizAddress = b.address || '';
      res.bizAddress2 = b.address2 || '';
      res.bizPin = b.pinCode || '';
      res.bizTel = b.phone || '';
      res.bizEmail = b.email || '';
      res.bizPan = b.panCardNo || '';
      res.bizGumasta = b.gumastaLicenseNo || '';
      res.bizSalesTax = b.salesTaxNo || '';
      res.bizVat = b.vatNo || '';
      res.bizServiceTax = b.serviceTaxNo || '';
      res.bizOtherLicense = b.otherLicense || '';
      res.bizLicenseYes = b.allLicensesAvailable;
      res.bizResidentYes = b.isSmallIndustryResident;
      res.bizSince = b.sinceWhen || '';
      res.bizExperience = b.experience || '';
      res.bizAnnualIncome = b.totalAnnualIncome || '';
      res.bizAnnualExpense = b.totalAnnualExpenses || '';
      res.bizNetIncome = b.netAnnualIncome || '';
      res.bizCust1Naav = b.customer1Name || '';
      res.bizCust1Patta = b.customer1Address || '';
      res.bizCust2Naav = b.customer2Name || '';
      res.bizCust2Patta = b.customer2Address || '';
      res.bizSupp1Naav = b.supplier1Name || '';
      res.bizSupp1Patta = b.supplier1Address || '';
      res.bizSupp2Naav = b.supplier2Name || '';
      res.bizSupp2Patta = b.supplier2Address || '';
      res.bizExtra1 = b.extra1 || '';
      res.bizExtra2 = b.extra2 || '';
      res.bizExtra3 = b.extra3 || '';
      res.bizExtra4 = b.extra4 || '';
    }

    // Step 6 - Insurance & Tax
    if (app.insuranceTaxInfo) {
      const i = app.insuranceTaxInfo;
      res.insCompany = i.insuranceCompanyName || '';
      res.insAddress = i.insuranceAddress || '';
      res.insPolicy = i.insurancePolicyNo || '';
      res.insDurFrom_d = i.insuranceFrom ? i.insuranceFrom.split('T')[0] : '';
      res.insDurTo_d = i.insuranceTo ? i.insuranceTo.split('T')[0] : '';
      res.insAmount = i.insuranceAmount || '';
      res.insPremium = i.insurancePremium || '';
      res.insPremiumType = i.insurancePremiumFrequency || 'मासिक';
      res.insLoanYes = i.hasPolicyLoan;
      res.insLoanBank = i.policyLoanBankName || '';
      res.insLoanAddress = i.policyLoanBankAddress || '';
      res.insLoanAmount = i.policyLoanAmount || '';
      res.insLoanDate_d = i.policyLoanDate ? i.policyLoanDate.split('T')[0] : '';
      res.insLoanBalance = i.policyLoanBalance || '';
      res.itPan = i.panCardNo || '';
      res.itSince = i.incomeTaxSince || '';
      res.itYear1From = i.itYear1From || '';
      res.itYear1To = i.itYear1To || '';
      res.itAmount1 = i.itAmount1 || '';
      res.itDate1 = i.itDate1 ? i.itDate1.split('T')[0] : '';
      res.itYear2From = i.itYear2From || '';
      res.itYear2To = i.itYear2To || '';
      res.itAmount2 = i.itAmount2 || '';
      res.itDate2 = i.itDate2 ? i.itDate2.split('T')[0] : '';
      res.itYear3From = i.itYear3From || '';
      res.itYear3To = i.itYear3To || '';
      res.itAmount3 = i.itAmount3 || '';
      res.itDate3 = i.itDate3 ? i.itDate3.split('T')[0] : '';
      res.ptNo = i.proTaxNo || '';
      res.ptSince = i.proTaxSince || '';
      res.ptYear1From = i.ptYear1From || '';
      res.ptYear1To = i.ptYear1To || '';
      res.ptAmount1 = i.ptAmount1 || '';
      res.ptDate1 = i.ptDate1 ? i.ptDate1.split('T')[0] : '';
      res.ptYear2From = i.ptYear2From || '';
      res.ptYear2To = i.ptYear2To || '';
      res.ptAmount2 = i.ptAmount2 || '';
      res.ptDate2 = i.ptDate2 ? i.ptDate2.split('T')[0] : '';
      res.ptYear3From = i.ptYear3From || '';
      res.ptYear3To = i.ptYear3To || '';
      res.ptAmount3 = i.ptAmount3 || '';
      res.ptDate3 = i.ptDate3 ? i.ptDate3.split('T')[0] : '';
    }

    // Step 7 - Collateral
    if (app.collateral) {
      const c = app.collateral;
      res.colPropType = c.propertyType || '';
      res.colPropTypeOther = c.propertyTypeOther || '';
      res.colAddress = c.propertyAddress || '';
      res.colAddress2 = c.propertyAddress2 || '';
      res.colPin = c.propertyPinCode || '';
      res.colTel = c.propertyTelephone || '';
      res.colMobile = c.propertyMobile || '';
      res.colGalaArea = c.galaArea || '';
      res.colBuildYear = c.buildingConstructionYear || '';
      res.colCitySurvey = c.citySurveyNo || '';
      res.colPlot = c.plotNo || '';
      res.colWard = c.wardNo || '';
      res.colCompletionCert = c.completionCertDate ? c.completionCertDate.split('T')[0] : '';
      res.colOCDate = c.ocDate ? c.ocDate.split('T')[0] : '';
      res.colConveyanceDate = c.conveyanceDeedDate ? c.conveyanceDeedDate.split('T')[0] : '';
      res.colHousingReg = c.housingSocietyRegNo || '';
      res.colMemberNo = c.memberNo || '';
      res.colLandArea = c.landArea || '';
      res.colNADate = c.naOrderDate ? c.naOrderDate.split('T')[0] : '';
      res.colLandCitySurvey = c.landCitySurveyNo || '';
      res.colLandPlot = c.landPlotNo || '';
      res.colLandWard = c.landWardNo || '';
      res.colGutNo = c.gutNo || '';
      res.colHissaNo = c.hissaNo || '';
      res.colEast = c.eastBoundary || '';
      res.colWest = c.westBoundary || '';
      res.colSouth = c.southBoundary || '';
      res.colNorth = c.northBoundary || '';
      res.colGovtVal = c.govtValuation || '';
      res.colMarketVal = c.marketValue || '';
      res.colInsCompany = c.insuranceCompanyName || '';
      res.colInsAddress = c.insuranceAddress || '';
      res.colInsAddress2 = c.insuranceAddress2 || '';
      res.colInsPolicy = c.insurancePolicyNo || '';
      res.colInsDurFrom_d = c.insuranceFrom ? c.insuranceFrom.split('T')[0] : '';
      res.colInsDurTo_d = c.insuranceTo ? c.insuranceTo.split('T')[0] : '';
      res.colInsAmount = c.insuranceAmount || '';
      res.colInsPremium = c.insurancePremium || '';
    }

    // Normalize nulls to empty strings for all keys
    Object.keys(res).forEach(k => {
      if (res[k] === null) res[k] = '';
    });

    return res;
  };
  const [aadhaarRecords, setAadhaarRecords] = useState([]);
  const [errors, setErrors] = useState({});

  const L = (mr, en) => lang === 'mr' ? mr : en;

  // ── Validation Helpers ──
  const checkMobile = (v) => v && !/^\d{10}$/.test(v) ? L('१० अंकी मोबाईल नंबर आवश्यक', '10-digit mobile required') : null;
  const checkPin = (v) => v && !/^\d{6}$/.test(v) ? L('६ अंकी पिन कोड आवश्यक', '6-digit pin required') : null;
  const checkEmail = (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? L('अवैध ईमेल', 'Invalid email') : null;
  const checkNum = (v) => v && isNaN(v) ? L('केवळ अंक', 'Numbers only') : null;

  const validate = () => {
    // All validation removed as per user request.
    // Clear any existing errors to ensure tooltips disappear.
    setErrors({});
    return true;
  };

  // ── Smart Sync: Auto-fill detail blocks from Step 1 ──
  useEffect(() => {
    setData(prev => {
      const up = { ...prev };
      // Applicant
      if (prev.arjdarNaav && !prev.bNaav) up.bNaav = prev.arjdarNaav;
      if (prev.arjdarVay && !prev.bVay) up.bVay = prev.arjdarVay;
      // G1
      if (prev.jameen1Naav && !prev.g1Naav) up.g1Naav = prev.jameen1Naav;
      if (prev.jameen1Vay && !prev.g1Vay) up.g1Vay = prev.jameen1Vay;
      // G2
      if (prev.jameen2Naav && !prev.g2Naav) up.g2Naav = prev.jameen2Naav;
      if (prev.jameen2Vay && !prev.g2Vay) up.g2Vay = prev.jameen2Vay;
      // Extra G
      (prev.extraGuarantors || []).forEach(g => {
        const p = `eg_${g.id}_`;
        if (prev[p + 'Naav_s1'] && !prev[p + 'Naav']) up[p + 'Naav'] = prev[p + 'Naav_s1'];
        if (prev[p + 'Vay_s1'] && !prev[p + 'Vay']) up[p + 'Vay'] = prev[p + 'Vay_s1'];
      });
      return up;
    });
  }, [data.arjdarNaav, data.arjdarVay, data.jameen1Naav, data.jameen1Vay, data.jameen2Naav, data.jameen2Vay, JSON.stringify(data.extraGuarantors)]);

  const extraGuarantors = data.extraGuarantors || [];

  // ── Build dynamic steps list ──
  const stepsList = [
    L('मूलभूत माहिती', 'Basic Information'),
    L('कर्जदाराची माहिती', "Borrower's Information"),
    L('जामिनदार क्र. १', 'Guarantor No. 1'),
    L('जामिनदार क्र. २', 'Guarantor No. 2'),
    ...extraGuarantors.map((g, i) => L(`जामिनदार क्र. ${i + 3}`, `Guarantor No. ${i + 3}`)),
    L('व्यवसायाची माहिती', 'Business Information'),
    L('विमा व करविषयक माहिती', 'Insurance & Tax Information'),
    L('तारण मिळकत', 'Collateral Property'),
    L('सारांश व सबमिट', 'Review & Submit'),
  ];

  // Fetch verified Aadhaar records on mount
  useEffect(() => {
    const fetchAadhaarHistory = async () => {
      try {
        const token = sessionStorage.getItem('tushgpt_jwt');
        const res = await fetch(`${API_BASE_URL}/AadharProxy/history`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const records = await res.json();
          setAadhaarRecords(records || []);
        }
      } catch (err) {
        console.error('Failed to fetch Aadhaar history:', err);
      }
    };
    fetchAadhaarHistory();
  }, []);

  // Auto-fill from Aadhaar when navigated from Loans module ("+ New Application")
  const location = useLocation();
  const navigate = useNavigate();
  // ── Persistence Layer ──
  const draftKey = location.state?.aadharData?.id
    ? `bl_form_draft_${location.state.aadharData.id}`
    : 'bl_form_draft_general';

  const draftLoadedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.dinank) parsed.dinank = new Date().toISOString().split('T')[0];
        setData(p => ({ ...p, ...parsed }));
        if (!draftLoadedRef.current) {
          showToast(lang === 'mr' ? "अर्ध्यावर सोडलेली माहिती लोड केली गेली आहे." : "Unfinished data has been loaded.", 'success');
          draftLoadedRef.current = true;
        }
      }
    } catch (e) { console.error("Error loading draft", e); }
  }, [draftKey, lang, showToast]);

  useEffect(() => {
    if (data !== initState) {
      localStorage.setItem(draftKey, JSON.stringify(data));
    }
  }, [data, draftKey]);

  const applyAadharData = (aadharData) => {
    // Robustly handle field naming variations (Aadhar records use both camelCase and PascalCase)
    const name = aadharData.fullName || aadharData.Name || aadharData.name || '';
    const rawAddress = aadharData.Address || aadharData.address || '';
    const photo = aadharData.CapturedPhoto || aadharData.capturedPhoto || aadharData.Photo || aadharData.photo || aadharData.profile_image || null;
    const dob = aadharData.dob || aadharData.Dob || aadharData.DOB || '';
    const aadharNo = aadharData.aadhaarNo || aadharData.AadhaarNo || aadharData.aadhar || aadharData.Aadhar || '';
    const phone = aadharData.Mobile || aadharData.mobile || aadharData.phone || '';

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

    // Calculate age from DOB
    let age = '';
    if (dob) {
      const parts = dob.split(/[\/\-]/);
      let birthDate = null;
      if (parts.length === 3) {
        if (parts[0].length === 4) { // YYYY-MM-DD
          birthDate = new Date(dob);
        } else { // DD-MM-YYYY or DD/MM/YYYY
          birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      } else {
        birthDate = new Date(dob);
      }
      if (birthDate && !isNaN(birthDate.getTime())) {
        age = String(Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
      }
    }

    setData(p => ({
      ...p,
      arjdarNaav: name || p.arjdarNaav,
      arjdarVay: age || p.arjdarVay,
      bNaav: name || p.bNaav,
      bVay: age || p.bVay,
      bPatta: formattedAddress || p.bPatta,
      bPhoto: photo || p.bPhoto,
      bAadhar: aadharNo || p.bAadhar,
      bDob: dob || p.bDob,
      bMobile: (phone && phone !== 'Linked' && phone !== 'Not Linked') ? phone : p.bMobile,
    }));

    // Clear the navigation state so it doesn't re-apply on re-render
    window.history.replaceState({}, document.title);
  };

  useEffect(() => {
    const fetchFullAadharDetail = async (partialData) => {
      // Apply immediately with what we have (fast)
      applyAadharData(partialData);
      try {
        // If we already have address and photo, no need to fetch
        if ((partialData.Address || partialData.address) && (partialData.Photo || partialData.photo || partialData.CapturedPhoto || partialData.capturedPhoto)) {
          applyAadharData(partialData);
          return;
        }

        // If no ID, we can't fetch more
        if (!partialData.id && !partialData.Id) {
          applyAadharData(partialData);
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
        } else {
          applyAadharData(partialData);
        }
      } catch (error) {
        console.error("Error fetching full Aadhar detail:", error);
        applyAadharData(partialData);
      }
    };

    if (location.state?.aadharData) {
      fetchFullAadharDetail(location.state.aadharData);
    }
  }, [location.state]);

  const fetchedIdRef = useRef(null);

  // SET APPLICATION ID IF PASSED (FOR EDITING)
  useEffect(() => {
    const editId = paramId || location.state?.id;
    if (!editId || fetchedIdRef.current === editId) return;

    setApplicationId(editId);
    // Fetch full data to populate form
    const fetchFullData = async () => {
      try {
        showToast(L('माहिती लोड होत आहे...', 'Loading application data...'), 'info');
        const responseData = await getApplicationById(editId);
        if (responseData) {
          const mapped = mapDtoToState(responseData);
          setData(mapped);
          setApplicationId(editId);
          showToast(L('बदल करण्यासाठी अर्ज लोड केला आहे', 'Application loaded for editing'), 'success');
          fetchedIdRef.current = editId;
        }
      } catch (err) {
        console.error("Error fetching business loan:", err);
      }
    };
    fetchFullData();
  }, [paramId, location.state?.id, showToast]);


  const toggleLang = (l) => {
    setLang(l);
    if (data.karjRakkam) {
      const fn = l === 'mr' ? numberToWordsMr : numberToWordsEn;
      setData(p => ({ ...p, akshari: fn(p.karjRakkam) }));
    }
  };

  const handleRakkam = e => {
    const v = e.target.value;
    const fn = lang === 'mr' ? numberToWordsMr : numberToWordsEn;
    setData(p => ({ ...p, karjRakkam: v, akshari: fn(v) }));
  };

  // ── Maps step index → which API to call ──
  const saveCurrentStep = async (currentStep) => {
    console.log(`[Form Debug] Saving Step: ${currentStep}, ApplicationID: ${applicationId}`);
    const numExtra = (data.extraGuarantors || []).length;

    if (currentStep === 0) {
      if (applicationId) {
        await updateStep1(applicationId, data);
      } else {
        const result = await saveStep1(data);
        setApplicationId(result.id);
      }
    } else if (currentStep === 1) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      await saveStep2(applicationId, data);
    } else if (currentStep === 2) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      await saveStep3(applicationId, data);
    } else if (currentStep === 3) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      await saveStep4(applicationId, data);
    } else if (currentStep >= 4 && currentStep < 4 + numExtra) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      const egIdx = currentStep - 4;
      const g = (data.extraGuarantors || [])[egIdx];
      if (g) await saveExtraGuarantor(applicationId, data, g, egIdx);
    } else if (currentStep === 4 + numExtra) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      await saveStep5(applicationId, data);
    } else if (currentStep === 5 + numExtra) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      await saveStep6(applicationId, data);
    } else if (currentStep === 6 + numExtra) {
      if (!applicationId) throw new Error('Application not created yet. Please go back to Step 1.');
      await saveStep7(applicationId, data);
    }
    // Review step (last) — no save, handled by handleSubmit
  };

  // ── Scroll to top after every step change ──
  const scrollToTop = () => {
    const els = [
      document.querySelector('.master-content-wrapper'),
      document.querySelector('.business-loan-wrapper'),
      document.querySelector('.form-container'),
      document.querySelector('.form-card'),
      document.querySelector('.form-body'),
      document.documentElement,
      document.body,
    ];
    els.forEach(el => { if (el) el.scrollTop = 0; });
    window.scrollTo(0, 0);
    try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { }
  };

  useEffect(() => {
    scrollToTop();
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, [step]);

  // ── FIX: was calling undefined `next`, now correctly calls handleNext ──
  const handleNext = async () => {
    if (!validate()) {
      scrollToTop();
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveCurrentStep(step);
      setStep(s => Math.min(s + 1, stepsList.length - 1));
    } catch (err) {
      console.error('Save error:', err);
      setSaveError(err?.response?.data?.message || err?.message || 'Error saving. Please try again.');
      scrollToTop();
    } finally {
      setIsSaving(false);
    }
  };

  const prev = () => { setStep(s => Math.max(s - 1, 0)); };

  const addGuarantor = () => {
    const id = Date.now();
    const newFields = buildExtraGuarantorFields(id);
    setData(p => ({
      ...p,
      extraGuarantors: [...(p.extraGuarantors || []), { id }],
      ...newFields,
    }));
  };

  const removeGuarantor = (id) => {
    // Calculate which step this guarantor is at
    const egIdx = data.extraGuarantors.findIndex(g => g.id === id);
    const guarantorStep = 4 + egIdx; // step index of the removed guarantor

    setData(p => {
      const updated = { ...p, extraGuarantors: p.extraGuarantors.filter(g => g.id !== id) };
      // Clean up fields for removed guarantor
      const prefix = `eg_${id}_`;
      Object.keys(updated).forEach(k => { if (k.startsWith(prefix)) delete updated[k]; });
      return updated;
    });

    // If current step is at or after the removed guarantor's step, go back one
    setStep(s => {
      if (s >= guarantorStep) return Math.max(s - 1, 0);
      return s;
    });
  };

  const handleSubmit = async () => {
    if (!applicationId) {
      alert(L('कृपया आधी फॉर्म सेव करा.', 'Please save the form first.'));
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await submitApplication(applicationId);
      localStorage.removeItem(draftKey);
      setStep(0);
      setData(initState);
      setApplicationId(null);
      showToast(L('व्यवसाय कर्ज अर्ज यशस्वीरीत्या सबमिट झाला!', 'Business loan application submitted successfully!'), 'success');
      navigate('/loans', { state: { activeTab: 'applications' } });
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Submit failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const totalGuarantors = 2 + extraGuarantors.length;

  // ── Dynamic step content ──
  const extraGuarantorSteps = extraGuarantors.map((g, idx) => (
    <PersonBlock
      key={`eg_${g.id}`}
      prefix={`eg_${g.id}_`}
      data={data}
      setData={setData}
      title={L(`जामिनदार क्रमांक ${idx + 3} ची माहिती`, `Guarantor No. ${idx + 3} Information`)}
      lang={lang}
      aadhaarRecords={aadhaarRecords}
      errors={errors}
    />
  ));

  const stepContent = [
    // ── STEP 1: Basic Info ──
    <div key={0} className="form-step-content" style={{ padding: '2px 0' }}>
      {/* Section 1: Basic Info */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('मूलभूत माहिती', 'Basic Information')}</div>
        </div>
        <div style={{ padding: '0 12px 4px 12px' }}>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('दिनांक :', 'Date :')} name="dinank" data={data} setData={setData} type="date" error={errors.dinank} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('शाखा :', 'Branch :')} name="shakha" data={data} setData={setData} error={errors.shakha} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('स. क्र./साम स./छ. क्र. :', 'Member No. :')} name="saCra" data={data} setData={setData} error={errors.saCra} />
            </div>
          </div>
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('कर्ज खाते क्र. :', 'Loan A/C No. :')} name="karjKhate" data={data} setData={setData} error={errors.karjKhate} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('सभासद क्रमांक :', 'Member Number :')} name="sabasadNo" data={data} setData={setData} error={errors.sabasadNo} />
            </div>
            <div style={{ flex: 1.5 }}></div>
          </div>
        </div>
      </div>

      {/* Section 2: Loan Details */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('कर्ज तपशील', 'Loan Details')}</div>
        </div>
        <div style={{ padding: '0 12px 4px 12px' }}>
          {/* Row 1 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('अर्जदार श्री./श्रीमती :', "Applicant Name :")} name="arjdarNaav" data={data} setData={setData} error={errors.arjdarNaav} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('वय (वर्षे) :', 'Age (Years) :')} name="arjdarVay" data={data} setData={setData} type="number" error={errors.arjdarVay} />
            </div>
            <div className="v-col no-colon" style={{ flex: 1.5 }}>
              <Radio label={L('वैवाहिक स्थिती', 'Marital Status')} name="vaivahik" options={[{ val: 'विवाहित', label: L('विवाहित', 'Married') }, { val: 'अविवाहित', label: L('अविवाहित', 'Unmarried') }]} data={data} setData={setData} />
            </div>
          </div>

          {/* Row 2: Co-applicant */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('सह-अर्जदार श्री./सौ./श्रीमती :', "Co-applicant Name :")} name="saharjdarNaav" data={data} setData={setData} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('सह-अर्जदार वय (वर्षे) :', 'Co-applicant Age :')} name="saharjdarVay" data={data} setData={setData} type="number" />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('अवलंबून व्यक्ती संख्या :', 'Dependents :')} name="avalambun" data={data} setData={setData} type="number" />
            </div>
          </div>

          {/* Row 3 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('कर्ज रक्कम ₹ :', 'Loan Amount ₹ :')} name="karjRakkam" data={data} setData={setData} type="number" error={errors.karjRakkam} onChange={handleRakkam} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('परतफेड (महिने) :', 'Repayment (Months) :')} name="paratfedKalavadhi" data={data} setData={setData} type="number" error={errors.paratfedKalavadhi} />
            </div>
            <div className="v-col" style={{ flex: 1.5 }}>
              <TI label={L('हप्ता तारीख :', 'Inst. Date :')} name="tarikh" data={data} setData={setData} type="number" error={errors.tarikh} />
            </div>
          </div>

          {/* Row 4 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col" style={{ flex: 1 }}>
              <TI label={L('पहिला हप्ता (महिन्यांनंतर) :', 'First Installment :')} name="pahilaHapta" data={data} setData={setData} type="number" error={errors.pahilaHapta} />
            </div>
            <div style={{ flex: 2 }}></div>
          </div>

          {/* Row 5 */}
          <div className="v-form-row" style={{ marginBottom: '4px' }}>
            <div className="v-col" style={{ width: '100%', flex: '1 1 100%' }}>
              <TA label={L('कर्जाचा उद्देश / कारण :', 'Loan Purpose / Reason :')} name="karan" data={data} setData={setData} rows={1} />
            </div>
          </div>

          {/* Row 6 */}
          <div className="v-form-row" style={{ marginBottom: '2px' }}>
            <div className="v-col" style={{ width: '100%', flex: '1 1 100%' }}>
              <TI label={L('अक्षरी :', 'In Words :')} name="akshari" data={data} setData={setData} readOnly style={{ background: '#f8f9fa' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Guarantors */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('जामिनदारांची माहिती', 'Guarantors Information')}</div>
        </div>
        <div style={{ padding: '0 12px 8px 12px' }}>
          {/* Guarantor 1 & 2: Side-by-side cards */}
          <div className="v-form-row" style={{ alignItems: 'stretch', gap: '8px', marginBottom: '4px' }}>
            {/* card 1 */}
            <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', background: '#ffffff', padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', padding: '4px 8px', marginBottom: '4px' }}>१) {L('जामीनदार', 'Guarantor')}</div>
              <div style={{ padding: '0 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <TI label={L('संपूर्ण नाव: श्री./श्रीमती :', 'Full Name: Mr./Mrs. :')} name="jameen1Naav" data={data} setData={setData} error={errors.jameen1Naav} />
                <TI label={L('वय (वर्षे) :', 'Age (Years) :')} name="jameen1Vay" data={data} setData={setData} type="number" error={errors.jameen1Vay} />
              </div>
            </div>
            {/* card 2 */}
            <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', background: '#ffffff', padding: '0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12', padding: '4px 8px', marginBottom: '4px' }}>२) {L('जामीनदार', 'Guarantor')}</div>
              <div style={{ padding: '0 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <TI label={L('संपूर्ण नाव: श्री./श्रीमती :', 'Full Name: Mr./Mrs. :')} name="jameen2Naav" data={data} setData={setData} error={errors.jameen2Naav} />
                <TI label={L('वय (वर्षे) :', 'Age (Years) :')} name="jameen2Vay" data={data} setData={setData} type="number" error={errors.jameen2Vay} />
              </div>
            </div>
          </div>

          {/* Dynamic Extra Guarantors */}
          {extraGuarantors.map((g, idx) => (
            <div key={g.id} style={{ border: '1px solid #fed7aa', borderRadius: '4px', background: '#ffffff', padding: '0', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', marginBottom: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{idx + 3}) {L('जामीनदार', 'Guarantor')}</div>
                <button type="button" onClick={() => removeGuarantor(g.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
              <div style={{ padding: '0 8px 8px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <TI label={L('संपूर्ण नाव: श्री./श्रीमती :', 'Full Name: Mr./Mrs. :')} name={`eg_${g.id}_Naav_s1`} data={data} setData={setData} error={errors[`eg_${g.id}_Naav_s1`]} />
                <TI label={L('वय (वर्षे) :', 'Age (Years) :')} name={`eg_${g.id}_Vay_s1`} data={data} setData={setData} type="number" error={errors[`eg_${g.id}_Vay_s1`]} />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addGuarantor}
            style={{
              marginTop: '12px', background: '#ffffff', border: '1.5px solid #2563eb', color: '#2563eb', fontWeight: 800, cursor: 'pointer', fontSize: '11px',
              padding: '6px 16px', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(37,99,235,0.1)'
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: '900' }}>+</span> {L('जामीनदार जोडा', 'Add Guarantor')}
          </button>
        </div>
      </div>
    </div>,

    // ── STEP 2: Borrower ──
    <PersonBlock key={1} prefix="b" data={data} setData={setData} title={L('कर्जदाराची माहिती', "Borrower's Information")} lang={lang} aadhaarRecords={aadhaarRecords} errors={errors} />,

    // ── STEP 3: Guarantor 1 ──
    <PersonBlock key={2} prefix="g1" data={data} setData={setData} title={L('जामिनदार क्रमांक १ ची माहिती', 'Guarantor No. 1 Information')} lang={lang} nameSource="jameen1Naav" aadhaarRecords={aadhaarRecords} errors={errors} />,

    // ── STEP 4: Guarantor 2 ──
    <PersonBlock key={3} prefix="g2" data={data} setData={setData} title={L('जामिनदार क्रमांक २ ची माहिती', 'Guarantor No. 2 Information')} lang={lang} nameSource="jameen2Naav" aadhaarRecords={aadhaarRecords} errors={errors} />,

    // ── Dynamic Extra Guarantor Steps ──
    ...extraGuarantorSteps,

    // ── Business Details ──
    <BusinessDetailsBlock key="biz" data={data} setData={setData} lang={lang} errors={errors} />,

    // ── Insurance & Tax ──
    <InsuranceTaxBlock key="ins" data={data} setData={setData} lang={lang} errors={errors} />,

    // ── Collateral ──
    <CollateralBlock key="col" data={data} setData={setData} lang={lang} errors={errors} />,

    // ── Review ──
    <div key="review" style={{ textAlign: 'center', padding: '40px 20px', minHeight: '300px' }}>
      <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
        {lang === 'en'
          ? 'Review all details before printing and submitting.'
          : 'प्रिंट करण्यापूर्वी आणि सबमिट करण्यापूर्वी सर्व तपशील तपासा.'}
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Preview Button */}
        <button
          className="bl-btn"
          onClick={() => setShowPreview(true)}
          style={{
            background: '#0e1a40',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          {lang === 'en' ? 'Preview' : 'पूर्वदृश्य'}
        </button>

        {/* Submit Button */}
        <button
          className="bl-btn"
          onClick={handleSubmit}
          disabled={isSaving}
          style={{
            background: '#22c55e',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? (
            <span>{lang === 'en' ? 'Submitting...' : 'पाठवत आहे...'}</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {lang === 'en' ? 'Submit Final Application' : 'अंतिम अर्ज सादर करा'}
            </>
          )}
        </button>
      </div>

      {saveError && (
        <div style={{ marginTop: '24px', padding: '12px 20px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontSize: '13px', maxWidth: '400px', margin: '24px auto' }}>
          ⚠️ {saveError}
        </div>
      )}
    </div>,
  ];

  // ── Preview Mode ──
  if (showPreview) {
    return (
      <div className="business-loan-wrapper preview-mode">
        <div className="bl-preview-toolbar no-print" style={{ background: '#0e1a40', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 }}>
          <div className="bl-preview-title" style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>{L('व्यवसाय कर्ज - प्रिंट प्रीव्ह्यू', 'Business Loan - Print Preview')}</div>
          <button
            style={{
              background: 'transparent',
              border: '2px solid white',
              borderRadius: '6px',
              color: 'white',
              padding: '8px 20px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onClick={() => setShowPreview(false)}
          >
            {L('प्रीव्ह्यू बंद करा', 'Close Preview')}
          </button>
        </div>
        <div className="bl-preview-content">
          <div className="bl-print-area-wrapper">
            <BusinessLoanPrint data={data} clientInfo={{}} lang={lang} />
          </div>
        </div>
      </div>
    );
  }

  // ── Form Mode ──
  return (
    <div className="business-loan-wrapper no-print">
      {/* Progress Bar */}
      <div className="bl-progress-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="bl-progress-pill">{step + 1} / {stepsList.length}</div>
          <div className="bl-progress-label">{stepsList[step]}</div>
        </div>
        <div className="bl-lang-switcher">
          <button className={`bl-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => toggleLang('en')}>EN</button>
          <button className={`bl-lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => toggleLang('mr')}>मराठी</button>
        </div>
      </div>

      {/* Error Banner */}
      {saveError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 16px', margin: '8px 16px', borderRadius: 6, fontSize: 13 }}>
          ⚠️ {saveError}
          <button onClick={() => setSaveError(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 700 }}>✕</button>
        </div>
      )}

      <div className="form-container">
        <div className="form-card">
          <div className="form-body">{stepContent[step]}</div>
          <div className="nav-bar">
            <button
              className={`bl-btn bl-btn-secondary ${step === 0 ? 'bl-btn-disabled' : ''}`}
              onClick={prev}
              disabled={step === 0 || isSaving}
            >
              {L('मागे', 'Back')}
            </button>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
              {L('पान', 'Page')} {step + 1} / {stepsList.length}
            </div>
            {step < stepsList.length - 1 ? (
              <button
                className="bl-btn bl-btn-primary"
                onClick={handleNext}
                disabled={isSaving}
              >
                {isSaving ? L('जतन होत आहे...', 'Saving...') : L('जतन करा व पुढे', 'Save & Next')}
              </button>
            ) : (
              <div style={{ width: 100 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}