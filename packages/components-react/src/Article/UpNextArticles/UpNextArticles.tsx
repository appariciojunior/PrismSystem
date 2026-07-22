import React from 'react';
import { Text } from '../../Text/Text';
import './styles.css';

interface UpNextArticlesProps {
  upNextArticles: {
    url: string;
    headline: string;
    duration?: string;
    thumbnail: string;
  }[];
}

/** Primary UpNextArticles UI component for user interaction */

export const UpNextArticles: React.FC<UpNextArticlesProps> = ({
  upNextArticles
}) => {
  if (!upNextArticles || upNextArticles.length === 0) {
    return;
  }

  return (
    <div className="video-article-up-next">
      <div className="vertical-divider"></div>
      <div className="up-next-articles-container show-right-overlay">
        <Text as="h4" classes="video-heading video-category">
          Up Next
        </Text>
        <div className="up-next-articles-overlay up-next-articles-overlay-left"></div>
        <div className="up-next-articles-scroll">
          <div className="up-next-articles">
            {upNextArticles.map((up_next_article, index) => (
              <div className="up-next-article" key={index}>
                <a href={up_next_article.url}>
                  <div className="up-next-article-image-container">
                    <Text classes="up-next-article-duration video-heading">
                      {up_next_article.duration}
                    </Text>
                    <div className="up-next-article-image-overlay"></div>
                    <div className="up-next-article-image">
                      {up_next_article.thumbnail !== '' && (
                        <picture>
                          <source
                            srcSet={up_next_article.thumbnail}
                            type="image/webp"
                          />
                          <img
                            loading="lazy"
                            src={up_next_article.thumbnail}
                            alt={up_next_article.headline}
                          />
                        </picture>
                      )}
                    </div>
                  </div>
                  <Text as="span" classes="article-heading">
                    {up_next_article.headline}
                  </Text>
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="up-next-articles-overlay up-next-articles-overlay-right"></div>
      </div>
    </div>
  );
};
