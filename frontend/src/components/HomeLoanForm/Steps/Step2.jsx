import React from 'react';
import PersonBlock from './PersonBlock';

export default function Step2({ data, setData, errors, lang }) {
  return <PersonBlock prefix="b" data={data} setData={setData} title={lang === 'en' ? 'Applicant' : 'कर्जदार'} errors={errors} lang={lang} />;
}


