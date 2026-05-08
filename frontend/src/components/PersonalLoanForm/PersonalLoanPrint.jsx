import { useRef } from "react";
import { useTranslation } from "react-i18next";
import "../../i18n";

/* ─── Global styles injected once ────────────────────────────────────────── */
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
  .page {
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
    display: flex;
    flex-direction: column;
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
    background: #f0f7ff;
    color: var(--primary);
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
    vertical-align: baseline;
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
  .page-num { 
    position: absolute;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: center; 
    font-size: 10px; 
    color: #444; 
  }
  .num-item { display: flex; gap: 6px; margin-bottom: 4px; font-size: 10.5px; align-items: flex-start; }
  .num-label { min-width: 24px; font-weight: 600; flex-shrink: 0; }

  table.data-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 4px; }
  table.data-table th { background: #f0f7ff; border: 1px solid #999; padding: 3px 5px; text-align: center; font-weight: 600; }
  table.data-table td { border: 1px solid #999; padding: 3px 5px; height: 20px; }

  /* ── Society name ── */
  .society-name { font-size: 18px; font-weight: 700; color: var(--primary); }
  .society-subtitle { font-size: 10px; font-weight: 600; color: #111; }
  .society-reg { font-size: 8px; color: #555; margin-top: 2px; }
  .society-address { font-size: 8px; color: #555; }

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
      display: flex !important;
      flex-direction: column !important;
    }
    .page:last-child {
      page-break-after: avoid !important;
    }
    .no-print, .sidebar, .top-bar, .master-breadcrumbs, .master-footer, .preview-toolbar, .skiptranslate, #google_translate_element { 
      display: none !important; 
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  }
  .print-area { 
    background: #fff !important;
    min-height: 0 !important;
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    vertical-align: baseline;
  }
`;

const formatDate = (raw) => {
    if (!raw) return "";
    const pts = String(raw).split("-");
    if (pts.length === 3) return `${pts[2]}/${pts[1]}/${pts[0]}`;
    return raw;
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
const Divider = ({ type = "divider", style }) => <hr className={type} style={style} />;
const SectionPink = ({ children, style }) => (
    <div className="section-header-pink" style={style}>{children}</div>
);
const PageNum = ({ n }) => <div className="page-num">{n}</div>;
const FieldRow = ({ children, style }) => (
    <div className="field-row" style={style}>{children}</div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1 — कर्ज मागणी अर्ज
 ══════════════════════════════════════════════════════════════════════════ */
function Page1({ data = {}, clientInfo = {}, t, pageNum }) {
    const { i18n } = useTranslation();
    const lang = i18n.language;
    let [y, m, d] = ["", "", ""];
    if (data.dinank) {
        if (data.dinank.includes("-")) {
            [y, m, d] = data.dinank.split("-");
        } else if (data.dinank.includes("/")) {
            [d, m, y] = data.dinank.split("/");
        }
    }
    const marathiNums = t('personal_loan.print.marathi_nums', { returnObjects: true }) || [];

    return (
        <div className="page">
            <div style={{ fontSize: 9, color: "#333", marginBottom: 2 }}>{t('personal_loan.print.to_board') || "स. अध्यक्ष/संचालक मंडळ,"}</div>

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
                        {t('personal_loan.title')}
                    </h1>
                    <div style={{ fontSize: 9, color: "#333", marginTop: 2 }}>{t('personal_loan.print.note_page_1')}</div>
                </div>

                {/* Right Module Tag and App No */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ fontSize: 16, fontStyle: "italic", color: "var(--primary)", fontWeight: 700 }}>Personal</div>
                    {data.applicationNo && (
                        <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>App No: <strong>{data.applicationNo}</strong></div>
                    )}
                </div>
            </div>

            {/* Date and Branch Row */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, fontSize: 10, marginBottom: 4, marginTop: 4 }}>
                <span>{t('personal_loan.labels.date')} <IL value={d} cls="inline-field-sm" /> / <IL value={m} cls="inline-field-sm" /> / <IL value={y} cls="inline-field-sm" /></span>
            </div>

            {/* Society Branding + Account Boxes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
                <div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "var(--primary)" }}>{clientInfo?.name || t('personal_loan.print.default_society_name') || "AVS AI 360 Admin"}</div>
                    <div style={{ fontSize: 8.5, color: "#444", fontWeight: 500 }}>{t('personal_loan.print.registration')}</div>
                </div>
                <div style={{ fontSize: 10, textAlign: "right", display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", columnGap: 10, rowGap: 6 }}>
                    <span>{t('personal_loan.labels.member_no_technical')}:</span>
                    <CharBox value={data.sabasadCrNo} />
                    <span>{t('personal_loan.labels.loan_acc_no')}:</span>
                    <CharBox value={data.karjKhate} />
                    <div style={{ paddingTop: 4 }}>{t('personal_loan.labels.branch')}:</div>
                    <div style={{ textAlign: "left", minWidth: 100, fontWeight: 600, paddingTop: 4 }}>{data.shakha}</div>
                </div>
            </div>

            <div style={{ fontSize: 8.5, color: "var(--primary)", fontWeight: 700, marginBottom: 10 }}>
                {t('personal_loan.print.office_address_full')}
            </div>

            <hr style={{ border: "none", borderBottom: "2px solid var(--primary)", marginBottom: 15 }} />

            <div style={{ fontSize: 10, marginBottom: 10, fontWeight: "normal" }}>{t('personal_loan.print.sir_madam') || "महोदय,"}</div>

            {/* Applicants Info */}
            <div style={{ fontSize: 10.5, lineHeight: 1.9, marginTop: 4 }}>
                <FieldRow>
                    <span style={{ fontWeight: "normal" }}>{t('personal_loan.labels.mr_mrs_colon') ? (t('personal_loan.labels.borrower_name_label').includes('Mr.') ? t('personal_loan.labels.borrower_name_label') : t('personal_loan.labels.applicant_name')) : "अर्जदार श्री./श्रीमती"}:</span>
                    <FL value={data.bNaav} />
                    <span style={{ marginLeft: 16 }}>{t('personal_loan.labels.age')}:</span>
                    <IL value={data.bVay} cls="inline-field-sm" />
                    <span>{t('personal_loan.print.years')}</span>
                </FieldRow>
                {data.saharjdarNaav && (
                    <FieldRow>
                        <span style={{ fontWeight: "normal" }}>{t('personal_loan.sections.co_applicant') || "सहअर्जदार"}: {t('personal_loan.labels.mr_mrs_colon') || "श्री./श्रीमती:"}</span>
                        <FL value={data.saharjdarNaav} />
                        <span style={{ marginLeft: 16 }}>{t('personal_loan.labels.age')}:</span>
                        <IL value={data.saharjdarVay} cls="inline-field-sm" />
                        <span>{t('personal_loan.print.years')}</span>
                    </FieldRow>
                )}
            </div>

            {/* Body text */}
            <div style={{ fontSize: 10, lineHeight: 2.4, marginTop: 12 }}>
                {lang === 'mr' ? (
                    <>
                        यांजकडून अर्ज करण्यात येतो की, मला ₹ <IL value={data.karjRakkam} cls="inline-field-lg" />
                        (अक्षरी ₹ <IL value={data.akshari} cls="inline-field-xl" />)
                        वैयक्तिक जामिनकी तारण कर्ज पाहिजे आहे. सदर कर्जाची मी व्याजासह <IL value={data.paratfedKalavadhi} cls="inline-field-sm" /> महिन्यात संपूर्ण परत फेड करीन. पहिला हप्ता
                        <IL value={data.pahilaHapta} cls="inline-field-sm" /> महिन्यांनंतर आणि बाकीचे हप्ते तद्नंतर प्रत्येक महिन्याच्या
                        <IL value={data.tarikh} cls="inline-field-sm" /> तारखेस देत जाईन. माझ्या कर्ज घेण्याचा {t('personal_loan.labels.purpose_with_colon') || " उद्देश (कारण) "} <FL value={data.karan} style={{ maxWidth: 700, minWidth: 550 }} /> हा असून माझी सध्याची माहिती पुढीलप्रमाणे देत आहे.
                    </>
                ) : (
                    <>
                        I/We hereby apply for a Personal Guarantee Loan of ₹ <IL value={data.karjRakkam} cls="inline-field-lg" />
                        (Rupees <IL value={data.akshari} cls="inline-field-xl" /> only). I will repay this loan along with interest within
                        <IL value={data.paratfedKalavadhi} cls="inline-field-sm" /> months. The first installment will be paid after
                        <IL value={data.pahilaHapta} cls="inline-field-sm" /> months and subsequent installments on the
                        <IL value={data.tarikh} cls="inline-field-sm" />th of every month. The purpose of my loan is <FL value={data.karan} style={{ maxWidth: 300, minWidth: 150 }} /> and I am providing my current information as follows.
                    </>
                )}
            </div>

            <div style={{ fontSize: 10, lineHeight: 2.4, marginTop: 6 }}>
                {lang === 'mr' ? (
                    <>
                        मी विवाहित / अविवाहित असून, माझ्या कुटुंबातील <IL value={data.avalambun} cls="inline-field-sm" /> व्यक्ती माझ्यावर अवलंबून आहेत. तसेच मी प्रतिज्ञेवर सांगतो की, दुसऱ्या कोणत्याही को-ऑपरेटिव्ह सोसायटीचे अगर बँकेचे माझ्यावर कर्ज नाही. माझ्या कर्जाची परतफेड मी संचालक मंडळ ठरवील त्याप्रमाणे व व्याजाच्या दराने तसेच सोसायटीतर्फे वेळोवेळी असणाऱ्या इतर आकारणीसह व खर्चासह दिलेल्या मुदतीत करीन. सोसायटीचे अस्तित्वात असलेले तसेच पुढे अंमलात येणारे सर्व कर्ज विषयक नियम व पोटनियम मला मान्य आहेत / राहतील.
                    </>
                ) : (
                    <>
                        I am married / unmarried, and <IL value={data.avalambun} cls="inline-field-sm" /> family members are dependent on me. I also declare on oath that I do not have any other bank loan from any other cooperative society. I will repay my loan as decided by the Board of Directors with interest and other charges as applicable to the society from time to time within the given period. I agree to abide by all existing and future rules and by-laws of the society.
                    </>
                )}
            </div>
            <div style={{ fontSize: 10.5, lineHeight: 2.4, marginTop: 8 }}>
                {lang === 'mr' ? (
                    "मला जामीन राहाण्यास कबूल सहमत असलेल्या सोसायटीच्या सभासदांची नावे व त्यांच्याविषयी कर्ज मागणी अर्जात नमूद करावयाची इतर माहिती मी खालीलप्रमाणे या अर्जासोबत देत आहे."
                ) : (
                    "I am providing the details of the society members who have agreed to act as my guarantors and other information as mentioned in this loan application below."
                )}
            </div>

            {/* Guarantors */}
            <div style={{ marginTop: 8 }}>
                {[
                    { n: marathiNums[0] || "1", name: data.g1Naav, age: data.g1Vay },
                    { n: marathiNums[1] || "2", name: data.g2Naav, age: data.g2Vay },
                ].map(item => (
                    <div key={item.n} className="field-row" style={{ fontSize: 10.5, marginBottom: 1 }}>
                        <span>{item.n}) {t('personal_loan.print.guarantor_name_label') || "जामिनदाराचे नाव श्री./श्रीमती"}</span>
                        <FL value={item.name} />
                        <span style={{ marginLeft: 8 }}>{t('personal_loan.labels.age') || "वय"}</span>
                        <IL value={item.age} cls="inline-field-sm" />
                        <span>{t('personal_loan.print.years') || "वर्षे"}</span>
                    </div>
                ))}
                {Array.isArray(data.extraGuarantors) && data.extraGuarantors.map((item, idx) => (
                    <div key={'extra-' + idx} className="field-row" style={{ fontSize: 10.5, marginBottom: 1 }}>
                        <span>{3 + idx}) {t('personal_loan.print.guarantor_name_label') || "जामिनदाराचे नाव श्री./श्रीमती"}</span>
                        <FL value={item.Naav} />
                        <span style={{ marginLeft: 8 }}>{t('personal_loan.labels.age') || "वय"}</span>
                        <IL value={item.Vay} cls="inline-field-sm" />
                        <span>{t('personal_loan.print.years') || "वर्षे"}</span>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: 10.5, marginTop: 20 }}>{t('personal_loan.print.humbly_request') || "संचालक मंडळाने माझ्या या कर्ज मागणी अर्जाचा विचार करावा ही नम्र विनंती."}</div>

            {/* Signature Block per Image */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <div style={{ textAlign: "left", minWidth: 280 }}>
                    <div style={{ fontSize: 10, textAlign: "center" }}>{t('personal_loan.print.yours_faithfully') || "आपला/आपली विश्वासू,"}</div>
                    <div style={{ fontSize: 10, marginTop: 25 }}>{t('personal_loan.print.signature') || "सही"}</div>
                    <div style={{ display: "flex", alignItems: "flex-end", marginTop: 16 }}>
                        <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>{t('personal_loan.labels.mr_mrs_colon') || "श्री./श्रीमती :"}</span>
                        <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 4, textAlign: "center", fontSize: 10.5, paddingBottom: 2 }}>{data.bNaav}</div>
                    </div>
                    <div style={{ textAlign: "center", fontSize: 10, marginTop: 10, fontWeight: "bold" }}>{t('personal_loan.print.borrower_sign') || "अर्जदार (कर्जदार)"}</div>
                </div>
            </div>

            <Divider style={{ borderBottom: "3px double #333", borderTop: "none", height: 2, margin: "25px 0" }} />

            {/* Board Remarks Footer per Image */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: "bold", paddingTop: 35 }}>
                <span>{t('personal_loan.print.board_remark') || "संचालक मंडळाचा शेरा"}</span>
                <span>{t('personal_loan.print.guarantor_recommendation') || "शिफारस करणाऱ्या संचालक/स्थानिक समिती सदस्याची सही"}</span>
            </div>

            <hr style={{ border: "none", borderBottom: "1px solid #333", margin: "10px 0 14px 0" }} />
            <div style={{ borderBottom: "1px solid #333", marginBottom: 20, marginTop: 5, height: 16 }}>&nbsp;</div>

            {/* Meeting Details Row */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 12 }}>
                <div>
                    {t('personal_loan.print.board_meeting') || "संचालक मंडळाची सभा दि."} &nbsp;
                    <span style={{ borderBottom: "1px solid #333", minWidth: 30, display: "inline-block" }}>&nbsp;</span> /
                    <span style={{ borderBottom: "1px solid #333", minWidth: 30, display: "inline-block" }}>&nbsp;</span> / २०
                </div>
                <div>{t('personal_loan.print.meeting_no') || "सभा क्रमांक"} <span style={{ borderBottom: "1px solid #333", minWidth: 100, display: "inline-block" }}>&nbsp;</span></div>
                <div>{t('personal_loan.print.resolution_no') || "ठराव क्रमांक"} <span style={{ borderBottom: "1px solid #333", minWidth: 100, display: "inline-block" }}>&nbsp;</span></div>
            </div>

            {/* Approval amount row */}
            <div style={{ fontSize: 10, marginBottom: 12 }}>
                {lang === 'mr' ? (
                    <>गुसार ₹ ____________________ (अक्षरी ₹ ____________________________________ ) कर्ज मंजूर करण्यात येत आहे.</>
                ) : (
                    <>Approved ₹ ____________________ (Rupees ____________________________________ only) loan is hereby sanctioned.</>
                )}
            </div>

            {/* Footer Authorities spaced per image */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 60, fontSize: 10.5, fontWeight: "bold" }}>
                <span style={{ minWidth: 110, textAlign: "center" }}>{t('personal_loan.print.officer_sign_label') || "शाखाधिकारी"}</span>
                <span style={{ minWidth: 110, textAlign: "center" }}>{t('personal_loan.print.manager') || "सरव्यवस्थापक"}</span>
                <span style={{ minWidth: 110, textAlign: "center" }}>{t('personal_loan.print.vice_chairman') || "उपाध्यक्ष"}</span>
                <span style={{ minWidth: 110, textAlign: "center" }}>{t('personal_loan.print.chairman') || "अध्यक्ष"}</span>
            </div>

            <PageNum n={pageNum} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════
   Reusable: Person block (Pages 2, 3, 4)
 ══════════════════════════════════════════════════════════════════════════ */
function PersonPage({ title, pageNum, data = {}, prefix = "b", showDeclaration = false, t, mainData = {}, lang = 'mr' }) {
    const d = data;
    const p = prefix; // 'b', 'g1', 'g2'
    const marathiNumsRaw = t('personal_loan.print.marathi_nums', { returnObjects: true });
    const marathiNums = Array.isArray(marathiNumsRaw) ? marathiNumsRaw : [];

    return (
        <div className="page">
            <div style={{ flex: 12 }}>
                {/* Photo + header */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 6 }}>
                    <div className="photo-box" style={{ width: 70, height: 85 }}>
                        {d[p + "Photo"] ? <img src={d[p + "Photo"]} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : t('personal_loan.labels.photo')}
                    </div>
                    <div style={{ flex: 1 }}>
                        <SectionPink style={{ textAlign: "center", marginBottom: 6 }}>{title}</SectionPink>
                        <div style={{ fontSize: 10 }}>
                            <FieldRow>
                                <span>{marathiNums[0] || "१"}. {t('personal_loan.print.full_name_header')}</span><FL value={d[p + "Naav"]} />
                                <span>{t('personal_loan.labels.age')}</span><FL value={d[p + "Vay"]} style={{ maxWidth: 40 }} /><span>{t('personal_loan.print.years')}</span>
                            </FieldRow>
                            <FieldRow>
                                <span>{marathiNums[1] || "२"}. {t('personal_loan.print.member_no_header')}</span><FL value={d[p + "SabasadNo"]} style={{ maxWidth: 100 }} />
                                <span>{t('personal_loan.print.shares_count')}</span><FL value={d[p + "Shares"]} style={{ maxWidth: 80 }} />
                                <span>{t('personal_loan.labels.loan_amount')}</span><FL value={d[p + "SharesRakkam"]} style={{ maxWidth: 70 }} />
                            </FieldRow>
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: 9.5, lineHeight: 1.2 }}>
                    <FieldRow><span>{marathiNums[2] || "३"}. {t('personal_loan.labels.father_husband_name')}</span><FL value={d[p + "VadilNaav"]} /><span>{t('personal_loan.labels.age')}</span><FL value={d[p + "VadilVay"]} style={{ maxWidth: 40 }} /><span>{t('personal_loan.print.years')}</span></FieldRow>
                    <FieldRow><span>{marathiNums[3] || "४"}. {t('personal_loan.labels.mother_name')}</span><FL value={d[p + "AaiNaav"]} /><span>{t('personal_loan.labels.age')}</span><FL value={d[p + "AaiVay"]} style={{ maxWidth: 40 }} /><span>{t('personal_loan.print.years')}</span></FieldRow>
                    <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 4 }}>
                        <span style={{ whiteSpace: "nowrap", paddingBottom: "2px" }}>{marathiNums[4] || "५"}. {t('personal_loan.labels.residential_address')}:</span>
                        <div style={{ borderBottom: "1px solid #333", flex: 1, marginLeft: 4, height: 18, padding: "0 4px 2px 4px", fontSize: 10, display: "flex", alignItems: "flex-end" }}>
                            {String(d[p + "Patta"] || "").substring(0, 85)}
                        </div>
                    </div>
                    <div style={{ borderBottom: "1px solid #333", width: "100%", height: 18, padding: "0 4px 2px 4px", fontSize: 10, marginBottom: 6, display: "flex", alignItems: "flex-end" }}>
                        {String(d[p + "Patta"] || "").substring(85)}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 5, marginTop: 10 }}>
                        <span>{t('personal_loan.labels.pin_code')} <IL value={d[p + "PinKod"]} cls="inline-field-sm" /></span>
                        <span>{t('personal_loan.labels.telephone')} <IL value={d[p + "Durdhvani"]} cls="inline-field-lg" /></span>
                        <span>{t('personal_loan.labels.mobile')} <IL value={d[p + "Mobile"]} cls="inline-field-lg" /></span>
                        <span>{t('personal_loan.labels.email')}: <IL value={d[p + "Email"]} cls="inline-field-lg" /></span>
                    </div>

                    {p === 'b' && (
                        <div style={{ marginTop: 5, marginBottom: 5 }}>
                            <FieldRow>
                                <span style={{ fontWeight: 600 }}>{t('personal_loan.labels.office_address') || "Office Address"}:</span>
                                <FL value={d[p + "OfficeAddress"]} />
                            </FieldRow>
                            <FieldRow style={{ marginTop: 4 }}>
                                <span style={{ fontWeight: 600 }}>{t('personal_loan.labels.gavcha_address') || "Gavcha Address"}:</span>
                                <FL value={d[p + "GavchaAddress"]} />
                            </FieldRow>
                        </div>
                    )}

                    <div style={{ marginBottom: 0 }}>
                        {marathiNums[5] || "6"}. {t('personal_loan.labels.property_type')}:
                        {t('personal_loan.options.self_owned')} <CB checked={d[p + "JageSwaarup"]?.includes("स्वःमालकीचे")} />
                        {lang === 'mr' ? "बिल्डिंगपार्टि" : "Building/Parti"} <CB checked={d[p + "JageSwaarup"]?.includes("बिल्डिंगपार्टि")} />
                        {t('personal_loan.options.pagadi')} <CB checked={d[p + "JageSwaarup"]?.includes("पागडीची")} />
                        {t('personal_loan.options.rented')} <CB checked={d[p + "JageSwaarup"]?.includes("भाडेतत्त्वावर")} />
                        {t('personal_loan.options.company_quarters')} <CB checked={d[p + "JageSwaarup"]?.includes("कंपनी क्वार्टर्स")} />
                    </div>

                    <FieldRow>
                        <span>{marathiNums[6] || "७"}. {t('personal_loan.print.residence_duration_label')}</span>
                        <FL value={d[p + "Kalavadhi_m"]} style={{ maxWidth: 50 }} /><span>{t('personal_loan.print.months')}</span>
                        <FL value={d[p + "Kalavadhi_v"]} style={{ maxWidth: 50 }} /><span>{t('personal_loan.labels.duration_years')}</span>
                    </FieldRow>

                    <div style={{ marginBottom: 5 }}>
                        {marathiNums[7] || "८"}. {t('personal_loan.labels.marital_status')}: {t('personal_loan.options.married')} <CB checked={d[p + "Vaivahik"] === "विवाहित"} /> {t('personal_loan.options.unmarried')} <CB checked={d[p + "Vaivahik"] === "अविवाहित"} />
                        {t('personal_loan.labels.dependents')}: <IL value={d[p + "Avalambun"]} cls="inline-field-sm" />
                    </div>

                    {/* Job */}
                    <div style={{ fontWeight: 600, marginBottom: 0, marginTop: 1, lineHeight: 0.8 }}>{marathiNums[8] || "9"}. {t('personal_loan.sections.job_details_title')}:</div>
                    <div style={{ marginLeft: 10 }}>
                        <FieldRow><span>{lang === 'mr' ? "अ)" : "a)"} {t('personal_loan.labels.company_name')}</span><FL value={d[p + "Company"]} /></FieldRow>
                        <FieldRow><span>{lang === 'mr' ? "ब)" : "b)"} {t('personal_loan.labels.address')}:</span><FL value={d[p + "CompanyPatta"]} /></FieldRow>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 1 }}>
                            <span>{t('personal_loan.labels.pin_code')} <IL value={d[p + "CompanyPin"]} cls="inline-field-sm" /></span>
                            <span>{t('personal_loan.labels.telephone')} <IL value={d[p + "CompanyTel"]} cls="inline-field-lg" /></span>
                            <span>{t('personal_loan.labels.mobile')} <IL value={d[p + "CompanyMobile"]} cls="inline-field-lg" /></span>
                            <span>{t('personal_loan.labels.email')} <IL value={d[p + "CompanyEmail"]} cls="inline-field-lg" /></span>
                        </div>
                        <FieldRow>
                            <span>{lang === 'mr' ? "क)" : "c)"} {t('personal_loan.labels.department')}:</span><FL value={d[p + "Vibhag"]} />
                            <span>{t('personal_loan.labels.designation')}</span><FL value={d[p + "Hudda"]} />
                            <span>{t('personal_loan.labels.employee_code')}</span><FL value={d[p + "EmpCode"]} style={{ maxWidth: 80 }} />
                        </FieldRow>
                        <FieldRow>
                            <span>{lang === 'mr' ? "ड)" : "d)"} {t('personal_loan.labels.employment_duration_label')}</span>
                            <FL value={d[p + "Karj_m"]} style={{ maxWidth: 50 }} /><span>{t('personal_loan.print.months') || "महिने"}</span>
                            <FL value={d[p + "Karj_v"]} style={{ maxWidth: 50 }} /><span>{t('personal_loan.labels.duration_years') || "वर्षे"}</span>
                            <span style={{ marginLeft: 8 }}>{lang === 'mr' ? "इ)" : "e)"} {t('personal_loan.labels.retirement_date')}:</span>
                            <IL value={formatDate(d[p + "Seva"])} cls="inline-field-sm" />
                        </FieldRow>
                    </div>

                    {/* Income */}
                    <div style={{ fontWeight: 600, marginTop: 2, marginBottom: 1 }}>{t('personal_loan.print.marathi_nums', { returnObjects: true })[9] || "१०"}. {t('personal_loan.sections.income_details_title')}:</div>
                    <div style={{ marginLeft: 10, fontSize: 10 }}>
                        <FieldRow>
                            <span>{lang === 'mr' ? "अ)" : "a)"} {t('personal_loan.print.salaried_income')}</span><FL value={d[p + "MonthlyVetan"]} style={{ maxWidth: 80 }} />
                            <span>{t('personal_loan.labels.deductions')} ₹</span><FL value={d[p + "Kapat"]} style={{ maxWidth: 70 }} />
                            <span>{t('personal_loan.labels.net_salary')} ₹</span><FL value={d[p + "Niwal"]} style={{ maxWidth: 70 }} />
                        </FieldRow>
                        <FieldRow>
                            <span>{lang === 'mr' ? "ब)" : "b)"} {t('personal_loan.print.business_income')}</span><FL value={d[p + "Vaarshik"]} style={{ maxWidth: 80 }} />
                            <span>{t('personal_loan.labels.total_expenses')} ₹</span><FL value={d[p + "Kharcha"]} style={{ maxWidth: 70 }} />
                            <span>{t('personal_loan.labels.net_annual_income')} ₹</span><FL value={d[p + "NiwalVaarshik"]} style={{ maxWidth: 70 }} />
                        </FieldRow>
                        <FieldRow>
                            <span>{lang === 'mr' ? "क)" : "c)"} {t('personal_loan.print.family_income')}</span><FL value={d[p + "Kutumb"]} style={{ maxWidth: 80 }} />
                            <span>{t('personal_loan.options.monthly')} <CB checked={d[p + "KutumbType"] === "मासिक"} /> {t('personal_loan.options.yearly')} <CB checked={d[p + "KutumbType"] === "वार्षिक"} /></span>
                        </FieldRow>
                    </div>

                    {/* Sheeti */}
                    <FieldRow style={{ marginTop: 1 }}>
                        <span>{marathiNums[10] || "11"}. {t('personal_loan.print.property_owner_label')}</span><FL value={d[p + "ShetiNaav"]} />
                        <span>{t('personal_loan.labels.relation')}</span><FL value={d[p + "ShetiNaate"]} style={{ maxWidth: 80 }} />
                    </FieldRow>

                    {/* Village address */}
                    <div style={{ marginTop: 1 }}>
                        <FieldRow>
                            <span>{marathiNums[11] || "12"}. {t('personal_loan.print.village_address_label')}</span><FL value={d[p + "GaavMukkam"]} />
                            <span>{t('personal_loan.labels.post')}</span><FL value={d[p + "GaavPost"]} /><span>{t('personal_loan.labels.taluka')}</span><FL value={d[p + "GaavTaluka"]} /><span>{t('personal_loan.labels.district')}</span><FL value={d[p + "GaavJilha"]} /><span>{t('personal_loan.labels.state')}</span><FL value={d[p + "GaavRajya"]} style={{ maxWidth: 60 }} />
                        </FieldRow>
                        <div style={{ display: "flex", gap: 12, marginBottom: 2 }}>
                            <span>{t('personal_loan.labels.pin_code')} <IL value={d[p + "GaavPin"]} cls="inline-field-sm" /></span>
                            <span>{t('personal_loan.labels.mobile')} <IL value={d[p + "GaavMobile"]} cls="inline-field-lg" /></span>
                        </div>
                    </div>

                    {/* 93 Previous loan */}
                    <div style={{ marginTop: 1 }}>
                        <FieldRow>
                            <span>{marathiNums[12] || "13"}. {t('personal_loan.print.prev_loan_details')} {t('personal_loan.labels.loan_type')}</span><FL value={d[p + "PurvKarjPrakar"]} />
                            <span>{t('personal_loan.labels.loan_acc_no')}</span><FL value={d[p + "PurvKhate"]} style={{ maxWidth: 80 }} />
                            <span>{t('personal_loan.labels.loan_amount')}</span><FL value={d[p + "PurvRakkam"]} style={{ maxWidth: 70 }} />
                        </FieldRow>
                        <div style={{ display: "flex", gap: 20, marginBottom: 5, marginLeft: 10 }}>
                            <span>{t('personal_loan.labels.loan_taken_date')}: <IL value={formatDate(d[p + "PurvDin1"])} cls="inline-field-sm" /></span>
                            <span>{t('personal_loan.labels.loan_repayment_date')}: <IL value={formatDate(d[p + "PurvDin2"])} cls="inline-field-sm" /></span>
                        </div>
                    </div>

                    {/* 94 As guarantor */}
                    <div style={{ fontWeight: 600, marginTop: 5, marginBottom: 1 }}>{marathiNums[13] || "14"}. {t('personal_loan.print.guarantor_of_others')}</div>
                    <div style={{ marginLeft: 10 }}>
                        {[
                            { ltr: "a", m: "अ", eltr: "a" },
                            { ltr: "b", m: "ब", eltr: "b" },
                        ].map(item => (
                            <div key={item.ltr}>
                                <FieldRow><span>{lang === 'mr' ? item.m : item.eltr}) {t('personal_loan.labels.borrower_name')}: {t('personal_loan.labels.mr_mrs_colon') || "श्री./श्रीमती"}</span><FL value={d[p + "Jam94" + item.ltr + "KarjdarNaav"]} /></FieldRow>
                                <FieldRow>
                                    <span>{t('personal_loan.labels.loan_type')}:</span><FL value={d[p + "Jam94" + item.ltr + "Prakar"]} /><span>{t('personal_loan.labels.loan_acc_no')}</span><FL value={d[p + "Jam94" + item.ltr + "Khate"]} /><span>{t('personal_loan.labels.loan_amount')}</span><FL value={d[p + "Jam94" + item.ltr + "Rakkam"]} style={{ maxWidth: 70 }} />
                                </FieldRow>
                                <div style={{ display: "flex", gap: 20, marginBottom: 1 }}>
                                    <span>{t('personal_loan.labels.loan_taken_date')}: <IL value={formatDate(d[p + "Jam94" + item.ltr + "Din1"])} cls="inline-field-sm" /></span>
                                    <span>{t('personal_loan.labels.loan_repayment_date')}: <IL value={formatDate(d[p + "Jam94" + item.ltr + "Din2"])} cls="inline-field-sm" /></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 95 Family member loans */}
                    <div style={{ fontWeight: 600, marginTop: 5, marginBottom: 5 }}>{marathiNums[14] || "15"}. {t('personal_loan.sections.family_loan')}</div>
                    <div style={{ marginLeft: 10 }}>
                        <FieldRow>
                            <span>{t('personal_loan.labels.applicant_name')}</span><FL value={d[p + "Kutumb95Naav"]} />
                            <span>{t('personal_loan.labels.loan_type')}</span><FL value={d[p + "Kutumb95Prakar"]} />
                        </FieldRow>
                        <FieldRow>
                            <span>{t('personal_loan.labels.loan_acc_no')}</span><FL value={d[p + "Kutumb95Khate"]} />
                            <span>{t('personal_loan.labels.loan_amount')}</span><FL value={d[p + "Kutumb95Rakkam"]} style={{ maxWidth: 70 }} />
                        </FieldRow>
                        <div style={{ display: "flex", gap: 20, marginBottom: 5 }}>
                            <span>{t('personal_loan.labels.loan_taken_date')}: <IL value={formatDate(d[p + "Kutumb95Din1"])} cls="inline-field-sm" /></span>
                            <span>{t('personal_loan.labels.loan_repayment_date')}: <IL value={formatDate(d[p + "Kutumb95Din2"])} cls="inline-field-sm" /></span>
                        </div>
                    </div>

                    {/* 96 Other bank */}
                    <div style={{ fontWeight: 600, marginTop: 5 }}>{marathiNums[15] || "16"}. {t('personal_loan.print.other_bank_loans')}</div>
                    <FieldRow style={{ marginTop: 5 }}>
                        <span>{t('personal_loan.labels.bank_name')}:</span><FL value={d[p + "Bank96Naav"]} />
                        <span>{t('personal_loan.labels.branch')}</span><FL value={d[p + "Bank96Shakha"]} style={{ maxWidth: 80 }} />
                    </FieldRow>
                    <FieldRow style={{ marginLeft: 10 }}>
                        <span>{t('personal_loan.labels.loan_type')}:</span><FL value={d[p + "Bank96Prakar"]} /><span>{t('personal_loan.labels.loan_acc_no')}</span><FL value={d[p + "Bank96Khate"]} /><span>{t('personal_loan.labels.loan_amount')}</span><FL value={d[p + "Bank96Rakkam"]} style={{ maxWidth: 70 }} />
                    </FieldRow>
                    <div style={{ display: "flex", gap: 20, marginBottom: 10, marginLeft: 10 }}>
                        <span>{t('personal_loan.labels.loan_taken_date')}: <IL value={formatDate(d[p + "Bank96Din1"])} cls="inline-field-sm" /></span>
                        <span>{t('personal_loan.labels.loan_repayment_date')}: <IL value={formatDate(d[p + "Bank96Din2"])} cls="inline-field-sm" /></span>
                    </div>
                </div>

                {showDeclaration && (
                    <div style={{ fontSize: 10, marginTop: 6, fontStyle: "italic" }}>
                        {t('personal_loan.print.as_guarantor_decl')}
                    </div>
                )}

            </div>

            {/* Footer for Signature and Date/Place - Pinned to bottom by margin-top: auto */}
            <div style={{ marginTop: 2, paddingBottom: 30 }}>
                <div style={{ marginLeft: 500, fontSize: 10.5, marginTop: 15 }}>{t('personal_loan.print.signature')}</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginTop: 10, paddingTop: 15 }}>
                    <span>{t('personal_loan.labels.place')}: <IL value={d[p + "Thikan"]} cls="inline-field-lg" /></span>
                    <span>{t('personal_loan.labels.date')} <IL value={formatDate(d[p + "Dinank"] || mainData.dinank)} cls="inline-field-sm" /></span>
                    <span style={{ minWidth: 160 }}>{t('personal_loan.labels.mr_mrs_colon')} <IL value={d[p + "Naav"]} /></span>
                </div>
            </div>

            <PageNum n={pageNum} />
        </div>
    );
}


/* ══════════════════════════════════════════════════════════════════════════
   PAGE 8 — Loan Terms + Signatures + Office
 ══════════════════════════════════════════════════════════════════════════ */
function Page8({ data = {}, t, pageNum, sigRows = [], lang = 'mr' }) {
    const d = data;
    const rulesRaw = t('personal_loan.print.rules', { returnObjects: true });
    const rules = Array.isArray(rulesRaw) ? rulesRaw : [];

    const marathiNumsRaw = t('personal_loan.print.marathi_nums', { returnObjects: true });
    const marathiNums = Array.isArray(marathiNumsRaw) ? marathiNumsRaw : [];

    return (
        <div className="page">
            <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{marathiNums[4] || "५"}</div>
            <SectionPink style={{ textAlign: "center", marginTop: 2 }}>{t('personal_loan.print.rules_title')}</SectionPink>
            <div style={{ fontSize: 9.5, lineHeight: 1.5, marginTop: 4 }}>
                {rules.map((rule, i) => {
                    const isRule4 = i === 3; // The rule with sub-points (a,b,c...)
                    if (isRule4 && rule.includes('\n')) {
                        const [title, ...points] = rule.split('\n');
                        return (
                            <div key={i} className="num-item" style={{ marginBottom: 8 }}>
                                <span className="num-label">{marathiNums[i] || i + 1})</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: 4 }}>{title}</div>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "4px 15px",
                                        fontSize: 9
                                    }}>
                                        {points.map((p, idx) => (
                                            <div key={idx} style={{ lineHeight: 1.2 }}>{p}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div key={i} className="num-item">
                            <span className="num-label">{marathiNums[i] || i + 1})</span>
                            <span style={{ whiteSpace: "pre-wrap" }}>{rule}</span>
                        </div>
                    );
                })}
            </div>
            <div style={{ fontSize: 10.5, marginTop: 15 }}>
                {sigRows.map(row => (
                    <div key={row.label} style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
                        <span style={{ minWidth: 140 }}>{row.label}</span>
                        <span>{t('personal_loan.labels.mr_mrs_colon') || "श्री./श्रीमती:"}</span>
                        <span className="inline-field" style={{ flex: 1, borderBottom: "1px solid #333", height: 16 }}>{row.value}</span>
                        <span>{t('personal_loan.print.signature')}</span>
                        <span className="inline-field" style={{ minWidth: 100, borderBottom: "1px solid #333", height: 16 }} />
                    </div>
                ))}
            </div>

            <div style={{ fontSize: 10.5, marginTop: 20, display: "flex", flexDirection: "column", gap: 15 }}>
                <div>{t('personal_loan.labels.place')}: <IL value={d.thikan} cls="inline-field-lg" /></div>
                <div>{t('personal_loan.labels.date')} <IL value={formatDate(d.dinank)} cls="inline-field-lg" /></div>
            </div>

            <Divider type="thin" style={{ marginTop: 12 }} />

            <SectionPink style={{ marginTop: 20, textAlign: "center" }}>{t('personal_loan.sections.office_use')}</SectionPink>

            <div style={{ fontSize: 10.5, marginTop: 25 }}>
                <FieldRow>
                    <span style={{ fontWeight: "normal" }}>{t('personal_loan.labels.mr_mrs_colon') || "श्री./श्रीमती :"}</span>
                    <FL value={d.bNaav} />
                </FieldRow>
                <div style={{ display: "flex", gap: 30, marginTop: 20 }}>
                    <span>{t('personal_loan.labels.member_no')} <IL value={d.saCra} /></span>
                    <span>{t('personal_loan.labels.office_arj_no')} <IL value={d.applicationNo} /></span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", marginTop: 25, marginBottom: 35, gap: 8 }}>
                    <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>{t('personal_loan.labels.yanchyakadun') || "यांचेकडून"}</span>
                    <div style={{ borderBottom: "1px solid #333", flex: 1, minWidth: 100, height: 20, textAlign: "center", fontSize: 10.5 }}>{d.karjKhate}</div>
                    <span style={{ fontSize: 10, whiteSpace: "nowrap" }}>{t('personal_loan.labels.karz_magni_milala') || "या कारणासाठी अर्ज मागणी अर्ज मिळाला."}</span>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
                <div style={{ fontSize: 10.5 }}>{t('personal_loan.labels.date')} &nbsp; / &nbsp; / {lang === 'mr' ? "२०" : "20"}</div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ borderTop: "1px solid #333", minWidth: 160, paddingTop: 1, fontSize: 10.5 }}>
                        {t('personal_loan.print.clerk_sign_label') || "शाखाधिकारी / संबंधित लिपिक"}
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
export default function PersonalLoanPrint({ data = {}, clientInfo = {} }) {
    const { t, i18n } = useTranslation();
    const printRef = useRef(null);
    const lang = i18n.language || 'mr';

    let currentP = 1;
    const nextP = () => (currentP++).toString();

    const sigRows = [
        { label: t('personal_loan.labels.applicant_name'), value: data.bNaav },
        { label: `${t('personal_loan.labels.guarantor')} 1`, value: data.g1Naav },
        { label: `${t('personal_loan.labels.guarantor')} 2`, value: data.g2Naav },
        ...(data.extraGuarantors || []).map((g, idx) => ({
            label: `${t('personal_loan.labels.guarantor')} ${idx + 3}`,
            value: g.Naav
        }))
    ];

    return (
        <>
            <style>{GLOBAL_CSS}</style>
            <div ref={printRef} id="print-area" className="print-area">
                <Page1 data={data} clientInfo={clientInfo} t={t} pageNum={nextP()} lang={lang} />
                <PersonPage title={t('personal_loan.print.borrower_page_title')} pageNum={nextP()} data={data} prefix="b" showDeclaration={false} t={t} mainData={data} lang={lang} />
                <PersonPage title={t('personal_loan.print.guarantor_page_title', { n: 1 })} pageNum={nextP()} data={data} prefix="g1" showDeclaration={true} t={t} mainData={data} lang={lang} />
                <PersonPage title={t('personal_loan.print.guarantor_page_title', { n: 2 })} pageNum={nextP()} data={data} prefix="g2" showDeclaration={true} t={t} mainData={data} lang={lang} />

                {/* Dynamic Extra Guarantor Pages */}
                {(data.extraGuarantors || []).map((g, idx) => (
                    <PersonPage
                        key={g.id}
                        title={`${t('personal_loan.labels.guarantor')} ${idx + 3}`}
                        pageNum={nextP()}
                        data={g}
                        prefix=""
                        showDeclaration={true}
                        t={t}
                        mainData={data}
                        lang={lang}
                    />
                ))}

                <Page8 data={data} t={t} pageNum={nextP()} sigRows={sigRows} lang={lang} />
            </div>
        </>
    );
}