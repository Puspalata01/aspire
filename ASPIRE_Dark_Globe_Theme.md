# ASPIRE: Dark Globe Theme (UI Style Guide)

> Reference: "Departments" dashboard (dark, 3D globe in the centre, floating glass cards, slim icon rail).
> Goal: restyle every ASPIRE page in this look without changing data, wording, features or routes.
> Colours below are **estimated by eye** from the reference image. Use a colour picker on the original for exact values.

---

## 0. Ready-to-paste prompt

```
You are a senior UI designer and front-end engineer. I am attaching a reference
screenshot (dark dashboard with a 3D globe) and this style guide (ASPIRE_Dark_Globe_Theme.md).

Restyle ALL ASPIRE pages in this theme. Change ONLY visuals: colours, surfaces,
shadows, shapes, charts and layout of cards. Do NOT change data, numbers, wording,
features, routes or behaviour.

Rules:
1. Full-screen dark map/globe is the background of dashboard pages. All panels
   float over it as frosted-glass cards.
2. Use the tokens in section 2 exactly. Use the component recipes in section 5.
3. Use the page layouts in section 7. Same visual for the same kind of data everywhere.
4. Severity colours always come with a word or icon. Text contrast at least 4.5:1.
5. Stack: Next.js 16, React 19, TypeScript, Tailwind v4, shadcn/ui, Mapbox GL JS (globe).
Deliver: updated code, CSS variables, and a list of anything you could not match.
```

---

## 1. What the reference design is

| Part | What it looks like |
|---|---|
| **Overall feel** | Night-mode command centre. Near-black page, glowing blue accents, one hero visual (a 3D night Earth with city lights and a blue atmosphere glow). |
| **Layout** | Full-screen hero in the centre. Slim icon rail on the left. Cards float on the left, right and bottom. No page scroll. |
| **Surfaces** | Dark translucent glass cards (blurred background, 1px light border, soft black shadow). |
| **Accent** | One electric blue for active states and primary values. Green for positive/delivered. Orange for waiting/warning. Purple as a secondary chart colour. |
| **Data style** | Big numbers, tiny grey labels, small coloured delta chips (+10%), sparklines, rings, a 4-bar chart, and legend rows with coloured square icons. |
| **Map effects** | Glowing atmosphere around the globe, city-light dots, thin curved flow lines (arcs) around the planet, a white glowing marker with a ripple ring. |
| **Mood** | Premium, calm, high-contrast. Few words, lots of visuals. |

### Element-by-element breakdown

1. **Left icon rail** (about 64px wide): deep navy-purple strip. Icons only. Active item sits in a white round button; the others are grey outline icons. Logout and menu icons at the bottom.
2. **Top-left header**: a blue square back button, then the page title (large, white, semibold), with a small grey breadcrumb under it ("Map / Departments / Status").
3. **Top search**: dark outlined search field with a keyboard shortcut chip on the right.
4. **Top stat chips**: two small glass chips with a tiny arrow icon, label and value (Income / Expenses).
5. **Top-right**: a green "PREMIUM" pill, then avatar, name and a chevron.
6. **Second row, right**: a toggle group of small buttons. Moon (theme) and "3D" are filled blue when active; layer and grid icons are outlined.
7. **Left column**:
   - A small card: "Total 2.4k+", a "This week" dropdown and a green sparkline.
   - A legend list: coloured rounded-square icons (blue, green, orange) + label + big value.
   - A "Parcels" block with Monthly and Yearly numbers, a green delta (+10%, +12%) and a tiny grey comparison line.
8. **Bottom-centre card**: green status dot, "Parcels in the way", big "24 / 75", a small delta, and an info icon.
9. **Bottom-right rings**: two circular progress rings with a % in the middle and a tiny label (75% Delivered, 25% In process).
10. **Right column**:
    - "Total orders 2.4k+" with a green area line chart and a green % tag.
    - "Quantity" card with a four-bar chart (blue, green, purple, orange), % above each bar, and a legend list with durations.
