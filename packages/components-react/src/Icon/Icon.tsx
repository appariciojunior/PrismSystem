import React from 'react';
import { iconMap, type IconName } from '@ds/icons';

// Re-export iconMap for convenience
export { iconMap };

export type IconOptions = {
  size?: {
    width: string;
    height: string;
  };
};

export const Icon = ({
  iconName,
  size
}: {
  iconName: IconName;
} & IconOptions) => {
  const Component = iconMap[iconName] as React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
  if (!Component) {
    console.warn(`Icon "${iconName}" not found in icon map`);
    return null;
  }
  return <Component {...size} />;
};
