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
  danger: "#c8102e"
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
  small:
    fontFamily: "Public Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
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
  page-tab:
    textColor: "{colors.ink-muted}"
    typography: "{typography.body}"
    height: "44px"
  page-tab-current:
    textColor: "{colors.ink}"
  field-input:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.data-page}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 16px"
  button-danger-outline:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    height: "40px"
    padding: "0 14px"
  dialog:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    width: "640px"
  dialog-confirm:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    width: "440px"
  toast:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.tabs}"
    padding: "10px 8px 10px 16px"
  chat-panel:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    width: "400px"
  chat-panel-head:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
    height: "64px"
    padding: "0 16px"
  chat-confirmation:
    backgroundColor: "{colors.data-page-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "12px"
  chat-composer-field:
    backgroundColor: "{colors.data-page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  chat-send:
    backgroundColor: "{colors.cover-navy}"
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.control}"
    size: "32px"
---

# Design System: Novellia Pets

## Overview

**Creative North Star: "The Vet Passport"**

The app is a pet passport opened on a desk. The top bar is the navy cover with its gold-foil wordmark and a gold-foil paw print. Below it lies cool security paper, and each pet is a white data page: a passport-proportioned photo box, small-caps labelled fields, a ruled footer. Care status is not a badge or a count. It is an ink stamp pressed onto the page, in real text, double-ruled and slightly tilted. A pet's own page is the passport flipped open: one header data page and three page tabs (Status, Records, Profile), each its own URL.

Colour carries meaning and nothing else. Red means overdue (and, as Danger, a destructive action or a form error), violet means due soon, navy means up to date. Gold foil appears once, on the wordmark. Everything else is navy ink on cool white and pale blue-grey paper. The density is a calm record-keeping density: 14px body, 1px rules, generous 16px page padding, no shadows at rest.

The system rejects, explicitly: stat-card counts, charts, guilloche patterns or stamps used as ornament, and a single endless profile scroll. A stamp is always a real status with its word, never decoration.

**Key Characteristics:**

- Navy cover, gold wordmark, cool-paper ground, white data pages.
- Status ink (red / violet / navy) is the only semantic colour; status always carries its word. Red doubles as Danger for destructive actions and errors, always with words.
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

- **Gold Foil** (`#dcb862`): the wordmark and paw mark in the top bar, the stamp icon in the toast, and focus outlines when sitting on navy. Nowhere else.

### Tertiary (status ink)

- **Overdue Red** (`#c8102e`): overdue stamps. **Overdue on Cover** (`#ffb3bf`) is its lightened form on navy.
- **Danger** (same red, its own token): destructive actions (the delete buttons and the confirm button in a delete dialog) and form errors (the invalid input border, the error line with its alert icon). Never decoration, never a heading.
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

**The Meaningful Ink Rule.** Red, violet and navy-as-ink mean overdue, due soon and up to date; red as Danger additionally marks a destructive action or a form error. They never colour a heading or decoration, a status is never shown by colour alone (the stamp prints its word), and a danger control or error always says what it does or what is wrong in words.

**The One Foil Rule.** Gold foil belongs to the wordmark (and its immediate cover companions: paw mark, toast stamp icon, focus ring on navy). It is never a fill, border or accent on a data page.

## Typography

**Display / Body Font:** Public Sans (with ui-sans-serif, system-ui, sans-serif), loaded via next/font as `--font-public-sans`.
**Mono Font:** Overpass Mono (with ui-monospace, monospace), loaded as `--font-overpass-mono`.

**Character:** A civic, form-like sans that reads like printed government paperwork, set in tabular figures (the whole page uses `font-variant-numeric: tabular-nums`). Uppercase tracked small labels do the "printed form" work; the mono face is reserved for the one thing that is genuinely a serial number.

### Hierarchy

- **Display figure** (700, 32px, line-height 1, -0.02em): the days-left count in a due row.
- **Headline** (700, 22px / 28px, -0.01em): section headings (Next due, Pets, On medication now), with a normal-weight muted count beside it. The empty-state sentence "Nothing is overdue" and first-run heading use the same size.
- **Title, pet name** (800, 20px / 28px, +0.02em, uppercase): the name on a data page; 24px / 32px in the pet page header from `sm`.
- **Title** (700, 16px / 24px): pet names and medication names in rows.
- **Body** (400, 14px / 20px; 15-16px in inputs and row titles): values, dates, secondary lines. Descriptive paragraphs are capped by their container (first-run copy within a 560px page).
- **Label** (600, 11px / 16px, +0.08em, uppercase): Field labels, "Due" / "Was due" captions, "No microchip on file".
- **Small** (400, 13px): form hints and error lines, record status lines ("Due Tue, Nov 17"), and the compact Edit / Delete row actions.
- **Stamp** (800, 12px, line-height 1, +0.14em, uppercase): status stamps.
- **Wordmark** (700, 15px, +0.16em, uppercase): "Novellia Pets" in gold foil.
- **Microchip** (Overpass Mono, 12px / 16px, +0.1em, uppercase): "Chip" plus the formatted number.

