---
name: component-patterns
description: Design patterns for building composable, maintainable React components. Covers compound components, render props, higher-order components, and controlled/uncontrolled patterns.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# React Component Patterns

## Purpose

Guide implementation of proven React component patterns for building flexible, reusable design system components that work with Figma Make.

## Preconditions

- TypeScript project
- React 18+
- Understanding of React hooks

---

## Pattern 1: Compound Components

**Use When**: Building components with related parts that share state.

### Example: Accordion Component

```typescript
// Types
interface AccordionContextValue {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
  multiple?: boolean;
}

// Context
const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>');
  }
  return context;
};

// Root component
interface AccordionProps {
  children: React.ReactNode;
  multiple?: boolean;
  defaultExpanded?: string[];
}

const Accordion = ({ children, multiple = false, defaultExpanded = [] }: AccordionProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [multiple]);

  const value = useMemo(
    () => ({ expandedItems, toggleItem, multiple }),
    [expandedItems, toggleItem, multiple]
  );

  return (
    <AccordionContext.Provider value={value}>
      <div role="region">{children}</div>
    </AccordionContext.Provider>
  );
};

// Item component
interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
}

const AccordionItem = ({ children, value }: AccordionItemProps) => {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(value);

  return (
    <div data-state={isExpanded ? 'open' : 'closed'}>
      {children}
    </div>
  );
};

// Trigger component
interface AccordionTriggerProps {
  children: React.ReactNode;
  value: string;
}

const AccordionTrigger = ({ children, value }: AccordionTriggerProps) => {
  const { expandedItems, toggleItem } = useAccordion();
  const isExpanded = expandedItems.has(value);
  const contentId = useId();

  return (
    <button
      type="button"
      aria-expanded={isExpanded}
      aria-controls={contentId}
      onClick={() => toggleItem(value)}
    >
      {children}
    </button>
  );
};

// Content component
interface AccordionContentProps {
  children: React.ReactNode;
  value: string;
}

const AccordionContent = ({ children, value }: AccordionContentProps) => {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(value);
  const id = useId();

  if (!isExpanded) return null;

  return (
    <div id={id} role="region">
      {children}
    </div>
  );
};

// Export as compound component
export const AccordionCompound = Object.assign(Accordion, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

// Usage
<AccordionCompound multiple>
  <AccordionCompound.Item value="item-1">
    <AccordionCompound.Trigger value="item-1">Section 1</AccordionCompound.Trigger>
    <AccordionCompound.Content value="item-1">Content 1</AccordionCompound.Content>
  </AccordionCompound.Item>
  <AccordionCompound.Item value="item-2">
    <AccordionCompound.Trigger value="item-2">Section 2</AccordionCompound.Trigger>
    <AccordionCompound.Content value="item-2">Content 2</AccordionCompound.Content>
  </AccordionCompound.Item>
</AccordionCompound>
```

---

## Pattern 2: Polymorphic Components (as prop)

**Use When**: Component needs to render different HTML elements or components.

```typescript
// Types for polymorphic component
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

// Box component implementation
interface BoxOwnProps {
  padding?: 'sm' | 'md' | 'lg';
  bg?: string;
}

type BoxProps<C extends React.ElementType> = PolymorphicComponentPropWithRef<
  C,
  BoxOwnProps
>;

type BoxComponent = <C extends React.ElementType = 'div'>(
  props: BoxProps<C>
) => React.ReactElement | null;

export const Box: BoxComponent = forwardRef(
  <C extends React.ElementType = 'div'>(
    { as, padding, bg, children, style, ...props }: BoxProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || 'div';

    return (
      <Component
        ref={ref}
        style={{
          padding: padding && `var(--spacing-${padding})`,
          backgroundColor: bg,
          ...style,
        }}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

// Usage
<Box padding="lg">Default div</Box>
<Box as="section" padding="md">Section element</Box>
<Box as="a" href="/link" padding="sm">Link element</Box>
<Box as={Link} to="/route">React Router Link</Box>
```

---

## Pattern 3: Controlled & Uncontrolled

**Use When**: Component can work with or without external state control.

```typescript
// Utility hook for controlled/uncontrolled state
function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (newValue: T) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    },
    [isControlled, onChange]
  );

  return [currentValue, setValue];
}

// Toggle component using pattern
interface ToggleProps {
  // Controlled mode
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  // Uncontrolled mode
  defaultPressed?: boolean;
  // Common props
  disabled?: boolean;
  children: React.ReactNode;
}

export const Toggle = ({
  pressed,
  onPressedChange,
  defaultPressed = false,
  disabled = false,
  children,
}: ToggleProps) => {
  const [isPressed, setIsPressed] = useControllableState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isPressed}
      aria-disabled={disabled}
      disabled={disabled}
      data-state={isPressed ? 'on' : 'off'}
      onClick={() => !disabled && setIsPressed(!isPressed)}
    >
      {children}
    </button>
  );
};

// Uncontrolled usage
<Toggle defaultPressed={false}>Dark Mode</Toggle>

// Controlled usage
const [isDark, setIsDark] = useState(false);
<Toggle pressed={isDark} onPressedChange={setIsDark}>Dark Mode</Toggle>
```

