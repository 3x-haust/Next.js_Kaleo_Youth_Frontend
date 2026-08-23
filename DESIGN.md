# KALEO YOUTH Design Contract

## 1. Source of truth

- Visual contract: logged-in Figma file `cZAPpH8yhcV5PA2KtAfwJ2`.
- Primary desktop canvas: 1920px wide.
- Home frame: node `63:6`, 1920 × 5885.
- Shared listing/detail frames use the same header, dark field, blue accent, and footer.
- Responsive layouts preserve hierarchy and interaction intent; no separate narrow Figma frame was found.

## 2. Brand character

KALEO YOUTH is energetic, direct, and communal. The visual system combines an almost-black
navy field, stark white editorial type, electric blue wayfinding, documentary photography,
and broad gradients that read as stage light rather than decoration.

## 3. Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ky-ground` | `#08081e` | Primary page field |
| `--ky-ground-deep` | `#02030e` | Deep section and media field |
| `--ky-ink` | `#f7f9fc` | Primary text and marks |
| `--ky-copy` | `#f0f0ee` | Body copy |
| `--ky-muted` | `#627497` | Secondary text |
| `--ky-blue` | `#1677ff` | Labels, rules, active states |
| `--ky-blue-soft` | `#52a0ff` | Gradient light and focus |
| `--ky-nav-surface` | `transparent` | Colorless scrolled glass capsule driven by backdrop blur |
| `--ky-line` | `rgba(247, 249, 252, 0.14)` | Hairlines |

The signature field is `--ky-gradient-stage`: a restrained radial blue light over the dark
ground. It may anchor a section edge or focal point, never cover every container.

## 4. Typography

- Primary family: `Paperlogy`, matching the Figma source across editorial statements,
  navigation, body, metadata, controls, and the administrator surface.
- Weight remains 400 throughout; hierarchy comes from scale, width, color, and placement.
- Display: fluid 36–89px, tight line height, Korean phrases kept intact.
- Body: fluid 17–19px with 1.7 line height.
- Meta: fluid 13–14px, often uppercase English in blue.

## 5. Layout and spacing

- Desktop gutter: 64–100px according to frame role.
- Tablet gutter: 40px.
- Mobile gutter: 16px.
- Spacing ladder: 8 / 16 / 24 / 40 / 64 / 96px.
- Desktop content is intentionally broad; cards are not nested inside decorative cards.
- Images retain documentary crops and use thin neutral borders where the Figma frame does.

## 6. Shared primitives

### Header

- Every public route at scroll origin: no fill, gradient, border, shadow, or backdrop blur; full-width with the white original logo.
- After scrolling: centered colorless clear-glass capsule with 16px backdrop blur and text shadows for readability.
- The original logo turns electric blue inside the capsule.
- Desktop navigation: 소개 / 말씀 / J-Teen / 일정 / 갤러리.
- Mobile: fixed 72px bar with a real menu button and full-width navigation sheet.

### Admin shell

- The administrator surface uses the existing light Paperlogy form primitives and a fixed-sidenav shell; the sidebar stays stable while the main document region owns vertical scrolling.
- Source pattern: StyleGallery `fixed-sidenav-shell` (`patterns/viewport-shell/fixed-sidenav-shell.md`); semantic navigation remains before main content in DOM order.
- Admin forms compose `AdminPage`, `PageTitle`, `Panel`, `Form`, `Field`, `FieldRow`, `Label`, `Input`, `Textarea`, `Actions`, and shared buttons. New editors do not introduce local color, spacing, radius, or typography values.

### FileUploader

- Image-only upload fields show a documentary thumbnail, filename, size, and an explicit remove action for both persisted and newly uploaded media.
- Every raster image upload is normalized to compressed WebP before attachment metadata is persisted; PDFs retain their source format.
- Single-image fields replace the previous preview when a new upload completes; removal restores an empty upload state without leaving a manual URL control.
- The native file input remains programmatically labelled and keyboard-reachable through the visible 44px-minimum action button. Upload, error, and removal states use existing admin status primitives.

### Gallery media

- Gallery detail renders at most four source-ordered thumbnails at once.
- Previous and next controls move selection through a finite window, reveal the adjacent source image when selection crosses a window edge, and remain disabled at the first and last source images.
- Main-image and lightbox selection never reorder, remove, duplicate, or loop source photos.

### Footer

- The shared Footer is present on every public route at every viewport.
- Black/deep field separated from content by the page rhythm, not by a card.
- Original logo, worship details, address, contact links, legal links.
- Footer identity copy uses full-strength `#f7f9fc`; contact and legal copy uses full-strength
  `#ebebeb`. Do not reduce either group with container opacity or transforms.
- The identity accent is the Figma `102:1212` rule at exactly 25 × 1px in `#1677ff`.
- The contact divider is the Figma `102:1224` rule at exactly 300 × 1px in `#f7f9fc`.
- The address is exactly two lines: department on the first line and the complete street plus
  postal code on the second line.
- Desktop uses two opposing columns.
- Mobile places a two-column site navigation before contact details, then stacks all identity
  and legal information without horizontal overflow.

## 7. Motion

- Header state change: 240–320ms ease-out; opacity, color, blur, and transform communicate
  elevation and state.
- Major public sections and repeated cards use a restrained 70ms stagger with opacity,
  translate, and subtle scale to reveal hierarchy.
- Gallery media changes use opacity only so authored image geometry remains stable.
- Reduced-motion preference removes non-essential transitions.
- Decorative perpetual motion and no-op hover animation are forbidden.

## 8. Responsive and accessibility constraints

- Breakpoints: 1024px for navigation mode, 640px for mobile spacing and footer stacking.
- Korean copy uses `word-break: keep-all` and must not leave particles or short predicates
  orphaned.
- Interactive targets are at least 44px.
- Focus rings remain visible on dark and light fields.
- Header menu exposes `aria-expanded`, `aria-controls`, and closes after route selection.
- Public editorial surfaces disable text selection and image dragging; form fields and
  editable controls explicitly retain text selection.
- Uploaded image previews include meaningful filenames, explicit dimensions, and a keyboard-operable removal control; decorative public imagery keeps empty alternative text only where adjacent authored copy supplies the meaning.
- Gallery thumbnail rails preserve every source image in source order. Selection changes
  only the main image and `aria-current`.
- Public uploaded images use responsive Next image candidates; below-fold media remains lazy.
- YouTube embeds remain facade-based and load only after intent. Reduced-motion visitors do
  not request the home background video.

## 9. Accepted design debt

- The Figma source contains desktop-width frames but no dedicated narrow viewport contract.
  Mobile behavior therefore extrapolates the same hierarchy and tokens rather than claiming
  pixel-identical mobile fidelity.
- The white transparent logo export is recolored with a CSS filter in the scrolled capsule;
  no separate blue export exists in the source asset set.
