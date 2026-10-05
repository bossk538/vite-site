import React, { useState, useId } from 'react';
import './Accordion.css';

const Header = ({ label, toggle, open, idBase }) => {
  return (<h3>
    <button type="button"
            onClick={toggle}
            aria-expanded={open ? 'true' : 'false'}
            className="accordion-trigger"
            aria-controls="sect1"
            id={`${idBase}-accordion1id`}>
      <span className="accordion-label">
        { label }
        <span className="accordion-icon"></span>
      </span>
    </button>
  </h3>);
};

export const Accordion = ({ accordion }) => {
  const idBase = useId();
  const [active, setActive] = useState(0);
  const toggle = (idx) => {
    if (idx === active) {
      setActive(-1);
    } else {
      setActive(idx);
    }
  };
  return (
    <div id={`${idBase}-accordionGroup`} className="accordion">
      { accordion.map(({ label, content }, idx) => (
        <div key={idx}>
          <Header label={label} toggle={() => toggle(idx)} open={idx === active} idBase={idBase} />
          { idx === active &&
          <div id={`${idBase}-sect1`}
            role="region"
            aria-labelledby="accordion1id"
            className="accordion-panel"
          >
            { content }
          </div>
          }
        </div>
      )) }
    </div>
  );
};
