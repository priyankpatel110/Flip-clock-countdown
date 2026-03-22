# PRD: FlipCount — 100-Hour Flip Clock Countdown Timer

**Version:** 1.0
**Stack:** Pure HTML + CSS + Vanilla JS (single `index.html` file)
**Goal:** A standalone, no-dependency countdown timer that supports up to 999 hours, styled as a classic dark split-flap (airport departures board) flip clock.

---

## Core Concept

A full-screen countdown timer that displays `HH:MM:SS` using animated flip clock cards. Users can set any number of hours (up to 999), start a countdown, pause/resume it, and get an alarm when it hits zero. A progress bar at the bottom tracks completion percentage.

---

## Phase 1 — Project Scaffold & Layout

**Goal:** Get the HTML structure and full-screen dark layout in place with no functionality yet.

### Tasks

1. Create a single `index.html` file with embedded `<style>` and `<script>` tags — no external files.
2. Set `body` background to near-black (`#0d0d0d`), full viewport height, flex-centered.
3. Add a page title area at the top: text `FlipCount` in a muted monospace font.
4. Create the flip clock container with six flip card slots grouped as `HH : MM : SS`.
5. Add label text below each group: `HOURS`, `MINUTES`, `SECONDS` in small uppercase muted text.
6. Add a bottom section with a thin full-width progress bar (empty for now).
7. Add a control area below the progress bar with three buttons: `START`, `PAUSE`, `RESET` — all unstyled placeholders for now.
8. Add a setup panel (visible by default, hidden when timer is running) with:
   - A number input field labeled `Set Hours` (accepts 1–999)
   - A horizontal scroll/spin wheel (styled `<input type="range">` or custom wheel component) for quick selection of common values: 1, 5, 10, 25, 50, 75, 100
   - Both inputs must stay in sync (changing one updates the other)

### Acceptance Criteria

- Page renders without errors
- Layout is centered and looks correct on desktop (1280px+) and tablet (768px+)
- No JS logic yet — just structure and CSS

---

## Phase 2 — Flip Card Styling & Animation

**Goal:** Make each digit look and animate exactly like a split-flap airport board tile.

### Tasks

1. Each flip card is a fixed-size tile (~120px × 160px on desktop, responsive on mobile).
2. Tile background: dark charcoal (`#1a1a1a`), rounded corners (`8px`), subtle inner shadow.
3. Digit font: bold, large (~90px), white; use `'Oswald'` or `'Roboto Condensed'` loaded from Google Fonts — or fall back to system monospace if no internet.
4. A thin horizontal divider line splits the tile in half (top half shows current digit, bottom half shows same digit — this is the base state).
5. Implement the CSS flip animation using `@keyframes` + `perspective` + `rotateX`:
   - Top half flips down: the "outgoing" number rotates from `0deg` to `-90deg` on the Y-midpoint
   - Bottom half flips up: the "incoming" number rotates from `+90deg` to `0deg`
   - Total animation duration: `300ms`, easing: `ease-in` for top, `ease-out` for bottom
   - Both halves use `backface-visibility: hidden`
6. The colon separators between groups should be two small circular dots, vertically centered, colored `#ff6b35` (orange accent).
7. Tile hover state: very subtle glow (`box-shadow`) — adds depth, not distracting.

### Acceptance Criteria

- Manually triggering a digit change (via browser console) shows a smooth flip animation
- Animation looks like a real split-flap board, not a generic CSS transition
- No layout shift during animation

---

## Phase 3 — Timer Logic

**Goal:** Implement the full countdown engine in vanilla JS.

### Tasks

1. Store timer state in a plain JS object: `{ totalSeconds, remainingSeconds, isRunning, isPaused }`.
2. `START` button behavior:
   - Read the hours value from the setup panel input
   - Convert to total seconds: `hours × 3600`
   - Hide the setup panel, show the running UI
   - Begin the countdown using `setInterval` at 1000ms intervals
3. Each tick:
   - Decrement `remainingSeconds` by 1
   - Decompose into `HH`, `MM`, `SS`
   - Compare each digit individually against the currently displayed digit per card
   - Only trigger the flip animation on cards whose digit has changed (do not re-animate static digits)
4. `PAUSE` button: clears the interval, sets `isPaused = true`, changes button label to `RESUME`.
5. `RESUME` button: restarts the interval from the current `remainingSeconds`.
6. `RESET` button: clears interval, resets all state, shows setup panel again, resets all flip cards to `0`.
7. When `remainingSeconds` reaches `0`: stop the interval, trigger the alarm (Phase 4), update UI to show "TIME'S UP" state.
8. Update the progress bar fill width each tick: `((totalSeconds − remainingSeconds) / totalSeconds) × 100%`.
9. Progress bar fill color: start as `#ff6b35` (orange), transition to `#ff3535` (red) in the last 10% of time remaining.

