(function(){
    let dots = document.querySelector('.dots-sliders');
    let quantidadeDepoimentos = document.querySelectorAll('.section-depoimentos .depoimentos article');
    
    criandoPontos();
    function criandoPontos(){
        for(let i = 0; i < quantidadeDepoimentos.length; i++){
            let span = document.createElement('span');
            span.id = i;
            span.className = 'dot-slider';
            dots.appendChild(span);
        }
    }
    
    addClass();
    function addClass(){
        let quantidadePontos = document.querySelectorAll('.dots-sliders span'); 
        
        for(let c = 0; c <= quantidadeDepoimentos.length; c++){
            if(c == 0){
                quantidadePontos[c].className += " depoimentoAtual";
            }
        }
    
    }
    
   

    acao();
    function acao(){
        let interval = 0;
        
        let quantidadeDepoimentos = document.querySelectorAll('.section-depoimentos .depoimentos article');
        let quantidadePontos = document.querySelectorAll('.dots-sliders span');
        setInterval(function(){
      
            
            document.querySelector('.active').classList.remove('active');
            document.querySelector('.depoimentoAtual').classList.remove('depoimentoAtual');
        
            quantidadeDepoimentos[interval].className += ' active';
            quantidadePontos[interval].className += ' depoimentoAtual';
        
            interval ++;
            if(interval >= quantidadeDepoimentos.length){
                interval = 0;
            }
        }, 5000);

        // Quando clicar no slider
        for(let u = 0; u <= quantidadeDepoimentos.length; u++){

            quantidadePontos[u].addEventListener('click', (e) => {

                interval = u;

                document.querySelector('.active').classList.remove('active');
                document.querySelector('.depoimentoAtual').classList.remove('depoimentoAtual');
                
                    quantidadeDepoimentos[u].classList.add('active');
                    quantidadePontos[u].classList.add('depoimentoAtual');

            })
        } 
    }
    
})();




