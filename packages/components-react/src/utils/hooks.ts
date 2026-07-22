// function possibly for future use with typography tokens.
// takes a token and tokens object, returns media query string referencing typography token values.
type UseTypographyToken = (
  typographyToken: string,
  tokens: {
    breakpoints: { [key: string]: number };
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
) => string;

export const useTypographyToken: UseTypographyToken = (
  typographyToken,
  tokens
) => `
  .${typographyToken} {
    font: ${typographyToken}

    @media (min-width: ${tokens.breakpoints.sm}px) {
      fontSize: ${tokens['Viewport/ Small'].typography[typographyToken].fontSize};
    }

    @media (min-width: ${tokens.breakpoints.md}px) {
      fontSize: ${tokens['Viewport/ Medium'].typography[typographyToken].fontSize};
    }

    @media (min-width: ${tokens.breakpoints.lg}px) {
      fontSize: ${tokens['Viewport/ Large'].typography[typographyToken].fontSize};
    }

    @media (min-width: ${tokens.breakpoints.xl}px) {
      fontSize: ${tokens['Viewport/ XLarge'].typography[typographyToken].fontSize};
    }
  }
`;
