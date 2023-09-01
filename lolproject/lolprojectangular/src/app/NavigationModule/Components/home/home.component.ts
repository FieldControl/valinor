import { Component, ElementRef, HostListener, AfterViewInit, ViewChild } from '@angular/core';

@Component({
  selector: '../home',
  templateUrl: '../home/home.component.html',
  styleUrls: ['../home/home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('myVideoHome') videoElement!: ElementRef;
  isActive = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.isActive = true;
  }

  constructor() {}

  ngAfterViewInit(): void {
    this.playVideo();
  }

  playVideo() {
    const video: HTMLVideoElement = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
    }
  }
}