---

## Pattern 4: Render Props

**Use When**: Need maximum flexibility in what gets rendered.

```typescript
interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  children: (position: MousePosition) => React.ReactNode;
}

const MouseTracker = ({ children }: MouseTrackerProps) => {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{children(position)}</>;
};

// Usage
<MouseTracker>
  {({ x, y }) => (
    <div>
      Mouse position: ({x}, {y})
    </div>
  )}
</MouseTracker>
```

---

## Pattern 5: Slots Pattern

**Use When**: Component has multiple named insertion points.

```typescript
// Types
interface DialogSlots {
  header?: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

interface DialogProps extends DialogSlots {
  isOpen: boolean;
  onClose: () => void;
}

// Implementation
const Dialog = ({ isOpen, onClose, header, body, footer }: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        {header && (
          <header className="dialog-header">
            {header}
          </header>
        )}
        <div className="dialog-body">
          {body}
        </div>
        {footer && (
          <footer className="dialog-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

// Usage
<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  header={<h2>Dialog Title</h2>}
  body={<p>Main content goes here</p>}
  footer={
    <div>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit}>Confirm</Button>
    </div>
  }
/>
```

---

## Pattern 6: Collection Pattern (Lists)

**Use When**: Building lists, menus, or selectable item collections.

```typescript
interface Item {
  id: string;
  label: string;
  disabled?: boolean;
}

interface ListboxContextValue {
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  items: Item[];
}

const ListboxContext = createContext<ListboxContextValue | null>(null);

interface ListboxProps {
  items: Item[];
  value?: string;
  onChange?: (value: string) => void;
  'aria-label': string;
}

export const Listbox = ({ items, value, onChange, 'aria-label': ariaLabel }: ListboxProps) => {
  const [selectedId, setSelectedId] = useControllableState({
    value,
    defaultValue: items[0]?.id ?? null,
    onChange,
  });
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = items.findIndex(i => i.id === focusedId);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = Math.min(currentIndex + 1, items.length - 1);
        setFocusedId(items[nextIndex].id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        setFocusedId(items[prevIndex].id);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedId) setSelectedId(focusedId);
        break;
    }
  };

  const contextValue = useMemo(
    () => ({ selectedId, setSelectedId, focusedId, setFocusedId, items }),
    [selectedId, focusedId, items]
  );

  return (
    <ListboxContext.Provider value={contextValue}>
      <ul
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => !focusedId && setFocusedId(items[0]?.id ?? null)}
        onBlur={() => setFocusedId(null)}
      >
        {items.map(item => (
          <ListboxOption key={item.id} item={item} />
        ))}
      </ul>
    </ListboxContext.Provider>
  );
};

const ListboxOption = ({ item }: { item: Item }) => {
  const { selectedId, setSelectedId, focusedId, setFocusedId } =
    useContext(ListboxContext)!;

  const isSelected = selectedId === item.id;
  const isFocused = focusedId === item.id;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-disabled={item.disabled}
      data-focused={isFocused || undefined}
      onClick={() => !item.disabled && setSelectedId(item.id)}
      onMouseEnter={() => setFocusedId(item.id)}
    >
      {item.label}
    </li>
  );
};
```

---

## Pattern 7: forwardRef with Generic Types

**Use When**: Component needs ref forwarding AND generic type support.

```typescript
// Generic forwardRef helper
function fixedForwardRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactElement
): (props: P & React.RefAttributes<T>) => React.ReactElement {
  return forwardRef(render) as any;
}

// Generic List component with ref
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export const List = fixedForwardRef(
  <T,>(
    { items, renderItem, keyExtractor }: ListProps<T>,
    ref: React.Ref<HTMLUListElement>
  ) => {
    return (
      <ul ref={ref}>
        {items.map((item, index) => (
          <li key={keyExtractor(item)}>
            {renderItem(item, index)}
          </li>
        ))}
      </ul>
    );
  }
);

// Usage (TypeScript infers T)
<List
  items={users}
  keyExtractor={user => user.id}
  renderItem={user => <UserCard user={user} />}
/>
```

---

## Best Practices Summary

| Pattern                 | Use When                      | Avoid When               |
| ----------------------- | ----------------------------- | ------------------------ |
| Compound Components     | Related parts share state     | Simple components        |
| Polymorphic             | Multiple element types needed | Fixed element type       |
| Controlled/Uncontrolled | Flexible state ownership      | Always external control  |
| Render Props            | Maximum render flexibility    | Simple children needed   |
| Slots                   | Multiple named sections       | Single children location |
| Collection              | Lists with selection/focus    | Static content lists     |
