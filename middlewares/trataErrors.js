
/**
 * Função responsável por pegar todas as exceptions que forem lançadas das funções 
 * e repassar para o express, evitando assim o uso de try{} catch{} em cada função do controller.
 */
exports.getErrors = (fn) => {
    return function(req, res, next){
        return fn(req, res, next).catch(next);
    }
}