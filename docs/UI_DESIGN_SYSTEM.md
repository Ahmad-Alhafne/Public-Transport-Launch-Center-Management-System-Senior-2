# UI Design System

## Overview
This design system captures the Syrian Government visual identity for the Departure Center Management System. It defines official brand colors, typography, spacing, component patterns, and responsive layout rules.

## Branding Guidelines

### Official Colors
- Forest Primary: `#428177`
- Forest Dark: `#054239`
- Forest Deep: `#002623`
- Wheat Light: `#EDEBE0`
- Wheat Primary: `#B9A779`
- Wheat Dark: `#988561`
- Umber Primary: `#6B1F2A`
- Umber Dark: `#4A151E`
- Umber Deep: `#260F14`
- White: `#FFFFFF`
- Charcoal Medium: `#3D3A3B`
- Charcoal Dark: `#161616`

### Color Usage Rules
- Primary actions: use Forest colors for buttons, active navigation, badges, focus borders, selected cards, and progress indicators.
- Secondary actions: use Wheat colors for secondary buttons, highlights, section accents, and informational panels.
- Premium/critical elements: use Umber sparingly for alerts, administrative indicators, and critical badges.
- Neutrals: use Charcoal for text and structure, and White/Wheat Light for backgrounds.

### Accessibility Considerations
- Maintain strong contrast between text and backgrounds.
- Use accessible focus styles for inputs, buttons, and links.
- Avoid low-contrast color combinations on key interactive elements.

## Design Tokens

### Color Tokens
- `--forest`, `--forest-dark`, `--forest-deep`
- `--wheat-light`, `--wheat`, `--wheat-dark`
- `--umber`, `--umber-dark`, `--umber-deep`
- `--charcoal`, `--charcoal-medium`
- `--surface`, `--surface-soft`, `--surface-muted`
- `--border`, `--shadow`

### Typography
- Base font family: `Inter, Segoe UI, system-ui, sans-serif`
- Body text: `1rem`, `line-height: 1.6`
- Headings: strong visual hierarchy with `clamp()` scaling for responsive headings
- Text weights:
  - Regular: `400`
  - Semibold: `600`
  - Bold: `700`

### Spacing System
- Small gap: `0.75rem`
- Base gap: `1rem`
- Large gap: `1.5rem`
- Section padding: `2rem`
- Container spacing follows a modular 8px system.

### Border Radius
- Standard radius: `1.25rem`
- Small radius: `0.85rem`
- Extra small radius: `0.55rem`

### Shadows
- Card elevation: `0 24px 60px rgba(2, 38, 33, 0.08)`

## Component Standards

### Buttons
- `Primary Button`: Forest background, white text, darker hover.
- `Secondary Button`: Wheat background, charcoal text, rich hover.
- `Outline Button`: forest border with transparent background.
- `Danger Button`: Umber background with white text.

Interaction rules:
- Buttons should have a minimum touch area and visible hover/focus states.
- Use consistent border radius and spacing.

### Forms
- Inputs, selects, textareas, checkboxes, and radios use light surface backgrounds with charcoal text.
- Focus state: Forest outline and a subtle shadow.
- Validation states use clear color signals and text labels.

### Tables
- Use surface cards for table containers.
- Header backgrounds should be muted with strong Charcoal text.
- Row hover accent: Wheat Light.
- Sorting/pagination states use Forest as the active accent.
- Empty states should use friendly messaging with soft wheat backgrounds.

### Cards
- Reusable card variants:
  - Standard Card: white surface, soft border, shadow.
  - Dashboard Metric Card: subdued Forest gradient background.
  - Statistics Card: clear numeric hierarchy and supportive Wheat accent.
  - Information Card: tone down with Wheat Light and charcoal text.

### Navigation
- Header and sidebar should be clean, with clear active states.
- Use Forest for active items and Wheat Light for hover states.
- Maintain consistent spacing, icon alignment, and typography.

## Layout Standards

### Spacing
- Use consistent padding around sections: `1.5rem` to `2rem`.
- Maintain `1rem` gutters inside cards and forms.
- Use vertical rhythm for headings, paragraphs, and button groups.

### Grid System
- Responsive columns should collapse at tablet breakpoints.
- Use standard Tailwind breakpoints: `sm`, `md`, `lg`, `xl`.
- Keep maximum page width around `1120px` to maintain readability.

### Responsive Breakpoints
- Mobile: `up to 640px`
- Tablet: `641px to 1024px`
- Desktop: `1025px and above`

## Page Creation Guidelines

1. Follow `docs/UI_DESIGN_SYSTEM.md` as the source of truth.
2. Reuse existing theme tokens and component classes.
3. Do not introduce new colors unless approved.
4. Ensure responsive behavior with mobile-first layout.
5. Ensure accessibility: keyboard focus, text contrast, and legible spacing.
6. Prefer existing `card`, `primary-button`, `secondary-button`, `outline-button`, `danger-button`, and `input-field` classes.
7. Keep forms, tables, and navigation visually consistent.
8. Use whitespace to separate sections and avoid crowded layouts.

## Future Development
- When building new pages, use the same spacing and typography scales.
- Prefer semantic HTML and consistent component classes.
- Keep brand voice professional, modern, and government-grade.
