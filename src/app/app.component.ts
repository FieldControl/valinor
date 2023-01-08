import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { PostService } from './services/post.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'projeto';
  items: any;

  constructor(private service: PostService) { }

  ngOnInit() {
    this.getPosts();
  };

  getPosts() {
    this.service.getPosts()
    .subscribe(items => {
      this.items = items;
      console.log(this.items);
    });
  }

}
