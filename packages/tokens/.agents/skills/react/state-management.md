---
name: state-management
description: Patterns for managing state in React components from local state to complex state machines and context patterns.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# State Management Patterns

## Purpose

Guide appropriate state management approaches for design system components, from simple local state to complex shared state patterns.

## Preconditions

- Understanding of React hooks
- Knowledge of component composition
- Familiarity with state machine concepts

---

## State Decision Tree

```
What kind of state do I need?
│
├─ Local UI state (one component)?
│  └─ useState
│
├─ Complex local state (multiple related values)?
│  └─ useReducer
│
├─ Shared between parent/child?
│  └─ Lift state up to common ancestor
│
├─ Shared across multiple components?
│  ├─ Few levels deep → Props drilling (explicit)
│  └─ Many levels → Context
│
├─ Server/async data?
│  └─ React Query, SWR, or useEffect pattern
│
├─ Complex state machine?
│  └─ useReducer + state machine pattern
│
└─ Global app state?
   └─ Zustand, Jotai, or Redux
```

---

## Pattern 1: Local State (useState)

**Use For**: Simple, isolated component state.

```typescript
// Toggle state
function Toggle() {
  const [isOn, setIsOn] = useState(false);
  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}

// Form input state
function SearchInput() {
  const [query, setQuery] = useState('');
  return (
    <input
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}

// Multiple related states (consider useReducer if complex)
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (...);
}
```

### Anti-patterns to Avoid

```typescript
// ❌ Don't: Derived state in useState
const [items, setItems] = useState(['a', 'b', 'c']);
const [filteredItems, setFilteredItems] = useState(items); // Wrong!

// ✅ Do: Compute derived values
const [items, setItems] = useState(['a', 'b', 'c']);
const [filter, setFilter] = useState('');
const filteredItems = items.filter(item => item.includes(filter)); // Right!

// ❌ Don't: Sync props to state
const [value, setValue] = useState(props.initialValue);
useEffect(() => setValue(props.initialValue), [props.initialValue]); // Wrong!

// ✅ Do: Use key to reset or lift state up
<Component key={props.id} initialValue={props.initialValue} />
```

---

## Pattern 2: Complex Local State (useReducer)

**Use For**: Multiple related state values, or next state depends on previous.

```typescript
// Define state and action types
type DropdownState = {
  isOpen: boolean;
  highlightedIndex: number;
  selectedValue: string | null;
  inputValue: string;
};

type DropdownAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'HIGHLIGHT'; index: number }
  | { type: 'SELECT'; value: string }
  | { type: 'INPUT_CHANGE'; value: string }
  | { type: 'CLEAR' };

// Reducer function
function dropdownReducer(state: DropdownState, action: DropdownAction): DropdownState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, isOpen: true, highlightedIndex: 0 };
    case 'CLOSE':
      return { ...state, isOpen: false, highlightedIndex: -1 };
    case 'HIGHLIGHT':
      return { ...state, highlightedIndex: action.index };
    case 'SELECT':
      return {
        ...state,
        selectedValue: action.value,
        inputValue: action.value,
        isOpen: false,
        highlightedIndex: -1,
      };
    case 'INPUT_CHANGE':
      return {
        ...state,
        inputValue: action.value,
        isOpen: true,
        highlightedIndex: 0,
      };
    case 'CLEAR':
      return { ...state, selectedValue: null, inputValue: '', highlightedIndex: -1 };
    default:
      return state;
  }
}

// Initial state
const initialState: DropdownState = {
  isOpen: false,
  highlightedIndex: -1,
  selectedValue: null,
  inputValue: '',
};

// Usage
function Combobox() {
  const [state, dispatch] = useReducer(dropdownReducer, initialState);

  return (
    <div>
      <input
        value={state.inputValue}
        onChange={e => dispatch({ type: 'INPUT_CHANGE', value: e.target.value })}
        onFocus={() => dispatch({ type: 'OPEN' })}
      />
      {state.isOpen && (
        <ul>
          {options.map((option, index) => (
            <li
              key={option}
              data-highlighted={index === state.highlightedIndex}
              onClick={() => dispatch({ type: 'SELECT', value: option })}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Pattern 3: Lifted State

**Use For**: Sharing state between sibling components.

```typescript
// Parent owns the state
function FilterableList() {
  const [filter, setFilter] = useState('');
  const [items] = useState(['Apple', 'Banana', 'Cherry']);

  const filteredItems = items.filter(item =>
    item.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      {/* Filter input controls the filter state */}
      <SearchInput value={filter} onChange={setFilter} />

      {/* List displays filtered data */}
      <ItemList items={filteredItems} />

      {/* Counter shows count of filtered items */}
      <ResultCount count={filteredItems.length} />
    </div>
  );
}

// Children receive props
function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Filter..."
    />
  );
}

function ItemList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ResultCount({ count }: { count: number }) {
  return <p>{count} items</p>;
}
```

---

## Pattern 4: Context for Shared State

**Use For**: State needed by many components at different nesting levels.

```typescript
// 1. Define context type
interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (id: string) => void;
  allowMultiple: boolean;
}

// 2. Create context
const AccordionContext = createContext<AccordionContextValue | null>(null);

// 3. Provider component
interface AccordionProviderProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

function AccordionProvider({
  children,
  allowMultiple = false,
  defaultOpen = [],
}: AccordionProviderProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggle = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  }, [allowMultiple]);

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ openItems, toggle, allowMultiple }),
    [openItems, toggle, allowMultiple]
  );

  return (
    <AccordionContext.Provider value={value}>
      {children}
    </AccordionContext.Provider>
  );
}

