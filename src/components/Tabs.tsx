import React from 'react';
// type = automatic | manual
export const Tabs = ({ title, tabs }) => {
  const [selected, setSelected] = React.useState(0); 
  return (
<div className="tabs">
  <h3 id="tablist-1">
    { title }
  </h3>
  <div role="tablist" aria-labelledby="tablist-1" className="automatic">
    { tabs.map((tab, idx) => (<button key={`tab-${idx}`} id={`tab-${idx}`} type="button" role="tab" aria-selected={selected === idx ? 'true' : 'false'} aria-controls={`tabpanel-${idx}`} onClick={() => setSelected(idx)}>
        <span className="focus">
          { tab.label }
        </span>
      </button>)) }
  </div>
  { tabs.map(({ Panel }, idx) => (
    <div key={`tabpanel-${idx}`} id={`tabpanel-${idx}`} role="tabpanel" tabindex="0" aria-labelledby={`tab-${idx}`} className={selected === idx ? null : 'is-hidden' }>
      <Panel />
    </div>
  )) }
</div>
  );
};
