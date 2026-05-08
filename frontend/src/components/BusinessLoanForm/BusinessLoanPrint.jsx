import { useRef } from "react";

/* ─── Global styles ─────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root { --primary: #0a1c5a; --accent: #fdb913; --border: #333; --light-border: #999; }
  body { font-family: 'Noto Sans Devanagari', serif; font-size: 11px; background: #ffffff; color: #111; line-height: 2.0; }

  .bl-page {
    width: 210mm;
    height: 295mm !important;
    background: #fff;
    margin: 10px auto;
    padding: 8mm 12mm;
    border: 3px solid var(--primary);
    position: relative;
    box-shadow: 0 4px 20px rgba(0,0,0,.3);
    overflow: hidden;
    box-sizing: border-box !important;
  }

  .bl-page.compact-page {
    height: 297mm;
    padding: 8mm 12mm 6mm;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    line-height: 1.2 !important;
  }
  .compact-page .bl-field-row { margin-bottom: 1px !important; }
  .compact-page .bl-section-pink { margin: 2px 0 2px !important; }

  .bl-page.biz-compact-page {
    line-height: 1.5 !important;
  }
  .biz-compact-page .bl-field-row { margin-bottom: 4px !important; }
  .biz-compact-page .bl-section-pink { margin: 8px 0 4px !important; }

  .compact-page .person-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 2px;
  }

  @page { size: A4; margin: 0; }

  .bl-section-pink {
    background: #f0f7ff; color: var(--primary); padding: 4px 8px;
    font-size: 11px; font-weight: 700; margin: 15px 0 10px;
    border-left: 4px solid var(--primary);
  }
  .bl-field-row { display: flex; align-items: baseline; margin-bottom: 10px; flex-wrap: wrap; gap: 4px; }
  .bl-field-label { white-space: nowrap; font-size: 10.5px; }
  .bl-fl {
    flex: 1; border: none; border-bottom: 1px solid #333; min-width: 60px;
    height: 18px; background: transparent; font-family: inherit; font-size: 10.5px; 
    padding: 0 4px; display: inline-block; vertical-align: baseline;
  }
  .bl-il { 
    display: inline-block; border-bottom: 1px solid #333; min-width: 80px; 
    height: 18px; vertical-align: baseline; padding: 0 4px; text-align: center;
  }
  .bl-il-sm { min-width: 40px; }
  .bl-il-lg { min-width: 160px; }
  .bl-il-xl { min-width: 220px; }
  .bl-char-box { display: inline-flex; gap: 2px; margin-left: 4px; }
  .bl-char-box span { width: 22px; height: 20px; border: 1px solid #333; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
  hr.bl-divider { border: none; border-top: 2px solid var(--primary); margin: 8px 0; }
  hr.bl-thin { border: none; border-top: 1px solid #999; margin: 5px 0; }
  .bl-photo-box { width: 80px; height: 100px; border: 1px solid #333; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #666; text-align: center; flex-shrink: 0; }
  .bl-page-num { text-align: center; font-size: 10px; margin-top: 4px; color: #444; }
  .bl-num-item { display: flex; gap: 6px; margin-bottom: 4px; font-size: 10.5px; align-items: flex-start; }
  .bl-num-label { min-width: 24px; font-weight: 600; flex-shrink: 0; }
  table.bl-data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px; }
  table.bl-data-table th { background: #f0d0c8; border: 1px solid #999; padding: 3px 5px; text-align: center; font-weight: 600; }
  table.bl-data-table td { border: 1px solid #999; padding: 3px 5px; height: 20px; }
  .bl-logo-circle { width: 52px; height: 52px; border: 3px solid var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: #fff; }
  .bl-avs-logo { font-size: 7px; font-weight: 900; color: var(--primary); text-align: center; line-height: 1.2; }

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
    .bl-page {
      width: 210mm !important;
      height: 295mm !important;
      max-height: 295mm !important;
      margin: 0 auto !important;
      padding: 5mm 10mm !important;
      box-shadow: none !important;
      border: 3px solid var(--primary) !important;
      page-break-after: always !important;
      page-break-before: avoid !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
      position: relative !important;
      display: block !important;
    }
    .bl-page.compact-page {
      display: flex !important;
      flex-direction: column !important;
      overflow: hidden !important;
    }

    .bl-page:last-child { page-break-after: avoid !important; break-after: avoid !important; }
    .no-print { display: none !important; }
    #bl-print-area { margin: 0 !important; padding: 0 !important; background: white !important; }
  }
`;

/* ─── Date splitting helper ───────────────────────────────────────────────
 * The form stores dates as ISO strings like "2024-03-15".
 * The print pages expect separate _d / _m / _y suffixed keys.
 * This function walks the raw form data and injects those split fields.
 */
function splitDates(raw) {
  const out = { ...raw };

  // All date-field base names used across the form
  const dateFields = [
    // Page 1 / basic
    'dinank',
    // Borrower (b prefix)
    'bSeva', 'bPurvDin1', 'bPurvDin2',
    'bJam94aDin1', 'bJam94aDin2',
    'bJam94bDin1', 'bJam94bDin2',
    'bKutumb95Din1', 'bKutumb95Din2',
    'bBank96Din1', 'bBank96Din2',
    'bDinank',
    // Guarantor 1 (g1 prefix)
    'g1Seva', 'g1PurvDin1', 'g1PurvDin2',
    'g1Jam94aDin1', 'g1Jam94aDin2',
    'g1Jam94bDin1', 'g1Jam94bDin2',
    'g1Kutumb95Din1', 'g1Kutumb95Din2',
    'g1Bank96Din1', 'g1Bank96Din2',
    'g1Dinank',
    // Guarantor 2 (g2 prefix)
    'g2Seva', 'g2PurvDin1', 'g2PurvDin2',
    'g2Jam94aDin1', 'g2Jam94aDin2',
    'g2Jam94bDin1', 'g2Jam94bDin2',
    'g2Kutumb95Din1', 'g2Kutumb95Din2',
    'g2Bank96Din1', 'g2Bank96Din2',
    'g2Dinank',
    // Insurance & Tax (Page 6)
    'insDurFrom_d', 'insDurTo_d',
    'insLoanDate_d',
    'itDate1', 'itDate2', 'itDate3',
    'ptDate1', 'ptDate2', 'ptDate3',
    // Collateral (Page 7)
    'colNADate',
    'colCompletionCert', 'colOCDate', 'colConveyanceDate',
    'colInsDurFrom_d', 'colInsDurTo_d',
  ];

  // Helper: parse an ISO string "YYYY-MM-DD" → { d, m, y }
  const parse = (iso) => {
    if (!iso) return { d: '', m: '', y: '' };
    const parts = String(iso).split('-');
    if (parts.length === 3) {
      return { d: parts[2], m: parts[1], y: parts[0].slice(2) }; // 2-digit year
    }
    return { d: '', m: '', y: '' };
  };

  dateFields.forEach(field => {
    // Some fields already have _d suffix in their name (e.g. insDurFrom_d, colInsDurFrom_d).
    // For those the form stores the full ISO value directly under that key.
    // We need to split them into _d / _m / _y sub-keys.
    if (field.endsWith('_d')) {
      // e.g. field = "insDurFrom_d"  →  base = "insDurFrom"
      const base = field.slice(0, -2); // remove trailing "_d"
      const { d, m, y } = parse(raw[field]);
      out[`${base}_d`] = d;
      out[`${base}_m`] = m;
      out[`${base}_y`] = y;
    } else {
      // e.g. field = "dinank"  →  keys: dinank_d, dinank_m, dinank_y
      const { d, m, y } = parse(raw[field]);
      out[`${field}_d`] = d;
      out[`${field}_m`] = m;
      out[`${field}_y`] = y;
    }
  });

  // Handle extra guarantors dynamically
  (raw.extraGuarantors || []).forEach(g => {
    const pr = `eg_${g.id}_`;
    const egDateFields = [
      'Seva', 'PurvDin1', 'PurvDin2',
      'Jam94aDin1', 'Jam94aDin2',
      'Jam94bDin1', 'Jam94bDin2',
      'Kutumb95Din1', 'Kutumb95Din2',
      'Bank96Din1', 'Bank96Din2',
      'Dinank',
    ];
    egDateFields.forEach(f => {
      const key = `${pr}${f}`;
      const { d, m, y } = parse(raw[key]);
      out[`${key}_d`] = d;
      out[`${key}_m`] = m;
      out[`${key}_y`] = y;
    });
  });

  return out;
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const IL = ({ value = "", cls = "" }) => <span className={`bl-il ${cls}`}>{value}</span>;
const FL = ({ value = "", style }) => (
  <span className="bl-fl" style={{ ...style, display: "inline-block", borderBottom: "1px solid #333", minHeight: "18px", padding: "0 4px" }}>{value}</span>
);
const CharBox = ({ value = "", n = 8 }) => {
  const chars = String(value || "").padEnd(n, " ").split("").slice(0, n);
  return <span className="bl-char-box">{chars.map((ch, i) => <span key={i}>{ch}</span>)}</span>;
};
const CB = ({ checked }) => <input type="checkbox" checked={!!checked} readOnly style={{ transform: "scale(1.1)", margin: "0 4px" }} />;
const Divider = ({ type = "divider" }) => <hr className={`bl-${type}`} />;
const SectionPink = ({ children, style }) => <div className="bl-section-pink" style={style}>{children}</div>;
const PageNum = ({ n }) => <div className="bl-page-num">{n}</div>;
const FR = ({ children, style }) => <div className="bl-field-row" style={style}>{children}</div>;
const AVSLogo = () => (
  <div className="bl-logo-circle">
    <div className="bl-avs-logo">
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: -0.5 }}>AVS</div>
      <div style={{ fontSize: 6.5 }}>AI360</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1
