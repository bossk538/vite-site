import { createGlobalTheme, style } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    surface: "#ffffff",
    text: "#1a1a1a",
    muted: "#555555",
    backdrop: "rgb(0 0 0 / 0.5)",
    focus: "#1d4ed8",
    danger: "#b91c1c",
    dangerText: "#ffffff",
    border: "#c4c4c4",
  },
  radius: "0.5rem",
  space: {
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
  },
});

export const overlay = style({
  display: "grid",
  placeItems: "center",
  padding: vars.space.md,
  background: vars.color.backdrop,
  zIndex: 1000,
});

export const content = style({
  position: "relative",
  width: "min(100%, 32rem)",
  maxHeight: "calc(100vh - 2rem)",
  overflowY: "auto",
  padding: vars.space.lg,
  borderRadius: vars.radius,
  background: vars.color.surface,
  color: vars.color.text,
  boxShadow: "0 10px 30px rgb(0 0 0 / 0.25)",

  "@media": {
    // Box shadows disappear in Windows High Contrast; keep a visible edge.
    "(forced-colors: active)": {
      border: "2px solid CanvasText",
    },
  },
});

export const title = style({
  margin: 0,
  marginBottom: vars.space.sm,
  fontSize: "1.25rem",
  lineHeight: 1.3,
});

export const description = style({
  margin: 0,
  marginBottom: vars.space.md,
  color: vars.color.muted,
});

export const footer = style({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: vars.space.sm,
  marginTop: vars.space.lg,
});

export const button = style({
  minHeight: "2.75rem", // 44px touch target
  padding: `0 ${vars.space.md}`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius,
  background: vars.color.surface,
  color: vars.color.text,
  font: "inherit",
  cursor: "pointer",

  selectors: {
    "&:focus-visible": {
      outline: `3px solid ${vars.color.focus}`,
      outlineOffset: "2px",
    },
  },
});

export const dangerButton = style([
  button,
  {
    borderColor: vars.color.danger,
    background: vars.color.danger,
    color: vars.color.dangerText,
  },
]);

export const closeIconButton = style([
  button,
  {
    position: "absolute",
    top: vars.space.sm,
    right: vars.space.sm,
    minWidth: "2.75rem",
    padding: 0,
    border: "none",
    fontSize: "1.5rem",
    lineHeight: 1,
  },
]);
