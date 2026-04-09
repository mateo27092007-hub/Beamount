# Design System Document: The Horological Monolith

## 1. Overview & Creative North Star: "The Digital Atelier"
This design system is not a store; it is an editorial exhibition. Our Creative North Star is **"The Digital Atelier"**—a space that mirrors the hushed, high-stakes environment of a private viewing room in Geneva. 

To achieve a signature premium feel, we move away from "web-standard" layouts. We embrace **intentional asymmetry**, where large-scale serif typography overlaps high-resolution imagery, and white space is treated as a luxury material itself. The goal is to break the "template" feel by using modular blocks that feel like pages of a high-end fashion monograph. We prioritize tonal depth over structural lines, ensuring the UI feels etched rather than printed.

---

## 2. Colors: The Metallic Spectrum
The palette is rooted in deep obsidian and crisp whites, punctuated by "Primary" Gold and "Secondary" Silver. 

### The "No-Line" Rule
**Explicit Instruction:** Prohibit the use of 1px solid borders for sectioning. Structural boundaries must be defined solely through background shifts. For example, moving from a `surface` hero section to a `surface-container-low` product grid provides a sophisticated transition that feels architectural rather than "webby."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
- **Base Layer:** `surface` (#131313)
- **Nested Content:** Use `surface-container-low` (#1c1b1b) for subtle grouping.
- **Featured Elements:** Use `surface-container-highest` (#353534) to create "lifted" interactive zones.

### The "Glass & Gradient" Rule
To avoid a flat, "cheap" black, use **Glassmorphism** for floating navigation and overlays. Apply `surface-variant` with a 60% opacity and a 20px backdrop-blur. 
- **Signature Polish:** For primary CTAs, use a subtle linear gradient from `primary` (#e9c349) to `primary-container` (#c5a12a) at a 45-degree angle. This mimics the light catch on a gold watch bezel.

---

## 3. Typography: Editorial Authority
The contrast between the mechanical precision of the sans-serif and the timeless elegance of the serif creates a "Modern Heritage" aesthetic.

- **Display & Headlines (Noto Serif):** Use `display-lg` for hero statements. Tighten letter-spacing by -2% to create a bespoke, high-fashion look. The high contrast of Noto Serif communicates luxury and precision.
- **Body & Titles (Manrope):** `body-lg` and `body-md` provide a clean, technical counterpoint. Use `label-md` in all-caps with +10% letter-spacing for metadata (e.g., "CALIBER 3235") to evoke engineering diagrams.
- **Hierarchy:** Headlines should be significantly larger than body text to create a dramatic, rhythmic pace across the scroll.

---

## 4. Elevation & Depth: Tonal Layering
In a premium system, traditional drop shadows are often too "digital." We utilize **Tonal Layering**.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "recessed" or "inset" look, mimicking a velvet-lined watch box.
- **Ambient Shadows:** If an element must float (e.g., a modal), use a shadow color tinted with `on-surface` at 5% opacity, with a 40px blur and 0px offset. This mimics natural light diffusion in a gallery.
- **The "Ghost Border" Fallback:** If a container requires definition against a complex image, use a "Ghost Border": `outline-variant` (#4e4639) at 15% opacity. Never use 100% opaque lines.

---

## 5. Components: The Bespoke UI

### Buttons
- **Primary:** `primary` background, `on-primary` text. **No rounded corners (0px).** The sharp 90-degree angle conveys architectural strength.
- **Secondary:** `secondary` (#c6c6c6) background. Use for "Silver" accents to complement the Gold primary.
- **Tertiary:** Transparent background with an `outline` (#9a8f80) underline that expands on hover.

### Cards & Lists
- **The "No-Divider" Mandate:** Forbid the use of horizontal rules. Separate list items using `surface-container` shifts or 32px/48px vertical gaps.
- **Product Cards:** Use a `surface-container-low` background. The image should be center-aligned with generous internal padding (min 40px) to allow the watch silhouette to "breathe."

### Input Fields
- **Minimalist State:** Bottom-border only using `outline-variant`. On focus, the border transitions to `primary` (Gold) with a subtle `primary` glow (4px blur).

### Specialized Component: The "Heritage HUD"
A floating overlay for technical specs. Use Glassmorphism (60% `surface-container-highest`) with `label-sm` text in `secondary` (Silver). This keeps the focus on the product while providing high-end technical utility.

---

## 6. Do's and Don'ts

### Do:
- **Do** use extreme vertical white space (80px, 120px, 160px) to separate collections.
- **Do** utilize "Staggered Grids" where images and text are slightly offset to create an editorial feel.
- **Do** use `primary` (Gold) sparingly—only for the most critical actions and highlights.

### Don't:
- **Don't** use a border-radius. Every corner must be `0px` to maintain the "Monolith" aesthetic.
- **Don't** use pure #000000 or pure #FFFFFF. Use the defined `surface` (#131313) and `on-surface` (#e5e2e1) to ensure tonal softness.
- **Don't** use standard "Select" or "Checkbox" components. Use custom-styled `surface-container` toggles that feel like physical switches on a timepiece.
