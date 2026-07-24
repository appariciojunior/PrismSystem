import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

/**
 * Image Component - Static container for aspect-ratio-locked images
 *
 * Note: The Image component is in active development.
 * These stories demonstrate the expected 10 aspect-ratio variants.
 * For now, stories use a placeholder SVG to represent the container.
 */

// Placeholder component while Image component is being finalized
const ImagePlaceholder: React.FC<{
  ratio:
    | 'custom'
    | '1:1'
    | '3:2'
    | '2:3'
    | '3:4'
    | '4:3'
    | '4:5'
    | '5:4'
    | '16:9'
    | '9:16';
  alt?: string;
}> = ({ ratio, alt = 'Image placeholder' }) => {
  const ratioMap: Record<string, { width: number; height: number }> = {
    custom: { width: 320, height: 250 },
    '1:1': { width: 320, height: 320 },
    '3:2': { width: 320, height: 213.33 },
    '2:3': { width: 320, height: 480 },
    '3:4': { width: 320, height: 426.67 },
    '4:3': { width: 320, height: 240 },
    '4:5': { width: 320, height: 400 },
    '5:4': { width: 320, height: 256 },
    '16:9': { width: 320, height: 180 },
    '9:16': { width: 320, height: 568.89 }
  };

  const dims = ratioMap[ratio] || ratioMap.custom;

  return (
    <div
      aria-label={alt}
      style={{
        width: `${dims.width}px`,
        height: `${dims.height}px`,
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        color: '#0052CC'
      }}
    >
      <div
        style={{
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{ratio}</div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          {dims.width}×{Math.round(dims.height)}px
        </div>
      </div>
      <svg
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: 0.05
        }}
        viewBox={`0 0 ${dims.width} ${dims.height}`}
      >
        <defs>
          <pattern
            id="dots"
            x="20"
            y="20"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1" fill="#0052CC" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
};

const meta = {
  title: 'Components/Image',
  component: ImagePlaceholder,
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none'
    }
  },
  argTypes: {
    ratio: {
      name: 'Aspect Ratio',
      description: 'Select the aspect ratio for the image container',
      control: 'select',
      options: [
        '3:4',
        '4:5',
        '5:4',
        '4:3',
        '3:2',
        '2:3',
        '1:1',
        '9:16',
        '16:9',
        'custom'
      ],
      table: { defaultValue: { summary: '3:4' } }
    },
    alt: {
      name: 'Alt text',
      description: 'Accessible description of the image content',
      control: 'text',
      table: { disable: false }
    }
  },
  args: {
    ratio: '3:4',
    alt: 'Image container'
  }
} satisfies Meta<typeof ImagePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Ordered by aspect ratio progression: custom, portrait → square → landscape

export const CustomRatio: Story = {
  args: {
    ratio: 'custom',
    alt: 'Custom aspect ratio 320:250'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Custom aspect ratio (320:250). Use for layouts requiring specific non-standard proportions.'
      }
    }
  }
};

export const PortraitExtra: Story = {
  args: {
    ratio: '9:16',
    alt: 'Ultra-tall portrait 9:16'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Ultra-tall portrait ratio (9:16). Perfect for mobile screens, vertical reels, and tall portrait content.'
      }
    }
  }
};

export const PortraitTall: Story = {
  args: {
    ratio: '2:3',
    alt: 'Portrait aspect ratio 2:3'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Portrait aspect ratio (2:3). Ideal for portrait photos, vertical stories, and tall content.'
      }
    }
  }
};

export const PortraitMid: Story = {
  args: {
    ratio: '3:4',
    alt: 'Portrait aspect ratio 3:4'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Portrait aspect ratio (3:4). Suitable for product shots, fashion imagery, and vertical layouts.'
      }
    }
  }
};

export const PortraitShort: Story = {
  args: {
    ratio: '4:5',
    alt: 'Portrait aspect ratio 4:5'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Portrait aspect ratio (4:5). Equivalent to Instagram story format; useful for social media and vertical tiles.'
      }
    }
  }
};

export const Square: Story = {
  args: {
    ratio: '1:1',
    alt: 'Square aspect ratio 1:1'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Square aspect ratio (1:1). Perfect for avatars, product tiles, gallery grids, and compact layouts.'
      }
    }
  }
};

export const LandscapeShort: Story = {
  args: {
    ratio: '5:4',
    alt: 'Landscape aspect ratio 5:4'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Landscape aspect ratio (5:4). Suitable for monitor and presentation widescreen formats.'
      }
    }
  }
};

