---
name: npm-packages
description: Curated list of battle-tested npm packages for React component development, organized by category with usage guidance.
license: MIT
metadata:
  category: reference
  agents: [Architect, Code, Testing]
  autonomy: informational
  portable: true
---

# NPM Packages Reference

## Curated packages for React component development. All packages are well-maintained and production-ready.

---

## Core Utilities

### clsx / classnames

**Purpose**: Conditional className construction

```bash
npm install clsx
```

```tsx
import clsx from 'clsx';

const Button = ({ primary, large }) => (
  <button
    className={clsx('btn', {
      'btn-primary': primary,
      'btn-large': large
    })}
  >
    Click
  </button>
);
```

### lodash-es

**Purpose**: Utility functions (tree-shakeable ES modules)

```bash
npm install lodash-es
npm install -D @types/lodash-es
```

```tsx
import { debounce, throttle, merge, pick, omit } from 'lodash-es';

// Debounced search
const handleSearch = debounce((term) => search(term), 300);

// Throttled scroll handler
const handleScroll = throttle(updatePosition, 100);
```

### nanoid

**Purpose**: Tiny unique ID generator

```bash
npm install nanoid
```

```tsx
import { nanoid } from 'nanoid';

// Generate unique IDs for form elements
const id = `input-${nanoid(8)}`; // "input-V1StGXR8"
```

---

## Accessibility

### @radix-ui/react-\*

**Purpose**: Unstyled, accessible primitives

```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tooltip
# etc.
```

```tsx
import * as Dialog from '@radix-ui/react-dialog';

const Modal = () => (
  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="overlay" />
      <Dialog.Content className="content">
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
```

**Available primitives**: Dialog, DropdownMenu, Tooltip, Popover, Tabs, Accordion, Checkbox, RadioGroup, Select, Slider, Switch, Toggle, ContextMenu, HoverCard, AlertDialog, NavigationMenu

### @react-aria/\*

**Purpose**: Adobe's accessibility hooks

```bash
npm install @react-aria/button @react-aria/focus
```

```tsx
import { useButton } from '@react-aria/button';
import { useFocusRing } from '@react-aria/focus';

const Button = (props) => {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <button
      {...buttonProps}
      {...focusProps}
      className={clsx('btn', isFocusVisible && 'focus-visible')}
      ref={ref}
    >
      {props.children}
    </button>
  );
};
```

### focus-trap-react

**Purpose**: Focus trapping for modals/dialogs

```bash
npm install focus-trap-react
```

```tsx
import FocusTrap from 'focus-trap-react';

const Modal = ({ isOpen, onClose, children }) => (
  <FocusTrap active={isOpen}>
    <div role="dialog" aria-modal="true">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  </FocusTrap>
);
```

---

## Animation

### framer-motion

**Purpose**: Production-ready animations

```bash
npm install framer-motion
```

```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Basic animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// With AnimatePresence for exit animations
<AnimatePresence mode="wait">
  {isOpen && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>
```

### @react-spring/web

**Purpose**: Physics-based animations

```bash
npm install @react-spring/web
```

```tsx
import { useSpring, animated } from '@react-spring/web';

const AnimatedBox = ({ isVisible }) => {
  const springs = useSpring({
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(-40px)'
  });

  return <animated.div style={springs}>Content</animated.div>;
};
```

---

## Forms

### react-hook-form

**Purpose**: Performant forms with validation

```bash
npm install react-hook-form
```

```tsx
import { useForm } from 'react-hook-form';

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email required' })} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Submit</button>
    </form>
  );
};
```

### @hookform/resolvers + zod

**Purpose**: Schema validation for react-hook-form

```bash
npm install @hookform/resolvers zod
```

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
});

type FormData = z.infer<typeof schema>;

const Form = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (/* form JSX */);
};
```

---

## State Management

### zustand

**Purpose**: Simple state management

```bash
npm install zustand
```

```tsx
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));

const Counter = () => {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
};
```

### jotai

**Purpose**: Primitive atomic state

```bash
npm install jotai
```

```tsx
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);
const doubleCountAtom = atom((get) => get(countAtom) * 2);

const Counter = () => {
  const [count, setCount] = useAtom(countAtom);
  const [doubleCount] = useAtom(doubleCountAtom);

  return (
    <div>
      <span>
        {count} (x2 = {doubleCount})
      </span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
    </div>
  );
};
```

---

## Testing

### @testing-library/react

**Purpose**: React testing utilities

```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

