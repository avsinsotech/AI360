import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Printer, ArrowLeft } from 'lucide-react';
import homeLoanService from "../../services/homeLoanService";

/* ─── Global styles injected once ────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #0a1c5a;
    --accent:  #f5a623;
    --border:  #333;
    --light-border: #999;
  }

  body {
    font-family: 'Noto Sans Devanagari', serif;
    font-size: 11px;
    background: #ffffff;
    color: #111;
    line-height: 1.3;
  }

  /* ── A4 page wrapper ── */
  .page {
    width: 210mm;
    height: 295mm !important;
    background: #fff;
    margin: 0 auto;
    padding: 8mm 10mm;
    border: 3px solid var(--primary);
    position: relative;
    box-sizing: border-box;
    box-shadow: none;
    page-break-before: always;
    overflow: hidden;
  }
  .page:first-child {
    page-break-before: avoid !important;
  }
  .page:last-child {
    page-break-after: avoid !important;
  }

  @page {
    size: A4;
    margin: 0;
  }

  /* ── Headers ── */
  .section-header-pink {
    background: #e1e7f5 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color: #0a1c5a;
    padding: 4px 8px;
    font-size: 11px;
    font-weight: 700;
    margin: 8px 0 5px;
    border-left: 4px solid var(--primary);
  }

  /* ── Field rows & lines ── */
  .field-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 2px;
    flex-wrap: wrap;
    gap: 4px;
  }
  .field-label { white-space: nowrap; font-size: 10px; }

  .field-line {
    flex: 1;
    border: none;
    border-bottom: 1px solid #333;
    min-width: 60px;
    height: 18px;
    background: transparent;
    font-family: inherit;
    font-size: 10.5px;
    padding: 0 2px;
  }
  .field-line:focus { outline: none; border-bottom-color: var(--primary); }

  .inline-field {
    display: inline-block;
    border-bottom: 1px solid #333;
    min-width: 80px;
    height: 16px;
    vertical-align: bottom;
  }
  .inline-field-sm { min-width: 40px; }
  .inline-field-lg { min-width: 160px; }
  .inline-field-xl { min-width: 220px; }

  /* ── Char boxes ── */
  .field-box { display: inline-flex; gap: 2px; margin-left: 4px; }
  .field-box input[type="text"] {
    width: 22px; height: 20px;
    border: 1px solid #333;
    text-align: center;
    font-family: inherit;
    font-size: 10px;
  }

  /* ── Dividers ── */
  hr.divider { border: none; border-top: 2px solid var(--primary); margin: 8px 0; }
  hr.thin    { border: none; border-top: 1px solid #999; margin: 5px 0; }

  /* ── Misc ── */
  .photo-box {
    width: 80px; height: 100px;
    border: 1px solid #333;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: #666; text-align: center; flex-shrink: 0;
  }
  .page-num { position: absolute; bottom: 8mm; left: 0; right: 0; text-align: center; font-size: 10px; color: #444; }
  .num-item { display: flex; gap: 6px; margin-bottom: 4px; font-size: 10.5px; align-items: flex-start; }
  .num-label { min-width: 24px; font-weight: 600; flex-shrink: 0; }

  table.data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px; }
  table.data-table th { background: #e1e7f5; border: 1px solid #999; padding: 3px 5px; text-align: center; font-weight: 600; }
  table.data-table td { border: 1px solid #999; padding: 3px 5px; height: 20px; }

  /* ── Society name ── */
  .society-name { font-size: 20px; font-weight: 700; color: var(--primary); font-style: italic; }
  .society-subtitle { font-size: 11px; font-weight: 600; color: #111; }
  .society-reg { font-size: 8.5px; color: #555; margin-top: 2px; }
  .society-address { font-size: 8.5px; color: #555; }

  /* ── Print button ── */
  .print-btn {
    position: fixed; top: 20px; right: 20px;
    background: var(--primary); color: white;
    border: none; padding: 10px 20px; font-size: 14px;
    cursor: pointer; border-radius: 4px;
    font-family: inherit; z-index: 999;
  }
  .print-btn:hover { background: var(--accent); }

  /* ── Header Boxes ── */
  .box-row { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-bottom: 4px; font-size: 10px; }
  .box-container { display: flex; border: 1px solid #333; overflow: hidden; }
  .box-item { width: 18px; height: 18px; border-right: 1px solid #333; display: flex; align-items: center; justifyContent: center; font-size: 10px; }
  .box-item:last-child { border-right: none; }

  /* ── Narrative ── */
  .narrative-p { 
    font-size: 11.5px; 
    line-height: 2.0; 
    text-align: justify; 
    margin: 10px 0; 
  }
  .narrative-input { 
    border-bottom: 1.5px solid #333; 
    display: inline-block; 
    padding: 0 5px; 
    min-height: 20px; 
    font-weight: 700; 
    color: var(--primary);
  }

  /* ── Footer / Office Use ── */
  .office-section { 
    margin-top: 15px; 
    border: 1.5px solid #333; 
    padding: 10px; 
    position: relative;
    border-radius: 4px;
  }
  .office-tag { 
    position: absolute; 
    top: -10px; left: 20px; 
    background: #fff; padding: 0 8px; 
    font-weight: 800; font-size: 10px; 
  }

  /* ── Signatures ── */
  .sign-area { display: flex; justify-content: space-between; margin-top: 25px; align-items: flex-end; }
  .sign-stack { text-align: center; min-width: 150px; font-size: 10.5px; }
  .sign-underline { border-bottom: 1px solid #333; margin-bottom: 4px; height: 30px; }
  .master-breadcrumbs { display: none !important; }

  @media print {
    @page { size: A4; margin: 0; }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: auto !important;
      overflow: visible !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    #root, .app-container, .main-layout, .content-area, .master-main, .master-content-wrapper, .print-wrapper { 
      height: auto !important;
      min-height: auto !important;
      overflow: visible !important;
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .page { 
      margin: 0 auto !important; 
      box-shadow: none !important;
      border: 3px solid var(--primary) !important;
      height: 295mm !important;
      max-height: 295mm !important;
      page-break-after: always !important;
      page-break-before: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
      position: relative !important;
      display: block !important;
    }
    .page:last-child {
      page-break-after: avoid !important;
    }
    .no-print, .sidebar, .top-bar, .master-breadcrumbs, .master-footer, .skiptranslate, #google_translate_element { 
      display: none !important; 
    }
  }
    
    /* Ensure backgrounds show up */
    .section-header-pink, table.data-table th {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

/* ─── Print Translations ─────────────────────────────────────────────────── */
const PT = {
  mr: {
    toChairman: "स. अध्यक्ष/संचालक मंडळ,",
    formTitle: "गृह/तारणी कर्ज मागणी अर्ज",
    formNote: "(टीप: पान नंबर १ वर शमूद केलेल्या सूचनांचे वाचन करून कर्ज अर्ज भरावा.)",
    home: "Home",
    dinank: "दिनांक", shakha: "शाखा:",
    saCra: "स. क्र./साम स./छ. क्र.:", karjKhate: "कर्ज खाते क्र.:",
    societyDefault: "साई प्रेरणा", societySuffix: "को-ऑपरेटिव्ह क्रेडिट सोसायटी लि.",
    regNo: "(नोंदणी क्र. बी. ओ. एम./डब्ल्यू. ए./आर. एस. आर./३२१/२०१५-१७)",
    officePrefix: "प्रशासकीय कार्यालय:",
    officeAddr: "३१७, \"पुरण आशा\" बिल्डींग, नरथी नाथा स्ट्रीट, काथा बाजार, मसजिद बंदर (प.), मुं. - ४००००९",
    applicant: "अर्जदार श्री./श्रीमती", vay: "वय", varshe: "वर्षे",
    coApplicant: "सहार्जदार श्री./सौ./श्रीमती",
    bodyText1: "यांजकडून अर्ज करण्यात येतो की, मला ₹",
    bodyText2: "(अक्षरी ₹",
    bodyText3: "फक्त) गृह/तारणी कर्ज पाहिजे आहे. सदर कर्जाची मी व्याजासह",
    bodyText4: "महिन्यात संपूर्ण कर्ज मुद्दल व्याजासह परत फेड करीन. पहिला हप्ता",
    bodyText5: "महिन्यांनंतर आणि बाकीचे हप्ते तद्नंतर प्रत्येक महिन्याच्या",
    bodyText6: "तारखेस देत जाईन. माझा कर्ज घेण्याचा उद्देश (कारण)",
    bodyPara1: "हा असून माझी सध्याची माहिती खालील प्रमाणे देत आहे.",
    bodyPara2a: "मी विवाहित/अविवाहित आहे. माझ्यावर कुटुंबातील",
    bodyPara2b: "व्यक्ती अवलंबून आहेत. तसेच मी प्रतिज्ञेवर सांगतो की, दुसऱ्या कोणत्याही को-ऑपरेटिव्ह सोसायटीकडे अगर बँकेचे माझ्यावर कर्ज नाही. माझ्या कर्जाची परतफेड मी संचालक मंडळ ठरवील त्याप्रमाणे व व्याजाच्या दराने तसेच सोसायटीकडे वेळोवेळी असणाऱ्या इतर आकारणीसह व खर्चासह दिलेल्या मुदतीत फेड करीन. सोसायटीचे अस्तित्वात असलेले तसेच पुढे अमलात येणारे सर्व नियम व पोटनियम मला मान्य आहेत/राहतील.",
    bodyPara3: "मला जामीन राहण्यास कबूल असलेल्या सोसायटीच्या सभासदांची नावे व त्यांच्याविषयी भरून द्यावयाची इतर माहिती मी खालीलप्रमाणे या अर्जासोबत देत आहे.",
    gLabel: (n) => `${n}) जामीनदाराचे नाव श्री./श्रीमती`,
    requestText: "संचालक मंडळाने माझ्या या कर्ज मागणी अर्जाचा विचार करावा ही नम्र विनंती.",
    yoursTruly: "आपला/आपली विश्वासू,", sahi: "सही:",
    applicantBorrower: "अर्जदार (कर्जदार)",
    boardRemark: "संचालक मंडळाचा शेरा",
    directorSign: "शिफारस करणाऱ्या संचालक/स्थानिक समिती सदस्याची सही",
    boardMeetingDate: "संचालक मंडळाची सभा दि.", sabhaNo: "सभा क्रमांक", tharavNo: "ठराव क्रमांक",
    sanctionText: "नुसार ₹", sanctionText2: "(अक्षरी ₹", sanctionText3: ") कर्ज मंजूर करण्यात येत आहे.",
    gm: "सरव्यवस्थापक", vp: "उपाध्यक्ष", president: "अध्यक्ष",
    // Person page
    photo: "फोटो",
    borrowerTitle: "कर्जदाराची माहिती",
    g1Title: "जामीनदार क्रमांक १ ची माहिती", g2Title: "जामीनदार क्रमांक २ ची माहिती",
    fullName: "१. संपूर्ण नाव: श्री./श्रीमती", memberNo: "२. सभासद क्रमांक:",
    sharesQty: "धारण केलेले भाग (शेअर्स) संख्या", sharesAmt: "रक्कम ₹",
    fatherName: "३. वडील/पतीचे संपूर्ण नाव: श्री.", motherName: "४. आईचे नाव: सौ./श्रीमती",
    address: "५. राहण्याचा पत्ता:", pinCode: "पिन कोड", phone: "दूरध्वनी", mobile: "मोबाईल", email: "ई मेल:",
    residenceType: "६. राहण्याच्या जागेचे स्वरूप:",
    resOpts: ["स्वःमालकीचे", "बिल्डिंगपार्टि", "पागडीची", "भाडेतत्त्वावर", "कंपनी क्वार्टर्स"],
    stayDuration: "७. सध्याच्या जागेत राहत असल्याचा कालावधी:", mahine: "महिने", varsha: "वर्ष",
    maritalStatus: "८. वैवाहिक स्थिती:", vivahit: "विवाहित", avivahit: "अविवाहित",
    dependents: "अवलंबून असलेल्या कुटुंबातील व्यक्तींची संख्या:",
    jobTitle: "९. नोकरी/व्यवसायाचा तपशील:",
    companyName: "अ) कंपनीचे नाव", companyAddr: "पत्ता:",
    companyPin: "पिन कोड", companyTel: "दूरध्वनी", companyMob: "मोबाईल", companyEmail: "ई मेल/वेबसाईट",
    dept: "ब) विभाग (डिपार्टमेंट):", designation: "हुद्दा", empCode: "कर्मचारी सांकेतिक क्र.",
    jobDuration: "क) नोकरी/व्यवसायाचा कालावधी", retireDate: "ड) सेवानिवृत्ती दिनांक:",
    incomeTitle: "१०. उत्पन्नाचा तपशील:",
    salaryLabel: "अ) नोकरदार असल्यास: एकूण मासिक वेतन ₹", deductions: "एकूण कपात ₹", netSalary: "निव्वळ वेतन ₹",
    bizIncome: "ब) व्यावसायिक असल्यास: वार्षिक उत्पन्न ₹", bizExpense: "सर्व खर्च (करासह) कपात ₹", netAnnual: "निव्वळ वार्षिक उत्पन्न ₹",
    familyIncome: "क) संपूर्ण कुटुंबाचे एकूण निव्वळ उत्पन्न ₹", masik: "मासिक", varshik: "वार्षिक",
    landOwner: "११. घर/शेती ज्यांच्या नावावर आहे त्यांचे नाव: श्री./श्रीमती", naate: "नाते",
    villageAddr: "१२. गावचा पत्ता: मुक्काम", post: "पोस्ट", taluka: "तालुका", district: "जिल्हा", state: "राज्य",
    prevLoan: "३. संस्थेकडून या पूर्वी कर्ज घेतले असल्यास त्याचा तपशील: कर्ज प्रकार",
    accountNo: "खाते क्र.", amount: "रक्कम ₹", loanDate: "कर्ज घेतल्याचा दिनांक:", repayDate: "कर्ज परत फेडीचा दिनांक:",
    asGuarantor: "१४. जामीनदार असल्यास तपशील:",
    gBorrower: (l) => `${l}) कर्जदाराचे नाव: श्री./श्रीमती`,
    loanType: "कर्ज प्रकार:", accountNum: "खाते क्रमांक",
    otherBank: "१६. इतर वित्त संस्था/बँकेकडून घेतलेल्या कर्जांचा तपशील: संस्था/बँकेचे नाव:",
    branch: "शाखा",
    declaration: "वरील सर्व माहिती सत्य व योग्य असून मी जामिन राहण्यास स्व: खुशीने तयार आहे.",
    place: "ठिकाण:", date: "दिनांक", mrMrs: "श्री./श्रीमती",
    // Page nums
    pn: ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२", "१३", "१४", "१५", "१६", "१७", "१८", "१९", "२०"],
    resaleTitle: "अ) पुनर्विक्रीच्या (Resale) घराच्या खरेदीसाठी माहिती",
    constTitle: "ब) बांधकामाधीन (Under-Construction) घराच्या खरेदीसाठी माहिती",
    colTitle: "क) तारण देत असलेल्या मिळकतीची माहिती",
    bizInfoTitle: "अर्जदाराच्या व्यवसायाची माहिती",
    totalAnnualIncome: "एकूण वार्षिक उत्पन्न",
    totalAnnualExpense: "एकूण वार्षिक खर्च (करासह)",
    netAnnualIncome: "निव्वळ वार्षिक उत्पन्न",
    regularCustomers: "१४) नियमित दोन ग्राहकांची नावे:",
    suppliers: "१५) नियमित दोन पुरवठादारांची नावे:",
    partnerInfoTitle: "अर्जदार व भागीदार यांनी भरावयाची माहिती",
    lifeInsTitle: "१) अर्जदार/भागीदार यांच्या आयुर्विमाचा तपशील",
    insCompany: "अ) विमा कंपनीचे नाव:", insAddr: "ब) संपूर्ण पत्ता:", insPolicy: "क) विमा पॉलिसी नंबर",
    insPeriod: "ड) विम्याचा काळ", from: "पासून", to: "ते",
    insAmt: "इ) विम्याची रक्कम ₹", insPremium: "फ) हप्त्याची रक्कम ₹",
    premiumType: "ग) हप्त्याचा प्रकार:", monthly: "मासिक", quarterly: "त्रैमासिक", halfYearly: "अर्ध वार्षिक", annual: "वार्षिक",
    policyLoan: "२) विमा पॉलिसीवर कर्ज घेतले आहे का? — नाही", policyLoanDetail: "(होय असल्यास त्याचा तपशील द्यावा)",
    bankInst: "अ) बँक/संस्थेचे नाव:", fullAddr: "संपूर्ण पत्ता:",
    loanAmt: "ब) कर्जाची रक्कम ₹", loanDt: "कर्जाचा दिनांक", balanceLoan: "क) कर्जाची शिल्लक रक्कम ₹",
    incomeTaxTitle: "३) इन्कम टॅक्सचा तपशील — पॅन कार्ड नंबर:",
    taxSince: "अ) इन्कम टॅक्स कधी पासून भरता? वर्ष",
    fyLabel: "आर्थिक वर्ष", taxAmt: "भरलेला टॅक्स", taxPayDate: "भरणा दिनांक",
    san: "वर्ष", te: "ते",
    profTaxTitle: "४) प्रोफेशनल टॅक्सचा तपशील",
    profTaxNo: "अ) प्रोफेशनल टॅक्स नंबर", profTaxSince: "ब) प्रोफेशनल टॅक्स कधी पासून भरता? वर्ष",
    profTaxLabel: "प्रोफेशनल टॅक्स",

    // Page 5 - Resale
    p5_1: "१) विक्रेदार श्री./श्रीमती",
    p5_2: "२) खरेदी करत असलेल्या मिळकतीचा पत्ता:",
    p5_3a: "अ) हौसिंग सोसायटीचे नाव / पत्ता:",
    p5_Desc: "३) खरेदी करत असलेल्या मिळकतीचे वर्णन :",
    p5_3aa: "अ) घर/रूम/ब्लॉक/प्लॅट क्र.:",
    p5_Floor: "मजला",
    p5_Wing: "विंग",
    p5_Plot: "ब) प्लॉट क्र.:",
    p5_Sector: "नगर/सेक्टर",
    p5_Road: "क) रस्त्याचे नाव:",
    p5_Suburb: "ड) उपनगर:",
    p5_Dist: "जिल्हा",
    p5_Pin: "पिन कोड नंबर:",
    p5_RegNo: "इ) हौसिंग सोसायटी रजि. क्र.:",
    p5_MemNo: "ई) हौसिंग सोसायटी सभासद क्र.:",
    p5_CertNo: "शेअर्स सर्टिफिकेट नं.:",
    p5_SharesStart: "उ) हौसिंग सोसायटीचे खरेदी केलेले भाग क्रमांक",
    p5_From: "पासून क्रमांक",
    p5_To: "पर्यंत",
    p5_Area: "४) जागेचे क्षेत्रफळ",
    p5_AreaUnit: "चौ. फूट- बिल्ट अप",
    p5_Carpet: "कार्पेट",
    p5_Super: "सुपरबिल्ट अप",
    p5_Borders: "५) चर्तुःसीमा",
    p5_East: "अ) पूर्वेस:",
    p5_West: "ब) पश्चिमेस:",
    p5_South: "क) दक्षिणेस:",
    p5_North: "ड) उत्तरेस:",
    p5_BuiltYear: "६) इमारत बांधकाम वर्ष सन",
    p5_SurveyNo: "७) सर्वे नंबर",
    p5_HissaNo: "८) हिस्सा नंबर",
    p5_GatNo: "९) गट नंबर",
    p5_Ward: "१०) म्युनिसिपल वॉर्ड/भ्रमण क्र.",
    p5_OC: "११) हौसिंग सोसायटीच्या इमारतीस भोगवटा प्रमाणपत्र (ओ.सी.) मिळाले आहे काय?",
    p5_Yes: "होय",
    p5_No: "नाही",
    p5_Deed: "१२) हौसिंग सोसायटी/प्लॅटचे कन्व्हेयन्स डीड झालेले आहे काय?",
    p5_Price: "१३) घर/रूम/ब्लॉक/प्लॅट ची एकूण खरेदी किंमत ₹",
    p5_Paid: "पैकी दिलेली रक्कम",
    p5_Bal: "देणे बाकी रक्कम",
    p5_Mortgage: "१४) तारणा संबंधी माहिती:",
    p5_GovVal: "१५) मिळकतीची किंमत: अ) शासकीय मूल्यांकन: ₹",
    p5_MarketVal: "ब) बाजारभावा प्रमाणे: ₹",

    // Page 5 - Under Construction
    p5b_1: "१) फर्म/बिल्डर्सचे नाव:",
    p5b_2: "२) तारण घर/रूम/ब्लॉक/प्लॅटचा संपूर्ण पत्ता",
    p5b_3: "३) समक्ष प्राधिकरणाकडून बिल्डिंग प्लॅन मंजूर केला आहे काय?",
    p5b_4: "४) बांधकामाचे स्वरूप",
    p5b_5: "५) जागेचे क्षेत्रफळ",
    p5b_6: "६) चर्तुःसीमा",
    p5b_7: "७) प्लॉट क्र.",
    p5b_8: "८) सर्वे नंबर",
    p5b_9: "९) गट नंबर",
    p5b_10: "१०) हिस्सा नंबर",
    p5b_11: "११) म्युनिसिपल वॉर्ड/भ्रमण क्र.",
    p5b_12: "१२) ॲग्रीमेंट फॉर सेल दिनांक",
    p5b_13: "१३) स्टॅम्प ड्युटी रक्कम ₹",
    p5b_14: "१४) रजिस्ट्रेशन रक्कम ₹",
    p5b_15: "१५) ॲग्रीमेंट फॉर सेल गुसार खरेदी किंमत ₹",

    rulesTitle: "कर्ज विषयक नियम",
    rulesConfirm: "आम्ही वाचलेल्या सही करणाऱ्यांनी वरील सर्व विषयक नियम वाचून व समजावून घेतलेले आहेत. उपरोक्त नमूद नियम आम्हाला मान्य असून, संस्थेचे प्रचलित असलेले व वेळोवेळी अमलात येणारे नियम आम्ह्यांवर बंधनकारक असतील. आम्ही राजी खुशीने वरील सही करीत आहोत.",
    applicantName: "अर्जदाराचे नाव", g1Name: "जामीनदार क्र.१ चे नाव", g2Name: "जामीनदार क्र.२ चे नाव", g3Name: "जामीनदार क्र.३ चे नाव",
    thikan: "ठिकाण:",
    officeUse: "कार्यालयीन कामकाजासाठी",
    memberNoLabel: "सभासद क्र.", appNo: "अर्ज क्र.",
    officeFrom: "यांजेकडून", officeReason: "या कारणासाठी कर्ज मागणी अर्ज मिळाला.",
    officerSign: "शाखाधिकारी / संबंधित निरीक्षक",
    rakkamLabel: "रक्कम ₹",
    rules: null, // uses RULES array
  },
  en: {
    toChairman: "To the Chairman / Board of Directors,",
    formTitle: "Home / Mortgage Loan Application Form",
    formNote: "(Note: Please read the instructions on Page 1 before filling this form.)",
    home: "Home",
    dinank: "Date", shakha: "Branch:",
    saCra: "Member No. / Application No.:", karjKhate: "Loan Account No.:",
    societyDefault: "Sai Prerna", societySuffix: "Co-operative Credit Society Ltd.",
    regNo: "(Registration No. B.O.M./W.A./R.S.R./321/2015-17)",
    officePrefix: "Administrative Office:",
    applicant: "Applicant Mr./Mrs.", vay: "Age", varshe: "Years",
    coApplicant: "Co-Applicant Mr./Mrs.",
    bodyText1: "hereby applies that I require ₹",
    bodyText2: "(In words ₹", bodyText3: "only) as Home/Mortgage Loan. I will repay with interest within",
    bodyText4: "months. First instalment after",
    bodyText5: "months and subsequent instalments on the",
    bodyText6: "date of every month. Purpose of loan:",
    karan: "(Reason)",
    bodyPara1: "I hereby provide all my information as follows.",
    bodyPara2a: "I am married/unmarried. I have",
    bodyPara2b: "dependent family members. I solemnly declare that I have no outstanding loan from any other co-operative society or bank. I will repay the loan as decided by the Board of Directors at the applicable interest rate along with all other charges. I accept all existing and future rules of the Society.",
    bodyPara3: "I am providing the names and details of Society members who have agreed to stand as my guarantors.",
    gLabel: (n) => `${n}) Guarantor Name Mr./Mrs.`,
    requestText: "A humble request to the Board of Directors to consider this loan application.",
    yoursTruly: "Yours faithfully,", sahi: "Signature",
    applicantBorrower: "Applicant (Borrower)",
    boardRemark: "Board of Directors' Remarks",
    directorSign: "Signature of Recommending Director / Local Committee Member",
    boardMeetingDate: "Board Meeting Date:", sabhaNo: "Meeting No.", tharavNo: "Resolution No.",
    sanctionText3: ") loan is hereby sanctioned.",
    gm: "General Manager", vp: "Vice President", president: "President",
    photo: "Photo",
    borrowerTitle: "Borrower's Information",
    g1Title: "Guarantor No. 1 Information", g2Title: "Guarantor No. 2 Information",
    fullName: "1. Full Name: Mr./Mrs.", memberNo: "2. Member Number:",
    sharesQty: "Number of Shares Held", sharesAmt: "Amount ₹",
    fatherName: "3. Father's/Husband's Full Name: Mr.", motherName: "4. Mother's Name: Mrs.",
    address: "5. Residential Address:", pinCode: "PIN Code", phone: "Telephone", mobile: "Mobile", email: "Email:",
    residenceType: "6. Nature of Residence:",
    resOpts: ["Self-Owned", "Building Party", "Pagdi", "Rented", "Company Quarters"],
    stayDuration: "7. Duration of Stay at Current Address:", mahine: "Months", varsha: "Years",
    maritalStatus: "8. Marital Status:", vivahit: "Married", avivahit: "Unmarried",
    dependents: "Number of Dependent Family Members:",
    jobTitle: "9. Employment / Business Details:",
    companyName: "a) Company Name", companyAddr: "Address:",
    companyPin: "PIN Code", companyTel: "Telephone", companyMob: "Mobile", companyEmail: "Email/Website",
    dept: "b) Department:", designation: "Designation", empCode: "Employee Code No.",
    jobDuration: "c) Duration of Employment", retireDate: "d) Retirement Date:",
    incomeTitle: "10. Income Details:",
    salaryLabel: "a) If Salaried: Total Monthly Salary ₹", deductions: "Total Deductions ₹", netSalary: "Net Salary ₹",
    bizIncome: "b) If Business: Annual Income ₹", bizExpense: "Total Expenses (incl. tax) ₹", netAnnual: "Net Annual Income ₹",
    familyIncome: "c) Total Net Family Income ₹", masik: "Monthly", varshik: "Annual",
    landOwner: "11. Home/Farm Owner Name: Mr./Mrs.", naate: "Relation",
    villageAddr: "12. Village Address:", post: "Post", taluka: "Taluka", district: "District", state: "State",
    prevLoan: "13. Details of Previous Loans from Society: Loan Type",
    accountNo: "Account No.", amount: "Amount ₹", loanDate: "Loan Date:", repayDate: "Repayment Date:",
    asGuarantor: "14. Details if Standing as Guarantor:",
    gBorrower: (l) => `${l}) Borrower Name: Mr./Mrs.`,
    loanType: "Loan Type:", accountNum: "Account No.",
    otherBank: "16. Details of Loans from Other Banks: Bank/Institution Name:",
    branch: "Branch",
    declaration: "All the above information is true and correct, and I willingly agree to be a guarantor.",
    place: "Place:", date: "Date", mrMrs: "Mr./Mrs.",
    pn: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20"],
    resaleTitle: "A) Details for Resale Property Purchase",
    constTitle: "B) Details for Under-Construction Property",
    colTitle: "C) Collateral Property Information",
    bizInfoTitle: "Applicant's Business Information",
    totalAnnualIncome: "Total Annual Income", totalAnnualExpense: "Total Annual Expenses (incl. all taxes)", netAnnualIncome: "Net Annual Income",
    regularCustomers: "14) Two Regular Customers:",
    suppliers: "15) Two Regular Suppliers:",
    partnerInfoTitle: "Information to be Filled by Applicant and Partners",
    lifeInsTitle: "1) Life Insurance Details of Applicant/Partner",
    insCompany: "a) Insurance Company Name:", insAddr: "b) Full Address:", insPolicy: "c) Policy Number",
    insPeriod: "d) Insurance Period", from: "From", to: "To",
    insAmt: "e) Insured Amount ₹", insPremium: "f) Premium Amount ₹",
    premiumType: "g) Premium Payment Type:", monthly: "Monthly", quarterly: "Quarterly", halfYearly: "Half Yearly", annual: "Annual",
    policyLoan: "2) Have you taken a loan against the insurance policy? — No", policyLoanDetail: "(If yes, provide details)",
    bankInst: "a) Bank/Institution Name:", fullAddr: "Full Address:",
    loanAmt: "b) Loan Amount ₹", loanDt: "Loan Date", balanceLoan: "c) Outstanding Loan Amount ₹",
    incomeTaxTitle: "3) Income Tax Details — PAN Card Number:",
    taxSince: "a) Paying income tax since: Year",
    fyLabel: "Financial Year", taxAmt: "Income Tax", taxPayDate: "Payment Date",
    san: "Year", te: "to",
    profTaxTitle: "4) Professional Tax Details",
    profTaxNo: "a) Professional Tax Number", profTaxSince: "b) Paying professional tax since: Year",
    profTaxLabel: "Professional Tax",
    // Page 5 - Resale
    p5_1: "1) Vendor Mr./Mrs.",
    p5_2: "2) Address of Property to be Purchased:",
    p5_3a: "a) Housing Society Name / Address:",
    p5_Desc: "3) Description of Property to be Purchased:",
    p5_3aa: "a) House/Room/Block/Flat No.:",
    p5_Floor: "Floor",
    p5_Wing: "Wing",
    p5_Plot: "b) Plot No.:",
    p5_Sector: "Nagar/Sector",
    p5_Road: "c) Road Name:",
    p5_Suburb: "d) Suburb:",
    p5_Dist: "District",
    p5_Pin: "PIN Code:",
    p5_RegNo: "e) Housing Society Reg. No.:",
    p5_MemNo: "f) Housing Society Member No.:",
    p5_CertNo: "Share Certificate No.:",
    p5_SharesStart: "g) Purchased Share Numbers of Society",
    p5_From: "From No.",
    p5_To: "To",
    p5_Area: "4) Area of Property",
    p5_AreaUnit: "Sq. Ft. - Built Up",
    p5_Carpet: "Carpet",
    p5_Super: "Super Built Up",
    p5_Borders: "5) Boundaries",
    p5_East: "a) East:",
    p5_West: "b) West:",
    p5_South: "c) South:",
    p5_North: "d) North:",
    p5_BuiltYear: "6) Building Construction Year",
    p5_SurveyNo: "7) Survey Number",
    p5_HissaNo: "8) Hissa Number",
    p5_GatNo: "9) Gat Number",
    p5_Ward: "10) Municipal Ward/Circle No.",
    p5_OC: "11) Has the housing society's building received Occupancy Certificate (O.C.)?",
    p5_Yes: "Yes",
    p5_No: "No",
    p5_Deed: "12) Has the Conveyance Deed of society/flat been done?",
    p5_Price: "13) Total Purchase Price of House/Room/Block/Flat ₹",
    p5_Paid: "Amount Paid thereof",
    p5_Bal: "Balance Amount Payable",
    p5_Mortgage: "14) Details regarding Mortgage:",
    p5_GovVal: "15) Property Valuation: a) Government Valuation: ₹",
    p5_MarketVal: "b) As per Market Value: ₹",

    // Page 5 - Under Construction
    p5b_1: "1) Firm/Builder's Name:",
    p5b_2: "2) Full Address of Mortgaged House/Room/Block/Flat",
    p5b_3: "3) Has the building plan been approved by the competent authority?",
    p5b_4: "4) Nature of Construction",
    p5b_5: "5) Area of Property",
    p5b_6: "6) Boundaries",
    p5b_7: "7) Plot No.",
    p5b_8: "8) Survey Number",
    p5b_9: "9) Gat Number",
    p5b_10: "10) Hissa Number",
    p5b_11: "11) Municipal Ward/Circle No.",
    p5b_12: "12) Agreement for Sale Date",
    p5b_13: "13) Stamp Duty Amount ₹",
    p5b_14: "14) Registration Amount ₹",
    p5b_15: "15) As per Agreement for Sale Purchase Value ₹",

    rulesTitle: "Loan Terms & Rules",
    rulesConfirm: "We, the undersigned, have read and understood the above loan terms and rules. We accept these rules and all current and future rules enforced by the Society shall be binding on us. We are signing this of our own free will.",
    applicantName: "Applicant's Name", g1Name: "Guarantor No.1 Name", g2Name: "Guarantor No.2 Name", g3Name: "Guarantor No.3 Name",
    thikan: "Place:",
    officeUse: "For Office Use",
    memberNoLabel: "Member No.", appNo: "Application No.",
    officeFrom: "from", officeReason: "loan application received for this purpose.",
    officerSign: "Branch Officer / Concerned Clerk",
    rakkamLabel: "Amount ₹",
    rules: null,
  }
};

/* ─── Tiny helpers ────────────────────────────────────────────────────────── */
const IL = ({ value = "", cls = "" }) => (
  <span className={`inline-field ${cls}`}>{value}</span>
);

const FL = ({ value = "", style }) => (
  <span className="field-line" style={{ ...style, display: "inline-block", borderBottom: "1px solid #333", minHeight: "18px", padding: "0 4px" }}>
    {value}
  </span>
);

const CharBox = ({ value = "", n = 8 }) => {
  const chars = String(value || "").padEnd(n, " ").split("").slice(0, n);
  return (
    <span className="field-box">
      {chars.map((char, i) => (
        <span key={i} style={{ width: 22, height: 20, border: "1px solid #333", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
          {char}
        </span>
      ))}
    </span>
  );
};

const CB = ({ checked }) => (
  <input type="checkbox" checked={!!checked} readOnly style={{ transform: "scale(1.1)", margin: "0 4px" }} />
);
const Divider = ({ type = "divider" }) => <hr className={type} />;
const SectionPink = ({ children, style }) => (
  <div className="section-header-pink" style={style}>{children}</div>
);
const PageNum = ({ n }) => <div className="page-num">{n}</div>;
const FieldRow = ({ children, style }) => (
  <div className="field-row" style={style}>{children}</div>
);

/* ─── Data Resolution Helpers ───────────────────────────────────────────── */
/**
 * Universal resolver — works with THREE data sources:
 * 1. Flat local form state (e.g., data.bNaav, data.flatNo)
 * 2. Nested DB entity paths (e.g., data.Property.BoundaryEast) — legacy multi-table
 * 3. FormData from raw_json (e.g., data.FormData.Borrower.FullName)
 *    This is the NEW single-table approach where the entire payload is stored as JSON.
 */
const resolveValue = (data, legacyKey, entityPath) => {
  if (!data) return "";

  // Helper: case-insensitive deep lookup (supports array indices like "Guarantors.0.FullName")
  const deepGet = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
      if (!current || typeof current !== "object") return undefined;
      if (/^\d+$/.test(part)) {
        current = Array.isArray(current) ? current[parseInt(part)] : undefined;
      } else {
        const actualKey = Object.keys(current).find(k => k.toLowerCase() === part.toLowerCase());
        current = actualKey !== undefined ? current[actualKey] : undefined;
      }
    }
    return current;
  };

  // 1. Try legacy key (flat state from form)
  if (legacyKey && data[legacyKey] !== undefined && data[legacyKey] !== null && data[legacyKey] !== "") {
    return data[legacyKey];
  }

  // 2. Try entity path on data directly (legacy multi-table)
  if (entityPath) {
    const directVal = deepGet(data, entityPath);
    if (directVal !== undefined && directVal !== null && directVal !== "") return directVal;
  }

  // 3. Try FormData from raw_json (new single-table approach)
  const formData = data.FormData || data.formData;
  if (formData) {
    if (legacyKey && formData[legacyKey] !== undefined && formData[legacyKey] !== null && formData[legacyKey] !== "") {
      return formData[legacyKey];
    }
    if (entityPath) {
      const fdVal = deepGet(formData, entityPath);
      if (fdVal !== undefined && fdVal !== null && fdVal !== "") return fdVal;
    }
  }

  return "";
};

/**
 * Safely parse JSON strings from DB or return the object if already parsed
 */
const safeParse = (val, defaultVal = []) => {
  if (!val) return defaultVal;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error("Failed to parse JSON", val);
    return defaultVal;
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1 — कर्ज मागणी अर्ज
══════════════════════════════════════════════════════════════════════════ */
function Page1({ data = {}, clientInfo = {}, L, pageNum, lang = "mr" }) {

  const d = data;
  const resolve = (lk, ep) => resolveValue(d, lk, ep);

  let [y, m, day] = ["", "", ""];
  const dinank = resolve('dinank', 'ApplicationDate');
  if (dinank) {
    if (dinank.includes("-")) {
      [y, m, day] = dinank.split("-");
    } else if (dinank.includes("/")) {
      [day, m, y] = dinank.split("/");
    }
  }

  return (
    <div className="page" style={{ padding: "8mm 10mm" }}>
      <div style={{ fontSize: 9, color: "#333", marginBottom: 2 }}>{L.toChairman}</div>

      {/* Header Area */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2, position: "relative" }}>
        {/* Logo Section */}
        <div style={{ width: 60, height: 60, border: "2px solid var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ width: 50, height: 50, border: "1px solid var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 10, color: "var(--primary)" }}>
            AVS
          </div>
        </div>

        {/* Center Title */}
        <div style={{ flex: 1, textAlign: "center", marginTop: 4 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--primary)", margin: 0, textDecoration: "underline" }}>
            {L.formTitle}
          </h1>
          <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>{L.formNote}</div>
        </div>

        {/* Right Module Tag and App No */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 16, fontStyle: "italic", color: "var(--primary)", fontWeight: 700 }}>{L.home}</div>
          {resolve('applicationNo', 'ApplicationNo') && (
            <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>App No: <strong>{resolve('applicationNo', 'ApplicationNo')}</strong></div>
          )}
        </div>
      </div>

      {/* Date and Branch Row */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, fontSize: 10, marginBottom: 4, marginTop: 4 }}>
        <span>{L.dinank} <IL value={day} cls="inline-field-sm" /> / <IL value={m} cls="inline-field-sm" /> / <IL value={y} cls="inline-field-sm" /></span>
      </div>

      {/* Society Branding + Account Boxes */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "var(--primary)" }}>{clientInfo?.name || L.societyDefault || "AVS AI 360 Admin"}</div>
          <div style={{ fontSize: 8.5, color: "#444", fontWeight: 500 }}>{L.regNo}</div>
        </div>
        <div style={{ fontSize: 10, textAlign: "right", display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", columnGap: 10, rowGap: 6 }}>
          <span>{L.saCra}</span>
          <CharBox value={resolve('saCra', 'MemberNo')} />
          <span>{L.karjKhate}</span>
          <CharBox value={resolve('karjKhate', 'LoanAccountNo')} />
          <div style={{ paddingTop: 4 }}>{L.shakha}</div>
          <div style={{ textAlign: "left", minWidth: 100, fontWeight: 600, paddingTop: 4 }}>{resolve('shakha', 'Branch')}</div>
        </div>
      </div>

      <div style={{ fontSize: 8.5, color: "var(--primary)", fontWeight: 700, marginBottom: 10 }}>
        {L.officePrefix} {L.officeAddr}
      </div>

      <hr style={{ border: "none", borderBottom: "2px solid var(--primary)", marginBottom: 15 }} />

      <div style={{ fontSize: 10, marginBottom: 10, fontWeight: "normal" }}>महोदय,</div>

      {/* Applicants Info */}
      <div style={{ fontSize: 10.5, lineHeight: 1.9, marginTop: 4 }}>
        <FieldRow>
          <span style={{ fontWeight: "normal" }}>{L.applicant}:</span>
          <FL value={resolve('arjdarNaav', 'ApplicantName')} />
          <span style={{ marginLeft: 16 }}>{L.vay}:</span>
          <IL value={resolve('arjdarVay', 'ApplicantAge')} cls="inline-field-sm" />
          <span>{L.varshe}</span>
        </FieldRow>

        <FieldRow>
          <span style={{ fontWeight: "normal" }}>{L.coApplicant}:</span>
          <FL value={resolve('saharjdarNaav', 'CoApplicantName')} />
          <span style={{ marginLeft: 16 }}>{L.vay}:</span>
          <IL value={resolve('saharjdarVay', 'CoApplicantAge')} cls="inline-field-sm" />
          <span>{L.varshe}</span>
        </FieldRow>
      </div>

      {/* Body text */}
      <div style={{ fontSize: 10, lineHeight: 2.4, marginTop: 12 }}>
        {lang === 'mr' ? (
          <>
            {L.bodyText1} <IL value={resolve('karjRakkam', 'LoanAmountNum')} cls="inline-field-lg" />
            {L.bodyText2} <IL value={resolve('akshari', 'LoanAmountWords')} cls="inline-field-xl" />
            {L.bodyText3} <IL value={resolve('paratfedKalavadhi', 'RepaymentMonths')} cls="inline-field-sm" /> {L.bodyText4}
            <IL value={resolve('pahilaHapta', 'FirstInstalment')} cls="inline-field-sm" /> {L.bodyText5}
            <IL value={resolve('tarikh', 'InstalmentDate')} cls="inline-field-sm" /> {L.bodyText6} <FL value={resolve('karan', 'LoanPurpose')} style={{ maxWidth: 700, minWidth: 550 }} /> {L.bodyPara1}
          </>
        ) : (
          <>
            {L.bodyText1} ₹ <IL value={resolve('karjRakkam', 'LoanAmountNum')} cls="inline-field-lg" />
            {L.bodyText2} <IL value={resolve('akshari', 'LoanAmountWords')} cls="inline-field-xl" /> {L.bodyText3}
            <IL value={resolve('paratfedKalavadhi', 'RepaymentMonths')} cls="inline-field-sm" /> {L.bodyText4}
            <IL value={resolve('pahilaHapta', 'FirstInstalment')} cls="inline-field-sm" /> {L.bodyText5}
            <IL value={resolve('tarikh', 'InstalmentDate')} cls="inline-field-sm" /> {L.bodyText6} <FL value={resolve('karan', 'LoanPurpose')} style={{ maxWidth: 300, minWidth: 150 }} /> {L.bodyPara1}
          </>
        )}
      </div>

      <div style={{ fontSize: 10, lineHeight: 2.4, marginTop: 6 }}>
        {lang === 'mr' ? (
          <>
            {L.bodyPara2a} <IL value={resolve('avalambuun', 'DependentCount')} cls="inline-field-sm" /> {L.bodyPara2b}
          </>
        ) : (
          <>
            {L.bodyPara2a} <IL value={resolve('avalambuun', 'DependentCount')} cls="inline-field-sm" /> {L.bodyPara2b}
          </>
        )}
      </div>

      <div style={{ fontSize: 10.5, lineHeight: 2.4, marginTop: 8 }}>
        {L.bodyPara3}
      </div>

      {/* Guarantors */}
      <div style={{ marginTop: 8 }}>
        {(() => {
          const getG = (idx) => {
            const legacyNames = ['jameen1Naav', 'jameen2Naav', 'jameen3Naav'];
            const legacyAges = ['jameen1Vay', 'jameen2Vay', 'jameen3Vay'];
            const epNames = ['Guarantor1Name', 'Guarantor2Name', 'Guarantor3Name', 'Guarantor4Name'];
            const epAges = ['Guarantor1Age', 'Guarantor2Age', 'Guarantor3Age', 'Guarantor4Age'];
            let name = resolve(legacyNames[idx] || '', epNames[idx] || '');
            let age = resolve(legacyAges[idx] || '', epAges[idx] || '');

            if (!name) {
              const extraGs = data.extraGuarantors || (data.formData?.extraGuarantors) || (data.Guarantors ? data.Guarantors : []);
              const gObj = (idx < 2) ? (data.Guarantors?.[idx]) : (extraGs[idx - 2] || data.Guarantors?.[idx]);
              if (gObj) {
                name = gObj.FullName || gObj.Naav || gObj.naav || gObj.fullName || '';
                age = gObj.Age || gObj.Vay || gObj.age || gObj.vay || '';
              }
            }
            return { n: (name || "").trim(), a: (age || "").trim() };
          };

          const gs = [];
          for (let i = 0; i < 4; i++) {
            const g = getG(i);
            if (i < 2 || g.n) {
              gs.push({ num: L.pn[i] || `${i + 1}`, ...g });
            }
          }

          return gs.map((g, idx) => (
            <div key={idx} className="field-row" style={{ fontSize: 10.5, marginBottom: 2 }}>
              <span>{g.num}) {lang === 'mr' ? 'जामिनदाराचे नाव श्री./श्रीमती' : 'Guarantor Name Mr./Mrs.'}</span>
              <FL value={g.n} />
              <span style={{ marginLeft: 8 }}>{L.vay}</span>
              <IL value={g.a} cls="inline-field-sm" />
              <span>{L.varshe}</span>
            </div>
          ));
        })()}
      </div>

      <div style={{ fontSize: 10.5, marginTop: 20 }}>{L.requestText}</div>

      {/* Signature Block per Image */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <div style={{ textAlign: "left", minWidth: 280 }}>
          <div style={{ fontSize: 10, textAlign: "center" }}>{L.yoursTruly}</div>
          <div style={{ fontSize: 10, marginTop: 25 }}>{L.sahi}</div>
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: 16 }}>
            <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>{lang === 'mr' ? 'श्री./श्रीमती :' : 'Mr./Mrs. :'}</span>
            <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 4, textAlign: "center", fontSize: 10.5, paddingBottom: 2 }}>{resolve('arjdarNaav', 'ApplicantName')}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 10, marginTop: 10, fontWeight: "bold" }}>{L.applicantBorrower}</div>
        </div>
      </div>

      <Divider style={{ borderBottom: "3px double #333", borderTop: "none", height: 2, margin: "25px 0" }} />

      {/* Board Remarks Footer per Image */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: "bold", paddingTop: 35 }}>
        <span>{L.boardRemark}</span>
        <span>{L.directorSign}</span>
      </div>

      <hr style={{ border: "none", borderBottom: "1px solid #333", margin: "10px 0 14px 0" }} />
      <div style={{ borderBottom: "1px solid #333", marginBottom: 20, marginTop: 5, height: 16 }}>&nbsp;</div>

      {/* Meeting Details Row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 12 }}>
        <div>
          {L.boardMeetingDate} &nbsp;
          <span style={{ borderBottom: "1px solid #333", minWidth: 30, display: "inline-block" }}>{resolve('boardMeetingDate', '')}</span> /
          <span style={{ borderBottom: "1px solid #333", minWidth: 30, display: "inline-block" }}>&nbsp;</span> / २०
        </div>
        <div>{L.sabhaNo} <span style={{ borderBottom: "1px solid #333", minWidth: 100, display: "inline-block", textAlign: "center" }}>{resolve('meetingNo', '')}</span></div>
        <div>{L.tharavNo} <span style={{ borderBottom: "1px solid #333", minWidth: 100, display: "inline-block", textAlign: "center" }}>{resolve('resolutionNo', '')}</span></div>
      </div>

      {/* Approval amount row */}
      <div style={{ fontSize: 10, marginBottom: 12, marginTop: 25 }}>
        {L.sanctionText} <span style={{ borderBottom: "1px solid #333", minWidth: 120, display: "inline-block", textAlign: "center" }}>{resolve('sanctionAmount', '')}</span> (अक्षरी ₹ <span style={{ borderBottom: "1px solid #333", minWidth: 280, display: "inline-block", textAlign: "center" }}>{resolve('sanctionWords', '')}</span> {L.sanctionText3}
      </div>

      {/* Footer Authorities spaced per image */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60, fontSize: 10.5, fontWeight: "bold" }}>
        <span style={{ minWidth: 110, textAlign: "center" }}>शाखाधिकारी</span>
        <span style={{ minWidth: 110, textAlign: "center" }}>{L.gm}</span>
        <span style={{ minWidth: 110, textAlign: "center" }}>{L.vp}</span>
        <span style={{ minWidth: 110, textAlign: "center" }}>{L.president}</span>
      </div>

      <PageNum n={pageNum} />
    </div>
  );

}

/* ══════════════════════════════════════════════════════════════════════════
   Reusable: Person block (Pages 2, 3, 4)
══════════════════════════════════════════════════════════════════════════ */
function PersonPage({ title, pageNum, data = {}, prefix = "b", showDeclaration = false, L, lang = "mr", mainData = {} }) {
  const d = data;
  const p = prefix; // 'b', 'g1', 'g2'

  const resolve = (lk, ep) => {
    let baseEp = "";
    if (p === 'b') baseEp = "Borrower.";
    else if (p === 'g1') baseEp = "Guarantors.0.";
    else if (p === 'g2') baseEp = "Guarantors.1.";
    else if (p === 'g3') baseEp = "Guarantors.2.";
    return resolveValue(d, lk, ep ? `${baseEp}${ep}` : null);
  };

  const pb = (key) => resolve(p + key, key);
  const formatDate = (raw) => {
    if (!raw) return "";
    const pts = String(raw).split("-");
    if (pts.length === 3) return `${pts[2]}/${pts[1]}/${pts[0]}`;
    return raw;
  };

  const marathiNums = L.pn || ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२"];

  return (
    <div className="page">
      {/* Photo + header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        <div className="photo-box" style={{ width: 70, height: 85 }}>
          {resolve(p + "Photo", "Photo") ? <img src={resolve(p + "Photo", "Photo")} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : L.photo}
        </div>
        <div style={{ flex: 1 }}>
          <SectionPink style={{ textAlign: "center", marginBottom: 10 }}>{title}</SectionPink>
          <div style={{ fontSize: 10 }}>
            <FieldRow>
              <span>{L.fullName}</span><FL value={resolve(p + "Naav", "FullName")} />
              <span>{L.vay}</span><FL value={resolve(p + "Vay", "Age")} style={{ maxWidth: 40 }} /><span>{L.varshe}</span>
            </FieldRow>
            <FieldRow>
              <span>{L.memberNo}</span><FL value={resolve(p + "SabasadNo", "MemberNo")} style={{ maxWidth: 100 }} />
              <span>{L.sharesQty}</span><FL value={resolve(p + "Shares", "SharesCount")} style={{ maxWidth: 80 }} />
              <span>{L.sharesAmt}</span><FL value={resolve(p + "SharesRakkam", "SharesAmount")} style={{ maxWidth: 70 }} />
            </FieldRow>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 9.5, lineHeight: 1.2 }}>
        <FieldRow><span>{L.fatherName}</span><FL value={resolve(p + "VadilNaav", "FatherName")} /><span>{L.vay}</span><FL value={resolve(p + "VadilVay", "FatherAge")} style={{ maxWidth: 40 }} /><span>{L.varshe}</span></FieldRow>
        <FieldRow><span>{L.motherName}</span><FL value={resolve(p + "AaiNaav", "MotherName")} /><span>{L.vay}</span><FL value={resolve(p + "AaiVay", "MotherAge")} style={{ maxWidth: 40 }} /><span>{L.varshe}</span></FieldRow>
        <div style={{ display: "flex", alignItems: "flex-start", marginTop: 4, marginBottom: 4 }}>
          <span style={{ width: 130, flexShrink: 0, fontSize: 10 }}>{L.address}</span>
          <div style={{
            flex: 1,
            fontSize: 9.5,
            lineHeight: "22px",
            backgroundImage: "linear-gradient(transparent 21px, #333 21px)",
            backgroundSize: "100% 22px",
            minHeight: 22,
            padding: "0 4px",
            wordBreak: "break-word"
          }}>
            {resolve(p + "Patta", "Address")}
          </div>
        </div>

        {p === 'b' && (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", marginTop: 4, marginBottom: 4 }}>
              <span style={{ width: 130, flexShrink: 0, fontSize: 10 }}>{lang === 'mr' ? 'ऑफिस पत्ता:' : 'Office Address:'}</span>
              <div style={{
                flex: 1,
                fontSize: 9.5,
                lineHeight: "22px",
                backgroundImage: "linear-gradient(transparent 21px, #333 21px)",
                backgroundSize: "100% 22px",
                minHeight: 22,
                padding: "0 4px",
                wordBreak: "break-word"
              }}>
                {resolve(p + "OfficeAddress", "OfficeAddress")}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", marginTop: 4, marginBottom: 4 }}>
              <span style={{ width: 130, flexShrink: 0, fontSize: 10 }}>{lang === 'mr' ? 'गावचा पत्ता:' : 'Gavcha Address:'}</span>
              <div style={{
                flex: 1,
                fontSize: 9.5,
                lineHeight: "22px",
                backgroundImage: "linear-gradient(transparent 21px, #333 21px)",
                backgroundSize: "100% 22px",
                minHeight: 22,
                padding: "0 4px",
                wordBreak: "break-word"
              }}>
                {resolve(p + "GavchaAddress", "GavchaAddress")}
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 2, marginTop: 6 }}>
          <span>{L.pinCode} <IL value={resolve(p + "PinKod", "PinCode")} cls="inline-field-sm" /></span>
          <span>{L.phone} <IL value={resolve(p + "Durdhvani", "Phone")} cls="inline-field-lg" /></span>
          <span>{L.mobile} <IL value={resolve(p + "Mobile", "Mobile")} cls="inline-field-lg" /></span>
          <span>{L.email} <IL value={resolve(p + "Email", "Email")} cls="inline-field-lg" /></span>
        </div>

        <div style={{ marginBottom: 2, marginTop: 6 }}>
          {L.residenceType}
          {L.resOpts[0]} <CB checked={String(resolve(p + "JageSwaarup", "ResidenceType")).includes("स्वःमालकीचे") || String(resolve(p + "JageSwaarup", "ResidenceType")).includes(L.resOpts[0])} />
          {L.resOpts[1]} <CB checked={String(resolve(p + "JageSwaarup", "ResidenceType")).includes("बिल्डिंगपार्टि") || String(resolve(p + "JageSwaarup", "ResidenceType")).includes(L.resOpts[1])} />
          {L.resOpts[2]} <CB checked={String(resolve(p + "JageSwaarup", "ResidenceType")).includes("पागडीची") || String(resolve(p + "JageSwaarup", "ResidenceType")).includes(L.resOpts[2])} />
          {L.resOpts[3]} <CB checked={String(resolve(p + "JageSwaarup", "ResidenceType")).includes("भाडेतत्त्वावर") || String(resolve(p + "JageSwaarup", "ResidenceType")).includes(L.resOpts[3])} />
          {L.resOpts[4]} <CB checked={String(resolve(p + "JageSwaarup", "ResidenceType")).includes("कंपनी क्वार्टर्स") || String(resolve(p + "JageSwaarup", "ResidenceType")).includes(L.resOpts[4])} />
        </div>

        <FieldRow>
          <span>{L.stayDuration}</span>
          <FL value={resolve(p + "Kalavadhi_m", "StayMonths")} style={{ maxWidth: 50 }} /><span>{L.mahine}</span>
          <FL value={resolve(p + "Kalavadhi_v", "StayYears")} style={{ maxWidth: 50 }} /><span>{L.varsha}</span>
        </FieldRow>

        <div style={{ marginBottom: 4 }}>
          {L.maritalStatus} {L.vivahit} <CB checked={resolve(p + "Vaivahik", "MaritalStatus") === L.vivahit || resolve(p + "Vaivahik", "MaritalStatus") === "विवाहित"} /> {L.avivahit} <CB checked={resolve(p + "Vaivahik", "MaritalStatus") === L.avivahit || resolve(p + "Vaivahik", "MaritalStatus") === "अविवाहित"} />
          {L.dependents} <IL value={resolve(p + "Avalambun", "Dependents")} cls="inline-field-sm" />
        </div>

        {/* Job */}
        <div style={{ fontWeight: 600, marginBottom: 3 }}>{L.jobTitle}</div>
        <div style={{ marginLeft: 10 }}>
          <FieldRow><span>{L.companyName}</span><FL value={resolve(p + "Company", "Company")} /></FieldRow>
          <FieldRow><span>{L.companyAddr}</span><FL value={resolve(p + "CompanyPatta", "CompanyAddress")} /></FieldRow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
            <span>{L.companyPin} <IL value={resolve(p + "CompanyPin", "CompanyPin")} cls="inline-field-sm" /></span>
            <span>{L.companyTel} <IL value={resolve(p + "CompanyTel", "CompanyTel")} cls="inline-field-lg" /></span>
            <span>{L.mobile} <IL value={resolve(p + "CompanyMobile", "CompanyMobile")} cls="inline-field-lg" /></span>
            <span>{L.companyEmail} <IL value={resolve(p + "CompanyEmail", "CompanyEmail")} cls="inline-field-lg" /></span>
          </div>
          <FieldRow>
            <span>{L.dept}</span><FL value={resolve(p + "Vibhag", "Department")} />
            <span>{L.designation}</span><FL value={resolve(p + "Hudda", "Designation")} />
            <span>{L.empCode}</span><FL value={resolve(p + "EmpCode", "EmployeeCode")} style={{ maxWidth: 80 }} />
          </FieldRow>
          <FieldRow>
            <span>{L.jobDuration}</span>
            <FL value={resolve(p + "Karj_m", "JobMonths")} style={{ maxWidth: 50 }} /><span>{L.mahine}</span>
            <FL value={resolve(p + "Karj_v", "JobYears")} style={{ maxWidth: 50 }} /><span>{L.varsha}</span>
            <span>{L.retireDate}</span>
            <IL value={formatDate(resolve(p + "Seva", "RetirementDate"))} cls="inline-field-sm" />
          </FieldRow>
        </div>

        {/* Income */}
        <div style={{ fontWeight: 600, marginTop: 4, marginBottom: 3 }}>{L.incomeTitle}</div>
        <div style={{ marginLeft: 10, fontSize: 10 }}>
          <FieldRow>
            <span>{L.salaryLabel}</span><FL value={resolve(p + "MonthlyVetan", "MonthlySalary")} style={{ maxWidth: 80 }} />
            <span>{L.deductions}</span><FL value={resolve(p + "Kapat", "Deductions")} style={{ maxWidth: 70 }} />
            <span>{L.netSalary}</span><FL value={resolve(p + "Niwal", "NetSalary")} style={{ maxWidth: 70 }} />
          </FieldRow>
          <FieldRow>
            <span>{L.bizIncome}</span><FL value={resolve(p + "Vaarshik", "AnnualIncome")} style={{ maxWidth: 80 }} />
            <span>{L.bizExpense}</span><FL value={resolve(p + "Kharcha", "AnnualExpenses")} style={{ maxWidth: 70 }} />
            <span>{L.netAnnual}</span><FL value={resolve(p + "NiwalVaarshik", "NetAnnualIncome")} style={{ maxWidth: 70 }} />
          </FieldRow>
          <FieldRow>
            <span>{L.familyIncome}</span><FL value={resolve(p + "Kutumb", "FamilyIncome")} style={{ maxWidth: 80 }} />
            <span>{L.masik} <CB checked={resolve(p + "KutumbType", "FamilyIncomeType") === L.masik || resolve(p + "KutumbType", "FamilyIncomeType") === "मासिक"} /> {L.varshik} <CB checked={resolve(p + "KutumbType", "FamilyIncomeType") === L.varshik || resolve(p + "KutumbType", "FamilyIncomeType") === "वार्षिक"} /></span>
          </FieldRow>
        </div>

        {/* Sheeti */}
        <FieldRow style={{ marginTop: 4 }}>
          <span>{L.landOwner}</span><FL value={resolve(p + "ShetiNaav", "LandOwnerName")} />
          <span>{L.naate}</span><FL value={resolve(p + "ShetiNaate", "LandOwnerRelation")} style={{ maxWidth: 80 }} />
        </FieldRow>

        {/* Village address */}
        <div style={{ marginTop: 3 }}>
          <FieldRow>
            <span>{L.villageAddr}</span><FL value={resolve(p + "GaavMukkam", "Village")} />
            <span>{L.post}</span><FL value={resolve(p + "GaavPost", "Post")} /><span>{L.taluka}</span><FL value={resolve(p + "GaavTaluka", "Taluka")} /><span>{L.district}</span><FL value={resolve(p + "GaavJilha", "District")} /><span>{L.state}</span><FL value={resolve(p + "GaavRajya", "State")} style={{ maxWidth: 60 }} />
          </FieldRow>
          <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
            <span>{L.pinCode} <IL value={resolve(p + "GaavPin", "VillagePin")} cls="inline-field-sm" /></span>
            <span>{L.mobile} <IL value={resolve(p + "GaavMobile", "VillageMobile")} cls="inline-field-lg" /></span>
          </div>
        </div>

        {/* 93 Previous loan */}
        <div style={{ marginTop: 3 }}>
          {(() => {
            const jsonStr = resolve(null, "PrevLoansJson");
            const rows = safeParse(jsonStr);
            const first = rows[0] || {};
            return (
              <>
                <FieldRow>
                  <span>{L.prevLoan}</span><FL value={resolve(p + "PurvKarjPrakar", "") || first.type || first.t} />
                  <span>{L.accountNo}</span><FL value={resolve(p + "PurvKhate", "") || first.account || first.a} style={{ maxWidth: 80 }} />
                  <span>{L.amount}</span><FL value={resolve(p + "PurvRakkam", "") || first.amount || first.r} style={{ maxWidth: 70 }} />
                </FieldRow>
                <div style={{ display: "flex", gap: 20, marginBottom: 4, marginLeft: 10 }}>
                  <span>{L.loanDate} <IL value={formatDate(resolve(p + "PurvDin1", "") || first.d1 || "")} cls="inline-field-sm" /></span>
                  <span>{L.repayDate} <IL value={formatDate(resolve(p + "PurvDin2", "") || first.d2 || "")} cls="inline-field-sm" /></span>
                </div>
              </>
            );
          })()}
        </div>

        {/* 94 As guarantor */}
        <div style={{ fontWeight: 600, marginTop: 4, marginBottom: 3 }}>{L.asGuarantor}</div>
        <div style={{ marginLeft: 10 }}>
          {(() => {
            const jsonStr = resolve(null, "GuarantorLoansJson");
            const rows = safeParse(jsonStr);
            return ["a", "b"].map((ltr, idx) => {
              const row = rows[idx] || {};
              const ltrTxt = idx === 0 ? "अ" : "ब";
              return (
                <div key={ltr}>
                  <FieldRow><span>{lang === 'mr' ? ltrTxt + ')' : (idx + 1) + ')'} {L.gBorrower('')}</span><FL value={resolve(p + "Jam94" + ltr + "KarjdarNaav", "") || row.n || row.name} /></FieldRow>
                  <FieldRow>
                    <span>{L.loanType}</span><FL value={resolve(p + "Jam94" + ltr + "Prakar", "") || row.t || row.type} /><span>{L.accountNum}</span><FL value={resolve(p + "Jam94" + ltr + "Khate", "") || row.a || row.account} /><span>{L.amount}</span><FL value={resolve(p + "Jam94" + ltr + "Rakkam", "") || row.r || row.amount} style={{ maxWidth: 70 }} />
                  </FieldRow>
                  <div style={{ display: "flex", gap: 20, marginBottom: 5 }}>
                    <span>{L.loanDate} <IL value={formatDate(resolve(p + "Jam94" + ltr + "Din1", "") || row.d1 || "")} cls="inline-field-sm" /></span>
                    <span>{L.repayDate} <IL value={formatDate(resolve(p + "Jam94" + ltr + "Din2", "") || row.d2 || "")} cls="inline-field-sm" /></span>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* 95 Family member loans */}
        <div style={{ fontWeight: 600, marginTop: 4, marginBottom: 3 }}>९५. {lang === "mr" ? "कुटुंब सदस्यांचे संस्थेकडील कर्ज:" : "Family Member Loans from Society:"}</div>
        <div style={{ marginLeft: 10 }}>
          <FieldRow>
            <span>{lang === "mr" ? "नाव:" : "Name:"}</span><FL value={resolve(p + "Kutumb95Naav", "")} />
            <span>{L.loanType}</span><FL value={resolve(p + "Kutumb95Prakar", "")} />
          </FieldRow>
          <FieldRow>
            <span>{L.accountNum}</span><FL value={resolve(p + "Kutumb95Khate", "")} />
            <span>{L.amount}</span><FL value={resolve(p + "Kutumb95Rakkam", "")} style={{ maxWidth: 70 }} />
          </FieldRow>
          <div style={{ display: "flex", gap: 20, marginBottom: 4 }}>
            <span>{L.loanDate} <IL value={formatDate(resolve(p + "Kutumb95Din1", ""))} cls="inline-field-sm" /></span>
            <span>{L.repayDate} <IL value={formatDate(resolve(p + "Kutumb95Din2", ""))} cls="inline-field-sm" /></span>
          </div>
        </div>

        {/* 96 Other bank */}
        <div style={{ fontWeight: 600, marginTop: 4 }}>९६. {L.otherBank}</div>
        <FieldRow style={{ marginTop: 3 }}>
          <span>{L.bankInst}</span><FL value={resolve(p + "Bank96Naav", "OtherBankName")} />
          <span>{L.branch}</span><FL value={resolve(p + "Bank96Shakha", "OtherBankBranch")} style={{ maxWidth: 80 }} />
        </FieldRow>
        <FieldRow style={{ marginLeft: 10 }}>
          <span>{L.loanType}</span><FL value={resolve(p + "Bank96Prakar", "OtherBankType")} /><span>{L.accountNum}</span><FL value={resolve(p + "Bank96Khate", "OtherBankAccount")} /><span>{L.amount}</span><FL value={resolve(p + "Bank96Rakkam", "OtherBankAmount")} style={{ maxWidth: 70 }} />
        </FieldRow>
        <div style={{ display: "flex", gap: 20, marginBottom: 10, marginLeft: 10 }}>
          <span>{L.loanDate} <IL value={formatDate(resolve(p + "Bank96Din1", "OtherBankLoanDate"))} cls="inline-field-sm" /></span>
          <span>{L.repayDate} <IL value={formatDate(resolve(p + "Bank96Din2", "OtherBankRepayDate"))} cls="inline-field-sm" /></span>
        </div>
      </div>

      {showDeclaration && (
        <div style={{ fontSize: 10, marginTop: 6, fontStyle: "italic" }}>
          {L.declaration}
        </div>
      )}

      <div style={{ marginLeft: 500, fontSize: 10.5, marginTop: 15 }}>{L.sahi}</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 16, paddingTop: 4 }}>
        <span>{L.place} <IL value={resolve(p + "Thikan", "Branch")} cls="inline-field-lg" /></span>
        <span>{L.date} <IL value={formatDate(resolve(p + "Dinank", "ApplicationDate") || mainData?.dinank)} cls="inline-field-sm" /></span>
        <span style={{ minWidth: 160 }}>{L.mrMrs} <IL value={resolve(p + "Naav", "FullName")} /></span>
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 5 — Property details (Resale + Under-construction)
══════════════════════════════════════════════════════════════════════════ */
function Page5({ data = {}, L, pageNum }) {
  const d = data;
  const resolve = (lk, ep) => resolveValue(d, lk, ep ? `Property.${ep}` : null);

  // Resolve propertyType
  const pType = resolve('propertyType', 'PropertyType');
  const isResale = String(pType).toLowerCase() === 'resale';

  if (isResale) {
    return (
      <div className="page">
        <SectionPink style={{ textAlign: "center", marginBottom: 6 }}>{L.resaleTitle}</SectionPink>
        <div style={{ fontSize: 10.5 }}>
          <FieldRow>
            <span>{L.p5_1}</span><FL value={resolve('vikretaNaav', 'VendorName')} />
            <span>{L.vay}</span><FL value={resolve('vikretaVay', 'VendorAge')} style={{ maxWidth: 40 }} /><span>{L.varshe}</span>
          </FieldRow>
          <FieldRow><span>{L.p5_2}</span><FL value={resolve('milkatPatta', 'PropertyAddress')} /></FieldRow>
          <FieldRow><span>{L.p5_3a}</span><FL value={resolve('housingNaav', 'HousingSocietyName')} /></FieldRow>
          <FieldRow><span style={{ minWidth: 60 }} /><FL value={resolve('milkatPatta', 'PropertyAddress')} /></FieldRow>

          <div style={{ fontWeight: 600, marginTop: 5, marginBottom: 3 }}>{L.p5_Desc}</div>
          <div style={{ marginLeft: 10 }}>
            <FieldRow>
              <span>{L.p5_3aa}</span><FL value={resolve('flatNo', 'FlatNo')} />
              <span>{L.p5_Floor}</span><FL value={resolve('manzala', 'Floor')} style={{ maxWidth: 50 }} /><span>{L.p5_Wing}</span><FL value={resolve('wing', 'Wing')} style={{ maxWidth: 40 }} />
            </FieldRow>
            <FieldRow><span>{L.p5_Plot}</span><FL value={resolve('plotNo', 'PlotNo')} /><span>{L.p5_Sector}</span><FL value={resolve('nagarSector', 'NagarSector')} /></FieldRow>
            <FieldRow><span>{L.p5_Road}</span><FL value={resolve('rastyaNaav', 'RoadName')} /></FieldRow>
            <FieldRow>
              <span>{L.p5_Suburb}</span><FL value={resolve('upnagar', 'Suburb')} /><span>{L.p5_Dist}</span><FL value={resolve('jilha', 'District')} /><span>{L.p5_Pin}</span>
              <CharBox value={resolve('pinKod', 'PinCode')} n={6} />
            </FieldRow>
            <FieldRow><span>{L.p5_RegNo}</span><FL value={resolve('housingRegi', 'HousingRegNo')} /></FieldRow>
            <FieldRow>
              <span>{L.p5_MemNo}</span><FL value={resolve('sabasadNo', 'HousingMemberNo')} />
              <span>{L.p5_CertNo}</span><FL value={resolve('sharesCert', 'ShareCertNo')} />
            </FieldRow>
            <FieldRow>
              <span>{L.p5_SharesStart}</span>
              <FL value={resolve('bhaagFrom', 'SharesFrom')} style={{ maxWidth: 60 }} /><span>{L.p5_From}</span><FL value={resolve('bhaagTo', 'SharesTo')} style={{ maxWidth: 60 }} /><span>{L.p5_To}</span>
            </FieldRow>
          </div>

          <FieldRow style={{ marginTop: 5 }}>
            <span>{L.p5_Area}</span><FL value={resolve('kshetrafal', 'Area')} style={{ maxWidth: 60 }} />
            <span>
              {L.p5_AreaUnit} <CB checked={String(resolve('kshetraType', 'AreaType')).includes("बिल्ट अप")} />
              {L.p5_Carpet} <CB checked={String(resolve('kshetraType', 'AreaType')).includes("कार्पेट")} />
              {L.p5_Super} <CB checked={String(resolve('kshetraType', 'AreaType')).includes("सुपरबिल्ट अप")} />
            </span>
          </FieldRow>

          <div style={{ marginTop: 4, fontWeight: 600 }}>{L.p5_Borders}</div>
          <div style={{ marginLeft: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: 3 }}>
            <div>{L.p5_East} <IL value={resolve('purvesi', 'BoundaryEast')} cls="inline-field-xl" /></div>
            <div>{L.p5_West} <IL value={resolve('pashchimesi', 'BoundaryWest')} cls="inline-field-xl" /></div>
            <div>{L.p5_South} <IL value={resolve('dakshinesi', 'BoundarySouth')} cls="inline-field-xl" /></div>
            <div>{L.p5_North} <IL value={resolve('uttaresi', 'BoundaryNorth')} cls="inline-field-xl" /></div>
          </div>

          <FieldRow style={{ marginTop: 5 }}>
            <span>{L.p5_BuiltYear}</span><FL value={resolve('bandhamVarsh', 'BuildingYear')} style={{ maxWidth: 55 }} />
            <span>{L.p5_SurveyNo}</span><FL value={resolve('surveNo', 'SurveyNo')} style={{ maxWidth: 60 }} />
            <span>{L.p5_HissaNo}</span><FL value={resolve('hissaNo', 'HissaNo')} style={{ maxWidth: 60 }} />
          </FieldRow>
          <FieldRow>
            <span>{L.p5_GatNo}</span><FL value={resolve('gatNo', 'GatNo')} style={{ maxWidth: 60 }} />
            <span>{L.p5_Ward}</span><FL value={resolve('municipalNo', 'MunicipalNo')} />
          </FieldRow>

          <div style={{ marginBottom: 4 }}>
            {L.p5_OC}
            {L.p5_Yes} <CB checked={resolve('ocMilale', 'OcReceived') === "होय"} /> {L.p5_No} <CB checked={resolve('ocMilale', 'OcReceived') === "नाही"} /> {L.date} <IL value={resolve('ocDin', 'OcDate')} cls="inline-field-sm" />
          </div>
          <div style={{ marginBottom: 4 }}>
            {L.p5_Deed}
            {L.p5_Yes} <CB checked={resolve('deedZale', 'ConveyanceDeed') === "होय"} /> {L.p5_No} <CB checked={resolve('deedZale', 'ConveyanceDeed') === "नाही"} /> {L.date} <IL value={resolve('deedDin', 'ConveyanceDeedDate')} cls="inline-field-sm" />
          </div>
          <FieldRow>
            <span>{L.p5_Price}</span><FL value={resolve('ekunKharedi', 'TotalPurchasePrice')} style={{ maxWidth: 90 }} /><span>/-</span>
            <span>{L.p5_Paid}</span><FL value={resolve('dilelRakkam', 'AmountPaid')} style={{ maxWidth: 80 }} />
            <span>{L.p5_Bal}</span><FL value={resolve('deneBaki', 'BalancePayable')} style={{ maxWidth: 80 }} />
          </FieldRow>
          <FieldRow><span>{L.p5_Mortgage}</span><FL value={resolve('taranMahiti', 'MortgageDetails')} /></FieldRow>
          <FieldRow>
            <span>{L.p5_GovVal}</span><FL value={resolve('shasaki', 'GovtValuation')} style={{ maxWidth: 80 }} /><span>/-</span>
            <span>{L.p5_MarketVal}</span><FL value={resolve('bazarBhav', 'MarketValuation')} style={{ maxWidth: 80 }} /><span>/-</span>
          </FieldRow>
        </div>
        <PageNum n={pageNum} />
      </div>
    );
  }

  // Under Construction
  return (
    <div className="page">
      <SectionPink style={{ textAlign: "center", marginBottom: 6 }}>{L.constTitle}</SectionPink>
      <div style={{ fontSize: 10.5 }}>
        <FieldRow><span>{L.p5b_1}</span><FL value={resolve('firmNaav', 'BuilderFirmName')} /></FieldRow>
        <FieldRow><span>{L.p5b_2}</span><FL value={resolve('tarnPatta', 'UnderConstrAddress')} /></FieldRow>

        <div style={{ marginBottom: 4 }}>
          {L.p5b_3} {L.p5_Yes} <CB checked={resolve('planManjur', 'BuildingPlanApproved') === "होय"} /> {L.p5_No} <CB checked={resolve('planManjur', 'BuildingPlanApproved') === "नाही"} />
        </div>
        <FieldRow>
          <span>{L.p5b_4}</span><FL value={resolve('bandhamSwaarup', 'ConstructionNature')} />
          <span>{L.p5b_5}</span><FL value={resolve('constKshetrafal', 'ConstArea')} style={{ maxWidth: 60 }} />
          <span>
            {L.p5_AreaUnit} <CB checked={String(resolve('constKshetraType', 'ConstAreaType')).includes("बिल्ट अप")} />
            {L.p5_Carpet} <CB checked={String(resolve('constKshetraType', 'ConstAreaType')).includes("कार्पेट")} />
            {L.p5_Super} <CB checked={String(resolve('constKshetraType', 'ConstAreaType')).includes("सुपरबिल्ट अप")} />
          </span>
        </FieldRow>

        <div style={{ marginTop: 4, fontWeight: 600 }}>{L.p5b_6}</div>
        <div style={{ marginLeft: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: 3 }}>
          <div>{L.p5_East} <IL value={resolve('constPurvesi', 'ConstBoundaryEast')} cls="inline-field-xl" /></div>
          <div>{L.p5_West} <IL value={resolve('constPashchimesi', 'ConstBoundaryWest')} cls="inline-field-xl" /></div>
          <div>{L.p5_South} <IL value={resolve('constDakshinesi', 'ConstBoundarySouth')} cls="inline-field-xl" /></div>
          <div>{L.p5_North} <IL value={resolve('constUttaresi', 'ConstBoundaryNorth')} cls="inline-field-xl" /></div>
        </div>

        <FieldRow style={{ marginTop: 5 }}>
          <span>{L.p5b_7}</span><FL value={resolve('constPlotNo', 'ConstPlotNo')} style={{ maxWidth: 80 }} />
          <span>{L.p5b_8}</span><FL value={resolve('constSurveNo', 'ConstSurveyNo')} style={{ maxWidth: 70 }} />
          <span>{L.p5b_9}</span><FL value={resolve('constGatNo', 'ConstGatNo')} style={{ maxWidth: 70 }} />
        </FieldRow>
        <FieldRow>
          <span>{L.p5b_10}</span><FL value={resolve('constHissaNo', 'ConstHissaNo')} style={{ maxWidth: 80 }} />
          <span>{L.p5b_11}</span><FL value={resolve('constMunicipalNo', 'ConstMunicipalNo')} />
        </FieldRow>
        <FieldRow>
          <span>{L.p5b_12}</span><IL value={resolve('agreementDin', 'AgreementDate')} cls="inline-field-sm" />
          <span>{L.p5b_13}</span><FL value={resolve('stampDuty', 'StampDuty')} style={{ maxWidth: 80 }} />
          <span>{L.p5b_14}</span><FL value={resolve('regRakkam', 'RegistrationAmount')} style={{ maxWidth: 80 }} />
        </FieldRow>
        <FieldRow>
          <span>{L.p5b_15}</span><FL value={resolve('constEkunKharedi', 'ConstTotalPrice')} style={{ maxWidth: 80 }} />
          <span>{L.p5_Paid} ₹</span><FL value={resolve('constDilelRakkam', 'ConstAmountPaid')} style={{ maxWidth: 80 }} />
          <span>{L.p5_Bal} ₹</span><FL value={resolve('constDeneBaki', 'ConstBalancePayable')} style={{ maxWidth: 80 }} />
        </FieldRow>
      </div>
      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 6 — Collateral + Business
══════════════════════════════════════════════════════════════════════════ */
function Page6({ data = {}, L, lang, pageNum }) {
  const d = data;
  const t = (mr, en) => lang === "en" ? en : mr;
  const resolve = (lk, ep) => resolveValue(d, lk, ep);

  return (
    <div className="page">
      <SectionPink style={{ textAlign: "center" }}>{L.colTitle}</SectionPink>

      <div style={{ fontSize: 10.5 }}>
        <FieldRow style={{ marginTop: 6 }}><span>{t("१) अ) हौसिंग सोसायटीचे नाव / पत्ता:", "1) a) Housing Society Name / Address:")}</span><FL value={resolve('colHousingNaav', 'Property.CollateralHousingNaav')} /></FieldRow>

        <div style={{ marginTop: 6, fontWeight: 600 }}>{t("२) तारण देत असलेल्या मिळकतीचे वर्णन :", "2) Description of Mortgaged Property:")}</div>
        <div style={{ marginLeft: 12, marginTop: 4 }}>
          <FieldRow>
            <span>{t("अ) घर/रूम/बंगला/प्लॅट/गाळा क्र.:", "a) House/Room/Bungalow/Flat/Shop No.:")}</span><FL value={resolve('colFlatNo', 'Property.CollateralFlatNo')} />
            <span>{L.p5_Floor}</span><FL value={resolve('colManzala', 'Property.CollateralFloor')} style={{ maxWidth: 50 }} /><span>{L.p5_Wing}</span><FL value={resolve('colWing', 'Property.CollateralWing')} style={{ maxWidth: 40 }} />
          </FieldRow>
          <FieldRow><span>{L.p5_Plot}</span><FL value={resolve('colPlotNo', 'Property.CollateralPlotNo')} /><span>{L.p5_Sector}</span><FL value={resolve('colNagarSector', 'Property.CollateralNagarSector')} /></FieldRow>
          <FieldRow><span>{L.p5_Road}</span><FL value={resolve('colRastyaNaav', 'Property.CollateralRoadName')} /></FieldRow>
          <FieldRow>
            <span>{L.p5_Suburb}</span><FL value={resolve('colUpnagar', 'Property.CollateralSuburb')} /><span>{L.p5_Dist}</span><FL value={resolve('colJilha', 'Property.CollateralDistrict')} /><span>{L.p5_Pin}</span><CharBox value={resolve('colPinKod', 'Property.CollateralPinCode')} n={6} />
          </FieldRow>
          <FieldRow><span>{L.p5_RegNo}</span><FL value={resolve('colHousingRegi', 'Property.CollateralHousingRegNo')} /></FieldRow>
          <FieldRow>
            <span>{L.p5_MemNo}</span><FL value={resolve('colSabasadNo', 'Property.CollateralHousingMemberNo')} /><span>{L.p5_CertNo}</span><FL value={resolve('colSharesCert', 'Property.CollateralShareCertNo')} />
          </FieldRow>
          <FieldRow>
            <span>{L.p5_SharesStart}</span><FL value={resolve('colBhaagFrom', 'Property.CollateralSharesFrom')} />
            <span>{L.p5_From}</span><FL value={resolve('colBhaagTo', 'Property.CollateralSharesTo')} /><span>{L.p5_To}</span>
          </FieldRow>
        </div>

        <FieldRow style={{ marginTop: 6 }}>
          <span>{t("३) जागेचे क्षेत्रफळ", "3) Area of Property")}</span><FL value={resolve('colKshetrafal', 'Property.CollateralArea')} style={{ maxWidth: 60 }} />
          <span>
            {L.p5_AreaUnit} <CB checked={String(resolve('colKshetraType', 'Property.CollateralAreaType')).includes("बिल्ट अप") || String(resolve('colKshetraType', 'Property.CollateralAreaType')).includes("Built-up")} />
            {L.p5_Carpet} <CB checked={String(resolve('colKshetraType', 'Property.CollateralAreaType')).includes("कार्पेट") || String(resolve('colKshetraType', 'Property.CollateralAreaType')).includes("Carpet")} />
            {L.p5_Super} <CB checked={String(resolve('colKshetraType', 'Property.CollateralAreaType')).includes("सुपरबिल्ट अप") || String(resolve('colKshetraType', 'Property.CollateralAreaType')).includes("Super Built-up")} />
          </span>
        </FieldRow>

        <div style={{ marginTop: 6, fontWeight: 600 }}>{t("४) पुर:स्थिमा", "4) Boundaries")}</div>
        <div style={{ marginLeft: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 3 }}>
          <div>{L.p5_East} <IL value={resolve('colPurvesi', 'Property.CollateralBoundaryEast')} cls="inline-field-xl" /></div>
          <div>{L.p5_West} <IL value={resolve('colPashchimesi', 'Property.CollateralBoundaryWest')} cls="inline-field-xl" /></div>
          <div>{L.p5_South} <IL value={resolve('colDakshinesi', 'Property.CollateralBoundarySouth')} cls="inline-field-xl" /></div>
          <div>{L.p5_North} <IL value={resolve('colUttaresi', 'Property.CollateralBoundaryNorth')} cls="inline-field-xl" /></div>
        </div>

        <FieldRow style={{ marginTop: 6 }}>
          <span>{L.p5_BuiltYear}</span><FL value={resolve('colBandhamVarsh', 'Property.CollateralBuildingYear')} style={{ maxWidth: 60 }} />
          <span>{L.p5_SurveyNo}</span><FL value={resolve('colSurveNo', 'Property.CollateralSurveyNo')} style={{ maxWidth: 60 }} />
          <span>{L.p5_HissaNo}</span><FL value={resolve('colHissaNo', 'Property.CollateralHissaNo')} style={{ maxWidth: 60 }} />
        </FieldRow>
        <FieldRow>
          <span>{L.p5_GatNo}</span><FL value={resolve('colGatNo', 'Property.CollateralGatNo')} style={{ maxWidth: 60 }} />
          <span>{L.p5_Ward}</span><FL value={resolve('colMunicipalNo', 'Property.CollateralMunicipalNo')} />
        </FieldRow>

        <div style={{ marginTop: 6 }}>
          {t("१०) हौसिंग सोसायटीच्या इमारतीस भोगवटा प्रमाणपत्र (ओ.सी.) मिळाले आहे काय?", "10) Has OC been received for the society building?")}
          {L.p5_Yes} <CB checked={resolve('colOcMilale', 'Property.CollateralOcReceived') === "होय"} /> {L.p5_No} <CB checked={resolve('colOcMilale', 'Property.CollateralOcReceived') === "नाही"} /> {L.date} <IL value={resolve('colOcDin', 'Property.CollateralOcDate')} cls="inline-field-sm" />
        </div>
        <div style={{ marginTop: 4 }}>
          {t("११) हौसिंग सोसायटी/प्लॉटचे कजर्हेस्ट डीड झालेले आहे काय?", "11) Has Conveyance Deed for society/plot been done?")}
          {L.p5_Yes} <CB checked={resolve('colDeedZale', 'Property.CollateralConveyanceDeed') === "होय"} /> {L.p5_No} <CB checked={resolve('colDeedZale', 'Property.CollateralConveyanceDeed') === "नाही"} /> {L.date} <IL value={resolve('colDeedDin', 'Property.CollateralConveyanceDeedDate')} cls="inline-field-sm" />
        </div>
        <FieldRow style={{ marginTop: 4 }}><span>{t("१२) तारणा संबंधी माहिती:", "12) Mortgage Details:")}</span><FL value={resolve('colTaranMahiti', 'Property.CollateralRemarks')} /></FieldRow>
        <FieldRow style={{ marginTop: 4 }}>
          <span>{t("१३) मिळकतीची किंमत: अ) शासकीय मूल्यांकन: ₹", "13) Property Value: a) Govt Valuation: ₹")}</span><FL value={resolve('colShasaki', 'Property.CollateralGovtValuation')} style={{ maxWidth: 80 }} />
          <span>{t("/- ब) बाजारभावाचे प्रमाणे: ₹", "/- b) Market Value: ₹")}</span><FL value={resolve('colBazarBhav', 'Property.CollateralMarketValuation')} style={{ maxWidth: 80 }} /><span>/-</span>
        </FieldRow>


      </div>

      {/* --- Business Information Segment (Merged) --- */}
      <Divider />
      <SectionPink style={{ textAlign: "center", marginTop: 2 }}>{L.bizInfoTitle}</SectionPink>

      <div style={{ fontSize: 10, marginTop: 2 }}>
        <FieldRow><span>{t("१) व्यवसायाचा कामकाजाचे स्वरूप:", "1) Nature of Business Work:")}</span><FL value={resolve('busSwaarup', 'Business.WorkNature')} /></FieldRow>
        <div style={{ marginBottom: 2 }}>
          {t("२) व्यवसायाचे स्वरूप:", "2) Nature of Business:")}
          {["एकलेक लि.", "प्र. लि.", "भागीदारी", "खाजगी", "नोकरी", "शेती", "इतर"].map(opt => (
            <span key={opt}> {opt} <CB checked={String(resolve('busType', 'Business.BusinessType')).includes(opt)} /> </span>
          ))}
        </div>
        <div style={{ marginBottom: 2 }}>
          {t("३) व्यवसायाचे जागेचे स्वरूप:", "3) Nature of Business Premises:")}
          {["स्वमालकीचे", "बिल्डिंगपार्किंग", "पगारदारी", "भाडेतत्त्वावर", "वितरक"].map(opt => (
            <span key={opt}> {opt} <CB checked={String(resolve('busJageType', 'Business.PremisesType')).includes(opt)} /> </span>
          ))}
          <br />
          {t("ब) क्षेत्रफळ:", "b) Area:")}<IL value={resolve('busKshetrafal', 'Business.Area')} cls="inline-field-sm" />
          {t("चौ. फूट/मीटर (कार्पेट", "Sq.ft/m (Carpet")} <CB checked={String(resolve('busKshetraType', 'Business.AreaType')).includes("कार्पेट")} />
          {t("बिस्टअप", "Built-up")} <CB checked={String(resolve('busKshetraType', 'Business.AreaType')).includes("बिस्टअप")} />
          {t("सुपर बिस्टअप )", "Super Built-up )")} <CB checked={String(resolve('busKshetraType', 'Business.AreaType')).includes("सुपरबिल्ट अप")} />
        </div>
        <FieldRow><span>{t("४) कंपनी/फर्मचे नाव:", "4) Company/Firm Name:")}</span><FL value={resolve('busFirmNaav', 'Business.FirmName')} /></FieldRow>
        <FieldRow><span>{t("५) संपूर्ण पत्ता:", "5) Full Address:")}</span><FL value={resolve('busPatta', 'Business.Address')} /></FieldRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 3, marginBottom: 2 }}>
          <div>{t("पिन कोड:", "PIN Code:")}<CharBox value={resolve('busPin', 'Business.PinCode')} n={6} /></div>
          <div>{t("दूर./मो. क्र.:", "Tel./Mob. No.:")}<CharBox value={resolve('busTel', 'Business.Phone')} n={10} /></div>
          <div>{t("ई-मेल आयडी:", "Email ID:")}<IL value={resolve('busEmail', 'Business.Email')} cls="inline-field-lg" /></div>
        </div>
        <FieldRow><span>{t("६) पॅन कार्ड क्र.:", "6) PAN Card No.:")}</span><CharBox value={resolve('busPan', 'Business.PanNo')} n={10} /></FieldRow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, marginTop: 2 }}>
          <div>{t("७) अ) गुमास्ता लायसन्स क्र.:", "7) a) Gumasta License No.:")} <IL value={resolve('busGumasta', 'Business.GumastaNo')} cls="inline-field-lg" /></div>
          <div>{t("ब) विक्रीकर क्र.:", "b) Sales Tax No.:")} <IL value={resolve('busVikrikar', 'Business.SalesTaxNo')} cls="inline-field-lg" /></div>
          <div>{t("८) अ) व्हॅट (VAT) क्र.:", "8) a) VAT No.:")} <IL value={resolve('busVat', 'Business.VatNo')} /></div>
          <div style={{ display: "flex", gap: 4 }}>
            <span>{t("ब) सर्व्हिस टॅक्स क्र.:", "b) Service Tax No.:")}</span>
            <IL value={resolve('busServiceTax', 'Business.ServiceTaxNo')} />
          </div>
          <div>{t("क) इतर लायसन्स:", "c) Other License:")} <IL value={resolve('busOtherLicense', 'Business.OtherLicense')} /></div>
        </div>
        <div style={{ marginTop: 2 }}>
          {t("९) व्यवसायासाठी लागणारे सर्व प्रकारचे परवाने आपल्याकडे आहेत काय? होय", "9) Do you have all types of business licenses? Yes")} <CB checked={resolve('busParwane', 'Business.HasLicenses') === "होय" || resolve('busParwane', 'Business.HasLicenses') === "Yes"} /> {t("नाही", "No")} <CB checked={resolve('busParwane', 'Business.HasLicenses') === "नाही" || resolve('busParwane', 'Business.HasLicenses') === "No"} />
          {(resolve('busParwane', 'Business.HasLicenses') === "होय" || resolve('busParwane', 'Business.HasLicenses') === "Yes") && (
            <span style={{ marginLeft: 8 }}>({t("तपशील:", "Details:")} <IL value={resolve('busParwaneDetails', 'Business.LicenseDetails')} cls="inline-field-lg" />)</span>
          )}
        </div>
        <div style={{ marginTop: 2 }}>
          {t("१०) व्यवसाय लघुउद्योग वा वाहन चालवणाऱ्या विभागाचे आपण रहिवाशी आहात काय? होय", "10) Are you a resident of MSME or Transport department? Yes")} <CB checked={resolve('busResidentStatus', 'Business.ResidentStatus') === "होय" || resolve('busResidentStatus', 'Business.ResidentStatus') === "Yes"} /> {t("नाही", "No")} <CB checked={resolve('busResidentStatus', 'Business.ResidentStatus') === "नाही" || resolve('busResidentStatus', 'Business.ResidentStatus') === "No"} />
        </div>

        <FieldRow><span>{t("११) व्यवसाय केव्हा सुरू केला:", "11) When did the business start:")}</span><FL value={resolve('busSuruKelay', 'Business.StartDate')} /></FieldRow>
        <FieldRow><span>{t("१२) व्यवसायाबद्दल अनुभव:", "12) Experience in Business:")}</span><FL value={resolve('busAnubhav', 'Business.Experience')} /></FieldRow>

        {/* Business Income Table (Point 13) */}
        <div style={{ marginTop: 2, fontWeight: 600 }}>{t("१३) व्यवसायातून मिळणारा वार्षिक उत्पन्नाचा तपशील:", "13) Details of annual income from business:")}</div>
        <table className="data-table" style={{ marginTop: 2 }}>
          <thead>
            <tr>
              <th>{L.totalAnnualIncome}</th>
              <th>{L.totalAnnualExpense}</th>
              <th>{L.netAnnualIncome}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: "center" }}>{resolve('busEkunUtpanna', 'Business.BusinessAnnualIncome')}</td>
              <td style={{ textAlign: "center" }}>{resolve('busKharcha', 'Business.BusinessAnnualExpenses')}</td>
              <td style={{ textAlign: "center" }}>{resolve('busNiwal', 'Business.BusinessNetIncome')}</td>
            </tr>
          </tbody>
        </table>


        {/* Regular customers (Point 14 again, in form sequence) */}

        <div style={{ fontWeight: 600, marginTop: 6 }}>{L.regularCustomers}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 2 }}>
          {[
            { l: t("अ", "a"), name: resolve('customer1Naav', 'Business.CustomersJson'), addr: resolve('customer1Patta', '') },
            { l: t("ब", "b"), name: resolve('customer2Naav', ''), addr: resolve('customer2Patta', '') }
          ].map((item, idx) => {
            let finalName = item.name;
            let finalAddr = item.addr;
            if (idx === 0 && String(item.name).startsWith('[')) {
              const customers = safeParse(item.name);
              finalName = customers[0]?.n1 || customers[0]?.name;
              finalAddr = customers[0]?.p1 || customers[0]?.address;
            } else if (idx === 1 && String(resolve('customer1Naav', 'Business.CustomersJson')).startsWith('[')) {
              const customers = safeParse(resolve('customer1Naav', 'Business.CustomersJson'));
              finalName = customers[1]?.n2 || customers[1]?.name;
              finalAddr = customers[1]?.p2 || customers[1]?.address;
            }
            return (
              <div key={item.l}>
                <div>{item.l}) {t("नाव:", "Name:")} <IL value={finalName} cls="inline-field-lg" /></div>
                <div>{t("पत्ता:", "Address:")} <IL value={finalAddr} cls="inline-field-xl" /></div>
              </div>
            );
          })}
        </div>

        {/* Suppliers (Point 15) */}
        <div style={{ fontWeight: 600, marginTop: 4 }}>{L.suppliers}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 2 }}>
          {[
            { l: t("अ", "a"), name: resolve('supplier1Naav', 'Business.SuppliersJson'), addr: resolve('supplier1Patta', '') },
            { l: t("ब", "b"), name: resolve('supplier2Naav', ''), addr: resolve('supplier2Patta', '') }
          ].map((item, idx) => {
            let finalName = item.name;
            let finalAddr = item.addr;
            if (idx === 0 && String(item.name).startsWith('[')) {
              const items = safeParse(item.name);
              finalName = items[0]?.n1 || items[0]?.name;
              finalAddr = items[0]?.p1 || items[0]?.address;
            } else if (idx === 1 && String(resolve('supplier1Naav', 'Business.SuppliersJson')).startsWith('[')) {
              const items = safeParse(resolve('supplier1Naav', 'Business.SuppliersJson'));
              finalName = items[1]?.n2 || items[1]?.name;
              finalAddr = items[1]?.p2 || items[1]?.address;
            }
            return (
              <div key={item.l}>
                <div>{item.l}) {t("नाव:", "Name:")} <IL value={finalName} cls="inline-field-lg" /></div>
                <div>{t("पत्ता:", "Address:")} <IL value={finalAddr} cls="inline-field-xl" /></div>
              </div>
            );
          })}
        </div>
      </div>

      <PageNum n={pageNum} />
    </div>

  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 7 — Insurance + Tax
