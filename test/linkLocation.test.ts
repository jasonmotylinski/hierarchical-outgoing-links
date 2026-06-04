import { describe, it, expect, vi } from "vitest";
import type { App, MarkdownView, TFile } from "obsidian";
import { findLinkPosition, findMarkdownViewForFile, scrollToLink } from "../src/linkLocation";

// Minimal metadataCache mock: resolves link paths to fake TFiles by basename
// and serves a fixed set of links for the active file.
function makeApp(files: Record<string, { path: string }>, links: Array<{ link: string; line: number; col: number }>): App {
    return {
        metadataCache: {
            getFirstLinkpathDest: (linkpath: string) => files[linkpath] ?? null,
            getFileCache: () => ({
                links: links.map((l) => ({
                    link: l.link,
                    position: { start: { line: l.line, col: l.col } },
                })),
            }),
        },
    } as unknown as App;
}

const activeFile = { path: "Active.md" } as TFile;

describe("findLinkPosition", () => {
    it("returns the start position of the first link that resolves to the target", () => {
        const files = {
            Target: { path: "Folder/Target.md" },
            Other: { path: "Folder/Other.md" },
        };
        const app = makeApp(files, [
            { link: "Other", line: 2, col: 0 },
            { link: "Target", line: 5, col: 4 },
        ]);

        expect(findLinkPosition(app, activeFile, "Target")).toEqual({ line: 5, col: 4 });
    });

    it("matches links that carry a subpath or alias (e.g. [[Target#Section|alias]])", () => {
        const files = {
            Target: { path: "Folder/Target.md" },
        };
        // The resolver only knows the bare "Target"; without stripping the
        // subpath/alias, getFirstLinkpathDest would be handed "Target#Section"
        // and find nothing.
        const app = makeApp(files, [{ link: "Target#Section|alias", line: 7, col: 2 }]);

        expect(findLinkPosition(app, activeFile, "Target")).toEqual({ line: 7, col: 2 });
    });

    it("returns null when the target name cannot be resolved", () => {
        const app = makeApp({}, [{ link: "Target", line: 1, col: 0 }]);
        expect(findLinkPosition(app, activeFile, "Target")).toBeNull();
    });

    it("returns null when no outgoing link points at the target", () => {
        const files = {
            Target: { path: "Folder/Target.md" },
            Other: { path: "Folder/Other.md" },
        };
        const app = makeApp(files, [{ link: "Other", line: 3, col: 0 }]);
        expect(findLinkPosition(app, activeFile, "Target")).toBeNull();
    });

    it("returns null when the active file has no link metadata", () => {
        const app = {
            metadataCache: {
                getFirstLinkpathDest: () => ({ path: "Folder/Target.md" }),
                getFileCache: () => ({}),
            },
        } as unknown as App;
        expect(findLinkPosition(app, activeFile, "Target")).toBeNull();
    });
});

describe("findMarkdownViewForFile", () => {
    const file = { path: "Active.md" } as TFile;

    function makeWorkspaceApp(opts: { active?: unknown; leaves?: Array<{ view: unknown }> }): App {
        return {
            workspace: {
                getActiveViewOfType: () => opts.active ?? null,
                getLeavesOfType: () => opts.leaves ?? [],
            },
        } as unknown as App;
    }

    it("returns the active markdown view when it is showing the file", () => {
        const view = { file: { path: "Active.md" } };
        expect(findMarkdownViewForFile(makeWorkspaceApp({ active: view }), file)).toBe(view);
    });

    it("falls back to the leaf showing the file when no markdown view is active (regression for #120)", () => {
        // Clicking a panel row makes the sidebar the active leaf, so
        // getActiveViewOfType(MarkdownView) returns null.
        const view = { file: { path: "Active.md" } };
        const app = makeWorkspaceApp({
            active: null,
            leaves: [{ view: { file: { path: "Other.md" } } }, { view }],
        });
        expect(findMarkdownViewForFile(app, file)).toBe(view);
    });

    it("returns null when no open markdown leaf shows the file", () => {
        const app = makeWorkspaceApp({
            active: null,
            leaves: [{ view: { file: { path: "Other.md" } } }],
        });
        expect(findMarkdownViewForFile(app, file)).toBeNull();
    });
});

describe("scrollToLink", () => {
    it("scrolls via ephemeral state in reading mode and does not touch the editor (regression for #120)", () => {
        const setEphemeralState = vi.fn();
        const editor = { setCursor: vi.fn(), scrollIntoView: vi.fn() };
        const view = { getMode: () => "preview", setEphemeralState, editor } as unknown as MarkdownView;

        scrollToLink(view, { line: 5, col: 4 });

        expect(setEphemeralState).toHaveBeenCalledWith({ line: 5 });
        expect(editor.setCursor).not.toHaveBeenCalled();
        expect(editor.scrollIntoView).not.toHaveBeenCalled();
    });

    it("moves the cursor and scrolls the editor in editing mode", () => {
        const setEphemeralState = vi.fn();
        const editor = { setCursor: vi.fn(), scrollIntoView: vi.fn() };
        const view = { getMode: () => "source", setEphemeralState, editor } as unknown as MarkdownView;

        scrollToLink(view, { line: 5, col: 4 });

        expect(editor.setCursor).toHaveBeenCalledWith({ line: 5, ch: 4 });
        expect(editor.scrollIntoView).toHaveBeenCalledWith(
            { from: { line: 5, ch: 4 }, to: { line: 5, ch: 4 } },
            true,
        );
        expect(setEphemeralState).not.toHaveBeenCalled();
    });
});
