import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './HomeLoanForm.css';
import Step1 from './Steps/Step1';
import Step2 from './Steps/Step2';
import Step3 from './Steps/Step3';
import Step4 from './Steps/Step4';
import Step5 from './Steps/Step5';
import Step6 from './Steps/Step6';
import Step7 from './Steps/Step7';
import Step8 from './Steps/Step8';
import PersonBlock from './Steps/PersonBlock';
import HomeLoanPrint from './HomeLoanPrint';
import { T, tb } from './HomeLoanTranslations';
import API_BASE_URL from '../../config';
import { numberToWordsMr, numberToWordsEn } from './Steps/Step1';
import homeLoanService from '../../services/homeLoanService';

const initState = {
  // Step 1
  dinank: new Date().toISOString().split('T')[0], shakha: '', saCra: '', karjKhate: '',
  arjdarNaav: '', arjdarVay: '', saharjdarNaav: '', saharjdarVay: '',
  karjRakkam: '', akshari: '', paratfedKalavadhi: '', pahilaHapta: '', tarikh: '',
  karan: '', vaivahik: '', avalambuun: '',
  jameen1Naav: '', jameen1Vay: '', jameen2Naav: '', jameen2Vay: '', jameen3Naav: '', jameen3Vay: '',
  extraGuarantors: [],

  // Step 2 (Borrower)
  bPhoto: null,
  bNaav: '', bVay: '', bSabasadNo: '', bShares: '', bSharesRakkam: '',
  bVadilNaav: '', bVadilVay: '', bAaiNaav: '', bAaiVay: '',
  bPatta: '', bOfficeAddress: '', bGavchaAddress: '', bPinKod: '', bDurdhvani: '', bMobile: '', bEmail: '',
  bJageSwaarup: [], bKalavadhi_m: '', bKalavadhi_v: '',
  bVaivahik: '', bAvalambun: '',
  bCompany: '', bCompanyPatta: '', bCompanyPin: '', bCompanyTel: '', bCompanyMobile: '', bCompanyEmail: '',
  bVibhag: '', bHudda: '', bEmpCode: '', bKarj_m: '', bKarj_v: '', bSeva: '',
  bMonthlyVetan: '', bKapat: '', bNiwal: '',
  bVaarshik: '', bKharcha: '', bNiwalVaarshik: '', bKutumb: '', bKutumbType: 'मासिक',
  bShetiNaav: '', bShetiNaate: '',
  bGaavMukkam: '', bGaavPost: '', bGaavTaluka: '', bGaavJilha: '', bGaavRajya: '', bGaavPin: '', bGaavDurdhvani: '', bGaavMobile: '',
  bPurvKarjPrakar: '', bPurvKhate: '', bPurvRakkam: '', bPurvDin1: '', bPurvDin2: '',
  bJam94aKarjdarNaav: '', bJam94aPrakar: '', bJam94aKhate: '', bJam94aRakkam: '', bJam94aDin1: '', bJam94aDin2: '',
  bJam94bKarjdarNaav: '', bJam94bPrakar: '', bJam94bKhate: '', bJam94bRakkam: '', bJam94bDin1: '', bJam94bDin2: '',
  bKutumb95Naav: '', bKutumb95Prakar: '', bKutumb95Khate: '', bKutumb95Rakkam: '', bKutumb95Din1: '', bKutumb95Din2: '',
  bBank96Naav: '', bBank96Shakha: '', bBank96Prakar: '', bBank96Khate: '', bBank96Rakkam: '', bBank96Din1: '', bBank96Din2: '',

  // Step 3 (Guarantor 1)
  g1Photo: null, g1Naav: '', g1Vay: '', g1SabasadNo: '', g1Shares: '', g1SharesRakkam: '',
  g1VadilNaav: '', g1VadilVay: '', g1AaiNaav: '', g1AaiVay: '',
  g1Patta: '', g1PinKod: '', g1Durdhvani: '', g1Mobile: '', g1Email: '',
  g1JageSwaarup: [], g1Kalavadhi_m: '', g1Kalavadhi_v: '',
  g1Vaivahik: '', g1Avalambun: '',
  g1Company: '', g1CompanyPatta: '', g1Vibhag: '', g1Hudda: '', g1EmpCode: '',
  g1Karj_m: '', g1Karj_v: '', g1Seva: '',
  g1MonthlyVetan: '', g1Kapat: '', g1Niwal: '',
  g1Vaarshik: '', g1Kharcha: '', g1NiwalVaarshik: '', g1Kutumb: '', g1KutumbType: 'मासिक',
  g1ShetiNaav: '', g1ShetiNaate: '',
  g1GaavMukkam: '', g1GaavPost: '', g1GaavTaluka: '', g1GaavJilha: '', g1GaavRajya: '', g1GaavPin: '', g1GaavDurdhvani: '', g1GaavMobile: '',
  g1PurvKarjPrakar: '', g1PurvKhate: '', g1PurvRakkam: '', g1PurvDin1: '', g1PurvDin2: '',
  g1Jam94aKarjdarNaav: '', g1Jam94aPrakar: '', g1Jam94aKhate: '', g1Jam94aRakkam: '', g1Jam94aDin1: '', g1Jam94aDin2: '',
  g1Jam94bKarjdarNaav: '', g1Jam94bPrakar: '', g1Jam94bKhate: '', g1Jam94bRakkam: '', g1Jam94bDin1: '', g1Jam94bDin2: '',
  g1Kutumb95Naav: '', g1Kutumb95Prakar: '', g1Kutumb95Khate: '', g1Kutumb95Rakkam: '', g1Kutumb95Din1: '', g1Kutumb95Din2: '',
  g1Bank96Naav: '', g1Bank96Shakha: '', g1Bank96Prakar: '', g1Bank96Khate: '', g1Bank96Rakkam: '', g1Bank96Din1: '', g1Bank96Din2: '',

  // Step 4 (Guarantor 2)
  g2Photo: null, g2Naav: '', g2Vay: '', g2SabasadNo: '', g2Shares: '', g2SharesRakkam: '',
  g2VadilNaav: '', g2VadilVay: '', g2AaiNaav: '', g2AaiVay: '',
  g2Patta: '', g2PinKod: '', g2Mobile: '', g2Email: '',
  g2JageSwaarup: [], g2Kalavadhi_m: '', g2Kalavadhi_v: '',
  g2Vaivahik: '', g2Avalambun: '',
  g2Company: '', g2CompanyPatta: '', g2Vibhag: '', g2Hudda: '',
  g2Karj_m: '', g2Karj_v: '', g2Seva: '',
  g2MonthlyVetan: '', g2Kapat: '', g2Niwal: '',
  g2Vaarshik: '', g2Kharcha: '', g2NiwalVaarshik: '', g2Kutumb: '', g2KutumbType: 'मासिक',
  g2ShetiNaav: '', g2ShetiNaate: '',
  g2GaavMukkam: '', g2GaavPost: '', g2GaavTaluka: '', g2GaavJilha: '', g2GaavRajya: '', g2GaavPin: '', g2GaavDurdhvani: '', g2GaavMobile: '',
  g2PurvKarjPrakar: '', g2PurvKhate: '', g2PurvRakkam: '', g2PurvDin1: '', g2PurvDin2: '',
  g2Jam94aKarjdarNaav: '', g2Jam94aPrakar: '', g2Jam94aKhate: '', g2Jam94aRakkam: '', g2Jam94aDin1: '', g2Jam94aDin2: '',
  g2Jam94bKarjdarNaav: '', g2Jam94bPrakar: '', g2Jam94bKhate: '', g2Jam94bRakkam: '', g2Jam94bDin1: '', g2Jam94bDin2: '',
  g2Kutumb95Naav: '', g2Kutumb95Prakar: '', g2Kutumb95Khate: '', g2Kutumb95Rakkam: '', g2Kutumb95Din1: '', g2Kutumb95Din2: '',
  g2Bank96Naav: '', g2Bank96Shakha: '', g2Bank96Prakar: '', g2Bank96Khate: '', g2Bank96Rakkam: '', g2Bank96Din1: '', g2Bank96Din2: '',

  // Step 5 — Property
  propertyType: 'resale',
  vikretaNaav: '', vikretaVay: '', milkatPatta: '', housingNaav: '',
  flatNo: '', manzala: '', wing: '', plotNo: '', nagarSector: '',
  rastyaNaav: '', upnagar: '', jilha: '', pinKod: '',
  housingRegi: '', sabasadNo: '', sharesCert: '', bhaagFrom: '', bhaagTo: '',
  kshetrafal: '', kshetraType: [],
  purvesi: '', pashchimesi: '', dakshinesi: '', uttaresi: '',
  bandhamVarsh: '', surveNo: '', hissaNo: '', gatNo: '', municipalNo: '',
  ocMilale: '', ocDin: '', deedZale: '', deedDin: '',
  ekunKharedi: '', dilelRakkam: '', deneBaki: '', taranMahiti: '',
  shasaki: '', bazarBhav: '',
  firmNaav: '', tarnPatta: '',
  planManjur: '', bandhamSwaarup: '',
  constKshetrafal: '', constKshetraType: [],
  constPurvesi: '', constPashchimesi: '', constDakshinesi: '', constUttaresi: '',
  constPlotNo: '', constSurveNo: '', constGatNo: '', constHissaNo: '', constMunicipalNo: '',
  agreementDin: '', stampDuty: '', regRakkam: '', constEkunKharedi: '', constDilelRakkam: '', constDeneBaki: '',

  // Step 6 — Collateral + Business
  colHousingNaav: '', colFlatNo: '', colManzala: '', colWing: '',
  colPlotNo: '', colNagarSector: '', colRastyaNaav: '',
  colUpnagar: '', colJilha: '', colPinKod: '',
  colHousingRegi: '', colSabasadNo: '', colSharesCert: '',
  colBhaagFrom: '', colBhaagTo: '',
  colKshetrafal: '', colKshetraType: [],
  colPurvesi: '', colPashchimesi: '', colDakshinesi: '', colUttaresi: '',
  colBandhamVarsh: '', colSurveNo: '', colHissaNo: '', colGatNo: '', colMunicipalNo: '',
  colOcMilale: '', colOcDin: '', colDeedZale: '', colDeedDin: '',
  colTaranMahiti: '', colShasaki: '', colBazarBhav: '',
  busSwaarup: '', busType: [], busJageType: [], busKshetraType: [],
  busKshetrafal: '', busFirmNaav: '', busPatta: '', busPin: '', busTel: '', busEmail: '',
  busPan: '', busGumasta: '', busVikrikar: '', busVat: '', busServiceTax: '',
  busParwane: '', busNodani: '',
  busSuruKelay: '', busAnubhav: '',
  busEkunUtpanna: '', busKharcha: '', busNiwal: '',
  customer1Naav: '', customer1Patta: '', customer2Naav: '', customer2Patta: '',
  supplier1Naav: '', supplier1Patta: '', supplier2Naav: '', supplier2Patta: '',

  // Step 7 — Insurance + Tax
  vimaNaav: '', vimaPatta: '', vimaPolicy: '',
  vimaFrom: '', vimaTo: '', vimaRakkam: '', vimaHapta: '', vimaHaptaType: '',
  vimKarj: '', vimKarjBank: '', vimKarjPatta: '', vimKarjRakkam: '', vimKarjDin: '', vimShillak: '',
  panNo: '', taxSuru: '',
  taxRows: [{ varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' }, { varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' }, { varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' }],
  ptNo: '', ptSuru: '',
  ptRows: [{ varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' }, { varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' }, { varshaFrom: '', varshaTo: '', rakkam: '', dinank: '' }],

  // Fixed Assets (Step 6 fallback)
  fixedAsset1Naav: '', fixedAsset1Rakkam: '', fixedAsset1Bank: '', fixedAsset1Remark: '',
  fixedAsset2Naav: '', fixedAsset2Rakkam: '', fixedAsset2Bank: '', fixedAsset2Remark: '',
  fixedAsset3Naav: '', fixedAsset3Rakkam: '', fixedAsset3Bank: '', fixedAsset3Remark: '',

  // Current Loans (Step 6 fallback)
  loan1Bank: '', loan1Type: '', loan1Limit: '', loan1Balance: '', loan1Emi: '', loan1Security: '',
  loan2Bank: '', loan2Type: '', loan2Limit: '', loan2Balance: '', loan2Emi: '', loan2Security: '',
};

export default function HomeLoanForm() {
  const { clientInfo, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const effectiveId = paramId || location.state?.id;
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lang, setLang] = useState("mr"); // ← bilingual toggle
  const [showPreview, setShowPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const fetchedIdRef = useRef(null);

  // ── HELPER: MAP RELATIONAL DTO TO FLAT STATE ──────────────────────────
  const mapRelationalDtoToState = (fd) => {
    const s = {};
    const G = (obj, key, fallback = "") => {
      if (!obj) return fallback;
      const pascal = key.charAt(0).toUpperCase() + key.slice(1);
      const camel = key.charAt(0).toLowerCase() + key.slice(1);
      const val = obj[pascal] !== undefined ? obj[pascal] : obj[camel];
      return (val !== undefined && val !== null) ? String(val) : fallback;
    };
    const GA = (obj, key) => {
      if (!obj) return [];
      const pascal = key.charAt(0).toUpperCase() + key.slice(1);
      const camel = key.charAt(0).toLowerCase() + key.slice(1);
      const val = obj[pascal] !== undefined ? obj[pascal] : obj[camel];
      if (val && Array.isArray(val)) return val;
      if (val && typeof val === 'string') return val.split(',');
      return [];
    };

    const mapPerson = (obj, pfx) => {
      if (!obj) return;
      s[pfx + 'Photo'] = G(obj, 'Photo', null);
      s[pfx + 'Naav'] = G(obj, 'FullName');
      s[pfx + 'Vay'] = G(obj, 'Age');
      s[pfx + 'SabasadNo'] = G(obj, 'MemberNo');
      s[pfx + 'Shares'] = G(obj, 'SharesCount');
      s[pfx + 'SharesRakkam'] = G(obj, 'SharesAmount');
      s[pfx + 'VadilNaav'] = G(obj, 'FatherName');
      s[pfx + 'VadilVay'] = G(obj, 'FatherAge');
      s[pfx + 'AaiNaav'] = G(obj, 'MotherName');
      s[pfx + 'AaiVay'] = G(obj, 'MotherAge');
      s[pfx + 'Patta'] = G(obj, 'Address');
      if (pfx === 'b') {
        s[pfx + 'OfficeAddress'] = G(obj, 'OfficeAddress');
        s[pfx + 'GavchaAddress'] = G(obj, 'GavchaAddress');
      }
      s[pfx + 'PinKod'] = G(obj, 'PinCode');
      s[pfx + 'Durdhvani'] = G(obj, 'Phone');
      s[pfx + 'Mobile'] = G(obj, 'Mobile');
      s[pfx + 'Email'] = G(obj, 'Email');
      s[pfx + 'JageSwaarup'] = GA(obj, 'ResidenceType');
      s[pfx + 'Kalavadhi_m'] = G(obj, 'StayMonths');
      s[pfx + 'Kalavadhi_v'] = G(obj, 'StayYears');
      s[pfx + 'Vaivahik'] = G(obj, 'MaritalStatus');
      s[pfx + 'Avalambun'] = G(obj, 'Dependents');
      s[pfx + 'Company'] = G(obj, 'Company');
      s[pfx + 'CompanyPatta'] = G(obj, 'CompanyAddress');
      s[pfx + 'CompanyPin'] = G(obj, 'CompanyPin');
      s[pfx + 'CompanyTel'] = G(obj, 'CompanyTel');
      s[pfx + 'CompanyMobile'] = G(obj, 'CompanyMobile');
      s[pfx + 'CompanyEmail'] = G(obj, 'CompanyEmail');
      s[pfx + 'Vibhag'] = G(obj, 'Department');
      s[pfx + 'Hudda'] = G(obj, 'Designation');
      s[pfx + 'EmpCode'] = G(obj, 'EmployeeCode');
      s[pfx + 'Karj_m'] = G(obj, 'JobMonths');
      s[pfx + 'Karj_v'] = G(obj, 'JobYears');
      s[pfx + 'Seva'] = G(obj, 'RetirementDate');
      s[pfx + 'MonthlyVetan'] = G(obj, 'MonthlySalary');
      s[pfx + 'Kapat'] = G(obj, 'Deductions');
      s[pfx + 'Niwal'] = G(obj, 'NetSalary');
      s[pfx + 'Vaarshik'] = G(obj, 'AnnualIncome');
      s[pfx + 'Kharcha'] = G(obj, 'AnnualExpenses');
      s[pfx + 'NiwalVaarshik'] = G(obj, 'NetAnnualIncome');
      s[pfx + 'Kutumb'] = G(obj, 'FamilyIncome');
      s[pfx + 'KutumbType'] = G(obj, 'FamilyIncomeType', 'मासिक');
      s[pfx + 'ShetiNaav'] = G(obj, 'LandOwnerName');
      s[pfx + 'ShetiNaate'] = G(obj, 'LandOwnerRelation');
      s[pfx + 'GaavMukkam'] = G(obj, 'Village');
      s[pfx + 'GaavPost'] = G(obj, 'Post');
      s[pfx + 'GaavTaluka'] = G(obj, 'Taluka');
      s[pfx + 'GaavJilha'] = G(obj, 'District');
      s[pfx + 'GaavRajya'] = G(obj, 'State');
      s[pfx + 'GaavPin'] = G(obj, 'VillagePin');
      s[pfx + 'GaavMobile'] = G(obj, 'VillageMobile');
      s[pfx + 'GaavDurdhvani'] = G(obj, 'VillageDurdhvani');

      // Purv Karj & Jamindar data
      s[pfx + 'PurvKarjPrakar'] = G(obj, 'PurvKarjPrakar');
      s[pfx + 'PurvKhate'] = G(obj, 'PurvKhate');
      s[pfx + 'PurvRakkam'] = G(obj, 'PurvRakkam');
      s[pfx + 'PurvDin1'] = G(obj, 'PurvDin1');
      s[pfx + 'PurvDin2'] = G(obj, 'PurvDin2');
      s[pfx + 'Jam94aKarjdarNaav'] = G(obj, 'Jam94aKarjdarNaav');
      s[pfx + 'Jam94aPrakar'] = G(obj, 'Jam94aPrakar');
      s[pfx + 'Jam94aKhate'] = G(obj, 'Jam94aKhate');
      s[pfx + 'Jam94aRakkam'] = G(obj, 'Jam94aRakkam');
      s[pfx + 'Jam94aDin1'] = G(obj, 'Jam94aDin1');
      s[pfx + 'Jam94aDin2'] = G(obj, 'Jam94aDin2');
      s[pfx + 'Jam94bKarjdarNaav'] = G(obj, 'Jam94bKarjdarNaav');
      s[pfx + 'Jam94bPrakar'] = G(obj, 'Jam94bPrakar');
      s[pfx + 'Jam94bKhate'] = G(obj, 'Jam94bKhate');
      s[pfx + 'Jam94bRakkam'] = G(obj, 'Jam94bRakkam');
      s[pfx + 'Jam94bDin1'] = G(obj, 'Jam94bDin1');
      s[pfx + 'Jam94bDin2'] = G(obj, 'Jam94bDin2');
      s[pfx + 'Kutumb95Naav'] = G(obj, 'Kutumb95Naav');
      s[pfx + 'Kutumb95Prakar'] = G(obj, 'Kutumb95Prakar');
      s[pfx + 'Kutumb95Khate'] = G(obj, 'Kutumb95Khate');
      s[pfx + 'Kutumb95Rakkam'] = G(obj, 'Kutumb95Rakkam');
      s[pfx + 'Kutumb95Din1'] = G(obj, 'Kutumb95Din1');
      s[pfx + 'Kutumb95Din2'] = G(obj, 'Kutumb95Din2');
      s[pfx + 'Bank96Naav'] = G(obj, 'Bank96Naav');
      s[pfx + 'Bank96Shakha'] = G(obj, 'Bank96Shakha');
      s[pfx + 'Bank96Prakar'] = G(obj, 'Bank96Prakar');
      s[pfx + 'Bank96Khate'] = G(obj, 'Bank96Khate');
      s[pfx + 'Bank96Rakkam'] = G(obj, 'Bank96Rakkam');
      s[pfx + 'Bank96Din1'] = G(obj, 'Bank96Din1');
      s[pfx + 'Bank96Din2'] = G(obj, 'Bank96Din2');
    };

    // 1. Root fields (Application)
    s.dinank = G(fd, 'ApplicationDate');
    s.shakha = G(fd, 'Branch');
    s.saCra = G(fd, 'MemberNo');
    s.karjKhate = G(fd, 'LoanAccountNo');
    s.arjdarNaav = G(fd, 'ApplicantName');
    s.arjdarVay = G(fd, 'ApplicantAge');
    s.saharjdarNaav = G(fd, 'CoApplicantName');
    s.saharjdarVay = G(fd, 'CoApplicantAge');
    s.karjRakkam = G(fd, 'LoanAmountNum');
    s.akshari = G(fd, 'LoanAmountWords');
    s.paratfedKalavadhi = G(fd, 'RepaymentMonths');
    s.pahilaHapta = G(fd, 'FirstInstalment');
    s.tarikh = G(fd, 'InstalmentDate');
    s.karan = G(fd, 'LoanPurpose');
    s.vaivahik = G(fd, 'MaritalStatus');
    s.avalambuun = G(fd, 'DependentCount');
    s.jameen1Naav = G(fd, 'Guarantor1Name');
    s.jameen1Vay = G(fd, 'Guarantor1Age');
    s.jameen2Naav = G(fd, 'Guarantor2Name');
    s.jameen2Vay = G(fd, 'Guarantor2Age');
    s.jameen3Naav = G(fd, 'Guarantor3Name');
    s.jameen3Vay = G(fd, 'Guarantor3Age');

    // 2. Borrower Details
    mapPerson(fd.Borrower, 'b');

    // 3. Property Details
    const p = fd.Property || {};
    s.propertyType = G(p, 'PropertyType', 'resale');
    s.vikretaNaav = G(p, 'VendorName');
    s.milkatPatta = G(p, 'PropertyAddress');
    s.housingNaav = G(p, 'HousingSocietyName');
    s.flatNo = G(p, 'FlatNo');
    s.manzala = G(p, 'Floor');
    s.wing = G(p, 'Wing');
    s.plotNo = G(p, 'PlotNo');
    s.nagarSector = G(p, 'NagarSector');
    s.rastyaNaav = G(p, 'RoadName');
    s.upnagar = G(p, 'Suburb');
    s.jilha = G(p, 'District');
    s.pinKod = G(p, 'PinCode');
    s.housingRegi = G(p, 'HousingRegNo');
    s.sabasadNo = G(p, 'HousingMemberNo');
    s.sharesCert = G(p, 'ShareCertNo');
    s.bhaagFrom = G(p, 'SharesFrom');
    s.bhaagTo = G(p, 'SharesTo');
    s.kshetrafal = G(p, 'Area');
    s.kshetraType = GA(p, 'AreaType');
    s.purvesi = G(p, 'BoundaryEast');
    s.pashchimesi = G(p, 'BoundaryWest');
    s.dakshinesi = G(p, 'BoundarySouth');
    s.uttaresi = G(p, 'BoundaryNorth');
    s.bandhamVarsh = G(p, 'BuildingYear');
    s.surveNo = G(p, 'SurveyNo');
    s.hissaNo = G(p, 'HissaNo');
    s.gatNo = G(p, 'GatNo');
    s.municipalNo = G(p, 'MunicipalNo');
    s.ocMilale = G(p, 'OcReceived');
    s.ocDin = G(p, 'OcDate');
    s.deedZale = G(p, 'ConveyanceDeed');
    s.deedDin = G(p, 'ConveyanceDeedDate');
    s.ekunKharedi = G(p, 'TotalPurchasePrice');
    s.dilelRakkam = G(p, 'AmountPaid');
    s.deneBaki = G(p, 'BalancePayable');
    s.taranMahiti = G(p, 'MortgageDetails');
    s.shasaki = G(p, 'GovtValuation');
    s.bazarBhav = G(p, 'MarketValuation');
    s.firmNaav = G(p, 'BuilderFirmName');
    s.tarnPatta = G(p, 'UnderConstrAddress');
    s.planManjur = G(p, 'BuildingPlanApproved');
    s.bandhamSwaarup = G(p, 'ConstructionNature');
    s.constKshetrafal = G(p, 'ConstArea');
    s.constKshetraType = GA(p, 'ConstAreaType');
    s.constPurvesi = G(p, 'ConstBoundaryEast');
    s.constPashchimesi = G(p, 'ConstBoundaryWest');
    s.constDakshinesi = G(p, 'ConstBoundarySouth');
    s.constUttaresi = G(p, 'ConstBoundaryNorth');
    s.constPlotNo = G(p, 'ConstPlotNo');
    s.constSurveyNo = G(p, 'ConstSurveyNo');
    s.constGatNo = G(p, 'ConstGatNo');
    s.constHissaNo = G(p, 'ConstHissaNo');
    s.constMunicipalNo = G(p, 'ConstMunicipalNo');
    s.agreementDin = G(p, 'AgreementDate');
    s.stampDuty = G(p, 'StampDuty');
    s.regRakkam = G(p, 'RegistrationAmount');
    s.constEkunKharedi = G(p, 'ConstTotalPrice');
    s.constDilelRakkam = G(p, 'ConstAmountPaid');
    s.constDeneBaki = G(p, 'ConstBalancePayable');

    // Collateral
    s.colHousingNaav = G(p, 'CollateralHousingNaav');
    s.colFlatNo = G(p, 'CollateralFlatNo');
    s.colManzala = G(p, 'CollateralFloor');
    s.colWing = G(p, 'CollateralWing');
    s.colPlotNo = G(p, 'CollateralPlotNo');
    s.colNagarSector = G(p, 'CollateralNagarSector');
    s.colRastyaNaav = G(p, 'CollateralRoadName');
    s.colUpnagar = G(p, 'CollateralSuburb');
    s.colJilha = G(p, 'CollateralDistrict');
    s.colPinKod = G(p, 'CollateralPinCode');
    s.colHousingRegi = G(p, 'CollateralHousingRegNo');
    s.colSabasadNo = G(p, 'CollateralHousingMemberNo');
    s.colSharesCert = G(p, 'CollateralShareCertNo');
    s.colBhaagFrom = G(p, 'CollateralSharesFrom');
    s.colBhaagTo = G(p, 'CollateralSharesTo');
    s.colKshetrafal = G(p, 'CollateralArea');
    s.colKshetraType = GA(p, 'CollateralAreaType');
    s.colPurvesi = G(p, 'CollateralBoundaryEast');
    s.colPashchimesi = G(p, 'CollateralBoundaryWest');
    s.colDakshinesi = G(p, 'CollateralBoundarySouth');
    s.colUttaresi = G(p, 'CollateralBoundaryNorth');
    s.colBandhamVarsh = G(p, 'CollateralBuildingYear');
    s.colSurveNo = G(p, 'CollateralSurveyNo');
    s.colHissaNo = G(p, 'CollateralHissaNo');
    s.colGatNo = G(p, 'CollateralGatNo');
    s.colMunicipalNo = G(p, 'CollateralMunicipalNo');
    s.colOcMilale = G(p, 'CollateralOcReceived');
    s.colOcDin = G(p, 'CollateralOcDate');
    s.colDeedZale = G(p, 'CollateralConveyanceDeed');
    s.colDeedDin = G(p, 'CollateralConveyanceDeedDate');
    s.colShasaki = G(p, 'CollateralGovtValuation');
    s.colBazarBhav = G(p, 'CollateralMarketValuation');
    s.colTaranMahiti = G(p, 'CollateralRemarks');

    // 4. Business Details
    const bus = fd.Business || {};
    s.busSwaarup = G(bus, 'BusinessNature');
    s.busType = GA(bus, 'BusinessType');
    s.busJageType = GA(bus, 'BusinessPremisesType');
    s.busKshetrafal = G(bus, 'BusinessArea');
    s.busKshetraType = GA(bus, 'AreaType');
    s.busFirmNaav = G(bus, 'BusinessFirmName');
    s.busPatta = G(bus, 'BusinessAddress');
    s.busPin = G(bus, 'BusinessPin');
    s.busTel = G(bus, 'BusinessPhone');
    s.busEmail = G(bus, 'BusinessEmail');
    s.busPan = G(bus, 'BusinessPan');
    s.busGumasta = G(bus, 'GumastaNo');
    s.busVikrikar = G(bus, 'SalesTaxNo');
    s.busVat = G(bus, 'VatNo');
    s.busServiceTax = G(bus, 'ServiceTaxNo');
    s.busParwane = G(bus, 'LicenseObtained');
    s.busNodani = G(bus, 'TaxRegistered');
    s.busSuruKelay = G(bus, 'BusinessStartDate');
    s.busAnubhav = G(bus, 'BusinessExperience');
    s.busEkunUtpanna = G(bus, 'BusinessAnnualIncome');
    s.busKharcha = G(bus, 'BusinessAnnualExpenses');
    s.busNiwal = G(bus, 'BusinessNetIncome');

    // 5. Insurance Details
    const ins = fd.Insurance || {};
    s.vimaNaav = G(ins, 'InsuranceCompany');
    s.vimaPatta = G(ins, 'InsuranceAddress');
    s.vimaPolicy = G(ins, 'InsurancePolicyNo');
    s.vimaFrom = G(ins, 'InsuranceFrom');
    s.vimaTo = G(ins, 'InsuranceTo');
    s.vimaRakkam = G(ins, 'InsuranceAmount');
    s.vimaHapta = G(ins, 'InsurancePremium');
    s.vimaHaptaType = G(ins, 'InsurancePremiumType');
    s.vimKarj = G(ins, 'PolicyLoan');
    s.vimKarjBank = G(ins, 'PolicyLoanBank');
    s.vimKarjPatta = G(ins, 'PolicyLoanAddress');
    s.vimKarjRakkam = G(ins, 'PolicyLoanAmount');
    s.vimKarjDin = G(ins, 'PolicyLoanDate');
    s.vimShillak = G(ins, 'PolicyLoanBalance');
    s.panNo = G(ins, 'PanNo');
    s.taxSuru = G(ins, 'IncomeTaxSince');
    s.ptNo = G(ins, 'ProfTaxNo');
    s.ptSuru = G(ins, 'ProfTaxSince');
    s.insuranceDetails = G(ins, 'InsuranceDetails');
    s.otherDetails = G(ins, 'OtherDetails');

    // Json arrays (Tax, Loans, Assets)
    try {
      s.taxRows = JSON.parse(G(ins, 'TaxRowsJson', '[]'));
      s.ptRows = JSON.parse(G(ins, 'ProfTaxRowsJson', '[]'));
    } catch(e) { s.taxRows = []; s.ptRows = []; }

    // Dynamic Extra Guarantors
    const gList = fd.Guarantors || [];
    if (gList.length > 2) {
      s.extraGuarantors = gList.slice(2).map((g, idx) => ({
        id: Date.now() + idx,
        Naav: G(g, 'FullName'),
        Vay: G(g, 'Age'),
        Photo: G(g, 'Photo', null),
        SabasadNo: G(g, 'MemberNo'),
        Shares: G(g, 'SharesCount'),
        SharesRakkam: G(g, 'SharesAmount'),
        VadilNaav: G(g, 'FatherName'),
        VadilVay: G(g, 'FatherAge'),
        AaiNaav: G(g, 'MotherName'),
        AaiVay: G(g, 'MotherAge'),
        Patta: G(g, 'Address'),
        PinKod: G(g, 'PinCode'),
        Durdhvani: G(g, 'Phone'),
        Mobile: G(g, 'Mobile'),
        Email: G(g, 'Email'),
        Company: G(g, 'Company'),
        CompanyPatta: G(g, 'CompanyAddress'),
        Vibhag: G(g, 'Department'),
        Hudda: G(g, 'Designation'),
        EmpCode: G(g, 'EmployeeCode'),
        Karj_m: G(g, 'JobMonths'),
        Karj_v: G(g, 'JobYears'),
        Seva: G(g, 'RetirementDate'),
        MonthlyVetan: G(g, 'MonthlySalary'),
        Niwal: G(g, 'NetSalary'),
        Vaarshik: G(g, 'AnnualIncome'),
        JageSwaarup: GA(g, 'ResidenceType'),
        Kalavadhi_m: G(g, 'StayMonths'),
        Kalavadhi_v: G(g, 'StayYears'),
        Vaivahik: G(g, 'MaritalStatus'),
        Avalambun: G(g, 'Dependents'),
        ShetiNaav: G(g, 'LandOwnerName'),
        ShetiNaate: G(g, 'LandOwnerRelation'),
        GaavMukkam: G(g, 'Village'),
        GaavPost: G(g, 'Post'),
        GaavTaluka: G(g, 'Taluka'),
        GaavJilha: G(g, 'District'),
        GaavRajya: G(g, 'State'),
        GaavPin: G(g, 'VillagePin'),
        GaavDurdhvani: G(g, 'VillageDurdhvani'),
        GaavMobile: G(g, 'VillageMobile'),
        PurvKarjPrakar: G(g, 'PurvKarjPrakar'),
        PurvKhate: G(g, 'PurvKhate'),
        PurvRakkam: G(g, 'PurvRakkam'),
        PurvDin1: G(g, 'PurvDin1'),
        PurvDin2: G(g, 'PurvDin2'),
        Jam94aKarjdarNaav: G(g, 'Jam94aKarjdarNaav'),
        Jam94aPrakar: G(g, 'Jam94aPrakar'),
        Jam94aKhate: G(g, 'Jam94aKhate'),
        Jam94aRakkam: G(g, 'Jam94aRakkam'),
        Jam94aDin1: G(g, 'Jam94aDin1'),
        Jam94aDin2: G(g, 'Jam94aDin2'),
        Jam94bKarjdarNaav: G(g, 'Jam94bKarjdarNaav'),
        Jam94bPrakar: G(g, 'Jam94bPrakar'),
        Jam94bKhate: G(g, 'Jam94bKhate'),
        Jam94bRakkam: G(g, 'Jam94bRakkam'),
        Jam94bDin1: G(g, 'Jam94bDin1'),
        Jam94bDin2: G(g, 'Jam94bDin2'),
        Kutumb95Naav: G(g, 'Kutumb95Naav'),
        Kutumb95Prakar: G(g, 'Kutumb95Prakar'),
        Kutumb95Khate: G(g, 'Kutumb95Khate'),
        Kutumb95Rakkam: G(g, 'Kutumb95Rakkam'),
        Kutumb95Din1: G(g, 'Kutumb95Din1'),
        Kutumb95Din2: G(g, 'Kutumb95Din2'),
        Bank96Naav: G(g, 'Bank96Naav'),
        Bank96Shakha: G(g, 'Bank96Shakha'),
        Bank96Prakar: G(g, 'Bank96Prakar'),
        Bank96Khate: G(g, 'Bank96Khate'),
        Bank96Rakkam: G(g, 'Bank96Rakkam'),
        Bank96Din1: G(g, 'Bank96Din1'),
        Bank96Din2: G(g, 'Bank96Din2'),
      }));
    } else {
      s.extraGuarantors = [];
    }

    // Static Guarantor 1 & 2 sync back
    if (gList[0]) mapPerson(gList[0], 'g1');
    if (gList[1]) mapPerson(gList[1], 'g2');

    return s;
  };

  // ── FETCH INITIAL DATA FOR EDIT MODE ──────────────────────────────────
  useEffect(() => {
    if (effectiveId && fetchedIdRef.current !== String(effectiveId)) {
      const fetchDetail = async () => {
        try {
          console.log(`[HomeLoanForm] Fetching detail for ID: ${effectiveId}`);
          const detail = await homeLoanService.getLoan(effectiveId);
          console.log("[HomeLoanForm] API Response Received:", detail);

          if (detail) {
            // Priority 1: Use RawStateSnapshot if available (future saves)
            // Priority 2: Map from relational formData (existing records)
            // Priority 3: Map from top-level fields (legacy/corrupt)
            
            const fd = detail.formData || detail.FormData || {};
            let rawSource = {};

            if (fd.RawStateSnapshot) {
               console.log("[HomeLoanForm] Using RawStateSnapshot");
               rawSource = fd.RawStateSnapshot;
            } else if (Object.keys(fd).length > 0) {
               console.log("[HomeLoanForm] Using Relational Mapper");
               rawSource = mapRelationalDtoToState(fd);
            } else {
               console.log("[HomeLoanForm] Using Flat Field Mapper");
               rawSource = {
                  dinank: detail.applicationDate || detail.ApplicationDate,
                  shakha: detail.branch || detail.Branch,
                  karjKhate: detail.loanAccountNo || detail.LoanAccountNo,
                  arjdarNaav: detail.applicantName || detail.ApplicantName,
                  arjdarVay: detail.applicantAge || detail.ApplicantAge,
                  karjRakkam: detail.loanAmountNum || detail.LoanAmountNum,
               };
            }

            // Ensure ID is in data for the PUT request
            rawSource.applicationId = detail.id || detail.Id || effectiveId;

            // Merge with initState to ensure all keys exist
            const mergedData = { ...initState, ...rawSource };
            
            // Normalize data: convert nulls to empty strings for flat fields
            const normalizedData = {};
            Object.keys(mergedData).forEach(key => {
              const val = mergedData[key];
              if (val === null || val === "null") {
                normalizedData[key] = '';
              } else {
                normalizedData[key] = val;
              }
            });

            // Special handling for rows
            if (!normalizedData.taxRows || !Array.isArray(normalizedData.taxRows)) normalizedData.taxRows = initState.taxRows;
            if (!normalizedData.ptRows || !Array.isArray(normalizedData.ptRows)) normalizedData.ptRows = initState.ptRows;
            if (!normalizedData.extraGuarantors) normalizedData.extraGuarantors = [];

            console.log("[HomeLoanForm] Final Normalized Data:", normalizedData);
            setData(normalizedData);
            setIsEditMode(true);
            showToast('Application details loaded', 'success');
            fetchedIdRef.current = String(effectiveId);
          }
        } catch (err) {
          console.error("[HomeLoanForm] Error fetching detail:", err);
          showToast('Failed to load application details', 'error');
        }
      };
      fetchDetail();
    } else if (!effectiveId) {
      setData(initState);
      setIsEditMode(false);
      fetchedIdRef.current = null;
    }
  }, [effectiveId, showToast]);
  
  // Dynamic Steps Calculation
  const getDynamicSteps = () => {
    const base = T.steps[lang];
    const extraCount = (data.extraGuarantors || []).length;
    
    // Original: Application(0), Borrower(1), G1(2), G2(3), Property(4), Collateral(5), Insurance(6), Preview(7)
    const before = base.slice(0, 4); 
    const after = base.slice(4);
    
    const extra = (data.extraGuarantors || []).map((g, idx) => ({
      id: `dynamic_g_${g.id}`,
      label: lang === 'en' ? `Guarantor ${idx + 3}` : `जामीनदार ${idx + 3}`,
      sub: lang === 'en' ? `Guarantor No. ${idx + 3} Details` : `जामीनदार क्र. ${idx + 3} माहिती`
    }));
    
    return [...before, ...extra, ...after];
  };

  const STEPS = getDynamicSteps();
  const totalSteps = STEPS.length;
  
  // Guard refs to prevent double toasts on mount
  const draftLoadedRef = React.useRef(false);
  const aadharAppliedRef = React.useRef(false);

  const validate = () => {
    // All validation removed as per user request. 
    // Clear any existing errors to ensure tooltips disappear.
    setErrors({});
    return true;
  };

  const scrollToTop = () => { window.scrollTo(0, 0); const w = document.querySelector('.master-content-wrapper'); if (w) w.scrollTop = 0; };
  const next = () => { if (validate()) { setStep(s => Math.min(s + 1, totalSteps - 1)); scrollToTop(); } };
  const prev = () => { setStep(s => Math.max(s - 1, 0)); scrollToTop(); };

  // Persistence Layer
  const draftKey = location.state?.aadharData?.id 
    ? `hl_form_draft_${location.state.aadharData.id}` 
    : 'hl_form_draft_general';

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.dinank) parsed.dinank = new Date().toISOString().split('T')[0];
        setData(p => ({ ...p, ...parsed }));
        if (!draftLoadedRef.current) {
          showToast(tb('draftLoaded', lang), 'success');
          draftLoadedRef.current = true;
        }
      }
    } catch (e) { console.error("Error loading draft", e); }
  }, [draftKey, lang, showToast]);

  React.useEffect(() => {
    if (data !== initState) {
      localStorage.setItem(draftKey, JSON.stringify(data));
    }
  }, [data, draftKey]);

  React.useEffect(() => {
    if (data.karjRakkam) {
      const words = lang === 'mr' ? numberToWordsMr(data.karjRakkam) : numberToWordsEn(data.karjRakkam);
      if (data.akshari !== words) {
        setData(p => ({ ...p, akshari: words }));
      }
    }
  }, [lang, data.karjRakkam]);
  
  // ── AUTO-FILL FROM STEP 1 TO DETAILED SECTIONS ──────────────────────────
  // When basic name/age are entered in Step 1, sync to Step 2-4 automatically.
  React.useEffect(() => {
    setData(prev => {
      const updates = {};
      
      // Borrower sync
      if (prev.arjdarNaav !== prev.bNaav) updates.bNaav = prev.arjdarNaav;
      if (prev.arjdarVay !== prev.bVay) updates.bVay = prev.arjdarVay;
      
      // Guarantor 1 sync
      if (prev.jameen1Naav !== prev.g1Naav) updates.g1Naav = prev.jameen1Naav;
      if (prev.jameen1Vay !== prev.g1Vay) updates.g1Vay = prev.jameen1Vay;
      
      // Guarantor 2 sync
      if (prev.jameen2Naav !== prev.g2Naav) updates.g2Naav = prev.jameen2Naav;
      if (prev.jameen2Vay !== prev.g2Vay) updates.g2Vay = prev.jameen2Vay;
      
      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [
    data.arjdarNaav, data.arjdarVay, 
    data.jameen1Naav, data.jameen1Vay, 
    data.jameen2Naav, data.jameen2Vay
  ]);

  const handleManualSave = () => {
    localStorage.setItem(draftKey, JSON.stringify(data));
    showToast(tb('saved', lang), 'success');
  };

  const handlePrint = (doPrint = true) => {
    if (!doPrint) {
      setShowPreview(true);
      return;
    }
    window.print();
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

    setData(prev => ({
      ...prev,
      // Step 1
      arjdarNaav: name || prev.arjdarNaav,
      arjdarVay: age || prev.arjdarVay,
      
      // Step 2 (Borrower)
      bNaav: name || prev.bNaav,
      bVay: age || prev.bVay,
      bPatta: formattedAddress || prev.bPatta,
      bPhoto: photo || prev.bPhoto,
      bAadhar: aadharNo || prev.bAadhar,
      bDob: dob || prev.bDob,
      bMobile: (phone && phone !== 'Linked' && phone !== 'Not Linked') ? phone : prev.bMobile,
      // Try to extract PinCode from address if possible
      bPinKod: formattedAddress.match(/\d{6}/)?.[0] || prev.bPinKod
    }));

    if (!aadharAppliedRef.current) {
      showToast('Details autofilled from Aadhaar', 'success');
      aadharAppliedRef.current = true;
    }
  };

  // Effect to catch incoming Aadhaar data from navigation state
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('tushgpt_jwt');
      if (!token) {
        showToast('Session expired. Please login again.', 'error');
        return;
      }

      // Helper to ensure values are sent as strings (backend expects string/longtext)
      const S = (v) => (v === undefined || v === null) ? "" : String(v);

      // ── MAPPING FLAT STATE TO RELATIONAL STRUCTURE ──
      const guarantorsPayload = [];
      if (data.g1Naav) {
        guarantorsPayload.push({
          GuarantorNumber: 1, FullName: S(data.g1Naav), Age: S(data.g1Vay), Photo: S(data.g1Photo), MemberNo: S(data.g1SabasadNo), SharesCount: S(data.g1Shares), SharesAmount: S(data.g1SharesRakkam),
          FatherName: S(data.g1VadilNaav), FatherAge: S(data.g1VadilVay), MotherName: S(data.g1AaiNaav), MotherAge: S(data.g1AaiVay),
          Address: S(data.g1Patta), PinCode: S(data.g1PinKod), Phone: S(data.g1Durdhvani), Mobile: S(data.g1Mobile), Email: S(data.g1Email),
          Company: S(data.g1Company), CompanyAddress: S(data.g1CompanyPatta), Department: S(data.g1Vibhag), Designation: S(data.g1Hudda), EmployeeCode: S(data.g1EmpCode),
          JobMonths: S(data.g1Karj_m), JobYears: S(data.g1Karj_v), RetirementDate: S(data.g1Seva),
          MonthlySalary: S(data.g1MonthlyVetan), NetSalary: S(data.g1Niwal), AnnualIncome: S(data.g1Vaarshik),
          ResidenceType: (data.g1JageSwaarup || []).join(','), StayMonths: S(data.g1Kalavadhi_m), StayYears: S(data.g1Kalavadhi_v),
          MaritalStatus: S(data.g1Vaivahik), Dependents: S(data.g1Avalambun),
          LandOwnerName: S(data.g1ShetiNaav), LandOwnerRelation: S(data.g1ShetiNaate),
          Village: S(data.g1GaavMukkam), Post: S(data.g1GaavPost), Taluka: S(data.g1GaavTaluka), District: S(data.g1GaavJilha), State: S(data.g1GaavRajya), VillagePin: S(data.g1GaavPin), VillageDurdhvani: S(data.g1GaavDurdhvani), VillageMobile: S(data.g1GaavMobile),
          PrevLoansJson: JSON.stringify([{ type: data.g1PurvKarjPrakar, account: data.g1PurvKhate, amount: data.g1PurvRakkam, d1: data.g1PurvDin1, d2: data.g1PurvDin2 }]),
          GuarantorLoansJson: JSON.stringify([
            { n: data.g1Jam94aKarjdarNaav, t: data.g1Jam94aPrakar, a: data.g1Jam94aKhate, r: data.g1Jam94aRakkam, d1: data.g1Jam94aDin1, d2: data.g1Jam94aDin2 },
            { n: data.g1Jam94bKarjdarNaav, t: data.g1Jam94bPrakar, a: data.g1Jam94bKhate, r: data.g1Jam94bRakkam, d1: data.g1Jam94bDin1, d2: data.g1Jam94bDin2 }
          ]),
          OtherBankLoansJson: JSON.stringify([{ n: data.g1Bank96Naav, s: data.g1Bank96Shakha, t: data.g1Bank96Prakar, a: data.g1Bank96Khate, r: data.g1Bank96Rakkam, d1: data.g1Bank96Din1, d2: data.g1Bank96Din2 }]),
          Kutumb95InfoJson: JSON.stringify([{ n: data.g1Kutumb95Naav, t: data.g1Kutumb95Prakar, a: data.g1Kutumb95Khate, r: data.g1Kutumb95Rakkam, d1: data.g1Kutumb95Din1, d2: data.g1Kutumb95Din2 }])
        });
      }
      if (data.g2Naav) {
        guarantorsPayload.push({
          GuarantorNumber: 2, FullName: S(data.g2Naav), Age: S(data.g2Vay), Photo: S(data.g2Photo), MemberNo: S(data.g2SabasadNo), SharesCount: S(data.g2Shares), SharesAmount: S(data.g2SharesRakkam),
          FatherName: S(data.g2VadilNaav), FatherAge: S(data.g2VadilVay), MotherName: S(data.g2AaiNaav), MotherAge: S(data.g2AaiVay),
          Address: S(data.g2Patta), PinCode: S(data.g2PinKod), Mobile: S(data.g2Mobile), Email: S(data.g2Email),
          Company: S(data.g2Company), CompanyAddress: S(data.g2CompanyPatta), Department: S(data.g2Vibhag), Designation: S(data.g2Hudda),
          JobMonths: S(data.g2Karj_m), JobYears: S(data.g2Karj_v), RetirementDate: S(data.g2Seva),
          MonthlySalary: S(data.g2MonthlyVetan), NetSalary: S(data.g2Niwal), AnnualIncome: S(data.g2Vaarshik),
          ResidenceType: (data.g2JageSwaarup || []).join(','), StayMonths: S(data.g2Kalavadhi_m), StayYears: S(data.g2Kalavadhi_v),
          MaritalStatus: S(data.g2Vaivahik), Dependents: S(data.g2Avalambun),
          LandOwnerName: S(data.g2ShetiNaav), LandOwnerRelation: S(data.g2ShetiNaate),
          Village: S(data.g2GaavMukkam), Post: S(data.g2GaavPost), Taluka: S(data.g2GaavTaluka), District: S(data.g2GaavJilha), State: S(data.g2GaavRajya), VillagePin: S(data.g2GaavPin), VillageDurdhvani: S(data.g2GaavDurdhvani), VillageMobile: S(data.g2GaavMobile),
          PrevLoansJson: JSON.stringify([{ type: data.g2PurvKarjPrakar, account: data.g2PurvKhate, amount: data.g2PurvRakkam, d1: data.g2PurvDin1, d2: data.g2PurvDin2 }]),
          GuarantorLoansJson: JSON.stringify([
            { n: data.g2Jam94aKarjdarNaav, t: data.g2Jam94aPrakar, a: data.g2Jam94aKhate, r: data.g2Jam94aRakkam, d1: data.g2Jam94aDin1, d2: data.g2Jam94aDin2 },
            { n: data.g2Jam94bKarjdarNaav, t: data.g2Jam94bPrakar, a: data.g2Jam94bKhate, r: data.g2Jam94bRakkam, d1: data.g2Jam94bDin1, d2: data.g2Jam94bDin2 }
          ]),
          OtherBankLoansJson: JSON.stringify([{ n: data.g2Bank96Naav, s: data.g2Bank96Shakha, t: data.g2Bank96Prakar, a: data.g2Bank96Khate, r: data.g2Bank96Rakkam, d1: data.g2Bank96Din1, d2: data.g2Bank96Din2 }]),
          Kutumb95InfoJson: JSON.stringify([{ n: data.g2Kutumb95Naav, t: data.g2Kutumb95Prakar, a: data.g2Kutumb95Khate, r: data.g2Kutumb95Rakkam, d1: data.g2Kutumb95Din1, d2: data.g2Kutumb95Din2 }])
        });
      }
      // If user filled Jameen3 on Page 1 but didn't add as "extra", we still want it in relational list
      if (data.jameen3Naav && (!data.extraGuarantors || data.extraGuarantors.length === 0)) {
        guarantorsPayload.push({
          GuarantorNumber: 3, FullName: S(data.jameen3Naav), Age: S(data.jameen3Vay)
        });
      }
      // Add dynamic extra guarantors
      (data.extraGuarantors || []).forEach((g, index) => {
        guarantorsPayload.push({
          GuarantorNumber: 3 + index, 
          FullName: S(g.Naav),
          Age: S(g.Vay),
          Photo: S(g.Photo || g.photo),
          MemberNo: S(g.SabasadNo),
          SharesCount: S(g.Shares),
          SharesAmount: S(g.SharesRakkam),
          FatherName: S(g.VadilNaav),
          FatherAge: S(g.VadilVay),
          MotherName: S(g.AaiNaav),
          MotherAge: S(g.AaiVay),
          Address: S(g.Patta),
          PinCode: S(g.PinKod),
          Phone: S(g.Durdhvani),
          Mobile: S(g.Mobile),
          Email: S(g.Email),
          Company: S(g.Company),
          CompanyAddress: S(g.CompanyPatta),
          Department: S(g.Vibhag),
          Designation: S(g.Hudda),
          EmployeeCode: S(g.EmpCode),
          JobMonths: S(g.Karj_m),
          JobYears: S(g.Karj_v),
          RetirementDate: S(g.Seva),
          MonthlySalary: S(g.MonthlyVetan),
          NetSalary: S(g.Niwal),
          AnnualIncome: S(g.Vaarshik),
          ResidenceType: (g.JageSwaarup || []).join(','),
          StayMonths: S(g.Kalavadhi_m),
          StayYears: S(g.Kalavadhi_v),
          MaritalStatus: S(g.Vaivahik),
          Dependents: S(g.Avalambun),
          LandOwnerName: S(g.ShetiNaav),
          LandOwnerRelation: S(g.ShetiNaate),
          Village: S(g.GaavMukkam),
          Post: S(g.GaavPost),
          Taluka: S(g.GaavTaluka),
          District: S(g.GaavJilha),
          State: S(g.GaavRajya),
          VillagePin: S(g.GaavPin),
          VillageDurdhvani: S(g.GaavDurdhvani),
          VillageMobile: S(g.GaavMobile),
          // Previous loans (Section 13-16)
          PurvKarjPrakar: S(g.PurvKarjPrakar), PurvKhate: S(g.PurvKhate), PurvRakkam: S(g.PurvRakkam), PurvDin1: S(g.PurvDin1), PurvDin2: S(g.PurvDin2),
          Jam94aKarjdarNaav: S(g.Jam94aKarjdarNaav), Jam94aPrakar: S(g.Jam94aPrakar), Jam94aKhate: S(g.Jam94aKhate), Jam94aRakkam: S(g.Jam94aRakkam), Jam94aDin1: S(g.Jam94aDin1), Jam94aDin2: S(g.Jam94aDin2),
          Jam94bKarjdarNaav: S(g.Jam94bKarjdarNaav), Jam94bPrakar: S(g.Jam94bPrakar), Jam94bKhate: S(g.Jam94bKhate), Jam94bRakkam: S(g.Jam94bRakkam), Jam94bDin1: S(g.Jam94bDin1), Jam94bDin2: S(g.Jam94bDin2),
          Kutumb95Naav: S(g.Kutumb95Naav), Kutumb95Prakar: S(g.Kutumb95Prakar), Kutumb95Khate: S(g.Kutumb95Khate), Kutumb95Rakkam: S(g.Kutumb95Rakkam), Kutumb95Din1: S(g.Kutumb95Din1), Kutumb95Din2: S(g.Kutumb95Din2),
          Bank96Naav: S(g.Bank96Naav), Bank96Shakha: S(g.Bank96Shakha), Bank96Prakar: S(g.Bank96Prakar), Bank96Khate: S(g.Bank96Khate), Bank96Rakkam: S(g.Bank96Rakkam), Bank96Din1: S(g.Bank96Din1), Bank96Din2: S(g.Bank96Din2),
          
          PrevLoansJson: JSON.stringify([{ type: g.PurvKarjPrakar, account: g.PurvKhate, amount: g.PurvRakkam, d1: g.PurvDin1, d2: g.PurvDin2 }]),
          GuarantorLoansJson: JSON.stringify([
            { n: g.Jam94aKarjdarNaav, t: g.Jam94aPrakar, a: g.Jam94aKhate, r: g.Jam94aRakkam, d1: g.Jam94aDin1, d2: g.Jam94aDin2 },
            { n: g.Jam94bKarjdarNaav, t: g.Jam94bPrakar, a: g.Jam94bKhate, r: g.Jam94bRakkam, d1: g.Jam94bDin1, d2: g.Jam94bDin2 }
          ]),
          OtherBankLoansJson: JSON.stringify([{ n: g.Bank96Naav, s: g.Bank96Shakha, t: g.Bank96Prakar, a: g.Bank96Khate, r: g.Bank96Rakkam, d1: g.Bank96Din1, d2: g.Bank96Din2 }]),
          Kutumb95InfoJson: JSON.stringify([{ n: g.Kutumb95Naav, t: g.Kutumb95Prakar, a: g.Kutumb95Khate, r: g.Kutumb95Rakkam, d1: g.Kutumb95Din1, d2: g.Kutumb95Din2 }])
        });
      });


      const payload = {
        // Root properties (mapped directly to HomeLoanRequest base class)
        ApplicationDate: S(data.dinank),
        Branch: S(data.shakha),
        MemberNo: S(data.saCra),
        LoanAccountNo: S(data.karjKhate),
        ApplicantName: S(data.arjdarNaav),
        ApplicantAge: S(data.arjdarVay),
        CoApplicantName: S(data.saharjdarNaav),
        CoApplicantAge: S(data.saharjdarVay),
        LoanAmountNum: S(data.karjRakkam),
        LoanAmountWords: S(data.akshari),
        RepaymentMonths: S(data.paratfedKalavadhi),
        FirstInstalment: S(data.pahilaHapta),
        InstalmentDate: S(data.tarikh),
        LoanPurpose: S(data.karan),
        MaritalStatus: S(data.vaivahik),
        DependentCount: S(data.avalambuun),
        Guarantor1Name: S(data.jameen1Naav),
        Guarantor1Age: S(data.jameen1Vay),
        Guarantor2Name: S(data.jameen2Naav),
        Guarantor2Age: S(data.jameen2Vay),
        Guarantor3Name: S(data.jameen3Naav),
        Guarantor3Age: S(data.jameen3Vay),

        Borrower: {
          FullName: S(data.bNaav), Age: S(data.bVay), Photo: S(data.bPhoto), MemberNo: S(data.bSabasadNo), SharesCount: S(data.bShares), SharesAmount: S(data.bSharesRakkam),
          FatherName: S(data.bVadilNaav), FatherAge: S(data.bVadilVay), MotherName: S(data.bAaiNaav), MotherAge: S(data.bAaiVay),
          Address: S(data.bPatta), PinCode: S(data.bPinKod), Phone: S(data.bDurdhvani), Mobile: S(data.bMobile), Email: S(data.bEmail),
          ResidenceType: Array.isArray(data.bJageSwaarup) ? data.bJageSwaarup.join(',') : '',
          StayMonths: S(data.bKalavadhi_m), StayYears: S(data.bKalavadhi_v),
          MaritalStatus: S(data.bVaivahik), Dependents: S(data.bAvalambun),
          Company: S(data.bCompany), CompanyAddress: S(data.bCompanyPatta), CompanyPin: S(data.bCompanyPin), CompanyTel: S(data.bCompanyTel), CompanyMobile: S(data.bCompanyMobile), CompanyEmail: S(data.bCompanyEmail),
          Department: S(data.bVibhag), Designation: S(data.bHudda), EmployeeCode: S(data.bEmpCode), JobMonths: S(data.bKarj_m), JobYears: S(data.bKarj_v), RetirementDate: S(data.bSeva),
          MonthlySalary: S(data.bMonthlyVetan), Deductions: S(data.bKapat), NetSalary: S(data.bNiwal),
          AnnualIncome: S(data.bVaarshik), AnnualExpenses: S(data.bKharcha), NetAnnualIncome: S(data.bNiwalVaarshik), FamilyIncome: S(data.bKutumb), FamilyIncomeType: S(data.bKutumbType),
          LandOwnerName: S(data.bShetiNaav), LandOwnerRelation: S(data.bShetiNaate),
          Village: S(data.bGaavMukkam), Post: S(data.bGaavPost), Taluka: S(data.bGaavTaluka), District: S(data.bGaavJilha), State: S(data.bGaavRajya), VillagePin: S(data.bGaavPin), VillageMobile: S(data.bGaavMobile),
          PrevLoansJson: JSON.stringify([{ type: data.bPurvKarjPrakar, account: data.bPurvKhate, amount: data.bPurvRakkam, d1: data.bPurvDin1, d2: data.bPurvDin2 }]),
          GuarantorLoansJson: JSON.stringify([
            { n: data.bJam94aKarjdarNaav, t: data.bJam94aPrakar, a: data.bJam94aKhate, r: data.bJam94aRakkam, d1: data.bJam94aDin1, d2: data.bJam94aDin2 },
            { n: data.bJam94bKarjdarNaav, t: data.bJam94bPrakar, a: data.bJam94bKhate, r: data.bJam94bRakkam, d1: data.bJam94bDin1, d2: data.bJam94bDin2 }
          ]),
          OtherBankLoansJson: JSON.stringify([{ n: data.bBank96Naav, s: data.bBank96Shakha, t: data.bBank96Prakar, a: data.bBank96Khate, r: data.bBank96Rakkam, d1: data.bBank96Din1, d2: data.bBank96Din2 }])
        },

        Guarantors: guarantorsPayload,

        Property: {
          PropertyType: S(data.propertyType), VendorName: S(data.vikretaNaav), PropertyAddress: S(data.milkatPatta), HousingSocietyName: S(data.housingNaav),
          FlatNo: S(data.flatNo), Floor: S(data.manzala), Wing: S(data.wing), PlotNo: S(data.plotNo), NagarSector: S(data.nagarSector), RoadName: S(data.rastyaNaav), Suburb: S(data.upnagar), District: S(data.jilha), PinCode: S(data.pinKod),
          HousingRegNo: S(data.housingRegi), HousingMemberNo: S(data.sabasadNo), ShareCertNo: S(data.sharesCert), SharesFrom: S(data.bhaagFrom), SharesTo: S(data.bhaagTo), Area: S(data.kshetrafal), AreaType: Array.isArray(data.kshetraType) ? data.kshetraType.join(',') : S(data.kshetraType),
          BoundaryEast: S(data.purvesi), BoundaryWest: S(data.pashchimesi), BoundarySouth: S(data.dakshinesi), BoundaryNorth: S(data.uttaresi),
          BuildingYear: S(data.bandhamVarsh), SurveyNo: S(data.surveNo), HissaNo: S(data.hissaNo), GatNo: S(data.gatNo), MunicipalNo: S(data.municipalNo), OcReceived: S(data.ocMilale), OcDate: S(data.ocDin), ConveyanceDeed: S(data.deedZale), ConveyanceDeedDate: S(data.deedDin),
          TotalPurchasePrice: S(data.ekunKharedi), AmountPaid: S(data.dilelRakkam), BalancePayable: S(data.deneBaki), MortgageDetails: S(data.taranMahiti), GovtValuation: S(data.shasaki), MarketValuation: S(data.bazarBhav),
          BuilderFirmName: S(data.firmNaav), UnderConstrAddress: S(data.tarnPatta), BuildingPlanApproved: S(data.planManjur), ConstructionNature: S(data.bandhamSwaarup), ConstArea: S(data.constKshetrafal), ConstAreaType: Array.isArray(data.constKshetraType) ? data.constKshetraType.join(',') : S(data.constKshetraType),
          ConstBoundaryEast: S(data.constPurvesi), ConstBoundaryWest: S(data.constPashchimesi), ConstBoundarySouth: S(data.constDakshinesi), ConstBoundaryNorth: S(data.constUttaresi), ConstPlotNo: S(data.constPlotNo), ConstSurveyNo: S(data.constSurveyNo), ConstGatNo: S(data.constGatNo), ConstHissaNo: S(data.constHissaNo), ConstMunicipalNo: S(data.constMunicipalNo), AgreementDate: S(data.agreementDin), StampDuty: S(data.stampDuty), RegistrationAmount: S(data.regRakkam), ConstTotalPrice: S(data.constEkunKharedi), ConstAmountPaid: S(data.constDilelRakkam), ConstBalancePayable: S(data.constDeneBaki),
          // Step 6 Collateral Property Details
          CollateralHousingNaav: S(data.colHousingNaav), CollateralFlatNo: S(data.colFlatNo), CollateralFloor: S(data.colManzala), CollateralWing: S(data.colWing), CollateralPlotNo: S(data.colPlotNo), CollateralNagarSector: S(data.colNagarSector), CollateralRoadName: S(data.colRastyaNaav), CollateralSuburb: S(data.colUpnagar), CollateralDistrict: S(data.colJilha), CollateralPinCode: S(data.colPinKod), CollateralHousingRegNo: S(data.colHousingRegi), CollateralHousingMemberNo: S(data.colSabasadNo), CollateralShareCertNo: S(data.colSharesCert), CollateralSharesFrom: S(data.colBhaagFrom), CollateralSharesTo: S(data.colBhaagTo), CollateralArea: S(data.colKshetrafal), CollateralAreaType: Array.isArray(data.colKshetraType) ? data.colKshetraType.join(',') : S(data.colKshetraType),
          CollateralBoundaryEast: S(data.colPurvesi), CollateralBoundaryWest: S(data.colPashchimesi), CollateralBoundarySouth: S(data.colDakshinesi), CollateralBoundaryNorth: S(data.colUttaresi), CollateralBuildingYear: S(data.colBandhamVarsh), CollateralSurveyNo: S(data.colSurveNo), CollateralHissaNo: S(data.colHissaNo), CollateralGatNo: S(data.colGatNo), CollateralMunicipalNo: S(data.colMunicipalNo), CollateralOcReceived: S(data.colOcMilale), CollateralOcDate: S(data.colOcDin), CollateralConveyanceDeed: S(data.colDeedZale), CollateralConveyanceDeedDate: S(data.colDeedDin), CollateralGovtValuation: S(data.colShasaki), CollateralMarketValuation: S(data.colBazarBhav), CollateralRemarks: S(data.colTaranMahiti),
          FixedAssetsJson: JSON.stringify([
            { n: data.fixedAsset1Naav, r: data.fixedAsset1Rakkam, b: data.fixedAsset1Bank, rem: data.fixedAsset1Remark },
            { n: data.fixedAsset2Naav, r: data.fixedAsset2Rakkam, b: data.fixedAsset2Bank, rem: data.fixedAsset2Remark },
            { n: data.fixedAsset3Naav, r: data.fixedAsset3Rakkam, b: data.fixedAsset3Bank, rem: data.fixedAsset3Remark }
          ]),
          CurrentLoansJson: JSON.stringify([
            { b: data.loan1Bank, t: data.loan1Type, l: data.loan1Limit, bal: data.loan1Balance, e: data.loan1Emi, s: data.loan1Security },
            { b: data.loan2Bank, t: data.loan2Type, l: data.loan2Limit, bal: data.loan2Balance, e: data.loan2Emi, s: data.loan2Security }
          ])
        },

        Business: {
          BusinessNature: S(data.busSwaarup), BusinessType: Array.isArray(data.busType) ? data.busType.join(',') : S(data.busType), BusinessPremisesType: Array.isArray(data.busJageType) ? data.busJageType.join(',') : S(data.busJageType), BusinessArea: S(data.busKshetrafal), AreaType: Array.isArray(data.busKshetraType) ? data.busKshetraType.join(',') : S(data.busKshetraType), BusinessFirmName: S(data.busFirmNaav), BusinessAddress: S(data.busPatta), BusinessPin: S(data.busPin), BusinessPhone: S(data.busTel), BusinessEmail: S(data.busEmail), BusinessPan: S(data.busPan), GumastaNo: S(data.busGumasta), SalesTaxNo: S(data.busVikrikar), VatNo: S(data.busVat), ServiceTaxNo: S(data.busServiceTax), LicenseObtained: S(data.busParwane), TaxRegistered: S(data.busNodani), BusinessStartDate: S(data.busSuruKelay), BusinessExperience: S(data.busAnubhav), BusinessAnnualIncome: S(data.busEkunUtpanna), BusinessAnnualExpenses: S(data.busKharcha), BusinessNetIncome: S(data.busNiwal),
          CustomersJson: JSON.stringify([{ n1: data.customer1Naav, p1: data.customer1Patta }, { n2: data.customer2Naav, p2: data.customer2Patta }]),
          SuppliersJson: JSON.stringify([{ n1: data.supplier1Naav, p1: data.supplier1Patta }, { n2: data.supplier2Naav, p2: data.supplier2Patta }])
        },

        Insurance: {
          InsuranceCompany: S(data.vimaNaav), InsuranceAddress: S(data.vimaPatta), InsurancePolicyNo: S(data.vimaPolicy), InsuranceFrom: S(data.vimaFrom), InsuranceTo: S(data.vimaTo), InsuranceAmount: S(data.vimaRakkam), InsurancePremium: S(data.vimaHapta), InsurancePremiumType: S(data.vimaHaptaType),
          PolicyLoan: S(data.vimKarj), PolicyLoanBank: S(data.vimKarjBank), PolicyLoanAddress: S(data.vimKarjPatta), PolicyLoanAmount: S(data.vimKarjRakkam), PolicyLoanDate: S(data.vimKarjDin), PolicyLoanBalance: S(data.vimShillak),
          PanNo: S(data.panNo), IncomeTaxSince: S(data.taxSuru), TaxRowsJson: JSON.stringify(data.taxRows), ProfTaxNo: S(data.ptNo), ProfTaxSince: S(data.ptSuru), ProfTaxRowsJson: JSON.stringify(data.ptRows),
          InsuranceDetails: S(data.insuranceDetails), OtherDetails: S(data.otherDetails)
        },

        // Preserve exact flat state for perfect 1:1 restoration during edits
        RawStateSnapshot: data
      };

      let resp;
      if (isEditMode && effectiveId) {
        // UPDATE Existing
        resp = await fetch(`${API_BASE_URL}/HomeLoan/${effectiveId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // CREATE New
        resp = await fetch(`${API_BASE_URL}/HomeLoan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (resp.ok) {
        const res = await resp.json();
        showToast(`Home loan application ${isEditMode ? 'updated' : 'submitted'} successfully!`, 'success');
        localStorage.removeItem(draftKey);
        navigate('/home-loan');
      } else {
        let errMsg = 'Failed to submit application.';
        try {
          const err = await resp.json();
          errMsg = err.message || errMsg;
        } catch (e) {
          // If response is not JSON (e.g. 413 or 500 HTML page)
          errMsg = `Server error: ${resp.status} ${resp.statusText}`;
        }
        showToast(errMsg, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An unexpected error occurred during submission. ' + (err.message || ''), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepProps = { data, setData, errors, lang, setLang };

  return (
    <div className="home-loan-wrapper">
      {showPreview ? (
        <>
          {/* Preview toolbar */}
          <div className="preview-toolbar no-print" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 24px', background: '#0a1c5a', color: 'white',
            position: 'sticky', top: 0, zIndex: 1002, minHeight: 60
          }}>
            <div style={{ fontWeight: 600, fontSize: '15px' }}>{lang === 'en' ? 'Home Loan - Print Preview' : 'गृह कर्ज - प्रिंट प्रीव्ह्यू'}</div>
            <button 
              onClick={() => setShowPreview(false)} 
              style={{ 
                background: 'transparent', 
                color: 'white', 
                border: '2px solid white', 
                padding: '8px 20px', 
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px'
              }}>
              {lang === 'en' ? 'Close Preview' : 'प्रीव्ह्यू बंद करा'}
            </button>
          </div>
          <div style={{ paddingBottom: 40, background: '#ffffff', minHeight: '100vh', paddingTop: 20 }}>
            <HomeLoanPrint data={data} clientInfo={clientInfo} lang={lang} />
          </div>
        </>
      ) : (
        <div className="no-print">
          {/* Progress Bar with Switcher */}
          <div className="hl-progress-bar" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="hl-progress-pill">{step + 1} / {STEPS.length}</div>
              <div className="hl-progress-label">{STEPS[step].label} — {STEPS[step].sub}</div>
            </div>
            <div className="hl-lang-switcher">
              <button className={`hl-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              <button className={`hl-lang-btn ${lang === 'mr' ? 'active' : ''}`} onClick={() => setLang('mr')}>मराठी</button>
            </div>
          </div>

          {/* Form Container */}
          <div className="form-container">
            <div className="form-content">
              <div className="form-body">
                {/* 1. Static Steps mapping to components */}
                {step === 0 && (
                  <Step1 
                    {...stepProps} 
                    addGuarantor={() => {
                      setData(p => ({
                        ...p,
                        extraGuarantors: [...(p.extraGuarantors || []), { id: Date.now() }]
                      }));
                    }}
                    removeGuarantor={(id) => {
                      setData(p => ({
                        ...p,
                        extraGuarantors: (p.extraGuarantors || []).filter(g => g.id !== id)
                      }));
                      // If we are currently on or after the removed step, we should probably adjust the step index
                      // But since adding/removing is only done in Step 0, it's fine.
                    }}
                  />
                )}
                {step === 1 && <Step2 {...stepProps} />}
                {step === 2 && <Step3 {...stepProps} />}
                {step === 3 && <Step4 {...stepProps} />}

                {/* 2. Dynamic Guarantor Steps (starting from index 4) */}
                {step >= 4 && step < 4 + (data.extraGuarantors || []).length && (
                  <PersonBlock // Using direct base component for dynamic title support
                    key={`extra_g_${step}`}
                    data={data.extraGuarantors[step - 4]}
                    setData={(valFunc) => setData(p => ({
                      ...p,
                      extraGuarantors: p.extraGuarantors.map((g, idx) => idx === (step - 4) ? valFunc(g) : g)
                    }))}
                    errors={errors}
                    lang={lang}
                    title={STEPS[step].label}
                    prefix="" 
                  />
                )}

                {/* 3. Static Steps shifted by extraCount */}
                {(() => {
                  const extraCount = (data.extraGuarantors || []).length;
                  const currentEffectiveStep = step - extraCount;

                  if (step >= 4 + extraCount) {
                    if (currentEffectiveStep === 4) return <Step5 {...stepProps} />;
                    if (currentEffectiveStep === 5) return <Step6 {...stepProps} />;
                    if (currentEffectiveStep === 6) return <Step7 {...stepProps} />;
                    if (currentEffectiveStep === 7) return <Step8 {...stepProps} handlePrint={() => handlePrint(false)} handleSubmit={handleSubmit} lang={lang} isSubmitting={isSubmitting} />;
                  }
                  return null;
                })()}
              </div>

              {/* Navigation Footer */}
              <div className="nav-bar">
                <button
                  className={`btn-back ${step === 0 ? 'disabled' : ''}`}
                  onClick={prev}
                  disabled={step === 0}
                >
                  {tb('back', lang)}
                </button>
                
                <div className="nav-page-info">
                  {tb('page', lang)} {step + 1} / {STEPS.length}
                </div>

                {step < totalSteps - 1 ? (
                  <button className="btn-next" onClick={next}>{tb('next', lang)}</button>
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