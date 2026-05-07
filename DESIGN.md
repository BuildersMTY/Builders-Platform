---
name: Buildmancer
description: A platform where developers build real software from first principles — dark, editorial, blood-red punctuation.
colors:
  ink-black: "#0a0808"
  deep-black: "#070606"
  surface: "#0f0d0d"
  surface-alt: "#141111"
  surface-hover: "#1a1616"
  surface-active: "#201b1b"
  border: "#221f1f"
  border-strong: "#2e2929"
  border-bright: "#3a3333"
  blood-red: "#ff2b2b"
  blood-red-hover: "#ff4848"
  blood-red-dim: "rgba(255, 43, 43, 0.14)"
  blood-red-glow: "rgba(255, 43, 43, 0.35)"
  warm-white: "#f5f3f0"
  ash: "#a6a19a"
  stone: "#6b6660"
  dust: "#4a4540"
  mint: "#6fd6b8"
  coral: "#ff6b5b"
  amber: "#ffb347"
  sky: "#7aa7ff"
typography:
  display:
    fontFamily: "'Bodoni Moda', Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "'Bodoni Moda', Georgia, serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.005em"
  body:
    fontFamily: "'Sora', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.14em"
    textTransform: "uppercase"
rounded:
  none: "0px"
  sm: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.blood-red}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.none}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.blood-red-hover}"
    textColor: "{colors.warm-white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ash}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
    border: "1px solid {colors.border-strong}"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
    border: "2px solid {colors.border-strong}"
  input-field-focus:
    border: "2px solid {colors.blood-red}"
    outline: "none"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.none}"
    padding: "24px"
    border: "2px solid {colors.border}"
  card-hover:
    border: "2px solid {colors.border-bright}"
    transform: "translateY(-1px)"
  nav-tab:
    backgroundColor: "transparent"
    textColor: "{colors.stone}"
    padding: "8px 14px"
    borderBottom: "2px solid transparent"
  nav-tab-active:
    textColor: "{colors.warm-white}"
    borderBottom: "2px solid {colors.blood-red}"
---

# Design System: Buildmancer

## 1. Overview

**Creative North Star: "The Editor's Desk"**

A magazine editor's workspace at 2am — editorial restraint, sharp tools, red pen marks. The interface feels like it was made by someone who cares deeply about craft, not a template shop. Dark, dense, and confident. Every pixel earns its place.

Buildmancer is a product surface first, but the brand voice is editorial. Marketing pages lean magazine: serif display type, asymmetric compositions, generous whitespace. Product screens are the opposite: information-dense, no wasted space, developers want to see more at once.

The emotional goal is "damn, these people take this seriously." Confidence bordering on swagger. Founder energy.

**Key Characteristics:**
- Dark-only, no toggle. Dark is the brand.
- Blood-red is scarce — one red element per viewport on marketing. On product, red = live/active/primary action only.
- Sharp corners everywhere (0px radius). No rounded cards, no soft edges.
- Editorial typography: Bodoni Moda for display, Sora for body, JetBrains Mono for data/labels.
- Density where it matters: workspace screens are packed, marketing is spacious.
- Motion is a scalpel: one orchestrated entrance per page, subtle opacity shifts on hover.

## 2. Colors

The palette is built on a warm near-black foundation with blood-red punctuation. Red is not a decorative choice — it signals live status, primary action, or critical emphasis. Its scarcity is the point.

### Primary
- **Blood Red** (`#ff2b2b` / oklch(63% 0.26 25)): The only accent. Used for primary CTAs, live indicators, active states, and critical emphasis. Never used for decorative elements. If a screen has more than one red element, reconsider.
- **Blood Red Hover** (`#ff4848` / oklch(67% 0.24 25)): Hover state for primary actions. Slightly brighter, slightly less saturated.
- **Blood Red Dim** (`rgba(255, 43, 43, 0.14)`): Background tint for active/highlighted rows, subtle emphasis without screaming.
- **Blood Red Glow** (`rgba(255, 43, 43, 0.35)`): Box-shadow glow for active elements, live indicators, focus rings.

### Neutral
- **Ink Black** (`#0a0808`): The canvas. Slight red warmth — not pure black. Body background.
- **Deep Black** (`#070606`): Deepest surface, used for overlays, backdrops, command palettes.
- **Surface** (`#0f0d0d`): Primary content surface. Cards, panels, nav background.
- **Surface Alt** (`#141111`): Alternate surface for sections, sidebars, secondary panels.
- **Surface Hover** (`#1a1616`): Hover state for interactive surfaces.
- **Surface Active** (`#201b1b`): Active/pressed state for interactive surfaces.
- **Border** (`#221f1f`): Default border. Subtle separation.
- **Border Strong** (`#2e2929`): Stronger border for inputs, focused elements, active cards.
- **Border Bright** (`#3a3333`): Brightest border for hover states, emphasis.
- **Warm White** (`#f5f3f0`): Primary text. Slightly warm, not pure white. Easier on the eyes in dark mode.
- **Ash** (`#a6a19a`): Secondary text, labels, descriptions.
- **Stone** (`#6b6660`): Tertiary text, metadata, timestamps.
- **Dust** (`#4a4540`): Faint text, placeholders, disabled states.

### Functional
- **Mint** (`#6fd6b8`): Success states, passing tests, positive indicators.
- **Coral** (`#ff6b5b`): Errors, failing tests, destructive actions.
- **Amber** (`#ffb347`): Warnings, hints, pending states.
- **Sky** (`#7aa7ff`): Information, links, secondary accents.

