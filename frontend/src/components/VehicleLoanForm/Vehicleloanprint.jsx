import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import API_BASE_URL from "../../config";
import GoldLoanPrintMaster from "../GoldLoanForm/GoldLoanPrintMaster";
import { Printer } from "lucide-react";

/* ─── Global styles ─────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Inter:wght@400;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #0a1c5a;
    --accent:  #fdb913;
    --border:  #333;
    --light-border: #999;
  }

  body {
    font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
    font-size: 11px;
    background: #fff;
    color: #111;
    line-height: 1.3;
  }

  /* ── A4 page wrapper ── */
  .vl-page {
    width: 210mm;
    height: 295mm !important;
    background: #fff;
    margin: 0 auto;
    padding: 8mm 10mm;
    border: 3px solid var(--primary);
    position: relative;
    box-shadow: none;
    page-break-before: always;
    overflow: hidden;
    box-sizing: border-box !important;
  }
  .vl-page:first-child {
    page-break-before: avoid !important;
  }
  .vl-page:last-child {
    page-break-after: avoid !important;
  }

  @page {
    size: A4;
    margin: 0;
  }

  /* ── Headers ── */
  .vl-section-pink {
    background: #f0f7ff;
    color: var(--primary);
    padding: 3px 6px;
    font-size: 10px;
    font-weight: 700;
    margin: 6px 0 4px;
    border-left: 4px solid var(--primary);
  }

  /* ── Field rows & lines ── */
  .vl-field-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 2px;
    flex-wrap: wrap;
    gap: 3px;
  }
  .vl-field-label { white-space: nowrap; font-size: 10px; }

  .vl-fl {
    flex: 1;
    border: none;
    border-bottom: 1px solid #333;
    min-width: 60px;
    height: 16px;
    background: transparent;
    font-family: inherit;
    font-size: 11px;
    padding: 0 4px 2px 4px;
    display: inline-flex;
    align-items: flex-end;
    vertical-align: baseline;
  }
  .vl-fl:focus { outline: none; border-bottom-color: var(--primary); }

  .vl-il {
    display: inline-flex;
    align-items: flex-end;
    border-bottom: 1px solid #333;
    min-width: 80px;
    height: 16px;
    vertical-align: baseline;
    padding: 0 4px 2px 4px;
    font-size: 11px;
  }
  .vl-il-sm { min-width: 40px; }
  .vl-il-lg { min-width: 160px; }
  .vl-il-xl { min-width: 220px; }

  /* ── Char boxes ── */
  .vl-char-box { display: inline-flex; gap: 2px; margin-left: 4px; }
  .vl-char-box span {
    width: 22px; height: 20px;
    border: 1px solid #333;
    text-align: center;
    font-family: inherit;
    font-size: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* ── Dividers ── */
  hr.vl-divider { border: none; border-top: 2px solid var(--primary); margin: 8px 0; }
  hr.vl-thin    { border: none; border-top: 1px solid #999; margin: 5px 0; }

  /* ── Misc ── */
  .vl-photo-box {
    width: 80px; height: 100px;
    border: 1px solid #333;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; color: #666; text-align: center; flex-shrink: 0;
  }
  .vl-page-num { 
    position: absolute;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: center; 
    font-size: 10px; 
    color: #444; 
  }
  .vl-num-item { display: flex; gap: 6px; margin-bottom: 2px; font-size: 9.5px; align-items: flex-start; }
  .vl-num-label { min-width: 24px; font-weight: 600; flex-shrink: 0; text-align: right; margin-right: 4px; }

  table.vl-data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px; border: 0.5px solid #ccc; }
  table.vl-data-table th { background: #f0f7ff; border: 0.5px solid #ccc; padding: 4px 5px; text-align: center; font-weight: 600; color: var(--primary); }
  table.vl-data-table td { border: 0.5px solid #ccc; padding: 3px 5px; height: 19px; color: #111; }

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
    .vl-page { 
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
    .vl-page:last-child {
      page-break-after: avoid !important;
    }
    .no-print, .sidebar, .top-bar, .master-breadcrumbs, .master-footer, .preview-toolbar, .skiptranslate, #google_translate_element { 
      display: none !important; 
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
  .vl-print-area-wrapper { 
    background: #fff !important;
    min-height: 0 !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    vertical-align: baseline;
  }
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const IL = ({ value = "", cls = "" }) => <span className={`vl-il ${cls}`}>{value}</span>;
const FL = ({ value = "", style }) => (
  <span className="vl-fl" style={{ ...style, display: "inline-block", borderBottom: "1px solid #333", minHeight: "14px", padding: "0 4px" }}>{value}</span>
);
const CharBox = ({ value = "", n = 8 }) => {
  const chars = String(value || "").padEnd(n, " ").split("").slice(0, n);
  return (
    <span className="vl-char-box">
      {chars.map((ch, i) => <span key={i}>{ch}</span>)}
    </span>
  );
};
const CB = ({ checked }) => <input type="checkbox" checked={!!checked} readOnly style={{ transform: "scale(1.1)", margin: "0 4px" }} />;
const Divider = ({ type = "divider" }) => <hr className={`vl-${type}`} />;
const SectionPink = ({ children, style }) => <div className="vl-section-pink" style={style}>{children}</div>;
const PageNum = ({ n }) => <div className="vl-page-num">{n}</div>;
const FR = ({ children, style }) => <div className="vl-field-row" style={style}>{children}</div>;

/* Marathi numerals */
const marathiNums = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२', '१३', '१४', '१५'];
function toMarathi(n) { return n < marathiNums.length ? marathiNums[n] : String(n); }

/* AVS AI360 Logo */
const AVSLogo = () => (
  <div className="vl-logo-circle">
    <div className="vl-avs-logo">
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: -0.5 }}>AVS</div>
      <div style={{ fontSize: 6.5 }}>AI360</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1 — Vehicle Loan Application (Main Page)
══════════════════════════════════════════════════════════════════════════ */
function Page1({ data = {}, clientInfo = {}, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const [y, m, d] = (data.dinank || "").split("-");

  // Dynamic list: show all filled ones, but at least 2 by default
  const baseList = [
    { name: data.jameen1Naav || data.g1Naav, age: data.jameen1Vay || data.g1Vay },
    { name: data.jameen2Naav || data.g2Naav, age: data.jameen2Vay || data.g2Vay },
    { name: data.jameen3Naav, age: data.jameen3Vay },
  ];
  // Filter out any that are strictly empty
  const activeBase = baseList.filter(g => g.name && String(g.name).trim());

  const allGuarantors = activeBase.map((g, i) => ({ ...g, num: i + 1 }));
  const initialCount = allGuarantors.length;

  (data.extraGuarantors || []).forEach((g, i) => {
    allGuarantors.push({
      name: data[`exG_${g.id}Naav`] || '',
      age: data[`exG_${g.id}Vay`] || '',
      num: initialCount + i + 1,
    });
  });

  return (
    <div className="vl-page">
      {/* 1. Top Section - To: Label, Logo, Title, and Module Tag */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        {/* Left Column: Label + Logo */}
        <div style={{ width: "25%", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>{L("स. अध्यक्ष/संचालक मंडळ,", "To, The Hon. Chairman/Board of Directors,")}</div>
          {/* Even smaller Logo */}
          <div style={{ width: 50, height: 50, border: "1.2px solid var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
            <div style={{ width: 42, height: 42, border: "1px solid var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "var(--primary)" }}>
              AVS
            </div>
          </div>
        </div>

        <div style={{ flex: 1, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", textDecoration: "underline", margin: 0, letterSpacing: "0.5px" }}>
            {L("वाहन कर्ज मागणी अर्ज", "Vehicle Loan Application Form")}
          </h1>
          <div style={{ fontSize: 9, color: "#333", marginTop: 4, fontWeight: "normal" }}>
            {L("(टीप: पान नंबर १ वर नमूद केलेल्या सूचनाचे वाचन करून कर्ज अर्ज भरावा.)", "(Note: Please read instructions on Page 1 before filling the form.)")}
          </div>
        </div>

        <div style={{ textAlign: "right", width: "25%" }}>
          <div style={{ fontSize: 22, fontStyle: "italic", color: "var(--primary)", fontWeight: 900, lineHeight: 1 }}>Vehicle</div>
          {data.appNo && <div style={{ fontSize: 9.5, color: "#444", marginTop: 6 }}>{L("App No:", "App No:")} <span style={{ fontWeight: "bold" }}>{data.appNo}</span></div>}
        </div>
      </div>

      {/* 3. Bottom Header Section - Branding and Account Grid */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        {/* Left: Branding & Address */}
        <div style={{ flex: 1, paddingRight: 5, minWidth: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: "var(--primary)", lineHeight: 1.1 }}>{clientInfo?.name || "AVS AI 360 Admin"}</div>
          <div style={{ fontSize: 9, color: "#333", marginTop: 3, fontWeight: "normal" }}>
            {L("(नोंदणी क्र. बी. ओ. एम./डब्ल्यू. ए./आर. एस. आर./३२१/सन १९८७)", "(Reg No. BOM/W.A./RSR/321/Year 1987)")}
          </div>
          <div style={{ fontSize: 7.5, marginTop: 6, lineHeight: 1.2, width: '100%', whiteSpace: 'nowrap', letterSpacing: '-0.2px', fontWeight: "normal" }}>
            <strong style={{ fontWeight: 700 }}>{L("प्रशासकीय कार्यालय :", "Admin Office:")}</strong> {L("ऑफिस क्र. २१०, दुसरा मजला, देवी अन्नपूर्णा निवाससमोर को-अप. सोसायटा लि., प्लॉट नं. ८, सेक्टर-१८, वाशी, नवी मुंबई - ४००७०५.", "Office No. 210, 2nd Floor, Opp. Devi Annapurna Niwas Co-op Soc Ltd, Plot No. 8, Sector-18, Vashi, Navi Mumbai - 400705.")}
          </div>
        </div>

        {/* Right: Date + Account Details Grid (Unified Position) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", minWidth: 260, paddingRight: 5 }}>
          {/* Perfectly Aligned Date Row */}
          <div style={{ textAlign: "right", paddingRight: 0, marginBottom: 2, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: "normal", marginRight: 4 }}>{L("दिनांक", "Date")}</span>
            <span style={{ borderBottom: "1px solid #333", width: 40, textAlign: "center", paddingBottom: 1, fontSize: 11, display: "inline-block" }}>{d}</span>
            <span style={{ fontSize: 12, margin: "0 4px" }}>/</span>
            <span style={{ borderBottom: "1px solid #333", width: 40, textAlign: "center", paddingBottom: 1, fontSize: 11, display: "inline-block" }}>{m}</span>
            <span style={{ fontSize: 12, margin: "0 4px" }}>/</span>
            <span style={{ borderBottom: "1px solid #333", width: 80, textAlign: "center", paddingBottom: 1, fontSize: 11, display: "inline-block" }}>{y}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", columnGap: 8, rowGap: 6 }}>
            <span style={{ fontSize: 10.5, fontWeight: "normal", justifySelf: "end" }}>{L("स. क्र./साम स./छ. क्र.:", "Member No:")}</span>
            <CharBox value={data.saCra} n={8} />

            <span style={{ fontSize: 10.5, fontWeight: "normal", justifySelf: "end" }}>{L("कर्ज खाते क्र.:", "Loan A/C No:")}</span>
            <CharBox value={data.karjKhate} n={8} />

            <span style={{ fontSize: 10.5, fontWeight: "normal", justifySelf: "end" }}>{L("शाखा:", "Branch:")}</span>
            <div style={{ textAlign: "left", fontWeight: 900, fontSize: 11 }}>{data.shakha}</div>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", borderBottom: "3.5px solid var(--primary)", marginBottom: 15 }} />

      <div style={{ fontSize: 10.5, marginBottom: 10, marginTop: 15, fontWeight: "normal" }}>{L("महोदय,", "Sir,")}</div>

      {/* 4. Applicants Info */}
      <div style={{ fontSize: 12, lineHeight: 1.7, marginTop: 4 }}>
        <FR>
          <span style={{ fontWeight: "normal" }}>{L("अर्जदार श्री./श्रीमती", "Applicant Mr./Mrs.")}:</span>
          <FL value={data.arjdarNaav} />
          <span style={{ marginLeft: 16 }}>{L("वय", "Age")}:</span>
          <IL value={data.arjdarVay} cls="vl-il-sm" />
          <span>{L("वर्ष", "Years")}</span>
        </FR>
      </div>

      {/* Body text */}
      <div style={{ fontSize: 12, lineHeight: 2.2, marginTop: 11 }}>
        {lang === 'mr' ? (
          <>
            यांजकडून अर्ज करण्यात येतो की, मला ₹ <IL value={data.karjRakkam} cls="vl-il-lg" />
            (अक्षरी ₹ <IL value={data.akshari} cls="vl-il-xl" />)
            वाहन तारण कर्ज पाहिजे आहे. सदर कर्जाची मी <IL value={data.vyajDar} cls="vl-il-sm" /> % व्याजासह <IL value={data.paratfedKalavadhi} cls="vl-il-sm" /> महिन्यात संपूर्ण परत फेड करीन. पहिला हप्ता
            <IL value={data.pahilaHapta} cls="vl-il-sm" /> महिन्यांनंतर आणि बाकीचे हप्ते तद्नंतर प्रत्येक महिन्याच्या
            <IL value={data.tarikh} cls="vl-il-sm" /> तारखेस देत जाईन. माझ्या कर्ज घेण्याचा उद्देश (कारण) <FL value={data.karan} style={{ maxWidth: 700, minWidth: 400 }} /> हा असून माझी सध्याची माहिती पुढीलप्रमाणे देत आहे.
          </>
        ) : (
          <>
            I/We hereby apply for a Vehicle Loan of ₹ <IL value={data.karjRakkam} cls="vl-il-lg" />
            (Rupees <IL value={data.akshari} cls="vl-il-xl" /> only). I will repay this loan along with interest at <IL value={data.vyajDar} cls="vl-il-sm" /> % within
            <IL value={data.paratfedKalavadhi} cls="vl-il-sm" /> months. The first installment will be paid after
            <IL value={data.pahilaHapta} cls="vl-il-sm" /> months and subsequent installments on the
            <IL value={data.tarikh} cls="vl-il-sm" />th of every month. The purpose of my loan is <FL value={data.karan} style={{ maxWidth: 300, minWidth: 150 }} /> and I am providing my current information as follows.
          </>
        )}
      </div>

      <div style={{ fontSize: 12, lineHeight: 2.2, marginTop: 6 }}>
        {lang === 'mr' ? (
          <>
            मी विवाहित / अविवाहित असून, माझ्या कुटुंबातील <IL value={data.avalambun} cls="vl-il-sm" /> व्यक्ती माझ्यावर अवलंबून आहेत. तसेच मी प्रतिज्ञेवर सांगतो की, दुसऱ्या कोणत्याही को-ऑपरेटिव्ह सोसायटीचे अगर बँकेचे माझ्यावर कर्ज नाही. माझ्या कर्जाची परतफेड मी संचालक मंडळ ठरवील त्याप्रमाणे व व्याजाच्या दराने तसेच सोसायटीतर्फे वेळोवेळी असणाऱ्या इतर आकारणीसह व खर्चासह दिलेल्या मुदतीत करीन. सोसायटीचे अस्तित्वात असलेले तसेच पुढे अंमलात येणारे सर्व कर्ज विषयक नियम व पोटनियम मला मान्य आहेत / राहतील.
          </>
        ) : (
          <>
            I am married / unmarried, and <IL value={data.avalambun} cls="vl-il-sm" /> family members are dependent on me. I also declare on oath that I do not have any other bank loan from any other cooperative society. I will repay my loan as decided by the Board of Directors with interest and other charges as applicable to the society from time to time within the given period. I agree to abide by all existing and future rules and by-laws of the society.
          </>
        )}
      </div>

      {/* Guarantors Summary */}
      <div style={{ marginTop: 8 }}>
        {allGuarantors.map(item => (
          <div key={item.num} className="vl-field-row" style={{ fontSize: 12, marginBottom: 2 }}>
            <span>{toMarathi(item.num)}) {L("जामिनदाराचे नाव श्री./श्रीमती", "Guarantor Name Mr./Mrs.")}</span>
            <FL value={item.name} />
            <span style={{ marginLeft: 8 }}>{L("वय", "Age")}</span>
            <IL value={item.age} cls="vl-il-sm" />
            <span>{L("वर्षे", "Years")}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, marginTop: 20 }}>{L("संचालक मंडळाने माझ्या या कर्ज मागणी अर्जाचा विचार करावा ही नम्र विनंती.", "I humbly request the Board of Directors to consider my loan application.")}</div>

      {/* Signature Block */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <div style={{ textAlign: "left", minWidth: 280 }}>
          <div style={{ fontSize: 12, textAlign: "center" }}>{L("आपला/आपली विश्वासू,", "Yours faithfully,")}</div>
          <div style={{ fontSize: 12, marginTop: 25 }}>{L("सही", "Signature")}</div>
          <div style={{ display: "flex", alignItems: "flex-end", marginTop: 16 }}>
            <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{L("श्री./श्रीमती :", "Mr./Mrs. :")}</span>
            <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 4, textAlign: "center", fontSize: 12, paddingBottom: 2 }}>{data.arjdarNaav}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, marginTop: 10, fontWeight: "bold" }}>{L("अर्जदार (कर्जदार)", "Applicant (Borrower)")}</div>
        </div>
      </div>

      <Divider style={{ border_bottom: "3px double #333", borderTop: "none", height: 2, margin: "25px 0" }} />

      {/* Board Remarks Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: "bold", paddingTop: 40 }}>
        <span>{L("संचालक मंडळाचा शेरा", "Board Remarks")}</span>
        <span>{L("शिफारस करणाऱ्या संचालक/स्थानिक समिती सदस्याची सही", "Recommending Director/Local Committee Member Signature")}</span>
      </div>

      <hr style={{ border: "none", borderBottom: "1px solid #333", margin: "10px 0 14px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 10, fontSize: 12, marginTop: 20 }}>
        <div>{L("संचालक मंडळाची सभा दि.", "Board Meeting Date")} <IL cls="vl-il-sm" /> / <IL cls="vl-il-sm" /> / 20</div>
        <div>{L("सभा क्रमांक", "Meeting No.")} <IL cls="vl-il-sm" /></div>
        <div>{L("ठराव क्रमांक", "Resolution No.")} <IL cls="vl-il-sm" /></div>
      </div>

      <div style={{ fontSize: 12, marginTop: 15 }}>
        {L("नुसार ₹", "According to ₹")} ____________________ {L("(अक्षरी ₹", "(Rupees")} _________________________________________________ {L(") कर्ज मंजूर करण्यात येत आहे.", ") loan is being approved.")}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 65, fontSize: 12, fontWeight: "bold" }}>
        <span style={{ borderTop: "1.5px solid #333", minWidth: 120, textAlign: "center", paddingTop: 5 }}>{L("सरव्यवस्थापक", "General Manager")}</span>
        <span style={{ borderTop: "1.5px solid #333", minWidth: 120, textAlign: "center", paddingTop: 5 }}>{L("उपाध्यक्ष", "Vice Chairman")}</span>
        <span style={{ borderTop: "1.5px solid #333", minWidth: 120, textAlign: "center", paddingTop: 5 }}>{L("अध्यक्ष", "Chairman")}</span>
      </div>

      <PageNum n={toMarathi(1)} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Reusable Person Page (Borrower / Guarantor)
   prefix: "b" | "g1" | "g2" | "exG_{id}"
══════════════════════════════════════════════════════════════════════════ */
function PersonPage({ title, pageNum, data = {}, prefix = "b", showDeclaration = false, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  const p = prefix;
  return (
    <div className="vl-page">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
        <div className="vl-photo-box" style={{ width: 70, height: 85 }}>
          {d[p + "Photo"] ? (
            <img src={d[p + "Photo"]} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            L("फोटो", "Photo")
          )}
        </div>
        <div style={{ flex: 1 }}>
          <SectionPink style={{ textAlign: "center", marginBottom: 10 }}>{title}</SectionPink>
          <div style={{ fontSize: 12 }}>
            <FR>
              <span>१. {L("संपूर्ण नाव: श्री./श्रीमती", "Full Name: Mr./Mrs.")}</span>
              <FL value={d[p + "Naav"]} />
              <span>{L("वय", "Age")}</span>
              <FL value={d[p + "Vay"]} style={{ maxWidth: 40 }} />
              <span>{L("वर्षे", "Years")}</span>
            </FR>
            <FR>
              <span>२. {L("सभासद क्रमांक:", "Member No.:")}</span>
              <FL value={d[p + "SabasadNo"]} style={{ maxWidth: 100 }} />
              <span>{L("धारण केलेले भाग संख्या", "Shares Count")}</span>
              <FL value={d[p + "Shares"]} style={{ maxWidth: 80 }} />
              <span>{L("रक्कम ₹", "Amount ₹")}</span>
              <FL value={d[p + "SharesRakkam"]} style={{ maxWidth: 70 }} />
            </FR>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, lineHeight: 1 }}>
        <FR>
          <span>३. {L("वडील/पतीचे संपूर्ण नाव: श्री.", "Father/Husband Name: Mr.")}</span>
          <FL value={d[p + "VadilNaav"]} />
          <span>{L("वय", "Age")}</span>
          <FL value={d[p + "VadilVay"]} style={{ maxWidth: 40 }} />
          <span>{L("वर्षे", "Years")}</span>
        </FR>
        <FR>
          <span>४. {L("आईचे नाव: सौ./श्रीमती", "Mother Name: Mrs.")}</span>
          <FL value={d[p + "AaiNaav"]} />
          <span>{L("वय", "Age")}</span>
          <FL value={d[p + "AaiVay"]} style={{ maxWidth: 40 }} />
          <span>{L("वर्षे", "Years")}</span>
        </FR>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 2 }}>
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>५. {L("राहण्याचा पत्ता:", "Residential Address:")}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 6, height: 20, padding: "0 4px", fontSize: 12 }}>
            {String(d[p + "Patta"] || "").substring(0, 75)}
          </div>
        </div>
        <div style={{ borderBottom: "1px solid #333", width: "100%", height: 20, padding: "0 4px", fontSize: 12, marginBottom: 4 }}>
          {String(d[p + "Patta"] || "").substring(75)}
        </div>

        {p === 'b' && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 2 }}>
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{L("कार्यालयाचा पत्ता:", "Office Address:")}</span>
              <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 6, height: 20, padding: "0 4px", fontSize: 12 }}>
                {String(d[p + "OfficeAddress"] || "")}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 8 }}>
              <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{L("गावचा पत्ता:", "Gavcha Address:")}</span>
              <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 6, height: 20, padding: "0 4px", fontSize: 12 }}>
                {String(d[p + "GavchaAddress"] || "")}
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 5, marginTop: 4 }}>
          <span>{L("पिन कोड", "Pin Code")} <IL value={d[p + "PinKod"]} cls="vl-il-sm" /></span>
          <span>{L("दूरध्वनी", "Tel.")} <IL value={d[p + "Durdhvani"]} cls="vl-il-lg" /></span>
          <span>{L("मोबाईल", "Mobile")} <IL value={d[p + "Mobile"]} cls="vl-il-lg" /></span>
          <span>{L("ई मेल:", "Email:")} <IL value={d[p + "Email"]} cls="vl-il-lg" /></span>
        </div>

        <div style={{ marginBottom: 6 }}>
          ६. {L("राहण्याच्या जागेचे स्वरूप:", "Property Type:")}
          &nbsp; {L("स्वःमालकीचे", "Self-owned")} <CB checked={(d[p + "JageSwaarup"] || []).includes("स्वःमालकीचे")} />
          &nbsp; {L("वडिलोपार्जित", "Ancestral")} <CB checked={(d[p + "JageSwaarup"] || []).includes("वडिलोपार्जित")} />
          &nbsp; {L("पागडीची", "Pagadi")} <CB checked={(d[p + "JageSwaarup"] || []).includes("पागडीची")} />
          &nbsp; {L("भाडेतत्त्वावर", "Rented")} <CB checked={(d[p + "JageSwaarup"] || []).includes("भाडेतत्त्वावर")} />
          &nbsp; {L("कंपनी क्वार्टर्स", "Company Qtrs")} <CB checked={(d[p + "JageSwaarup"] || []).includes("कंपनी क्वार्टर्स")} />
        </div>

        <FR>
          <span>७. {L("सध्याच्या जागेत राहत असल्याचा कालावधी:", "Residence Duration:")}</span>
          <FL value={d[p + "Kalavadhi_m"]} style={{ maxWidth: 50 }} /><span>{L("महिने", "Months")}</span>
          <FL value={d[p + "Kalavadhi_v"]} style={{ maxWidth: 50 }} /><span>{L("वर्षे", "Years")}</span>
        </FR>

        <div style={{ marginBottom: 10 }}>
          ८. {L("वैवाहिक स्थिती:", "Marital Status:")} {L("विवाहित", "Married")} <CB checked={d[p + "Vaivahik"] === "विवाहित"} /> {L("अविवाहित", "Unmarried")} <CB checked={d[p + "Vaivahik"] === "अविवाहित"} />
          <span style={{ marginLeft: 20 }}>{L("अवलंबून असलेल्या कुटुंबातील व्यक्ती संख्या:", "Dependents:")}</span>
          <IL value={d[p + "Avalambun"]} cls="vl-il-sm" />
        </div>

        {/* Job Details */}
        <div style={{ fontWeight: 600, marginBottom: 4 }}>९. {L("नोकरी/व्यवसायाचा तपशील:", "Job/Business Details:")}</div>
        <div style={{ marginLeft: 15 }}>
          <FR><span>अ) {L("कंपनीचे नाव", "Company Name")}</span><FL value={d[p + "Company"]} /></FR>
          <FR><span>{L("पत्ता:", "Address:")}</span><FL value={d[p + "CompanyPatta"]} /></FR>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 6, marginTop: 4 }}>
            <span>{L("पिन कोड", "Pin")} <IL value={d[p + "CompanyPin"]} cls="vl-il-sm" /></span>
            <span>{L("दूरध्वनी", "Tel")} <IL value={d[p + "CompanyTel"]} cls="vl-il-lg" /></span>
            <span>{L("मोबाईल", "Mobile")} <IL value={d[p + "CompanyMobile"]} cls="vl-il-lg" /></span>
            <span>{L("ई मेल/वेबसाईट", "Email/Website")} <IL value={d[p + "CompanyEmail"]} cls="vl-il-lg" /></span>
          </div>
          <FR>
            <span>ब) {L("विभाग (डिपार्टमेंट)", "Department")}</span><FL value={d[p + "Vibhag"]} />
            <span>{L("हुद्दा", "Designation")}</span><FL value={d[p + "Hudda"]} />
            <span>{L("कर्मचारी सांकेतिक क्र.", "Emp. Code")}</span><FL value={d[p + "EmpCode"]} style={{ maxWidth: 80 }} />
          </FR>
          <FR>
            <span>क) {L("नोकरी/व्यवसायाचा कालावधी", "Work Duration")}</span>
            <FL value={d[p + "Karj_m"]} style={{ maxWidth: 50 }} /><span>{L("महिने", "Months")}</span>
            <FL value={d[p + "Karj_v"]} style={{ maxWidth: 50 }} /><span>{L("वर्षे", "Years")}</span>
            <span style={{ marginLeft: 15 }}>ड) {L("सेवानिवृत्ती दिनांक:", "Retirement Date:")}</span>
            <IL value={d[p + "Seva"]} cls="vl-il-lg" />
          </FR>
        </div>

        {/* Income Details */}
        <div style={{ fontWeight: 600, marginTop: 10, marginBottom: 4 }}>१०. {L("उत्पन्नाचा तपशील:", "Income Details:")}</div>
        <div style={{ marginLeft: 15 }}>
          <FR>
            <span>अ) {L("नोकरदार असल्यास: एकूण मासिक वेतन ₹", "If Salaried: Monthly Salary ₹")}</span>
            <FL value={d[p + "MonthlyVetan"]} style={{ maxWidth: 80 }} />
            <span>{L("एकूण कपात ₹", "Deductions ₹")}</span>
            <FL value={d[p + "Kapat"]} style={{ maxWidth: 70 }} />
            <span>{L("निव्वळ वेतन ₹", "Net Salary ₹")}</span>
            <FL value={d[p + "Niwal"]} style={{ maxWidth: 70 }} />
          </FR>
          <FR>
            <span>ब) {L("व्यावसायिक असल्यास: वार्षिक उत्पन्न ₹", "If Business: Annual Income ₹")}</span>
            <FL value={d[p + "Vaarshik"]} style={{ maxWidth: 80 }} />
            <span>{L("सर्व खर्च (करासह) कपात ₹", "Total Expenses ₹")}</span>
            <FL value={d[p + "Kharcha"]} style={{ maxWidth: 70 }} />
            <span>{L("निव्वळ वार्षिक उत्पन्न ₹", "Net Annual ₹")}</span>
            <FL value={d[p + "NiwalVaarshik"]} style={{ maxWidth: 70 }} />
          </FR>
          <FR>
            <span>क) {L("संपूर्ण कुटुंबाचे एकूण निव्वळ उत्पन्न: ₹", "Family Net Income: ₹")}</span>
            <FL value={d[p + "Kutumb"]} style={{ maxWidth: 80 }} />
            <span style={{ marginLeft: 10 }}>
              {L("मासिक", "Monthly")} <CB checked={d[p + "KutumbType"] === "मासिक"} />
              {L("वार्षिक", "Yearly")} <CB checked={d[p + "KutumbType"] === "वार्षिक"} />
            </span>
          </FR>
        </div>

        <FR style={{ marginTop: 8 }}>
          <span>११. {L("घर/शेती ज्यांच्या नावावर आहे त्यांचे नाव:", "Property Owner Name:")}</span>
          <FL value={d[p + "ShetiNaav"]} />
          <span>{L("नाते", "Relation")}</span>
          <FL value={d[p + "ShetiNaate"]} style={{ maxWidth: 80 }} />
        </FR>

        <div style={{ marginTop: 6 }}>
          <FR>
            <span>१२. {L("गावचा पत्ता: मुक्काम", "Village Address: Mukkam")}</span>
            <FL value={d[p + "GaavMukkam"]} />
            <span>{L("पोस्ट", "Post")}</span><FL value={d[p + "GaavPost"]} />
          </FR>
          <FR>
            <span>{L("तालुका", "Taluka")}</span><FL value={d[p + "GaavTaluka"]} />
            <span>{L("जिल्हा", "District")}</span><FL value={d[p + "GaavJilha"]} />
            <span>{L("राज्य", "State")}</span><FL value={d[p + "GaavRajya"]} style={{ maxWidth: 100 }} />
          </FR>
          <div style={{ display: "flex", gap: 15, marginBottom: 6, marginTop: 4 }}>
            <span>{L("पिन कोड", "Pin Code")} <IL value={d[p + "PinKod"]} cls="vl-il-sm" /></span>
            <span>{L("मोबाईल", "Mobile")} <IL value={d[p + "Mobile"]} cls="vl-il-lg" /></span>
          </div>
        </div>

        <FR style={{ marginTop: 6 }}>
          <span>१३. {L("संस्थेकडून या पूर्वी कर्ज:", "Previous loan details:")}</span>
          <FL value={d[p + "PurvKarjPrakar"]} />
          <span>{L("खाते क्र.", "A/C No.")}</span><FL value={d[p + "PurvKhate"]} style={{ maxWidth: 80 }} />
          <span>{L("रक्कम ₹", "Amount ₹")}</span><FL value={d[p + "PurvRakkam"]} style={{ maxWidth: 70 }} />
        </FR>
        <div style={{ display: "flex", gap: 25, marginBottom: 8, marginLeft: 15 }}>
          <span>{L("कर्ज घेतल्याचा दिनांक:", "Loan Date:")} <IL value={d[p + "PurvDin1"]} cls="vl-il-sm" /></span>
          <span>{L("कर्ज परत फेडीचा दिनांक:", "Repayment Date:")} <IL value={d[p + "PurvDin2"]} cls="vl-il-sm" /></span>
        </div>

        <div style={{ fontWeight: 600, marginTop: 6 }}>१४. {L("जामिनदार असल्यास तपशील:", "As guarantor details:")}</div>
        <div style={{ marginLeft: 15 }}>
          {[{ idx: "a", mr: "अ" }, { idx: "b", mr: "ब" }].map(item => (
            <div key={item.idx} style={{ marginBottom: 4 }}>
              <FR><span>{item.mr}) {L("कर्जदाराचे नाव:", "Borrower Name:")}</span><FL value={d[p + "Jam94" + item.idx + "KarjdarNaav"]} /></FR>
              <FR>
                <span>{L("कर्ज प्रकार:", "Loan Type:")}</span><FL value={d[p + "Jam94" + item.idx + "Prakar"]} />
                <span>{L("खाते क्र.", "A/C No.")}</span><FL value={d[p + "Jam94" + item.idx + "Khate"]} />
                <span>{L("रक्कम ₹", "Amount ₹")}</span><FL value={d[p + "Jam94" + item.idx + "Rakkam"]} style={{ maxWidth: 80 }} />
              </FR>
            </div>
          ))}
        </div>

        <FR style={{ marginTop: 6 }}>
          <span>१५. {L("कुटुंब सदस्यांनी घेतलेल्या कर्जाचा तपशील:", "Family member loans:")}</span>
          <FL value={d[p + "Kutumb95Naav"]} />
        </FR>
        <FR style={{ marginLeft: 15 }}>
          <span>{L("कर्ज प्रकार:", "Loan Type:")}</span><FL value={d[p + "Kutumb95Prakar"]} />
          <span>{L("खाते क्र.", "A/C No.")}</span><FL value={d[p + "Kutumb95Khate"]} />
          <span>{L("रक्कम ₹", "Amount ₹")}</span><FL value={d[p + "Kutumb95Rakkam"]} style={{ maxWidth: 80 }} />
        </FR>

        <div style={{ fontWeight: 600, marginTop: 6 }}>१६. {L("इतर वित्त संस्था/बँकेकडून घेतलेल्या कर्जाचा तपशील:", "Details of loans taken from other financial institutions/banks:")}</div>
        <FR style={{ marginTop: 4 }}>
          <span>{L("संस्था/बँकेचे नाव:", "Bank/Institution Name:")}</span><FL value={d[p + "Bank96Naav"]} />
          <span>{L("शाखा", "Branch")}</span><FL value={d[p + "Bank96Shakha"]} style={{ maxWidth: 80 }} />
        </FR>
        <FR style={{ marginLeft: 15 }}>
          <span>{L("कर्ज प्रकार:", "Loan Type:")}</span><FL value={d[p + "Bank96Prakar"]} />
          <span>{L("कर्ज खाते क्र.", "Loan A/C No.")}</span><FL value={d[p + "Bank96Khate"]} />
          <span>{L("कर्ज रक्कम ₹", "Loan Amount ₹")}</span><FL value={d[p + "Bank96Rakkam"]} style={{ maxWidth: 80 }} />
        </FR>
        <div style={{ display: "flex", gap: 25, marginBottom: 8, marginLeft: 15, marginTop: 4 }}>
          <span>{L("कर्ज घेतल्याचा दिनांक:", "Loan Date:")} <IL value={d[p + "Bank96Din1"]} cls="vl-il-sm" /></span>
          <span>{L("कर्ज परत फेडीचा दिनांक:", "Repayment Date:")} <IL value={d[p + "Bank96Din2"]} cls="vl-il-sm" /></span>
        </div>
      </div>

      {showDeclaration && (
        <div style={{ fontSize: 12, marginTop: 15, fontStyle: "italic", borderTop: "1px dashed #ccc", paddingTop: 5 }}>
          {L("वरील सर्व माहिती सत्य व योग्य असून मी जामिन राहण्यास स्व: खुशीने तयार आहे.", "I declare that all the above information is true and correct and I voluntarily agree to stand as guarantor.")}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 11, marginTop: 40 }}>
        <div>
          <span>{L("ठिकाण:", "Place:")} <IL value={d[p + "Thikan"] || d.thikan} cls="vl-il-lg" /></span>
        </div>
        <div>
          <span>{L("दिनांक", "Date")} <IL value={d[p + "Dinank"] || d.dinank} cls="vl-il-sm" /></span>
        </div>
        <div style={{ textAlign: "left", minWidth: 200 }}>
          <div style={{ paddingLeft: 80, marginBottom: 30, marginTop: -15, marginLeft: -50 }}>{L("सही:", "Sig:")}</div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span style={{ whiteSpace: "nowrap" }}>{L("श्री./श्रीमती :", "Mr./Mrs. :")}</span>
            <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 4, textAlign: "center", paddingBottom: 1 }}>
              {d[p + "Naav"]}
            </div>
          </div>
        </div>
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════════════════
   PAGE 5 — New Vehicle Details (नवीन वाहन खरेदी)