══════════════════════════════════════════════════════════════════════════ */
function Page7({ data = {}, L, lang, pageNum }) {
  const d = data;
  const t = (mr, en) => lang === "en" ? en : mr;
  const resolve = (lk, ep) => resolveValue(d, lk, ep ? `Insurance.${ep}` : null);

  const TaxTable = ({ headerLabel, rowsBasis, entityJsonField }) => {
    let rows = d[rowsBasis];
    if (!rows || rows.length === 0) {
      const jsonStr = resolve(null, entityJsonField);
      rows = safeParse(jsonStr);
    }
    return (
      <table className="data-table" style={{ marginTop: 6 }}>
        <thead>
          <tr>
            <th>{L.fyLabel}</th>
            <th>{headerLabel} ₹</th>
            <th>{t("भरणा दिनांक", "Payment Date")}</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2].map(i => {
            const row = (rows && rows[i]) || { varsha: '', rakkam: '', dinank: '' };
            return (
              <tr key={i}>
                <td><FL value={row.varshaFrom && row.varshaTo ? `${row.varshaFrom} To ${row.varshaTo}` : row.varsha} style={{ minWidth: 100 }} /></td>
                <td style={{ textAlign: "center" }}>{row.rakkam}</td>
                <td style={{ textAlign: "center" }}>{row.dinank}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="page">
      <SectionPink style={{ textAlign: "center" }}>{L.partnerInfoTitle}</SectionPink>
      <div style={{ fontSize: 10.5 }}>
        {/* Life insurance */}
        <div style={{ marginTop: 6, fontWeight: 600 }}>{L.lifeInsTitle}</div>
        <div style={{ marginLeft: 10, marginTop: 4 }}>
          <FieldRow><span>{L.insCompany}</span><FL value={resolve('vimaNaav', 'InsuranceCompany')} /></FieldRow>
          <FieldRow><span>{L.insAddr}</span><FL value={resolve('vimaPatta', 'InsuranceAddress')} /></FieldRow>
          <FieldRow><span>{L.insPolicy}</span><FL value={resolve('vimaPolicy', 'InsurancePolicyNo')} /></FieldRow>
          <div style={{ marginBottom: 4 }}>
            {L.insPeriod} <IL value={resolve('vimaFrom', 'InsuranceFrom')} cls="inline-field-sm" /> {L.from} <IL value={resolve('vimaTo', 'InsuranceTo')} cls="inline-field-sm" /> {L.to}
          </div>
          <FieldRow><span>{L.insAmt}</span><FL value={resolve('vimaRakkam', 'InsuranceAmount')} style={{ maxWidth: 100 }} /><span>/-</span></FieldRow>
          <FieldRow><span>{L.insPremium}</span><FL value={resolve('vimaHapta', 'InsurancePremium')} style={{ maxWidth: 100 }} /><span>/-</span></FieldRow>
          <div style={{ marginBottom: 4 }}>
            {L.premiumType}
            {["मासिक", "त्रैमासिक", "अर्ध वार्षिक", "वार्षिक"].map(opt => (
              <span key={opt}> {opt} <CB checked={resolve('vimaHaptaType', 'InsurancePremiumType') === opt} /> </span>
            ))}
          </div>
        </div>

        {/* Policy loan */}
        <div style={{ marginTop: 6, fontWeight: 600 }}>
          {L.policyLoan} <CB checked={resolve('vimKarj', 'PolicyLoan') === "नाही"} /> {L.policyLoanDetail}
        </div>
        <div style={{ marginLeft: 10, marginTop: 4 }}>
          <FieldRow><span>{L.bankInst}</span><FL value={resolve('vimKarjBank', 'PolicyLoanBank')} /></FieldRow>
          <FieldRow><span>{L.fullAddr}</span><FL value={resolve('vimKarjPatta', 'PolicyLoanAddress')} /></FieldRow>
          <FieldRow>
            <span>{L.loanAmt}</span><FL value={resolve('vimKarjRakkam', 'PolicyLoanAmount')} style={{ maxWidth: 80 }} />
            <span>{L.loanDt}</span><IL value={resolve('vimKarjDin', 'PolicyLoanDate')} cls="inline-field-sm" />
          </FieldRow>
          <FieldRow><span>{L.balanceLoan}</span><FL value={resolve('vimShillak', 'PolicyLoanBalance')} /></FieldRow>
        </div>

        {/* Income Tax */}
        <div style={{ marginTop: 6, fontWeight: 600 }}>{L.incomeTaxTitle}</div>
        <div style={{ marginLeft: 10, marginTop: 4 }}>
          <CharBox value={resolve('panNo', 'PanNo')} n={10} />
          <div style={{ marginTop: 4 }}>{L.taxSince} <IL value={resolve('taxSuru', 'IncomeTaxSince')} cls="inline-field-sm" /></div>
          <TaxTable headerLabel={L.taxAmt} rowsBasis="taxRows" entityJsonField="TaxRowsJson" />
        </div>

        {/* Professional Tax */}
        <div style={{ marginTop: 8, fontWeight: 600 }}>{L.profTaxTitle}</div>
        <div style={{ marginLeft: 10, marginTop: 4 }}>
          <FieldRow><span>{L.profTaxNo}</span><FL value={resolve('ptNo', 'ProfTaxNo')} /></FieldRow>
          <FieldRow><span>{L.profTaxSince}</span><FL value={resolve('ptSuru', 'ProfTaxSince')} style={{ maxWidth: 60 }} /></FieldRow>
          <TaxTable headerLabel={L.profTaxLabel} rowsBasis="ptRows" entityJsonField="ProfTaxRowsJson" />
        </div>

        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{t("इतर विमा माहिती:", "Other Insurance Info:")}</div>
            <div style={{ border: "1px solid #ccc", padding: 6, minHeight: 40, marginTop: 4, borderRadius: 4 }}>
              {resolve('insuranceDetails', 'InsuranceDetails')}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{t("इतर काही माहिती असल्यास:", "Any other info:")}</div>
            <div style={{ border: "1px solid #ccc", padding: 6, minHeight: 40, marginTop: 4, borderRadius: 4 }}>
              {resolve('otherDetails', 'OtherDetails')}
            </div>
          </div>
        </div>
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 8 — Loan Terms + Signatures + Office
══════════════════════════════════════════════════════════════════════════ */
const RULES_MR = [
  "कर्ज वितरणाच्या दिनांकापासून व्याज आकारणी सुरू करण्यात येईल. शिल्लक मुद्दल रक्कमेवर (Reducing Balance Amount) दिवसाप्रमाणे (Per Day Interest) व्याज आकारणी करण्यात येईल.",
  "कर्ज वितरणाच्या दिनांकापासून ३० दिवसाच्या आत पहिला कर्ज हप्ता (मुद्दल + व्याज) जमा करणे आवश्यक आहे. त्या पुढील प्रत्येक कर्ज हप्ता ३० दिवसांच्या आत भरणा करणे आवश्यक असून विलंब झाल्यास सदर कर्ज हप्ता थकीत समजण्यात येईल व त्या रक्कमेवर द.सा.द.शे. २% प्रमाणे दंड व्याज आकारणी करण्यात येईल.",
  "कर्जदाराचे कर्ज हप्ता कंपनीमधून वेतन कपातीद्वारे धनादेशाने जमा होत असल्यास असा वेतन कपातीचा धनादेश संस्थेस प्राप्त झाल्याशिवाय कर्ज हप्ता जमा झाला आहे असे समजले जाणार नाही. कर्ज हप्त्याचा धनादेश दरम्यान नियमितपणे संस्थेत पाठविण्याची/आणून देण्याची जबाबदारी संबंधित कंपनी व कर्जदाराची असेल.",
  <span key="rule4">आलेल्या कारणांमुळे कर्जाची एक रकमी परतफेडीची मागणी करण्याचा अधिकार संस्थेस राहील.<br />
    अ) मंजूर कारणासाठी कर्ज रक्कमेचा विनियोग न केल्यास &nbsp;&nbsp;&nbsp; ब) कोणत्याही कारणाने सलग तीन हप्ते थकल्यास<br />
    क) अर्जदार/जामीनदार यांस कोर्टाचा दंड/शिक्षा झाल्यास &nbsp;&nbsp;&nbsp; ड) कर्जदार/जामीनदार मयत झाल्यास<br />
    ई) खोटी माहिती किंवा खोटे कागदपत्र सादर केल्यास</span>,
  "कर्जदार कर्जाचे हप्ते नियमितपणे परत फेड करत असल्याबाबत जामीनदारांनी खात्री करून घेणे आवश्यक आहे.",
  "कर्जदाराने नियमितपणे हप्ते न भरल्यास सदर हप्ते जामीनदारांना वैयक्तिक/सामुहिकरित्या भरावे लागतील. तेव्हा त्यांनी कर्ज हप्ते भरण्याची आपणी तयारी असेल अशा परिचित व्यक्तींनाच जामीन करावे.",
  "कर्ज आंत थकीत झाल्यास कर्जवसुलीसाठी कर्जदार, जामीनदार यांचे निवास, नोकरी/व्यवसायाचे ठिकाण प्रत्यक्ष भेट, नोटीस देण्यात येईल, तसेच त्यांचे नाव संस्थेच्या नोटीस बोर्डवर, वर्तमान पत्रात प्रसिद्ध केले जाईल. अशा अप्रिय कारवाईमुळे होणाऱ्या नुकसानास सर्वस्वी कर्जदार व जामीनदार स्वत: जबाबदार राहतील.",
  "थकबाकीची नोटीस मिळाली नाही म्हणून जामीनदारांना कर्ज परतफेडीची जबाबदारी टाळता येत नाही.",
  "प्रत्येक जामीनदार हा संपूर्ण कर्जास जबाबदार असेल, हिस्सेदारीने नाही हे लक्षात ध्यावे.",
  "कर्जाची थकबाकी असल्यास कर्जदार व जामीनदार यांच्या संस्थेकडे जमा असणाऱ्या ठेवी परत केल्या जाणार नाहीत",
  "कर्ज वसुलीसाठी कर्जदार आणि जामीनदार यांचे विरुद्ध म. स. स. अ. नियम व इतर कायद्यानुसार दावा दाखल करण्याचा व वसुली करून घेण्याचा अधिकार संस्थेस आहे.",
  "कर्ज मंजुरी नंतर निवास/नोकरी/व्यवसायाच्या पत्त्यामध्ये बदल झाल्यास तो कर्जदार व जामीनदार यांनी संस्थेस तत्परित कळविला पाहिजे.",
];

