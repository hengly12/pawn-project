import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from '../../components/main-header/main-header.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    MainHeaderComponent,
    RouterOutlet
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {}
