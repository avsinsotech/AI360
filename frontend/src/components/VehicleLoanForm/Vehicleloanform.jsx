import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import './Vehicleloanform.css';
import VehicleLoanPrint from "./Vehicleloanprint";
import { useApp } from "../../context/AppContext";
import { submitApplication, submitDraft, getApplicationByNo, getApplicationById } from "../../services/Vehicleloanapi";

// ─── Number to Words (Marathi) ─────────────────────────────────────────────
// ─── Initial State ─────────────────────────────────────────────────────────
const initState = {
  // Step 1 — Basic
  dinank: '', saCra: '', karjKhate: '', shakha: '',
  arjdarNaav: '', arjdarVay: '',
  karjRakkam: '', akshari: '',
  paratfedKalavadhi: '', pahilaHapta: '', tarikh: '',
  karan: '',
  vaivahik: 'विवाहित', avalambun: '',
  vyajDar: '',
  jameen1Naav: '', jameen1Vay: '',
  jameen2Naav: '', jameen2Vay: '',
  jameen3Naav: '', jameen3Vay: '',
  extraGuarantors: [],
  thikan: '',

  // Step 2 — Borrower
  bPhoto: null, bNaav: '', bVay: '', bSabasadNo: '', bShares: '', bSharesRakkam: '',
  bVadilNaav: '', bVadilVay: '', bAaiNaav: '', bAaiVay: '',
  bPatta: '', bPinKod: '', bDurdhvani: '', bMobile: '', bEmail: '',
  bJageSwaarup: [], bKalavadhi_m: '', bKalavadhi_v: '', bVaivahik: 'विवाहित', bAvalambun: '',
  bCompany: '', bCompanyPatta: '', bCompanyPin: '', bCompanyTel: '', bCompanyMobile: '', bCompanyEmail: '',
  bVibhag: '', bHudda: '', bEmpCode: '', bKarj_m: '', bKarj_v: '', bSeva: '',
  bMonthlyVetan: '', bKapat: '', bNiwal: '',
  bVaarshik: '', bKharcha: '', bNiwalVaarshik: '',
  bKutumb: '', bKutumbType: 'मासिक',
  bShetiNaav: '', bShetiNaate: '',
  bGaavMukkam: '', bGaavPost: '', bGaavTaluka: '', bGaavJilha: '', bGaavRajya: '', bGaavPin: '', bGaavDurdhvani: '', bGaavMobile: '',
  bPurvKarjPrakar: '', bPurvKhate: '', bPurvRakkam: '', bPurvDin1: '', bPurvDin2: '',
  bJam94aKarjdarNaav: '', bJam94aPrakar: '', bJam94aKhate: '', bJam94aRakkam: '', bJam94aDin1: '', bJam94aDin2: '',
  bJam94bKarjdarNaav: '', bJam94bPrakar: '', bJam94bKhate: '', bJam94bRakkam: '', bJam94bDin1: '', bJam94bDin2: '',
  bKutumb95Naav: '', bKutumb95Prakar: '', bKutumb95Khate: '', bKutumb95Rakkam: '', bKutumb95Din1: '', bKutumb95Din2: '',
  bBank96Naav: '', bBank96Shakha: '', bBank96Prakar: '', bBank96Khate: '', bBank96Rakkam: '', bBank96Din1: '', bBank96Din2: '',
  bOfficeAddress: '', bGavchaAddress: '',
  bDinank: '', bThikan: '',

  // Step 3 — Guarantor 1
  g1Photo: null, g1Naav: '', g1Vay: '', g1SabasadNo: '', g1Shares: '', g1SharesRakkam: '',
  g1VadilNaav: '', g1VadilVay: '', g1AaiNaav: '', g1AaiVay: '',
  g1Patta: '', g1PinKod: '', g1Durdhvani: '', g1Mobile: '', g1Email: '',
  g1JageSwaarup: [], g1Kalavadhi_m: '', g1Kalavadhi_v: '', g1Vaivahik: 'विवाहित', g1Avalambun: '',
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

  // Step 4 — Guarantor 2
  g2Photo: null, g2Naav: '', g2Vay: '', g2SabasadNo: '', g2Shares: '', g2SharesRakkam: '',
  g2VadilNaav: '', g2VadilVay: '', g2AaiNaav: '', g2AaiVay: '',
  g2Patta: '', g2PinKod: '', g2Durdhvani: '', g2Mobile: '', g2Email: '',
  g2JageSwaarup: [], g2Kalavadhi_m: '', g2Kalavadhi_v: '', g2Vaivahik: 'विवाहित', g2Avalambun: '',
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

  // Step 5 — New Vehicle Details
  newVahanaVapar: '', newCompanyNaav: '', newVahanaPrakar: '', newNirmitVarsh: '', newModel: '',
  newFuelType: '', newDealerNaav: '', newDealerPatta: '', newDealerMobile: '', newDealerTel: '', newDealerEmail: '',
  newKimat: '', newBooking: '', newShillak: '',
  newDepositYes: null, newDepositAmt: '',
  newParkingThikan: '', newPermitNo: '', newPermitRenew: '',
  newOtherVehicleYes: null, newOtherVehicleNo: '', newOtherVehicleType: '', newOtherVehicleModel: '', newOtherVehicleYear: '',

  // Step 5 — Old Vehicle Details
  oldVahanaVapar: '', oldDealerNaav: '', oldDealerPatta: '', oldDealerMobile: '', oldDealerTel: '', oldDealerEmail: '',
  oldCompanyNaav: '', oldVehicleNo: '', oldRTO: '', oldVahanaPrakar: '', oldNirmitVarsh: '',
  oldEngineNo: '', oldChassisNo: '', oldModel: '', oldFuelType: '',
  oldFitnessNo: '', oldFitnessRenew: '', oldParkingThikan: '',
  oldPermitNo: '', oldPermitArea: '', oldPermitRenewDate: '', oldPermitFrom: '', oldPermitTo: '',
  oldRoadTax: '', oldRoadTaxPeriod: '',
  oldOtherVehicleYes: null, oldOtherVehicleNo: '', oldOtherVehicleType: '', oldOtherVehicleModel: '', oldOtherVehicleYear: '',

  // Step 6 — Insurance & Valuation
  insCompanyNaav: '', insAddress: '', insPolicy: '',
  insDurFrom: '', insDurTo: '',
  insAmount: '', insPremium: '',
  oldKimat: '', oldAdvance: '', oldShillak: '', oldValuationPrice: '',
  oldDepositYes: null, oldDepositAmt: '',
  lifeInsCompany: '', lifeInsAddress: '', lifeInsPolicy: '',
  lifeInsDurFrom: '', lifeInsDurTo: '',
  lifeInsAmount: '', lifeInsPremium: '', lifeInsPremiumType: '',
  lifeInsLoanYes: null, lifeInsLoanBank: '', lifeInsLoanAmount: '', lifeInsLoanDate: '', lifeInsLoanBalance: '',

  // Step 7 — Business Information
  bizType: '', bizCategory: '', bizPremisesType: [], bizArea: '', bizAreaUnit: '', bizAreaType: '',
  bizName: '', bizAddress: '', bizPin: '', bizMobile: '', bizEmail: '', bizPan: '',
  bizGumasta: '', bizSalesTax: '', bizVat: '', bizServiceTax: '', bizOtherLicense: '',
  bizHasLicenses: null, bizLicenseDetails: '', bizIsResidentInZone: null,
  bizStartDate: '', bizExperience: '',
  bizIncome: '', bizExpense: '', bizNetIncome: '',
  bizCust1Name: '', bizCust1Address: '', bizCust2Name: '', bizCust2Address: '',
  bizSupplier1Name: '', bizSupplier1Address: '', bizSupplier2Name: '', bizSupplier2Address: '',

  // Step 8 — Applicant & Partner Info (Taxes & Life Insurance)
  incTaxYes: null, incTaxPan: '', incTaxSinceYear: '',
  incTaxDetails: [{ year: '', amount: '', date: '' }, { year: '', amount: '', date: '' }, { year: '', amount: '', date: '' }],
  profTaxYes: null, profTaxNo: '', profTaxSinceYear: '',
  profTaxDetails: [{ year: '', amount: '', date: '' }, { year: '', amount: '', date: '' }, { year: '', amount: '', date: '' }],
  bizExtraInfo: '',
};


const onesMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस', 'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस', 'चाळीस', 'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास', 'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ', 'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर', 'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'];
const hundredsMr = ['', 'शंभर', 'दोनशे', 'तीनशे', 'चारशे', 'पाचशे', 'सहाशे', 'सातशे', 'आठशे', 'नऊशे'];

