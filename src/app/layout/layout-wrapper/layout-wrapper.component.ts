import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { MatButtonModule,} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { PawncardComponent } from '../../shared/pawncard/pawncard.component';
import { PawnFormComponent } from '../../components/pawn-form/pawn-form.component';

@Component({
  selector: 'app-layout-wrapper',
  standalone: true,
  imports: [
    MatButtonModule, 
    MatMenuModule,
    MatSidenavModule, 
    MatButtonModule,
    RouterOutlet,
    MatTabsModule,
    PawncardComponent,
    PawnFormComponent,
  ],
  templateUrl: './layout-wrapper.component.html',
  styleUrl: './layout-wrapper.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutWrapperComponent {
  testItems = signal<any[]>([
    {picture:"",id:"",name:"",phone:"",item:"",}
  ])
  showFiller = false;
  
}



