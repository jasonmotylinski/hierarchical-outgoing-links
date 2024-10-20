import {  Plugin, WorkspaceLeaf } from 'obsidian';
import {HierarchicalOutgoingLinksView, VIEW_TYPE} from "./view";
import { ExamplePluginSettings } from './types';

export default class HierarchicalOutgoingLinksPlugin extends Plugin {
    settings: ExamplePluginSettings;
    DEFAULT_SETTINGS: Partial<ExamplePluginSettings> = {
        dateFormat: 'YYYY-MM-DD',
      };
      
    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE,
            (leaf) => new HierarchicalOutgoingLinksView(leaf, this)
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