══════════════════════════════════════════════════════════════════════════ */
function Page5({ data = {}, lang, pageNum }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  return (
    <div className="vl-page">
      <SectionPink style={{ textAlign: "center", marginBottom: 5 }}>
        {L('अ) नवीन वाहन खरेदी करावयाचे असल्यास भरावयाची माहिती', 'A) Information for New Vehicle Purchase')}
      </SectionPink>

      <div style={{ fontSize: 12, lineHeight: 1 }}>
        <div style={{ marginBottom: 2 }}>
          १. {L('वाहनाचा वापर:', 'Vehicle Usage:')}
          &nbsp; {L('वैयक्तिक', 'Personal')} <CB checked={d.newVahanaVapar === 'वैयक्तिक'} />
          &nbsp; {L('व्यावसायिक', 'Commercial')} <CB checked={d.newVahanaVapar === 'व्यावसायिक'} />
        </div>

        <FR style={{ marginBottom: 1 }}>
          <span>२. अ) {L('उत्पादक कंपनीचे नाव:', 'Manufacturer Company Name:')}</span><FL value={d.newCompanyNaav} style={{ maxWidth: 150 }} />
          <span style={{ marginLeft: 20 }}>ब) {L('वाहनाचा प्रकार:', 'Vehicle Type:')}</span><FL value={d.newVahanaPrakar} style={{ maxWidth: 150 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>क) {L('निर्मिती वर्ष सन:', 'Manufacturing Year:')}</span><FL value={d.newNirmitVarsh} style={{ maxWidth: 150 }} />
          <span style={{ marginLeft: 20 }}>ड) {L('मॉडेल नं.:', 'Model No.:')}</span><FL value={d.newModel} style={{ maxWidth: 150 }} />
        </FR>

        <div style={{ marginBottom: 2, marginTop: 1 }}>
          {L('इ) इंधन प्रकार:', 'e) Fuel Type:')}
          &nbsp; {L('डिझेल', 'Diesel')} <CB checked={d.newFuelType === 'डिझेल'} />
          &nbsp; {L('पेट्रोल', 'Petrol')} <CB checked={d.newFuelType === 'पेट्रोल'} />
          &nbsp; {L('सी. एन. जी.', 'CNG')} <CB checked={d.newFuelType === 'सीएनजी'} />
          &nbsp; {L('इलेक्ट्रिक', 'Electric')} <CB checked={d.newFuelType === 'इलेक्ट्रिक'} />
        </div>

        <FR style={{ marginBottom: 1 }}><span>३. {L('वाहन विकत देणाऱ्या एजन्सी/डिलर्सचे नाव:', 'Dealer/Agency Name:')}</span><FL value={d.newDealerNaav} /></FR>
        <FR style={{ marginBottom: 1 }}><span style={{ marginLeft: 20 }}>{L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.newDealerPatta} /></FR>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 2, marginTop: 1 }}>
          <span>{L('मोबाईल', 'Mobile')} <IL value={d.newDealerMobile} cls="vl-il-lg" /></span>
          <span>{L('दूरध्वनी', 'Tel')} <IL value={d.newDealerTel} cls="vl-il-lg" /></span>
          <span>{L('ई मेल आयडी:', 'Email ID:')} <IL value={d.newDealerEmail} cls="vl-il-lg" /></span>
        </div>

        <FR style={{ marginBottom: 1 }}>
          <span>४. अ) {L('वाहनाची खरेदी किंमत ₹', 'Vehicle Purchase Price ₹')}</span><FL value={d.newKimat} style={{ maxWidth: 120 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>ब) {L('बुकिंगसाठी भरणा केलेली रक्कम ₹', 'Booking Amount ₹')}</span><FL value={d.newBooking} style={{ maxWidth: 120 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>क) {L('शिल्लक देणे रक्कम ₹', 'Balance Amount ₹')}</span><FL value={d.newShillak} style={{ maxWidth: 120 }} />
        </FR>

        <FR style={{ marginTop: 2, marginBottom: 1 }}>
          <span>५. {L('वाहनाच्या किंमतीच्या २५% रक्कम संस्थेमध्ये जमा केली आहे काय?', '25% of vehicle price deposited?')}</span>
          &nbsp; {L('होय', 'Yes')} <CB checked={d.newDepositYes === true} />
          &nbsp; {L('नाही', 'No')} <CB checked={d.newDepositYes === false} />
          <span style={{ marginLeft: 15 }}>{L('असल्यास ₹', 'Amount ₹')}</span> <IL value={d.newDepositAmt} cls="vl-il-lg" />
        </FR>

        <FR style={{ marginTop: 2, marginBottom: 1 }}>
          <span>६. {L('वाहन उभे करण्याचे ठिकाण:', 'Vehicle Parking Place:')}</span><FL value={d.newParkingThikan} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>अ) {L('परमिट नं.:', 'Permit No.:')}</span><FL value={d.newPermitNo} style={{ maxWidth: 120 }} />
          <span style={{ marginLeft: 10 }}>{L('नुतनीकरण दिनांक', 'Renewal Date')}</span><FL value={d.newPermitRenew} style={{ maxWidth: 120 }} />
        </FR>

        <FR style={{ marginTop: 2 }}>
          <span>७. {L('या व्यतिरिक्त इतर वाहन आपल्या मालकीचे आहे काय?', 'Any other vehicle owned?')}</span>
          &nbsp; {L('होय', 'Yes')} <CB checked={d.newOtherVehicleYes === true} />
          &nbsp; {L('नाही', 'No')} <CB checked={d.newOtherVehicleYes === false} />
        </FR>
        {d.newOtherVehicleYes && (
          <div style={{ marginLeft: 20, marginTop: 1 }}>
            <FR style={{ marginBottom: 1 }}>
              <span>अ) {L('वाहन क्र.:', 'Vehicle No.:')}</span><FL value={d.newOtherVehicleNo} style={{ maxWidth: 100 }} />
              <span style={{ marginLeft: 15 }}>ब) {L('वाहनाचा प्रकार:', 'Vehicle Type:')}</span><FL value={d.newOtherVehicleType} style={{ maxWidth: 100 }} />
              <span style={{ marginLeft: 15 }}>क) {L('मॉडेल:', 'Model:')}</span><FL value={d.newOtherVehicleModel} style={{ maxWidth: 100 }} />
              <span style={{ marginLeft: 15 }}>ड) {L('निर्मिती वर्ष सन:', 'Mfg. Year:')}</span><FL value={d.newOtherVehicleYear} style={{ maxWidth: 60 }} />
            </FR>
          </div>
        )}
      </div>

      <SectionPink style={{ textAlign: "center", marginTop: 5, marginBottom: 4 }}>
        {L('ब) जुने वाहन तारण देऊन किंवा खरेदी करावयाचे असल्यास भरावयाची माहिती', 'B) Information for Old Vehicle (Pledge/Purchase)')}
      </SectionPink>

      <div style={{ fontSize: 12, lineHeight: 1.3 }}>
        <div style={{ marginBottom: 2 }}>
          १. {L('वाहनाचा वापर:', 'Vehicle Usage:')}
          &nbsp; {L('वैयक्तिक', 'Personal')} <CB checked={d.oldVahanaVapar === 'वैयक्तिक'} />
          &nbsp; {L('व्यावसायिक', 'Commercial')} <CB checked={d.oldVahanaVapar === 'व्यावसायिक'} />
        </div>

        <FR style={{ marginBottom: 1 }}><span>२. {L('वाहन विकत देणाऱ्या एजन्सी/डिलर्स/व्यक्तीचे नाव:', 'Seller/Dealer/Person Name:')}</span><FL value={d.oldDealerNaav} /></FR>
        <FR style={{ marginBottom: 1 }}><span style={{ marginLeft: 20 }}>{L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.oldDealerPatta} /></FR>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 2, marginTop: 1 }}>
          <span>{L('मोबाईल', 'Mobile')} <IL value={d.oldDealerMobile} cls="vl-il-lg" /></span>
          <span>{L('दूरध्वनी', 'Tel')} <IL value={d.oldDealerTel} cls="vl-il-lg" /></span>
          <span>{L('ई मेल आयडी:', 'Email ID:')} <IL value={d.oldDealerEmail} cls="vl-il-lg" /></span>
        </div>

        <FR style={{ marginBottom: 1 }}><span>३. {L('उत्पादक कंपनीचे नाव:', 'Manufacturer Name:')}</span><FL value={d.oldCompanyNaav} /></FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>अ) {L('वाहन क्र.:', 'Vehicle No.:')}</span><FL value={d.oldVehicleNo} style={{ maxWidth: 150 }} />
          <span style={{ marginLeft: 20 }}>ब) {L('आर. टि. ओ. कार्यालय:', 'RTO Office:')}</span><FL value={d.oldRTO} style={{ maxWidth: 150 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>क) {L('वाहनाचा प्रकार:', 'Vehicle Type:')}</span><FL value={d.oldVahanaPrakar} style={{ maxWidth: 150 }} />
          <span style={{ marginLeft: 20 }}>ड) {L('निर्मिती वर्ष सन:', 'Mfg. Year:')}</span><FL value={d.oldNirmitVarsh} style={{ maxWidth: 150 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>इ) {L('इंजिन नं.:', 'Engine No.:')}</span><FL value={d.oldEngineNo} style={{ maxWidth: 150 }} />
          <span style={{ marginLeft: 20 }}>ई) {L('चेसीज नं.:', 'Chassis No.:')}</span><FL value={d.oldChassisNo} style={{ maxWidth: 150 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span style={{ marginLeft: 20 }}>उ) {L('मॉडेल नं.:', 'Model No.:')}</span><FL value={d.oldModel} />
        </FR>

        <div style={{ marginBottom: 2, marginTop: 1 }}>
          ४. {L('इंधन प्रकार:', 'Fuel Type:')}
          &nbsp; {L('डिझेल', 'Diesel')} <CB checked={d.oldFuelType === 'डिझेल'} />
          &nbsp; {L('पेट्रोल', 'Petrol')} <CB checked={d.oldFuelType === 'पेट्रोल'} />
          &nbsp; {L('सी. एन. जी.', 'CNG')} <CB checked={d.oldFuelType === 'सीएनजी'} />
        </div>

        <FR style={{ marginBottom: 1 }}>
          <span>५. {L('फिटनेस नंबर:', 'Fitness No.:')}</span><FL value={d.oldFitnessNo} style={{ maxWidth: 120 }} />
          <span style={{ marginLeft: 10 }}>{L('नुतनीकरण दिनांक', 'Renewal Date')}</span><FL value={d.oldFitnessRenew} style={{ maxWidth: 120 }} />
        </FR>
        <FR style={{ marginBottom: 1 }}>
          <span>६. {L('वाहन उभे करण्याची ठिकाण:', 'Parking Place:')}</span><FL value={d.oldParkingThikan} />
        </FR>

        <div style={{ marginTop: 2 }}>
          ७. {L('परमिट तपशील:', 'Permit Details:')}
          <FR style={{ marginBottom: 1 }}><span style={{ marginLeft: 20 }}>अ) {L('परमिट नंबर:', 'Permit No.:')}</span><FL value={d.oldPermitNo} style={{ maxWidth: 120 }} /></FR>
          <div style={{ display: "flex", gap: 15, marginBottom: 2, marginLeft: 20, marginTop: 1 }}>
            <span>ब) {L('परमिट कार्यक्षेत्र:', 'Permit Area:')} &nbsp; {L('स्थानिक', 'Local')} <CB checked={d.oldPermitArea === 'स्थानिक'} /> &nbsp; {L('राज्यस्तरीय', 'State')} <CB checked={d.oldPermitArea === 'राज्यस्तरीय'} /> &nbsp; {L('नॅशनल', 'National')} <CB checked={d.oldPermitArea === 'नॅशनल'} /></span>
          </div>
          <FR style={{ marginLeft: 20, marginBottom: 1 }}>
            <span>{L('परमिट नुतनीकरण दिनांक:', 'Permit Renewal Date:')}</span><FL value={d.oldPermitRenewDate} style={{ maxWidth: 120 }} />
          </FR>
          <FR style={{ marginLeft: 20 }}>
            <span>{L('कालावधी दिनांक', 'Permit Period:')}</span><FL value={d.oldPermitFrom} style={{ maxWidth: 90 }} />
            <span>{L('पासून', 'from')}</span><FL value={d.oldPermitTo} style={{ maxWidth: 90 }} /><span>{L('पर्यंत', 'to')}</span>
          </FR>
        </div>

        <FR style={{ marginTop: 2, marginBottom: 1 }}>
          <span>८. {L('रोड टॅक्स ₹', 'Road Tax ₹')}</span><FL value={d.oldRoadTax} style={{ maxWidth: 100 }} />
          <span style={{ marginLeft: 10 }}>{L('कालावधी दिनांक', 'Valid Period:')}</span><FL value={d.oldRoadTaxPeriod} style={{ maxWidth: 120 }} />
        </FR>

        <div style={{ fontWeight: 600, marginBottom: 2, marginTop: 3 }}>
          {L('९. विमा तपशील:', 'Insurance Details:')}
        </div>
        <div style={{ marginLeft: 15 }}>
          <FR style={{ marginBottom: 1 }}><span>अ) {L('विमा कंपनीचे नाव:', 'Insurance Company Name:')}</span><FL value={d.insCompanyNaav} /></FR>
          <FR style={{ marginBottom: 1 }}><span>ब) {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.insAddress} /></FR>
          <FR style={{ marginBottom: 1 }}><span>क) {L('पॉलिसी नं.:', 'Policy No.:')}</span><FL value={d.insPolicy} style={{ maxWidth: 200 }} /></FR>
          <FR style={{ marginBottom: 1 }}>
            <span>ड) {L('विमा कालावधी:', 'Insurance Duration:')}</span>
            <IL value={d.insDurFrom} cls="vl-il-sm" /><span>{L('पासून', 'from')}</span>
            <IL value={d.insDurTo} cls="vl-il-sm" /><span>{L('पर्यंत', 'to')}</span>
            <span style={{ marginLeft: 15 }}>इ) {L('विमा रक्कम ₹', 'Sum Assured ₹')}</span><FL value={d.insAmount} style={{ maxWidth: 90 }} />
            <span style={{ marginLeft: 15 }}>{L('हप्ता रक्कम ₹', 'Premium ₹')}</span><FL value={d.insPremium} style={{ maxWidth: 90 }} />
          </FR>
        </div>

        <div style={{ fontWeight: 600, marginTop: 3, marginBottom: 1 }}>
          {L('१०. वाहन खरेदी किंमत व मूल्यांकन:', 'Vehicle Purchase Price & Valuation:')}
        </div>
        <div style={{ marginLeft: 15 }}>
          <FR style={{ marginBottom: 1 }}><span>अ) {L('वाहन खरेदी किंमत ₹', 'Purchase Price ₹')}</span><FL value={d.oldKimat} style={{ maxWidth: 120 }} /></FR>
          <FR style={{ marginBottom: 1 }}><span>ब) {L('अगाऊ (ॲडव्हान्स) दिलेली रक्कम ₹', 'Advance Amount ₹')}</span><FL value={d.oldAdvance} style={{ maxWidth: 120 }} /></FR>
          <FR style={{ marginBottom: 1 }}><span>क) {L('शिल्लक देणे रक्कम ₹', 'Balance Amount ₹')}</span><FL value={d.oldShillak} style={{ maxWidth: 120 }} /></FR>
          <FR style={{ marginBottom: 1 }}><span>ड) {L('व्हॅल्युएशन रिपोर्टनुसार किंमत ₹', 'Valuation Report Price ₹')}</span><FL value={d.oldValuationPrice} style={{ maxWidth: 120 }} /></FR>
        </div>

        <FR style={{ marginTop: 2, marginBottom: 1 }}>
          <span>११. {L('वाहनाच्या किंमतीच्या ५०% रक्कम संस्थेमध्ये जमा केली आहे काय?', '50% of vehicle price deposited?')}</span>
          &nbsp; {L('होय', 'Yes')} <CB checked={d.oldDepositYes === true} />
          &nbsp; {L('नाही', 'No')} <CB checked={d.oldDepositYes === false} />
          <span style={{ marginLeft: 15 }}>{L('असल्यास ₹', 'Amount ₹')}</span> <IL value={d.oldDepositAmt} cls="vl-il-lg" />
        </FR>

        <FR style={{ marginTop: 2 }}>
          <span>१२. {L('या व्यतिरिक्त इतर वाहन आपल्या मालकीचे आहे काय?', 'Any other vehicle owned?')}</span>
          &nbsp; {L('होय', 'Yes')} <CB checked={d.oldOtherVehicleYes === true} />
          &nbsp; {L('नाही', 'No')} <CB checked={d.oldOtherVehicleYes === false} />
        </FR>
        {d.oldOtherVehicleYes && (
          <div style={{ marginLeft: 20, marginTop: 1 }}>
            <FR style={{ marginBottom: 1 }}>
              <span>अ) {L('वाहन क्र.:', 'Vehicle No.:')}</span><FL value={d.oldOtherVehicleNo} style={{ maxWidth: 100 }} />
              <span style={{ marginLeft: 15 }}>ब) {L('वाहनाचा प्रकार:', 'Vehicle Type:')}</span><FL value={d.oldOtherVehicleType} style={{ maxWidth: 100 }} />
              <span style={{ marginLeft: 15 }}>क) {L('मॉडेल:', 'Model:')}</span><FL value={d.oldOtherVehicleModel} style={{ maxWidth: 100 }} />
              <span style={{ marginLeft: 15 }}>ड) {L('निर्मिती वर्ष सन:', 'Mfg. Year:')}</span><FL value={d.oldOtherVehicleYear} style={{ maxWidth: 60 }} />
            </FR>
          </div>
        )}
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════════════════
   PAGE BUSINESS — Applicant's Business Information
