import React, { useState, useEffect } from 'react';
import type { HexColor } from './types';
import './style.css';

type ColorMapProps = {
  colorMap: HexColor[];
  handleUpdate: any;
};

export const ColorMap = ({ colorMap, handleUpdate }) => {
  const [draft, setDraft] = useState([...colorMap]);

  useEffect(() => {
    setDraft(colorMap);
  }, [colorMap]);

  const handleColorChange = (e, idx) => {
    const newColorMap = [...draft];
    newColorMap[idx] = e.target.value;
    setDraft(newColorMap);
  };

  return (<div className="ColorMap">
    { draft.map((color, idx) => (<input key={idx} type="color" value={color} onChange={e => handleColorChange(e, idx)} />)) }
    <button type="button" onClick={() => handleUpdate(draft)}>Update</button>
  </div>);
};
