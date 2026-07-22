// @ds/icons - thin wrapper around @phosphor-icons/react.
// Public API preserved: `iconMap` (name -> React component) and the `IconName` type.
// Naming convention: 'filled_<name>' -> weight "fill", 'outlined_<name>' -> weight "regular".
// This file is intentionally JSX-free so it needs no build step.

import { createElement, forwardRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CaretRight,
  Check,
  CheckCircle,
  Circle,
  Equalizer,
  Info,
  MagnifyingGlass,
  MonitorPlay,
  Plus,
  Spinner,
  Warning,
  WarningCircle,
  WarningOctagon,
  X
} from '@phosphor-icons/react';

// The full Phosphor set stays available for new code.
export * from '@phosphor-icons/react';

const withWeight = (Component, weight) => {
  const WeightedIcon = forwardRef((props, ref) =>
    createElement(Component, { weight, ref, ...props })
  );
  WeightedIcon.displayName = `${Component.displayName || 'Icon'}.${weight}`;
  return WeightedIcon;
};

// Legacy Material names -> closest Phosphor equivalent.
const BASE_ICONS = {
  add: Plus,
  arrow_left: ArrowLeft,
  arrow_right: ArrowRight,
  check_circle: CheckCircle,
  circle: Circle,
  close: X,
  equalizer: Equalizer,
  featured_video: MonitorPlay,
  info: Info,
  loading: Spinner,
  report: WarningOctagon,
  warning: Warning
};

export const iconMap = {};

for (const [name, Component] of Object.entries(BASE_ICONS)) {
  iconMap[`filled_${name}`] = withWeight(Component, 'fill');
  iconMap[`outlined_${name}`] = withWeight(Component, 'regular');
}

// Plain-name compatibility aliases.
Object.assign(iconMap, {
  add: Plus,
  check: Check,
  chevron_right: CaretRight,
  close: X,
  error: WarningCircle,
  info: Info,
  search: MagnifyingGlass,
  warning: Warning
});
