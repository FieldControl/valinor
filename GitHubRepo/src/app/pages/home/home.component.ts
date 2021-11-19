import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { AppService } from 'src/app/app.service';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  repositories:any=[]
  repoName:any=''

  constructor( public appService: AppService) { }

  ngOnInit(): void {
  }

   

  getRepositories(){
    
    this.appService.GetRepo(this.repoName,this.pageSize, this.pageIndex).subscribe((data)=>{
      this.repositories=data.items
    })
    console.log(this.repositories)
  }

  length = 100;
  pageSize = 10;
  pageIndex = 1;
  pageSizeOptions = [5, 10, 25];
  showFirstLastButtons = true;

  handlePageEvent(event: PageEvent) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;

    this.appService.GetRepo(this.repoName, this.pageSize, this.pageIndex).subscribe((data)=>{
      this.repositories=data.items
    })
    
    console.log(this.pageIndex)

  }
  
}
