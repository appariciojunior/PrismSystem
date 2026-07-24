import React from 'react';
import { cn } from '../utils/cn';
import './styles.css';
import { Icon } from '../Icon/Icon';

type ButtonIntent = 'primary' | 'secondary' | 'negative';
type ButtonSize = 'small' | 'medium' | 'large';
type ButtonBehaviour = 'hug' | 'full';
type ButtonState =
  | 'base'
  | 'hover'
  | 'pressed'
  | 'loading'
  | 'disabled'
  | 'focus';

export interface ButtonContainerProps {
  /** Controls the width behaviour — 'Hug' fits content, '100%' fills the container */
  behaviour?: ButtonBehaviour;
  /** Visual style variant — Primary (filled), Secondary (outlined), or Negative (destructive) */
  intent?: ButtonIntent;
  /** Controls the overall dimensions of the button */
  size?: ButtonSize;
  /** The interaction state — controls visual feedback for hover, press, focus, loading, and disabled */
  state?: ButtonState;
  /** Accessible name for this icon-only control */
  ariaLabel?: string;
  /** Optional href to render as a link */
  href?: string;
  /** Optional target attribute for links */
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Optional rel attribute for links */
  rel?: string;
  /** @ignore */
  disabled?: boolean;
  /** @ignore */
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  /** @ignore */
  className?: string;
  /** @ignore */
  type?: 'button' | 'submit' | 'reset';
  /** @ignore */
  children?: React.ReactNode;
}

/** Primary UI component for user interaction */
export const ButtonContainer: React.FC<ButtonContainerProps> = ({
  behaviour,
  intent = 'primary',
  state = 'base',
  disabled = false,
  ariaLabel = undefined,
  href,
  target,
  rel,
  children,
  className,
  type = 'button',
  onClick
}) => {
  const isLoading = state === 'loading';
  const isDisabled = disabled || state === 'disabled' || isLoading;

  const buttonClasses = cn(
    'ds-button',
    `ds-button--intent-${intent}`,
    behaviour ? `ds-button--behaviour-${behaviour}` : undefined,
    `ds-button--state-${state}`,
    isLoading ? 'ds-button--loading' : undefined,
    className
  );

  const buttonContent = isLoading ? (
    <span className="ds-button__spinner" aria-hidden="true">
      <Icon iconName="filled_loading" />
    </span>
  ) : (
    children
  );

  // Render as anchor tag if href is provided
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel || (target === '_blank' ? 'noopener noreferrer' : undefined)}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
        className={buttonClasses}
        aria-busy={isLoading || undefined}
        aria-label={ariaLabel}
      >
        {buttonContent}
      </a>
    );
  }

  // Render as button element
  return (
    <button
      type={type}
      className={buttonClasses}
      aria-busy={isLoading || undefined}
      aria-label={ariaLabel}
      disabled={isDisabled}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};
