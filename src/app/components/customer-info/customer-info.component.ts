import { Component, Inject, signal, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-listing',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatTabsModule,
        RouterLink,
        RouterLinkActive,
        MatCardModule,
        MatDialogModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
    ],
    templateUrl: './customer-info.component.html',
    styleUrl: './customer-info.component.scss',
})
export class CustomerInfoComponent implements OnInit, OnDestroy {
    routeUnSubscribe = signal<any>(Subscription);
    data = signal<any>([]);
    param = signal<any>(null);
    form!: FormGroup;
    showClearIcon = false;
    originalData = signal<any>([]);

    lastVisibleDoc: any = null;
    loadingMore = false;
    pageLimit = 10;
    endOfData = false;
    isLoading = false;

    private destroy$ = new Subject<void>();
    private searchSubscription: Subscription | undefined;

    @ViewChild('searchInput') searchInput: ElementRef | undefined;

    constructor(
        public dialogRef: MatDialogRef<CustomerInfoComponent>,
        @Inject(MAT_DIALOG_DATA) public info_customer: any,
        public auth: AuthStore,
        private readonly route: ActivatedRoute,
        private readonly store: PawnStore,
        private readonly fb: FormBuilder
    ) {
        console.log(info_customer, 'info');
    }

    ngOnInit() {
        this.form = this.fb.group({
            search: new FormControl(''),
        });

         this.isLoading = true;

  this.routeUnSubscribe.set(
    this.store.fetchInfoListing().subscribe((res) => {
      setTimeout(() => {
        this.data.set(res);
        this.originalData.set(res);
        this.isLoading = false;
      }, 1000);
    })
  );

        this.searchSubscription = this.form.get('search')?.valueChanges.subscribe((value: string) => {
            if (value && value.trim() !== '') {
                this.searchListing(value);
            } else {
                this.data.set(this.originalData());
            }
            this.onInputChange();
        });
    }

   loadMore() {
  if (this.loadingMore || this.endOfData) return;

  this.loadingMore = true;
  this.isLoading = true;

  const statusKey = this.info_customer?.param === 'active' ? 1 : -2;

  this.store.fetchListingPaginated(statusKey, this.pageLimit, this.lastVisibleDoc)
    .pipe(takeUntil(this.destroy$))
    .subscribe(({ data, last }) => {

      setTimeout(() => {
        if (!data || data.length === 0) {
          this.endOfData = true;
          this.loadingMore = false;
          this.isLoading = false;
          return;
        }

        const currentIds = new Set(this.data().map((item: any) => item.id));
        const newItems = data.filter((item: any) => !currentIds.has(item.id));

        if (newItems.length === 0) {
          this.endOfData = true;
        } else {
          const updated = [...this.data(), ...newItems];
          this.data.set(updated);
          this.originalData.set(updated);
          this.lastVisibleDoc = last;
        }

        this.loadingMore = false;
        this.isLoading = false;
      }, 1000);
    });
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

        this.routeUnSubscribe().unsubscribe();
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    close() {
        this.dialogRef.close(true);
    }

    async searchListing(query: string) {
        const results = this.originalData().filter((item: any) => {
            return item.full_name.toLowerCase().includes(query.toLowerCase());
        });
        this.data.set(results);
    }

    onInputChange() {
        this.showClearIcon = !!this.form.get('search')?.value;
    }

    clearInput() {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }

        this.form.get('search')?.setValue('');
        this.showClearIcon = false;
        if (this.searchInput && this.searchInput.nativeElement) {
            this.searchInput.nativeElement.focus();
        }
        this.data.set(this.originalData());

        this.searchSubscription = this.form.get('search')?.valueChanges.subscribe((value: string) => {
            if (value && value.trim() !== '') {
                this.searchListing(value);
            } else {
                this.data.set(this.originalData());
            }
            this.onInputChange();
        });
    }
}
