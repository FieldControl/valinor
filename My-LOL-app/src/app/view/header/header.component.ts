import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private router: Router) {
  }

  ngOnInit(): void {
  }

  public url: string | undefined

  ngAfterContentChecked(): void {
    this.url = this.router.url
    if (this.url.includes('/skins')) {
      this.imgSrcChampion = '../../../assets/images/championDefault.webp'
      this.imgSrcSkin = '../../../assets/images/skin.webp'
    } else {
      this.imgSrcChampion = '../../../assets/images/champion.webp'
      this.imgSrcSkin = '../../../assets/images/skinDefault.png'
    }
    console.log(this.url == '/champion')
  }

  imgSrcChampion = '../../../assets/images/championDefault.webp'
  imgSrcSkin = '../../../assets/images/skinDefault.png'
}
