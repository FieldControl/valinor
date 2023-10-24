
export class card{
    constructor(urlImage:string,fullName:string,subscribe:string,topics:[],starCount:number,lastUpdate:string,language:string){

        this.urlImage = urlImage,
        this.starCount = starCount,
        this.lastUpdate = lastUpdate == null ? "":lastUpdate.substring(0,10),
        this.Language = language
        this.reduceName(fullName);
       this.reduceTopics(topics) 
        this.reduceSubscribe(subscribe);
    }
    
    urlImage:string = ""
    fullName:string = "";
    subscribe:string = "";
    Language:string = "";
    topics:any = [];
    topicsHidden:any = [];
    starCount:Number = 0
    lastUpdate:string = ""


    private reduceSubscribe(subscribes:string){
        if(subscribes == undefined || subscribes.length <= 0 ) return;

        for (let letra = 0; letra < subscribes.length; letra++) {
            if(letra < 135){
                this.subscribe += subscribes[letra]
            }else if(letra < 138){
                this.subscribe += "."
            }
            
        }
    }
    private reduceTopics(topics:[]){
        if(topics == undefined || topics.length <= 0) return;
      for (let topic = 0; topic < topics.length; topic++) {
        
        if(topic < 3){
            this.topics.push(topics[topic])
        }
        this.topicsHidden.push(topics[topic])
      }
    }
   private reduceName(name:string){
    
    for (let letra = 0; letra < name.length; letra++) {
        if(letra < 13){
            this.fullName += name[letra]
        }else if(letra < 16){
            this.fullName += "."
        }
        
    }
        
    }
}