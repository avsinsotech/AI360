import api from "./api"; // ← use the configured axios instance with JWT interceptor

// ── Build submit payload from full React form state ───────────────────────
export function buildVehicleLoanPayload(formData) {
  const d = formData;
  const extraGs = d.extraGuarantors || [];

  const extractPerson = (prefix) => ({
    photo:              d[`${prefix}Photo`]             || null,
    naav:               d[`${prefix}Naav`]              || "",
    vay:                d[`${prefix}Vay`]               || "",
    sabasadNo:          d[`${prefix}SabasadNo`]         || "",
    shares:             d[`${prefix}Shares`]            || "",
    sharesRakkam:       d[`${prefix}SharesRakkam`]      || "",
    vadilNaav:          d[`${prefix}VadilNaav`]         || "",
    vadilVay:           d[`${prefix}VadilVay`]          || "",
    aaiNaav:            d[`${prefix}AaiNaav`]           || "",
    aaiVay:             d[`${prefix}AaiVay`]            || "",
    patta:              d[`${prefix}Patta`]             || "",
    pinKod:             d[`${prefix}PinKod`]            || "",
    durdhvani:          d[`${prefix}Durdhvani`]         || "",
    mobile:             d[`${prefix}Mobile`]            || "",
    email:              d[`${prefix}Email`]             || "",
    jageSwaarup:        d[`${prefix}JageSwaarup`]       || [],
    kalavadhi_m:        d[`${prefix}Kalavadhi_m`]       || "",
    kalavadhi_v:        d[`${prefix}Kalavadhi_v`]       || "",
    vaivahik:           d[`${prefix}Vaivahik`]          || "विवाहित",
    avalambun:          d[`${prefix}Avalambun`]         || "",
    company:            d[`${prefix}Company`]           || "",
    companyPatta:       d[`${prefix}CompanyPatta`]      || "",
    companyPin:         d[`${prefix}CompanyPin`]        || "",
    companyTel:         d[`${prefix}CompanyTel`]        || "",
    companyMobile:      d[`${prefix}CompanyMobile`]     || "",
    companyEmail:       d[`${prefix}CompanyEmail`]      || "",
    vibhag:             d[`${prefix}Vibhag`]            || "",
    hudda:              d[`${prefix}Hudda`]             || "",
    empCode:            d[`${prefix}EmpCode`]           || "",
    karj_m:             d[`${prefix}Karj_m`]            || "",
    karj_v:             d[`${prefix}Karj_v`]            || "",
    seva:               d[`${prefix}Seva`]              || "",
    monthlyVetan:       d[`${prefix}MonthlyVetan`]      || "",
    kapat:              d[`${prefix}Kapat`]             || "",
    niwal:              d[`${prefix}Niwal`]             || "",
    vaarshik:           d[`${prefix}Vaarshik`]          || "",
    kharcha:            d[`${prefix}Kharcha`]           || "",
    niwalVaarshik:      d[`${prefix}NiwalVaarshik`]     || "",
    kutumb:             d[`${prefix}Kutumb`]            || "",
    kutumbType:         d[`${prefix}KutumbType`]        || "मासिक",
    shetiNaav:          d[`${prefix}ShetiNaav`]         || "",
    shetiNaate:         d[`${prefix}ShetiNaate`]        || "",
    gaavMukkam:         d[`${prefix}GaavMukkam`]        || "",
    gaavPost:           d[`${prefix}GaavPost`]          || "",
    gaavTaluka:         d[`${prefix}GaavTaluka`]        || "",
    gaavJilha:          d[`${prefix}GaavJilha`]         || "",
    gaavRajya:          d[`${prefix}GaavRajya`]         || "",
    gaavPin:            d[`${prefix}GaavPin`]           || "",
    gaavDurdhvani:      d[`${prefix}GaavDurdhvani`]     || "",
    gaavMobile:         d[`${prefix}GaavMobile`]        || "",
    purvKarjPrakar:     d[`${prefix}PurvKarjPrakar`]    || "",
    purvKhate:          d[`${prefix}PurvKhate`]         || "",
    purvRakkam:         d[`${prefix}PurvRakkam`]        || "",
    purvDin1:           d[`${prefix}PurvDin1`]          || "",
    purvDin2:           d[`${prefix}PurvDin2`]          || "",
    jam94aKarjdarNaav:  d[`${prefix}Jam94aKarjdarNaav`] || "",
    jam94aPrakar:       d[`${prefix}Jam94aPrakar`]      || "",
    jam94aKhate:        d[`${prefix}Jam94aKhate`]       || "",
    jam94aRakkam:       d[`${prefix}Jam94aRakkam`]      || "",
    jam94aDin1:         d[`${prefix}Jam94aDin1`]        || "",
    jam94aDin2:         d[`${prefix}Jam94aDin2`]        || "",
    jam94bKarjdarNaav:  d[`${prefix}Jam94bKarjdarNaav`] || "",
    jam94bPrakar:       d[`${prefix}Jam94bPrakar`]      || "",
    jam94bKhate:        d[`${prefix}Jam94bKhate`]       || "",
    jam94bRakkam:       d[`${prefix}Jam94bRakkam`]      || "",
    jam94bDin1:         d[`${prefix}Jam94bDin1`]        || "",
    jam94bDin2:         d[`${prefix}Jam94bDin2`]        || "",
    kutumb95Naav:       d[`${prefix}Kutumb95Naav`]      || "",
    kutumb95Prakar:     d[`${prefix}Kutumb95Prakar`]    || "",
    kutumb95Khate:      d[`${prefix}Kutumb95Khate`]     || "",
    kutumb95Rakkam:     d[`${prefix}Kutumb95Rakkam`]    || "",
    kutumb95Din1:       d[`${prefix}Kutumb95Din1`]      || "",
    kutumb95Din2:       d[`${prefix}Kutumb95Din2`]      || "",
    bank96Naav:         d[`${prefix}Bank96Naav`]        || "",
    bank96Shakha:       d[`${prefix}Bank96Shakha`]      || "",
    bank96Prakar:       d[`${prefix}Bank96Prakar`]      || "",
    bank96Khate:        d[`${prefix}Bank96Khate`]       || "",
    bank96Rakkam:       d[`${prefix}Bank96Rakkam`]      || "",
    bank96Din1:         d[`${prefix}Bank96Din1`]        || "",
    bank96Din2:         d[`${prefix}Bank96Din2`]        || "",
    officeAddress:      prefix === 'b' ? d[`${prefix}OfficeAddress`] : "",
    gavchaAddress:      prefix === 'b' ? d[`${prefix}GavchaAddress`] : "",
    dinank:             d[`${prefix}Dinank`]            || "",
    thikan:             d[`${prefix}Thikan`]            || "",
  });

  return {
    // ── Basic (Page 1) ──────────────────────────────────────────────────
    dinank:             d.dinank,
    saCra:              d.saCra,
    karjKhate:          d.karjKhate,
    shakha:             d.shakha,
    arjdarNaav:         d.arjdarNaav,
    arjdarVay:          d.arjdarVay,
    karjRakkam:         d.karjRakkam,
    akshari:            d.akshari,
    paratfedKalavadhi:  d.paratfedKalavadhi,
    pahilaHapta:        d.pahilaHapta,
    tarikh:             d.tarikh,
    karan:              d.karan,
    vaivahik:           d.vaivahik,
    avalambun:          d.avalambun,
    jameen1Naav:        d.jameen1Naav,
    jameen1Vay:         d.jameen1Vay,
    jameen2Naav:        d.jameen2Naav,
    jameen2Vay:         d.jameen2Vay,
    jameen3Naav:        d.jameen3Naav,
    jameen3Vay:         d.jameen3Vay,
    vyajDar:            d.vyajDar,

    // ── Persons ─────────────────────────────────────────────────────────
    borrower:   extractPerson("b"),
    guarantor1: extractPerson("g1"),
    guarantor2: extractPerson("g2"),

    extraGuarantors: extraGs.map((g, idx) => {
      const p = extractPerson(`exG_${g.id}`);
      return {
        ...p,
        frontendId:      String(g.id),
        guarantorNumber: idx + 3,
      };
    }),

    // ── New Vehicle ──────────────────────────────────────────────────────
    newVehicle: {
      vahanaVapar:       d.newVahanaVapar,
      companyNaav:       d.newCompanyNaav,
      vahanaPrakar:      d.newVahanaPrakar,
      nirmitVarsh:       d.newNirmitVarsh,
      model:             d.newModel,
      fuelType:          d.newFuelType,
      dealerNaav:        d.newDealerNaav,
      dealerPatta:       d.newDealerPatta,
      dealerMobile:      d.newDealerMobile,
      dealerTel:         d.newDealerTel,
      dealerEmail:       d.newDealerEmail,
      kimat:             d.newKimat,
      booking:           d.newBooking,
      shillak:           d.newShillak,
      depositYes:        d.newDepositYes,
      depositAmt:        d.newDepositAmt,
      parkingThikan:     d.newParkingThikan,
      permitNo:          d.newPermitNo,
      permitRenew:       d.newPermitRenew,
      otherVehicleYes:   d.newOtherVehicleYes,
      otherVehicleNo:    d.newOtherVehicleNo,
      otherVehicleType:  d.newOtherVehicleType,
      otherVehicleModel: d.newOtherVehicleModel,
      otherVehicleYear:  d.newOtherVehicleYear,
    },

    // ── Old Vehicle ──────────────────────────────────────────────────────
    oldVehicle: {
      vahanaVapar:       d.oldVahanaVapar,
      dealerNaav:        d.oldDealerNaav,
      dealerPatta:       d.oldDealerPatta,
      dealerMobile:      d.oldDealerMobile,
      dealerTel:         d.oldDealerTel,
      dealerEmail:       d.oldDealerEmail,
      companyNaav:       d.oldCompanyNaav,
      vehicleNo:         d.oldVehicleNo,
      rto:               d.oldRTO,
      vahanaPrakar:      d.oldVahanaPrakar,
      nirmitVarsh:       d.oldNirmitVarsh,
      engineNo:          d.oldEngineNo,
      chassisNo:         d.oldChassisNo,
      model:             d.oldModel,
      fuelType:          d.oldFuelType,
      fitnessNo:         d.oldFitnessNo,
      fitnessRenew:      d.oldFitnessRenew,
      parkingThikan:     d.oldParkingThikan,
      permitNo:          d.oldPermitNo,
      permitArea:        d.oldPermitArea,
      permitRenewDate:   d.oldPermitRenewDate,
      permitFrom:        d.oldPermitFrom,
      permitTo:          d.oldPermitTo,
      roadTax:           d.oldRoadTax,
      roadTaxPeriod:     d.oldRoadTaxPeriod,
      otherVehicleYes:   d.oldOtherVehicleYes,
      otherVehicleNo:    d.oldOtherVehicleNo,
      otherVehicleType:  d.oldOtherVehicleType,
      otherVehicleModel: d.oldOtherVehicleModel,
      otherVehicleYear:  d.oldOtherVehicleYear,
    },

    // ── Insurance & Valuation ────────────────────────────────────────────
    insurance: {
      insCompanyNaav:        d.insCompanyNaav,
      insAddress:            d.insAddress,
      insPolicy:             d.insPolicy,
      insDurFrom:            d.insDurFrom,
      insDurTo:              d.insDurTo,
      insAmount:             d.insAmount,
      insPremium:            d.insPremium,
      oldKimat:              d.oldKimat,
      oldAdvance:            d.oldAdvance,
      oldShillak:            d.oldShillak,
      oldValuationPrice:     d.oldValuationPrice,
      oldDepositYes:         d.oldDepositYes,
      oldDepositAmt:         d.oldDepositAmt,
      lifeInsCompany:        d.lifeInsCompany,
      lifeInsAddress:        d.lifeInsAddress,
      lifeInsPolicy:         d.lifeInsPolicy,
      lifeInsDurFrom:        d.lifeInsDurFrom,
      lifeInsDurTo:          d.lifeInsDurTo,
      lifeInsAmount:         d.lifeInsAmount,
      lifeInsPremium:        d.lifeInsPremium,
      lifeInsPremiumType:    d.lifeInsPremiumType,
      lifeInsLoanYes:        d.lifeInsLoanYes,
      lifeInsLoanBank:       d.lifeInsLoanBank,
      lifeInsLoanAddress:    d.lifeInsLoanAddress,
      lifeInsLoanAmount:     d.lifeInsLoanAmount,
      lifeInsLoanDate:       d.lifeInsLoanDate,
      lifeInsLoanBalance:    d.lifeInsLoanBalance,
    },

    // ── Business Info (Page 7) ─────────────────────────────────────────
    businessInfo: {
      bizType:               d.bizType,
      bizCategory:           d.bizCategory,
      bizPremisesType:       d.bizPremisesType || [],
      bizArea:               d.bizArea,
      bizAreaUnit:           d.bizAreaUnit,
      bizAreaType:           d.bizAreaType,
      bizName:               d.bizName,
      bizAddress:            d.bizAddress,
      bizPin:                d.bizPin,
      bizMobile:             d.bizMobile,
      bizEmail:              d.bizEmail,
      bizPan:                d.bizPan,
      bizGumasta:            d.bizGumasta,
      bizSalesTax:           d.bizSalesTax,
      bizVat:                d.bizVat,
      bizServiceTax:         d.bizServiceTax,
      bizOtherLicense:       d.bizOtherLicense,
      bizHasLicenses:        d.bizHasLicenses,
      bizLicenseDetails:     d.bizLicenseDetails,
      bizIsResidentInZone:   d.bizIsResidentInZone,
      bizStartDate:          d.bizStartDate,
      bizExperience:         d.bizExperience,
      bizIncome:             d.bizIncome,
      bizExpense:            d.bizExpense,
      bizNetIncome:          d.bizNetIncome,
      bizCust1Name:          d.bizCust1Name,
      bizCust1Address:       d.bizCust1Address,
      bizCust2Name:          d.bizCust2Name,
      bizCust2Address:       d.bizCust2Address,
      bizSupplier1Name:      d.bizSupplier1Name,
      bizSupplier1Address:   d.bizSupplier1Address,
      bizSupplier2Name:      d.bizSupplier2Name,
      bizSupplier2Address:   d.bizSupplier2Address,
    },

    // ── Tax Info (Page 8) ─────────────────────────────────────────────
    incTaxPan:               d.incTaxPan,
    incTaxSinceYear:         d.incTaxSinceYear,
    incTaxDetails:           (d.incTaxDetails || []).map(t => ({ year: t.year || t.Year || "", amount: t.amount || t.Amount || "", date: t.date || t.Date || "" })),
    profTaxNo:               d.profTaxNo,
    profTaxSinceYear:        d.profTaxSinceYear,
    profTaxDetails:          (d.profTaxDetails || []).map(t => ({ year: t.year || t.Year || "", amount: t.amount || t.Amount || "", date: t.date || t.Date || "" })),
    bizExtraInfo:            d.bizExtraInfo,

    // ── Raw JSON Snapshot ──────────────────────────────────────────────
    // We clean the data before stringifying to avoid recursion and bloat
    rawJson: (() => {
      // Exclude large nested objects and the previous rawJson to keep it clean
      const keysToExclude = ['rawJson', 'borrower', 'guarantor1', 'guarantor2', 'extraGuarantors', 'newVehicle', 'oldVehicle', 'insurance', 'businessInfo', 'taxDetails', 'applicationGuarantors'];
      const cleaned = {};
      Object.keys(d).forEach(k => {
        if (!keysToExclude.includes(k)) {
          cleaned[k] = d[k];
        }
      });
      return JSON.stringify(cleaned);
    })(),
  };
}