function numberToWordsMr(n) {
  if (!n || isNaN(n)) return '';
  n = parseInt(n);
  if (n === 0) return 'शून्य';
  let parts = [];
  if (n >= 10000000) { parts.push(numberToWordsMr(Math.floor(n / 10000000)).replace(' रुपये फक्त', '').trim() + ' कोटी'); n %= 10000000; }
  if (n >= 100000) { parts.push(numberToWordsMr(Math.floor(n / 100000)).replace(' रुपये फक्त', '').trim() + ' लाख'); n %= 100000; }
  if (n >= 1000) { parts.push(numberToWordsMr(Math.floor(n / 1000)).replace(' रुपये फक्त', '').trim() + ' हजार'); n %= 1000; }
  if (n >= 100) { parts.push(hundredsMr[Math.floor(n / 100)]); n %= 100; }
  if (n > 0) { parts.push(onesMr[n]); }
  return parts.filter(Boolean).join(' ') + ' रुपये फक्त';
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

// ─── Map Backend DTO back to Flat React state ─────────────────────────────
function mapDtoToState(dto) {
  if (!dto) return {};
  
  let baseState = { ...initState };
  
  // If we have rawJson, use it as it's the most reliable for form restoration
  if (dto.rawJson) {
    try {
      const parsed = JSON.parse(dto.rawJson);
      // Ensure nulls are converted to empty strings for controlled inputs
      Object.keys(parsed).forEach(k => {
        baseState[k] = parsed[k] === null ? "" : parsed[k];
      });
      // If we got everything from rawJson, we can still proceed to override with 
      // fresh data from the nested DTO if needed, but usually rawJson is the source of truth for the frontend state.
      // However, to be safe, we'll continue with the manual mapping for any missing pieces.
    } catch (e) {
      console.error("Error parsing rawJson:", e);
    }
  }

  // Fallback: manual mapping from nested DTO fields
  const state = { ...baseState, ...dto };
  
  const mapPerson = (person, prefix) => {
    if (!person) return {};
    return {
      [`${prefix}Photo`]:        person.photo || null,
      [`${prefix}Naav`]:         person.naav || "",
      [`${prefix}Vay`]:          person.vay || "",
      [`${prefix}SabasadNo`]:    person.sabasadNo || "",
      [`${prefix}Shares`]:       person.shares || "",
      [`${prefix}SharesRakkam`]: person.sharesRakkam || "",
      [`${prefix}VadilNaav`]:    person.vadilNaav || "",
      [`${prefix}VadilVay`]:     person.vadilVay || "",
      [`${prefix}AaiNaav`]:      person.aaiNaav || "",
      [`${prefix}AaiVay`]:       person.aaiVay || "",
      [`${prefix}Patta`]:        person.patta || "",
      [`${prefix}PinKod`]:       person.pinKod || "",
      [`${prefix}Durdhvani`]:    person.durdhvani || "",
      [`${prefix}Mobile`]:       person.mobile || "",
      [`${prefix}Email`]:        person.email || "",
      [`${prefix}JageSwaarup`]:  (() => {
        const val = person.jageSwaarupJson || person.jageSwaarup;
        if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
          try { return JSON.parse(val); } catch (e) { return []; }
        }
        return Array.isArray(val) ? val : [];
      })(),
      [`${prefix}Kalavadhi_m`]:  person.kalavadhi_m || "",
      [`${prefix}Kalavadhi_v`]:  person.kalavadhi_v || "",
      [`${prefix}Vaivahik`]:     person.vaivahik || "विवाहित",
      [`${prefix}Avalambun`]:    person.avalambun || "",
      [`${prefix}Company`]:      person.company || "",
      [`${prefix}CompanyPatta`]: person.companyPatta || "",
      [`${prefix}CompanyPin`]:   person.companyPin || "",
      [`${prefix}CompanyTel`]:   person.companyTel || "",
      [`${prefix}CompanyMobile`]:person.companyMobile || "",
      [`${prefix}CompanyEmail`]: person.companyEmail || "",
      [`${prefix}Vibhag`]:       person.vibhag || "",
      [`${prefix}Hudda`]:        person.hudda || "",
      [`${prefix}EmpCode`]:      person.empCode || "",
      [`${prefix}Karj_m`]:       person.karj_m || "",
      [`${prefix}Karj_v`]:       person.karj_v || "",
      [`${prefix}Seva`]:         person.seva || "",
      [`${prefix}MonthlyVetan`]: person.monthlyVetan || "",
      [`${prefix}Kapat`]:        person.kapat || "",
      [`${prefix}Niwal`]:        person.niwal || "",
      [`${prefix}Vaarshik`]:      person.vaarshik || "",
      [`${prefix}Kharcha`]:       person.kharcha || "",
      [`${prefix}NiwalVaarshik`]: person.niwalVaarshik || "",
      [`${prefix}Kutumb`]:       person.kutumb || "",
      [`${prefix}KutumbType`]:    person.kutumbType || "मासिक",
      [`${prefix}ShetiNaav`]:    person.shetiNaav || "",
      [`${prefix}ShetiNaate`]:   person.shetiNaate || "",
      [`${prefix}GaavMukkam`]:    person.gaavMukkam || "",
      [`${prefix}GaavPost`]:      person.gaavPost || "",
      [`${prefix}GaavTaluka`]:    person.gaavTaluka || "",
      [`${prefix}GaavJilha`]:     person.gaavJilha || "",
      [`${prefix}GaavRajya`]:     person.gaavRajya || "",
      [`${prefix}GaavPin`]:       person.gaavPin || "",
      [`${prefix}GaavDurdhvani`]: person.gaavDurdhvani || "",
      [`${prefix}GaavMobile`]:    person.gaavMobile || "",
      [`${prefix}PurvKarjPrakar`]: person.purvKarjPrakar || "",
      [`${prefix}PurvKhate`]:     person.purvKhate || "",
      [`${prefix}PurvRakkam`]:    person.purvRakkam || "",
      [`${prefix}PurvDin1`]:      person.purvDin1 || "",
      [`${prefix}PurvDin2`]:      person.purvDin2 || "",
      [`${prefix}Jam94aKarjdarNaav`]: person.jam94aKarjdarNaav || "",
      [`${prefix}Jam94aPrakar`]:   person.jam94aPrakar || "",
      [`${prefix}Jam94aKhate`]:    person.jam94aKhate || "",
      [`${prefix}Jam94aRakkam`]:   person.jam94aRakkam || "",
      [`${prefix}Jam94aDin1`]:     person.jam94aDin1 || "",
      [`${prefix}Jam94aDin2`]:     person.jam94aDin2 || "",
      [`${prefix}Jam94bKarjdarNaav`]: person.jam94bKarjdarNaav || "",
      [`${prefix}Jam94bPrakar`]:   person.jam94bPrakar || "",
      [`${prefix}Jam94bKhate`]:    person.jam94bKhate || "",
      [`${prefix}Jam94bRakkam`]:   person.jam94bRakkam || "",
      [`${prefix}Jam94bDin1`]:     person.jam94bDin1 || "",
      [`${prefix}Jam94bDin2`]:     person.jam94bDin2 || "",
      [`${prefix}Kutumb95Naav`]:   person.kutumb95Naav || "",
      [`${prefix}Kutumb95Prakar`]: person.kutumb95Prakar || "",
      [`${prefix}Kutumb95Khate`]:  person.kutumb95Khate || "",
      [`${prefix}Kutumb95Rakkam`]: person.kutumb95Rakkam || "",
      [`${prefix}Kutumb95Din1`]:   person.kutumb95Din1 || "",
      [`${prefix}Kutumb95Din2`]:   person.kutumb95Din2 || "",
      [`${prefix}Bank96Naav`]:     person.bank96Naav || "",
      [`${prefix}Bank96Shakha`]:   person.bank96Shakha || "",
      [`${prefix}Bank96Prakar`]:   person.bank96Prakar || "",
      [`${prefix}Bank96Khate`]:    person.bank96Khate || "",
      [`${prefix}Bank96Rakkam`]:   person.bank96Rakkam || "",
      [`${prefix}Bank96Din1`]:     person.bank96Din1 || "",
      [`${prefix}Bank96Din2`]:     person.bank96Din2 || "",
      [`${prefix}OfficeAddress`]:  prefix === 'b' ? person.officeAddress || "" : "",
      [`${prefix}GavchaAddress`]:  prefix === 'b' ? person.gavchaAddress || "" : "",
    };
  };

  const finalState = {
    ...state,
    ...mapPerson(dto.borrower, "b"),
    ...mapPerson(dto.guarantor1, "g1"),
    ...mapPerson(dto.guarantor2, "g2"),
    extraGuarantors: (dto.applicationGuarantors || dto.extraGuarantors || []).map(eg => ({ id: eg.id || parseInt(eg.frontendId) })),
  };

  // Add extra guarantor fields
  (dto.applicationGuarantors || dto.extraGuarantors || []).forEach(eg => {
    const prefix = `exG_${eg.id || eg.frontendId}`;
    Object.assign(finalState, mapPerson(eg, prefix));
  });

  // Map newVehicle/oldVehicle/insurance
  if (dto.newVehicle) {
    Object.keys(dto.newVehicle).forEach(k => {
      finalState[`new${k.charAt(0).toUpperCase()}${k.slice(1)}`] = dto.newVehicle[k] || "";
    });
  }
  if (dto.oldVehicle) {
    Object.keys(dto.oldVehicle).forEach(k => {
      finalState[`old${k.charAt(0).toUpperCase()}${k.slice(1)}`] = dto.oldVehicle[k] || "";
    });
  }
  if (dto.insurance) {
    Object.keys(dto.insurance).forEach(k => {
      finalState[k] = dto.insurance[k] || "";
    });
  }
  if (dto.businessInfo) {
    Object.keys(dto.businessInfo).forEach(k => {
      finalState[k] = dto.businessInfo[k] || "";
    });
  }

  return finalState;
}

// ─── Build extra guarantor state fields ───────────────────────────────────
function buildExtraGuarantorFields(id) {
  const prefix = `exG_${id}`;
  return {
    [`${prefix}Photo`]: null,
    [`${prefix}Naav`]: '', [`${prefix}Vay`]: '', [`${prefix}SabasadNo`]: '',
    [`${prefix}Shares`]: '', [`${prefix}SharesRakkam`]: '',
    [`${prefix}VadilNaav`]: '', [`${prefix}VadilVay`]: '',
    [`${prefix}AaiNaav`]: '', [`${prefix}AaiVay`]: '',
    [`${prefix}Patta`]: '', [`${prefix}PinKod`]: '',
    [`${prefix}Durdhvani`]: '', [`${prefix}Mobile`]: '', [`${prefix}Email`]: '',
    [`${prefix}JageSwaarup`]: [], [`${prefix}Kalavadhi_m`]: '', [`${prefix}Kalavadhi_v`]: '',
    [`${prefix}Vaivahik`]: 'विवाहित', [`${prefix}Avalambun`]: '',
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
    [`${prefix}Bank96Din2`]: '',
    [`${prefix}OfficeAddress`]: '', [`${prefix}GavchaAddress`]: '',
    [`${prefix}Dinank`]: '', [`${prefix}Thikan`]: '',
  };
}

// ─── Initial State ─────────────────────────────────────────────────────────


// ─── Validation Rules ─────────────────────────────────────────────────────
// ─── Input Masking Helpers ────────────────────────────────────────────────
function maskNumber(val) {
  return val.replace(/\D/g, '');
}

function maskDate(val) {
  let v = val.replace(/\D/g, '').slice(0, 8);
  if (v.length > 2 && v.length <= 4) v = v.slice(0, 2) + '/' + v.slice(2);
  else if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
  return v;
}

function maskMobile(val) {
  return val.replace(/\D/g, '').slice(0, 10);
}

