import {Component, Input, OnInit} from '@angular/core';
import {CommonModule, CurrencyPipe, DatePipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatGridListModule} from '@angular/material/grid-list';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { GetTimeAgoPipe, DatedPipe } from '../../shared/pipes/customs.pipe';

interface Transaction {
  item: string;
  cost: number;
}

interface PawnItem {
  full_name: string;
  gender: string;
  phone_number: string;
  address: string;
  pawn_type: string;
  price_pawn: number;
  price_interest: number;
}

@Component({
  selector: 'app-report',
  imports: [
    MatGridListModule,
    MatTableModule, 
    CurrencyPipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatTabsModule,
    MatCardModule,
    MatDialogModule,
    CommonModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    MatTooltipModule,
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})

  export class ReportComponent implements OnInit {
    @Input() data: PawnItem[] = [];
    @Input() displayedColumns: string[] = ['full_name', 'gender', 'phone_number', 'address', 'pawn_type', 'price_pawn', 'price_interest'];
  
    ngOnInit(): void {
   
    }
  
    ngOnChanges(): void {
 
    }

  }

