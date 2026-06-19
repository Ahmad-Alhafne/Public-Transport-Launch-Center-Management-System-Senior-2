Here is a comprehensive markdown file (`UI_GUIDE.md`) designed specifically to guide an AI agent. It details your project's custom layout utilities, color values, typography rules, interactive structures, and specific behavior for Right-to-Left (RTL) translation options.

You can save this file as `UI_GUIDE.md` in the root or documentation folder of your codebase.

---

### File Content for `UI_GUIDE.md`

```markdown
# Front-End UI Architecture & Design System Guidelines

This document serves as an instruction manual for AI agents generating or refactoring React layout systems, pages, views, elements, and components within this project. All generated code must adapt cleanly to the design system tokens and helper classes outlined below.

---

## 1. Design System Tokens & Variable Map

Do not inject arbitrary slate, blue, or grey hex values (`bg-slate-800`, `text-red-400`, `border-blue-500`). Use the established CSS custom variables embedded inside the system framework:

### Color Palette
* **Primary Brand Colors:**
    * `var(--forest)` (`#428177`) — Base interactive element brand color.
    * `var(--forest-dark)` (`#054239`) — Deep text emphasis and hover states.
    * `var(--forest-deep)` (`#002623`) — Heavy structural anchors.
    * `var(--forest-100)` (`#D9E7E4`) — Soft surface/pill background highlighting.
* **Secondary/Accent Trim Palette:**
    * `var(--wheat)` (`#B9A779`) — Dynamic highlighting and indicators.
    * `var(--wheat-light)` (`#EDEBE0`) — Active interactive hover backgrounds.
    * `var(--wheat-dark)` (`#988561`) — Darker secondary contrast indicator text.
* **Destructive & Alert Palette (Umber):**
    * `var(--umber)` (`#6B1F2A`) — Critical states, errors, deletion tags.
    * `var(--umber-dark)` (`#4A151E`) — High-contrast alert content text.
    * `var(--umber-deep)` (`#260F14`) — Dark structural warnings.
* **Neutral Monochromes & Surfaces:**
    * `var(--charcoal)` (`#161616`) — Default dominant header typography.
    * `var(--charcoal-medium)` (`#3D3A3B`) — Muted body strings and auxiliary labels.
    * `var(--surface)` (`#FFFFFF`) — Core backgrounds for cards, panels, and dropdown containers.
    * `var(--surface-soft)` (`#F8F3EB`) — Canvas body viewport backing stream.
    * `var(--surface-muted)` (`#F2ECE2`) — Deep secondary backing panels.

### Structural Radii & Borders
* `var(--radius)` (`1.25rem`) — Default structural border-radius applied to cards, tables, and wrapper shields.
* `var(--radius-sm)` (`0.85rem`) — Compact utility radius for input boxes, pills, and control indicators.
* `var(--radius-xs)` (`0.55rem`) — Ultra-compact tag elements.
* `var(--border)` (`rgba(66, 129, 119, 0.16)`) — Clean semi-transparent bounding borders.
* `var(--focus-ring)` (`0 0 0 4px rgba(66, 129, 119, 0.14)`) — Accessible form focus footprint outline.

---

## 2. Layout & Shell Blueprint Structure

Every view layout must employ the appropriate shell architecture class instead of ad-hoc padding utilities.

### Core Page View Wrapping
* **Standard Component Canvas:** Wrap all interior management subviews inside a `.content-wrapper` container block.
    ```jsx
    return (
      <div className="content-wrapper py-6">
        {/* Page Content Here */}
      </div>
    );
    ```
* **Authentication & Overlay Modules:** Utilize the specialized fullscreen centering class layout `.page-shell`.

### Structural Containment Decks
Never generate raw unstyled background dividers. Always bind descriptive properties utilizing semantic class groups:
* `card` / `standard-card` / `dashboard-card` — Core layout container block with `var(--surface)` background, system drop shadow, and crisp rounded corners.
* `metric-card` — Specialized analytical visual blocks containing automated gradient panels.
* `info-card` — Descriptive support structures displaying static structural properties.

