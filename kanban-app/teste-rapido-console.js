// 🔍 TESTE RÁPIDO - Cole no console do navegador (F12)

// 1. Verificar se a aplicação está carregada
console.log('🔧 Angular Version:', ng?.version || 'Angular não carregado');

// 2. Testar rota atual
console.log('📍 Rota atual:', window.location.pathname);

// 3. Testar navegação
if (typeof ng !== 'undefined') {
  console.log('🧭 Testando navegação para /diagnostic...');
  window.location.href = '/diagnostic';
}

// 4. Testar API diretamente
console.log('🌐 Testando conexão com API...');
fetch('http://localhost:3000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: `
      query {
        boards {
          id
          name
        }
      }
    `
  })
})
.then(response => {
  console.log('✅ Status da API:', response.status);
  return response.json();
})
.then(data => {
  console.log('📋 Dados recebidos da API:', data);
  if (data.errors) {
    console.error('❌ Erros GraphQL:', data.errors);
  }
  if (data.data?.boards) {
    console.log(`🎯 Encontrados ${data.data.boards.length} boards`);
  }
})
.catch(error => {
  console.error('❌ Erro na API:', error);
  console.log('💡 Verifique se a API está rodando em http://localhost:3000');
});

// 5. Verificar localStorage/sessionStorage
console.log('💾 LocalStorage keys:', Object.keys(localStorage));
console.log('📝 SessionStorage keys:', Object.keys(sessionStorage));

// 6. Verificar se há erros JavaScript
console.log('🚨 Para ver erros JavaScript, vá na aba Console e procure por mensagens em vermelho');

// 7. Instruções de uso
console.log(`
🎯 PRÓXIMOS PASSOS:

1. Se viu "✅ Status da API: 200" - API funcionando
2. Se viu erros, verifique se a API NestJS está rodando
3. Acesse /diagnostic na URL para usar a ferramenta completa
4. Use o botão "🔍 Diagnóstico" no header da aplicação

📋 COMANDOS ÚTEIS:
- npm start (rodar frontend)
- Verificar se API está em http://localhost:3000/graphql
- F12 → Network → ver requisições
- F12 → Console → ver logs e erros
`);

// 8. Auto-navegação para diagnóstico (comentado por segurança)
// setTimeout(() => {
//   if (confirm('Ir para página de diagnóstico?')) {
//     window.location.href = '/diagnostic';
//   }
// }, 3000);
