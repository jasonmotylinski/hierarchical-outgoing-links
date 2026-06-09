# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin that displays outgoing links from the active note as a hierarchical tree based on folder structure, rather than a flat list like the core Obsidian plugin.

## Build Commands

- `npm install` - Install dependencies
- `npm run dev` - Development build with watch mode (outputs to main.js)
- `npm run build` - Production build with TypeScript type checking
- `npm test` - Run the Vitest unit tests

## Testing

### Unit tests (Vitest)

- Tests live in `test/`. Run with `npm test`.
- The `obsidian` package ships **types only** (no runtime JS), so `vitest.config.ts` aliases `obsidian` to `test/obsidian-stub.ts`, which exports the handful of runtime symbols the code imports (`getIcon`, `MarkdownView`, `Notice`, …). Add to the stub when you import a new `obsidian` value in code under test.
- Keep DOM- and Obsidian-coupled logic thin, and extract the testable parts into plain functions. `src/linkLocation.ts` is the model: it uses `import type` for Obsidian types where possible and takes `app`/`view` as parameters so tests can pass mocks. Tests then assert behavior against a fake `metadataCache`/`workspace` instead of a live app.
- DOM wiring (e.g. `TreeNodeView` click handlers) is tested under `// @vitest-environment jsdom`, polyfilling the `createDiv`/`createEl` helpers Obsidian adds to `HTMLElement`.

### Manual interactive testing in the vault

Most bugs here are about *interaction* (what fires on click, in which editor mode), which unit tests can't fully cover. A fast, high-signal way to reproduce and diagnose:

1. **Build a click-sample scenario as real notes in the vault.** Create a dedicated folder (e.g. `JumpTest/`) with a long note that places the relevant links far down (so scrolling is visibly obvious) plus target notes covering each case: a plain link, a `[[Note#heading]]` subpath link, an embed (`![[Note]]`), an unresolved `[[Missing]]`, etc. Put step-by-step instructions in the note itself.
2. **Trace with temporary `Notice` messages.** When behavior fails silently, drop `new Notice(...)` calls at each early-return / branch in the suspect method (e.g. one per guard in `jumpToLink`). After `npm run build`, **reload the plugin** (Settings → Community plugins → toggle off/on, or "Reload app without saving"), then click and read which toast appears — it pinpoints exactly which guard returned. This is how the #120 jump-to-link bug was localized to `getActiveViewOfType(MarkdownView)` returning `null` when the sidebar is the active leaf.
3. **Remove the `Notice` diagnostics** once the failing step is found and convert the finding into a real unit test where possible.

> Note: a fresh `npm run build` is not picked up until the plugin is reloaded in Obsidian — "nothing happened" is most often just stale code still loaded in memory.

## Cutting a Release

1. **Bump the version** — runs `version-bump.mjs`, which updates `manifest.json` and `versions.json`, then stages both files and creates a git commit + tag:
   ```
   npm version <new-version>   # e.g. npm version 1.2.2
   ```

2. **Push the commit and tag** to GitHub:
   ```
   git push && git push --tags
   ```

3. **GitHub Actions** (`.github/workflows/release.yml`) triggers on the tag push, builds the plugin, and creates a **draft** GitHub release containing `main.js`, `manifest.json`, and `styles.css`.

4. **Publish the draft release** at `https://github.com/jasonmotylinski/hierarchical-outgoing-links/releases` — review and click "Publish release".

## Architecture

The plugin follows Obsidian's plugin architecture with a main entry point that registers a custom view.

### Core Files

- `src/main.ts` - Plugin entry point. Extends `Plugin`, registers the view type, loads settings, and activates the side panel view.
- `src/view.ts` - Main view class (`HierarchicalOutgoingLinksView`) extending `ItemView`. Listens to workspace events (metadata changes, layout changes, file open) and re-renders the link hierarchy.
- `src/LinksHierarchy.ts` - Transforms flat link paths into a nested tree structure by splitting paths on `/`. Also applies regex-based filtering from settings.
- `src/TreeNodeView.ts` - Recursive component that renders each node in the tree. Handles expand/collapse state, navigation to linked files (click the name/icon), and jump-to-link in the active note (click the row's blank area).
- `src/linkLocation.ts` - Pure-ish helpers for the jump-to-link feature: locating an outgoing link's position in the active note, finding the `MarkdownView` showing a file, and scrolling to a line in both editing and reading modes. Kept free of DOM so it can be unit tested.
- `src/superchargedAttributes.ts` - Supercharged Links interop. When the opt-in setting is on, `TreeNodeView` decorates each resolved leaf's `.tree-item-inner` with `data-link-*` attributes (and `--data-link-*` CSS vars) derived from the target note's frontmatter and tags, so existing Supercharged Links CSS snippets style the rows with no dependency on the SL plugin. Pure functions taking a `CachedMetadata`/source object so they're unit-testable.
- `src/types.ts` - TypeScript interfaces for `TreeNode` and `PluginSettings`.
- `src/SettingTab.ts` - Settings UI for the exclude files filter.

### Navigation Buttons (`src/nav/`)

- `navButtonsView.ts` - Container for toolbar buttons
- `collapseButton.ts` - Expand/collapse all nodes button, uses Obsidian's `Events` for custom event emission
- `filterButton.ts` - Shown when filter is active, opens plugin settings

### Data Flow

1. User opens/switches to a note
2. `view.ts` reads resolved/unresolved links from `app.metadataCache`
3. `LinksHierarchy` transforms paths into tree structure with optional regex filtering
4. `TreeNodeView` recursively renders the tree with collapsible nodes
