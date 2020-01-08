import { Component, OnInit } from '@angular/core';
import { HttpClient , HttpHeaders } from '@angular/common/http';
import {Router, ActivatedRoute} from '@angular/router';
import Swal from 'sweetalert2';
 

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {

	movieList;
	generosList;
	page = 1;  
	pages = [];
	totalPages;
	totalMovies;
	carregando = true;
	tipo = 0;
 
	constructor(private http: HttpClient,  private router: Router, private route: ActivatedRoute ) { }

	trocarTipo(){ 
		localStorage.setItem('tipo', this.tipo.toString());
  		this.carregarFilmes(this.formatarUrl());
	}


	formatarData(data){		
		let arrayData = data.split('-');
		return arrayData[2] + '/' +arrayData[1] + '/' + arrayData[0];
	}

	formatarNota(nota){

		if (nota > 0 && nota <2 ) {
			return '<i class="fa fa-star"></i>' + nota; 			
		}
		else if (nota >=2 && nota <3) {
			return '<i class="fa fa-star"></i> <i class="fa fa-star"></i> ' + nota; 			
		}
		else if (nota >=3 && nota <4) {
			return '<i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i> ' + nota; 			
		}
		else if (nota >=4 && nota <5) {
			return '<i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i> ' + nota; 			
		}	
		else if (nota >=5 && nota <6) {
			return '<i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i> ' + nota; 			
		}
		else if (nota >=6 && nota <7) {
			return '<i class="fa fa-star"></i>   <i class="fa fa-star"></i>   <i class="fa fa-star"></i>  <i class="fa fa-star"></i>   <i class="fa fa-star"></i>'+ 
					'<i class="fa fa-star"></i> ' + nota; 			
		}
		else if (nota >=7 && nota <8) {
			return '<i class="fa fa-star"></i> <i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i>  <i class="fa fa-star"></i>'
					+ '<i class="fa fa-star"></i>'+ '<i class="fa fa-star"></i> ' + nota; 			
		}				
		else if (nota >=8 && nota <9) {
			return '<i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i>'
			+ '<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i> ' + nota; 			
		}
		else if (nota >=9 && nota <10) {
			return '<i class="fa fa-star"></i>  <i class="fa fa-star"></i>   <i class="fa fa-star"></i>  <i class="fa fa-star"></i>   <i class="fa fa-star"></i>'
			+ '<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i>'+ '<i class="fa fa-star"></i> ' + nota; 			
		}
		else if (nota ==10) {
			return '<i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i> <i class="fa fa-star"></i>' + 
					'<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i>'+ '<i class="fa fa-star"></i>' + '<i class="fa fa-star"></i> ' + nota; 			
		}				

	}

	formatarGenero(generos){

		let genres = '';

		for (var i1 = generos.length - 1; i1 >= 0; i1--) {

			// console.log(generos[i]); 

			for (var i2 = this.generosList.length - 1; i2 >= 0; i2--) {

				// console.log(this.generosList[i].id); 

				if (this.generosList[i2].id == generos[i1]) {
					// console.log(this.generosList[i2].name); 
					genres = genres + '<span class="badge">' + this.generosList[i2].name + '</span>';					
				}							
			}						
		}

		return genres;
	}


	formatarUrl(){

		let url;

		let tipo = parseInt(localStorage.getItem('tipo')); 

		if (tipo) {

			this.tipo = tipo;
			
	  		if (tipo == 0) {
	  			url = 'https://api.themoviedb.org/3/trending/movie/day?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR&page=';	  			
	  		}
	  		else if (tipo == 1) {
	  			url = 'https://api.themoviedb.org/3/movie/top_rated?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR&page=';	  			
	  		}
	  		else if (tipo == 2) {
	  			url = 'https://api.themoviedb.org/3/movie/popular?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR&page=';	  			
	  		}

		}
		else{

			url = 'https://api.themoviedb.org/3/trending/movie/day?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR&page=';	  			
			localStorage.setItem('tipo', this.tipo.toString());

		}

  		return url;

	}
 

	carregarFilmes(url){

  		this.http.get<any>('https://api.themoviedb.org/3/genre/movie/list?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR').subscribe(Response => {

  			// console.log(Response.genres);	  
  			this.generosList = Response.genres;

			this.route.queryParams.subscribe(params => {

				this.page = + params['page'] || 1;
				localStorage.setItem('page', this.page.toString());

				this.http.get<any>(url + this.page).subscribe(Response => {

					// console.log(Response.results);	    			

					this.movieList = Response.results;

					this.totalPages = Response.total_pages;

					this.totalMovies = Response.total_results + ' filmes em ' + Response.total_pages + ' páginas';   

					let contador;

					if (this.page > 5) {						
						contador = this.page - 5;
					}
					else if (this.page <= 5) {
						contador = 1;
					}
					else{
						contador = this.page;
					}

					for (var i = contador; i <= Response.total_pages; ++i) {

						if (this.pages.length < 10) {
							this.pages.push(i);
						}							

					}				

					this.carregando = false;

				},
				error => {

					if(error.status == 400) {

						console.log(error);

					}

				});

			});
	
		},
		error => {

			if(error.status == 400) {
				console.log(error);
			}

		});

	}

	ngOnInit() {

	  	let token = localStorage.getItem('token');
	  	// console.log(token); 

	  	if (token) { 

	  		this.carregando = true;
	  		this.carregarFilmes(this.formatarUrl()); 		
	  	}
	  	else{
	  		this.router.navigateByUrl('/login');
	  	}

	}


}