══════════════════════════════════════════════════════════════════════════ */
function Page1({ data = {}, clientInfo = {}, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  return (
    <div className="bl-page">
      {/* To: Board Label */}
      <div style={{ fontSize: 9, color: "#333", marginBottom: 2 }}>{L('स. अध्यक्ष/संचालक मंडळ,', 'To, The Hon. Chairman/Board of Directors,')}</div>

      {/* 1. Top Section - Logo, Center Title, and Module Tag */}
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
            {L('व्यवसाय कर्ज मागणी अर्ज', 'Business Loan Application Form')}
          </h1>
          <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>
            {L('(टीप: पान नंबर १ वर नमूद केलेल्या सूचनाचे वाचन करून कर्ज अर्ज भरावा.)', '(Note: Please read instructions on Page 1 before filling the form.)')}
          </div>
        </div>

        {/* Right Module Tag and App No */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <div style={{ fontSize: 16, fontStyle: "italic", color: "var(--primary)", fontWeight: 700 }}>Business</div>
          {(data.applicationNo || data.appNo) && (
            <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
              App No: <strong>{data.applicationNo || data.appNo}</strong>
            </div>
          )}
        </div>
      </div>

      {/* 2. Date Row (Standalone) */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, fontSize: 10, marginBottom: 4, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>{L('दिनांक', 'Date')}</span>
          <span style={{ borderBottom: "1px solid #333", width: 40, textAlign: "center", paddingBottom: 1, fontSize: 10, display: "inline-block" }}>{data.dinank_d}</span>
          <span style={{ fontSize: 12, margin: "0 2px" }}>/</span>
          <span style={{ borderBottom: "1px solid #333", width: 40, textAlign: "center", paddingBottom: 1, fontSize: 10, display: "inline-block" }}>{data.dinank_m}</span>
          <span style={{ fontSize: 12, margin: "0 2px" }}>/</span>
          <span style={{ borderBottom: "1px solid #333", width: 80, textAlign: "center", paddingBottom: 1, fontSize: 10, display: "inline-block" }}>20{data.dinank_y}</span>
        </div>
      </div>

      {/* 3. Society Branding + Account Grid */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "var(--primary)", fontStyle: "italic" }}>{clientInfo?.name || 'AVS AI360'}</div>
          <div style={{ fontSize: 8.5, color: "#444", fontWeight: 500 }}>
            {L('(नोंदणी क्र. बी. ओ. एम./डब्ल्यू. ए./आर. एस. आर./३२१/सन १९८७)', '(Reg No. BOM/W.A./RSR/321/Year 1987)')}
          </div>
        </div>

        <div style={{ fontSize: 10, textAlign: "right", display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", columnGap: 10, rowGap: 6 }}>
          <span style={{ textAlign: "right" }}>{L('स. क्र./लाम स. क्र.', 'Member No.')}:</span>
          <CharBox value={data.saCra} />

          <span style={{ textAlign: "right" }}>{L('कर्ज खाते क्र.', 'Loan A/C No.')}:</span>
          <CharBox value={data.karjKhate} />

          <div style={{ paddingTop: 4 }}>{L('शाखा:', 'Branch:')}</div>
          <div style={{ textAlign: "left", minWidth: 100, fontWeight: 600, paddingTop: 4 }}>{data.shakha}</div>
        </div>
      </div>

      <div style={{ fontSize: 8.5, color: "var(--primary)", fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>
        {L('प्रशासकीय कार्यालय : ऑफिस क्र. २१०, दुसरा मजला, देवी अन्नपूर्णा निवाससमोर को-अप. सोसायटा लि., प्लॉट नं. ८, सेक्टर-१८, वाशी, नवी मुंबई - ४००७०५.', 'Admin Office: Office No. 210, 2nd Floor, Opp. Devi Annapurna Niwas Co-op Soc Ltd, Plot No. 8, Sector-18, Vashi, Navi Mumbai - 400705.')}
      </div>
      <Divider />
      <div style={{ fontSize: 11, marginBottom: 8, marginTop: 10 }}>{L('महोदय,', 'Sir,')}</div>
      <FR style={{ marginTop: 5 }}>
        <span className="bl-field-label">{L('अर्जदार श्री./सौ./श्रीमती:', 'Applicant Mr./Mrs./Ms.:')}</span>
        <FL value={data.arjdarNaav} style={{ flex: 1 }} />
        <span className="bl-field-label" style={{ marginLeft: 15 }}>{L('वय (वर्षे):', 'Age (Yrs):')}</span>
        <FL value={data.arjdarVay} style={{ maxWidth: 60 }} />
        <span className="bl-field-label">{L('वर्षे', 'Yrs')}</span>
      </FR>
      <div style={{ fontSize: 11, lineHeight: 2.2, marginTop: 2 }}>
        {L('यांजकडून अर्ज करण्यात येतो की, मला ₹', 'I/We hereby apply for a Business Loan of ₹')} <IL value={data.karjRakkam} cls="bl-il-lg" />
        {L('(अक्षरी ₹ ', '(Rupees ')} <IL value={data.akshari} cls="bl-il-xl" /> {L(') वैयक्तिक जामिनकी तारण कर्ज पाहिजे आहे. सदर कर्जाची मी व्याजासह ', ') personal guarantee loan only. I will repay this loan along with interest within ')}
        <IL value={data.paratfedKalavadhi} cls="bl-il-sm" />
        {L(' महिन्यात संपूर्ण परत फेड करीन. पहिला हप्ता ', ' months. The first installment will be paid after ')}
        <IL value={data.pahilaHapta} cls="bl-il-sm" />
        {L(' महिन्यांनंतर आणि बाकीचे हप्ते तद्नंतर प्रत्येक महिन्याच्या ', ' months and subsequent installments on the ')}
        <IL value={data.tarikh} cls="bl-il-sm" />
        {L(' तारखेस देत जाईन. माझ्या कर्ज घेण्याचा उद्देश (कारण) ', 'th of every month. The purpose of my loan (Reason) ')}
        <FL value={data.karan} style={{ minWidth: 350 }} />
        {L(' हा असून माझी सध्याची माहिती पुढीलप्रमाणे देत आहे. ', ' and I am providing my current information as follows. ')}
      </div>
      <div style={{ fontSize: 11, lineHeight: 2.2, marginTop: 1 }}>
        {L('मी विवाहित / अविवाहित असून, माझ्या कुटुंबातील ', 'I am married / unmarried, and ')}
        <IL value={data.avalambun} cls="bl-il-sm" />
        {L(' व्यक्ती माझ्यावर अवलंबून आहेत. तसेच मी प्रतिज्ञेवर सांगतो की, दुसऱ्या कोणत्याही को-ऑपरेटिव्ह सोसायटीचे अगर बँकेचे माझ्यावर कर्ज नाही. माझ्या कर्जाची परतफेड मी संचालक मंडळ ठरवील त्याप्रमाणे व व्याजाच्या दराने तसेच सोसायटीतर्फे वेळोवेळी असणाऱ्या इतर आकारणीसह व खर्चासह दिलेल्या मुदतीत करीन. सोसायटीचे अस्तित्वात असलेले तसेच पुढे अंमलात येणारे सर्व नियम व पोटनियम मला मान्य आहेत / राहतील.', ' family members are dependent on me. I also declare on oath that I do not have any other bank loan. I will repay my loan with interest and other charges as decided by the Board of Directors. I agree to all existing and future rules and by-laws of the society.')}
      </div>
      <div style={{ fontSize: 11, lineHeight: 2.2, marginTop: 4 }}>
        {L('मला जामीन राहण्यास कबूल सहमत असलेल्या सोसायटीच्या सभासदांची नावे व त्यांच्याविषयी कर्ज मागणी अर्जात नमूद करावयाची इतर माहिती मी खालीलप्रमाणे या अर्जासोबत देत आहे.', 'Details of guarantors who have agreed to stand as my guarantors and other information to be mentioned in the loan application are provided below.')}
      </div>
      <div style={{ marginTop: 10 }}>
        {(() => {
          const rows = [
            { n: "१", name: data.jameen1Naav, age: data.jameen1Vay },
            { n: "२", name: data.jameen2Naav, age: data.jameen2Vay },
          ];
          // Only add extra guarantors if they actually exist in the form data
          if (data.extraGuarantors && data.extraGuarantors.length > 0) {
            data.extraGuarantors.forEach((g, i) => {
              rows.push({
                n: String(i + 3),
                name: data[`eg_${g.id}_Naav`],
                age: data[`eg_${g.id}_Vay`]
              });
            });
          }

          return rows.map(item => (
            <div key={item.n} className="bl-field-row" style={{ fontSize: 11, display: "flex", alignItems: "baseline", marginBottom: 0, marginTop: 1 }}>
              <span>{item.n}) {L('जामिनदाराचे नाव श्री./श्रीमती', 'Guarantor Name Mr./Mrs.')}</span>
              <span style={{ flex: 1, borderBottom: "1px solid #333", display: "inline-block", height: 18, marginLeft: 5 }}>{item.name}</span>
              <span style={{ marginLeft: 15 }}>{L('वय', 'Age')}</span>
              <span style={{ borderBottom: "1px solid #333", minWidth: 40, textAlign: "center", display: "inline-block" }}>{item.age}</span>
              <span style={{ marginLeft: 4 }}>{L('वर्षे', 'Years')}</span>
            </div>
          ));
        })()}
      </div>
      <div style={{ fontSize: 11, marginTop: 6 }}>{L('संचालक मंडळाने माझ्या या कर्ज मागणी अर्जाचा विचार करावा ही नम्र विनंती.', 'I humbly request the Board of Directors to consider my loan application.')}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10, flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{ fontSize: 11, marginRight: 40, marginTop: 0 }}>{L('आपला/आपली विश्वासू,', 'Yours faithfully,')}</div>
        <div style={{ fontSize: 11, marginTop: 20, marginRight: 180 }}>{L('सही:', 'Signature')}</div>
        <div style={{ minWidth: 220, marginTop: 10, textAlign: "center", fontSize: 11 }}>
          <div style={{ borderBottom: "1px solid #333", paddingBottom: 2, marginBottom: 2, minHeight: 18 }}>
            {data.arjdarNaav}
          </div>
          <div style={{ fontSize: 10.5 }}>{L('अर्जदार (कर्जदार)', 'Applicant (Borrower)')}</div>
        </div>
      </div>
      <Divider style={{ marginTop: 10 }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
        <div style={{ fontWeight: 700 }}>{L('संचालक मंडळाचा शेरा', 'Board Remarks')}</div>
        <div style={{ fontWeight: 700, textAlign: "right", maxWidth: 400 }}>{L('शिफारस करणाऱ्या संचालक/स्थानिक समिती सदस्याची सही', 'Recommending Director/Local Committee Member Signature')}</div>
      </div>
      {[1, 2].map(i => <div key={i} style={{ borderBottom: "1px solid #333", marginTop: i === 1 ? 16 : 8, height: 18 }} />)}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 20, fontSize: 11, alignItems: "center", marginTop: 15 }}>
        <div>{L('संचालक मंडळाची सभा दि.', 'Board Meeting Date')} <IL cls="bl-il-sm" /> / <IL cls="bl-il-sm" /> / 20</div>
        <div>{L('सभा क्रमांक', 'Meeting No.')} <IL style={{ minWidth: 100 }} /></div>
        <div style={{ textAlign: "right" }}>{L('ठराव क्रमांक', 'Resolution No.')} <IL style={{ minWidth: 100 }} /></div>
      </div>

      <div style={{ fontSize: 11, marginTop: 15 }}>
        {L('नुसार ₹ ', 'According to ₹ ')} <IL style={{ minWidth: 120 }} />
        {L(' (अक्षरी ₹ ', ' (Rupees ')} <IL style={{ minWidth: 400 }} />
        {L(') कर्ज मंजूर करण्यात येत आहे.', ') loan is hereby approved.')}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, fontWeight: 700, fontSize: 11 }}>
        {[L('शाखाधिकारी', 'Branch Manager'), L('सरव्यवस्थापक', 'Manager'), L('उपाध्यक्ष', 'Vice Chairman'), L('अध्यक्ष', 'Chairman')].map(lbl => (
          <div key={lbl} style={{ textAlign: "center", padding: "0 10px" }}>{lbl}</div>
        ))}
      </div>
      <PageNum n="१" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PersonPage
══════════════════════════════════════════════════════════════════════════ */
function PersonPage({ title, pageNum, data = {}, prefix = "b", showDeclaration = false, lang }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  const p = prefix;

  // For prefixed date fields (e.g. bSeva, g1Dinank), the split keys are stored
  // as  bSeva_d / bSeva_m / bSeva_y  by splitDates().
  const dKey = (suffix) => `${p}${suffix}`;

  return (
    <div className="bl-page compact-page">

      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div className="bl-photo-box" style={{ width: 70, height: 88 }}>
          {d[p + "Photo"] ? <img src={d[p + "Photo"]} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : L('फोटो', 'Photo')}
        </div>
        <div style={{ flex: 1 }}>
          <SectionPink style={{ textAlign: "center", marginBottom: 6, marginTop: 0, }}>{title}</SectionPink>
          <div style={{ fontSize: 10.5 }}>
            <FR>
              <span>१. {L('संपूर्ण नाव: श्री./श्रीमती', 'Full Name: Mr./Mrs.')}</span><FL value={d[p + "Naav"]} />
              <span>{L('वय', 'Age')}</span><FL value={d[p + "Vay"]} style={{ maxWidth: 40 }} /><span>{L('वर्ष', 'Yrs')}</span>
            </FR>
            <FR>
              <span>२. {L('सभासद क्रमांक:', 'Member No.:')}</span><FL value={d[p + "SabasadNo"]} style={{ maxWidth: 100 }} />
              <span>{L('धारण केलेले भाग (शेअर्स) संख्या', 'Shares Count')}</span><FL value={d[p + "Shares"]} style={{ maxWidth: 80 }} />
              <span>{L('रक्कम ₹', 'Amount ₹')}</span><FL value={d[p + "SharesRakkam"]} style={{ maxWidth: 70 }} />
            </FR>
          </div>
        </div>
      </div>

      <div className="person-body">

        {/* Group A: Personal details 3–8 */}
        <div style={{ fontSize: 10.5 }}>
          <FR><span>३. {L('वडील/पतीचे संपूर्ण नाव: श्री.', 'Father/Husband Full Name: Mr.')}</span><FL value={d[p + "VadilNaav"]} /><span>{L('वय', 'Age')}</span><FL value={d[p + "VadilVay"]} style={{ maxWidth: 40 }} /><span>{L('वर्ष', 'Yrs')}</span></FR>
          <FR><span>४. {L('आईचे नाव: सौ./श्रीमती', 'Mother Name: Mrs.')}</span><FL value={d[p + "AaiNaav"]} /><span>{L('वय', 'Age')}</span><FL value={d[p + "AaiVay"]} style={{ maxWidth: 40 }} /><span>{L('वर्ष', 'Yrs')}</span></FR>
          <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 5 }}>
            <span style={{ whiteSpace: 'nowrap' }}>५. {L('राहण्याचा पत्ता:', 'Residential Address:')}&nbsp;</span>
            <div style={{
              flex: 1,
              backgroundImage: 'linear-gradient(transparent 17px, #333 17px)',
              backgroundSize: '100% 18px',
              minHeight: '18px',
              lineHeight: '18px',
              padding: '0 4px',
              wordBreak: 'break-word'
            }}>
              {d[p + "Patta"]}
            </div>
          </div>
          {p === 'b' && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 5 }}>
                <span style={{ whiteSpace: 'nowrap' }}>५अ. {L('ऑफिस पत्ता:', 'Office Address:')}&nbsp;</span>
                <div style={{
                  flex: 1,
                  backgroundImage: 'linear-gradient(transparent 17px, #333 17px)',
                  backgroundSize: '100% 18px',
                  minHeight: '18px',
                  lineHeight: '18px',
                  padding: '0 4px',
                  wordBreak: 'break-word'
                }}>
                  {d[p + "OfficeAddress"]}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 5 }}>
                <span style={{ whiteSpace: 'nowrap' }}>५ब. {L('गावचा पत्ता:', 'Gavcha Address:')}&nbsp;</span>
                <div style={{
                  flex: 1,
                  backgroundImage: 'linear-gradient(transparent 17px, #333 17px)',
                  backgroundSize: '100% 18px',
                  minHeight: '18px',
                  lineHeight: '18px',
                  padding: '0 4px',
                  wordBreak: 'break-word'
                }}>
                  {d[p + "GavchaAddress"]}
                </div>
              </div>
            </>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 5, marginTop: 3 }}>
            <span>{L('पिन कोड', 'Pin Code')} <IL value={d[p + "PinKod"]} cls="bl-il-sm" /></span>
            <span>{L('दूरध्वनी', 'Tel.')} <IL value={d[p + "Durdhvani"]} cls="bl-il-lg" /></span>
            <span>{L('मोबाईल', 'Mobile')} <IL value={d[p + "Mobile"]} cls="bl-il-lg" /></span>
            <span>{L('ई मेल:', 'Email:')} <IL value={d[p + "Email"]} cls="bl-il-lg" /></span>
          </div>
          <div style={{ marginBottom: 4 }}>
            ६. {L('राहण्याच्या जागेचे स्वरूप:', 'Property Type:')}
            {L('स्वःमालकीचे', 'Self-owned')} <CB checked={(d[p + "JageSwaarup"] || []).includes('स्वःमालकीचे')} />
            {L('वडिलोपार्जित', 'Ancestral')} <CB checked={(d[p + "JageSwaarup"] || []).includes('वडिलोपार्जित')} />
            {L('पागडीची', 'Pagadi')} <CB checked={(d[p + "JageSwaarup"] || []).includes('पागडीची')} />
            {L('भाडेतत्त्वावर', 'Rented')} <CB checked={(d[p + "JageSwaarup"] || []).includes('भाडेतत्त्वावर')} />
            {L('कंपनी क्वार्टर्स', 'Company Qtrs')} <CB checked={(d[p + "JageSwaarup"] || []).includes('कंपनी क्वार्टर्स')} />
          </div>
          <FR>
            <span>७. {L('सध्याच्या जागेत राहत असल्याचा कालावधी:', 'Residence Duration:')}</span>
            <FL value={d[p + "Kalavadhi_m"]} style={{ maxWidth: 50 }} /><span>{L('महिने', 'Months')}</span>
            <FL value={d[p + "Kalavadhi_v"]} style={{ maxWidth: 50 }} /><span>{L('वर्ष', 'Years')}</span>
          </FR>
          <div style={{ marginBottom: 4 }}>
            ८. {L('वैवाहिक स्थिती:', 'Marital Status:')} {L('विवाहित', 'Married')} <CB checked={d[p + "Vaivahik"] === "विवाहित"} /> {L('अविवाहित', 'Unmarried')} <CB checked={d[p + "Vaivahik"] === "अविवाहित"} />
            {L('अवलंबून असलेल्या कुटुंबातील व्यक्तींची संख्या:', 'Dependents:')} <IL value={d[p + "Avalambun"]} cls="bl-il-sm" />
          </div>
        </div>

        {/* Group B: Job / Business — field 9 */}
        <div style={{ fontSize: 10.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>९. {L('नोकरी/व्यवसायाचा तपशील:', 'Job/Business Details:')}</div>
          <div style={{ marginLeft: 10 }}>
            <FR><span>अ) {L('कंपनीचे नाव', 'Company Name')}</span><FL value={d[p + "Company"]} /></FR>
            <FR><span>{L('पत्ता:', 'Address:')}</span><FL value={d[p + "CompanyPatta"]} /></FR>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
              <span>{L('पिन कोड', 'Pin')} <IL value={d[p + "CompanyPin"]} cls="bl-il-sm" /></span>
              <span>{L('दूरध्वनी', 'Tel')} <IL value={d[p + "CompanyTel"]} cls="bl-il-lg" /></span>
              <span>{L('मोबाईल', 'Mobile')} <IL value={d[p + "CompanyMobile"]} cls="bl-il-lg" /></span>
              <span>{L('ई मेल/वेबसाईट', 'Email/Website')} <IL value={d[p + "CompanyEmail"]} cls="bl-il-lg" /></span>
            </div>
            <FR>
              <span>ब) {L('विभाग (डिपार्टमेंट)', 'Department')}</span><FL value={d[p + "Vibhag"]} />
              <span>{L('हुद्दा', 'Designation')}</span><FL value={d[p + "Hudda"]} />
              <span>{L('कर्मचारी सांकेतिक क्र.', 'Emp. Code')}</span><FL value={d[p + "EmpCode"]} style={{ maxWidth: 80 }} />
            </FR>
            <FR>
              <span>क) {L('नोकरी/व्यवसायाचा कालावधी', 'Work Duration')}</span>
              <FL value={d[p + "Karj_m"]} style={{ maxWidth: 50 }} /><span>{L('महिने', 'Months')}</span>
              <FL value={d[p + "Karj_v"]} style={{ maxWidth: 50 }} /><span>{L('वर्ष', 'Years')}</span>
              <span>ड) {L('सेवानिवृत्ती दिनांक:', 'Retirement Date:')}</span>
              {/* Seva is stored as a full date (e.g. "2030-06-30"), split by splitDates → Seva_d/m/y */}
              <IL value={d[dKey("Seva_d")]} cls="bl-il-sm" />/<IL value={d[dKey("Seva_m")]} cls="bl-il-sm" />/<IL value={d[dKey("Seva_y")]} cls="bl-il-sm" />
            </FR>
          </div>
        </div>

        {/* Group C: Income — field 10 */}
        <div style={{ fontSize: 10.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>१०. {L('उत्पन्नाचा तपशील:', 'Income Details:')}</div>
          <div style={{ marginLeft: 10, fontSize: 10 }}>
            <FR>
              <span>अ) {L('नोकरदार असल्यास: एकूण मासिक वेतन ₹', 'If Salaried: Total Monthly Salary ₹')}</span><FL value={d[p + "MonthlyVetan"]} style={{ maxWidth: 80 }} />
              <span>{L('एकूण कपात ₹', 'Deductions ₹')}</span><FL value={d[p + "Kapat"]} style={{ maxWidth: 70 }} />
              <span>{L('निव्वळ वेतन ₹', 'Net Salary ₹')}</span><FL value={d[p + "Niwal"]} style={{ maxWidth: 70 }} />
            </FR>
            <FR>
              <span>ब) {L('व्यावसायिक असल्यास: वार्षिक उत्पन्न ₹', 'If Business: Annual Income ₹')}</span><FL value={d[p + "Vaarshik"]} style={{ maxWidth: 80 }} />
              <span>{L('सर्व खर्च (करासह) कपात ₹', 'Total Expenses ₹')}</span><FL value={d[p + "Kharcha"]} style={{ maxWidth: 70 }} />
              <span>{L('निव्वळ वार्षिक उत्पन्न ₹', 'Net Annual ₹')}</span><FL value={d[p + "NiwalVaarshik"]} style={{ maxWidth: 70 }} />
            </FR>
            <FR>
              <span>क) {L('संपूर्ण कुटुंबाचे एकूण निव्वळ उत्पन्न: ₹', 'Family Net Income: ₹')}</span><FL value={d[p + "Kutumb"]} style={{ maxWidth: 80 }} />
              <span>{L('मासिक', 'Monthly')} <CB checked={d[p + "KutumbType"] === "मासिक"} /> {L('वार्षिक', 'Yearly')} <CB checked={d[p + "KutumbType"] === "वार्षिक"} /></span>
            </FR>
          </div>
        </div>

        {/* Group D: Property + Village — fields 11 & 12 */}
        <div style={{ fontSize: 10.5 }}>
          <FR>
            <span>११. {L('घर/शेती ज्यांच्या नावावर आहे त्यांचे नाव: श्री./श्रीमती', 'Property Owner Name: Mr./Mrs.')}</span><FL value={d[p + "ShetiNaav"]} />
            <span>{L('नाते', 'Relation')}</span><FL value={d[p + "ShetiNaate"]} style={{ maxWidth: 80 }} />
          </FR>
          <FR>
            <span>१२. {L('गावचा पत्ता: मुक्काम', 'Village Address: Mukkam')}</span><FL value={d[p + "GaavMukkam"]} />
            <span>{L('पोस्ट', 'Post')}</span><FL value={d[p + "GaavPost"]} />
            <span>{L('तालुका', 'Taluka')}</span><FL value={d[p + "GaavTaluka"]} />
            <span>{L('जिल्हा', 'District')}</span><FL value={d[p + "GaavJilha"]} />
            <span>{L('राज्य', 'State')}</span><FL value={d[p + "GaavRajya"]} style={{ maxWidth: 60 }} />
          </FR>
          <div style={{ display: "flex", gap: 12, marginBottom: 4 }}>
            <span>{L('पिन कोड', 'Pin')} <IL value={d[p + "GaavPin"]} cls="bl-il-sm" /></span>
            <span>{L('दूरध्वनी', 'Tel')} <IL value={d[p + "GaavDurdhvani"]} cls="bl-il-lg" /></span>
            <span>{L('मोबाईल', 'Mobile')} <IL value={d[p + "GaavMobile"]} cls="bl-il-lg" /></span>
          </div>
        </div>

        {/* Group E: Previous loan sections 13–16 */}
        <div style={{ fontSize: 10.5 }}>
          <FR>
            <span>१३. {L('संस्थेकडून या पूर्वी कर्ज घेतले असल्यास त्याचा तपशील:', 'Previous loan from institution details:')} {L('कर्ज प्रकार', 'Loan Type')}</span><FL value={d[p + "PurvKarjPrakar"]} />
            <span>{L('खाते क्र.', 'A/C No.')}</span><FL value={d[p + "PurvKhate"]} style={{ maxWidth: 80 }} />
            <span>{L('रक्कम ₹', 'Amount ₹')}</span><FL value={d[p + "PurvRakkam"]} style={{ maxWidth: 70 }} />
          </FR>
          <div style={{ display: "flex", gap: 20, marginBottom: 4, marginLeft: 10 }}>
            <span>{L('कर्ज घेतल्याचा दिनांक:', 'Loan Date:')} <IL value={d[dKey("PurvDin1_d")]} cls="bl-il-sm" />/<IL value={d[dKey("PurvDin1_m")]} cls="bl-il-sm" />/<IL value={d[dKey("PurvDin1_y")]} cls="bl-il-sm" /></span>
            <span>{L('कर्ज परत फेडीचा दिनांक:', 'Repayment Date:')} <IL value={d[dKey("PurvDin2_d")]} cls="bl-il-sm" />/<IL value={d[dKey("PurvDin2_m")]} cls="bl-il-sm" />/<IL value={d[dKey("PurvDin2_y")]} cls="bl-il-sm" /></span>
          </div>

          <div style={{ fontWeight: 600, marginBottom: 3 }}>१४. {L('जामिनदार असल्यास तपशील:', 'As guarantor details:')}</div>
          <div style={{ marginLeft: 10 }}>
            {[{ ltr: "a", mr: "अ" }, { ltr: "b", mr: "ब" }].map(item => (
              <div key={item.ltr}>
                <FR><span>{item.mr}) {L('कर्जदाराचे नाव: श्री./श्रीमती', 'Borrower Name: Mr./Mrs.')}</span><FL value={d[p + "Jam94" + item.ltr + "KarjdarNaav"]} /></FR>
                <FR>
                  <span>{L('कर्ज प्रकार:', 'Loan Type:')}</span><FL value={d[p + "Jam94" + item.ltr + "Prakar"]} />
                  <span>{L('खाते क्रमांक', 'A/C No.')}</span><FL value={d[p + "Jam94" + item.ltr + "Khate"]} />
                  <span>{L('रक्कम ₹', 'Amount ₹')}</span><FL value={d[p + "Jam94" + item.ltr + "Rakkam"]} style={{ maxWidth: 70 }} />
                </FR>
                <div style={{ display: "flex", gap: 20, marginBottom: 5 }}>
                  <span>{L('कर्ज घेतल्याचा दिनांक:', 'Loan Date:')}
                    <IL value={d[dKey(`Jam94${item.ltr}Din1_d`)]} cls="bl-il-sm" />/<IL value={d[dKey(`Jam94${item.ltr}Din1_m`)]} cls="bl-il-sm" />/<IL value={d[dKey(`Jam94${item.ltr}Din1_y`)]} cls="bl-il-sm" />
                  </span>
                  <span>{L('कर्ज परत फेडीचा दिनांक:', 'Repayment Date:')}
                    <IL value={d[dKey(`Jam94${item.ltr}Din2_d`)]} cls="bl-il-sm" />/<IL value={d[dKey(`Jam94${item.ltr}Din2_m`)]} cls="bl-il-sm" />/<IL value={d[dKey(`Jam94${item.ltr}Din2_y`)]} cls="bl-il-sm" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <FR>
            <span>१५. {L('कुटुंब सदस्यांनी संस्थेकडून घेतलेल्या कर्जाचा तपशील: नाव श्री./श्रीमती', 'Family member loans: Name Mr./Mrs.')}</span><FL value={d[p + "Kutumb95Naav"]} />
          </FR>
          <FR style={{ marginLeft: 10 }}>
            <span>{L('कर्ज प्रकार:', 'Loan Type:')}</span><FL value={d[p + "Kutumb95Prakar"]} />
            <span>{L('खाते क्रमांक', 'A/C No.')}</span><FL value={d[p + "Kutumb95Khate"]} />
            <span>{L('रक्कम ₹', 'Amount ₹')}</span><FL value={d[p + "Kutumb95Rakkam"]} style={{ maxWidth: 70 }} />
          </FR>
          <div style={{ display: "flex", gap: 20, marginBottom: 4, marginLeft: 10 }}>
            <span>{L('कर्ज घेतल्याचा दिनांक:', 'Loan Date:')} <IL value={d[dKey("Kutumb95Din1_d")]} cls="bl-il-sm" />/<IL value={d[dKey("Kutumb95Din1_m")]} cls="bl-il-sm" />/<IL value={d[dKey("Kutumb95Din1_y")]} cls="bl-il-sm" /></span>
            <span>{L('कर्ज परत फेडीचा दिनांक:', 'Repayment Date:')} <IL value={d[dKey("Kutumb95Din2_d")]} cls="bl-il-sm" />/<IL value={d[dKey("Kutumb95Din2_m")]} cls="bl-il-sm" />/<IL value={d[dKey("Kutumb95Din2_y")]} cls="bl-il-sm" /></span>
          </div>

          <FR>
            <span>१६. {L('इतर वित्त संस्था/बँकेकडून घेतलेल्या कर्जाचा तपशील: संस्था/बँकेचे नाव:', 'Other bank/institution loans: Bank Name:')}</span><FL value={d[p + "Bank96Naav"]} />
            <span>{L('शाखा', 'Branch')}</span><FL value={d[p + "Bank96Shakha"]} style={{ maxWidth: 80 }} />
          </FR>
          <FR style={{ marginLeft: 10 }}>
            <span>{L('कर्ज प्रकार:', 'Loan Type:')}</span><FL value={d[p + "Bank96Prakar"]} />
            <span>{L('खाते क्रमांक', 'A/C No.')}</span><FL value={d[p + "Bank96Khate"]} />
            <span>{L('रक्कम ₹', 'Amount ₹')}</span><FL value={d[p + "Bank96Rakkam"]} style={{ maxWidth: 70 }} />
          </FR>
          <div style={{ display: "flex", gap: 20, marginLeft: 10 }}>
            <span>{L('कर्ज घेतल्याचा दिनांक:', 'Loan Date:')} <IL value={d[dKey("Bank96Din1_d")]} cls="bl-il-sm" />/<IL value={d[dKey("Bank96Din1_m")]} cls="bl-il-sm" />/<IL value={d[dKey("Bank96Din1_y")]} cls="bl-il-sm" /></span>
            <span>{L('कर्ज परत फेडीचा दिनांक:', 'Repayment Date:')} <IL value={d[dKey("Bank96Din2_d")]} cls="bl-il-sm" />/<IL value={d[dKey("Bank96Din2_m")]} cls="bl-il-sm" />/<IL value={d[dKey("Bank96Din2_y")]} cls="bl-il-sm" /></span>
          </div>
        </div>

        {/* Group F: Declaration + Signature */}
        <div>
          {showDeclaration && (
            <div style={{ fontSize: 10, fontStyle: "italic", marginBottom: 4 }}>
              {L('वरील सर्व माहिती सत्य व योग्य असून मी जामिन राहण्यास स्व: खुशीने तयार आहे.', 'I declare that all the above information is true and correct and I voluntarily agree to stand as guarantor.')}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 150, marginTop: 5, fontSize: 10.5 }}>
            {L('सही:', 'Signature')}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 25, alignItems: "baseline", gap: 10 }}>
            <span>{L('ठिकाण:', 'Place:')} <IL value={d[p + "Thikan"]} cls="bl-il-lg" /></span>
            <span>{L('दिनांक:', 'Date:')} <IL value={d[dKey("Dinank_d")]} cls="bl-il-sm" /> / <IL value={d[dKey("Dinank_m")]} cls="bl-il-sm" /> / 20</span>
            <span>{L('श्री./श्रीमती', 'Mr./Mrs.')} <IL value={d[p + "Naav"]} /></span>
          </div>
          <PageNum n={pageNum} />
        </div>

      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 5 — Business Details