// ══════════════════════════════════════════════════════════════════════════
// API FUNCTIONS  —  all use the shared `api` instance (has JWT interceptor)
// ══════════════════════════════════════════════════════════════════════════

// ── IMPORTANT: must match your backend route prefix exactly ───────────────
// If api.js baseURL = 'http://localhost:5118'     → BASE = '/api/vehicle-loan'
// If api.js baseURL = 'http://localhost:5118/api' → BASE = '/vehicle-loan'
// Your api.js has baseURL='http://localhost:5118' so we need /api prefix:
const BASE = "/api/vehicle-loan";

/**
 * POST /api/vehicle-loan/draft
 * Create a new draft
 */
export async function saveDraft(formData) {
  const payload = buildVehicleLoanPayload(formData);
  const res = await api.post(`${BASE}/draft`, payload);
  return res.data; // { success, id }
}

/**
 * PUT /api/vehicle-loan/draft/{id}
 * Update existing draft
 */
export async function updateDraft(id, formData) {
  const payload = buildVehicleLoanPayload(formData);
  const res = await api.put(`${BASE}/draft/${id}`, payload);
  return res.data;
}

/**
 * POST /api/vehicle-loan/submit
 * Final submit (creates new record with status=SUBMITTED)
 */
export async function submitApplication(formData) {
  const payload = buildVehicleLoanPayload(formData);
  // Clean empty strings to null for better backend binding compatibility
  const cleanPayload = JSON.parse(JSON.stringify(payload, (key, value) => value === "" ? null : value));

  // If id exists, it's an update
  if (formData.id) {
    const res = await api.put(`${BASE}/${formData.id}`, cleanPayload);
    return res.data;
  }
  const res = await api.post(`${BASE}/submit`, cleanPayload);
  return res.data;
}

