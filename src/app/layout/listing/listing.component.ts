import { Component, signal, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject, from } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { GetTimeAgoPipe, DatedPipe } from '../../shared/pipes/customs.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { CustomerInfoComponent } from '../../components/customer-info/customer-info.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateLoader, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SkeletonFormLoaderComponent } from "../../shared/skeleton-form-loader/skeleton-form-loader.component";



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@Component({
  selector: 'app-listing',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    RouterOutlet,
    MatTabsModule,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    GetTimeAgoPipe,
    DatePipe,
    MatDialogModule,
    CommonModule,
    AngularFirestoreModule,
    ReactiveFormsModule,
    MatTooltipModule,
    DatedPipe,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    SkeletonFormLoaderComponent
],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss',
})
export class ListingComponent implements OnInit, OnDestroy {
  pawnForm!: FormGroup;
  private routeSub!: Subscription;
  endOfData = false;
  isLoading = false;

  

  showFiller = false;
  tabs = signal<any>([
    { key: 'active', label: 'កំពុងបញ្ចាំ' },
    { key: 'inactive', label: 'បញ្ចប់ការបញ្ចាំ' },
  ]);

  private previousParam: string | null = null;
  routeUnSubscribe = signal<any>(Subscription);
  info_customer = signal<any>(null);
  data = signal<any>(null);
  param = signal<any>(null);
  today = new Date();
  form!: FormGroup;
  showClearIcon = false;

  originalData = signal<any>([]);
  lastVisibleDoc: any = null;
  loadingMore = false;
  pageLimit = 10; 

  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private readonly route: ActivatedRoute,
    private readonly store: PawnStore,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      search: new FormControl(''),
    });

    this.form.get('search')?.valueChanges.subscribe((value) => {
      this.showClearIcon = !!value;
    });

    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((param) => {
          const currentParam = param['statusKey'];

          this.clearSearchInput();
          this.param.set(currentParam);

          let statusKey = currentParam == 'active' ? 1 : -2;

          return this.store.fetchListingPaginated(statusKey, this.pageLimit, null);
        })
      )
      .subscribe(({ data, last }) => {
        this.originalData.set(data);
        this.data.set(data);
        this.lastVisibleDoc = last;
      });

    this.form
      .get('search')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        switchMap((value: string) => {
          if (value && value.trim() !== '') {
            return this.route.params.pipe(
              switchMap((param) => {
                let paramKey = param['statusKey'];
                this.param.set(paramKey);
                let statusKey = paramKey == 'active' ? 1 : -2;
                return from(this.store.searchListing(value, statusKey));
              })
            );
          } else {
            return this.route.params.pipe(
              switchMap((param) => {
                let paramKey = param['statusKey'];
                this.param.set(paramKey);
                let statusKey = paramKey == 'active' ? 1 : -2;
                return this.store.fetchListingPaginated(statusKey, this.pageLimit, null);
              })
            );
          }
        })
      )
      .subscribe((res: any) => {
        if (Array.isArray(res.data)) {
          this.data.set(res.data);
        } else {
          this.data.set(res);
        }
      });
  }

  loadMore() {
  if (this.loadingMore || this.endOfData) return;

  this.loadingMore = true;
  this.isLoading = true;

  setTimeout(() => {
    const statusKey = this.param() === 'active' ? 1 : -2;

    this.store.fetchListingPaginated(statusKey, this.pageLimit, this.lastVisibleDoc)
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ data, last }) => {
        if (!data || data.length === 0) {
          this.endOfData = true;
        } else {
          const currentKeys = new Set(this.data().map((item: any) => item.key));
          const newItems = data.filter((item: any) => !currentKeys.has(item.key));

          const updated = [...this.data(), ...newItems];
          this.data.set(updated);
          this.originalData.set(updated);
          this.lastVisibleDoc = last;
        }

        this.loadingMore = false;
        this.isLoading = false;
      });
  }, 1000);
}


  onScroll(event: any) {
  const element = event.target;

  const threshold = 150;

  const position = element.scrollTop + element.clientHeight;
  const height = element.scrollHeight;

  if (position > height - threshold) {
    this.loadMore();
  }
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ShowDialog() {
    const dialogRef = this.dialog.open(CustomerInfoComponent, {
      data: {
        title: 'ជ្រើសរើសព័ត៌មានអតិថិជន',
        description: 'Select To Read More Information',
        param: this.param(),
        readOnly: true,
      },
      width: '800px',
      height: '900px',
      role: 'dialog',
      panelClass: 'custom-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  clearInput() {
    this.form.get('search')?.setValue('');
    this.showClearIcon = false;
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
    this.data.set(this.originalData());
  }

  private clearSearchInput() {
    this.form.get('search')?.setValue('');
    this.showClearIcon = false;
    if (this.searchInput && this.searchInput.nativeElement) {
      this.searchInput.nativeElement.focus();
    }
  }

  clearFormInputs() {
    this.form.reset();
  }

  formLoading = false;
selectedKey: string | null = null;

onCustomerSelect(key: string) {
  this.formLoading = true;
  this.selectedKey = key;

  this.router.navigate([`/home/${this.param()}/listing/create-form/${key}`]);

  setTimeout(() => {
    this.formLoading = false;
  }, 1000);
}

}


