import { App, getIcon } from "obsidian";

export class FilterButton {
    private app: App;
    private parent: Element;

    constructor(app: App, parent: Element) {
        this.app=app;
        this.parent=parent;
    }

    render(){
        const clickableIcon=this.parent.createDiv({cls:"clickable-icon nav-action-button"});
        clickableIcon.appendChild(getIcon("filter")!);
        clickableIcon.addClass("is-active");
        clickableIcon.onClickEvent((e)=>{
            // @ts-ignore - this.app.setting is available in the JS API, not TS for some reason. Property exists on App 
            this.app.setting.open(); 
            // @ts-ignore - this.app.setting is available in the JS API, not TS for some reason. Property exists on App 
            this.app.setting.openTabById('hierarchical-outgoing-links');
        });
    }
}