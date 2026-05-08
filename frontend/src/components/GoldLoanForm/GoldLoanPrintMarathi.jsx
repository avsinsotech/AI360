import React from 'react';

const Underline = ({ value, minWidth = '100px' }) => (
  <span className="underline" style={{ minWidth, borderBottom: '1px solid #000', display: 'inline-block', textAlign: 'center', fontWeight: 700, padding: '0 5px' }}>{value || <>&nbsp;</>}</span>
);

const HeaderMR = ({ clientInfo }) => (
  <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      {clientInfo?.logoUrl && <img src={clientInfo.logoUrl} alt="Logo" style={{ height: '60px' }} />}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 700 }}>{clientInfo?.name || "पुणे पीपल्स को-ऑप बँक लि., पुणे"}</h1>
        <p style={{ fontSize: '10px', margin: '2px 0' }}>(मल्टी-स्टेट बँक)</p>
        <p style={{ fontSize: '12px', margin: 0 }}>{clientInfo?.address || "मु. पो. पहिला मजला, ४७७/४७८, मार्केट यार्ड पुणे – ४११ ०३७."}</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 1 — सुवर्ण कर्ज अर्ज
   ══════════════════════════════════════════════════════════════════════════ */
export const Page1MR = ({ data, clientInfo }) => {
  const ornamentItems = data?.ornaments || [];
  const rows = [...ornamentItems, ...Array(Math.max(0, 9 - ornamentItems.length)).fill({})].slice(0, 9);

  return (
    <div className="page marathi-font">
      <HeaderMR clientInfo={clientInfo} />

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <h2 style={{ textDecoration: 'underline', fontSize: '18px', fontWeight: 800 }}>सुवर्ण कर्ज अर्ज सभासद / नाममात्र सभासद</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
        <p>दिनांक : <Underline value={data?.sanctionDate} minWidth="120px" /></p>
      </div>

      <div style={{ marginBottom: '15px', lineHeight: 1.6 }}>
        <p>व्यवस्थापक,</p>
        <p className="bold">{clientInfo?.name || "पुणे पीपल्स को-ऑपरेटिव्ह बँक लि.,"}</p>
        <p>शाखा <Underline value={data?.branch} minWidth="200px" /></p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <p className="bold">महोदय / महोदया,</p>
        <p style={{ marginTop: '5px', textIndent: '30px', lineHeight: 1.5 }}>
          मी / आम्ही श्री / श्रीमती <Underline value={data?.customerName} minWidth="500px" /> आपल्या बँकेचे सभासद / नाममात्र सभासद आहे / आहोत. माझा / आमचा सभासद / नाममात्र सभासद क्रमांक <Underline value={data?.membershipNo} minWidth="150px" /> आहे / आहेत.
        </p>
      </div>

      <div style={{ marginBottom: '10px', lineHeight: 1.6 }}>
        <p style={{ textAlign: 'justify' }}>
          मी / आम्ही आपणास विनंती करतो की मला / आम्हाला रु. <Underline value={data?.loanSanction} minWidth="120px" /> अक्षरी <Underline value={data?.loanSanctionWords} minWidth="350px" /> चे कर्ज शैक्षणिक / धार्मिक / कर्ज फेडीसाठी / घर बांधणीसाठी / व्यवसाय प्रयोजनासाठी खालील सुवर्ण आणि चांदीच्या वस्तूंच्या तारणावर मंजूर करावे, ज्याचा मी / आम्ही बिनशर्त मालक आहे / आहोत. मी / आम्ही बँकेचे या व्यवहारासाठीचे सर्व नियम वाचले आणि समजले असून ते मला / आम्हाला मान्य आहेत आणि त्या नियमांनुसार व्यवहार करण्यास मी / आम्ही सहमत आहोत. मी / आम्ही पुष्टी करतो की मी / आम्ही सदर दागिने / जवाहिरचे खरे मालक असून त्यावर कोणताही बोजा किंवा अधिकार यापूर्वी निर्माण केलेला नाही.
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th colSpan="3">अर्जदाराने भरायची माहिती</th>
            <th colSpan="5">सोनाराने भरायची माहिती</th>
          </tr>
          <tr>
            <th style={{ width: '40px' }}>अ.क्र.</th>
            <th>वस्तूंचे नाव</th>
            <th>एकूण ढोबळ वजन ग्रॅम. मिग्रॅ.</th>
            <th style={{ width: '50px' }}>कॅरेट</th>
            <th>निव्वळ वजन ग्रॅम. मिग्रॅ</th>
            <th>दर प्रति १० ग्रॅम</th>
            <th colSpan="2">किंमत (रु. / पै.)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, i) => (
            <tr key={i} style={{ height: '24px' }}>
              <td>{i + 1}</td>
              <td>{item.particular || ''}</td>
              <td>{item.grossWt || ''}</td>
              <td>{item.carat || ''}</td>
              <td>{item.netWt || ''}</td>
              <td>{item.goldRate || ''}</td>
              <td>{item.valuerPrice ? Math.floor(item.valuerPrice) : ''}</td>
              <td style={{ width: '30px' }}>{item.valuerPrice ? (item.valuerPrice % 1).toFixed(2).split('.')[1] : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
        <div style={{ width: '300px' }}>
          <p>आपला नम्र,</p>
          <div style={{ marginTop: '40px' }}>
            <p>सही (अर्जदार/क)</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>ठिकाण: <Underline value={data?.branch?.split('-')[1]} minWidth="150px" /></p>
        <p>दिनांक: <Underline value={data?.sanctionDate} minWidth="150px" /></p>
      </div>

      <div style={{ marginTop: '15px', borderTop: '1px solid #000', paddingTop: '10px' }}>
        <p style={{ marginBottom: '5px', fontSize: '12px' }}>याद्वारे प्रमाणित करण्यात येते की मी/आम्ही वरील वस्तूंची तपासणी आणि पडताळणी केली असून त्या अस्सल आढळल्या आहेत. त्यांचे वजन, दर आणि किंमत वरीलप्रमाणे नमूद असून ती अचूक आहे.</p>
        <div style={{ lineHeight: 1.6, fontSize: '13px' }}>
          <p>१) आजचा बाजारभाव (प्रति १० ग्रॅम) रु. <Underline value={data?.currentRate || data?.ornaments?.[0]?.goldRate} minWidth="250px" /></p>
          <p>२) निव्वळ वजनानुसार बाजार मूल्य रु. <Underline value={data?.marketValue} minWidth="300px" /></p>
          <p>३) बँक निकषांनुसार (मार्जिन लक्षात घेऊन) बाजार मूल्य रु. <Underline value={data?.loanLimit} minWidth="250px" /></p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <div>
            <p>ठिकाण: <Underline value={data?.branch?.split('-')[1]} minWidth="120px" /></p>
            <p>दिनांक: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginTop: '20px', borderTop: '1px solid #000', paddingTop: '5px' }}>
              <p className="bold">स्वाक्षरी (अधिकृत सोनार)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 2 — स्वीकृती आणि मंजुरी
   ══════════════════════════════════════════════════════════════════════════ */
