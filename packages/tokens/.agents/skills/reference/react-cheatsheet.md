---
name: react-cheatsheet
description: Quick reference for React patterns, hooks, TypeScript types, and common scenarios.
license: MIT
metadata:
  category: reference
  agents: [Architect, Code, Testing]
  autonomy: informational
  portable: true
---

# React Quick Reference

## Hooks Cheatsheet

| Hook               | Purpose               | Returns                        |
| ------------------ | --------------------- | ------------------------------ |
| `useState`         | Local state           | `[value, setValue]`            |
| `useReducer`       | Complex state logic   | `[state, dispatch]`            |
| `useContext`       | Consume context       | Context value                  |
| `useRef`           | Mutable ref / DOM ref | `{ current: T }`               |
| `useEffect`        | Side effects          | Cleanup function               |
| `useLayoutEffect`  | Sync DOM mutations    | Cleanup function               |
| `useMemo`          | Memoize value         | Memoized value                 |
| `useCallback`      | Memoize function      | Memoized function              |
| `useId`            | Generate unique ID    | String ID                      |
| `useTransition`    | Non-blocking updates  | `[isPending, startTransition]` |
| `useDeferredValue` | Defer value update    | Deferred value                 |

---

## Component Patterns

### Functional Component

```tsx
interface Props {
  title: string;
  children: React.ReactNode;
}

const Component = ({ title, children }: Props) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
);
```

### Forward Ref

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <input ref={ref} {...props} />
));
```

### Compound Component

```tsx
const Card = ({ children }) => <div>{children}</div>;
Card.Header = ({ children }) => <header>{children}</header>;
Card.Body = ({ children }) => <main>{children}</main>;
```

### Polymorphic

```tsx
<Button as="a" href="/link">Link Button</Button>
<Button as="button" type="submit">Submit</Button>
```

### Controlled vs Uncontrolled

```tsx
// Controlled
<input value={value} onChange={(e) => setValue(e.target.value)} />

// Uncontrolled
<input defaultValue="initial" ref={inputRef} />
```

---

## Event Types

```tsx
// Mouse events
onClick: React.MouseEvent<HTMLButtonElement>;
onMouseEnter: React.MouseEvent<HTMLElement>;
onMouseLeave: React.MouseEvent<HTMLElement>;

// Keyboard events
onKeyDown: React.KeyboardEvent<HTMLInputElement>;
onKeyUp: React.KeyboardEvent<HTMLInputElement>;

// Form events
onChange: React.ChangeEvent<HTMLInputElement>;
onSubmit: React.FormEvent<HTMLFormElement>;
onFocus: React.FocusEvent<HTMLInputElement>;
onBlur: React.FocusEvent<HTMLInputElement>;

// Clipboard
onCopy: React.ClipboardEvent<HTMLElement>;
onPaste: React.ClipboardEvent<HTMLElement>;

// Drag
onDragStart: React.DragEvent<HTMLElement>;
onDrop: React.DragEvent<HTMLElement>;
```

---

## Children Types

```tsx
// Any renderable content
children: React.ReactNode;

// Single element only
children: React.ReactElement;

// String only
children: string;

// Function as child (render prop)
children: (data: T) => React.ReactNode;

// Multiple specific children
children: [React.ReactElement, React.ReactElement];
```

---

## Prop Types

```tsx
// Optional with default
interface Props {
  variant?: 'primary' | 'secondary';
}
const Component = ({ variant = 'primary' }: Props) => {};

// Required
interface Props {
  id: string;
}

// Union types
type Props =
  | { mode: 'button'; onClick: () => void }
  | { mode: 'link'; href: string };

// Extending HTML attributes
interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary';
}
```

---

## CSS Modules

```tsx
import styles from './Component.module.css';

// Single class
<div className={styles.container} />

// Multiple classes
<div className={`${styles.container} ${styles.active}`} />

// With clsx
import clsx from 'clsx';
<div className={clsx(styles.container, isActive && styles.active)} />
```

---

## CSS Variables in JSX

```tsx
// Inline style with CSS var
<div style={{ color: 'var(--text-primary)' }} />

// Dynamic CSS variables
<div style={{ '--button-size': isLarge ? '48px' : '32px' } as React.CSSProperties} />
```

---

## Common Patterns

### Conditional Rendering

```tsx
// && operator (falsy pitfall: 0 && renders '0')
{
  items.length > 0 && <List items={items} />;
}

// Ternary
{
  isLoading ? <Spinner /> : <Content />;
}

// Early return
if (error) return <Error />;
if (isLoading) return <Loading />;
return <Content />;
```

### List Rendering

```tsx
{
  items.map((item) => <Item key={item.id} {...item} />);
}
```

### Event Handlers

```tsx
// Inline (creates new function each render)
<button onClick={() => handleClick(id)}>Click</button>;

// Memoized (stable reference)
const handleClick = useCallback(
  (e) => {
    // handler logic
  },
  [dependencies]
);
```

### Debounced Input

```tsx
const [value, setValue] = useState('');
const debouncedValue = useDeferredValue(value);

useEffect(() => {
  search(debouncedValue);
}, [debouncedValue]);
```

---

## Accessibility Quick Reference

### ARIA Roles

| Element    | Role          |
| ---------- | ------------- |
| `<nav>`    | navigation    |
| `<main>`   | main          |
| `<aside>`  | complementary |
| `<button>` | button        |
| `<dialog>` | dialog        |
| `<table>`  | table         |

### Common ARIA Attributes

```tsx
// Labels
aria-label="Search"
aria-labelledby="title-id"
aria-describedby="description-id"

// States
aria-expanded={isOpen}
aria-selected={isSelected}
aria-disabled={isDisabled}
aria-hidden={isHidden}
aria-pressed={isPressed}
aria-checked={isChecked}

// Live regions
aria-live="polite" // or "assertive"
aria-atomic="true"
```

### Keyboard Navigation

```tsx
// Common key codes
key === 'Enter';
key === 'Escape';
key === ' '; // Space
key === 'Tab';
key === 'ArrowUp';
key === 'ArrowDown';
key === 'ArrowLeft';
key === 'ArrowRight';
key === 'Home';
key === 'End';
```

### Focus Management

```tsx
// Auto-focus
<input autoFocus />

// Programmatic focus
const ref = useRef<HTMLInputElement>(null);
useEffect(() => ref.current?.focus(), []);

// Focus visible (keyboard only)
:focus-visible { outline: 2px solid blue; }
```

---

## Performance Patterns

### Memoization

```tsx
// Memoize component
const MemoizedComponent = memo(Component);

// Memoize value
const computed = useMemo(() => expensiveCalc(a, b), [a, b]);

// Memoize callback
const handleClick = useCallback(() => doSomething(id), [id]);
```

### Code Splitting

```tsx
const LazyComponent = lazy(() => import('./Component'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>;
```

---

## Testing Patterns

```tsx
// Render
render(<Component />);

// Query (getBy throws, queryBy returns null, findBy is async)
screen.getByRole('button', { name: /submit/i });
screen.getByText(/hello/i);
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter email');
screen.getByTestId('submit-btn');

// User events
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');
await user.keyboard('{Enter}');

// Assertions
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('aria-expanded', 'true');
expect(element).toHaveTextContent('Hello');
```
