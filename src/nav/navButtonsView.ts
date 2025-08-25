import { App } from "obsidian";
import { FilterButton } from "./filterButton";
import { PluginSettings } from "src/types";
import { CollapseButton } from "hierarchical-common";

export class NavButtonsView {
    private app;
    private parent;
    private settings: PluginSettings;
    public collapseButton: CollapseButton;
    public filterButton: FilterButton;
    constructor(app: App, settings: PluginSettings, parent: Element) {
        this.app=app;
        this.parent=parent;
        this.settings=settings;
    }

    render(){
		const navButtonsContainer=this.parent.createDiv({cls:"nav-header"})
											.createDiv({cls: "nav-buttons-container"});
		this.collapseButton=new CollapseButton(this.app, navButtonsContainer);
		this.collapseButton.render();
        if(this.settings.excludeFilesFilter){
            this.filterButton=new FilterButton(this.app, navButtonsContainer);
            this.filterButton.render();
        }
    }
}