11. **Globe**: dark Earth with warm city lights, blue rim light, thin arc lines orbiting, a glowing white dot with expanding rings as the selected point.

---

## 2. Design tokens

```css
/* app/globals.css  (Tailwind v4: put inside @theme or :root) */
:root {
  /* Surfaces */
  --bg-0:        #05070D;                 /* page / behind globe */
  --bg-1:        #0A0E17;                 /* large areas */
  --rail:        #1B1A33;                 /* left icon rail */
  --panel:       rgba(16, 22, 36, 0.72);  /* glass card */
  --panel-solid: #101624;                 /* fallback when blur is not supported */
  --panel-2:     #161D2E;                 /* inner rows, inputs */
  --border:      rgba(255, 255, 255, 0.08);
  --border-hi:   rgba(255, 255, 255, 0.14);

  /* Text */
  --text:   #F5F7FB;
  --text-2: #9AA3B8;
  --text-3: #6B7488;   /* captions, 14px+ only */

  /* Accent */
  --blue:      #3B6CFF;
  --blue-soft: rgba(59, 108, 255, 0.18);
  --blue-glow: rgba(59, 108, 255, 0.40);
  --atmos:     #4FB3FF;   /* globe rim light */
  --purple:    #6C63FF;

  /* Severity (dark-mode tuned). Always show with a word or icon. */
  --low:      #2FD07F;   /* green  */
  --medium:   #F5C542;   /* yellow */
  --high:     #FF8A3D;   /* orange */
  --critical: #FF4D5E;   /* red    */

  /* Shape */
  --r-card: 18px;  --r-row: 12px;  --r-btn: 12px;  --r-pill: 999px;

  /* Effects */
  --blur:        blur(18px) saturate(140%);
  --shadow-card: 0 8px 32px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);
  --glow-active: 0 0 0 1px var(--blue), 0 0 24px var(--blue-glow);
}
```

### Hazard colours (from the ASPIRE feature doc, kept)
Flood `#3B82F6` · Cyclone `#8B5CF6` · Heatwave `#F59E0B` · Landslide `#A16207` · Earthquake `#DC2626`

### Typography
| Use | Font | Size / weight |
|---|---|---|
| Page title | Inter | 28-32px / 600 |
| Card title | Inter | 14-16px / 600 |
| Label / breadcrumb | Inter | 11-12px / 500, `--text-2` |
| Big numbers | JetBrains Mono (tabular) | 28-40px / 600-700 |
| Delta chips | Inter | 11px / 600 |
| Map labels | Inter | 11-12px / 500, white with dark halo |

### Spacing
8px scale (4, 8, 12, 16, 24, 32). Card padding 16-20px. Gap between floating cards 16px.

---

## 3. Tools and libraries

| Need | Tool | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | As in the feature doc |
| Styling | Tailwind CSS v4 + shadcn/ui | Tokens in `@theme`; shadcn components restyled with the tokens above |
| **3D globe** | **Mapbox GL JS v3, `projection: 'globe'`** | One map engine for the landing globe AND the flat/3D operations map. `setFog()` makes the atmosphere glow. |
| Flow arcs | deck.gl `ArcLayer` / `TripsLayer` on Mapbox (`@deck.gl/mapbox`) | Curved lines for resource routes, evacuation flows |
| Alternative globe | `react-globe.gl` or three.js | Only if you want a landing hero without map tiles |
| Charts | Recharts (sparklines, area, bars) + hand-made SVG rings | Rings are 15 lines of SVG, no library needed |
| Icons | Lucide | 18-20px, 1.75 stroke |
| Animation | Framer Motion | Card fade/slide in, number count-up, marker pulse |
| State / data | Zustand, TanStack Query, Socket.io client | As in the feature doc |
| Geo maths | Turf.js | Clusters, buffers |
| Fonts | Inter + JetBrains Mono via `next/font` | |

