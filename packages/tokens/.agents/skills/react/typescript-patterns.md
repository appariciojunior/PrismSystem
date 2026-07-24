---
name: typescript-patterns
description: TypeScript patterns for React components including props typing, generics, discriminated unions, and type utilities.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# TypeScript Patterns for React

## Purpose

Provide comprehensive TypeScript patterns for building type-safe React components in a design system. Covers props, events, generics, and advanced patterns.

## Preconditions

- TypeScript 5.0+
- React 18+ types installed
- `"strict": true` in tsconfig.json

---

## Basic Props Typing

### Simple Component Props

```typescript
// Explicit interface (recommended for complex props)
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
}

// Using type alias (for simpler props or unions)
type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
};
```

### Extending HTML Element Props

```typescript
// Extend native button props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

// Component can receive ALL button attributes plus custom props
const Button = ({ variant, isLoading, children, ...props }: ButtonProps) => (
  <button disabled={isLoading || props.disabled} {...props}>
    {isLoading ? <Spinner /> : children}
  </button>
);
```

### Component Props with Refs

```typescript
// For components using forwardRef
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
      {error && <span>{error}</span>}
    </div>
  )
);
```

---

## Component Return Types

```typescript
// React.FC (avoid - doesn't support generics, implicit children)
// ❌ Not recommended
const Button: React.FC<ButtonProps> = (props) => <button {...props} />;

// ✅ Explicit return type (recommended)
const Button = (props: ButtonProps): React.ReactElement => {
  return <button {...props} />;
};

// ✅ Or let TypeScript infer (also good)
const Button = (props: ButtonProps) => {
  return <button {...props} />;
};

// Can return null (for conditional rendering)
const Modal = (props: ModalProps): React.ReactElement | null => {
  if (!props.isOpen) return null;
  return <div>{props.children}</div>;
};
```

---

## Children Types

```typescript
// Any renderable content (most common)
interface ContainerProps {
  children: React.ReactNode;
}

// Single React element only
interface WrapperProps {
  children: React.ReactElement;
}

// String or number only
interface TextProps {
  children: string | number;
}

// Function as children (render prop)
interface TrackerProps {
  children: (data: { x: number; y: number }) => React.ReactNode;
}

// Specific element types
interface ListProps {
  children: React.ReactElement<ItemProps> | React.ReactElement<ItemProps>[];
}

// Optional children
interface CardProps {
  children?: React.ReactNode;
  title: string;
}
```

---

## Event Handler Types

```typescript
// Click events
interface ButtonProps {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  // Or explicit:
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Form events
interface FormProps {
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

// Input events
interface InputProps {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

// Generic event handler with value
interface SelectProps {
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
}
```

---

## Discriminated Unions

**Use When**: Props change based on a type/variant discriminator.

```typescript
// Button can be 'button' or 'link', different props for each
type ButtonAsButton = {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  href?: never;
};

type ButtonAsLink = {
  as: 'link';
  href: string;
  type?: never;
  target?: '_blank' | '_self';
};

type ButtonProps = (ButtonAsButton | ButtonAsLink) & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

const Button = (props: ButtonProps) => {
  if (props.as === 'link') {
    // TypeScript knows href exists here
    return <a href={props.href} target={props.target}>{props.children}</a>;
  }
  // TypeScript knows type exists here
  return <button type={props.type}>{props.children}</button>;
};

// Usage
<Button type="submit">Submit</Button>           // ✅ Valid
<Button as="link" href="/page">Link</Button>    // ✅ Valid
<Button as="link" type="submit">Bad</Button>    // ❌ Type error
<Button href="/page">Bad</Button>               // ❌ Type error
```

---

## Generic Components

### Basic Generic Component

```typescript
// Generic select component
interface SelectProps<T> {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function Select<T>({
  items,
  value,
  onChange,
  renderItem,
  keyExtractor,
}: SelectProps<T>) {
  return (
    <div role="listbox">
      {items.map(item => (
        <div
          key={keyExtractor(item)}
          role="option"
          aria-selected={item === value}
          onClick={() => onChange(item)}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

// Usage - TypeScript infers T
<Select
  items={[{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]}
  value={selected}
  onChange={setSelected}
  renderItem={user => user.name}
  keyExtractor={user => user.id}
/>
```

### Generic Component with Constraints

```typescript
// Constrain T to have an 'id' property
interface HasId {
  id: string | number;
}

interface ListProps<T extends HasId> {
  items: T[];
  selectedId?: T['id'];
  onSelect?: (item: T) => void;
}

function List<T extends HasId>({ items, selectedId, onSelect }: ListProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          aria-selected={item.id === selectedId}
          onClick={() => onSelect?.(item)}
        >
          {/* item.id is guaranteed to exist */}
          Item {item.id}
        </li>
      ))}
    </ul>
  );
}
```

