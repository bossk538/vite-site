import React, { useState, useEffect } from 'react';
import type { HexColor } from './types';
import './style.css';

type ColorMapProps = {
  colorMap: HexColor[];
  handleUpdate: any;
};

export const ColorMap = ({ colorMap, handleUpdate, state, dispatch }) => {
  const [draft, setDraft] = useState<HexColor[]>([...colorMap]);

  useEffect(() => {
    setDraft(colorMap);
  }, [colorMap]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number): void => {
    const newColorMap = [...draft];
    newColorMap[idx] = e.target.value;
    setDraft(newColorMap);
  };

  const handleColorSelection = (idx) => {
    dispatch({ type: 'selectedColor', payload: idx });
  };

  return (<div className="ColorMap">
    { draft.map((color, idx) => (<input key={idx} type="color" className={state.selectedColor === idx ? 'selected' : null } value={color} onChange={e => handleColorChange(e, idx)} onClick={() => handleColorSelection(idx)} />)) }
    <button type="button" onClick={() => handleUpdate(draft)}>Update</button>
  </div>);
};
