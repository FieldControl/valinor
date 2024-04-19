import TarefaRepository from '../repositories/TarefaRepository.js'

class TarefaController{

    async index(req, res){
        const result = await TarefaRepository.findAll()
        res.json(result)
    }

    async show(req, res){
        const estado = req.params.estado
        const result = await TarefaRepository.findByEstado(estado)
        res.json(result)
    }
    
    async store(req, res){
        const tarefas = req.body
        const result = await TarefaRepository.create(tarefas)
        res.json(result)
    }
    
    async update(req, res){
        const id = req.params.id
        const tarefas = req.body
        const result = await TarefaRepository.update(tarefas, id)
        res.json(result)
    }
    async delete(req, res){
        const id = req.params.id
        const result = await TarefaRepository.delete(id)
        res.json(result)
    }
}

export default new TarefaController
