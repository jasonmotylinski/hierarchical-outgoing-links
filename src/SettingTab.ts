import { PluginSettingTab } from "obsidian";
import HierarchicalOutgoingLinksPlugin from "./main";

export class SettingTab extends PluginSettingTab {
    plugin: HierarchicalOutgoingLinksPlugin;
  /*
    constructor(app: App, plugin: ExamplePlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }
      */
  
    display(): void {
        /*
      let { containerEl } = this;
  
      containerEl.empty();
  
      new Setting(containerEl)
        .setName('Date format')
        .setDesc('Default date format')
        .addText((text) =>
          text
            .setPlaceholder('MMMM dd, yyyy')
            .setValue(this.plugin.settings.dateFormat)
            .onChange(async (value) => {
              this.plugin.settings.dateFormat = value;
              await this.plugin.saveSettings();
            })
        );
        */
    }
        
  }