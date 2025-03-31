import { Component, Inject, signal, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthStore } from '../../auth/auth.store';
import { PawnStore } from '../../shared/store/pawn.store';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-listing',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatSidenavModule,
        MatButtonModule,
        MatTabsModule,
        RouterLink,
        RouterLinkActive,
        MatCardModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
    ],
    templateUrl: './customer-info.component.html',
    styleUrl: './customer-info.component.scss',
})
export class CustomerInfoComponent implements OnInit, OnDestroy {
    routeUnSubscribe = signal<any>(Subscription);
    data = signal<any>(null);
    param = signal<any>(null);
    form!: FormGroup;
    showClearIcon = false;
    originalData = signal<any>([]);
   
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

        this.routeUnSubscribe.set(
            this.store.fetchInfoListing().subscribe((res) => {
                this.data.set(res);
                this.originalData.set(res);
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

    ngOnDestroy() {
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