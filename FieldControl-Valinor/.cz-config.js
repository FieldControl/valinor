
module.exports = {
    types: [
      { value: 'feat', name: 'feat:     Adicionar uma nova funcionalidade' },
      { value: 'fix', name: 'fix:      Corrigir um bug' },
      { value: 'docs', name: 'docs:     Atualizar a documentação' },
      { value: 'style', name: 'style:    Fazer alterações de formatação (espaço, formatação, etc.)' },
      { value: 'refactor', name: 'refactor: Refatorar o código (não corrige bugs nem adiciona funcionalidades)' },
      { value: 'perf', name: 'perf:     Melhorar o desempenho' },
      { value: 'test', name: 'test:     Adicionar ou atualizar testes' },
      { value: 'chore', name: 'chore:    Alterações na construção ou em ferramentas auxiliares' },
      { value: 'revert', name: 'revert:   Reverter para uma versão anterior' }
    ],
    allowBreakingChanges: ['feat', 'fix'], // Permite mudanças que podem quebrar o projeto (feature ou bugfix)
    allowCustomScopes: true, // Permite o uso de escopos personalizados
    skipQuestions: ['footer'], // Pule a pergunta sobre o rodapé do commit
    scopes: [], // Escopos personalizados (exemplo: ['frontend', 'backend'])
    allowTicketNumber: false, // Permite adicionar números de ticket
    isTicketNumberRequired: false, // Exige números de ticket
    ticketNumberPrefix: 'TICKET-', // Prefixo para números de ticket
  };