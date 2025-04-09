import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../shared/pages/alert/alert.component';
import { AuthStore } from '../../auth/auth.store';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    RouterLinkActive,
    MatProgressBarModule
  ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainHeaderComponent {
  constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private router: Router
  ) {}

  signOut() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: {
        title: 'Sign Out!',
        description: 'Do You Want To Sign Out?'
      },
      width: '350px',
      role: 'dialog',
      panelClass: 'custom-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.auth.signOut();
      }
    });
  }
}