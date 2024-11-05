import { App, getIcon } from "obsidian";
import { TreeNode } from "./types";

export class TreeNodeView{
    private app: App;
    private isCollapsed: boolean;
	private canToggleIcon: boolean=true;
    private parent: HTMLDivElement;
    private treeItem: HTMLDivElement;
    private treeItemSelf: HTMLDivElement;
    private treeItemIcon: HTMLDivElement;
    private treeNode: TreeNode;
    private treeNodeViewChildren: TreeNodeView[];
    constructor(app: App, parent: HTMLDivElement, treeNode: TreeNode) {
        this.app=app;
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

        this.treeItemSelf.createDiv({cls:"tree-item-flair-outer"}).createEl("span",{cls: "tree-item-flair", text: text});
        if(this.treeNode.children.length > 0){
            this.appendTreeItemChildren(this.treeItem, this.treeNode.children);
            
        }
    }

    appendEndNode(parent :HTMLDivElement, treeNode :TreeNode){
        this.treeItemIcon=parent.createDiv({cls: "tree-item-icon collapse-icon"});

        let name = treeNode.name;
        if(treeNode.children && treeNode.children.length == 0){
            const firstLink=this.app.metadataCache.getFirstLinkpathDest(treeNode.name, '');
            
            if(firstLink){
                name=firstLink.basename;
                this.treeItemIcon.appendChild(getIcon("lucide-link")!);

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
        treeItemInner.addEventListener("click", (e)=>{ 
            this.navigateTo(treeNode.name);
        });

        this.treeItemIcon.addEventListener("click", (e)=> {
            this.toggle();
        });

    }

    appendTreeItemChildren(treeItem:HTMLDivElement, children :TreeNode[]){
        const treeItemChildren=treeItem.createDiv({cls: "tree-item-children"});
        children.forEach((c)=>{ 
            const treeNodeView=new TreeNodeView(this.app, treeItemChildren, c);
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
