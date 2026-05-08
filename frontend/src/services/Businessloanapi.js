// src/services/businessLoanApi.js
// ─────────────────────────────────────────────────────────────────────────────
// All API calls for the Business Loan form.
// Import and use these in Businessloanform.jsx on "Save & Next" and "Submit".
// ─────────────────────────────────────────────────────────────────────────────

import api from './api';  // your existing axios instance with auth headers

const BASE = '/api/business-loan';

// ── Helper: map React flat state → PersonInfoDto ─────────────────────────────
function mapPersonFields(data, prefix) {
  const p = (field) => data[`${prefix}${field}`];
  return {
    photoBase64:          p('Photo'),
    fullName:             p('Naav'),
    age:                  p('Vay') ? parseInt(p('Vay')) : null,
    memberNo:             p('SabasadNo'),
    sharesCount:          p('Shares') ? parseInt(p('Shares')) : null,
    sharesAmount:         p('SharesRakkam') ? parseFloat(p('SharesRakkam')) : null,
    fatherHusbandName:    p('VadilNaav'),
    fatherHusbandAge:     p('VadilVay') ? parseInt(p('VadilVay')) : null,
    motherName:           p('AaiNaav'),
    motherAge:            p('AaiVay') ? parseInt(p('AaiVay')) : null,
    residentialAddress:   p('Patta'),
    pinCode:              p('PinKod'),
    telephone:            p('Durdhvani'),
    mobile:               p('Mobile'),
    email:                p('Email'),
    propertyTypes:        p('JageSwaarup') || [],
    residenceMonths:      p('Kalavadhi_m') ? parseInt(p('Kalavadhi_m')) : null,
    residenceYears:       p('Kalavadhi_v') ? parseInt(p('Kalavadhi_v')) : null,
    maritalStatus:        p('Vaivahik'),
    dependents:           p('Avalambun') ? parseInt(p('Avalambun')) : null,
    officeAddress:        prefix === 'b' ? p('OfficeAddress') : null,
    gavchaAddress:        prefix === 'b' ? p('GavchaAddress') : null,
    companyName:          p('Company'),
    companyAddress:       p('CompanyPatta'),
    companyPinCode:       p('CompanyPin'),
    companyTelephone:     p('CompanyTel'),
    companyMobile:        p('CompanyMobile'),
    companyEmail:         p('CompanyEmail'),
    department:           p('Vibhag'),
    designation:          p('Hudda'),
    employeeCode:         p('EmpCode'),
    employmentMonths:     p('Karj_m') ? parseInt(p('Karj_m')) : null,
    employmentYears:      p('Karj_v') ? parseInt(p('Karj_v')) : null,
    retirementDate:       p('Seva') || null,
    monthlySalary:        p('MonthlyVetan') ? parseFloat(p('MonthlyVetan')) : null,
    deductions:           p('Kapat') ? parseFloat(p('Kapat')) : null,
    netSalary:            p('Niwal') ? parseFloat(p('Niwal')) : null,
    annualBusinessIncome: p('Vaarshik') ? parseFloat(p('Vaarshik')) : null,
    totalExpenses:        p('Kharcha') ? parseFloat(p('Kharcha')) : null,
    netAnnualIncome:      p('NiwalVaarshik') ? parseFloat(p('NiwalVaarshik')) : null,
    familyIncome:         p('Kutumb') ? parseFloat(p('Kutumb')) : null,
    familyIncomeType:     p('KutumbType'),
    propertyOwnerName:    p('ShetiNaav'),
    propertyOwnerRelation:p('ShetiNaate'),
    villageMukkam:        p('GaavMukkam'),
    villagePost:          p('GaavPost'),
    villageTaluka:        p('GaavTaluka'),
    villageDistrict:      p('GaavJilha'),
    villageState:         p('GaavRajya'),
    villagePinCode:       p('GaavPin'),
    villageTelephone:     p('GaavDurdhvani'),
    villageMobile:        p('GaavMobile'),
    prevLoanType:         p('PurvKarjPrakar'),
    prevLoanAccountNo:    p('PurvKhate'),
    prevLoanAmount:       p('PurvRakkam') ? parseFloat(p('PurvRakkam')) : null,
    prevLoanTakenDate:    p('PurvDin1') || null,
    prevLoanRepaidDate:   p('PurvDin2') || null,
    guar94aBorrowerName:  p('Jam94aKarjdarNaav'),
    guar94aLoanType:      p('Jam94aPrakar'),
    guar94aAccountNo:     p('Jam94aKhate'),
    guar94aAmount:        p('Jam94aRakkam') ? parseFloat(p('Jam94aRakkam')) : null,
    guar94aTakenDate:     p('Jam94aDin1') || null,
    guar94aRepaidDate:    p('Jam94aDin2') || null,
    guar94bBorrowerName:  p('Jam94bKarjdarNaav'),
    guar94bLoanType:      p('Jam94bPrakar'),
    guar94bAccountNo:     p('Jam94bKhate'),
    guar94bAmount:        p('Jam94bRakkam') ? parseFloat(p('Jam94bRakkam')) : null,
    guar94bTakenDate:     p('Jam94bDin1') || null,
    guar94bRepaidDate:    p('Jam94bDin2') || null,
    familyLoanMemberName: p('Kutumb95Naav'),
    familyLoanType:       p('Kutumb95Prakar'),
    familyLoanAccountNo:  p('Kutumb95Khate'),
    familyLoanAmount:     p('Kutumb95Rakkam') ? parseFloat(p('Kutumb95Rakkam')) : null,
    familyLoanTakenDate:  p('Kutumb95Din1') || null,
    familyLoanRepaidDate: p('Kutumb95Din2') || null,
    otherBankName:        p('Bank96Naav'),
    otherBankBranch:      p('Bank96Shakha'),
    otherBankLoanType:    p('Bank96Prakar'),
    otherBankAccountNo:   p('Bank96Khate'),
    otherBankLoanAmount:  p('Bank96Rakkam') ? parseFloat(p('Bank96Rakkam')) : null,
    otherBankLoanTakenDate:  p('Bank96Din1') || null,
    otherBankLoanRepaidDate: p('Bank96Din2') || null,
    placeOfSign:          p('Thikan'),
    dateOfSign:           p('Dinank') || null,
  };
}

