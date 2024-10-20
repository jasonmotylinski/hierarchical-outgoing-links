import { ItemView, WorkspaceLeaf, getIcon } from "obsidian";
import HierarchicalOutgoingLinksPlugin  from "./main";
import { TreeNode } from "./types";
import { TreeNodeView } from "./TreeNodeView";
import { LinksHierarchy } from "./LinksHierarchy";

export const VIEW_TYPE="hierarchical-outgoing-links-view";


export class HierarchicalOutgoingLinksView extends ItemView {
    private plugin :HierarchicalOutgoingLinksPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: HierarchicalOutgoingLinksPlugin){
        super(leaf);
        this.plugin=plugin;
    }

    getViewType(){
        return VIEW_TYPE;
    }

    getIcon(): string {
        return "links-going-out";
    }

    getDisplayText(): string {
        return "Hierarchical outgoing links";
    }

    async initialize(){

        const container=this.containerEl.children[1];
        container.empty();
        const activeFile=this.app.workspace.getActiveFile();

        if(activeFile){
            const resolvedLinks=this.app.metadataCache.resolvedLinks[activeFile.path];
            const unresolvedLinks=this.app.metadataCache.unresolvedLinks[activeFile.path];

            const pane=container.createDiv({cls: "outgoing-link-pane"});
            const resolvedHierarchy=new LinksHierarchy(resolvedLinks);
            const unresolvedHierarchy=new LinksHierarchy(unresolvedLinks);

            this.append_links(pane, "Links", resolvedHierarchy.getHierarchy());
            this.append_links(pane, "Unresolved links", unresolvedHierarchy.getHierarchy());
        }
    }

    append_links(pane :HTMLDivElement, headerText :string, links: any[]){
        const linksHeader=pane.createDiv({cls: "tree-item-self is-clickable"});
        linksHeader.createEl("div",{text: headerText});
        pane.appendChild(linksHeader);
        const searchResultsContainer=pane.createDiv({cls: "search-result-container"});
        links.forEach((l) =>{
            const treeNodeView=new TreeNodeView(this.app, searchResultsContainer, l);
            treeNodeView.render();
        });
    }

    register_events(){
        this.plugin.registerEvent(this.app.metadataCache.on("changed", () => {
            this.initialize();
        }));

        this.plugin.registerEvent(this.app.workspace.on("layout-change", () => {
            this.initialize();
        }));

        this.plugin.registerEvent(this.app.workspace.on("file-open", () => {
            this.initialize();
        }));
    }

    async onOpen(){
        this.register_events();
        return this.initialize();
    }
}
