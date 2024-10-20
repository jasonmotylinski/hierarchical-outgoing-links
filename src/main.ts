import {  Plugin, WorkspaceLeaf } from 'obsidian';
import {HierarchicalOutgoingLinksView, VIEW_TYPE} from "./view";
import { PluginSettings } from './types';
import { SettingTab } from './SettingTab';

export default class HierarchicalOutgoingLinksPlugin extends Plugin {
    settings: PluginSettings;
    DEFAULT_SETTINGS: Partial<PluginSettings> = {
      excludeFilesFilter: null,
    };
    private view: HierarchicalOutgoingLinksView;
    async onload() {
        await this.loadSettings();
        this.addSettingTab(new SettingTab(this.app, this));

        this.registerView(
            VIEW_TYPE,
            (leaf) => {
               this.view=new HierarchicalOutgoingLinksView(leaf, this);
                return this.view;
            }
        );

        this.addCommand({
            id: "show-hierarchical-outgoing-links",
            name: "Show hierarchical outgoing links",
            callback: () => {
              this.activateView();
            },
          });

        this.activateView();
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign({}, this.DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        this.view.initialize();
    }

    async activateView(){
        const { workspace } = this.app;
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE);

        if(leaves.length > 0){
            leaf=leaves[0];
        }else{
            leaf=workspace.getRightLeaf(false);
            await leaf?.setViewState({type: VIEW_TYPE, active: true});
        }

        workspace.revealLeaf(leaf!);
    }
}
