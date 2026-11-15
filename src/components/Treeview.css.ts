import { style, globalStyle } from '@vanilla-extract/css';

export const treeview = style({});

globalStyle(
  `${treeview} ul[role="tree"]`, {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    fontSize: '120%',
});
globalStyle(
  `${treeview} ul[role="tree"] li`, {
    margin: 0,
    padding: 0,
    listStyle: 'none',
});
globalStyle(
  `${treeview} [role="treeitem"][aria-expanded="false"] + [role="group"]`, {
    display: 'none'
});
globalStyle(
  `${treeview} [role="treeitem"][aria-expanded="true"] + [role="group"]`, {
    display: 'block',
});
globalStyle(
  `${treeview} [role="treeitem"][aria-expanded="false"] > ul`, {
    display: 'none',
});
globalStyle(
  `${treeview} [role="treeitem"][aria-expanded="true"] > ul`, {
    display: 'block',
});
globalStyle( // 📁  📂
  `${treeview} [role="treeitem"].doc::before`, {
    fontFamily: "Font Awesome 5 Free",
//    content: '📂',
//    content: '"\\01F4C2"',
    display: 'inline-block',
    paddingRight: '2px',
    paddingLeft: '5px',
    verticalAlign: 'middle',
});
globalStyle(
  `${treeview} [role="treeitem"][aria-expanded="false"] > span::before`, {
    fontFamily: "Font Awesome 5 Free",
//    content: "\\f07b",
    content: '"\\01F4C2"',
    display: 'inline-block',
    paddingRight: '3px',
    verticalAlign: 'middle',
    fontWeight: 900,
});
globalStyle(
  `${treeview} [role="treeitem"][aria-expanded="true"] > span::before`, {
    fontFamily: "Font Awesome 5 Free",
    content: '"\\01F4C2"',
    display: 'inline-block',
    paddingRight: '3px',
    verticalAlign: 'middle',
    fontWeight: 900,
});
globalStyle(
  `${treeview} [role="treeitem"], ${treeview} [role="treeitem"] span`, {
    width: '9em',
    margin: 0,
    padding: '0.125em',
    display: 'block',
});
globalStyle(
  `${treeview} [role="treeitem"]:focus`, {
    outline: 0,
});
globalStyle(
  `${treeview} [role="treeitem"][aria-selected="true"]`, {
    paddingLeft: `4px`,
    borderLeft: `5px solid #005a9c`,
});
globalStyle(
 `${treeview} [role="treeitem"].focus, ${treeview} [role="treeitem"] span.focus`, {
    borderColor: `black`,
    backgroundColor: `#eee`,
});
globalStyle(
  `${treeview} [role="treeitem"].hover, ${treeview} [role="treeitem"] span:hover`, {
    paddingLeft: '4px',
    backgroundColor: '#ddd',
    borderLeft: '5px solid #333',
});
