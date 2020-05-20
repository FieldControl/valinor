window.addEventListener('load', function(){

  let input = document.querySelector('#search');

  // buscar 1s após o usuário parar de digitar
  let tempo = null;
  input.addEventListener('keyup', function (e) {
    let container = document.querySelector('.container-resultado');
    container.innerHTML = '';
    let containerPages = document.querySelector('.pagination');
    containerPages.innerHTML = '';
    clearTimeout(tempo);
    tempo = setTimeout(function () {
      document.querySelector('.fade').classList.add('showfade');
      requestGithub(input.value, 1);
    }, 1000)
  });

  //request api github
  function requestGithub(termo, pagina) {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', 'https://api.github.com/search/repositories?q='+termo+'&page='+pagina+'&per_page=10');
    xhr.send();

    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200){
        var resposta = JSON.parse(xhr.responseText);
        document.querySelector('.fade').classList.remove('showfade');
        renderResults(resposta);
        renderPaginacao(resposta, pagina);
      }
    }
  }

  //renderizar resultados
  function renderResults(resposta, pagina){
    document.querySelector('#buscaPor').innerText = document.querySelector('#search').value;
    document.querySelector('#numResultados').innerText = resposta.total_count;

    let container = document.querySelector('.container-resultado');
    container.innerHTML = '';

    for(item of resposta.items){
      let row = document.createElement('div');
      row.setAttribute('class', 'row');
      container.appendChild(row);

      let lastRow = document.querySelector('.container-resultado .row:last-child');
      let licence = (item.license) ? item.license.name : '';

      lastRow.innerHTML ='<div class="col s12">'+
          '<div class="card">'+
            '<div class="card-content">'+
              '<a href="'+item.html_url+'"><span class="card-title">'+item.full_name+'</span></a>'+
              '<p>'+item.description+'</p>'+
            '</div>'+
            '<div class="card-action">'+
              '<span><span class="material-icons">star</span>'+item.stargazers_count+'</span>'+
              //'<span><span class="material-icons">visibility</span>'+item.watchers_count+'</span>'+
              '<span>Linguagem: '+item.language+'</span>'+
              '<span>Licença: '+licence+'</span>'+
              '<span>Issues: '+item.open_issues+'</span>'+
            '</div>'+
          '</div>'+
        '</div>';
    }
  }

  //limpar busca
  document.querySelector('#clearSearch').addEventListener('click', function() {
    let containerPages = document.querySelector('.pagination');
    containerPages.innerHTML = '';
    document.querySelector('#search').value = '';
    document.querySelector('.container-resultado').innerHTML = '';
    document.querySelector('#buscaPor').innerText = '';
    document.querySelector('#numResultados').innerText = '';
  });

  //renderizar paginação
  function renderPaginacao(resposta, pagina){
    pagina = parseInt(pagina);
    let pages = Math.ceil(resposta.total_count/10);
    pages = (pages < 100) ? pages : 100;

    let containerPages = document.querySelector('.pagination');
    containerPages.innerHTML = '';

    for(var i = 1; i <= pages; i++){
      //escreve somente as primeiras páginas, as próximas à atual e as últimas
      if(i < 3 || (i >= pagina-2 && i <= pagina+2) || i > pages-2){
        var active = (i == pagina) ? 'active' : 'waves-effect';
        let pageItem = document.createElement('li');
        pageItem.setAttribute('class', active);

        let pageLink = document.createElement('a');
        pageLink.setAttribute('data-target', i);

        let pageNumber = document.createTextNode(i);
        pageLink.appendChild(pageNumber)
        pageItem.appendChild(pageLink);
        containerPages.appendChild(pageItem);
      }
      else{
        if(!document.querySelector('.pagination li:last-child').classList.contains('gap')){
          let pageGap = document.createElement('li');
          pageGap.setAttribute('class', 'gap');
          let pageGapTxt = document.createTextNode('...');
          pageGap.appendChild(pageGapTxt);
          containerPages.appendChild(pageGap);
        }
      }
    }

    //click paginação
    let pageLinks = document.querySelectorAll('.pagination li a');
    for (link of pageLinks){
      link.addEventListener('click', function(e){
        e.preventDefault();
        requestGithub(input.value, this.dataset.target);
      });
    }
  }

})
