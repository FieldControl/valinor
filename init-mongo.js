// Script para inicializar o MongoDB com dados de exemplo
db = db.getSiblingDB('colunas_db');

// Criar coleção de colunas com dados iniciais
db.colunas.insertMany([
    {
        nome: 'ID',
        tipo: 'ObjectId',
        obrigatorio: true,
        descricao: 'Identificador único',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nome: 'Nome',
        tipo: 'String',
        obrigatorio: true,
        descricao: 'Nome da coluna',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nome: 'Tipo',
        tipo: 'String',
        obrigatorio: true,
        descricao: 'Tipo de dados da coluna',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nome: 'Obrigatório',
        tipo: 'Boolean',
        obrigatorio: false,
        descricao: 'Indica se a coluna é obrigatória',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        nome: 'Descrição',
        tipo: 'String',
        obrigatorio: false,
        descricao: 'Descrição da coluna',
        createdAt: new Date(),
        updatedAt: new Date()
    }
]);

print('✅ Banco de dados inicializado com dados de exemplo!');