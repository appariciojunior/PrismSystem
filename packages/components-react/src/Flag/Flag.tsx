import React from 'react';
import { cn } from '../utils/cn';
import './styles.css';
import { IconName } from '@ds/icons';
import { Icon } from '../Icon/Icon';

type FlagIntent = 'primary' | 'secondary' | 'callout';
type FlagSize = 'medium' | 'small';

export interface FlagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual treatment */
  intent?: FlagIntent;
  /** Typography size variant */
  size?: FlagSize;
  /** Show an icon on the left side of the label */
  iconLeft?: IconName;
  /** Show an icon on the right side of the label */
  iconRight?: IconName;
  /** Visible label text */
  label?: string;
  /** Optional slot content alias for label */
  children?: React.ReactNode;
  /** Optional accessible name override */
  'aria-label'?: string;
  /** Optional camelCase alias for aria-label */
  ariaLabel?: string;
}

/** Small editorial tag used to signal live/update/channel context near article metadata */
export const Flag: React.FC<FlagProps> = ({
  intent = 'primary',
  size = 'medium',
  iconLeft,
  iconRight,
  label = 'LABEL',
  children,
  className,
  'aria-label': ariaLabelProp,
  ariaLabel,
  ...rest
}) => {
  const resolvedLabel = children ?? label;
  const resolvedAriaLabel = ariaLabelProp ?? ariaLabel;

  return (
    <span
      className={cn(
        'ds-flag',
        `ds-flag--intent-${intent}`,
        `ds-flag--size-${size}`,
        className
      )}
      aria-label={resolvedAriaLabel}
      {...rest}
    >
      {iconLeft && (
        <span className="ds-flag__icon" aria-hidden="true">
          <Icon iconName={iconLeft} />
        </span>
      )}

      <span className="ds-flag__label">{resolvedLabel}</span>

      {iconRight && (
        <span className="ds-flag__icon" aria-hidden="true">
          <Icon iconName={iconRight} />
        </span>
      )}
    </span>
  );
};