### Generic forwardRef

```typescript
// Helper type for generic forwardRef
type ForwardRefComponent<T, P = {}> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

// Or use a wrapper function
function genericForwardRef<T, P = {}>(
  render: (props: P, ref: React.ForwardedRef<T>) => React.ReactNode
): ForwardRefComponent<T, P> {
  return forwardRef(render) as ForwardRefComponent<T, P>;
}

// Usage
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
}

const Table = genericForwardRef<HTMLTableElement, TableProps<unknown>>(
  (props, ref) => {
    return <table ref={ref}>...</table>;
  }
);
```

---

## Utility Types for React

### Built-in React Types

```typescript
// Extract props from a component
type ButtonElementProps = React.ComponentProps<'button'>;
type MyButtonProps = React.ComponentProps<typeof MyButton>;

// Props with ref
type ButtonPropsWithRef = React.ComponentPropsWithRef<'button'>;

// Without ref
type ButtonPropsWithoutRef = React.ComponentPropsWithoutRef<'button'>;

// Get ref type
type ButtonRef = React.ElementRef<'button'>; // HTMLButtonElement
type DivRef = React.ElementRef<'div'>; // HTMLDivElement
```

### Custom Utility Types

```typescript
// Make all props optional except specified ones
type RequiredProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Example: variant is required, others optional
type ButtonProps = RequiredProps<
  {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
  },
  'variant'
>;

// Override specific props
type Override<T, U> = Omit<T, keyof U> & U;

// Example: Override button's onClick
type CustomButtonProps = Override<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  { onClick: (id: string) => void }
>;

// Extract non-undefined props
type DefinedProps<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};
```

---

## Context Typing

```typescript
// Define context type
interface ThemeContextValue {
  mode: 'light' | 'dark';
  tokens: TokenSet;
  setMode: (mode: 'light' | 'dark') => void;
}

// Create with null default for type safety
const ThemeContext = createContext<ThemeContextValue | null>(null);

// Type-safe hook with error
function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: 'light' | 'dark';
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<'light' | 'dark'>(defaultMode);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      tokens: mode === 'light' ? lightTokens : darkTokens,
      setMode,
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## Hook Return Types

```typescript
// Tuple return (like useState)
function useToggle(
  initial = false
): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

// Object return (more descriptive, easier to extend)
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

function useCounter(initial = 0): UseCounterReturn {
  const [count, setCount] = useState(initial);

  return {
    count,
    increment: useCallback(() => setCount((c) => c + 1), []),
    decrement: useCallback(() => setCount((c) => c - 1), []),
    reset: useCallback(() => setCount(initial), [initial])
  };
}

// Const assertion for literal types
function useStatus() {
  return {
    status: 'idle' as const, // Type: 'idle', not string
    isLoading: false
  };
}
```

---

## Typing CSS Properties

```typescript
// CSS custom properties
interface StyledBoxProps {
  padding?: React.CSSProperties['padding'];
  margin?: React.CSSProperties['margin'];
  color?: React.CSSProperties['color'];
}

// Allowing CSS custom properties
const Box = (props: { style?: React.CSSProperties & { [key: `--${string}`]: string } }) => (
  <div
    style={{
      '--card-padding': '16px',
      padding: 'var(--card-padding)',
      ...props.style,
    }}
  />
);

// Type-safe style objects
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
  } satisfies React.CSSProperties,
};
```

---

## Common Patterns

### Props Object Spreading

```typescript
// Separate custom props from HTML props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

const Input = ({
  label,
  error,
  containerClassName,
  className,
  ...inputProps
}: InputProps) => (
  <div className={containerClassName}>
    <label>{label}</label>
    <input className={className} {...inputProps} />
    {error && <span>{error}</span>}
  </div>
);
```

### Prop Omission

```typescript
// Remove props you handle internally
type BaseButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'type' | 'className'
> & {
  variant: 'primary' | 'secondary';
};

// Now 'type' and 'className' can't be passed
```

### Strict Children

```typescript
// Only allow specific child components
import { isValidElement, Children } from 'react';

interface TabsProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
}

function Tabs({ children }: TabsProps) {
  const tabs = Children.toArray(children).filter(
    (child): child is React.ReactElement<TabProps> =>
      isValidElement(child) && child.type === Tab
  );

  return <div>{tabs}</div>;
}
```

---

## Error Handling

| Error                                  | Solution                                       |
| -------------------------------------- | ---------------------------------------------- |
| "Property X does not exist"            | Add to interface or use type narrowing         |
| "Type Y is not assignable to type X"   | Check union types, use discriminated union     |
| "Generic type requires type arguments" | Provide explicit generic or let inference work |
| "Props drilling ref"                   | Use forwardRef pattern                         |
| "Children type mismatch"               | Use React.ReactNode for flexible children      |