══════════════════════════════════════════════════════════════════════════ */
function PageBusiness({ data = {}, lang, pageNum }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  return (
    <div className="vl-page">
      <SectionPink style={{ textAlign: "center" }}>
        {L('अर्जदाराच्या व्यवसायाची माहिती', "Applicant's Business Information")}
      </SectionPink>

      <div style={{ fontSize: 12, marginTop: 8, lineHeight: 2.1 }}>
        <FR><span>१) {L('व्यवसायाचा कामकाजाचे स्वरूप:', 'Nature of Business Operations:')}</span><FL value={d.bizType} style={{ maxWidth: 300 }} /></FR>
        <div style={{ marginTop: 4 }}>
          २) {L('व्यवसायाचे स्वरूप:', 'Type of Business:')}
          {['पब्लीक लि.', 'प्रा. लि.', 'भागिदारी', 'खाजगी', 'व्यापारी', 'शेती', 'इतर'].map(o => (
            <span key={o} style={{ marginLeft: 8 }}>{o} <CB checked={d.bizCategory === o} /></span>
          ))}
        </div>

        <div style={{ marginTop: 4 }}>
          ३) {L('व्यवसायाच्या जागेचे स्वरूप:', 'Nature of Business Premises:')}
        </div>
        <div style={{ marginLeft: 16, marginTop: 4 }}>
          अ) {['स्व:मालकीची', 'वडिलोपार्जित', 'पागडीची', 'भाडेतत्वावर', 'लिजवर'].map(o => (
            <span key={o} style={{ marginRight: 8 }}>{o} <CB checked={(d.bizPremisesType || []).includes(o)} /></span>
          ))}
        </div>
        <div style={{ marginLeft: 16, marginTop: 4, display: 'flex', alignItems: 'center' }}>
          ब) {L('क्षेत्रफळ', 'Area')} <FL value={d.bizArea} style={{ width: 60, marginLeft: 4, marginRight: 4 }} />
          {['चौ. फुट', 'चौ. मिटर'].map(o => (
            <span key={o} style={{ marginRight: 8 }}>{o} <CB checked={d.bizAreaUnit === o} /></span>
          ))}
          <span style={{ margin: '0 8px' }}>|</span>
          {['कारपेट', 'बिल्टअप', 'सुपर बिल्टअप'].map(o => (
            <span key={o} style={{ marginRight: 8 }}>{o} <CB checked={d.bizAreaType === o} /></span>
          ))}
        </div>

        <FR style={{ marginTop: 4 }}><span>४) {L('कंपनी/फर्मचे नाव:', 'Company/Firm Name:')}</span><FL value={d.bizName} /></FR>
        <FR><span>५) {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.bizAddress} /></FR>
        <FR>
          <span>{L('पिन कोड:', 'PIN Code:')}</span><FL value={d.bizPin} style={{ maxWidth: 80 }} />
          <span>{L('दूर./मो. क्र.:', 'Tel/Mobile No.:')}</span><FL value={d.bizMobile} style={{ maxWidth: 120 }} />
          <span>{L('ई मेल आयडी:', 'Email ID:')}</span><FL value={d.bizEmail} />
        </FR>

        <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
          <div style={{ flex: 1 }}>६) {L('पॅन कार्ड क्र.:', 'PAN Card No.:')} <FL value={d.bizPan} /></div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <div style={{ flex: 1 }}>७) अ) {L('गुमास्ता लायसन्स क्र.:', 'Gumasta License No.:')} <FL value={d.bizGumasta} /></div>
          <div style={{ flex: 1 }}>ब) {L('विक्रीकर क्र.:', 'Sales Tax No.:')} <FL value={d.bizSalesTax} /></div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <div style={{ flex: 1 }}>८) अ) {L('व्हॅट (VAT) क्र.:', 'VAT No.:')} <FL value={d.bizVat} /></div>
          <div style={{ flex: 1 }}>ब) {L('सर्व्हिस टॅक्स क्र.:', 'Service Tax No.:')} <FL value={d.bizServiceTax} /></div>
          <div style={{ flex: 1 }}>क) {L('इतर लायसन्स:', 'Other License:')} <FL value={d.bizOtherLicense} /></div>
        </div>

        <div style={{ marginTop: 6 }}>
          ९) {L('व्यवसायासाठी लागणारे सर्व प्रकारची परवाने (लायसन्स) आपणाकडे आहेत काय?', 'Do you have all necessary licenses for the business?')}
          {L('होय', 'Yes')} <CB checked={d.bizHasLicenses === true} /> {L('नाही', 'No')} <CB checked={d.bizHasLicenses === false} />
          <span style={{ marginLeft: 16 }}>{L('(असल्यास तपशील द्यावा)', '(If yes, provide details)')}</span> <FL value={d.bizLicenseDetails} style={{ flex: 1 }} />
        </div>

        <div style={{ marginTop: 6 }}>
          १०) {L('व्यवसाय लघुउद्योग वा वाहन चालणाऱ्या विभागात आपण रहिवासी आहात काय?', 'Are you a resident in the small-scale industry or vehicle operation zone?')}
          {L('होय', 'Yes')} <CB checked={d.bizIsResidentInZone === true} /> {L('नाही', 'No')} <CB checked={d.bizIsResidentInZone === false} />
        </div>

        <FR style={{ marginTop: 6 }}>
          <span>११) {L('व्यवसाय केव्हा पासून करत आहात:', 'Since when are you doing this business:')}</span><FL value={d.bizStartDate} />
        </FR>
        <FR>
          <span>१२) {L('व्यवसायासंबंधी अनुभव:', 'Business Experience:')}</span><FL value={d.bizExperience} />
        </FR>

        <div style={{ marginTop: 15 }}>१३) {L('व्यवसायापासून मिळणाऱ्या वार्षिक उत्पन्नाचा तपशील:', 'Details of annual income from business:')}</div>
        <table className="vl-data-table" style={{ width: '100%', marginTop: 15 }}>
          <thead>
            <tr>
              <th>{L('एकूण वार्षिक उत्पन्न', 'Total Annual Income')}</th>
              <th>{L('एकूण वार्षिक खर्च (सर्व करांसहित)', 'Total Annual Expense (inc. all taxes)')}</th>
              <th>{L('निव्वळ वार्षिक उत्पन्न', 'Net Annual Income')}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{d.bizIncome || '\u00A0'}</td>
              <td>{d.bizExpense || '\u00A0'}</td>
              <td>{d.bizNetIncome || '\u00A0'}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: 15 }}>१४) {L('दोन नियमित ग्राहकांचा तपशील:', 'Details of two regular customers:')}</div>
        <div style={{ marginLeft: 16 }}>
          <FR><span>अ) {L('नाव:', 'Name:')}</span><FL value={d.bizCust1Name} /></FR>
          <FR><span>{L('पत्ता:', 'Address:')}</span><FL value={d.bizCust1Address} /></FR>
          <FR style={{ marginTop: 4 }}><span>ब) {L('नाव:', 'Name:')}</span><FL value={d.bizCust2Name} /></FR>
          <FR><span>{L('पत्ता:', 'Address:')}</span><FL value={d.bizCust2Address} /></FR>
        </div>

        <div style={{ marginTop: 8 }}>१५) {L('दोन नियमित माल पुरवठादारांचा तपशील:', 'Details of two regular suppliers:')}</div>
        <div style={{ marginLeft: 16 }}>
          <FR><span>अ) {L('नाव:', 'Name:')}</span><FL value={d.bizSupplier1Name} /></FR>
          <FR><span>{L('पत्ता:', 'Address:')}</span><FL value={d.bizSupplier1Address} /></FR>
          <FR style={{ marginTop: 4 }}><span>ब) {L('नाव:', 'Name:')}</span><FL value={d.bizSupplier2Name} /></FR>
          <FR><span>{L('पत्ता:', 'Address:')}</span><FL value={d.bizSupplier2Address} /></FR>
        </div>
      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE PARTNER — Applicant & Partner Details (Taxes/Life Insurance)
