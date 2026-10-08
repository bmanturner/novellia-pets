---
name: Novellia Pets
description: A pet's vet passport for the household, with care status inked as stamps.
colors:
  cover-navy: "#1b2b5e"
  cover-navy-deep: "#142148"
  cover-ink: "#f3f5fb"
  cover-muted: "#b7c0db"
  gold-foil: "#dcb862"
  security-paper: "#eaeff6"
  data-page: "#ffffff"
  data-page-tint: "#f5f7fb"
  rule: "#cfd7e4"
  rule-strong: "#9aa6bd"
  ink: "#131a31"
  ink-muted: "#4f5a74"
  overdue-red: "#c8102e"
  overdue-on-cover: "#ffb3bf"
  due-soon-violet: "#5b3fa0"
  up-to-date-navy: "#1b2b5e"
  focus-blue: "#2f55d4"
typography:
  headline:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
    letterSpacing: "-0.01em"
  display-figure:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
  title-name:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: "28px"
    letterSpacing: "0.02em"
  title:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "24px"
  body:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.08em"
  stamp:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.14em"
  wordmark:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    letterSpacing: "0.16em"
  microchip:
    fontFamily: "Overpass Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0.1em"
rounded:
  stamp: "3px"
  photo: "4px"
  control: "6px"
  tabs: "8px"
  page: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "40px"
components:
  stamp-overdue:
    textColor: "{colors.overdue-red}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "4px 10px"
  stamp-due-soon:
    textColor: "{colors.due-soon-violet}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "4px 10px"
  stamp-up-to-date:
    textColor: "{colors.up-to-date-navy}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "4px 10px"
  photo-box:
    backgroundColor: "{colors.data-page-tint}"
    textColor: "{colors.cover-navy}"
    rounded: "{rounded.photo}"
    width: "88px"
    height: "112px"
  data-page:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "16px"
  microchip-strip:
    backgroundColor: "{colors.data-page-tint}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.microchip}"
    padding: "8px 16px"
  due-row:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    padding: "16px 20px"
  due-row-urgent:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
    padding: "16px 20px"
  button-primary:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.cover-navy-deep}"
  button-on-cover:
    backgroundColor: "{colors.cover-ink}"
    textColor: "{colors.cover-navy}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 14px"
  button-secondary:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.cover-navy}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 14px"
  button-secondary-hover:
    backgroundColor: "{colors.data-page-tint}"
  status-tab:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "32px"
    padding: "0 12px"
  status-tab-current:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
  field-input:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
  toast:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.tabs}"
    padding: "10px 8px 10px 16px"
---

# Design System: Novellia Pets

## Overview

**Creative North Star: "The Vet Passport"**

The dashboard is a pet passport opened on a desk. The top bar is the navy cover with its gold-foil wordmark and the e-passport chip symbol. Below it lies cool security paper, and each pet is a white data page: a passport-proportioned photo box, small-caps labelled fields, a ruled footer. Care status is not a badge or a count. It is an ink stamp pressed onto the page, in real text, double-ruled and slightly tilted.

Colour carries meaning and nothing else. Red means overdue, violet means due soon, navy means up to date. Gold foil appears once, on the wordmark. Everything else is navy ink on cool white and pale blue-grey paper. The density is a calm record-keeping density: 14px body, 1px rules, generous 16px page padding, no shadows at rest.

The system rejects, explicitly: stat-card counts, charts, paw-print decoration, guilloche patterns or stamps used as ornament, and modals. A stamp is always a real status with its word, never decoration.

**Key Characteristics:**

- Navy cover, gold wordmark, cool-paper ground, white data pages.
- Status ink (red / violet / navy) is the only semantic colour; status always carries its word.
- Flat and ruled: hairline borders, tonal tint strips, no resting shadows.
- One signature object: the tilted, double-ruled, multiply-blended stamp.
- Mono only for real microchip numbers.

## Colors

A navy-and-paper palette. The cover navy and security-paper blue-grey are the world; the three ink colours are a status vocabulary, not a decoration palette.

### Primary

