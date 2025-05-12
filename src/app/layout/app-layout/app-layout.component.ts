import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from '../../components/main-header/main-header.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    MainHeaderComponent,
    RouterOutlet,
    MatProgressSpinnerModule,

],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {}
