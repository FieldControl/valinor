function slide(){
    var intervalo = 0;
        var maxSlide = document.querySelectorAll('.slide').length -1;
            setInterval(function(){
                var slide = document.querySelectorAll('.boxSlide');
                    slide[intervalo].style.display = "none";
                    intervalo++;
                        if(intervalo > maxSlide){
                            intervalo = 0
                        }
                    slide[intervalo].style.display = "flex"
            }, 3000)
}

slide()


function menu(){
    var hamburguer = document.querySelector('.hamburguer');
        hamburguer.addEventListener("click", function(){
            var menu = document.querySelector('.menu');
                if(menu.className === "menu"){
                    menu.className += " menuMobile";
                    hamburguer.style.right = "-85px"
                }else{
                    menu.className = "menu"
                    hamburguer.style.right = "0"
                }
        })
}

menu()