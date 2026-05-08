import React from 'react';
import PersonBlock from './PersonBlock';

export default function Step3({ data, setData, errors, lang }) {
  return <PersonBlock prefix="g1" data={data} setData={setData} title={lang === 'en' ? 'Guarantor No. 1' : 'जामीनदार क्रमांक १'} errors={errors} lang={lang} />;
}
