import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})

export class FooterComponent implements OnInit {
  title = 'Valinor';

  ngOnInit(): void {
    
  }
}