### Named Rules

**The Real Serial Rule.** Mono type is only for microchip numbers. Do not use it for dates, counts, ids or "technical" flavour.

**The Printed Label Rule.** A label is small, uppercase, tracked, muted, and sits above its value (Field). It is a form label, not a kicker or eyebrow above a heading.

## Layout

A single centred column, `max-width: 1200px`, with 16 / 24 / 32px side padding at base / `sm` / `lg`, top padding 24px (40px at `lg`), and 64px bottom. The top bar is a 64px navy strip with the same container. Page layouts respond to the width of the app shell (a `@container` wrapper in the root layout), not the viewport, so a docked inquiry panel narrows the column and the grids below reflow to fit what remains; the breakpoints named below are container widths for the dashboard and pet status grids and viewport widths elsewhere.

The dashboard stacks sections with 40px vertical gaps (`gap-y-10`) and 32px column gaps. Next due spans full width. Below it, once the app shell is 1024px wide, a 2fr / 1fr grid holds the pet roster (left, 2fr) and medications (right, 1fr). Narrower than 1024px, everything stacks in the order Next due, On medication now, Pets; the DOM order is the same (medications before Pets), so keyboard order matches the mobile order, and the desktop columns are unchanged. On medication now carries a muted 14px "All pets" line under its heading and is a native `<details>` open by default: below 1024px its heading is a summary that collapses the list, with a chevron; from 1024px the chevron is hidden and the list stays open. The pet roster is one column of compact rows with 8px gaps below `sm`, and becomes two columns of full data pages at `sm` (640px) with 16px gaps. A due row is a 2-column grid on mobile (days and stamp on top, pet and item next, date and action last) and expands to five columns at `md` (768px): 120px days, 22rem pet and item, flexible spacer, stamp, action.

Spacing runs on a 4px base with working steps of 8, 12, 16, 24, 32 and 40px. Data pages pad 16px (20px from `sm` on pet pages); the first-run page pads 24px. Controls are 40px tall (status tabs and row actions are 32px from `sm` and 44px tall below it; page tabs are 44px). Inline pet links get a 44px hit area below `sm`.

The pet page uses the same 1200px column: the back link, the header data page, the page tabs, then the tab's content 32px below. Status puts Next due full width, then a 2-column grid (once the app shell is 1024px wide) of Allergies & conditions, Current medications, Vaccinations and Last vet visit with 40px row and 32px column gaps. Records stacks search, the type tabs, and year-grouped lists; each record row is a 96px date column, the content, and right-aligned actions from `sm`. Full-page forms (a hard load of a form URL) use a 640px column.

The inquiry panel is a 400px column (`--chat-panel-width`) on the right edge. From 1280px it docks: the page column and the top bar's content take 400px of right padding, so nothing is covered. From 640px to 1279px it overlays the page. Below 640px it is a full-screen sheet and the page behind stops scrolling.

The vet summary is a narrower, document-width page: a single 880px column (`max-w-[880px]`, 16 / 24px side padding, 24px top and 40px at `lg`, 64px bottom) outside the pet tabs, with no pet header. In print the column limit and padding go, and the page margin is the paper's (see Vet summary).

## Elevation & Depth

Flat and ruled. Depth comes from the paper-to-page step (`#eaeff6` to `#ffffff`), 1px borders, tonal tint strips (microchip strip, photo box) and one reversed navy row. There are no shadows at rest. Three transient surfaces float: the toast, `0 8px 24px rgb(20 33 72 / 0.28)`, the dialog, `0 24px 64px rgb(20 33 72 / 0.35)` over a Cover Navy Deep scrim at 55%, and the inquiry panel in overlay mode only, a left-edge shadow `-16px 0 40px rgb(20 33 72 / 0.18)`. Docked at 1280px and up, the panel has no shadow and is separated by a 1px `rule` edge. All shadows are navy-tinted, never black.

Stamps use `mix-blend-mode: multiply` at 0.92 opacity and a faint 6% tint of their ink, so they read as ink pressed into paper instead of a chip laid on top.