// ── Helper: map extra guarantor flat state ────────────────────────────────────
function mapExtraGuarantor(data, g, idx) {
  const prefix = `eg_${g.id}_`;
  return {
    ...mapPersonFields(data, prefix),
    frontendId: String(g.id),
    guarantorNumber: idx + 3,
  };
}

// ════════════════════════════════════════════════════════════════════════════
//  STEP APIs
// ════════════════════════════════════════════════════════════════════════════

/**
 * Save Step 1 (Basic Info). Creates the application. Returns { id, status, message }.
 * Call on first "Save & Next" — stores the returned id in React state.
 */
export async function saveStep1(data) {
  const extraGuarantors = (data.extraGuarantors || []).map((g, idx) => ({
    frontendId: String(g.id),
    name:       data[`eg_${g.id}_Naav_s1`] || data[`eg_${g.id}_Naav`] || '',
    age:        data[`eg_${g.id}_Vay_s1`] || data[`eg_${g.id}_Vay`] ? parseInt(data[`eg_${g.id}_Vay_s1`] || data[`eg_${g.id}_Vay`]) : null,
    guarantorNumber: idx + 3,
  }));

  const payload = {
    applicationDate:            data.dinank || null,
    memberNo:                   data.saCra,
    loanAccountNo:              data.karjKhate,
    branch:                     data.shakha,
    applicantName:              data.arjdarNaav,
    applicantAge:               data.arjdarVay ? parseInt(data.arjdarVay) : null,
    loanAmount:                 data.karjRakkam ? parseFloat(data.karjRakkam) : null,
    loanAmountInWords:          data.akshari,
    repaymentMonths:            data.paratfedKalavadhi ? parseInt(data.paratfedKalavadhi) : null,
    firstInstallmentAfterMonths:data.pahilaHapta ? parseInt(data.pahilaHapta) : null,
    installmentDate:            data.tarikh ? parseInt(data.tarikh) : null,
    purpose:                    data.karan,
    maritalStatus:              data.vaivahik,
    dependents:                 data.avalambun ? parseInt(data.avalambun) : null,
    guarantor1Name:             data.jameen1Naav,
    guarantor1Age:              data.jameen1Vay ? parseInt(data.jameen1Vay) : null,
    guarantor2Name:             data.jameen2Naav,
    guarantor2Age:              data.jameen2Vay ? parseInt(data.jameen2Vay) : null,
    guarantor3Name:             data.jameen3Naav,
    guarantor3Age:              data.jameen3Vay ? parseInt(data.jameen3Vay) : null,
    extraGuarantors,
  };

  const res = await api.post(`${BASE}/step1`, payload);
  return res.data;  // { id, status, message }
}