export const LandscapeMid: Story = {
  args: {
    ratio: '4:3',
    alt: 'Landscape aspect ratio 4:3'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Landscape aspect ratio (4:3). Classic 4K/SDTV aspect ratio; versatile for landscape photos and banners.'
      }
    }
  }
};

export const LandscapeWide: Story = {
  args: {
    ratio: '3:2',
    alt: 'Landscape aspect ratio 3:2'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Landscape aspect ratio (3:2). Ideal for landscape photos, hero banners, and wide content blocks.'
      }
    }
  }
};

export const LandscapeExtra: Story = {
  args: {
    ratio: '16:9',
    alt: 'Widescreen aspect ratio 16:9'
  },
  parameters: {
    docs: {
      description: {
        story:
          'Widescreen aspect ratio (16:9). Perfect for video thumbnails, cinema format, and ultra-wide layouts.'
      }
    }
  }
};

// Accessibility story
export const AccessibilityExample: Story = {
  args: {
    ratio: '3:2',
    alt: 'Product photo: blue ceramic mug on white background'
  },
  parameters: {
    docs: {
      description: {
        story: `
          **Alt Text Strategy:**
          The Image component is a container. Alt text must be provided by the consuming component or parent element.
          
          If Image is used standalone, provide an \`alt\` attribute on the \`<img>\` element inside the container.
          
          **Example:**
          \`\`\`jsx
          <Image ratio="3:2">
            <img
              src="product.jpg"
              alt="Product photo: blue ceramic mug on white background"
              loading="lazy"
            />
          </Image>
          \`\`\`
          
          **Alt text tips:**
          - Describe the content, not just "image"
          - Include relevant context (e.g., product name, setting)
          - Keep it concise (under 125 characters when possible)
          - For decorative images, use empty alt: \`alt=""\`
        `
      }
    }
  }
};

// Token showcase story
export const TokenShowcase: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: `
          **Token Bindings:**
          - **Fill (background):** \`surface\` token
          - **Corner radius:** 6px
          
          Tokens are applied via component bindings.
        `
      }
    }
  },
  render: () => (
    <div style={{ display: 'grid', gap: '32px' }}>
      <div>
        <h3
          style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}
        >
          Token Bindings Across All Ratios
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}
        >
          <ImagePlaceholder
            ratio="3:4"
            alt="3:4 ratio with token-bound fill and corner radius"
          />
          <ImagePlaceholder
            ratio="4:5"
            alt="4:5 ratio with token-bound fill and corner radius"
          />
          <ImagePlaceholder
            ratio="5:4"
            alt="5:4 ratio with token-bound fill and corner radius"
          />
          <ImagePlaceholder
            ratio="4:3"
            alt="4:3 ratio with token-bound fill and corner radius"
          />
          <ImagePlaceholder
            ratio="3:2"
            alt="3:2 ratio with token-bound fill and corner radius"
          />
          <ImagePlaceholder
            ratio="2:3"
            alt="2:3 ratio with token-bound fill and corner radius"
          />
        </div>
      </div>
      <div>
        <h3
          style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 'bold' }}
        >
          Dark Mode (Token Values Reversed)
        </h3>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          In dark mode, the `surface` token resolves to a darker neutral value.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            backgroundColor: '#1a1a1a',
            padding: '16px',
            borderRadius: '8px'
          }}
        >
          <div
            style={{
              backgroundColor: '#2a2a2a',
              padding: '16px',
              borderRadius: '8px'
            }}
          >
            <ImagePlaceholder ratio="1:1" alt="1:1 ratio in dark mode" />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
              Dark mode surface value
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

// Visual regression matrix
export const VisualRegressionMatrix: Story = {
  parameters: {
    layout: 'padded'
  },
  render: () => {
    const ratios: Array<
      | 'custom'
      | '1:1'
      | '3:2'
      | '2:3'
      | '3:4'
      | '4:3'
      | '4:5'
      | '5:4'
      | '16:9'
      | '9:16'
    > = [
      'custom',
      '9:16',
      '2:3',
      '3:4',
      '4:5',
      '1:1',
      '5:4',
      '4:3',
      '3:2',
      '16:9'
    ];

    return (
      <div style={{ display: 'grid', gap: '24px' }}>
        <div>
          <h3
            style={{
              marginBottom: '16px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            All 10 Aspect-Ratio Variants
          </h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>
            Verify: Fixed 320px width across all variants. Heights adjust
            proportionally.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}
        >
          {ratios.map((ratio) => (
            <div
              key={ratio}
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <ImagePlaceholder
                ratio={ratio}
                alt={`${ratio} aspect ratio variant`}
              />
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}
              >
                {ratio}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};
