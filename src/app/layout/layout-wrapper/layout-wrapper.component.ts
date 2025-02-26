import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { MatButtonModule,} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PawncardComponent } from '../../shared/pawncard/pawncard.component';
import { PawnFormComponent } from '../../components/pawn-form/pawn-form.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';

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
    PawnFormComponent,
    RouterLink,
    RouterLinkActive,
    
  ],
  templateUrl: './layout-wrapper.component.html',
  styleUrl: './layout-wrapper.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutWrapperComponent {
  testItems = signal<any[]>([
    {picture:"",id:"",name:"",phone:"",item:"",gender:""}
  ])
  showFiller = false;
  tabs = signal<any>([
    { key: 'active', label: 'កំពុងបញ្ចាំ'},
    { key: 'inactive', label: 'បញ្ចប់ការបញ្ចាំ'}
  ])
}



