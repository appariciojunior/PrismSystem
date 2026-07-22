import React from 'react';
import './styles.css';
import { IconName } from '@ds/icons';
import { Icon } from '../Icon/Icon';
import { ButtonContainer, ButtonContainerProps } from './ButtonContainer';
import { cn } from '../utils/cn';

export interface ButtonProps extends ButtonContainerProps {
  /** The text label displayed inside the button */
  label?: string;
  /** Show an icon on the left side of the label */
  iconLeft?: IconName;
  /** Show an icon on the right side of the label */
  iconRight?: IconName;
}

/** Primary UI component for user interaction */
export const Button: React.FC<ButtonProps> = ({
  behaviour = 'hug',
  iconLeft,
  iconRight,
  intent = 'primary',
  label = 'Button label',
  size = 'large',
  state = 'base',
  disabled = false,
  children,
  className,
  type = 'button',
  href,
  target,
  rel,
  onClick
}) => {
  const resolvedLabel = children ?? label;

  const buttonContent = (
    <>
      {iconLeft && (
        <span className="ds-button__icon" aria-hidden="true">
          <Icon iconName={iconLeft} />
        </span>
      )}

      {
        <span className="ds-button__label-container">
          <span className="ds-button__label">{resolvedLabel}</span>
        </span>
      }

      {iconRight && (
        <span className="ds-button__icon" aria-hidden="true">
          <Icon iconName={iconRight} />
        </span>
      )}
    </>
  );

  return (
    <ButtonContainer
      behaviour={behaviour}
      intent={intent}
      size={size}
      state={state}
      disabled={disabled}
      href={href}
      target={target}
      rel={rel}
      className={cn(`ds-button--size-${size}`, className)}
      type={type}
      onClick={onClick}
    >
      {buttonContent}
    </ButtonContainer>
  );
};