### Acceptance Criteria

- Timer counts down accurately (test with 1-minute input)
- Only changed digits animate — static digits never flicker
- Pause/Resume works without time drift
- Progress bar updates smoothly every second
- Reset fully clears all state

---

## Phase 4 — Alarm & Completion State

**Goal:** Notify the user when the countdown hits zero.

### Tasks

1. Generate the alarm sound using the **Web Audio API** (no external audio files):
   - Create an `AudioContext`
   - Play a sequence of 3 beeps: `880Hz → 660Hz → 880Hz`, each `300ms` long with a short gap
   - Use a sine wave oscillator with a gain envelope (fade in/out per beep) so it doesn't clip
   - Wrap in a function `playAlarm()` called when timer hits zero
2. Display a full-screen overlay when timer completes:
   - Semi-transparent dark background (`rgba(0,0,0,0.85)`)
   - Large text: `🎉 CHALLENGE COMPLETE` in white
   - Subtext: `You did it. [X] hours of focused work.`
   - A `START NEW` button that dismisses the overlay and resets to setup
3. All six flip cards should display `00:00:00` when the overlay appears.
4. The progress bar should be fully filled (`100%`) and turn solid green (`#4caf50`).

### Acceptance Criteria

- Alarm plays automatically at zero without user interaction (note: browser autoplay policy requires the user to have interacted with the page first — which they will have, via the START button)
- Overlay is dismissible
- No audio errors in the browser console

---

## Phase 5 — Setup Panel UX & Input Sync

**Goal:** Make the hour-selection experience smooth and foolproof.

### Tasks

1. Number input (`<input type="number">`):
   - Min: `1`, Max: `999`, default value: `100`
   - Styled to match the dark theme — no default browser chrome
   - Shows the current value in large text
2. Scroll wheel / quick-pick component:
   - A horizontal row of preset chips: `1h`, `5h`, `10h`, `25h`, `50h`, `75h`, `100h`, `200h`
   - Clicking a chip sets the number input to that value and highlights the chip
   - Active chip uses orange accent color (`#ff6b35`)
3. Two-way sync: typing in the number input deselects any active chip if the value doesn't match a preset; selecting a chip updates the number input.
4. Add a small motivational tagline below the input that changes based on selected hours:
   - `< 10h` → `"A solid sprint."`
   - `10–49h` → `"A serious commitment."`
   - `50–99h` → `"Elite-level grind."`
   - `100+h` → `"Legendary. Let's go. 🔥"`
5. The `START` button is disabled and grayed out if the input is empty or invalid.

### Acceptance Criteria

- Chip and input always stay in sync
- Motivational text updates reactively on input change
- Invalid states are clearly communicated

---

## Phase 6 — Polish, Responsiveness & Final Details

**Goal:** Make it feel like a real product, not a prototype.

### Tasks

1. **Responsive layout:**
   - Desktop (>= 1024px): Large tiles (~120×160px), font ~90px
   - Tablet (768–1023px): Medium tiles (~90×120px), font ~65px
   - Mobile (< 768px): Small tiles (~60×80px), font ~42px, stack controls vertically
2. **Page title area:** `FlipCount` wordmark top-left. Optionally add a small `⏱` favicon using an inline SVG data URI in `<link rel="icon">`.
3. **Keyboard shortcuts:**
   - `Space` → Start / Pause / Resume
   - `R` → Reset (only when paused or stopped)
4. **Smooth transitions** on setup panel hide/show (fade + slide down).
5. **Tab title** updates dynamically while running: shows current time remaining e.g. `[98:42:17] FlipCount`.
6. **Anti-sleep hint:** Add a small invisible `<video>` autoplay loop hack OR use the `Wake Lock API` (`navigator.wakeLock.request('screen')`) to prevent screen sleep while timer is running. Fail silently if not supported.
7. Add a subtle scanline texture overlay on the flip tiles (a repeating CSS `linear-gradient` pattern) to enhance the retro CRT feel.
8. Final code cleanup: remove all `console.log` statements, ensure no unused variables.

### Acceptance Criteria

- Works on Chrome, Firefox, Safari (latest)
- Mobile layout is usable
- Keyboard shortcuts work
- Tab title updates while running
- No console errors or warnings

---

## Out of Scope (v1)

- User accounts or saved sessions
- Multiple simultaneous timers
- Custom themes or color pickers
- Backend / server of any kind
- PWA / offline mode
- Sharing or exporting timer state

---

## File Deliverable

A single `index.html` file. Open in any browser, no server needed.
