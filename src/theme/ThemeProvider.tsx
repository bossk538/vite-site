import type { ReactNode } from 'react';
import { colorScheme, themes, type Brand, type Mode } from '../tokens/themes.css';

interface ThemeProviderProps {
  brand: Brand;
  mode: Mode;
  children: ReactNode;
}

/**
 * Applies a theme class to a subtree. Themes nest, so different parts of a
 * page can use different brands/modes at the same time.
 */
export function ThemeProvider({ brand, mode, children }: ThemeProviderProps) {
  return <div className={`${themes[brand][mode]} ${colorScheme[mode]}`}>{children}</div>;
}