### Named Rules

**The Flat-On-Paper Rule.** Surfaces carry no shadow at rest. Only the transient toast, an open dialog, an overlaying (not docked) inquiry panel and the inquiry panel's Latest button (`0 4px 14px rgb(20 33 72 / 0.22)`) are lifted.

## Shapes

Gentle, small radii, like stationery rather than app chrome: 12px for data pages and list containers, 8px for the status-tab track and toast, 6px for buttons, inputs and tabs, 4px for the passport photo box (3px and 2px in the smaller photo sizes), 3px for stamps. Borders are 1px `rule`; the stamp alone uses a 3px double border, and empty or placeholder states use a dashed `rule-strong` border. Photo boxes use passport proportions (35 x 45 mm: 88 x 112px, 40 x 48px in a row, 20 x 24px inline). Stamps are rotated by a stable per-pet angle from the set -5, -2, 3, -4, 2, -3 degrees.

## Components

### Stamp

The signature object. Real text in uppercase 12px / 800, tracked 0.14em, in a 3px double border at the current ink colour, 3px radius, 4px x 10px padding, rotated by the per-pet tilt, 6% ink tint, multiply-blended. Three states only: Overdue (red), Due soon (violet), Up to date (navy). On the navy cover it is un-tinted and drawn in the on-cover inks (`#ffb3bf`, `#d9ccff`, `#f3f5fb`). When a dose is logged, or the inquiry panel confirms a change to a pet's records, that pet's stamp replays **stamp-down**: 240ms, `cubic-bezier(0.16, 1, 0.3, 1)`, scales 1.35 to 0.96 to 1 while fading in (and once more if the refreshed status lands just after). Prefers-reduced-motion collapses it.

### Photo box

A passport photo frame: 88 x 112px, 4px radius, 1px `rule` border, `data-page-tint` fill. Holds a species stamp-impression tinted in cover navy through a CSS mask (art from `public/species/<id>.svg|png|webp`); until an asset exists for that species the emoji holds the space, at reduced saturation. Always decorative (`aria-hidden`): the species name is always printed as text. Row (40 x 48) and inline (20 x 24) sizes exist; on navy the box is a 10% light fill with a 25% light border.

### Field

A label-over-value pair in a `dl`: Label style (11px / 600, uppercase, 0.08em, `ink-muted`) over a 14px / 20px value clamped to two lines. Used in a two-column grid, 16px column and 8px row gap.

### Data page (pet card)

White, 12px radius, 1px `rule` border (becomes `rule-strong` on hover over 150ms). Top: photo box and the uppercase pet name above a Field grid (Species, Breed, Sex, Age) in 16px padding. Middle: a ruled footer holding the next-due line and the Stamp. Bottom: a ruled `data-page-tint` strip with the microchip number in mono, or "No microchip on file" in Label style. The pet name is the single link, stretched across the whole card. On the dashboard roster, below `sm`, the card is a compact row (at least 64px tall, 8px gaps between rows): a 40 x 48px row photo box, the uppercase name with the species name beside it in muted text, a two-line due area (the title on line 1; "{Lateness} · {date}" on line 2, lateness first so truncation only clips the date; one line each), and the Stamp on the right. The whole row is one stretched link. From `sm` the full data page above shows. The species name is always shown as text.

### Pet header

The data page that tops a pet's Status, Records and Profile pages: a 12px-radius white box with a 1px `rule` border, the photo box (row size on phones), the uppercase name (20px / 28px, 24px / 32px from `sm`, 800), the Field grid, the actions and the microchip strip.

- **Stamp:** top right, beside the name, the pet's overall care status. When `PetCare.status` is null (no record has a due date) the stamp is replaced by "No due dates on file" in 14px Ink Muted; a stamp is never shown for nothing.
- **Safety line:** under the Field grid, a 14px / 20px wrapping line of up to three groups, each a Label-style group label (11px / 600, uppercase, 0.08em, Ink Muted) followed by its items in Ink: ALLERGY or ALLERGIES (by count), CONDITION or CONDITIONS, and MEDS. Allergies and conditions add their severity in parentheses; meds add their dose. A group shows at most 2 items, then a muted "+N more". A group with nothing recorded is omitted, and the whole line is omitted when nothing is recorded, with no "None" placeholder. It answers the first question at a vet desk without a tab change.
- **Actions:** Add record, Edit pet and Vet summary (see Buttons); below `sm`, Add record and the More menu share one row.

### Pet list (roster layout)

