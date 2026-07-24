import React from 'react';
import './styles.css';
import { cn } from '../utils/cn';
import { IconName } from '@ds/icons';
import { Icon } from '../Icon/Icon';

type LinkIntent = 'primary' | 'secondary';
type LinkSentiment = 'brand' | 'utility';
type LinkSize = 'xsmall' | 'small' | 'medium' | 'large';
type LinkState =
  | 'base'
  | 'hover'
  | 'pressed'
  | 'visited'
  | 'disabled'
  | 'focus';
type LinkLegacyVariant = LinkIntent | 'danger';

interface LinkProps {
  href: string;
  intent?: LinkIntent;
  variant?: LinkLegacyVariant;
  sentiment?: LinkSentiment;
  size?: LinkSize;
  state?: LinkState;
  iconLeft?: IconName;
  iconRight?: IconName;
  inline?: boolean;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
  className?: string;
  classes?: string;
  styles?: { [key: string]: string };
  children?: React.ReactNode;
}

/** Link UI component for navigation and interactive linking */
export const Link: React.FC<LinkProps> = ({
  href,
  intent,
  variant,
  sentiment = 'brand',
  size = 'medium',
  state = 'base',
  iconLeft,
  iconRight,
  inline = true,
  ariaLabel,
  onClick,
  target,
  rel,
  className,
  classes,
  styles,
  children
}) => {
  // If target is _blank, set rel to noopener noreferrer for security
  const linkRel =
    target === '_blank'
      ? rel
        ? `${rel} noopener noreferrer`
        : 'noopener noreferrer'
      : rel;

  const resolvedIntent = intent ?? variant ?? 'primary';
  const isDisabled = state === 'disabled';
  const resolvedHref = isDisabled ? undefined : href;
  const resolvedLabel = children ?? 'Link';

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  };

  return (
    <a
      href={resolvedHref}
      onClick={handleClick}
      target={target}
      rel={linkRel}
      aria-label={ariaLabel}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      className={cn(
        'ds-link',
        `ds-link--${resolvedIntent}`,
        `ds-link--sentiment-${sentiment}`,
        `ds-link--size-${size}`,
        `ds-link--state-${state}`,
        isDisabled ? 'ds-link--is-disabled' : undefined,
        !inline ? 'ds-link--standalone' : undefined,
        className,
        classes
      )}
      style={styles ? styles : undefined}
    >
      {iconLeft && (
        <span className="ds-link__icon" aria-hidden="true">
          {<Icon iconName={iconLeft} />}
        </span>
      )}
      <span className="ds-link__label">{resolvedLabel}</span>
      {iconRight && (
        <span className="ds-link__icon" aria-hidden="true">
          {<Icon iconName={iconRight} />}
        </span>
      )}
    </a>
  );
};
