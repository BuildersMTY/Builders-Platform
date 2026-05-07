# Product

## Register

product

## Users

**Primary:** Spanish-speaking junior-to-intermediate software engineers in Mexico and LATAM. They already know how to code — they want to ship real systems-level projects (HTTP servers, shells, databases, protocols) instead of watching tutorials. Context: at their desk with coffee, skeptical of bootcamp fluff, want to feel like they're joining an elite builder's club rather than a learning platform.

**Secondary:** Prospective builders visiting the landing page. Bilingual audience — marketing in Spanish, workspace can be English.

## Product Purpose

Buildmancer is a platform where developers build real software from first principles. Not tutorials. Not videos. Real projects with real tests, real environments, and real portfolio artifacts.

Four content primitives:
1. **Track** — curated vertical (Systems, Data, Networking, Languages)
2. **Course** — structured project with modules and submodules
3. **Drill** — standalone daily practice problem
4. **Build** — auto-generated portfolio artifact from a completed course

Success = a user ships their first project and adds it to their portfolio.

## Brand Personality

**Three words:** sharp, confident, crafted.

- Not: friendly, approachable, playful, cozy, corporate.
- Yes: decisive, refined, opinionated, a little intimidating in a "respect earned" way.
- Emotional goal: "damn, these people take this seriously." Confidence bordering on swagger. Founder energy — this was made by one person who cares, not a template shop.

## Anti-references

Explicitly avoid:
- Bootcamp sites (Platzi, freeCodeCamp, Codecademy) — do NOT look like a course platform
- Generic SaaS landing (Stripe-style "feature triptych grid + gradient hero")
- Glassmorphism, blur-heavy cards, neon gradient CTAs
- Rounded-corner-icon-above-heading feature cards
- Purple-blue gradients, cyan accents, "AI startup aesthetic"
- Border-left accent stripes on cards
- Gradient text
- Modal-over-everything UX patterns

## Design Principles

1. **Scarcity of red.** Blood-red (#ff0000) is reserved for live status, primary CTAs, and critical accents. One red element per viewport on marketing. Muted UI by default — when red appears it MEANS something.
2. **Editorial over product.** Marketing pages lean magazine: serif display type, asymmetric compositions, generous line-height, long captions. Product pages are the opposite: dense, information-rich, no wasted space.
3. **Density where it matters.** Workspace and courses screens are INFORMATION-DENSE. Developers want to see more at once. Marketing is spacious and editorial.
4. **Motion is a scalpel.** One orchestrated entrance per page. Hover states are subtle opacity/color shifts, not transforms. No bounce, no elastic. Exponential ease-out only.
5. **No card template.** No `icon + heading + paragraph` triptych grids. No identical feature cards. Every section earns its layout.
6. **Respect the builder.** The user is technical. Don't dumb down language. Don't hide complexity. Show the raw interface, the raw tests, the raw protocol.

## Accessibility & Inclusion

- WCAG AA contrast minimum
- `focus-visible` red ring at 2px offset 2px (already in globals.css)
- `prefers-reduced-motion` respected for all transitions
- Keyboard-navigable editor in workspace
- Spanish-first marketing copy