---

## 4. The globe / map layer

### Mapbox globe setup
```ts
const map = new mapboxgl.Map({
  container, style: 'mapbox://styles/mapbox/dark-v11',
  projection: 'globe', center: [85.83, 19.81], zoom: 1.6,
  attributionControl: false,
});
map.on('style.load', () => {
  map.setFog({
    color: 'rgb(10, 18, 40)',          // lower atmosphere
    'high-color': 'rgb(36, 92, 223)',   // upper glow (blue rim)
    'horizon-blend': 0.06,
    'space-color': 'rgb(5, 7, 13)',    // = --bg-0
    'star-intensity': 0.35,
  });
});
// Landing: slow auto-rotate. Dashboard: flyTo Puri (zoom 8-9.5), then switch to flat 2D/3D toggle.
```

### Effects to copy from the reference
| Effect | How |
|---|---|
| Blue atmosphere rim | `setFog` as above (+ optional CSS radial-gradient behind the canvas) |
| City lights | Night/dark style, or a small custom dot layer in warm yellow `#FFD27A` at low opacity |
| Orbit / flow lines | deck.gl `ArcLayer`, 1.5px, colour `rgba(79,179,255,.5)`, curved |
| Selected point | White 10px dot + two expanding rings (CSS keyframes below) |
| Hazard zones | Fill layers with hazard colour at 15-25% opacity plus a dashed outline |

```css
.pulse::before,.pulse::after{content:"";position:absolute;inset:0;border-radius:50%;
  border:1.5px solid rgba(255,255,255,.7);animation:ping 2.4s ease-out infinite}
.pulse::after{animation-delay:1.2s}
@keyframes ping{from{transform:scale(1);opacity:.8}to{transform:scale(3.2);opacity:0}}
@media (prefers-reduced-motion:reduce){.pulse::before,.pulse::after{animation:none}}
```

---

## 5. Component recipes

### 5.1 Glass card
```html
<section class="rounded-[18px] border border-white/10 bg-[rgba(16,22,36,.72)] p-4
                backdrop-blur-[18px] backdrop-saturate-[1.4]
                shadow-[0_8px_32px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.04)]"> … </section>
```
Never nest a glass card inside a glass card. Inside use rows with `bg-[#161D2E]` (`--panel-2`) and 12px radius.

### 5.2 Left icon rail
- 64px wide, `--rail` background, 12px vertical gap, icons 20px.
- Active item: white 40px circle with dark icon. Inactive: transparent, `--text-2`, hover = `--panel-2`.
- Bottom: logout + menu icons. Tooltip with the page name on hover. Keyboard focusable.

### 5.3 Top bar (no scroll, transparent over the map)
`[blue back button] [Title + breadcrumb] ... [search with ⌘K] [stat chips] ... [status pill] [avatar + name]`
- Keep all ASPIRE top-bar content (district selector, incident, time, SOS pending, teams deployed, live sync, bell, profile). Only restyle it.
- Status pill: green "LIVE", tinted background `rgba(47,208,127,.15)`, green text.

### 5.4 Buttons
| Type | Look |
|---|---|
| Primary | `--blue` fill, white text, glow on hover |
| Secondary | `--panel-2` fill, `--border`, white text |
| Icon toggle | 36px square, 10px radius. Active = blue fill + glow; inactive = outline |
| Danger | `--critical` fill, only for siren / irreversible actions, with a confirm dialog |

### 5.5 Stat block (big number)
Label (12px grey) → value (JetBrains Mono 32px white) → delta chip (green/orange/red tint, 11px) → comparison line (11px grey).

### 5.6 Legend row (coloured square icon)
36px rounded-square icon tile in a colour (blue / green / orange), then label (12px grey) above value (18px bold). Use for status categories.

