import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
    resolve: {
        alias: {
            // `obsidian` ships types only (no runtime entry); point it at a stub.
            obsidian: fileURLToPath(new URL("./test/obsidian-stub.ts", import.meta.url)),
        },
    },
});
