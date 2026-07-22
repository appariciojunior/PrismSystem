import React from 'react';
import './styles.css';
import { cn } from '../utils/cn';

export interface DividerProps {
  /** Line style: dashed for editorial content breaks, solid for structural UI separation */
  isDashed?: boolean;
  /** Axis along which the divider is drawn */
  isVertical?: boolean;
  /** Adds gutter spacing around the line */
  padding?: boolean;
  /** CSS class for additional styling */
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  isDashed = false,
  isVertical = false,
  padding = true,
  className = '',
  ...props
}) => {
  return (
    <div
      role="separator"
      aria-orientation={isVertical ? 'vertical' : 'horizontal'}
      className={cn(
        'ds-divider',
        isVertical ? 'ds-divider--vertical' : 'ds-divider--horizontal',
        isDashed ? 'ds-divider--dashed' : 'ds-divider--solid',
        padding ? 'ds-divider--padding' : '',
        className
      )}
      {...props}
    />
  );
};
