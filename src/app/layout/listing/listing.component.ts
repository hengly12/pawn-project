import { Component, signal, ViewChild, ElementRef, OnInit, OnDestroy, } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute, } from '@angular/router';
import { Observable, Subscription, Subject, from } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { GetTimeAgoPipe } from '../../shared/pipes/customs.pipe';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { CustomerInfoComponent } from '../../components/customer-info/customer-info.component';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-listing',
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
  ],
  templateUrl: './listing.component.html',
  styleUrl: './listing.component.scss',
})
export class ListingComponent implements OnInit, OnDestroy {
  pawnForm!: FormGroup;
  private routeSub!: Subscription;

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

  @ViewChild('searchInput') searchInput: ElementRef | undefined;

  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    public auth: AuthStore,
    private readonly route: ActivatedRoute,
    private readonly store: PawnStore,
    private readonly fb: FormBuilder
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
          // Clear input on tab change
          this.clearSearchInput();
          this.param.set(currentParam);

          let statusKey = null;
          if (currentParam == 'active') {
            statusKey = 1;
          } else {
            statusKey = -2;
          }

          return this.store.fetchListing(statusKey);
        })
      )
      .subscribe((res) => {
        this.originalData.set(res);
        this.data.set(res);
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
                let statusKey = null;
                if (paramKey == 'active') {
                  statusKey = 1;
                } else {
                  statusKey = -2;
                }
                return from(this.store.searchListing(value, statusKey));
              })
            );
          } else {
            return this.route.params.pipe(
              switchMap((param) => {
                let paramKey = param['statusKey'];
                this.param.set(paramKey);
                let statusKey = null;
                if (paramKey == 'active') {
                  statusKey = 1;
                } else {
                  statusKey = -2;
                }
                return this.store.fetchListing(statusKey);
              })
            );
          }
        })
      )
      .subscribe((data) => {
        this.data.set(data);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ShowDialog() {
    const dialogRef = this.dialog.open(CustomerInfoComponent, {
      data: {
        title: 'ព័ត៌មានអតិថិជន',
        description: 'Select To Read More Information',
        param: this.param(),
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
}
