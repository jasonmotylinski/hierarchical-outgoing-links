import { App, Events, getIcon } from "obsidian";

export class CollapseButton  extends Events {
    private app: App;
    private parent: Element;
    private button: HTMLDivElement;
    constructor(app: App, parent: Element) {
        super();
        this.app=app;
        this.parent=parent;
    }

    render(){
        this.button=this.parent.createDiv({cls: "clickable-icon nav-action-button"});
        this.button.appendChild(getIcon("list")!);

        this.button.addEventListener("click", (e)=>{ 
            this.button.classList.toggle('is-active');
            this.trigger("collapse-click", e);
        });
    }

    isCollapsed(): boolean{
        return this.button.hasClass("is-active");
    }
   
}

