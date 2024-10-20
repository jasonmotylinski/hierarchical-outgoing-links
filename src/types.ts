export interface TreeNode {
    name: string;
    count: number;
    children: TreeNode[];
}

export interface PluginSettings {
    excludeFilesFilter: string|null;
  }