class Tarefas{
    _titulo
    _descricao
    _etapas
    _status
    constructor(titulo, descricao, etapas, status){
        this._titulo = titulo;
        this._descricao = descricao;
        this._etapas = etapas;
        this._status = status;
    }
    get titulo(){
        return this._titulo
    }
    set titulo(titulo) {
        if(typeof titulo == "string"){
            this._titulo = titulo;
        }
    }
    get descricao(){
        return this._descricao
    }
    set descricao(descricao){
        if(typeof descricao == 'string'){
            this._descricao = descricao;
        }
    }
    get etapa(){
        return this._etapas
    }
    set etapa(etapas){
        if (Array.isArray(etapas)){
            this._etapas = etapas;
        }
    }
    addEtapas(etapaNova){
        this._etapas.push(etapaNova)
    }
    
} 
