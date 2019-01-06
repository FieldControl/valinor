const descricao = 'est_descricao';
const telefone = 'est_telefone';
/**
 * Método responsável por realizar a sanitização das propriedades do recurso que serão 
 * salvas/atualizadas posteriormente.
 */
exports.validaDados = (req, res, next) => {
    req.sanitizeBody('est_nome');
    req.sanitizeBody('est_endereco');
    req.sanitizeBody('est_telefone');

    req.checkBody('est_nome', 'Deve ser fornecido um nome').notEmpty().isString().trim().escape();
    req.checkBody('est_endereco', 'Deve ser fornecido um endereço').notEmpty().trim().escape();
    req.checkBody('est_telefone', 'Deve ser fornecido um telefone').notEmpty().trim().escape().isLength({ min: 10, max:11 });

    if(req.body.est_descricao){
        req.sanitizeBody('est_descricao');
        req.checkBody('est_descricao').isString().trim().escape();
    }

    const error = req.validationErrors();

    if(error){
        res.status(500).json(error);
        return;
    }

    next();
};

/**
 * Pelo fato do PATCH ter apenas parte(s) do recurso, foi implementado um método de sanitização específico.
 */
exports.validaDadosPatch = (req, res, next) => {
    for(let propriedade in req.body){
        req.sanitizeBody(propriedade);

        if(propriedade === descricao){
            req.checkBody(propriedade, `${propriedade} deve ser informada`).isString().trim().escape();
        }
        else if(propriedade === telefone){
            req.checkBody(propriedade, `${propriedade} deve ser informada`).notEmpty().trim().escape().isLength({ min: 10, max:11 });
        }
        else{
            req.checkBody(propriedade, `${propriedade} deve ser informada`).notEmpty().trim().escape();
        }
    }

    const error = req.validationErrors();

    if(error){
        res.status(500).json(error);
        return;
    }

    next();
}
