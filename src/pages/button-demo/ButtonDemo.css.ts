import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../tokens/contract.css';

globalStyle('body', { margin: 0, fontFamily: 'system-ui, sans-serif' });

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))',
});

export const panel = style({
  background: vars.color.surface,
  color: vars.color.text,
  fontFamily: vars.font.family.body,
  lineHeight: vars.font.lineHeight.normal,
  padding: vars.dimension.space.xl,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.dimension.space.md,
});

export const heading = style({ margin: 0, fontSize: vars.font.size.large });

export const row = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.dimension.space.sm,
});

export const swatches = style({ display: 'flex' });
export const swatch = style({ flex: 1, height: vars.dimension.space.lg });