The dashboard roster has two layouts, picked by a **Card / List** segmented control floated right on the status-tab row: the same track and segment styling as the status tabs, each option a 16px icon (LayoutGrid, Rows3) plus its word; below `sm` the word goes screen-reader-only and each segment is 44 x 44. It is a link to `?view=list` (cards are the default and leave no param), so the layout survives a refresh, filtering, Clear filters and Show N more. List is one white data page (12px radius, 1px `rule` border) divided by 1px rules, a row per pet, at least 64px tall, tinting on hover: the 40 x 48 row photo box; the uppercase name (16px / 800) over a 13px Ink Muted "{Species} · {breed} · {age}" (species only below `sm`, beside the name); the due area (title, then "{Lateness} · {date}"), in an equal-width second column from `sm` so it lines up down the list; and the Stamp in a fixed 112px right-aligned slot. The name link stretches across the row. No sorting control: the roster keeps its needs-attention-first order.

### Due row

A row in the divided Next due list (white, 12px radius, 1px divide). Each row: days figure, species mark with pet name and item, caption plus date, Stamp, and the log action. The first row, the most urgent, is **reversed**: a full-bleed Cover Navy plate with Cover Ink text, Cover Muted secondary text, on-cover stamp inks, and a light button. All other rows stay on white. On the dashboard the list shows 5 rows, then a semibold 14px Cover Navy underlined "Show N more" link (`?due=all`, 44px tall below `sm`, 36px from it) that becomes "Show fewer" when expanded; the heading count is always the total. On the dashboard (household scope) the muted line beside the heading reads "All pets · As of {date}"; the pet page keeps "As of {date}".

### Status tabs

A segmented control in a 1px-ruled, 8px-radius white track with 4px padding. On the dashboard, Clear filters sits beside it when a filter is active and results exist. Each tab is 44px tall below `sm` and 32px from `sm`, 14px, and carries its muted count; a non-current tab whose count is zero is set in Ink Muted. The current tab is Cover Navy with 600-weight Cover Ink text; others use Ink and tint on hover (150ms). Each tab is a link to a filtered URL and scrolls horizontally below `sm`, with a fade on the right edge of the scroller to show there is more. The same control filters a pet's records by type (its chips are 44px tall below `sm`, 32px from it), and, built from radio inputs, picks the record type in the add-record form (below `sm` the four record types sit in a 2 x 2 grid of 44px segments; from `sm` they wrap inline at 32px).

### Page tabs

The passport's page turns: Status, Records (with its muted count) and Profile under a pet's header. Underlined, not segmented, so they never read as a filter: 44px tall, 15px, Ink Muted, on a 1px `rule` baseline with 24px gaps. The current page is bold Ink with a 3px Cover Navy underline sitting on the rule, and carries `aria-current="page"`. Each tab is its own URL. While a dialog masks the URL, the current tab holds. Switching tabs keeps the scroll position: the links don't scroll, and the tab content area is at least a screen tall, so a shorter tab never pulls the page up while the tabs are in view.

### Dialog

A route-backed modal for adding and editing pets and records: in-app navigation opens it over the current page; a hard load of the same URL shows a full page form instead. Escape, the backdrop and the close button all go back. The close button is 32px with a 44px hit area below `sm`. The dialog's children remount on each open, so cancelled input never resurfaces. White, 12px radius, 1px `rule` border, 640px wide (440px for a delete confirmation), with a ruled header (22px / 700 title) and a ruled footer holding Cancel (secondary) and the submit button. It enters with `dialog-in` (200ms expo ease-out, 8px rise, 0.98 scale) over a Cover Navy Deep scrim at 55%, and locks page scroll. Below `sm` it fills the screen. Delete confirmations are the same surface without a route.

**Log dose / Log refill** is a reduced mode of the record dialog. The title is "{verb} · {item}"; below it "For {pet}" and a Small muted "Was due {date}" (or "Due {date}" when not yet past). There is no record-type switcher and no title field (both are hidden inputs). The values from the last record of that title are carried over (a vaccination's clinic; a medication's dose, frequency and prescriber), and the lot number is never carried, since each dose has its own. Dates are prefilled: the date given is today, and the next due date is suggested by repeating the previous record's interval from today (when the last record had no due date, none is suggested). Secondary fields and notes sit behind a native "More details" disclosure (Cover Navy, semibold, 14px, 44px tall below `sm`, "Fewer details" while open); closed, its summary shows the carried values, e.g. "More details · Cypress Beach Veterinary", so the reader can see what will be saved without opening it. The submit button carries the verb ("Log dose" or "Log refill", "Logging…" while pending).

### Form field

