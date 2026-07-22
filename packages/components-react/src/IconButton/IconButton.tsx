import React from 'react';
import { Icon } from '../Icon/Icon';
import { cn } from '../utils/cn';
import './styles.css';
import { IconName } from '@ds/icons';
import {
  ButtonContainer,
  ButtonContainerProps
} from '../Button/ButtonContainer';

export interface IconButtonProps extends ButtonContainerProps {
  /** Corner style for parity with Figma variant values */
  round?: boolean;
  /** Icon to render in the button */
  iconName?: IconName;
  /** Optional href to render as a link */
  href?: string;
  /** Optional target attribute for links */
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Optional rel attribute for links */
  rel?: string;
}

/** Icon-only action button */
export const IconButton: React.FC<IconButtonProps> = ({
  ariaLabel,
  intent = 'primary',
  size = 'large',
  state = 'base',
  round = 'off',
  iconName = 'filled_add' as IconName,
  disabled = false,
  className,
  onClick,
  type = 'button',
  href,
  target,
  rel
}) => {
  return (
    <ButtonContainer
      intent={intent}
      size={size}
      state={state}
      disabled={disabled}
      type={type}
      href={href}
      target={target}
      rel={rel}
      className={cn(
        `ds-icon-button--size-${size}`,
        round ? `ds-icon-button--round` : undefined,
        className
      )}
      ariaLabel={ariaLabel}
      onClick={onClick}
    >
      <span className="ds-button__icon" aria-hidden="true">
        {<Icon iconName={iconName} />}
      </span>
    </ButtonContainer>
  );
};
