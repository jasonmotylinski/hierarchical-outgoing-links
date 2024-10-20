import { App, ButtonComponent, PluginSettingTab, Setting, TextComponent } from "obsidian";
import HierarchicalOutgoingLinksPlugin from "./main";

export class SettingTab extends PluginSettingTab {
    plugin: HierarchicalOutgoingLinksPlugin;
  
    constructor(app: App, plugin: HierarchicalOutgoingLinksPlugin) {
      super(app, plugin);
      this.plugin = plugin;
    }
      
  
    display(): void {
       
      let { containerEl } = this;
  
      containerEl.empty();
      let filterText: TextComponent;
      new Setting(containerEl)
        .setName('Exclude files filter')
        .setDesc('Exclude files that match regular expression')
        .addText((text) =>{
          text
            .setPlaceholder('')
            .setValue(this.plugin.settings.excludeFilesFilter!)
            .onChange(async (value) => {
              this.plugin.settings.excludeFilesFilter = value;
              await this.plugin.saveSettings();
            });
          filterText=text;
      });
      new Setting(containerEl)
        .setName("Examples")
        .setDesc('Common examples to demonstrate using the exclude filter')
        .addButton((excludeImagesButton)=>{
          excludeImagesButton
            .setButtonText("Exclude Images")
            .onClick(async (e)=>{
              await this.setExcludeFilterValue(filterText,"\\.png");
            });
        })
        .addButton((excludePdfButton) =>{
          excludePdfButton
            .setButtonText("Exclude PDFs")
            .onClick(async (e)=>{
              await this.setExcludeFilterValue(filterText,"\\.pdf");
            });
        });

  

    }
    async setExcludeFilterValue(filterText: TextComponent, val: string){
      filterText.setValue(val);
      this.plugin.settings.excludeFilesFilter = val;
      await this.plugin.saveSettings();
    }
  }