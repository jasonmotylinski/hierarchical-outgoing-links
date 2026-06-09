// Supercharged Links interop.
//
// The Supercharged Links plugin colors links by reading the destination note's
// frontmatter/tags and writing `data-link-*` attributes (plus matching
// `--data-link-*` CSS variables) onto the link element; users then write CSS
// snippets that target those attributes. Its own Hierarchical Backlinks support
// (SL PR #236) decorates the `.tree-item-inner` rows directly — proving no <a>
// refactor is needed. This module reproduces SL's decoration so each resolved
// outgoing-link row is styled by the user's existing SL snippets without
// depending on SL at all.

import type { CachedMetadata } from "obsidian";

// Frontmatter keys that should never become attributes: Obsidian's internal
// position marker, and tag keys (covered by the merged `data-link-tags` below).
const SKIP_KEYS = new Set(["position", "tag", "tags"]);

// Classes SL adds to every decorated element (used by SL CSS for icon slots).
const SL_CLASSES = ["data-link-icon", "data-link-icon-after", "data-link-text"];

/** Coerce a frontmatter value to a DOM-attribute string, or null to skip it. */
function toAttrValue(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    if (Array.isArray(value)) {
        const parts = value.filter(v => v !== null && v !== undefined).map(v => String(v));
        return parts.length ? parts.join(" ") : null;
    }
    if (typeof value === "object") return null; // nested objects aren't styleable
    return String(value);
}

/**
 * Collect a note's tags (from inline `#tags` and the `tags` frontmatter key),
 * deduplicated, lowercased, and without the leading '#'. Mirrors the data SL
 * exposes via `data-link-tags`.
 */
export function extractTags(cache: CachedMetadata | null | undefined): string[] {
    if (!cache) return [];

    const out = new Set<string>();
    const addTag = (value: unknown) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach(addTag);
            return;
        }
        let t = String(value).trim();
        if (!t) return;
        if (t.startsWith("#")) t = t.slice(1);
        if (!t) return;
        out.add(t.toLowerCase());
    };

    cache.tags?.forEach(({ tag }) => addTag(tag));

    const fmTags = (cache.frontmatter as Record<string, unknown> | undefined)?.tags;
    if (typeof fmTags === "string") {
        fmTags
            .split(/[\s,]+/)
            .map(s => s.trim())
            .filter(Boolean)
            .forEach(addTag);
    } else {
        addTag(fmTags);
    }

    return Array.from(out);
}

/** The destination note's metadata needed to decorate a row, SL-style. */
export interface SuperchargedSource {
    path: string;
    basename: string;
    frontmatter?: Record<string, unknown>;
    tags: string[];
}

/**
 * Apply Supercharged Links-style attributes to `el` from a resolved link's
 * destination note. `el` is the row's `.tree-item-inner`, matching the element
 * SL targets.
 */
export function applySuperchargedAttributes(el: HTMLElement, source: SuperchargedSource): void {
    for (const cls of SL_CLASSES) el.classList.add(cls);

    el.setAttribute("data-link-path", source.path);
    el.setAttribute("data-link-data-href", source.basename);

    if (source.tags.length > 0) {
        el.setAttribute("data-link-tags", source.tags.join(" "));
    }

    if (source.frontmatter) {
        for (const key of Object.keys(source.frontmatter)) {
            if (SKIP_KEYS.has(key.toLowerCase())) continue;
            const value = toAttrValue(source.frontmatter[key]);
            if (value === null) continue;
            const domKey = key.replace(/ /g, "-");
            el.setAttribute(`data-link-${domKey}`, value);
            el.style.setProperty(`--data-link-${domKey}`, value);
        }
    }
}