/**
 * POST /api/vehicle-loan/submit/{draftId}
 * Convert existing draft to submitted
 */
export async function submitDraft(draftId, formData) {
  const payload = buildVehicleLoanPayload(formData);
  const cleanPayload = JSON.parse(JSON.stringify(payload, (key, value) => value === "" ? null : value));

  const res = await api.post(`${BASE}/submit/${draftId}`, cleanPayload);
  return res.data;
}

/**
 * GET /api/vehicle-loan
 * List all applications with optional filters
 */
export async function getApplications({ status, search, page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (search) params.append("search", search);
  params.append("page", page);
  params.append("pageSize", pageSize);
  const res = await api.get(`${BASE}?${params}`);
  return res.data;
}

/**
 * GET /api/vehicle-loan/{id}
 * Get full detail
 */
export async function getApplicationById(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

/**
 * GET /api/vehicle-loan/by-no/{appNo}
 * Get full detail by application number
 */
export async function getApplicationByNo(appNo) {
  const res = await api.get(`${BASE}/by-no/${encodeURIComponent(appNo)}`);
  return res.data;
}

/**
 * PATCH /api/vehicle-loan/{id}/status
 * Update status: APPROVED / REJECTED / UNDER_REVIEW / DISBURSED
 */
export async function updateStatus(id, status, remarks = "") {
  const res = await api.patch(`${BASE}/${id}/status`, { status, remarks });
  return res.data;
}

/**
 * DELETE /api/vehicle-loan/{id}
 * Delete draft
 */
export async function deleteDraft(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

/**
 * GET /api/vehicle-loan/stats
 * Count by status for dashboard
 */
export async function getStats() {
  const res = await api.get(`${BASE}/stats`);
  return res.data;
}

/**
 * GET /api/vehicle-loan/{id}/raw-json
 * Get raw JSON snapshot for print re-generation
 */
export async function getRawJson(id) {
  const res = await api.get(`${BASE}/${id}/raw-json`);
  return res.data;
}

/**
 * GET /api/vehicle-loan/search?q=...
 * Full-text search
 */
export async function searchApplications(q, limit = 10) {
  const res = await api.get(`${BASE}/search`, { params: { q, limit } });
  return res.data;
}

export default {
  saveDraft,
  updateDraft,
  submitApplication,
  submitDraft,
  getApplications,
  getApplicationById,
  getApplicationByNo,
  updateStatus,
  deleteDraft,
  getStats,
  getRawJson,
  searchApplications,
  buildVehicleLoanPayload,
};