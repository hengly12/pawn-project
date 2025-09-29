import { Component, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

export interface Customer {
  full_name: string;
  phone_number: string;
  address: string;
  price_pawn: number;
  price_interest: number;
  created_at?: any;
  gender?: any;
  pawn_type?: { name?: string, text?: string };
  pawnKey: string;
  pawnCount: number;
  date_expired?: any;
  isExpired?: boolean;
  displayPawnType?: string;
  key: string;
}


@Component({
  selector: 'app-expired-pawn-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, CommonModule, DatePipe],
  templateUrl: './expired-pawn-dialog.component.html',
  styleUrls: ['./expired-pawn-dialog.component.scss'],
})
export class ExpiredPawnDialogComponent implements OnInit {
  today = new Date();
  formLoading: boolean = false;
  selectedKey: string | undefined;
  param = signal<any>(null);
  routeUnSubscribe = signal<any>(Subscription);
  
  constructor(
    public dialogRef: MatDialogRef<ExpiredPawnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Customer[],
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.length > 0) {
      this.data.forEach(item => {
        const expiredDate = item.date_expired?.toDate ? item.date_expired.toDate() : new Date(item.date_expired);
        item.isExpired = expiredDate < this.today;
        
        if (item.pawn_type) {
          item.displayPawnType = item.pawn_type.name || item.pawn_type.text || 'N/A';
        } else {
          item.displayPawnType = 'N/A';
        }
      });
    }
  }

onCustomerSelect(key: string) {
  this.formLoading = true;
  this.selectedKey = key;
  this.router.navigate([`/home/${this.param()}/listing/create-form/${key}`])
    .then(() => {
      this.dialogRef.close(key);
    })
    .catch(error => {
      console.error('Navigation failed:', error);
    })
    .finally(() => {
      this.formLoading = false;
    });
}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
