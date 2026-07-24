import React from 'react';
import { fn } from 'storybook/test';

import { Input } from '@ds/components-react';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
export default {
  title: 'Components/Input',
  component: Input,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'padded'
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the input'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input'
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type'
    },
    value: {
      control: 'text',
      description: 'Current input value'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input'
    },
    required: {
      control: 'boolean',
      description: 'Mark input as required'
    },
    name: {
      control: 'text',
      description: 'Input name attribute'
    },
    id: {
      control: 'text',
      description: 'Input id attribute'
    }
  },
  // Use `fn` to spy on the onChange arg, which will appear in the actions panel once invoked
  args: { onChange: fn() }
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {
    label: 'First name',
    placeholder: 'Enter your first name',
    type: 'text'
  }
};

export const WithValue = {
  args: {
    label: 'Email address',
    placeholder: 'Enter your email',
    type: 'email',
    value: 'user@example.com'
  }
};

export const Required = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    required: true
  }
};

export const Disabled = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    disabled: true,
    value: 'readonly_user'
  }
};

export const DisabledWithoutValue = {
  args: {
    label: 'Disabled field',
    placeholder: 'This field is disabled',
    disabled: true
  }
};

export const PasswordInput = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true
  }
};

export const NumberInput = {
  args: {
    label: 'Quantity',
    placeholder: 'Enter quantity',
    type: 'number',
    required: true
  }
};

export const PhoneInput = {
  args: {
    label: 'Phone number',
    placeholder: '+1 (555) 123-4567',
    type: 'tel'
  }
};

export const UrlInput = {
  args: {
    label: 'Website',
    placeholder: 'https://example.com',
    type: 'url'
  }
};

export const WithoutLabel = {
  args: {
    placeholder: 'No label input',
    type: 'text'
  }
};

export const LargeForm = {
  render: (args) => (
    <form
      style={{
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      <Input
        label="First name"
        placeholder="Enter first name"
        required
        {...args}
      />
      <Input
        label="Last name"
        placeholder="Enter last name"
        required
        {...args}
      />
      <Input
        label="Email"
        type="email"
        placeholder="your.email@example.com"
        required
        {...args}
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="+1 (555) 123-4567"
        {...args}
      />
      <Input
        label="Website"
        type="url"
        placeholder="https://example.com"
        {...args}
      />
      <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
        <button
          type="submit"
          style={{
            padding: '10px 24px',
            backgroundColor: '#0f4aa2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Submit
        </button>
        <button
          type="reset"
          style={{
            padding: '10px 24px',
            backgroundColor: '#f2f2f2',
            color: '#1a1a1a',
            border: '1px solid #cccccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Reset
        </button>
      </div>
    </form>
  )
};

export const Interactive = {
  render: (args) => {
    const [values, setValues] = React.useState({
      firstName: '',
      email: ''
    });

    return (
      <div
        style={{
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <Input
          label="First name"
          placeholder="Enter first name"
          value={values.firstName}
          onChange={(e) => setValues({ ...values, firstName: e.target.value })}
          {...args}
        />
        <Input
          label="Email"
          type="email"
          placeholder="Enter email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          {...args}
        />
        {(values.firstName || values.email) && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f3f6fa',
              borderLeft: '4px solid #0f4aa2',
              color: '#1a1a1a'
            }}
          >
            <strong>Current values:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {values.firstName && <li>First name: {values.firstName}</li>}
              {values.email && <li>Email: {values.email}</li>}
            </ul>
          </div>
        )}
      </div>
    );
  },
  args: {
    onChange: fn()
  }
};
