import { ItemView, WorkspaceLeaf } from "obsidian";
import HierarchicalOutgoingLinksPlugin  from "./main";
import { TreeNodeView } from "./TreeNodeView";
import { LinksHierarchy } from "./LinksHierarchy";
import { NavButtonsView } from "./nav/navButtonsView";
import { TreeNode } from "./types";

export const VIEW_TYPE="hierarchical-outgoing-links";


export class HierarchicalOutgoingLinksView extends ItemView {
    private plugin :HierarchicalOutgoingLinksPlugin;
    private treeNodeViews: TreeNodeView[]=[];

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
            
			this.createPane(container, resolvedLinks, unresolvedLinks);
        }
    }

	createPane(container :Element, resolvedLinks: Record<string, number>, unresolvedLinks: Record<string, number>){
		const navButtonsView=new NavButtonsView(this.app, this.plugin.settings, container);
		navButtonsView.render();
        
        navButtonsView.collapseButton.on("collapse-click", (e)=> {
            if(navButtonsView.collapseButton.isCollapsed()){
                this.treeNodeViews.forEach((n)=>{
                    n.toggleOff();
                });
            }else{
                this.treeNodeViews.forEach((n)=>{
                    n.toggleOn();
                });
            }
        });


		const pane=container.createDiv({cls: "outgoing-link-pane"});
		const resolvedHierarchy=new LinksHierarchy(resolvedLinks, this.plugin.settings);
		const unresolvedHierarchy=new LinksHierarchy(unresolvedLinks, this.plugin.settings);

		this.appendLinks(pane, "Links", resolvedHierarchy.getHierarchy());
		this.appendLinks(pane, "Unresolved links", unresolvedHierarchy.getHierarchy());
	}

    appendLinks(pane: HTMLDivElement, headerText: string, links: TreeNode[]){
        const linksHeader=pane.createDiv({cls: "tree-item-self is-clickable"});
        linksHeader.createEl("div",{text: headerText});
        pane.appendChild(linksHeader);
        const searchResultsContainer=pane.createDiv({cls: "search-result-container"});
        links.forEach((l) =>{
            const treeNodeView=new TreeNodeView(this.app, searchResultsContainer, l);
            treeNodeView.render();
			this.treeNodeViews.push(treeNodeView);
        });
    }

    registerEvents(){
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
        this.registerEvents();
        return this.initialize();
    }
}
