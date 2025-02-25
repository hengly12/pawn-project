import { routes } from './../../app.routes';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { assets } from '../../shared/services/mapping.service';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatBadgeModule} from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog'
import { AlertComponent } from '../../shared/pages/alert/alert.component';
import { result } from 'lodash';
import { AuthStore } from '../../auth/auth.store';
import {MatTabsModule} from '@angular/material/tabs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule, 
    MatMenuModule, 
    MatIconModule,
    MatBadgeModule,
    MatTabsModule,
    RouterLinkActive
  ],
  templateUrl: './main-header.component.html',

  
  styleUrl: './main-header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainHeaderComponent {
  // logo = signal<any>(assets('images/pawn-logo.jpg'))
  // profileIcon = signal<any>(assets('images/one-punch.jpg'))
  constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private router: Router
  ){}
  
  signOut(){
    const dialogRef = this.dialog.open(AlertComponent, {
      data: {
        title: 'Sign Out!',
        description: 'Do You Want To Sign Out?'
      },
      width: '350px',
      role: 'dialog',
      panelClass: 'custom-dialog'
    })

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.auth?.signOut();
      }
    })
  }
}