A Label-style label above a 40px white input (1px `rule`, 6px radius, 15px), optional Small muted hint below. A required field shows a "Required" cue beside its label: the label's own muted ink, but in sentence case at medium weight with no tracking, 6px after the label text, so it reads as a note, not a second label. Placeholders are Ink Muted. Hover raises the border to `rule-strong`, focus moves it to Focus Blue with the focus ring. An invalid field turns its border Danger and shows a Small Danger error line with an alert icon, wired by `aria-describedby`. Selects carry the right-inset chevron; textareas start at 96px. Fields sit in a 2-column grid from `sm` with 16px gaps; title, notes and long text span both columns. Forms use `noValidate`, so the browser never intercepts submit; the server returns every error at once, and after a failed submit every field, including selects and radios, keeps the submitted value (the fields grid remounts from the returned values). A pet's date of birth cannot be after today, and the microchip field carries a hint.

Due date fields carry **date shortcuts** under the input: Small (13px) semibold Cover Navy text buttons (40px tall below `sm`, 32px from it), underlined at 40% and darkening on hover, that fill the date. Vaccination "Next due" offers Next year and "+3 years", both counted from the date given. Each button's hit area is 40px tall below `sm` and 32px from it, with a 4px negative side margin so the text still lines up with the field. A vet visit's "Next checkup due" offers Next year and Next month, counted from the visit date. A medication's "Refill or recheck due" offers Next month, counted from today. Dates that don't exist clamp to the month's last day. Each shortcut's accessible name says what it sets, and a status line announces the new date.

### Full-page form

A hard load of a form URL shows the form in a 640px column with a back link above the title: a 16px arrow and 14px Ink Muted text, "← Pets" to home by default. The top bar hides Add pet on `/pets/new`.

### Buttons