══════════════════════════════════════════════════════════════════════════ */
function Page5({ data = {}, lang, pageNum = "५" }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  return (
    <div className="bl-page biz-compact-page">
      <SectionPink style={{ textAlign: "center", marginBottom: 8 }}>{L('अर्जदाराच्या व्यवसायाची माहिती', "Applicant's Business Information")}</SectionPink>
      <div style={{ fontSize: 10.5 }}>
        <FR><span>१. {L('व्यवसायाचे कामकाजाचे स्वरूप:', 'Nature of Business:')}</span><FL value={d.bizNature} /></FR>
        <div style={{ marginBottom: 5 }}>
          २. {L('व्यवसायाचे स्वरूप:', 'Business Type:')}
          {[{ val: 'पब्लिक लि.', en: 'Public Ltd.' }, { val: 'प्रा. लि.', en: 'Pvt. Ltd.' }, { val: 'भागीदारी', en: 'Partnership' }, { val: 'खाजगी', en: 'Proprietary' }, { val: 'लापारी', en: 'Trade' }, { val: 'शेती', en: 'Agriculture' }, { val: 'इतर', en: 'Other' }].map(o => (
            <span key={o.val}> {L(o.val, o.en)} <CB checked={d.bizType === o.val} /></span>
          ))}
        </div>
        <div style={{ marginBottom: 5 }}>
          ३. {L('व्यवसायाच्या जागेचे स्वरूप:', 'Business Premises Type:')}
          <span> {L('अ) स्व:मालकीची', 'a) Self-owned')} <CB checked={d.bizJagaType === 'स्व:मालकीची'} /></span>
          <span> {L('वडिलोपार्जित', 'Ancestral')} <CB checked={d.bizJagaType === 'वडिलोपार्जित'} /></span>
          <span> {L('पागडीची', 'Pagadi')} <CB checked={d.bizJagaType === 'पागडीची'} /></span>
          <span> {L('भाडेतत्त्वावर', 'Rented')} <CB checked={d.bizJagaType === 'भाडेतत्त्वावर'} /></span>
          <span> {L('लिजवर', 'Lease')} <CB checked={d.bizJagaType === 'लिजवर'} /></span>
        </div>
        <FR><span style={{ marginLeft: 20 }}>ब) {L('क्षेत्रफळ', 'Area')}</span><FL value={d.bizArea} style={{ maxWidth: 80 }} /><span>{L('चौ. फुट/मिटर (कार्पेट, बिल्ट अप, सुपर बिल्ट अप)', 'Sq.Ft/Mtr (Carpet/Built-up/Super Built-up)')}</span></FR>
        <FR><span>४. {L('कंपनी/फर्मचे नाव:', 'Company/Firm Name:')}</span><FL value={d.bizFirmName} /></FR>
        <FR><span>५. {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.bizAddress} /></FR>
        <FR><span style={{ marginLeft: 20 }} /><FL value={d.bizAddress2} /></FR>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
          <span>{L('पिन कोड:', 'Pin Code:')} <CharBox value={d.bizPin} n={6} /></span>
          <span>{L('दूर./मो. क्र.:', 'Tel/Mobile:')} <CharBox value={d.bizTel} n={10} /></span>
          <span>{L('ई मेल आयडी:', 'Email ID:')} <IL value={d.bizEmail} cls="bl-il-lg" /></span>
        </div>
        <div style={{ marginBottom: 4 }}>६. {L('पॅन कार्ड क्र.:', 'PAN Card No.:')} <CharBox value={d.bizPan} n={10} /></div>
        <FR><span>७. {L('गुमास्ता लायसन्स क्र.:', 'Gumasta License No.:')}</span><FL value={d.bizGumasta} /></FR>
        <FR><span>८. {L('विक्रीकर क्र.:', 'Sales Tax No.:')}</span><FL value={d.bizSalesTax} /></FR>
        <FR><span>९. {L('व्हॅट (VAT) क्र.:', 'VAT No.:')}</span><FL value={d.bizVat} /></FR>
        <FR><span style={{ marginLeft: 20 }}>{L('सर्व्हिस टॅक्स क्र.:', 'Service Tax No.:')}</span><FL value={d.bizServiceTax} /></FR>
        <FR><span>१०. {L('इतर लायसन्स:', 'Other Licenses:')}</span><FL value={d.bizOtherLicense} /></FR>
        <div style={{ marginBottom: 4 }}>११. {L('व्यवसायासाठी लागणारे सर्व प्रकारचे परवाने (लायसन्स) आपणाकडे आहेत काय?', 'Do you have all required licenses for business?')} {L('होय', 'Yes')} <CB checked={d.bizLicenseYes === true} /> {L('नाही', 'No')} <CB checked={d.bizLicenseYes === false} /></div>
        <div style={{ marginBottom: 4 }}>१२. {L('व्यवसाय लघुउद्योग वा वाहन चालणाऱ्या विभागाचे आपण रहिवाशी आहात काय?', 'Are you a resident of small industry or transport sector?')} {L('होय', 'Yes')} <CB checked={d.bizResidentYes === true} /> {L('नाही', 'No')} <CB checked={d.bizResidentYes === false} /></div>
        <FR><span>१३. {L('व्यवसाय केव्हा पासून करत आहात:', 'Business running since:')}</span><FL value={d.bizSince} /></FR>
        <FR><span>१४. {L('व्यवसायासंबंधी अनुभव:', 'Business Experience:')}</span><FL value={d.bizExperience} /></FR>
        <div style={{ fontWeight: 600, marginTop: 4, marginBottom: 3 }}>१५. {L('व्यवसायापासून मिळणाऱ्या वार्षिक उत्पन्नाचा तपशील:', 'Annual income from business:')}</div>
        <table className="bl-data-table">
          <thead><tr><th>{L('एकूण वार्षिक उत्पन्न', 'Total Annual Income')}</th><th>{L('एकूण वार्षिक खर्च (सर्व करांसहित)', 'Total Annual Expenses (incl. taxes)')}</th><th>{L('निव्वळ वार्षिक उत्पन्न', 'Net Annual Income')}</th></tr></thead>
          <tbody><tr><td>{d.bizAnnualIncome}</td><td>{d.bizAnnualExpense}</td><td>{d.bizNetIncome}</td></tr></tbody>
        </table>
        <div style={{ fontWeight: 600, marginTop: 6, marginBottom: 3 }}>१६. {L('दोन नियमित ग्राहकांचा तपशील:', 'Two regular customers details:')}</div>
        {['अ', 'ब'].map((mr, i) => (
          <div key={mr} style={{ marginLeft: 10, marginBottom: 8 }}>
            <FR><span>{mr}) {L('नाव:', 'Name:')}</span><FL value={d[`bizCust${i + 1}Naav`]} /></FR>
            <FR><span style={{ marginLeft: 20 }}>{L('पत्ता:', 'Address:')}</span><FL value={d[`bizCust${i + 1}Patta`]} /></FR>
            <FR><span style={{ marginLeft: 20 }} /><FL value={d[`bizCust${i + 1}Patta2`]} /></FR>
          </div>
        ))}
        <div style={{ fontWeight: 600, marginTop: 4, marginBottom: 3 }}>१७. {L('दोन नियमित माल पुरवठादारांचा तपशील:', 'Two regular suppliers details:')}</div>
        {['अ', 'ब'].map((mr, i) => (
          <div key={mr} style={{ marginLeft: 10, marginBottom: 6 }}>
            <FR><span>{mr}) {L('नाव:', 'Name:')}</span><FL value={d[`bizSupp${i + 1}Naav`]} /></FR>
            <FR><span style={{ marginLeft: 20 }}>{L('पत्ता:', 'Address:')}</span><FL value={d[`bizSupp${i + 1}Patta`]} /></FR>
          </div>
        ))}
      </div>
      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 6 — Insurance + Tax
