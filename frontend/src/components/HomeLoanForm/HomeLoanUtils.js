// ─── Marathi number to words ───────────────────────────────────────────────
export const ones = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
  'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस', 'वीस',
  'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस',
  'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस', 'चाळीस',
  'एकेचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'सेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास',
  'एकावन्न', 'बावन्न', 'त्रेपन्न', 'चोपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ',
  'एकसष्ट', 'बासष्ट', 'त्रेसष्ट', 'चौसष्ट', 'पासष्ट', 'सहासष्ट', 'सदुसष्ट', 'अडुसष्ट', 'एकोणसत्तर', 'सत्तर',
  'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी',
  'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद',
  'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्याण्णव'];

export function numberToWords(n) {
  if (!n || isNaN(n)) return '';
  n = parseInt(n);
  if (n === 0) return 'शून्य';
  
  const convert = (num) => {
    let res = '';
    if (num >= 10000000) { res += convert(Math.floor(num / 10000000)) + ' कोटी '; num %= 10000000; }
    if (num >= 100000) { res += convert(Math.floor(num / 100000)) + ' लाख '; num %= 100000; }
    if (num >= 1000) { res += convert(Math.floor(num / 1000)) + ' हजार '; num %= 1000; }
    if (num >= 100) { res += ones[Math.floor(num / 100)] + 'शे '; num %= 100; }
    if (num > 0) res += ones[num] + ' ';
    return res.trim();
  };
  
  return convert(n) + ' रुपये फक्त';
}

export function numberToWordsEn(n) {
  if (!n || isNaN(n)) return '';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const g = ['', 'Thousand', 'Lakh', 'Crore'];
  const makeGroup = (num) => {
    let s = '';
    if (num >= 100) { s += a[Math.floor(num / 100)] + 'Hundred '; num %= 100; }
    if (num >= 20) { s += b[Math.floor(num / 10)] + ' ' + a[num % 10]; }
    else { s += a[num]; }
    return s;
  };
  let num = parseInt(n);
  if (num === 0) return 'Zero';
  let k = 0;
  let res = '';
  // Crore
  if (num >= 10000000) { res += makeGroup(Math.floor(num / 10000000)) + 'Crore '; num %= 10000000; }
  // Lakh
  if (num >= 100000) { res += makeGroup(Math.floor(num / 100000)) + 'Lakh '; num %= 100000; }
  // Thousand
  if (num >= 1000) { res += makeGroup(Math.floor(num / 1000)) + 'Thousand '; num %= 1000; }
  // Hundred + Tens
  res += makeGroup(num);
  return res.trim() + ' Rupees Only';
}

