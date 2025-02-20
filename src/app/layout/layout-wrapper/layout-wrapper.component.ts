import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule,} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-wrapper',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatMenuModule,
    MatSidenavModule, 
    MatButtonModule,
    RouterOutlet,
  ],
  templateUrl: './layout-wrapper.component.html',
  styleUrl: './layout-wrapper.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutWrapperComponent {
  showFiller = false;
  
}



