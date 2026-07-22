---
name: accessibility
description: WCAG 2.1 AA compliance patterns for React components. Covers ARIA, keyboard navigation, focus management, and screen reader support.
license: MIT
metadata:
  category: react
  agents: [Architect, Code, Testing]
  autonomy: autonomous
  portable: true
---

# Accessibility Patterns for React

## Purpose

Ensure all components meet WCAG 2.1 AA requirements with proper ARIA attributes, keyboard navigation, focus management, and screen reader support.

## Preconditions

- Understanding of WAI-ARIA specification
- Access to screen reader testing tools
- axe DevTools or similar for automated testing

---

## Core Principles

### POUR Framework

| Principle          | Requirement               | React Implementation                    |
| ------------------ | ------------------------- | --------------------------------------- |
| **Perceivable**    | Content visible/audible   | Alt text, color contrast, semantic HTML |
| **Operable**       | Keyboard navigable        | Focus management, keyboard handlers     |
| **Understandable** | Clear, consistent         | Labels, error messages, predictable UI  |
| **Robust**         | Works with assistive tech | Valid ARIA, semantic markup             |

---

## Semantic HTML First

**Always prefer semantic HTML over ARIA.**

```tsx
// ❌ Avoid
<div role="button" tabIndex={0} onClick={handleClick}>Click me</div>

// ✅ Prefer
<button onClick={handleClick}>Click me</button>

// ❌ Avoid
<div role="navigation">...</div>

// ✅ Prefer
<nav>...</nav>

// ❌ Avoid
<span role="heading" aria-level={1}>Title</span>

// ✅ Prefer
<h1>Title</h1>
```

---

## ARIA Attributes

### ARIA Roles

```tsx
// Interactive roles (only when semantic HTML not possible)
<div role="button" tabIndex={0}>Custom Button</div>
<div role="link" tabIndex={0}>Custom Link</div>
<div role="checkbox" aria-checked={isChecked}>Custom Checkbox</div>

// Structural roles
<div role="dialog" aria-modal="true">Modal Content</div>
<div role="tablist">Tabs</div>
<div role="alert">Error message</div>
<div role="status">Success notification</div>

// Live region roles
<div role="log">Chat messages</div>
<div role="marquee">Scrolling text</div>
<div role="timer">00:30</div>
```

### ARIA States & Properties

```tsx
// Selected state
<li role="option" aria-selected={isSelected}>Item</li>

// Expanded state (accordions, dropdowns)
<button aria-expanded={isOpen} aria-controls="panel-id">
  Toggle
</button>

// Disabled state
<button aria-disabled={isDisabled}>Submit</button>

// Pressed state (toggle buttons)
<button aria-pressed={isPressed}>Bold</button>

// Checked state (checkboxes, switches)
<div role="checkbox" aria-checked={isChecked}>Option</div>
<div role="switch" aria-checked={isOn}>Dark mode</div>

// Current state (navigation)
<a aria-current={isCurrent ? 'page' : undefined}>Home</a>

// Invalid state (form validation)
<input aria-invalid={hasError} aria-describedby="error-id" />
<span id="error-id">Error message</span>
```

### ARIA Relationships

```tsx
// Label association
<label id="label-id">Username</label>
<input aria-labelledby="label-id" />

// Description association
<input aria-describedby="help-id error-id" />
<span id="help-id">Enter your email</span>
<span id="error-id">Email is required</span>

// Control association
<button aria-controls="menu-id" aria-expanded={isOpen}>
  Menu
</button>
<ul id="menu-id" hidden={!isOpen}>...</ul>

// Owns (for virtual children)
<div role="tree" aria-owns="child-1 child-2">
  <div id="child-1">Item 1</div>
  <div id="child-2">Item 2</div>
</div>
```

---

## Focus Management

### Focus Trap (Modals, Dialogs)

```tsx
import { useRef, useEffect, useCallback } from 'react';

function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      container.querySelectorAll<HTMLElement>(focusableSelector);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element on open
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

// Usage in Modal
function Modal({ isOpen, onClose, children }: ModalProps) {
  const containerRef = useFocusTrap(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
}
```

### Focus Visible

```css
/* Only show focus ring on keyboard navigation */
:focus-visible {
  outline: 2px solid var(--interactive-primary-fill-default);
  outline-offset: 2px;
}

/* Remove default outline */
:focus:not(:focus-visible) {
  outline: none;
}
```

```tsx
// CSS module approach
.button:focus-visible {
  outline: 2px solid var(--interactive-primary-fill-default);
  outline-offset: 2px;
}

// Skip links
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link"
      // Only visible on focus
    >
      Skip to main content
    </a>
  );
}
```

---

## Keyboard Navigation

### Required Keys by Pattern