---

## 3. Typography Rules

* **Primary Headings (`<h1>` to `<h6>`):** Automatically map to text variable parameters `var(--charcoal)`. Ensure clean spacing using contextual scale targets (`.heading-xl`, `.heading-lg`).
* **Muted Auxiliary Strings:** Apply the `.text-muted` reference class identifier or text parameter explicitly (`text-[var(--charcoal-medium)]` or `text-muted`).

---

## 4. Components & Interactive Elements

When assembling interactive components, ensure elements map to the utility class groups configured inside the global framework layout template structure:

### Button Layout Manifest
* **Primary Submissions:** `.primary-button` (Maps accent color shifts onto `var(--forest-dark)` configurations seamlessly).
* **Secondary Actions:** `.secondary-button` (Uses `var(--wheat)` base tokens).
* **Structural Outlines:** `.outline-button` (Transparent structure pulling outline limits directly from `var(--forest-deep)` vectors).
* **Destructive Deletions:** `.danger-button` (Maps alert triggers onto the `var(--umber)` layout deck).

### Forms & Input Parameters
All interactive user text inputs, select lists, and textareas must inherit style parameters from the `.input-field` structure class definition, paired with structural labeling via `.form-label`.
```jsx
<div>
  <label className="form-label">{t('label_key')}</label>
  <input type="text" className="input-field" placeholder="..." />
</div>

```

### Response Notification Alerts

* **Error Callouts:** Apply `.alert .alert-error` matching properties.
* **Success Triggers:** Apply `.alert .alert-success` layout wrappers.

### Data Arrays (Grid Tables)

All list tables must use the wrapper element structure class `.table-shell` to capture scrolling parameters across screen bounds effortlessly.

```jsx
<div className="table-shell">
  <table>
    <thead>
      <tr><th>{t('header')}</th></tr>
    </thead>
    <tbody>
      <tr><td>{data.value}</td></tr>
    </tbody>
  </table>
</div>

```

---

## 5. Bidirectional (RTL/LTR) Localization Blueprint

This system supports seamless translation scaling utilizing specialized programmatic class switches applied at runtime execution.

* **Alignment Resets:** Do not force definitive alignment structures inline without safety escapes (`text-left` or `text-right`). The architecture injects localized overrides dynamically when the browser context targets `html[dir='rtl']`:
* `.text-left` automatically resolves toward standard *right-alignment* in RTL view states.
* `.text-right` automatically resolves toward standard *left-alignment* in RTL view states.


* **Margin Adjustment Classes:** Utilize layout structures safely using fluid parameters like `.ml-auto` or `.mr-auto`. In RTL conditions, these margins automatically mirror structural layout constraints.
* **Data Structures and Dropdowns:** Table headers (`th`, `td`) and panel layout targets (`.dropdown-panel`, `.notification-unread`) automatically align and invert when reading positions switch direction.

---

## 6. Strict AI Agent Verification Checklist

When generating code revisions, ensure you verify the following constraints before declaring completion output:

1. **No Core Tailwind Color Clashes:** Did you accidentally use generic Tailwind color classes like `bg-slate-900`, `text-slate-400`, `bg-blue-500`, or `text-white`? Replace them immediately with system tokens like `text-[var(--charcoal-medium)]`, `border-[rgba(66,129,119,0.1)]`, or class selectors like `text-muted`.
2. **No Standalone Unwrapped Lists:** Are table elements wrapped inside a protective container element using the `.table-shell` selector class?
3. **Clean Interaction Profiles:** Do input layout items inherit structures from `.input-field` and `.form-label` parameters uniformly?
4. **Flexible Sizing Configurations:** Did you remember to avoid fixing column parameters using absolute widths, ensuring the framework's clean fluid layout system (`.content-wrapper`) handles grid configurations smoothly instead?

```

```