test('button click increments count', () => {
  render(<Counter />);

  const button = screen.getByRole('button', { name: /increment/i });
  fireEvent.click(button);

  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### @testing-library/user-event

**Purpose**: Realistic user interactions

```bash
npm install -D @testing-library/user-event
```

```tsx
import userEvent from '@testing-library/user-event';

test('form submission', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  expect(await screen.findByText('Welcome')).toBeInTheDocument();
});
```

### vitest

**Purpose**: Fast unit testing (Vite-native)

```bash
npm install -D vitest
```

```tsx
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
```

### jest-axe

**Purpose**: Accessibility assertions

```bash
npm install -D jest-axe @types/jest-axe
```

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### msw

**Purpose**: API mocking

```bash
npm install -D msw
```

```tsx
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  http.get('/api/user', () => {
    return HttpResponse.json({ name: 'John' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Icons

### lucide-react

**Purpose**: Modern icon set (Feather icons successor)

```bash
npm install lucide-react
```

```tsx
import { Search, Menu, X, ChevronRight } from 'lucide-react';

const Icon = () => <Search size={24} color="currentColor" strokeWidth={2} />;
```

### @heroicons/react

**Purpose**: Tailwind's icon set

```bash
npm install @heroicons/react
```

```tsx
import { BeakerIcon } from '@heroicons/react/24/solid';
import { BeakerIcon as BeakerOutline } from '@heroicons/react/24/outline';

const Icon = () => <BeakerIcon className="h-6 w-6 text-blue-500" />;
```

---

## Date/Time

### date-fns

**Purpose**: Modern date utility library (tree-shakeable)

```bash
npm install date-fns
```

```tsx
import { format, parseISO, formatDistanceToNow } from 'date-fns';

const date = parseISO('2024-01-15T10:30:00Z');
format(date, 'MMMM d, yyyy'); // "January 15, 2024"
formatDistanceToNow(date); // "3 months ago"
```

---

## Data Fetching

### @tanstack/react-query

**Purpose**: Server state management

```bash
npm install @tanstack/react-query
```

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const UserProfile = ({ userId }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <Profile user={data} />;
};
```

### swr

**Purpose**: Vercel's data fetching library

```bash
npm install swr
```

```tsx
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const Profile = () => {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);

  if (error) return <div>Failed to load</div>;
  if (isLoading) return <div>Loading...</div>;
  return <div>Hello {data.name}!</div>;
};
```

---

## Virtualization

### @tanstack/react-virtual

**Purpose**: Virtualize long lists

```bash
npm install @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const VirtualList = ({ items }) => {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              height: virtualItem.size
            }}
          >
            {items[virtualItem.index]}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Modals & Overlays

### @floating-ui/react

**Purpose**: Positioning engine for tooltips/popovers

```bash
npm install @floating-ui/react
```

```tsx
import { useFloating, shift, offset, flip } from '@floating-ui/react';

const Tooltip = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles } = useFloating({
    middleware: [offset(8), flip(), shift()]
  });

  return (
    <>
      <span
        ref={refs.setReference}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </span>
      {isOpen && (
        <div ref={refs.setFloating} style={floatingStyles}>
          {content}
        </div>
      )}
    </>
  );
};
```

---

## Table of Recommendations

| Need                  | Package                   | Size       |
| --------------------- | ------------------------- | ---------- |
| Class names           | `clsx`                    | 228B       |
| Unique IDs            | `nanoid`                  | 130B       |
| Accessible primitives | `@radix-ui/*`             | varies     |
| Animation             | `framer-motion`           | 47kB       |
| Forms                 | `react-hook-form`         | 8.6kB      |
| Validation            | `zod`                     | 13kB       |
| State (simple)        | `zustand`                 | 1.2kB      |
| State (atomic)        | `jotai`                   | 2.3kB      |
| Testing               | `@testing-library/react`  | dev        |
| Icons                 | `lucide-react`            | tree-shake |
| Dates                 | `date-fns`                | tree-shake |
| Data fetching         | `@tanstack/react-query`   | 11kB       |
| Virtualization        | `@tanstack/react-virtual` | 3.7kB      |
| Positioning           | `@floating-ui/react`      | 7.8kB      |