const RULES_EN = [
  "Interest will be charged from the date of loan disbursement. Interest will be calculated on a daily reducing balance basis.",
  "The first loan installment (Principal + Interest) must be paid within 30 days from the loan disbursement date. Subsequent installments must be paid within 30 days. Delayed payments will be considered as default and penalized at 2% p.a.",
  "If the loan installment is deducted from salary and deposited via cheque by the company, it will not be considered paid until the cheque is received. The borrower and company are responsible for regular cheque submission.",
  <span key="rule4">The society reserves the right to demand a lump-sum repayment of the loan for the following reasons:<br />
    a) If loan amount is not used for sanctioned purpose &nbsp;&nbsp;&nbsp; b) Default of 3 consecutive installments<br />
    c) Applicant/Guarantor penalized by court &nbsp;&nbsp;&nbsp; d) Death of Applicant/Guarantor<br />
    e) Submission of false information or fake documents</span>,
  "Guarantors must ensure the borrower pays loan installments regularly.",
  "If the borrower fails to pay installments regularly, guarantors must pay them individually/collectively. Stand as guarantor only if willing to pay.",
  "In case of default, borrower and guarantors will be visited, served notice, and their names published on notice boards/newspapers. Borrower and guarantors are responsible for resulting harm.",
  "Non-receipt of default notice does not exempt guarantors from repayment responsibility.",
  "Every guarantor is responsible for the entire loan amount, not proportionally.",
  "If a loan is outstanding, deposits of borrower and guarantors will not be refunded.",
  "Society holds the right to file suits and recover loans under Act and rules.",
  "Any change in residential/business address post loan sanction must be promptly informed to the society.",
];