### 5.7 Ring gauge (SVG)
```tsx
function Ring({ value, color }: { value: number; color: string }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 72 72" width="72" height="72" role="img" aria-label={`${value}%`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="6"/>
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${(value/100)*c} ${c}`} transform="rotate(-90 36 36)"/>
      <text x="36" y="40" textAnchor="middle" fill="#F5F7FB" fontSize="15" fontWeight="700">{value}%</text>
    </svg>);
}
```

### 5.8 Charts
| Chart | Recipe |
|---|---|
| Sparkline / area | Recharts `AreaChart`, 2px stroke green/blue, gradient fill to transparent, no axes |
| 4-bar chart | Rounded 6px bars, % label above each bar, colours blue / green / purple / orange |
| Progress | 8px track `rgba(255,255,255,.08)`, filled bar in severity colour |
| Heat grid | 14px rounded squares in 3-4 blue tints (for density) |

### 5.9 Floating status card (bottom-centre)
Green dot + label, big "value / total", small delta, info icon. Used for the single most important live number.

### 5.10 Inputs, toggles, toasts
Input: `--panel-2`, 1px `--border`, 12px radius, focus = `--glow-active`. Toast: glass card with a coloured left icon, not a left border. Critical toast adds a soft red glow.

---

## 6. Layout system (dashboard pages)

```
┌────┬──────────────────────────────────────────────────────────────┐
│    │ [←] Title / breadcrumb        [search]   [chips]   [pill][me]│  72px
│ R  ├──────────────────────────────────────────────────────────────┤
│ A  │  LEFT 280px        FULL-SCREEN GLOBE / MAP       RIGHT 300px │
│ I  │  glass cards                                      glass cards│
│ L  │                 [floating status card]     [ring][ring]      │
│    │                                                              │
└────┴──────────────────────────────────────────────────────────────┘
```
- Map canvas = `position:absolute; inset:0; z-index:0`. UI overlay = `z-index:10; pointer-events:none`; cards = `pointer-events:auto`.
- Dashboard fits one screen (`h-dvh`); long lists scroll inside their own card (one scroll area per card).
- Breakpoints: `xl` desktop as above. `lg` right column becomes a drawer. `md` map on top 45vh, cards in 2 columns. `<md` one column; citizen portal uses a bottom nav.

---

## 7. Page-by-page application

### Public
| Page | Layout in this theme |
|---|---|
| `/` Landing | Full-screen rotating globe, giant "From Warning to Action." text over it with a blue glow, two buttons (Authority Login, Citizen Portal). Below: problem cards, feature cards (glass), tech badges. |
| `/login`, `/register` | Globe blurred in the background, one centred glass card. Role toggle as a two-button toggle group. Demo-account chips below. |

### Authority (`/authority/...`)
| Page | Hero | Left column | Right column / bottom |
|---|---|---|---|
| `dashboard` (Command Center) | Globe/map zoomed on the district | Total affected + sparkline, legend (Evacuated / Remaining), SOS / teams numbers | People-affected area chart, resource bar chart (Quantity style), alert list; floating card for Active SOS; rings for Shelter 78.4% and ICU 84.1%; Quick Actions as icon toggles |
| `map` | Full-screen map | Layer panel (glass, toggles) | Location Inspector (glass drawer); timeline slider bottom-centre; legend chips |
| `risk` | Matrix as the hero (glass, coloured cells) | Filters, region compare | Trend charts, factor radar, model performance rings |
| `impact` | Impact map | Summary stat blocks | Exposure bars, 24/48/72 h forecast area chart |
| `resources` | Map with resource + demand markers and arcs | Inventory legend rows | AI recommendations (accept/reject), deployment table |
| `shelters` | Map coloured by occupancy | Shelter list with capacity bars | Overflow prediction chart, rings |
| `hospitals` | Map coloured by status | Hospital list, beds/ICU bars | Isolation-risk list, ambulance ETAs |
| `sos` | Clustered SOS map | Live SOS feed (compact rows) | Hotspot priority list, detail drawer, status flow |
| `simulation` | Before/after map toggle | Sliders in a glass card | Baseline vs simulated table, LLM narrative |
| `cascade` | Dark canvas with glowing node chain (blue lines, probability bars) | Chain selector | Step inspector |
| `analytics` | Charts grid on the dark background (no globe) | Filters | Timeline, comparisons, exports |
| `evacuation` | Zone map with arc routes | Zone list, population | Route compare, corridor toggles |
| `settings` | Plain dark page, grouped glass cards | | |

### Citizen (`/citizen/...`, mobile first)
| Page | Layout |
|---|---|
| `home` | Small globe/map strip at top, personal risk card with a ring, 4 big quick-action tiles (Shelter, Routes, SOS, Report), alerts list, bottom nav |
| `map` | Full-screen simplified map, one bottom sheet |
| `shelters` | Cards with capacity bar and amenities icons, Navigate button |
| `sos` | Big form steps in glass cards, red Send SOS button, tracking card after submit |
| `safe-routes`, `reports`, `alerts`, `guidance` | Same glass cards, large text, icon + colour + word per item |

---

## 8. Mapping reference cards to ASPIRE data (no new numbers)

| Reference card | ASPIRE card |
|---|---|
| Total 2.4k+ (sparkline) | Affected population 2,84,500 (+12.4%) |
| On the way / Delivered / Waiting | Remaining / Evacuated safely / In shelter |
| Parcels monthly/yearly | Evacuated 1,37,000 (+8,200/hr) and Affected total |
| Parcels in the way 24/75 | Active SOS tickets (14) with 5 critical |
| 75% / 25% rings | Shelter occupancy 78.4% and ICU surge 84.1% |
| Total orders (area chart) | Risk or affected trend over time |
| Quantity (4 bars) | Resource utilisation by type (boats 56%, ambulances 70%, helis 60%, tankers 88%, medical 90%) |
| Selected glowing marker | Storm eye / selected zone |

---

## 9. Accessibility and performance

- Contrast: body text `--text` on glass is above 4.5:1. `--text-3` only for 14px+ captions.
- Severity is never colour alone: always an icon or word ("CRITICAL").
- Glass needs a solid fallback (`--panel-solid`) for browsers or devices without `backdrop-filter`.
- Respect `prefers-reduced-motion` (stop rotation, pulses, count-ups).
- Globe/map has a "Data table" view for screen readers.
- Keyboard: rail, toggles, cards and map controls are focusable, with a visible blue focus ring.
- Performance: lazy-load Mapbox/deck.gl, one map instance shared across pages, limit blur to cards over the map, cap arcs at about 200, `will-change: transform` on animated cards only.

---

## 10. Build order

1. Add tokens to `globals.css` and the Tailwind theme; load Inter + JetBrains Mono.
2. Build `GlassCard`, `IconRail`, `TopBar`, `StatBlock`, `LegendRow`, `Ring`, `BarChart`, `Sparkline`, `ToggleGroup`, `StatusPill`, `FloatingCard`.
3. Build `MapShell` (Mapbox globe + fog + deck.gl arcs + pulse marker) as a persistent layout so it does not reload between pages.
4. Compose the Command Center from section 7, then Map, SOS and Resources.
5. Restyle shadcn components (Button, Input, Select, Sheet, Dialog, Tabs, Switch, Toast) with the tokens.
6. Apply to the remaining authority pages, then the citizen portal (mobile first), then landing and auth.
7. QA: contrast, keyboard, reduced motion, 1280 / 1440 / 1920 widths, tablet and phone.

## 11. Do and don't

| Do | Don't |
|---|---|
| One hero (globe/map) per page | Put two large visuals on one page |
| Floating glass cards with 16px gaps | Stack cards inside cards |
| Big number + tiny label + one delta | Long paragraphs on the surface |
| Blue as the only accent; severity colours only for danger | Use red/orange/green decoratively |
| Keep all original data and wording | Change numbers or text to fit the style |
