import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, User, Plus, Search,
  Download, FileText, RotateCw, X,
  ArrowRight, Home, Briefcase, Car, Coins,
  Calendar, Fingerprint, MapPin, Loader2,
  CheckCircle2, Clock, AlertCircle, Eye,
  LayoutGrid, ClipboardList, Info,
  ChevronLeft, ChevronRight, Printer
} from 'lucide-react';
import LoanSelectionModal from '../Shared/LoanSelectionModal';
import html2pdf from 'html2pdf.js';
import { useApp } from '../../context/AppContext';
import HomeLoanPrint from '../HomeLoanForm/HomeLoanPrint';
import PersonalLoanPrint from '../PersonalLoanForm/PersonalLoanPrint';
import BusinessLoanPrint from '../BusinessLoanForm/BusinessLoanPrint';
import VehicleLoanPrint from '../VehicleLoanForm/Vehicleloanprint';
import GoldLoanPrint from '../GoldLoanForm/GoldLoanPrint';
import API_BASE_URL from '../../config';
import './Loans.css';

export default function Loans() {
  const navigate = useNavigate();
  const { clientInfo, showToast } = useApp();
  const [aadhaarHistory, setAadhaarHistory] = useState([]);
  const [submittedLoans, setSubmittedLoans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLoans, setIsLoadingLoans] = useState(true);
  const [isDownloading, setIsDownloading] = useState(null);
  const [isPrinting, setIsPrinting] = useState(null);
  const [pdfData, setPdfData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('applications'); // Always 'applications' now
  const pageSize = 6;
  const [loanFilterType, setLoanFilterType] = useState('All');
  const [loanFilterDate, setLoanFilterDate] = useState('');

  const filteredLoans = useMemo(() => {
    return submittedLoans.filter(l => {
      const matchesSearch = !searchTerm ||
        (l.applicantName && l.applicantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.applicationNo && l.applicationNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.loanType && l.loanType.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = loanFilterType === 'All' || l.loanType === loanFilterType;
      const matchesDate = !loanFilterDate || l.dateStr?.startsWith(loanFilterDate.split('-').reverse().join('/'));
      return matchesSearch && matchesType && matchesDate;
    });
  }, [submittedLoans, searchTerm, loanFilterType, loanFilterDate]);

  const fetchData = async () => {
    setIsLoading(true);
    const headers = {
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
    };

    try {
      const response = await fetch(`${API_BASE_URL}/AadharProxy/history`, { headers });
      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : (data.items || []);
        // Validate true Aadhaar records: 12-digit number, no loanType field,
        // gender must look like Male/Female/Other (not a date or amount), and verifiedAt must parse as a real date
        const validAadhaarRecords = rawList.filter(item => {
          if (!item.aadhaarNo || !/^\d{12}$/.test(item.aadhaarNo.trim())) return false;
          if (item.loanType) return false; // loan objects have loanType field
          if (item.applicationNo) return false; // loan objects have applicationNo field
          // gender should not look like a date (DD/MM/YYYY or YYYY-MM-DD)
          if (item.gender && /\d{4}/.test(item.gender)) return false;
          // dob should not contain rupee symbol
          if (item.dob && item.dob.includes('₹')) return false;
          // verifiedAt should be a parseable date
          const verifiedDate = new Date(item.verifiedAt);
          if (isNaN(verifiedDate.getTime())) return false;
          return true;
        });
        setAadhaarHistory(validAadhaarRecords);
      }
    } catch (err) {
      console.error("Aadhaar History Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoans = async () => {
    setIsLoadingLoans(true);
    const headers = {
      'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}`
    };
    try {
      const resp = await fetch(`${API_BASE_URL}/Analytics/recent-applications`, { headers });
      if (resp.ok) {
        const appsData = await resp.json();

        // Filter: Status must be Submitted (case-insensitive) and Application No must exist/not be N/A
        const filtered = appsData.filter(app => {
          const appNo = (app.applicationNo || '').trim().toLowerCase();
          const status = (app.status || '').trim().toLowerCase();
          const isGold = app.loanType === 'Gold Loan';

          if (isGold) return true; // Always show Gold Loans for now
          return appNo && appNo !== 'n/a' && appNo !== 'pending' && status === 'submitted';
        });

        const mapped = filtered.map(app => ({
          id: app.id,
          applicationNo: app.applicationNo,
          applicantName: app.applicantName,
          loanType: app.loanType,
          loanAmount: app.amount,
          status: app.status,
          dateMs: new Date(app.createdAt).getTime(),
          dateStr: formatDate(app.createdAt)
        }));

        mapped.sort((a, b) => b.dateMs - a.dateMs);
        setSubmittedLoans(mapped);
      }
    } catch (err) {
      console.error("Loan Fetch Error:", err);
    } finally {
      setIsLoadingLoans(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLoans();
  }, []);

  const formatDate = (dateInput) => {
    if (!dateInput) return '-';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const safeParse = (val, defaultVal = []) => {
    if (!val) return defaultVal;
    if (typeof val === 'object') return val;
    try { return JSON.parse(val); } catch { return defaultVal; }
  };

  const unmapVehicleLoan = (raw) => {
    if (!raw) return {};
    const g = (obj, key) => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj[key] !== undefined) return obj[key] || '';
      const lk = key.toLowerCase();
      const found = Object.keys(obj).find(k => k.toLowerCase() === lk);
      return found ? (obj[found] || '') : '';
    };

    const r = raw.data ? { ...raw.data, applicationNo: g(raw, "applicationNo") } : raw;
    const b = r.borrower || {};
    const gs = [];
    if (r.guarantor1) gs.push(r.guarantor1);
    if (r.guarantor2) gs.push(r.guarantor2);
    const egs = r.extraGuarantors || [];
    const nv = r.newVehicle || {};
    const ov = r.oldVehicle || {};
    const ins = r.insurance || {};

    const isoDate = (dateVal) => {
      if (!dateVal) return "";
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const mapPerson = (p = {}, prefix = "b") => {
      const res = {};
      res[prefix + "Photo"] = g(p, "photo");
      res[prefix + "Naav"] = g(p, "naav");
      res[prefix + "Vay"] = g(p, "vay");
      res[prefix + "SabasadNo"] = g(p, "sabasadNo");
      res[prefix + "Shares"] = g(p, "shares");
      res[prefix + "SharesRakkam"] = g(p, "sharesRakkam");
      res[prefix + "VadilNaav"] = g(p, "vadilNaav");
      res[prefix + "VadilVay"] = g(p, "vadilVay");
      res[prefix + "AaiNaav"] = g(p, "aaiNaav");
      res[prefix + "AaiVay"] = g(p, "aaiVay");
      res[prefix + "Patta"] = g(p, "patta");
      res[prefix + "PinKod"] = g(p, "pinKod");
      res[prefix + "Durdhvani"] = g(p, "durdhvani");
      res[prefix + "Mobile"] = g(p, "mobile");
      res[prefix + "Email"] = g(p, "email");
      const jage = g(p, "jageSwaarup");
      res[prefix + "JageSwaarup"] = Array.isArray(jage) ? jage : (typeof jage === 'string' ? jage.split(',').filter(Boolean) : []);
      res[prefix + "Kalavadhi_m"] = g(p, "kalavadhi_m");
      res[prefix + "Kalavadhi_v"] = g(p, "kalavadhi_v");
      res[prefix + "Vaivahik"] = g(p, "vaivahik") || "विवाहित";
      res[prefix + "Avalambun"] = g(p, "avalambun");
      res[prefix + "Company"] = g(p, "company");
      res[prefix + "CompanyPatta"] = g(p, "companyPatta");
      res[prefix + "CompanyPin"] = g(p, "companyPin");
      res[prefix + "CompanyTel"] = g(p, "companyTel");
      res[prefix + "CompanyMobile"] = g(p, "companyMobile");
      res[prefix + "CompanyEmail"] = g(p, "companyEmail");
      res[prefix + "Vibhag"] = g(p, "vibhag");
      res[prefix + "Hudda"] = g(p, "hudda");
      res[prefix + "EmpCode"] = g(p, "empCode");
      res[prefix + "Karj_m"] = g(p, "karj_m");
      res[prefix + "Karj_v"] = g(p, "karj_v");
      res[prefix + "Seva"] = isoDate(g(p, "seva"));
      res[prefix + "MonthlyVetan"] = g(p, "monthlyVetan");
      res[prefix + "Kapat"] = g(p, "kapat");
      res[prefix + "Niwal"] = g(p, "niwal");
      res[prefix + "Vaarshik"] = g(p, "vaarshik");
      res[prefix + "Kharcha"] = g(p, "kharcha");
      res[prefix + "NiwalVaarshik"] = g(p, "niwalVaarshik");
      res[prefix + "Kutumb"] = g(p, "kutumb");
      res[prefix + "KutumbType"] = g(p, "kutumbType") || "मासिक";
      res[prefix + "ShetiNaav"] = g(p, "shetiNaav");
      res[prefix + "ShetiNaate"] = g(p, "shetiNaate");
      res[prefix + "GaavMukkam"] = g(p, "gaavMukkam");
      res[prefix + "GaavPost"] = g(p, "gaavPost");
      res[prefix + "GaavTaluka"] = g(p, "gaavTaluka");
      res[prefix + "GaavJilha"] = g(p, "gaavJilha");
      res[prefix + "GaavRajya"] = g(p, "gaavRajya");
      res[prefix + "GaavPin"] = g(p, "gaavPin");
      res[prefix + "GaavDurdhvani"] = g(p, "gaavDurdhvani");
      res[prefix + "GaavMobile"] = g(p, "gaavMobile");
      res[prefix + "PurvKarjPrakar"] = g(p, "purvKarjPrakar");
      res[prefix + "PurvKhate"] = g(p, "purvKhate");
      res[prefix + "PurvRakkam"] = g(p, "purvRakkam");
      res[prefix + "PurvDin1"] = isoDate(g(p, "purvDin1"));
      res[prefix + "PurvDin2"] = isoDate(g(p, "purvDin2"));
      res[prefix + "Jam94aKarjdarNaav"] = g(p, "jam94aKarjdarNaav");
      res[prefix + "Jam94aPrakar"] = g(p, "jam94aPrakar");
      res[prefix + "Jam94aKhate"] = g(p, "jam94aKhate");
      res[prefix + "Jam94aRakkam"] = g(p, "jam94aRakkam");
      res[prefix + "Jam94aDin1"] = isoDate(g(p, "jam94aDin1"));
      res[prefix + "Jam94aDin2"] = isoDate(g(p, "jam94aDin2"));
      res[prefix + "Jam94bKarjdarNaav"] = g(p, "jam94bKarjdarNaav");
      res[prefix + "Jam94bPrakar"] = g(p, "jam94bPrakar");
      res[prefix + "Jam94bKhate"] = g(p, "jam94bKhate");
      res[prefix + "Jam94bRakkam"] = g(p, "jam94bRakkam");
      res[prefix + "Jam94bDin1"] = isoDate(g(p, "jam94bDin1"));
      res[prefix + "Jam94bDin2"] = isoDate(g(p, "jam94bDin2"));
      res[prefix + "Kutumb95Naav"] = g(p, "kutumb95Naav");
      res[prefix + "Kutumb95Prakar"] = g(p, "kutumb95Prakar");
      res[prefix + "Kutumb95Khate"] = g(p, "kutumb95Khate");
      res[prefix + "Kutumb95Rakkam"] = g(p, "kutumb95Rakkam");
      res[prefix + "Kutumb95Din1"] = isoDate(g(p, "kutumb95Din1"));
      res[prefix + "Kutumb95Din2"] = isoDate(g(p, "kutumb95Din2"));
      res[prefix + "Bank96Naav"] = g(p, "bank96Naav");
      res[prefix + "Bank96Shakha"] = g(p, "bank96Shakha");
      res[prefix + "Bank96Prakar"] = g(p, "bank96Prakar");
      res[prefix + "Bank96Khate"] = g(p, "bank96Khate");
      res[prefix + "Bank96Rakkam"] = g(p, "bank96Rakkam");
      res[prefix + "Bank96Din1"] = isoDate(g(p, "bank96Din1"));
      res[prefix + "Bank96Din2"] = isoDate(g(p, "bank96Din2"));
      res[prefix + "Dinank"] = isoDate(g(p, "dinank"));
      res[prefix + "Thikan"] = g(p, "thikan");
      return res;
    };

    const rootFields = {
      dinank: isoDate(g(r, "dinank")),
      saCra: g(r, "saCra"),
      karjKhate: g(r, "karjKhate"),
      shakha: g(r, "shakha"),
      arjdarNaav: g(r, "arjdarNaav"),
      arjdarVay: g(r, "arjdarVay"),
      karjRakkam: g(r, "karjRakkam"),
      akshari: g(r, "akshari"),
      paratfedKalavadhi: g(r, "paratfedKalavadhi"),
      pahilaHapta: g(r, "pahilaHapta"),
      tarikh: g(r, "tarikh"),
      karan: g(r, "karan"),
      vaivahik: g(r, "vaivahik"),
      avalambun: g(r, "avalambun"),
      jameen1Naav: g(r, "jameen1Naav"),
      jameen1Vay: g(r, "jameen1Vay"),
      jameen2Naav: g(r, "jameen2Naav"),
      jameen2Vay: g(r, "jameen2Vay"),
      jameen3Naav: g(r, "jameen3Naav"),
      jameen3Vay: g(r, "jameen3Vay"),
      applicationNo: g(r, "applicationNo"),
      appNo: g(r, "applicationNo")
    };

    const newVeh = {
      newVahanaVapar: g(nv, "vahanaVapar"),
      newCompanyNaav: g(nv, "companyNaav"),
      newVahanaPrakar: g(nv, "vahanaPrakar"),
      newNirmitVarsh: g(nv, "nirmitVarsh"),
      newModel: g(nv, "model"),
      newFuelType: g(nv, "fuelType"),
      newDealerNaav: g(nv, "dealerNaav"),
      newDealerPatta: g(nv, "dealerPatta"),
      newDealerMobile: g(nv, "dealerMobile"),
      newDealerTel: g(nv, "dealerTel"),
      newDealerEmail: g(nv, "dealerEmail"),
      newKimat: g(nv, "kimat"),
      newBooking: g(nv, "booking"),
      newShillak: g(nv, "shillak"),
      newDepositYes: g(nv, "depositYes"),
      newDepositAmt: g(nv, "depositAmt"),
      newParkingThikan: g(nv, "parkingThikan"),
      newPermitNo: g(nv, "permitNo"),
      newPermitRenew: g(nv, "permitRenew"),
      newOtherVehicleYes: g(nv, "otherVehicleYes"),
      newOtherVehicleNo: g(nv, "otherVehicleNo"),
      newOtherVehicleType: g(nv, "otherVehicleType"),
      newOtherVehicleModel: g(nv, "otherVehicleModel"),
      newOtherVehicleYear: g(nv, "otherVehicleYear"),
    };

    const oldVeh = {
      oldVahanaVapar: g(ov, "vahanaVapar"),
      oldDealerNaav: g(ov, "dealerNaav"),
      oldDealerPatta: g(ov, "dealerPatta"),
      oldDealerMobile: g(ov, "dealerMobile"),
      oldDealerTel: g(ov, "dealerTel"),
      oldDealerEmail: g(ov, "dealerEmail"),
      oldCompanyNaav: g(ov, "companyNaav"),
      oldVehicleNo: g(ov, "vehicleNo"),
      oldRTO: g(ov, "rto"),
      oldVahanaPrakar: g(ov, "vahanaPrakar"),
      oldNirmitVarsh: g(ov, "nirmitVarsh"),
      oldEngineNo: g(ov, "engineNo"),
      oldChassisNo: g(ov, "chassisNo"),
      oldModel: g(ov, "model"),
      oldFuelType: g(ov, "fuelType"),
      oldFitnessNo: g(ov, "fitnessNo"),
      oldFitnessRenew: g(ov, "fitnessRenew"),
      oldParkingThikan: g(ov, "parkingThikan"),
      oldPermitNo: g(ov, "permitNo"),
      oldPermitArea: g(ov, "permitArea"),
      oldPermitRenewDate: g(ov, "permitRenewDate"),
      oldPermitFrom: g(ov, "permitFrom"),
      oldPermitTo: g(ov, "permitTo"),
      oldRoadTax: g(ov, "roadTax"),
      oldRoadTaxPeriod: g(ov, "roadTaxPeriod"),
      oldOtherVehicleYes: g(ov, "otherVehicleYes"),
      oldOtherVehicleNo: g(ov, "otherVehicleNo"),
      oldOtherVehicleType: g(ov, "otherVehicleType"),
      oldOtherVehicleModel: g(ov, "otherVehicleModel"),
      oldOtherVehicleYear: g(ov, "otherVehicleYear"),
    };

    const insurance = {
      insCompanyNaav: g(ins, "insCompanyNaav"),
      insAddress: g(ins, "insAddress"),
      insPolicy: g(ins, "insPolicy"),
      insDurFrom: g(ins, "insDurFrom"),
      insDurTo: g(ins, "insDurTo"),
      insAmount: g(ins, "insAmount"),
      insPremium: g(ins, "insPremium"),
      oldKimat: g(ins, "oldKimat"),
      oldAdvance: g(ins, "oldAdvance"),
      oldShillak: g(ins, "oldShillak"),
      oldValuationPrice: g(ins, "oldValuationPrice"),
      oldDepositYes: g(ins, "oldDepositYes"),
      oldDepositAmt: g(ins, "oldDepositAmt"),
      lifeInsCompany: g(ins, "lifeInsCompany"),
      lifeInsAddress: g(ins, "lifeInsAddress"),
      lifeInsPolicy: g(ins, "lifeInsPolicy"),
      lifeInsDurFrom: g(ins, "lifeInsDurFrom"),
      lifeInsDurTo: g(ins, "lifeInsDurTo"),
      lifeInsAmount: g(ins, "lifeInsAmount"),
      lifeInsPremium: g(ins, "lifeInsPremium"),
      lifeInsPremiumType: g(ins, "lifeInsPremiumType"),
      lifeInsLoanYes: g(ins, "lifeInsLoanYes"),
      lifeInsLoanBank: g(ins, "lifeInsLoanBank"),
      lifeInsLoanAmount: g(ins, "lifeInsLoanAmount"),
      lifeInsLoanDate: g(ins, "lifeInsLoanDate"),
      lifeInsLoanBalance: g(ins, "lifeInsLoanBalance"),
    };

    const result = {
      ...rootFields,
      ...mapPerson(b, "b"),
      ...mapPerson(gs[0] || {}, "g1"),
      ...mapPerson(gs[1] || {}, "g2"),
      ...newVeh,
      ...oldVeh,
      ...insurance,
      extraGuarantors: egs.map(eg => {
        const egId = eg.frontendId || String(Date.now() + Math.random());
        return { id: egId };
      })
    };

    egs.forEach(eg => {
      const egId = eg.frontendId || String(Date.now() + Math.random());
      const mappedEg = mapPerson(eg, "exG_" + egId);
      Object.assign(result, mappedEg);
    });

    return result;
  };

  const unmapBusinessLoan = (raw) => {
    if (!raw) return {};
    const g = (obj, key) => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj[key] !== undefined) return obj[key] || '';
      const lk = key.toLowerCase();
      const found = Object.keys(obj).find(k => k.toLowerCase() === lk);
      return found ? (obj[found] || '') : '';
    };
    const r = raw.data ? { ...raw.data, applicationNo: g(raw, "applicationNo") } : raw;
    const b = r.borrower || {};
    const gs = r.guarantors || [];
    const egs = r.extraGuarantors || [];
    const biz = r.businessInfo || {};
    const ins = r.insuranceTaxInfo || {};
    const col = r.collateral || {};

    // Helper: format Date to YYYY-MM-DD
    const isoDate = (dateVal) => {
      if (!dateVal) return "";
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const mapPerson = (p = {}, prefix = "b") => {
      const res = {};
      res[prefix + "Photo"] = g(p, "photoBase64");
      res[prefix + "Naav"] = g(p, "fullName");
      res[prefix + "Vay"] = g(p, "age");
      res[prefix + "SabasadNo"] = g(p, "memberNo");
      res[prefix + "Shares"] = g(p, "sharesCount");
      res[prefix + "SharesRakkam"] = g(p, "sharesAmount");
      res[prefix + "VadilNaav"] = g(p, "fatherHusbandName");
      res[prefix + "VadilVay"] = g(p, "fatherHusbandAge");
      res[prefix + "AaiNaav"] = g(p, "motherName");
      res[prefix + "AaiVay"] = g(p, "motherAge");
      res[prefix + "Patta"] = g(p, "residentialAddress");
      res[prefix + "PinKod"] = g(p, "pinCode");
      res[prefix + "Durdhvani"] = g(p, "telephone");
      res[prefix + "Mobile"] = g(p, "mobile");
      res[prefix + "Email"] = g(p, "email");
      res[prefix + "JageSwaarup"] = (g(p, "propertyTypes") || "").split(",").filter(Boolean);
      res[prefix + "Kalavadhi_m"] = g(p, "residenceMonths");
      res[prefix + "Kalavadhi_v"] = g(p, "residenceYears");
      res[prefix + "Vaivahik"] = g(p, "maritalStatus");
      res[prefix + "Avalambun"] = g(p, "dependents");
      res[prefix + "Company"] = g(p, "companyName");
      res[prefix + "CompanyPatta"] = g(p, "companyAddress");
      res[prefix + "CompanyPin"] = g(p, "companyPinCode");
      res[prefix + "CompanyTel"] = g(p, "companyTelephone");
      res[prefix + "CompanyMobile"] = g(p, "companyMobile");
      res[prefix + "CompanyEmail"] = g(p, "companyEmail");
      res[prefix + "Vibhag"] = g(p, "department");
      res[prefix + "Hudda"] = g(p, "designation");
      res[prefix + "EmpCode"] = g(p, "employeeCode");
      res[prefix + "Karj_m"] = g(p, "employmentMonths");
      res[prefix + "Karj_v"] = g(p, "employmentYears");

      // Date fields for splitDates
      res[prefix + "Seva"] = isoDate(g(p, "retirementDate"));
      res[prefix + "Dinank"] = isoDate(g(p, "dateOfSign"));
      res[prefix + "PurvDin1"] = isoDate(g(p, "prevLoanTakenDate"));
      res[prefix + "PurvDin2"] = isoDate(g(p, "prevLoanRepaidDate"));
      res[prefix + "Jam94aDin1"] = isoDate(g(p, "guar94aTakenDate"));
      res[prefix + "Jam94aDin2"] = isoDate(g(p, "guar94aRepaidDate"));
      res[prefix + "Jam94bDin1"] = isoDate(g(p, "guar94bTakenDate"));
      res[prefix + "Jam94bDin2"] = isoDate(g(p, "guar94bRepaidDate"));
      res[prefix + "Kutumb95Din1"] = isoDate(g(p, "familyLoanTakenDate"));
      res[prefix + "Kutumb95Din2"] = isoDate(g(p, "familyLoanRepaidDate"));
      res[prefix + "Bank96Din1"] = isoDate(g(p, "otherBankLoanTakenDate"));
      res[prefix + "Bank96Din2"] = isoDate(g(p, "otherBankLoanRepaidDate"));

      res[prefix + "MonthlyVetan"] = g(p, "monthlySalary");
      res[prefix + "Kapat"] = g(p, "deductions");
      res[prefix + "Niwal"] = g(p, "netSalary");
      res[prefix + "Vaarshik"] = g(p, "annualBusinessIncome");
      res[prefix + "Kharcha"] = g(p, "totalExpenses");
      res[prefix + "NiwalVaarshik"] = g(p, "netAnnualIncome");
      res[prefix + "Kutumb"] = g(p, "familyIncome");
      res[prefix + "KutumbType"] = g(p, "familyIncomeType");
      res[prefix + "ShetiNaav"] = g(p, "propertyOwnerName");
      res[prefix + "ShetiNaate"] = g(p, "propertyOwnerRelation");
      res[prefix + "GaavMukkam"] = g(p, "villageMukkam");
      res[prefix + "GaavPost"] = g(p, "villagePost");
      res[prefix + "GaavTaluka"] = g(p, "villageTaluka");
      res[prefix + "GaavJilha"] = g(p, "villageDistrict");
      res[prefix + "GaavRajya"] = g(p, "villageState");
      res[prefix + "GaavPin"] = g(p, "villagePinCode");
      res[prefix + "GaavDurdhvani"] = g(p, "villageTelephone");
      res[prefix + "GaavMobile"] = g(p, "villageMobile");

      res[prefix + "PurvKarjPrakar"] = g(p, "prevLoanType");
      res[prefix + "PurvKhate"] = g(p, "prevLoanAccountNo");
      res[prefix + "PurvRakkam"] = g(p, "prevLoanAmount");

      res[prefix + "Jam94aKarjdarNaav"] = g(p, "guar94aBorrowerName");
      res[prefix + "Jam94aPrakar"] = g(p, "guar94aLoanType");
      res[prefix + "Jam94aKhate"] = g(p, "guar94aAccountNo");
      res[prefix + "Jam94aRakkam"] = g(p, "guar94aAmount");

      res[prefix + "Jam94bKarjdarNaav"] = g(p, "guar94bBorrowerName");
      res[prefix + "Jam94bPrakar"] = g(p, "guar94bLoanType");
      res[prefix + "Jam94bKhate"] = g(p, "guar94bAccountNo");
      res[prefix + "Jam94bRakkam"] = g(p, "guar94bAmount");

      res[prefix + "Kutumb95Naav"] = g(p, "familyLoanMemberName");
      res[prefix + "Kutumb95Prakar"] = g(p, "familyLoanType");
      res[prefix + "Kutumb95Khate"] = g(p, "familyLoanAccountNo");
      res[prefix + "Kutumb95Rakkam"] = g(p, "familyLoanAmount");

      res[prefix + "Bank96Naav"] = g(p, "otherBankName");
      res[prefix + "Bank96Shakha"] = g(p, "otherBankBranch");
      res[prefix + "Bank96Prakar"] = g(p, "otherBankLoanType");
      res[prefix + "Bank96Khate"] = g(p, "otherBankAccountNo");
      res[prefix + "Bank96Rakkam"] = g(p, "otherBankLoanAmount");

      res[prefix + "Thikan"] = g(p, "placeOfSign");

      return res;
    };

    const g1Obj = gs.find(x => x.guarantorNumber === 1) || {};
    const g2Obj = gs.find(x => x.guarantorNumber === 2) || {};

    const data = {
      // Step 1
      applicationNo: g(r, "applicationNo"),
      appNo: g(r, "applicationNo"),
      dinank: isoDate(g(r, "applicationDate")),
      shakha: g(r, "branch"),
      saCra: g(r, "memberNo"),
      karjKhate: g(r, "loanAccountNo"),
      arjdarNaav: g(r, "applicantName"),
      arjdarVay: g(r, "applicantAge"),
      karjRakkam: g(r, "loanAmount"),
      akshari: g(r, "loanAmountInWords"),
      paratfedKalavadhi: g(r, "repaymentMonths"),
      pahilaHapta: g(r, "firstInstallmentAfterMonths"),
      tarikh: g(r, "installmentDate"),
      karan: g(r, "purpose"),
      avalambun: g(r, "dependents"),
      jameen1Naav: g(r, "guarantor1Name"),
      jameen1Vay: g(r, "guarantor1Age"),
      jameen2Naav: g(r, "guarantor2Name"),
      jameen2Vay: g(r, "guarantor2Age"),
      jameen3Naav: g(r, "guarantor3Name"),
      jameen3Vay: g(r, "guarantor3Age"),

      // Step 2, 3, 4
      ...mapPerson(b, "b"),
      ...mapPerson(g1Obj, "g1"),
      ...mapPerson(g2Obj, "g2"),

      // Business Info (Page 5)
      bizNature: g(biz, "businessNature"),
      bizType: g(biz, "businessType"),
      bizJagaType: g(biz, "businessPropertyType"),
      bizArea: g(biz, "floorArea"),
      bizFirmName: g(biz, "firmName"),
      bizAddress: g(biz, "address"),
      bizAddress2: g(biz, "address2"),
      bizPin: g(biz, "pinCode"),
      bizTel: g(biz, "phone"),
      bizEmail: g(biz, "email"),
      bizPan: g(biz, "panCardNo"),
      bizGumasta: g(biz, "gumastaLicenseNo"),
      bizSalesTax: g(biz, "salesTaxNo"),
      bizVat: g(biz, "vatNo"),
      bizServiceTax: g(biz, "serviceTaxNo"),
      bizOtherLicense: g(biz, "otherLicense"),
      bizLicenseYes: g(biz, "allLicensesAvailable"),
      bizResidentYes: g(biz, "isSmallIndustryResident"),
      bizSince: g(biz, "sinceWhen"),
      bizExperience: g(biz, "experience"),
      bizAnnualIncome: g(biz, "totalAnnualIncome"),
      bizAnnualExpense: g(biz, "totalAnnualExpenses"),
      bizNetIncome: g(biz, "netAnnualIncome"),
      bizCust1Naav: g(biz, "customer1Name"),
      bizCust1Patta: g(biz, "customer1Address"),
      bizCust2Naav: g(biz, "customer2Name"),
      bizCust2Patta: g(biz, "customer2Address"),
      bizSupp1Naav: g(biz, "supplier1Name"),
      bizSupp1Patta: g(biz, "supplier1Address"),
      bizSupp2Naav: g(biz, "supplier2Name"),
      bizSupp2Patta: g(biz, "supplier2Address"),
      bizExtra1: g(biz, "extra1"),
      bizExtra2: g(biz, "extra2"),
      bizExtra3: g(biz, "extra3"),
      bizExtra4: g(biz, "extra4"),

      // Insurance & Tax (Page 6)
      insCompany: g(ins, "insuranceCompanyName"),
      insAddress: g(ins, "insuranceAddress"),
      insPolicy: g(ins, "insurancePolicyNo"),
      insAmount: g(ins, "insuranceAmount"),
      insPremium: g(ins, "insurancePremium"),
      insPremiumType: g(ins, "insurancePremiumFrequency"),
      insLoanYes: g(ins, "hasPolicyLoan"),
      insLoanBank: g(ins, "policyLoanBankName"),
      insLoanAddress: g(ins, "policyLoanBankAddress"),
      insLoanAmount: g(ins, "policyLoanAmount"),
      insLoanBalance: g(ins, "policyLoanBalance"),
      itPan: g(ins, "panCardNo"),
      itSince: g(ins, "incomeTaxSince"),
      itYear1From: g(ins, "itYear1From"), itYear1To: g(ins, "itYear1To"), itAmount1: g(ins, "itAmount1"),
      itDate1: isoDate(g(ins, "itDate1")),
      itYear2From: g(ins, "itYear2From"), itYear2To: g(ins, "itYear2To"), itAmount2: g(ins, "itAmount2"),
      itDate2: isoDate(g(ins, "itDate2")),
      itYear3From: g(ins, "itYear3From"), itYear3To: g(ins, "itYear3To"), itAmount3: g(ins, "itAmount3"),
      itDate3: isoDate(g(ins, "itDate3")),
      ptNo: g(ins, "proTaxNo"),
      ptSince: g(ins, "proTaxSince"),
      ptYear1From: g(ins, "ptYear1From"), ptYear1To: g(ins, "ptYear1To"), ptAmount1: g(ins, "ptAmount1"),
      ptDate1: isoDate(g(ins, "ptDate1")),
      ptYear2From: g(ins, "ptYear2From"), ptYear2To: g(ins, "ptYear2To"), ptAmount2: g(ins, "ptAmount2"),
      ptDate2: isoDate(g(ins, "ptDate2")),
      ptYear3From: g(ins, "ptYear3From"), ptYear3To: g(ins, "ptYear3To"), ptAmount3: g(ins, "ptAmount3"),
      ptDate3: isoDate(g(ins, "ptDate3")),

      // Special Date keys for Step 6
      insDurFrom_d: isoDate(g(ins, "insuranceFrom")),
      insDurTo_d: isoDate(g(ins, "insuranceTo")),
      insLoanDate_d: isoDate(g(ins, "policyLoanDate")),

      // Collateral (Page 7)
      colPropType: g(col, "propertyType"),
      colPropTypeOther: g(col, "propertyTypeOther"),
      colAddress: g(col, "propertyAddress"),
      colAddress2: g(col, "propertyAddress2"),
      colPin: g(col, "propertyPinCode"),
      colTel: g(col, "propertyTelephone"),
      colMobile: g(col, "propertyMobile"),
      colGalaArea: g(col, "galaArea"),
      colBuildYear: g(col, "buildingConstructionYear"),
      colCitySurvey: g(col, "citySurveyNo"),
      colPlot: g(col, "plotNo"),
      colWard: g(col, "wardNo"),
      colCompletionCert: isoDate(g(col, "completionCertDate")),
      colOCDate: isoDate(g(col, "ocDate")),
      colConveyanceDate: isoDate(g(col, "conveyanceDeedDate")),
      colHousingReg: g(col, "housingSocietyRegNo"),
      colMemberNo: g(col, "memberNo"),
      colLandArea: g(col, "landArea"),
      colNADate: isoDate(g(col, "naOrderDate")),
      colLandCitySurvey: g(col, "landCitySurveyNo"),
      colLandPlot: g(col, "landPlotNo"),
      colLandWard: g(col, "landWardNo"),
      colGutNo: g(col, "gutNo"),
      colHissaNo: g(col, "hissaNo"),
      colEast: g(col, "eastBoundary"),
      colWest: g(col, "westBoundary"),
      colSouth: g(col, "southBoundary"),
      colNorth: g(col, "northBoundary"),
      colGovtVal: g(col, "govtValuation"),
      colMarketVal: g(col, "marketValue"),
      colInsCompany: g(col, "insuranceCompanyName"),
      colInsAddress: g(col, "insuranceAddress"),
      colInsAddress2: g(col, "insuranceAddress2"),
      colInsPolicy: g(col, "insurancePolicyNo"),
      colInsAmount: g(col, "insuranceAmount"),
      colInsPremium: g(col, "insurancePremium"),

      // Special Date keys for Step 7
      colInsDurFrom_d: isoDate(g(col, "insuranceFrom")),
      colInsDurTo_d: isoDate(g(col, "insuranceTo")),

      // Extra Guarantors for the list
      extraGuarantors: egs.map(e => ({
        id: e.frontendId || e.id,
        name: e.fullName,
        age: e.age
      }))
    };

    // Add extra guarantor fields (eg_ID_ prefix)
    egs.forEach(e => {
      const id = e.frontendId || e.id;
      const prefix = `eg_${id}_`;
      const personData = mapPerson(e, prefix);
      Object.assign(data, personData);
    });

    return data;
  };



  const unmapHomeLoan = (raw) => {
    if (!raw) return {};
    const r = raw;
    // New single-table: nested data is inside formData (deserialized raw_json)
    // Old multi-table: nested data is directly on r (r.borrower, r.property, etc.)
    const fd = r.formData || r.FormData || {};
    const b = fd.Borrower || fd.borrower || r.borrower || {};
    const rawGs = fd.Guarantors || fd.guarantors || r.guarantors || [];
    const p = fd.Property || fd.property || r.property || {};
    const bus = fd.Business || fd.business || r.business || {};
    const ins = fd.Insurance || fd.insurance || r.insurance || {};

    // Helper: case-insensitive get
    const g = (obj, key) => {
      if (!obj || typeof obj !== 'object') return '';
      if (obj[key] !== undefined) return obj[key] || '';
      const lk = key.toLowerCase();
      const found = Object.keys(obj).find(k => k.toLowerCase() === lk);
      return found ? (obj[found] || '') : '';
    };

    const gs = rawGs.map(gx => {
      const res = { ...gx };
      // Section 13
      const prev = safeParse(g(gx, 'PrevLoansJson') || g(gx, 'prevLoansJson'));
      if (prev[0]) {
        res.PurvKarjPrakar = g(gx, 'PurvKarjPrakar') || prev[0].type || prev[0].t || '';
        res.PurvKhate = g(gx, 'PurvKhate') || prev[0].account || prev[0].a || '';
        res.PurvRakkam = g(gx, 'PurvRakkam') || prev[0].amount || prev[0].r || '';
        res.PurvDin1 = g(gx, 'PurvDin1') || prev[0].d1 || '';
        res.PurvDin2 = g(gx, 'PurvDin2') || prev[0].d2 || '';
      }
      // Section 14
      const gloans = safeParse(g(gx, 'GuarantorLoansJson') || g(gx, 'guarantorLoansJson'));
      if (gloans[0]) {
        res.Jam94aKarjdarNaav = g(gx, 'Jam94aKarjdarNaav') || gloans[0].n || gloans[0].name || '';
        res.Jam94aPrakar = g(gx, 'Jam94aPrakar') || gloans[0].t || gloans[0].type || '';
        res.Jam94aKhate = g(gx, 'Jam94aKhate') || gloans[0].a || gloans[0].account || '';
        res.Jam94aRakkam = g(gx, 'Jam94aRakkam') || gloans[0].r || gloans[0].amount || '';
        res.Jam94aDin1 = g(gx, 'Jam94aDin1') || gloans[0].d1 || '';
        res.Jam94aDin2 = g(gx, 'Jam94aDin2') || gloans[0].d2 || '';
      }
      if (gloans[1]) {
        res.Jam94bKarjdarNaav = g(gx, 'Jam94bKarjdarNaav') || gloans[1].n || gloans[1].name || '';
        res.Jam94bPrakar = g(gx, 'Jam94bPrakar') || gloans[1].t || gloans[1].type || '';
        res.Jam94bKhate = g(gx, 'Jam94bKhate') || gloans[1].a || gloans[1].account || '';
        res.Jam94bRakkam = g(gx, 'Jam94bRakkam') || gloans[1].r || gloans[1].amount || '';
        res.Jam94bDin1 = g(gx, 'Jam94bDin1') || gloans[1].d1 || '';
        res.Jam94bDin2 = g(gx, 'Jam94bDin2') || gloans[1].d2 || '';
      }
      // Section 15
      const kutumb = safeParse(g(gx, 'Kutumb95InfoJson') || g(gx, 'kutumb95InfoJson'));
      if (kutumb[0]) {
        res.Kutumb95Naav = g(gx, 'Kutumb95Naav') || kutumb[0].n || '';
        res.Kutumb95Prakar = g(gx, 'Kutumb95Prakar') || kutumb[0].t || '';
        res.Kutumb95Khate = g(gx, 'Kutumb95Khate') || kutumb[0].a || '';
        res.Kutumb95Rakkam = g(gx, 'Kutumb95Rakkam') || kutumb[0].r || '';
        res.Kutumb95Din1 = g(gx, 'Kutumb95Din1') || kutumb[0].d1 || '';
        res.Kutumb95Din2 = g(gx, 'Kutumb95Din2') || kutumb[0].d2 || '';
      }
      // Section 16
      const obl = safeParse(g(gx, 'OtherBankLoansJson') || g(gx, 'otherBankLoansJson'));
      if (obl[0]) {
        res.Bank96Naav = g(gx, 'Bank96Naav') || obl[0].n || '';
        res.Bank96Shakha = g(gx, 'Bank96Shakha') || obl[0].s || '';
        res.Bank96Prakar = g(gx, 'Bank96Prakar') || obl[0].t || '';
        res.Bank96Khate = g(gx, 'Bank96Khate') || obl[0].a || '';
        res.Bank96Rakkam = g(gx, 'Bank96Rakkam') || obl[0].r || '';
        res.Bank96Din1 = g(gx, 'Bank96Din1') || obl[0].d1 || '';
        res.Bank96Din2 = g(gx, 'Bank96Din2') || obl[0].d2 || '';
      }
      // Missing fields for sections 6, 7, 8, 11, 12
      res.JageSwaarup = (g(gx, 'residenceType') || g(gx, 'ResidenceType') || '').split?.(',').filter(Boolean) || [];
      res.Kalavadhi_m = g(gx, 'stayMonths') || g(gx, 'StayMonths');
      res.Kalavadhi_v = g(gx, 'stayYears') || g(gx, 'StayYears');
      res.Vaivahik = g(gx, 'maritalStatus') || g(gx, 'MaritalStatus');
      res.Avalambun = g(gx, 'dependents') || g(gx, 'Dependents');
      res.ShetiNaav = g(gx, 'landOwnerName') || g(gx, 'LandOwnerName');
      res.ShetiNaate = g(gx, 'landOwnerRelation') || g(gx, 'LandOwnerRelation');
      res.GaavMukkam = g(gx, 'village') || g(gx, 'Village');
      res.GaavPost = g(gx, 'post') || g(gx, 'Post');
      res.GaavTaluka = g(gx, 'taluka') || g(gx, 'Taluka');
      res.GaavJilha = g(gx, 'district') || g(gx, 'District');
      res.GaavRajya = g(gx, 'state') || g(gx, 'State');
      res.GaavPin = g(gx, 'villagePin') || g(gx, 'VillagePin');
      res.GaavDurdhvani = g(gx, 'villageDurdhvani') || g(gx, 'VillageDurdhvani');
      res.GaavMobile = g(gx, 'villageMobile') || g(gx, 'VillageMobile');
      // Aliases for Page 1 & Page 8
      res.naav = g(gx, 'FullName') || g(gx, 'fullName') || '';
      res.vay = g(gx, 'Age') || g(gx, 'age') || '';
      res.photo = g(gx, 'Photo') || g(gx, 'photo') || '';
      return res;
    });

    const g1 = gs.find?.(x => x.guarantorNumber === 1 || x.GuarantorNumber === 1) || gs[0] || {};
    const g2 = gs.find?.(x => x.guarantorNumber === 2 || x.GuarantorNumber === 2) || gs[1] || {};

    return {
      dinank: r.applicationDate, shakha: r.branch, saCra: r.memberNo, karjKhate: r.loanAccountNo,
      applicationNo: r.applicationNo, appNo: r.applicationNo,
      arjdarNaav: r.applicantName, arjdarVay: r.applicantAge,
      saharjdarNaav: r.coApplicantName, saharjdarVay: r.coApplicantAge,
      karjRakkam: r.loanAmountNum, akshari: r.loanAmountWords,
      paratfedKalavadhi: r.repaymentMonths, pahilaHapta: r.firstInstalment, tarikh: r.instalmentDate,
      karan: r.loanPurpose, vaivahik: r.maritalStatus, avalambuun: r.dependentCount,
      jameen1Naav: r.guarantor1Name, jameen1Vay: r.guarantor1Age,
      jameen2Naav: r.guarantor2Name, jameen2Vay: r.guarantor2Age,
      jameen3Naav: r.guarantor3Name, jameen3Vay: r.guarantor3Age,

      // Borrower
      bPhoto: g(b, 'photo') || g(b, 'Photo'), bNaav: g(b, 'fullName') || g(b, 'FullName'), bVay: g(b, 'age') || g(b, 'Age'),
      bSabasad: g(b, 'memberNo') || g(b, 'MemberNo'), bShares: g(b, 'sharesCount') || g(b, 'SharesCount'), bSharesRakkam: g(b, 'sharesAmount') || g(b, 'SharesAmount'),
      bVadilNaav: g(b, 'fatherName') || g(b, 'FatherName'), bVadilVay: g(b, 'fatherAge') || g(b, 'FatherAge'),
      bAaiNaav: g(b, 'motherName') || g(b, 'MotherName'), bAaiVay: g(b, 'motherAge') || g(b, 'MotherAge'),
      bPatta: g(b, 'address') || g(b, 'Address'), bPinKod: g(b, 'pinCode') || g(b, 'PinCode'),
      bDurdhvani: g(b, 'phone') || g(b, 'Phone'), bMobile: g(b, 'mobile') || g(b, 'Mobile'), bEmail: g(b, 'email') || g(b, 'Email'),
      bJageSwaarup: (g(b, 'residenceType') || g(b, 'ResidenceType') || '').split?.(',').filter(Boolean) || [],
      bKalavadhi_m: g(b, 'stayMonths') || g(b, 'StayMonths'), bKalavadhi_v: g(b, 'stayYears') || g(b, 'StayYears'),
      bVaivahik: g(b, 'maritalStatus') || g(b, 'MaritalStatus'), bAvalambun: g(b, 'dependents') || g(b, 'Dependents'),
      bCompany: g(b, 'company') || g(b, 'Company'), bCompanyPatta: g(b, 'companyAddress') || g(b, 'CompanyAddress'),
      bCompanyPin: g(b, 'companyPin') || g(b, 'CompanyPin'), bCompanyTel: g(b, 'companyTel') || g(b, 'CompanyTel'),
      bCompanyMobile: g(b, 'companyMobile') || g(b, 'CompanyMobile'), bCompanyEmail: g(b, 'companyEmail') || g(b, 'CompanyEmail'),
      bVibhag: g(b, 'department') || g(b, 'Department'), bHudda: g(b, 'designation') || g(b, 'Designation'),
      bEmpCode: g(b, 'employeeCode') || g(b, 'EmployeeCode'),
      bKarj_m: g(b, 'jobMonths') || g(b, 'JobMonths'), bKarj_v: g(b, 'jobYears') || g(b, 'JobYears'),
      bSeva: g(b, 'retirementDate') || g(b, 'RetirementDate'),
      bMonthlyVetan: g(b, 'monthlySalary') || g(b, 'MonthlySalary'), bKapat: g(b, 'deductions') || g(b, 'Deductions'),
      bNiwal: g(b, 'netSalary') || g(b, 'NetSalary'),
      bVaarshik: g(b, 'annualIncome') || g(b, 'AnnualIncome'), bKharcha: g(b, 'annualExpenses') || g(b, 'AnnualExpenses'),
      bNiwalVaarshik: g(b, 'netAnnualIncome') || g(b, 'NetAnnualIncome'),
      bKutumb: g(b, 'familyIncome') || g(b, 'FamilyIncome'), bKutumbType: g(b, 'familyIncomeType') || g(b, 'FamilyIncomeType'),
      bShetiNaav: g(b, 'landOwnerName') || g(b, 'LandOwnerName'), bShetiNaate: g(b, 'landOwnerRelation') || g(b, 'LandOwnerRelation'),
      bGaavPatta: g(b, 'village') || g(b, 'Village'), bGaavPost: g(b, 'post') || g(b, 'Post'),
      bGaavTaluka: g(b, 'taluka') || g(b, 'Taluka'), bGaavJilha: g(b, 'district') || g(b, 'District'),
      bGaavRajya: g(b, 'state') || g(b, 'State'), bGaavPin: g(b, 'villagePin') || g(b, 'VillagePin'),
      bGaavMobile: g(b, 'villageMobile') || g(b, 'VillageMobile'),

      // Previous loans (section 13) — parse from JSON string
      ...(() => {
        const prev = safeParse(g(b, 'PrevLoansJson') || g(b, 'prevLoansJson'));
        const f = prev[0] || {};
        return { bPurvKarjPrakar: f.type || f.t || '', bPurvKhate: f.account || f.a || '', bPurvRakkam: f.amount || f.r || '', bPurvDin1: f.d1 || '', bPurvDin2: f.d2 || '' };
      })(),

      // Guarantor loans (section 14) — parse from JSON string
      ...(() => {
        const gloans = safeParse(g(b, 'GuarantorLoansJson') || g(b, 'guarantorLoansJson'));
        const a = gloans[0] || {}, bx = gloans[1] || {};
        return {
          bJam94aKarjdarNaav: a.n || a.name || '', bJam94aPrakar: a.t || a.type || '', bJam94aKhate: a.a || a.account || '', bJam94aRakkam: a.r || a.amount || '', bJam94aDin1: a.d1 || '', bJam94aDin2: a.d2 || '',
          bJam94bKarjdarNaav: bx.n || bx.name || '', bJam94bPrakar: bx.t || bx.type || '', bJam94bKhate: bx.a || bx.account || '', bJam94bRakkam: bx.r || bx.amount || '', bJam94bDin1: bx.d1 || '', bJam94bDin2: bx.d2 || ''
        };
      })(),

      // Other bank loans (section 16) — parse from JSON string
      ...(() => {
        const obl = safeParse(g(b, 'OtherBankLoansJson') || g(b, 'otherBankLoansJson'));
        const f = obl[0] || {};
        return { bBank96Naav: f.n || '', bBank96Shakha: f.s || '', bBank96Prakar: f.t || '', bBank96Khate: f.a || '', bBank96Rakkam: f.r || '', bBank96Din1: f.d1 || '', bBank96Din2: f.d2 || '' };
      })(),

      // Collateral property fields from Property
      colHousingNaav: g(p, 'CollateralHousingNaav') || '', colFlatNo: g(p, 'CollateralFlatNo') || '', colManzala: g(p, 'CollateralFloor') || '', colWing: g(p, 'CollateralWing') || '',
      colPlotNo: g(p, 'CollateralPlotNo') || '', colNagarSector: g(p, 'CollateralNagarSector') || '', colRastyaNaav: g(p, 'CollateralRoadName') || '', colUpnagar: g(p, 'CollateralSuburb') || '',
      colJilha: g(p, 'CollateralDistrict') || '', colPinKod: g(p, 'CollateralPinCode') || '', colHousingRegi: g(p, 'CollateralHousingRegNo') || '',
      colSabasadNo: g(p, 'CollateralHousingMemberNo') || '', colSharesCert: g(p, 'CollateralShareCertNo') || '',
      colBhaagFrom: g(p, 'CollateralSharesFrom') || '', colBhaagTo: g(p, 'CollateralSharesTo') || '',
      colKshetrafal: g(p, 'CollateralArea') || '', colKshetraType: (g(p, 'CollateralAreaType') || '').split?.(',').filter(Boolean) || [],
      colPurvesi: g(p, 'CollateralBoundaryEast') || '', colPashchimesi: g(p, 'CollateralBoundaryWest') || '', colDakshinesi: g(p, 'CollateralBoundarySouth') || '', colUttaresi: g(p, 'CollateralBoundaryNorth') || '',
      colBandhamVarsh: g(p, 'CollateralBuildingYear') || '', colSurveNo: g(p, 'CollateralSurveyNo') || '', colHissaNo: g(p, 'CollateralHissaNo') || '', colGatNo: g(p, 'CollateralGatNo') || '', colMunicipalNo: g(p, 'CollateralMunicipalNo') || '',
      colOcMilale: g(p, 'CollateralOcReceived') || '', colOcDin: g(p, 'CollateralOcDate') || '', colDeedZale: g(p, 'CollateralConveyanceDeed') || '', colDeedDin: g(p, 'CollateralConveyanceDeedDate') || '',
      colShasaki: g(p, 'CollateralGovtValuation') || '', colBazarBhav: g(p, 'CollateralMarketValuation') || '', colTaranMahiti: g(p, 'CollateralRemarks') || '',

      // Fixed assets & current loans from Property JSON
      ...(() => {
        const faStr = g(p, 'FixedAssetsJson') || g(p, 'fixedAssetsJson');
        const clStr = g(p, 'CurrentLoansJson') || g(p, 'currentLoansJson');
        const fa = safeParse(faStr);
        const cl = safeParse(clStr);
        const result = { fixedAssetsJson: faStr, currentLoansJson: clStr };
        (fa || []).forEach((item, i) => { const idx = i + 1; result[`fixedAsset${idx}Naav`] = item.n || ''; result[`fixedAsset${idx}Rakkam`] = item.r || ''; result[`fixedAsset${idx}Bank`] = item.b || ''; result[`fixedAsset${idx}Remark`] = item.rem || ''; });
        (cl || []).forEach((item, i) => { const idx = i + 1; result[`loan${idx}Bank`] = item.b || ''; result[`loan${idx}Type`] = item.t || ''; result[`loan${idx}Limit`] = item.l || ''; result[`loan${idx}Balance`] = item.bal || ''; result[`loan${idx}Emi`] = item.e || ''; result[`loan${idx}Security`] = item.s || ''; });
        return result;
      })(),

      // Business extra fields
      busType: (g(bus, 'BusinessType') || g(bus, 'businessType') || '').split?.(',').filter(Boolean) || [],
      busJageType: (g(bus, 'BusinessPremisesType') || g(bus, 'businessPremisesType') || '').split?.(',').filter(Boolean) || [],
      busKshetrafal: g(bus, 'BusinessArea') || g(bus, 'businessArea') || '',
      busPan: g(bus, 'BusinessPan') || g(bus, 'businessPan') || '',
      busPin: g(bus, 'BusinessPin') || g(bus, 'businessPin') || '',
      busTel: g(bus, 'BusinessPhone') || g(bus, 'businessPhone') || '',
      busEmail: g(bus, 'BusinessEmail') || g(bus, 'businessEmail') || '',
      busGumasta: g(bus, 'GumastaNo') || g(bus, 'gumastaNo') || '',
      busVikrikar: g(bus, 'SalesTaxNo') || g(bus, 'salesTaxNo') || '',
      busVat: g(bus, 'VatNo') || g(bus, 'vatNo') || '',
      busServiceTax: g(bus, 'ServiceTaxNo') || g(bus, 'serviceTaxNo') || '',
      busParwane: g(bus, 'LicenseObtained') || g(bus, 'licenseObtained') || '',
      busNodani: g(bus, 'TaxRegistered') || g(bus, 'taxRegistered') || '',
      busSuruKelay: g(bus, 'BusinessStartDate') || g(bus, 'businessStartDate') || '',
      busAnubhav: g(bus, 'BusinessExperience') || g(bus, 'businessExperience') || '',
      busKharcha: g(bus, 'BusinessAnnualExpenses') || g(bus, 'businessAnnualExpenses') || '',
      ...(() => {
        const cust = safeParse(g(bus, 'CustomersJson') || g(bus, 'customersJson'));
        const supp = safeParse(g(bus, 'SuppliersJson') || g(bus, 'suppliersJson'));
        return {
          customer1Naav: cust[0]?.n1 || '', customer1Patta: cust[0]?.p1 || '', customer2Naav: cust[1]?.n2 || '', customer2Patta: cust[1]?.p2 || '',
          supplier1Naav: supp[0]?.n1 || '', supplier1Patta: supp[0]?.p1 || '', supplier2Naav: supp[1]?.n2 || '', supplier2Patta: supp[1]?.p2 || ''
        };
      })(),

      // Insurance extra fields
      vimaHaptaType: g(ins, 'InsurancePremiumType') || g(ins, 'insurancePremiumType') || '',
      vimKarjPatta: g(ins, 'PolicyLoanAddress') || g(ins, 'policyLoanAddress') || '',
      vimKarjDin: g(ins, 'PolicyLoanDate') || g(ins, 'policyLoanDate') || '',
      insuranceDetails: g(ins, 'InsuranceDetails') || g(ins, 'insuranceDetails') || '',
      otherDetails: g(ins, 'OtherDetails') || g(ins, 'otherDetails') || '',

      // Guarantor 1
      g1Photo: g(g1, 'photo') || g(g1, 'Photo'),
      g1Naav: g(g1, 'fullName') || g(g1, 'FullName'), g1Vay: g(g1, 'age') || g(g1, 'Age'),
      g1Sabasad: g(g1, 'memberNo') || g(g1, 'MemberNo'), g1Shares: g(g1, 'sharesCount') || g(g1, 'SharesCount'),
      g1SharesRakkam: g(g1, 'sharesAmount') || g(g1, 'SharesAmount'),
      g1VadilNaav: g(g1, 'fatherName') || g(g1, 'FatherName'), g1VadilVay: g(g1, 'fatherAge') || g(g1, 'FatherAge'),
      g1AaiNaav: g(g1, 'motherName') || g(g1, 'MotherName'), g1AaiVay: g(g1, 'motherAge') || g(g1, 'MotherAge'),
      g1Patta: g(g1, 'address') || g(g1, 'Address'), g1PinKod: g(g1, 'pinCode') || g(g1, 'PinCode'),
      g1Durdhvani: g(g1, 'phone') || g(g1, 'Phone'), g1Mobile: g(g1, 'mobile') || g(g1, 'Mobile'), g1Email: g(g1, 'email') || g(g1, 'Email'),
      g1Company: g(g1, 'company') || g(g1, 'Company'), g1CompanyPatta: g(g1, 'companyAddress') || g(g1, 'CompanyAddress'),
      g1Vibhag: g(g1, 'department') || g(g1, 'Department'), g1Hudda: g(g1, 'designation') || g(g1, 'Designation'),
      g1EmpCode: g(g1, 'employeeCode') || g(g1, 'EmployeeCode'),
      g1Karj_m: g(g1, 'jobMonths') || g(g1, 'JobMonths'), g1Karj_v: g(g1, 'jobYears') || g(g1, 'JobYears'),
      g1Seva: g(g1, 'retirementDate') || g(g1, 'RetirementDate'),
      g1MonthlyVetan: g(g1, 'monthlySalary') || g(g1, 'MonthlySalary'),
      g1Niwal: g(g1, 'netSalary') || g(g1, 'NetSalary'), g1Vaarshik: g(g1, 'annualIncome') || g(g1, 'AnnualIncome'),
      g1JageSwaarup: (g(g1, 'residenceType') || g(g1, 'ResidenceType') || '').split?.(',').filter(Boolean) || [],
      g1Kalavadhi_m: g(g1, 'stayMonths') || g(g1, 'StayMonths'), g1Kalavadhi_v: g(g1, 'stayYears') || g(g1, 'StayYears'),
      g1Vaivahik: g(g1, 'maritalStatus') || g(g1, 'MaritalStatus'), g1Avalambun: g(g1, 'dependents') || g(g1, 'Dependents'),
      g1ShetiNaav: g(g1, 'landOwnerName') || g(g1, 'LandOwnerName'), g1ShetiNaate: g(g1, 'landOwnerRelation') || g(g1, 'LandOwnerRelation'),
      g1GaavMukkam: g(g1, 'village') || g(g1, 'Village'), g1GaavPost: g(g1, 'post') || g(g1, 'Post'),
      g1GaavTaluka: g(g1, 'taluka') || g(g1, 'Taluka'), g1GaavJilha: g(g1, 'district') || g(g1, 'District'),
      g1GaavRajya: g(g1, 'state') || g(g1, 'State'), g1GaavPin: g(g1, 'villagePin') || g(g1, 'VillagePin'),
      g1GaavDurdhvani: g(g1, 'villageDurdhvani') || g(g1, 'VillageDurdhvani'),
      g1GaavMobile: g(g1, 'villageMobile') || g(g1, 'VillageMobile'),

      // Guarantor 1 Previous loans (section 13)
      ...(() => {
        const prev = safeParse(g(g1, 'PrevLoansJson') || g(g1, 'prevLoansJson'));
        const f = prev[0] || {};
        return { g1PurvKarjPrakar: f.type || f.t || '', g1PurvKhate: f.account || f.a || '', g1PurvRakkam: f.amount || f.r || '', g1PurvDin1: f.d1 || '', g1PurvDin2: f.d2 || '' };
      })(),

      // Guarantor 1 Guarantor loans (section 14)
      ...(() => {
        const gloans = safeParse(g(g1, 'GuarantorLoansJson') || g(g1, 'guarantorLoansJson'));
        const a = gloans[0] || {}, bx = gloans[1] || {};
        return {
          g1Jam94aKarjdarNaav: a.n || a.name || '', g1Jam94aPrakar: a.t || a.type || '', g1Jam94aKhate: a.a || a.account || '', g1Jam94aRakkam: a.r || a.amount || '', g1Jam94aDin1: a.d1 || '', g1Jam94aDin2: a.d2 || '',
          g1Jam94bKarjdarNaav: bx.n || bx.name || '', g1Jam94bPrakar: bx.t || bx.type || '', g1Jam94bKhate: bx.a || bx.account || '', g1Jam94bRakkam: bx.r || bx.amount || '', g1Jam94bDin1: bx.d1 || '', g1Jam94bDin2: bx.d2 || ''
        };
      })(),

      // Guarantor 1 Other bank loans (section 16)
      ...(() => {
        const obl = safeParse(g(g1, 'OtherBankLoansJson') || g(g1, 'otherBankLoansJson'));
        const f = obl[0] || {};
        return { g1Bank96Naav: f.n || '', g1Bank96Shakha: f.s || '', g1Bank96Prakar: f.t || '', g1Bank96Khate: f.a || '', g1Bank96Rakkam: f.r || '', g1Bank96Din1: f.d1 || '', g1Bank96Din2: f.d2 || '' };
      })(),

      // Guarantor 1 Family member loans (section 15)
      ...(() => {
        const kutumb = safeParse(g(g1, 'Kutumb95InfoJson') || g(g1, 'kutumb95InfoJson'));
        const f = kutumb[0] || {};
        return { g1Kutumb95Naav: f.n || '', g1Kutumb95Prakar: f.t || '', g1Kutumb95Khate: f.a || '', g1Kutumb95Rakkam: f.r || '', g1Kutumb95Din1: f.d1 || '', g1Kutumb95Din2: f.d2 || '' };
      })(),

      // Guarantor 2
      g2Photo: g(g2, 'photo') || g(g2, 'Photo'),
      g2Naav: g(g2, 'fullName') || g(g2, 'FullName'), g2Vay: g(g2, 'age') || g(g2, 'Age'),
      g2Sabasad: g(g2, 'memberNo') || g(g2, 'MemberNo'), g2Shares: g(g2, 'sharesCount') || g(g2, 'SharesCount'),
      g2SharesRakkam: g(g2, 'sharesAmount') || g(g2, 'SharesAmount'),
      g2VadilNaav: g(g2, 'fatherName') || g(g2, 'FatherName'), g2VadilVay: g(g2, 'fatherAge') || g(g2, 'FatherAge'),
      g2AaiNaav: g(g2, 'motherName') || g(g2, 'MotherName'), g2AaiVay: g(g2, 'motherAge') || g(g2, 'MotherAge'),
      g2Patta: g(g2, 'address') || g(g2, 'Address'), g2PinKod: g(g2, 'pinCode') || g(g2, 'PinCode'),
      g2Mobile: g(g2, 'mobile') || g(g2, 'Mobile'), g2Email: g(g2, 'email') || g(g2, 'Email'),
      g2Company: g(g2, 'company') || g(g2, 'Company'), g2CompanyPatta: g(g2, 'companyAddress') || g(g2, 'CompanyAddress'),
      g2Vibhag: g(g2, 'department') || g(g2, 'Department'), g2Hudda: g(g2, 'designation') || g(g2, 'Designation'),
      g2Karj_m: g(g2, 'jobMonths') || g(g2, 'JobMonths'), g2Karj_v: g(g2, 'jobYears') || g(g2, 'JobYears'),
      g2Seva: g(g2, 'retirementDate') || g(g2, 'RetirementDate'),
      g2MonthlyVetan: g(g2, 'monthlySalary') || g(g2, 'MonthlySalary'),
      g2Niwal: g(g2, 'netSalary') || g(g2, 'NetSalary'), g2Vaarshik: g(g2, 'annualIncome') || g(g2, 'AnnualIncome'),
      g2JageSwaarup: (g(g2, 'residenceType') || g(g2, 'ResidenceType') || '').split?.(',').filter(Boolean) || [],
      g2Kalavadhi_m: g(g2, 'stayMonths') || g(g2, 'StayMonths'), g2Kalavadhi_v: g(g2, 'stayYears') || g(g2, 'StayYears'),
      g2Vaivahik: g(g2, 'maritalStatus') || g(g2, 'MaritalStatus'), g2Avalambun: g(g2, 'dependents') || g(g2, 'Dependents'),
      g2ShetiNaav: g(g2, 'landOwnerName') || g(g2, 'LandOwnerName'), g2ShetiNaate: g(g2, 'landOwnerRelation') || g(g2, 'LandOwnerRelation'),
      g2GaavMukkam: g(g2, 'village') || g(g2, 'Village'), g2GaavPost: g(g2, 'post') || g(g2, 'Post'),
      g2GaavTaluka: g(g2, 'taluka') || g(g2, 'Taluka'), g2GaavJilha: g(g2, 'district') || g(g2, 'District'),
      g2GaavRajya: g(g2, 'state') || g(g2, 'State'), g2GaavPin: g(g2, 'villagePin') || g(g2, 'VillagePin'),
      g2GaavDurdhvani: g(g2, 'villageDurdhvani') || g(g2, 'VillageDurdhvani'),
      g2GaavMobile: g(g2, 'villageMobile') || g(g2, 'VillageMobile'),

      // Guarantor 2 Previous loans (section 13)
      ...(() => {
        const prev = safeParse(g(g2, 'PrevLoansJson') || g(g2, 'prevLoansJson'));
        const f = prev[0] || {};
        return { g2PurvKarjPrakar: f.type || f.t || '', g2PurvKhate: f.account || f.a || '', g2PurvRakkam: f.amount || f.r || '', g2PurvDin1: f.d1 || '', g2PurvDin2: f.d2 || '' };
      })(),

      // Guarantor 2 Guarantor loans (section 14)
      ...(() => {
        const gloans = safeParse(g(g2, 'GuarantorLoansJson') || g(g2, 'guarantorLoansJson'));
        const a = gloans[0] || {}, bx = gloans[1] || {};
        return {
          g2Jam94aKarjdarNaav: a.n || a.name || '', g2Jam94aPrakar: a.t || a.type || '', g2Jam94aKhate: a.a || a.account || '', g2Jam94aRakkam: a.r || a.amount || '', g2Jam94aDin1: a.d1 || '', g2Jam94aDin2: a.d2 || '',
          g2Jam94bKarjdarNaav: bx.n || bx.name || '', g2Jam94bPrakar: bx.t || bx.type || '', g2Jam94bKhate: bx.a || bx.account || '', g2Jam94bRakkam: bx.r || bx.amount || '', g2Jam94bDin1: bx.d1 || '', g2Jam94bDin2: bx.d2 || ''
        };
      })(),

      // Guarantor 2 Other bank loans (section 16)
      ...(() => {
        const obl = safeParse(g(g2, 'OtherBankLoansJson') || g(g2, 'otherBankLoansJson'));
        const f = obl[0] || {};
        return { g2Bank96Naav: f.n || '', g2Bank96Shakha: f.s || '', g2Bank96Prakar: f.t || '', g2Bank96Khate: f.a || '', g2Bank96Rakkam: f.r || '', g2Bank96Din1: f.d1 || '', g2Bank96Din2: f.d2 || '' };
      })(),

      // Guarantor 2 Family member loans (section 15)
      ...(() => {
        const kutumb = safeParse(g(g2, 'Kutumb95InfoJson') || g(g2, 'kutumb95InfoJson'));
        const f = kutumb[0] || {};
        return { g2Kutumb95Naav: f.n || '', g2Kutumb95Prakar: f.t || '', g2Kutumb95Khate: f.a || '', g2Kutumb95Rakkam: f.r || '', g2Kutumb95Din1: f.d1 || '', g2Kutumb95Din2: f.d2 || '' };
      })(),

      // Property
      propertyType: g(p, 'propertyType') || g(p, 'PropertyType') || 'resale',
      vikretaNaav: g(p, 'vendorName') || g(p, 'VendorName'),
      milkatPatta: g(p, 'propertyAddress') || g(p, 'PropertyAddress'),
      housingNaav: g(p, 'housingSocietyName') || g(p, 'HousingSocietyName'),
      flatNo: g(p, 'flatNo') || g(p, 'FlatNo'), manzala: g(p, 'floor') || g(p, 'Floor'),
      wing: g(p, 'wing') || g(p, 'Wing'), plotNo: g(p, 'plotNo') || g(p, 'PlotNo'),
      nagarSector: g(p, 'nagarSector') || g(p, 'NagarSector'),
      rastyaNaav: g(p, 'roadName') || g(p, 'RoadName'), upnagar: g(p, 'suburb') || g(p, 'Suburb'),
      jilha: g(p, 'district') || g(p, 'District'), pinKod: g(p, 'pinCode') || g(p, 'PinCode'),
      housingRegi: g(p, 'housingRegNo') || g(p, 'HousingRegNo'),
      sabasadNo: g(p, 'housingMemberNo') || g(p, 'HousingMemberNo'),
      sharesCert: g(p, 'shareCertNo') || g(p, 'ShareCertNo') || g(p, 'shareCertificateNo'),
      bhaagFrom: g(p, 'sharesFrom') || g(p, 'SharesFrom'), bhaagTo: g(p, 'sharesTo') || g(p, 'SharesTo'),
      kshetrafal: g(p, 'area') || g(p, 'Area'),
      kshetraType: (g(p, 'areaType') || g(p, 'AreaType') || '').split?.(',').filter(Boolean) || [],
      purvesi: g(p, 'boundaryEast') || g(p, 'BoundaryEast') || g(p, 'east'),
      pashchimesi: g(p, 'boundaryWest') || g(p, 'BoundaryWest') || g(p, 'west'),
      dakshinesi: g(p, 'boundarySouth') || g(p, 'BoundarySouth') || g(p, 'south'),
      uttaresi: g(p, 'boundaryNorth') || g(p, 'BoundaryNorth') || g(p, 'north'),
      bandhamVarsh: g(p, 'buildingYear') || g(p, 'BuildingYear') || g(p, 'constructionYear'),
      surveNo: g(p, 'surveyNo') || g(p, 'SurveyNo'), hissaNo: g(p, 'hissaNo') || g(p, 'HissaNo'),
      gatNo: g(p, 'gatNo') || g(p, 'GatNo'), municipalNo: g(p, 'municipalNo') || g(p, 'MunicipalNo') || g(p, 'wardNo'),
      ocMilale: g(p, 'ocReceived') || g(p, 'OcReceived') || g(p, 'hasOc'),
      ocDin: g(p, 'ocDate') || g(p, 'OcDate'),
      deedZale: g(p, 'conveyanceDeed') || g(p, 'ConveyanceDeed') || g(p, 'hasDeed'),
      deedDin: g(p, 'conveyanceDeedDate') || g(p, 'ConveyanceDeedDate') || g(p, 'deedDate'),
      ekunKharedi: g(p, 'totalPurchasePrice') || g(p, 'TotalPurchasePrice') || g(p, 'totalPrice'),
      dilelRakkam: g(p, 'amountPaid') || g(p, 'AmountPaid') || g(p, 'paidAmount'),
      deneBaki: g(p, 'balancePayable') || g(p, 'BalancePayable') || g(p, 'balanceAmount'),
      taranMahiti: g(p, 'mortgageDetails') || g(p, 'MortgageDetails') || g(p, 'mortgageInfo'),
      shasaki: g(p, 'govtValuation') || g(p, 'GovtValuation') || g(p, 'govValue'),
      bazarBhav: g(p, 'marketValuation') || g(p, 'MarketValuation') || g(p, 'marketValue'),
      firmNaav: g(p, 'builderFirmName') || g(p, 'BuilderFirmName'),
      tarnPatta: g(p, 'underConstrAddress') || g(p, 'UnderConstrAddress'),
      planManjur: g(p, 'buildingPlanApproved') || g(p, 'BuildingPlanApproved'),
      bandhamSwaarup: g(p, 'constructionNature') || g(p, 'ConstructionNature'),
      constKshetrafal: g(p, 'constArea') || g(p, 'ConstArea'),
      constKshetraType: (g(p, 'constAreaType') || g(p, 'ConstAreaType') || '').split?.(',').filter(Boolean) || [],
      constPurvesi: g(p, 'constBoundaryEast') || g(p, 'ConstBoundaryEast'),
      constPashchimesi: g(p, 'constBoundaryWest') || g(p, 'ConstBoundaryWest'),
      constDakshinesi: g(p, 'constBoundarySouth') || g(p, 'ConstBoundarySouth'),
      constUttaresi: g(p, 'constBoundaryNorth') || g(p, 'ConstBoundaryNorth'),
      constPlotNo: g(p, 'constPlotNo') || g(p, 'ConstPlotNo'),
      constSurveNo: g(p, 'constSurveyNo') || g(p, 'ConstSurveyNo'),
      constGatNo: g(p, 'constGatNo') || g(p, 'ConstGatNo'),
      constHissaNo: g(p, 'constHissaNo') || g(p, 'ConstHissaNo'),
      constMunicipalNo: g(p, 'constMunicipalNo') || g(p, 'ConstMunicipalNo'),
      agreementDin: g(p, 'agreementDate') || g(p, 'AgreementDate'),
      stampDuty: g(p, 'stampDuty') || g(p, 'StampDuty'),
      regRakkam: g(p, 'registrationAmount') || g(p, 'RegistrationAmount'),
      constEkunKharedi: g(p, 'constTotalPrice') || g(p, 'ConstTotalPrice'),
      constDilelRakkam: g(p, 'constAmountPaid') || g(p, 'ConstAmountPaid'),
      constDeneBaki: g(p, 'constBalancePayable') || g(p, 'ConstBalancePayable'),

      // Business
      busSwaarup: g(bus, 'businessNature') || g(bus, 'BusinessNature'),
      busFirmNaav: g(bus, 'businessFirmName') || g(bus, 'BusinessFirmName'),
      busPatta: g(bus, 'businessAddress') || g(bus, 'BusinessAddress'),
      busEkunUtpanna: g(bus, 'businessAnnualIncome') || g(bus, 'BusinessAnnualIncome'),
      busNiwal: g(bus, 'businessNetIncome') || g(bus, 'BusinessNetIncome'),

      // Insurance & Tax
      panNo: g(ins, 'panNo') || g(ins, 'PanNo'),
      vimaNaav: g(ins, 'insuranceCompany') || g(ins, 'InsuranceCompany'),
      vimaPatta: g(ins, 'insuranceAddress') || g(ins, 'InsuranceAddress'),
      vimaPolicy: g(ins, 'insurancePolicyNo') || g(ins, 'InsurancePolicyNo'),
      vimaFrom: g(ins, 'insuranceFrom') || g(ins, 'InsuranceFrom'),
      vimaTo: g(ins, 'insuranceTo') || g(ins, 'InsuranceTo'),
      vimaRakkam: g(ins, 'insuranceAmount') || g(ins, 'InsuranceAmount'),
      vimaHapta: g(ins, 'insurancePremium') || g(ins, 'InsurancePremium'),
      vimKarj: g(ins, 'policyLoan') || g(ins, 'PolicyLoan'),
      vimKarjBank: g(ins, 'policyLoanBank') || g(ins, 'PolicyLoanBank'),
      vimKarjRakkam: g(ins, 'policyLoanAmount') || g(ins, 'PolicyLoanAmount'),
      vimShillak: g(ins, 'policyLoanBalance') || g(ins, 'PolicyLoanBalance'),
      taxSuru: g(ins, 'incomeTaxSince') || g(ins, 'IncomeTaxSince'),
      taxRows: (() => { const v = g(ins, 'taxRowsJson') || g(ins, 'TaxRowsJson'); if (!v) return []; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return []; } })(),
      ptNo: g(ins, 'profTaxNo') || g(ins, 'ProfTaxNo'),
      ptSuru: g(ins, 'profTaxSince') || g(ins, 'ProfTaxSince'),
      ptRows: (() => { const v = g(ins, 'profTaxRowsJson') || g(ins, 'ProfTaxRowsJson'); if (!v) return []; if (typeof v === 'object') return v; try { return JSON.parse(v); } catch { return []; } })(),

      // Extra guarantors (G3+) for dynamic pages
      extraGuarantors: gs.length > 2 ? gs.slice(2) : []
    };
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfApplicant, setPdfApplicant] = useState("");
  const [pdfLoanType, setPdfLoanType] = useState('Home Loan');

  const handleDownloadPDF = async (loanId, applicantName, loanType, passedAppNo) => {
    setIsDownloading(loanId);
    setPdfApplicant(applicantName);
    setPdfLoanType(loanType);
    const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` };
    try {
      const type = (loanType || '').trim().toLowerCase();
      let endpoint = '';
      if (type === 'personal loan') endpoint = `/PersonalLoan/${loanId}`;
      else if (type === 'business loan') endpoint = `/business-loan/${loanId}`;
      else if (type === 'vehicle loan') endpoint = `/vehicle-loan/${loanId}`;
      else if (type === 'gold loan') endpoint = `/GoldLoan/${loanId}`;
      else endpoint = `/HomeLoan/${loanId}`;

      const resp = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

      if (resp.ok) {
        const fullData = await resp.json();
        if (!fullData.applicationNo && passedAppNo) fullData.applicationNo = passedAppNo;
        let mapped = fullData;
        if (type === 'personal loan') {
          if (typeof mapped.extraGuarantors === 'string') {
            try {
              mapped.extraGuarantors = JSON.parse(mapped.extraGuarantors);
            } catch {
              mapped.extraGuarantors = [];
            }
          }
        } else if (type === 'business loan') {
          mapped = unmapBusinessLoan(fullData);
        } else if (type === 'vehicle loan') {
          mapped = unmapVehicleLoan(fullData);
        } else if (type === 'gold loan') {
          mapped = fullData; // Gold loan uses direct mapping
        } else {
          mapped = unmapHomeLoan(fullData);
        }

        setPdfData(mapped);
        setIsGeneratingPdf(true);
        setTimeout(async () => {
          try {
            const element = document.getElementById('pdf-download-render');
            if (!element) throw new Error("Portal container missing");
            const opt = {
              margin: 0,
              filename: `${loanType.replace(' ', '_')}_Form_${applicantName.replace(/\\s+/g, '_')}.pdf`,
              image: { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, letterRendering: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
              pagebreak: { mode: ['css', 'legacy'] }
            };
            await html2pdf().from(element).set(opt).save();
            showToast('PDF Downloaded Successfully', 'success');
          } catch (err) {
            console.error("PDF Inner Error:", err);
            showToast('Error generating PDF content', 'error');
          } finally {
            setPdfData(null);
            setIsDownloading(null);
            setIsGeneratingPdf(false);
          }
        }, 3000);
      } else {
        throw new Error("Failed to fetch loan details");
      }
    } catch (err) {
      console.error("PDF Download Error:", err);
      showToast('Error generating PDF', 'error');
      setIsDownloading(null);
      setPdfData(null);
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = async (loanId, applicantName, loanType, passedAppNo) => {
    setIsPrinting(loanId);
    setPdfApplicant(applicantName);
    setPdfLoanType(loanType);
    const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` };
    try {
      const type = (loanType || '').trim().toLowerCase();
      let endpoint = '';
      if (type === 'personal loan') endpoint = `/PersonalLoan/${loanId}`;
      else if (type === 'business loan') endpoint = `/business-loan/${loanId}`;
      else if (type === 'vehicle loan') endpoint = `/vehicle-loan/${loanId}`;
      else if (type === 'gold loan') endpoint = `/GoldLoan/${loanId}`;
      else endpoint = `/HomeLoan/${loanId}`;

      const resp = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

      if (resp.ok) {
        const fullData = await resp.json();
        if (!fullData.applicationNo && passedAppNo) fullData.applicationNo = passedAppNo;
        let mapped = fullData;
        if (type === 'personal loan') {
          if (typeof mapped.extraGuarantors === 'string') {
            try {
              mapped.extraGuarantors = JSON.parse(mapped.extraGuarantors);
            } catch {
              mapped.extraGuarantors = [];
            }
          }
        } else if (type === 'business loan') {
          mapped = unmapBusinessLoan(fullData);
        } else if (type === 'vehicle loan') {
          mapped = unmapVehicleLoan(fullData);
        } else if (type === 'gold loan') {
          mapped = fullData;
        } else {
          mapped = unmapHomeLoan(fullData);
        }

        setPdfData(mapped);
        setIsGeneratingPdf(true); // Still use the overlay to render
        setTimeout(async () => {
          try {
            window.print();
          } catch (err) {
            console.error("Print Error:", err);
            showToast('Error opening print dialog', 'error');
          } finally {
            setPdfData(null);
            setIsPrinting(null);
            setIsGeneratingPdf(false);
          }
        }, 1500);
      } else {
        throw new Error("Failed to fetch loan details");
      }
    } catch (err) {
      console.error("Print Request Error:", err);
      showToast('Error preparing print view', 'error');
      setIsPrinting(null);
      setPdfData(null);
      setIsGeneratingPdf(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return aadhaarHistory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.aadhaarNo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [aadhaarHistory, searchTerm]);

  const totalPagesLoans = Math.ceil(filteredLoans.length / pageSize);
  const displayLoans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLoans.slice(start, start + pageSize);
  }, [filteredLoans, currentPage]);

  const totalPages = activeTab === 'registry' ? Math.ceil(filteredHistory.length / pageSize) : totalPagesLoans;
  const displayHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage]);

  const handleExportCSV = () => {
    if (aadhaarHistory.length === 0) return;
    const headers = ['Name', 'Aadhaar No', 'DOB', 'Gender', 'Verified At'];
    const rows = aadhaarHistory.map(h => [h.name, h.aadhaarNo, h.dob, h.gender, new Date(h.verifiedAt).toLocaleString()]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Verified_Aadhaar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportLoansCSV = () => {
    if (submittedLoans.length === 0) return;
    const headers = ['Applicant', 'Application No', 'Loan Type', 'Amount', 'Date', 'Status'];
    const rows = submittedLoans.map(l => [
      l.applicantName,
      l.applicationNo,
      l.loanType,
      l.loanAmount,
      l.dateStr,
      l.status
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Loan_Applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const personalCount = submittedLoans.filter(l => l.loanType === 'Personal Loan').length;
  const homeCount = submittedLoans.filter(l => l.loanType === 'Home Loan').length;
  const otherCount = submittedLoans.filter(l => ['Business Loan', 'Vehicle Loan', 'Gold Loan'].includes(l.loanType)).length;

  const stats = [
    { label: 'Total Applications', value: submittedLoans.length.toString(), icon: <LayoutGrid size={24} />, color: '#eff6ff', textColor: '#2563eb' },
    { label: 'Personal Loans', value: personalCount.toString(), icon: <User size={24} />, color: '#f0fdf4', textColor: '#166534' },
    { label: 'Home Loans', value: homeCount.toString(), icon: <Home size={24} />, color: '#eef2ff', textColor: '#4f46e5' },
    { label: 'Business & Others', value: otherCount.toString(), icon: <Briefcase size={24} />, color: '#fffbeb', textColor: '#b45309' },
  ];

  return (
    <div className="loans-module">
      <header className="loans-header">
        <div className="header-titles">
          <h1 className="header-title"><ClipboardList size={28} style={{ color: '#2563eb' }} /> Loans Module</h1>
          <p className="header-subtitle">Manage loan applications, verified identities, and disbursements</p>
        </div>
        <div className="header-actions">
          <button className="loans-btn loans-btn-primary" onClick={() => { setSelectedUser(null); setShowLoanModal(true); }}>
            <Plus size={14} /> New Application
          </button>
          <button className="loans-btn" onClick={handleExportLoansCSV}>
            <Download size={14} /> Export Applications
          </button>
          <button className="loans-btn loans-btn-dark" onClick={() => { fetchData(); fetchLoans(); }} disabled={isLoading || isLoadingLoans}>
            <RotateCw size={16} className={isLoading || isLoadingLoans ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((s, idx) => (
          <div key={idx} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: s.color, color: s.textColor }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs removed as requested */}

      <div className="loans-section">
        <div className="section-header">
          <h2 className="section-title">Submitted Loan Applications</h2>
          <div className="section-actions">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-fixed" />
              <input
                type="text"
                placeholder="Search by name, type, or App No..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            {activeTab === 'applications' && (
              <>
                <input
                  type="date"
                  className="dm-filter-select"
                  value={loanFilterDate}
                  onChange={e => { setLoanFilterDate(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none' }}
                />
                <select
                  className="dm-filter-select"
                  value={loanFilterType}
                  onChange={e => { setLoanFilterType(e.target.value); setCurrentPage(1); }}
                  style={{ padding: '0.5rem 2rem 0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.875rem', outline: 'none', minWidth: '150px', cursor: 'pointer' }}
                >
                  <option value="All">All Loan Types</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Vehicle Loan">Vehicle Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Gold Loan">Gold Loan</option>
                </select>
              </>
            )}
          </div>
        </div>

        <div className="clean-table-container">
          <table className="clean-table">
            <thead>
              {activeTab === 'registry' ? (
                <tr>
                  <th style={{ width: '25%' }}>Name</th>
                  <th style={{ width: '20%' }}>Aadhaar Number</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>DOB</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Gender</th>
                  <th style={{ width: '18%' }}>Verified At</th>
                  <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
                </tr>
              ) : (
                <tr>
                  <th>Applicant</th>
                  <th>Application No.</th>
                  <th>Loan Type</th>
                  <th>Submission Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              )}
            </thead>
            <tbody>
              {displayLoans.length > 0 ? (
                displayLoans.map((loan, i) => (
                  <tr key={`app-${loan.applicationNo || loan.id}-${i}`}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar-circle" style={{ background: `hsl(${(i * 193) % 360}, 65%, 45%)` }}>
                          {(loan.applicantName || 'U').charAt(0)}
                        </div>
                        {loan.applicantName}
                      </div>
                    </td>
                    <td className="aadhaar-text" style={{ fontWeight: 700, fontSize: '1.01rem' }}>
                      {loan.applicationNo || '-'}
                    </td>
                    <td>
                      <span className={`loan-badge ${loan.loanType === 'Home Loan' ? 'loan-badge-home' :
                          loan.loanType === 'Vehicle Loan' ? 'loan-badge-vehicle' :
                            loan.loanType === 'Business Loan' ? 'loan-badge-business' :
                              loan.loanType === 'Gold Loan' ? 'loan-badge-gold' :
                                'loan-badge-personal'
                        }`}>
                        {loan.loanType}
                      </span>
                    </td>
                    <td>{loan.dateStr}</td>
                    <td className="amount-text" style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹ {loan.loanAmount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-pill status-${loan.status?.toLowerCase() === 'approved' ? 'approved' :
                        loan.status?.toLowerCase() === 'draft' ? 'rejected' : 'sending'}`}>
                        {loan.status || 'Submitted'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div className="row-actions" style={{ justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="print-action-btn"
                          onClick={() => {
                            if (loan.loanType === 'Gold Loan') {
                              navigate('/gold-loan-print', { state: { id: loan.id } });
                            } else {
                              handlePrint(loan.id, loan.applicantName, loan.loanType, loan.applicationNo);
                            }
                          }}
                          disabled={isPrinting === loan.id}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: '6px', color: '#475569', fontSize: '0.8125rem',
                            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          {isPrinting === loan.id ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                          Print
                        </button>
                        <button
                          className="download-btn"
                          onClick={() => handleDownloadPDF(loan.id, loan.applicantName, loan.loanType, loan.applicationNo)}
                          disabled={isDownloading === loan.id}
                        >
                          {isDownloading === loan.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                          <span style={{ whiteSpace: 'nowrap' }}>Download PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <ClipboardList size={48} className="empty-icon" />
                    {isLoadingLoans ? 'Loading applications...' : 'No submitted applications found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="clean-pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, activeTab === 'registry' ? filteredHistory.length : filteredLoans.length)} of {activeTab === 'registry' ? filteredHistory.length : filteredLoans.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button className="page-arrow" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
                <ChevronLeft size={16} />
              </button>
              {(() => {
                const delta = 1;
                const range = [];
                for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                  range.push(i);
                }
                if (currentPage - delta > 2) range.unshift("...");
                range.unshift(1);
                if (currentPage + delta < totalPages - 1) range.push("...");
                if (totalPages > 1) range.push(totalPages);

                return range.map((p, i) => (
                  <button
                    key={i}
                    className={`page-dot ${currentPage === p ? 'active' : ''} ${p === '...' ? 'dots' : ''}`}
                    onClick={() => typeof p === 'number' && setCurrentPage(p)}
                    disabled={p === '...'}
                  >
                    {p}
                  </button>
                ));
              })()}
              <button className="page-arrow" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isGeneratingPdf && (
        <div style={isPrinting ? { position: 'absolute', top: 0, left: 0, width: '100%', background: 'white', zIndex: 9999, overflow: 'visible' } : { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'white', zIndex: 9999, overflowY: 'auto', padding: '20px 0' }}>
          {!isPrinting && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <Loader2 size={48} className="animate-spin" style={{ color: '#0a1c5a' }} />
              <div style={{ color: '#0a1c5a', fontWeight: 600, fontSize: '1.2rem' }}>Generating Professional PDF...</div>
              <div style={{ color: '#666' }}>{pdfApplicant} - {pdfLoanType} Application Form</div>
            </div>
          )}
          <div id="pdf-download-render" style={{ margin: '0 auto', width: '210mm', background: 'white' }}>
            {(() => {
              const type = (pdfLoanType || '').trim().toLowerCase();
              if (type === 'personal loan') return <PersonalLoanPrint data={pdfData} clientInfo={clientInfo} />;
              if (type === 'business loan') return <BusinessLoanPrint data={pdfData} clientInfo={clientInfo} lang="mr" />;
              if (type === 'vehicle loan') return <VehicleLoanPrint data={pdfData} clientInfo={clientInfo} lang="mr" />;
              if (type === 'gold loan') return <GoldLoanPrint data={pdfData} />;
              return <HomeLoanPrint data={pdfData} clientInfo={clientInfo} lang="mr" />;
            })()}
          </div>
        </div>
      )}

      <LoanSelectionModal isOpen={showLoanModal} onClose={() => { setShowLoanModal(false); setSelectedUser(null); }} selectedUser={selectedUser} />
    </div>
  );
}