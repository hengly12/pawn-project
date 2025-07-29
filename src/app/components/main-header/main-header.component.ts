import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
  signal,
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
import { CommonModule } from '@angular/common';

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
    // RouterLinkActive,
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
  private store = inject(PawnStore);
  unreadNotificationCount = signal<number>(0);
  expiredItems: Customer[] = [];
  auth = inject(AuthStore);

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit(): void {
    this.subscriptions.add(
      interval(60 * 60 * 1000).subscribe(() => {
        // this.checkExpiredItems();
      })
    );

    this.subscriptions.add(
      from(this.store.getCustomerDemo())
        .pipe(switchMap((observable) => observable || of([])))
        .subscribe((data) => {
          // this.checkExpiredItems(data);
        })
    );
  }

  // checkExpiredItems(data?: Customer[]): void {
  //   const today = new Date();
  //   const expired = (data || []).filter(item => {
  //     const expiredDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
  //     return expiredDate && expiredDate < today;
  //   });
  //   this.expiredItems = expired;
  //   this.unreadNotificationCount.set(expired.length);
  // }

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