// 4. Consumer hook with type safety
function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within AccordionProvider');
  }
  return context;
}

// 5. Usage in child components
function AccordionItem({ id, title, children }: AccordionItemProps) {
  const { openItems, toggle } = useAccordion();
  const isOpen = openItems.has(id);

  return (
    <div>
      <button onClick={() => toggle(id)} aria-expanded={isOpen}>
        {title}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
```

### Context Performance Optimization

```typescript
// Split context to avoid unnecessary re-renders
const AccordionStateContext = createContext<Set<string> | null>(null);
const AccordionActionsContext = createContext<{
  toggle: (id: string) => void;
} | null>(null);

function AccordionProvider({ children }: { children: React.ReactNode }) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  // Actions don't change, so consumers won't re-render on state change
  const actions = useMemo(() => ({
    toggle: (id: string) => {
      setOpenItems(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
  }), []);

  return (
    <AccordionStateContext.Provider value={openItems}>
      <AccordionActionsContext.Provider value={actions}>
        {children}
      </AccordionActionsContext.Provider>
    </AccordionStateContext.Provider>
  );
}

// Separate hooks for state vs actions
function useAccordionState() {
  const state = useContext(AccordionStateContext);
  if (!state) throw new Error('...');
  return state;
}

function useAccordionActions() {
  const actions = useContext(AccordionActionsContext);
  if (!actions) throw new Error('...');
  return actions;
}
```

---

## Pattern 5: State Machines

**Use For**: Complex UI with explicit, finite states and transitions.

```typescript
// Define the state machine
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: string };

type LoadingAction =
  | { type: 'FETCH' }
  | { type: 'SUCCESS'; data: Data }
  | { type: 'ERROR'; error: string }
  | { type: 'RESET' };

function loadingReducer(state: LoadingState, action: LoadingAction): LoadingState {
  switch (state.status) {
    case 'idle':
      if (action.type === 'FETCH') return { status: 'loading' };
      return state;

    case 'loading':
      if (action.type === 'SUCCESS') return { status: 'success', data: action.data };
      if (action.type === 'ERROR') return { status: 'error', error: action.error };
      return state;

    case 'success':
      if (action.type === 'RESET') return { status: 'idle' };
      if (action.type === 'FETCH') return { status: 'loading' };
      return state;

    case 'error':
      if (action.type === 'RESET') return { status: 'idle' };
      if (action.type === 'FETCH') return { status: 'loading' };
      return state;

    default:
      return state;
  }
}

// Usage
function DataFetcher() {
  const [state, dispatch] = useReducer(loadingReducer, { status: 'idle' });

  const fetchData = async () => {
    dispatch({ type: 'FETCH' });
    try {
      const data = await api.getData();
      dispatch({ type: 'SUCCESS', data });
    } catch (e) {
      dispatch({ type: 'ERROR', error: e.message });
    }
  };

  // Exhaustive rendering based on state
  switch (state.status) {
    case 'idle':
      return <button onClick={fetchData}>Load Data</button>;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <DataDisplay data={state.data} />;
    case 'error':
      return (
        <div>
          <p>Error: {state.error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      );
  }
}
```

---

## Pattern 6: Controlled/Uncontrolled Hybrid

**Use For**: Components that can be controlled externally OR manage own state.

```typescript
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

// Usage in Input component
interface InputProps {
  value?: string;           // Controlled
  defaultValue?: string;    // Uncontrolled initial
  onChange?: (value: string) => void;
}

function Input({ value, defaultValue = '', onChange, ...props }: InputProps) {
  const [inputValue, setInputValue] = useControllableState({
    value,
    defaultValue,
    onChange,
  });

  return (
    <input
      {...props}
      value={inputValue}
      onChange={e => setInputValue(e.target.value)}
    />
  );
}

// Uncontrolled (manages own state)
<Input defaultValue="initial" onChange={console.log} />

// Controlled (parent manages state)
<Input value={formValues.name} onChange={v => setFormValues({...formValues, name: v})} />
```

---

## External State Libraries (When Needed)

### Zustand (Lightweight)

```typescript
import { create } from 'zustand';

interface ThemeStore {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
  toggle: () => void;
}

const useThemeStore = create<ThemeStore>(set => ({
  mode: 'light',
  setMode: mode => set({ mode }),
  toggle: () => set(state => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
}));

// Usage
function ThemeToggle() {
  const { mode, toggle } = useThemeStore();
  return <button onClick={toggle}>{mode}</button>;
}
```

### When to Use External Libraries

| Scenario                     | Recommendation           |
| ---------------------------- | ------------------------ |
| One-off component state      | useState/useReducer      |
| Two-three levels of nesting  | Props                    |
| Deeply nested shared state   | Context                  |
| Multiple unrelated consumers | Context or Zustand       |
| Complex global state         | Zustand, Jotai, or Redux |
| Server data                  | React Query, SWR         |
| URL state                    | React Router             |

---

## Best Practices Summary

1. **Start with the simplest solution** - useState before useReducer, props before context
2. **Colocate state** - Keep state as close to where it's used as possible
3. **Derive don't sync** - Compute values, don't sync them with useEffect
4. **Memoize context** - Always useMemo on context values
5. **Split contexts** - Separate frequently changing state from stable values
6. **Type your state** - Use discriminated unions for state machines
