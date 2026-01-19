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
            // Obsidian's `app.setting` is an internal API not exposed in the public TypeScript
            // definitions, but it exists at runtime and is commonly used by plugins to
            // programmatically open the settings modal and navigate to a specific tab.
            // @ts-ignore
            this.app.setting.open();
            // @ts-ignore
            this.app.setting.openTabById('hierarchical-outgoing-links');
        });
    }
}