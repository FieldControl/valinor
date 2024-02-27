const perPageSearch = 5; // Resultados totais exibidos em cada página
let currentPageSearch = 1; // Página inicial na busca
let currentSearchTerm = ''; // Termo de pesquisa atual

function buscarRepositorios(event) {
    event.preventDefault(); // Evita o envio padrão do formulário
    
    const termoPesquisa = document.getElementById('search_repo').value;
      if (termoPesquisa !== currentSearchTerm) {
            // Caso o termo de pesquisa seja alterado, retornará para o primeiro elemento da paginação
        currentPageSearch = 1;
        currentSearchTerm = termoPesquisa;
    }
    const apiUrl=`https://api.github.com/search/repositories?q=${termoPesquisa}&sort=stars&order=desc&per_page=${perPageSearch}&page=${currentPageSearch}`;
    
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const reposList = document.getElementById('repos-list');
            reposList.innerHTML = ''; // Limpa a lista antes de adicionar novos itens
            data.items.forEach(repo => {
                const repoItem = document.createElement('div');
                    
                //Sanitização de dados antes da interpretação pelo navegador (Evitar XSS)//
                    const SanitizedRepoName = document.createTextNode(repo.full_name);
                    const SanitizedDescription= document.createTextNode(repo.description);
                    const SanitizedStars= document.createTextNode(repo.stargazers_count);
                    const SanitizedWatchers= document.createTextNode(repo.wachers_count);
                    const SanitizedForks= document.createTextNode(repo.forks_count);
                    const SanitizedIssues= document.createTextNode(repo.open_issues_count);
                    const SanitizedUrl=document.createTextNode(repo.html_url);
    
                repoItem.innerHTML = `
                 
                    <a href="${SanitizedUrl.nodeValue}" style="color:rgb(0, 132, 255)" target="_blank"><strong>"${SanitizedRepoName.nodeValue}"</strong></a><br>
                    <span style="color:white">🌟Stars: "${SanitizedStars.nodeValue}" | 👀Watchers: "${SanitizedWatchers.nodeValue}"</span><br>
                    <span style="color:white">📋Forks: "${SanitizedForks.nodeValue}" | 🚨Issues: "${SanitizedIssues.nodeValue}"</span><br>
                    <span style="color:white">💾Descrição: "${SanitizedDescription.nodeValue}" <br>
                    <hr>
                `;
                reposList.appendChild(repoItem);
            });
    
         // Adicione a funcionalidade de paginação simplificada
         createPaginationButtonsSearch(data.total_count);
        })
        .catch(error => console.error('Erro ao obter dados da API:', error));
}

function createPaginationButtonsSearch(totalItems) {
    const paginationContainer = document.getElementById('pagination-search');
    paginationContainer.innerHTML = '';

    const backButton = document.createElement('button');
    backButton.innerText = 'Anterior';
    backButton.addEventListener('click', () => changePageSearch(currentPageSearch - 1));
    backButton.disabled = currentPageSearch === 1; // Desabilita o botão caso esteja na primeira página
    paginationContainer.appendChild(backButton);

    const currentPageButton = document.createElement('button');
    currentPageButton.innerText = currentPageSearch.toString();
    currentPageButton.addEventListener('click', () => {}); // Pode adicionar ação adicional se necessário
    currentPageButton.classList.add('active');
    paginationContainer.appendChild(currentPageButton);

    const nextButton = document.createElement('button');
    nextButton.innerText = 'Próximo';
    nextButton.addEventListener('click', () => changePageSearch(currentPageSearch + 1));
    nextButton.disabled = (currentPageSearch * perPageSearch) >= totalItems; // Desabilita o botão caso esteja na última página
    paginationContainer.appendChild(nextButton);
}

function changePageSearch(page) {
    currentPageSearch = Math.max(1, page); // Impede que a página seja menor que 1 
    buscarRepositorios(new Event('submit'));
}

// Inicialização: buscar e exibir os repositórios da primeira página
buscarRepositorios(new Event('submit'));