// ─── Helper Components ─────────────────────────────────────────────────────
function TI({ label, name, data, setData, type = 'text', className = '', required = false, errors = {}, labelWidth, ...rest }) {
  const value = data[name] || '';

  const handleChange = e => {
    let val = e.target.value;
    const n = name.toLowerCase();

    if (n.endsWith('mobile') || n === 'jam1mobile' || n === 'jam2mobile' || n === 'jam3mobile' || n.includes('durdhvani') || n.includes('tel')) {
      val = val.replace(/\D/g, '').slice(0, 10);
    } else if (n.includes('dinank') || n.includes('date') || n.endsWith('din1') || n.endsWith('din2')) {
      val = maskDate(val);
    } else if (n.endsWith('pinkod') || n.includes('pin')) {
      val = val.replace(/\D/g, '').slice(0, 6);
    } else if (n.includes('pan')) {
      val = val.toUpperCase().slice(0, 10);
    } else if (type === 'number' ||
      n.endsWith('vay') || n.includes('rakkam') || n.includes('hapta') ||
      n.includes('shares') || n.includes('kalavadhi') || n.includes('vetan') ||
      n.includes('kapat') || n.includes('niwal') || n.includes('vaarshik') ||
      n.includes('kharcha') || n.endsWith('kutumb') || n.includes('kimat') ||
      n.includes('booking') || n.includes('shillak') || n.includes('depositamt') ||
      n.includes('amount') || n.includes('premium') || n.includes('income') ||
      n.includes('expense') || n.includes('avalambun') || n.includes('area') ||
      n.includes('sacra') || n.includes('khate') || n.includes('sabasadno') ||
      n.includes('varsh') || n.includes('year') || n.includes('permit') ||
      n.includes('durfrom') || n.includes('durto') ||
      n.includes('policy')) {
      val = maskNumber(val);
    }

    setData(p => ({ ...p, [name]: val }));
  };

  const hasError = errors[name];
  const errorMsg = errors[name];

  // For native date picker fields
  if (type === 'date') {
    return (
      <div className={`field ${className}`}>
        <label style={labelWidth ? { width: labelWidth, minWidth: labelWidth } : {}}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <input
            type="date"
            value={value}
            onChange={e => setData(p => ({ ...p, [name]: e.target.value }))}
            style={hasError ? { borderColor: '#ef4444', background: '#fff5f5' } : {}}
            {...rest}
          />
          {errorMsg && (
            <div style={{ marginTop: 2 }}>
              <span style={{ color: '#ef4444', fontSize: 11, display: 'block', lineHeight: 1.3 }}>⚠ {errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`field ${className}`}>
      <label style={labelWidth ? { width: labelWidth, minWidth: labelWidth } : {}}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          style={hasError ? { borderColor: '#ef4444', background: '#fff5f5' } : {}}
          {...rest}
        />
        {errorMsg && (
          <div style={{ marginTop: 2 }}>
            <span style={{ color: '#ef4444', fontSize: 11, display: 'block', lineHeight: 1.3 }}>⚠ {errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TA({ label, name, data, setData, rows = 1 }) {
  return (
    <div className="field">
      <label>{label}</label>
      <textarea rows={rows} value={data[name] || ''} onChange={e => setData(p => ({ ...p, [name]: e.target.value }))} />
    </div>
  );
}

function Radio({ label, name, options, data, setData }) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="radio-group">
        {options.map(o => (
          <label key={String(o.val)} className="radio-item">
            <input type="radio" name={name} value={String(o.val)} checked={data[name] === o.val} onChange={() => setData(p => ({ ...p, [name]: o.val }))} />
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
    <div className="field" style={{ alignItems: 'flex-start' }}>
      <div className="photo-upload" onClick={() => ref.current.click()}>
        {data[name] ? <img src={data[name]} alt="photo" /> : <><span style={{ fontSize: 24 }}>📷</span><span>फोटो / Photo</span></>}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

// ─── Person Block ──────────────────────────────────────────────────────────
function PersonBlock({ prefix, data, setData, title, lang, errors = {} }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={prefix + name} data={data} setData={setData} type={type} errors={errors} {...extra} />;

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

  return (
    <div className="form-step-content" style={{ padding: '0 8px' }}>

      {/* ── Section 1: Personal Info ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{title} — {L('वैयक्तिक माहिती', 'Personal Information')}</div>
        </div>

        {/* CSS Grid: 3 equal columns. Photo occupies col3 rows 1-3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '8px', rowGap: '4px', padding: '0 4px' }}>
          {/* Row 1 */}
          <div className="v-col">{ti('संपूर्ण नाव', 'Full Name', 'Naav', 'text')}</div>
          <div className="v-col">{ti('वय', 'Age', 'Vay', 'number')}</div>
          {/* Col3, Rows 1-3: Photo */}
          <div style={{ gridColumn: '3', gridRow: '1 / span 3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PhotoUpload label={L('फोटो', 'Photo')} name={prefix + 'Photo'} data={data} setData={setData} />
          </div>

          {/* Row 2 */}
          <div className="v-col">{ti('सभासद क्रमांक', 'Member No.', 'SabasadNo')}</div>
          <div className="v-col">{ti('भाग (शेअर्स) संख्या', 'Shares Count', 'Shares', 'number')}</div>

          {/* Row 3 */}
          <div className="v-col">{ti('शेअर्स रक्कम ₹', 'Shares Amount ₹', 'SharesRakkam', 'number')}</div>
          <div className="v-col">{ti('वडील/पतीचे नाव', "Father/Husband's Name", 'VadilNaav')}</div>

          {/* Row 4 — photo ends; real fields */}
          <div className="v-col">{ti('वय', 'Age', 'VadilVay', 'number')}</div>
          <div className="v-col">{ti('आईचे नाव', "Mother's Name", 'AaiNaav')}</div>
          <div className="v-col">{ti('वय', 'Age', 'AaiVay', 'number')}</div>

          {/* Row 5 */}
          <div className="v-col">{ti('पिन कोड', 'Pin Code', 'PinKod')}</div>
          <div className="v-col">{ti('दूरध्वनी', 'Telephone', 'Durdhvani')}</div>
          <div className="v-col">{ti('मोबाईल', 'Mobile', 'Mobile', 'text')}</div>

          {/* Row 6 */}
          <div className="v-col">{ti('ई मेल', 'Email', 'Email')}</div>
          <div className="v-col">{ti('अवलंबून व्यक्ती', 'Dependents', 'Avalambun', 'number')}</div>
          <div className="v-col no-colon">
            <Radio label={L('वैवाहिक स्थिती', 'Marital Status')} name={prefix + 'Vaivahik'} options={maritalOpts} data={data} setData={setData} />
          </div>

          {/* Row 7 */}
          <div className="v-col">{ti('सध्याच्या जागेत राहत असल्याचा कालावधी (महिने)', 'Residence Duration (Months)', 'Kalavadhi_m', 'number')}</div>
          <div className="v-col">{ti('कालावधी (वर्षे)', 'Duration (Years)', 'Kalavadhi_v', 'number')}</div>
          <div className="v-col"></div>
        </div>

        {/* Full-width rows */}
        <div style={{ padding: '4px 4px 8px 4px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <CheckGroup label={L('राहण्याच्या जागेचे स्वरूप', 'Property Type')} name={prefix + 'JageSwaarup'} options={jageOpts} data={data} setData={setData} />
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
                  <TA label={L('कार्यालयाचा पत्ता', 'Office Address')} name={prefix + 'OfficeAddress'} data={data} setData={setData} rows={1} />
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
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('नोकरी/व्यवसायाचा तपशील', 'Job/Business Details')}</div>
        </div>
        <div style={{ padding: '0 4px 4px 4px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('कंपनीचे नाव', 'Company Name', 'Company')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('विभाग', 'Department', 'Vibhag')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('हुद्दा', 'Designation', 'Hudda')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('कर्मचारी कोड', 'Employee Code', 'EmpCode')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('पिन कोड', 'Pin Code', 'CompanyPin')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('दूरध्वनी', 'Telephone', 'CompanyTel')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('मोबाईल', 'Mobile', 'CompanyMobile')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('ई मेल/वेबसाईट', 'Email/Website', 'CompanyEmail')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('सेवानिवृत्ती दिनांक', 'Retirement Date', 'Seva', 'date')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('नोकरी/व्यवसायाचा कालावधी (महिने)', 'Job Duration (Months)', 'Karj_m', 'number')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('कालावधी (वर्षे)', 'Duration (Years)', 'Karj_v', 'number')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1 }}>
              <TA label={L('कंपनीचा पत्ता', 'Company Address')} name={prefix + 'CompanyPatta'} data={data} setData={setData} rows={1} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3 & 4: Income & Village side-by-side ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'stretch' }}>
        {/* ── Section 3: Income ── */}
        <div className="v-form-section" style={{ flex: 1, marginBottom: 0 }}>
          <div className="v-form-section-header">
            <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('उत्पन्नाचा तपशील', 'Income Details')}</div>
          </div>
          <div style={{ padding: '0 4px 8px 4px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a1c5a', margin: '4px 0' }}>{L('१. नोकरदार असल्यास :', '1. If Salaried :')}</div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('एकूण मासिक वेतन ₹', 'Monthly Salary ₹', 'MonthlyVetan', 'number')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('एकूण कपात ₹', 'Deductions ₹', 'Kapat', 'number')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('निव्वळ वेतन ₹', 'Net Salary ₹', 'Niwal', 'number')}</div></div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a1c5a', margin: '4px 0' }}>{L('२. व्यावसायिक असल्यास :', '2. If Professional :')}</div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('वार्षिक उत्पन्न ₹', 'Annual Income ₹', 'Vaarshik', 'number')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('एकूण खर्च ₹', 'Total Expenses ₹', 'Kharcha', 'number')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('निव्वळ वार्षिक उत्पन्न ₹', 'Net Annual Income ₹', 'NiwalVaarshik', 'number')}</div></div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0a1c5a', margin: '4px 0' }}>{L('३. संपूर्ण कुटुंबाचे निव्वळ उत्पन्न', '3. Total Net Family Income')}</div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('कुटुंब निव्वळ उत्पन्न ₹', 'Family Net Income ₹', 'Kutumb', 'number')}</div></div>
            <div className="v-form-row no-colon">
              <div className="v-col" style={{ flex: 1 }}>
                <Radio label={L('उत्पन्न कालावधी', 'Income Period')} name={prefix + 'KutumbType'} options={incomeOpts} data={data} setData={setData} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Village Address ── */}
        <div className="v-form-section" style={{ flex: 1.2, marginBottom: 0 }}>
          <div className="v-form-section-header">
            <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('घर/शेती व गावचा पत्ता', 'Property & Village Address')}</div>
          </div>
          <div style={{ padding: '0 4px 8px 4px' }}>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('घर/शेती मालकाचे नाव', 'Property Owner Name', 'ShetiNaav')}</div></div>
            <div className="v-form-row"><div className="v-col" style={{ flex: 1 }}>{ti('नाते', 'Relation', 'ShetiNaate')}</div></div>
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('मुक्काम', 'Village/Mukkam', 'GaavMukkam')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('पोस्ट', 'Post', 'GaavPost')}</div>
            </div>
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('तालुका', 'Taluka', 'GaavTaluka')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('जिल्हा', 'District', 'GaavJilha')}</div>
            </div>
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('राज्य', 'State', 'GaavRajya')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('पिन कोड', 'Pin Code', 'GaavPin')}</div>
            </div>
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('दूरध्वनी', 'Telephone', 'GaavDurdhvani')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('मोबाईल', 'Mobile', 'GaavMobile')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Previous Loans ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#f43f5e' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('मागील कर्जाचा तपशील', 'Previous Loan Details')}</div>
        </div>
        <div style={{ padding: '0 4px 8px 4px' }}>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('कर्ज प्रकार', 'Loan Type', 'PurvKarjPrakar')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('खाते क्र.', 'A/C No.', 'PurvKhate')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}>{ti('रक्कम ₹', 'Amount ₹', 'PurvRakkam', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col pb-col1" style={{ flex: 1.5 }}>{ti('कर्ज घेतल्याचा दिनांक', 'Loan Date', 'PurvDin1', 'date')}</div>
            <div className="v-col pb-col2" style={{ flex: 1.5 }}>{ti('कर्ज परतफेडीचा दिनांक', 'Repayment Date', 'PurvDin2', 'date')}</div>
            <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
          </div>
        </div>
      </div>

      {/* ── Section 6: As Guarantor ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
          <div style={{ width: '3px', height: '14px', background: '#f59e0b' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('जामिनदार असल्यास तपशील', 'As Guarantor Details')}</div>
        </div>
        <div style={{ padding: '4px 12px 12px 12px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
            {[
              { key: 'Jam94a', label: L('अ) ', 'A) ') },
              { key: 'Jam94b', label: L('ब) ', 'B) ') },
            ].map(item => (
              <div key={item.key} style={{ flex: 1, padding: '8px', background: '#fcfaf5', borderRadius: '6px', border: '1px solid #fcebb6' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>{item.label}{L('कर्जदाराचे नाव', "Borrower's Name")}</div>
                <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('कर्जदाराचे नाव', "Borrower's Name", item.key + 'KarjdarNaav')}</div></div>
                <div className="v-form-row" style={{ marginBottom: '8px' }}>
                  <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज प्रकार', 'Loan Type', item.key + 'Prakar')}</div>
                  <div className="v-col" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', item.key + 'Khate')}</div>
                </div>
                <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount ₹', item.key + 'Rakkam', 'number')}</div></div>
                <div className="v-form-row" style={{ marginBottom: '8px' }}>
                  <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज घेतल्याचा दिनांक', 'Loan Date', item.key + 'Din1', 'date')}</div>
                  <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज परतफेडीचा दिनांक', 'Repayment Date', item.key + 'Din2', 'date')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 7+8: Family Loan & Other Bank Loan (side by side) ── */}
      <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
        <div style={{ display: 'flex' }}>
          {/* Family Loan */}
          <div style={{ flex: 1, borderRight: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
              <div style={{ width: '3px', height: '14px', background: '#22c55e' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('कुटुंब सदस्यांनी संस्थेकडून घेतलेल्या कर्जाचा तपशील', 'Family Member Loans')}</div>
            </div>
            <div style={{ padding: '4px 12px 12px 12px' }}>
              <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('नाव', 'Name', 'Kutumb95Naav')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('कर्ज प्रकार', 'Loan Type', 'Kutumb95Prakar')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '8px' }}>
                <div className="v-col" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'Kutumb95Khate')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount ₹', 'Kutumb95Rakkam', 'number')}</div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '8px' }}>
                <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज घेतल्याचा दिनांक', 'Loan Date', 'Kutumb95Din1', 'date')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज परतफेडीचा दिनांक', 'Repayment Date', 'Kutumb95Din2', 'date')}</div>
              </div>
            </div>
          </div>

          {/* Other Bank Loan */}
          <div style={{ flex: 1.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: '#fff7ed', borderBottom: '1px solid #fed7aa', marginBottom: '4px' }}>
              <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('इतर बँकांचे कर्ज', 'Loans from Other Banks')}</div>
            </div>
            <div style={{ padding: '4px 12px 12px 12px' }}>
              <div className="v-form-row" style={{ marginBottom: '8px' }}>
                <div className="v-col" style={{ flex: 1 }}>{ti('बँक/संस्थेचे नाव', 'Bank/Institution Name', 'Bank96Naav')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('शाखा', 'Branch', 'Bank96Shakha')}</div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '8px' }}><div className="v-col" style={{ flex: 1 }}>{ti('कर्ज प्रकार', 'Loan Type', 'Bank96Prakar')}</div></div>
              <div className="v-form-row" style={{ marginBottom: '8px' }}>
                <div className="v-col" style={{ flex: 1 }}>{ti('खाते क्र.', 'A/C No.', 'Bank96Khate')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('रक्कम ₹', 'Amount ₹', 'Bank96Rakkam', 'number')}</div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '8px' }}>
                <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज घेतल्याचा दिनांक', 'Loan Date', 'Bank96Din1', 'date')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज परतफेडीचा दिनांक', 'Repayment Date', 'Bank96Din2', 'date')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── New Vehicle Details Block ─────────────────────────────────────────────
