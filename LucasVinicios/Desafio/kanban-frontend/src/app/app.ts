// src/app/app.ts (SEU ARQUIVO DO COMPONENTE RAIZ)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationComponent } from "./notification-component/notification-component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    RouterModule,
    HttpClientModule,
    NotificationComponent
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit {
  title = 'kanban-frontend';
  isAuthenticated$!: Observable<boolean>;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.isAuthenticated();
  }

  onLogout(): void {
    this.authService.logout();
  }
}