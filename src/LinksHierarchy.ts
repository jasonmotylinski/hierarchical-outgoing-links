export class LinksHierarchy{
    private links: Record<string, number>;
    constructor(links: Record<string, number>){
        this.links=links;
    }

    getHierarchy(){
        let result :any[] = [];
        let level = {result};
        for(const path in this.links){
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