### Named Rules
**The One Voice Rule.** The primary accent (blood red) is used on ≤10% of any given screen. Its rarity is the point. If everything is highlighted, nothing is highlighted.

## 3. Typography

**Display Font:** Bodoni Moda, Georgia, serif
**Body Font:** Sora, system-ui, sans-serif
**Label/Mono Font:** JetBrains Mono, monospace

**Character:** Editorial precision meets developer density. Serif headings feel like magazine mastheads — confident, slightly dramatic, never playful. Sans body is clean and utilitarian. Mono is used for data, labels, and anything that needs to feel like code or technical specification.

### Hierarchy
- **Display** (400, clamp(2.5rem, 7vw, 5rem), 1.05): Hero headlines, landing page mastheads. Used sparingly — one per page.
- **Headline** (400, clamp(1.75rem, 4vw, 2.5rem), 1.1): Section titles, page headers. Serif italic for editorial emphasis.
- **Title** (600, 1.25rem, 1.3): Card titles, module headers, sub-sections.
- **Body** (400, 0.875rem, 1.65): Body copy, descriptions. Max line length 65–75ch. On dark backgrounds, line-height is slightly generous for readability.
- **Label** (700, 0.6875rem, 1.4, 0.14em, uppercase): Data labels, metadata, timestamps, tab labels. Always uppercase with wide tracking.

### Named Rules
**The Mono-For-Data Rule.** Any string that represents a technical value (file paths, commit hashes, test counts, timestamps, language labels) is set in JetBrains Mono. This creates an instant visual hierarchy: serif for voice, sans for narrative, mono for facts.

## 4. Elevation

The system is flat by default. Depth is conveyed through tonal layering — darker surfaces recede, lighter surfaces advance. Shadows are used sparingly and only for structural elements that need to float above the content (modals, command palettes, dropdowns).

### Shadow Vocabulary
- **Structural** (`0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px var(--border)`): Modals, command palettes, drawers. Heavy, diffuse, grounded.
- **Ambient Glow** (`0 0 18px var(--primary-glow)`): Primary button hover, active states. Subtle red aura.
- **None**: Cards, panels, nav, content surfaces. Flat. Depth via background color only.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover elevation, modal overlay, focus). If a card has a shadow, it's wrong.

## 5. Components

### Buttons
- **Shape:** Sharp corners (0px radius). No rounding anywhere.
- **Primary:** Blood red background, warm white text, uppercase label typography, 12px 24px padding. Full width in forms, inline in toolbars.
- **Hover:** Slight brightness shift to `#ff4848`. No transform, no scale. Subtle ambient glow.
- **Ghost:** Transparent background, ash text, 1px border-strong. Hover: border brightens to border-bright, text shifts to warm white.
- **Disabled:** 50% opacity, no pointer events.

### Inputs / Fields
- **Style:** 2px border-strong, surface background, sharp corners. No rounded inputs.
- **Focus:** Border shifts to blood red. No glow, no ring. The border color change is enough.
- **Error:** Border shifts to coral. Error text below in coral, mono label style.
- **Placeholder:** Dust color. Italic optional.

### Cards / Containers
- **Shape:** Sharp corners (0px). No radius.
- **Background:** Surface or surface-alt.
- **Border:** 2px solid border. Not 1px — cards need physical presence.
- **Hover:** Border brightens to border-bright. Optional 1px translateY lift (subtle, no shadow).
- **Padding:** 24px default. Dense screens can drop to 20px or 16px.

### Navigation
- **Style:** Sticky top, border-bottom, surface-alt to surface gradient background.
- **Tabs:** Mono label typography, ash default, warm white active. Active tab has a 2px blood-red underline.
- **Mobile:** Collapse to hamburger or bottom sheet. Tabs become a scrollable row.

### LangBadge
- **Style:** Per-language colored dot + label. Mono text, lowercase. Border in matching color at 20% opacity. Background in matching color at 5% opacity.
- **Colors:** Go = mint (#7ed5d0), Rust = orange (#ff9861), Python = yellow (#f5d86a), C = blue (#9bb7ff), ASM = purple (#c9a4ff).

## 6. Do's and Don'ts

### Do:
- **Do** use blood red sparingly. One red element per viewport on marketing. Red = live, active, primary action only.
- **Do** use serif italic for editorial emphasis in headlines and display text.
- **Do** use mono for all technical data, labels, and metadata.
- **Do** keep corners sharp (0px radius) everywhere. No exceptions.
- **Do** use tonal layering for depth. Surface → surface-alt → bg-deep creates hierarchy without shadows.
- **Do** use 2px borders for cards and containers. 1px is too thin for dark themes.
- **Do** respect reduced motion. All animations should be subtle opacity/shift transitions.

### Don't:
- **Don't** use rounded corners on any component. No cards, no buttons, no inputs.
- **Don't** use gradient text or gradient backgrounds. Banned by brand.
- **Don't** use glassmorphism, blur-heavy cards, or neon gradients.
- **Don't** use border-left accent stripes on cards or list items.
- **Don't** use the hero-metric template (big number + small label + gradient accent).
- **Don't** use identical card grids with icon + heading + paragraph triptychs.
- **Don't** look like a bootcamp site (Platzi, freeCodeCamp, Codecademy).
- **Don't** use purple-blue gradients, cyan accents, or "AI startup aesthetic."
- **Don't** use social login buttons on auth screens. This is a private club, not a SaaS tool.
- **Don't** use em dashes in copy. Use commas, colons, semicolons, or periods.
