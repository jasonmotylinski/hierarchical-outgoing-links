// Runtime stub for the `obsidian` package, which ships only type definitions
// (no JS entry). Vitest aliases `obsidian` to this file so modules that import
// real values (getIcon, MarkdownView) can load under the test runner.

export function getIcon(): HTMLElement {
    return document.createElement("span");
}

export class MarkdownView {}

export class Notice {
    constructor(_message: string) {
        // no-op in tests
    }
}
