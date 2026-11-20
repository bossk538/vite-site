import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent, type ReactNode } from 'react';
import { button, icon, spinner, visuallyHidden, type ButtonVariants } from './Button.css';

type Size = 'small' | 'medium' | 'large';
type Intent = 'primary' | 'secondary';

type BaseProps = Omit<ComponentPropsWithoutRef<'button'>, 'children'> & {
  /** Visual emphasis. */
  intent?: Intent;
  /** Control size — maps to dimension and font tokens. */
  size?: Size;
  fullWidth?: ButtonVariants['fullWidth'];
  /** Shows a spinner, sets aria-busy and blocks clicks while staying focusable. */
  loading?: boolean;
  /** Screen-reader text appended to the label while loading. */
  loadingText?: string;
  /** Decorative icons; hidden from assistive tech. */
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

/**
 * A button with visible text, or an icon-only button that MUST have an
 * accessible name. The type system enforces this.
 */
export type ButtonProps =
  | (BaseProps & { children: ReactNode })
  | (BaseProps & { children?: never; 'aria-label': string })
  | (BaseProps & { children?: never; 'aria-labelledby': string });

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    intent = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    loadingText = 'Loading',
    startIcon,
    endIcon,
    disabled,
    type = 'button', // never accidentally submit a form
    className,
    onClick,
    children,
    ...rest
  },
  ref,
) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const classes = [button({ intent, size, fullWidth }), className].filter(Boolean).join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      // Real `disabled` removes it from tab order (expected for disabled).
      disabled={disabled}
      // Loading keeps focus where the user is, but is announced as unavailable.
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      {...rest}
    >
      {loading ? (
        <span className={icon({ size })} aria-hidden="true">
          <span className={spinner} />
        </span>
      ) : (
        startIcon && (
          <span className={icon({ size })} aria-hidden="true">
            {startIcon}
          </span>
        )
      )}

      {children}
      {loading && <span className={visuallyHidden}>, {loadingText}</span>}

      {endIcon && (
        <span className={icon({ size })} aria-hidden="true">
          {endIcon}
        </span>
      )}
    </button>
  );
});
