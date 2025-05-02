import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatGridListModule } from '@angular/material/grid-list';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Timestamp } from 'firebase/firestore';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription, interval } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { MatSelectModule } from '@angular/material/select';
import { GENDER_DATA, ITEM_DATA } from '../shared/dummy/config';
import { PawnStore } from '../shared/store/pawn.store';
import { ReportDetailDialogComponent } from '../components/report-detail-dialog/report-detail-dialog.component';
import { AlertComponent } from '../shared/pages/alert/alert.component';
import { RouterModule } from '@angular/router';


export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    dateA11yLabel: 'LL',
    monthYearLabel: 'MMYYYY',
    monthYearA11yLabel: 'MMYYYY',
  },
};

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
  selector: 'app-expired-customer',
  imports: [
    MatGridListModule,
    MatTableModule,
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
    MatDatepickerModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './expired-customer.component.html',
  styleUrl: './expired-customer.component.scss',
  providers: [
      DatePipe,
      provideMomentDateAdapter(MY_FORMATS)
    ],
  })

export class ExpiredCustomerComponent implements OnInit, OnDestroy{
routeUnSubscribe = signal<any>(Subscription);
  param = signal<any>(null);
  displayUSD = '';
  displayKHR = '';
  genders = signal<any>(GENDER_DATA);
  days_countdown: number | null = null;
  pawn_type = signal<any>(ITEM_DATA);
  router = inject(Router);

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
    'pawnCount',
    'expired_date'
  ];

  dateRange: FormGroup<{ start: FormControl<Date | null>, end: FormControl<Date | null> }>;
  selectedDate = new FormControl<Date | null | null>(null);
  filteredData: Customer[] = [];
  nameFilter = new FormControl('');
  reportTitle = 'របាយការណ៍';
  reportDescription =
    'Displays a summary of transactions for the selected month.';

  totalPawnPrice = 0;
  totalInterestPrice = 0;

  selectedFilter: string = 'today';
  filterOptions: string[] = [
    'all',
    'today',
    'yesterday',
    'thisMonth',
    'thisYear',
    'dateRange',
  ];
  filterControl = new FormControl(this.selectedFilter);
  userPawnKeyCounts: { [user: string]: number } = {};
  private subscriptions = new Subscription();

  unreadNotificationCount: number = 0;
  expiredItems: Customer[] = [];
  constructor(
    private routes: Router,
    public dialog: MatDialog,
    private store: PawnStore,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.dateRange = new FormGroup({
      start: new FormControl<Date | null>(new Date(), Validators.required),
      end: new FormControl<Date | null>(new Date(), Validators.required),
    });
  }

  

  isDateMatch(dateToCheck: any, selectedDate: Date | null): boolean {
    if (!selectedDate || !dateToCheck) {
      return true;
    }
    let checkDate: Date;
     if (dateToCheck instanceof Timestamp) {
      checkDate = dateToCheck.toDate();
    } else {
      checkDate = new Date(dateToCheck);
    }


    const selectedDateOnly =  new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate()
      );

    return checkDate.getTime() === selectedDateOnly.getTime();
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.params.subscribe(async (param) => {
        this.subscriptions.add(
          (await this.store.getCustomerDemo()).subscribe((doc) => {
            this.data = doc.map(item => ({ ...item, pawnCount: 0 }));
            this.updateFilteredData();
            // this.checkExpiredItems();
          })
        );

        this.subscriptions.add(
          this.selectedDate.valueChanges.subscribe(() => {
            this.updateFilteredData();
          })
        );

        this.subscriptions.add(
          this.filterControl.valueChanges.subscribe((value) => {
            this.selectedFilter = value || 'all';
            this.updateTitle();
            this.updateFilteredData();
          })
        );

        this.subscriptions.add(
          this.nameFilter.valueChanges.subscribe(() => {
            this.updateFilteredData();
          })
        );
      })
    );

    this.updateTitle();
    this.subscriptions.add(interval(60 * 60 * 1000).subscribe(() => {
      // this.checkExpiredItems();
    }));
  }

  initForm(): void {
    this.dateRange = new FormGroup({
      start: new FormControl<Date | null>(new Date(), Validators.required),
      end: new FormControl<Date | null>(null, Validators.required),
    });
  }

  formatDate(date: any): Date | string {
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    return date;
  }

  ngOnChanges(): void { }

  updateFilteredData(): void {
    let filtered: Customer[] = [...this.data];

    if (this.selectedFilter === 'today') {
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
       filtered = filtered.filter((item) => {
        const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
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
       filtered = filtered.filter((item) => {
        const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
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
       filtered = filtered.filter((item) => {
        const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
        return itemDate && itemDate >= startOfMonth && itemDate <= endOfMonth;
      });
    } else if (this.selectedFilter === 'thisYear') {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      const endOfYear = new Date(new Date().getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);
       filtered = filtered.filter((item) => {
         const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
        return itemDate && itemDate >= startOfYear && itemDate <= endOfYear;
      });
    } else if (this.selectedFilter === 'dateRange') {
      const startDate = this.dateRange.value.start;
      const endDate = this.dateRange.value.end;
      if (startDate && endDate) {
        if (startDate > endDate) {
          this.snackbar.open('Start date cannot be greater than end date', 'Close', { duration: 6000 });
          return;
        }
         filtered = filtered.filter(item => {
           const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
          return itemDate >= startDate && itemDate <= endDate;
        });
      } else if (startDate) {
         filtered = filtered.filter(item => {
           const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
          return itemDate >= startDate;
        });
      } else if (endDate) {
         filtered = filtered.filter(item => {
           const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
          return itemDate <= endDate;
        });
      }
    }

    if (this.selectedDate.value) {
      filtered = filtered.filter((item) =>
        this.isDateMatch(item.date_expired, this.selectedDate.value)
      );
    }

    const nameFilterValue = this.nameFilter.value?.toLowerCase() || '';
    filtered = filtered.filter(item => {
      const fullName = item.full_name?.toLowerCase() || '';
      return fullName.includes(nameFilterValue);
    });

    this.filteredData = this.updateUserPawnCounts(filtered);
    this.calculateTotals();
    this.cdr.detectChanges();
  }

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
      duration: 6000,
    });
  }

  onFilterChange(event: any, value: string): void {
    this.selectedFilter = value || 'all';
    this.updateTitle();
    this.updateFilteredData();
  }

  updateTitle(): void {
    const todayDate = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
    const yesterdayDate = this.datePipe.transform(new Date().setDate(new Date().getDate() - 1), 'dd-MM-yyyy');
    const currentDate = new Date();
    const firstDayOfMonth = this.datePipe.transform(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'MM-yyyy');
    const currentYear = this.datePipe.transform(currentDate, 'yyyy');

    switch (this.selectedFilter) {
      case 'all':
        this.reportTitle = 'របាយការណ៍ -  ទាំងអស់';
        break;
      case 'today':
        this.reportTitle = `របាយការណ៍ - ថ្ងៃនេះ (${todayDate})`;
        break;
      case 'yesterday':
        this.reportTitle = `របាយការណ៍ - ម្សិលមិញ (${yesterdayDate})`;
        break;
      case 'thisMonth':
        this.reportTitle = `របាយការណ៍ -  ខែនេះ (${firstDayOfMonth})`;
        break;
      case 'thisYear':
        this.reportTitle = `របាយការណ៍ -  ឆ្នាំនេះ (${currentYear})`;
        break;
      case 'dateRange':
        const startDate = this.dateRange.value.start ? this.datePipe.transform(this.dateRange.value.start, 'dd/MM/yyyy') : '';
        const endDate = this.dateRange.value.end ? this.datePipe.transform(this.dateRange.value.end, 'dd/MM/yyyy') : '';
        this.reportTitle = startDate && endDate
          ? `របាយការណ៍ ពីថ្ងៃទី ${startDate} ដល់ថ្ងៃទី ${endDate}`
          : 'Report - Date Range';
        break;
      default:
        this.reportTitle = `របាយការណ៍ -  ថ្ងៃនេះ (${todayDate})`;
        break;
    }
  }

  updateUserPawnCounts(data: Customer[]): Customer[] {
    const counts: { [key: string]: number } = {};
    data.forEach(item => {
      const user = item.full_name;
      counts[user] = (counts[user] || 0) + 1;
    });

    const updatedData = data.map(item => ({
      ...item,
      pawnCount: counts[item.full_name] || 0
    }));
    return updatedData;
  }

  getUserPawnKeyCount(user: string): number {
    return this.userPawnKeyCounts[user] || 0;
  }

  applyNameFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredData = this.data.filter(item => {
      const fullName = item.full_name?.toLowerCase() || '';
      return fullName.includes(filterValue);
    });
    this.calculateTotals();
    this.filteredData = this.updateUserPawnCounts(this.filteredData);
    this.cdr.detectChanges();
  }

  applyDateFilter() {
    const startDate = this.dateRange.value.start;
    const endDate = this.dateRange.value.end;

    if (startDate && endDate) {
      if (startDate > endDate) {
        this.snackbar.open('Start date cannot be greater than end date', 'Close', { duration: 6000 });
        return;
      }
      this.selectedFilter = 'dateRange';
      this.filteredData = this.data.filter(item => {
        const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
        return itemDate >= startDate && itemDate <= endDate;
      });
    }
    else if (startDate) {
      this.selectedFilter = 'dateRange';
      this.filteredData = this.data.filter(item => {
        const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
        return itemDate >= startDate;
      });
    }
    else if (endDate) {
      this.selectedFilter = 'dateRange';
      this.filteredData = this.data.filter(item => {
         const itemDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
        return itemDate <= endDate;
      });
    }
    else {
      this.selectedFilter = 'today';
      this.filteredData = this.data;
    }
    this.updateTitle();
    this.calculateTotals();
    this.filteredData = this.updateUserPawnCounts(this.filteredData);
    this.cdr.detectChanges();
  }

  printReportExpiredData() {
    window.print();
  }

  resetFilters() {
    this.dateRange.reset({ start: new Date(), end: null });
    this.selectedFilter = 'today';
    this.filterControl.setValue('today');
    this.updateTitle();
    this.updateFilteredData();
  }

  openModal(item: any): void {
    this.dialog.open(ReportDetailDialogComponent, {
      width: '80%',
      maxWidth: '800px',
      data: item,
    });
  }

  // checkExpiredItems(): void {
  //   const today = new Date();
  //   this.expiredItems = this.data.filter(item => {
  //     const expiredDate = item.date_expired ? (item.date_expired.toDate ? item.date_expired.toDate() : new Date(item.date_expired)) : null;
  //     return expiredDate && expiredDate < today;
  //   });

  //   this.unreadNotificationCount = this.expiredItems.length;

  //   if (this.unreadNotificationCount > 0) {
  //     this.showSnackBar(
  //       `${this.unreadNotificationCount} item(s) have expired!`,
  //       'View'
  //     );
  //   }
  // }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openDialog() {
    this.dialog.open(AlertComponent, {
      data: { "modal_type": "A" }
    });
  }

  // navigateToReport() {
  //  this.router.navigate(['home/report']);
  // }

  // navigateToExpired() {
  //  this.router.navigate(['home/report/expired-customer']);
  // }
}

