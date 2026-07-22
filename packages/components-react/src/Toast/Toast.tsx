import React, { useEffect, useState } from 'react';
import { type IconName } from '@ds/icons';
import { Icon } from '../Icon/Icon';
import { cn } from '../utils/cn';
import './styles.css';

const EXIT_ANIMATION_MS = 180;

type ToastIntent = 'success' | 'info' | 'warning' | 'error';

const TOAST_INTENT_ICON: Record<ToastIntent, IconName> = {
  success: 'filled_check_circle',
  info: 'filled_info',
  warning: 'filled_warning',
  error: 'filled_report'
};

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Semantic intent for toast visuals and icon */
  intent?: ToastIntent;
  /** Primary toast message */
  label?: string;
  /** Show/hide optional inline link */
  link?: boolean;
  /** Optional link text */
  linkLabel?: string;
  /** Auto-dismiss delay in milliseconds */
  timeout?: number;
}

/**
 * Compact, transient feedback message. Use for low-disruption status updates.
 */
export const Toast: React.FC<ToastProps> = ({
  intent = 'success',
  label = 'Short toast message goes here.',
  link = true,
  linkLabel = 'Link',
  timeout = 2000,
  className,
  ...rest
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const iconName = TOAST_INTENT_ICON[intent];
  const resolvedTimeout = Math.max(timeout, 1500);

  useEffect(() => {
    setIsVisible(true);
    setIsExiting(false);

    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, resolvedTimeout);

    const removeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, resolvedTimeout + EXIT_ANIMATION_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, [intent, label, link, linkLabel, resolvedTimeout]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'ds-toast',
        'animate__animated',
        isExiting ? 'animate__fadeOutDown' : 'animate__fadeInUp',
        `ds-toast--intent-${intent}`,
        className
      )}
      {...rest}
    >
      <span className="ds-toast__icon" aria-hidden="true">
        <Icon iconName={iconName} size={{ width: '20px', height: '20px' }} />
      </span>

      <span className="ds-toast__label">{label}</span>

      {link && (
        <span className="ds-toast__link" role="link" tabIndex={0}>
          {linkLabel}
        </span>
      )}
    </div>
  );
};
