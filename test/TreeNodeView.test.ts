// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll } from "vitest";
import type { App } from "obsidian";
import type { TreeNode } from "../src/types";

// `obsidian` is aliased to test/obsidian-stub.ts via vitest.config.ts.

// Obsidian augments HTMLElement with createDiv / createEl; polyfill the minimal
// behaviour the view relies on so render() works under jsdom.
beforeAll(() => {
    function createChild(this: HTMLElement, tag: string, o?: { cls?: string; text?: string }) {
        const el = document.createElement(tag);
        if (o?.cls) el.className = o.cls;
        if (o?.text) el.textContent = o.text;
        this.appendChild(el);
        return el;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLElement.prototype as any).createDiv = function (o?: { cls?: string; text?: string }) {
        return createChild.call(this, "div", o);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (HTMLElement.prototype as any).createEl = function (tag: string, o?: { cls?: string; text?: string }) {
        return createChild.call(this, tag, o);
    };
});

function leaf(name: string): TreeNode {
    return { name, count: 1, children: [] };
}

// Build an app whose metadataCache resolves (or fails to resolve) the leaf name.
function makeApp(opts: { resolves: boolean; openLinkText?: ReturnType<typeof vi.fn> }): App {
    const target = { basename: "Target", name: "Target.md", path: "Target.md" };
    return {
        metadataCache: {
            getFirstLinkpathDest: () => (opts.resolves ? target : null),
            getFileCache: () => ({ links: [] }),
        },
        workspace: {
            getActiveFile: () => null,
            getActiveViewOfType: () => null,
            openLinkText: opts.openLinkText ?? vi.fn(),
        },
    } as unknown as App;
}

async function renderInto(app: App, node: TreeNode): Promise<HTMLElement> {
    const { TreeNodeView } = await import("../src/TreeNodeView");
    const parent = document.createElement("div");
    new TreeNodeView(app, parent as HTMLDivElement, node).render();
    return parent;
}

describe("TreeNodeView jump affordance (#6)", () => {
    it("advertises jump on resolved leaves", async () => {
        const parent = await renderInto(makeApp({ resolves: true }), leaf("Target"));
        const self = parent.querySelector(".tree-item-self") as HTMLElement;

        expect(self.style.cursor).toBe("pointer");
        expect(self.title).toBe("Jump to link in current note");
    });

    it("does not advertise jump on unresolved leaves", async () => {
        const parent = await renderInto(makeApp({ resolves: false }), leaf("Missing"));
        const self = parent.querySelector(".tree-item-self") as HTMLElement;

        expect(self.style.cursor).toBe("");
        expect(self.title).toBe("");
    });
});

describe("TreeNodeView Supercharged Links attributes", () => {
    // App whose resolved leaf has frontmatter + tags in its file cache.
    function makeChargedApp(): App {
        const target = { basename: "Target", name: "Target.md", path: "Areas/Target.md" };
        return {
            metadataCache: {
                getFirstLinkpathDest: () => target,
                getFileCache: () => ({
                    tags: [{ tag: "#project" }],
                    frontmatter: { status: "active", tags: ["project"] },
                }),
            },
            workspace: {
                getActiveFile: () => null,
                getActiveViewOfType: () => null,
                openLinkText: vi.fn(),
            },
        } as unknown as App;
    }

    async function renderWithSettings(app: App, node: TreeNode, supercharged: boolean): Promise<HTMLElement> {
        const { TreeNodeView } = await import("../src/TreeNodeView");
        const parent = document.createElement("div");
        new TreeNodeView(app, parent as HTMLDivElement, node, {
            excludeFilesFilter: null,
            superchargedLinks: supercharged,
        }).render();
        return parent;
    }

    it("decorates resolved leaf rows when the setting is on", async () => {
        const parent = await renderWithSettings(makeChargedApp(), leaf("Target"), true);
        const inner = parent.querySelector(".tree-item-inner") as HTMLElement;

        expect(inner.getAttribute("data-link-path")).toBe("Areas/Target.md");
        expect(inner.getAttribute("data-link-status")).toBe("active");
        expect(inner.getAttribute("data-link-tags")).toBe("project");
        expect(inner.classList.contains("data-link-text")).toBe(true);
    });

    it("does not decorate when the setting is off", async () => {
        const parent = await renderWithSettings(makeChargedApp(), leaf("Target"), false);
        const inner = parent.querySelector(".tree-item-inner") as HTMLElement;

        expect(inner.hasAttribute("data-link-path")).toBe(false);
        expect(inner.classList.contains("data-link-text")).toBe(false);
    });

    it("does not decorate unresolved leaves even when the setting is on", async () => {
        const app = makeApp({ resolves: false });
        const parent = await renderWithSettings(app, leaf("Missing"), true);
        const inner = parent.querySelector(".tree-item-inner") as HTMLElement;

        expect(inner.hasAttribute("data-link-path")).toBe(false);
    });
});

describe("TreeNodeView icon behaviour (#7)", () => {
    it("opens the note when the leaf icon is clicked, without bubbling to the jump handler", async () => {
        const openLinkText = vi.fn();
        const app = makeApp({ resolves: true, openLinkText });
        const parent = await renderInto(app, leaf("Target"));
        const self = parent.querySelector(".tree-item-self") as HTMLElement;
        const icon = self.querySelector(".tree-item-icon") as HTMLElement;

        // Spy on the row's jump handler to confirm the icon click does not reach it.
        const jump = vi.fn();
        self.addEventListener("click", jump);

        icon.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(openLinkText).toHaveBeenCalledWith("Target.md", "Target.md");
        expect(jump).not.toHaveBeenCalled();
    });
});
