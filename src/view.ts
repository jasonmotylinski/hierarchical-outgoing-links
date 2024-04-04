import { ItemView, WorkspaceLeaf, getIcon } from "obsidian";
import HierarchicalOutgoingLinksPlugin  from "./main";
import { TreeNode } from "./types";

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
        return "Hierarchical Outgoing Links View";
    }

    async initialize(){

        const container=this.containerEl.children[1];
        container.empty();
        const activeFile=this.app.workspace.getActiveFile();

        if(activeFile){
            const resolvedLinks=this.app.metadataCache.resolvedLinks[activeFile.path];
            const unresolvedLinks=this.app.metadataCache.unresolvedLinks[activeFile.path];

            const pane=container.createDiv({cls: "outgoing-link-pane"});
            const resolvedHierarchy=this.create_hierarchy(resolvedLinks);
            const unresolvedHierarchy=this.create_hierarchy(unresolvedLinks);
            this.append_links(pane, "Links", resolvedHierarchy);
            this.append_links(pane, "Unresolved Links", unresolvedHierarchy);
        }
    }

    append_links(pane :HTMLDivElement, headerText :string, links: any[]){
        const linksHeader=pane.createDiv({cls: "tree-item-self is-clickable"});
        linksHeader.createEl("div",{text: headerText});
        pane.appendChild(linksHeader);
        const searchResultsContainer=pane.createDiv({cls: "search-result-container"});
        links.forEach((l) =>{
            this.append_child(searchResultsContainer, l);
        });
    }

    append_child(parent :HTMLDivElement, item :TreeNode){
        const treeItem=parent.createDiv({cls: "tree-item"});
        const treeItemSelf=treeItem.createDiv({cls: "tree-item-self is-clickable outgoing-link-item"});
        const treeItemIcon=treeItemSelf.createDiv({cls: "tree-item-icon collapse-icon"});

        let name = item.name;

        if(item.children && item.children.length == 0){
            const firstLink=this.app.metadataCache.getFirstLinkpathDest(item.name, '');
            
            if(firstLink){
                name=firstLink.basename;
                treeItemIcon.appendChild(getIcon("lucide-link")!);
            }
            else{
                treeItemIcon.appendChild(getIcon("lucide-file-plus")!);
            }
        }
        const firstLink=this.app.metadataCache.getFirstLinkpathDest(item.name, '');
        const treeItemInner=treeItemSelf.createDiv({cls: "tree-item-inner", text: name});

        treeItemInner.addEventListener('click', (e)=> {
            const firstLink=this.app.metadataCache.getFirstLinkpathDest(item.name, '');
            
            if(firstLink){
                this.app.workspace.openLinkText(firstLink.name, firstLink.path);
            }
        });

        if(item.children.length > 0){
            treeItemIcon.appendChild(getIcon("right-triangle")!);
        }

        let text = "";

        if(item.children.length == 0){
            text=item.count.toString();
        }
        const treeItemFlairOuter=treeItemSelf.createDiv({cls:"tree-item-flair-outer"}).createEl("span",{cls: "tree-item-flair", text: text});
        const treeItemChildren=treeItem.createDiv({cls: "tree-item-children"});
        if(item.children.length > 0){
            item.children.forEach((c)=>{ 
                this.append_child(treeItemChildren, c);
            });
        }

        treeItemSelf.addEventListener("click", (e)=>{ 
            treeItemSelf.toggleClass("is-collapsed", !treeItemSelf.hasClass("is-collapsed"));
            treeItemIcon.toggleClass("is-collapsed", !treeItemIcon.hasClass("is-collapsed"));
            if(treeItemSelf.hasClass("is-collapsed")){
                treeItemSelf.nextSibling!.remove();
            }
            else{
                const treeItemChildren=treeItem.createDiv({cls: "tree-item-children"});
                if(item.children.length > 0){
                    item.children.forEach((c)=>{ 
                        this.append_child(treeItemChildren, c);
                    });
                }
            }
        });
    };


    create_hierarchy(paths :{ [key: string]: number }){
        let result :any[] = [];
        let level = {result};
        for(const path in paths){
            path.split('/').reduce((r :any, name :string, i, a) => {
              if(!r[name]) {
                r[name] = {result: []};
                r.result.push({name, count: paths[path],children: r[name].result})
              }
              
              return r[name];
            }, level)
          }
        return result;
    }

    register_events(){
        this.plugin.registerEvent(this.app.metadataCache.on("changed", () => {
            this.initialize();
        }));

        this.plugin.registerEvent(this.app.workspace.on("layout-change", () => {
            this.initialize();
        }));
    }

    async onOpen(){
        this.register_events();
        return this.initialize();
    }
}