export const Page2MR = ({ data }) => (
  <div className="page marathi-font" style={{ padding: '10mm 15mm' }}>
    <div style={{ marginTop: '30px', lineHeight: 1.6 }}>
      <p style={{ borderBottom: '1px solid #000', paddingBottom: '5px', textAlign: 'justify' }}>मी / आम्ही सोनाराने वरीलप्रमाणे मूल्यांकन केलेल्या वस्तूंचे वजन, दर आणि किंमत स्वीकारली आहे. मी / आम्ही सदर वस्तू तारण ठेवण्याच्या उद्देशाने बँकेच्या ताब्यात दिल्या आहेत.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <div>
          <p>ठिकाण <Underline value={data?.branch?.split('-')[1]} minWidth="150px" /></p>
          <p>दिनांक: <Underline value={data?.sanctionDate} minWidth="150px" /></p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginTop: '30px', borderTop: '1px solid #000', paddingTop: '5px' }}>
            <p className="bold">स्वाक्षरी (अर्जदार)</p>
          </div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: '40px' }}>
      <h3 style={{ textDecoration: 'underline', fontWeight: 800 }}>स्वाक्षरी पडताळणी</h3>
      <p style={{ marginTop: '5px' }}>मूल्यमापकाची स्वाक्षरी मूल्यमापक करारानुसार बरोबर आहे.</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <p>दिनांक: <Underline minWidth="100px" /></p>
        <p className="bold">अधिकारी / सहाय्यक व्यवस्थापक</p>
        <p className="bold">व्यवस्थापक</p>
      </div>
    </div>

    <div style={{ marginTop: '40px', borderTop: '1px double #000', paddingTop: '15px', lineHeight: 1.8 }}>
      <p>
        अर्जदारास रु. <Underline value={data?.loanSanction} minWidth="150px" /> चे सुवर्ण कर्ज <Underline value={data?.tenure} minWidth="80px" /> महिन्यांच्या कालावधीसाठी <Underline value="14" minWidth="60px" /> % वार्षिक व्याजदराने वरील वस्तूंच्या तारणावर मंजूर करण्यात आले आहे.
      </p>
      <div style={{ display: 'flex', gap: '50px', marginTop: '10px' }}>
        <p>कर्जाचा प्रकार OD/TL कोड <Underline value={data?.scheme?.includes('OD') ? 'OD' : 'TL'} minWidth="150px" /></p>
        <p>EMI (TL असल्यास) रु. <Underline minWidth="150px" /></p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <p>दिनांक :- <Underline value={data?.sanctionDate} minWidth="120px" /></p>
        <p className="bold">व्यवस्थापक / सहाय्यक व्यवस्थापक</p>
      </div>
    </div>

    <div style={{ marginTop: '40px', borderTop: '2px solid #000', paddingTop: '15px' }}>
      <p>वरील वस्तू मोजल्या, पडताळून पाहिल्या आणि ताब्यात घेतल्या. पावती क्रमांक <Underline value={data?.goldBagNo} minWidth="250px" /></p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <p>दिनांक :- <Underline value={data?.sanctionDate} minWidth="120px" /></p>
        <p className="bold">अधिकारी / सहाय्यक व्यवस्थापक</p>
        <p className="bold">व्यवस्थापक</p>
      </div>
    </div>

    <div style={{ marginTop: '40px', borderTop: '2px solid #000', paddingTop: '15px', lineHeight: 1.6 }}>
      <p>
        श्री/श्रीमती <Underline value={data?.customerName} minWidth="500px" /> यांना सुवर्ण / चांदीच्या तारणावर नियमांनुसार रु. <Underline value={data?.loanSanction} minWidth="150px" /> चे कर्ज मंजूर करण्यात येत आहे.
      </p>
      <p style={{ marginTop: '5px' }}>माननीय संचालक मंडळाचा ठराव क्रमांक <Underline minWidth="150px" /> दिनांक <Underline minWidth="100px" /></p>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
        <p>दिनांक / /२०</p>
        <p className="bold">सहाय्यक व्यवस्थापक / व्यवस्थापक / AGM / GM</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 3 — वारस नोंद (Nomination)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page3MR = ({ data }) => (
  <div className="page marathi-font" style={{ padding: '10mm 15mm', fontSize: '14px' }}>
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '20px' }}>वारस नोंद (NOMINATION)</h2>
    </div>

    <p style={{ marginBottom: '15px', textAlign: 'justify' }}>बँकेच्या ताब्यात तारण असलेल्या सुवर्ण दागिन्यांच्या / वस्तूंच्या संदर्भात वारस नोंद.</p>

    <div style={{ lineHeight: 2.0, textAlign: 'justify' }}>
      <p>
        मी / आम्ही <Underline value={data?.customerName} minWidth="500px" /> नाव (नवे) आणि पत्ता (पत्ते) खालील व्यक्तींना नामनिर्देशित करत आहे, ज्यांना माझ्या / आमच्या मृत्यूनंतर बँकेच्या ताब्यात तारण असलेले सुवर्ण दागिने / वस्तू, ज्यांचा तपशील खाली दिला आहे, थकबाकीची पूर्ण रक्कम भरल्यानंतर बँकेद्वारे परत केली जाऊ शकते <Underline minWidth="200px" />
      </p>

      <div style={{ marginTop: '10px' }}>
        <p>वारसाचे नाव: श्री/श्रीमती <Underline minWidth="450px" /></p>
        <p>वय : <Underline minWidth="60px" /> जन्म तारीख : <Underline minWidth="130px" /> कर्जदाराशी नाते, असल्यास: <Underline minWidth="150px" /></p>
        <p>पत्ता (पिन कोडसह): <Underline minWidth="550px" /></p>
        <p>पिन: <Underline minWidth="80px" /> दूरध्वनी क्र. (STD कोडसह) <Underline minWidth="160px" /> मोबाईल क्र. <Underline minWidth="160px" /></p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p className="bold">* वारस आजच्या तारखेला अल्पवयीन असल्याने,</p>
        <p>मी / आम्ही <Underline minWidth="500px" /> यांची नियुक्ती करतो</p>
        <p><Underline minWidth="350px" /> (नाव आणि वय) माझ्या / आमच्या / अल्पवयीन वारसाच्या मृत्यूनंतर वारस अल्पवयीन असेपर्यंत बँकेच्या ताब्यात तारण असलेले दागिने / वस्तू स्वीकारण्यासाठी.</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p className="bold" style={{ textDecoration: 'underline' }}>अल्पवयीन वारसासाठी अनिवार्य:</p>
        <p>वारसाशी नाते: <Underline minWidth="500px" /></p>
        <p>पत्ता (पिन कोडसह): <Underline minWidth="500px" /></p>
        <p><Underline minWidth="650px" /></p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p className="bold" style={{ textDecoration: 'underline' }}>साक्षीदारांची नावे:</p>
        <p>१<Underline minWidth="350px" /> सही<Underline minWidth="200px" /></p>
        <p>पत्ता<Underline minWidth="600px" /></p>
        <p>२<Underline minWidth="350px" /> सही<Underline minWidth="200px" /></p>
        <p>पत्ता<Underline minWidth="600px" /></p>
      </div>

      <div style={{ marginTop: '15px', textAlign: 'justify' }}>
        <p>मी / आम्ही पुष्टी करतो की ही वारस नोंद माझ्या / आमच्या द्वारे केलेल्या इतर कोणत्याही तरतुदीवर वरचढ ठरेल, मग ती मृत्युपत्राद्वारे असो किंवा अन्य प्रकारे आणि वारस बँकेच्या सर्व थकबाकीच्या भरणाविरुद्ध इतर सर्व व्यक्तींना वगळून तारण असलेल्या सुवर्ण दागिन्यांच्या / वस्तूंच्या परताव्यासाठी पात्र ठरेल. मी / आम्ही अधिक पुष्टी करतो की अशा परताव्यावर बँक मुक्त आणि दोषमुक्त होईल.</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>ठिकाण<Underline value={data?.branch?.split('-')[1]} minWidth="200px" /></p>
        <p style={{ marginTop: '10px' }}>दिनांक <Underline value={data?.sanctionDate} minWidth="200px" /></p>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'right' }}>
        <p className="bold">अर्जदाराची सही / अंगठा</p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 4 — सुवर्ण कर्जाच्या अटी आणि शर्ती (१-१४)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page4MR = ({ data }) => (
  <div className="page marathi-font" style={{ padding: '12mm 15mm', fontSize: '13px' }}>
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '20px' }}>सुवर्ण कर्जाच्या अटी आणि शर्ती</h2>
    </div>

    <div style={{ textAlign: 'justify', lineHeight: 1.5 }}>
      <p style={{ marginBottom: '8px' }}>१. कर्ज मागणीनुसार कमाल <Underline value={data?.tenure} minWidth="60px" /> महिन्यांच्या कालावधीत किंवा नमूद केल्यानुसार कमी कालावधीत परत करणे आवश्यक आहे.</p>
      <p style={{ marginBottom: '8px' }}>२. बँकेकडे तारण ठेवलेले सुवर्ण दागिने / जवाहिर / नाणी कर्जदाराच्या जोखमीवर सामान्य तिजोरीत ठेवली जातील आणि बँक केवळ सुरक्षित ताब्यासाठी सामान्य काळजी घेईल. अपघातामुळे, अपरिहार्य परिस्थिती (force majeure), दैवी आपत्ती इत्यादीमुळे तारण वस्तूंना होणाऱ्या कोणत्याही नुकसानीसाठी बँक जबाबदार राहणार नाही.</p>
      <p style={{ marginBottom: '8px' }}>३. कर्जदार मान्य करतो की आजच्या तारखेला सुवर्ण कर्जासाठी बँकेने निश्चित केलेला प्रति ग्रॅम दर रु. <Underline value={data?.ornaments?.[0]?.goldRate} minWidth="100px" /> आहे आणि किमतीत घट झाल्यास, बँकेला १५ दिवसांच्या आत फरक (margin) भरून काढण्याची मागणी करण्याचा अधिकार असेल आणि जर कर्जदार फरक भरण्यास असमर्थ ठरला आणि मागणीनुसार कर्जाची परतफेड झाली नाही, तर खालील कलम ८ मधील तरतूद लागू होईल.</p>
      <p style={{ marginBottom: '8px' }}>४. कर्जावर <Underline value="14" minWidth="40px" /> % वार्षिक व्याज आकारले जाईल जे <span style={{ textDecoration: 'line-through' }}>मासिक /</span> त्रैमासिक विश्रांतीसह चक्रवाढ असेल, जे बँकेद्वारे वेळोवेळी सुधारित केलेल्या किंवा बँकेने ठरवलेल्या इतर दरांनुसार दैनंदिन थकबाकीवर मोजले जाईल.</p>
      <p style={{ marginBottom: '8px' }}>५. आनुषंगिक शुल्क, मूल्यमापकाचे शुल्क किंवा बँकेद्वारे वेळोवेळी निश्चित केलेले इतर शुल्क कर्जावर आकारले जाईल.</p>
      <p style={{ marginBottom: '8px' }}>६. कर्जदाराला समजले आहे की जर मागणी केल्यावर किंवा कर्जाचा कालावधी संपण्यापूर्वी खाते पूर्ण रक्कम भरून बंद केले नाही, तर खाते 'विशेष उल्लेख खाते' (SMA) आणि त्यानंतर रिझर्व्ह बँक ऑफ इंडियाच्या मार्गदर्शक तत्त्वांनुसार 'अनुत्पादक मालमत्ता' (NPA) म्हणून वर्गीकृत केले जाईल.</p>
      <p style={{ marginBottom: '8px' }}>७. जर कर्जदाराची इतर कर्जे, ओव्हरड्राफ्ट किंवा इतर देणी मुख्य कर्जदार, सह-बांधील, जामीनदार किंवा इतर कोणत्याही क्षमतेत बँकेकडे थकबाकी असतील, तर जोपर्यंत अशी देणी पूर्णपणे परत केली जात नाहीत, तोपर्यंत या कर्जांतर्गत तारण ठेवलेले दागिने / जवाहिर / नाणी अशा सर्व देण्यांसाठी तारण म्हणून मानले जातील आणि बँक ते तारण म्हणून राखून ठेवेल आणि विक्री इत्यादीबाबत तारण वस्तू म्हणून हाताळले जाईल.</p>
      <p style={{ marginBottom: '8px' }}>८. जर मागणी केल्यावर कर्जाची परतफेड झाली नाही, तर तारण दागिने / जवाहिर / नाणी जाहीर लिलावाद्वारे किंवा खाजगी वाटाघाटीद्वारे विकली जातील आणि कर्जदार कोणत्याही तुटीसाठी वैयक्तिकरित्या जबाबदार असेल. जर काही जास्तीची रक्कम उपलब्ध झाली, तर ती बँक कर्जदाराच्या इतर कोणत्याही कर्जाकडे, ओव्हरड्राफ्ट किंवा देण्याकडे (कर्जदार, जामीनदार किंवा इतर कोणत्याही क्षमतेत) वळती करेल. बँकेने केलेल्या अशा विक्रीला कर्जदार कोणत्याही प्रकारे आक्षेप घेणार नाही.</p>
      <p style={{ marginBottom: '8px' }}>९. कर्जदार पुढे सहमत आहे की बँकेला वसुलीच्या संदर्भात बँकेने केलेल्या कोणत्याही स्वरूपाचे सर्व खर्च वसूल करण्याचा विनाअट अधिकार असेल, ज्यामध्ये बँकेच्या वकिलांचे शुल्क आणि खर्च, मते मिळवणे, खटले (दिवाणी आणि फौजदारी दोन्ही), जे बँकेद्वारे किंवा बँकेविरुद्ध संबंधित कर्ज खात्याच्या संदर्भात सुरू केले गेले आहेत, यांचा समावेश आहे पण तेवढ्यापुरते मर्यादित नाही. कर्जदार याद्वारे बँकेला ते खर्च कर्ज खात्यातून डेबिट आणि वसूल करण्यासाठी अपरिवर्तनीय आणि बिनशर्त अधिकार आणि अधिकार देतो. कर्जदार असेही मान्य करतो की बँकेला या संदर्भात कोणत्याही देय रकमेसाठी वजावट (set off) किंवा धारणाधिकार (lien) ठेवण्याचा अमर्याद अधिकार असेल.</p>
      <p style={{ marginBottom: '8px' }}>१०. कर्जाच्या संदर्भात नोटीस रीतसर बजावलेली मानली जाईल, जर मागणीची नोटीस असलेले पत्र कर्जदाराला (अ) वैयक्तिकरित्या दिले गेले असेल किंवा (ब) दिलेल्या पत्त्यावर योग्य पत्त्यासह पोस्ट केले गेले असेल किंवा पत्त्यात बदल झाल्याचे बँकेला कळवले असल्यास अशा पत्त्यावर किंवा (क) बँकेकडे नोंदणीकृत कर्जदाराच्या ई-मेल आयडीवर पाठवले गेले असेल किंवा (ड) कायद्याने मान्यता दिलेल्या इतर कोणत्याही मार्गाने पाठवले गेले असेल.</p>
      <p style={{ marginBottom: '8px' }}>११. जेव्हा कर्ज बंद केले जाते आणि दागिने / जवाहिर / नाणी सोडवून घेतली जातात, तेव्हा तारण फॉर्मवर कर्जदाराने स्वाक्षरी करून पावती देणे आवश्यक आहे.</p>
      <p style={{ marginBottom: '8px' }}>१२. बँकेला तारण ठेवलेल्या सुवर्ण दागिन्यांची / जवाहिरची / नाण्यांची तपासणी करण्याचा अधिकार असेल, जो बँकेचे अंतर्गत / बाह्य निरीक्षक / लेखापरीक्षक / नियामक किंवा इतर कोणत्याही अधिकृत प्रतिनिधीद्वारे कर्जाच्या कालावधीत किंवा अन्यथा कर्जदाराला पूर्वसूचना न देता कधीही केला जाऊ शकतो.</p>
      <p style={{ marginBottom: '8px' }}>१३. जर कर्ज तारण ठेवल्याच्या तारखेपासून <Underline value={data?.tenure} minWidth="60px" /> महिन्यांच्या आत किंवा प्रत्यक्ष मंजूर कालावधीत (जे आधी असेल) बंद केले नाही, तर २ % वार्षिक दराने दंडात्मक शुल्क आकारले जाईल.</p>
      <p style={{ marginBottom: '8px' }}>१४. बँकेला <Underline value={data?.tenure} minWidth="40px" /> महिने संपण्यापूर्वी किंवा कर्जाचा कालावधी संपण्यापूर्वी कधीही कर्ज परत मागण्याचा (recall) अधिकार असेल, जर बँकेला असे वाटले की बँकेचे हित धोक्यात आहे आणि या संदर्भातील बँकेचा निर्णय कर्जदारावर अंतिम आणि बंधनकारक असेल.</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 5 — अटी आणि शर्ती (१५-१७) आणि स्वाक्षरी
   ══════════════════════════════════════════════════════════════════════════ */
