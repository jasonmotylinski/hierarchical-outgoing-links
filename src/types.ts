export interface TreeNode {
    name: string;
    count: number;
    children: TreeNode[];
}

export interface PluginSettings {
    excludeFilesFilter: string|null;
    // When true, decorate each resolved outgoing-link row with Supercharged
    // Links-style `data-link-*` attributes derived from the target note's
    // frontmatter and tags, so existing Supercharged Links CSS snippets style
    // the rows. No dependency on the Supercharged Links plugin.
    superchargedLinks: boolean;
  }