| Pattern     | Keys Required                          |
| ----------- | -------------------------------------- |
| Button      | Enter, Space                           |
| Link        | Enter                                  |
| Checkbox    | Space                                  |
| Radio Group | Arrow keys (circular), Space to select |
| Tabs        | Arrow keys (horizontal), Home/End      |
| Menu        | Arrow keys, Enter, Escape              |
| Listbox     | Arrow keys, Enter, Type-ahead          |
| Tree        | Arrow keys (with expand/collapse)      |
| Dialog      | Tab trap, Escape to close              |
| Combobox    | Arrow keys, Enter, Escape, Type-ahead  |

### Keyboard Handler Patterns

```tsx
// Tab panel keyboard navigation
function TabList({ tabs, selectedIndex, onSelect }: TabListProps) {
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    onSelect(newIndex);
  };

  return (
    <div role="tablist">
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onClick={() => onSelect(index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

### Roving Tab Index

```tsx
// Only one item in group is tabbable at a time
function useRovingTabIndex<T extends HTMLElement>(
  itemCount: number,
  initialIndex = 0
) {
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);
  const itemRefs = useRef<(T | null)[]>([]);

  const setItemRef = useCallback(
    (index: number) => (el: T | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  const focus = useCallback((index: number) => {
    setFocusedIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  const getTabIndex = useCallback(
    (index: number) => (index === focusedIndex ? 0 : -1),
    [focusedIndex]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let nextIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = (focusedIndex + 1) % itemCount;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = (focusedIndex - 1 + itemCount) % itemCount;
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = itemCount - 1;
          break;
        default:
          return;
      }

      focus(nextIndex);
    },
    [focusedIndex, itemCount, focus]
  );

  return { setItemRef, getTabIndex, handleKeyDown, focusedIndex, focus };
}
```

---

## Live Regions

### Announce Changes to Screen Readers

```tsx
// Status announcements (polite)
function StatusAnnouncer({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Error/alert announcements (assertive)
function AlertAnnouncer({ message }: { message: string }) {
  return (
    <div role="alert" aria-live="assertive" aria-atomic="true">
      {message}
    </div>
  );
}

// Reusable announcer hook
function useAnnouncer() {
  const [message, setMessage] = useState('');

  const announce = useCallback(
    (text: string, priority: 'polite' | 'assertive' = 'polite') => {
      setMessage(''); // Clear first to ensure re-announcement
      requestAnimationFrame(() => setMessage(text));
    },
    []
  );

  const Announcer = () => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, Announcer };
}
```

---

## Screen Reader Only Content

```css
/* Visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Allow focus for skip links */
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

```tsx
// Usage
<button>
  <Icon name="close" />
  <span className="sr-only">Close dialog</span>
</button>

// Or with aria-label
<button aria-label="Close dialog">
  <Icon name="close" />
</button>
```

---

## Color Contrast

### WCAG Requirements

| Content                           | Minimum Ratio  |
| --------------------------------- | -------------- |
| Normal text                       | 4.5:1          |
| Large text (18pt+, or 14pt+ bold) | 3:1            |
| UI components & graphics          | 3:1            |
| Non-text (decorative)             | No requirement |

### Implementation

```tsx
// Use design tokens for guaranteed contrast
const Button = () => (
  <button
    style={{
      backgroundColor: 'var(--interactive-primary-fill-default)',
      color: 'var(--interactive-primary-text-default)'
      // Design tokens ensure 4.5:1 contrast
    }}
  >
    Click me
  </button>
);

// Never rely on color alone
<span style={{ color: 'var(--feedback-error)' }}>
  <Icon name="error" aria-hidden="true" /> Error: Field is required
</span>;
```

---

## Form Accessibility

### Accessible Form Pattern

```tsx
interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactElement;
}

function FormField({
  id,
  label,
  error,
  hint,
  required,
  children
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {hint && <p id={hintId}>{hint}</p>}

      {cloneElement(children, {
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required
      })}

      {error && (
        <p id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Usage
<FormField
  id="email"
  label="Email address"
  hint="We'll never share your email"
  error={errors.email}
  required
>
  <input type="email" />
</FormField>;
```

---

## Testing Checklist

### Manual Testing

- [ ] Tab through all interactive elements
- [ ] Operate with keyboard only (no mouse)
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Check focus visibility
- [ ] Verify color contrast (4.5:1 minimum)
- [ ] Test at 200% zoom
- [ ] Test with reduced motion preference

### Automated Testing

```tsx
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Common Mistakes

| Mistake                               | Fix                                           |
| ------------------------------------- | --------------------------------------------- |
| Missing button text                   | Add text or aria-label                        |
| Missing alt on images                 | Add descriptive alt (or empty for decorative) |
| Missing form labels                   | Add `<label>` or aria-label                   |
| Non-interactive elements with onClick | Use button or add role="button" + tabIndex    |
| Color as only indicator               | Add icon, text, or pattern                    |
| Auto-focus breaking flow              | Only auto-focus on user action                |
| Missing skip link                     | Add skip to main content link                 |
| Nested interactive elements           | Flatten structure                             |
