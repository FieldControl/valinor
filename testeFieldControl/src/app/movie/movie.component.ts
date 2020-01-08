import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { HttpClient , HttpHeaders } from '@angular/common/http';
 import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-movie',
  templateUrl: './movie.component.html',
  styleUrls: ['./movie.component.css']
})
export class MovieComponent implements OnInit {

  	public id: string;

  	public titulo: string;

  	public data: string;

  	public trailerNome: string;

  	public nota;

  	public sinopse: string;

  	public imagem = '';

  	public capa = ''; 

  	public duracao; 

  	generos;

  	mostrarTrailer = false;

  	safeSrc: SafeResourceUrl;


  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private sanitizer: DomSanitizer) { 
  	   
  }

	formatarData(data){		
		if (data) {
			let arrayData = data.split('-');
			return arrayData[2] + '/' +arrayData[1] + '/' + arrayData[0];			
		}
		else {
			return '';
		}
		
	}

	trocarTrailer(){

		console.log(this.safeSrc); 

		if (this.safeSrc) {
			this.mostrarTrailer = !this.mostrarTrailer;			
		}
		else{

            Swal.fire({
              title: 'Desculpe!',
              text: 'Não encontramos trailer para esse filme.', 
              icon: 'error',
              confirmButtonText: 'OK'
            });


		}
		
	}

  ngOnInit() {

  	if (this.route.snapshot.paramMap.get('id')) {

  		this.id = this.route.snapshot.paramMap.get('id');

    	// console.log(this.id);  		

  		this.http.get<any>('https://api.themoviedb.org/3/movie/'+ this.id +'?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR').subscribe(Response => {

    		// console.log(Response);	  

    		this.titulo = Response.title;

    		this.sinopse = Response.overview;

    		this.imagem = 'https://image.tmdb.org/t/p/w500/' + Response.poster_path;

    		this.capa = 'https://image.tmdb.org/t/p/w500/' + Response.backdrop_path;

    		this.nota = Response.vote_average;

    		this.duracao = Response.runtime;

    		this.data = Response.release_date;

    		this.generos = Response.genres;

	  		this.http.get<any>('https://api.themoviedb.org/3/movie/'+ this.id +'/videos?api_key=4fbb9771bb253f49d9442d407e92cd28&language=pt-BR').subscribe(Response => {

	  			if (Response.results.length > 0) {

	  				// console.log(Response);	 

	  				for (var i = Response.results.length - 1; i >= 0; i--) {
	  				 	
	  				 	if (Response.results[i].site == 'YouTube') {
	  				 		
	  				 		this.trailerNome = Response.results[i].name;

	  				 		let url = "https://www.youtube.com/embed/" + Response.results[i].key;

							this.safeSrc =  this.sanitizer.bypassSecurityTrustResourceUrl(url); 
	  				 		
	  				 	}
	  				 } 
	  	  				
	  			}
	  			else {
	  				this.safeSrc = null;
	  			}

	    		

	  		},
	  		error => {

	  			if(error.status == 400) {

	  				console.log(error);

	  			}

	  		});








  		},
  		error => {

  			if(error.status == 400) {

  				console.log(error);

  			}

  		});

  	}

  }

 

  back(){

  	this.router.navigate(['/movies'], { queryParams: { page: parseInt(localStorage.getItem('page')) } });   

  }


}
