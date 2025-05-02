import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { MatButtonModule,} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-layout-wrapper',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule, 
    MatMenuModule,
    MatSidenavModule, 
    MatButtonModule,
    RouterOutlet,
    MatTabsModule,
  ],
  templateUrl: './layout-wrapper.component.html',
  styleUrl: './layout-wrapper.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutWrapperComponent {
  showFiller = false;
  tabs = signal<any>([
    { key: 'active', label: 'កំពុងបញ្ចាំ'},
    { key: 'inactive', label: 'បញ្ចប់ការបញ្ចាំ'}
  ])
}