/**
 * Update Step 1 for an existing application.
 */
export async function updateStep1(applicationId, data) {
  const extraGuarantors = (data.extraGuarantors || []).map((g, idx) => ({
    frontendId: String(g.id),
    name:       data[`eg_${g.id}_Naav_s1`] || data[`eg_${g.id}_Naav`] || '',
    age:        data[`eg_${g.id}_Vay_s1`] || data[`eg_${g.id}_Vay`] ? parseInt(data[`eg_${g.id}_Vay_s1`] || data[`eg_${g.id}_Vay`]) : null,
    guarantorNumber: idx + 3,
  }));

  const payload = {
    applicationDate:            data.dinank || null,
    memberNo:                   data.saCra,
    loanAccountNo:              data.karjKhate,
    branch:                     data.shakha,
    applicantName:              data.arjdarNaav,
    applicantAge:               data.arjdarVay ? parseInt(data.arjdarVay) : null,
    loanAmount:                 data.karjRakkam ? parseFloat(data.karjRakkam) : null,
    loanAmountInWords:          data.akshari,
    repaymentMonths:            data.paratfedKalavadhi ? parseInt(data.paratfedKalavadhi) : null,
    firstInstallmentAfterMonths:data.pahilaHapta ? parseInt(data.pahilaHapta) : null,
    installmentDate:            data.tarikh ? parseInt(data.tarikh) : null,
    purpose:                    data.karan,
    maritalStatus:              data.vaivahik,
    dependents:                 data.avalambun ? parseInt(data.avalambun) : null,
    guarantor1Name:             data.jameen1Naav,
    guarantor1Age:              data.jameen1Vay ? parseInt(data.jameen1Vay) : null,
    guarantor2Name:             data.jameen2Naav,
    guarantor2Age:              data.jameen2Vay ? parseInt(data.jameen2Vay) : null,
    guarantor3Name:             data.jameen3Naav,
    guarantor3Age:              data.jameen3Vay ? parseInt(data.jameen3Vay) : null,
    extraGuarantors,
  };

  const res = await api.put(`${BASE}/step1/${applicationId}`, payload);
  return res.data;
}

/** Save Step 2 — Borrower */
export async function saveStep2(applicationId, data) {
  const payload = mapPersonFields(data, 'b');
  const res = await api.put(`${BASE}/step2/${applicationId}`, payload);
  return res.data;
}

/** Save Step 3 — Guarantor 1 */
export async function saveStep3(applicationId, data) {
  const payload = mapPersonFields(data, 'g1');
  const res = await api.put(`${BASE}/step3/${applicationId}`, payload);
  return res.data;
}

/** Save Step 4 — Guarantor 2 */
export async function saveStep4(applicationId, data) {
  const payload = mapPersonFields(data, 'g2');
  const res = await api.put(`${BASE}/step4/${applicationId}`, payload);
  return res.data;
}

/**
 * Save an extra guarantor's full details.
 * Call for each extra guarantor step.
 * @param {number} applicationId
 * @param {object} data — full form state
 * @param {object} g — guarantor object { id }
 * @param {number} idx — index in extraGuarantors array (0-based)
 */
export async function saveExtraGuarantor(applicationId, data, g, idx) {
  const payload = mapExtraGuarantor(data, g, idx);
  const frontendId = String(g.id);
  const res = await api.put(`${BASE}/step-extra-guarantor/${applicationId}/${frontendId}`, payload);
  return res.data;
}

