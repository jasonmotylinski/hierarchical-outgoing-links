import { App } from "obsidian";
import { EventEmitter } from "events";

export class CollapseButton extends EventEmitter  {
    private app: App;
    private parent: Element;
    private svgCollapse='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-list"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
    private button :HTMLDivElement;
    constructor(app: App, parent: Element) {
        super();
        this.app=app;
        this.parent=parent;
    }

    render(){
        this.button=this.parent.createDiv({cls: "clickable-icon nav-action-button"});
        this.button.innerHTML=this.svgCollapse;

        this.button.addEventListener("click", (e)=>{ 
            this.button.classList.toggle('is-active');
            this.emit("collapse-click", e);
        });
    }

    isCollapsed(): boolean{
        return this.button.hasClass("is-active");
    }
   
}

