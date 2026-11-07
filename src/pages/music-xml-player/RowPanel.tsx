import React, { useState } from 'react';
import { foo } from './utils';
import { Row } from './row';
import './style.css';

export const RowPanel = ({ generate }) => {
  const [row, setRow] = useState(new Row());
  const [program, setProgram] = useState('');
  const handleGenerate = () => {
    const xmlData = foo(row.clone(), program);
    generate(xmlData);
  };
  return (<div className="RowPanel"><form>
    <ul>
      <li><h2>Create Row</h2></li>
      <li><p>some random text</p></li>
      <li><input type="text" value={program} onChange={e => setProgram(e.target.value)} /></li>
      <li><button type="button" onClick={() => setRow(new Row())}>New Row</button></li>
      <li><button type="button" onClick={handleGenerate}>Generate</button></li>
    </ul>
  </form></div>);
};
