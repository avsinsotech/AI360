import React from 'react';
import PersonBlock from './PersonBlock';

export default function Step4({ data, setData, errors, lang }) {
  return <PersonBlock prefix="g2" data={data} setData={setData} title={lang === 'en' ? 'Guarantor No. 2' : 'जामीनदार क्रमांक २'} errors={errors} lang={lang} />;
}