export const Page5MR = ({ data }) => (
  <div className="page marathi-font" style={{ padding: '15mm 20mm', fontSize: '14px' }}>
    <div style={{ textAlign: 'justify', lineHeight: 1.6 }}>
      <p style={{ marginBottom: '12px' }}>१५. बँकेला क्रेडिट इन्फॉर्मेशन कंपन्यांकडे किंवा रिझर्व्ह बँकेने मंजूर केलेल्या इतर कोणत्याही संस्थेकडे माहिती उघड करण्याचा अधिकार असेल.</p>
      <p style={{ marginBottom: '12px' }}>१६. बँक या अटी / नियमांपैकी कोणत्याही अटीमध्ये बदल करण्याचा, जोडण्याचा किंवा काढून टाकण्याचा अधिकार राखून ठेवते. या उद्देशासाठी, बँकेला प्रत्येक कर्जदाराला स्वतंत्र नोटीस देण्याची आवश्यकता नसेल आणि बँकेच्या सूचना फलकावर प्रदर्शित केलेले अटी / नियमांमधील कोणतेही बदल सर्व संबंधित व्यक्तींसाठी पुरेशी नोटीस मानले जातील.</p>
      <p style={{ marginBottom: '12px' }}>१७. बँकेला अधिक चौकशीशिवाय मूल्यमापकाने दिलेल्या दागिन्यांचे वर्णन, स्थिती, गुणवत्ता किंवा स्वरूपाचा तपशील अचूक म्हणून स्वीकारण्याचा अधिकार असेल. कर्जदाराला अशा तपशिलांच्या अचूकतेला आव्हान देण्याचा किंवा बँकेच्या ताब्यात असलेले दागिने / जवाहिर / नाणी ही कर्जदाराने तारण ठेवलेल्या वस्तूंनुसार नसल्याचा आक्षेप घेण्याचा अधिकार नसेल. बँक काळजी किंवा तत्परतेच्या अभावासाठी कोणत्याही प्रकारे जबाबदार राहणार नाही. तारण ठेवलेल्या दागिन्यांचे / जवाहिरचे / नाण्यांचे कोणतेही नुकसान, नाश किंवा बिघाड जो बँकेच्या ताब्यात असताना किंवा त्यानंतर कोणत्याही कारणामुळे झाला असेल, त्यास बँक कोणत्याही प्रकारे जबाबदार राहणार नाही आणि असे सर्व नुकसान, नाश किंवा बिघाड पूर्णपणे कर्जदाराच्या खाती असेल. चोरी किंवा पिलफेरेजमुळे किंवा अन्यथा होणाऱ्या कोणत्याही तुटीसाठी देखील बँक जबाबदार राहणार नाही, जरी दागिने बँकेच्या ताब्यात किंवा नियंत्रणाखाली असले तरीही.</p>

      <p style={{ marginTop: '40px', fontWeight: 600, fontSize: '15px' }}>वरील सर्व अटी आणि शर्ती मला / आम्हाला समजावून सांगण्यात आल्या आहेत आणि त्या मला / आम्हाला मान्य आहेत.</p>

      <div style={{ marginTop: '70px', textAlign: 'right' }}>
        <div style={{ display: 'inline-block', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '250px', paddingTop: '10px' }}>
            <p className="bold" style={{ fontSize: '14px' }}>कर्जदाराची / तारणदाराची स्वाक्षरी</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 6 — वचनचिठ्ठी (Promissory Note)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page6MR = ({ data }) => (
  <div className="page marathi-font" style={{ padding: '20mm 20mm', fontSize: '15px' }}>
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '24px' }}>वचनचिठ्ठी (PROMISSORY NOTE)</h2>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '30px' }}>
      <p>ठिकाण : <Underline value={data?.branch?.split('-')[1]} minWidth="150px" /></p>
      <p style={{ marginTop: '10px' }}>दिनांक : <Underline value={data?.sanctionDate} minWidth="150px" /></p>
    </div>

    <div style={{ marginBottom: '25px', fontSize: '16px' }}>
      <p className="bold">रु. <Underline value={data?.loanSanction} minWidth="150px" /> /-</p>
      <p style={{ marginTop: '10px' }}>(रु. <Underline value={data?.loanSanctionWords} minWidth="500px" /> फक्त)</p>
    </div>

    <div style={{ marginTop: '30px', lineHeight: 1.8 }}>
      <p className="extra-bold" style={{ fontSize: '18px', textDecoration: 'underline', marginBottom: '10px' }}>मागणीनुसार मी / आम्ही</p>
      <div style={{ marginLeft: '25px' }}>
        <p>१. श्री/श्रीमती <Underline value={data?.customerName} minWidth="500px" /></p>
        <p style={{ marginLeft: '35px' }}>पत्ता <Underline value={data?.address} minWidth="500px" /></p>

        <p style={{ marginTop: '10px' }}>२. श्री/श्रीमती <Underline minWidth="500px" /></p>
        <p style={{ marginLeft: '35px' }}>पत्ता <Underline minWidth="500px" /></p>

        <p style={{ marginTop: '10px' }}>३. श्री/श्रीमती <Underline minWidth="500px" /></p>
        <p style={{ marginLeft: '35px' }}>पत्ता <Underline minWidth="500px" /></p>
      </div>
    </div>

    <div style={{ marginTop: '50px', textAlign: 'justify', lineHeight: 1.6, fontSize: '16px' }}>
      <p>
        याद्वारे <span className="bold">संयुक्तपणे आणि वैयक्तिकरित्या वचन देतो</span> की “पुणे पीपल्स को-ऑपरेटिव्ह बँक लि.” किंवा त्यांच्या आदेशानुसार रु. <Underline value={data?.loanSanction} minWidth="150px" /> /- (रुपये <Underline value={data?.loanSanctionWords} minWidth="450px" /> फक्त) मिळालेल्या मूल्यासाठी, <Underline value="14" minWidth="60px" /> % वार्षिक दराने मासिक चक्रवाढ व्याजासह अदा करीन / करू.
      </p>
    </div>

    <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ borderTop: '1px solid #000', width: '250px', paddingTop: '10px' }}>
          <p className="bold">कर्जदाराची (र) स्वाक्षरी</p>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 7 — धारणाधिकार आणि वजावट पत्र (Letter of Lien and Set-off)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page7MR = ({ data, clientInfo }) => (
  <div className="page marathi-font" style={{ fontSize: '15px' }}>
    <HeaderMR clientInfo={clientInfo} />
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '22px' }}>धारणाधिकार आणि वजावट पत्र (LETTER OF LIEN AND SET-OFF)</h2>
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
      <p>दिनांक : <Underline value={data?.sanctionDate} minWidth="120px" /></p>
    </div>

    <div style={{ marginBottom: '20px', lineHeight: 1.6 }}>
      <p>व्यवस्थापक,</p>
      <p className="bold">{clientInfo?.name || "पुणे पीपल्स को-ऑपरेटिव्ह बँक लि.,"}</p>
      <p>शाखा <Underline value={data?.branch} minWidth="200px" /></p>
    </div>

    <div style={{ marginBottom: '15px' }}>
      <p style={{ fontWeight: 700, fontSize: '16px' }}>महोदय,</p>
      <p style={{ marginTop: '10px', textIndent: '30px', lineHeight: 1.6 }}>
        आपल्या बँकेने मला/आम्हाला वेळोवेळी कर्ज / ओव्हरड्राफ्ट / कॅश क्रेडिटच्या माध्यमातून कर्ज सुविधा / निवास आणि सुविधा देण्याचे मान्य केल्याच्या बदल्यात, मी / आम्ही बँकेशी खालीलप्रमाणे सहमत आहोत :-
      </p>
    </div>

    <div style={{ textAlign: 'justify', lineHeight: 1.6, fontSize: '14px' }}>
      <p style={{ marginBottom: '15px' }}>
        १. बँक माझ्या/आमच्या मालकीच्या सर्व सुरक्षा (ज्या आता तुमच्या ताब्यात असतील किंवा कोणत्याही वेळी बँकेच्या ताब्यात येतील) केवळ त्यावर दिलेल्या विशिष्ट आगाऊ रकमेसाठीच नव्हे तर माझ्याकडून/आमच्याकडून बँकेला येणे असलेल्या इतर कोणत्याही रकमेसाठी (स्वतंत्रपणे किंवा इतरांसह संयुक्तपणे) संपार्श्विक सुरक्षा (collateral security) म्हणून धारण करू शकते.
      </p>
      <p style={{ marginBottom: '15px' }}>
        २. बँकर म्हणून कायद्याने तुम्हाला मिळणाऱ्या कोणत्याही सामान्य धारणाधिकार (lien) किंवा तत्सम अधिकाराव्यतिरिक्त, मी/आम्ही बँकेला कोणत्याही वेळी आणि मला/आम्हाला नोटीस न देता माझे/आमचे सर्व किंवा कोणतेही खाते आणि दायित्वे एकत्र किंवा संकलित करण्याचा आणि अशा कोणत्याही एक किंवा अधिक खात्यांमधील जमा रक्कम माझ्या/आमच्या बँकेच्या कोणत्याही दायित्वाच्या पूर्ततेसाठी वजावट (set off) करण्याचा किंवा हस्तांतरित करण्याचा विनाअट अधिकार देतो, मग अशी दायित्वे प्रत्यक्ष किंवा आकस्मिक, प्राथमिक किंवा संपार्श्विक आणि स्वतंत्र किंवा संयुक्त असोत.
      </p>
      <p style={{ marginBottom: '15px' }}>
        ३. मी/आम्ही बँकेला पुढे अधिकृत करतो की जर कोणत्याही सुरक्षिततेच्या विक्रीतून मिळालेल्या रकमेतून काही शिल्लक बँकेच्या हातात राहिली, तर बँक आपल्या विवेकबुद्धीनुसार ती शिल्लक माझ्याकडून/आमच्याकडून बँकेला देय असलेल्या इतर कोणत्याही रकमेकडे किंवा व्यवहाराकडे वळवू शकते आणि सर्व दावे मिटवल्यानंतर उरलेली शिल्लक मला/आम्हाला परत केली जाईल.
      </p>
    </div>

    <p style={{ marginTop: '30px', fontWeight: 600 }}>बँकेच्या बाजूने अंमलात आणलेल्या इतर कोणत्याही दस्तऐवजात काहीही असले तरी, येथे समाविष्ट असलेल्या अटी आणि शर्ती लागू राहतील.</p>

    <p style={{ marginTop: '20px' }}>आज दिनांक <Underline value={new Date().getDate()} minWidth="50px" /> महिना <Underline value={new Intl.DateTimeFormat('mr-IN', { month: 'long' }).format(new Date())} minWidth="150px" /> रोजी.</p>

    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
      <div style={{ width: '300px', lineHeight: 2.5 }}>
        <p className="bold">आपला विश्वासू,</p>
        <p>१. <Underline minWidth="250px" /></p>
        <p>२. <Underline minWidth="250px" /></p>
        <p>३. <Underline minWidth="250px" /></p>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 8 — तारण पत्र (Letter of Pledge)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page8MR = ({ data, clientInfo }) => (
  <div className="page marathi-font" style={{ fontSize: '13px' }}>
    <HeaderMR clientInfo={clientInfo} />
    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
      <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '20px' }}>तारण पत्र (LETTER OF PLEDGE)</h2>
    </div>

    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
      <p>दिनांक: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
    </div>

    <div style={{ marginBottom: '10px', lineHeight: 1.4 }}>
      <p>व्यवस्थापक,</p>
      <p className="bold">{clientInfo?.name || "पुणे पीपल्स को-ऑपरेटिव्ह बँक लि.,"}</p>
      <p>शाखा <Underline value={data?.branch} minWidth="200px" /></p>
    </div>

    <p style={{ fontWeight: 700, fontSize: '14px' }}>महोदय / महोदया,</p>

    <div style={{ marginTop: '8px', lineHeight: 1.5 }}>
      <p>
        मी/आम्ही <Underline value={data?.customerName} minWidth="400px" /> वय:- <Underline value={data?.age} minWidth="50px" /> वर्षे, व्यवसाय:- <Underline minWidth="150px" /> राहणार:- <Underline value={data?.address} minWidth="450px" />
      </p>
      <p style={{ marginTop: '5px', fontWeight: 700, fontSize: '14px' }}>खालीलप्रमाणे घोषित करतो/करतो-</p>
      <div style={{ textAlign: 'justify', fontSize: '12px', lineHeight: 1.5 }}>
        <p style={{ marginBottom: '6px' }}>१. मी / आम्ही आपल्या बँकेकडून <Underline minWidth="200px" /> च्या प्रयोजनासाठी माझ्या अर्जात नमूद केलेल्या सुवर्ण / चांदीच्या वस्तूंच्या तारणावर, ज्याचा मी / आम्ही बिनशर्त मालक आहे / आहोत, रु. <Underline value={data?.loanSanction} minWidth="150px" /> /- (अक्षरी रुपये <Underline value={data?.loanSanctionWords} minWidth="400px" />) चे कर्ज घेतले आहे. मी / आम्ही सदर रकमेसाठी वचनचिठ्ठी, धारणाधिकार आणि वजावट पत्र देखील सादर केले आहे. मी बँकेच्या नियमांनुसार सदर रकमेवर <Underline value="14" minWidth="60px" /> % वार्षिक दराने मासिक व्याजासह व्याज अदा करीन. मी / आम्ही सदर कर्जाची रक्कम व्याजासह आजपासून <Underline value={data?.tenure} minWidth="50px" /> महिन्यांच्या आत किंवा त्यापूर्वी परत करीन. मला सोनाराने वरील वस्तूंसाठी मोजलेले वजन, दर आणि किंमत मान्य आहे. मी दरमहा व्याज भरण्यास तयार आहे.</p>
        <p style={{ marginBottom: '6px' }}>२. मी/आम्ही बँकेचा सभासद आहे आणि मी/आम्ही बँकेचे उपविधी (bylaws) आणि या व्यवहारासंबंधीचे सर्व नियम आणि कायदे वाचले आणि समजले आहेत. ते माझ्यावर/आमच्यावर बंधनकारक आहेत आणि मी/आम्ही त्यानुसार व्यवहार करण्यास सहमत आहोत.</p>
        <p style={{ marginBottom: '6px' }}>३. जर सुवर्ण आणि चांदीच्या वस्तूंची किंमत बाजारभावामुळे किंवा इतर कोणत्याही कारणामुळे कमी झाली, तर मी/आम्ही फरकाची रक्कम बँकेत सूचनेनंतर २४ तासांच्या आत भरण्यास सहमत आहोत. जर मी/आम्ही तसे करण्यास अपयशी ठरलो, तर मी/आम्ही बँकेला सुवर्ण आणि चांदीच्या वस्तू विकण्यासाठी आणि ती रक्कम माझ्या/आमच्या कर्ज खात्यात जमा करण्यासाठी अधिकृत करतो.</p>
        <p style={{ marginBottom: '6px' }}>४. जर सदर कर्जाची रक्कम व्याजासह विहित कालावधीत परत केली नाही, तर मी/आम्ही बँकेला वरील वस्तू बाजारभावाने विकण्यासाठी आणि रक्कम वसूल करण्यासाठी अधिकृत करतो; त्यास माझा/आमचा कोणताही आक्षेप नसेल. जर तरीही थकबाकी शिल्लक राहिली, तर मी/आम्ही ती उर्वरित रक्कम वैयक्तिकरित्या किंवा माझ्या/आमच्या इतर जंगम आणि स्थावर मालमत्तेची विक्री करून परत करीन.</p>
        <p style={{ marginBottom: '6px' }}>५. मी / आम्ही वरील सुवर्ण / चांदीच्या वस्तूंचे वैयक्तिकरित्या / संयुक्तपणे मालक आहोत. जर त्यावर इतर कोणत्याही पक्षाचा अधिकार किंवा रस निर्माण झाला किंवा या वस्तू चोरीच्या किंवा बनावट आढळल्या, तर मी/आम्ही माझ्या/आमच्या जंगम आणि स्थावर मालमत्तेतून बँकेच्या कोणत्याही नुकसानीची भरपाई करीन तसेच माझे वारस देखील त्यासाठी जबाबदार असतील.</p>
        <p style={{ marginBottom: '6px' }}>६. मी/आम्ही माझ्या/आमच्या मृत्यूनंतर हे खाते बंद होण्यापूर्वी वस्तूंचा ताबा मिळवण्यासाठी खालील व्यक्तीला वारस म्हणून नियुक्त करतो: श्री/श्रीमती <Underline minWidth="350px" /> व्यवसाय : <Underline minWidth="150px" /> वय <Underline minWidth="80px" /> पत्ता <Underline minWidth="550px" />.</p>
        <p>७. मला सुवर्ण नियंत्रण कायद्याच्या तरतुदींची माहिती आहे. जर हा व्यवहार त्या तरतुदींनुसार अनियमित ठरला, तर त्यासाठी मी पूर्णपणे जबाबदार असेन. या अनियमिततेमुळे होणाऱ्या नुकसानीसाठी मी/माझे वारस पूर्णपणे जबाबदार असतील.</p>
      </div>
    </div>

    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ lineHeight: 1.6 }}>
        <p className="bold">आपला विश्वासू,</p>
        <p>दिनांक: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
        <p>ठिकाण : पुणे</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <div style={{ borderTop: '1px solid #000', paddingTop: '5px', width: '250px' }}>
          <p className="bold">स्वाक्षरी (कर्जदार)</p>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 9 — कर्ज वापराचे पत्र आणि कायमस्वरूपी सूचना (End Use & Standing Instruction)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page9MR = ({ data, clientInfo }) => (
  <div className="page marathi-font" style={{ padding: '15mm 20mm', fontSize: '15px' }}>
    <div style={{ borderBottom: '2.5px solid #000', paddingBottom: '20px', marginBottom: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '22px' }}>कर्ज वापराचे पत्र (END USE LETTER)</h2>
      </div>
      <div style={{ lineHeight: 1.8 }}>
        <p>प्रति ,</p>
        <p className="bold">शाखाधिकारी ,</p>
        <p className="bold">{clientInfo?.name || "पुणे पीपल्स को-ऑपरेटिव्ह बँक लि., पुणे"}</p>
        <p>शाखा: <Underline value={data?.branch} minWidth="200px" /></p>

        <p style={{ marginTop: '15px', fontWeight: 600 }}>महोदय ,</p>
        <p style={{ textIndent: '40px', textAlign: 'justify' }}>
          मी श्री. / सौ. <Underline value={data?.customerName} minWidth="500px" /> आपल्या बँकेतून सुवर्ण कर्ज रक्कम रु. <Underline value={data?.loanSanction} minWidth="150px" /> घेतले आहे. सदर कर्जाचा वापर मी / आम्ही <Underline minWidth="300px" /> साठी स्वतः करणार आहे याची मी आपणास हमी देतो . तरी सदर कर्जाची रक्कम माझ्या बचत खात्यात जमा करावी हि विनंती.
        </p>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p>दिनांक : <Underline value={data?.sanctionDate} minWidth="120px" /></p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '5px' }}>
              <p className="bold">सही</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style={{ marginTop: '10px' }}>
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '22px' }}>कायमस्वरूपी सूचना (STANDING INSTRUCTION)</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '400px' }}>
          <p className="bold">कडून: <Underline value={data?.customerName} minWidth="300px" /></p>
          <p><Underline value={data?.address} minWidth="350px" /></p>
        </div>
        <div>
          <p>दिनांक: <Underline value={data?.sanctionDate} minWidth="120px" /></p>
        </div>
      </div>

      <div style={{ lineHeight: 1.6 }}>
        <p className="bold">प्रति,</p>
        <p className="bold">शाखा व्यवस्थापक</p>
        <p className="bold">{clientInfo?.name || "पुणे पीपल्स को-ऑपरेटिव्ह बँक लि., पुणे"}</p>
        <p>शाखा: <Underline value={data?.branch} minWidth="250px" /></p>
      </div>

      <div style={{ margin: '15px 0' }}>
        <p className="bold" style={{ fontSize: '17px' }}>विषय: कर्ज हप्ता भरण्याबाबत कायमस्वरूपी सूचना</p>
      </div>

      <div style={{ lineHeight: 1.8 }}>
        <p>महोदय / महोदया,</p>
        <p>संदर्भ: कर्ज खाते क्र. <Underline minWidth="350px" /></p>
        <p>उपरोक्त संदर्भास अनुसरून, मी श्री/श्रीमती <Underline value={data?.customerName} minWidth="450px" /></p>
        <p>यांनी दिनांक <Underline value={data?.sanctionDate} minWidth="150px" /> रोजी रु. <Underline value={data?.loanSanction} minWidth="200px" /> चे कर्ज घेतले आहे.</p>
        <p style={{ textAlign: 'justify' }}>
          या संदर्भात, मी याद्वारे आपणास अधिकृत करतो की माझ्या बचत / चालू खाते क्र. <Underline value={data?.sbAcNo} minWidth="300px" /> मधून दरमहा रु. <Underline minWidth="150px" /> चा कर्ज हप्ता डेबिट करून माझ्या वरील कर्ज खात्यात दरमहा <Underline minWidth="100px" /> तारखेला जमा करावा.
        </p>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p>धन्यवाद</p>
            <p>आपला विश्वासू</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '5px' }}>
              <p className="bold">सही</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   PAGE 10 — घोषणापत्र (Declaration)
   ══════════════════════════════════════════════════════════════════════════ */