══════════════════════════════════════════════════════════════════════════ */
function PagePartner({ data = {}, lang, pageNum }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  return (
    <div className="vl-page">
      <SectionPink style={{ textAlign: "center" }}>
        {L('अर्जदार व भागीदारांनी भरावयाची माहिती', 'Applicant & Partner Information')}
      </SectionPink>

      {/* 1) Life Insurance Details */}
      <div style={{ fontSize: 12, marginTop: 8, lineHeight: 2.3 }}>
        <div style={{ fontWeight: 600 }}>१) {L('अर्जदार/भागीदार यांचा जीवन विमा (Life Insurance) तपशील', 'Applicant/Partner Life Insurance Details')}</div>
        <div style={{ marginLeft: 16, marginTop: 4 }}>
          <FR><span>अ) {L('विमा कंपनीचे नाव:', 'Insurance Company Name:')}</span><FL value={d.lifeInsCompany} /></FR>
          <FR><span>ब) {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.lifeInsAddress} /></FR>
          <FR><span>क) {L('पॉलिसी नंबर:', 'Policy Number:')}</span><FL value={d.lifeInsPolicy} style={{ maxWidth: 200 }} /></FR>

          <FR>
            <span>ड) {L('विमा कालावधी:', 'Insurance Duration:')}</span>
            <IL value={d.lifeInsDurFrom} cls="vl-il-sm" /><span>{L('पासून', 'from')}</span>
            <IL value={d.lifeInsDurTo} cls="vl-il-sm" /><span>{L('पर्यंत', 'to')}</span>
          </FR>
          <FR>
            <span>इ) {L('विमा रक्कम ₹', 'Sum Assured ₹')}</span><FL value={d.lifeInsAmount} style={{ maxWidth: 100 }} /><span>/-</span>
            <span style={{ marginLeft: 30 }}>{L('ई) हप्ता रक्कम ₹', 'Premium Amount ₹')}</span><FL value={d.lifeInsPremium} style={{ maxWidth: 100 }} /><span>/-</span>
          </FR>

          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center' }}>
            उ) {L('हप्ता भरण्याचा प्रकार:', 'Premium Type:')}
            {['मासिक', 'त्रैमासिक', 'अर्ध वार्षिक', 'वार्षिक'].map(o => (
              <span key={o} style={{ marginLeft: 8 }}>{o} <CB checked={d.lifeInsPremiumType === o} /></span>
            ))}
          </div>
        </div>

        {/* 2) Policy Loan */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>२) {L('विम्याच्या पॉलिसी तारणावर कर्ज घेतलेले आहे काय?', 'Taken a loan on policy?')}</span>
          <span style={{ marginLeft: 12 }}>{L('नाही', 'No')} <CB checked={d.lifeInsLoanYes === false} /></span>
          <span style={{ marginLeft: 8 }}>{L('होय', 'Yes')} <CB checked={d.lifeInsLoanYes === true} /></span>
          <span style={{ marginLeft: 16 }}>{L('(असल्यास तपशील द्यावा)', '(If yes, provide details)')}</span>
        </div>
        {d.lifeInsLoanYes && (
          <div style={{ marginLeft: 16, marginTop: 4 }}>
            <FR><span>अ) {L('बँक/संस्था/कंपनीचे नाव:', 'Bank/Institution Name:')}</span><FL value={d.lifeInsLoanBank} /></FR>
            <FR><span>ब) {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.lifeInsLoanAddress} /></FR>
            <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
              <FR style={{ flex: 1, margin: 0 }}><span>क) {L('कर्ज रक्कम ₹', 'Loan Amount ₹')}</span><FL value={d.lifeInsLoanAmount} /></FR>
              <FR style={{ flex: 1, margin: 0 }}><span>{L('कर्ज दिनांक:', 'Loan Date:')}</span><FL value={d.lifeInsLoanDate} /></FR>
            </div>
            <FR style={{ marginTop: 4 }}><span>ड) {L('आज रोजी शिल्लक कर्ज रक्कम ₹', 'Balance Loan Amount ₹')}</span><FL value={d.lifeInsLoanBalance} style={{ maxWidth: 120 }} /></FR>
          </div>
        )}

        {/* 3) Income Tax */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 20, fontWeight: 600 }}>
            <span>३) {L('आयकर (Income Tax) संबंधीचा तपशील: पॅन कार्ड नंबर:', 'Income Tax Details: PAN Card No:')}</span>
            <FL value={d.incTaxPan} style={{ width: 150 }} />
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            अ) {L('आयकर भरणा कधीपासून करत आहात ? सन', 'Since when are you paying income tax? Year')}
            <FL value={d.incTaxSinceYear} style={{ width: 80, marginLeft: 8 }} />
          </div>
          <table className="vl-data-table" style={{ width: '100%', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ width: '33%' }}>{L('आर्थिक वर्ष (Financial Year)', 'Financial Year')}</th>
                <th style={{ width: '33%' }}>{L('आयकर रक्कम ₹', 'Income Tax Amount ₹')}</th>
                <th style={{ width: '33%' }}>{L('आयकर भरणा दिनांक', 'Tax Paid Date')}</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map(i => {
                const row = (d.incTaxDetails && d.incTaxDetails[i]) || { year: '', amount: '', date: '' };
                return (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}><IL value={row.year} cls="vl-il-sm" /></td>
                    <td style={{ textAlign: 'center' }}>{row.amount}</td>
                    <td style={{ textAlign: 'center' }}>{row.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4) Professional Tax */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 20, fontWeight: 600 }}>
            <span>४) {L('व्यवसाय कर (Professional Tax) बाबतचा तपशील व्यवसाय कर नंबर:', 'Professional Tax Details: Prof Tax Number:')}</span>
            <FL value={d.profTaxNo} style={{ width: 150 }} />
          </div>
          <div style={{ marginTop: 8, fontWeight: 600 }}>
            अ) {L('व्यवसाय कर भरणा कधी पासून करत आहात ? सन', 'Since when are you paying professional tax? Year')}
            <FL value={d.profTaxSinceYear} style={{ width: 80, marginLeft: 8 }} />
          </div>
          <table className="vl-data-table" style={{ width: '100%', marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ width: '33%' }}>{L('आर्थिक वर्ष (Financial Year)', 'Financial Year')}</th>
                <th style={{ width: '33%' }}>{L('व्यवसाय कर रक्कम ₹', 'Prof Tax Amount ₹')}</th>
                <th style={{ width: '33%' }}>{L('व्यवसाय कर भरणा दिनांक', 'Tax Paid Date')}</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map(i => {
                const row = (d.profTaxDetails && d.profTaxDetails[i]) || { year: '', amount: '', date: '' };
                return (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}> <IL value={row.year} cls="vl-il-sm" /></td>
                    <td style={{ textAlign: 'center' }}>{row.amount}</td>
                    <td style={{ textAlign: 'center' }}>{row.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5) Extra Info Lines */}
        <div style={{ marginTop: 16, fontWeight: 600 }}>
          {L('व्यवसाया विषयी अतिरिक्त माहिती', 'Extra Business Information')}
        </div>
        <div style={{ marginTop: 6 }}>
          <div style={{ borderBottom: '1px solid #333', height: 22, width: '100%', marginBottom: 10 }}>{d.bizExtraInfo}</div>
          <div style={{ borderBottom: '1px solid #333', height: 22, width: '100%', marginBottom: 10 }}></div>
          <div style={{ borderBottom: '1px solid #333', height: 22, width: '100%', marginBottom: 10 }}></div>
          <div style={{ borderBottom: '1px solid #333', height: 22, width: '100%', marginBottom: 10 }}></div>
        </div>

      </div>

      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 7 — Loan Terms & Conditions + Signatures
══════════════════════════════════════════════════════════════════════════ */
function Page7({ data = {}, lang, pageNum = "७" }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;

  const rules_mr = [
    "कर्ज वितरणाच्या दिनांकापासून व्याज आकारणी सुरु करण्यात येईल. शिल्लक मुद्दल रक्कमेवर (Reducing Balance Amount) दिवसांप्रमाणे (Per Day Interest) व्याज आकारणी करण्यात येईल.",
    "कर्ज वितरणाच्या दिनांकापासून ३० दिवसांच्या आत पहिला कर्ज हप्ता (मुद्दल + व्याज) जमा करणे आवश्यक आहे. विलंब झाल्यास द.सा.द.शे. २% दंड व्याज आकारणी करण्यात येईल.",
    "कर्जदाराचा कर्ज हप्ता कंपनीमधून वेतन कपातीद्वारे धनादेशाने जमा होत असल्यास असा वेतन कपातीचा धनादेश संस्थेस प्राप्त झाल्याशिवाय कर्ज हप्ता जमा झाला आहे असे समजले जाणार नाही.",
    "वाहन कर्जाची परतफेड न झाल्यास संस्था वाहन जप्त करण्याचा अधिकार राखते. जप्त केलेले वाहन लिलावाद्वारे विकले जाऊ शकते.",
    "कर्जदाराने वाहनाची नोंदणी, विमा, फिटनेस, परमिट यांचे नुतनीकरण नियमितपणे करणे बंधनकारक आहे.",
    "वाहन संस्थेच्या परवानगीशिवाय विक्री, हस्तांतरण किंवा तारण देता येणार नाही.",
    "कर्ज खाते थकीत झाल्यास कर्जदार, जामिनदार यांचे निवास, नोकरी/व्यवसायाचे ठिकाणी प्रत्यक्ष भेट, नोटीस देण्यात येईल.",
    "प्रत्येक जामिनदार हा संपूर्ण कर्जास वैयक्तिक: जबाबदार असेल, हिस्सेदारीने नाही.",
    "कर्जाची थकबाकी असल्यास कर्जदार व जामिनदार यांच्या संस्थेकडे जमा असणाऱ्या ठेवी परत केल्या जाणार नाहीत.",
    "कर्ज मंजूरी नंतर निवास/नोकरी/व्यवसायाच्या पत्तामध्ये बदल झाल्यास तो कर्जदार व जामिनदार यांनी संस्थेस त्वरित कळविला पाहिजे.",
    "वाहनावर संस्थेचे hypothecation नोंदणी प्रमाणपत्रावर नोंद करणे बंधनकारक आहे.",
    "कर्ज वसूलीसाठी कर्जदार आणि जामिनदार यांचे विरुद्ध म. स. स. अ. नियम व इतर कायद्यानुसार दावा दाखल करण्याचा अधिकार संस्थेस आहे.",
  ];

  const rules_en = [
    "Interest will be charged from the date of loan disbursement on reducing balance amount on per day basis.",
    "The first installment (principal + interest) must be paid within 30 days of disbursement. Delay attracts 2% p.a. penal interest.",
    "If loan installment is recovered through salary deduction by cheque, it will not be considered paid until the cheque is received by the society.",
    "If vehicle loan is not repaid, the society reserves the right to seize the vehicle. Seized vehicle may be sold by auction.",
    "Borrower must regularly renew vehicle registration, insurance, fitness certificate, and permit.",
    "Vehicle cannot be sold, transferred, or pledged without society's permission.",
    "If loan account becomes overdue, visits to residence and workplace will be made and notices issued.",
    "Each guarantor is individually liable for the full loan amount, not proportionally.",
    "If loan is overdue, deposits of borrower and guarantors with the society will not be returned.",
    "Any change in residential/work address after loan approval must be immediately communicated to the society.",
    "Hypothecation of the society must be noted on the vehicle registration certificate.",
    "The society has the right to file a case against borrower and guarantors under applicable laws for loan recovery.",
  ];

  const rules = lang === 'mr' ? rules_mr : rules_en;

  // Build all signatories: applicant + g1 + g2 + extra guarantors
  // Signatures for applicant + guarantors (min 2 guarantors shown)
  const baseSigs = [
    { label: L('जामिनदार क्र.१ चे नाव', 'Guarantor 1 Name'), value: d.g1Naav || d.jameen1Naav },
    { label: L('जामिनदार क्र.२ चे नाव', 'Guarantor 2 Name'), value: d.g2Naav || d.jameen2Naav },
    { label: L('जामिनदार क्र.३ चे नाव', 'Guarantor 3 Name'), value: d.jameen3Naav },
  ];
  const activeSigs = baseSigs.filter(s => s.value && String(s.value).trim());

  const sigRows = [
    { label: L('अर्जदाराचे नाव', "Applicant's Name"), value: d.arjdarNaav },
    ...activeSigs
  ];

  const sigBaseCount = sigRows.length - 1; // excluding applicant
  (d.extraGuarantors || []).forEach((g, i) => {
    sigRows.push({
      label: `${L('जामिनदार क्र.', 'Guarantor No. ')}${sigBaseCount + i + 1} ${L('चे नाव', 'Name')}`,
      value: d[`exG_${g.id}Naav`] || '',
    });
  });

  return (
    <div className="vl-page">
      <SectionPink style={{ textAlign: "center" }}>
        {L('कर्ज विषयक नियम', 'Vehicle Loan Terms & Conditions')}
      </SectionPink>
      <div style={{ fontSize: 12, lineHeight: 2, marginTop: 4 }}>
        {rules.map((rule, i) => (
          <div key={i} className="vl-num-item">
            <span className="vl-num-label">{i + 1})</span>
            <span style={{ flex: 1, textAlign: "justify" }}>{rule}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, marginTop: 8, lineHeight: 2.7 }}>
        {L('आम्ही खालील सही करणाऱ्यांनी वरील वाहन कर्ज विषयक नियम वाचून व समजावून घेतलेले आहेत. उपरोक्त नमूद नियम आम्हाला मान्य असून, संस्थेचे प्रचलित असलेले व वेळोवेळी अमलात येणारे सर्व नियम आमच्यावर बंधनकारक असतील.',
          'We the undersigned have read and understood the above vehicle loan terms. We agree to all existing and future rules of the society and sign willingly.')}
      </div>

      <div style={{ fontSize: 12, marginTop: 10 }}>
        {sigRows.map(row => (
          <div key={row.label} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ minWidth: 160 }}>{row.label}</span>
            <span>{L('श्री./श्रीमती:', 'Mr./Mrs.:')}</span>
            <span style={{ flex: 1, borderBottom: "1px solid #333", height: 14, display: "inline-block" }}>{row.value}</span>
            <span>{L('सही', 'Sign')}</span>
            <span style={{ minWidth: 100, borderBottom: "1px solid #333", height: 14, display: "inline-block" }} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, marginTop: 20, lineHeight: 2.7, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>{L('ठिकाण:', 'Place:')} <IL value={d.thikan} cls="vl-il-lg" /></div>
        <div>{L('दिनांक', 'Date')} <IL value={d.dinank} cls="vl-il-lg" /></div>
      </div>

      <hr className="vl-thin" style={{ marginTop: 12 }} />

      <SectionPink style={{ marginTop: 8 }}>
        {L('कार्यालयीन कामकाजासाठी', 'For Office Use Only')}
      </SectionPink>

      <div style={{ fontSize: 12, marginTop: 25 }}>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 20 }}>
          <span style={{ whiteSpace: "nowrap" }}>{L('श्री./श्रीमती :', 'Mr./Mrs. :')}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 10, height: 20, fontSize: 12, paddingLeft: 10 }}>{d.arjdarNaav}</div>
        </div>

        <div style={{ display: "flex", gap: 60, marginTop: 20, marginBottom: 20 }}>
          <span>{L('सभासद क्रमांक', 'Member No.')} <IL value={d.saCra} cls="vl-il-lg" /></span>
          <span>{L('अर्ज क्र.', 'Application No.')} <IL value={d.appNo} cls="vl-il-lg" /></span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 20, marginBottom: 35, gap: 8 }}>
          <span style={{ fontSize: 11, whiteSpace: "nowrap" }}>{L('यांचेकडून', 'From')}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, minWidth: 100, height: 20, textAlign: "center", fontSize: 12 }}>{d.karjKhate}</div>
          <span style={{ fontSize: 11, whiteSpace: "nowrap" }}>{L('या कारणासाठी अर्ज मागणी अर्ज मिळाला.', 'loan application received for this purpose.')}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
        <div style={{ fontSize: 12 }}>{L('दिनांक', 'Date')} &nbsp; / &nbsp; / {lang === 'mr' ? "२०" : "20"}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #333", minWidth: 160, paddingTop: 2, fontSize: 11 }}>
            {L('शाखाधिकारी / संबंधित लिपिक', 'Branch Officer / Clerk')}
          </div>
        </div>
      </div>
      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
   Page order: 1 (main), 2 (borrower), 3 (g1), 4 (g2), 5..N (extra Gs),
               N+1 (new+old vehicle), N+2 (insurance/valuation), N+3 (T&C)