- **Primary** (Cover Navy fill, Cover Ink text, 6px radius, 40px tall, 14px / 600, 16px side padding, optional 16px icon): hover darkens to Cover Navy Deep over 150ms. Used for "Add pet" in the first-run page.
- **On cover** (Cover Ink fill, navy text): "Add pet" in the top bar and the log action in an urgent row; hover to white; focus ring in gold foil.
- **Secondary** (white fill, navy text, 1px navy at 25% border): the log action in ordinary due rows, Edit pet, Cancel; hover raises the border to 50% and tints the fill.
- **Secondary, in the pet header:** "Vet summary" with a 16px document icon follows Edit pet in the same Secondary style. Below `sm` it moves into the **More** menu: the header shows Add record (Primary, 44px, filling the row) beside a Secondary 44px "More" button (16px ellipsis icon) that opens a small menu of real links, Edit pet and Vet summary (44px rows, 14px / 600 Cover Navy, 8px-radius white panel with a 1px `rule` border and a shadow; Escape and an outside tap close it, arrow keys move, focus returns to More). From `sm` all three are separate 40px buttons in the right-aligned action group. The summary toolbar's **Print** is a Primary (40px, 16px printer icon).
- **Danger** (Danger fill, white text, the Primary's shape): only the confirm button inside a delete confirmation, in the dialog or in the inquiry panel (where it is 32px tall, 13px); label names the act ("Delete record", "Delete Hooch") and reads "Deleting…" while pending in the dialog.
- **Danger outline** (white fill, Danger text, Danger at 40% border, trash icon): the button that opens a pet's delete confirmation. In record rows it is a compact 13px text-only Delete beside Edit, 44px tall below `sm` and 32px from it.
- **Focus:** 2px `focus` outline, 2px offset, 4px radius on paper; gold foil when on the cover.

### Search and select

40px tall, white, 1px `rule` border, 6px radius, 15px text, a muted 16px icon inset on the left (search) or right (chevron). Hover raises the border to `rule-strong`; focus shifts the border to Focus Blue and shows the focus ring. Search is debounced at 250ms and swaps its icon for a spinner while the filter is in flight. The species select is 192px wide from `sm`.

### Toast

Bottom-right (full-width bottom on mobile), Cover Navy fill, 8px radius, 14px Cover Ink text, a gold-foil stamp icon, and a 32px dismiss button. Enters with `toast-in` (200ms, same expo ease-out, 8px rise). It confirms a logged record or a saved, updated or deleted pet or record, auto-dismisses after 6 seconds, and removes its URL flag (`logged` or `notice`) so a reload doesn't repeat it. From 640px it sits 24px left of an open inquiry panel rather than under it. Changes confirmed inside the panel do not raise a toast; the panel's own line and the re-inked stamp are the confirmation.

### Inquiry panel

The household's question desk: a 400px column that answers from the records and, when asked, changes them. Present on every page; absent entirely when chat is not configured.

- **Ask button:** in the top bar, on the cover: 40px, 6px radius, 1px Cover Ink at 30% border, Cover Ink 14px / 600 label with a 16px speech icon (icon only below `sm`); open state fills Cover Ink at 15%; hover 10%. Gold-foil focus ring. It carries `aria-expanded`; closing returns focus to it. Opens as a 200ms `chat-panel-in` slide (24px from the right, expo ease-out). The panel follows the top bar in the DOM, so it is the next Tab stop group after the bar. While it is open, Escape closes it from anywhere on the page (not over an open dialog).
- **Placement:** docked from 1280px (page column and top bar content give up 400px), overlay with the navy-tinted edge shadow from 640px to 1279px, full-screen sheet below 640px. In overlay mode a press anywhere outside the panel closes it and still reaches what was pressed; docked, presses on the page leave it open.
- **Head:** a 64px Cover Navy bar that continues the top bar's cover band, with a 1px Cover Ink 15% seam on its left edge, "Ask" (16px / 700) beside a 13px Cover Muted "Not saved · reload clears", and a 32px close button. Below it the body is a white data page with a 1px `rule` left edge.
- **Transcript:** each user question is an entry headed by a Label-style "You asked" caption, then the question in Ink, 15px / 24px, semibold. Every question after the first is set off by a 1px `rule` top border with 24px above the question and 8px below the previous answer; no bubbles. The transcript is always top-anchored. The answer is plain Ink 15px / 24px text and markdown. Answers never show ISO dates: the chat agent's tool results carry a ready-made human date ("Sep 29, 2026") and, for due dates, the app's lateness wording ("10 days late", "due in 11 days"), computed in code (`lib/chat/human-dates.ts`) and copied by the model. The agent is given a household roster with each pet's sex (for pronouns) and existing record titles (so a recurring item keeps its exact title). Sources close an answer, and appear only once the answer has text, as a ruled disclosure that starts closed: its summary is the Label-style **FROM RECORDS** caption with a muted count and a 14px chevron (Ink on hover, 44px tall on coarse pointers). Opened, it lists record links: 14px / 600, underlined in full Cover Navy (hover thickens the underline), with a 13px muted line of pet, type and a dated verb that always carries the year ("Given Sep 29, 2025"; Started, Visited or Noted by type). When the records span several pets they group under Label-style pet-name captions and the line drops the pet. The first 5 show; a 13px semibold Cover Navy "Show N more" button (`aria-expanded`) reveals the rest. A link opens that pet's Records page with the cited row tinted (Cover Navy at 6%, `aria-current`). A navigation shows "↳ Opened {page}" in 14px / 500 Ink with a Cover Navy corner arrow and the link; the agent adds no sentence restating it.
- **Confirmation:** the only boxed object in the transcript: a 12px-radius `data-page-tint` box with a 1px `rule` border and 12px padding, holding one sentence of what will change, a ruled two-column Field list of what will be written (Pet, Record, the type's dates and details; only the changed fields for an update; "Not recorded" for a missing vaccination next-due; an "Existing item" row when the title nearly matches one the pet already has, e.g. "Rabies (1-year): this won't replace its due date"), and two buttons: a Primary confirm naming the act ("Add vaccination", "Save Hooch"), or Danger for a delete ("Delete Hooch", "Delete record"), and a Secondary Cancel. Buttons are 32px tall, 44px on coarse pointers. A new confirmation takes focus once (a `role="group"` named by its sentence); when its buttons go away, focus returns to the composer (fine pointers). It resolves to a one-line past-tense statement with a navy check and a "View" link, or "Cancelled. Nothing changed."; after a cancel the agent does not reply, and nothing is sent until the owner asks again. A failure is a 13px Danger line with its alert icon in plain words ("Couldn't add that. Nothing changed. You can ask again or use the form."), never the raw error. A failed attempt the agent has already retried in the same answer is not shown: only the final outcome is red.
- **Activity and error:** a running tool shows a spinner with a 13px muted phrase ("Working on it…"). Stopping a reply ends it with a 13px muted "Stopped." line and returns focus to the composer. A failed request shows an alert icon, "Couldn't reach the assistant." and a Secondary **Try again**. A **Latest** secondary button appears only after the reader scrolls up themselves (wheel, touch, drag or scroll keys), never from content growing; it straddles the composer's top rule, lifted by its shadow.
- **Empty state:** anchored to the top of the transcript, 24px down: a 22px / 700 "Ask about your pets" over three suggested questions as ruled rows (muted corner-arrow icon, 14px Ink, tint on hover), and a 13px muted line that answers come from records and are not a diagnosis.
- **Composer:** a ruled footer holding a framed field (1px `rule`, 6px radius, hover `rule-strong`, Focus Blue border and ring on focus) with an auto-growing textarea (15px; 16px on mobile), an "About" context chip on the bottom left (species mark, pet name, a 24px remove button; tint fill, 1px `rule`) and a 32px send button (Cover Navy, arrow icon) that becomes a Secondary stop button while a reply streams. On coarse pointers Send, Stop and the chip's remove button extend their hit area to 44px, and opening the panel does not focus the field, so the keyboard doesn't cover the suggestions.
- **Re-ink signal:** the page refreshes the moment a chat-confirmed change is saved (the server streams a transient `data-changed` part right after the write), not when the agent finishes its reply; deleting the pet you're viewing goes to the dashboard instead. When the change touches a pet's records, that pet's stamp wherever it is on the page replays stamp-down. There is no toast.

### Vet summary

The pet's handover: a passport data page you can cut out, stapled to a full clinical sheet, for a new vet, ER staff, a boarding desk or a sitter who has no app context. It is the same Vet Passport world, with no new tokens. Allergies, medications and conditions lead for every reader; there is no owner contact block.

- **Sheet:** one `article` in a 880px column. On screen a white data page (12px radius, 1px `rule` border, 20px padding, 32px from `sm`) on the paper ground; in print plain paper with no border, radius or padding, so the page margin does the work. Order: wallet card beside the title block, then sections 40px apart (36px between sections on screen, 28px in print), then the footer.
- **Toolbar:** screen only (`print:hidden`), above the sheet: a back link (16px arrow, the pet's name, 14px Ink Muted, Ink on hover) on the left; on the right an "Include full history ({count})" checkbox (16px, navy accent, 14px Ink) and a Primary Print button. The checkbox appears only when the pet has records; it flips `?history=1` with `router.replace` and no scroll jump, showing the new state at once and marking the label `aria-busy` while it loads.
- **Wallet card:** true size, 125 x 88 mm (the card is `min-height` 88mm on screen and exactly 88mm tall in print), a 12px-radius data page with a 1px `rule` border. It sits in a dashed `rule-strong` cut frame (16px radius, 8px padding) with a 16px Ink Muted scissors icon on the top border at 16px from the left, and the caption "Cut out for the carrier or fridge." beneath (13px Ink Muted). It is `break-inside-avoid` and prints its fills exactly.
  - **Identity:** the photo box beside the uppercase name (20px / 28px, 800, 0.02em) over a two-column Field grid: Species, Breed (or "—"), Sex, Age (or "Unknown").
  - **Safety rows:** a ruled `dl` of three rows, Allergies, Medications, Conditions, each a Label-style term (92px column) and a 13px / 18px value clamped to two lines (one in print). A row shows at most 3 items, then ", +N more on the sheet"; an empty row reads "None recorded" in Ink Muted. Allergies add their severity in parentheses, medications their dose.
  - **Status row:** a ruled row with the next due item ("Next due {title} · {date}", or "Was due" when overdue; "No due dates on file" when none) over a 12px muted "Status as of {date}", and the pet's Stamp on the right.
  - **Foot:** the microchip strip, as on the data page. The card is a flex column in which only the safety rows shrink and clip, so overflow trims them, never the status row or the chip.
- **Title block:** beside the card from `sm` (the card's column is 125mm plus the frame; the block takes the rest, 32px gap), stacked above it on phones with the card first at full width. "Vet summary" as the Headline (22px / 28px, 700); the pet's name in caps (15px / 700) with a 14px muted species and breed ("Breed not recorded" when absent); a 14px "As of {long date with year}"; a 13px muted "Kept by the owner in Novellia Pets. Not reviewed by a vet." Below, the **Status key**: a Label-style heading over three stacked rows, each a Stamp tilted -2 degrees above its 13px meaning: Overdue "Due date has passed", Due soon "Due within 30 days", Up to date "Not due within 30 days". The key is printed because a stamp's colour can be lost in black and white.
- **Sections:** each is a headed `section`: a 16px / 24px, 700 heading on a 1px `rule-strong` baseline with a muted 14px count, followed by `divide-y` rows of 12px vertical padding that never split across a page. Order: Allergies & conditions, Current medications, Vaccinations, Due care, Last vet visit, Notes (only when the pet has notes), Full history (only when asked). Titles are 15px / 700 and detail lines 14px or 13px muted. Every date prints with its year (Oct 8, 2026). A severe allergy bolds its severity word; it is never red. Empty copy always says "No … recorded": "No allergies or conditions recorded.", "No current medications recorded.", "No vaccinations recorded.", "No vet visits recorded."; Due care reads "Nothing is overdue or due in the next 30 days." plus "Next up: {title} on {date}." when something is further out.
- **Vaccinations:** the latest record per vaccine, with date, clinic and lot. From `sm` (and in print) a table: Label-style column heads Vaccine / Given / Next due / Clinic / Lot / Status, 14px (13px in print), semibold vaccine names, "—" for a missing clinic, lot or due date, a ruled row each, and a Stamp in Status ("No due date" in 13px muted when the vaccine has none). Below `sm` the same data is a stacked list: title with its Stamp on one line, then 13px muted "Given {date} · Next due {date}" and "{clinic} · Lot {lot}".
- **Due care and last visit:** a due row is a 128px Stamp column and the title with its record type, over "Due {date}" ("Was due" when overdue). The last visit shows title and date over a Field grid of Clinic, Veterinarian and Weight, two columns, three from `sm`.
- **Full history:** shown with `?history=1`. It starts on a new printed page, groups records by year under Label-style year headings ("Date not recorded" last), and each row is a 104px date column and the title, type, summary, status line and notes, with no Edit or Delete actions.
- **Footer:** a ruled line with "{Pet} · Vet summary · As of {date}" on the left and "Novellia Pets" on the right, 12px Ink Muted.
- **Print rules:** `@page` margin 12mm; the page ground is white; the top bar (`header[data-top-bar]`), the inquiry panel and the toast are hidden, and the docked panel's right padding is removed; the toolbar is hidden. Rows and the card never break across pages. Meaning is carried by rules, words and the printed Stamp key, never by fills: the card and sheet are white with 1px rules, and Danger red stays out of it. The document title, "{Pet} vet summary · {date}", becomes the PDF's file name.
- **Entry points:** the pet header's Secondary "Vet summary" button and the inquiry panel's navigate action ("Opened {Pet}'s vet summary").

### Status vaccination rows

On the Status tab each vaccination row is its title (16px / 700) and "Given {date} · {clinic}" on the left, and on the right the due date, headed by Label-style "Due" or "Was due", or 14px muted "No due date". An overdue or due-soon vaccine also carries its Stamp above the date; an up-to-date vaccine carries none, so the stamps that appear are the ones that ask for action.

### Empty and first-run states

Dashed `rule-strong` border for "No pets match these filters" and "No records match these filters"; the records box carries a Clear filters link. On the dashboard, Clear filters (14px semibold Cover Navy, underlined, 44px hit area below `sm`) sits beside the status tabs whenever a search, species or status filter is active and pets match; with no matching pets it moves inside the dashed "No pets match these filters" box, under the copy "Try a different search, or clear the filters." A blank data page with a dashed photo placeholder and the three stamps shows when no pets exist. A pet with no records shows "No records yet for {name}" with one secondary button per record type. The all-clear row pairs an Up to date stamp (tilted -3 degrees) with a sentence stating the next due item. When nothing has a due date, the Next due panel is a white box reading "No due dates recorded yet." (16px / 600, Ink Muted), and a pet's header shows "No due dates on file" in place of its stamp. The inquiry panel's empty state is a list of suggested questions (see Inquiry panel).

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
- **Don't** add guilloche patterns or stamps used as ornament; a stamp must be a real status.
- **Don't** reach for a modal outside the dialog pattern: add and edit dialogs are route-backed (their URL also works as a full page), the only route-less dialog is a delete confirmation, and confirmation after an action is the toast. The inquiry panel is not a modal: it leaves the page usable, and its confirmations live in its transcript.
- **Don't** colour buttons, headings or backgrounds in the status inks, or use red and violet for anything but state; the one exception is red as Danger on destructive actions and form errors.
- **Don't** use gold as a fill or border on a data page.
- **Don't** show the inquiry panel unless chat is configured; when it is, it is one global panel opened from the top bar's Ask button, never a floating bubble, a dashboard card or a per-page widget.
- **Don't** box or bubble transcript messages; the pending confirmation is the only boxed object in the panel.
- **Don't** add resting drop shadows or heavy rounding to cards.
- **Don't** treat the hard-coded values in the build (`#d9ccff` on-cover due-soon stamp ink, `#f1dfae` text selection) as tokens for new work; they are carried in the build as one-offs.
