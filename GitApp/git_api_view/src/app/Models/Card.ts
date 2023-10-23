
export class card{
    constructor(urlImage:string,fullName:string,subscribe:string,topics:[],starCount:number,lastUpdate:string,language:string){

        this.urlImage = urlImage,
        this.fullName = fullName,
        this.subscribe = subscribe,
        this.topics = topics,
        this.starCount = starCount,
        this.lastUpdate = lastUpdate,
        this.Language = language
    }
    
    urlImage:string = ""
    fullName:string = "";
    subscribe:string = "";
    Language:string = "";
    topics:any = [];
    starCount:Number = 0
    lastUpdate:string = ""
}