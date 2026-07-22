import React from 'react';
import { Link } from '../../packages/components-react/src/Link/Link';

const linkFigmaUrl =
  'https://www.figma.com/design/YOUR-FIGMA-FILE-KEY/Token-Library---Design-System?node-id=7481-1339';

export default {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    href: {
      control: 'text',
      description: 'The URL the link should navigate to'
    },
    intent: {
      options: ['primary', 'secondary'],
      control: { type: 'radio' },
      description: 'The link intent defined by the Figma component'
    },
    sentiment: {
      options: ['brand', 'utility'],
      control: { type: 'radio' },
      description: 'Typography sentiment from the Figma component'
    },
    size: {
      options: ['xsmall', 'small', 'medium', 'large'],
      control: { type: 'select' },
      description: 'Visual size variant from the Figma component'
    },
    state: {
      options: ['base', 'hover', 'pressed', 'visited', 'disabled', 'focus'],
      control: { type: 'select' },
      description: 'Preview interaction state styles'
    },
    leftIcon: {
      control: 'boolean',
      description: 'Toggles left icon visibility'
    },
    rightIcon: {
      control: 'boolean',
      description: 'Toggles right icon visibility'
    },
    leftIconName: {
      options: ['AccessibilityNew', 'ArrowRight', 'ArrowLeft', 'Plus', 'Close'],
      control: { type: 'select' },
      description: 'Selects the left icon'
    },
    rightIconName: {
      options: ['AccessibilityNew', 'ArrowRight', 'ArrowLeft', 'Plus', 'Close'],
      control: { type: 'select' },
      description: 'Selects the right icon'
    },
    inline: {
      control: 'boolean',
      description: 'Show or hide the underline.'
    },
    target: {
      options: ['_self', '_blank', '_parent', '_top'],
      control: { type: 'select' },
      description: 'Where to open the link'
    },
    onClick: {
      action: 'clicked',
      description: 'Callback when link is clicked'
    },
    children: {
      control: 'text',
      description: 'The link text content'
    }
  }
};

/**
 * Primary link intent in default state
 */
export const Default = {
  args: {
    href: '#',
    sentiment: 'brand',
    size: 'medium',
    intent: 'primary',
    state: 'base',
    leftIcon: true,
    rightIcon: true,
    leftIconName: 'AccessibilityNew',
    rightIconName: 'AccessibilityNew',
    children: 'Link'
  },
  parameters: {
    design: {
      type: 'figma',
      url: linkFigmaUrl
    }
  }
};

/**
 * Inline vs standalone link comparison
 */
export const InlineVariants = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontWeight: '600',
            fontFamily: 'sans-serif',
            fontSize: '14px'
          }}
        >
          inline=true (underlined — default):
        </p>
        <Link {...args} href="#" inline={true}>
          Inline link with underline
        </Link>
      </div>
      <div>
        <p
          style={{
            marginBottom: '0.5rem',
            fontWeight: '600',
            fontFamily: 'sans-serif',
            fontSize: '14px'
          }}
        >
          inline=false (standalone — no underline):
        </p>
        <Link {...args} href="#" inline={false}>
          Standalone link without underline
        </Link>
      </div>
    </div>
  ),
  args: {
    sentiment: 'brand',
    size: 'medium',
    intent: 'primary',
    children: 'Link'
  }
};

/**
 * Link that opens in a new tab/window
 */
export const External = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    intent: 'primary',
    children: 'Visit external website'
  }
};

/**
 * Secondary intent for less prominent links
 */
export const Secondary = {
  args: {
    href: '#',
    intent: 'secondary',
    children: 'Related article'
  }
};

/**
 * Multiple links in a paragraph context
 */
export const InContext = {
  render: (args) => (
    <p>
      This article contains{' '}
      <Link {...args} href="#section1">
        important information
      </Link>{' '}
      that you should read. You can also{' '}
      <Link {...args} href="#help" intent="secondary">
        get help
      </Link>{' '}
      or{' '}
      <Link {...args} href="#report" intent="secondary">
        report an issue
      </Link>
      .
    </p>
  ),
  args: {
    children: 'link text'
  }
};

/**
 * Navigation list with links
 */
export const NavigationList = {
  render: (args) => (
    <nav>
      <ul
        style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '2rem' }}
      >
        <li>
          <Link {...args} href="/home" intent="primary">
            Home
          </Link>
        </li>
        <li>
          <Link {...args} href="/about" intent="primary">
            About
          </Link>
        </li>
        <li>
          <Link {...args} href="/contact" intent="primary">
            Contact
          </Link>
        </li>
        <li>
          <Link {...args} href="/privacy" intent="secondary">
            Privacy Policy
          </Link>
        </li>
      </ul>
    </nav>
  ),
  args: {
    children: 'Navigation'
  }
};

/**
 * Link with custom styling
 */
export const WithCustomStyles = {
  args: {
    href: '#',
    intent: 'primary',
    children: 'Styled link',
    styles: {
      fontSize: '1.25rem',
      fontWeight: '600'
    }
  }
};

/**
 * Link that triggers a function on click
 */
export const Interactive = {
  args: {
    href: '#',
    intent: 'primary',
    children: 'Click me for an action',
    onClick: (e) => {
      e.preventDefault();
      alert('Link clicked!');
    }
  }
};

/**
 * Footer links section
 */
export const FooterSection = {
  render: (args) => (
    <footer
      style={{
        borderTop: '1px solid var(--border-primary, #999999)',
        padding: 'var(--ds-dimension-500, 16px)',
        marginTop: 'var(--ds-dimension-600, 24px)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>About</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link {...args} href="/about" intent="primary">
                Our Story
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link {...args} href="/team" intent="primary">
                Team
              </Link>
            </li>
            <li>
              <Link {...args} href="/careers" intent="primary">
                Careers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Support</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link {...args} href="/help" intent="primary">
                Help Center
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link {...args} href="/contact" intent="primary">
                Contact Us
              </Link>
            </li>
            <li>
              <Link {...args} href="/faq" intent="primary">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Legal</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link {...args} href="/terms" intent="secondary">
                Terms of Service
              </Link>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link {...args} href="/privacy" intent="secondary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link {...args} href="/cookies" intent="secondary">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  ),
  args: {
    children: 'Link'
  }
};

/**
 * All variants comparison
 */
export const AllVariants = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
          Primary Intent:
        </p>
        <Link {...args} href="#" intent="primary">
          This is a primary link
        </Link>
      </div>
      <div>
        <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
          Secondary Intent:
        </p>
        <Link {...args} href="#" intent="secondary">
          This is a secondary link
        </Link>
      </div>
    </div>
  ),
  args: {
    children: 'Link'
  }
};
