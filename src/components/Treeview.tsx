import React, { useState } from 'react';
import './Treeview.css';

const initTree = ({ heading, group }) => {
  const node = {
    heading,
    selected: false,
    id: crypto.randomUUID(),
  };
  if (group?.length > 0) {
    node.group = group.map(initTree);
    node.expanded = false;
  }
  return node;
};

const TreeGroup = ({ group }) => {
  return 
};

const Tree = ({ tree, top, handleToggle }) => {
  const { heading, group, id } = tree;
  if (top) {
    return (<>
      <h3 id={id}>{heading}</h3>
      <ul role="tree" aria-labelledby={id}>
        { group?.map(tree => (
          <li key={tree.id}
            role="treeitem"
            aria-selected={tree.selected!.toString()}
            aria-expanded={tree.expanded?.toString()}
            onClick={(e) => handleToggle(e, tree.id)}
            className="doc">
            <Tree tree={tree} top={false} handleToggle={handleToggle} />
          </li>
        )) }
      </ul>
    </>);
  }

  if (group?.length > 0) {
    return (<>
      <span> {heading} </span>
      <ul role="group">
        { group?.map(tree => (
          <li key={tree.id}
            role="treeitem"
            aria-selected={tree.selected!.toString()}
            aria-expanded={tree.expanded?.toString()}
            onClick={(e) => handleToggle(e, tree.id)}
            className="doc">
            <Tree tree={tree} top={false} handleToggle={handleToggle} />
          </li>
        )) }
      </ul>
    </>);
  }

  return heading; 
};

function bfs(root, visit) {
  if (!root) return;
  const queue = [root];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    visit(node);
    if (node.group) {
      queue.push(...node.group);
    }
  }
}

export const Treeview = ({ tree }) => {
  const [local, setLocal] = useState(initTree(tree));
  const [prev, setPrev] = useState(tree);
  const [selected, setSelected] = useState();

  if (tree !== prev) {
    setPrev(tree);
    setLocal(initTree(tree));
  }

  const handleToggle = (e, id) => {
    e.stopPropagation();
    const newTree = structuredClone(local);
    bfs(newTree, (node) => {
      if (node.id === id) {
        node.expanded = !node.expanded;
        node.selected = true;
        setSelected(node.heading);
      } else {
        node.selected = false;
      }
    });
    setLocal(newTree);
  };

  return <div><Tree tree={local} handleToggle={handleToggle} />
  <p>
    <label>File or Folder Selected: {selected}</label>
  </p>
  </div>;
  return <Tree tree={local} handleToggle={handleToggle} />;

  return (<>
  <h3 id="tree_label">My Documents</h3>
  <ul role="tree" aria-labelledby="tree_label">
    <li role="treeitem" aria-expanded="false" aria-selected="false">
      <span> Projects </span>
      <ul role="group">
        <li role="treeitem" aria-selected="false" className="doc">project-1.docx</li>
        <li role="treeitem" aria-selected="false" className="doc">project-2.docx</li>
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> Project 3 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">project-3A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-3B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-3C.docx</li>
          </ul>
        </li>
        <li role="treeitem" aria-selected="false" className="doc">project-4.docx</li>
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> Project 5 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">project-5A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-5B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-5C.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-5D.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-5E.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">project-5F.docx</li>
          </ul>
        </li>
      </ul>
    </li>
    <li role="treeitem" aria-expanded="false" aria-selected="false">
      <span> Reports </span>
      <ul role="group">
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> report-1 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">report-1A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-1B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-1C.docx</li>
          </ul>
        </li>
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> report-2 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">report-2A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-2B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-2C.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-2D.docx</li>
          </ul>
        </li>
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> report-3 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">report-3A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-3B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-3C.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">report-3D.docx</li>
          </ul>
        </li>
      </ul>
    </li>
    <li role="treeitem" aria-expanded="false" aria-selected="false">
      <span> Letters </span>
      <ul role="group">
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> letter-1 </span>
          <ul>
            <li role="treeitem" aria-selected="false" className="doc">letter-1A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-1B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-1C.docx</li>
          </ul>
        </li>
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> letter-2 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">letter-2A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-2B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-2C.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-2D.docx</li>
          </ul>
        </li>
        <li role="treeitem" aria-expanded="false" aria-selected="false">
          <span> letter-3 </span>
          <ul role="group">
            <li role="treeitem" aria-selected="false" className="doc">letter-3A.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-3B.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-3C.docx</li>
            <li role="treeitem" aria-selected="false" className="doc">letter-3D.docx</li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>

  <p>
    <label>File or Folder Selected: <input id="last_action" type="text" size="15" readonly="" /></label>
  </p>
  </>);
};
