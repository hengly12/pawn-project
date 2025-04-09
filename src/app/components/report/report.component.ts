import { ChangeDetectorRef, Component, Input, OnInit, signal, } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs'; // Import MatTabsModule here
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute, Router, } from '@angular/router';
import { GetTimeAgoPipe, DatedPipe } from '../../shared/pipes/customs.pipe';
import { GENDER_DATA, GenderOption, ITEM_DATA, ItemType, } from '../../shared/dummy/config';
import { pushToObject } from '../../shared/services/mapping.service';
import { doc, getDoc } from 'firebase/firestore';
import { DataService } from '../../shared/services/data.service';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FireStorageService } from '../../shared/services/fire-storage.service';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';


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
  pawnKey: string;
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
    MatSelectModule,
    MatSnackBarModule,
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

  dateRange = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  selectedDate = new FormControl<Date | null | null>(null);
  filteredData: Customer[] = [];
  nameFilter = new FormControl('');
  reportTitle = 'Report';
  reportDescription =
    'Displays a summary of transactions for the selected month.';

  totalPawnPrice = 0;
  totalInterestPrice = 0;

  selectedFilter: string = 'all';
  filterOptions: string[] = [
    'all',
    'today',
    'yesterday',
    'thisMonth',
    'thisYear',
    'dateRange' // Include dateRange
  ];
  filterControl = new FormControl(this.selectedFilter);
  userPawnKeyCounts: { [user: string]: { [pawnKey: string]: number } } = {};

  constructor(
    public dialog: MatDialog,
    private ds: DataService,
    private fb: FormBuilder,
    private auth: AuthStore,
    private store: PawnStore,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private storage: FireStorageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  isDateMatch(createdAt: any): boolean {
    if (!this.selectedDate.value || !createdAt) {
      return true;
    }
    let createdAtDate: Date;
    if (createdAt && createdAt.toDate) {
      createdAtDate = createdAt.toDate();
    } else {
      createdAtDate = new Date(createdAt);
    }

    const selectedDateOnly = this.selectedDate.value
      ? new Date(
        this.selectedDate.value.getFullYear(),
        this.selectedDate.value.getMonth(),
        this.selectedDate.value.getDate()
      )
      : new Date();

    return createdAtDate.getTime() === selectedDateOnly.getTime();
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

        this.filterControl.valueChanges.subscribe((value) => {
          this.selectedFilter = value || 'all';
          this.updateTitle();
          this.updateFilteredData();
        });

        this.nameFilter.valueChanges.subscribe(() => {
          this.updateFilteredData();
        });
      })
    );
  }

  ngOnChanges(): void { }

  updateFilteredData(): void {
    let filtered: Customer[] = this.data;

    if (this.selectedFilter === 'today') {
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      filtered = this.data.filter((item) => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;

        return (
          itemDate &&
          itemDate.getFullYear() === todayYear &&
          itemDate.getMonth() === todayMonth &&
          itemDate.getDate() === todayDay
        );
      });
    } else if (this.selectedFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      yesterday.setMinutes(0, 0, 0);
      filtered = this.data.filter((item) => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
        const yesterdayStart = new Date(yesterday);
        yesterdayStart.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);

        return itemDate && itemDate >= yesterdayStart && itemDate <= yesterdayEnd;
      });
    } else if (this.selectedFilter === 'thisMonth') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);
      filtered = this.data.filter((item) => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
        return itemDate && itemDate >= startOfMonth && itemDate <= endOfMonth;
      });
    } else if (this.selectedFilter === 'thisYear') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
      filtered = this.data.filter((item) => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
        return itemDate && itemDate >= startOfYear && itemDate <= endOfYear;
      });
    } else if (this.selectedFilter === 'dateRange') {
      const startDate = this.dateRange.value.start;
      const endDate = this.dateRange.value.end;
      if (startDate && endDate) {
        filtered = this.data.filter(item => {
          const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
          return itemDate >= startDate && itemDate <= endDate;
        });
      }
      else if (startDate) {
        filtered = this.data.filter(item => {
          const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
          return itemDate >= startDate;
        });
      }
      else if (endDate) {
        filtered = this.data.filter(item => {
          const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
          return itemDate <= endDate;
        });
      }
      else {
        filtered = this.data;
      }
    }
    else {
      filtered = this.data;
    }

    if (this.selectedDate.value) {
      filtered = filtered.filter((item) =>
        this.isDateMatch(item.created_at)
      );
    }

    const nameFilterValue = this.nameFilter.value?.toLowerCase() || '';
    this.filteredData = filtered.filter(item => {
      const fullName = item.full_name?.toLowerCase() || '';
      return fullName.includes(nameFilterValue);
    });

    this.calculateTotals();
    this.updateUserPawnKeyCounts();
    this.cdr.detectChanges();
  }

  /**
   * Calculates the total pawn price and total interest price for the filtered data.
   */
  calculateTotals(): void {
    this.totalPawnPrice = this.filteredData.reduce(
      (sum, item) => sum + (item.price_pawn || 0),
      0
    );
    this.totalInterestPrice = this.filteredData.reduce(
      (sum, item) => sum + (item.price_interest || 0),
      0
    );
  }

  showSnackBar(message: string, action: string = 'Close') {
    this.snackbar.open(message, action, {
      duration: 3000,
    });
  }

  onFilterChange(event: any, value: string): void {
    this.selectedFilter = value;
    this.updateTitle();
    this.updateFilteredData();
  }

  updateTitle(): void {
    switch (this.selectedFilter) {
      case 'all':
        this.reportTitle = 'Report - All Time';
        break;
      case 'today':
        this.reportTitle = 'Report - Today';
        break;
      case 'yesterday':
        this.reportTitle = 'Report - Yesterday';
        break;
      case 'thisMonth':
        this.reportTitle = 'Report - This Month';
        break;
      case 'thisYear':
        this.reportTitle = 'Report - This Year';
        break;
      case 'dateRange':
        const startDate = this.dateRange.value.start ? this.datePipe.transform(this.dateRange.value.start, 'dd/MM/yyyy') : '';
        const endDate = this.dateRange.value.end ? this.datePipe.transform(this.dateRange.value.end, 'dd/MM/yyyy') : '';
        this.reportTitle = startDate && endDate
          ? `Report from ${startDate} to ${endDate}`
          : 'Report - Date Range';
        break;
      default:
        this.reportTitle = 'Report';
        break;
    }
  }

  updateUserPawnKeyCounts(): void {
    this.userPawnKeyCounts = {};
    this.filteredData.forEach((item) => {
      const user = item.full_name;
      const pawnKey = item.pawnKey;

      if (!this.userPawnKeyCounts[user]) {
        this.userPawnKeyCounts[user] = {};
      }
      this.userPawnKeyCounts[user][pawnKey] =
        (this.userPawnKeyCounts[user][pawnKey] || 0) + 1;
    });
  }

  getUserPawnKeyCount(user: string, pawnKey: string): number {
    return this.userPawnKeyCounts[user] ? this.userPawnKeyCounts[user][pawnKey] || 0 : 0;
  }

  applyNameFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredData = this.data.filter(item => {
      const fullName = item.full_name?.toLowerCase() || '';
      return fullName.includes(filterValue);
    });
    this.calculateTotals();
    this.updateUserPawnKeyCounts();
    this.cdr.detectChanges();
  }

  applyDateFilter() {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;

    if (startDate && endDate) {
      this.selectedFilter = 'dateRange';
      this.filteredData = this.data.filter(item => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    else if (startDate) {
      this.selectedFilter = 'dateRange';
      this.filteredData = this.data.filter(item => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
        return itemDate >= startDate;
      });
    }
    else if (endDate) {
      this.selectedFilter = 'dateRange';
      this.filteredData = this.data.filter(item => {
        const itemDate = item.created_at ? (item.created_at.toDate ? item.created_at.toDate() : new Date(item.created_at)) : null;
        return itemDate <= endDate;
      });
    }
    else {
      this.selectedFilter = 'all';
      this.filteredData = this.data;
    }
    this.updateTitle();
    this.calculateTotals();
    this.updateUserPawnKeyCounts();
    this.cdr.detectChanges();
  }

  resetFilters() {
    this.dateRange.reset();
    this.selectedFilter = 'all';
    this.filterControl.setValue('all');
    this.updateTitle();
    this.updateFilteredData();
  }
}

