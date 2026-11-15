import React from 'react';
import { Treeview } from '/src/components/Treeview';
import './style.css';

const tree = {
  heading: 'My Documents',
  group: [
    {
      heading: 'Projects',
      group: [
        { heading: 'project-1.docx', },
        { heading: 'project-2.docx', },
        { heading: 'Project 3',
          group: [
            { heading: 'project-3A.docx', },
            { heading: 'project-3B.docx', },
            { heading: 'project-3C.docx', },
          ],
        },
        { heading: 'project-4.docx', },
        { heading: 'Project 5',
          group: [
            { heading: 'project-5A.docx', },
            { heading: 'project-5B.docx', },
            { heading: 'project-5C.docx', },
            { heading: 'project-5D.docx', },
            { heading: 'project-5E.docx', },
            { heading: 'project-5F.docx', },
          ],
        },
      ],
    },
    {
      heading: 'Reports',
      group: [
        { heading: 'report-1',
          group: [
            { heading: 'report-1A.docx', },
            { heading: 'report-1B.docx', },
            { heading: 'report-1C.docx', },
          ],
        },
        { heading: 'report-2',
          group: [
            { heading: 'report-2A.docx', },
            { heading: 'report-2B.docx', },
            { heading: 'report-2C.docx', },
            { heading: 'report-2D.docx', },
          ],
        },
        { heading: 'report-3',
          group: [
            { heading: 'report-3A.docx', },
            { heading: 'report-3B.docx', },
            { heading: 'report-3C.docx', },
            { heading: 'report-3D.docx', },
          ],
        },
      ],
    },
    {
      heading: 'Letters',
      group: [
        { heading: 'letter-1',
          group: [
            { heading: 'letter-1A.docx', },
            { heading: 'letter-1B.docx', },
            { heading: 'letter-1C.docx', },
          ],
        },
        { heading: 'letter-2',
          group: [
            { heading: 'letter-2A.docx', },
            { heading: 'letter-2B.docx', },
            { heading: 'letter-2C.docx', },
            { heading: 'letter-2D.docx', },
          ],
        },
        { heading: 'letter-3',
          group: [
            { heading: 'letter-3A.docx', },
            { heading: 'letter-3B.docx', },
            { heading: 'letter-3C.docx', },
            { heading: 'letter-3D.docx', },
          ],
        },
      ],
    },
  ],
};

export const LGR = () => {

  return (
    <div className="w-full h-screen bg-image">
      <div className="typewriter-wrapper">
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
    <Treeview tree={tree} />
    </div>
  )
};