- **Cover Navy** (`#1b2b5e`): the passport cover. Top bar, primary buttons, the current status tab, the toast, the urgent due row, photo-box art, and the up-to-date stamp ink (also form caret and accent colour).
- **Cover Navy Deep** (`#142148`): hover fill for the primary button; base of the toast shadow.
- **Cover Ink** (`#f3f5fb`): text and button fill on the cover. **Cover Muted** (`#b7c0db`): secondary text on the cover.

### Secondary

- **Gold Foil** (`#dcb862`): the wordmark and chip mark in the top bar, the stamp icon in the toast, and focus outlines when sitting on navy. Nowhere else.

### Tertiary (status ink)

- **Overdue Red** (`#c8102e`): overdue stamps only. **Overdue on Cover** (`#ffb3bf`) is its lightened form on navy.
- **Due Soon Violet** (`#5b3fa0`): due-soon stamps only. On navy the stamp uses a pale violet (`#d9ccff`, hard-coded in the stamp component rather than a token).
- **Up to Date Navy** (`#1b2b5e`): the same navy as the cover, drawn at 85% opacity on white.

### Neutral

- **Security Paper** (`#eaeff6`): page ground, scrollbar track.
- **Data Page** (`#ffffff`): every card, list container, and input.
- **Data Page Tint** (`#f5f7fb`): photo-box fill, microchip strip, hover on tabs and secondary buttons.
- **Rule** (`#cfd7e4`): hairline borders and dividers. **Rule Strong** (`#9aa6bd`): hover borders, dashed empty states, scrollbar thumb.
- **Ink** (`#131a31`): body text. **Ink Muted** (`#4f5a74`): labels, secondary lines, icons in fields.
- **Focus Blue** (`#2f55d4`): the only focus ring colour on paper (2px, 2px offset).

### Named Rules

**The Status-Only Ink Rule.** Red, violet and navy-as-ink mean overdue, due soon and up to date. They never colour a button, heading or decoration, and a status is never shown by colour alone: the stamp always prints its word.

**The One Foil Rule.** Gold foil belongs to the wordmark (and its immediate cover companions: chip mark, toast stamp icon, focus ring on navy). It is never a fill, border or accent on a data page.

## Typography

**Display / Body Font:** Public Sans (with ui-sans-serif, system-ui, sans-serif), loaded via next/font as `--font-public-sans`.
**Mono Font:** Overpass Mono (with ui-monospace, monospace), loaded as `--font-overpass-mono`.

**Character:** A civic, form-like sans that reads like printed government paperwork, set in tabular figures (the whole page uses `font-variant-numeric: tabular-nums`). Uppercase tracked small labels do the "printed form" work; the mono face is reserved for the one thing that is genuinely a serial number.

### Hierarchy

- **Display figure** (700, 32px, line-height 1, -0.02em): the days-left count in a due row.
- **Headline** (700, 22px / 28px, -0.01em): section headings (Next due, Pets, On medication now), with a normal-weight muted count beside it. The empty-state sentence "Nothing is overdue" and first-run heading use the same size.
- **Title, pet name** (800, 20px / 28px, +0.02em, uppercase): the name on a data page.
- **Title** (700, 16px / 24px): pet names and medication names in rows.
- **Body** (400, 14px / 20px; 15-16px in inputs and row titles): values, dates, secondary lines. Descriptive paragraphs are capped by their container (first-run copy within a 560px page).
- **Label** (600, 11px / 16px, +0.08em, uppercase): Field labels, "Due" / "Was due" captions, "No microchip on file".
- **Stamp** (800, 12px, line-height 1, +0.14em, uppercase): status stamps.
- **Wordmark** (700, 15px, +0.16em, uppercase): "Novellia Pets" in gold foil.
- **Microchip** (Overpass Mono, 12px / 16px, +0.1em, uppercase): "Chip" plus the formatted number.

### Named Rules

**The Real Serial Rule.** Mono type is only for microchip numbers. Do not use it for dates, counts, ids or "technical" flavour.

