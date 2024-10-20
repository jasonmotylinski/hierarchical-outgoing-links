import { PluginSettings } from "./types";

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
    getHierarchy(){
        let result :any[] = [];
        let level = {result};
        for(const path in this.getFilteredLinks()){
            path.split('/').reduce((r :any, name :string, i, a) => {
              if(!r[name]) {
                r[name] = {result: []};
                r.result.push({name, count: this.links[path],children: r[name].result})
              }
              
              return r[name];
            }, level)
          }
        return result;
    }
}