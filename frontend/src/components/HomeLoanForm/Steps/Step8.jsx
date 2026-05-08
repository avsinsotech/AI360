import React from 'react';
import { T, tb } from '../HomeLoanTranslations';

export default function Step8({ data, handlePrint, handleSubmit, lang = "mr", isSubmitting = false }) {
  const rv = T.review;

  const propLabel = data.propertyType === 'resale'
    ? rv.resale[lang]
    : rv.construction[lang];

  const reviewSections = [
    {
      title: rv.loanRequest?.[lang],
      items: [
        [rv.name?.[lang], data.arjdarNaav],
        [rv.age?.[lang], data.arjdarVay],
        [rv.coApplicant?.[lang], data.saharjdarNaav],
        [rv.loanAmt?.[lang], data.karjRakkam],
        [rv.period?.[lang], data.paratfedKalavadhi ? `${data.paratfedKalavadhi} ${rv.months?.[lang]}` : ''],
        [rv.purpose?.[lang], data.karan],
      ]
    },
    {
      title: rv.applicant?.[lang],
      items: [
        [rv.name?.[lang], data.bNaav],
        [rv.age?.[lang], data.bVay],
        [rv.mobile?.[lang], data.bMobile],
        [rv.salary?.[lang], data.bMonthlyVetan],
        [rv.company?.[lang], data.bCompany],
      ]
    },
    {
      title: rv.guarantors?.[lang] || (lang === 'mr' ? 'जामीनदार' : 'Guarantors'),
      items: [
        [(rv.name?.[lang] || 'Name') + " 1", data.jameen1Naav],
        [(rv.name?.[lang] || 'Name') + " 2", data.jameen2Naav],
        [(rv.name?.[lang] || 'Name') + " 3", data.jameen3Naav],
      ]
    },
    {
      title: rv.property?.[lang],
      items: [
        [rv.propType?.[lang], propLabel],
        [rv.seller?.[lang], data.vikretaNaav],
        [rv.district?.[lang], data.jilha],
        [rv.price?.[lang], data.ekunKharedi],
      ]
    },
  ];

  return (
    <div className="hl-review-page" style={{ textAlign: 'center', padding: '40px 20px', minHeight: '300px' }}>
      <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
        {lang === 'en'
          ? 'Review all details before printing and submitting.'
          : 'प्रिंट करण्यापूर्वी आणि सबमिट करण्यापूर्वी सर्व तपशील तपासा.'}
      </p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Preview Button */}
        <button
          onClick={() => handlePrint(false)}
          disabled={isSubmitting}
          style={{
            background: '#0a1c5a',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          {lang === 'en' ? 'Preview' : 'पूर्वदृश्य'}
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            background: '#22c55e',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            fontSize: '15px',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? (
            <span>{lang === 'en' ? 'Submitting...' : 'पाठवत आहे...'}</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {lang === 'en' ? 'Submit Final Application' : 'अंतिम अर्ज सादर करा'}
            </>
          )}
        </button>
      </div>
    </div>
  );

}