**The Printed Label Rule.** A label is small, uppercase, tracked, muted, and sits above its value (Field). It is a form label, not a kicker or eyebrow above a heading.

## Layout

A single centred column, `max-width: 1200px`, with 16 / 24 / 32px side padding at base / `sm` / `lg`, top padding 24px (40px at `lg`), and 64px bottom. The top bar is a 64px navy strip with the same container.

The dashboard stacks sections with 40px vertical gaps (`gap-y-10`) and 32px column gaps. Next due spans full width. Below it, at `lg` (1024px), a 2fr / 1fr grid holds the pet roster (left) and medications (right); below `lg` everything stacks, medications after the roster. The pet roster is one column and becomes two at `sm` (640px) with 16px gaps. A due row is a 2-column grid on mobile (days and stamp on top, pet and item next, date and action last) and expands to five columns at `md` (768px): 120px days, 22rem pet and item, flexible spacer, stamp, action.

Spacing runs on a 4px base with working steps of 8, 12, 16, 24, 32 and 40px. Data pages pad 16px; the first-run page pads 24px. Controls are 40px tall (32px for status tabs).

## Elevation & Depth

Flat and ruled. Depth comes from the paper-to-page step (`#eaeff6` to `#ffffff`), 1px borders, tonal tint strips (microchip strip, photo box) and one reversed navy row. There are no shadows at rest. The one shadow is the toast's, which floats over content: `0 8px 24px rgb(20 33 72 / 0.28)` (navy-tinted, not black).

Stamps use `mix-blend-mode: multiply` at 0.92 opacity and a faint 6% tint of their ink, so they read as ink pressed into paper instead of a chip laid on top.

### Named Rules

**The Flat-On-Paper Rule.** Surfaces carry no shadow at rest. Only the transient toast is lifted.

## Shapes

Gentle, small radii, like stationery rather than app chrome: 12px for data pages and list containers, 8px for the status-tab track and toast, 6px for buttons, inputs and tabs, 4px for the passport photo box (3px and 2px in the smaller photo sizes), 3px for stamps. Borders are 1px `rule`; the stamp alone uses a 3px double border, and empty or placeholder states use a dashed `rule-strong` border. Photo boxes use passport proportions (35 x 45 mm: 88 x 112px, 40 x 48px in a row, 20 x 24px inline). Stamps are rotated by a stable per-pet angle from the set -5, -2, 3, -4, 2, -3 degrees.

## Components

### Stamp

The signature object. Real text in uppercase 12px / 800, tracked 0.14em, in a 3px double border at the current ink colour, 3px radius, 4px x 10px padding, rotated by the per-pet tilt, 6% ink tint, multiply-blended. Three states only: Overdue (red), Due soon (violet), Up to date (navy). On the navy cover it is un-tinted and drawn in the on-cover inks (`#ffb3bf`, `#d9ccff`, `#f3f5fb`). When a dose is logged the affected pet's stamp replays **stamp-down**: 240ms, `cubic-bezier(0.16, 1, 0.3, 1)`, scales 1.35 to 0.96 to 1 while fading in. Prefers-reduced-motion collapses it.

### Photo box

A passport photo frame: 88 x 112px, 4px radius, 1px `rule` border, `data-page-tint` fill. Holds a species stamp-impression tinted in cover navy through a CSS mask (art from `public/species/<id>.svg|png|webp`); until an asset exists for that species the emoji holds the space, at reduced saturation. Always decorative (`aria-hidden`): the species name is always printed as text. Row (40 x 48) and inline (20 x 24) sizes exist; on navy the box is a 10% light fill with a 25% light border.

### Field

A label-over-value pair in a `dl`: Label style (11px / 600, uppercase, 0.08em, `ink-muted`) over a 14px / 20px value clamped to two lines. Used in a two-column grid, 16px column and 8px row gap.

### Data page (pet card)

White, 12px radius, 1px `rule` border (becomes `rule-strong` on hover over 150ms). Top: photo box and the uppercase pet name above a Field grid (Species, Breed, Sex, Age) in 16px padding. Middle: a ruled footer holding the next-due line and the Stamp. Bottom: a ruled `data-page-tint` strip with the microchip number in mono, or "No microchip on file" in Label style. The pet name is the single link, stretched across the whole card.

