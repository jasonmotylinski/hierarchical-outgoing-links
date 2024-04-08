import {  Plugin, WorkspaceLeaf } from 'obsidian';
import {HierarchicalOutgoingLinksView, VIEW_TYPE} from "./view";

// Remember to rename these classes and interfaces!

export default class HierarchicalOutgoingLinksPlugin extends Plugin {
	async onload() {
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