══════════════════════════════════════════════════════════════════════════ */
function Page6({ data = {}, lang, pageNum = "६" }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  return (
    <div className="bl-page">
      <SectionPink style={{ textAlign: "center", marginBottom: 8 }}>{L('अर्जदार व भागीदारांनी भरावयाची माहिती', 'Information to be filled by Applicant & Partners')}</SectionPink>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>१) {L('अर्जदार/भागीदार यांचा जीवन विमा (Life Insurance) तपशील', 'Applicant/Partner Life Insurance Details')}</div>
        <div style={{ marginLeft: 10 }}>
          <FR><span>अ) {L('विमा कंपनीचे नाव:', 'Insurance Company Name:')}</span><FL value={d.insCompany} /></FR>
          <FR><span>ब) {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.insAddress} /></FR>
          <FR><span>क) {L('पॉलिसी नंबर', 'Policy No.')}</span><FL value={d.insPolicy} style={{ maxWidth: 120 }} /></FR>
          <FR>
            <span>ड) {L('विमा कालावधी', 'Policy Duration')}</span>
            {/* insDurFrom_d is stored as "2024-01-01" → split → insDurFrom_d / insDurFrom_m / insDurFrom_y */}
            <IL value={d.insDurFrom_d} cls="bl-il-sm" /> / <IL value={d.insDurFrom_m} cls="bl-il-sm" /> / <IL value={d.insDurFrom_y} cls="bl-il-sm" />
            <span>{L('पासून', 'from')}</span>
            <IL value={d.insDurTo_d} cls="bl-il-sm" /> / <IL value={d.insDurTo_m} cls="bl-il-sm" /> / <IL value={d.insDurTo_y} cls="bl-il-sm" />
            <span>{L('पर्यंत', 'to')}</span>
          </FR>
          <FR><span>इ) {L('विमा रक्कम ₹', 'Sum Assured ₹')}</span><FL value={d.insAmount} style={{ maxWidth: 100 }} /><span>/-</span></FR>
          <FR><span>ई) {L('हप्ता रक्कम ₹', 'Premium ₹')}</span><FL value={d.insPremium} style={{ maxWidth: 100 }} /><span>/-</span></FR>
          <div style={{ marginBottom: 5 }}>
            उ) {L('हप्ता भरण्याचा प्रकार:', 'Premium Payment Type:')}
            {[{ mr: 'मासिक', en: 'Monthly' }, { mr: 'त्रैमासिक', en: 'Quarterly' }, { mr: 'अर्ध वार्षिक', en: 'Half-yearly' }, { mr: 'वार्षिक', en: 'Yearly' }].map(o => (
              <span key={o.mr}> {L(o.mr, o.en)} <CB checked={d.insPremiumType === o.mr} /></span>
            ))}
          </div>
        </div>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>२) {L('विम्याच्या पॉलिसी तारणावर कर्ज घेतलेले', 'Loan taken against insurance policy')} {L('आहे', 'Yes')} <CB checked={d.insLoanYes === true} /> {L('नाही', 'No')} <CB checked={d.insLoanYes === false} /></div>
        <div style={{ marginLeft: 10 }}>
          <FR><span>अ) {L('बँक/संस्था/कंपनीचे नाव:', 'Bank/Institution Name:')}</span><FL value={d.insLoanBank} /></FR>
          <FR><span style={{ marginLeft: 20 }}>{L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.insLoanAddress} /></FR>
          <FR>
            <span>ब) {L('कर्ज रक्कम ₹', 'Loan Amount ₹')}</span><FL value={d.insLoanAmount} style={{ maxWidth: 100 }} />
            <span>{L('कर्ज दिनांक', 'Loan Date')}</span>
            <IL value={d.insLoanDate_d} cls="bl-il-sm" /> / <IL value={d.insLoanDate_m} cls="bl-il-sm" /> / <IL value={d.insLoanDate_y} cls="bl-il-sm" />
          </FR>
          <FR><span>क) {L('आज रोजी शिल्लक कर्ज रक्कम ₹', 'Outstanding Loan Balance ₹')}</span><FL value={d.insLoanBalance} style={{ maxWidth: 100 }} /></FR>
        </div>
        <div style={{ fontWeight: 600, marginTop: 6, marginBottom: 4 }}>३) {L('आयकर (Income Tax) संबंधीचा तपशील:', 'Income Tax Details:')} {L('पॅन कार्ड नंबर', 'PAN Card No.')} <CharBox value={d.itPan} n={10} /></div>
        <div style={{ marginLeft: 10 }}>
          <div style={{ marginBottom: 4 }}>अ) {L('आयकर भरणा कधीपासून करत आहात? सन', 'Income tax filing since year')} <IL value={d.itSince} cls="bl-il-sm" /></div>
          <table className="bl-data-table" style={{ marginBottom: 8 }}>
            <thead><tr><th>{L('आर्थिक वर्ष (Financial Year)', 'Financial Year')}</th><th>{L('आयकर रक्कम ₹', 'Income Tax Amount ₹')}</th><th>{L('आयकर भरणा दिनांक', 'IT Filing Date')}</th></tr></thead>
            <tbody>{[1, 2, 3].map(i => (
              <tr key={i}>
                <td>{d[`itYear${i}From`]} - {d[`itYear${i}To`]}</td>
                <td>{d[`itAmount${i}`]}</td>
                <td>{d[`itDate${i}_d`]} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp; {d[`itDate${i}_m`]} &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp; {d[`itDate${i}_y`]}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ fontWeight: 600, marginTop: 4, marginBottom: 4 }}>४) {L('व्यवसाय कर (Professional Tax) बाबतचा तपशील', 'Professional Tax Details')}</div>
        <div style={{ marginLeft: 10 }}>
          <FR><span>अ) {L('व्यवसाय कर (Professional Tax) नंबर', 'Professional Tax No.')}</span><FL value={d.ptNo} style={{ maxWidth: 120 }} /></FR>
          <div style={{ marginBottom: 4 }}>ब) {L('व्यवसाय कर भरणा कधी पासून करत आहात? सन', 'PT filing since year')} <IL value={d.ptSince} cls="bl-il-sm" /></div>
          <table className="bl-data-table" style={{ marginBottom: 8 }}>
            <thead><tr><th>{L('आर्थिक वर्ष (Financial Year)', 'Financial Year')}</th><th>{L('व्यवसाय कर रक्कम ₹', 'PT Amount ₹')}</th><th>{L('व्यवसाय कर भरणा दिनांक', 'PT Filing Date')}</th></tr></thead>
            <tbody>{[1, 2, 3].map(i => (
              <tr key={i}>
                <td>{d[`ptYear${i}From`]} - {d[`ptYear${i}To`]}</td>
                <td>{d[`ptAmount${i}`]}</td>
                <td>{d[`ptDate${i}_d`]} &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp; {d[`ptDate${i}_m`]} &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp; {d[`ptDate${i}_y`]}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <SectionPink style={{ marginTop: 6 }}>{L('व्यवसाया विषयी अतिरिक्त माहिती', 'Additional Business Information')}</SectionPink>
        {[1, 2, 3, 4].map(i => (<div key={i} style={{ borderBottom: "1px solid #999", marginTop: 10, minHeight: 16 }}>{d[`bizExtra${i}`]}</div>))}
      </div>
      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 7 — Collateral Property
══════════════════════════════════════════════════════════════════════════ */
function Page7({ data = {}, lang, pageNum = "७" }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  return (
    <div className="bl-page">
      <SectionPink style={{ textAlign: "center", marginBottom: 8 }}>{L('तारण मिळकतीचा तपशील', 'Collateral Property Details')}</SectionPink>
      <div style={{ fontSize: 10.5 }}>
        <div style={{ marginBottom: 5 }}>
          १. {L('मिळकतीचे स्वरूप:', 'Property Type:')}
          {[{ mr: 'गाळा', en: 'Shop/Gala' }, { mr: 'फ्लॅट', en: 'Flat' }, { mr: 'अकृषक शेत जमीन', en: 'Non-agri Land' }, { mr: 'शेत जमीन', en: 'Agri Land' }, { mr: 'इतर', en: 'Other' }].map(o => (
            <span key={o.mr}> {L(o.mr, o.en)} <CB checked={d.colPropType === o.mr} /></span>
          ))}
          {d.colPropTypeOther && <IL value={d.colPropTypeOther} cls="bl-il-lg" />}
        </div>
        <FR><span>२. {L('मिळकतीचा संपूर्ण पत्ता:', 'Full Address of Property:')}</span><FL value={d.colAddress} /></FR>
        <FR><span style={{ marginLeft: 20 }} /><FL value={d.colAddress2} /></FR>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
          <span>{L('पिन कोड:', 'Pin:')} <CharBox value={d.colPin} n={6} /></span>
          <span>{L('दूरध्वनी क्र.:', 'Tel:')} <CharBox value={d.colTel} n={10} /></span>
          <span>{L('मोबाईल क्र.:', 'Mobile:')} <CharBox value={d.colMobile} n={10} /></span>
        </div>
        <FR><span>३. {L('इतर तपशील:', 'Other Details:')}</span></FR>
        <table className="bl-data-table" style={{ marginTop: 6 }}>
          <thead><tr><th colSpan={2}>{L('गाळा/फ्लॅट/बांधीव जागेचा तपशील', 'Shop/Flat/Built-up Property Details')}</th><th colSpan={2}>{L('अकृषक शेत जमीन/शेत जमीनचा तपशील', 'Non-agri/Agri Land Details')}</th></tr></thead>
          <tbody>
            {[
              [L('क्षेत्रफळ', 'Area'), 'colGalaArea', L('क्षेत्र', 'Area'), 'colLandArea'],
              [L('इमारत बांधकाम वर्ष', 'Construction Year'), 'colBuildYear', L('एन. ए. ऑर्डर दिनांक', 'NA Order Date'), 'colNADate'],
              [L('सिटी सर्व्हे नंबर', 'City Survey No.'), 'colCitySurvey', L('सिटी सर्व्हे नंबर', 'City Survey No.'), 'colLandCitySurvey'],
              [L('प्लॉट नंबर', 'Plot No.'), 'colPlot', L('प्लॉट नंबर', 'Plot No.'), 'colLandPlot'],
              [L('वॉर्ड नंबर', 'Ward No.'), 'colWard', L('वॉर्ड नंबर', 'Ward No.'), 'colLandWard'],
              [L('बांधकाम पूर्णत्वाचा दाखला दि.', 'Completion Certificate'), 'colCompletionCert', L('गट नंबर', 'Gut No.'), 'colGutNo'],
              [L('ओ. सी. दिनांक', 'OC Date'), 'colOCDate', L('हिस्सा नंबर', 'Hissa No.'), 'colHissaNo'],
              [L('कनव्हेन्स डिड दिनांक', 'Conveyance Deed Date'), 'colConveyanceDate', L('चतुसिमा पूर्वेस', 'East Boundary'), 'colEast'],
              [L('हौसिंग सोसा. रजि. नं.', 'Housing Soc. Reg. No.'), 'colHousingReg', L('पश्चिमेस', 'West Boundary'), 'colWest'],
              [L('सभासद नंबर', 'Member No.'), 'colMemberNo', L('दक्षिणेस', 'South Boundary'), 'colSouth'],
              ['', '', L('उत्तरेस', 'North Boundary'), 'colNorth'],
            ].map(([l1, k1, l2, k2], idx) => {
              // For date-type collateral fields, show the split value
              const dateKeys = ['colNADate', 'colCompletionCert', 'colOCDate', 'colConveyanceDate'];
              const v1 = dateKeys.includes(k1)
                ? [d[`${k1}_d`], d[`${k1}_m`], d[`${k1}_y`]].filter(Boolean).join('/')
                : d[k1];
              const v2 = dateKeys.includes(k2)
                ? [d[`${k2}_d`], d[`${k2}_m`], d[`${k2}_y`]].filter(Boolean).join('/')
                : d[k2];
              return (
                <tr key={idx}><td style={{ width: '22%' }}>{l1}</td><td style={{ width: '28%' }}>{v1}</td><td style={{ width: '22%' }}>{l2}</td><td style={{ width: '28%' }}>{v2}</td></tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop: 6 }}>
          <FR><span>४. {L('मिळकतीची किंमत: अ) शासकीय मुल्यांकन:', 'Property Value: a) Govt. Valuation:')}</span><FL value={d.colGovtVal} style={{ maxWidth: 100 }} /><span>/-</span></FR>
          <FR><span style={{ marginLeft: 40 }}>ब) {L('बाजारभावाप्रमाणे :', 'Market Value:')}</span><FL value={d.colMarketVal} style={{ maxWidth: 100 }} /><span>/-</span></FR>
        </div>
        <div style={{ fontWeight: 600, marginTop: 6, marginBottom: 3 }}>५. {L('तारण मिळकतीचा विमा तपशील:', 'Collateral Property Insurance Details:')}</div>
        <div style={{ marginLeft: 10 }}>
          <FR><span>अ) {L('विमा कंपनीचे नाव:', 'Insurance Company:')}</span><FL value={d.colInsCompany} /></FR>
          <FR><span>ब) {L('संपूर्ण पत्ता:', 'Full Address:')}</span><FL value={d.colInsAddress} /></FR>
          <FR><span style={{ marginLeft: 20 }} /><FL value={d.colInsAddress2} /></FR>
          <FR><span>क) {L('पॉलिसी नंबर:', 'Policy No.:')}</span><FL value={d.colInsPolicy} style={{ maxWidth: 120 }} /></FR>
          <FR>
            <span>ड) {L('विमा कालावधी:', 'Policy Duration:')}</span>
            <IL value={d.colInsDurFrom_d} cls="bl-il-sm" /> / <IL value={d.colInsDurFrom_m} cls="bl-il-sm" /> / <IL value={d.colInsDurFrom_y} cls="bl-il-sm" />
            <span>{L('पासून', 'from')}</span>
            <IL value={d.colInsDurTo_d} cls="bl-il-sm" /> / <IL value={d.colInsDurTo_m} cls="bl-il-sm" /> / <IL value={d.colInsDurTo_y} cls="bl-il-sm" />
            <span>{L('पर्यंत', 'to')}</span>
          </FR>
          <FR><span>ड) {L('विमा रक्कम ₹:', 'Sum Assured ₹:')}</span><FL value={d.colInsAmount} style={{ maxWidth: 100 }} /><span>/-</span></FR>
          <FR><span>इ) {L('हप्ता रक्कम ₹:', 'Premium ₹:')}</span><FL value={d.colInsPremium} style={{ maxWidth: 100 }} /><span>/-</span></FR>
        </div>
      </div>
      <PageNum n={pageNum} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 8 — Loan Terms + Signatures