/** Save Step 5 — Business Info */
export async function saveStep5(applicationId, data) {
  const payload = {
    businessNature:           data.bizNature,
    businessType:             data.bizType,
    businessPropertyType:     data.bizJagaType,
    floorArea:                data.bizArea ? parseFloat(data.bizArea) : null,
    firmName:                 data.bizFirmName,
    address:                  data.bizAddress,
    address2:                 data.bizAddress2,
    pinCode:                  data.bizPin,
    phone:                    data.bizTel,
    email:                    data.bizEmail,
    panCardNo:                data.bizPan,
    gumastaLicenseNo:         data.bizGumasta,
    salesTaxNo:               data.bizSalesTax,
    vatNo:                    data.bizVat,
    serviceTaxNo:             data.bizServiceTax,
    otherLicense:             data.bizOtherLicense,
    allLicensesAvailable:     data.bizLicenseYes === true || data.bizLicenseYes === 'true' ? true : (data.bizLicenseYes === false || data.bizLicenseYes === 'false' ? false : null),
    isSmallIndustryResident:  data.bizResidentYes === true || data.bizResidentYes === 'true' ? true : (data.bizResidentYes === false || data.bizResidentYes === 'false' ? false : null),
    sinceWhen:                data.bizSince,
    experience:               data.bizExperience,
    totalAnnualIncome:        data.bizAnnualIncome ? parseFloat(data.bizAnnualIncome) : null,
    totalAnnualExpenses:      data.bizAnnualExpense ? parseFloat(data.bizAnnualExpense) : null,
    netAnnualIncome:          data.bizNetIncome ? parseFloat(data.bizNetIncome) : null,
    customer1Name:            data.bizCust1Naav,
    customer1Address:         data.bizCust1Patta,
    customer2Name:            data.bizCust2Naav,
    customer2Address:         data.bizCust2Patta,
    supplier1Name:            data.bizSupp1Naav,
    supplier1Address:         data.bizSupp1Patta,
    supplier2Name:            data.bizSupp2Naav,
    supplier2Address:         data.bizSupp2Patta,
    extra1:                   data.bizExtra1,
    extra2:                   data.bizExtra2,
    extra3:                   data.bizExtra3,
    extra4:                   data.bizExtra4,
  };
  const res = await api.put(`${BASE}/step5/${applicationId}`, payload);
  return res.data;
}

/** Save Step 6 — Insurance & Tax */
export async function saveStep6(applicationId, data) {
  const payload = {
    insuranceCompanyName:     data.insCompany,
    insuranceAddress:         data.insAddress,
    insurancePolicyNo:        data.insPolicy,
    insuranceFrom:            data.insDurFrom_d || null,
    insuranceTo:              data.insDurTo_d || null,
    insuranceAmount:          data.insAmount ? parseFloat(data.insAmount) : null,
    insurancePremium:         data.insPremium ? parseFloat(data.insPremium) : null,
    insurancePremiumFrequency:data.insPremiumType,
    hasPolicyLoan:            data.insLoanYes === true || data.insLoanYes === 'true' ? true : (data.insLoanYes === false || data.insLoanYes === 'false' ? false : null),
    policyLoanBankName:       data.insLoanBank,
    policyLoanBankAddress:    data.insLoanAddress,
    policyLoanAmount:         data.insLoanAmount ? parseFloat(data.insLoanAmount) : null,
    policyLoanDate:           data.insLoanDate_d || null,
    policyLoanBalance:        data.insLoanBalance ? parseFloat(data.insLoanBalance) : null,
    panCardNo:                data.itPan,
    incomeTaxSince:           data.itSince,
    itYear1From:              data.itYear1From, itYear1To: data.itYear1To,
    itAmount1:                data.itAmount1 ? parseFloat(data.itAmount1) : null,
    itDate1:                  data.itDate1 || null,
    itYear2From:              data.itYear2From, itYear2To: data.itYear2To,
    itAmount2:                data.itAmount2 ? parseFloat(data.itAmount2) : null,
    itDate2:                  data.itDate2 || null,
    itYear3From:              data.itYear3From, itYear3To: data.itYear3To,
    itAmount3:                data.itAmount3 ? parseFloat(data.itAmount3) : null,
    itDate3:                  data.itDate3 || null,
    proTaxNo:                 data.ptNo,
    proTaxSince:              data.ptSince,
    ptYear1From:              data.ptYear1From, ptYear1To: data.ptYear1To,
    ptAmount1:                data.ptAmount1 ? parseFloat(data.ptAmount1) : null,
    ptDate1:                  data.ptDate1 || null,
    ptYear2From:              data.ptYear2From, ptYear2To: data.ptYear2To,
    ptAmount2:                data.ptAmount2 ? parseFloat(data.ptAmount2) : null,
    ptDate2:                  data.ptDate2 || null,
    ptYear3From:              data.ptYear3From, ptYear3To: data.ptYear3To,
    ptAmount3:                data.ptAmount3 ? parseFloat(data.ptAmount3) : null,
    ptDate3:                  data.ptDate3 || null,
  };
  const res = await api.put(`${BASE}/step6/${applicationId}`, payload);
  return res.data;
}

