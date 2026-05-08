import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import API_BASE_URL from '../../config';
import GoldLoanPrintMaster from '../GoldLoanForm/GoldLoanPrintMaster'; 
import BusinessLoanPrint from './BusinessLoanPrint';

export default function BusinessLoanPrintPage() {
  const { state } = useLocation();
  const { clientInfo, showToast } = useApp();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

      ...mapPerson(b, "b"),
      ...mapPerson(g1Obj, "g1"),
      ...mapPerson(g2Obj, "g2"),

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

      insDurFrom_d: isoDate(g(ins, "insuranceFrom")),
      insDurTo_d: isoDate(g(ins, "insuranceTo")),
      insLoanDate_d: isoDate(g(ins, "policyLoanDate")),

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
      
      colInsDurFrom_d: isoDate(g(col, "insuranceFrom")),
      colInsDurTo_d: isoDate(g(col, "insuranceTo")),

      extraGuarantors: egs.map(e => ({
        id: e.frontendId || e.id,
        name: e.fullName,
        age: e.age
      }))
    };

    egs.forEach(e => {
      const id = e.frontendId || e.id;
      const prefix = `eg_${id}_`;
      const personData = mapPerson(e, prefix);
      Object.assign(data, personData);
    });

    return data;
  };

  useEffect(() => {
    if (state?.id) {
       fetch(`${API_BASE_URL}/business-loan/${state.id}`, {
         headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
       })
       .then(res => {
         if (!res.ok) throw new Error('Failed to fetch business loan application data');
         return res.json();
       })
       .then(fetched => {
           const mapped = unmapBusinessLoan(fetched);
           setData(mapped);
           setIsLoading(false);
       })
       .catch(err => {
           console.error(err);
           showToast("Error loading document", "error");
           setIsLoading(false);
       });
    } else {
        setIsLoading(false);
    }
  }, [state, showToast]);

  if (isLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#64748b' }}>
              Loading document data...
          </div>
      );
  }

  if (!data) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#ef4444' }}>
              Document not found or invalid ID.
          </div>
      );
  }

  return (
     <div style={{ background: '#f1f5f9', minHeight: '100vh', padding: '24px' }}>
       <GoldLoanPrintMaster title="Business Loan Application">
         <div className="print-wrapper shadow-lg printable-document-container" style={{ background: 'white', maxWidth: '210mm', margin: '0 auto' }}>
            <BusinessLoanPrint data={data} clientInfo={clientInfo} />
         </div>
       </GoldLoanPrintMaster>
     </div>
  );
}
