import { PluginSettings, TreeNode } from "./types";

export class LinksHierarchy{
    private links: Record<string, number>;
    private settings: PluginSettings;
    constructor(links: Record<string, number>, settings: PluginSettings){
        this.links=links;
        this.settings=settings;
    }

    getFilteredLinks(){
      if(this.settings.excludeFilesFilter){
        try{
          const regex = new RegExp(this.settings.excludeFilesFilter);
          const notMatches: Record<string, number>={};
          
          for(const key in this.links)
          {
            if(!regex.test(key)){
              notMatches[key]=this.links[key];
            }
          }
          return notMatches;
        }catch(error){
          return this.links;
        }
      }else{
        return this.links;
      }
    }
    getHierarchy(): TreeNode[] {
        // Accumulator type for building the tree hierarchy
        type LevelAccumulator = { result: TreeNode[]; [key: string]: LevelAccumulator | TreeNode[] };

        const result: TreeNode[] = [];
        const level: LevelAccumulator = { result };
        for(const path in this.getFilteredLinks()){
            path.split('/').reduce((r: LevelAccumulator, name: string) => {
              if(!r[name]) {
                r[name] = {result: []};
                const child = r[name] as LevelAccumulator;
                r.result.push({name, count: this.links[path], children: child.result})
              }

              return r[name] as LevelAccumulator;
            }, level)
          }
        return result;
    }
}