/** Save Step 7 — Collateral */
export async function saveStep7(applicationId, data) {
  const payload = {
    propertyType:             data.colPropType,
    propertyTypeOther:        data.colPropTypeOther,
    propertyAddress:          data.colAddress,
    propertyAddress2:         data.colAddress2,
    propertyPinCode:          data.colPin,
    propertyTelephone:        data.colTel,
    propertyMobile:           data.colMobile,
    galaArea:                 data.colGalaArea ? parseFloat(data.colGalaArea) : null,
    buildingConstructionYear: data.colBuildYear,
    citySurveyNo:             data.colCitySurvey,
    plotNo:                   data.colPlot,
    wardNo:                   data.colWard,
    completionCertDate:       data.colCompletionCert || null,
    ocDate:                   data.colOCDate || null,
    conveyanceDeedDate:       data.colConveyanceDate || null,
    housingSocietyRegNo:      data.colHousingReg,
    memberNo:                 data.colMemberNo,
    landArea:                 data.colLandArea,
    naOrderDate:              data.colNADate || null,
    landCitySurveyNo:         data.colLandCitySurvey,
    landPlotNo:               data.colLandPlot,
    landWardNo:               data.colLandWard,
    gutNo:                    data.colGutNo,
    hissaNo:                  data.colHissaNo,
    eastBoundary:             data.colEast,
    westBoundary:             data.colWest,
    southBoundary:            data.colSouth,
    northBoundary:            data.colNorth,
    govtValuation:            data.colGovtVal ? parseFloat(data.colGovtVal) : null,
    marketValue:              data.colMarketVal ? parseFloat(data.colMarketVal) : null,
    insuranceCompanyName:     data.colInsCompany,
    insuranceAddress:         data.colInsAddress,
    insuranceAddress2:        data.colInsAddress2,
    insurancePolicyNo:        data.colInsPolicy,
    insuranceFrom:            data.colInsDurFrom_d || null,
    insuranceTo:              data.colInsDurTo_d || null,
    insuranceAmount:          data.colInsAmount ? parseFloat(data.colInsAmount) : null,
    insurancePremium:         data.colInsPremium ? parseFloat(data.colInsPremium) : null,
  };
  const res = await api.put(`${BASE}/step7/${applicationId}`, payload);
  return res.data;
}

/** Final submit — marks application as Submitted */
export async function submitApplication(applicationId) {
  const res = await api.post(`${BASE}/submit/${applicationId}`);
  return res.data;
}

/**
 * Full Bulk Submit — saves all steps at once.
 * Call this on the final submit button.
 */