══════════════════════════════════════════════════════════════════════════ */
function Page8({ data = {}, lang, pageNum = "८" }) {
  const L = (mr, en) => lang === 'mr' ? mr : en;
  const d = data;
  const rules_mr = [
    "कर्ज वितरणाच्या दिनांकापासून व्याज आकारणी सुरु करण्यात येईल. शिल्लक मुद्दल रक्कमेवर (Reducing Balance Amount) दिवसांप्रमाणे (Per Day Interest) व्याज आकारणी करण्यात येईल.",
    "कर्ज वितरणाच्या दिनांकापासून ३० दिवसांच्या आत पहिला कर्ज हप्ता (मुद्दल + व्याज) जमा करणे आवश्यक आहे. त्या पुढील प्रत्येक कर्ज हप्ता ३० दिवसांच्या आत भरणा करणे आवश्यक असून विलंब झाल्यास सदर कर्ज हप्ता धकीत समजण्यात येईल व त्या रक्कमेवर द.सा.द.शे. २% प्रमाणे दंड व्याज आकारणी करण्यात येईल.",
    "कर्जदाराचा कर्ज हप्ता कंपनीमधून वेतन कपातीद्वारे धनादेशाने जमा होत असल्यास असा वेतन कपातीचा धनादेश संस्थेस प्राप्त झाल्याशिवाय कर्ज हप्ता जमा झाला आहे असे समजले जाणार नाही.",
    "खालील कारणास्तव कर्जाची एक रक्कमी परतफेडीची मागणी करण्याचा अधिकार संस्थेस राहील. अ) मंजूर कारणासाठी कर्ज रक्कमेचा विनियोग न केल्यास  ब) कोणत्याही कारणाने सलग तीन हप्ते थकल्यास क) अर्जदार/जामिनदार यांस कोटीचा दंड/शिक्षा झाल्यास  ड) कर्जदार/जामिनदार मयत झाल्यास  इ) खोटी माहिती किंवा खोटी कागदपत्रे सादर केल्यास",
    "कर्जदार कर्जाचे हप्ते नियमितपणे परत फेड करत असल्याबाबत जामिनदारांनी खात्री करून घेणे आवश्यक आहे.",
    "कर्जदाराने नियमितपणे हप्ते न भरल्यास हप्ते जामिनदारांना वैयक्तिक/सामूहिकरित्या भरावे लागतील.",
    "कर्ज खाते थकीत झाल्यास कर्जदार, जामिनदार यांचे निवास, नोकरी/व्यवसायाचे ठिकाणी प्रत्यक्ष भेट, नोटीस देण्यात येईल.",
    "थकबाकीची नोटीस मिळाली नाही म्हणून जामिनदारांना कर्ज परतफेडीची जबाबदारी टाळता येत नाही.",
    "प्रत्येक जामिनदार हा संपूर्ण कर्जास वैयक्तिक: जबाबदार असेल, हिस्सेदारीने नाही हे लक्षात घ्यावे.",
    "कर्जाची थकबाकी असल्यास कर्जदार व जामिनदार यांच्या संस्थेकडे जमा असणाऱ्या ठेवी परत केल्या जाणार नाही.",
    "कर्ज वसूलीसाठी कर्जदार आणि जामिनदार यांच्या विरुद्ध म. स. स. अ. नियम व इतर कायद्यानुसार दावा दाखल करण्याचा अधिकार संस्थेस आहे.",
    "कर्ज मंजूरी नंतर निवास/नोकरी/व्यवसायाच्या पत्तामंध्ये बदल झाल्यास तो कर्जदार व जामिनदार यानी संस्थेस त्वरित कळविला पाहिजे.",
  ];
  const rules_en = [
    "Interest will be charged from the date of loan disbursement on reducing balance amount on per day basis.",
    "The first installment (principal + interest) must be paid within 30 days of disbursement. Each subsequent installment must be paid within 30 days; delay will attract penal interest at 2% p.a. on overdue amount.",
    "If loan installment is recovered through salary deduction by cheque, it will not be considered paid until the cheque is received by the society.",
    "The society reserves the right to demand full repayment in following cases: a) Loan not used for approved purpose b) Three consecutive installments defaulted c) Court penalty to borrower/guarantor d) Death of borrower/guarantor e) False information submitted.",
    "Guarantors must ensure that the borrower is repaying loan installments regularly.",
    "If borrower fails to pay installments regularly, guarantors will be individually/jointly liable to pay.",
    "If loan account becomes overdue, visits to residence and workplace will be made and notices issued.",
    "Non-receipt of overdue notice does not exempt guarantors from repayment responsibility.",
    "Each guarantor is individually liable for the full loan amount, not proportionally.",
    "If loan is overdue, deposits of borrower and guarantors with the society will not be returned.",
    "The society has the right to file a case against borrower and guarantors under applicable laws.",
    "Any change in residential/work address after loan approval must be immediately communicated to the society.",
  ];
  const rules = lang === 'mr' ? rules_mr : rules_en;
  const sigRows = [
    { label: L('अर्जदाराचे नाव', "Applicant's Name"), value: d.arjdarNaav },
    { label: L('जामिनदार क्र.१ चे नाव', 'Guarantor 1 Name'), value: d.jameen1Naav },
    { label: L('जामिनदार क्र.२ चे नाव', 'Guarantor 2 Name'), value: d.jameen2Naav },
    ...(d.extraGuarantors || []).map((g, i) => ({ label: `${L('जामिनदार क्र.', 'Guarantor No. ')}${i + 3} ${L('चे नाव', 'Name')}`, value: d[`eg_${g.id}_Naav`] })),
  ];
  return (
    <div className="bl-page">
      <SectionPink style={{ textAlign: "center" }}>{L('कर्ज विषयक नियम', 'Loan Terms & Conditions')}</SectionPink>
      <div style={{ fontSize: 11, lineHeight: 1.8, marginTop: 4 }}>
        {rules.map((rule, i) => (
          <div key={i} className="bl-num-item" style={{ marginBottom: 4 }}>
            <span className="bl-num-label" style={{ minWidth: 28 }}>{i + 1})</span>
            <span style={{ flex: 1, textAlign: "justify" }}>{rule}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, marginTop: 10, lineHeight: 2.2 }}>
        {L('आम्ही खालील सही करणाऱ्यांनी वरील कर्ज विषयक नियम वाचून व समजावून घेतलेले आहेत. उपरोक्त नमूद नियम आम्हाला मान्य असून, संस्थेचे प्रचलित असलेले व वेळोवेळी अमलात येणारे नियम आमच्यावर बंधनकारक असतील. आम्ही राजी खुशीने यावर सह्या करीत आहोत.',
          'We the undersigned have read and understood the above loan terms and conditions. We agree to abide by the above terms and all existing and future rules of the society. We are signing this willingly.')}
      </div>

      <div style={{ fontSize: 11, marginTop: 15 }}>
        {sigRows.map(row => (
          <div key={row.label} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ minWidth: 160 }}>{row.label}</span>
            <span>{L('श्री./श्रीमती:', 'Mr./Mrs.:')}</span>
            <span style={{ flex: 1, borderBottom: "1px solid #333", height: 16, display: "inline-block" }}>{row.value}</span>
            <span>{L('सही', 'Sign')}</span>
            <span style={{ minWidth: 110, borderBottom: "1px solid #333", height: 16, display: "inline-block" }} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, marginTop: 25, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>{L('ठिकाण:', 'Place:')} <IL value={d.thikan} cls="bl-il-lg" /></div>
        <div>{L('दिनांक', 'Date')} <IL value={d.dinank_d} cls="bl-il-sm" /> / <IL value={d.dinank_m} cls="bl-il-sm" /> / {lang === 'mr' ? '२०' : '20'}<IL value={d.dinank_y?.slice(-2)} cls="bl-il-sm" /></div>
      </div>

      <hr className="bl-thin" style={{ marginTop: 20 }} />

      <SectionPink style={{ marginTop: 10 }}>{L('कार्यालयीन कामकाजासाठी', 'For Office Use Only')}</SectionPink>

      <div style={{ fontSize: 11, marginTop: 25 }}>
        <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 20 }}>
          <span style={{ whiteSpace: "nowrap" }}>{L('श्री./श्रीमती :', 'Mr./Mrs. :')}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 10, height: 22, fontSize: 12, paddingLeft: 10 }}>
            {d.arjdarNaav}
          </div>
        </div>

        <div style={{ display: "flex", gap: 80, marginTop: 25, marginBottom: 25 }}>
          <span>{L('सभासद क्रमांक', 'Member No.')} <IL value={d.saCra} cls="bl-il-lg" /></span>
          <span>{L('अर्ज क्र.', 'Application No.')} <IL value={d.appNo} cls="bl-il-lg" /></span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 25, marginBottom: 40, gap: 8, lineHeight: 2.2 }}>
          <span style={{ whiteSpace: "nowrap" }}>{L('यांचेकडून', 'From')}</span>
          <div style={{ borderBottom: "1px solid #333", flex: 1, minWidth: 120, height: 22, textAlign: "center", fontSize: 12 }}>
            {d.karjKhate}
          </div>
          <span style={{ whiteSpace: "nowrap" }}>{L('या कारणासाठी कर्ज मागणी अर्ज मिळाला.', 'loan application received for this purpose.')}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30 }}>
        <div style={{ fontSize: 11 }}>{L('दिनांक', 'Date')} &nbsp; / &nbsp; / {lang === 'mr' ? "२०" : "20"}</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ borderTop: "1px solid #333", minWidth: 180, paddingTop: 6, fontSize: 11 }}>
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
══════════════════════════════════════════════════════════════════════════ */
export default function BusinessLoanPrint({ data = {}, clientInfo = {}, lang = 'mr' }) {
  const printRef = useRef(null);

  // ── KEY FIX: transform all ISO date strings into _d / _m / _y parts ──
  const d = splitDates(data);

  const extraGuarantors = d.extraGuarantors || [];
  const baseOffset = extraGuarantors.length;
  const toDevanagari = (n) => {
    const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return String(n).split('').map(c => digits[parseInt(c)] || c).join('');
  };
  const bizPageNum = lang === 'mr' ? toDevanagari(5 + baseOffset) : String(5 + baseOffset);
  const insPageNum = lang === 'mr' ? toDevanagari(6 + baseOffset) : String(6 + baseOffset);
  const colPageNum = lang === 'mr' ? toDevanagari(7 + baseOffset) : String(7 + baseOffset);
  const termsPageNum = lang === 'mr' ? toDevanagari(8 + baseOffset) : String(8 + baseOffset);
  const L = (mr, en) => lang === 'mr' ? mr : en;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div ref={printRef} id="bl-print-area">
        <Page1 data={d} clientInfo={clientInfo} lang={lang} />
        <PersonPage title={L('कर्जदाराची माहिती', "Borrower's Information")} pageNum={lang === 'mr' ? "२" : "2"} data={d} prefix="b" showDeclaration={false} lang={lang} />
        <PersonPage title={L('जामिनदार क्रमांक १ ची माहिती', 'Guarantor No. 1 Information')} pageNum={lang === 'mr' ? "३" : "3"} data={d} prefix="g1" showDeclaration={true} lang={lang} />
        <PersonPage title={L('जामिनदार क्रमांक २ ची माहिती', 'Guarantor No. 2 Information')} pageNum={lang === 'mr' ? "४" : "4"} data={d} prefix="g2" showDeclaration={true} lang={lang} />
        {extraGuarantors.map((g, idx) => {
          const pageIndex = 5 + idx;
          const pageNumLabel = lang === 'mr' ? toDevanagari(pageIndex) : String(pageIndex);
          const guarantorNum = idx + 3;
          return (
            <PersonPage key={`eg_${g.id}`} title={L(`जामिनदार क्रमांक ${guarantorNum} ची माहिती`, `Guarantor No. ${guarantorNum} Information`)} pageNum={pageNumLabel} data={d} prefix={`eg_${g.id}_`} showDeclaration={true} lang={lang} />
          );
        })}
        <Page5 data={d} lang={lang} pageNum={bizPageNum} />
        <Page6 data={d} lang={lang} pageNum={insPageNum} />
        <Page7 data={d} lang={lang} pageNum={colPageNum} />
        <Page8 data={d} lang={lang} pageNum={termsPageNum} />
      </div>
    </>
  );
}