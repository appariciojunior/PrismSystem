import React from 'react';
import { cn } from '../utils/cn';
import './styles.css';
import { IconName } from '@ds/icons';
import { Icon } from '../Icon/Icon';

type ChipIntent = 'primary' | 'secondary';
type ChipSize = 'small' | 'large';
type ChipState = 'base' | 'hover' | 'pressed' | 'disabled' | 'focus';

export interface ChipProps {
  /** Visual emphasis style */
  intent?: ChipIntent;
  /** Chip size variant */
  size?: ChipSize;
  /** Visual preview state for parity/testing */
  state?: ChipState;
  /** Applies channel color token family */
  channel?: boolean;
  /** Persistent toggle selection state */
  toggle?: boolean;
  /** Show a leading icon */
  iconLeft?: IconName;
  /** Show a trailing icon */
  iconRight?: IconName;
  /** Label content */
  children?: React.ReactNode;
  /** Optional accessible name override */
  'aria-label'?: string;
  /** Optional camelCase alias for aria-label */
  ariaLabel?: string;
  /** @ignore */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** @ignore */
  className?: string;
  /** @ignore */
  disabled?: boolean;
  /** @ignore */
  type?: 'button' | 'submit' | 'reset';
}

/** Compact selectable/toggle control for in-page state changes */
export const Chip: React.FC<ChipProps> = ({
  intent = 'primary',
  size = 'small',
  state = 'base',
  channel = false,
  toggle = false,
  iconLeft,
  iconRight,
  children,
  'aria-label': ariaLabelProp,
  ariaLabel,
  onClick,
  className,
  disabled = false,
  type = 'button'
}) => {
  const resolvedDisabled = disabled || state === 'disabled';
  const resolvedLabel = children ?? 'Chip Label';
  const resolvedAriaLabel = ariaLabelProp ?? ariaLabel;
  const toggleClass = toggle ? 'off' : 'on';

  return (
    <button
      type={type}
      className={cn(
        'ds-chip',
        `ds-chip--intent-${intent}`,
        `ds-chip--size-${size}`,
        `ds-chip--state-${state}`,
        `ds-chip--toggle-${toggleClass}`,
        channel ? 'ds-chip--channel-true' : 'ds-chip--channel-false',
        className
      )}
      aria-label={resolvedAriaLabel}
      aria-pressed={toggle ? true : undefined}
      disabled={resolvedDisabled}
      onClick={onClick}
    >
      {iconLeft && (
        <span className="ds-chip__icon" aria-hidden="true">
          {<Icon iconName={iconLeft} />}
        </span>
      )}

      <span className="ds-chip__label">{resolvedLabel}</span>

      {iconRight && (
        <span className="ds-chip__icon" aria-hidden="true">
          {<Icon iconName={iconRight} />}
        </span>
      )}
    </button>
  );
};