const MARATHI_NUMS = ["१", "२", "३", "४", "५", "६", "७", "८", "९", "१०", "११", "१२"];
const ENGLISH_NUMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function Page8({ data = {}, L, lang, pageNum }) {
  const d = data;
  const t = (mr, en) => lang === "en" ? en : mr;
  const isEn = lang === "en";
  const resolve = (lk, ep) => resolveValue(d, lk, ep);

  const currentRules = isEn ? RULES_EN : RULES_MR;
  const currentNums = isEn ? ENGLISH_NUMS : MARATHI_NUMS;

  let [y, m, day] = ["", "", ""];
  const dinank = resolve('dinank', 'ApplicationDate');
  if (dinank) {
    if (dinank.includes("-")) {
      [y, m, day] = dinank.split("-");
    } else if (dinank.includes("/")) {
      [day, m, y] = dinank.split("/");
    }
  }

  const sigRows = [
    { label: L.applicantName, value: resolve('arjdarNaav', 'ApplicantName') },
    { label: L.g1Name, value: resolve('jameen1Naav', 'Guarantor1Name') },
    { label: L.g2Name, value: resolve('jameen2Naav', 'Guarantor2Name') },
  ];

  // Extra Guarantors (G3+) logic - handle both FormData (draft) and flat entities (submitted)
  const extraGs = data.extraGuarantors || (data.formData?.extraGuarantors) || (data.Guarantors ? data.Guarantors.slice(2) : []);

  extraGs.forEach((g, i) => {
    const num = i + 3;
    const label = lang === 'en' ? `Guarantor No.${num} Name` : `जामीनदार क्र.${num} चे नाव`;
    // Case-insensitive name resolution for the guarantor object
    const nameKeys = ['FullName', 'Naav', 'naav', 'fullName'];
    let gVal = "";
    for (const k of nameKeys) {
      if (g[k]) { gVal = g[k]; break; }
    }
    sigRows.push({ label, value: gVal });
  });

  return (
    <div className="page">
      <SectionPink style={{ textAlign: "center" }}>{L.rulesTitle}</SectionPink>

      <div style={{ fontSize: 11, lineHeight: 1.8, marginTop: 4 }}>
        {currentRules.map((rule, i) => (
          <div key={i} className="num-item" style={{ marginBottom: 4 }}>
            <span className="num-label" style={{ minWidth: 28 }}>{currentNums[i]})</span>
            <span style={{ flex: 1, textAlign: "justify" }}>{rule}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, marginTop: 10, lineHeight: 2.2 }}>
        {L.rulesConfirm}
      </div>

      <div style={{ fontSize: 11, marginTop: 15 }}>
        {sigRows.map(row => (
          <div key={row.label} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ minWidth: 160 }}>{row.label}</span>
            <span>{lang === 'mr' ? 'श्री./श्रीमती:' : 'Mr./Mrs.:'}</span>
            <span style={{ flex: 1, borderBottom: "1px solid #333", height: 16, display: "inline-block" }}>{row.value}</span>
            <span>{L.sahi}</span>
            <span style={{ minWidth: 110, borderBottom: "1px solid #333", height: 16, display: "inline-block" }} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, marginTop: 25, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>{L.thikan} <IL value={resolve('thikan', 'Branch')} cls="inline-field-lg" /></div>
        <div>{L.date} <IL value={day} cls="inline-field-sm" /> / <IL value={m} cls="inline-field-sm" /> / {lang === 'mr' ? '२०' : '20'}<IL value={y?.slice(-2)} cls="inline-field-sm" /></div>
      </div>

      <div style={{ marginTop: 25 }} />

      <SectionPink style={{ marginTop: 15 }}>{L.officeUse}</SectionPink>

      <div style={{ fontSize: 11, marginTop: 25 }}>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 20 }}>
          <span style={{ whiteSpace: "nowrap" }}>{lang === 'mr' ? 'श्री./श्रीमती :' : 'Mr./Mrs. :'}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 10, height: 22, fontSize: 12, paddingLeft: 10 }}>
            {resolve('arjdarNaav', 'ApplicantName')}
          </div>
        </div>

        <div style={{ display: "flex", gap: 80, marginTop: 25, marginBottom: 25 }}>
          <span>{lang === 'mr' ? 'सभासद क्रमांक' : 'Member No.'} <IL value={resolve('saCra', 'MemberNo')} cls="inline-field-lg" /></span>
          <span>{lang === 'mr' ? 'अर्ज क्र.' : 'Application No.'} <IL value={resolve('applicationNo', 'ApplicationNo')} cls="inline-field-lg" /></span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 25, marginBottom: 40, gap: 8, lineHeight: 2.2 }}>
          <span style={{ whiteSpace: "nowrap" }}>{lang === 'mr' ? 'यांचेकडून' : 'From'}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, minWidth: 120, height: 22, textAlign: "center", fontSize: 12 }}>
            {resolve('karjKhate', 'LoanAccountNo')}
          </div>
          <span style={{ whiteSpace: "nowrap" }}>{lang === 'mr' ? 'या कारणासाठी अर्ज मागणी अर्ज मिळाला.' : 'loan application received for this purpose.'}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}>
        <div style={{ fontSize: 11 }}>{L.date} &nbsp; / &nbsp; / {lang === 'mr' ? "२०" : "20"}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #333", minWidth: 180, paddingTop: 6, fontSize: 11 }}>
            {lang === 'mr' ? 'शाखाधिकारी / संबंधित लिपिक' : 'Branch Officer / Clerk'}
          </div>
        </div>
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function HomeLoanPrint({ data: propsData, clientInfo: propsClientInfo, lang: propsLang }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clientInfo: contextClientInfo } = useApp();
  const [data, setData] = useState(propsData || null);
  const [isLoading, setIsLoading] = useState(!!id && !propsData);
  const [lang, setLang] = useState(propsLang || "mr");
  const printRef = useRef(null);

  useEffect(() => {
    if (id && !propsData) {
      const fetchDetail = async () => {
        try {
          const res = await homeLoanService.getLoan(id);
          if (res) {
            setData(res);
          }
        } catch (err) {
          console.error("Print fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id, propsData]);

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading application data...</div>;
  if (!data && id) return <div style={{ padding: 40, textAlign: 'center' }}>Application data not found.</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center' }}>No data available to print.</div>;

  const L = PT[lang] || PT.mr;
  const clientInfo = propsClientInfo || contextClientInfo || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Inject global CSS once */}
      <style>{GLOBAL_CSS}</style>

      {/* ─── Premium Sticky Toolbar ─── */}
      <div className="no-print" style={{ 
        position: 'sticky', top: 0, zIndex: 9999, 
        background: '#0a1c5a', color: '#fff',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        width: '100%', fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '6px 12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600,
              color: '#fff', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '1px', height: '24px', background: 'rgba(255,255,255,0.3)', margin: '0 10px' 
            }}></div>
            <div style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
              Home Loan Print Preview
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Language Segmented Control */}
          <div style={{ 
            display: 'flex', background: 'rgba(0,0,0,0.2)', 
            padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <button 
              onClick={() => setLang('mr')} 
              style={{ 
                padding: '6px 16px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                background: lang === 'mr' ? '#fff' : 'transparent',
                color: lang === 'mr' ? '#0a1c5a' : '#fff',
                transition: 'all 0.2s'
              }}
            >Marathi</button>
            <button 
              onClick={() => setLang('en')} 
              style={{ 
                padding: '6px 16px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                background: lang === 'en' ? '#fff' : 'transparent',
                color: lang === 'en' ? '#0a1c5a' : '#fff',
                transition: 'all 0.2s'
              }}
            >English</button>
          </div>

          <button 
            onClick={handlePrint} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '10px', 
              padding: '10px 24px', borderRadius: '8px', background: '#fff', 
              color: '#0a1c5a', border: 'none', cursor: 'pointer', fontWeight: 700, 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s',
              fontSize: '14px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            <Printer size={18} /> Click to Print
          </button>
        </div>
      </div>

      {/* All pages with dynamic numbering */}
      <div ref={printRef} id="print-area" className="print-area">
        {(() => {
          let pg = 0;
          const pages = [];

          // Page 1
          pages.push(<Page1 key="p1" data={data} clientInfo={clientInfo} L={L} pageNum={L.pn[pg++]} />);

          // Page 2: Borrower
          pages.push(<PersonPage key="pb" title={L.borrowerTitle} pageNum={L.pn[pg++]} data={data} prefix="b" showDeclaration={false} L={L} lang={lang} />);

          // Page 3: G1
          pages.push(<PersonPage key="pg1" title={L.g1Title} pageNum={L.pn[pg++]} data={data} prefix="g1" showDeclaration={true} L={L} lang={lang} />);

          // Page 4: G2
          pages.push(<PersonPage key="pg2" title={L.g2Title} pageNum={L.pn[pg++]} data={data} prefix="g2" showDeclaration={true} L={L} lang={lang} />);

          // Extra Guarantors (G3+)
          // Handle both local state (extraGuarantors) and DB state (Guarantors[2+])
          const extraGs = data.extraGuarantors && data.extraGuarantors.length > 0
            ? data.extraGuarantors
            : (data.Guarantors ? data.Guarantors.slice(2) : []);

          extraGs.forEach((g, idx) => {
            pages.push(
              <PersonPage
                key={`pge${idx}`}
                title={lang === 'en' ? `Guarantor No. ${idx + 3}` : `जामीनदार क्र. ${idx + 3}`}
                pageNum={L.pn[pg] || (idx + 5).toString()} // Fallback if L.pn is short
                data={g}
                prefix=""
                isExtra={true}
                showDeclaration={true}
                L={L}
                lang={lang}
              />
            );
            pg++;
          });

          // Remaining Pages
          pages.push(<Page5 key="p5" data={data} L={L} pageNum={L.pn[pg++]} />);
          pages.push(<Page6 key="p6" data={data} L={L} lang={lang} pageNum={L.pn[pg++]} />);
          pages.push(<Page7 key="p7" data={data} L={L} lang={lang} pageNum={L.pn[pg++]} />);
          pages.push(<Page8 key="p8" data={data} L={L} lang={lang} pageNum={L.pn[pg++]} />);

          return pages;
        })()}
      </div>
    </>
  );
}