// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import type { CachedMetadata } from "obsidian";
import { applySuperchargedAttributes, extractTags } from "../src/superchargedAttributes";

describe("extractTags", () => {
    it("returns [] for missing cache", () => {
        expect(extractTags(null)).toEqual([]);
        expect(extractTags(undefined)).toEqual([]);
    });

    it("merges inline tags and frontmatter tags, deduped and lowercased without '#'", () => {
        const cache = {
            tags: [{ tag: "#Project" }, { tag: "#urgent" }],
            frontmatter: { tags: ["urgent", "Area/Work"] },
        } as unknown as CachedMetadata;

        expect(extractTags(cache).sort()).toEqual(["area/work", "project", "urgent"]);
    });

    it("splits a string frontmatter `tags` on whitespace and commas", () => {
        const cache = {
            frontmatter: { tags: "alpha, beta gamma" },
        } as unknown as CachedMetadata;

        expect(extractTags(cache).sort()).toEqual(["alpha", "beta", "gamma"]);
    });
});

describe("applySuperchargedAttributes", () => {
    it("sets path/href attributes and SL classes", () => {
        const el = document.createElement("div");
        applySuperchargedAttributes(el, {
            path: "Areas/Work/Note.md",
            basename: "Note",
            tags: [],
        });

        expect(el.getAttribute("data-link-path")).toBe("Areas/Work/Note.md");
        expect(el.getAttribute("data-link-data-href")).toBe("Note");
        expect(el.classList.contains("data-link-icon")).toBe(true);
        expect(el.classList.contains("data-link-icon-after")).toBe(true);
        expect(el.classList.contains("data-link-text")).toBe(true);
    });

    it("emits data-link-tags only when tags exist", () => {
        const withTags = document.createElement("div");
        applySuperchargedAttributes(withTags, { path: "a.md", basename: "a", tags: ["x", "y"] });
        expect(withTags.getAttribute("data-link-tags")).toBe("x y");

        const noTags = document.createElement("div");
        applySuperchargedAttributes(noTags, { path: "a.md", basename: "a", tags: [] });
        expect(noTags.hasAttribute("data-link-tags")).toBe(false);
    });

    it("turns frontmatter into data-link-* attributes and matching CSS vars", () => {
        const el = document.createElement("div");
        applySuperchargedAttributes(el, {
            path: "a.md",
            basename: "a",
            tags: [],
            frontmatter: { status: "active", priority: 3, "due date": "2026-06-08" },
        });

        expect(el.getAttribute("data-link-status")).toBe("active");
        expect(el.style.getPropertyValue("--data-link-status")).toBe("active");
        expect(el.getAttribute("data-link-priority")).toBe("3");
        // spaces in keys become dashes
        expect(el.getAttribute("data-link-due-date")).toBe("2026-06-08");
    });

    it("joins array values with spaces and skips nested objects, position, and tag keys", () => {
        const el = document.createElement("div");
        applySuperchargedAttributes(el, {
            path: "a.md",
            basename: "a",
            tags: ["t"],
            frontmatter: {
                aliases: ["one", "two"],
                position: { start: 0 },
                tag: "ignored",
                tags: ["ignored"],
                nested: { deep: true },
            },
        });

        expect(el.getAttribute("data-link-aliases")).toBe("one two");
        expect(el.hasAttribute("data-link-position")).toBe(false);
        expect(el.hasAttribute("data-link-tag")).toBe(false);
        // `tags` from frontmatter is skipped here; the merged list comes via the `tags` arg.
        expect(el.getAttribute("data-link-tags")).toBe("t");
        expect(el.hasAttribute("data-link-nested")).toBe(false);
    });
});
