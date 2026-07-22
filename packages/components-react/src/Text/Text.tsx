import React from 'react';
import './styles.css';
import { cn } from '../utils/cn';

interface TextProps {
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  typographyStyle?: string;
  classes?: string;
  styles?: { [key: string]: string };
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  as,
  typographyStyle,
  styles,
  classes,
  children
}) => {
  const TextComponent = as || 'p';
  const transformedTypographyStyle =
    typographyStyle?.replaceAll('.', '-').toLowerCase() ?? '';

  return (
    <TextComponent
      className={cn(
        classes,
        typographyStyle ? transformedTypographyStyle : undefined
      )}
      style={styles ? styles : undefined}
    >
      {children}
    </TextComponent>
  );
};