export async function submitFull(data) {
  const payload = {
    step1: {
      applicationDate:            data.dinank || null,
      memberNo:                   data.saCra,
      loanAccountNo:              data.karjKhate,
      branch:                     data.shakha,
      applicantName:              data.arjdarNaav,
      applicantAge:               data.arjdarVay ? parseInt(data.arjdarVay) : null,
      loanAmount:                 data.karjRakkam ? parseFloat(data.karjRakkam) : null,
      loanAmountInWords:          data.akshari,
      repaymentMonths:            data.paratfedKalavadhi ? parseInt(data.paratfedKalavadhi) : null,
      firstInstallmentAfterMonths:data.pahilaHapta ? parseInt(data.pahilaHapta) : null,
      installmentDate:            data.tarikh ? parseInt(data.tarikh) : null,
      purpose:                    data.karan,
      maritalStatus:              data.vaivahik,
      dependents:                 data.avalambun ? parseInt(data.avalambun) : null,
      guarantor1Name:             data.jameen1Naav,
      guarantor1Age:              data.jameen1Vay ? parseInt(data.jameen1Vay) : null,
      guarantor2Name:             data.jameen2Naav,
      guarantor2Age:              data.jameen2Vay ? parseInt(data.jameen2Vay) : null,
      guarantor3Name:             data.jameen3Naav,
      guarantor3Age:              data.jameen3Vay ? parseInt(data.jameen3Vay) : null,
      extraGuarantors:            (data.extraGuarantors || []).map((g, idx) => ({
        frontendId: String(g.id),
        name:       data[`eg_${g.id}_Naav`] || '',
        age:        data[`eg_${g.id}_Vay`] ? parseInt(data[`eg_${g.id}_Vay`]) : null,
        guarantorNumber: idx + 3,
      })),
    },
    step2: mapPersonFields(data, 'b'),
    step3: mapPersonFields(data, 'g1'),
    step4: mapPersonFields(data, 'g2'),
    extraGuarantors: (data.extraGuarantors || []).map((g, idx) => mapExtraGuarantor(data, g, idx)),
    step5: {
      businessNature:           data.bizNature,
      businessType:             data.bizType,
      businessPropertyType:     data.bizJagaType,
      floorArea:                data.bizArea ? parseFloat(data.bizArea) : null,
      firmName:                 data.bizFirmName,
      address:                  data.bizAddress,
      address2:                 data.bizAddress2,
      pinCode:                  data.bizPin,
      phone:                    data.bizTel,
      email:                    data.bizEmail,
      panCardNo:                data.bizPan,
      gumastaLicenseNo:         data.bizGumasta,
      salesTaxNo:               data.bizSalesTax,
      vatNo:                    data.bizVat,
      serviceTaxNo:             data.bizServiceTax,
      otherLicense:             data.bizOtherLicense,
      allLicensesAvailable:     data.bizLicenseYes === true || data.bizLicenseYes === 'true',
      isSmallIndustryResident:  data.bizResidentYes === true || data.bizResidentYes === 'true',
      sinceWhen:                data.bizSince,
      experience:               data.bizExperience,
      totalAnnualIncome:        data.bizAnnualIncome ? parseFloat(data.bizAnnualIncome) : null,
      totalAnnualExpenses:      data.bizAnnualExpense ? parseFloat(data.bizAnnualExpense) : null,
      netAnnualIncome:          data.bizNetIncome ? parseFloat(data.bizNetIncome) : null,
      customer1Name:            data.bizCust1Naav,
      customer1Address:         data.bizCust1Patta,
      customer2Name:            data.bizCust2Naav,
      customer2Address:         data.bizCust2Patta,
      supplier1Name:            data.bizSupp1Naav,
      supplier1Address:         data.bizSupp1Patta,
      supplier2Name:            data.bizSupp2Naav,
      supplier2Address:         data.bizSupp2Patta,
      extra1:                   data.bizExtra1,
      extra2:                   data.bizExtra2,
      extra3:                   data.bizExtra3,
      extra4:                   data.bizExtra4,
    },
    step6: {
      insuranceCompanyName:     data.insCompany,
      insuranceAddress:         data.insAddress,
      insurancePolicyNo:        data.insPolicy,
      insuranceFrom:            data.insDurFrom_d || null,
      insuranceTo:              data.insDurTo_d || null,
      insuranceAmount:          data.insAmount ? parseFloat(data.insAmount) : null,
      insurancePremium:         data.insPremium ? parseFloat(data.insPremium) : null,
      insurancePremiumFrequency:data.insPremiumType,
      hasPolicyLoan:            data.insLoanYes === true || data.insLoanYes === 'true',
      policyLoanBankName:       data.insLoanBank,
      policyLoanBankAddress:    data.insLoanAddress,
      policyLoanAmount:         data.insLoanAmount ? parseFloat(data.insLoanAmount) : null,
      policyLoanDate:           data.insLoanDate_d || null,
      policyLoanBalance:        data.insLoanBalance ? parseFloat(data.insLoanBalance) : null,
      panCardNo:                data.itPan,
      incomeTaxSince:           data.itSince,
      itYear1From:              data.itYear1From, itYear1To: data.itYear1To,
      itAmount1:                data.itAmount1 ? parseFloat(data.itAmount1) : null,
      itDate1:                  data.itDate1 || null,
      itYear2From:              data.itYear2From, itYear2To: data.itYear2To,
      itAmount2:                data.itAmount2 ? parseFloat(data.itAmount2) : null,
      itDate2:                  data.itDate2 || null,
      itYear3From:              data.itYear3From, itYear3To: data.itYear3To,
      itAmount3:                data.itAmount3 ? parseFloat(data.itAmount3) : null,
      itDate3:                  data.itDate3 || null,
      proTaxNo:                 data.ptNo,
      proTaxSince:              data.ptSince,
      ptYear1From:              data.ptYear1From, ptYear1To: data.ptYear1To,
      ptAmount1:                data.ptAmount1 ? parseFloat(data.ptAmount1) : null,
      ptDate1:                  data.ptDate1 || null,
      ptYear2From:              data.ptYear2From, ptYear2To: data.ptYear2To,
      ptAmount2:                data.ptAmount2 ? parseFloat(data.ptAmount2) : null,
      ptDate2:                  data.ptDate2 || null,
      ptYear3From:              data.ptYear3From, ptYear3To: data.ptYear3To,
      ptAmount3:                data.ptAmount3 ? parseFloat(data.ptAmount3) : null,
      ptDate3:                  data.ptDate3 || null,
    },
    step7: {
      propertyType:             data.colPropType,
      propertyTypeOther:        data.colPropTypeOther,
      propertyAddress:          data.colAddress,
      propertyAddress2:         data.colAddress2,
      propertyPinCode:          data.colPin,
      propertyTelephone:        data.colTel,
      propertyMobile:           data.colMobile,
      galaArea:                 data.colGalaArea ? parseFloat(data.colGalaArea) : null,
      buildingConstructionYear: data.colBuildYear,
      citySurveyNo:             data.colCitySurvey,
      plotNo:                   data.colPlot,
      wardNo:                   data.colWard,
      completionCertDate:       data.colCompletionCert || null,
      ocDate:                   data.colOCDate || null,
      conveyanceDeedDate:       data.colConveyanceDate || null,
      housingSocietyRegNo:      data.colHousingReg,
      memberNo:                 data.colMemberNo,
      landArea:                 data.colLandArea,
      naOrderDate:              data.colNADate || null,
      landCitySurveyNo:         data.colLandCitySurvey,
      landPlotNo:               data.colLandPlot,
      landWardNo:               data.colLandWard,
      gutNo:                    data.colGutNo,
      hissaNo:                  data.colHissaNo,
      eastBoundary:             data.colEast,
      westBoundary:             data.colWest,
      southBoundary:            data.colSouth,
      northBoundary:            data.colNorth,
      govtValuation:            data.colGovtVal ? parseFloat(data.colGovtVal) : null,
      marketValue:              data.colMarketVal ? parseFloat(data.colMarketVal) : null,
      insuranceCompanyName:     data.colInsCompany,
      insuranceAddress:         data.colInsAddress,
      insuranceAddress2:        data.colInsAddress2,
      insurancePolicyNo:        data.colInsPolicy,
      insuranceFrom:            data.colInsDurFrom_d || null,
      insuranceTo:              data.colInsDurTo_d || null,
      insuranceAmount:          data.colInsAmount ? parseFloat(data.colInsAmount) : null,
      insurancePremium:         data.colInsPremium ? parseFloat(data.colInsPremium) : null,
    },
  };

  const res = await api.post(`${BASE}/submit-full`, payload);
  return res.data;
}

// ════════════════════════════════════════════════════════════════════════════
//  READ APIs
// ════════════════════════════════════════════════════════════════════════════

export async function getApplicationList(params = {}) {
  const res = await api.get(BASE, { params });
  return res.data;
}

export async function getApplicationById(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

export async function deleteApplication(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

export async function updateStatus(id, status) {
  const res = await api.patch(`${BASE}/${id}/status`, JSON.stringify(status), {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
}

export default {
  saveStep1,
  updateStep1,
  saveStep2,
  saveStep3,
  saveStep4,
  saveExtraGuarantor,
  saveStep5,
  saveStep6,
  saveStep7,
  submitApplication,
  submitFull,
  getApplicationList,
  getApplicationById,
  deleteApplication,
  updateStatus,
};