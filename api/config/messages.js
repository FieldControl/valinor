
const messages = {
    CAST_ERROR: 'Cast to ObjectId failed for value "5c9" at path "_id" for model "Filmes"',
    FILME_DATA_MAX: 'Apenas filmes já lançados são aceitos.',
    FILME_DATA_MIN: 'O filme não pode ser anterior ao mais antigo catalogado.',
    FILME_DATA_OBRIGATORIO: 'Data de lançamento do filme deve ser fornecido.',
    FILME_GENERO_OBRIGATORIO: 'Gênero do filme deve ser fornecido.',
    FILME_INSERIDO: 'Inserido novo filme.',
    FILME_NOME_OBRIGATORIO: 'Nome do filme deve ser fornecido.',
    FILME_PAIS_OBRIGATORIO: 'País de origem do filme deve ser fornecido.',
    PAGINA_NAO_EXISTE: 'A pagina solicitada não existe'
};

messages.FILME_NAO_ENCONTRADO = (id) => {return `Filme com id ${id} não encontrado.`}
messages.FILME_ATUALIZADO = (id) => {return `Filme com id ${id} atualizado.`}
messages.FILME_DELETADO = (id) => {return `Filme com id ${id} deletado com sucesso.`}

module.exports = messages;