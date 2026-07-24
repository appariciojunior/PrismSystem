import React from 'react';
import { Text } from '../Text/Text';
import './styles.css';

interface AdContainerProps {
  type?: 'header' | 'inline';
  slotID?: string;
}

/** Primary AdContainer UI component for user interaction */

export const AdContainer: React.FC<AdContainerProps> = ({
  type = 'inline',
  slotID
}) => {
  return (
    <div
      className={`ad-${type}-container`}
      data-testid={`ad-${type}-container`}
    >
      {type === 'inline' && (
        <Text as="span" classes="ad-label">
          Advertisement
        </Text>
      )}
      <div className={`ad-${type}-wrapper`}>
        <div id={type === 'header' ? 'ad-header' : slotID}></div>
      </div>
    </div>
  );
};
