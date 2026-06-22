---
name: figma-use
description: Local, non-official guidance for writing Figma Plugin API scripts to pass to the use_figma MCP tool. Use before any use_figma call.
---

# figma-use (local substitute skill)

> **Provenance note**: this skill was authored locally from general Figma
> Plugin API knowledge because the official `figma-use` skill / MCP
> resource (`skill://figma/figma-use/SKILL.md`) is not available in this
> environment. It is **not** Anthropic/Figma's official guidance. Treat
> it as best-effort; verify against `get_design_context` /
> `get_metadata` results as you go, and prefer simpler, smaller scripts
> over large speculative ones.

## What `use_figma` actually does

It runs arbitrary JS through the Figma Plugin API (`figma.*`) inside the
target file (`fileKey`). There is no DOM, no React, no CSS — it's an
imperative scene-graph API. Every node you create or mutate is a plugin
node object; changes are applied directly to the file in real time.

## Core rules that prevent the common failure modes

1. **Always work inside a transaction-like flow**: create root containers
   first (e.g. a page or top-level frame), append children to them
   immediately after creation — an unattached node is invisible and easy
   to lose track of. Keep a reference to every node you create if you'll
   need to reposition/resize it later.

2. **Auto-layout via `layoutMode`, not manual x/y**: set
   `frame.layoutMode = "VERTICAL" | "HORIZONTAL"` before setting sizing
   modes. For "fill container" behavior set
   `child.layoutGrow = 1` (along the auto-layout axis) — there is no
   separate "fill" enum on the child for the primary axis. For "hug
   contents" leave `primaryAxisSizingMode = "AUTO"` on the frame; for
   "fixed" size set it to `"FIXED"` and give explicit `resize()` width.
   Setting `layoutAlign = "STRETCH"` makes a child fill the
   counter-axis. Always set `layoutMode` BEFORE touching
   `paddingLeft/Right/Top/Bottom` and `itemSpacing` — those properties
   only take effect once a frame is an auto-layout frame.

3. **Fonts must be loaded before assignment**: call
   `await figma.loadFontAsync({ family, style })` for every distinct
   family+style pair you intend to use, before setting
   `textNode.fontName = { family, style }` or writing `characters`. Font
   style names are human strings like `"Regular"`, `"Medium"`,
   `"Semi Bold"`, `"Bold"` (with a space, not `"SemiBold"`) — mismatched
   strings silently fail to load and the assignment throws. If unsure of
   available styles for a family, don't guess; fall back to `"Regular"`
   and `"Bold"` which are near-universal.

4. **Colors are 0–1 floats, not 0–255 or hex**: `{ r, g, b }` each in
   `[0, 1]`. Convert from a hex string by dividing each channel by 255.
   Fills/strokes are arrays:
   `node.fills = [{ type: "SOLID", color: { r, g, b }, opacity }]`.
   Mutating `node.fills[0].color` directly does nothing — Figma node
   properties that hold arrays/objects must be reassigned as a new
   array/object (`node.fills = [...]`), not mutated in place.

5. **Variables vs. styles**: prefer Figma Variables
   (`figma.variables.createVariableCollection`,
   `createVariable`, then bind via
   `node.setBoundVariable(field, variable)` or
   `figma.variables.setBoundVariableForPaint`) for tokens that need to
   stay synced (color, spacing, radius) over legacy Paint/Text styles —
   variables are the current recommended primitive for a design-token
   page. Name collections/variables with the same naming scheme you'll
   reuse in code (e.g. `color/brand/primary`, `spacing/md`) so the later
   manual transcription into `src/theme/*` is a 1:1 lookup.

6. **Component creation order**: build and style a normal frame fully
   first, then call `figma.createComponentFromNode(frame)` — trying to
   set component-specific properties before the node is finalized as a
   frame leads to inconsistent results. For variants, create each state
   as its own component first, then `figma.combineAsVariants([...], parent)`.

7. **Don't over-script in one call**: one `use_figma` call that tries to
   build an entire multi-screen mockup in one giant script is harder to
   debug when something silently fails partway (the API doesn't always
   throw — a bad property assignment can just no-op). Prefer smaller
   sequential calls: (a) create page/frame skeleton, verify via
   `get_screenshot`/`get_metadata`, (b) add tokens/variables, verify,
   (c) populate content, verify, (d) polish/align.

8. **Positioning**: outside of auto-layout, `x`/`y` are relative to the
   parent frame's top-left, not absolute canvas coordinates. When
   placing sibling frames (e.g. separate screen mockups side by side on
   a page), add explicit spacing (e.g. 100px gaps) so screenshots/exports
   don't visually overlap.

9. **Always `await` async Plugin API calls**: `loadFontAsync`,
   `importComponentByKeyAsync`, `getNodeByIdAsync`, image-related calls,
   and most "ByKey"/"ById" lookups are async in current API versions —
   forgetting `await` produces a Promise object assigned where a node
   was expected, which fails far away from the real cause.

10. **Cleanup/idempotency**: if a script may be re-run (e.g. retrying
    after a partial failure), guard creation with a name-based lookup
    (`figma.currentPage.findOne(n => n.name === "...")`) rather than
    blindly creating duplicates on every retry.

## Recommended call sequence for this project's Fase 0

1. `whoami` → get `planKey`.
2. `create_new_file` (or reuse an existing file if the user already has
   one) → get `fileKey`.
3. `use_figma`: create a "Tokens" page, set up Variables collections for
   color (including the 5 tones + gradients), spacing, radius, and a
   typography styles set (Playfair Display for display/headings, Inter
   for body — load both font families' needed weights first).
4. Verify via `get_screenshot`.
5. `use_figma`: create 3 screen frames (Dashboard, Analítica,
   Piso/Explorador) side by side on a "Screens" page, using the
   variables/styles from step 3 — not hardcoded values — so they visibly
   inherit the token system.
6. Verify via `get_screenshot` / `get_design_context`, iterate.
7. Stop and present to the user for approval before any implementation
   code is written.
