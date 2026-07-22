import React from 'react';
import './styles.css';

interface ArticleMetaProps {
  children?: React.ReactNode;
}

/** Primary ArticleMeta UI component for user interaction */

export const ArticleMetaContainer: React.FC<ArticleMetaProps> = ({
  children
}) => {
  return <div className="article-meta-container">{children}</div>;
};