══════════════════════════════════════════════════════════════════════════ */
export default function VehicleLoanPrint({ data: propsData, clientInfo: propsClientInfo, lang: propsLang = 'mr' }) {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(propsData || location.state || {});
  const [loading, setLoading] = useState(!data.id && id);

  useEffect(() => {
    if (!data.id && id) {
      const fetchLoan = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/vehicle-loan/${id}`, {
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('tushgpt_jwt')}` }
          });
          if (!res.ok) throw new Error("Failed to fetch loan data");
          const resp = await res.json();
          setData(resp.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLoan();
    }
  }, [data.id, id]);

  const printRef = useRef(null);
  const lang = propsLang;
  const clientInfo = propsClientInfo || {};

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading application...</div>;
  if (!data.id && !propsData) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>Application data not found.</div>;

  const extraGs = data.extraGuarantors || [];

  // Calculate page numbers dynamically
  // Page 1: main, Page 2: borrower, Page 3: g1, Page 4: g2
  // Page 5..4+extraGs.length: extra guarantors
  // Page 5+extraGs.length: vehicle (new+old+insurance)
  // Page 6+extraGs.length: business
  // Page 7+extraGs.length: partner/applicant info
  // Page 8+extraGs.length: T&C
  // Calculate base count (strictly based on what's filled)
  const baseGs = [
    data.jameen1Naav || data.g1Naav,
    data.jameen2Naav || data.g2Naav,
    data.jameen3Naav
  ].filter(n => n && String(n).trim());
  const baseGCount = baseGs.length;
  const vehiclePageNum = 5 + extraGs.length;
  const bizPageNum = 6 + extraGs.length;
  const partnerPageNum = 7 + extraGs.length;
  const tcPageNum = 8 + extraGs.length;

  return (
    <GoldLoanPrintMaster title="Vehicle Loan Application">
      <style>{GLOBAL_CSS}</style>
      <div id="vl-print-area">
        {/* Page 1 — Main application */}
        <Page1 data={data} clientInfo={clientInfo} lang={lang} />

        {/* Page 2 — Borrower */}
        <PersonPage
          title={lang === 'mr' ? 'कर्जदाराची माहिती' : "Borrower's Information"}
          pageNum={toMarathi(2)} data={data} prefix="b" showDeclaration={false} lang={lang}
        />

        {/* Page 3 — Guarantor 1 */}
        <PersonPage
          title={lang === 'mr' ? 'जामिनदार क्रमांक १ ची माहिती' : 'Guarantor No. 1 Information'}
          pageNum={toMarathi(3)} data={data} prefix="g1" showDeclaration={true} lang={lang}
        />

        {/* Page 4 — Guarantor 2 */}
        <PersonPage
          title={lang === 'mr' ? 'जामिनदार क्रमांक २ ची माहिती' : 'Guarantor No. 2 Information'}
          pageNum={toMarathi(4)} data={data} prefix="g2" showDeclaration={true} lang={lang}
        />

        {/* Pages 5..N — Extra guarantors (full PersonPage form) */}
        {extraGs.map((g, idx) => {
          const num = idx + baseGCount + 1; // labeling (e.g. 3 or 4)
          const pageNumber = idx + 5; // physical page (always starts at 5 for extraGs)
          const prefix = `exG_${g.id}`;
          const titleMr = `जामिनदार क्रमांक ${toMarathi(num)} ची माहिती`;
          const titleEn = `Guarantor No. ${num} Information`;
          return (
            <PersonPage
              key={g.id}
              title={lang === 'mr' ? titleMr : titleEn}
              pageNum={toMarathi(pageNumber)}
              data={data}
              prefix={prefix}
              showDeclaration={true}
              lang={lang}
            />
          );
        })}

        {/* Vehicle page (Includes Insurance/Valuation) */}
        <Page5 data={data} lang={lang} pageNum={toMarathi(vehiclePageNum)} />

        {/* Business page */}
        <PageBusiness data={data} lang={lang} pageNum={toMarathi(bizPageNum)} />

        {/* Applicant / Partner page */}
        <PagePartner data={data} lang={lang} pageNum={toMarathi(partnerPageNum)} />

        {/* Terms & Conditions + Signatures */}
        <Page7 data={data} lang={lang} pageNum={toMarathi(tcPageNum)} />
      </div>
    </GoldLoanPrintMaster>
  );
}