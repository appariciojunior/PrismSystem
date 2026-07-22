import React, { HTMLAttributes } from 'react';
import './styles.css';
import { Text } from '../Text/Text';

export interface CommentsDisabledProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'content'> {
  heading?: string;
  contentText?: React.ReactNode;
  guidelinesUrl?: string;
  guidelinesLinkText?: string;
  className?: string;
}

export const CommentsDisabled = React.forwardRef<
  HTMLDivElement,
  CommentsDisabledProps
>(
  (
    {
      heading = 'Comments are not enabled for this article',
      contentText = 'Comments are subject to our community guidelines, which can be viewed',
      guidelinesUrl = '#',
      guidelinesLinkText = 'here',
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`ds-comments-disabled ${className}`.trim()}
        {...props}
      >
        <Text
          as="h3"
          typographyStyle="brand-heading-fluid-light-xsmall"
          classes="ds-comments-disabled__heading"
        >
          {heading}
        </Text>
        <hr className="ds-comments-disabled__divider" />
        <Text
          typographyStyle="utility-body-regular-medium"
          classes="ds-comments-disabled__content"
        >
          {contentText}{' '}
          <a
            href={guidelinesUrl}
            className="ds-comments-disabled__link"
            target="_blank"
            rel="noopener noreferrer"
          >
            {guidelinesLinkText}
          </a>
          .
        </Text>
      </div>
    );
  }
);

CommentsDisabled.displayName = 'CommentsDisabled';
