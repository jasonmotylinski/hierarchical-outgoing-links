# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian plugin that displays outgoing links from the active note as a hierarchical tree based on folder structure, rather than a flat list like the core Obsidian plugin.

## Build Commands

- `npm install` - Install dependencies
- `npm run dev` - Development build with watch mode (outputs to main.js)
- `npm run build` - Production build with TypeScript type checking

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
- `src/TreeNodeView.ts` - Recursive component that renders each node in the tree. Handles expand/collapse state and navigation to linked files.
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
