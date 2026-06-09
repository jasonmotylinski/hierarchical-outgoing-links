import { App, getIcon, TFile } from "obsidian";
import { PluginSettings, TreeNode } from "./types";
import { findLinkPosition, findMarkdownViewForFile, scrollToLink } from "./linkLocation";
import { applySuperchargedAttributes, extractTags } from "./superchargedAttributes";

export class TreeNodeView{
    private app: App;
    private settings?: PluginSettings;
    private isCollapsed: boolean;
	private canToggleIcon: boolean=true;
	private isResolvedLink: boolean=false;
    private parent: HTMLDivElement;
    private treeItem: HTMLDivElement;
    private treeItemSelf: HTMLDivElement;
    private treeItemIcon: HTMLDivElement;
    private treeNode: TreeNode;
    private treeNodeViewChildren: TreeNodeView[];
    constructor(app: App, parent: HTMLDivElement, treeNode: TreeNode, settings?: PluginSettings) {
        this.app=app;
        this.settings=settings;
        this.isCollapsed=false;
        this.parent=parent;
        this.treeNode=treeNode;
        this.treeNodeViewChildren=[];
    }

    render(){
        this.treeItem=this.parent.createDiv({cls: "tree-item"});
        this.treeItemSelf=this.treeItem.createDiv({cls: "tree-item-self is-clickable backlink-item"});

        this.appendEndNode(this.treeItemSelf, this.treeNode);
        
        let text = "";
        if(this.treeNode.children.length == 0){
            text=this.treeNode.count.toString();
        }

        const treeItemFlairOuter = this.treeItemSelf.createDiv({cls:"tree-item-flair-outer"});
        treeItemFlairOuter.createEl("span",{cls: "tree-item-flair", text: text});
        if(this.treeNode.children.length == 0 && this.isResolvedLink){
            // Clicking the blank area of the row (everything except the note name)
            // jumps to the link's location in the active note. See issue #119/#120.
            // Only resolved links can be jumped to, so don't advertise the
            // affordance on unresolved rows.
            this.treeItemSelf.title = "Jump to link in current note";
            this.treeItemSelf.style.cursor = "pointer";
            this.treeItemSelf.addEventListener("click", () => {
                this.jumpToLink(this.treeNode.name);
            });
        }
        if(this.treeNode.children.length > 0){
            this.appendTreeItemChildren(this.treeItem, this.treeNode.children);
            
        }
    }

    appendEndNode(parent :HTMLDivElement, treeNode :TreeNode){
        this.treeItemIcon=parent.createDiv({cls: "tree-item-icon collapse-icon"});

        let name = treeNode.name;
        let firstLink: TFile | null = null;
        if(treeNode.children && treeNode.children.length == 0){
            firstLink=this.app.metadataCache.getFirstLinkpathDest(treeNode.name, '');

            if(firstLink){
                name=firstLink.basename;
                this.treeItemIcon.appendChild(getIcon("lucide-link")!);
                this.isResolvedLink=true;
            }
            else{
                this.treeItemIcon.appendChild(getIcon("lucide-file-plus")!);
				this.canToggleIcon=false;
            }
        }
        else{
            this.treeItemIcon.appendChild(getIcon("right-triangle")!);
        }
        const treeItemInner=parent.createDiv({cls: "tree-item-inner", text: name});

        // Supercharged Links interop: decorate resolved leaf rows with the
        // destination note's metadata so existing Supercharged Links CSS
        // snippets color them. Only resolved links have a backing file.
        if(this.settings?.superchargedLinks && firstLink){
            const cache=this.app.metadataCache.getFileCache(firstLink);
            applySuperchargedAttributes(treeItemInner, {
                path: firstLink.path,
                basename: firstLink.basename,
                frontmatter: cache?.frontmatter as Record<string, unknown> | undefined,
                tags: extractTags(cache),
            });
        }
        treeItemInner.addEventListener("click", (e)=>{
            // Clicking the note name opens the target note; stop the event from
            // bubbling to the row handler that jumps to the link instead.
            e.stopPropagation();
            this.navigateTo(treeNode.name);
        });

        this.treeItemIcon.addEventListener("click", (e)=> {
            if(treeNode.children.length == 0){
                // Leaf icon opens the target note (matching the note name) per the
                // #119 spec; stop it from bubbling to the row's jump handler.
                e.stopPropagation();
                this.navigateTo(treeNode.name);
            }else{
                this.toggle();
            }
        });

    }

    appendTreeItemChildren(treeItem:HTMLDivElement, children :TreeNode[]){
        const treeItemChildren=treeItem.createDiv({cls: "tree-item-children"});
        children.forEach((c)=>{ 
            const treeNodeView=new TreeNodeView(this.app, treeItemChildren, c, this.settings);
            treeNodeView.render();
            this.treeNodeViewChildren.push(treeNodeView);
        });

    }

    navigateTo(name :string){
        const firstLink=this.app.metadataCache.getFirstLinkpathDest(name, '');

        if(firstLink){
            this.app.workspace.openLinkText(firstLink.name, firstLink.path);
        }
    }

    jumpToLink(name: string){
        const activeFile=this.app.workspace.getActiveFile();
        if(!activeFile) return;

        const location=findLinkPosition(this.app, activeFile, name);
        if(!location) return;

        const markdownView=findMarkdownViewForFile(this.app, activeFile);
        if(!markdownView) return;

        scrollToLink(markdownView, location);
    }

    toggleOn(){
        this.treeItemSelf.toggleClass("is-collapsed", false);
        this.treeItemIcon.toggleClass("is-collapsed", false);
        if(this.treeItemSelf.nextSibling){
            const nextDiv = this.treeItemSelf.nextSibling as HTMLDivElement;
            nextDiv.style.display="block";
        }

        this.treeNodeViewChildren.forEach((c)=>{c.toggleOn()});
    }
    
    toggleOff(){
        this.treeItemSelf.toggleClass("is-collapsed", true);
		if(this.canToggleIcon){
        	this.treeItemIcon.toggleClass("is-collapsed", true);
		}
        if(this.treeItemSelf.nextSibling){
            const nextDiv = this.treeItemSelf.nextSibling as HTMLDivElement;
            nextDiv.style.display="none";
        }

        this.treeNodeViewChildren.forEach((c)=>{c.toggleOff()});
    }

    toggle(){
        if(this.isCollapsed){
            this.isCollapsed=false;
            this.toggleOff();
        }else{
            this.isCollapsed=true;
            this.toggleOn();
        }
    }
}
