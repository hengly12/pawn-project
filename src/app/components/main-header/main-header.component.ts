import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  signal,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { AlertComponent } from '../../shared/pages/alert/alert.component';
import { AuthStore } from '../../auth/auth.store';
import { MatTabsModule } from '@angular/material/tabs';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterModule,
} from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription, interval, of, switchMap, from } from 'rxjs';
import { PawnStore } from '../../shared/store/pawn.store';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ExpiredPawnDialogComponent } from '../expired-pawn-dialog/expired-pawn-dialog.component';

interface Customer {
  full_name: string;
  phone_number: string;
  address: string;
  price_pawn: number;
  price_interest: number;
  created_at?: any;
  gender?: any;
  pawn_type?: any;
  pawnKey: string;
  pawnCount: number;
  date_expired?: any;
  [key: string]: any;
}
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
    MatProgressBarModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MainHeaderComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  auth = inject(AuthStore);
  public store = inject(PawnStore);
  
  constructor(private dialog: MatDialog, private router: Router) {}
  
  ngOnInit(): void {
    // Check for expired items on initial load
    this.store.checkExpiredItems();

    // Hourly check for expired items
    this.subscriptions.add(
      interval(60 * 60 * 1000).subscribe(() => {
        this.store.checkExpiredItems();
      })
    );
  }

  showExpiredItems(): void {
    this.store.getExpiredPawnItems().then(items => {
      // Format the data before passing it to the dialog
      const formattedItems = items.map(item => ({
        ...item,
        // Check if pawn_type is an object and get its name, otherwise use the value directly
        pawn_type: item.pawn_type?.name || item.pawn_type,
        // Convert Firestore Timestamp to a JavaScript Date object
        date_expired: item.date_expired?.toDate ? item.date_expired.toDate() : item.date_expired
      }));

      this.dialog.open(ExpiredPawnDialogComponent, {
        width: '400px',
        position: { right: '85px', top: '80px' },
        data: formattedItems,
      });
    });
  }

  signOut() {
    const dialogRef = this.dialog.open(AlertComponent, {
      data: {
        title: 'ចាកចេញពីគណនី!',
        description: 'តើអ្នកចង់ចាកចេញពីគណនីទេ?',
      },
      role: 'dialog',
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.auth.signOut();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
