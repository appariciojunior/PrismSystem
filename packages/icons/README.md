# @ds/icons

Icon package for the design system. It is a thin wrapper around [Phosphor Icons](https://phosphoricons.com) (`@phosphor-icons/react`) with a compatibility layer for the legacy icon-name API.

## Setup

The package has no build step. After pulling this change, run `npm install` once at the repo root so `@phosphor-icons/react` is installed.

## Usage

The legacy API is unchanged:

```jsx
import { iconMap, type IconName } from '@ds/icons';

const Component = iconMap['filled_check_circle'];
```

The full Phosphor set is also re-exported, so new code can import icons directly:

```jsx
import { MagnifyingGlass, CaretRight } from '@ds/icons';

<MagnifyingGlass size={20} weight="bold" />
```

## Name and weight mapping

Legacy names resolve to the closest Phosphor icon:

| Legacy name | Phosphor icon |
| --- | --- |
| `add` | `Plus` |
| `arrow_left` | `ArrowLeft` |
| `arrow_right` | `ArrowRight` |
| `check_circle` | `CheckCircle` |
| `circle` | `Circle` |
| `close` | `X` |
| `equalizer` | `Equalizer` |
| `featured_video` | `MonitorPlay` |
| `info` | `Info` |
| `loading` | `Spinner` |
| `report` | `WarningOctagon` |
| `warning` | `Warning` |

Prefixes map to Phosphor weights:

- `filled_<name>` renders with `weight="fill"`
- `outlined_<name>` renders with `weight="regular"`

Plain aliases also exist for common names (`search`, `close`, `check`, `chevron_right`, `error`, `info`, `warning`, `add`).

Icon components accept all Phosphor props (`size`, `weight`, `color`) plus standard SVG props such as `width` and `height`.
