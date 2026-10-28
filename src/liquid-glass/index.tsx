import React from 'react';
import './style.css';

export const LGR = () => {

  return (
    <div className="w-full h-screen bg-image">
      <div>
        <span className="typewriter"></span>
      </div>
      <div className="flex">
      <div className="border-none">none</div>
      <div className="border-dotted">dotted</div>
      <div className="border-dashed">dashed</div>
      <div className="border-solid">solid</div>
      <div className="border-double">double</div>
      <div className="border-groove">groove</div>
      <div className="border-ridge">ridge</div>
      <div className="border-inset">inset</div>
      <div className="border-outset">outset</div>
      </div>
      <div className="grid-wrap">
  <table className="grid">
    <thead>
      <tr>
        <th>Date</th><th>Description</th><th>Category</th>
        <th>Account</th><th>Reference</th><th>Status</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>
    { Array.from({ length: 40 }).map((_, idx) => (<><tr>
        <td>2026-10-01</td><td>Wire transfer — Acme Corp</td><td>Transfers</td>
        <td>Checking ••4821</td><td>WT-883920114</td><td>Posted</td>
        <td className="amount negative">-12,450.00</td>
      </tr>
      <tr>
        <td>2026-10-02</td><td>Client payment — Northwind</td><td>Income</td>
        <td>Checking ••4821</td><td>ACH-55102937</td><td>Posted</td>
        <td className="amount">8,200.75</td>
      </tr></>)) }
      {/* <!-- copy rows until you have ~40 so it scrolls --> */}
    </tbody>
  </table>
</div>
    </div>
  )
};
