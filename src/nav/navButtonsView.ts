import { App } from "obsidian";
import { FilterButton } from "./filterButton";
import { PluginSettings } from "src/types";

export class NavButtonsView {
    private app;
    private parent;
    private settings: PluginSettings;
    public filterButton: FilterButton;
    constructor(app: App, settings: PluginSettings, parent: Element) {
        this.app=app;
        this.parent=parent;
        this.settings=settings;
    }

    render(){
        if(this.settings.excludeFilesFilter){
            const navButtonsContainer=this.parent.createDiv({cls:"nav-header"})
                                                .createDiv({cls: "nav-buttons-container"});
            this.filterButton=new FilterButton(this.app, navButtonsContainer);
            this.filterButton.render();
        }
    }
}