export const Page10MR = ({ data }) => (
  <div className="page marathi-font" style={{ padding: '20mm 20mm', fontSize: '15px' }}>
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <h2 style={{ textDecoration: 'underline', fontWeight: 800, fontSize: '24px' }}>घोषणापत्र (DECLARATION)</h2>
    </div>
    <p style={{ textAlign: 'center', fontSize: '13px', marginBottom: '30px', fontStyle: 'italic' }}>
      (जर स्वाक्षरी करणारा इंग्रजी व्यतिरिक्त इतर भाषेत स्वाक्षरी करत असेल / निरक्षर असेल तर मिळवण्यासाठी)
    </p>

    <div style={{ lineHeight: 1.8, textAlign: 'justify', fontSize: '16px' }}>
      <p>
        या दस्तऐवजातील मजकूर <span className="bold">श्री / श्रीमती <Underline value={data?.customerName} minWidth="450px" /></span> यांना <Underline minWidth="180px" /> भाषेत वाचून दाखवण्यात आला आहे, जी त्यांना माहित असलेली भाषा आहे, आणि त्यांना तो समजला असून त्यांनी या दस्तऐवजावर प्रादेशिक भाषेत आपला अंगठा / स्वाक्षरी केली आहे.
      </p>

      <div style={{ marginTop: '40px', lineHeight: 1.6 }}>
        <p>साक्षीदाराचे नाव: <Underline minWidth="450px" /></p>
        <p>साक्षीदाराचा पत्ता: <Underline minWidth="450px" /></p>
        <p>साक्षीदाराची स्वाक्षरी: ____________________</p>
        <p>साक्षीदाराशी नाते: <Underline minWidth="450px" /></p>
        <p>साक्षीदाराचा संपर्क क्रमांक: <Underline minWidth="450px" /></p>
      </div>

      <div style={{ marginTop: '80px', textAlign: 'right' }}>
        <div style={{ display: 'inline-block', textAlign: 'center' }}>
          <div style={{ borderTop: '1px solid #000', width: '350px', paddingTop: '10px' }}>
            <p className="bold">ग्राहकाची स्वाक्षरी / अंगठा</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
