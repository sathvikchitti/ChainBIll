---
name: Modern Editorial Agency
colors:
  surface: '#fdf9ee'
  surface-dim: '#dddacf'
  surface-bright: '#fdf9ee'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e8'
  surface-container: '#f2eee3'
  surface-container-high: '#ece8dd'
  surface-container-highest: '#e6e2d7'
  on-surface: '#1c1c15'
  on-surface-variant: '#4a4550'
  inverse-surface: '#323129'
  inverse-on-surface: '#f5f0e5'
  outline: '#7b7481'
  outline-variant: '#ccc3d2'
  surface-tint: '#6e4ea1'
  primary: '#6e4ea1'
  on-primary: '#ffffff'
  primary-container: '#c3a0fa'
  on-primary-container: '#523183'
  inverse-primary: '#d6baff'
  secondary: '#84504c'
  on-secondary: '#ffffff'
  secondary-container: '#ffbbb5'
  on-secondary-container: '#7b4844'
  tertiary: '#5e5e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#b0b0b0'
  on-tertiary-container: '#434343'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ecdcff'
  primary-fixed-dim: '#d6baff'
  on-primary-fixed: '#280057'
  on-primary-fixed-variant: '#553587'
  secondary-fixed: '#ffdad6'
  secondary-fixed-dim: '#f9b6b0'
  on-secondary-fixed: '#34100e'
  on-secondary-fixed-variant: '#693a36'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#fdf9ee'
  on-background: '#1c1c15'
  surface-variant: '#e6e2d7'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 80px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-desktop: 64px
  margin-mobile: 24px
  gutter: 24px
  section-gap: 120px
  stack-gap: 16px
---

## Brand & Style
The design system is defined by a sophisticated, editorial-inspired aesthetic tailored for high-end communication and creative strategy. It blends **Minimalism** with subtle **Neo-Brutalist** elements to create a space that feels curated yet functional. 

The visual narrative prioritizes clarity, utilizing generous whitespace and high-contrast typography to signal authority and creative precision. The emotional response is one of calm confidence—moving away from the frantic energy of traditional tech platforms toward a measured, high-end agency environment. Interaction should feel intentional, with transitions that emphasize the flow of content rather than flashy ornamentation.

## Colors
The palette is built on a foundation of warm neutrals and soft, sophisticated pastels. The primary background is the cream tone (`#F2EEE3`), which provides a softer, more premium feel than pure white. 

Lavender (`#C3A0FA`) serves as the primary brand driver, used for key interactive elements and visual anchors. Coral (`#F8B5AF`) acts as a secondary accent for highlights and differentiation. Black (`#000000`) is used strictly for typography and structural borders to maintain a grounded, high-contrast legibility. This combination ensures the design system feels fresh and modern without sacrificing the "serious" nature of a professional agency.

## Typography
The typographic hierarchy uses three distinct families to create a structured, editorial rhythm.

1.  **Headlines:** The high-contrast serif (mapped to Playfair Display) is the centerpiece of the design system. It should be used in large scales with tight leading to mimic magazine headlines.
2.  **Body:** A clean, contemporary grotesque (mapped to Hanken Grotesk) handles all long-form content, ensuring readability while maintaining a modern edge.
3.  **Utility & Metadata:** A monospaced font (mapped to JetBrains Mono) is used for labels, captions, and technical data. This adds a layer of "work-in-progress" agency precision and serves as a visual counterpoint to the elegant headlines.

All type should favor optical sizing; headlines should have negative letter-spacing at large sizes, while monospaced labels should have increased tracking for legibility.

## Layout & Spacing
This design system utilizes a **Fixed Grid** approach for desktop and a **Fluid Grid** for mobile devices. The layout is intentionally "spacious," favoring extreme vertical margins (Section Gaps) to allow content to breathe and to signal a premium experience.

- **Desktop:** 12-column grid with 64px outer margins and 24px gutters. Content should often be centered or offset to create asymmetrical interest.
- **Mobile:** 4-column grid with 24px outer margins.
- **Rhythm:** Spacing follows a base-8 unit system, but "Section Gaps" are exaggerated (120px+) to separate distinct thoughts or case studies. Negative space is considered a functional element of the layout, not just an absence of content.

## Elevation & Depth
Depth in this design system is achieved through **Tonal Layers** and **Low-contrast Outlines** rather than traditional shadows.

- **The Base:** The primary surface is the Neutral Cream.
- **The Container:** Sub-sections or cards use subtle borders (0.5px to 1px) in solid Black or a slightly darker tint of the background color.
- **Stacked Depth:** When elements need to appear "above" the base, they use a slightly shifted background color (e.g., Lavender or Coral) to create a flat, layered effect. 
- **Interaction:** Shadows are avoided. Instead, "elevation" is signaled by a color shift or an offset border effect (reminiscent of Neo-Brutalism but executed with minimalist restraint).

## Shapes
The shape language is primarily **Soft**, using subtle rounding to take the edge off the structural grid. 

Standard components (buttons, input fields) use a 0.25rem (4px) radius. Larger containers or imagery may use "rounded-lg" (8px) for a more approachable feel. However, the system avoids pill-shapes or hyper-rounded corners to maintain its professional, editorial character. Imagery should strictly follow these rounding rules to ensure a cohesive visual "container" across the platform.

## Components
Consistent component styling reinforces the agency's modern aesthetic:

- **Buttons:** Use a flat, high-contrast style. Primary buttons are solid Black with White or Lavender text. Secondary buttons are outlined with 1px Black strokes. Hover states should trigger a fill color change (to Lavender) rather than a shadow.
- **Chips/Tags:** Small, monospaced text within a Coral or Lavender background with "Soft" (4px) corners. These are used for categorization or status indicators.
- **Input Fields:** Minimalist design with a bottom-border only or a very light 1px outline. Focus states should use a bold 2px Black bottom border. Labels must use the Monospaced font in all-caps.
- **Cards:** Defined by their generous internal padding (32px+) and thin Black borders. Cards should never use shadows; depth is communicated by the background color of the card itself.
- **Lists:** Clean, alternating dividers with 0.5px thickness. Use the Monospaced font for numbering to add a technical, organized feel to process lists.
- **Case Study Previews:** High-quality imagery should occupy 50-100% of the card width, featuring "Soft" rounded corners and large Playfair Display titles.