import { ChangeDetectorRef, Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { GetTimeAgoPipe, DatedPipe } from '../../shared/pipes/customs.pipe';
import { GENDER_DATA, GenderOption, ITEM_DATA, ItemType } from '../../shared/dummy/config';
import { pushToObject } from '../../shared/services/mapping.service';
import { doc, getDoc } from 'firebase/firestore';
import { DataService } from '../../shared/services/data.service';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { MatSnackBar } from '@angular/material/snack-bar'; // Updated import
import { FireStorageService } from '../../shared/services/fire-storage.service';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select'; // Import MatSelectModule

interface Transaction {
  item: string;
  cost: number;
}

interface Customer {
  full_name: string;
  phone_number: string;
  address: string;
  price_pawn: number;
  price_interest: number;
  created_at?: any;
  gender?: any;
  pawn_type?: any;
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
    DatePipe,
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule, // Add MatSelectModule to imports
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  providers: [DatePipe, provideNativeDateAdapter()],
})
export class ReportComponent implements OnInit {
  routeUnSubscribe = signal<any>(Subscription);
  param = signal<any>(null);
  displayUSD = '';
  displayKHR = '';
  genders = signal<any>(GENDER_DATA);
  days_countdown: number | null = null;
  pawn_type = signal<any>(ITEM_DATA);

  @Input() data: Customer[] = [];
  @Input() displayedColumns: string[] = [
    'full_name',
    'gender',
    'phone_number',
    'address',
    'pawn_type',
    'price_pawn',
    'price_interest',
    'created_at',
  ];

  // Datepicker Properties
  selectedDate = new FormControl<Date | null | null>(null);
  filteredData: Customer[] = [];

  // New properties for title and description
  reportTitle = 'Monthly Report';
  reportDescription = 'Displays a summary of transactions for the selected month.';

  // Properties to store the totals
  totalPawnPrice = 0;
  totalInterestPrice = 0;

  // New property for the selected filter
  selectedFilter: string = 'all'; // Default filter value
  filterOptions: string[] = ['all', 'today', 'yesterday', 'thisMonth', 'thisYear'];
  filterControl = new FormControl(this.selectedFilter); // FormControl for the filter

  constructor(
    public dialog: MatDialog,
    private ds: DataService,
    private fb: FormBuilder,
    private auth: AuthStore,
    private store: PawnStore,
    private snackbar: MatSnackBar, // Injected MatSnackBar
    private route: ActivatedRoute,
    private storage: FireStorageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private datePipe: DatePipe,
  ) {}

  isDateMatch(createdAt: any): boolean {
    if (!this.selectedDate.value || !createdAt) {
      return true;
    }
    if (createdAt && createdAt.toDate) {
      const createdAtDate = new Date(
        createdAt.toDate().getFullYear(),
        createdAt.toDate().getMonth(),
        createdAt.toDate().getDate()
      );
      const selectedDateOnly = new Date(
        this.selectedDate.value.getFullYear(),
        this.selectedDate.value.getMonth(),
        this.selectedDate.value.getDate()
      );
      return createdAtDate.getTime() === selectedDateOnly.getTime();
    }
    return false;
  }

  ngOnInit(): void {
    this.routeUnSubscribe.set(
      this.route.params.subscribe(async (param) => {
        (await this.store.getCustomerDemo()).subscribe((doc) => {
          this.data = doc;
          this.updateFilteredData();
        });
        this.selectedDate.valueChanges.subscribe(() => {
          this.updateFilteredData();
          this.cdr.detectChanges();
        });

        this.filterControl.valueChanges.subscribe(value => { // Subscribe to changes
          this.selectedFilter = value || 'all'; // Ensure a string is always assigned
          this.updateFilteredData();
        });
      })
    );
  }

  ngOnChanges(): void {}

  updateFilteredData(): void {
    let filtered: Customer[] = this.data;

    if (this.selectedFilter === 'today') {
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      filtered = this.data.filter(item => {
        const itemDate = item.created_at?.toDate();
        return itemDate &&
          itemDate.getFullYear() === todayYear &&
          itemDate.getMonth() === todayMonth &&
          itemDate.getDate() === todayDay;
      });
    } else if (this.selectedFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      filtered = this.data.filter(item => {
        const itemDate = item.created_at?.toDate();
        return itemDate && itemDate.getTime() === yesterday.getTime();
      });
    } else if (this.selectedFilter === 'thisMonth') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      filtered = this.data.filter(item => {
        const itemDate = item.created_at?.toDate();
        return itemDate && itemDate >= startOfMonth && itemDate <= endOfMonth;
      });
    } else if (this.selectedFilter === 'thisYear') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      filtered = this.data.filter(item => {
        const itemDate = item.created_at?.toDate();
        return itemDate && itemDate >= startOfYear && itemDate <= endOfYear;
      });
    } else {
      filtered = this.data;
    }
    if (this.selectedDate.value) {
      this.filteredData = filtered.filter(item => this.isDateMatch(item.created_at));
    } else {
      this.filteredData = filtered;
    }
    this.calculateTotals();
    this.cdr.detectChanges();
  }

  /**
   * Calculates the total pawn price and total interest price for the filtered data.
   */
  calculateTotals(): void {
    this.totalPawnPrice = this.filteredData.reduce((sum, item) => sum + (item.price_pawn || 0), 0);
    this.totalInterestPrice = this.filteredData.reduce((sum, item) => sum + (item.price_interest || 0), 0);
  }

  showSnackBar(message: string, action: string = 'Close') {
    this.snackbar.open(message, action, {
      duration: 3000,
    });
  }

  // Method to handle filter changes
  onFilterChange(event: any, value: string): void {
    this.selectedFilter = value;
    this.updateFilteredData();
  }
}