### Due row

A row in the divided Next due list (white, 12px radius, 1px divide). Each row: days figure, species mark with pet name and item, caption plus date, Stamp, and the log action. The first row, the most urgent, is **reversed**: a full-bleed Cover Navy plate with Cover Ink text, Cover Muted secondary text, on-cover stamp inks, and a light button. All other rows stay on white.

### Status tabs

A segmented control in a 1px-ruled, 8px-radius white track with 4px padding. Each tab is 32px tall, 14px, and carries its muted count. The current tab is Cover Navy with 600-weight Cover Ink text; others use Ink and tint on hover (150ms). Each tab is a link to a filtered URL and scrolls horizontally below `sm`.

### Buttons

- **Primary** (Cover Navy fill, Cover Ink text, 6px radius, 40px tall, 14px / 600, 16px side padding, optional 16px icon): hover darkens to Cover Navy Deep over 150ms. Used for "Add pet" in the first-run page.
- **On cover** (Cover Ink fill, navy text): "Add pet" in the top bar and the log action in an urgent row; hover to white; focus ring in gold foil.
- **Secondary** (white fill, navy text, 1px navy at 25% border): the log action in ordinary due rows; hover raises the border to 50% and tints the fill.
- **Focus:** 2px `focus` outline, 2px offset, 4px radius on paper; gold foil when on the cover.

### Search and select

40px tall, white, 1px `rule` border, 6px radius, 15px text, a muted 16px icon inset on the left (search) or right (chevron). Hover raises the border to `rule-strong`; focus shifts the border to Focus Blue and shows the focus ring. Search is debounced at 250ms and swaps its icon for a spinner while the filter is in flight. The species select is 192px wide from `sm`.

### Toast

Bottom-right (full-width bottom on mobile), Cover Navy fill, 8px radius, 14px Cover Ink text, a gold-foil stamp icon, and a 32px dismiss button. Enters with `toast-in` (200ms, same expo ease-out, 8px rise). It confirms a logged record, auto-dismisses after 6 seconds, and is the one place a shadow appears. It is not a modal.

### Empty and first-run states

Dashed `rule-strong` border for "No pets match these filters" with a Clear filters link. A blank data page with a dashed photo placeholder and the three stamps shows when no pets exist. The all-clear row pairs an Up to date stamp (tilted -3 degrees) with a sentence stating the next due item.

## Do's and Don'ts

### Do:

- **Do** express care status as a Stamp (words in red `#c8102e`, violet `#5b3fa0` or navy `#1b2b5e`), never as colour alone.
- **Do** keep gold foil `#dcb862` to the wordmark and its cover companions.
- **Do** reverse only the single most urgent due row onto Cover Navy; every other row stays white.
- **Do** build surfaces from white data pages on security paper, 1px `rule` borders, 12px radius, and no resting shadow.
- **Do** print every field with a small uppercase label above its value.
- **Do** keep mono type for real microchip numbers.
- **Do** replay stamp-down (240ms) and toast-in (200ms) with the expo ease-out only after a user action, and honour reduced-motion.
- **Do** tint species art in navy via a CSS mask and keep the species name in text.

### Don't:

- **Don't** use stat-card counts or charts to summarise status; counts sit as muted numerals beside headings and tabs.
- **Don't** add paw-print decoration, guilloche patterns, or stamps used as ornament; a stamp must be a real status.
- **Don't** use modals; confirmation is the toast, and action pages are routes.
- **Don't** colour buttons, headings or backgrounds in the status inks, or use red and violet for anything but state.
- **Don't** use gold as a fill or border on a data page.
- **Don't** put a chat or assistant surface on the dashboard; it is absent until a backend exists.
- **Don't** add resting drop shadows or heavy rounding to cards.
- **Don't** treat the hard-coded values in the build (`#d9ccff` on-cover due-soon stamp ink, `#f1dfae` text selection) as tokens for new work; they are carried in the build as one-offs.
