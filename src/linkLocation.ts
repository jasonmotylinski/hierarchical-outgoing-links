import { MarkdownView } from "obsidian";
import type { App, TFile, EditorPosition } from "obsidian";

export interface LinkLocation {
    line: number;
    col: number;
}

/**
 * Reduce a raw link target to just its file linkpath, the way Obsidian's
 * `getLinkpath` would: drop any subpath (`#heading` / `#^block`) and alias
 * (`|display`). Without this, links such as `[[Note#Section]]` fail to resolve
 * because `getFirstLinkpathDest` looks for a file literally named `Note#Section`.
 */
function linkpathOf(link: string): string {
    const hash = link.indexOf('#');
    const base = hash === -1 ? link : link.slice(0, hash);
    const pipe = base.indexOf('|');
    return pipe === -1 ? base : base.slice(0, pipe);
}

/**
 * Find the position of the first outgoing link in `activeFile` that resolves to
 * the same file as `targetName`. Returns null when the target cannot be
 * resolved, the active file has no link metadata, or no link points at it.
 */
export function findLinkPosition(app: App, activeFile: TFile, targetName: string): LinkLocation | null {
    const targetFile = app.metadataCache.getFirstLinkpathDest(targetName, '');
    if (!targetFile) return null;

    const fileCache = app.metadataCache.getFileCache(activeFile);
    if (!fileCache?.links) return null;

    const linkCache = fileCache.links.find((lc) => {
        const dest = app.metadataCache.getFirstLinkpathDest(linkpathOf(lc.link), activeFile.path);
        return dest?.path === targetFile.path;
    });
    if (!linkCache) return null;

    return { line: linkCache.position.start.line, col: linkCache.position.start.col };
}

/**
 * Find the MarkdownView currently displaying `file`.
 *
 * `getActiveViewOfType(MarkdownView)` returns null when the plugin's own
 * sidebar leaf is the active one — which is exactly the case right after the
 * user clicks a row in the panel (see issue #120). So fall back to scanning the
 * open markdown leaves for the one showing the file.
 */
export function findMarkdownViewForFile(app: App, file: TFile): MarkdownView | null {
    const active = app.workspace.getActiveViewOfType(MarkdownView);
    if (active && active.file?.path === file.path) return active;

    for (const leaf of app.workspace.getLeavesOfType('markdown')) {
        const view = leaf.view as MarkdownView;
        if (view?.file?.path === file.path) return view;
    }
    return null;
}

/**
 * Scroll the given markdown view to `location`, working in both editing
 * (source / live preview) and reading (preview) modes.
 *
 * In reading mode there is no editor cursor to drive, so the earlier fix that
 * only called `editor.setCursor` / `editor.scrollIntoView` did nothing (see
 * issue #120). Reading mode is scrolled via ephemeral state instead.
 */
export function scrollToLink(view: MarkdownView, location: LinkLocation): void {
    if (view.getMode() === 'preview') {
        view.setEphemeralState({ line: location.line });
        return;
    }

    const pos: EditorPosition = { line: location.line, ch: location.col };
    const editor = view.editor;
    editor.setCursor(pos);
    editor.scrollIntoView({ from: pos, to: pos }, true);
}