// ─── New Vehicle Details Block ─────────────────────────────────────────────
function NewVehicleBlock({ data, setData, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} {...extra} />;

  const fuelOpts = [
    { val: 'डिझेल', label: L('डिझेल', 'Diesel') },
    { val: 'पेट्रोल', label: L('पेट्रोल', 'Petrol') },
    { val: 'सीएनजी', label: L('सी. एन. जी.', 'CNG') },
    { val: 'इलेक्ट्रिक', label: L('इलेक्ट्रिक', 'Electric') },
  ];
  const vaparOpts = [
    { val: 'वैयक्तिक', label: L('वैयक्तिक', 'Personal') },
    { val: 'व्यावसायिक', label: L('व्यावसायिक', 'Commercial') },
  ];
  const yesNoOpts = [
    { val: true, label: L('होय', 'Yes') },
    { val: false, label: L('नाही', 'No') },
  ];

  return (
    <div key="newvehicle" className="form-step-content" style={{ padding: '0 8px' }}>
      {/* ── Section 1: New Vehicle Purchase ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('अ) नवीन वाहन खरेदी तपशील', 'A) New Vehicle Purchase Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('वाहनाचा वापर', 'Vehicle Usage')} name="newVahanaVapar" options={vaparOpts} data={data} setData={setData} />
            </div>
            <div className="v-col" style={{ flex: 1 }}>{ti('उत्पादक कंपनीचे नाव', 'Manufacturer Name', 'newCompanyNaav')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('वाहनाचा प्रकार', 'Vehicle Type', 'newVahanaPrakar')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('निर्मिती वर्ष', 'Mfg. Year', 'newNirmitVarsh')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('मॉडेल नं.', 'Model No.', 'newModel')}</div>
            <div className="v-col" style={{ flex: 1 }}></div>
          </div>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('इंधन प्रकार', 'Fuel Type')} name="newFuelType" options={fuelOpts} data={data} setData={setData} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Dealer Info ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('डीलर/एजन्सी माहिती', 'Dealer/Agency Information')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('डीलर/एजन्सीचे नाव', 'Dealer Name', 'newDealerNaav')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('मोबाईल क्र.', 'Mobile No.', 'newDealerMobile')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('दूरध्वनी', 'Telephone', 'newDealerTel')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 2 }}>
              <TA label={L('संपूर्ण पत्ता', 'Full Address')} name="newDealerPatta" data={data} setData={setData} rows={1} />
            </div>
            <div className="v-col" style={{ flex: 1 }}>{ti('ई मेल आयडी', 'Email ID', 'newDealerEmail')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Price Details ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('वाहन किंमत तपशील', 'Vehicle Price Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('वाहनाची खरेदी किंमत ₹', 'Purchase Price ₹', 'newKimat', 'number')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('बुकिंगसाठी भरणा केलेली रक्कम ₹', 'Booking Amount ₹', 'newBooking', 'number')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('शिल्लक देणे रक्कम ₹', 'Balance Amount ₹', 'newShillak', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1.5 }}>
              <Radio label={L('किंमतीच्या २५% रक्कम जमा केली आहे काय?', '25% price deposited?')}
                name="newDepositYes" options={yesNoOpts} data={data} setData={setData} />
            </div>
            {data.newDepositYes && (
              <div className="v-col" style={{ flex: 1 }}>
                {ti('जमा रक्कम ₹', 'Deposited Amount ₹', 'newDepositAmt', 'number')}
              </div>
            )}
            {!data.newDepositYes && <div className="v-col" style={{ flex: 1 }}></div>}
          </div>
        </div>
      </div>

      {/* ── Section 4: Permit & Parking ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('परमिट व पार्किंग तपशील', 'Permit & Parking Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('वाहन उभे करण्याचे ठिकाण', 'Parking Place', 'newParkingThikan')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('परमिट नं.', 'Permit No.', 'newPermitNo')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('नुतनीकरण दिनांक', 'Renewal Date', 'newPermitRenew', 'date')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Other Vehicles ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#ec4899' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('इतर वाहन माहिती', 'Other Vehicle Information')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('या व्यतिरिक्त इतर वाहन आपल्या मालकीचे आहे काय?', 'Any other vehicle owned?')}
                name="newOtherVehicleYes" options={yesNoOpts} data={data} setData={setData} />
            </div>
          </div>
          {data.newOtherVehicleYes === true && (
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('वाहन क्र.', 'Vehicle No.', 'newOtherVehicleNo')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('वाहनाचा प्रकार', 'Vehicle Type', 'newOtherVehicleType')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('मॉडेल', 'Model', 'newOtherVehicleModel')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('निर्मिती वर्ष', 'Mfg. Year', 'newOtherVehicleYear')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Old Vehicle Details Block ─────────────────────────────────────────────
function OldVehicleBlock({ data, setData, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} {...extra} />;

  const fuelOpts = [
    { val: 'डिझेल', label: L('डिझेल', 'Diesel') },
    { val: 'पेट्रोल', label: L('पेट्रोल', 'Petrol') },
    { val: 'सीएनजी', label: L('सी. एन. जी.', 'CNG') },
  ];
  const vaparOpts = [
    { val: 'वैयक्तिक', label: L('वैयक्तिक', 'Personal') },
    { val: 'व्यावसायिक', label: L('व्यावसायिक', 'Commercial') },
  ];
  const permitAreaOpts = [
    { val: 'स्थानिक', label: L('स्थानिक', 'Local') },
    { val: 'राज्यस्तरीय', label: L('राज्यस्तरीय', 'State') },
    { val: 'नॅशनल', label: L('नॅशनल', 'National') },
  ];
  const yesNoOpts = [
    { val: true, label: L('होय', 'Yes') },
    { val: false, label: L('नाही', 'No') },
  ];

  return (
    <div key="oldvehicle" className="form-step-content" style={{ padding: '0 8px' }}>
      {/* ── Section 1: Transaction Details ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('ब) जुने वाहन तारण / खरेदी तपशील', 'B) Old Vehicle (Pledge/Purchase) Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('वाहनाचा वापर', 'Vehicle Usage')} name="oldVahanaVapar" options={vaparOpts} data={data} setData={setData} />
            </div>
            <div className="v-col" style={{ flex: 1 }}>{ti('विक्रेता/डीलरचे नाव', 'Seller/Dealer Name', 'oldDealerNaav')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('मोबाईल क्र.', 'Mobile No.', 'oldDealerMobile')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 2 }}>
              <TA label={L('संपूर्ण पत्ता', 'Full Address')} name="oldDealerPatta" data={data} setData={setData} rows={1} />
            </div>
            <div className="v-col" style={{ flex: 1 }}>{ti('दूरध्वनी / ई-मेल', 'Tel / Email', 'oldDealerEmail')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Vehicle Details ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('वाहनाचा तपशील', 'Vehicle Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('उत्पादक कंपनी', 'Manufacturer', 'oldCompanyNaav')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('वाहन क्र.', 'Vehicle No.', 'oldVehicleNo')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('आर.टि.ओ. कार्यालय', 'RTO Office', 'oldRTO')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('वाहनाचा प्रकार', 'Vehicle Type', 'oldVahanaPrakar')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('निर्मिती वर्ष', 'Mfg. Year', 'oldNirmitVarsh')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('मॉडेल नं.', 'Model No.', 'oldModel')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('इंजिन नं.', 'Engine No.', 'oldEngineNo')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('चेसीज नं.', 'Chassis No.', 'oldChassisNo')}</div>
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('इंधन प्रकार', 'Fuel Type')} name="oldFuelType" options={fuelOpts} data={data} setData={setData} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Fitness & Permits ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('फिटनेस, परमिट व पार्किंग', 'Fitness, Permit & Parking')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('फिटनेस नंबर', 'Fitness No.', 'oldFitnessNo')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('नुतनीकरण दिनांक', 'Renewal Date', 'oldFitnessRenew', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('पार्किंगचे ठिकाण', 'Parking Place', 'oldParkingThikan')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('परमिट नंबर', 'Permit No.', 'oldPermitNo')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('नुतनीकरण दिनांक', 'Renewal Date', 'oldPermitRenewDate', 'date')}</div>
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('कार्यक्षेत्र', 'Area')} name="oldPermitArea" options={permitAreaOpts} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('कालावधी (पासून)', 'Period (From)', 'oldPermitFrom', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('कालावधी (पर्यंत)', 'Period (To)', 'oldPermitTo', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('रोड टॅक्स ₹', 'Road Tax ₹', 'oldRoadTax', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('टॅक्स कालावधी', 'Tax Period', 'oldRoadTaxPeriod')}</div>
            <div className="v-col" style={{ flex: 1 }}></div>
            <div className="v-col" style={{ flex: 1 }}></div>
          </div>
        </div>
      </div>

      {/* ── Section 4: Insurance ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('वाहन विमा तपशील', 'Vehicle Insurance Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('विमा कंपनी', 'Insurance Co.', 'insCompanyNaav')}</div>
            <div className="v-col" style={{ flex: 2 }}>{ti('पॉलिसी नं.', 'Policy No.', 'insPolicy')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 2 }}>
              <TA label={L('कंपनी पत्ता', 'Company Address')} name="insAddress" data={data} setData={setData} rows={1} />
            </div>
            <div className="v-col" style={{ flex: 1 }}>{ti('विमा रक्कम ₹', 'Sum Assured ₹', 'insAmount', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('कालावधी (पासून)', 'From', 'insDurFrom', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('कालावधी (पर्यंत)', 'To', 'insDurTo', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('हप्ता रक्कम ₹', 'Premium ₹', 'insPremium', 'number')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Valuation Details ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#ec4899' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('वाहन मूल्यांकन तपशील', 'Vehicle Valuation Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('खरेदी किंमत ₹', 'Purchase Price ₹', 'oldKimat', 'number')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('ॲडव्हान्स रक्कम ₹', 'Advance Amount ₹', 'oldAdvance', 'number')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('शिल्लक रक्कम ₹', 'Balance Amt ₹', 'oldShillak', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('मूल्यांकन किंमत ₹', 'Valuation Price ₹', 'oldValuationPrice', 'number')}</div>
            <div className="v-col no-colon" style={{ flex: 2 }}>
              <Radio label={L('५०% रक्कम जमा केली आहे काय?', '50% price deposited?')}
                name="oldDepositYes" options={yesNoOpts} data={data} setData={setData} />
            </div>
          </div>
          {data.oldDepositYes && (
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('जमा रक्कम ₹', 'Deposited Amount ₹', 'oldDepositAmt', 'number')}</div>
              <div className="v-col" style={{ flex: 1 }}></div>
              <div className="v-col" style={{ flex: 1 }}></div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 6: Other Vehicles ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#8b5cf6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('इतर वाहन माहिती', 'Other Vehicle Information')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('इतर वाहन आपल्या मालकीचे आहे काय?', 'Any other vehicle owned?')}
                name="oldOtherVehicleYes" options={yesNoOpts} data={data} setData={setData} />
            </div>
          </div>
          {data.oldOtherVehicleYes === true && (
            <div className="v-form-row">
              <div className="v-col" style={{ flex: 1 }}>{ti('वाहन क्र.', 'Vehicle No.', 'oldOtherVehicleNo')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('वाहनाचा प्रकार', 'Vehicle Type', 'oldOtherVehicleType')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('मॉडेल', 'Model', 'oldOtherVehicleModel')}</div>
              <div className="v-col" style={{ flex: 1 }}>{ti('निर्मिती वर्ष', 'Mfg. Year', 'oldOtherVehicleYear')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Business Info Block ───────────────────────────────────────────
function BusinessInfoBlock({ data, setData, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} {...extra} />;

  const bizNatureOpts = [
    { val: 'पब्लीक लि.', label: L('पब्लीक लि.', 'Public Ltd.') },
    { val: 'प्रा. लि.', label: L('प्रा. लि.', 'Pvt. Ltd.') },
    { val: 'भागिदारी', label: L('भागिदारी', 'Partnership') },
    { val: 'खाजगी', label: L('खाजगी', 'Private') },
    { val: 'व्यापारी', label: L('व्यापारी', 'Trading') },
    { val: 'शेती', label: L('शेती', 'Farming') },
    { val: 'इतर', label: L('इतर', 'Other') }
  ];

  const yesNoOpts = [
    { val: true, label: L('होय', 'Yes') },
    { val: false, label: L('नाही', 'No') },
  ];

  const premisesOpts = [
    L('स्व:मालकीची', 'Self Owned'), L('वडिलोपार्जित', 'Ancestral'), L('पागडीची', 'Pagdi'),
    L('भाडेतत्वावर', 'Rented'), L('लिजवर', 'Leased')
  ];

  const areaTypeOpts = [
    { val: 'कारपेट', label: L('कारपेट', 'Carpet') },
    { val: 'बिल्टअप', label: L('बिल्टअप', 'Builtup') },
    { val: 'सुपर बिल्टअप', label: L('सुपर बिल्टअप', 'Super Builtup') }
  ];

  return (
    <div key="bizinfo" className="form-step-content" style={{ padding: '0 8px' }}>
      {/* ── Section 1: Business Operations ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('अर्जदाराच्या व्यवसायाची माहिती', "Applicant's Business Information")}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('व्यावसायाचे स्वरूप', 'Nature of Business', 'bizType')}</div>
            <div className="v-col no-colon" style={{ flex: 2 }}>
              <Radio label={L('वर्गवारी', 'Category')} name="bizCategory" options={bizNatureOpts} data={data} setData={setData} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <div className="field">
                <label>{L('जागेचे स्वरूप', 'Premises Type')}</label>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '4px 0' }}>
                  {premisesOpts.map(o => (
                    <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={(data.bizPremisesType || []).includes(o)}
                        onChange={() => {
                          const old = data.bizPremisesType || [];
                          const updated = old.includes(o) ? old.filter(v => v !== o) : [...old, o];
                          setData(p => ({ ...p, bizPremisesType: updated }));
                        }}
                      />
                      {o}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('क्षेत्रफळ (संख्या)', 'Area (Size)', 'bizArea', 'number')}</div>
            <div className="v-col no-colon" style={{ flex: 2 }}>
              <Radio label={L('क्षेत्रफळ प्रकार', 'Area Type')} name="bizAreaType" options={areaTypeOpts} data={data} setData={setData} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2: Firm Details ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('कंपनी / फर्म माहिती', 'Company / Firm Information')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('कंपनी/फर्मचे नाव', 'Company/Firm Name', 'bizName')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('मोबाईल / दूरध्वनी', 'Mobile / Tel', 'bizMobile')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('पिन कोड', 'PIN Code', 'bizPin')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 2 }}>
              <TA label={L('संपूर्ण पत्ता', 'Full Address')} name="bizAddress" data={data} setData={setData} rows={1} />
            </div>
            <div className="v-col" style={{ flex: 1 }}>{ti('ई-मेल आयडी', 'Email ID', 'bizEmail')}</div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Licenses & Taxes ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('व्यापार परवाने व कर तपशील', 'Licenses & statutory Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('पॅन कार्ड क्र.', 'PAN Card No.', 'bizPan')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('गुमास्ता लायसन्स क्र.', 'Gumasta No.', 'bizGumasta')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('विक्रीकर (Sales Tax) क्र.', 'Sales Tax No.', 'bizSalesTax')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('व्हॅट (VAT) क्र.', 'VAT No.', 'bizVat')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('सर्व्हिस टॅक्स क्र.', 'Service Tax No.', 'bizServiceTax')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('इतर लायसन्स', 'Other License', 'bizOtherLicense')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 2 }}>
              <Radio label={L('सर्व प्रकारचे आवश्यक परवाने आहेत काय?', 'Have all necessary licenses?')}
                name="bizHasLicenses" options={yesNoOpts} data={data} setData={setData} />
            </div>
            {data.bizHasLicenses && (
              <div className="v-col" style={{ flex: 1 }}>{ti('परवाना तपशील', 'License Details', 'bizLicenseDetails')}</div>
            )}
            {!data.bizHasLicenses && <div className="v-col" style={{ flex: 1 }}></div>}
          </div>
        </div>
      </div>

      {/* ── Section 4: Performance & Experience ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('व्यवसाय अनुभव व उत्पन्न', 'Business Experience & Income')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('केव्हा पासून करत आहात?', 'Since When?', 'bizStartDate', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('व्यावसायिक अनुभव', 'Experience', 'bizExperience')}</div>
            <div className="v-col no-colon" style={{ flex: 1 }}>
              <Radio label={L('रहिवासी विभागात आहे काय?', 'In Resident Zone?')}
                name="bizIsResidentInZone" options={yesNoOpts} data={data} setData={setData} />
            </div>
          </div>

          <div style={{ marginTop: 8, marginBottom: 8, border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <table className="vl-data-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ fontSize: '11px', padding: '4px' }}>{L('एकूण वार्षिक उत्पन्न', 'Annual Income')}</th>
                  <th style={{ fontSize: '11px', padding: '4px' }}>{L('एकूण वार्षिक खर्च', 'Annual Expense')}</th>
                  <th style={{ fontSize: '11px', padding: '4px' }}>{L('निव्वळ वार्षिक उत्पन्न', 'Net Income')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="text" className="v-table-input" value={data.bizIncome || ''} onChange={e => setData(p => ({ ...p, bizIncome: e.target.value.replace(/\D/g, '') }))} /></td>
                  <td><input type="text" className="v-table-input" value={data.bizExpense || ''} onChange={e => setData(p => ({ ...p, bizExpense: e.target.value.replace(/\D/g, '') }))} /></td>
                  <td><input type="text" className="v-table-input" value={data.bizNetIncome || ''} onChange={e => setData(p => ({ ...p, bizNetIncome: e.target.value.replace(/\D/g, '') }))} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Section 5: Customers & Suppliers ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#ec4899' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('नियमित ग्राहक व माल पुरवठादार', 'Regular Customers & Suppliers')}</div>
        </div>
        <div style={{ padding: '0 4px 6px 4px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Customers */}
            <div style={{ flex: 1, padding: '4px', border: '1px solid #f1f5f9', borderRadius: '4px', background: '#f8fafc' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', marginBottom: '4px', textAlign: 'center' }}>{L('नियमित ग्राहक', 'Regular Customers')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('अ) नाव', 'A) Name', 'bizCust1Name')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('पत्ता', 'Address', 'bizCust1Address')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('ब) नाव', 'B) Name', 'bizCust2Name')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('पत्ता', 'Address', 'bizCust2Address')}</div>
            </div>
            {/* Suppliers */}
            <div style={{ flex: 1, padding: '4px', border: '1px solid #f1f5f9', borderRadius: '4px', background: '#fef2f2' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c', marginBottom: '4px', textAlign: 'center' }}>{L('माल पुरवठादार', 'Suppliers')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('अ) नाव', 'A) Name', 'bizSupplier1Name')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('पत्ता', 'Address', 'bizSupplier1Address')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('ब) नाव', 'B) Name', 'bizSupplier2Name')}</div>
              <div className="v-col" style={{ width: '100%', marginBottom: '4px' }}>{ti('पत्ता', 'Address', 'bizSupplier2Address')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 8: Applicant & Partner Information ───────────────────────────────
function ApplicantPartnerInfoBlock({ data, setData, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const ti = (mr, en, name, type = 'text', extra = {}) =>
    <TI label={L(mr, en)} name={name} data={data} setData={setData} type={type} {...extra} />;

  const premiumOpts = [
    { val: 'मासिक', label: L('मासिक', 'Monthly') },
    { val: 'त्रैमासिक', label: L('त्रैमासिक', 'Quarterly') },
    { val: 'अर्ध वार्षिक', label: L('अर्ध वार्षिक', 'Half Yearly') },
    { val: 'वार्षिक', label: L('वार्षिक', 'Yearly') },
  ];

  const handleTaxRow = (type, index, field, value) => {
    setData(p => {
      const arr = [...(p[type] || [{}, {}, {}])];
      if (!arr[index]) arr[index] = {};
      arr[index] = { ...arr[index], [field]: value };
      return { ...p, [type]: arr };
    });
  };

  const yesNoOpts = [
    { val: true, label: L('होय', 'Yes') },
    { val: false, label: L('नाही', 'No') },
  ];

  return (
    <div key="apppart" className="form-step-content" style={{ padding: '0 8px' }}>
      {/* ── Section 1: Life Insurance ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('अर्जदार / भागीदार यांचा जीवन विमा तपशील', 'Life Insurance Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('विमा कंपनीचे नाव', 'Insurance Co.', 'lifeInsCompany')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('पॉलिसी नंबर', 'Policy No.', 'lifeInsPolicy')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>
              <TA label={L('संपूर्ण पत्ता', 'Full Address')} name="lifeInsAddress" data={data} setData={setData} rows={1} />
            </div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('कालावधी (पासून)', 'From Date', 'lifeInsDurFrom', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('कालावधी (पर्यंत)', 'To Date', 'lifeInsDurTo', 'date')}</div>
            <div className="v-col" style={{ flex: 1 }}>{ti('विमा रक्कम ₹', 'Sum Assured ₹', 'lifeInsAmount', 'number')}</div>
          </div>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('हप्ता रक्कम ₹', 'Premium Amt ₹', 'lifeInsPremium', 'number')}</div>
            <div className="v-col no-colon" style={{ flex: 2 }}>
              <Radio label={L('हप्ता भरण्याचा प्रकार', 'Payment Type')} name="lifeInsPremiumType" options={premiumOpts} data={data} setData={setData} />
            </div>
          </div>

          <div className="v-form-row">
            <div className="v-col no-colon" style={{ flex: 1.5 }}>
              <Radio label={L('पॉलिसीवर कर्ज घेतले आहे काय?', 'Loan against policy?')}
                name="lifeInsLoanYes" options={yesNoOpts} data={data} setData={setData} />
            </div>
          </div>

          {data.lifeInsLoanYes && (
            <div style={{ margin: '4px 0', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '4px', background: '#f8fafc' }}>
              <div className="v-form-row">
                <div className="v-col" style={{ flex: 1 }}>{ti('बँक/संस्थेचे नाव', 'Bank Name', 'lifeInsLoanBank')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('पत्ता', 'Address', 'lifeInsLoanAddress')}</div>
              </div>
              <div className="v-form-row">
                <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज रक्कम ₹', 'Loan Amt ₹', 'lifeInsLoanAmount', 'number')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('कर्ज दिनांक', 'Loan Date', 'lifeInsLoanDate', 'date')}</div>
                <div className="v-col" style={{ flex: 1 }}>{ti('शिल्लक कर्ज ₹', 'Balance ₹', 'lifeInsLoanBalance', 'number')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Income Tax ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('आयकर (Income Tax) तपशील', 'Income Tax Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('पॅन कार्ड नं.', 'PAN Card No.', 'incTaxPan', 'text', { style: { textTransform: 'uppercase' } })}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('आयकर भरणा कधीपासून करत आहात (सन)', 'Paying Tax Since (Year)', 'incTaxSinceYear', 'number')}</div>
            <div className="v-col" style={{ flex: 0.5 }}></div>
          </div>
          <div style={{ marginTop: 8, marginBottom: 8, border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <table className="vl-data-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ width: '33%', fontSize: '11px', padding: '4px' }}>{L('आर्थिक वर्ष', 'Financial Year')}</th>
                  <th style={{ width: '33%', fontSize: '11px', padding: '4px' }}>{L('आयकर रक्कम ₹', 'Tax Amount ₹')}</th>
                  <th style={{ width: '33%', fontSize: '11px', padding: '4px' }}>{L('भरणा दिनांक', 'Paid Date')}</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map(i => {
                  const row = (data.incTaxDetails && data.incTaxDetails[i]) || { year: '', amount: '', date: '' };
                  return (
                    <tr key={i}>
                      <td>
                        <select className="v-table-input" value={row.year} onChange={e => handleTaxRow('incTaxDetails', i, 'year', e.target.value)}>
                          <option value="">-- Year --</option>
                          {Array.from({ length: 41 }, (_, k) => { const y = 2000 + k; return `${y}-${String(y + 1).slice(2)}`; }).map(fy => <option key={fy} value={fy}>{fy}</option>)}
                        </select>
                      </td>
                      <td><input type="text" className="v-table-input" value={row.amount} onChange={e => handleTaxRow('incTaxDetails', i, 'amount', e.target.value.replace(/\D/g, ''))} /></td>
                      <td><input type="date" className="v-table-input" value={row.date} onChange={e => handleTaxRow('incTaxDetails', i, 'date', e.target.value)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Section 3: Professional Tax ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('व्यवसाय कर (Professional Tax) तपशील', 'Professional Tax Details')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>{ti('व्यवसाय कर नं.', 'Prof Tax No.', 'profTaxNo')}</div>
            <div className="v-col" style={{ flex: 1.5 }}>{ti('भरणा कधीपासून करत आहात (सन)', 'Paying Tax Since (Year)', 'profTaxSinceYear', 'number')}</div>
            <div className="v-col" style={{ flex: 0.5 }}></div>
          </div>
          <div style={{ marginTop: 8, marginBottom: 8, border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <table className="vl-data-table" style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th style={{ width: '33%', fontSize: '11px', padding: '4px' }}>{L('आर्थिक वर्ष', 'Financial Year')}</th>
                  <th style={{ width: '33%', fontSize: '11px', padding: '4px' }}>{L('कर रक्कम ₹', 'Tax Amount ₹')}</th>
                  <th style={{ width: '33%', fontSize: '11px', padding: '4px' }}>{L('भरणा दिनांक', 'Paid Date')}</th>
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map(i => {
                  const row = (data.profTaxDetails && data.profTaxDetails[i]) || { year: '', amount: '', date: '' };
                  return (
                    <tr key={i}>
                      <td>
                        <select className="v-table-input" value={row.year} onChange={e => handleTaxRow('profTaxDetails', i, 'year', e.target.value)}>
                          <option value="">-- Year --</option>
                          {Array.from({ length: 41 }, (_, k) => { const y = 2000 + k; return `${y}-${String(y + 1).slice(2)}`; }).map(fy => <option key={fy} value={fy}>{fy}</option>)}
                        </select>
                      </td>
                      <td><input type="text" className="v-table-input" value={row.amount} onChange={e => handleTaxRow('profTaxDetails', i, 'amount', e.target.value.replace(/\D/g, ''))} /></td>
                      <td><input type="date" className="v-table-input" value={row.date} onChange={e => handleTaxRow('profTaxDetails', i, 'date', e.target.value)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Section 4: Extra Remarks ── */}
      <div className="v-form-section">
        <div className="v-form-section-header">
          <div style={{ width: '3px', height: '14px', background: '#6366f1' }} />
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('अतिरिक्त माहिती', 'Additional Information')}</div>
        </div>
        <div style={{ padding: '0 12px 6px 12px' }}>
          <div className="v-form-row">
            <div className="v-col" style={{ flex: 1 }}>
              <TA label={L('व्यवसाया विषयी अतिरिक्त माहिती', 'Extra Business Info')} name="bizExtraInfo" data={data} setData={setData} rows={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── Mapping Detail DTO to Form State ─────────────────────────────────────
function mapDetailToFormState(d) {
  const s = { ...initState };
  if (!d) return s;

  // Basic Info
  s.id = d.id;
  s.dinank = d.dinank || '';
  s.saCra = d.saCra || '';
  s.karjKhate = d.karjKhate || '';
  s.shakha = d.shakha || '';
  s.arjdarNaav = d.arjdarNaav || '';
  s.arjdarVay = d.arjdarVay || '';
  s.karjRakkam = d.karjRakkam || '';
  s.akshari = d.akshari || '';
  s.paratfedKalavadhi = d.paratfedKalavadhi || '';
  s.pahilaHapta = d.pahilaHapta || '';
  s.tarikh = d.tarikh || '';
  s.karan = d.karan || '';
  s.vaivahik = d.vaivahik || 'विवाहित';
  s.avalambun = d.avalambun || '';
  s.vyajDar = d.vyajDar || '';
  s.jameen1Naav = d.jameen1Naav || '';
  s.jameen1Vay = d.jameen1Vay || '';
  s.jameen2Naav = d.jameen2Naav || '';
  s.jameen2Vay = d.jameen2Vay || '';
  s.jameen3Naav = d.jameen3Naav || '';
  s.jameen3Vay = d.jameen3Vay || '';
  s.thikan = d.thikan || '';

  // Step 8 Basic fields
  s.incTaxPan = d.incTaxPan || '';
  s.incTaxSinceYear = d.incTaxSinceYear || '';
  s.profTaxNo = d.profTaxNo || '';
  s.profTaxSinceYear = d.profTaxSinceYear || '';
  s.bizExtraInfo = d.bizExtraInfo || '';

  const mapP = (p, prefix) => {
    if (!p) return;
    s[`${prefix}Photo`] = p.photo || null;
    s[`${prefix}Naav`] = p.naav || '';
    s[`${prefix}Vay`] = p.vay || '';
    s[`${prefix}SabasadNo`] = p.sabasadNo || '';
    s[`${prefix}Shares`] = p.shares || '';
    s[`${prefix}SharesRakkam`] = p.sharesRakkam || '';
    s[`${prefix}VadilNaav`] = p.vadilNaav || '';
    s[`${prefix}VadilVay`] = p.vadilVay || '';
    s[`${prefix}AaiNaav`] = p.aaiNaav || '';
    s[`${prefix}AaiVay`] = p.aaiVay || '';
    s[`${prefix}Patta`] = p.patta || '';
    s[`${prefix}PinKod`] = p.pinKod || '';
    s[`${prefix}Durdhvani`] = p.durdhvani || '';
    s[`${prefix}Mobile`] = p.mobile || '';
    s[`${prefix}Email`] = p.email || '';
    s[`${prefix}JageSwaarup`] = p.jageSwaarup || [];
    s[`${prefix}Kalavadhi_m`] = p.kalavadhi_m || '';
    s[`${prefix}Kalavadhi_v`] = p.kalavadhi_v || '';
    s[`${prefix}Vaivahik`] = p.vaivahik || 'विवाहित';
    s[`${prefix}Avalambun`] = p.avalambun || '';
    s[`${prefix}Company`] = p.company || '';
    s[`${prefix}CompanyPatta`] = p.companyPatta || '';
    s[`${prefix}CompanyPin`] = p.companyPin || '';
    s[`${prefix}CompanyTel`] = p.companyTel || '';
    s[`${prefix}CompanyMobile`] = p.companyMobile || '';
    s[`${prefix}CompanyEmail`] = p.companyEmail || '';
    s[`${prefix}Vibhag`] = p.vibhag || '';
    s[`${prefix}Hudda`] = p.hudda || '';
    s[`${prefix}EmpCode`] = p.empCode || '';
    s[`${prefix}Karj_m`] = p.karj_m || '';
    s[`${prefix}Karj_v`] = p.karj_v || '';
    s[`${prefix}Seva`] = p.seva || '';
    s[`${prefix}MonthlyVetan`] = p.monthlyVetan || '';
    s[`${prefix}Kapat`] = p.kapat || '';
    s[`${prefix}Niwal`] = p.niwal || '';
    s[`${prefix}Vaarshik`] = p.vaarshik || '';
    s[`${prefix}Kharcha`] = p.kharcha || '';
    s[`${prefix}NiwalVaarshik`] = p.niwalVaarshik || '';
    s[`${prefix}Kutumb`] = p.kutumb || '';
    s[`${prefix}KutumbType`] = p.kutumbType || 'मासिक';
    s[`${prefix}ShetiNaav`] = p.shetiNaav || '';
    s[`${prefix}ShetiNaate`] = p.shetiNaate || '';
    s[`${prefix}GaavMukkam`] = p.gaavMukkam || '';
    s[`${prefix}GaavPost`] = p.gaavPost || '';
    s[`${prefix}GaavTaluka`] = p.gaavTaluka || '';
    s[`${prefix}GaavJilha`] = p.gaavJilha || '';
    s[`${prefix}GaavRajya`] = p.gaavRajya || '';
    s[`${prefix}GaavPin`] = p.gaavPin || '';
    s[`${prefix}GaavDurdhvani`] = p.gaavDurdhvani || '';
    s[`${prefix}GaavMobile`] = p.gaavMobile || '';
    s[`${prefix}PurvKarjPrakar`] = p.purvKarjPrakar || '';
    s[`${prefix}PurvKhate`] = p.purvKhate || '';
    s[`${prefix}PurvRakkam`] = p.purvRakkam || '';
    s[`${prefix}PurvDin1`] = p.purvDin1 || '';
    s[`${prefix}PurvDin2`] = p.purvDin2 || '';
    s[`${prefix}Jam94aKarjdarNaav`] = p.jam94aKarjdarNaav || '';
    s[`${prefix}Jam94aPrakar`] = p.jam94aPrakar || '';
    s[`${prefix}Jam94aKhate`] = p.jam94aKhate || '';
    s[`${prefix}Jam94aRakkam`] = p.jam94aRakkam || '';
    s[`${prefix}Jam94aDin1`] = p.jam94aDin1 || '';
    s[`${prefix}Jam94aDin2`] = p.jam94aDin2 || '';
    s[`${prefix}Jam94bKarjdarNaav`] = p.jam94bKarjdarNaav || '';
    s[`${prefix}Jam94bPrakar`] = p.jam94bPrakar || '';
    s[`${prefix}Jam94bKhate`] = p.jam94bKhate || '';
    s[`${prefix}Jam94bRakkam`] = p.jam94bRakkam || '';
    s[`${prefix}Jam94bDin1`] = p.jam94bDin1 || '';
    s[`${prefix}Jam94bDin2`] = p.jam94bDin2 || '';
    s[`${prefix}Kutumb95Naav`] = p.kutumb95Naav || '';
    s[`${prefix}Kutumb95Prakar`] = p.kutumb95Prakar || '';
    s[`${prefix}Kutumb95Khate`] = p.kutumb95Khate || '';
    s[`${prefix}Kutumb95Rakkam`] = p.kutumb95Rakkam || '';
    s[`${prefix}Kutumb95Din1`] = p.kutumb95Din1 || '';
    s[`${prefix}Kutumb95Din2`] = p.kutumb95Din2 || '';
    s[`${prefix}Bank96Naav`] = p.bank96Naav || '';
    s[`${prefix}Bank96Shakha`] = p.bank96Shakha || '';
    s[`${prefix}Bank96Prakar`] = p.bank96Prakar || '';
    s[`${prefix}Bank96Khate`] = p.bank96Khate || '';
    s[`${prefix}Bank96Rakkam`] = p.bank96Rakkam || '';
    s[`${prefix}Bank96Din1`] = p.bank96Din1 || '';
    s[`${prefix}Bank96Din2`] = p.bank96Din2 || '';
    s[`${prefix}Dinank`] = p.dinank || '';
    s[`${prefix}Thikan`] = p.thikan || '';
  };

  mapP(d.borrower, 'b');
  mapP(d.guarantor1, 'g1');
  mapP(d.guarantor2, 'g2');

  // New Vehicle
  if (d.newVehicle) {
    const nv = d.newVehicle;
    s.newVahanaVapar = nv.vahanaVapar || '';
    s.newCompanyNaav = nv.companyNaav || '';
    s.newVahanaPrakar = nv.vahanaPrakar || '';
    s.newNirmitVarsh = nv.nirmitVarsh || '';
    s.newModel = nv.model || '';
    s.newFuelType = nv.fuelType || '';
    s.newDealerNaav = nv.dealerNaav || '';
    s.newDealerPatta = nv.dealerPatta || '';
    s.newDealerMobile = nv.dealerMobile || '';
    s.newDealerTel = nv.dealerTel || '';
    s.newDealerEmail = nv.dealerEmail || '';
    s.newKimat = nv.kimat || '';
    s.newBooking = nv.booking || '';
    s.newShillak = nv.shillak || '';
    s.newDepositYes = nv.depositYes;
    s.newDepositAmt = nv.depositAmt || '';
    s.newParkingThikan = nv.parkingThikan || '';
    s.newPermitNo = nv.permitNo || '';
    s.newPermitRenew = nv.permitRenew || '';
    s.newOtherVehicleYes = nv.otherVehicleYes;
    s.newOtherVehicleNo = nv.otherVehicleNo || '';
    s.newOtherVehicleType = nv.otherVehicleType || '';
    s.newOtherVehicleModel = nv.otherVehicleModel || '';
    s.newOtherVehicleYear = nv.otherVehicleYear || '';
  }

  // Old Vehicle
  if (d.oldVehicle) {
    const ov = d.oldVehicle;
    s.oldVahanaVapar = ov.vahanaVapar || '';
    s.oldDealerNaav = ov.dealerNaav || '';
    s.oldDealerPatta = ov.dealerPatta || '';
    s.oldDealerMobile = ov.dealerMobile || '';
    s.oldDealerTel = ov.dealerTel || '';
    s.oldDealerEmail = ov.dealerEmail || '';
    s.oldCompanyNaav = ov.companyNaav || '';
    s.oldVehicleNo = ov.vehicleNo || '';
    s.oldRTO = ov.rto || '';
    s.oldVahanaPrakar = ov.vahanaPrakar || '';
    s.oldNirmitVarsh = ov.nirmitVarsh || '';
    s.oldEngineNo = ov.engineNo || '';
    s.oldChassisNo = ov.chassisNo || '';
    s.oldModel = ov.model || '';
    s.oldFuelType = ov.fuelType || '';
    s.oldFitnessNo = ov.fitnessNo || '';
    s.oldFitnessRenew = ov.fitnessRenew || '';
    s.oldParkingThikan = ov.parkingThikan || '';
    s.oldPermitNo = ov.permitNo || '';
    s.oldPermitArea = ov.permitArea || '';
    s.oldPermitRenewDate = ov.permitRenewDate || '';
    s.oldPermitFrom = ov.permitFrom || '';
    s.oldPermitTo = ov.permitTo || '';
    s.oldRoadTax = ov.roadTax || '';
    s.oldRoadTaxPeriod = ov.roadTaxPeriod || '';
    s.oldOtherVehicleYes = ov.otherVehicleYes;
    s.oldOtherVehicleNo = ov.otherVehicleNo || '';
    s.oldOtherVehicleType = ov.otherVehicleType || '';
    s.oldOtherVehicleModel = ov.otherVehicleModel || '';
    s.oldOtherVehicleYear = ov.otherVehicleYear || '';
  }

  // Insurance
  if (d.insurance) {
    const i = d.insurance;
    s.insCompanyNaav = i.insCompanyNaav || '';
    s.insAddress = i.insAddress || '';
    s.insPolicy = i.insPolicy || '';
    s.insDurFrom = i.insDurFrom || '';
    s.insDurTo = i.insDurTo || '';
    s.insAmount = i.insAmount || '';
    s.insPremium = i.insPremium || '';
    s.oldKimat = i.oldKimat || '';
    s.oldAdvance = i.oldAdvance || '';
    s.oldShillak = i.oldShillak || '';
    s.oldValuationPrice = i.oldValuationPrice || '';
    s.oldDepositYes = i.oldDepositYes;
    s.oldDepositAmt = i.oldDepositAmt || '';
    s.lifeInsCompany = i.lifeInsCompany || '';
    s.lifeInsAddress = i.lifeInsAddress || '';
    s.lifeInsPolicy = i.lifeInsPolicy || '';
    s.lifeInsDurFrom = i.lifeInsDurFrom || '';
    s.lifeInsDurTo = i.lifeInsDurTo || '';
    s.lifeInsAmount = i.lifeInsAmount || '';
    s.lifeInsPremium = i.lifeInsPremium || '';
    s.lifeInsPremiumType = i.lifeInsPremiumType || '';
    s.lifeInsLoanYes = i.lifeInsLoanYes;
    s.lifeInsLoanBank = i.lifeInsLoanBank || '';
    s.lifeInsLoanAmount = i.lifeInsLoanAmount || '';
    s.lifeInsLoanDate = i.lifeInsLoanDate || '';
    s.lifeInsLoanAddress = i.lifeInsLoanAddress || '';
    s.lifeInsLoanBalance = i.lifeInsLoanBalance || '';
  }

  // Business Info
  if (d.businessInfo) {
    const b = d.businessInfo;
    s.bizType = b.bizType || '';
    s.bizCategory = b.bizCategory || '';
    try {
      s.bizPremisesType = typeof b.bizPremisesType === 'string' ? JSON.parse(b.bizPremisesType) : (b.bizPremisesType || []);
    } catch (e) {
      s.bizPremisesType = [];
    }
    s.bizArea = b.bizArea || '';
    s.bizAreaUnit = b.bizAreaUnit || '';
    s.bizAreaType = b.bizAreaType || '';
    s.bizName = b.bizName || '';
    s.bizAddress = b.bizAddress || '';
    s.bizPin = b.bizPin || '';
    s.bizMobile = b.bizMobile || '';
    s.bizEmail = b.bizEmail || '';
    s.bizPan = b.bizPan || '';
    s.bizGumasta = b.bizGumasta || '';
    s.bizSalesTax = b.bizSalesTax || '';
    s.bizVat = b.bizVat || '';
    s.bizServiceTax = b.bizServiceTax || '';
    s.bizOtherLicense = b.bizOtherLicense || '';
    s.bizHasLicenses = b.bizHasLicenses;
    s.bizLicenseDetails = b.bizLicenseDetails || '';
    s.bizIsResidentInZone = b.bizIsResidentInZone;
    s.bizStartDate = b.bizStartDate || '';
    s.bizExperience = b.bizExperience || '';
    s.bizIncome = b.bizIncome || '';
    s.bizExpense = b.bizExpense || '';
    s.bizNetIncome = b.bizNetIncome || '';
    s.bizCust1Name = b.bizCust1Name || '';
    s.bizCust1Address = b.bizCust1Address || '';
    s.bizCust2Name = b.bizCust2Name || '';
    s.bizCust2Address = b.bizCust2Address || '';
    s.bizSupplier1Name = b.bizSupplier1Name || '';
    s.bizSupplier1Address = b.bizSupplier1Address || '';
    s.bizSupplier2Name = b.bizSupplier2Name || '';
    s.bizSupplier2Address = b.bizSupplier2Address || '';
  }

  // Tax Details
  if (d.incTaxDetails && d.incTaxDetails.length > 0) s.incTaxDetails = d.incTaxDetails;
  if (d.profTaxDetails && d.profTaxDetails.length > 0) s.profTaxDetails = d.profTaxDetails;

  // Extra Guarantors
  if (d.applicationGuarantors && d.applicationGuarantors.length > 0) {
    s.extraGuarantors = d.applicationGuarantors.map(g => {
      const eid = g.id || Math.random().toString(36).substr(2, 9);
      mapP(g, `exG_${eid}`);
      return eid;
    });
  }

  return s;
}

// ─── Marathi number helper ─────────────────────────────────────────────────
const marathiNums = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२'];
function toMarathi(n) {
  if (n <= 12) return marathiNums[n];
  return String(n);
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function VehicleLoanForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const aadharAppliedRef = useRef(false);
  const [lang, setLang] = useState('mr');
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initState);
  const [showPreview, setShowPreview] = useState(false);

  // ── API state ──────────────────────────────────────────────────────────
  const [draftId, setDraftId] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [stepErrors, setStepErrors] = useState({});   // { fieldName: errorMsg }
  const [showStepErrors, setShowStepErrors] = useState(false);

  // ── Search/Fetch states ──────────────────────────────────────────────
  const [searchId, setSearchId] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');

  const handleFetch = async () => {
    if (!searchId) {
      alert(L('कृपया अर्ज क्रमांक टाका', 'Please enter Application No.'));
      return;
    }
    setSearching(true);
    setSearchStatus(L('शोधत आहे...', 'Searching...'));
    try {
      const res = await getApplicationByNo(searchId);
      if (res && res.success && res.data) {
        const flatData = mapDetailToFormState(res.data);
        setData(flatData);
        setSearchStatus(L('अर्ज सापडला!', 'Application Found!'));
      } else {
        setSearchStatus(L('अर्ज सापडला नाही.', 'Application not found.'));
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setSearchStatus(L('काहीतरी चूक झाली.', 'Something went wrong.'));
    } finally {
      setSearching(false);
    }
  };

  const L = (mr, en) => lang === 'mr' ? mr : en;

  // ── Build dynamic steps list ──
  const extraGs = data.extraGuarantors || [];
  const FIXED_BEFORE = 4;
  const extraGSteps = extraGs.map((g, idx) => ({
    label: L(`जामिनदार क्र. ${idx + 3}`, `Guarantor No. ${idx + 3}`),
    type: 'extraGuarantor',
    id: g.id,
    idx,
  }));
  const stepsList = [
    L('मूलभूत माहिती', 'Basic Information'),
    L('कर्जदाराची माहिती', "Borrower's Information"),
    L('जामिनदार क्र. १', 'Guarantor No. 1'),
    L('जामिनदार क्र. २', 'Guarantor No. 2'),
    ...extraGSteps.map(s => s.label),
    L('नवीन वाहन तपशील', 'New Vehicle Details'),
    L('जुने वाहन तपशील', 'Old Vehicle Details'),
    L('व्यवसायाची माहिती', 'Business Info'),
    L('अर्जदार/भागीदार माहिती', 'Applicant/Partner Info'),
    L('सारांश व सबमिट', 'Review & Submit'),
  ];

  const totalSteps = stepsList.length;
  const REVIEW_STEP = totalSteps - 1;
  const NEW_VEHICLE_STEP = FIXED_BEFORE + extraGs.length;
  const OLD_VEHICLE_STEP = NEW_VEHICLE_STEP + 1;
  const BUSINESS_INFO_STEP = NEW_VEHICLE_STEP + 2;
  const APPLICANT_PARTNER_STEP = NEW_VEHICLE_STEP + 3;

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
      bPinKod: formattedAddress.match(/\d{6}/)?.[0] || p.bPinKod,
    }));

    // Clear the navigation state so it doesn't re-apply on re-render
    window.history.replaceState({}, document.title);
    aadharAppliedRef.current = true;
  };

  // ── Auto-fill from Aadhaar when navigated from Loans module ──────────
  useEffect(() => {
    const fetchFullAadharDetail = async (partialData) => {
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

  // FETCH EXISTING LOAN DATA IF ID IS PASSED (FOR EDITING)
  useEffect(() => {
    const editId = location.state?.id || id;
    if (!editId || fetchedIdRef.current === editId) return;

    const fetchExistingLoan = async (targetId) => {
      try {
        setApiLoading(true);
        const response = await getApplicationById(targetId);
        if (response && response.success && response.data) {
          const mapped = mapDtoToState(response.data);
          setData(mapped);
          setDraftId(targetId);
          fetchedIdRef.current = targetId;
        }
      } catch (error) {
        console.error("Error fetching existing vehicle loan:", error);
        showToast('Failed to load loan data', 'error');
      } finally {
        setApiLoading(false);
      }
    };

    fetchExistingLoan(editId);
  }, [location.state?.id, id, showToast]);

  // LocalStorage persistence — skip if Aadhaar data was just applied
  useEffect(() => {
    if (aadharAppliedRef.current) return; // Aadhaar data takes priority
    try {
      const saved = localStorage.getItem('vl_form_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        setData(p => ({ ...p, ...parsed.formData }));
        if (parsed.draftId) setDraftId(parsed.draftId);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('vl_form_draft', JSON.stringify({ formData: data, draftId }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, draftId]);

  const toggleLang = (l) => {
    setLang(l);
    if (data.karjRakkam) {
      const fn = l === 'mr' ? numberToWordsMr : numberToWordsEn;
      setData(p => ({ ...p, akshari: fn(p.karjRakkam) }));
    }
  };

  const handleRakkam = e => {
    const v = e.target.value.replace(/\D/g, '');
    const fn = lang === 'mr' ? numberToWordsMr : numberToWordsEn;
    setData(p => ({ ...p, karjRakkam: v, akshari: fn(v) }));
  };

  const formCardRef = useRef(null);
  const wrapperRef = useRef(null);

  // ── Per-step validation ─────────────────────────────────────────────────
  const validateStep = (s) => {
    return {}; // Validation removed as per request
    const errs = {};

    const checkMobile = (key, label) => {
      const v = data[key] || '';
      if (v && !/^[6-9]\d{9}$/.test(v)) errs[key] = `${label}: valid 10-digit mobile required`;
    };
    const checkEmail = (key, label) => {
      const v = data[key] || '';
      if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) errs[key] = `${label}: valid email required`;
    };
    const checkPin = (key, label) => {
      const v = data[key] || '';
      if (v && !/^\d{6}$/.test(v)) errs[key] = `${label}: must be 6 digits`;
    };
    const checkRequired = (key, label) => {
      if (!data[key] || data[key] === '') errs[key] = `${label} is required`;
    };
    const checkPersonFields = (prefix, personName) => {
      checkRequired(prefix + 'Naav', `${personName} Name`);
      checkMobile(prefix + 'Mobile', `${personName} Mobile`);
      checkMobile(prefix + 'CompanyMobile', `${personName} Company Mobile`);
      checkMobile(prefix + 'GaavMobile', `${personName} Village Mobile`);
      checkEmail(prefix + 'Email', `${personName} Email`);
      checkEmail(prefix + 'CompanyEmail', `${personName} Company Email`);
      checkPin(prefix + 'PinKod', `${personName} PIN`);
      checkPin(prefix + 'CompanyPin', `${personName} Company PIN`);
      checkPin(prefix + 'GaavPin', `${personName} Village PIN`);
    };

    if (s === 0) {
      checkRequired('arjdarNaav', 'Applicant Name');
      checkRequired('karjRakkam', 'Loan Amount');
      if (data.karjRakkam && parseFloat(data.karjRakkam) <= 0)
        errs['karjRakkam'] = 'Loan Amount must be greater than 0';
    }
    if (s === 1) checkPersonFields('b', 'Borrower');
    if (s === 2) checkPersonFields('g1', 'Guarantor 1');
    if (s === 3) checkPersonFields('g2', 'Guarantor 2');
    if (s >= FIXED_BEFORE && s < FIXED_BEFORE + extraGs.length) {
      const g = extraGs[s - FIXED_BEFORE];
      checkPersonFields(`exG_${g.id}`, `Guarantor ${s - FIXED_BEFORE + 3}`);
    }
    if (s === NEW_VEHICLE_STEP) {
      checkMobile('newDealerMobile', 'Dealer Mobile');
      checkEmail('newDealerEmail', 'Dealer Email');
    }
    if (s === OLD_VEHICLE_STEP) {
      checkMobile('oldDealerMobile', 'Dealer Mobile');
      checkEmail('oldDealerEmail', 'Dealer Email');
    }
    if (s === BUSINESS_INFO_STEP) {
      checkPin('bizPin', 'Business PIN');
      checkMobile('bizMobile', 'Business Mobile');
      checkEmail('bizEmail', 'Business Email');
    }
    return errs;
  };

  const scrollToTop = () => {
    // Try every possible scroll container
    const els = [
      wrapperRef.current,
      formCardRef.current,
      document.querySelector('.master-content-wrapper'),
      document.querySelector('.vehicle-loan-wrapper'),
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

  const next = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      setShowStepErrors(true);
      scrollToTop();
      return;
    }
    setStepErrors({});
    setShowStepErrors(false);
    setStep(s => Math.min(s + 1, totalSteps - 1));
  };
  const prev = () => {
    setStepErrors({});
    setShowStepErrors(false);
    setStep(s => Math.max(s - 1, 0));
  };

  // Scroll to top after every step change — setTimeout ensures DOM has updated
  useEffect(() => {
    scrollToTop();
    setTimeout(scrollToTop, 50);
    setTimeout(scrollToTop, 150);
  }, [step]);

  const addGuarantor = () => {
    const id = Date.now();
    const extraFields = buildExtraGuarantorFields(id);
    setData(p => ({
      ...p,
      ...extraFields,
      extraGuarantors: [...(p.extraGuarantors || []), { id }]
    }));
  };

  const removeGuarantor = (id) => {
    const removedIdx = (data.extraGuarantors || []).findIndex(g => g.id === id);
    const removedStep = FIXED_BEFORE + removedIdx;
    if (step > removedStep) {
      setStep(s => s - 1);
    } else if (step === removedStep) {
      setStep(s => Math.max(s - 1, 0));
    }
    setData(p => ({ ...p, extraGuarantors: p.extraGuarantors.filter(g => g.id !== id) }));
  };

  // ── Guarantor name/age sync handlers ──────────────────────────────────
  // When name/age is typed on Step 0 (summary cards), sync to the PersonBlock fields.
  // For fixed guarantors g1, g2: nameKey=jameen1Naav → g1Naav, vayKey=jameen1Vay → g1Vay
  const handleG1NaavChange = e => {
    const v = e.target.value;
    setData(p => ({ ...p, jameen1Naav: v, g1Naav: v }));
  };
  const handleG1VayChange = e => {
    const v = e.target.value.replace(/\D/g, '');
    setData(p => ({ ...p, jameen1Vay: v, g1Vay: v }));
  };
  const handleG2NaavChange = e => {
    const v = e.target.value;
    setData(p => ({ ...p, jameen2Naav: v, g2Naav: v }));
  };
  const handleG2VayChange = e => {
    const v = e.target.value.replace(/\D/g, '');
    setData(p => ({ ...p, jameen2Vay: v, g2Vay: v }));
  };

  // For extra guarantors: sync exG_{id}Naav/Vay on the Step 0 summary card
  const handleExtraGNaavChange = (id, e) => {
    const v = e.target.value;
    setData(p => ({ ...p, [`exG_${id}Naav`]: v }));
  };
  const handleExtraGVayChange = (id, e) => {
    const v = e.target.value.replace(/\D/g, '');
    setData(p => ({ ...p, [`exG_${id}Vay`]: v }));
  };

  // ── Final Submit handler ────────────────────────────────────────────────
  const handleSubmit = async () => {
    setApiLoading(true);
    setApiError('');
    setApiSuccess('');
    try {
      let result;
      if (draftId) {
        result = await submitDraft(draftId, data);
      } else {
        result = await submitApplication(data);
      }
      if (result.success) {
        localStorage.removeItem('vl_form_draft');
        showToast ? showToast(L('वाहन कर्ज अर्ज यशस्वीरीत्या सबमिट झाला!', 'Vehicle loan application submitted successfully!'), 'success') : alert(L('वाहन कर्ज अर्ज यशस्वीरीत्या सबमिट झाला!', 'Vehicle loan application submitted successfully!'));

        setTimeout(() => {
          navigate('/loans', { state: { activeTab: 'applications' } });
        }, 1500);

        // Clear data IMMEDIATELY to avoid saving it back to localStorage via useEffect
        setStep(0);
        setData(initState);
        setDraftId(null);
        setStepErrors({});
        setShowStepErrors(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      let backendError = err?.response?.data?.detail || err?.response?.data?.message || err.message;
      
      // Handle ASP.NET Core Validation Errors
      if (err?.response?.data?.errors) {
        const errs = err.response.data.errors;
        const detail = Object.keys(errs).map(k => `${k}: ${errs[k].join(', ')}`).join(' | ');
        backendError = `Validation Error: ${detail}`;
      }
      
      setApiError(backendError || L('अर्ज सबमिट करताना त्रुटी आली.', 'Error submitting application.'));
      showToast ? showToast(backendError, 'error') : alert(backendError);
    } finally {
      setApiLoading(false);
    }
  };

  const totalGuarantors = 2 + extraGs.length;

  // ── Build step content dynamically ──
  const getStepContent = (s) => {
    if (s === 0) {
      return (
        <div key={0} className="form-step-content" style={{ padding: '0 8px' }}>
          {/* ── Section 1: Basic Info ── */}
          <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
            <div className="v-form-section-header">
              <div style={{ width: '3px', height: '14px', background: '#eab308' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('मूलभूत माहिती', 'Basic Information')}</div>
            </div>
            <div style={{ padding: '0 12px 6px 12px' }}>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}><TI label={L('दिनांक', 'Date')} name="dinank" data={data} setData={setData} type="date" /></div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}><TI label={L('शाखा', 'Branch')} name="shakha" data={data} setData={setData} /></div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}><TI label={L('सभासद क्र.', 'Member No.')} name="saCra" data={data} setData={setData} type="number" /></div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}><TI label={L('कर्ज खाते क्र.', 'Loan A/C No.')} name="karjKhate" data={data} setData={setData} type="number" /></div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}></div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}></div>
              </div>
            </div>
          </div>

          {/* ── Section 2: Loan Details ── */}
          <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '4px', overflow: 'hidden' }}>
            <div className="v-form-section-header">
              <div style={{ width: '3px', height: '14px', background: '#3b82f6' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('कर्जाचा तपशील', 'Loan Details')}</div>
            </div>
            <div style={{ padding: '0 12px 6px 12px' }}>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}><TI label={L('अर्जदाराचे नाव', "Applicant's Name")} name="arjdarNaav" data={data} setData={setData} /></div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}><TI label={L('वय', 'Age')} name="arjdarVay" data={data} setData={setData} type="number" /></div>
                <div className="v-col pb-col3 no-colon" style={{ flex: 1.5 }}>
                  <Radio
                    label={L('वैवाहिक स्थिती', 'Marital Status')}
                    name="vaivahik"
                    options={[{ val: 'विवाहित', label: L('विवाहित', 'Married') }, { val: 'अविवाहित', label: L('अविवाहित', 'Unmarried') }]}
                    data={data} setData={setData}
                  />
                </div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}><TI label={L('अवलंबून व्यक्ती', 'Dependents')} name="avalambun" data={data} setData={setData} type="number" /></div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}>
                  <div className="field">
                    <label>{L('कर्ज रक्कम ₹', 'Loan Amount ₹')}</label>
                    <input type="text" value={data.karjRakkam || ''} onChange={handleRakkam}
                      style={stepErrors['karjRakkam'] ? { borderColor: '#ef4444', background: '#fff5f5' } : {}} />
                  </div>
                </div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}><TI label={L('परतफेड कालावधी (महिने)', 'Repayment Period (Months)')} name="paratfedKalavadhi" data={data} setData={setData} type="number" /></div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ flex: 1.5 }}><TI label={L('पहिला हप्ता (महिन्यांनंतर)', 'First Installment (after months)')} name="pahilaHapta" data={data} setData={setData} type="number" /></div>
                <div className="v-col pb-col2" style={{ flex: 1.5 }}><TI label={L('हप्ता तारीख (प्रत्येक महिन्याची)', 'Installment Date')} name="tarikh" data={data} setData={setData} type="number" /></div>
                <div className="v-col pb-col3" style={{ flex: 1.5 }}><TI label={L('व्याज दर (%)', 'Interest Rate (%)')} name="vyajDar" data={data} setData={setData} type="number" /></div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '2px' }}>
                <div className="v-col pb-col1" style={{ width: '100%', flex: '1 1 100%' }}>
                  <TA label={L('कर्ज उद्देश/कारण', 'Loan Purpose/Reason')} name="karan" data={data} setData={setData} rows={1} />
                </div>
              </div>
              <div className="v-form-row" style={{ marginBottom: '0' }}>
                <div className="v-col pb-col1" style={{ width: '100%', flex: '1 1 100%' }}>
                  <div className="field">
                    <label>{L('अक्षरी', 'In Words')}</label>
                    <input type="text" value={data.akshari} readOnly style={{ background: '#f8f9fa' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Guarantors ── */}
          <div style={{ border: '1px solid #fed7aa', borderRadius: '6px', background: '#ffffff', marginBottom: '8px', overflow: 'hidden' }}>
            <div className="v-form-section-header">
              <div style={{ width: '3px', height: '14px', background: '#10b981' }} />
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c2d12' }}>{L('जामिनदारांची माहिती', 'Guarantors Information')}</div>
            </div>
            <div style={{ padding: '0 12px 10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'stretch', gap: '12px', marginBottom: '4px' }}>
                {/* ── Guarantor 1 — synced to g1Naav / g1Vay ── */}
                <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px' }}>
                  <div style={{ fontWeight: '800', color: '#7c2d12', marginBottom: '8px', fontSize: '12px' }}>१) {L('जामिनदार', 'Guarantor')}</div>
                  <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                    <div className="field">
                      <label>{L('जामिनदाराचे नाव', "Guarantor's Name")}</label>
                      <input type="text" value={data.jameen1Naav || ''} onChange={handleG1NaavChange} />
                    </div>
                  </div>
                  <div className="v-col lbl-med" style={{ width: '100%', flex: 'none', marginTop: '6px' }}>
                    <div className="field">
                      <label>{L('वय', 'Age')}</label>
                      <input type="text" value={data.jameen1Vay || ''} onChange={handleG1VayChange} />
                    </div>
                  </div>
                </div>

                {/* ── Guarantor 2 — synced to g2Naav / g2Vay ── */}
                <div style={{ flex: 1, border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px' }}>
                  <div style={{ fontWeight: '800', color: '#7c2d12', marginBottom: '8px', fontSize: '12px' }}>२) {L('जामिनदार', 'Guarantor')}</div>
                  <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                    <div className="field">
                      <label>{L('जामिनदाराचे नाव', "Guarantor's Name")}</label>
                      <input type="text" value={data.jameen2Naav || ''} onChange={handleG2NaavChange} />
                    </div>
                  </div>
                  <div className="v-col lbl-med" style={{ width: '100%', flex: 'none', marginTop: '6px' }}>
                    <div className="field">
                      <label>{L('वय', 'Age')}</label>
                      <input type="text" value={data.jameen2Vay || ''} onChange={handleG2VayChange} />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Extra guarantors ── */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
                {extraGs.map((g, idx) => {
                  const num = idx + 3;
                  const nMr = toMarathi(num);
                  return (
                    <div style={{ flex: '1 1 calc(50% - 6px)', border: '1px solid #fed7aa', borderRadius: '4px', padding: '8px', minWidth: '300px' }} key={g.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: '800', color: '#7c2d12', fontSize: '12px' }}>{nMr}) {L('जामिनदार', 'Guarantor')}</div>
                        <button className="bl-delete-guarantor-btn" onClick={() => removeGuarantor(g.id)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="v-col lbl-med" style={{ width: '100%', flex: 'none' }}>
                        <div className="field">
                          <label>{L('जामिनदाराचे नाव', "Guarantor's Name")}</label>
                          <input type="text" value={data[`exG_${g.id}Naav`] || ''} onChange={e => handleExtraGNaavChange(g.id, e)} />
                        </div>
                      </div>
                      <div className="v-col lbl-med" style={{ width: '100%', flex: 'none', marginTop: '6px' }}>
                        <div className="field">
                          <label>{L('वय', 'Age')}</label>
                          <input type="text" value={data[`exG_${g.id}Vay`] || ''} onChange={e => handleExtraGVayChange(g.id, e)} />
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#2563eb', marginTop: 6, fontWeight: 600 }}>
                        ℹ️ {L(`हा जामिनदार फॉर्म पान ${FIXED_BEFORE + idx + 1} वर उपलब्ध आहे`, `Full form for this guarantor is on Step ${FIXED_BEFORE + idx + 1}`)}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button className="bl-add-guarantor-link" onClick={addGuarantor} style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 18 }}>+</span> {L('जामिनदार जोडा', 'Add Guarantor')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (s === 1) {
      return <PersonBlock key="borrower" prefix="b" data={data} setData={setData} title={L('कर्जदाराची माहिती', "Borrower's Information")} lang={lang} errors={stepErrors} />;
    }

    if (s === 2) {
      return <PersonBlock key="g1" prefix="g1" data={data} setData={setData} title={L('जामिनदार क्रमांक १ ची माहिती', 'Guarantor No. 1 Information')} lang={lang} errors={stepErrors} />;
    }

    if (s === 3) {
      return <PersonBlock key="g2" prefix="g2" data={data} setData={setData} title={L('जामिनदार क्रमांक २ ची माहिती', 'Guarantor No. 2 Information')} lang={lang} errors={stepErrors} />;
    }

    if (s >= FIXED_BEFORE && s < FIXED_BEFORE + extraGs.length) {
      const extraIdx = s - FIXED_BEFORE;
      const g = extraGs[extraIdx];
      const num = extraIdx + 3;
      const prefix = `exG_${g.id}`;
      const titleMr = `जामिनदार क्रमांक ${toMarathi(num)} ची माहिती`;
      const titleEn = `Guarantor No. ${num} Information`;
      return (
        <PersonBlock
          key={`extra-${g.id}`}
          prefix={prefix}
          data={data}
          setData={setData}
          title={L(titleMr, titleEn)}
          lang={lang}
          errors={stepErrors}
        />
      );
    }

    if (s === NEW_VEHICLE_STEP) {
      return <NewVehicleBlock key="newvehicle" data={data} setData={setData} lang={lang} />;
    }

    if (s === OLD_VEHICLE_STEP) {
      return <OldVehicleBlock key="oldvehicle" data={data} setData={setData} lang={lang} />;
    }

    if (s === BUSINESS_INFO_STEP) {
      return <BusinessInfoBlock key="bizinfo" data={data} setData={setData} lang={lang} />;
    }

    if (s === APPLICANT_PARTNER_STEP) {
      return <ApplicantPartnerInfoBlock key="partnerinfo" data={data} setData={setData} lang={lang} />;
    }

    // Review step
    if (s === REVIEW_STEP) {
      return (
        <div key="review" className="review-final-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>

          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
            Review all details before printing and submitting.
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
                transition: 'transform 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              {L('पूर्वदृश्य', 'Preview')}
            </button>

            {/* Final Submit Button */}
            <button
              className="bl-btn"
              onClick={handleSubmit}
              disabled={apiLoading}
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
                transition: 'transform 0.2s',
                opacity: apiLoading ? 0.7 : 1
              }}
              onMouseOver={e => !apiLoading && (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={e => !apiLoading && (e.currentTarget.style.transform = 'scale(1)')}
            >
              {apiLoading ? (
                <span>{L('सबमिट होत आहे...', 'Submitting...')}</span>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {L('अंतिम अर्ज सादर करा', 'Submit Final Application')}
                </>
              )}
            </button>
          </div>

          {apiError && (
            <div style={{ marginTop: '24px', padding: '12px 20px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#dc2626', fontSize: '13px', maxWidth: '400px' }}>
              ⚠️ {apiError}
            </div>
          )}
          {apiSuccess && (
            <div style={{ marginTop: '24px', padding: '12px 20px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', color: '#16a34a', fontSize: '13px', maxWidth: '400px' }}>
              ✓ {apiSuccess}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ── Preview Mode ──
  if (showPreview) {
    return (
      <div className="vehicle-loan-wrapper preview-mode">
        <div className="vl-preview-toolbar no-print" style={{ background: '#0e1a40', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 60 }}>
          <div className="vl-preview-title" style={{ color: 'white', fontWeight: 600 }}>{L('वाहन कर्ज - प्रिंट प्रीव्ह्यू', 'Vehicle Loan - Print Preview')}</div>
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
        <div className="vl-preview-content">
          <div className="vl-print-area-wrapper">
            <VehicleLoanPrint data={data} clientInfo={{}} lang={lang} />
          </div>
        </div>
      </div>
    );
  }

  // ── Form Mode ──
  return (
    <div className="vehicle-loan-wrapper no-print" ref={wrapperRef}>
      {/* Progress Bar */}
      <div className="bl-progress-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="bl-progress-pill">{step + 1} / {totalSteps}</div>
          <div className="bl-progress-label">
            {stepsList[step]}
            <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '8px' }}>(v2.2)</span>
          </div>
          {/* Force style injection for compactness */}
          <style>{`
            .vehicle-loan-wrapper .radio-group, 
            .vehicle-loan-wrapper .checkbox-group { gap: 8px !important; }
            .vehicle-loan-wrapper .radio-item, 
            .vehicle-loan-wrapper .cb-item { gap: 4px !important; }
            .vehicle-loan-wrapper .v-col > .field > label { padding-right: 6px !important; }
          `}</style>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="bl-lang-switcher">
            <button className={`bl-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => toggleLang('en')}>EN</button>
            <button className={`bl-lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => toggleLang('mr')}>मराठी</button>
          </div>
        </div>
      </div>

      <div className="form-container">
        <div className="form-card" ref={formCardRef}>
          <div className="form-body">
            {showStepErrors && Object.keys(stepErrors).length > 0 && (
              <div style={{ margin: '0 0 16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8 }}>
                <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 13, marginBottom: 6 }}>⚠ Please fix the following errors:</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {Object.values(stepErrors).map((msg, i) => (
                    <li key={i} style={{ color: '#dc2626', fontSize: 12, marginBottom: 2 }}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
            {getStepContent(step)}
          </div>
          <div className="nav-bar">
            <button className={`bl-btn bl-btn-secondary ${step === 0 ? 'bl-btn-disabled' : ''}`} onClick={prev} disabled={step === 0}>
              {L('मागे', 'Back')}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                {L('पान', 'Page')} {step + 1} / {totalSteps}
              </span>
            </div>
            {step < totalSteps - 1 ? (
              <button className="bl-btn bl-btn-primary" onClick={next}>{L('जतन करा व पुढे', 'Save & Next')}</button>
            ) : (
              <div style={{ width: 100 }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}